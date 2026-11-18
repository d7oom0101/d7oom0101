// Slide 11 (metric, method 1 — vernier/digital caliper) + slide 8 (M10 hex head -> 17 mm spanner)
import * as THREE from 'three';
import * as K from '../kit.js';
import {
  COLORS, steel, paint, trackify, studio, shadowFloor, castAll, hexBolt, canvasTex, redraw,
  el, svgEl, project, place, leader, seg, win, easeIO, easeOut, easeBack, smooth, lerp, lerpV, v3, clamp,
} from '../engine.js';

const D = 9.85;            // measured major diameter shown in the deck (slide 11)
const RC = D / 2;          // crest radius
const PITCH = 1.5;
const RR = RC - 0.5413 * PITCH; // root radius
const OPEN = 30;           // caliper reading before closing
const YM = 52;             // caliper beam bottom (world y) when measuring
const YC = 30;             // height on the bolt where we show the diameters

export function buildCaliper() {
  const g = new THREE.Group();
  const st = steel(0xDCE2EA, 0.22, 0.95);
  const body = paint(0xE9EDF2, 0.45);
  const dark = paint(0x24364F, 0.4);
  const T = 3.4;
  const ext = (pts, mat, depth = T) => {
    const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.25, bevelSegments: 1 });
    geo.translate(0, 0, -depth / 2);
    return new THREE.Mesh(geo, mat);
  };
  // beam with engraved scale
  const beam = new THREE.Mesh(new THREE.BoxGeometry(205, 16, T), st); beam.position.set(80, 8, 0); g.add(beam);
  const scaleTex = canvasTex(4096, 320, (c, w, h) => {
    c.fillStyle = '#DCE2EA'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#1B2B44'; c.fillStyle = '#1B2B44'; c.font = '700 110px PlexLatin'; c.textAlign = 'center';
    const pxmm = w / 205; // texture covers beam length
    for (let mm = 0; mm <= 180; mm++) {
      const x = (mm + 22) * pxmm; const L = mm % 10 === 0 ? 150 : mm % 5 === 0 ? 105 : 70;
      c.lineWidth = mm % 10 === 0 ? 7 : 4; c.beginPath(); c.moveTo(x, h); c.lineTo(x, h - L); c.stroke();
      if (mm % 10 === 0 && mm > 0) c.fillText(String(mm / 10), x, 120);
    }
  });
  const scale = new THREE.Mesh(new THREE.PlaneGeometry(205, 16), new THREE.MeshStandardMaterial({ map: scaleTex, roughness: 0.35, metalness: 0.6 }));
  scale.position.set(80, 8, T / 2 + 0.27); g.add(scale);
  // fixed lower jaw (inner measuring face at x=0) + small upper jaw
  g.add(ext([[-22, 0.5], [0, 0.5], [0, -38], [-2.4, -42.5], [-9, -37], [-22, -13]], st));
  g.add(ext([[-11, 15.5], [0, 15.5], [0, 27], [-1.6, 30], [-11, 22]], st));
  // slider
  const slider = new THREE.Group(); g.add(slider);
  slider.add(ext([[0, 0.5], [22, 0.5], [22, -13], [9, -37], [2.4, -42.5], [0, -38]], st));
  slider.add(ext([[0, 15.5], [11, 15.5], [11, 22], [1.6, 30], [0, 27]], st));
  const hous = new THREE.Mesh(new THREE.BoxGeometry(68, 34, 11, 1, 1, 1), body); hous.position.set(40, 8, 2.6); slider.add(hous);
  const lcdTex = canvasTex(640, 240, () => {});
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(40, 15), new THREE.MeshBasicMaterial({ map: lcdTex, toneMapped: false }));
  lcd.position.set(40, 11.5, 8.45); slider.add(lcd);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(43, 18, 0.5), dark); bezel.position.set(40, 11.5, 8.15); slider.add(bezel);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.2, 24), paint([0x0A6FD6, 0x24364F, 0x24364F][i], 0.4));
    b.rotation.x = Math.PI / 2; b.position.set(26 + i * 14, -2.6, 8.4); slider.add(b);
  }
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3, 28), dark); wheel.rotation.x = Math.PI / 2; wheel.position.set(70, 27, 0); slider.add(wheel);
  castAll(g);
  return { g, slider, lcdTex };
}
export function drawLCD(tex, reading, unit = "mm", digits = 2) {
  redraw(tex, (c, w, h) => {
    c.fillStyle = '#C9D6C0'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#16222A'; c.font = '700 168px PlexLatin'; c.textAlign = 'right'; c.textBaseline = 'alphabetic';
    c.fillText(reading.toFixed(digits), w - 130, 190);
    c.font = '600 64px PlexLatin'; c.fillText(unit, w - 20, 190);
  });
}

