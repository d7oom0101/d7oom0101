// Declarative helpers so each scene is: build objects -> declare beats keyed to narration cues.
import * as THREE from 'three';
import { studio, shadowFloor, el, svgEl, project, place, leader, seg, win, easeIO, easeBack, lerp, lerpV, v3, trackify, smooth, clamp } from './engine.js';

export function stage(ctx, { fov = 26, target = v3(0, 0, 0), size = 300, keyPos, floorY = 0, floor = true, shadowOpacity = 0.14 } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1920 / 1080, 0.5, 20000);
  studio(scene, { target, size, keyPos: keyPos || v3(size * 0.6, size * 1.6, size * 1.1) });
  if (floor) shadowFloor(scene, floorY, size * 30, shadowOpacity);
  const items = [];
  let shotList = null;
  const D = {
    scene, camera, cue: ctx.cue, duration: ctx.duration,
    /** cue time helpers: s('k3') start, e('k3') end */
    s: id => ctx.cue(id), e: id => ctx.cue(id, 'end'),
    add(o) { scene.add(o); return o; },
    /** camera keyframes: [time, pos, target, fov?] */
    shots(list) { shotList = list.sort((a, b) => a[0] - b[0]); },
    /** label anchored to a world point/object, offset in px, visible [t0,t1] */
    label(html, anchor, off, t0, t1, opt = {}) {
      const d = el('lbl' + (opt.track ? ' track' : ''), html, opt.style || {});
      const ld = opt.noLeader ? null : leader();
      items.push(t => {
        const op = win(t, t0, t1, 0.3) * (opt.op ? opt.op(t) : 1);
        const p = project(resolve(anchor), camera);
        place(d, p.x + off[0], p.y + off[1], op, lerp(0.85, 1, seg(t, t0, t0 + 0.35, easeBack)));
        if (ld) ld.set(p.x, p.y, p.x + off[0] * 0.78, p.y + off[1] * 0.78, op, typeof opt.track === 'function' ? opt.track(t) : !!opt.track);
      });
      return d;
    },
    /** screen-fixed HTML card */
    card(html, x, y, t0, t1, cls = 'card', style = {}) {
      const d = el(cls, html, style);
      items.push(t => place(d, x, y, win(t, t0, t1, 0.3), lerp(0.92, 1, seg(t, t0, t0 + 0.4, easeBack))));
      return d;
    },
    /** scene header (top right, RTL) */
    header(ar, en, t0 = 0.1, t1 = 1e9) {
      const d = el('big', `<div style="text-align:right"><div style="font:700 50px Plex;color:#003DA5">${ar}</div><div style="font:600 28px PlexLatin;color:#0A6FD6;margin-top:2px">${en}</div></div>`, { transform: 'none' });
      items.push(t => { d.style.left = 'auto'; d.style.right = '64px'; d.style.top = '44px'; d.style.transform = 'none'; d.style.opacity = win(t, t0, t1, 0.4); });
      return d;
    },
    chip(slides) {
      const d = el('chip', 'مرجع العرض: ' + slides.map(n => 'الشريحة ' + n).join(' + '));
      const lg = el('logo', '<img src="/assets/pg_logo_circle.png" style="width:86px;height:86px">', { transform: 'none' });
      items.push(() => { d.style.opacity = 0.9; lg.style.opacity = 1; });
    },
    /** highlight material(s) in the tracking colour during [t0,t1] */
    track(mats, t0, t1, k = 1) {
      mats = [].concat(mats);
      items.push(t => { for (const m of mats) trackify(m, k * win(t, t0, t1, 0.35)); });
    },
    /** generic per-frame callback */
    on(fn) { items.push(fn); },
    update(t) {
      if (shotList) {
        let i = 0; while (i < shotList.length - 2 && t >= shotList[i + 1][0]) i++;
        const a = shotList[i], b = shotList[Math.min(i + 1, shotList.length - 1)];
        const k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
        camera.position.copy(lerpV(a[1], b[1], k));
        camera.lookAt(lerpV(a[2], b[2], k));
        if (a[3] || b[3]) { camera.fov = lerp(a[3] || 26, b[3] || 26, k); camera.updateProjectionMatrix(); }
        camera.updateMatrixWorld();
      }
      for (const f of items) f(t);
    },
  };
  return D;
}
export function resolve(a) {
  if (typeof a === 'function') return a();
  if (a && a.isObject3D) return a.getWorldPosition(new THREE.Vector3());
  if (Array.isArray(a)) { const [o, off] = a; o.updateMatrixWorld(true); return o.localToWorld(off.clone()); }
  return a;
}
/** fade a group's materials (clones them once) */
export function fader(obj) {
  const mats = [];
  obj.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; mats.push(o.material); } });
  return k => { for (const m of mats) { m.opacity = k; m.depthWrite = k > 0.98; } obj.visible = k > 0.002; };
}
/** pop-in: scale & opacity from t0 */
export function popIn(obj, t, t0, t1 = 1e9, base = 1) {
  const k = win(t, t0, t1, 0.4);
  obj.visible = k > 0.002;
  obj.scale.setScalar(base * lerp(0.6, 1, seg(t, t0, t0 + 0.45, easeBack)) * (k > 0 ? 1 : 0.001));
  return k;
}
export const T = { seg, win, easeIO, easeBack, smooth, clamp, lerp, lerpV, v3 };
