import { Env, Row, assert, ipAddress, now, randomToken, rateLimit, settings, sha256 } from './core';
import { Identity, admin, staff, cookie } from './auth';
import { insertStatement } from './database';
import { phoneNumber, recentOrder } from './checkout';
export async function rpc(env:Env,request:Request,name:string,input:Row,user:Identity|null):Promise<unknown> {
  if(name==='has_role'){
    assert(user&&(admin(user)||input._user_id===user.id),'Login required',401);
    assert(['admin','moderator','user'].includes(String(input._role)));
    if(input._user_id===user.id)return user.roles.includes(String(input._role));
    return !!await env.DB.prepare('SELECT id FROM user_roles WHERE user_id=? AND role=?').bind(String(input._user_id),String(input._role)).first();
  }
  if(name==='admin_stats'){
    assert(staff(user),'Staff access required',403);
    const dates=['today','week','month'].map(key=>{const value=String(input[key]||'');assert(/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value)),'Invalid date range');return value;});
    return await env.DB.prepare(`SELECT count(*) AS totalOrders,
      coalesce(sum(status='pending'),0) AS pendingOrders,
      (SELECT count(*) FROM products) AS totalProducts,
      (SELECT count(*) FROM blocked_users) AS blockedUsers,
      coalesce(sum(CASE WHEN created_at>=? THEN total_amount ELSE 0 END),0) AS todayRevenue,
      coalesce(sum(CASE WHEN created_at>=? THEN total_amount ELSE 0 END),0) AS weekRevenue,
      coalesce(sum(CASE WHEN created_at>=? THEN total_amount ELSE 0 END),0) AS monthRevenue,
      coalesce(sum(created_at>=?),0) AS todayOrders,
      coalesce(sum(created_at>=?),0) AS weekOrders,
      coalesce(sum(created_at>=?),0) AS monthOrders FROM orders`).bind(...dates,...dates).first();
  }
  if(name==='duplicate_status'){
    await rateLimit(env,'duplicate:'+ipAddress(request),60,600);
    const result=await recentOrder(env,request,phoneNumber(input.phone));
    return result?{isBlocked:true,...result}:{isBlocked:false,remainingMinutes:0,message:'',whatsappNumber:''};
  }
  if(name==='get_spin_coupon'){
    await rateLimit(env,'coupons:'+ipAddress(request),30,600);
    const code=String(input._code||'').toUpperCase();assert(code.length<=100);
    return (await env.DB.prepare('SELECT coupon_code,discount_type,discount_value,offer_text FROM spin_entries WHERE coupon_code=? AND is_used=0').bind(code).all()).results;
  }
  if(name==='redeem_spin_coupon'){
    // Checkout already consumed the coupon atomically. This call is idempotent.
    const row=await env.DB.prepare('SELECT o.user_id,g.owner_digest FROM orders o LEFT JOIN guest_orders g ON g.order_id=o.id WHERE o.id=?').bind(String(input._order_id||'')).first<Row>();
    assert(row&&(row.user_id===user?.id||row.owner_digest===await sha256(cookie(request,'__Host-shop_guest'))),'Access denied',403);
    return !!await env.DB.prepare('SELECT id FROM spin_entries WHERE coupon_code=? AND used_order_id=? AND is_used=1').bind(String(input._code||''),String(input._order_id||'')).first();
  }
  if(name==='save_abandoned_cart'||name==='remove_abandoned_cart'){
    await rateLimit(env,'abandoned:'+ipAddress(request),100,600);
    const phone=phoneNumber(input._customer_phone);assert(/^01[3-9]\d{8}$/.test(phone));
    const guest=cookie(request,'__Host-shop_guest');assert(guest,'Guest session required',401);
    const session=await sha256(guest+String(input._session_id||''));
    if(name==='remove_abandoned_cart'){await env.DB.prepare('DELETE FROM abandoned_carts WHERE session_id=? AND customer_phone=?').bind(session,phone).run();return null;}
    assert(input._cart_data&&typeof input._cart_data==='object'&&JSON.stringify(input._cart_data).length<64000);
    await env.DB.prepare('INSERT INTO abandoned_carts(session_id,customer_phone,cart_data,checkout_step,user_id,customer_ip) VALUES (?,?,?,?,?,?) ON CONFLICT(session_id,customer_phone) DO UPDATE SET cart_data=excluded.cart_data,checkout_step=excluded.checkout_step').bind(session,phone,JSON.stringify(input._cart_data),String(input._checkout_step||'checkout').slice(0,50),user?.id||null,ipAddress(request)).run();
    return null;
  }
  if(name==='sync_cart'){
    assert(user,'Login required',401);
    const items=input.items as Row[];assert(Array.isArray(items)&&items.length<=100);
    const statements=[env.DB.prepare('DELETE FROM cart_items WHERE user_id=?').bind(user.id)];
    for(const item of items){
      const ids=item.variation_ids as string[];assert(Array.isArray(ids)&&ids.length<=20&&ids.every(v=>typeof v==='string'));
      const quantity=Number(item.quantity);assert(Number.isInteger(quantity)&&quantity>=1&&quantity<=1000);
      statements.push(insertStatement(env,'cart_items',{user_id:user.id,product_id:String(item.product_id),quantity,variation_ids:ids,selection_key:[...ids].sort().join('+')}));
    }
    await env.DB.batch(statements);return null;
  }
  if(name==='spin'){
    await rateLimit(env,'spin-ip:'+ipAddress(request),20,86400);
    const phone=phoneNumber(input.phone);assert(/^01[3-9]\d{8}$/.test(phone));
    await rateLimit(env,'spin-phone:'+phone,1,86400);
    const cfg=await settings(env);assert(cfg.spin_enabled==='true','Spin offers are disabled',409);
    const offers=(await env.DB.prepare('SELECT * FROM spin_offers WHERE is_active=1 ORDER BY sort_order,id').all<Row>()).results;
    const total=offers.reduce((sum,r)=>sum+Math.max(0,Number(r.probability)||0),0);assert(offers.length&&total>0,'No spin offers available',409);
    let choice=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296*total,offer=offers[offers.length-1];
    for(const item of offers){choice-=Math.max(0,Number(item.probability)||0);if(choice<0){offer=item;break;}}
    const code='SPN-'+randomToken().slice(0,16).toUpperCase();
    const customer=String(input.name||'').trim();assert(customer.length>=1&&customer.length<=100);
    await insertStatement(env,'spin_entries',{coupon_code:code,customer_name:customer,customer_phone:phone,offer_id:offer.id,offer_text:offer.offer_text,discount_type:offer.discount_type,discount_value:offer.discount_value}).run();
    return {offer,coupon_code:code};
  }
  assert(false,'Unknown operation',404);
}
