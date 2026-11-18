#!/usr/bin/env python3
"""Mix narration + procedurally generated sound effects.
Inputs : build/narration.wav, build/sfx.json (written by tools/render.js)
Outputs: build/narration_processed.wav (voice only, mastered — the separate narrator stem)
         build/sfx_stem.wav             (effects only)
         build/mix.wav                  (final stereo mix, -16 LUFS)
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
SR = 48000
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n - na, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** 2; return e
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def t_(d): return np.arange(int(d * SR)) / SR

def s_tick(**_):   # sensor detection beep, soft
    t = t_(0.09); return 0.35 * np.sin(2 * np.pi * 2350 * t) * env(len(t), 0.003, 0.06)
def s_knock(**_):  # small mechanical slip
    t = t_(0.35); x = rng.standard_normal(len(t)) * np.exp(-t * 30); x = lp(x, 900) * 2.2
    return x + 0.5 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 18)
def s_whoosh(**_):
    t = t_(0.6); n = rng.standard_normal(len(t)); out = np.zeros_like(n)
    for i, (a, b) in enumerate(zip(np.linspace(300, 2400, 6), np.linspace(900, 5200, 6))):
        seg = slice(i * len(t) // 6, (i + 1) * len(t) // 6); out[seg] = bp(n, a, b)[seg]
    return 0.5 * out * np.sin(np.pi * t / t[-1]) ** 2
def s_slide(dur=1.5, **_):  # caliper slider friction
    t = t_(max(0.2, dur)); n = bp(rng.standard_normal(len(t)), 1800, 6000)
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t)); spd = np.clip(1 - t / t[-1], 0, 1) ** 0.6
    return 0.22 * n * am * spd * env(len(t), 0.05, 0.08)
def s_contact(**_):  # light metallic tick when jaws touch the crests
    t = t_(0.25); x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(3150, .5, 45), (5230, .3, 60), (7410, .2, 80)])
    return 0.6 * x
def s_pop(**_):
    t = t_(0.12); f = np.linspace(700, 1150, len(t)); return 0.18 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.08)
def s_stamp(**_):
    t = t_(0.25); return 0.5 * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 20) + 0.1 * lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 40)
def s_clink(**_):   # spanner seating on the hex
    t = t_(0.5); x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(1870, .45, 14), (2960, .3, 18), (4410, .2, 25), (6120, .1, 30)])
    return 0.55 * x
def s_chime(**_):
    t = t_(1.6); x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(784, .4, 2.5), (1175, .25, 3), (1568, .15, 4)])
    return 0.3 * x * env(len(t), 0.01, 0.6)
def s_torque_click(**_):  # reserved for the torque-wrench scene
    t = t_(0.18); x = rng.standard_normal(len(t)) * np.exp(-t * 90); return 0.9 * hp(x, 1500) + 0.4 * np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 70)
def s_line_ambience(dur=10, **_):  # filling-line bed: low motor hum + belt hiss + soft rhythmic clatter
    t = t_(dur); hum = 0.05 * np.sin(2 * np.pi * 100 * t) + 0.03 * np.sin(2 * np.pi * 200 * t + 1)
    hiss = 0.05 * bp(rng.standard_normal(len(t)), 200, 1600)
    clat = np.zeros(len(t)); per = int(SR * 190 / 240)
    for i in range(0, len(t), per):
        k = min(len(t) - i, int(0.06 * SR)); clat[i:i + k] += rng.standard_normal(k) * np.exp(-np.arange(k) / SR * 70) * 0.05
    clat = bp(clat, 1500, 5000)
    return (hum + hiss + clat) * env(len(t), 0.6, 1.0)

FX = {k[2:]: v for k, v in globals().items() if k.startswith("s_")}

def master_voice(src, dst):
    # gentle clean-up chain: rumble cut, warmth, presence, de-ess, soft compression
    af = ("highpass=f=75,equalizer=f=170:t=q:w=1.0:g=1.8,equalizer=f=3200:t=q:w=1.2:g=2.2,"
          "equalizer=f=7200:t=q:w=2:g=-2.5,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", str(SR), dst], check=True)

if __name__ == "__main__":
    voice_raw = os.path.join(B, "narration.wav")
    voice_p = os.path.join(B, "narration_processed.wav")
    master_voice(voice_raw, voice_p)
    v, _ = sf.read(voice_p, dtype="float32")
    if v.ndim > 1: v = v.mean(1)
    timeline = json.load(open(os.path.join(B, "timeline.json")))
    n = int(timeline["duration"] * SR) + SR
    v = np.pad(v, (0, max(0, n - len(v))))[:n]
    fx = np.zeros(n, dtype=np.float32)
    for e in json.load(open(os.path.join(B, "sfx.json"))):
        a = FX[e["name"]](dur=e.get("dur", 1.0)).astype(np.float32) * e.get("gain", 0.5)
        i = int(e["t"] * SR); a = a[: max(0, n - i)]; fx[i:i + len(a)] += a
    # duck effects a little under the voice
    venv = np.convolve(np.abs(v), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
    duck = 1 - 0.45 * np.clip(venv / (venv.max() + 1e-9) * 4, 0, 1)
    fx *= duck
    sf.write(os.path.join(B, "sfx_stem.wav"), fx, SR)
    mix = v * 1.0 + fx * 0.8
    stereo = np.stack([mix, mix], 1)
    tmp = os.path.join(B, "mix_pre.wav"); sf.write(tmp, stereo, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(SR), os.path.join(B, "mix.wav")], check=True)
    print("mix ok", timeline["duration"], "s")
