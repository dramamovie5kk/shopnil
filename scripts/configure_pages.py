"""Verify/configure production Pages bindings and a server-only signing secret.

No deployment is created, and the unrelated Pages project is never modified.
Run `python scripts/configure_pages.py --apply` to save production settings.
"""
import argparse
import json
import os
from pathlib import Path
import secrets
import sys
import urllib.error
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'wrangler.jsonc').read_text())
from cloudflare_setup import ACCOUNT
PROJECT=CONFIG['name']
BASE=f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}'

def request(method='GET',payload=None):
    token=os.environ.get('CLOUDFLARE_API_TOKEN')
    if not token:raise RuntimeError('Set CLOUDFLARE_API_TOKEN securely in environment settings')
    r=urllib.request.Request(BASE,method=method,data=None if payload is None else json.dumps(payload).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(r,timeout=30) as response:result=json.load(response)
    except urllib.error.HTTPError as exc:raise RuntimeError(f'Pages configuration API returned HTTP {exc.code}; verify Pages Edit permissions') from None
    if not result.get('success'):raise RuntimeError('Pages configuration operation failed')
    return result['result']

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
    project=request();source=(project.get('source') or {}).get('config',{})
    if (source.get('owner'),source.get('repo_name'))!=('dramamovie5kk','shopnil'):
        raise RuntimeError('Pages project repository mismatch; no settings changed')
    production=project.get('deployment_configs',{}).get('production',{})
    if args.apply:
        dbs=dict(production.get('d1_databases') or {});buckets=dict(production.get('r2_buckets') or {})
        dbs['DB']={'id':CONFIG['d1_databases'][0]['database_id']}
        buckets['BUCKET']={'name':CONFIG['r2_buckets'][0]['bucket_name']}
        update={'d1_databases':dbs,'r2_buckets':buckets}
        variables=dict(production.get('env_vars') or {})
        # Preserve an already configured signing key; never copy local dev keys.
        if 'JWT_SECRET' not in variables:
            variables['JWT_SECRET']={'type':'secret_text','value':secrets.token_urlsafe(48)}
            update['env_vars']=variables
        request('PATCH',{'deployment_configs':{'production':update}})
        print('Saved production D1/R2 bindings and signing-secret configuration; no deployment created')
        project=request();production=project['deployment_configs']['production']
    db=(production.get('d1_databases') or {}).get('DB',{})
    bucket=(production.get('r2_buckets') or {}).get('BUCKET',{})
    checks={'repository':source.get('repo_name')=='shopnil','D1 binding DB':db.get('id')==CONFIG['d1_databases'][0]['database_id'],'R2 binding BUCKET':bucket.get('name')==CONFIG['r2_buckets'][0]['bucket_name'],'server-only JWT_SECRET':(production.get('env_vars') or {}).get('JWT_SECRET',{}).get('type')=='secret_text'}
    for label,passed in checks.items():print(label+': '+('verified' if passed else 'missing or mismatched'))
    if not all(checks.values()):raise RuntimeError('Pages production configuration is incomplete')

if __name__=='__main__':
    try:main()
    except (RuntimeError,urllib.error.URLError) as exc:print(str(exc),file=sys.stderr);sys.exit(1)
