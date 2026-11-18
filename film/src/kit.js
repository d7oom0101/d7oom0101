// Parametric industrial parts (units: mm; Y up; parts stand on y=0 unless noted).
import * as THREE from 'three';
import { steel, paint, envMap, COLORS, hexGeometry, threadGeometry, hexBolt, canvasTex, castAll } from './engine.js';

export const M = {
  zinc: () => steel(0xD5DCE6, 0.28, 0.9),
  stainless: () => steel(0xE3E6EA, 0.18, 0.95),
  black: () => steel(0x30363F, 0.45, 0.75),
  brass: () => steel(0xD6B25E, 0.3, 0.9),
  rust: () => new THREE.MeshStandardMaterial({ color: 0x9A4A22, roughness: 0.95, metalness: 0.2, envMap }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x1A1F26, roughness: 0.6, metalness: 0.3 }),
  nylon: () => new THREE.MeshStandardMaterial({ color: 0x2B6FD6, roughness: 0.5, metalness: 0 }),
  plate: () => steel(0xBAC3CE, 0.42, 0.8),
  paintBlue: () => paint(0x2D5FA8, 0.45),
  green: () => paint(0x1E8A4C, 0.5),
};
const mesh = (g, m) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; return x; };
export { hexBolt };
export const castShadows = o => castAll(o);

