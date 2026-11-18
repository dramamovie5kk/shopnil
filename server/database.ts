import schemaData from '../cloudflare/schema.json';
import { Env, Row, assert, HttpError, ipAddress, rateLimit, sha256 } from './core';
import { Identity, admin, staff, cookie } from './auth';
type D1Value = string | number | null;
export interface Column { type: string; embedded: boolean }
export interface Definition { columns: Record<string,Column>; relations: Record<string,{ local:string; foreign:string }> }
export const schema: Record<string,Definition> = schemaData;
schema.product_reviews_public = {columns:Object.fromEntries(Object.entries(schema.product_reviews.columns).filter(([k])=>k!=='customer_phone')),relations:schema.product_reviews.relations};
export interface Filter { column:string; op:string; value:unknown }
export interface Query { table:string; action:string; select?:string; filters?:Filter[]; orders?:{column:string;ascending:boolean}[]; limit?:number; offset?:number; single?:string; values?:Row|Row[]; onConflict?:string; count?:string; head?:boolean }
const publicTables = new Set(['products','categories','product_variations','sales_pages','site_settings','pages','blog_posts','spin_offers','product_reviews_public']);
const ownedTables = new Set(['profiles','cart_items','wishlist','product_reviews','user_roles']);
const sensitive = /token|secret|password|api_key|username|pathao_|steadfast_/i;
export const privateSetting = (key:string) => sensitive.test(key);
export function definition(table:string) { assert(Object.prototype.hasOwnProperty.call(schema,table),'Unknown table'); const d=schema[table]; assert(d,'Unknown table'); return d; }
export function column(table:string, name:string) { const columns=definition(table).columns; assert(Object.prototype.hasOwnProperty.call(columns,name),'Unknown column'); const c=columns[name]; assert(c,'Unknown column'); return c.embedded ? `json_extract(content, '$.${name}')` : `"${name}"`; }
export function bindValue(value:unknown): D1Value { if(value===null || value===undefined) return null; if(typeof value==='boolean') return value?1:0; if(typeof value==='number') {assert(Number.isFinite(value));return value;} if(typeof value==='string') return value; return JSON.stringify(value); }
export function hydrate(table:string,row:Row):Row {
  const out:Row={...row};
  if(table==='sales_pages'&&Object.prototype.hasOwnProperty.call(out,'content')) { const embedded = typeof out.content==='string'?JSON.parse(out.content):{}; for(const [k,c] of Object.entries(definition(table).columns)) if(c.embedded) out[k]=embedded[k]??null; delete out.content; }
  for(const [k,c] of Object.entries(definition(table).columns)) {if(c.type==='json' && typeof out[k]==='string') out[k]=JSON.parse(out[k] as string); if(c.type==='boolean'&&out[k]!==null&&out[k]!==undefined) out[k]=!!out[k];}
  return out;
}
export function prepareValues(table:string, values:Row, insert:boolean):Row {
  const out:Row={}, embedded:Row={};
  for(const [k,v] of Object.entries(values)) { const columns=definition(table).columns; assert(Object.prototype.hasOwnProperty.call(columns,k),'Unknown field: '+k); const c=columns[k]; assert(c,'Unknown field: '+k); if(c.embedded) embedded[k]=v; else out[k]=c.type==='json'&&v!==null?JSON.stringify(v):bindValue(v); }
  if(table==='sales_pages' && (insert || Object.keys(embedded).length)) out.content=JSON.stringify(embedded);
  return out;
}
export function insertStatement(env:Env, table:string, values:Row) {
  const v=prepareValues(table,values,true), keys=Object.keys(v); assert(keys.length>0);
  return env.DB.prepare(`INSERT INTO "${table}" (${keys.map(k=>`"${k}"`).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).bind(...keys.map(k=>bindValue(v[k])));
}
export function selectionSQL(table:string,selection:string):string {
  const parts=parseSelect(selection);
  if(parts.includes('*'))return '*';
  const fields=new Set<string>();
  for(const part of parts){
    const join=/^(\w+)\s*\((.*)\)$/.exec(part);
    if(join){const relation=definition(table).relations[join[1]];assert(Object.prototype.hasOwnProperty.call(definition(table).relations,join[1])&&relation,'Unsupported relation');fields.add(relation.local);}
    else {column(table,part);fields.add(part);}
  }
  assert(fields.size<=90,'Too many selected fields');
  return fields.size?[...fields].map(name=>`${column(table,name)} AS "${name}"`).join(','):'"id"';
}
function validatePublicColumns(table:string,q:Query,user:Identity|null){
  if(admin(user)||table!=='products')return;
  assert(!(q.filters||[]).some(f=>f.column==='cost_price')&&!(q.orders||[]).some(o=>o.column==='cost_price'),'Private product field',403);
}
async function scope(table:string,user:Identity|null,request:Request,values:D1Value[]) {
  if(admin(user)) return '1=1';
  if(staff(user)&&new Set(['orders','order_items','order_logs','blocked_users','abandoned_carts','profiles','spin_entries']).has(table)) return '1=1';
  if(publicTables.has(table)) {
    if(table==='sales_pages') return 'is_active=1';
    if(table==='pages'||table==='blog_posts') return 'is_published=1';
    if(table==='spin_offers') return 'is_active=1';
    if(table==='site_settings') return ['token','secret','password','api_key','username','pathao_','steadfast_'].map(k=>{values.push('%'+k+'%');return 'lower(setting_key) NOT LIKE ?';}).join(' AND ');
    return '1=1';
  }
  if(ownedTables.has(table)) {values.push(user?.id||'');return 'user_id=?';}
  if(table==='orders'||table==='order_items'||table==='order_logs') {
    const id=table==='orders'?'id':'order_id'; const owner=cookie(request,'__Host-shop_guest');
    values.push(user?.id||'',owner?await sha256(owner):'');
    return `${id} IN (SELECT o.id FROM orders o LEFT JOIN guest_orders g ON g.order_id=o.id WHERE o.user_id=? OR g.owner_digest=?)`;
  }
  throw new HttpError(403,'Access denied');
}
function filters(table:string, list:Filter[], params:D1Value[]) {
  assert(Array.isArray(list)&&list.length<=30);
  return list.map(f=>{
    const c=column(table,f.column);
    if(f.op==='in') {assert(Array.isArray(f.value)&&f.value.length<=200); if(!f.value.length) return '0=1';params.push(...f.value.map(bindValue));return `${c} IN (${f.value.map(()=>'?').join(',')})`;}
    if(f.op==='is') {assert(f.value===null);return `${c} IS NULL`;}
    const ops:Record<string,string>={eq:'=',neq:'<>',gt:'>',gte:'>=',lt:'<',lte:'<=',like:'LIKE',ilike:'LIKE'};
    assert(Object.prototype.hasOwnProperty.call(ops,f.op),'Unknown filter');
    if(f.value===null) {assert(f.op==='eq'||f.op==='neq');return `${c} IS ${f.op==='neq'?'NOT ':''}NULL`;}
    params.push(bindValue(f.value));return `${c} ${ops[f.op]} ?`;
  });
}
export function parseSelect(select:string) {
  assert(select.length<=3000);
  const parts:string[]=[];let depth=0,start=0;
  for(let i=0;i<select.length;i++){if(select[i]==='(')depth++;assert(depth<=3,'Selection is too deeply nested');if(select[i]===')')depth--;assert(depth>=0);if(select[i]===','&&depth===0){parts.push(select.slice(start,i).trim());start=i+1;}}
  assert(depth===0);parts.push(select.slice(start).trim());return parts.filter(Boolean);
}
async function project(env:Env, table:string, row:Row, selection:string, user:Identity|null, request:Request):Promise<Row> {
  const out:Row={};
  for(const part of parseSelect(selection)) {
    const join=/^(\w+)\s*\((.*)\)$/.exec(part);
    if(join) {
      const [,target,fields]=join, relation=definition(table).relations[target];assert(Object.prototype.hasOwnProperty.call(definition(table).relations,target)&&relation,'Unsupported relation');
      const val=row[relation.local];
      const result=val===null||val===undefined?null:(await runQuery(env,{table:target,action:'select',select:fields,filters:[{column:relation.foreign,op:'eq',value:val}],limit:1,single:'maybe'},user,request)).data;
      out[target]=result;
    } else if(part==='*') Object.assign(out,row);
    else {column(table,part);out[part]=row[part];}
  }
  if(!admin(user)&&table==='products') delete out.cost_price;
  if(!admin(user)&&table==='site_settings'&&privateSetting(String(out.setting_key||row.setting_key))) return {};
  return out;
}
async function projectMany(env:Env,table:string,rows:Row[],selection:string,user:Identity|null,request:Request):Promise<Row[]> {
  const parts=parseSelect(selection), plain=parts.filter(p=>!/^\w+\s*\(/.test(p));
  const output=await Promise.all(rows.map(row=>project(env,table,row,plain.join(',')||' ',user,request)));
  for(const part of parts){
    const match=/^(\w+)\s*\((.*)\)$/.exec(part);if(!match)continue;
    const [,target,fields]=match,relation=definition(table).relations[target];assert(Object.prototype.hasOwnProperty.call(definition(table).relations,target)&&relation,'Unsupported relation');
    const values=[...new Set(rows.map(r=>r[relation.local]).filter(v=>v!==null&&v!==undefined))];
    const requested=parseSelect(fields), addedId=!requested.includes('*')&&!requested.includes(relation.foreign);
    const targetSelection=addedId?fields+','+relation.foreign:fields;
    const joined=new Map<string,Row>();
    for(let offset=0;offset<values.length;offset+=200){
      const result=await runQuery(env,{table:target,action:'select',select:targetSelection,filters:[{column:relation.foreign,op:'in',value:values.slice(offset,offset+200)}],limit:5000},user,request);
      for(const record of result.data as Row[]){const key=String(record[relation.foreign]),copy={...record};if(addedId)delete copy[relation.foreign];joined.set(key,copy);}
    }
    rows.forEach((row,i)=>{output[i][target]=joined.get(String(row[relation.local]))||null;});
  }
  return output;
}
export async function runQuery(env:Env,q:Query,user:Identity|null,request:Request):Promise<{data:unknown;error:null;count?:number}> {
  assert(q&&typeof q.table==='string'&&['select','insert','update','delete','upsert'].includes(q.action));
  definition(q.table);
  validatePublicColumns(q.table,q,user);
  const params:D1Value[]=[],conditions=[await scope(q.table,user,request,params),...filters(q.table,q.filters||[],params)];
  const where=' WHERE '+conditions.map(c=>'('+c+')').join(' AND ');
  if(q.action==='select') {
    let ordering='';
    assert((q.orders||[]).length<=5);
    if(q.orders?.length) ordering=' ORDER BY '+q.orders.map(o=>column(q.table,o.column)+(o.ascending?' ASC':' DESC')).join(',');
    const select=selectionSQL(q.table,q.select||'*');
    const limit=q.limit??2000,offset=q.offset??0;
    assert(Number.isInteger(limit)&&limit>=0&&limit<=5000&&Number.isInteger(offset)&&offset>=0);
    let count:number|undefined;
    if(q.count) count=(await env.DB.prepare(`SELECT count(*) AS n FROM "${q.table}"${where}`).bind(...params).first<{n:number}>())?.n||0;
    if(q.head)return {data:null,error:null,count};
    const result=await env.DB.prepare(`SELECT ${select} FROM "${q.table}"${where}${ordering} LIMIT ? OFFSET ?`).bind(...params,limit,offset).all<Row>();
    const rows=await projectMany(env,q.table,result.results.map(row=>hydrate(q.table,row)),q.select||'*',user,request);
    if(q.single){assert(rows.length<=1&&(!(q.single==='one')||rows.length===1),'Expected one row',404);return {data:rows[0]||null,error:null,count};}
    return {data:rows,error:null,count};
  }
  assert(q.table!=='product_reviews_public','Read-only view',403);
  const isAdmin=admin(user),isStaff=staff(user);
  const staffWrite=new Set(['orders','order_items','order_logs','blocked_users','abandoned_carts']);
  const ownWrite=new Set(['profiles','cart_items','wishlist']);
  const allowed=isAdmin||(isStaff&&staffWrite.has(q.table))||(!!user&&ownWrite.has(q.table))||(isStaff&&q.table==='spin_entries'&&q.action==='update')||(q.table==='product_reviews'&&q.action==='insert')||(q.table==='orders'&&q.action==='update');
  assert(allowed,'Access denied',403);
  if(q.action==='delete'){assert((q.filters||[]).length>0,'A delete filter is required');await env.DB.prepare(`DELETE FROM "${q.table}"${where}`).bind(...params).run();return {data:null,error:null};}
  const records=Array.isArray(q.values)?q.values:[q.values];assert(records.length>0&&records.length<=(isAdmin&&q.table==='site_settings'&&q.action==='upsert'?500:200)&&records.every(v=>v&&typeof v==='object'&&!Array.isArray(v)));
  if(q.table==='site_settings'&&q.action==='upsert'&&q.onConflict==='setting_key'){
    assert(isAdmin,'Administrator access required',403);
    const stamp=new Date().toISOString(),keys=new Set<string>();
    const rows=records.map(record=>{
      assert(record,'Setting required');prepareValues('site_settings',record,true);
      assert(typeof record.setting_key==='string'&&record.setting_key.length>0&&record.setting_key.length<=200,'Invalid setting key');
      assert(!keys.has(record.setting_key),'Duplicate setting key');keys.add(record.setting_key);
      assert(record.setting_value===null||record.setting_value===undefined||typeof record.setting_value==='string','Setting values must be text');
      assert(record.id===undefined||typeof record.id==='string','Invalid setting ID');
      assert(record.created_at===undefined||typeof record.created_at==='string','Invalid creation date');
      return [record.id||crypto.randomUUID(),record.setting_key,record.setting_value??null,record.created_at||stamp,stamp].map(bindValue);
    });
    const statements:D1PreparedStatement[]=[];
    // D1 permits 100 bound parameters per statement. Twenty rows use exactly
    // 100 bindings, keeping the entire settings form inside its query budget.
    for(let offset=0;offset<rows.length;offset+=20){
      const chunk=rows.slice(offset,offset+20);
      statements.push(env.DB.prepare(`INSERT INTO site_settings(id,setting_key,setting_value,created_at,updated_at)
        VALUES ${chunk.map(()=>'(?,?,?,?,?)').join(',')}
        ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value,
        updated_at=CASE WHEN site_settings.updated_at=excluded.updated_at
          THEN strftime('%Y-%m-%dT%H:%M:%fZ',excluded.updated_at,'+0.001 seconds') ELSE excluded.updated_at END
        WHERE site_settings.setting_value IS NOT excluded.setting_value`).bind(...chunk.flat()));
    }
    await env.DB.batch(statements);
    if(!q.select)return {data:null,error:null};
    const values=[...keys],saved:Row[]=[];
    for(let offset=0;offset<values.length;offset+=80){
      const result=await runQuery(env,{...q,action:'select',single:undefined,head:false,filters:[{column:'setting_key',op:'in',value:values.slice(offset,offset+80)}]},user,request);
      saved.push(...result.data as Row[]);
    }
    if(q.single)assert(saved.length<=1&&(q.single!=='one'||saved.length===1),'Expected one row',404);
    return {data:q.head?null:q.single?(saved[0]||null):saved,error:null,...(q.count?{count:saved.length}:{})};
  }
  if(q.table==='product_reviews'&&!isStaff) await rateLimit(env,'reviews:'+ipAddress(request),10);
  const ids:string[]=[]; const statements:D1PreparedStatement[]=[];
  for(const original of records) {
    const record={...original};
    if(isStaff&&!isAdmin&&q.table==='spin_entries')assert(Object.keys(record).every(k=>k==='status')&&typeof record.status==='string'&&record.status.length<=30,'Only entry status can be changed',403);
    if(!isAdmin&&!isStaff) {
      if(ownWrite.has(q.table)) {assert(record.user_id===undefined||record.user_id===user?.id,'Invalid owner',403);record.user_id=user?.id;}
      if(q.table==='profiles') {
        assert(Object.keys(record).every(k=>['user_id','full_name','phone','address','city'].includes(k)),'Invalid profile fields');
        for(const [field,max] of Object.entries({full_name:100,phone:20,address:2000,city:100}))if(record[field]!==undefined&&record[field]!==null)assert(typeof record[field]==='string'&&(record[field] as string).length<=max,'Invalid profile field length');
      }
      if(q.table==='product_reviews') {record.id=crypto.randomUUID();delete record.created_at;delete record.updated_at;record.user_id=user?.id||null;record.is_approved=false;assert(typeof record.customer_name==='string'&&record.customer_name.length>=1&&record.customer_name.length<=100);assert(Number(record.rating)>=1&&Number(record.rating)<=5);assert(String(record.review_text||'').length<=3000&&String(record.customer_phone||'').length<=20);}
      if(q.table==='orders') assert(q.action==='update'&&Object.keys(record).every(k=>['purchase_event_id','tracking_data'].includes(k)),'Order changes are not allowed',403);
    }
    if(q.action==='update') {
      assert(records.length===1&&(q.filters||[]).length>0,'An update filter is required');
      // Merge compressed fields with the current JSON document, preserving siblings.
      const prepared=prepareValues(q.table,record,false),keys=Object.keys(prepared);assert(keys.length>0);
      const assignments=keys.map(k=>k==='content'?`content=json_patch(content,?)`:`"${k}"=?`);
      statements.push(env.DB.prepare(`UPDATE "${q.table}" SET ${assignments.join(',')}${where}${q.select?' RETURNING id':''}`).bind(...keys.map(k=>bindValue(prepared[k])),...params));
    } else {
      if(record.id===undefined) record.id=crypto.randomUUID();
      const prepared=prepareValues(q.table,record,true),keys=Object.keys(prepared);
      let suffix='';
      if(q.action==='upsert') {
        assert(isAdmin,'Upsert requires admin access',403);
        const conflict=(q.onConflict||'id').split(',');conflict.forEach(c=>column(q.table,c));
        const updates=keys.filter(k=>k!=='id'&&!conflict.includes(k));
        suffix=` ON CONFLICT (${conflict.map(k=>`"${k}"`).join(',')}) DO UPDATE SET ${updates.map(k=>`"${k}"=excluded."${k}"`).join(',')}`;
      }
      statements.push(env.DB.prepare(`INSERT INTO "${q.table}" (${keys.map(k=>`"${k}"`).join(',')}) VALUES (${keys.map(()=>'?').join(',')})${suffix}${q.select?' RETURNING id':''}`).bind(...keys.map(k=>bindValue(prepared[k]))));
      ids.push(String(record.id));
    }
  }
  const written=await env.DB.batch<{id:string}>(statements);
  if(q.select) {
    ids.splice(0,ids.length,...written.flatMap(result=>result.results.map(row=>row.id)));
    if(q.action==='insert'&&q.table==='product_reviews'&&!user){
      const inserted=await env.DB.prepare(`SELECT * FROM product_reviews WHERE id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all<Row>();
      const rows=await Promise.all(inserted.results.map(row=>project(env,q.table,hydrate(q.table,row),q.select!,user,request)));
      return {data:q.single?(rows[0]||null):rows,error:null};
    }
    return runQuery(env,{...q,action:'select',filters:[{column:'id',op:'in',value:ids}]},user,request);
  }
  return {data:null,error:null};
}
