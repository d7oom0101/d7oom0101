// Slides 20-22: nuts — joint cutaway (clearance), motion conversion, nut class >= bolt class, metric/standard nut marks
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, threadGeometry, castAll, trackify, paint, cutaway, hexGeometry } from '../engine.js';
import * as K from '../kit.js';

export default function nuts(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('الصواميل', 'Nuts');
  D.chip([20, 21, 22]);
  // n1: a nut cut in half shows the internal thread
  const n1 = K.hexNut({ d: 16, s: 26, m: 14 }); n1.scale.setScalar(2.2); D.add(n1); cutaway(n1, new THREE.Vector3(0, 0, -1), 0);
  D.label('سن داخلي', [n1, v3(-6, 7, 0)], [-220, -140], s('n1') + 0.6, e('n1') + 0.3, { track: true });
  // n2: bolted joint cutaway with clearance holes
  const J = K.boltedJoint({ d: 10, L: 40, plates: [10, 10], washerTop: true, washerBottom: true }); D.add(J.g);
  J.plates.forEach(p => { p.geometry.dispose(); }); // replace plates with bigger-hole plates
  J.plates.forEach((p, i) => { const np = K.plate({ w: 90, dpt: 60, t: 10, holes: [[0, 0, 6.6]], mat: paint(i ? 0x8FB0DD : 0x5C86C4, 0.5) }); np.position.copy(p.position); J.g.remove(p); J.g.add(np); J.plates[i] = np; });
  cutaway(J.g, new THREE.Vector3(0, 0, -1), 0);
  D.label('أجزاء للربط', v3(35, 10, 0), [200, 60], s('n2') + 1.0, e('n2') + 0.3);
  D.label('خلوص ضروري لإدخال البرغي', v3(5.8, 15, 0), [260, -170], s('n2') + 2.6, e('n2') + 0.3, { track: true });
  const nutMat = J.nut.userData.mat; D.track(nutMat, s('n2') + 0.3, s('n2') + 2.4);
  // n3: lead screw -> nut block travels
  const ls = new THREE.Group(); D.add(ls);
  const rod = new THREE.Mesh(threadGeometry({ dMajor: 14, pitch: 4, y0: -80, y1: 80, perPitch: 24 }), K.M.zinc()); rod.rotation.z = Math.PI / 2; ls.add(rod);
  const blk = new THREE.Mesh(new THREE.BoxGeometry(30, 34, 34), paint(0x5C86C4, 0.4)); ls.add(blk);
  castAll(ls);
  D.track(blk.material, s('n3') + 0.4, e('n3') + 0.2);
  // n4: bolt 8.8 + nut 8 : nut >= bolt
  const b88 = K.displayBolt({ d: 12, L: 30, s: 19, k: 7.5, stamp: { text: '8.8' } }); b88.position.set(30, 0, 0); D.add(b88);
  const nut8 = K.hexNut({ d: 12, s: 19, m: 10, stamp: { text: '8', font: 120 } }); nut8.position.set(-30, 0, 0); D.add(nut8);
  D.card('<div style="direction:ltr;font:700 64px PlexLatin;color:#10213F">Nut <span style="color:#FF7A00">≥</span> Bolt</div><div style="font:600 34px Plex;color:#5C6E8A">قوة الصامولة ≥ قوة البرغي</div>', 960, 860, s('n4') + 0.4, s('n5') - 0.2);
  // n5: metric nut classes |4| |5| |6| |8| |10| |12|
  const NC = ['4', '5', '6', '8', '10', '12'];
  const ncRow = NC.map((c, i) => { const n = K.hexNut({ d: 10, s: 17, m: 8, stamp: { text: '|' + c + '|', font: 120 } }); n.position.set(75 - i * 30, 0, 0); D.add(n); return n; });
  D.track(ncRow[3].userData.mat, s('n5') + 3.5, s('n6') - 0.2);
  D.label('الحد الأدنى', [ncRow[3], v3(0, 9, 0)], [0, -140], s('n5') + 3.5, s('n6') - 0.2, { track: true });
  D.card('<div style="font:600 34px Plex;color:#003DA5">← تزيد الصلابة كلما زاد الرقم</div>', 960, 300, s('n5') + 1.5, s('n6') - 0.2);
  // n6: standard nut marks: two lines / line + dot
  const m1 = K.hexNut({ d: 12, s: 19, m: 10 }); const m2 = K.hexNut({ d: 12, s: 19, m: 10 });
  const mark = (n, dot) => { const d = K.decal(19, (c, w, h) => { c.strokeStyle = '#4A5563'; c.fillStyle = '#4A5563'; c.lineWidth = w * 0.05; c.lineCap = 'round'; for (const a of dot ? [0] : [0, Math.PI / 3 * 2]) { c.beginPath(); c.moveTo(w / 2 + Math.cos(a - 1.57) * w * 0.32, h / 2 + Math.sin(a - 1.57) * h * 0.32); c.lineTo(w / 2 + Math.cos(a - 1.57) * w * 0.44, h / 2 + Math.sin(a - 1.57) * h * 0.44); c.stroke(); } if (dot) { c.beginPath(); c.arc(w / 2 + Math.cos(0.52) * w * 0.38, h / 2 + Math.sin(0.52) * h * 0.38, w * 0.04, 0, 7); c.fill(); } }); d.position.y = 10.05; n.add(d); };
  mark(m1, false); mark(m2, true); m1.position.x = 30; m2.position.x = -30; D.add(m1); D.add(m2);
  D.label('خطّين', [m1, v3(0, 10, 0)], [0, -140], s('n6') + 0.8, 1e9, { track: true });
  D.label('خط ونقطة', [m2, v3(0, 10, 0)], [0, -140], s('n6') + 1.8, 1e9, { track: true });
  D.card('<div style="font:600 36px Plex;color:#10213F">المطلوب: الفئة <span style="font-family:PlexLatin">5</span> أو <span style="font-family:PlexLatin">8</span></div>', 960, 880, s('n6') + 3.0, 1e9);
  D.on(t => {
    n1.visible = t < s('n2') - 0.2; n1.rotation.y = -0.4 + t * 0.15;
    const j = t > s('n2') - 0.3 && t < s('n3') - 0.2; J.g.visible = j;
    const ins = seg(t, s('n2') + 0.2, s('n2') + 1.6, easeOut);
    J.bolt.position.y = J.top + 2 + 6.4 + (1 - ins) * 70; J.nut.position.y = -2 - (1 - seg(t, s('n2') + 1.0, s('n2') + 2.2, easeOut)) * 40; J.nut.rotation.y = -seg(t, s('n2') + 1.0, s('n2') + 2.2) * 6;
    ls.visible = t > s('n3') - 0.3 && t < s('n4') - 0.2;
    const ang = seg(t, s('n3') + 0.3, e('n3') + 0.4, easeIO) * Math.PI * 2 * 8; rod.rotation.x = ang; blk.position.x = 50 - ang / (Math.PI * 2) * 4 * 2.6;
    const n4 = t > s('n4') - 0.3 && t < s('n5') - 0.2; b88.visible = n4; nut8.visible = n4;
    ncRow.forEach((n, i) => { n.visible = t > s('n5') - 0.3 && t < s('n6') - 0.2; popIn(n, t, s('n5') - 0.3 + i * 0.1, s('n6') - 0.2); });
    m1.visible = m2.visible = t > s('n6') - 0.3; popIn(m1, t, s('n6') - 0.3); popIn(m2, t, s('n6') - 0.1);
  });
  D.shots([
    [0, v3(40, 110, 120), v3(0, 12, 0)], [s('n2') - 0.3, v3(40, 110, 120), v3(0, 12, 0)],
    [s('n2'), v3(30, 40, 170), v3(0, 5, 0)], [s('n3') - 0.3, v3(20, 40, 160), v3(0, 5, 0)],
    [s('n3'), v3(0, 90, 260), v3(0, 0, 0)], [s('n4') - 0.3, v3(0, 90, 260), v3(0, 0, 0)],
    [s('n4'), v3(0, 120, 170), v3(0, 8, 0)], [s('n5') - 0.3, v3(0, 120, 170), v3(0, 8, 0)],
    [s('n5'), v3(0, 150, 160), v3(0, 0, 0)], [s('n6') - 0.3, v3(0, 150, 160), v3(0, 0, 0)],
    [s('n6'), v3(0, 130, 120), v3(0, 5, 0)], [ctx.duration, v3(0, 130, 110), v3(0, 5, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
nuts.sfx = ({ cue }) => [{ t: cue('n2') + 1.6, name: 'contact', gain: 0.4 }, { t: cue('n3') + 0.3, name: 'thread', gain: 0.3, dur: 2.5 }, { t: cue('n4') + 0.4, name: 'pop', gain: 0.25 }, { t: cue('n5') + 3.5, name: 'pop', gain: 0.25 }];
