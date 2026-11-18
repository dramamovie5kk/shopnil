import { Env, Row, assert, ipAddress, json, now, randomToken, rateLimit, settings, sha256 } from './core';
import { Identity, cookie } from './auth';
import { hydrate, insertStatement } from './database';
export function phoneNumber(raw:unknown) {let d=String(raw||'').replace(/\D/g,'');if(d.length===13&&d.startsWith('88'))d=d.slice(2);return d;}
const text = (v:unknown,maximum:number) => {assert(typeof v==='string'&&v.trim().length>0&&v.length<=maximum,'Invalid customer details');return v.trim();};
const money = (v:unknown) => {const n=Number(v);assert(Number.isFinite(n)&&n>=0,'Invalid price');return n;};
export async function recentOrder(env:Env,request:Request,phone:string,configuration?:Record<string,string>) {
  const cfg=configuration||await settings(env);
  const blocked=await env.DB.prepare("SELECT id FROM blocked_users WHERE (phone=? OR ip_address=?) AND (block_type<>'temporary' OR blocked_until IS NULL OR blocked_until>?) LIMIT 1").bind(phone,ipAddress(request),new Date().toISOString()).first();
  if(blocked)return {remainingMinutes:30,message:cfg.duplicate_block_message||'Orders are blocked. Please contact support.',whatsappNumber:cfg.duplicate_block_whatsapp||''};
  if(cfg.duplicate_block_enabled!=='true')return null;
  const minutes=Math.max(1,Math.min(1440,Number(cfg.duplicate_block_time)||30));
  const row=await env.DB.prepare("SELECT created_at FROM orders WHERE (customer_phone=? OR customer_ip=?) AND status<>'cancelled' AND created_at>=? ORDER BY created_at DESC LIMIT 1").bind(phone,ipAddress(request),new Date(Date.now()-minutes*60000).toISOString()).first<{created_at:string}>();
  if(!row)return null;
  return {remainingMinutes:Math.max(1,Math.ceil((Date.parse(row.created_at)+minutes*60000-Date.now())/60000)),message:cfg.duplicate_block_message||'Please wait before placing another order',whatsappNumber:cfg.duplicate_block_whatsapp||''};
}
export async function checkout(env:Env, request:Request, input:Row, user:Identity|null) {
  await rateLimit(env,'checkout:'+ipAddress(request),20,600);
  const order=input.order as Row, items=input.items as Row[];
  assert(order&&Array.isArray(items)&&items.length>0&&items.length<=30,'Order items required');
  const phone=phoneNumber(order.customer_phone);assert(/^01[3-9]\d{8}$/.test(phone),'Valid Bangladesh phone required');
  const cfg=await settings(env);
  const duplicate=await recentOrder(env,request,phone,cfg);assert(!duplicate,duplicate?.message||'Please wait before ordering again',409);
  const id=String(order.id||crypto.randomUUID());assert(/^[0-9a-f-]{36}$/i.test(id));
  const city=text(order.customer_city,100),inside=city==='ঢাকার ভিতরে';
  const pageId=typeof input.sales_page_id==='string'?input.sales_page_id:'';
  let page:Row|null=null;
  if(pageId){const raw=await env.DB.prepare('SELECT * FROM sales_pages WHERE id=? AND is_active=1').bind(pageId).first<Row>();assert(raw,'Sales page is unavailable',404);page=hydrate('sales_pages',raw);}
  const styles=(page?.template_styles||{}) as {products?:{ids?:string;multiple?:string}};
  const allowedIds=(styles.products?.ids||String(page?.product_id||'')).split(',').filter(Boolean);
  const multi=allowedIds.length>1;
  if(page&&multi&&styles.products?.multiple!=='1')assert(items.length===1,'Choose one product');
  assert(items.every(item=>item&&typeof item==='object'&&!Array.isArray(item)),'Invalid order item');
  const productIds=[...new Set(items.map(item=>item.product_id).filter(id=>id!==null&&id!==undefined))];
  assert(productIds.every(id=>typeof id==='string'&&id.length<=100),'Invalid product');
  const placeholders=productIds.map(()=>'?').join(',');
  const products=productIds.length?(await env.DB.prepare(`SELECT id,name,name_bn,price,free_shipping,shipping_inside_dhaka,shipping_outside_dhaka FROM products WHERE id IN (${placeholders})`).bind(...productIds).all<Row>()).results:[];
  const variations=productIds.length?(await env.DB.prepare(`SELECT id,product_id,price,group_name,variation_name FROM product_variations WHERE product_id IN (${placeholders}) ORDER BY sort_order,id`).bind(...productIds).all<Row>()).results:[];
  const lines:Row[]=[],shipping:number[]=[];let subtotal=0;
  for(const item of items) {
    const quantity=Number(item.quantity);assert(Number.isInteger(quantity)&&quantity>=1&&quantity<=1000,'Invalid quantity');
    let product:Row|null=null;
    if(item.product_id){product=products.find(p=>p.id===item.product_id)||null;assert(product,'Product unavailable',404);}
    if(page){assert(product?allowedIds.includes(String(product.id)):!page.product_id&&!multi,'Product does not belong to this page');}
    else assert(product,'Product required');
    let price=money(product?product.price:page?.offer_price),name=String(product?.name_bn||product?.name||page?.title);
    const selectedIds=(item.variation_ids|| (item.variation_id?[item.variation_id]:[])) as unknown[];
    assert(Array.isArray(selectedIds)&&selectedIds.length<=20&&new Set(selectedIds).size===selectedIds.length);
    let selected:Row[]=[];
    if(selectedIds.length){
      assert(product,'Variations require a product');
      const available=variations.filter(v=>v.product_id===product!.id);
      selected=selectedIds.map(v=>{const r=available.find(a=>a.id===v);assert(r,'Invalid variation');return r;});
      const groups=new Set(available.map(v=>String(v.group_name||'').trim()));
      const chosen=selected.map(v=>String(v.group_name||'').trim());
      assert(groups.size===selected.length&&new Set(chosen).size===selected.length,'Choose one variation per group');
      const sum=selected.reduce((n,v)=>n+money(v.price),0);if(sum>0)price=sum;
    }
    const label=selected.map(v=>v.variation_name).join(' / ');if(label)name+=' ('+label+')';
    subtotal+=price*quantity;
    const defaultRate=page?(inside?60:120):Number(cfg[inside?'default_shipping_inside_dhaka':'default_shipping_outside_dhaka']||(inside?60:120));
    const custom=product?.[inside?'shipping_inside_dhaka':'shipping_outside_dhaka'];
    const rate=custom===null||custom===undefined?defaultRate:money(custom);
    shipping.push(product?.free_shipping?0:rate);
    lines.push({order_id:id,product_id:product?.id||null,product_name:name,product_price:price,quantity,variation_id:selected[0]?.id||null,variation_name:label||null});
  }
  let shippingCost=Math.max(...shipping),discount=0;const couponCode=String(order.coupon_code||'').trim().toUpperCase();
  if(couponCode){
    const coupon=await env.DB.prepare('SELECT * FROM spin_entries WHERE coupon_code=? AND is_used=0').bind(couponCode).first<Row>();assert(coupon,'Coupon is invalid or already used',409);
    if(coupon.discount_type==='free_shipping')shippingCost=0;
    else discount=Math.min(subtotal,coupon.discount_type==='percentage'?Math.round(subtotal*money(coupon.discount_value)/100):money(coupon.discount_value));
  }
  const total=Math.round((subtotal-discount+shippingCost)*100)/100;
  assert(Math.abs(money(order.total_amount)-total)<0.011,'Prices or shipping changed. Refresh the page and try again.',409);
  const method=String(order.payment_method||'cod');assert(['cod','bkash','nagad','rocket'].includes(method),'Invalid payment method');
  const row:Row={id,user_id:user?.id||null,customer_name:text(order.customer_name,100),customer_phone:phone,customer_address:text(order.customer_address,2000),customer_city:city,total_amount:total,shipping_cost:shippingCost,coupon_discount:discount,coupon_code:couponCode||null,payment_method:method,notes:String(order.notes||'').slice(0,4000),order_source:page?'sales_page':String(order.order_source||'website').slice(0,50),customer_ip:ipAddress(request)};
  const guest=cookie(request,'__Host-shop_guest')||randomToken();
  await env.DB.prepare('DELETE FROM checkout_guards WHERE expires_at<=? OR order_id IN (SELECT id FROM orders WHERE status=\'cancelled\')').bind(now()).run();
  const statements:D1PreparedStatement[]=[];
  if(cfg.duplicate_block_enabled==='true') {
    const minutes=Math.max(1,Math.min(1440,Number(cfg.duplicate_block_time)||30));
    for(const k of ['phone:'+phone,'ip:'+ipAddress(request)])statements.push(env.DB.prepare('INSERT INTO checkout_guards(key,order_id,expires_at) VALUES (?,?,?)').bind(await sha256(k),id,now()+minutes*60));
  }
  if(couponCode)statements.push(env.DB.prepare('INSERT INTO checkout_guards(key,order_id,expires_at) VALUES (?,?,?)').bind(await sha256('coupon:'+couponCode),id,2147483647));
  statements.push(insertStatement(env,'orders',row),...lines.map(line=>insertStatement(env,'order_items',line)));
  if(!user)statements.push(env.DB.prepare('INSERT INTO guest_orders(order_id,owner_digest) VALUES (?,?)').bind(id,await sha256(guest)));
  if(couponCode)statements.push(env.DB.prepare('UPDATE spin_entries SET is_used=1,used_order_id=? WHERE coupon_code=? AND is_used=0').bind(id,couponCode));
  await env.DB.batch(statements);
  return json({data:{id,total_amount:total},error:null},200,{'Set-Cookie':`__Host-shop_guest=${guest}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`});
}
