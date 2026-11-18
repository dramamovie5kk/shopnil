"""Promote an explicitly selected registered account to admin, without credentials in chat.

Run: python scripts/cloudflare_admin.py --email owner@example.com
The account must already have registered through the deployed application.
This never chooses the first registrant automatically.
"""
import argparse
import sys
from cloudflare_setup import query

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--email',required=True)
args=parser.parse_args()
email=args.email.strip().lower()
rows=query('SELECT id FROM auth_users WHERE email=?',[email])[0]['results']
if len(rows)!=1:
    sys.exit('The specified registered account was not found; no roles changed.')
uid=rows[0]['id']
query("INSERT INTO user_roles(user_id,role) VALUES (?,'admin') ON CONFLICT(user_id,role) DO NOTHING",[uid])
# The current UI expects one effective role per user.
query("DELETE FROM user_roles WHERE user_id=? AND role<>'admin'",[uid])
print('Admin role granted to the explicitly selected registered account.')
