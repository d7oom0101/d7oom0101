// Slide 45: tightening sequence on a flange — one-by-one tilts the flange; criss-cross (star) pattern in stages
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, project } from '../engine.js';
import * as K from '../kit.js';

const N = 8, R = 60;
const STAR = [0, 4, 2, 6, 1, 5, 3, 7]; // criss-cross order
export default function sequence(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 200 });
  const s = D.s, e = D.e;
  D.header('تسلسل الربط بعزم الدوران', 'Torque sequence');
  D.chip([45]);
  const mk = (x) => {
    const g = new THREE.Group(); g.position.x = x; D.add(g);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 80, 48), K.M.stainless()); pipe.position.y = -50; g.add(pipe);
    const f1 = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 14, 64), K.M.plate()); f1.position.y = -7; g.add(f1);
    const top = new THREE.Group(); g.add(top);
    const f2 = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 14, 64), paint(0x8FB0DD, 0.4)); f2.position.y = 7; top.add(f2);
    const bolts = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; const b = K.hexNut({ d: 12, s: 19, m: 10 }); b.position.set(Math.cos(a) * R, 14, Math.sin(a) * R); top.add(b); bolts.push(b); }
    castAll(g);
    return { g, top, bolts };
  };
  const A = mk(0);
  const nums = Array.from({ length: N }, (_, i) => el('big', `<div style="width:54px;height:54px;border-radius:50%;background:#003DA5;color:#fff;font:700 30px PlexLatin;display:flex;align-items:center;justify-content:center">${i + 1}</div>`));
  const wrongTag = D.card('<div style="font:700 40px Plex;color:#D93A3A">✗ برغي برغي للآخر: حمل نقطي… والفلنجة تميل</div>', 960, 920, s('sq2') + 0.4, s('sq3') - 0.2);
  const rightTag = D.card('<div style="font:700 40px Plex;color:#1E9E5A">✓ على مراحل، بنمط متقاطع (نجمة)</div>', 960, 920, s('sq3') + 0.6, 1e9);
  const lines = []; // star path drawn in svg
  const svg = document.getElementById('svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#FF7A00'); path.setAttribute('stroke-width', '5'); svg.appendChild(path);
  D.on(t => {
    // sq2: tighten sequentially -> tilt grows; sq3: reset, star pattern -> level
    const seqK = seg(t, s('sq2') + 0.2, e('sq2') - 0.5);
    const starK = seg(t, s('sq3') + 1.0, e('sq3') - 0.2);
    const phaseStar = t > s('sq3');
    let tilt = 0; const active = Math.floor((phaseStar ? starK : seqK) * N);
    if (!phaseStar) tilt = seqK * 0.07 * Math.sin(seqK * Math.PI) + seqK * 0.03;
    else tilt = (1 - seg(t, s('sq3'), s('sq3') + 0.8)) * 0.1 * 0 ;
    A.top.rotation.x = phaseStar ? 0 : tilt; A.top.rotation.z = phaseStar ? 0 : tilt * 0.5;
    A.bolts.forEach((b, i) => {
      const order = phaseStar ? STAR.indexOf(i) : i;
      const on = order === active && (phaseStar ? starK < 1 : seqK < 1);
      trackify(b.userData.mat, on ? 1 : 0);
      b.rotation.y = on ? t * 4 : 0;
      const p = project(new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).add(v3(0, 16, 0)), D.camera);
      place(nums[i], p.x, p.y - 40, phaseStar ? win(t, s('sq3') + 0.4, 1e9) : 0);
      nums[i].firstChild.textContent = String(STAR.indexOf(i) + 1);
    });
    const pts = []; if (phaseStar) for (let k = 0; k <= Math.min(N - 1, active); k++) { const b = A.bolts[STAR[k]]; const p = project(new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).add(v3(0, 12, 0)), D.camera); pts.push(`${p.x},${p.y}`); }
    path.setAttribute('points', pts.join(' ')); path.style.opacity = phaseStar ? 0.9 : 0;
  });
  D.shots([[0, v3(0, 240, 260), v3(0, 0, 0)], [s('sq2'), v3(160, 120, 240), v3(0, 0, 0)], [s('sq3') - 0.2, v3(160, 120, 240), v3(0, 0, 0)], [s('sq3') + 0.4, v3(0, 330, 120), v3(0, 0, 0)], [ctx.duration, v3(0, 330, 110), v3(0, 0, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
sequence.sfx = ({ cue }) => [...Array.from({ length: 8 }, (_, i) => ({ t: cue('sq3') + 1.0 + i * (cue('sq3', 'end') - 1.2 - cue('sq3')) / 8, name: 'tick', gain: 0.25 }))];