function buildSpanner() {
  const R = 18.5, w = 8.6, hw = 6.2, L = 150, T = 5.2;
  const sh = new THREE.Shape();
  const a0 = Math.PI - Math.asin(w / R), a1 = Math.asin(hw / R);
  sh.moveTo(R * Math.cos(a0), R * Math.sin(a0));
  sh.absarc(0, 0, R, a0, a1, true);
  sh.lineTo(L, hw); sh.absarc(L, 0, hw, Math.PI / 2, -Math.PI / 2, true);
  sh.lineTo(R * Math.cos(-a1), -hw);
  sh.absarc(0, 0, R, -a1, -a0, true);
  sh.lineTo(6, -w); sh.lineTo(10.6, 0); sh.lineTo(6, w); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 2, curveSegments: 40 });
  geo.rotateX(Math.PI / 2); geo.translate(0, T / 2, 0); // lies flat in XZ, centred on y
  const mat = steel(0xD9DEE6, 0.18, 1.0);
  const m = new THREE.Mesh(geo, mat);
  const g = new THREE.Group(); g.add(m);
  const tex = canvasTex(1024, 256, (c, W2, H2) => {
    c.clearRect(0, 0, W2, H2); c.fillStyle = 'rgba(30,45,70,0.85)'; c.font = '700 170px PlexLatin'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('17 mm', W2 / 2, H2 / 2 + 8);
  });
  const dec = new THREE.Mesh(new THREE.PlaneGeometry(46, 11.5), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0.3, depthWrite: false }));
  dec.rotation.x = -Math.PI / 2; dec.position.set(75, T / 2 + 0.65, 0); g.add(dec);
  castAll(g);
  return { g, mat };
}

