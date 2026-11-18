"""Create food-store information pages and resolve footer links. Dry run by default."""
import argparse
import json
from pathlib import Path
from cloudflare_setup import query

ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
    pages=json.loads((ROOT/'content/food-pages.bn.json').read_text())
    existing={r['slug'] for r in query('SELECT slug FROM pages')[0]['results']}
    missing=[page for page in pages if page['slug'] not in existing]
    labels={page['slug']:page['title'] for page in pages}
    rows=query("SELECT setting_key,setting_value FROM site_settings WHERE setting_key IN ('footer_quick_links','footer_customer_service_links')")[0]['results']
    changes=[]
    for row in rows:
        links=json.loads(row['setting_value'])
        for link in links:
            slug=link['url'].removeprefix('/page/').removeprefix('/')
            if slug in labels:link.update(label=labels[slug],url='/page/'+slug)
            elif link['url']=='/':link['label']='হোম'
            elif link['url']=='/products':link['label']='সব পণ্য'
        if row['setting_key']=='footer_customer_service_links':
            for slug in ['food-storage','faq','privacy-policy']:
                if not any(link['url'] in ['/'+slug,'/page/'+slug] for link in links):
                    links.append({'id':'food-'+slug,'label':labels[slug],'url':'/page/'+slug})
        changes.append((row,json.dumps(links,ensure_ascii=False)))
    if args.apply:
        if missing:
            values=[]
            for order,page in enumerate(missing):values.extend([page['slug'],page['title'],page['content'],page['meta_description'],order])
            query('INSERT INTO pages(slug,title,content,meta_description,sort_order,is_published) VALUES '+','.join('(?,?,?,?,?,1)' for _ in missing)+' ON CONFLICT(slug) DO NOTHING',values)
        for row,updated in changes:
            query("UPDATE site_settings SET setting_value=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE setting_key=? AND setting_value=?",[updated,row['setting_key'],row['setting_value']])
    print(json.dumps({'applied':args.apply,'new_pages':len(missing),'footer_groups':len(changes),'slugs':[page['slug'] for page in pages]}))

if __name__=='__main__':main()
