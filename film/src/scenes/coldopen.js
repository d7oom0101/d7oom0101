// Cold open: filling line, a cap-presence sensor stops detecting because its
// bracket rotated a few degrees around its single fixing bolt.
import * as THREE from 'three';
import {
  COLORS, steel, paint, trackify, studio, shadowFloor, castAll, hexBolt, canvasTex,
  el, svgEl, project, place, leader, seg, win, easeIO, easeOut, easeBack, smooth, lerp, lerpV, v3, clamp, noise1,
} from '../engine.js';

const V = 240;        // conveyor speed mm/s
const SPACING = 190;  // bottle pitch mm
const BEAM_X = 40;    // x of the sensor beam
const TILT = -4 * Math.PI / 180; // bracket rotation after it slips (nose up)
const PIVOT = v3(25, 230, -215);
const CAP = [190, 211]; // cap height range

function bottleGeo() {
  const pts = [[0, 0], [30, 0], [36, 2.5], [38, 9], [38, 136], [36.5, 148], [29, 163], [17, 175], [13.2, 180], [13.2, 191]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  return new THREE.LatheGeometry(pts, 64);
}

export default function coldopen({ cue, duration }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1920 / 1080, 5, 20000);
  studio(scene, { target: v3(0, 0, 0), size: 1300, keyPos: v3(700, 2200, 1300) });
  shadowFloor(scene, -800, 12000, 0.1);

  const ss = steel(0xD4DAE2, 0.35, 0.85);
  const alu = steel(0xC8CED6, 0.42, 0.8);
  // --- conveyor
  const conv = new THREE.Group(); scene.add(conv);
  const beltTex = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#3A4656'; c.fillRect(0, 0, w, h); c.fillStyle = '#2C3746'; c.fillRect(0, 0, 6, h); c.fillStyle = '#4A5768'; c.fillRect(6, 0, 2, h); });
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(3600 / 50, 1);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(3600, 12, 300), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.75, metalness: 0.1 }));
  belt.position.y = -6; belt.receiveShadow = true; conv.add(belt);
  for (const z of [-165, 165]) {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(3600, 90, 30), ss); fr.position.set(0, -55, z); conv.add(fr);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3600, 16), ss); rail.rotation.z = Math.PI / 2; rail.position.set(0, 62, Math.sign(z) * 52); conv.add(rail);
    for (let x = -1600; x <= 1600; x += 400) {
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 72, 12), ss); p1.position.set(x, 26, z); conv.add(p1);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 113, 12), ss); p2.rotation.x = Math.PI / 2; p2.position.set(x, 62, Math.sign(z) * 108); conv.add(p2);
    }
    for (let x = -1500; x <= 1500; x += 1000) { const lg = new THREE.Mesh(new THREE.BoxGeometry(40, 700, 40), ss); lg.position.set(x, -450, z); conv.add(lg); }
  }
  castAll(conv, true, true);

  // --- bottles (pool)
  const bGeo = bottleGeo();
  const capGeo = new THREE.CylinderGeometry(15, 15, 20, 40);
  const labelTex = canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = '#D9EAFB'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#0A6FD6'; c.beginPath(); c.moveTo(0, h * 0.62);
    for (let x = 0; x <= w; x += 8) c.lineTo(x, h * 0.62 + Math.sin(x / w * Math.PI * 4) * 10);
    c.lineTo(w, h); c.lineTo(0, h); c.fill();
  });
  const pool = [];
  for (let i = 0; i < 24; i++) {
    const g = new THREE.Group();
    const bm = new THREE.MeshStandardMaterial({ color: 0xF4F6F9, roughness: 0.38, metalness: 0, envMapIntensity: 0.7 });
    const body = new THREE.Mesh(bGeo, bm); g.add(body);
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(38.4, 38.4, 64, 64, 1, true), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.5 })); lab.position.y = 78; g.add(lab);
    const cm = paint(COLORS.blue, 0.35);
    const cap = new THREE.Mesh(capGeo, cm); cap.position.y = 200; g.add(cap);
    castAll(g); scene.add(g);
    g.userData = { bm, cm };
    pool.push(g);
  }

  // --- sensor stand: post + bracket (rotates about the bolt) + sensor
  const post = new THREE.Mesh(new THREE.BoxGeometry(40, 360, 40), alu); post.position.set(0, 80, -215); scene.add(post);
  const pivot = new THREE.Group(); pivot.position.copy(PIVOT); scene.add(pivot);
  const mkBracket = (mat, sensMat, lensMat) => {
    const g = new THREE.Group();
    const sh = new THREE.Shape(); // in (z,y) relative to the pivot
    sh.moveTo(-24, 18); sh.lineTo(24, 18); sh.lineTo(112, -14); sh.lineTo(112, -44); sh.lineTo(70, -44); sh.lineTo(-24, -14); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 3.4, 0, Math.PI * 2, false); sh.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8, bevelSegments: 1 });
    geo.rotateY(-Math.PI / 2); // shape x -> world z (sign handled below)
    const plate = new THREE.Mesh(geo, mat); g.add(plate);
    // sensor body sits on the plate end, lens faces +Z
    const sens = new THREE.Mesh(new THREE.BoxGeometry(26, 48, 34), sensMat); sens.position.set(14, -30, 96); g.add(sens);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 3, 32), lensMat); lens.rotation.x = Math.PI / 2; lens.position.set(14, -30, 114); g.add(lens);
    return { g, plate, sens, lens };
  };
  const plateMat = steel(0xC4CBD4, 0.4, 0.85);
  const sensMat = paint(0x2D4E7E, 0.4);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x441111, roughness: 0.1, metalness: 0.2, emissive: 0xff2a2a, emissiveIntensity: 0.6 });
  const br = mkBracket(plateMat, sensMat, lensMat); pivot.add(br.g); castAll(br.g);
  const led = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), new THREE.MeshBasicMaterial({ color: 0x1E9E5A })); led.position.set(14, -5, 84); br.g.add(led);
  // fixing bolt (M6) through the bracket into the post, axis along +X
  const bolt = hexBolt({ d: 6, pitch: 1, L: 22, s: 10, k: 4 });
  bolt.rotation.z = Math.PI / 2; bolt.position.set(5.4, 0, 0); // head outside (+X), shank into the post
  const boltMat = bolt.userData.mat;
  pivot.add(bolt);
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 1.4, 40), bolt.userData.mat); washer.rotation.z = Math.PI / 2; washer.position.set(0.7, 0, 0); pivot.add(washer);
  // ghost of the original position
  const ghostMat = new THREE.MeshBasicMaterial({ color: COLORS.sky, transparent: true, opacity: 0.0, depthWrite: false });
  ghostMat.polygonOffset = true; ghostMat.polygonOffsetFactor = -2; ghostMat.polygonOffsetUnits = -2;
  const ghost = mkBracket(ghostMat, ghostMat, ghostMat); ghost.g.position.copy(PIVOT); scene.add(ghost.g);
  const edgeMat = new THREE.LineDashedMaterial({ color: 0x0A6FD6, dashSize: 4, gapSize: 3, transparent: true, opacity: 0 });
  ghost.g.children.slice().forEach(m => { if (!m.isMesh) return; const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), edgeMat); e.computeLineDistances(); e.position.copy(m.position); e.rotation.copy(m.rotation); ghost.g.add(e); });
  // beams
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1, 10), beamMat); scene.add(beam);
  const gBeamMat = new THREE.MeshBasicMaterial({ color: COLORS.sky, transparent: true, opacity: 0, depthWrite: false });
  const gBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1, 10), gBeamMat); scene.add(gBeam);
  const spot = new THREE.Mesh(new THREE.CircleGeometry(5, 24), new THREE.MeshBasicMaterial({ color: 0xff5050, transparent: true, opacity: 0.9, depthWrite: false })); scene.add(spot);

  // --- overlay
  const lblSensor = el('lbl', 'الحسّاس'); const ldS = leader();
  const lblBracket = el('lbl track', 'الحامل'); const ldB = leader();
  const lblGhost = el('lbl', 'المكان الأصلي', { borderColor: '#2BA8E8', color: '#0A6FD6' }); const ldG = leader();
  const qmark = el('big', '<div style="font:700 150px PlexLatin;color:#FF7A00">?</div>');
  const checks = []; for (let i = 0; i < 8; i++) checks.push(el('big', '<svg width="78" height="78" viewBox="0 0 78 78"><circle cx="39" cy="39" r="36" fill="#1E9E5A"/><path d="M22 40 L34 52 L57 27" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'));
  const miss = el('big', '<svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="#FF7A00" stroke-width="7" stroke-dasharray="14 10"/></svg>');
  const tag = el('chip', 'خط التعبئة');
  const logo = el('logo', '<img src="/assets/pg_logo_circle.png" style="width:86px;height:86px">', { transform: 'none' });

  // --- timing
  const O1 = cue('o1'), O2 = cue('o2'), O3 = cue('o3'), O4 = cue('o4'), O4e = cue('o4', 'end');
  const TM = O2 + 1.05;               // the missed bottle crosses the beam ("…عدّت")
  const PERIOD = SPACING / V;
  const TSLIP = TM - PERIOD * 0.55;   // the bracket slips just before it
  const bottleX = (i, t) => BEAM_X + (t - (TM + i * PERIOD)) * V;

  const tmp = new THREE.Vector3(), q = new THREE.Quaternion();
  function update(t) {
    beltTex.offset.x = -(V * t / 50) % 1;
    // bracket angle: small jolt at the slip moment
    const slip = seg(t, TSLIP, TSLIP + 0.12, easeOut);
    const jolt = t > TSLIP && t < TSLIP + 0.5 ? Math.sin((t - TSLIP) * 60) * 0.004 * (1 - (t - TSLIP) / 0.5) : 0;
    pivot.rotation.x = TILT * slip + jolt;
    ghost.g.rotation.x = 0;

    // sensor beam geometry (world)
    pivot.updateMatrixWorld(true);
    const lensW = br.lens.getWorldPosition(new THREE.Vector3());
    const dir = v3(0, 0, 1).applyQuaternion(pivot.getWorldQuaternion(q)).normalize();
    // detection: does the beam pass through the cap of a bottle near BEAM_X?
    let hitLen = 330, detecting = false, hitIdx = null;
    const iNow = Math.round((t - TM) / PERIOD);
    for (let i = iNow - 1; i <= iNow + 1; i++) {
      const bx = bottleX(i, t);
      if (Math.abs(bx - lensW.x) < 12) {
        const zc = -15; const s = (zc - lensW.z) / dir.z; const y = lensW.y + dir.y * s;
        if (y > CAP[0] && y < CAP[1]) { detecting = true; hitLen = s; hitIdx = i; }
      }
    }
    beam.position.copy(lensW).addScaledVector(dir, hitLen / 2); beam.scale.y = hitLen;
    beam.quaternion.setFromUnitVectors(v3(0, 1, 0), dir);
    beamMat.opacity = 0.55 + 0.2 * Math.sin(t * 40);
    spot.visible = detecting; spot.position.copy(lensW).addScaledVector(dir, hitLen - 0.5); spot.quaternion.setFromUnitVectors(v3(0, 0, 1), dir.clone().negate());
    led.material.color.set(detecting ? 0x22D66A : 0x1C2A22);
    // ghost (original) beam
    const gl = ghost.lens.getWorldPosition(new THREE.Vector3());
    gBeam.position.copy(gl).addScaledVector(v3(0, 0, 1), 165); gBeam.scale.y = 330; gBeam.rotation.set(Math.PI / 2, 0, 0);

    // bottles
    let k = 0;
    for (let i = iNow - 12; i <= iNow + 12 && k < pool.length; i++) {
      const x = bottleX(i, t); if (x < -1850 || x > 1850) continue;
      const g = pool[k++]; g.visible = true; g.position.set(x, 0, 0);
      trackify(g.userData.bm, i === 0 ? win(t, O2 - 0.1, O3 + 0.2, 0.4) * 0.8 : 0);
    }
    for (; k < pool.length; k++) pool[k].visible = false;

    // tracking colour: bracket during o3, bolt during o4
    trackify(plateMat, win(t, O3 - 0.2, O4 + 0.3, 0.4));
    trackify(boltMat, smooth((t - O4 - 0.4) / 0.5) * (0.75 + 0.25 * Math.sin((t - O4) * 5)));
    ghostMat.opacity = 0.14 * win(t, O3 + 0.4, duration + 1, 0.5);
    edgeMat.opacity = 0.95 * win(t, O3 + 0.4, duration + 1, 0.5);
    gBeamMat.opacity = 0.6 * win(t, O3 + 0.4, duration + 1, 0.5);

    // camera
    const shots = [
      [0, v3(1250, 760, 1500), v3(-60, 60, -40)],
      [O2 + 1.6, v3(980, 600, 1180), v3(0, 90, -60)],
      [O3 - 0.25, v3(980, 600, 1180), v3(0, 90, -60)],
      [O3 + 1.4, v3(330, 330, 130), v3(30, 200, -150)],     // close on the bracket
      [O4 + 0.2, v3(300, 320, 90), v3(30, 205, -160)],
      [O4 + 2.4, v3(255, 268, -40), v3(22, 220, -185)],      // push in on the fixing bolt
      [duration, v3(235, 262, -60), v3(22, 222, -190)],
    ];
    let si = 0; while (si < shots.length - 2 && t >= shots[si + 1][0]) si++;
    const [ta, pa, qa] = shots[si], [tb, pb, qb] = shots[si + 1];
    const kk = easeIO((t - ta) / Math.max(1e-6, tb - ta));
    camera.position.copy(lerpV(pa, pb, kk));
    // tiny vibration of the whole line
    camera.position.y += noise1(t * 0.6, 3) * 1.2;
    camera.lookAt(lerpV(qa, qb, kk));
    camera.updateMatrixWorld();

    // overlay: detected bottle ticks
    let ci = 0;
    for (let i = iNow - 4; i <= iNow; i++) {
      if (i >= 0) continue; // the missed one (0) and after get no tick
      const tc = TM + i * PERIOD; const age = t - tc;
      const d = checks[ci++ % checks.length];
      if (age < 0 || age > 0.9) { d.style.opacity = 0; continue; }
      const p = project(v3(bottleX(i, t), 270, 0), camera);
      place(d, p.x, p.y, win(age, 0, 0.9, 0.2) * (1 - seg(t, O2 + 1.6, O2 + 1.8)), lerp(0.5, 1, seg(age, 0, 0.25, easeBack)));
    }
    for (; ci < checks.length; ci++) checks[ci].style.opacity = 0;
    const mp = project(v3(bottleX(0, t), 200, 0), camera);
    place(miss, mp.x, mp.y, win(t, TM - 0.05, O3 - 0.1, 0.25), lerp(0.7, 1, seg(t, TM - 0.05, TM + 0.25, easeBack)));

    const sp = project(lensW.clone().add(v3(0, 25, 0)), camera);
    const opS = win(t, O1 + 1.6, O2 + 0.2, 0.3);
    place(lblSensor, sp.x - 40, sp.y - 160, opS); ldS.set(sp.x, sp.y, sp.x - 40, sp.y - 130, opS);
    const opB = win(t, O3 + 0.9, O4 + 0.1, 0.3);
    const bpt = br.g.localToWorld(v3(2, -10, 60));
    const b2 = project(bpt, camera);
    place(lblBracket, b2.x + 260, b2.y + 170, opB); ldB.set(b2.x, b2.y, b2.x + 200, b2.y + 150, opB, true);
    const gpt = ghost.g.localToWorld(v3(14, -30, 96 + 17));
    const g2 = project(gpt, camera);
    const opG = win(t, O3 + 1.1, O4 + 0.1, 0.3);
    place(lblGhost, g2.x - 200, g2.y + 190, opG); ldG.set(g2.x, g2.y, g2.x - 150, g2.y + 160, opG);
    const qp = project(PIVOT.clone().add(v3(40, 0, 0)), camera);
    place(qmark, qp.x + 110, qp.y - 120, win(t, O4 + 2.6, duration + 1, 0.3), lerp(0.5, 1, seg(t, O4 + 2.6, O4 + 3.0, easeBack)));
    tag.style.opacity = 1 - seg(t, O3, O3 + 0.6);
    logo.style.opacity = 1;
  }
  return { scene, camera, update };
}

coldopen.sfx = ({ cue, duration }) => {
  const O2 = cue('o2'); const TM = O2 + 1.05; const P = SPACING / V;
  const ev = [{ t: 0, name: 'line_ambience', gain: 0.55, dur: duration }];
  for (let i = -8; i < 0; i++) { const t = TM + i * P; if (t > 0.1) ev.push({ t, name: 'tick', gain: 0.4 }); }
  ev.push({ t: TM - P * 0.55, name: 'knock', gain: 0.45 });
  ev.push({ t: cue('o3') - 0.2, name: 'whoosh', gain: 0.3 });
  return ev;
};
