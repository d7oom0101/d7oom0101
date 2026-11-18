// Shared runtime: renderer, materials, easing, geometry builders and the HTML overlay.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const W = 1920, H = 1080;
export const COLORS = {
  blue: 0x003DA5, blue2: 0x0A6FD6, sky: 0x2BA8E8, ice: 0xEAF2FB, ink: 0x10213F,
  track: 0xFF7A00, steel: 0xC9CFD8, zinc: 0xD5DCE6, ok: 0x1E9E5A, bad: 0xD93A3A,
};

// ---------- renderer ----------
export const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xffffff, 0);
renderer.localClippingEnabled = true;
const pmrem = new THREE.PMREMGenerator(renderer);
export const envMap = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

// ---------- time helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = t => Math.pow(clamp(t), 3);
export const easeBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
/** progress of t inside [a,b] with easing */
export const seg = (t, a, b, e = easeIO) => e((t - a) / Math.max(1e-6, b - a));
/** fade in at a, out at b (window), with ramp r */
export const win = (t, a, b, r = 0.35) => Math.min(smooth((t - a) / r), 1 - smooth((t - (b - r)) / r));
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const lerpV = (a, b, t) => new THREE.Vector3().lerpVectors(a, b, t);

// ---------- materials ----------
export function steel(color = COLORS.steel, rough = 0.3, metal = 0.9) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, envMap, envMapIntensity: 1.1 });
}
export function paint(color, rough = 0.5) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.05, envMap, envMapIntensity: 0.6 });
}
/** blend a material toward the tracking colour (k in 0..1) */
export function trackify(mat, k) {
  if (!mat || !mat.emissive) return;
  if (!mat.userData.base) mat.userData.base = { color: mat.color.clone(), emissive: mat.emissive.clone(), metal: mat.metalness };
  const b = mat.userData.base;
  mat.color.copy(b.color).lerp(new THREE.Color(COLORS.track), k * 0.85);
  mat.emissive.copy(b.emissive).lerp(new THREE.Color(COLORS.track), k * 0.28);
  mat.metalness = lerp(b.metal, Math.min(b.metal, 0.45), k);
}

// ---------- lighting rig ----------
export function studio(scene, { target = v3(0, 0, 0), size = 400, keyPos = v3(300, 600, 400), shadow = true } = {}) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xC9D6E8, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.copy(keyPos).add(target);
  key.target.position.copy(target);
  scene.add(key, key.target);
  if (shadow) {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const c = key.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 4 * size + keyPos.length();
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 6;
  }
  const rim = new THREE.DirectionalLight(0xDDEBFF, 0.9);
  rim.position.set(-400, 300, -500).add(target);
  scene.add(rim);
  return { key, rim };
}
export function shadowFloor(scene, y = 0, size = 4000, opacity = 0.13) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity, color: 0x1A2A44 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true;
  scene.add(m); return m;
}
export function castAll(obj, cast = true, receive = false) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
}