// ---------- decals ----------
/** canvas decal disc for stamps / drive recesses; draw(ctx,w,h) */
export function decal(size, draw, { res = 512, rough = 0.6, metal = 0.5, color = 0xffffff } = {}) {
  const tex = canvasTex(res, res, (c, w, h) => { c.clearRect(0, 0, w, h); draw(c, w, h); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: rough, metalness: metal, color, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.rotation.x = -Math.PI / 2;
  return m;
}
/** stamp on a hex head: {text, sub, lines, dots} drawn as embossed marks */
export function headStamp(s, spec) {
  return decal(s * 0.95, (c, w, h) => {
    const emb = (fn) => { c.save(); c.translate(3, 4); c.globalAlpha = 0.35; c.fillStyle = c.strokeStyle = '#000'; fn(); c.restore(); c.fillStyle = c.strokeStyle = spec.color || '#5E6875'; fn(); };
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (spec.lines) {
      c.lineCap = 'round'; c.lineWidth = w * 0.05;
      for (let i = 0; i < spec.lines; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / (spec.slots || spec.lines);
        emb(() => { c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * w * 0.12, h / 2 + Math.sin(a) * h * 0.12); c.lineTo(w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * h * 0.36); c.stroke(); });
      }
    }
    if (spec.text) emb(() => { c.font = `700 ${spec.font || w * 0.26}px PlexLatin`; c.fillText(spec.text, w / 2, h / 2 + (spec.sub ? h * 0.13 : 0)); });
    if (spec.sub) emb(() => { c.font = `700 ${w * 0.16}px PlexLatin`; c.fillText(spec.sub, w / 2, h / 2 - h * 0.17); });
  }, { metal: 0.6, rough: 0.5 });
}
/** hex bolt + stamp on the head (head at bottom: stamp faces -Y when the bolt stands head-down; use headUp for display) */
export function displayBolt({ d = 10, L = 30, s, k, stamp, mat, headUp = true } = {}) {
  s = s || Math.round(d * 1.6 + 1); k = k || d * 0.64;
  const b = hexBolt({ d, L, s, k, mat: mat || M.zinc() });
  const g = new THREE.Group(); g.add(b);
  if (stamp) { const st = headStamp(s, stamp); st.rotation.x = Math.PI / 2; st.position.y = -0.05; b.add(st); st.name = 'stamp'; }
  if (headUp) { b.rotation.x = Math.PI; b.position.y = k + L; }
  g.userData = { ...b.userData, bolt: b };
  return g;
}

// ---------- heads with drives ----------
function driveDrawer(kind) {
  return (c, w, h) => {
    c.fillStyle = '#20252C'; c.strokeStyle = '#20252C'; c.lineCap = 'round';
    const cx = w / 2, cy = h / 2;
    if (kind === 'slot') { c.fillRect(cx - w * 0.42, cy - h * 0.06, w * 0.84, h * 0.12); }
    if (kind === 'phillips') { c.lineWidth = w * 0.1; c.beginPath(); c.moveTo(cx - w * .26, cy); c.lineTo(cx + w * .26, cy); c.moveTo(cx, cy - h * .26); c.lineTo(cx, cy + h * .26); c.stroke(); }
    if (kind === 'torx') { c.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2; const r = w * (0.2 + 0.07 * Math.cos(6 * a)); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.fill(); }
    if (kind === 'hex' || kind === 'allen') { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(cx + Math.cos(a) * w * 0.26, cy + Math.sin(a) * h * 0.26); } c.closePath(); c.fill(); }
  };
}
/** screw with pan or flat (countersunk) head and a drive; head on top, thread downward to y=0 */
export function driveScrew({ d = 8, L = 30, head = 'pan', drive = 'phillips', mat } = {}) {
  const m = mat || M.zinc();
  const g = new THREE.Group();
  const th = mesh(threadGeometry({ dMajor: d, pitch: d * 0.15, y0: 0, y1: L - 1 }), m); th.rotation.x = Math.PI; th.position.y = L - 1; g.add(th);
  let top;
  if (head === 'pan') {
    const pts = [[0, 0], [d * 0.95, 0], [d * 0.98, d * 0.35], [d * 0.85, d * 0.6], [0, d * 0.66]].map(p => new THREE.Vector2(p[0], p[1]));
    const hm = mesh(new THREE.LatheGeometry(pts, 64), m); hm.position.y = L; g.add(hm); top = L + d * 0.66;
  } else {
    const pts = [[d / 2, 0], [d, d * 0.55], [d, d * 0.62], [0, d * 0.62]].map(p => new THREE.Vector2(p[0], p[1]));
    const hm = mesh(new THREE.LatheGeometry(pts, 64), m); hm.position.y = L - d * 0.55; g.add(hm); top = L + 0.07 * d;
  }
  const dc = decal(d * 1.7, driveDrawer(drive), { metal: 0.2, rough: 0.8 }); dc.position.y = top + 0.03; g.add(dc);
  g.userData = { top, mat: m };
  return g;
}
/** socket-head cap screw (Allen), head on top */
export function socketScrew({ d = 10, L = 30, mat } = {}) {
  const m = mat || M.black();
  const g = new THREE.Group();
  const th = mesh(threadGeometry({ dMajor: d, pitch: d * 0.15, y0: 0, y1: L - 1 }), m); th.rotation.x = Math.PI; th.position.y = L - 1; g.add(th);
  const D = d * 1.5, H = d, key = d * 0.8 / Math.sqrt(3) * 1.0;
  const sh = new THREE.Shape(); sh.absarc(0, 0, D / 2, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const x = Math.cos(a) * key * 1.0, y = Math.sin(a) * key; i ? hole.lineTo(x, y) : hole.moveTo(x, y); } hole.closePath(); sh.holes.push(hole);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: true, bevelSize: 0.5, bevelThickness: 0.5, bevelSegments: 2, curveSegments: 48 });
  hg.rotateX(-Math.PI / 2);
  const hm = mesh(hg, m); hm.position.y = L; g.add(hm);
  const floor = mesh(new THREE.CylinderGeometry(key, key, 0.3, 6), M.dark()); floor.position.y = L + H * 0.45; g.add(floor);
  g.userData = { top: L + H, mat: m, key: d * 0.8 };
  return g;
}

