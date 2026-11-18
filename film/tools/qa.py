#!/usr/bin/env python3
"""QA: render stills at the middle of every narration line of the given scenes and tile them.
usage: python3 tools/qa.py scene1,scene2 out.jpg"""
import json, sys, subprocess, os
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ids = sys.argv[1].split(','); out = sys.argv[2]
tl = json.load(open(os.path.join(ROOT, 'build/timeline.json')))
ts = []
for sc in tl['scenes']:
    if sc['id'] not in ids: continue
    for k, c in sc['cues'].items(): ts.append((round(sc['start'] + (c['start'] + c['end']) / 2, 2), f"{sc['id']}:{k}"))
r = subprocess.run(['node', os.path.join(ROOT, 'tools/render.js'), '--stills', ','.join(str(t) for t, _ in ts)], capture_output=True, text=True, cwd=ROOT)
errs = [l for l in (r.stdout + r.stderr).splitlines() if 'error' in l.lower() and 'GL Driver' not in l]
print('\n'.join(errs[:10]))
w, h = 640, 360; cols = 3
S = Image.new('RGB', (w * cols, h * ((len(ts) + cols - 1) // cols)), 'black')
for i, (t, name) in enumerate(ts):
    im = Image.open(os.path.join(ROOT, f'build/stills/t_{t:.2f}.png')).convert('RGB').resize((w, h))
    ImageDraw.Draw(im).text((6, 6), name, fill='red'); S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(out, quality=85); print(out, len(ts))
