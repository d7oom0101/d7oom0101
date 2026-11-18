// Slide 44: using the click torque wrench — unlock, set, lock, direction; socket on head; smooth pull; stop at the click
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, project, svgEl } from '../engine.js';
import * as K from '../kit.js';

export default function torquewrench(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 260 });
  const s = D.s, e = D.e;
  D.header('مفتاح العزم', 'Torque wrench');
  D.chip([44]);
  const base = K.plate({ w: 160, dpt: 120, t: 12, holes: [[0, 0, 5.5]], mat: paint(0x8FB0DD, 0.5) }); D.add(base);
  const bolt = K.displayBolt({ d: 10, L: 30, stamp: { text: '8.8' } }); bolt.position.y = 12 - 30 + 8; D.add(bolt);
  const headTop = 12 + 8 + 6.4;
  const tw = K.torqueWrench({ L: 380 }); D.add(tw); castAll(tw);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 22, 32), K.M.stainless()); tw.add(sock); sock.position.y = -22;
  D.label('مقياس <span class="ltr" style="font-family:PlexLatin">Ft-lb / Nm</span>', [tw, v3(380 * 0.55, 10, 0)], [80, -170], s('tw1') + 2.2, s('tw2') - 0.2, { track: true });
  D.label('تحرير / قفل لضبط العزم', [tw, v3(380 * 0.96, 0, 0)], [-60, -170], s('tw2') + 0.1, s('tw2') + 3.4, { track: true });
  D.label('اتجاه الشد', [tw, v3(-6, 12, 0)], [-200, -150], s('tw2') + 3.4, s('tw3') - 0.2, { track: true });
  D.label('اللقمة على الرأس', [tw, v3(0, -22, 0)], [-220, 120], s('tw3') + 0.6, s('tw3') + 2.6, { track: true });
  const click = el('big', '<div style="font:800 110px PlexLatin;color:#FF7A00;letter-spacing:2px">CLICK</div>');
  const stop = el('card', '<div style="font:700 48px Plex;color:#10213F">هنا توقّف ✋</div>');
  const donts = [['تعامل معه بحذر: قد يفقد معايرته', s('tw4')], ['لا تستخدمه بدل مفتاح أبو تي', s('tw4') + 2.6], ['لا تفك به أي برغي: للشد فقط', s('tw5')], ['لا تدعه يسقط على الأرض', s('tw5') + 2.3]];
  donts.forEach(([txt, t0], i) => D.card(`<div style="font:600 34px Plex;color:#10213F"><span style="color:#D93A3A">✗</span> ${txt}</div>`, 1440, 300 + i * 105, t0, 1e9, 'card', { padding: '16px 30px' }));
  // pull timing: the click is the end of the "سحب" motion, synced with the narrator's "النقرة"
  const tPull0 = s('tw3') + 2.2, tClick = e('tw3') - 0.9;
  D.on(t => {
    const come = seg(t, s('tw3') - 0.2, s('tw3') + 1.2, easeOut);
    tw.position.set(0, headTop + 22 + 11 + (1 - come) * 60, 0);
    // pull: smooth rotation, stops exactly at the click, tiny kick-back
    const pull = seg(t, tPull0, tClick, t => t * (2 - t));
    const kick = t > tClick ? Math.exp(-(t - tClick) * 12) * Math.sin((t - tClick) * 50) * 0.01 : 0;
    tw.rotation.y = 0.6 - pull * 0.9 + kick;
    bolt.rotation.y = -Math.max(0, pull - 0.2) * 0.6;
    // setting the scale (tw2): grip turns
    tw.userData.grip.rotation.x = seg(t, s('tw2') + 1.2, s('tw2') + 3.0, easeIO) * Math.PI * 3;
    tw.userData.lock.position.x = 380 * 0.96 + 6 * win(t, s('tw2') + 0.2, s('tw2') + 3.4, 0.3);
    D.camera.updateMatrixWorld();
    const cp = project(v3(0, headTop + 40, 0), D.camera);
    const ck = t > tClick ? Math.max(0, 1 - (t - tClick) / 1.1) : 0;
    place(click, cp.x + 260, cp.y - 120, ck, 1 + (1 - ck) * 0.15);
    place(stop, cp.x + 260, cp.y + 60, win(t, tClick + 0.2, s('tw4') - 0.1));
    tw.visible = t < s('tw4') + 0.2 || t > 0;
  });
  D.shots([
    [0, v3(230, 300, 560), v3(170, 100, 0)], [s('tw2'), v3(420, 200, 220), v3(350, 100, 0)], [s('tw2') + 3.2, v3(110, 190, 190), v3(10, 100, 0)],
    [s('tw3'), v3(120, 180, 300), v3(40, 20, 0)], [tPull0, v3(160, 230, 330), v3(60, 20, 0)], [tClick, v3(150, 220, 300), v3(60, 20, 0)],
    [tClick + 1.2, v3(150, 220, 300), v3(60, 20, 0)], [ctx.duration, v3(230, 260, 420), v3(110, 20, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
torquewrench.sfx = ({ cue }) => [{ t: cue('tw3') + 1.1, name: 'clink', gain: 0.45 }, { t: cue('tw2') + 1.2, name: 'slide', gain: 0.25, dur: 1.8 }, { t: cue('tw3') + 2.2, name: 'slide', gain: 0.22, dur: cue('tw3', 'end') - 0.9 - cue('tw3') - 2.2 }, { t: cue('tw3', 'end') - 0.9, name: 'torque_click', gain: 0.9 }];
