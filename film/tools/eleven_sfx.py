#!/usr/bin/env python3
"""Generate the recorded-style sound effects with ElevenLabs sound generation -> assets/sfx/<name>.wav
tools/mix_audio.py uses assets/sfx/<name>.wav when it exists, otherwise its procedural fallback.
Usage: python3 tools/eleven_sfx.py [--only name1,name2] [--force]
"""
import argparse, json, os, subprocess, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "sfx"); os.makedirs(OUT, exist_ok=True)
KEY = os.environ.get("ELEVEN_API_KEY", "proxy-injected")
CLEAN = ", isolated sound effect, clean, no music, no voices"
SFX = {
    "thread":        ("steel hex nut spinning down a threaded bolt by hand, metallic thread friction, close-up" + CLEAN, 2.5),
    "ratchet":       ("ratchet wrench tightening a steel bolt, four quick crisp ratchet clicks, close-up" + CLEAN, 1.6),
    "clink":         ("steel spanner wrench seated onto a hex bolt head, single light metallic clink" + CLEAN, 1.0),
    "torque_click":  ("click-type torque wrench reaching its set torque, one sharp loud mechanical click" + CLEAN, 0.8),
    "knock":         ("single dull knock of a small steel bracket shifting on a machine frame" + CLEAN, 0.8),
    "contact":       ("tiny metallic tick, steel caliper jaws touching a bolt thread" + CLEAN, 0.5),
    "slide":         ("digital caliper slider gliding along its steel beam, soft smooth friction" + CLEAN, 1.6),
    "whoosh":        ("soft subtle airy whoosh transition, short" + CLEAN, 1.0),
    "stamp":         ("single press of a metal stamping punch, solid thud" + CLEAN, 0.8),
    "rattle":        ("loose bolt and nut rattling on a vibrating machine plate, metallic buzzing rattle" + CLEAN, 4.0),
    "rivet":         ("hand pop rivet gun squeezing then the rivet mandrel snapping" + CLEAN, 1.4),
    "drop":          ("small steel bolt dropped onto a steel workbench, bounces twice" + CLEAN, 1.2),
    "tick":          ("short soft electronic sensor beep" + CLEAN, 0.5),
    "line_ambience": ("bottle filling production line ambience, conveyor belt running, plastic bottles gently clattering, steady machine hum, no voices, no music", 20.0),
    "factory_bed":   ("quiet industrial maintenance workshop room tone, distant machinery hum, very soft and steady, no voices, no music", 20.0),
}
ap = argparse.ArgumentParser(); ap.add_argument("--only"); ap.add_argument("--force", action="store_true")
args = ap.parse_args()
for name, (prompt, dur) in SFX.items():
    if args.only and name not in args.only.split(","): continue
    out = os.path.join(OUT, name + ".wav")
    if os.path.exists(out) and not args.force: continue
    body = {"text": prompt, "duration_seconds": dur, "prompt_influence": 0.6}
    if dur >= 10: body["loop"] = True
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    try:
        mp3 = urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        if e.code == 422 and "loop" in body:
            body.pop("loop"); req.data = json.dumps(body).encode(); mp3 = urllib.request.urlopen(req, timeout=180).read()
        else:
            raise SystemExit(f"{name}: HTTP {e.code} {e.read()[:300]}")
    tmp = out + ".mp3"; open(tmp, "wb").write(mp3)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-ar", "48000", out], check=True); os.remove(tmp)
    print("ok", name, dur, "s", flush=True)
