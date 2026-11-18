#!/usr/bin/env python3
"""Write the voice-over recording script with timings: out/narration_script.md"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = json.load(open(os.path.join(ROOT, "script", "narration.json"), encoding="utf-8"))
tl = {x["id"]: x for x in json.load(open(os.path.join(ROOT, "build", "timeline.json")))["scenes"]}
f = lambda x: f"{int(x // 60):02d}:{x % 60:05.2f}"
out = ["# نص التعليق الصوتي بالتوقيت", "",
       "سجّل كل سطر في ملف مستقل باسم المعرّف (مثل `c3.wav`). العمود «الموعد» توقيت السطر في الفيلم الحالي؛",
       "عند استخدام تسجيل بشري يُعاد توقيت الحركة تلقائيًا على طول تسجيلك.", ""]
for sc in s["scenes"]:
    t = tl.get(sc["id"])
    if not t: continue
    out.append(f"## {sc['id']} — الشرائح: {', '.join(map(str, sc.get('slides', []))) or 'مقدمة'} — يبدأ {f(t['start'])} — المدة {t['duration']:.1f} ث")
    out.append("")
    out.append("| المعرّف | الموعد | المدة | النص (للقراءة) | النطق المعتمد |")
    out.append("|---|---|---|---|---|")
    for ln in sc["lines"]:
        c = t["cues"][ln["id"]]
        out.append(f"| {ln['id']} | {f(t['start'] + c['start'])} | {c['end'] - c['start']:.1f} ث | {ln['text']} | {ln['tts']} |")
    out.append("")
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
open(os.path.join(ROOT, "out", "narration_script.md"), "w", encoding="utf-8").write("\n".join(out))
print("wrote out/narration_script.md")
