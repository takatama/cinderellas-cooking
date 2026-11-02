#!/usr/bin/env python3
"""Check dimensions, lossless visible pixels, hash paths and source/config coverage."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops
ROOT=Path(__file__).resolve().parents[1]
text=(ROOT/'dist/asset-manifest.js').read_text()
manifest=json.loads(text.split('const manifest=',1)[1].split(';\nroot.AssetManifest',1)[0])
config=json.loads((ROOT/'artwork/assets.json').read_text())
assert set(manifest)==set(config)
for filename,entry in manifest.items():
    path=ROOT/'dist'/entry['src']
    assert hashlib.sha256(path.read_bytes()).hexdigest()[:16] in path.name
    assert path.stat().st_size==entry['bytes']
    with Image.open(ROOT/'artwork/originals'/filename) as original, Image.open(path) as delivered:
        assert original.size==delivered.size==(entry['width'],entry['height']),filename
        a,b=original.convert('RGBA'),delivered.convert('RGBA')
        assert ImageChops.difference(a.getchannel('A'),b.getchannel('A')).getbbox() is None,filename
        for color in ['black','white']:
            background=Image.new('RGBA',a.size,color)
            diff=ImageChops.difference(Image.alpha_composite(background,a).convert('RGB'),Image.alpha_composite(background,b).convert('RGB'))
            assert diff.getbbox() is None,filename+' visible pixels changed'
    if entry.get('small'):
        with Image.open(ROOT/'dist'/entry['small']['src']) as small:
            assert small.width==768 and abs(small.width/small.height-entry['width']/entry['height'])<.002
print(f'PASS {len(manifest)} full-size images: dimensions, alpha and visible pixels unchanged; hashes and responsive sizes valid')
