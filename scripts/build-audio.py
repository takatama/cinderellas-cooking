#!/usr/bin/env python3
"""Build the game's licensed audio from verified local originals (ffmpeg required)."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
records = {r['source']['id']: r for r in json.loads(
    (ROOT / 'docs/audio-measurements.json').read_text())['records']}
# id: (maximum duration, gain in dB). Preserve originals, omit unreviewed cooking sounds.
plans = {'wish5-harp': (None, -11.91), 'choose': (0.32, -9),
         'success': (4, -6.66), 'other-dish': (3, -2.75),
         'opening': (5, -8.66), 'ending': (None, -5.44)}
out = ROOT / 'dist/audio'
out.mkdir(exist_ok=True)
credits = []
for id, (duration, gain) in plans.items():
    source = ROOT / '.audio-cache' / (id + '.mp3')
    record = records[id]
    if hashlib.sha256(source.read_bytes()).hexdigest() != record['sha256']:
        raise ValueError('Source hash mismatch: ' + id)
    length = min(duration or 10000, float(record['media']['format']['duration']))
    fade = 0.06 if id == 'choose' else 0.35
    filters = f'volume={gain}dB,afade=t=in:d=0.01,afade=t=out:st={length-fade:.4f}:d={fade}'
    command = ['ffmpeg', '-v', 'error', '-y', '-i', str(source)]
    if duration:
        command += ['-t', str(duration)]
    command += ['-map_metadata', '-1', '-af', filters, '-codec:a', 'libmp3lame',
                '-b:a', '128k', str(out / (id + '.mp3'))]
    subprocess.run(command, check=True)
    credits.append({'id': id, 'source': record['source'], 'sourceSha256': record['sha256'],
                    'file': id + '.mp3', 'gainDB': gain, 'maxSeconds': duration,
                    'changes': 'Static attenuation, edge fades, optional shortening, MP3 re-encoding',
                    'sha256': hashlib.sha256((out / (id + '.mp3')).read_bytes()).hexdigest()})
(out / 'sources.json').write_text(json.dumps(credits, ensure_ascii=False, indent=2) + '\n')
print('Built 6 audio files with source hashes and processing records')
