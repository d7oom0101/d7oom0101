// Slides 14-15: metric property classes; reading 4.8 (tensile 400 N/mm², yield 320 N/mm²)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, easeBack, lerp, hexGeometry, castAll, trackify, el, place } from '../engine.js';
import * as K from '../kit.js';

const CL = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9'];
function head(text, sub) {
  const g = new THREE.Group(); const m = K.M.zinc();
  const h = new THREE.Mesh(hexGeometry(17, 7, 0.5), m); g.add(h);
  const st = K.headStamp(17, { text, sub }); st.position.y = 7.05; g.add(st);
  castAll(g); g.userData.mat = m; return g;
}
export default function classes(ctx) {
  const D = stage(ctx, { target: v3(0, 5, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('صلابة براغي الفولاذ المتري', 'Hardness of metric tempered steel bolts');
  D.chip([14, 15]);
  const row = CL.map((c, i) => { const h = head(c); h.position.x = -117 + i * 26; D.add(h); return h; });
  D.track(row[6].userData.mat, s('k3') - 0.1, s('k4') - 0.2);
  const big = K.displayBolt({ d: 12, L: 30, s: 19, k: 7.5, stamp: { text: '8.8', sub: 'JD' } }); big.position.set(0, -45, 0); D.add(big);
  const bigStampMats = []; big.traverse(o => { if (o.material) { o.material = o.material.clone(); bigStampMats.push(o.material); } });
  const grad = D.card('<div style="display:flex;align-items:center;gap:20px;direction:ltr"><span style="font:600 32px Plex;color:#5C6E8A">أقل صلابة</span><svg width="900" height="30"><defs><linearGradient id="g1"><stop offset="0" stop-color="#BFD6F2"/><stop offset="1" stop-color="#003DA5"/></linearGradient></defs><path d="M0 9 H870 L870 0 L900 15 L870 30 L870 21 H0 Z" fill="url(#g1)"/></svg><span style="font:600 32px Plex;color:#003DA5">أعلى صلابة</span></div>', 960, 760, s('k2') + 0.8, s('k4') - 0.2, 'big');
  D.label('الحد الأدنى المطلوب', [row[6], v3(0, 8, 0)], [0, -150], s('k3') + 0.2, s('k4') - 0.2, { track: true });
  // quiz: 2-second countdown ring then reveal
  const ring = el('big', '<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" fill="#fff" stroke="#DCE6F2" stroke-width="12"/><circle class="arc" cx="65" cy="65" r="54" fill="none" stroke="#FF7A00" stroke-width="12" stroke-dasharray="339" stroke-dashoffset="0" transform="rotate(-90 65 65)"/><text x="65" y="80" text-anchor="middle" font-family="Plex" font-weight="700" font-size="44" fill="#10213F">؟</text></svg>');
  const ans = el('card', '<div style="font:700 92px PlexLatin;color:#B54F00">8.8</div><div style="font:600 34px Plex;color:#10213F">على الحد الأدنى بالضبط</div>');
  // 4.8 breakdown
  const calc = el('card', `<div style="display:flex;gap:60px;align-items:flex-start;direction:ltr">
    <div style="text-align:center"><div style="font:700 120px PlexLatin;color:#003DA5" class="d1">4</div><div class="c1" style="font:600 40px PlexLatin;color:#10213F">4 × 100 = 400 N/mm²</div><div class="c1b" style="font:600 32px Plex;color:#5C6E8A;direction:rtl">أقصى قوة شد قبل الكسر</div></div>
    <div style="font:700 120px PlexLatin;color:#10213F">.</div>
    <div style="text-align:center"><div style="font:700 120px PlexLatin;color:#FF7A00" class="d2">8</div><div class="c2" style="font:600 40px PlexLatin;color:#10213F">8 × 10 = 80%</div><div class="c2b" style="font:600 40px PlexLatin;color:#B54F00">400 × 80% = 320 N/mm²</div><div class="c2c" style="font:600 32px Plex;color:#5C6E8A;direction:rtl">بعدها تشوّه دائم</div></div></div>`);
  // stress-strain sketch
  const graph = el('big', `<svg width="520" height="330" viewBox="0 0 520 330"><rect width="520" height="330" rx="22" fill="#fff"/>
    <path d="M60 290 H490 M60 290 V30" stroke="#10213F" stroke-width="4"/><text x="490" y="318" font-family="Plex" font-size="22" text-anchor="end" fill="#5C6E8A">الاستطالة</text><text x="72" y="42" font-family="Plex" font-size="22" fill="#5C6E8A">الإجهاد</text>
    <path class="curve" d="M60 290 L200 110 Q300 60 380 80 L420 120" fill="none" stroke="#003DA5" stroke-width="6" stroke-dasharray="560" stroke-dashoffset="560"/>
    <line class="yl" x1="60" y1="110" x2="200" y2="110" stroke="#FF7A00" stroke-width="3" stroke-dasharray="8 6"/><text class="yt" x="66" y="102" font-family="PlexLatin" font-weight="700" font-size="24" fill="#B54F00">320</text>
    <line class="tl" x1="60" y1="70" x2="330" y2="70" stroke="#003DA5" stroke-width="3" stroke-dasharray="8 6"/><text class="tt" x="66" y="62" font-family="PlexLatin" font-weight="700" font-size="24" fill="#003DA5">400</text>
    <text class="bx" x="428" y="130" font-family="PlexLatin" font-weight="700" font-size="34" fill="#D93A3A">✕</text></svg>`);
  D.card('<div style="font:600 36px Plex;color:#10213F;max-width:1300px;white-space:normal">صلابة المسمار: مقاومته للتشوّه الدائم، والخدش، والانحناء، والاختراق… تحت القوى الميكانيكية</div>', 960, 900, s('k6') + 0.2, s('k7') - 0.1);
  const bar = K.displayBolt({ d: 10, L: 70, stamp: null }); bar.rotation.z = Math.PI / 2; bar.position.set(40, 20, 60); D.add(bar);
  D.on(t => {
    row.forEach((h, i) => { popIn(h, t, s('k1') + 0.2 + i * 0.08, s('k4') - 0.2); h.rotation.y = 0.3 * Math.sin(t * 0.5 + i); });
    const quiz = t > s('k4') - 0.4 && t < s('k6') - 0.2;
    big.visible = quiz; big.position.y = 0; big.rotation.y = quiz ? 0.35 : 0;
    for (const m of bigStampMats) trackify(m, win(t, s('k5'), s('k6') - 0.3) * 0.6);
    const qt = seg(t, s('k4') + 0.8, e('k4') + 1.6);
    place(ring, 1500, 300, win(t, s('k4') + 0.4, e('k4') + 1.8, 0.2)); ring.querySelector('.arc').setAttribute('stroke-dashoffset', 339 * qt);
    place(ans, 1480, 330, win(t, s('k5'), s('k6') - 0.2), lerp(0.8, 1, seg(t, s('k5'), s('k5') + 0.4, easeBack)));
    // 4.8
    const op = win(t, s('k7'), 1e9);
    place(calc, 640, 330, op, 1);
    calc.querySelector('.c1').style.opacity = seg(t, s('k7') + 1.2, s('k7') + 1.8); calc.querySelector('.c1b').style.opacity = seg(t, s('k7') + 3.0, s('k7') + 3.5);
    for (const [c, a] of [['.c2', 0.6], ['.c2b', 3.2], ['.c2c', 5.5]]) calc.querySelector(c).style.opacity = seg(t, s('k8') + a, s('k8') + a + 0.5);
    calc.querySelector('.d1').style.color = t > s('k7') + 0.8 && t < s('k8') ? '#FF7A00' : '#003DA5';
    calc.querySelector('.d2').style.color = t > s('k8') ? '#FF7A00' : '#10213F';
    place(graph, 1420, 700, op);
    const g = graph; g.querySelector('.curve').setAttribute('stroke-dashoffset', 560 * (1 - seg(t, s('k7') + 0.5, e('k8'))));
    g.querySelector('.tl').style.opacity = g.querySelector('.tt').style.opacity = seg(t, s('k7') + 2.5, s('k7') + 3);
    g.querySelector('.yl').style.opacity = g.querySelector('.yt').style.opacity = seg(t, s('k8') + 3.2, s('k8') + 3.7);
    g.querySelector('.bx').style.opacity = seg(t, e('k8') - 0.3, e('k8'));
    // k6: a bolt loaded in bending springs back (elastic), shown under the definition
    bar.visible = t > s('k6') && t < s('k7'); const bend = Math.sin(seg(t, s('k6') + 0.5, e('k6')) * Math.PI * 2) * 0.12;
    bar.rotation.x = bend; bar.scale.y = 1;
  });
  D.shots([
    [0, v3(0, 90, 120), v3(0, 5, 0)],
    [s('k1') + 0.3, v3(0, 230, 380), v3(0, -10, 0)],
    [s('k3') - 0.2, v3(0, 230, 380), v3(0, -10, 0)],
    [s('k3') + 0.6, v3(40, 90, 130), v3(39, 5, 0)],
    [s('k4') - 0.4, v3(40, 90, 130), v3(39, 5, 0)],
    [s('k4'), v3(0, 105, 60), v3(0, 36, 0)],
    [s('k6') - 0.4, v3(0, 100, 55), v3(0, 36, 0)],
    [s('k6'), v3(40, 70, 230), v3(40, 20, 60)],
    [s('k7') - 0.3, v3(40, 70, 230), v3(40, 20, 60)],
    [s('k7'), v3(0, 400, 600), v3(0, -200, 0)],
    [ctx.duration, v3(0, 400, 600), v3(0, -200, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
classes.sfx = ({ cue }) => [{ t: cue('k3'), name: 'pop', gain: 0.3 }, { t: cue('k4', 'end') + 1.6, name: 'chime', gain: 0.25 }, { t: cue('k7') + 1.2, name: 'pop', gain: 0.25 }, { t: cue('k8') + 3.2, name: 'pop', gain: 0.25 }];
