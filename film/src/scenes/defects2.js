// Slides 54-57: washer use, tightness, thread condition, head condition (Allen key fit)
import * as THREE from 'three';
import { compareScene, plateWith } from './_compare.js';
import { v3, seg, win, easeOut, easeIO, castAll, trackify, paint, threadGeometry, el, place, project } from '../engine.js';
import * as K from '../kit.js';

function washerCase(kind) {
  const g = new THREE.Group();
  const pl = K.plate({ w: 54, dpt: 44, t: 8, holes: [[0, 0, 5.5]] }); g.add(pl);
  let y = 8;
  const add = o => { o.position.y = y; g.add(o); };
  if (kind === 'stack') for (let i = 0; i < 4; i++) { add(K.washer({ id: 10.5, od: 21, t: 2 })); y += 2; }
  if (kind === 'soft') { const w = K.washer({ id: 10.5, od: 21, t: 2, mat: new THREE.MeshStandardMaterial({ color: 0xD8C27A, roughness: 0.9 }) }); w.scale.y = 0.6; add(w); y += 1.2; }
  if (kind === 'ok') { add(K.washer({ id: 10.5, od: 21, t: 2 })); y += 2; const sw = K.splitWasher({ id: 10.4, od: 17.5, t: 2.4 }); add(sw); y += 2.4; }
  if (kind === 'noflat') { const sw = K.splitWasher({ id: 10.4, od: 17.5, t: 2.4 }); add(sw); y += 2.4; }
  const b = K.displayBolt({ d: 10, L: 20, stamp: null }); b.position.y = y - 20; g.add(b);
  return g;
}
const TXT = { none: 'لا توجد حلقة مسطّحة', noflat: 'لا حلقة مسطّحة ولا قفل', stack: 'كومة حلقات', soft: 'حلقة لينة غير مناسبة', ok: '✓ حلقة مسطّحة + حلقة قفل' };
export default function defects2(ctx) {
  const R = compareScene(ctx, {
    header: 'العيوب: الحالة', en: 'Defects — condition', slides: [54, 55, 56, 57],
    beats: [
      { cue: 'd8', title: 'حالات استخدام خاطئ للحلقات', badgeY: 40, build: (D, t0) => {
        const cases = ['none', 'stack', 'soft', 'ok'];
        return cases.map((k, i) => { const g = washerCase(k); D.label(TXT[k], [g, v3(0, 0, 25)], [0, 90], t0 + 0.6 + i * 1.2, D.s('d9') - 0.3, { noLeader: true, style: { fontSize: '26px' } }); return [g, k === 'ok', -105 + i * 70]; });
      }, cam: [v3(0, 160, 400), v3(0, 8, 0)] },
      { cue: 'd9', title: 'يجب شدّها بإحكام', build: () => {
        const loose = plateWith([{ x: 0, type: 'hex', proud: 4 }], { w: 70, dpt: 50 }); const tight = plateWith([{ x: 0, type: 'hex' }], { w: 70, dpt: 50 });
        return [[loose, false], [tight, true]];
      }, update: (t, [loose]) => { loose.children[1].rotation.y = Math.sin(t * 3) * 0.15; }, cam: [v3(0, 90, 320), v3(0, 12, 0)] },
      { cue: 'd10', title: 'السن التالف لازم يتغيّر', build: () => {
        const good = new THREE.Mesh(threadGeometry({ dMajor: 12, pitch: 1.75, y0: 0, y1: 50 }), K.M.zinc());
        const badG = threadGeometry({ dMajor: 12, pitch: 1.75, y0: 0, y1: 50 }); const p = badG.attributes.position;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), z = p.getZ(i); const dent = Math.exp(-Math.pow((y - 28) / 5, 2)) * (x > 0 ? 0.25 : 0); p.setX(i, x * (1 - dent)); p.setZ(i, z * (1 - dent * 0.6)); }
        badG.computeVertexNormals();
        const bad = new THREE.Mesh(badG, K.M.zinc()); const rust = new THREE.Mesh(new THREE.CylinderGeometry(6.1, 6.1, 8, 24, 1, true, 0, 2.4), K.M.rust()); rust.position.y = 12; bad.add(rust);
        const gb = new THREE.Group(); gb.add(bad); const gg = new THREE.Group(); gg.add(good);
        gb.rotation.z = gg.rotation.z = -Math.PI / 2;
        return [[gb, false], [gg, true]];
      }, update: (t, gs) => gs.forEach(g => { g.rotation.x = t * 0.5; }), cam: [v3(0, 70, 260), v3(0, 0, 0)], badgeY: 30 },
      { cue: 'd11', title: 'تآكل رأس البرغي بسبب مفتاح ألن غير مطابق أو مهترئ أو غير مُدخل بالكامل', badgeDelay: 2.5, build: (D, t0) => {
        const mk = (keyS, depth, worn) => { const g = new THREE.Group(); const sc = K.socketScrew({ d: 10, L: 16 }); g.add(sc); const k = K.allenKey({ s: keyS, L1: 50, L2: 22 }); k.position.y = 26 - depth; g.add(k); if (worn) { const tip = new THREE.Mesh(new THREE.SphereGeometry(keyS * 0.55, 12, 8), K.M.black()); tip.position.y = 0; k.add(tip); } return g; };
        const items = [[mk(6, 4, false), 'مقاس غير مطابق'], [mk(8, 4, true), 'مفتاح مهترئ'], [mk(8, 1.5, false), 'غير مُدخل بالكامل']];
        return items.map(([g, txt], i) => { D.label(txt, [g, v3(0, 0, 14)], [0, 90], t0 + 0.6 + i * 1.3, 1e9, { noLeader: true, style: { fontSize: '28px' }, track: true }); return [g, false, -70 + i * 70]; });
      }, update: (t, gs) => gs.forEach((g, i) => { const k = g.children[1]; k.rotation.y = Math.sin(t * 6 + i) * (i === 0 ? 0.25 : 0.12); }), cam: [v3(0, 130, 330), v3(0, 25, 0)] },
    ],
  });
  return R;
}
defects2.sfx = ({ cue }) => [...[0, 1, 2].map(j => ({ t: cue('d8') + 1.0 + j * 0.3, name: 'wrong', gain: 0.25 })), { t: cue('d8') + 1.9, name: 'right', gain: 0.3 }, ...['d9', 'd10'].flatMap(id => [{ t: cue(id) + 1.0, name: 'wrong', gain: 0.3 }, { t: cue(id) + 1.3, name: 'right', gain: 0.3 }]), { t: cue('d9') + 0.4, name: 'rattle', gain: 0.3, dur: 2.5 }, { t: cue('d11') + 0.5, name: 'creak', gain: 0.35 }, ...[0, 1, 2].map(j => ({ t: cue('d11') + 2.5 + j * 0.3, name: 'wrong', gain: 0.25 }))];
