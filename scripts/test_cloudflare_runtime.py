"""Exercise real Pages Functions with disposable LOCAL D1/R2 bindings.

Start `wrangler pages dev dist --port 8789 --persist-to /tmp/offer-migration-smoke-state`
with a local .dev.vars signing secret first. No remote resources are touched.
"""
import base64
import http.client
from http.cookies import SimpleCookie
import json
import os
from pathlib import Path
import secrets
import sqlite3
import uuid

ROOT=Path(__file__).resolve().parents[1]
STATE=Path(os.environ.get('OFFER_SMOKE_STATE','/tmp/offer-migration-smoke-state'))
assert STATE.resolve().is_relative_to(Path('/tmp'))
HOST,PORT='127.0.0.1',int(os.environ.get('OFFER_SMOKE_PORT','8789'))
ORIGIN=f'http://{HOST}:{PORT}'

class Client:
    def __init__(self): self.cookies={}
    def request(self,path,body=None,method=None,origin=ORIGIN,raw=None,extra_headers=None):
        method=method or ('POST' if body is not None else 'GET')
        connection=http.client.HTTPConnection(HOST,PORT,timeout=30)
        payload=json.dumps(body).encode() if body is not None else raw
        headers={'Origin':origin,'Cookie':'; '.join(f'{k}={v}' for k,v in self.cookies.items())}
        if body is not None:headers['Content-Type']='application/json'
        if extra_headers:headers.update(extra_headers)
        connection.request(method,'/api/'+path,payload,headers)
        response=connection.getresponse();status=response.status
        self.last_headers={k.lower():v for k,v in response.getheaders()}
        for name,value in response.getheaders():
            if name.lower()=='set-cookie':
                cookie=SimpleCookie();cookie.load(value)
                for k,v in cookie.items():self.cookies[k]=v.value
        rawbody=response.read();connection.close()
        try:data=json.loads(rawbody)
        except (ValueError,UnicodeDecodeError):data=rawbody
        return status,data
    def ok(self,path,body=None,method=None):
        status,result=self.request(path,body,method)
        assert status==200,(path,status,result)
        return result.get('data',result)

def dbquery(client,table,action='select',**kwargs):
    status,result=client.request('database',{'table':table,'action':action,**kwargs})
    assert status==200,(table,status,result)
    return result
def eq(column,value):return {'column':column,'op':'eq','value':value}
def report(name):print('PASS',name)

