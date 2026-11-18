// Slide 46: tool check — worn/broken spanner, cracked Allen key, spanner must match (3/8 nut with 15 mm spanner = wrong)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint } from '../engine.js';
import * as K from '../kit.js';

export default function toolcheck(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('فحص الأداة', 'Tool check');
  D.chip([46]);
  const sp = K.openSpanner({ size: 17, L: 120, label: '17 mm' }); D.add(sp); castAll(sp);
  // worn jaw tips: dark chips
  for (const z of [-9.5, 9.5]) { const chip = new THREE.Mesh(new THREE.BoxGeometry(3, 5.4, 2.5), new THREE.MeshBasicMaterial({ color: 0x3A3F46 })); chip.position.set(-15.5, 0, z); sp.add(chip); }
  D.label('أطراف مهترئة', [sp, v3(-17, 3, 9)], [-200, -120], s('tc1') + 1.2, s('tc2') - 0.2, { track: true });
  D.card('<div style="font:600 34px Plex">المعيب: تخلّص منه — أو يشحذه شخص مؤهّل فقط</div>', 960, 900, s('tc1') + 3.0, s('tc2') - 0.2);
  const key = K.allenKey({ s: 8, L1: 70, L2: 30 }); key.rotation.z = Math.PI / 2; key.position.set(0, 4, 0); D.add(key); castAll(key);
  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9, 0.6), new THREE.MeshBasicMaterial({ color: 0xD93A3A })); crack.position.set(0, 72, 0); key.add(crack);
  D.label('تشقق في المفتاح: لا تستخدمه', [key, v3(0, 72, 0)], [-60, -170], s('tc2') + 0.4, s('tc3') - 0.2, { track: true });
  const nut = K.hexNut({ d: 9.5, s: 14.3, m: 8 }); nut.position.set(0, 0, 0); D.add(nut); castAll(nut);
  const sp15 = K.openSpanner({ size: 15, L: 100, label: '15 mm' }); D.add(sp15); castAll(sp15);
  D.label('<span class="ltr" style="font-family:PlexLatin">3/8" nut + 15 mm</span> = ✗', [nut, v3(0, 10, 0)], [-260, -150], s('tc3') + 1.4, 1e9, { track: true });
  D.on(t => {
    const a = t < s('tc2') - 0.2; sp.visible = a; sp.rotation.y = 0.4 + t * 0.05;
    key.visible = t > s('tc2') - 0.3 && t < s('tc3') - 0.2;
    const c = t > s('tc3') - 0.3; nut.visible = sp15.visible = c;
    const k = seg(t, s('tc3') + 0.3, s('tc3') + 1.2, easeOut); sp15.position.set(lerp(140, 0, k), 4, 0);
    const wob = win(t, s('tc3') + 1.2, 1e9, 0.2) * Math.sin(t * 5) * 0.12; sp15.rotation.y = wob;
    trackify(sp15.userData.mat, win(t, s('tc3') + 1.2, 1e9));
  });
  D.shots([[0, v3(40, 130, 150), v3(20, 0, 0)], [s('tc2') - 0.3, v3(30, 120, 140), v3(10, 0, 0)], [s('tc2'), v3(-50, 90, 120), v3(-35, 5, 0)], [s('tc3') - 0.3, v3(-50, 90, 120), v3(-35, 5, 0)], [s('tc3'), v3(40, 110, 130), v3(20, 4, 0)], [ctx.duration, v3(40, 100, 120), v3(15, 4, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
toolcheck.sfx = ({ cue }) => [{ t: cue('tc3') + 1.2, name: 'knock', gain: 0.35 }];
