#!/usr/bin/env python3
"""Reproducible lossless WebP delivery; source art is never overwritten.
Requires Pillow (see requirements-assets.txt). Runtime remains dependency-free.
"""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'artwork/originals'
OUTPUT = ROOT / 'dist/assets'


def encoded(image):
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP', lossless=True, exact=True, method=6)
    return buffer.getvalue()


def build():
    OUTPUT.mkdir(exist_ok=True)
    config = json.loads((ROOT / 'artwork/assets.json').read_text())
    manifest, retained = {}, set()
    original_bytes = 0
    for filename, settings in config.items():
        source = SOURCE / filename
        original_bytes += source.stat().st_size
        with Image.open(source) as image:
            image.load()
            content = source.read_bytes() if source.suffix == '.webp' else encoded(image)
            name = f'{source.stem}.{hashlib.sha256(content).hexdigest()[:16]}.webp'
            (OUTPUT / name).write_bytes(content)
            retained.add(name)
            entry = dict(src='assets/' + name, width=image.width, height=image.height,
                         bytes=len(content))
            if settings.get('responsive') and image.width > 768:
                # Only opaque background layers get a smaller delivery variant.
                small = image.resize((768, round(image.height * 768 / image.width)), Image.Resampling.LANCZOS)
                small_content = encoded(small)
                small_name = f'{source.stem}-768.{hashlib.sha256(small_content).hexdigest()[:16]}.webp'
                (OUTPUT / small_name).write_bytes(small_content)
                retained.add(small_name)
                entry['small'] = dict(src='assets/' + small_name, width=small.width, bytes=len(small_content))
            manifest[filename] = entry
    # This directory is generated; prune stale content hashes only after encoding succeeded.
    for stale in OUTPUT.glob('*.webp'):
        if stale.name not in retained:
            stale.unlink()
    js = "(function(root){\n'use strict';\nconst manifest=" + json.dumps(manifest, ensure_ascii=False, indent=2)
    js += ";\nroot.AssetManifest=manifest;\nif(typeof module!=='undefined')module.exports=manifest;\n})(typeof window!=='undefined'?window:globalThis);\n"
    (ROOT / 'dist/asset-manifest.js').write_text(js)
    # HTML owns only the two critical intro images. Others are requested by scene.
    html_path = ROOT / 'dist/index.html'
    import re
    html = html_path.read_text()
    def critical(match):
        tag = match.group(0)
        logical = re.search(r'data-asset="([^"]+)"', tag).group(1)
        entry = manifest[logical]
        tag = re.sub(r' src="[^"]*"', '', tag)
        tag = re.sub(r' srcset="[^"]*"', '', tag)
        tag = re.sub(r' sizes="[^"]*"', '', tag)
        tag = tag[:-1] + ' src="' + entry['src'] + '"'
        if 'small' in entry:
            tag += ' srcset="' + entry['small']['src'] + ' 768w, ' + entry['src'] + ' ' + str(entry['width']) + 'w" sizes="(max-width: 760px) 100vw, 1100px"'
        return tag + '>'
    html = re.sub(r'<img\b[^>]*data-asset="[^"]+"[^>]*>', critical, html)
    html_path.write_text(html)
    full_bytes = sum(e['bytes'] for e in manifest.values())
    print(f'{len(manifest)} images: {original_bytes:,} -> {full_bytes:,} bytes ({(1-full_bytes/original_bytes)*100:.1f}% smaller); responsive variants separate')


if __name__ == '__main__':
    build()
