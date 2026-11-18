// Slide 10: bolt length A -> B (head excluded) / flat-head: length includes the head (cross-section)
import * as THREE from 'three';
import { stage } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, project, svgEl, el, place, trackify, paint, castAll } from '../engine.js';
import * as K from '../kit.js';
import { buildCaliper, drawLCD } from './caliper.js';

export default function length(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 150 });
  const s = D.s, e = D.e;
  D.header('الطول', 'Length');
  D.chip([10]);
  // bolt lying along X: tip (A) at x=-20, under-head (B) at x=+20, head beyond
  const b = K.displayBolt({ d: 10, L: 40, stamp: null }); b.rotation.z = -Math.PI / 2; b.position.set(-20, 20, 0); D.add(b);
  const head = b.userData.bolt.getObjectByName('head'); head.material = head.material.clone();
  // caliper measuring length: jaws on tip and under-head; beam above
  const cal = buildCaliper(); D.add(cal.g); cal.g.scale.setScalar(1);
  // A/B markers
  const mk = (txt) => el('big', `<div style="width:62px;height:62px;border-radius:50%;background:#FF7A00;color:#fff;font:700 38px PlexLatin;display:flex;align-items:center;justify-content:center">${txt}</div>`);
  const A = mk('A'), B = mk('B');
  const dim = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 6 });
  // flat-head screw in a countersunk plate, cross-section
  const sec = new THREE.Group(); sec.position.set(0, 0, 0); D.add(sec);
  const fh = K.driveScrew({ d: 8, L: 30, head: 'flat', drive: 'hex' }); fh.rotation.z = -Math.PI / 2; fh.position.set(-15, 20, 0); sec.add(fh);
  const hatch = paint(0xC9D6E8, 0.6);
  const blk = new THREE.Mesh(new THREE.BoxGeometry(20, 60, 30), hatch); blk.position.set(25, 20, -16); sec.add(blk); // cut plate (behind the section plane)
  castAll(sec);
  const dim2 = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 6 });
  const lbl2 = el('lbl track', 'الطول يشمل الرأس');
  D.on(t => {
    const showA = t < s('l4') - 0.2;
    b.visible = showA; sec.visible = !showA;
    // caliper: jaws along the bolt axis; fixed jaw face at the tip
    const r = lerp(70, 40, seg(t, s('l3') - 0.8, s('l3') + 0.6, easeOut));
    cal.g.visible = showA && t > s('l2') + 0.5;
    cal.g.position.set(-20, 20 + 38 + (1 - seg(t, s('l2') + 0.5, s('l2') + 1.4, easeOut)) * 60, -8);
    cal.slider.position.x = r; drawLCD(cal.lcdTex, r);
    trackify(head.material, 0);
    const p1 = project(v3(-20, 20, 0), D.camera), p2 = project(v3(20, 20, 0), D.camera);
    const op = win(t, s('l2') + 0.2, s('l4') - 0.3);
    place(A, p1.x, p1.y + 110, op * seg(t, s('l2') + 0.2, s('l2') + 0.6)); place(B, p2.x, p2.y + 110, op * seg(t, s('l2') + 1.6, s('l2') + 2.0));
    dim.setAttribute('x1', p1.x); dim.setAttribute('x2', lerp(p1.x, p2.x, seg(t, s('l2') + 0.6, s('l2') + 2.0))); dim.setAttribute('y1', p1.y + 110); dim.setAttribute('y2', p2.y + 110); dim.style.opacity = op;
    // l4 flat head: length line includes the countersunk head
    const q1 = project(v3(-15, 20, 0), D.camera), q2 = project(v3(-15 + 30 + 8 * 0.62, 20, 0), D.camera);
    const op2 = win(t, s('l4') + 0.6, 1e9);
    dim2.setAttribute('x1', q1.x); dim2.setAttribute('x2', lerp(q1.x, q2.x, seg(t, s('l4') + 0.6, s('l4') + 1.6))); dim2.setAttribute('y1', q1.y + 120); dim2.setAttribute('y2', q2.y + 120); dim2.style.opacity = op2;
    place(lbl2, (q1.x + q2.x) / 2, q1.y + 200, op2);
  });
  D.shots([
    [0, v3(30, 90, 200), v3(5, 25, 0)],
    [s('l2'), v3(0, 50, 190), v3(0, 30, 0)],
    [s('l3'), v3(0, 70, 220), v3(0, 45, 0)],
    [s('l4') - 0.3, v3(0, 70, 220), v3(0, 45, 0)],
    [s('l4') + 0.1, v3(0, 30, 160), v3(0, 20, 0)],
    [ctx.duration, v3(0, 30, 150), v3(0, 20, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
length.sfx = ({ cue }) => [{ t: cue('l3') - 0.8, name: 'slide', gain: 0.4, dur: 1.4 }, { t: cue('l3') + 0.6, name: 'contact', gain: 0.6 }];
