# Fasteners & Structures: Arabic animated training film (P&G)

An animated training film in Arabic, built from `Festeners_Training_NEW.pptx` (62 slides).
It is made with three.js 3D scenes. Each frame is rendered in headless Chromium and encoded with ffmpeg.
Output: 1920×1080, 16:9, 30 fps, H.264 + AAC, with an Arabic subtitle track you can switch on or off.

## Pipeline

```
script/narration.json ──► tools/build_audio.py ──► build/narration.wav + timeline.json + subtitles_ar.srt
                                                        │ (cue time of every narration line)
src/scenes/*.js (animation keyed to those cues) ──► tools/render.js ──► build/video.mp4 + build/sfx.json
build/narration.wav + sfx.json ──► tools/mix_audio.py ──► build/mix.wav (+ separate voice and SFX stems)
video + mix + srt ──► tools/mux.sh ──► out/film.mp4 (+ out/film.ar.srt)
```

* Every animation beat is tied to the start or end of a narration line. If a line's timing changes (a human
  voice-over, for example), the whole film re-times itself on the next render.
* `script/narration.json` keeps two texts per line:
  * `text`: what appears in the subtitles, with the correct technical symbols (M10, 9.85 مم, 17 مم).
  * `tts`: the spoken form. Numbers are written out in words, terms are diacritized, and words end in pausal form (no case endings).

## Commands

```bash
npm install                                   # three.js + IBM Plex Sans Arabic
pip install piper-tts sherpa-onnx soundfile scipy numpy
# models (not in git): models/ar_JO-kareem-medium/ and models/sherpa-onnx-whisper-small/
#   https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-kareem-medium.tar.bz2
#   https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
python3 tools/build_audio.py --asr            # TTS + timeline + subtitles (+ Whisper round-trip pronunciation report)
node tools/render.js                          # frames → build/video.mp4  (~0.37 s/frame on 4 CPU cores, software WebGL)
python3 tools/mix_audio.py                    # voice mastering + SFX + loudness −16 LUFS
bash tools/mux.sh build/video.mp4 out/film.mp4
node tools/render.js --stills 5,12.5          # quick PNG checks
```

## Replacing the synthetic voice with a human narrator

1. Record each line in `script/narration.json` (the `text` field). Save it as `build/vo/<id>.wav`, e.g. `build/vo/c3.wav`.
2. `python3 tools/build_audio.py --human`: the timeline, subtitles and every animation beat re-sync to the recorded takes.
3. Run `render.js`, `mix_audio.py` and `mux.sh` again.

`build/narration_processed.wav` (voice only) and `build/sfx_stem.wav` (effects only) are exported as separate stems.
