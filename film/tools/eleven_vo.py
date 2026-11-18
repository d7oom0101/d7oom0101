#!/usr/bin/env python3
"""Generate the narration with ElevenLabs, one file per line -> build/vo/<id>.wav
Then run: python3 tools/build_audio.py --human

The API key is never stored here: the session's network proxy injects it for api.elevenlabs.io.
To run elsewhere, set ELEVEN_API_KEY.
Usage: python3 tools/eleven_vo.py [--only id1,id2] [--force]
"""
import argparse, json, os, re, subprocess, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "build", "vo"); os.makedirs(VO, exist_ok=True)
VOICE = os.environ.get("ELEVEN_VOICE", "lBgZD85rJJVmqahd7yzK")   # Raed Alotaibi — Saudi Najdi narrator
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2")
KEY = os.environ.get("ELEVEN_API_KEY", "proxy-injected")
SETTINGS = {"stability": 0.55, "similarity_boost": 0.8, "style": 0.1, "use_speaker_boost": True, "speed": 1.0}

ap = argparse.ArgumentParser(); ap.add_argument("--only"); ap.add_argument("--force", action="store_true")
args = ap.parse_args()

DIAC = re.compile("[ً-ِْٰ]")   # strip harakat, keep shadda (ّ)
def spoken(ln):
    t = ln.get("el") or DIAC.sub("", ln["tts"])
    return t.replace("…", "،").replace("...", "،").strip()

script = json.load(open(os.path.join(ROOT, "script", "narration.json"), encoding="utf-8"))
lines = [ln for sc in script["scenes"] for ln in sc["lines"]]
only = set(args.only.split(",")) if args.only else None
used = 0
for i, ln in enumerate(lines):
    if only and ln["id"] not in only: continue
    out = os.path.join(VO, ln["id"] + ".wav")
    if os.path.exists(out) and not args.force: continue
    body = {"text": spoken(ln), "model_id": MODEL, "voice_settings": SETTINGS,
            "previous_text": spoken(lines[i - 1]) if i else None,
            "next_text": spoken(lines[i + 1]) if i + 1 < len(lines) else None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            mp3 = urllib.request.urlopen(req, timeout=120).read(); break
        except urllib.error.HTTPError as e:
            msg = e.read()[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3: time.sleep(5 * (attempt + 1)); continue
            raise SystemExit(f"{ln['id']}: HTTP {e.code} {msg}")
    tmp = out + ".mp3"; open(tmp, "wb").write(mp3)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-ar", "48000", out], check=True)
    os.remove(tmp); used += len(body["text"])
    print(f"{ln['id']:>5}  {len(body['text']):4d} chars  {body['text'][:60]}", flush=True)
print("characters sent:", used)
