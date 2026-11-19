// Slides 25-27: washers — load spread (cross-section), sizing, types, flat/fender, chamfer orientation
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, cutaway, el, place, project, svgEl } from '../engine.js';
import * as K from '../kit.js';

export default function washers(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('الحلقات (الوشرات)', 'Washers');
  D.chip([25, 26, 27]);
  // cross-section: soft plate, bolt head without/with washer; pressure "footprint" disc
  const base = K.plate({ w: 120, dpt: 80, t: 10, holes: [[0, 0, 5.5]], mat: paint(0xE6C79C, 0.7) }); D.add(base);
  const bolt = K.displayBolt({ d: 10, L: 30, stamp: null }); bolt.rotation.x = Math.PI; bolt.position.y = 10 + 6.4 + 30; D.add(bolt);
  const w = K.washer({ id: 10.5, od: 22, t: 2.2, chamfer: true }); D.add(w);
  const g = new THREE.Group(); g.add(base, bolt, w); D.add(g); cutaway(g, new THREE.Vector3(0, 0, -1), 0);
  const press = (r, c) => { const m = new THREE.Mesh(new THREE.RingGeometry(5.5, r, 64), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 10.08; D.add(m); return m; };
  const pSmall = press(8.4, 0xD93A3A), pBig = press(11, 0x1E9E5A);
  const arrows = []; for (let i = 0; i < 7; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5, 12), new THREE.MeshBasicMaterial({ color: 0xFF7A00 })); a.rotation.x = Math.PI; D.add(a); arrows.push(a); }
  const uses = ['زيادة سطح التحميل (توزيع الحمل)', 'حماية السطح من العلامات والتلف', 'المحافظة على قوة الشد', 'الإغلاق'];
  uses.forEach((u, i) => D.card(`<div style="font:600 34px Plex;color:#10213F">${i + 1}. ${u}</div>`, 1470, 320 + i * 100, s('w2') + i * (e('w2') - s('w2')) / 4, s('w3') - 0.2, 'card', { padding: '16px 30px' }));
  // sizing (w3)
  const dOD = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5 }), dHead = svgEl('line', { stroke: '#003DA5', 'stroke-width': 4, 'stroke-dasharray': '8 6' });
  const tOD = el('lbl track', 'القطر الخارجي أكبر قليلًا من رأس البرغي'), tID = el('lbl', 'القطر الداخلي أكبر قليلًا من البرغي');
  // types row (w4)
  const types = [[K.washer({ id: 10.5, od: 22, t: 2 }), 'مسطّحة'], [K.washer({ id: 10.5, od: 36, t: 1.6 }), 'عريضة'], [(() => { const p = [[5.3, 0], [11, 0], [11, 0.8], [6, 2.8], [5.3, 2.8]].map(q => new THREE.Vector2(q[0], q[1])); return new THREE.Mesh(new THREE.LatheGeometry([...p, p[0]], 64), K.M.zinc()); })(), 'لرأس مقبّب'], [K.splitWasher({}), 'زنبركية'], [K.toothWasher({}), 'مسنّنة خارجية'], [K.toothWasher({ external: false }), 'مسنّنة داخلية'], [K.squareWasher({ s: 20 }), 'مربّعة']];
  const tw = types.map(([o, n], i) => { o.position.set(105 - i * 35, 0, 60); castAll(o); D.add(o); D.label(n, [o, v3(0, 0, 18)], [0, 80], s('w4') + 0.3 + i * (e('w4') - s('w4') - 0.5) / 7, s('w5') - 0.2, { noLeader: true, style: { fontSize: '28px' } }); return o; });
  // fender on a thin sheet (w6)
  const sheet = K.plate({ w: 120, dpt: 80, t: 1.5, holes: [[0, 0, 5.5]], mat: paint(0xBFD6F2, 0.5) }); sheet.position.z = 200; D.add(sheet);
  const fen = K.washer({ id: 10.5, od: 36, t: 1.6 }); fen.position.set(0, 1.5, 200); D.add(fen);
  const fBolt = K.displayBolt({ d: 10, L: 20, stamp: null }); fBolt.rotation.x = Math.PI; fBolt.position.set(0, 1.5 + 1.6 + 6.4 + 20, 200); D.add(fBolt);
  D.track(fen.material, s('w6') + 0.4, e('w6') + 0.2);
  D.label('حماية الأسطح الناعمة وسد الفجوات', v3(0, 12, 0), [-260, -170], s('w5') + 0.5, s('w6') - 0.2, { track: true });
  D.label('الجهة المشطوفة باتجاه الرأس', v3(10.5, 12.2, 0), [280, -150], s('w7') + 0.5, 1e9, { track: true });
  D.on(t => {
    const sec = t < s('w4') - 0.2 || t > s('w5') - 0.3 && t < s('w6') - 0.2 || t > s('w7') - 0.3;
    g.visible = sec; pSmall.visible = pBig.visible = sec;
    const withW = seg(t, s('w2') + 1.8, s('w2') + 2.6, easeOut) > 0.5 || t > s('w2') + 2.6;
    const wk = seg(t, s('w2') + 1.6, s('w2') + 2.6, easeOut);
    w.position.y = 10 + (1 - wk) * 40; w.visible = wk > 0.01 || t > s('w5');
    bolt.position.y = 10 + 6.4 + 30 + 2.2 * wk;
    pSmall.material.opacity = 0.6 * win(t, s('w2') + 0.3, s('w2') + 1.8, 0.3); pBig.material.opacity = 0.6 * win(t, s('w2') + 2.6, s('w3') - 0.3, 0.3);
    arrows.forEach((a, i) => { const ang = i / 7 * Math.PI * 2; const r = lerp(7.5, 10.5, wk); a.position.set(Math.cos(ang) * r, 10 + 2.2 * wk + 6 + 4 * (1 - (t * 2 % 1)), Math.sin(ang) * r); a.visible = win(t, s('w2') + 0.3, s('w3') - 0.3) > 0.5 && Math.sin(ang) > 0; });
    trackify(w.material, win(t, s('w2') + 1.6, s('w3') + 0.5) + win(t, s('w7') + 0.3, 1e9));
    w.rotation.x = 0;
    // sizing dims
    const op3 = win(t, s('w3') + 0.2, s('w4') - 0.2);
    const a = project(v3(-11, 12.4, 0), D.camera), b = project(v3(11, 12.4, 0), D.camera), c = project(v3(-9.8, 12.4 + 6.4 + 1, 0), D.camera), d = project(v3(9.8, 12.4 + 6.4 + 1, 0), D.camera);
    dOD.setAttribute('x1', a.x); dOD.setAttribute('y1', a.y + 40); dOD.setAttribute('x2', b.x); dOD.setAttribute('y2', b.y + 40); dOD.style.opacity = op3;
    dHead.setAttribute('x1', c.x); dHead.setAttribute('y1', c.y - 30); dHead.setAttribute('x2', d.x); dHead.setAttribute('y2', d.y - 30); dHead.style.opacity = op3;
    place(tOD, (a.x + b.x) / 2, a.y + 110, op3 * seg(t, s('w3') + 0.2, s('w3') + 0.6)); place(tID, (a.x + b.x) / 2, c.y - 110, op3 * seg(t, s('w3') + 2.4, s('w3') + 2.8));
    tw.forEach((o, i) => { o.visible = t > s('w4') - 0.3 && t < s('w5') - 0.2; popIn(o, t, s('w4') - 0.3 + i * 0.08, s('w5') - 0.2); });
    sheet.visible = fen.visible = fBolt.visible = t > s('w6') - 0.3 && t < s('w7') - 0.3;
  });
  D.shots([
    [0, v3(80, 90, 160), v3(0, 22, 0)], [s('w3'), v3(0, 35, 120), v3(0, 20, 0)], [s('w4') - 0.3, v3(0, 35, 120), v3(0, 20, 0)],
    [s('w4'), v3(0, 190, 330), v3(0, 0, 60)], [s('w5') - 0.3, v3(0, 190, 330), v3(0, 0, 60)],
    [s('w5'), v3(80, 90, 160), v3(0, 22, 0)], [s('w6') - 0.3, v3(80, 90, 160), v3(0, 22, 0)],
    [s('w6'), v3(60, 90, 300), v3(0, 5, 200)], [s('w7') - 0.3, v3(60, 90, 300), v3(0, 5, 200)],
    [s('w7'), v3(20, 30, 95), v3(5, 16, 0)], [ctx.duration, v3(20, 30, 90), v3(5, 16, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
washers.sfx = ({ cue }) => [{ t: cue('w2') + 2.5, name: 'clink', gain: 0.35 }, { t: cue('w4'), name: 'whoosh', gain: 0.2 }];