// ---------- nuts ----------
export function hexNutGeo(s, m, d) {
  const r = s / Math.sqrt(3);
  const sh = new THREE.Shape(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; i ? sh.lineTo(r * Math.cos(a), r * Math.sin(a)) : sh.moveTo(r, 0); } sh.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, d / 2 * 0.86, 0, Math.PI * 2, true); sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: m - 0.8, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 2, curveSegments: 40 });
  g.translate(0, 0, 0.4); g.rotateX(-Math.PI / 2);
  return g;
}
export function hexNut({ d = 10, s = 17, m = 8, mat, stamp } = {}) {
  const mt = mat || M.zinc(); const g = new THREE.Group();
  g.add(mesh(hexNutGeo(s, m, d), mt));
  const inner = mesh(threadGeometry({ dMajor: d * 0.9, pitch: d * 0.15, y0: 0.2, y1: m - 0.2, chamferTip: false }), M.dark()); inner.material.side = THREE.BackSide; g.add(inner);
  if (stamp) { const st = headStamp(s, stamp); st.position.y = m + 0.05; g.add(st); }
  g.userData = { mat: mt, m };
  return g;
}
export function nylockNut({ d = 10, s = 17, m = 12, mat } = {}) {
  const g = hexNut({ d, s, m: m * 0.7, mat });
  const mt = g.userData.mat;
  const col = mesh(new THREE.CylinderGeometry(s * 0.47, s * 0.5, m * 0.3, 48, 1, true), mt); col.position.y = m * 0.85; g.add(col);
  const top = mesh(new THREE.RingGeometry(d * 0.43, s * 0.47, 48), mt); top.rotation.x = -Math.PI / 2; top.position.y = m; g.add(top);
  const ny = mesh(new THREE.CylinderGeometry(d * 0.5, d * 0.5, m * 0.28, 48, 1, true), M.nylon()); ny.material.side = THREE.DoubleSide; ny.position.y = m * 0.84; g.add(ny);
  const nyTop = mesh(new THREE.RingGeometry(d * 0.42, d * 0.5, 48), ny.material); nyTop.rotation.x = -Math.PI / 2; nyTop.position.y = m - 0.1; g.add(nyTop);
  g.userData.nylon = ny.material;
  return g;
}
export function flangeNut({ d = 10, s = 15, m = 10, mat } = {}) {
  const mt = mat || M.zinc(); const g = new THREE.Group();
  const fl = mesh(new THREE.CylinderGeometry(s * 0.72, s * 0.8, 2, 64), mt); fl.position.y = 1; g.add(fl);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const r = mesh(new THREE.BoxGeometry(0.5, 0.4, s * 0.25), M.dark()); r.position.set(Math.cos(a) * s * 0.62, 0.1, Math.sin(a) * s * 0.62); r.rotation.y = -a; g.add(r); }
  const h = mesh(hexNutGeo(s, m - 2, d), mt); h.position.y = 2; g.add(h);
  g.userData = { mat: mt };
  return g;
}
export function wingNut({ d = 8, mat } = {}) {
  const mt = mat || M.zinc(); const g = new THREE.Group();
  const boss = mesh(new THREE.CylinderGeometry(d * 0.8, d * 1.05, d * 1.2, 48), mt); boss.position.y = d * 0.6; g.add(boss);
  for (const sgn of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(d * 1.6, d * 0.2, d * 2.2, d * 1.9); sh.quadraticCurveTo(d * 1.5, d * 2.2, d * 0.6, d * 1.15); sh.lineTo(0, d * 1.1); sh.closePath();
    const wg = new THREE.ExtrudeGeometry(sh, { depth: d * 0.32, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2 });
    wg.translate(d * 0.6, 0, -d * 0.16);
    const w = mesh(wg, mt); if (sgn < 0) w.rotation.y = Math.PI; g.add(w);
  }
  g.userData = { mat: mt };
  return g;
}
export function slottedNut({ d = 10, s = 17, m = 12, mat } = {}) {
  const mt = mat || M.zinc(); const g = new THREE.Group();
  g.add(mesh(hexNutGeo(s, m * 0.65, d), mt));
  for (let i = 0; i < 6; i++) {
    const a0 = i / 6 * Math.PI * 2 + 0.2, a1 = a0 + Math.PI * 2 / 6 - 0.5;
    const sh = new THREE.Shape(); sh.absarc(0, 0, s * 0.45, a0, a1, false); sh.absarc(0, 0, d * 0.45, a1, a0, true); sh.closePath();
    const cg = new THREE.ExtrudeGeometry(sh, { depth: m * 0.35, bevelEnabled: false, curveSegments: 12 }); cg.rotateX(-Math.PI / 2);
    const c = mesh(cg, mt); c.position.y = m * 0.65; g.add(c);
  }
  g.userData = { mat: mt };
  return g;
}

