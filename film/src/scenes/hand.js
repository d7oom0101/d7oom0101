// Slide 13: right-hand vs left-hand thread
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeIO, lerp, threadGeometry, project, svgEl, castAll, trackify } from '../engine.js';
import * as K from '../kit.js';

const P = 4, DM = 16, H = 90;
function rod(left) {
  const g = new THREE.Group(); const m = K.M.zinc();
  const th = new THREE.Mesh(threadGeometry({ dMajor: DM, pitch: P, y0: 0, y1: H, perPitch: 30, left }), m); g.add(th);
  const base = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 50), K.M.plate()); base.position.y = -5; g.add(base);
  const nut = K.hexNut({ d: DM, s: 26, m: 12 }); g.add(nut);
  castAll(g);
  return { g, nut, mat: m, nutMat: nut.userData.mat };
}
export default function hand(ctx) {
  const D = stage(ctx, { target: v3(0, 45, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('سن يميني وسن يساري', 'Right-hand and left-hand thread');
  D.chip([13]);
  const R = rod(false), L = rod(true);
  R.g.position.x = 55; L.g.position.x = -55; D.add(R.g); D.add(L.g);
  D.track(R.mat, s('th3'), e('th3') + 0.3); D.track(L.mat, s('th1'), s('th2')); D.track(L.mat, s('th4'), e('th4') + 0.3);
  D.label('سن يميني', v3(55, H + 6, 0), [0, -120], s('th2') + 0.4, 1e9, { track: t => t > s('th3') && t < e('th3') + 0.3 });
  D.label('سن يساري', v3(-55, H + 6, 0), [0, -120], s('th2') + 1.4, 1e9, { track: t => (t > s('th4') && t < e('th4') + 0.3) || t < s('th2') });
  D.card('<div style="font:600 32px Plex;color:#5C6E8A">ملاحظة: توجد أسنان أمريكية <span class="ltr" style="font-family:PlexLatin">(US threads)</span>، ورأس البرغي فيها يختلف قليلًا</div>', 960, 960, s('th5'), 1e9);
  // overlay: rise line along the crest + rotation arrows
  const rise = svgEl('line', { stroke: '#FF7A00', 'stroke-width': 7, 'stroke-linecap': 'round' });
  const arrow = svgEl('path', { fill: 'none', stroke: '#FF7A00', 'stroke-width': 7, 'stroke-linecap': 'round' });
  const head = svgEl('path', { fill: '#FF7A00' });
  const tight = svgEl('text', { fill: '#B54F00', 'font-size': 38, 'font-family': 'Plex', 'font-weight': 700, 'text-anchor': 'middle' });
  function drawArrow(cx, cy, rx, ry, cw, op) {
    const a0 = cw ? Math.PI * 0.15 : Math.PI * 0.85, a1 = cw ? Math.PI * 0.85 : Math.PI * 0.15;
    const p0 = [cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry], p1 = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry];
    arrow.setAttribute('d', `M${p0[0]},${p0[1]} A${rx},${ry} 0 0 ${cw ? 1 : 0} ${p1[0]},${p1[1]}`);
    const dir = cw ? -1 : 1; head.setAttribute('d', `M${p1[0] + dir * 22},${p1[1] - 14} L${p1[0] - dir * 6},${p1[1] + 2} L${p1[0] + dir * 22},${p1[1] + 18} Z`);
    arrow.style.opacity = op; head.style.opacity = op;
  }
  D.on(t => {
    popIn(R.g, t, s('th2') - 0.2); L.g.visible = true;
    // th1: the nut on the left-hand rod is turned anti-clockwise... and it tightens (goes down)
    const turnL1 = seg(t, s('th1') + 0.4, e('th1'), easeIO), turnL2 = seg(t, s('th4') + 0.5, e('th4'), easeIO);
    const turnR = seg(t, s('th3') + 0.8, e('th3'), easeIO);
    // left-hand: tightening = anti-clockwise from above (positive rotation.y), moves down
    const angL = (turnL1 * 1.5 + turnL2 * 1.5) * Math.PI * 2; L.nut.rotation.y = angL; L.nut.position.y = 70 - angL / (Math.PI * 2) * P;
    const angR = turnR * 3 * Math.PI * 2; R.nut.rotation.y = -angR; R.nut.position.y = 70 - angR / (Math.PI * 2) * P;
    const focusR = t > s('th3') - 0.2 && t < s('th4') - 0.2;
    const x = focusR ? 55 : -55;
    const a = project(v3(x - DM / 2, 20, DM / 2), D.camera), b = project(v3(x + DM / 2, 20 + (focusR ? 1 : -1) * P / 2 * 0 + (focusR ? P * 0.5 : P * 0.5), DM / 2), D.camera);
    const p = project(v3(x - DM / 2, 20 + (focusR ? 0 : P * 0.5), DM / 2), D.camera), q = project(v3(x + DM / 2, 20 + (focusR ? P * 0.5 : 0), DM / 2), D.camera);
    const opRise = win(t, s('th3') + 0.3, s('th3') + 3.5) + win(t, s('th4') + 0.3, s('th4') + 3);
    rise.setAttribute('x1', p.x); rise.setAttribute('y1', p.y); rise.setAttribute('x2', q.x); rise.setAttribute('y2', q.y); rise.style.opacity = opRise;
    const nutP = project(v3(x, (focusR ? R : L).nut.position.y + 18, 0), D.camera);
    const opA = t < s('th2') ? win(t, s('th1') + 0.3, e('th1') + 0.2) : (win(t, s('th3') + 0.6, e('th3') + 0.2) + win(t, s('th4') + 0.4, e('th4') + 0.2));
    drawArrow(nutP.x, nutP.y, 90, 34, focusR, opA);
    tight.setAttribute('x', nutP.x); tight.setAttribute('y', nutP.y - 60); tight.textContent = focusR ? 'شد ↻ مع عقارب الساعة' : 'شد ↺ عكس عقارب الساعة'; tight.style.opacity = opA;
  });
  D.shots([
    [0, v3(-55, 100, 260), v3(-55, 50, 0)], [e('th1'), v3(-55, 100, 260), v3(-55, 50, 0)],
    [s('th2') + 0.6, v3(0, 110, 330), v3(0, 50, 0)], [s('th3') - 0.2, v3(0, 110, 330), v3(0, 50, 0)],
    [s('th3') + 0.6, v3(55, 90, 240), v3(55, 45, 0)], [s('th4') - 0.3, v3(55, 90, 240), v3(55, 45, 0)],
    [s('th4') + 0.5, v3(-55, 90, 240), v3(-55, 45, 0)], [s('th5') - 0.2, v3(-55, 90, 240), v3(-55, 45, 0)],
    [ctx.duration, v3(0, 110, 330), v3(0, 50, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
hand.sfx = ({ cue }) => [{ t: cue('th1') + 0.4, name: 'slide', gain: 0.3, dur: 2 }, { t: cue('th3') + 0.8, name: 'slide', gain: 0.3, dur: 2 }, { t: cue('th4') + 0.5, name: 'slide', gain: 0.3, dur: 2 }];
