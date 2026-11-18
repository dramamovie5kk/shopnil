"""Create responsive WebP copies in R2 without replacing originals. Dry run by default."""
import argparse
import io
import json
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote
from PIL import Image, ImageOps
import os
import urllib.request
from cloudflare_setup import ACCOUNT

def http(path, method='GET', data=None, headers=None):
    token=os.environ['CLOUDFLARE_API_TOKEN']
    request=urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/'+ACCOUNT+path,method=method,data=data,headers={'Authorization':'Bearer '+token,**(headers or {})})
    with urllib.request.urlopen(request,timeout=90) as response:
        return response.read(),dict(response.headers)

WIDTHS = (384, 960, 1600)

def optimize(row, apply):
    key = row['key']
    if '.responsive-' in key or not key.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif')):
        return None
    path = '/r2/buckets/shopnil/objects/' + quote(key, safe='')
    raw, _ = http(path)
    with Image.open(io.BytesIO(raw)) as source:
        if getattr(source, 'is_animated', False): return None
        image = ImageOps.exif_transpose(source).convert('RGBA' if source.mode in ('RGBA', 'LA', 'P') else 'RGB')
        sizes = []
        for width in WIDTHS:
            thumb = image.copy()
            thumb.thumbnail((width, width), Image.Resampling.LANCZOS)
            output = io.BytesIO(); thumb.save(output, 'WEBP', quality=82, method=6)
            data = output.getvalue(); sizes.append(len(data))
            if apply:
                http('/r2/buckets/shopnil/objects/' + quote(f'{key}.responsive-{width}.webp', safe=''), 'PUT', data, {'Content-Type': 'image/webp'})
        return {'key': key, 'original': len(raw), 'variants': sizes}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--apply', action='store_true'); args = parser.parse_args()
    rows = json.loads(http('/r2/buckets/shopnil/objects?per_page=1000')[0])['result']
    if len(rows) >= 1000: raise RuntimeError('Use pagination before optimizing a catalog of 1000+ objects')
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = [r for r in pool.map(lambda row: optimize(row, args.apply), rows) if r]
    print(json.dumps({'applied': args.apply, 'images': len(results), 'original_bytes': sum(r['original'] for r in results), 'card_bytes': sum(r['variants'][0] for r in results), 'detail_bytes': sum(r['variants'][1] for r in results)}))
