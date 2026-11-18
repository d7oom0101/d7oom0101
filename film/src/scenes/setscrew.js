// Slides 18-19: set screw (blind screw) — cutaway through hub and shaft; 7 point types and their uses
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, threadGeometry, castAll, trackify, paint, cutaway } from '../engine.js';
import * as K from '../kit.js';

// point profiles (r,y) at the tip end (y=0 is the tip), body radius 5
const POINTS = {
  cup: [[0, 1.2], [2.6, 1.2], [3.0, 0], [4.4, 0], [5, 0.8]],
  knurl: [[0, 1.2], [2.6, 1.2], [3.0, 0], [4.4, 0], [5, 0.8]],
  flat: [[0, 0], [3.8, 0], [5, 1.2]],
  oval: [[0, 0], [2.5, 0.35], [4.2, 1.4], [5, 2.6]],
  cone: [[0, 0], [5, 5]],
  dog: [[0, 0], [2.9, 0], [3.2, 0.3], [3.2, 4], [4.2, 4], [5, 4.8]],
  soft: [[0, 0], [3.4, 0], [3.8, 0.4], [3.8, 2.2], [5, 2.6]],
};
function setScrew(kind, L = 22) {
  const g = new THREE.Group(); const m = K.M.black();
  const top = POINTS[kind][POINTS[kind].length - 1][1];
  const th = new THREE.Mesh(threadGeometry({ dMajor: 10, pitch: 1.5, y0: top, y1: L, chamferTip: true }), m); g.add(th);
  const prof = [...POINTS[kind]]; prof.push([4.2, top + 0.01]);
  const pm = kind === 'soft' ? K.M.nylon() : m;
  const tip = new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 48), pm); g.add(tip);
  if (kind === 'soft') { const tip2 = new THREE.Mesh(new THREE.LatheGeometry([[0, 2.2], [3.8, 2.2], [4.4, 2.6]].map(p => new THREE.Vector2(p[0], p[1])), 48), m); g.add(tip2); }
  if (kind === 'knurl') for (let i = 0; i < 16; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 1.4), K.M.dark()); const a = i / 16 * Math.PI * 2; r.position.set(Math.cos(a) * 3.7, 0.15, Math.sin(a) * 3.7); r.rotation.y = -a; g.add(r); }
  const sock = K.decal(8, (c, w, h) => { c.fillStyle = '#111'; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(w / 2 + Math.cos(a) * w * 0.3, h / 2 + Math.sin(a) * h * 0.3); } c.fill(); }); sock.position.y = L + 0.02; g.add(sock);
  castAll(g); g.userData.mat = m;
  return g;
}
const NAMES = [['cup', 'كوب عادي', 'Plain cup', 'ss5'], ['knurl', 'كوب مخدّش', 'Knurled cup', 'ss6'], ['flat', 'مسطّح', 'Flat', 'ss7'], ['oval', 'بيضاوي', 'Oval', 'ss8'], ['cone', 'مخروطي', 'Cone', 'ss9'], ['dog', 'نصف كلب', 'Half-dog', 'ss10'], ['soft', 'طرف ناعم', 'Soft-tipped', 'ss11']];
const USES = {
  ss5: ['يثبّت الجزء بشكل دائم', 'للأسطح الناعمة والصلبة'],
  ss6: ['تثبيت دائم', 'يقاوم الاهتزاز أفضل حتى في الثقوب الملولبة بشكل سيئ'],
  ss7: ['يعاد الضبط دون إتلاف السطح', 'للأسطح المطحونة والجدران الرقيقة', 'دعم للمعادن اللينة', 'برغي تعديل'],
  ss8: ['يعاد الضبط دون إتلاف السطح', 'يناسب المجاري', 'يلامس الأسطح بزاوية'],
  ss9: ['أكبر قوة ضغطية', 'تثبيت دائم', 'نقطة ارتكاز أو تعليق', 'برغي تعديل'],
  ss10: ['يناسب الثقوب والمجاري المحدّدة', 'للأسطح المطحونة', 'تثبيت دائم'],
  ss11: ['يعاد الضبط دون إتلاف السطح'],
};
export default function setscrew(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('مسمار التثبيت (البرغي الأعمى)', 'Set screw (blind screw)');
  D.chip([18, 19]);
  // shaft + pulley hub (cutaway), set screw radial from the top
  const asm = new THREE.Group(); D.add(asm);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 180, 48), K.M.stainless()); shaft.rotation.z = Math.PI / 2; asm.add(shaft);
  const pulley = new THREE.Group(); asm.add(pulley);
  const prof = [[12.2, -22], [26, -22], [26, -8], [52, -8], [56, -12], [60, -12], [60, 12], [56, 12], [52, 8], [26, 8], [26, 22], [12.2, 22]].map(p => new THREE.Vector2(p[0], p[1]));
  const pg = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), paint(0x8FB0DD, 0.4)); pg.rotation.z = Math.PI / 2; pulley.add(pg);
  const sc = setScrew('cup', 16); sc.position.set(-15, 16, 0); pulley.add(sc); // tip pointing down onto the shaft
  castAll(asm);
  cutaway(pulley, new THREE.Vector3(0, 0, -1), 0);
  const scMat = sc.userData.mat;
  D.track(scMat, s('ss1') + 0.3, e('ss2'));
  D.label('مسمار التثبيت', [sc, v3(0, 8, 0)], [-200, -150], s('ss1') + 0.6, e('ss2'), { track: true });
  D.label('العمود', v3(70, 0, 12), [120, 120], s('ss2') + 1.0, e('ss2'));
  D.label('بكرة / ترس', v3(-15, 55, 0), [-140, -110], s('ss2') + 1.6, e('ss2'));
  // anatomy (ss3) and points row (ss5..)
  const big = setScrew('cone', 30); big.rotation.z = -Math.PI / 2; big.position.set(-15, 20, 0); D.add(big); big.visible = false;
  const lbl = (txt, p, off, k) => D.label(txt, p, off, s('ss3') + k * (e('ss3') - s('ss3')) / 6, s('ss4') + 0.2, { style: { fontSize: '30px' } });
  lbl('النوع', v3(10, 25, 0), [60, -150], 0); lbl('المادة', v3(0, 25, 0), [-60, -160], 0.9); lbl('السن', v3(-5, 25, 0), [-200, -90], 1.8);
  lbl('الطول', v3(0, 14, 0), [0, 140], 2.7); lbl('القطر', v3(-10, 25, 0), [-260, 40], 3.6); lbl('نوع النهاية', v3(-15, 20, 0), [-260, 150], 4.5);
  D.card('<div style="font:700 40px Plex;color:#B54F00">مادته أقوى من القطعة التي يربطها… ومن العمود</div>', 960, 900, s('ss4'), s('ss5') - 0.2);
  const row = NAMES.map(([k, ar, en, cue], i) => {
    const o = setScrew(k, 22); o.rotation.z = Math.PI; o.position.set(96 - i * 32, 24, 0); D.add(o); o.visible = false;
    D.track(o.userData.mat, s(cue) - 0.1, e(cue) + 0.2);
    D.label(`${ar}<br><span style="font:500 22px PlexLatin;color:#5C6E8A">${en}</span>`, [o, v3(0, -6, 0)], [0, -110], s('ss5') - 0.2 + i * 0.12, 1e9, { noLeader: true, style: { fontSize: '28px', textAlign: 'center', lineHeight: '1.1' }, track: t => t > s(cue) - 0.1 && t < e(cue) + 0.2 });
    return o;
  });
  for (const [cue, uses] of Object.entries(USES)) D.card(`<div style="text-align:right">${uses.map(u => `<div style="font:600 34px Plex;color:#10213F;margin:6px 0">• ${u}</div>`).join('')}</div>`, 960, 840, s(cue) + 0.1, e(cue) + 0.35);
  D.on(t => {
    asm.visible = t < s('ss3') - 0.2;
    const tight = seg(t, s('ss2') + 0.2, s('ss2') + 1.2, easeOut);
    sc.position.y = 16 - tight * 4.2;
    shaft.rotation.x = t * 2.5; pulley.rotation.x = tight >= 1 ? t * 2.5 - (s('ss2') + 1.2) * 2.5 : 0;
    big.visible = t > s('ss3') - 0.2 && t < s('ss5') - 0.3; big.rotation.y = t * 0.4;
    row.forEach((o, i) => { o.visible = t > s('ss5') - 0.3; popIn(o, t, s('ss5') - 0.3 + i * 0.1); });
  });
  D.shots([
    [0, v3(150, 120, 260), v3(0, 10, 0)], [s('ss2'), v3(120, 90, 200), v3(0, 15, 0)], [s('ss3') - 0.4, v3(60, 80, 180), v3(-10, 20, 0)],
    [s('ss3'), v3(0, 45, 105), v3(0, 20, 0)], [s('ss5') - 0.5, v3(0, 45, 105), v3(0, 20, 0)],
    [s('ss5'), v3(0, 50, 330), v3(0, 20, 0)], [ctx.duration, v3(0, 50, 320), v3(0, 20, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
setscrew.sfx = ({ cue }) => [{ t: cue('ss2') + 0.2, name: 'thread', gain: 0.3, dur: 1 }, { t: cue('ss2') + 1.2, name: 'contact', gain: 0.5 }, ...['ss5', 'ss6', 'ss7', 'ss8', 'ss9', 'ss10', 'ss11'].map(id => ({ t: cue(id), name: 'pop', gain: 0.2 }))];
