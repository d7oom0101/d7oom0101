// Slides 2-4: why fasteners matter, objectives, course map
import * as THREE from 'three';
import { stage, popIn, fader } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, trackify, paint, castAll, noise1 } from '../engine.js';
import * as K from '../kit.js';

export default function intro(ctx) {
  const D = stage(ctx, { target: v3(0, 60, 0), size: 260 });
  const s = D.s, e = D.e;
  D.header('مقدمة عن المثبّتات والهياكل', 'Fasteners & Structures — Introduction', 0.2, s('i5') - 0.2);
  D.chip([2, 3, 4]);

  // --- a machine frame: base plate + upright + bracket, held by bolts
  const frame = new THREE.Group(); D.add(frame);
  const blue = paint(0x5C86C4, 0.45);
  const base = new THREE.Mesh(new THREE.BoxGeometry(260, 16, 140), blue); base.position.y = 8; frame.add(base);
  const up = new THREE.Mesh(new THREE.BoxGeometry(24, 160, 120), blue); up.position.set(-60, 96, 0); frame.add(up);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(150, 18, 90), paint(0x8FB0DD, 0.45)); arm.position.set(15, 150, 0); frame.add(arm);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 80, 40), paint(0xDDE3EA, 0.4)); motor.rotation.z = Math.PI / 2; motor.position.set(50, 52, 0); frame.add(motor);
  castAll(frame, true, true);
  const bolts = []; const boltMat = K.M.zinc();
  const spots = [[-100, 16, -45], [-100, 16, 45], [100, 16, -45], [100, 16, 45], [20, 159, -30], [20, 159, 30], [70, 159, -30], [70, 159, 30]];
  for (const [x, y, z] of spots) { const b = K.displayBolt({ d: 10, L: 6, mat: boltMat.clone() }); b.position.set(x, y - 6, z); frame.add(b); bolts.push(b); }
  const loose = bolts[5];
  const light = new THREE.Mesh(new THREE.SphereGeometry(8, 24, 16), new THREE.MeshBasicMaterial({ color: 0x1E9E5A })); light.position.set(-60, 186, 0); frame.add(light);
  const stopCard = D.card('<div style="display:flex;gap:22px;align-items:center"><div style="width:30px;height:30px;border-radius:50%;background:#D93A3A"></div><div style="font:700 54px Plex;color:#D93A3A">الخط متوقّف</div><div style="font:700 54px PlexLatin;color:#10213F;direction:ltr">60:00</div></div>', 1460, 230, s('i1') + 0.6, s('i2') - 0.1);

  // --- benefit cards (i3/i4)
  const ben = (icon, txt) => `<div style="display:flex;align-items:center;gap:18px"><div style="font-size:52px">${icon}</div><div style="font:600 36px Plex;color:#10213F;text-align:right">${txt}</div></div>`;
  D.card(ben('⏱', 'استبدال أسرع أثناء الفحص والصيانة'), 1450, 330, s('i3') + 0.1, s('i5') - 0.2);
  D.card(ben('📈', 'إنتاجية أعلى للخط'), 1450, 470, s('i3') + 1.8, s('i5') - 0.2);
  D.card(ben('💲', 'تكاليف وهدر أقل'), 1450, 610, s('i4') + 0.1, s('i5') - 0.2);
  D.card(ben('✔', 'أخطاء وعيوب أقل، دون الحاجة إلى عمالة عالية المهارة'), 1450, 750, s('i4') + 2.0, s('i5') - 0.2);

  // --- objectives (i5-i8)
  const obj = (n, txt, x, y, t0) => D.card(`<div style="display:flex;align-items:center;gap:20px"><div style="width:62px;height:62px;border-radius:50%;background:#003DA5;color:#fff;font:700 36px PlexLatin;display:flex;align-items:center;justify-content:center">${n}</div><div style="font:600 36px Plex;color:#10213F">${txt}</div></div>`, x, y, t0, s('i9') - 0.2);
  D.card('<div style="font:700 56px Plex;color:#003DA5">مخرجات التدريب</div>', 960, 140, s('i5'), s('i9') - 0.2, 'big');
  obj(1, 'تمييز أنواع ودرجات المثبّتات', 1300, 300, s('i6'));
  obj(2, 'التعامل الصحيح مع البراغي والحلقات والصواميل', 620, 300, s('i6') + 2.6);
  obj(3, 'تطبيق التحكّم المرئي', 1300, 450, s('i7'));
  obj(4, 'استخدام مفتاح العزم', 620, 450, s('i7') + 1.8);
  const pct = (big, txt, x, t0) => {
    const d = D.card(`<div style="font:700 110px PlexLatin;color:#FF7A00;direction:ltr" class="num">0%</div><div style="font:600 36px Plex;color:#10213F">${txt}</div>`, x, 700, t0, s('i9') - 0.2);
    D.on(t => { d.querySelector('.num').textContent = Math.round(big * seg(t, t0 + 0.2, t0 + 1.4, easeOut)) + '%'; });
  };
  pct(100, 'اكتشاف عيوب المثبّتات', 1300, s('i8'));
  pct(85, 'إصلاح العيوب على الأقل', 620, s('i8') + 2.4);

  // --- course map (i9): 3D row of parts lighting up in turn
  const row = new THREE.Group(); row.position.set(0, 0, 160); row.scale.setScalar(2.4); D.add(row);
  const items = [
    [K.circlip({ r: 10 }), 'أنواع المرابط'], [K.displayBolt({ d: 10, L: 30, stamp: { text: '8.8' } }), 'البراغي'],
    [K.washer({ id: 10.5, od: 24, t: 2.5 }), 'الحلقات'], [K.hexNut({}), 'الصواميل'],
    [K.torqueWrench({ L: 120 }), 'مفتاح العزم'], [K.displayBolt({ d: 10, L: 30, mat: K.M.rust() }), 'العيوب'],
  ];
  const t9 = s('i9'), d9 = e('i9') - t9;
  items.forEach(([o, name], i) => {
    o.position.set(125 - i * 50, 0, 0); if (i === 4) { o.scale.setScalar(0.35); o.position.y = 6; }
    castAll(o); row.add(o);
    const mats = []; o.traverse(m => { if (m.material) { m.material = m.material.clone(); mats.push(m.material); } });
    const tOn = t9 + 0.3 + i * d9 / 6.4;
    D.track(mats, tOn, tOn + d9 / 6.4 + 0.2);
    D.label(name, [o, v3(0, 50 / o.scale.x, 0)], [0, -90], tOn - 0.1, ctx.duration + 1, { noLeader: true, style: { fontSize: '30px' } });
    D.on(t => popIn(o, t, t9 - 0.3 + i * 0.12, 1e9, o.scale.x > 0.5 ? 1 : 0.35));
  });

  D.on(t => {
    // frame visible until objectives; loose bolt wobbles and glows during i1
    const fk = 1 - seg(t, s('i5') - 0.6, s('i5'));
    frame.visible = fk > 0.01; frame.position.y = -seg(t, s('i5') - 0.6, s('i5'), easeIO) * 300;
    loose.position.y = 159 - 6 + 9 * seg(t, s('i1') + 0.2, s('i1') + 1.2, easeOut) * (1 - seg(t, s('i2') + 0.5, s('i2') + 1.4));
    loose.rotation.y = loose.position.y * 0.3; loose.rotation.z = 0.04 * noise1(t * 3) * win(t, s('i1'), s('i2'));
    trackify(loose.userData.bolt.userData.mat, win(t, s('i1') + 0.2, s('i2') + 0.3));
    light.material.color.set(t > s('i1') + 0.6 && t < s('i2') + 0.4 ? 0xD93A3A : 0x1E9E5A);
    // i2: wave of highlight over all bolts
    bolts.forEach((b, i) => { if (b !== loose) trackify(b.userData.bolt.userData.mat, win(t, s('i2') + 1.2 + i * 0.25, s('i2') + 2.6 + i * 0.25, 0.3)); });
    // gentle explode on i2 ("تربط القطع معًا")
    const ex = win(t, s('i2') + 0.3, s('i3') - 0.2, 0.8);
    arm.position.y = 150 + ex * 40; up.position.y = 96 + ex * 18;
    for (let i = 4; i < 8; i++) bolts[i].position.y = 159 - 6 + ex * 75 + (i === 5 ? loose.position.y - 153 : 0);
    row.visible = t > t9 - 0.4;
  });

  D.shots([
    [0, v3(330, 300, 470), v3(0, 80, 0)],
    [s('i1') + 1.0, v3(170, 260, 250), v3(30, 140, 0)],
    [s('i2') + 0.2, v3(380, 330, 520), v3(0, 85, 0)],
    [s('i5') - 0.6, v3(-120, 300, 620), v3(-40, 80, 0)],
    [s('i5'), v3(0, 400, 900), v3(0, 0, 0)],
    [t9 - 0.6, v3(0, 400, 900), v3(0, 0, 0)],
    [t9 + 0.4, v3(0, 260, 900), v3(0, 40, 160)],
    [ctx.duration, v3(0, 240, 860), v3(0, 40, 160)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
intro.sfx = ({ cue }) => [
  { t: cue('i1') + 0.25, name: 'knock', gain: 0.4 }, { t: cue('i2') + 0.3, name: 'whoosh', gain: 0.25 },
  { t: cue('i3') + 0.1, name: 'pop', gain: 0.25 }, { t: cue('i4') + 0.1, name: 'pop', gain: 0.25 },
  { t: cue('i8') + 1.4, name: 'chime', gain: 0.2 }, { t: cue('i9'), name: 'whoosh', gain: 0.25 },
];
