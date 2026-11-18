#!/usr/bin/env python3
"""Synthesize the Arabic narration line by line, lay it out on a timeline,
and write:  build/narration.wav (48 kHz mono, unprocessed)
            build/timeline.json (scene starts/durations + cue times per line)
            build/subtitles_ar.srt
Usage: python3 tools/build_audio.py [--scenes id1,id2] [--asr]
The narrator track stays separate so a human voice-over can replace it:
record each line, drop it as build/vo/<line_id>.wav and run with --human.
"""
import json, os, sys, wave, io, argparse
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
SR = 48000

ap = argparse.ArgumentParser()
ap.add_argument("--scenes", default="")
ap.add_argument("--human", action="store_true", help="use build/vo/<id>.wav instead of TTS")
ap.add_argument("--asr", action="store_true", help="round-trip every line through Whisper and report")
args = ap.parse_args()

script = json.load(open(os.path.join(ROOT, "script", "narration.json"), encoding="utf-8"))
want = [s for s in args.scenes.split(",") if s]
scenes = [s for s in script["scenes"] if not want or s["id"] in want]
os.makedirs(os.path.join(BUILD, "lines"), exist_ok=True)

voice = None
def tts(text, ls):
    global voice
    from piper import PiperVoice, SynthesisConfig
    if voice is None:
        model = os.environ.get("VOICE_MODEL", os.path.join(ROOT, "models", "ar_JO-kareem-medium", "ar_JO-kareem-medium.onnx"))
        voice = PiperVoice.load(model)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.75))
    buf.seek(0)
    with wave.open(buf) as r:
        sr = r.getframerate(); a = np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a, sr

def load_wav(p):
    import soundfile as sf
    a, sr = sf.read(p, dtype="float32")
    if a.ndim > 1: a = a.mean(1)
    return a, sr

def resample(a, sr):
    if sr == SR: return a
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr, SR)
    return resample_poly(a, SR // g, sr // g).astype(np.float32)

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    s = max(0, idx[0] - int(0.02 * SR)); e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

timeline = {"fps": 30, "scenes": []}
track = []
t = 0.0
srt = []
for sc in scenes:
    start = t
    cur = sc.get("lead", 0.5)
    cues = {}
    for ln in sc["lines"]:
        ls = ln.get("length_scale", script.get("default_length_scale", 1.0))
        if args.human:
            a, sr = load_wav(os.path.join(BUILD, "vo", ln["id"] + ".wav"))
        else:
            a, sr = tts(ln["tts"], ls)
        a = trim(resample(a, sr))
        import soundfile as sf
        sf.write(os.path.join(BUILD, "lines", ln["id"] + ".wav"), a, SR)
        d = len(a) / SR
        cues[ln["id"]] = {"start": round(cur, 3), "end": round(cur + d, 3)}
        track.append((start + cur, a))
        srt.append((start + cur, start + cur + d, ln["text"]))
        cur += d + ln.get("pause", 0.6)
    dur = max(sc.get("min_duration", 0), cur - (sc["lines"][-1].get("pause", 0.6) if sc["lines"] else 0) + sc.get("tail", 0.8))
    timeline["scenes"].append({"id": sc["id"], "slides": sc.get("slides", []), "start": round(start, 3), "duration": round(dur, 3), "cues": cues})
    t = start + dur

timeline["duration"] = round(t, 3)
out = np.zeros(int(t * SR) + SR, dtype=np.float32)
for st, a in track:
    i = int(st * SR); out[i:i + len(a)] += a
import soundfile as sf
sf.write(os.path.join(BUILD, "narration.wav"), out, SR)
json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
with open(os.path.join(BUILD, "subtitles_ar.srt"), "w", encoding="utf-8") as f:
    for i, (a, b, txt) in enumerate(srt, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b + 0.25)}\n{txt}\n\n")
print(f"timeline {t:.2f}s, {len(srt)} lines")

if args.asr:
    import sherpa_onnx
    d = os.environ.get("ASR_DIR", os.path.join(ROOT, "models", "sherpa-onnx-whisper-small"))
    r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx", decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language="ar", task="transcribe", num_threads=4)
    rep = []
    for sc in scenes:
        for ln in sc["lines"]:
            a, _ = load_wav(os.path.join(BUILD, "lines", ln["id"] + ".wav"))
            s = r.create_stream(); s.accept_waveform(SR, a); r.decode_stream(s)
            rep.append(f"{ln['id']}\n  script: {ln['text']}\n  heard : {s.result.text}")
    open(os.path.join(BUILD, "asr_report.txt"), "w", encoding="utf-8").write("\n".join(rep))
    print("\n".join(rep))
