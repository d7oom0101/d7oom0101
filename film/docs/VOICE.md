# Narration: replacing the synthetic guide voice with a human voice

The film's timing currently comes from a synthetic voice (Piper / ar_JO-kareem). It is a **timing guide only**.
The narrator is a separate track (`build/narration_processed.wav`), and every animation beat is tied to the start or end of a line.

## Option A: a human voice-over artist (recommended)
1. Give the narrator `out/narration_script.md`. It has every line with its ID, its current time, and the approved pronunciation.
2. Record each line as its own file named after the ID: `build/vo/o1.wav`, `build/vo/c3.wav` … (48 kHz or 44.1 kHz, mono).
3. Run:
   ```bash
   python3 tools/build_audio.py --human     # rebuilds the timeline from the recorded durations
   N=12 bash tools/render_all.sh            # re-renders the frames on the new timing, mixes and muxes
   ```
   The animation re-syncs to the recordings on its own (the click with "النقرة", the jaws touching with "القمم", and so on).

## Option B: a commercial human-like Arabic voice (ElevenLabs / Azure Speech ar-SA)
Allow the service's host in the session's network and save its API key as a credential, without pasting the key in chat.
Then replace the `tts()` function in `tools/build_audio.py` with the service call and run the same pipeline as above.

## Current narration: ElevenLabs — Mazen Lawand (Deep & Professional), model eleven_v3
Earlier version: Raed Alotaibi (Saudi, Najdi), eleven_multilingual_v2 — kept in `assets/vo_raed/` (build with `VO_SET=vo_raed`).

### Raed (previous)
- Voice ID `lBgZD85rJJVmqahd7yzK`, model `eleven_multilingual_v2`, chosen by the client from five samples (`preview/voices/`).
- Generate: `python3 tools/eleven_vo.py` → `build/vo/<id>.wav` (only missing lines; `--only id1,id2 --force` regenerates a line after editing its text).
  The key is injected by the session proxy; elsewhere set `ELEVEN_API_KEY`.
- A compressed copy of every generated line is committed in `assets/vo_raed/` so the film can be rebuilt without spending credits:
  `python3 tools/build_audio.py --human` falls back to those files.
- Sound effects: `python3 tools/eleven_sfx.py` → `assets/sfx/*.wav` (recorded-style effects + factory/line ambience beds).
  `tools/mix_audio.py` uses them and falls back to its procedural sounds if a file is missing.