export default function caliper({ cue, duration }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1920 / 1080, 1, 5000);
  studio(scene, { target: v3(0, 25, 0), size: 160, keyPos: v3(160, 420, 300) });
  shadowFloor(scene, 0, 2000, 0.16);

  const bolt = hexBolt({ d: D, pitch: PITCH, L: 40, s: 17, k: 6.4 });
  scene.add(bolt);
  const head = bolt.getObjectByName('head');
  const headMat = head.material = head.material.clone();
  const threadMat = bolt.getObjectByName('thread').material;

  const cal = buildCaliper(); scene.add(cal.g);
  const sp = buildSpanner(); scene.add(sp.g);

  // ---- overlay ----
  const dimCrest = {
    line: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5, 'marker-start': '', 'stroke-linecap': 'round' }),
    t1: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 4 }), t2: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 4 }),
  };
  const dimRoot = {
    line: svgEl('line', { stroke: '#5C6E8A', 'stroke-width': 4, 'stroke-dasharray': '10 8' }),
    t1: svgEl('line', { stroke: '#5C6E8A', 'stroke-width': 3 }), t2: svgEl('line', { stroke: '#5C6E8A', 'stroke-width': 3 }),
  };
  const lblCrest = el('lbl track', 'قمم السن ← القطر الخارجي');
  const lblRoot = el('lbl', 'قاع السن', { borderColor: '#5C6E8A', color: '#5C6E8A' });
  const ring1 = svgEl('circle', { fill: 'none', stroke: '#FF7A00', 'stroke-width': 5 });
  const ring2 = svgEl('circle', { fill: 'none', stroke: '#FF7A00', 'stroke-width': 5 });
  const lblJaws = el('lbl', 'فكّا الفرجار');
  const ldJaws = leader();
  const lcdFrame = svgEl('polygon', { fill: 'none', stroke: '#FF7A00', 'stroke-width': 7, 'stroke-linejoin': 'round' });
  const lblLcd = el('lbl track', 'القراءة');
  const roundCard = el('card', `<div style="display:flex;align-items:center;gap:34px;direction:ltr">
      <span style="font:700 92px PlexLatin;color:#5C6E8A">9.85</span>
      <svg width="120" height="70" viewBox="0 0 120 70"><path d="M8 35 H98 M78 12 L104 35 L78 58" stroke="#FF7A00" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span style="font:700 120px PlexLatin;color:#FF7A00">10</span><span style="font:600 56px Plex;color:#B54F00">مم</span></div>
      <div style="font:500 36px Plex;color:#5C6E8A;margin-top:6px">نقرّب لأكبر عدد صحيح</div>`);
  const badge = el('big', '<div style="background:#003DA5;color:#fff;border-radius:22px;padding:6px 34px 12px;font:700 96px PlexLatin;direction:ltr">M10</div>');
  const ldBadge = leader();
  const dimHead = { line: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 5 }), t1: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 4 }), t2: svgEl('line', { stroke: '#FF7A00', 'stroke-width': 4 }) };
  const lblHead = el('lbl track', 'عرض الرأس: <span class="ltr" style="font-family:PlexLatin">17</span> مم');
  const lblThread = el('lbl', 'قطر السن: <span class="ltr" style="font-family:PlexLatin">10</span> مم');
  const ldThread = leader();
  const take = el('card', `<div style="font:600 46px Plex;color:#10213F">القطر يحدّد مقاس البرغي <span class="ltr" style="font-family:PlexLatin;color:#003DA5">M10</span>
     &nbsp;•&nbsp; والرأس يحدّد مقاس المفتاح <span class="ltr" style="font-family:PlexLatin;color:#B54F00">17 mm</span></div>`);
  const chip = el('chip', 'مرجع العرض: الشريحة 11 + الشريحة 8');
  const logo = el('logo', '<img src="/assets/pg_logo_circle.png" style="width:86px;height:86px">', { transform: 'none' });

  const dimSet = (d, a, b, tick, op) => {
    d.line.setAttribute('x1', a.x); d.line.setAttribute('y1', a.y); d.line.setAttribute('x2', b.x); d.line.setAttribute('y2', b.y);
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * tick, ny = dx / L * tick;
    d.t1.setAttribute('x1', a.x - nx); d.t1.setAttribute('y1', a.y - ny); d.t1.setAttribute('x2', a.x + nx); d.t1.setAttribute('y2', a.y + ny);
    d.t2.setAttribute('x1', b.x - nx); d.t2.setAttribute('y1', b.y - ny); d.t2.setAttribute('x2', b.x + nx); d.t2.setAttribute('y2', b.y + ny);
    for (const k in d) d[k].style.opacity = op;
  };

  // ---- key times (all tied to the narration cues) ----
  const C1 = cue('c1'), C2 = cue('c2'), C3 = cue('c3'), C3e = cue('c3', 'end');
  const C4a = cue('c4a'), C4b = cue('c4b'), C4c = cue('c4c'), C5a = cue('c5a'), C5b = cue('c5b'), C5be = cue('c5b', 'end');
  const tDescend = [C3 - 0.6, C3 + 1.1];
  const tClose = [C3 + 1.2, C3e - 0.05];       // jaws reach the crests as the narrator finishes "…القمم"
  const tContact = tClose[1];
  const tLift = [C5a - 0.2, C5a + 1.0];
  const C6 = cue('c6'), C7 = cue('c7'), C8 = cue('c8'), C9 = cue('c9'), C9e = cue('c9', 'end');
  const D2 = 9.398; // 3/8 in bolt measured as 0.37 in (slide 11)
  const tDesc2 = [C6 - 0.3, C6 + 0.8], tClose2 = [C6 + 0.9, C6 + 2.6], tLift2 = [C8 - 0.6, C8 + 0.2];
  // --- measuring gauge (method 2)
  const gauge = new THREE.Group(); gauge.position.set(260, 0, 0); scene.add(gauge);
  const GH = [[-64, 3.33, '1/4'], [-32, 4.12, '5/16'], [0, 4.91, '3/8'], [32, 5.71, '7/16'], [64, 6.5, '1/2']];
  const gp = K.plate({ w: 170, dpt: 56, t: 4, holes: GH.map(([x, r]) => [x, 6, r]), mat: K.M.green() }); gauge.add(gp);
  const gl = K.decal(170, (c, w, h) => { c.fillStyle = '#fff'; c.font = '700 22px PlexLatin'; c.textAlign = 'center'; GH.forEach(([x, , txt]) => c.fillText(txt + '"', w / 2 + x / 170 * w, h / 2 - 20 / 170 * h)); }, { metal: 0, rough: 0.6 });
  gl.position.y = 4.65; gauge.add(gl);
  const gBolt = K.displayBolt({ d: D2, L: 30, s: 14.3, k: 6 }); gauge.add(gBolt);
  K.castShadows(gauge);
  const xMark = el('big', '<div style="font:700 120px PlexLatin;color:#D93A3A">✗</div>');
  const okMark = el('big', '<div style="font:700 120px PlexLatin;color:#1E9E5A">✓</div>');
  const noForce = el('lbl', 'بدون غصب', { borderColor: '#D93A3A', color: '#D93A3A' });
  const conv = el('card', `<table style="border-collapse:collapse;direction:ltr">${[['11/32', '0.34375'], ['3/8', '0.375'], ['13/32', '0.40625']].map((r, i) => `<tr style="${i === 1 ? 'background:#FFE8D2;outline:4px solid #FF7A00' : ''}"><td style="padding:8px 30px;font:700 46px PlexLatin;color:${i === 1 ? '#B54F00' : '#10213F'}">${r[0]}"</td><td style="padding:8px 30px;font:600 46px PlexLatin;color:#5C6E8A">${r[1]}</td></tr>`).join('')}</table>
     <div style="font:600 34px Plex;color:#10213F;margin-top:12px"><span class="ltr" style="font-family:PlexLatin">0.37</span> ← نختار القيمة الأعلى مباشرة: <span class="ltr" style="font-family:PlexLatin;color:#B54F00">3/8"</span></div>`);

  let lastReading = -1;
  function update(t) {
    // --- bolt: gentle spin in at the start, then still for measuring
    const spin = (1 - seg(t, 0, C2 + 0.3)) * 1.1;
    bolt.rotation.y = -spin + seg(t, C5a, C5a + 1.6) * 0.0;

    // --- caliper position / reading
    const phase2 = t >= C6 - 0.4;
    const desc = phase2 ? seg(t, ...tDesc2) : seg(t, ...tDescend);
    const lift = phase2 ? seg(t, ...tLift2, easeIO) : seg(t, ...tLift, easeIO);
    const rc = phase2 ? D2 / 2 : RC;
    cal.g.position.set(-rc, YM + (1 - desc) * 90 + lift * 110, 0);
    cal.g.visible = desc > 0.001 && lift < 0.999;
    let r = OPEN;
    if (!phase2) {
      if (t >= tClose[0]) r = lerp(OPEN, D, easeOut((t - tClose[0]) / (tClose[1] - tClose[0])));
      if (t >= tLift[0]) r = lerp(D, 24, seg(t, tLift[0], tLift[0] + 0.5));
    } else {
      r = lerp(24, D2, easeOut(clamp((t - tClose2[0]) / (tClose2[1] - tClose2[0]))));
    }
    cal.slider.position.x = r;
    const shown = phase2 ? Math.round(r / 25.4 * 1000) / 1000 : Math.round(r * 100) / 100;
    if (shown !== lastReading) { phase2 ? drawLCD(cal.lcdTex, shown, 'in', 3) : drawLCD(cal.lcdTex, shown); lastReading = shown; }
    const sc2 = phase2 ? D2 / D : 1; bolt.scale.set(sc2, 1, sc2);
    bolt.visible = t < C8 + 0.2;
    // gauge: wrong hole first (no forcing), then the hole that fits
    const gIn = seg(t, C8 - 0.3, C8 + 0.6, easeOut);
    gauge.visible = t > C8 - 0.6;
    let gx = -32, gy = 60 * (1 - gIn) + 12;
    const shake = win(t, C9 - 0.1, C9 + 1.0, 0.1) * Math.sin(t * 60) * 0.8;
    const move = seg(t, C9 + 1.0, C9 + 1.8, easeIO), drop = seg(t, C9 + 1.9, C9 + 2.6, easeOut);
    gx = lerp(-32, 0, move) + shake; gy = lerp(gy, 12, 1) + (move > 0 && move < 1 ? Math.sin(move * Math.PI) * 14 : 0) - drop * 16;
    if (t < C9 - 0.1) gy = 12 + 60 * (1 - gIn) + 6 * seg(t, C8 + 0.6, C8 + 1.3);
    gBolt.position.set(gx, gy - 6, 6);

    // --- spanner slides onto the flats
    const sIn = seg(t, C5b - 0.2, C5b + 1.3, easeOut) * (1 - seg(t, C6 - 0.8, C6 - 0.2, easeIO));
    sp.g.position.set(lerp(260, 0, sIn), 3.2, 0);
    sp.g.visible = sIn > 0.001;

    // --- tracking colour: thread while we measure, head when we talk about the spanner
    trackify(threadMat, 0.0);
    trackify(headMat, win(t, C5a + 0.2, C6 - 0.3, 0.5));

    // --- camera
    const shots = [
      // [time, position, target]
      [0, v3(110, 70, 150), v3(0, 24, 0)],
      [C1 + 1.6, v3(30, 48, 128), v3(0, 26, 0)],
      [C2 - 0.1, v3(0, YC + 3, 84), v3(0, YC, 0)],             // c2: flat front view on the thread silhouette
      [C2 + 2.6, v3(0, YC + 3, 84), v3(0, YC, 0)],
      [C3 - 0.2, v3(18, 52, 300), v3(14, 34, 0)],              // c3: open caliper comes in
      [tClose[0] + 0.6, v3(10, 42, 230), v3(4, 32, 0)],
      [tContact, v3(0, 34, 128), v3(0, 31, 0)],                // hold on the contact
      [tContact + 0.9, v3(0, 34, 128), v3(0, 31, 0)],
      [C4a + 0.1, v3(30, 60, 175), v3(30, 52, 0)],             // c4a: the LCD
      [C4b - 0.2, v3(30, 60, 175), v3(30, 52, 0)],
      [C4c - 0.1, v3(60, 75, 300), v3(18, 36, 0)],             // c4c: whole bolt + M10 badge
      [C5a + 0.2, v3(60, 75, 300), v3(18, 36, 0)],
      [C5b - 0.3, v3(95, 120, 175), v3(20, 4, 0)],             // c5: head + spanner from above
      [C6 - 0.4, v3(108, 130, 190), v3(26, 4, 0)],
      [C6 + 0.6, v3(10, 42, 230), v3(4, 32, 0)],               // c6: inch bolt, caliper again
      [tClose2[1], v3(0, 34, 128), v3(0, 31, 0)],
      [C7 - 0.1, v3(30, 60, 175), v3(30, 52, 0)],
      [C7 + 0.6, v3(-20, 60, 230), v3(10, 52, 0)],
      [C8 - 0.4, v3(-20, 60, 230), v3(10, 52, 0)],
      [C8 + 0.5, v3(260, 120, 190), v3(250, 8, 0)],            // c8: measuring gauge
      [C9 + 0.8, v3(250, 95, 150), v3(250, 8, 0)],
      [duration, v3(262, 90, 140), v3(260, 8, 0)],
    ];
    let i = 0; while (i < shots.length - 2 && t >= shots[i + 1][0]) i++;
    const [ta, pa, qa] = shots[i], [tb, pb, qb] = shots[i + 1];
    const k = easeIO((t - ta) / Math.max(1e-6, tb - ta));
    camera.position.copy(lerpV(pa, pb, k));
    camera.lookAt(lerpV(qa, qb, k));
    camera.updateMatrixWorld();

    // --- overlay: crest vs root dimension (c2)
    const op2 = win(t, C2 - 0.1, C3 - 0.3, 0.3);
    const pc1 = project(v3(-RC, YC, 0), camera), pc2 = project(v3(RC, YC, 0), camera);
    const ext = seg(t, C2, C2 + 0.6);
    const mid = (pc1.x + pc2.x) / 2;
    const ga = { x: lerp(mid, pc1.x - 6, ext), y: pc1.y }, gb = { x: lerp(mid, pc2.x + 6, ext), y: pc2.y };
    dimSet(dimCrest, ga, gb, 18, op2);
    const pr1 = project(v3(-RR, YC - 6, 0), camera), pr2 = project(v3(RR, YC - 6, 0), camera);
    const op2b = op2 * seg(t, C2 + 1.3, C2 + 1.7);
    dimSet(dimRoot, { x: pr1.x + 3, y: pr1.y }, { x: pr2.x - 3, y: pr2.y }, 14, op2b);
    place(lblCrest, mid, pc1.y - 150, op2);
    place(lblRoot, mid, pr1.y + 150, op2b);

    // --- contact pulse (c3)
    const pk = clamp((t - tContact) / 0.7);
    const pulse = t >= tContact ? (1 - pk) : 0;
    const q1 = project(v3(-RC, YC + 4, 0), camera), q2 = project(v3(RC, YC + 4, 0), camera);
    for (const [ring, q] of [[ring1, q1], [ring2, q2]]) { ring.setAttribute('cx', q.x); ring.setAttribute('cy', q.y); ring.setAttribute('r', 14 + pk * 46); ring.style.opacity = pulse; }
    const opJ = win(t, C3 + 0.4, tContact - 0.2, 0.3);
    const jp = project(v3(RC + 2, YM - 30, 0), camera);
    place(lblJaws, jp.x + 330, jp.y - 40, opJ); ldJaws.set(jp.x + 8, jp.y, jp.x + 200, jp.y - 40, opJ);

    // --- reading + rounding (c4a/c4b)
    // the LCD itself carries the reading; frame it in the tracking colour
    const sx = r - RC;
    const corners = [[19, 3.5], [61, 3.5], [61, 19.5], [19, 19.5]].map(([x, y]) => project(v3(sx + x, YM + y, 8.6), camera));
    const cx = corners.reduce((a, c) => a + c.x, 0) / 4, cy = corners.reduce((a, c) => a + c.y, 0) / 4;
    const pl = 1 + 0.03 * Math.sin((t - C4a) * 6);
    lcdFrame.setAttribute('points', corners.map(c => `${cx + (c.x - cx) * 1.08 * pl},${cy + (c.y - cy) * 1.18 * pl}`).join(' '));
    const opL = win(t, C4a + 0.2, C4c - 0.1, 0.3); lcdFrame.style.opacity = opL;
    place(lblLcd, cx, Math.min(...corners.map(c => c.y)) - 80, opL);
    place(roundCard, 1430, 800, win(t, C4b, C4c + 0.5, 0.3), lerp(0.9, 1, seg(t, C4b, C4b + 0.4, easeBack)));
    // --- M10 badge (c4c)
    const opB = win(t, C4c - 0.05, C5a + 0.4, 0.3);
    const bp = project(v3(-RC - 1, 36, 0), camera);
    place(badge, bp.x - 300, bp.y - 60, opB, lerp(0.6, 1, seg(t, C4c - 0.05, C4c + 0.35, easeBack)));
    ldBadge.set(bp.x, bp.y, bp.x - 190, bp.y - 50, opB);

    // --- head vs thread (c5)
    const opH = seg(t, C5b + 1.0, C5b + 1.5) * (1 - seg(t, C6 - 0.7, C6 - 0.3));
    const h1 = project(v3(-2, 6.6, -8.5), camera), h2 = project(v3(-2, 6.6, 8.5), camera);
    dimSet(dimHead, h1, h2, 16, opH);
    place(lblHead, (h1.x + h2.x) / 2 - 330, (h1.y + h2.y) / 2 + 90, opH);
    const opT = seg(t, C5a + 0.6, C5a + 1.1) * (1 - seg(t, C6 - 0.7, C6 - 0.3));
    const tp = project(v3(-RC, 36, 0), camera);
    place(lblThread, tp.x - 300, tp.y - 90, opT); ldThread.set(tp.x, tp.y, tp.x - 170, tp.y - 90, opT);
    place(take, 960, 960, win(t, C5be + 0.2, C6 - 0.3), lerp(0.95, 1, seg(t, C5be + 0.2, C5be + 0.7)));
    place(conv, 1430, 820, win(t, C7, C8 - 0.4), lerp(0.92, 1, seg(t, C7, C7 + 0.4, easeBack)));
    const hp = project(v3(260 - 32, 6, 6), camera), hq = project(v3(260, 6, 6), camera);
    place(xMark, hp.x, hp.y - 230, win(t, C9 + 0.1, C9 + 1.1, 0.2)); place(noForce, hp.x - 230, hp.y - 230, win(t, C9 + 0.1, C9 + 1.6, 0.2));
    place(okMark, hq.x, hq.y - 230, win(t, C9 + 2.6, 1e9, 0.2));

    chip.style.opacity = 0.9; logo.style.opacity = 1;
  }
  return { scene, camera, update };
}

