// Slides 37-38: vibration loosening (thread side-slip in cross-section) and the fixes
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, cutaway, noise1 } from '../engine.js';
import * as K from '../kit.js';

export default function vibration(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('الاهتزاز', 'Vibration');
  D.chip([37, 38]);
  const J = K.boltedJoint({ d: 12, L: 44, plates: [10, 10] }); D.add(J.g); cutaway(J.g, new THREE.Vector3(0, 0, -1), 0);
  const nutMat = J.nut.userData.mat;
  D.label('حركة جانبية للسن', v3(6, -6, 0), [260, 80], s('vb2') + 0.5, s('vb3') - 0.2, { track: true });
  D.label('الصامولة تلف وترتخي', [J.nut, v3(0, -5, 0)], [-260, 120], s('vb2') + 3.5, s('vb3') - 0.2, { track: true });
  // fixes row
  const fixes = [[K.nylockNut({ d: 10, s: 17, m: 12 }), 'صواميل قفل', 'Lock nuts'], [K.splitWasher({}), 'حلقات قفل', 'Lock washers'], [K.loctite(), 'مانع تسرّب السن (لوكتايت)', 'Thread locker']];
  fixes.forEach(([o, ar, en], i) => { if (i === 2) o.scale.setScalar(0.45); o.position.set(70 - i * 70, 0, 0); castAll(o); D.add(o); o.visible = false; D.label(`${ar}<br><span style="font:500 22px PlexLatin;color:#5C6E8A">${en}</span>`, [o, v3(0, 0, 14)], [0, 100], (i < 2 ? s('vb3') + 0.4 + i * 0.8 : s('vb4') + 0.3), 1e9, { noLeader: true, style: { fontSize: '30px', textAlign: 'center', lineHeight: '1.15' }, track: t => i < 2 ? t < s('vb4') : t > s('vb4') }); });
  D.on(t => {
    J.g.visible = t < s('vb3') - 0.2;
    const v = win(t, s('vb2'), s('vb3') - 0.2, 0.3);
    J.plates[1].position.x = v * Math.sin(t * 38) * 1.0;
    J.g.position.x = v * noise1(t * 3, 2) * 0.6;
    const loosen = seg(t, s('vb2') + 2.0, e('vb2'), easeIO);
    J.nut.rotation.y = loosen * 2.6; J.nut.position.y = -2 - loosen * 2.6 / (Math.PI * 2) * 1.75 * 1;
    trackify(nutMat, win(t, s('vb2') + 3.0, s('vb3') - 0.2));
    fixes.forEach(([o], i) => { const t0 = i < 2 ? s('vb3') + i * 0.6 : s('vb4'); o.visible = t > t0 - 0.2; popIn(o, t, t0 - 0.2, 1e9, i === 2 ? 0.45 : 1); o.rotation.y = t * 0.4; });
  });
  D.shots([[0, v3(40, 30, 120), v3(0, 0, 0)], [s('vb3') - 0.3, v3(30, 20, 105), v3(0, 0, 0)], [s('vb3'), v3(0, 80, 190), v3(0, 8, 0)], [ctx.duration, v3(0, 80, 180), v3(0, 8, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
vibration.sfx = ({ cue }) => [{ t: cue('vb2'), name: 'line_ambience', gain: 0.4, dur: 6 }, { t: cue('vb3'), name: 'pop', gain: 0.25 }, { t: cue('vb4'), name: 'pop', gain: 0.25 }];
