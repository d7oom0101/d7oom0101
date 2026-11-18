// Slides 31-32: pins and rivets (blind rivet sequence in cross-section)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, cutaway } from '../engine.js';
import * as K from '../kit.js';

const PINS = [['pr2', () => K.cotterPin({ L: 45 }), 'بن شق', 'Split pin', ['دبوس محور', 'غير دقيق']],
  ['pr3', () => K.rClip({ L: 45 }), 'بن منحني', 'Pined (R) pin', ['يسمح بالفك السريع', 'قابل لإعادة الاستخدام']],
  ['pr4', () => K.dowel({ d: 6, L: 45 }), 'بن مسطح / مجرد', 'Flat / Stripped pin', ['يضمن التحديد', 'اتصال سهل']],
  ['pr5', () => K.rollPin({ d: 7, L: 45 }), 'بن مرن', 'Elastic pin', ['غير دقيق', 'مقاومة جيدة للاهتزاز والقص', 'يمكن إدخال دبوس آخر بداخله']],
  ['pr6', () => K.taperPin({ d: 7, L: 45 }), 'بن مدبّب', 'Taper pin', ['مقاومة جيدة للاهتزازات', 'محاذاة وتثبيت دقيق (صلابة عالية)']]];
export default function pins(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('أنواع البنوز والبرشام', 'Pins & rivets');
  D.chip([31, 32]);
  const row = PINS.map(([cue, mk, ar, en, props], i) => {
    const o = mk(); o.position.set(96 - i * 48, 0, 0); castAll(o); D.add(o);
    const ms = []; o.traverse(m => { if (m.material) { m.material = m.material.clone(); ms.push(m.material); } });
    D.track(ms, s(cue) - 0.1, e(cue) + 0.3);
    D.label(`${ar}<br><span style="font:500 22px PlexLatin;color:#5C6E8A">${en}</span>`, [o, v3(0, 0, 10)], [0, 90], s('pr1') + i * 0.15, s('pr7') - 0.2, { noLeader: true, style: { fontSize: '28px', textAlign: 'center', lineHeight: '1.15' }, track: t => t > s(cue) - 0.1 && t < e(cue) + 0.3 });
    D.card(`<div style="text-align:right">${props.map(p => `<div style="font:600 32px Plex;margin:4px 0">• ${p}</div>`).join('')}</div>`, 960, 230, s(cue) + 0.2, e(cue) + 0.4);
    return o;
  });
  const inner = K.rollPin({ d: 4, L: 45 }); inner.position.set(96 - 3 * 48, 60, 0); D.add(inner);
  // rivet sequence: plates cutaway, rivet inserted, mandrel pulled, tail bulges, mandrel snaps
  const R = new THREE.Group(); R.position.set(0, 0, 220); D.add(R);
  const p1 = K.plate({ w: 70, dpt: 40, t: 3, holes: [[0, 0, 2.5]], mat: paint(0x8FB0DD, 0.5) }); p1.position.y = 10; R.add(p1);
  const p2 = K.plate({ w: 70, dpt: 40, t: 3, holes: [[0, 0, 2.5]], mat: paint(0x5C86C4, 0.5) }); p2.position.y = 6.8; R.add(p2);
  const rv = K.blindRivet({ d: 4.8, L: 10 }); R.add(rv);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 16), K.M.stainless()); bulb.scale.y = 0.6; R.add(bulb);
  castAll(R); cutaway(R, new THREE.Vector3(0, 0, -1), 220);
  const gun = new THREE.Group(); const gb = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 40, 24), paint(0x24364F, 0.4)); gb.position.y = 20; gun.add(gb); const gh = new THREE.Mesh(new THREE.BoxGeometry(8, 60, 10), paint(0xE0B020, 0.4)); gh.position.set(0, 50, 0); gh.rotation.z = 0.5; gun.add(gh); R.add(gun);
  D.label('زردية البرشام', [gun, v3(0, 30, 0)], [220, -100], s('pr8') - 0.2, 1e9);
  D.label('البرشام', v3(0, 13, 220), [-220, -90], s('pr7') + 0.3, 1e9, { track: true });
  D.card('<div style="font:600 36px Plex">تجميع <b>صلب</b> و<b>غير قابل للإزالة</b></div>', 960, 900, s('pr7') + 0.6, 1e9);
  D.on(t => {
    row.forEach((o, i) => { o.visible = t < s('pr7') - 0.2; popIn(o, t, s('pr1') + i * 0.12, s('pr7') - 0.2); });
    inner.visible = t > s('pr5') + 3.0 && t < s('pr6') - 0.1; inner.position.y = lerp(60, 0, seg(t, s('pr5') + 3.0, s('pr5') + 4.0, easeOut));
    R.visible = t > s('pr7') - 0.4;
    const ins = seg(t, s('pr7') + 0.2, s('pr7') + 1.2, easeOut);
    rv.position.y = 13 + (1 - ins) * 30;
    const pull = seg(t, s('pr8') + 0.6, e('pr8') - 0.6, easeIO);
    rv.userData.mand.position.y = 11 - 5 + 0.6 + pull * 6; rv.userData.ball.position.y = -10 - 0.2 + pull * 5;
    bulb.position.set(0, 13 - 10 - 0.5 + pull * 2.5, 220 - 220); bulb.visible = pull > 0.05; bulb.scale.setScalar(lerp(0.6, 1, pull)); bulb.scale.y = 0.6;
    gun.visible = t > s('pr8') - 0.3; gun.position.set(0, 13 + 12 + (1 - seg(t, s('pr8') - 0.3, s('pr8') + 0.5, easeOut)) * 40 + pull * 3, 0);
    if (t > e('pr8') - 0.5) rv.userData.mand.visible = false;
  });
  D.shots([
    [0, v3(0, 90, 300), v3(0, 22, 0)], [s('pr7') - 0.4, v3(0, 90, 300), v3(0, 22, 0)],
    [s('pr7') + 0.2, v3(40, 40, 330), v3(0, 15, 220)], [ctx.duration, v3(30, 35, 310), v3(0, 15, 220)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
pins.sfx = ({ cue }) => [...['pr2', 'pr3', 'pr4', 'pr5', 'pr6'].map(id => ({ t: cue(id), name: 'pop', gain: 0.2 })), { t: cue('pr8') + 0.6, name: 'slide', gain: 0.35, dur: 1.6 }, { t: cue('pr8', 'end') - 0.5, name: 'rivet', gain: 0.5 }];