// ---------- washers / rings ----------
export function washer({ id = 10.5, od = 20, t = 2, mat, chamfer = false } = {}) {
  const pts = chamfer ? [[id / 2, 0], [od / 2, 0], [od / 2, t * 0.6], [od / 2 - t * 0.5, t], [id / 2, t]] : [[id / 2, 0], [od / 2, 0], [od / 2, t], [id / 2, t]];
  const g = mesh(new THREE.LatheGeometry([...pts, pts[0]].map(p => new THREE.Vector2(p[0], p[1])), 72), mat || M.zinc());
  return g;
}
export function splitWasher({ id = 10.2, od = 18, t = 2.5, mat } = {}) {
  const r = (id + od) / 4, w = (od - id) / 2, gap = 0.22, turns = Math.PI * 2 - gap;
  const pts = []; for (let i = 0; i <= 80; i++) { const a = gap / 2 + turns * i / 80; pts.push(new THREE.Vector3(Math.cos(a) * r, t / 2 + (i / 80 - 0.5) * t * 0.8, Math.sin(a) * r)); }
  const path = new THREE.CatmullRomCurve3(pts);
  const sh = new THREE.Shape(); sh.moveTo(-t / 2, -w / 2); sh.lineTo(t / 2, -w / 2); sh.lineTo(t / 2, w / 2); sh.lineTo(-t / 2, w / 2); sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { steps: 120, extrudePath: path, bevelEnabled: false }), mat || M.black());
}
export function toothWasher({ id = 10.5, od = 20, t = 0.8, teeth = 12, external = true, mat } = {}) {
  const sh = new THREE.Shape(), n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, q = i % 4;
    const r = external ? (q === 1 || q === 2 ? od / 2 : od / 2 * 0.8) : od / 2;
    i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const h = new THREE.Path();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, q = i % 4;
    const r = external ? id / 2 : (q === 1 || q === 2 ? id / 2 : id / 2 * 1.25);
    i ? h.lineTo(Math.cos(a) * r, Math.sin(a) * r) : h.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  return mesh(g, mat || M.zinc());
}
export function squareWasher({ s = 20, id = 10.5, t = 2, mat } = {}) {
  const sh = new THREE.Shape(); sh.moveTo(-s / 2, -s / 2); sh.lineTo(s / 2, -s / 2); sh.lineTo(s / 2, s / 2); sh.lineTo(-s / 2, s / 2); sh.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, id / 2, 0, Math.PI * 2, true); sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 1, curveSegments: 32 }); g.rotateX(-Math.PI / 2);
  return mesh(g, mat || M.zinc());
}
/** retaining ring (circlip), lying flat */
export function circlip({ r = 12, w = 2.2, t = 1.2, external = true, mat } = {}) {
  const sh = new THREE.Shape(); const gap = 0.55;
  sh.absarc(0, 0, r + w, gap, Math.PI * 2 - gap, false); sh.absarc(0, 0, r, Math.PI * 2 - gap, gap, true); sh.closePath();
  const g = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 64 }); geo.rotateX(-Math.PI / 2);
  const m = mat || M.black();
  g.add(mesh(geo, m));
  for (const s of [-1, 1]) {
    const lug = new THREE.Shape(); lug.absarc(0, 0, w * 1.4, 0, Math.PI * 2, false); const hh = new THREE.Path(); hh.absarc(0, 0, w * 0.6, 0, Math.PI * 2, true); lug.holes.push(hh);
    const lg = new THREE.ExtrudeGeometry(lug, { depth: t, bevelEnabled: false }); lg.rotateX(-Math.PI / 2);
    const l = mesh(lg, m); const a = s * (gap + 0.25); l.position.set(Math.cos(a) * (r + w * 0.9), 0, -Math.sin(a) * (r + w * 0.9)); g.add(l);
  }
  return g;
}