caliper.sfx = ({ cue }) => {
  const C3 = cue('c3'), C3e = cue('c3', 'end');
  return [
    { t: 0.05, name: 'whoosh', gain: 0.35 },
    { t: C3 - 0.5, name: 'whoosh', gain: 0.25 },
    { t: C3 + 1.2, name: 'slide', gain: 0.5, dur: C3e - 0.05 - (C3 + 1.2) },
    { t: C3e - 0.05, name: 'contact', gain: 0.8 },
    { t: cue('c4a') + 0.3, name: 'pop', gain: 0.35 },
    { t: cue('c4b'), name: 'pop', gain: 0.35 },
    { t: cue('c4c') - 0.05, name: 'stamp', gain: 0.45 },
    { t: cue('c5a') - 0.2, name: 'whoosh', gain: 0.25 },
    { t: cue('c5b') + 1.25, name: 'clink', gain: 0.6 },
    { t: cue('c5b', 'end') + 0.2, name: 'pop', gain: 0.3 },
    { t: cue('c6') + 0.9, name: 'slide', gain: 0.45, dur: 1.6 }, { t: cue('c6') + 2.6, name: 'contact', gain: 0.7 },
    { t: cue('c7'), name: 'pop', gain: 0.3 }, { t: cue('c9'), name: 'knock', gain: 0.35 }, { t: cue('c9') + 2.5, name: 'contact', gain: 0.5 },
  ];
};
