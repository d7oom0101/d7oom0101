#!/usr/bin/env bash
# Combine rendered video + mixed audio + toggleable Arabic subtitle track.
#   bash tools/mux.sh [video] [out]
set -euo pipefail
cd "$(dirname "$0")/.."
VID=${1:-build/video.mp4}
OUT=${2:-out/film.mp4}
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error -i "$VID" -i build/mix.wav -i build/subtitles_ar.srt \
  -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 192k -c:s mov_text \
  -metadata:s:s:0 language=ara -metadata:s:s:0 title="العربية" -metadata:s:a:0 language=ara \
  -disposition:s:0 0 -movflags +faststart -t "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VID")" "$OUT"
cp build/subtitles_ar.srt "${OUT%.mp4}.ar.srt"
echo "wrote $OUT"
