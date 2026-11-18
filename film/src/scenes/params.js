// Slide 6: the six parameters of a bolt
import * as THREE from 'three';
import { stage } from '../director.js';
import { v3, seg, win, easeOut, project, svgEl, trackify } from '../engine.js';
import * as K from '../kit.js';

export default function params(ctx) {
  const D = stage(ctx, { target: v3(0, 30, 0), size: 120 });
  const s = D.s, e = D.e;
  D.header('معلومات البرغي', 'Parameters of a bolt');
  D.chip([6]);
  // horizontal bolt: head on the right
  const holder = new THREE.Group(); D.add(holder);
  const b = K.displayBolt({ d: 12, L: 60, stamp: { text: '8.8' } });
  b.rotation.z = -Math.PI / 2; b.position.set(-22, 30, 0); holder.add(b);
  const bm = b.userData.bolt; const mat = bm.userData.mat;
  const head = bm.getObjectByName('head'); head.material = mat.clone(); const hm = head.material;
  const th = bm.getObjectByName('thread'); th.material = mat.clone(); const tm = th.material;
  const lbl = (txt, a, off, t0) => D.label(txt, a, off, t0, 1e9, { track: t => t > t0 && t < t0 + 1.8 });
  lbl('الدرجة (الصلابة)', v3(46, 37, 0), [160, -230], s('p2'));
  lbl('نوع الرأس', v3(44, 23, 0), [230, 120], s('p3'));
  lbl('القطر', v3(-10, 36, 0), [0, -190], s('p4'));
  lbl('الطول', v3(-20, 14, 0), [-40, 170], s('p5'));
  lbl('طول التسنين', v3(-30, 24, 0), [-300, 120], s('p6'));
  lbl('نوع التسنين', v3(-25, 36, 0), [-300, -150], s('p7'));
  // dimension lines (svg)
  const dimL = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5 }), dimD = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5 }), dimT = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5 });
  const setLine = (l, a, b2, op) => { const p = project(a, D.camera), q = project(b2, D.camera); l.setAttribute('x1', p.x); l.setAttribute('y1', p.y); l.setAttribute('x2', q.x); l.setAttribute('y2', q.y); l.style.opacity = op; };
  D.on(t => {
    holder.rotation.y = -0.5 + 0.5 * seg(t, 0, s('p2'), easeOut);
    trackify(hm, win(t, s('p2') - 0.1, s('p4') - 0.1));
    trackify(tm, win(t, s('p6'), ctx.duration + 1) * 0.9);
    D.camera.updateMatrixWorld();
    setLine(dimD, v3(-10, 24, 0), v3(-10, 36, 0), win(t, s('p4'), 1e9));
    setLine(dimL, v3(-21.7, 16, 0), v3(38.3, 16, 0), win(t, s('p5'), 1e9));
    setLine(dimT, v3(-21.7, 40, 0), v3(34, 40, 0), win(t, s('p6'), 1e9) * 0.8);
  });
  D.shots([[0, v3(80, 90, 210), v3(5, 30, 0)], [s('p2'), v3(30, 60, 190), v3(5, 30, 0)], [ctx.duration, v3(-10, 60, 185), v3(5, 30, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
params.sfx = ({ cue }) => ['p2', 'p3', 'p4', 'p5', 'p6', 'p7'].map(id => ({ t: cue(id), name: 'pop', gain: 0.25 }));
