// Slide 7: head designs — same angle, same scale; each tool engages its head
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, trackify, castAll, noise1 } from '../engine.js';
import * as K from '../kit.js';

export default function heads(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 200 });
  const s = D.s, e = D.e;
  D.header('تصميم الرأس', 'Head design');
  D.chip([7]);
  // order on screen right -> left (RTL), as on the slide
  const defs = [
    { id: 'h3', name: 'سداسي', en: 'Hexagonal', make: () => K.displayBolt({ d: 10, L: 30 }), top: 36.4, tool: () => K.openSpanner({ size: 17, L: 90, label: '' }), toolY: 33, side: true },
    { id: 'h4', name: 'نجمة', en: 'Torx', make: () => K.driveScrew({ d: 10, L: 30, drive: 'torx' }), top: 36.6, tool: () => K.screwdriver({ tip: 'torx' }) },
    { id: 'h5', name: 'فيلبس', en: 'Phillips', make: () => K.driveScrew({ d: 10, L: 30, drive: 'phillips' }), top: 36.6, tool: () => K.screwdriver({ tip: 'phillips' }) },
    { id: 'h6', name: 'شق', en: 'Slot drive', make: () => K.driveScrew({ d: 10, L: 30, drive: 'slot' }), top: 36.6, tool: () => K.screwdriver({ tip: 'slot' }) },
    { id: 'h7', name: 'ألن', en: 'Allen', make: () => K.socketScrew({ d: 10, L: 30 }), top: 40, tool: () => K.allenKey({ s: 8, L1: 60, L2: 25 }) },
  ];
  const X = [130, 65, 0, -65, -130];
  const parts = defs.map((d, i) => {
    const o = d.make(); o.position.x = X[i]; castAll(o); D.add(o);
    const mats = []; o.traverse(m => { if (m.material && !m.material.transparent) { m.material = m.material.clone(); mats.push(m.material); } });
    const tool = d.tool(); castAll(tool); D.add(tool); tool.visible = false;
    D.track(mats, s(d.id) - 0.1, e(d.id) + 0.3);
    D.label(`${d.name} <span style="font:500 26px PlexLatin;color:#5C6E8A">${d.en}</span>`, v3(X[i], 0, 22), [0, 110], 0.4 + i * 0.15, 1e9, { noLeader: true, style: { fontSize: '30px' } });
    return { o, tool, d, x: X[i] };
  });
  // bearing surface ring (h2): under the hex head
  const ring = new THREE.Mesh(new THREE.RingGeometry(5.3, 9.5, 48), new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  ring.rotation.x = Math.PI / 2; ring.position.set(X[0], 29.9, 0); D.add(ring);

  D.on(t => {
    ring.material.opacity = 0.85 * win(t, s('h2') + 0.4, e('h2'));
    parts.forEach(({ o, tool, d, x }, i) => {
      popIn(o, t, 0.1 + i * 0.12);
      const t0 = s(d.id), t1 = e(d.id) + 0.2;
      const come = seg(t, t0, t0 + 0.8, easeOut), go = seg(t, t1, t1 + 0.6, easeIO);
      let y = d.top + (1 - come) * 90 + go * 110;
      let rot = seg(t, t0 + 0.8, t1, easeIO) * Math.PI * 0.9;
      let dx = 0;
      if (d.id === 'h6') { // cam-out: the blade climbs out and slips sideways
        const slip = seg(t, t0 + 1.6, t0 + 2.0, easeOut);
        y += slip * 4; dx = slip * 9; rot = seg(t, t0 + 0.8, t0 + 1.6) * 0.5 + slip * 0.3;
        o.rotation.y = 0;
      } else o.rotation.y = rot;
      if (d.side) { o.rotation.y = Math.PI / 2 + rot; tool.position.set(x, 33.2, -(1 - come) * 120 - go * 120); tool.rotation.y = Math.PI / 2 + rot; }
      else { tool.position.set(x + dx, y + 2, 0); tool.rotation.y = rot; }
      tool.visible = t > t0 - 0.05 && t < t1 + 0.7;
    });
  });
  const focus = i => v3(X[i], 30, 0);
  D.shots([
    [0, v3(0, 160, 420), v3(0, 25, 0)],
    [s('h2') - 0.1, v3(0, 160, 420), v3(0, 25, 0)],
    [s('h2') + 0.8, v3(X[0] + 40, 80, 120), focus(0)],
    ...['h3', 'h4', 'h5', 'h6', 'h7'].flatMap((id, i) => [[s(id) + 0.2, v3(X[i] + 45, 105, 135), focus(i)], [e(id) + 0.1, v3(X[i] + 35, 100, 125), focus(i)]]),
    [ctx.duration, v3(0, 170, 440), v3(0, 25, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
heads.sfx = ({ cue }) => [{ t: cue('h6') + 1.6, name: 'knock', gain: 0.35 }, ...['h3', 'h4', 'h5', 'h7'].map(id => ({ t: cue(id) + 0.8, name: 'clink', gain: 0.3 }))];
