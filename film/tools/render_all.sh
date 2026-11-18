#!/usr/bin/env bash
# Render the whole film in N sequential chunks (resumable), concat, mix audio, mux.
set -euo pipefail
cd "$(dirname "$0")/.."
N=${N:-12}
for k in $(seq 1 $N); do
  if [ -s build/part_$k.mp4 ] && [ -f build/part_$k.done ]; then echo "part $k done"; continue; fi
  node tools/render.js --part $k/$N > build/render_part_$k.log 2>&1
  touch build/part_$k.done; echo "part $k/$N rendered"
done
: > build/parts.txt; for k in $(seq 1 $N); do echo "file 'part_$k.mp4'" >> build/parts.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i build/parts.txt -c copy build/video.mp4
python3 tools/mix_audio.py
python3 tools/export_script.py
bash tools/mux.sh build/video.mp4 out/fasteners_training_ar.mp4
echo ALL_DONE
