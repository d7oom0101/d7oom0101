// Slides 39-40: galvanic corrosion; the four loads a fastener resists (tension, torsion, bending, shear)
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place, project, svgEl } from '../engine.js';
import * as K from '../kit.js';

export default function corrosion(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('التآكل الجلفاني والإجهاد', 'Galvanic corrosion & fatigue');
  D.chip([39, 40]);
  const alu = K.plate({ w: 110, dpt: 80, t: 8, holes: [[0, 0, 5.4]], mat: K.M.plate() }); D.add(alu);
  const b = K.displayBolt({ d: 10, L: 14, stamp: null, mat: K.M.zinc() }); b.position.y = 8 - 14 + 0.01; D.add(b);
  const rust = new THREE.Mesh(new THREE.RingGeometry(9, 9, 64), new THREE.MeshStandardMaterial({ color: 0x9A4A22, roughness: 1, transparent: true, opacity: 0.95, side: THREE.DoubleSide })); rust.rotation.x = -Math.PI / 2; rust.position.y = 8.05; D.add(rust);
  const drops = []; for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshStandardMaterial({ color: 0x6FA8DC, transparent: true, opacity: 0.6, roughness: 0.1 })); D.add(d); drops.push(d); }
  D.label('معدنان مختلفان', [b, v3(0, 15, 0)], [240, -150], s('gf2') + 0.4, s('gf3') - 0.2, { track: true });
  D.label('بيئة تآكلية', v3(30, 10, 20), [260, 80], s('gf2') + 2.4, s('gf3') - 0.2);
  D.label('صدأ حول منطقة التلامس', v3(-10, 8, 6), [-260, 120], s('gf2') + 4.2, s('gf3') - 0.2, { track: true });
  // four loads
  const L = [['gf3', 'شد (سحب)', 'Tensile'], ['gf4', 'التواء', 'Torsion'], ['gf5', 'انحناء', 'Bending'], ['gf6', 'قص', 'Shear']];
  const bs = L.map(([cue, ar, en], i) => {
    const o = K.displayBolt({ d: 10, L: 40, stamp: null }); o.rotation.z = -Math.PI / 2; o.position.set(-40, 60 - i * 34 + 200, 0); D.add(o); castAll(o);
    D.label(`${ar} <span style="font:500 24px PlexLatin;color:#5C6E8A">${en}</span>`, v3(12, 60 - i * 34 + 200, 0), [190, 0], s(cue), 1e9, { noLeader: true, track: t => t > s(cue) && t < e(cue) + 0.6 });
    return o;
  });
  const arrows = svgEl('g', {});
  D.on(t => {
    const g1 = t < s('gf3') - 0.2; alu.visible = b.visible = rust.visible = g1;
    const rk = seg(t, s('gf2') + 3.5, s('gf2') + 5.5, easeOut); rust.geometry.dispose(); rust.geometry = new THREE.RingGeometry(9, 9 + rk * 9, 64);
    drops.forEach((d, i) => { const a = i * 2.4; d.visible = g1 && t > s('gf2') + 2.0; d.position.set(Math.cos(a) * (16 + (i % 5) * 5), 8.6, Math.sin(a) * (16 + (i % 5) * 5)); });
    bs.forEach((o, i) => {
      o.visible = !g1; const [cue] = L[i]; const k = win(t, s(cue), e(cue) + 0.6, 0.25);
      const bm = o.userData.bolt.userData.mat; trackify(bm, k);
      o.position.x = -40; o.rotation.x = 0; o.scale.set(1, 1, 1);
      if (i === 0) o.scale.y = 1 + 0.05 * k * (0.5 + 0.5 * Math.sin(t * 8));
      if (i === 1) o.rotation.x = k * Math.sin(t * 4) * 0.5;
      if (i === 2) o.rotation.z = -Math.PI / 2 + k * Math.sin(t * 4) * 0.08;
      if (i === 3) o.position.y = 60 - i * 34 + 200 + k * Math.sin(t * 8) * 1.2;
    });
  });
  D.shots([[0, v3(60, 70, 110), v3(0, 8, 0)], [s('gf3') - 0.3, v3(50, 60, 100), v3(0, 8, 0)], [s('gf3'), v3(10, 225, 260), v3(10, 210, 0)], [ctx.duration, v3(10, 225, 250), v3(10, 210, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
corrosion.sfx = ({ cue }) => ['gf3', 'gf4', 'gf5', 'gf6'].map(id => ({ t: cue(id), name: 'pop', gain: 0.22 }));
