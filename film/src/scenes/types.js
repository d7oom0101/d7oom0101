// Slide 5: removable vs permanent fasteners
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, paint, castAll, steel } from '../engine.js';
import * as K from '../kit.js';

export default function types(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 260 });
  const s = D.s, e = D.e;
  D.header('أنواع المرابط', 'Fastener types', 0.2);
  D.chip([5]);
  // left group (removable) at x>0 (RTL: first on the right)
  const R = new THREE.Group(); R.position.x = 120; D.add(R);
  const P = new THREE.Group(); P.position.x = -130; D.add(P);
  const joint = K.boltedJoint({ d: 10, L: 40, plates: [8, 8] }); joint.g.scale.setScalar(0.9); R.add(joint.g);
  const cot = K.cotterPin({ L: 45 }); cot.position.set(70, 0, -10); cot.rotation.z = 0.3; R.add(cot);
  const ring = K.circlip({ r: 14 }); ring.position.set(-60, 0, 30); R.add(ring);
  const wood = K.driveScrew({ d: 6, L: 40, drive: 'phillips', head: 'flat' }); wood.position.set(40, 0, 60); R.add(wood);
  castAll(R);
  // permanent: riveted plates, glued, welded
  const rp1 = K.plate({ w: 80, dpt: 50, t: 4, holes: [[-20, 0, 2.6], [20, 0, 2.6]] }); P.add(rp1);
  const rp2 = K.plate({ w: 80, dpt: 50, t: 4, holes: [[-20, 0, 2.6], [20, 0, 2.6]] }); rp2.position.y = 4.2; rp2.position.x = 20; P.add(rp2);
  for (const x of [0, 40]) { const r = K.blindRivet({}); r.position.set(x - 20, 8.4, 0); r.userData.mand.visible = false; P.add(r); }
  const tube = K.loctite(); tube.scale.setScalar(0.4); tube.position.set(-75, 0, -20); P.add(tube);
  const w1 = K.plate({ w: 60, dpt: 40, t: 6 }); w1.position.set(10, 0, 70); P.add(w1);
  const w2 = K.plate({ w: 60, dpt: 40, t: 6 }); w2.rotation.z = Math.PI / 2; w2.position.set(10, 0, 70); w2.position.x = 10 + 3; P.add(w2);
  const bead = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 40, 12), steel(0x9C8F7A, 0.6, 0.6)); bead.rotation.x = Math.PI / 2; bead.position.set(9, 7, 70); P.add(bead);
  const glow = new THREE.PointLight(0x66aaff, 0, 80); glow.position.set(9, 10, 70); P.add(glow);
  castAll(P);

  const q = D.card('<div style="font:700 50px Plex;color:#10213F">هل يمكن فكّها دون كسر شيء؟</div>', 960, 170, s('t1') + 0.2, s('t2') + 0.3);
  D.card('<div style="font:700 44px Plex;color:#1E9E5A">✓ قابلة للفك والتركيب</div>', 1420, 860, s('t2'), 1e9);
  D.card('<div style="font:700 44px Plex;color:#D93A3A">✗ غير قابلة للفك</div>', 500, 860, s('t3'), 1e9);
  const L = (txt, obj, off, t0) => D.label(txt, obj, off, t0, 1e9, { style: { fontSize: '30px' } });
  const dt2 = (e('t2') - s('t2')) / 5;
  L('برغي وصامولة', [joint.g, v3(0, 30, 0)], [0, -110], s('t2') + dt2 * 1.4);
  L('مسامير دبوسية', [cot, v3(0, 40, 0)], [80, -60], s('t2') + dt2 * 2.4);
  L('حلقة تثبيت', ring, [-60, 80], s('t2') + dt2 * 3.0);
  L('مسمار خشب', [wood, v3(0, 40, 0)], [70, 70], s('t2') + dt2 * 3.8);
  const dt3 = (e('t3') - s('t3')) / 4;
  L('برشام', [rp2, v3(0, 10, 0)], [-40, -100], s('t3') + dt3 * 1.6);
  L('لصق', [tube, v3(0, 60, 0)], [-60, -60], s('t3') + dt3 * 2.4);
  L('لحام', bead, [40, 90], s('t3') + dt3 * 3.1);

  D.on(t => {
    // t2: the bolted joint actually comes apart and goes back
    const k = win(t, s('t2') + 0.3, s('t2') + 2.4, 0.6);
    joint.bolt.position.y = joint.top + 2 + 6.4 + k * 50; joint.nut.position.y = -2 - k * 30;
    joint.bolt.rotation.y = k * 8;
    R.visible = popIn(R, t, s('t1') - 0.4) > 0;
    P.visible = popIn(P, t, s('t1') - 0.2) > 0;
    // t3: weld glow + try to pull riveted plates: they don't move
    glow.intensity = 2 * win(t, s('t3') + dt3 * 3, s('t3') + dt3 * 4 + 0.5, 0.2) * (0.7 + 0.3 * Math.sin(t * 40));
    rp2.position.y = 4.2 + 0.6 * Math.sin(t * 50) * win(t, s('t3') + 0.2, s('t3') + 1.4, 0.2);
  });
  D.shots([
    [0, v3(0, 200, 520), v3(0, 20, 20)],
    [s('t2') - 0.2, v3(0, 200, 520), v3(0, 20, 20)],
    [s('t2') + 0.6, v3(230, 140, 300), v3(110, 20, 20)],
    [s('t3') - 0.3, v3(230, 140, 300), v3(110, 20, 20)],
    [s('t3') + 0.6, v3(-240, 140, 300), v3(-120, 15, 30)],
    [e('t3'), v3(-240, 140, 300), v3(-120, 15, 30)],
    [ctx.duration, v3(0, 220, 560), v3(0, 20, 20)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
types.sfx = ({ cue }) => [{ t: cue('t2') + 0.3, name: 'slide', gain: 0.3, dur: 1.2 }, { t: cue('t3') + 0.2, name: 'knock', gain: 0.3 }];
