// Slides 23-24: nut types; nylon insert lock nut (cutaway), single use
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, threadGeometry, castAll, trackify, cutaway } from '../engine.js';
import * as K from '../kit.js';

export default function nuttypes(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('أنواع الصواميل', 'Types of nuts');
  D.chip([23, 24]);
  const defs = [['nt1', K.hexNut({ d: 10, s: 17, m: 9 }), 'سداسية', 'Hexagonal'], ['nt2', K.wingNut({ d: 9 }), 'مجنّحة', 'Wing'], ['nt3', K.flangeNut({ d: 10, s: 15, m: 10 }), 'أم شفة', 'Flange'], ['nt4', K.slottedNut({ d: 10, s: 17, m: 12 }), 'مقطوعة', 'Slotted']];
  const items = defs.map(([cue, o, ar, en], i) => {
    o.position.x = 66 - i * 44; castAll(o); D.add(o);
    const ms = []; o.traverse(m => { if (m.material && !m.material.transparent) { m.material = m.material.clone(); ms.push(m.material); } });
    D.track(ms, s(cue) - 0.1, e(cue) + 0.3);
    D.label(`${ar} <span style="font:500 24px PlexLatin;color:#5C6E8A">${en}</span>`, [o, v3(0, 0, 14)], [0, 100], s('nt1') - 0.3 + i * 0.15, s('nt5') - 0.3, { noLeader: true, style: { fontSize: '30px' }, track: t => t > s(cue) - 0.1 && t < e(cue) + 0.3 });
    return o;
  });
  // cotter pin through the slotted nut (nt4)
  const cp = K.cotterPin({ L: 30, d: 2.4 }); cp.rotation.z = Math.PI / 2; D.add(cp); cp.visible = false;
  // nylock cutaway on a bolt
  const ny = K.nylockNut({ d: 12, s: 19, m: 14 }); D.add(ny); cutaway(ny, new THREE.Vector3(0, 0, -1), 0);
  const nyMat = ny.userData.nylon || null; let nylonMat = null; ny.traverse(o => { if (o.material && o.material.color && o.material.color.getHex() === 0x2b6fd6) nylonMat = o.material; });
  const rod = new THREE.Mesh(threadGeometry({ dMajor: 12, pitch: 1.75, y0: -40, y1: 30 }), K.M.zinc()); D.add(rod); castAll(ny); rod.castShadow = true;
  D.label('حلقة نايلون تخنق سن البرغي', v3(-6, 12, 0), [-300, -150], s('nt5') + 1.2, s('nt6') - 0.2, { track: true });
  const once = D.card('<div style="display:flex;align-items:center;gap:26px"><div style="font:700 110px PlexLatin;color:#D93A3A;direction:ltr">1×</div><div style="font:700 44px Plex;color:#10213F">تُستخدم مرة واحدة فقط</div></div>', 1380, 300, s('nt6'), 1e9);
  D.on(t => {
    const show = t < s('nt5') - 0.3;
    items.forEach((o, i) => { o.visible = show; if (show) popIn(o, t, s('nt1') - 0.4 + i * 0.12, s('nt5') - 0.3); });
    items[1].rotation.y = seg(t, s('nt2') + 0.4, e('nt2'), easeIO) * Math.PI * 4; // finger-spin
    cp.visible = t > s('nt4') + 1.0 && show; cp.position.set(items[3].position.x + 18 - 18 * seg(t, s('nt4') + 1.0, s('nt4') + 2.0, easeOut), 10.5, 0);
    ny.visible = rod.visible = t > s('nt5') - 0.3;
    ny.rotation.y = t * 0.2;
    const thread = seg(t, s('nt5') + 0.3, s('nt5') + 3.0, easeIO); rod.position.y = -40 + thread * 22;
    if (nylonMat) nylonMat.color.set(t > s('nt5') + 1.2 ? 0xFF7A00 : 0x2B6FD6);
  });
  D.shots([
    [0, v3(0, 120, 210), v3(0, 6, 0)], [s('nt2') - 0.2, v3(0, 120, 210), v3(0, 6, 0)],
    [s('nt4'), v3(-40, 80, 120), v3(-66, 8, 0)], [s('nt5') - 0.4, v3(-40, 80, 120), v3(-66, 8, 0)],
    [s('nt5'), v3(20, 50, 110), v3(0, 8, 0)], [ctx.duration, v3(30, 60, 120), v3(0, 8, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
nuttypes.sfx = ({ cue }) => [{ t: cue('nt2') + 0.4, name: 'slide', gain: 0.25, dur: 1.5 }, { t: cue('nt4') + 2.0, name: 'clink', gain: 0.35 }, { t: cue('nt5') + 0.3, name: 'slide', gain: 0.3, dur: 2.5 }, { t: cue('nt6'), name: 'stamp', gain: 0.4 }];
