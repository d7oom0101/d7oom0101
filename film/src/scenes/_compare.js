// Shared ✗ / ✓ comparison stage for the defect scenes: both setups at the same angle and scale.
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, castAll, el, place, project } from '../engine.js';
import * as K from '../kit.js';

export function compareScene(ctx, { header, en, slides, beats, endAt }) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 180 });
  D.header(header, en); D.chip(slides);
  const badge = ok => el('big', `<div style="width:96px;height:96px;border-radius:50%;background:${ok ? '#1E9E5A' : '#D93A3A'};color:#fff;font:800 60px PlexLatin;display:flex;align-items:center;justify-content:center">${ok ? '✓' : '✗'}</div>`);
  const built = beats.map((b, i) => {
    const t0 = D.s(b.cue) - 0.3, t1 = i + 1 < beats.length ? D.s(beats[i + 1].cue) - 0.3 : (endAt ? D.s(endAt) - 0.2 : 1e9);
    const sets = b.build(D, t0);
    const groups = sets.map(([g, ok, x], j) => { g.position.x = x ?? (sets.length === 1 ? 0 : (j === 0 ? -70 : 70)); castAll(g); D.add(g); return { g, ok, bd: ok === null ? null : badge(ok) }; });
    if (b.title) D.card(`<div style="font:700 40px Plex;color:#10213F">${b.title}</div>`, 960, 940, t0 + 0.3, t1);
    return { t0, t1, groups, b };
  });
  D.on(t => {
    for (const { t0, t1, groups, b } of built) {
      groups.forEach(({ g, bd }, j) => {
        const on = t > t0 && t < t1; g.visible = on;
        if (on) popIn(g, t, t0 + j * 0.15, t1);
        if (bd) { const p = project(g.getWorldPosition(new THREE.Vector3()).add(v3(0, b.badgeY ?? 50, 0)), D.camera); place(bd, p.x, p.y - 40, on ? win(t, t0 + (b.badgeDelay ?? 1.0) + j * 0.3, t1) : 0); }
      });
      if (b.update && t > t0 && t < t1) b.update(t, groups.map(x => x.g));
    }
  });
  const shots = [];
  built.forEach(({ t0, b }) => { const c = b.cam || [v3(0, 170, 420), v3(0, 15, 0)]; shots.push([t0 + 0.05, c[0], c[1]]); shots.push([t0 + 0.06 + 0.001, c[0], c[1]]); });
  shots.push([ctx.duration, ...(built[built.length - 1].b.cam || [v3(0, 170, 420), v3(0, 15, 0)])]);
  D.shots(shots);
  return { D, scene: D.scene, camera: D.camera, update: t => D.update(t) };
}

/** a plate with bolts from a spec list: [{x, z, type:'hex'|'socket'|'wing'|'nutHex', proud:0, mat, stamp, washer:true}] */
export function plateWith(items, { w = 120, dpt = 70, t = 8, color = 0x8FB0DD } = {}) {
  const g = new THREE.Group();
  g.add(K.plate({ w, dpt, t, holes: items.map(i => [i.x, i.z || 0, 5.5]), mat: new THREE.MeshStandardMaterial({ color, roughness: 0.5 }) }));
  for (const it of items) {
    let o;
    const y0 = t + (it.washer ? 2 : 0);
    if (it.washer) { const wsh = K.washer({ id: 10.5, od: it.washerOD || 21, t: 2 }); wsh.position.set(it.x, t, it.z || 0); g.add(wsh); }
    if (it.type === 'socket') { o = K.socketScrew({ d: 10, L: 20 + (it.proud || 0), mat: it.mat }); o.position.y = y0 - 20 + (it.proud || 0) * 0; }
    else if (it.type === 'wing') { const rod = K.displayBolt({ d: 9, L: 30, stamp: null }); rod.rotation.x = Math.PI; rod.position.set(it.x, 30, it.z || 0); g.add(rod); o = K.wingNut({ d: 9, mat: it.mat }); o.position.y = y0; }
    else if (it.type === 'nutHex') { const rod = K.displayBolt({ d: 10, L: 30, stamp: null }); rod.rotation.x = Math.PI; rod.position.set(it.x, 30, it.z || 0); g.add(rod); o = K.hexNut({ d: 10, s: 17, m: 8, mat: it.mat }); o.position.y = y0; }
    else { o = K.displayBolt({ d: 10, L: 24, stamp: it.stamp || null, mat: it.mat }); o.position.y = y0 - 24 + (it.proud || 0); }
    o.position.x = it.x; o.position.z = it.z || 0; g.add(o); it.obj = o;
  }
  return g;
}
