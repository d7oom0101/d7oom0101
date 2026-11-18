// Slides 28-30: split lock washer, tooth lock washer with slotted (lock) nut on a bearing, retaining rings
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, threadGeometry } from '../engine.js';
import * as K from '../kit.js';

export default function lockwashers(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('حلقات القفل وحلقات التثبيت', 'Lock washers & retaining rings');
  D.chip([28, 29, 30]);
  // split washer under a socket screw on a plate
  const A = new THREE.Group(); D.add(A);
  const pl = K.plate({ w: 90, dpt: 70, t: 8, holes: [[0, 0, 5.4]] }); A.add(pl);
  const sw = K.splitWasher({ id: 10.4, od: 17.5, t: 2.6 }); sw.position.y = 8; A.add(sw);
  const sc = K.socketScrew({ d: 10, L: 26 }); A.add(sc);
  castAll(A);
  D.track(sw.material, s('lw1') + 0.4, e('lw2'));
  D.label('وشرة قفل مشقوقة (سبرنق)', [sw, v3(9, 2, 0)], [260, -120], s('lw1') + 0.8, e('lw2'), { track: true });
  D.card('<div style="font:600 34px Plex;color:#10213F">مقسّاة: أقوى من البراغي والصواميل</div>', 960, 820, s('lw2') + 1.6, e('lw2') + 0.2);
  D.card('<div style="display:flex;align-items:center;gap:22px"><div style="font:700 80px PlexLatin;color:#D93A3A;direction:ltr">1×</div><div style="font:700 38px Plex;color:#10213F">مرة واحدة فقط</div></div>', 960, 940, s('lw2') + 3.8, e('lw2') + 0.2);
  // tooth lock washer + slotted (lock) nut on a shaft with bearing
  const B = new THREE.Group(); B.position.x = 260; D.add(B);
  const shaft = new THREE.Mesh(threadGeometry({ dMajor: 30, pitch: 2, y0: -30, y1: 30, perPitch: 12 }), K.M.zinc()); shaft.rotation.z = Math.PI / 2; B.add(shaft);
  const keyway = new THREE.Mesh(new THREE.BoxGeometry(60, 3, 4), K.M.dark()); keyway.position.set(0, 14.6, 0); B.add(keyway);
  const brg = new THREE.Mesh(new THREE.LatheGeometry([[15.2, -8], [30, -8], [30, 8], [15.2, 8], [15.2, -8]].map(p => new THREE.Vector2(p[0], p[1])), 64), K.M.stainless()); brg.rotation.z = Math.PI / 2; brg.position.x = -22; B.add(brg);
  const tw = K.toothWasher({ id: 30.5, od: 46, t: 1.2, teeth: 14, external: true }); tw.rotation.z = Math.PI / 2; B.add(tw);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 3), tw.material); tab.position.set(0, 14, 0); B.add(tab);
  const ln = new THREE.Group(); const lnBody = new THREE.Mesh(new THREE.LatheGeometry([[15.1, 0], [24, 0], [24, 8], [15.1, 8], [15.1, 0]].map(p => new THREE.Vector2(p[0], p[1])), 64), K.M.black()); ln.add(lnBody);
  for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.BoxGeometry(4, 8.2, 5), K.M.dark()); const a = i * Math.PI / 2; n.position.set(Math.cos(a) * 22.5, 4, Math.sin(a) * 22.5); n.rotation.y = -a; ln.add(n); }
  ln.rotation.z = -Math.PI / 2; B.add(ln);
  castAll(B);
  D.track(tw.material, s('lw3') + 0.2, e('lw4') + 0.2);
  D.label('السن <span class="ltr" style="font-family:PlexLatin">Tooth</span>', v3(260 + 8, 22, 0), [120, -150], s('lw4') + 1.0, e('lw4') + 0.2, { track: true });
  D.label('أخدود <span class="ltr" style="font-family:PlexLatin">Notch</span>', v3(260 + 12, 22, 0), [260, -40], s('lw4') + 1.6, e('lw4') + 0.2);
  D.label('محمل كروي', v3(260 - 22, 30, 0), [-200, -120], s('lw4') + 0.3, e('lw4') + 0.2);
  ['الصدمات', 'الاهتزاز', 'تغيّر الحرارة'].forEach((x, i) => D.card(`<div style="font:600 34px Plex">${x}</div>`, 1520, 360 + i * 95, s('lw3') + 1.6 + i * 0.6, s('lw4') - 0.1, 'card', { padding: '14px 30px' }));
  // retaining rings: external on a shaft, internal in a bore
  const C = new THREE.Group(); C.position.x = 540; D.add(C);
  const sh2 = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 90, 48), K.M.stainless()); sh2.rotation.z = Math.PI / 2; C.add(sh2);
  const groove = new THREE.Mesh(new THREE.TorusGeometry(12, 0.6, 8, 48), K.M.dark()); groove.rotation.y = Math.PI / 2; groove.position.x = 10; C.add(groove);
  const gear = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 16, 24), paint(0x8FB0DD, 0.4)); gear.rotation.z = Math.PI / 2; gear.position.x = -2; C.add(gear);
  const ext = K.circlip({ r: 11.4, w: 2.4, t: 1.2 }); ext.rotation.z = Math.PI / 2; ext.position.x = 10; C.add(ext);
  const bore = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 30, 48, 1, true), paint(0xC9D6E8, 0.5)); bore.material.side = THREE.DoubleSide; bore.rotation.z = Math.PI / 2; bore.position.set(0, 0, -110); C.add(bore);
  const intR = K.circlip({ r: 30, w: 3, t: 1.4, external: false }); intR.rotation.z = Math.PI / 2; intR.position.set(10, 0, -110); C.add(intR);
  castAll(C);
  D.track(ext.children[0].material, s('lw5') + 0.6, e('lw6') + 0.2);
  D.label('خارجية', [ext, v3(0, 0, 0)], [140, -150], s('lw6') + 0.2, 1e9);
  D.label('داخلية', [intR, v3(0, 0, 0)], [160, 110], s('lw6') + 1.2, 1e9);
  D.card('<div style="font:600 34px Plex;color:#10213F">تمنع الحركة أو الإزاحة المحورية</div>', 960, 880, s('lw5') + 2.0, s('lw6') - 0.1);
  D.on(t => {
    // split washer: screw goes in and flattens the washer
    const down = seg(t, s('lw2') + 0.2, s('lw2') + 2.0, easeIO);
    sc.position.y = 8 + 2.6 - 1.4 * down + (1 - seg(t, s('lw1') + 0.2, s('lw1') + 1.2, easeOut)) * 30;
    sc.rotation.y = -down * 12; sw.scale.y = lerp(1, 0.55, down);
    // tooth washer: nut turns, tab enters notch
    const tn = seg(t, s('lw4') + 0.3, s('lw4') + 2.2, easeIO);
    ln.position.x = 2 + (1 - tn) * 6; ln.rotation.x = tn * 1.2; tw.position.x = 0.3; tab.position.x = 0.3; tab.position.y = 14 + 7 * seg(t, s('lw4') + 2.2, s('lw4') + 2.8, easeOut);
    // external ring snaps into the groove
    const ek = seg(t, s('lw5') + 0.6, s('lw5') + 1.8, easeOut);
    ext.position.x = 10 + (1 - ek) * 45; ext.scale.set(1, lerp(1.2, 1, ek), lerp(1.2, 1, ek));
  });
  D.shots([
    [0, v3(60, 80, 120), v3(0, 14, 0)], [s('lw3') - 0.4, v3(55, 60, 110), v3(0, 14, 0)],
    [s('lw3'), v3(330, 80, 150), v3(260, 5, 0)], [s('lw5') - 0.4, v3(320, 70, 140), v3(260, 5, 0)],
    [s('lw5'), v3(600, 70, 150), v3(540, 0, 0)], [s('lw6') + 0.3, v3(600, 70, 150), v3(540, 0, 0)],
    [ctx.duration, v3(680, 140, 260), v3(540, 0, -50)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
lockwashers.sfx = ({ cue }) => [{ t: cue('lw2') + 0.2, name: 'slide', gain: 0.3, dur: 1.8 }, { t: cue('lw2') + 2.0, name: 'contact', gain: 0.4 }, { t: cue('lw4') + 2.6, name: 'clink', gain: 0.4 }, { t: cue('lw5') + 1.7, name: 'clink', gain: 0.45 }];