// ---------- pins / rivets ----------
export function dowel({ d = 6, L = 40, mat } = {}) { const p = [[0, 0], [d / 2 - 0.6, 0], [d / 2, 0.6], [d / 2, L - 0.6], [d / 2 - 0.6, L], [0, L]]; return mesh(new THREE.LatheGeometry(p.map(q => new THREE.Vector2(q[0], q[1])), 40), mat || M.stainless()); }
export function taperPin({ d = 6, L = 40, mat } = {}) { const p = [[0, 0], [d * 0.4, 0], [d / 2, L], [0, L]]; return mesh(new THREE.LatheGeometry(p.map(q => new THREE.Vector2(q[0], q[1])), 40), mat || M.stainless()); }
export function rollPin({ d = 6, L = 40, mat } = {}) {
  const sh = new THREE.Shape(); sh.absarc(0, 0, d / 2, 0.15, Math.PI * 2 - 0.15, false); sh.absarc(0, 0, d / 2 - 0.8, Math.PI * 2 - 0.2, 0.2, true); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false, curveSegments: 40 }); g.rotateX(-Math.PI / 2);
  return mesh(g, mat || M.black());
}
export function cotterPin({ L = 45, d = 3, mat } = {}) {
  const m = mat || M.zinc(); const g = new THREE.Group();
  for (const s of [-1, 1]) { const leg = mesh(new THREE.CylinderGeometry(d / 2, d / 2, L * (s > 0 ? 1 : 0.85), 16), m); leg.scale.x = 0.55; leg.position.set(s * d * 0.28, L * (s > 0 ? 0.5 : 0.575), 0); g.add(leg); }
  const eye = mesh(new THREE.TorusGeometry(d * 1.3, d / 2, 12, 40), m); eye.position.y = L + d * 1.1; g.add(eye);
  return g;
}
export function rClip({ L = 50, d = 2.2, mat } = {}) {
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push(new THREE.Vector3(0, u * L, 0)); }
  const straight = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, L, 0));
  const bend = new THREE.CatmullRomCurve3([new THREE.Vector3(0, L, 0), new THREE.Vector3(5, L + 6, 0), new THREE.Vector3(10, L, 0), new THREE.Vector3(9, L * 0.6, 0), new THREE.Vector3(6, L * 0.25, 0), new THREE.Vector3(9, 4, 0), new THREE.Vector3(11, 0, 0)]);
  const g = new THREE.Group(); const m = mat || M.zinc();
  g.add(mesh(new THREE.TubeGeometry(straight, 4, d / 2, 12), m), mesh(new THREE.TubeGeometry(bend, 80, d / 2, 12), m));
  return g;
}
export function blindRivet({ d = 4.8, L = 12, mat } = {}) {
  const m = mat || M.stainless(); const g = new THREE.Group();
  const head = mesh(new THREE.CylinderGeometry(d, d * 1.02, 1.2, 40), m); head.position.y = 0.6; g.add(head);
  const body = mesh(new THREE.CylinderGeometry(d / 2, d / 2, L, 32, 1, true), m); body.material.side = THREE.DoubleSide; body.position.y = -L / 2; g.add(body);
  const mand = mesh(new THREE.CylinderGeometry(d * 0.2, d * 0.2, L + 22, 16), M.zinc()); mand.position.y = 11 - L / 2 + 0.6; g.add(mand);
  const ball = mesh(new THREE.SphereGeometry(d * 0.32, 16, 12), M.zinc()); ball.position.y = -L - 0.2; g.add(ball);
  g.userData = { body, mand, ball, L };
  return g;
}
/** flat plate in XZ with optional round holes [[x,z,r]] (top face at y=t) */
export function plate({ w = 120, dpt = 80, t = 6, holes = [], mat, radius = 3 } = {}) {
  const sh = new THREE.Shape(); const x0 = -w / 2, z0 = -dpt / 2;
  sh.moveTo(x0 + radius, z0); sh.lineTo(-x0 - radius, z0); sh.quadraticCurveTo(-x0, z0, -x0, z0 + radius); sh.lineTo(-x0, -z0 - radius); sh.quadraticCurveTo(-x0, -z0, -x0 - radius, -z0); sh.lineTo(x0 + radius, -z0); sh.quadraticCurveTo(x0, -z0, x0, -z0 - radius); sh.lineTo(x0, z0 + radius); sh.quadraticCurveTo(x0, z0, x0 + radius, z0);
  for (const [x, z, r] of holes) { const h = new THREE.Path(); h.absarc(x, -z, r, 0, Math.PI * 2, true); sh.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.6, bevelSegments: 1, curveSegments: 32 });
  g.rotateX(-Math.PI / 2);
  return mesh(g, mat || M.plate());
}

