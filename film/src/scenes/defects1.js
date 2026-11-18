// Slides 50-53: proper type? proper material? direction & placement? proper length?
import * as THREE from 'three';
import { compareScene, plateWith } from './_compare.js';
import { v3, seg, win, easeOut, castAll, trackify, paint, threadGeometry } from '../engine.js';
import * as K from '../kit.js';

function lengthJoint(L, nutY = null) {
  const g = new THREE.Group();
  const p1 = K.plate({ w: 70, dpt: 50, t: 10, holes: [[0, 0, 5.5]] }); g.add(p1);
  const p2 = K.plate({ w: 70, dpt: 50, t: 10, holes: [[0, 0, 5.5]] }); p2.position.y = 11; g.add(p2);
  const b = K.displayBolt({ d: 10, L, stamp: null }); b.position.y = 21 - L; g.add(b); // head on top, thread downward
  const n = K.hexNut({ d: 10, s: 17, m: 8 }); n.rotation.x = Math.PI; n.position.y = nutY ?? 0; g.add(n);
  g.userData = { b, n };
  return g;
}
export default function defects1(ctx) {
  const R = compareScene(ctx, {
    header: 'العيوب: التطبيق والطريقة', en: 'Defects — application & method', slides: [50, 51, 52, 53],
    beats: [
      { cue: 'd1', title: 'نفس النوع… ومستوية مع السطح', build: () => [
        [plateWith([{ x: -35, type: 'hex' }, { x: 0, type: 'socket' }, { x: 35, type: 'hex', proud: 6 }]), false],
        [plateWith([{ x: -35, type: 'hex' }, { x: 0, type: 'hex' }, { x: 35, type: 'hex' }]), true]] },
      { cue: 'd2', title: 'صامولتين مجنّحتين: شد وفك سريع بدون أدوات', build: () => [
        [plateWith([{ x: -30, type: 'wing' }, { x: 30, type: 'nutHex' }]), false],
        [plateWith([{ x: -30, type: 'wing' }, { x: 30, type: 'wing' }]), true]] },
      { cue: 'd3', title: 'مكان معرّض للتآكل → ستانلس', build: () => [
        [plateWith([{ x: -30, type: 'hex', mat: K.M.rust() }, { x: 30, type: 'hex', mat: K.M.rust() }], { color: 0x7FA0B8 }), false],
        [plateWith([{ x: -30, type: 'hex', mat: K.M.stainless(), stamp: { text: 'A4-70', font: 90 } }, { x: 30, type: 'hex', mat: K.M.stainless(), stamp: { text: 'A4-70', font: 90 } }], { color: 0x7FA0B8 }), true]],
        cam: [v3(0, 230, 340), v3(0, 10, 0)] },
      { cue: 'd4', title: 'فئتان مختلفتان في نفس الوصلة: الأضعف يضعّف الترابط', build: () => [
        [plateWith([{ x: -30, type: 'hex', stamp: { text: '8.8' } }, { x: 30, type: 'hex', stamp: { text: '12.9', font: 100 } }]), false, 0]],
        cam: [v3(0, 120, 130), v3(0, 15, 0)] },
      { cue: 'd5', title: 'البرغي للأعلى، الصامولة فوق… وكلها بنفس الاتجاه', build: () => {
        const mk = (flip) => { const g = new THREE.Group(); const pl = K.plate({ w: 120, dpt: 60, t: 10, holes: [[-35, 0, 5.5], [0, 0, 5.5], [35, 0, 5.5]] }); g.add(pl);
          [-35, 0, 35].forEach((x, i) => { const up = flip[i]; const b = K.displayBolt({ d: 10, L: 28, stamp: null }); const n = K.hexNut({ d: 10, s: 17, m: 8 });
            if (up) { b.rotation.x = Math.PI; b.position.set(x, 28, 0); n.position.set(x, 10, 0); }      // head below, nut on top
            else { b.position.set(x, -18, 0); n.rotation.x = Math.PI; n.position.set(x, 0, 0); }          // head on top, nut below
            g.add(b, n); }); return g; };
        return [[mk([true, false, true]), false], [mk([true, true, true]), true]]; },
        cam: [v3(0, 100, 470), v3(0, 5, 0)] },
      { cue: 'd6', title: '3 أسنان مكشوفة أو أكثر: معرّض للصدم والكسر', build: () => [[lengthJoint(55), false], [lengthJoint(30), true]], cam: [v3(0, 60, 390), v3(0, -5, 0)], badgeY: 60 },
      { cue: 'd7', title: 'قصير جدًا: عرضة للارتخاء', build: () => [[lengthJoint(24), false], [lengthJoint(30), true]], cam: [v3(0, 60, 390), v3(0, -5, 0)], badgeY: 60 },
    ],
  });
  return R;
}
defects1.sfx = ({ cue }) => ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].flatMap(id => [{ t: cue(id) + 0.6, name: 'clink', gain: 0.18 }, { t: cue(id) + 1.0, name: 'wrong', gain: 0.3 }, { t: cue(id) + 1.3, name: 'right', gain: 0.3 }]);
