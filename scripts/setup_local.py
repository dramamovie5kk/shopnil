"""Prepare local-only signing secret and idempotent Wrangler D1 migrations."""
from pathlib import Path
import os
import re
import secrets
import subprocess

ROOT=Path(__file__).resolve().parents[1]
local=ROOT/'.dev.vars'
existing=local.read_text() if local.exists() else ''
if not re.search(r'^\s*JWT_SECRET\s*=',existing,re.M):
    with local.open('a') as output:
        if existing and not existing.endswith('\n'):output.write('\n')
        output.write('JWT_SECRET="'+secrets.token_urlsafe(48)+'"\n')
local.chmod(0o600)
print('Local JWT signing secret is configured; value withheld.',flush=True)
environment={**os.environ,'XDG_CONFIG_HOME':'/tmp/offer-cloudflare-config','WRANGLER_LOG_PATH':'/tmp/baridhara-local-setup.log','WRANGLER_SEND_METRICS':'false','CI':'true'}
subprocess.run(['npx','--no-install','wrangler','d1','migrations','apply','shopnil','--local','--persist-to','.wrangler/dev-state'],cwd=ROOT,env=environment,check=True)