// ---------- tools ----------
export function openSpanner({ size = 17, L = 150, label = '17 mm', mat } = {}) {
  const w = size / 2 + 0.1, R = size * 1.09, hw = size * 0.36, T = size * 0.3;
  const sh = new THREE.Shape(); const a0 = Math.PI - Math.asin(w / R), a1 = Math.asin(hw / R);
  sh.moveTo(R * Math.cos(a0), R * Math.sin(a0)); sh.absarc(0, 0, R, a0, a1, true);
  sh.lineTo(L, hw); sh.absarc(L, 0, hw, Math.PI / 2, -Math.PI / 2, true); sh.lineTo(R * Math.cos(-a1), -hw); sh.absarc(0, 0, R, -a1, -a0, true);
  sh.lineTo(size * 0.35, -w); sh.lineTo(size * 0.62, 0); sh.lineTo(size * 0.35, w); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 2, curveSegments: 40 });
  geo.rotateX(Math.PI / 2); geo.translate(0, T / 2, 0);
  const mt = mat || steel(0xD9DEE6, 0.18, 1.0);
  const g = new THREE.Group(); g.add(mesh(geo, mt));
  if (label) {
    const tex = canvasTex(1024, 256, (c, W2, H2) => { c.fillStyle = 'rgba(30,45,70,0.85)'; c.font = '700 170px PlexLatin'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, W2 / 2, H2 / 2 + 8); });
    const dec = new THREE.Mesh(new THREE.PlaneGeometry(hw * 7, hw * 1.75), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0.3, depthWrite: false }));
    dec.rotation.x = -Math.PI / 2; dec.position.set(L * 0.5, T / 2 + 0.65, 0); g.add(dec);
  }
  g.userData = { mat: mt };
  return g;
}
export function allenKey({ s = 8, L1 = 90, L2 = 30, mat } = {}) {
  const m = mat || M.black(); const g = new THREE.Group();
  const a = mesh(new THREE.CylinderGeometry(s / Math.sqrt(3), s / Math.sqrt(3), L1, 6), m); a.position.y = L1 / 2; g.add(a);
  const b = mesh(new THREE.CylinderGeometry(s / Math.sqrt(3), s / Math.sqrt(3), L2, 6), m); b.rotation.z = Math.PI / 2; b.position.set(-L2 / 2, L1 + s * 0.3, 0); g.add(b);
  const el = mesh(new THREE.SphereGeometry(s * 0.6, 16, 12), m); el.position.set(0, L1 + s * 0.2, 0); g.add(el);
  g.userData = { mat: m };
  return g; // short tip at y=0 (insert end)
}
export function screwdriver({ tip = 'slot', L = 160 } = {}) {
  const g = new THREE.Group();
  const shaft = mesh(new THREE.CylinderGeometry(3, 3, 90, 24), M.stainless()); shaft.position.y = 45; g.add(shaft);
  const tp = mesh(tip === 'slot' ? new THREE.BoxGeometry(7, 8, 1.2) : new THREE.ConeGeometry(3, 8, 4), M.stainless()); tp.position.y = -2; if (tip !== 'slot') tp.rotation.x = Math.PI; g.add(tp);
  const handle = mesh(new THREE.CylinderGeometry(11, 9, 70, 32), paint(0x0A6FD6, 0.5)); handle.position.y = 125; g.add(handle);
  return g;
}
export function torqueWrench({ L = 380 } = {}) {
  const g = new THREE.Group(); const st = steel(0xD9DEE6, 0.25, 0.95);
  const tube = mesh(new THREE.CylinderGeometry(9, 9, L * 0.6, 32), st); tube.rotation.z = Math.PI / 2; tube.position.x = L * 0.35; g.add(tube);
  const grip = mesh(new THREE.CylinderGeometry(13, 12, L * 0.3, 32), paint(0x24364F, 0.6)); grip.rotation.z = Math.PI / 2; grip.position.x = L * 0.8; g.add(grip);
  const head = mesh(new THREE.CylinderGeometry(20, 20, 18, 40), st); head.position.set(0, 0, 0); g.add(head);
  const neck = mesh(new THREE.BoxGeometry(L * 0.12, 14, 16), st); neck.position.x = L * 0.06; g.add(neck);
  const drive = mesh(new THREE.BoxGeometry(10, 12, 10), M.zinc()); drive.position.y = -14; g.add(drive);
  const lever = mesh(new THREE.BoxGeometry(10, 4, 4), M.dark()); lever.position.set(-6, 10, 0); g.add(lever);
  const scaleTex = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#F4F6F8'; c.fillRect(0, 0, w, h); c.fillStyle = '#10213F'; c.font = '700 64px PlexLatin'; for (let i = 0; i <= 10; i++) { c.fillRect(i * w / 10 - 2, 0, 4, i % 2 ? 30 : 50); if (i % 2 === 0) c.fillText(String(20 + i * 10), i * w / 10 - 30, 115); } });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.22, 10), new THREE.MeshBasicMaterial({ map: scaleTex, toneMapped: false })); win.position.set(L * 0.55, 9.3, 0); win.rotation.x = -Math.PI / 2; g.add(win);
  const lock = mesh(new THREE.CylinderGeometry(14, 14, 10, 32), paint(0x0A6FD6, 0.4)); lock.rotation.z = Math.PI / 2; lock.position.x = L * 0.96; g.add(lock);
  g.userData = { grip, lock, head, scaleWin: win };
  return g;
}
export function loctite() {
  const p = [[0, 0], [14, 0], [15, 2], [15, 58], [11, 66], [6, 70], [6, 80], [2, 98], [0, 99]].map(q => new THREE.Vector2(q[0], q[1]));
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry(p, 48), paint(0xC8102E, 0.35)));
  const lab = mesh(new THREE.CylinderGeometry(15.2, 15.2, 30, 48, 1, true), paint(0xF2F2F2, 0.5)); lab.position.y = 30; g.add(lab);
  return g;
}
/** generic "joint": two plates clamped by bolt + nut (+ optional washers). Returns parts for animation. */
export function boltedJoint({ d = 10, L = 40, plates = [10, 10], washerTop = true, washerBottom = true, nutType = 'hex', boltMat, nutMat } = {}) {
  const g = new THREE.Group();
  const s = Math.round(d * 1.6 + 1);
  let y = 0; const pl = [];
  for (const t of plates) { const p = plate({ w: 90, dpt: 60, t, holes: [[0, 0, d / 2 + 0.6]] }); p.position.y = y; g.add(p); pl.push(p); y += t + 1.2; }
  const top = y - 1.2;
  const bolt = hexBolt({ d, L, s, k: d * 0.64, mat: boltMat || M.zinc() });
  bolt.rotation.x = Math.PI; // head on top
  const wT = washerTop ? 2 : 0, wB = washerBottom ? 2 : 0;
  bolt.position.y = top + wT + d * 0.64; g.add(bolt);
  let wt = null, wb = null;
  if (washerTop) { wt = washer({ id: d + 0.5, od: s * 1.25, t: 2 }); wt.position.y = top; g.add(wt); }
  if (washerBottom) { wb = washer({ id: d + 0.5, od: s * 1.25, t: 2 }); wb.position.y = -2; g.add(wb); }
  const nut = nutType === 'nylock' ? nylockNut({ d, s }) : hexNut({ d, s, m: d * 0.8, mat: nutMat });
  nut.rotation.x = Math.PI; nut.position.y = -wB; g.add(nut);
  castAll(g);
  return { g, bolt, nut, plates: pl, wt, wb, top, s };
}