anonymous=Client();anonymous.request('health')
files=[p for p in (STATE/'v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if p.name!='metadata.sqlite']
assert len(files)==1,'Use the specified isolated state directory'
database=sqlite3.connect(files[0]);database.execute('PRAGMA foreign_keys=ON')
existing={r[0] for r in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
assert not (existing-{'_cf_KV'}),'Test state must be empty: use a new disposable state directory'
for migration in sorted((ROOT/'cloudflare/migrations').glob('*.sql')):database.executescript(migration.read_text())
report('all SQLite migrations execute in the local Pages database')
assert anonymous.ok('health')['ready'] is True
report('real D1, R2 and JWT configuration readiness')
admin=Client();password=secrets.token_urlsafe(24);suffix=uuid.uuid4().hex[:12]
account=admin.ok('auth/signup',{'email':f'admin-{suffix}@example.invalid','password':password,'full_name':'Local test','role':'admin'})
uid=account['user']['id'];assert len(account['recovery_code'])>=40
assert admin.ok('rpc/has_role',{'_user_id':uid,'_role':'admin'}) is False
assert admin.request('database',{'table':'products','action':'insert','values':{'name':'Forbidden'}})[0]==403
report('registration cannot self-assign admin privileges')
# Test fixture only. Production admin enrollment uses cloudflare_admin.py.
database.execute("UPDATE user_roles SET role='admin' WHERE user_id=?",(uid,));database.commit()
assert admin.ok('rpc/has_role',{'_user_id':uid,'_role':'admin'}) is True
category=uuid.uuid4().hex;product=uuid.uuid4().hex;page=uuid.uuid4().hex
for table,record in [
    ('categories',{'id':category,'name':'Test','name_bn':'Test','slug':'test-'+suffix}),
    ('products',{'id':product,'name':'Test','name_bn':'Test','slug':'test-'+suffix,'price':100,'category_id':category,'cost_price':17}),
    ('sales_pages',{'id':page,'title':'Test','slug':'test-'+suffix,'hero_headline':'Heading','offer_price':100,'product_id':product,'is_active':True,'show_hero_section':True,'template_styles':{'hero':{'design':'01'}}}),
]:dbquery(admin,table,'insert',values=record)
listing=dbquery(anonymous,'products',select='*, categories(*)')['data']
assert listing[0]['categories']['id']==category and 'cost_price' not in listing[0]
page_data=dbquery(anonymous,'sales_pages',select='*')['data'][0]
assert page_data['show_hero_section'] is True and page_data['template_styles']['hero']['design']=='01'
dbquery(admin,'sales_pages','update',values={'hero_subheadline':'Updated'},filters=[eq('id',page)])
assert dbquery(anonymous,'sales_pages',select='*')['data'][0]['show_hero_section'] is True
report('catalog joins and compressed sales-page document round-trip')
dbquery(admin,'site_settings','upsert',values=[{'setting_key':'site_name','setting_value':'Test'},{'setting_key':'fb_pixel_access_token','setting_value':'dummy-not-a-token'}],onConflict='setting_key')
public=dbquery(anonymous,'site_settings',select='*')['data']
assert {r['setting_key'] for r in public}=={'site_name'}
assert anonymous.request('functions/send-to-courier',{})[0]==403
assert anonymous.request('database',{'table':'auth_users','action':'select'})[0]==400
assert anonymous.request('database',{'table':'products','action':'select'},origin='https://evil.invalid')[0]==403
report('private settings, internal auth tables, staff endpoints and CSRF protection')
assert anonymous.request('database',{'table':'products','action':'select','filters':[{'column':'cost_price','op':'gte','value':1}],'head':True,'count':'exact'})[0]==403
assert anonymous.request('database',{'table':'products','action':'select','orders':[{'column':'cost_price','ascending':True}]})[0]==403
assert anonymous.request('database',{'table':'products','action':'select','padding':'x'*70000})[0]==413
assert anonymous.request('database/extra',{'table':'products','action':'select'})[0]==404
selected=dbquery(anonymous,'sales_pages',select='id,hero_subheadline,products(name_bn)')['data'][0]
assert selected['hero_subheadline']=='Updated' and selected['products']=={'name_bn':'Test'}
upserted=dbquery(admin,'site_settings','upsert',values=[{'setting_key':'audit_a','setting_value':'a'},{'setting_key':'audit_b','setting_value':'b'}],onConflict='setting_key',select='*')['data']
again=dbquery(admin,'site_settings','upsert',values=[{'setting_key':'audit_a','setting_value':'new-a'},{'setting_key':'audit_b','setting_value':'new-b'}],onConflict='setting_key',select='*')['data']
assert {r['id'] for r in upserted}=={r['id'] for r in again} and len(again)==2
report('private-field inference, bounded requests, projected JSON and upsert return values')
# Full admin settings forms must fit D1's per-request query/parameter budgets.
full_settings=[{'setting_key':'settings_budget_'+str(i),'setting_value':'value-'+str(i)} for i in range(200)]
saved=dbquery(admin,'site_settings','upsert',values=full_settings,onConflict='setting_key',select='setting_key,setting_value,updated_at')['data']
assert len(saved)==200
repeat=dbquery(admin,'site_settings','upsert',values=full_settings,onConflict='setting_key',select='setting_key,setting_value,updated_at')['data']
assert {r['setting_key']:r['updated_at'] for r in repeat}=={r['setting_key']:r['updated_at'] for r in saved}
existing=dbquery(admin,'site_settings',select='id',filters=[eq('setting_key','site_name')],single='one')['data']['id']
assert admin.request('database',{'table':'site_settings','action':'upsert','onConflict':'setting_key','values':[{'setting_key':'rollback_setting','setting_value':'must-not-save'},{'id':existing,'setting_key':'conflicting_setting','setting_value':'invalid'}]})[0]==409
assert dbquery(admin,'site_settings',select='*',filters=[eq('setting_key','rollback_setting')])['data']==[]
report('200-setting saves, unchanged-write avoidance and atomic settings rollback')


# Signed-in cart selections, wishlist and profile access.
customer=Client();customer_password=secrets.token_urlsafe(24)
customer_account=customer.ok('auth/signup',{'email':f'customer-{suffix}@example.invalid','password':customer_password,'full_name':'Cart test'})
customer_id=customer_account['user']['id']
v1,v2=uuid.uuid4().hex,uuid.uuid4().hex
for vid,group,price in [(v1,'Color',35),(v2,'Size',65)]:
    dbquery(admin,'product_variations','insert',values={'id':vid,'product_id':product,'variation_name':group,'group_name':group,'price':price})
customer.ok('rpc/sync_cart',{'items':[{'product_id':product,'quantity':1,'variation_ids':[v1,v2]},{'product_id':product,'quantity':2,'variation_ids':[]}]})
cart=dbquery(customer,'cart_items',select='*, products(*)')['data']
assert len(cart)==2 and any(r['variation_ids']==[v1,v2] for r in cart)
assert dbquery(anonymous,'cart_items',select='*')['data']==[]
assert customer.request('rpc/sync_cart',{'items':[{'product_id':'missing','quantity':1,'variation_ids':[]}]})[0]==409
assert len(dbquery(customer,'cart_items',select='*')['data'])==2
wish=dbquery(customer,'wishlist','insert',values={'user_id':customer_id,'product_id':product},select='*',single='one')['data']
assert wish['user_id']==customer_id
assert customer.request('database',{'table':'profiles','action':'update','values':{'user_id':uid,'full_name':'Invalid'},'filters':[eq('user_id',uid)]})[0]==403
dbquery(customer,'profiles','update',values={'full_name':'Updated customer'},filters=[eq('user_id',customer_id)])
assert dbquery(customer,'profiles',select='*')['data'][0]['full_name']=='Updated customer'
updated=dbquery(customer,'profiles','update',values={'full_name':'Changed filter field'},filters=[eq('full_name','Updated customer')],select='*',single='one')['data']
assert updated['full_name']=='Changed filter field'
report('atomic cart synchronization, multi-group selections, wishlist and profile isolation')
# Actual local R2 writes and reads through the authenticated media API.
image=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMncAAAAASUVORK5CYII=')
path=f'media/products/test/{suffix}.png'
assert anonymous.request(path,method='PUT',raw=image)[0]==403
assert admin.request(path,method='PUT',raw=image)[0]==200
assert admin.request(path,method='PUT',raw=image)[0]==409
assert anonymous.request(path)[1]==image
etag=anonymous.last_headers['etag']
assert anonymous.request(path,extra_headers={'If-None-Match':etag})[0]==304
assert anonymous.request(path,method='HEAD')[0]==200
status,partial=anonymous.request(path,extra_headers={'Range':'bytes=0-7'})
assert status==206 and partial==image[:8]
assert admin.request(path,method='DELETE')[0]==200
assert anonymous.request(path)[0]==404
assert admin.request('media/products/test/rejected.html',method='PUT',raw=b'<script>alert(1)</script>')[0]==415
report('R2 upload, immutable path, public read, deletion and content validation')
guest=Client();guest.ok('auth/session')
abandoned={'_session_id':'local-test-session','_customer_phone':'01700000001','_cart_data':{'items':[{'product_id':product}],'total':160}}
guest.ok('rpc/save_abandoned_cart',abandoned)
guest.ok('rpc/save_abandoned_cart',{**abandoned,'_cart_data':{'items':[],'total':0}})
assert len(dbquery(admin,'abandoned_carts',select='*')['data'])==1
anonymous.ok('rpc/remove_abandoned_cart',abandoned)
assert len(dbquery(admin,'abandoned_carts',select='*')['data'])==1
guest.ok('rpc/remove_abandoned_cart',abandoned)
assert dbquery(admin,'abandoned_carts',select='*')['data']==[]
report('abandoned-cart upsert and guest deletion isolation')
order_id=str(uuid.uuid4())
order={'id':order_id,'customer_name':'Test','customer_phone':'01700000001','customer_address':'Local test only','customer_city':'ঢাকার ভিতরে','total_amount':160,'payment_method':'cod'}
items=[{'product_id':product,'quantity':1,'variation_ids':[]}]
wrong={**order,'total_amount':1}
assert guest.request('checkout',{'order':wrong,'items':items})[0]==409
assert dbquery(admin,'orders',count='exact',head=True)['count']==0
assert guest.ok('checkout',{'order':order,'items':items,'sales_page_id':page})['total_amount']==160
assert dbquery(guest,'orders',select='*',filters=[eq('id',order_id)])['data'][0]['customer_name']=='Test'
assert dbquery(anonymous,'orders',select='*',filters=[eq('id',order_id)])['data']==[]
assert len(dbquery(guest,'order_items',select='*',filters=[eq('order_id',order_id)])['data'])==1
assert guest.request('database',{'table':'orders','action':'update','values':{'total_amount':0},'filters':[eq('id',order_id)]})[0]==403
report('server pricing, atomic order/items creation and guest order isolation')
# A failure in a batch rolls back its earlier rows.
batch_id=uuid.uuid4().hex
assert admin.request('database',{'table':'products','action':'insert','values':[{'id':batch_id,'name':'Roll back','name_bn':'Roll back','price':1,'slug':batch_id},{'name':'Missing required fields'}]})[0]==409
assert dbquery(admin,'products',select='id',filters=[eq('id',batch_id)])['data']==[]
report('failed D1 batch rolls back every write')
# Coupon redemption must be tied to the successful order and cannot be reused.
database.execute("INSERT INTO spin_entries(coupon_code,customer_name,customer_phone,discount_type,discount_value) VALUES ('TEST-COUPON','Test','01700000002','fixed',10)");database.commit()
with_coupon={**order,'id':str(uuid.uuid4()),'customer_phone':'01700000002','total_amount':150,'coupon_code':'TEST-COUPON'}
guest.ok('checkout',{'order':with_coupon,'items':items})
assert guest.request('checkout',{'order':{**with_coupon,'id':str(uuid.uuid4())},'items':items})[0]==409
report('coupon consumption is atomic and single-use')
# Multi-group server pricing and signed-in order ownership.
assert customer.request('checkout',{'order':{**order,'id':str(uuid.uuid4())},'items':[{'product_id':product,'quantity':1,'variation_ids':[v1]}]})[0]==400
signed_id=str(uuid.uuid4())
customer.ok('checkout',{'order':{**order,'id':signed_id},'items':[{'product_id':product,'quantity':1,'variation_ids':[v1,v2]}]})
assert dbquery(customer,'orders',select='*',filters=[eq('id',signed_id)])['data'][0]['user_id']==customer_id
assert dbquery(anonymous,'orders',select='*',filters=[eq('id',signed_id)])['data']==[]
# Server-owned spin outcome and per-phone limits.
dbquery(admin,'site_settings','upsert',values={'setting_key':'spin_enabled','setting_value':'true'},onConflict='setting_key')
offer_id=uuid.uuid4().hex
dbquery(admin,'spin_offers','insert',values={'id':offer_id,'offer_text':'Test discount','discount_type':'fixed','discount_value':10,'probability':1,'is_active':True})
spin=guest.ok('rpc/spin',{'name':'Local test','phone':'01700000003'})
assert spin['offer']['id']==offer_id and spin['coupon_code'].startswith('SPN-')
assert guest.ok('rpc/get_spin_coupon',{'_code':spin['coupon_code']})[0]['discount_value']==10
assert guest.request('rpc/spin',{'name':'Local test','phone':'01700000003'})[0]==429
report('multi-group checkout validation and server-owned spin coupons')
moderator=Client()
moderator_account=moderator.ok('auth/signup',{'email':f'moderator-{suffix}@example.invalid','password':secrets.token_urlsafe(24),'full_name':'Moderator test'})
database.execute("UPDATE user_roles SET role='moderator' WHERE user_id=?",(moderator_account['user']['id'],));database.commit()
assert moderator.request('database',{'table':'transactions','action':'select'})[0]==403
assert moderator.request('database',{'table':'suppliers','action':'select'})[0]==403
assert moderator.request('database',{'table':'products','action':'select','filters':[{'column':'cost_price','op':'gte','value':0}]})[0]==403
spin_row=dbquery(moderator,'spin_entries',select='*',filters=[eq('coupon_code',spin['coupon_code'])])['data'][0]
dbquery(moderator,'spin_entries','update',values={'status':'contacted'},filters=[eq('id',spin_row['id'])])
assert moderator.request('database',{'table':'spin_entries','action':'update','values':{'discount_value':999},'filters':[eq('id',spin_row['id'])]})[0]==403
report('moderator role isolation and restricted spin-entry status changes')

# Read-only staff aggregates are accurate beyond client row limits.
free_id=uuid.uuid4().hex
dbquery(admin,'products','insert',values={'id':free_id,'name':'Free','name_bn':'Free','slug':free_id,'price':0,'shipping_inside_dhaka':0})
guest.ok('checkout',{'order':{**order,'id':str(uuid.uuid4()),'total_amount':0},'items':[{'product_id':free_id,'quantity':1}]})
guest.ok('checkout',{'order':{**order,'id':str(uuid.uuid4()),'total_amount':3060},'items':[{'product_id':product,'quantity':1} for _ in range(30)]})
periods={'today':'2000-01-01T00:00:00.000Z','week':'2000-01-01T00:00:00.000Z','month':'2000-01-01T00:00:00.000Z'}
assert anonymous.request('rpc/admin_stats',periods)[0]==403
stats=admin.ok('rpc/admin_stats',periods)
expected_count,expected_total=database.execute('SELECT count(*),sum(total_amount) FROM orders').fetchone()
assert stats['totalOrders']==expected_count and stats['monthRevenue']==expected_total
report('zero-priced/free-shipping orders, 30-item checkout and staff-only aggregate accuracy')
# Reviews written by anonymous callers are never auto-approved or exposed with phone.
review=dbquery(guest,'product_reviews','insert',values={'id':'forged-review','created_at':'2099-01-01T00:00:00.000Z','product_id':product,'customer_name':'Test','customer_phone':'01700000001','rating':5,'is_approved':True},select='*',single='one')['data']
assert review['id']!='forged-review' and not review['created_at'].startswith('2099')
assert dbquery(anonymous,'product_reviews_public',select='*')['data']==[]
report('untrusted review approval is rejected')
dbquery(admin,'site_settings','upsert',values={'setting_key':'duplicate_block_enabled','setting_value':'true'},onConflict='setting_key')
assert guest.ok('rpc/duplicate_status',{'phone':'01700000001'})['isBlocked'] is True
assert guest.request('checkout',{'order':{**order,'id':str(uuid.uuid4())},'items':items})[0]==409
report('server-side duplicate-order protection')
# Logout revokes the actual server session, including a stolen old JWT.
stolen=Client();stolen.cookies=admin.cookies.copy()
admin.ok('auth/logout',{})
assert stolen.ok('auth/session')['user'] is None
admin.ok('auth/login',{'email':account['user']['email'],'password':password})
user=Client();user_password=secrets.token_urlsafe(24);email=f'user-{suffix}@example.invalid'
registered=user.ok('auth/signup',{'email':email,'password':user_password,'full_name':'Recover test'})
reset=anonymous.ok('auth/recover',{'email':email,'password':password,'recovery_code':registered['recovery_code']})
assert reset['recovery_code']!=registered['recovery_code']
assert user.ok('auth/session')['user'] is None
assert anonymous.request('auth/recover',{'email':email,'password':password,'recovery_code':registered['recovery_code']})[0]==401
user.ok('auth/login',{'email':email,'password':password})
report('logout, login, one-time recovery code rotation and session revocation')
assert database.execute('PRAGMA foreign_key_check').fetchall()==[]
database.close()
print('All local Pages runtime checks passed. No remote data was used.')
