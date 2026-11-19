// Slides 58-61: contamination, equal components, missing/broken parts, plant-photo quiz (photos from slide 61)
import * as THREE from 'three';
import { compareScene, plateWith } from './_compare.js';
import { v3, seg, win, easeOut, castAll, el, place } from '../engine.js';
import * as K from '../kit.js';

export default function defects3(ctx) {
  const R = compareScene(ctx, {
    header: 'العيوب: التلوث والتطابق والنواقص', en: 'Defects — contamination, matching, missing parts', slides: [58, 59, 60, 61], endAt: 'q1',
    beats: [
      { cue: 'd12', title: 'التلوّث يخفي العيب ويضعف الوصلة', build: () => {
        const dirty = plateWith([{ x: -25, type: 'hex', mat: K.M.rust(), washer: true }, { x: 25, type: 'nutHex', mat: K.M.rust() }], { w: 100, dpt: 60, color: 0x8A7A66 });
        for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.8 + (i % 3) * 0.6, 8, 6), K.M.rust()); const a = i * 2.39; d.position.set(Math.cos(a) * (8 + i * 0.9) - 10, 8.2, Math.sin(a) * (6 + i * 0.5)); dirty.add(d); }
        const clean = plateWith([{ x: -25, type: 'hex', washer: true }, { x: 25, type: 'nutHex' }], { w: 100, dpt: 60 });
        return [[dirty, false], [clean, true]];
      }, cam: [v3(0, 190, 400), v3(0, 8, 0)] },
      { cue: 'd13', title: 'كل العناصر في الوصلة متطابقة: المادة نفسها والشكل نفسه', build: () => [
        [plateWith([{ x: -30, z: -15, type: 'hex', stamp: { text: '8.8' } }, { x: 30, z: -15, type: 'socket' }, { x: 0, z: 20, type: 'hex', mat: K.M.brass() }], { w: 110, dpt: 80 }), false],
        [plateWith([{ x: -30, z: -15, type: 'hex', stamp: { text: '8.8' } }, { x: 30, z: -15, type: 'hex', stamp: { text: '8.8' } }, { x: 0, z: 20, type: 'hex', stamp: { text: '8.8' } }], { w: 110, dpt: 80 }), true]],
        cam: [v3(0, 250, 350), v3(0, 5, 0)] },
      { cue: 'd14', title: 'مثبّت مفقود أو قطعة مكسورة: يجب تصحيح ذلك', build: () => {
        const g = plateWith([{ x: -30, z: -15, type: 'hex' }, { x: 0, z: 20, type: 'hex' }], { w: 110, dpt: 80 });
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.4, 32), new THREE.MeshBasicMaterial({ color: 0x1A1F26 })); hole.position.set(30, 8.1, -15); g.add(hole);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.9, 8, 40), new THREE.MeshBasicMaterial({ color: 0xFF7A00 })); ring.rotation.x = Math.PI / 2; ring.position.set(30, 8.6, -15); g.add(ring);
        return [[g, false, 0]];
      }, cam: [v3(0, 170, 190), v3(5, 5, 0)] },
    ],
  });
  // q1: plant photos quiz (deck slide 61)
  const D = R.D;
  const N = 6;
  const grid = el('big', `<div style="display:grid;grid-template-columns:repeat(3,480px);gap:26px">${Array.from({ length: N }, (_, i) => `<div style="position:relative"><img src="/assets/quiz/q${i + 1}.jpg" style="width:480px;height:330px;object-fit:cover;border-radius:18px;box-shadow:0 12px 30px rgba(16,33,63,.2)"><div style="position:absolute;top:12px;right:12px;width:52px;height:52px;border-radius:50%;background:#003DA5;color:#fff;font:700 28px PlexLatin;display:flex;align-items:center;justify-content:center">${i + 1}</div></div>`).join('')}</div>`);
  const timer = el('big', '<svg width="120" height="120" viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" fill="#fff" stroke="#DCE6F2" stroke-width="12"/><circle class="arc" cx="65" cy="65" r="54" fill="none" stroke="#FF7A00" stroke-width="12" stroke-dasharray="339" transform="rotate(-90 65 65)"/></svg>');
  const q = D.s('q1');
  D.on(t => {
    place(grid, 960, 580, win(t, q - 0.2, 1e9), 0.97 + 0.03 * seg(t, q - 0.2, q + 0.4));
    place(timer, 1780, 170, win(t, D.e('q1'), 1e9)); timer.querySelector('.arc').setAttribute('stroke-dashoffset', 339 * seg(t, D.e('q1'), D.e('q1') + 5.5));
  });
  return R;
}
defects3.sfx = ({ cue }) => [...['d12', 'd13'].flatMap(id => [{ t: cue(id) + 1.0, name: 'wrong', gain: 0.3 }, { t: cue(id) + 1.3, name: 'right', gain: 0.3 }]), { t: cue('d14') + 1.0, name: 'wrong', gain: 0.3 }, { t: cue('d14') + 0.5, name: 'drop', gain: 0.35 }, { t: cue('q1'), name: 'whoosh', gain: 0.3 }, { t: cue('q1', 'end') + 5.5, name: 'chime', gain: 0.25 }];
