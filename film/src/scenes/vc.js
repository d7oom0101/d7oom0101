// Slide 47: visual control mark — one line from the head/nut to a fixed surface; the head moves, the line splits
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, project } from '../engine.js';
import * as K from '../kit.js';

export function vcJoint(color = 0xF2C200) {
  const g = new THREE.Group();
  const pl = K.plate({ w: 90, dpt: 70, t: 10, holes: [[0, 0, 5.5]], mat: paint(0x8FB0DD, 0.5) }); g.add(pl);
  const w = K.washer({ id: 10.5, od: 21, t: 2 }); w.position.y = 10; g.add(w);
  const rot = new THREE.Group(); rot.position.y = 12; g.add(rot); // the part that may turn
  const b = K.displayBolt({ d: 10, L: 26, stamp: null }); b.position.y = -26 - 12 + 12 - 0; rot.add(b); b.position.y = -26;
  const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });
  const growHead = new THREE.Group(); rot.add(growHead);
  const sTop = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 1.6), paintMat); sTop.position.set(4.25, 6.65, 0); growHead.add(sTop);
  const sSide = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.6, 1.6), paintMat); sSide.position.set(9.95, 3.3, 0); growHead.add(sSide);
  const sPlate = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 1.6), paintMat); sPlate.position.set(10.6 + 7, 10.9, 0); g.add(sPlate);
  const sWash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.2, 1.6), paintMat); sWash.position.set(10.6, 11.4, 0); g.add(sWash);
  castAll(g);
  return { g, rot, parts: [sTop, sSide, sWash, sPlate], paintMat };
}
export default function vc(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('التحكّم المرئي للمرابط', 'Visual control (V.C) of a fastener');
  D.chip([47]);
  const A = vcJoint(); D.add(A.g);
  const pen = new THREE.Group(); const pb = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 60, 24), paint(0xF2C200, 0.4)); pb.position.y = 30; pen.add(pb); const pt = new THREE.Mesh(new THREE.ConeGeometry(4, 8, 24), paint(0x333333, 0.5)); pt.rotation.x = Math.PI; pt.position.y = -4; pen.add(pt); pen.rotation.z = -0.5; D.add(pen); castAll(pen);
  D.label('سطح ثابت', v3(22, 10.4, 0), [220, 90], s('vc2') + 3.6, s('vc3') - 0.1);
  D.label('العلامة انقسمت', v3(10, 11, 0), [-220, -150], s('vc3') + 1.6, s('vc4') + 1.8, { track: true });
  D.card('<div style="font:600 34px Plex;color:#10213F">انزياح العلامة = حركة محتملة → تحقّق من العزم بالطريقة المعتمدة</div>', 960, 920, s('vc4') + 0.4, s('vc5') - 0.2);
  // vc5: green / red examples
  const G = vcJoint(0x1E9E5A), R = vcJoint(0xD93A3A); G.g.position.x = 70; R.g.position.x = -70; D.add(G.g); D.add(R.g);
  D.label('أخضر: حرج، شُدّ بدون مفتاح عزم', [G.g, v3(0, 20, 0)], [0, -170], s('vc5') + 0.6, 1e9, { style: { borderColor: '#1E9E5A', color: '#1E9E5A' } });
  D.label('أحمر: حرج، شُدّ بمفتاح العزم', [R.g, v3(0, 20, 0)], [0, -170], s('vc5') + 3.0, 1e9, { style: { borderColor: '#D93A3A', color: '#D93A3A' } });
  D.on(t => {
    const main = t < s('vc5') - 0.2; A.g.visible = main; G.g.visible = R.g.visible = !main;
    // draw the line: head top -> side -> washer -> plate
    const d = seg(t, s('vc2') + 1.6, s('vc2') + 4.2, easeIO);
    A.parts.forEach((p, i) => { const k = Math.min(1, Math.max(0, d * 4 - i)); p.scale.set(i === 1 || i === 2 ? 1 : Math.max(0.001, k), i === 1 || i === 2 ? Math.max(0.001, k) : 1, 1); p.visible = k > 0.001; });
    pen.visible = main && t > s('vc2') + 1.2 && t < s('vc2') + 4.6;
    const pp = d < 0.25 ? v3(lerp(0, 8.5, d * 4), 6.9 + 12, 0) : d < 0.5 ? v3(10, lerp(18.6, 12.4, (d - 0.25) * 4), 0) : d < 0.75 ? v3(10.6, lerp(13, 10.6, (d - 0.5) * 4), 0) : v3(lerp(10.6, 24.6, (d - 0.75) * 4), 10.6, 0);
    pen.position.copy(pp).add(v3(3, 2, 0));
    // vc3: the head turns a little -> the mark splits
    A.rot.rotation.y = seg(t, s('vc3') + 0.3, s('vc3') + 1.6, easeIO) * 0.45;
    trackify(A.paintMat, 0);
    G.rot.rotation.y = R.rot.rotation.y = 0;
  });
  D.shots([[0, v3(50, 70, 110), v3(5, 10, 0)], [s('vc2') + 1.2, v3(35, 55, 70), v3(8, 11, 0)], [s('vc4'), v3(30, 60, 75), v3(8, 11, 0)], [s('vc5') - 0.2, v3(30, 60, 75), v3(8, 11, 0)], [s('vc5'), v3(0, 120, 230), v3(0, 10, 0)], [ctx.duration, v3(0, 115, 220), v3(0, 10, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
vc.sfx = ({ cue }) => [{ t: cue('vc2') + 1.6, name: 'slide', gain: 0.2, dur: 2.6 }, { t: cue('vc3') + 0.3, name: 'knock', gain: 0.4 }];
