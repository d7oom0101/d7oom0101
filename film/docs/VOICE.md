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
