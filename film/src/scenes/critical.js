// Slides 48-49: is the fastener critical? three questions; troubleshooting checklist (Application / Method / Condition)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, noise1 } from '../engine.js';
import * as K from '../kit.js';

export default function critical(ctx) {
  const D = stage(ctx, { target: v3(0, 30, 0), size: 200 });
  const s = D.s, e = D.e;
  D.header('كيف نحدّد إذا كان المثبّت حرجًا؟', 'Is the fastener critical? — Troubleshooting');
  D.chip([48, 49]);
  // cam held by a bolt (cr2)
  const camG = new THREE.Group(); D.add(camG);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 100, 32), K.M.stainless()); shaft.rotation.x = Math.PI / 2; camG.add(shaft);
  const camShape = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; const r = 30 + 14 * Math.pow(Math.max(0, Math.cos(a)), 3); i ? camShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : camShape.moveTo(r, 0); }
  const cg = new THREE.ExtrudeGeometry(camShape, { depth: 14, bevelEnabled: false }); cg.translate(0, 0, -7);
  const cam = new THREE.Mesh(cg, paint(0x8FB0DD, 0.4)); camG.add(cam);
  const cb = K.socketScrew({ d: 6, L: 10 }); cb.rotation.x = Math.PI / 2; cb.position.set(0, 18, 7); cam.add(cb); castAll(camG);
  D.track(cb.userData.mat, s('cr2') + 1.4, e('cr2') + 0.2);
  D.label('برغي توقيت الكامة', [cb, v3(0, 12, 0)], [220, -150], s('cr2') + 1.4, e('cr2') + 0.2, { track: true });
  const qs = ['هل المثبّت حاسم لنقطة العمل؟', 'لو فيه عيب، هل يسبّب توقّف؟', 'هل نحتاج فحص مستمر له؟'];
  qs.forEach((q, i) => D.card(`<div style="display:flex;align-items:center;gap:18px"><div style="width:56px;height:56px;border-radius:50%;background:#003DA5;color:#fff;font:700 32px PlexLatin;display:flex;align-items:center;justify-content:center">${i + 1}</div><div style="font:600 36px Plex">${q}</div></div>`, 1420, 300 + i * 115, s('cr' + (i + 2)), s('cr5') - 0.2, 'card', { padding: '16px 30px' }));
  // feed jam (cr3): bottles bunched on a short conveyor
  const feed = new THREE.Group(); feed.position.set(0, 0, 260); D.add(feed);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(260, 8, 70), paint(0x3A4656, 0.7)); belt.position.y = -4; feed.add(belt);
  const bottles = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 60, 32), paint(0xF4F6F9, 0.4)); b.position.y = 30; feed.add(b); bottles.push(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 8, 24), paint(0x003DA5, 0.4)); c.position.y = 34; b.add(c); }
  const guide = new THREE.Mesh(new THREE.BoxGeometry(80, 6, 4), K.M.zinc()); guide.position.set(30, 40, 24); feed.add(guide);
  const gb = K.displayBolt({ d: 6, L: 8, stamp: null }); gb.position.set(30, 43, 26); gb.rotation.x = Math.PI / 2; feed.add(gb);
  castAll(feed);
  D.track(gb.userData.bolt.userData.mat, s('cr3') + 1.2, e('cr3') + 0.2);
  // inspection (cr4)
  const mag = el('big', '<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="80" cy="80" r="58" fill="rgba(234,242,251,.5)" stroke="#003DA5" stroke-width="12"/><path d="M122 122 L180 180" stroke="#003DA5" stroke-width="20" stroke-linecap="round"/></svg>');
  // checklist columns (cr5-cr7)
  const col = (title, en, items, x, t0) => D.card(`<div style="font:700 40px Plex;color:#003DA5">${title} <span style="font:600 24px PlexLatin;color:#5C6E8A">${en}</span></div>${items.map(i => `<div style="font:600 30px Plex;color:#10213F;margin:10px 0;text-align:right">☐ ${i}</div>`).join('')}`, x, 540, t0, 1e9, 'card', { padding: '26px 34px' });
  col('التطبيق', 'Application', ['هل المثبّت ضروري للتطبيق؟', 'هل هو النوع المناسب؟', 'هل مادته مناسبة؟', 'ما أهميته؟'], 1500, s('cr5'));
  col('الطريقة', 'Method', ['هل الاتجاه/الموضع صحيح؟', 'هل الطول مناسب؟', 'هل استخدام الحلقة مناسب؟', 'هل طريقة القفل مناسبة؟'], 960, s('cr6'));
  col('الحالة', 'Condition', ['هل الشد مناسب؟', 'هل الأسنان سليمة؟', 'هل الرأس سليم؟', 'هل الصامولة سليمة؟', 'هل يوجد تلوث؟'], 420, s('cr7'));
  D.card('<div style="font:700 36px Plex;color:#B54F00">نقطة واحدة تحتاج انتباه؟ اتبع المعيار <span style="font-family:PlexLatin">(Standard)</span> لحلّها</div>', 960, 960, s('cr7') + 4.0, 1e9);
  D.on(t => {
    camG.visible = t < s('cr3') - 0.2; cam.rotation.z = -t * 2;
    feed.visible = t > s('cr3') - 0.3 && t < s('cr5') - 0.2;
    const jam = seg(t, s('cr3') + 1.0, s('cr3') + 2.0, easeOut);
    bottles.forEach((b, i) => { const free = ((t * 60 + i * 45) % 270) - 135; const stuck = 40 - i * 29; b.position.x = lerp(free, stuck, jam); b.rotation.z = i === 0 ? jam * 0.35 : 0; });
    gb.position.z = 26 + jam * 6; guide.rotation.y = jam * 0.25;
    place(mag, 1450, 690, win(t, s('cr4') + 0.3, s('cr5') - 0.2), 1 + 0.05 * Math.sin(t * 3));
  });
  D.shots([[0, v3(80, 90, 190), v3(0, 10, 0)], [s('cr3') - 0.3, v3(80, 90, 190), v3(0, 10, 0)], [s('cr3'), v3(100, 140, 470), v3(0, 20, 260)], [s('cr5') - 0.3, v3(100, 140, 470), v3(0, 20, 260)], [s('cr5'), v3(0, 700, 900), v3(0, -400, 0)], [ctx.duration, v3(0, 700, 900), v3(0, -400, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
critical.sfx = ({ cue }) => [{ t: cue('cr3') + 1.0, name: 'knock', gain: 0.4 }, { t: cue('cr5'), name: 'pop', gain: 0.25 }, { t: cue('cr6'), name: 'pop', gain: 0.25 }, { t: cue('cr7'), name: 'pop', gain: 0.25 }];
