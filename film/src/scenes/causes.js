// Slides 35-36: causes of fastener issues (chart values from the deck) + main factors (fatigue, temperature, vibration)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, noise1 } from '../engine.js';
import * as K from '../kit.js';

const DATA = [['تجميع غير صحيح', 2.9, '#003DA5'], ['تصميم غير كافٍ', 2.3, '#0A6FD6'], ['عزم دوران زائد أو غير كافٍ', 1.4, '#FF7A00'], ['تصنيع ضعيف أو جزء معيب', 1.0, '#8FB0DD']];
export default function causes(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('أسباب مشاكل المثبّتات والعوامل المؤثرة', 'Causes & main factors');
  D.chip([35, 36]);
  const max = 2.9;
  const bars = el('card', `<div style="text-align:right">${DATA.map((d, i) => `<div style="display:flex;align-items:center;gap:22px;margin:16px 0;direction:rtl">
     <div style="width:420px;font:600 34px Plex;color:#10213F">${d[0]}</div>
     <div style="width:760px;height:50px;background:#EEF3F9;border-radius:12px;position:relative"><div class="b${i}" style="height:50px;width:0;background:${d[2]};border-radius:12px"></div></div>
     <div class="v${i}" style="width:80px;font:700 38px PlexLatin;color:#10213F;opacity:0">${d[1].toFixed(1)}</div></div>`).join('')}
     <div style="font:500 24px Plex;color:#5C6E8A;margin-top:8px">المصدر: دراسة، تحقيق في سلامة الهياكل ذات المثبتات الملولبة (القيم كما في العرض)</div></div>`);
  // factors: three 3D vignettes
  const F = new THREE.Group(); D.add(F);
  const J = K.boltedJoint({ d: 10, L: 36, plates: [8, 8], washerTop: false, washerBottom: false }); J.g.position.x = 125; F.add(J.g);
  const hot = K.boltedJoint({ d: 10, L: 36, plates: [8, 8], washerTop: false, washerBottom: false }); F.add(hot.g);
  const vib = K.boltedJoint({ d: 10, L: 36, plates: [8, 8], washerTop: false, washerBottom: false }); vib.g.position.x = -125; F.add(vib.g);
  const heat = new THREE.PointLight(0xFF5A1F, 0, 120); heat.position.set(0, 30, 30); F.add(heat);
  D.label('إجهاد: قص أو شد', [J.g, v3(0, 30, 0)], [0, -150], s('cf3') + 0.3, 1e9, { track: t => t < s('cf4') });
  D.label('درجة الحرارة', [hot.g, v3(0, 30, 0)], [0, -150], s('cf4') + 0.2, 1e9, { track: t => t > s('cf4') && t < s('cf5') });
  D.label('اهتزاز', [vib.g, v3(0, 30, 0)], [0, -150], s('cf5') + 0.2, 1e9, { track: t => t > s('cf5') });
  D.on(t => {
    place(bars, 960, 560, win(t, s('cf1') + 0.2, s('cf3') - 0.2));
    DATA.forEach((d, i) => {
      const t0 = s('cf2') + [0.2, 2.6, 4.6, 6.6][i];
      bars.querySelector('.b' + i).style.width = (760 * d[1] / max * seg(t, t0, t0 + 0.8, easeOut)) + 'px';
      bars.querySelector('.v' + i).style.opacity = seg(t, t0 + 0.6, t0 + 1.0);
    });
    F.visible = t > s('cf3') - 0.3;
    popIn(F, t, s('cf3') - 0.3);
    // fatigue: shear slide of the plates + tension pull
    const fk = win(t, s('cf3') + 0.5, s('cf4'), 0.3) * Math.sin(t * 6);
    J.plates[1].position.x = fk * 3; J.bolt.position.y = J.top + 6.4 + Math.max(0, fk) * 2;
    heat.intensity = 3 * win(t, s('cf4') + 0.2, s('cf5') + 0.3, 0.4) * (0.8 + 0.2 * Math.sin(t * 9));
    trackify(hot.bolt.userData.mat, win(t, s('cf4') + 0.2, s('cf5'), 0.4) * 0.8);
    const vk = win(t, s('cf5'), 1e9, 0.2);
    vib.g.position.y = vk * noise1(t * 4) * 1.6; vib.g.position.x = -125 + vk * noise1(t * 5, 3) * 1.2; vib.nut.rotation.y = vk * (t - s('cf5')) * 0.6; vib.nut.position.y = -vk * (t - s('cf5')) * 0.8;
  });
  D.shots([[0, v3(0, 160, 420), v3(0, 0, 0)], [s('cf3') - 0.3, v3(0, 160, 420), v3(0, 0, 0)], [s('cf3') + 0.4, v3(0, 230, 380), v3(0, 0, 0)], [ctx.duration, v3(0, 220, 370), v3(0, 0, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
causes.sfx = ({ cue }) => [{ t: cue('cf2') + 0.2, name: 'pop', gain: 0.25 }, { t: cue('cf5') + 0.2, name: 'line_ambience', gain: 0.35, dur: 3 }];