// ---------- geometry builders (units: mm) ----------
/** External ISO-like 60° thread along +Y from y0 to y1. Returns BufferGeometry. */
export function threadGeometry({ dMajor = 10, pitch = 1.5, y0 = 0, y1 = 30, seg = 96, perPitch = 24, chamferTip = true, left = false }) {
  const rMaj = dMajor / 2, h = 0.5413 * pitch, rMin = rMaj - h;
  const rows = Math.ceil((y1 - y0) / pitch * perPitch);
  const pos = [], idx = [];
  const prof = ph => { // ph in [0,1): 0 crest centre
    const crest = 0.125 / 2, root = 0.25 / 2; // half-widths
    const d = Math.abs(ph - 0.5); // distance from root centre (0.5)
    // at root centre d=0 -> rMin; at crest centre d=0.5 -> rMaj
    if (d <= root) return 0;
    if (d >= 0.5 - crest) return 1;
    return (d - root) / (0.5 - crest - root);
  };
  for (let i = 0; i <= rows; i++) {
    const y = y0 + (y1 - y0) * i / rows;
    for (let j = 0; j <= seg; j++) {
      const th = j / seg * Math.PI * 2;
      let ph = ((y - y0) / pitch + (left ? 1 : -1) * th / (Math.PI * 2)) % 1; if (ph < 0) ph += 1;
      let r = rMin + h * prof(ph);
      if (chamferTip) r = Math.min(r, rMin - 0.15 + (y1 - y) * 1.0);
      r = Math.min(r, rMin + 0.15 + (y - y0) * 3); // thread run-in at the shank end
      pos.push(r * Math.sin(th), y, r * Math.cos(th));
    }
  }
  for (let i = 0; i < rows; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  g.userData = { rMaj, rMin, h, pitch };
  return g;
}
/** Hex prism (across-flats s, height k) standing on y=0, flats facing ±Z. Bevelled edges. */
export function hexGeometry(s, k, bevel = 0.5) {
  const r = s / Math.sqrt(3); // circumradius
  const sh = new THREE.Shape();
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const x = r * Math.cos(a), y = r * Math.sin(a); i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: k - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 1 });
  g.translate(0, 0, bevel); g.rotateX(-Math.PI / 2); // extrusion -> +Y ; shape y -> -Z
  return g; // vertices at ±X, flats at ±Z (across flats = s)
}
/** Hex bolt: head (s,k) at y in [0,k], thread from k up to k+L. Returns Group with named parts. */
export function hexBolt({ d = 10, pitch = 1.5, L = 40, s = 17, k = 6.4, mat, headMat, washerFace = true }) {
  const g = new THREE.Group();
  const m = mat || steel(COLORS.zinc, 0.28);
  const hm = headMat || m;
  const head = new THREE.Mesh(hexGeometry(s, k, 0.45), hm); head.name = 'head'; g.add(head);
  if (washerFace) { const wf = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.47, s * 0.47, 0.5, 64), hm); wf.position.y = k + 0.2; g.add(wf); }
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(d / 2 - 0.05, d / 2 - 0.05, 2.2, 64), m); shank.position.y = k + 1.1; g.add(shank);
  const th = new THREE.Mesh(threadGeometry({ dMajor: d, pitch, y0: k + 2, y1: k + L }), m); th.name = 'thread'; g.add(th);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(d / 2 - 0.5413 * pitch - 0.1, 48), m); cap.rotation.x = -Math.PI / 2; cap.position.y = k + L - 0.02; g.add(cap);
  g.userData = { d, pitch, L, s, k, mat: m, headMat: hm };
  castAll(g);
  return g;
}

// ---------- canvas textures ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData = { canvas: c, ctx, draw };
  return t;
}
export function redraw(tex, draw) { const { canvas, ctx } = tex.userData; ctx.clearRect(0, 0, canvas.width, canvas.height); draw(ctx, canvas.width, canvas.height); tex.needsUpdate = true; }

// ---------- overlay (HTML/SVG on top of the 3D canvas) ----------
const ov = document.getElementById('ov');
const svg = document.getElementById('svg');
export function clearOverlay() { [...ov.querySelectorAll(':scope > :not(svg)')].forEach(e => e.remove()); svg.innerHTML = ''; }
export function el(cls, html, style = {}) {
  const d = document.createElement('div'); d.className = cls; d.innerHTML = html; Object.assign(d.style, style); d.style.opacity = 0; ov.appendChild(d); return d;
}
export function svgEl(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  svg.appendChild(e); return e;
}
export function project(p, camera) {
  const v = p.clone().project(camera);
  return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, behind: v.z > 1 };
}
export function place(d, x, y, op = 1, scale = 1) { d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.opacity = op; d.style.transform = `translate(-50%,-50%) scale(${scale})`; }
/** Label with leader line from screen point (ax,ay) to label position (lx,ly) */
export function leader() {
  const line = svgEl('line', { stroke: '#003DA5', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const dot = svgEl('circle', { r: 7, fill: '#003DA5' });
  return {
    set(ax, ay, lx, ly, op, track = false) {
      const c = track ? '#FF7A00' : '#003DA5';
      line.setAttribute('x1', ax); line.setAttribute('y1', ay); line.setAttribute('x2', lx); line.setAttribute('y2', ly);
      line.setAttribute('stroke', c); dot.setAttribute('fill', c);
      dot.setAttribute('cx', ax); dot.setAttribute('cy', ay);
      line.style.opacity = op; dot.style.opacity = op;
    }
  };
}
export const fadeEl = document.getElementById('fade');

// small deterministic noise for shakes
export function noise1(t, seed = 1) { return Math.sin(t * 13.1 + seed) * 0.5 + Math.sin(t * 29.7 + seed * 2.3) * 0.3 + Math.sin(t * 61.3 + seed * 4.1) * 0.2; }

/** cut an object with a plane (cutaway). Clones materials; returns the plane. */
export function cutaway(obj, normal = new THREE.Vector3(0, 0, -1), constant = 0, capColor = 0xF0A060) {
  const plane = new THREE.Plane(normal, constant);
  obj.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.clippingPlanes = [plane]; o.material.side = THREE.DoubleSide; o.material.clipShadows = true; } });
  return plane;
}
