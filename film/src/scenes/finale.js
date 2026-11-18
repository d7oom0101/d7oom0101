// Finale: back to the filling line — the V.C mark on the bracket bolt has split; vibration loosened the bolt.
import * as THREE from 'three';
import { stage } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, steel, noise1, el, place } from '../engine.js';
import * as K from '../kit.js';

const PIVOT = v3(25, 230, -215);
export default function finale(ctx) {
  const D = stage(ctx, { target: v3(0, 150, -150), size: 400, floorY: -800 });
  const s = D.s, e = D.e;
  D.chip([47, 37]);
  // simplified line: belt, bottles, post, bracket on a single bolt, sensor, beam
  const belt = new THREE.Mesh(new THREE.BoxGeometry(1600, 12, 300), paint(0x3A4656, 0.7)); belt.position.y = -6; D.add(belt);
  const post = new THREE.Mesh(new THREE.BoxGeometry(40, 360, 40), steel(0xC8CED6, 0.42, 0.8)); post.position.set(0, 80, -215); D.add(post);
  const pivot = new THREE.Group(); pivot.position.copy(PIVOT); D.add(pivot);
  const sh = new THREE.Shape(); sh.moveTo(-24, 18); sh.lineTo(24, 18); sh.lineTo(112, -14); sh.lineTo(112, -44); sh.lineTo(70, -44); sh.lineTo(-24, -14); sh.closePath();
  const pg = new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8, bevelSegments: 1 }); pg.rotateY(-Math.PI / 2);
  const plateMat = steel(0xC4CBD4, 0.4, 0.85);
  pivot.add(new THREE.Mesh(pg, plateMat));
  const sens = new THREE.Mesh(new THREE.BoxGeometry(26, 48, 34), paint(0x2D4E7E, 0.4)); sens.position.set(14, -30, 96); pivot.add(sens);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 3, 32), new THREE.MeshStandardMaterial({ color: 0x441111, emissive: 0xff2a2a, emissiveIntensity: 0.6 })); lens.rotation.x = Math.PI / 2; lens.position.set(14, -30, 114); pivot.add(lens);
  const spin = new THREE.Group(); pivot.add(spin);
  const bolt = K.hexBolt({ d: 6, pitch: 1, L: 22, s: 10, k: 4 }); bolt.rotation.z = Math.PI / 2; bolt.position.set(5.4, 0, 0); spin.add(bolt);
  const boltMat = bolt.userData.mat;
  // V.C paint mark: on the bolt head (turns with it) and on the post (fixed)
  const pm = new THREE.MeshStandardMaterial({ color: 0xF2C200, roughness: 0.6 });
  const headMark = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.5, 1.4), pm); headMark.position.set(5.6, 2.8, 0); spin.add(headMark);
  const plateMark = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 1.4), pm); plateMark.position.set(1.1, 11.5, 0); pivot.add(plateMark);
  const postMark = new THREE.Mesh(new THREE.BoxGeometry(0.6, 20, 1.6), pm); postMark.position.set(PIVOT.x - 4.3, PIVOT.y + 27, PIVOT.z); D.add(postMark);
  castAll(pivot); castAll(post);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.7, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 330, 10), beamMat); D.add(beam);
  const bottles = []; for (let i = 0; i < 8; i++) { const b = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(38, 38, 175, 40), paint(0xF4F6F9, 0.38)); body.position.y = 87; b.add(body); const cap = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 20, 32), paint(0x003DA5, 0.35)); cap.position.y = 200; b.add(cap); D.add(b); bottles.push(b); castAll(b); }
  const TILT = -4 * Math.PI / 180;
  D.label('علامة التحكّم المرئي', v3(PIVOT.x + 6, PIVOT.y + 12, PIVOT.z), [260, -180], s('f2') + 0.6, s('f4') - 0.2, { track: true });
  const end = D.card('<div style="font:700 64px Plex;color:#003DA5">افحص • علّم • اشدّ بالعزم الصحيح</div>', 960, 540, s('f6') + 0.3, 1e9, 'card', { padding: '40px 70px' });
  const logo = el('big', '<img src="/assets/pg_logo_circle.png" style="width:150px;height:150px">');
  const rewind = el('big', '<div style="font:700 64px PlexLatin;color:#003DA5">⏪</div>');
  D.on(t => {
    // f3/f4: replay — vibration, bolt turns, bracket swings, mark splits
    // as found: bolt turned (loosened) and bracket rotated. f4 = rewind, then replay with vibration.
    const rw = seg(t, s('f4'), s('f4') + 0.8, easeIO), fw = seg(t, s('f4') + 1.0, s('f4') + 3.0, easeIO);
    const k = t < s('f4') ? 1 : (t < s('f4') + 1.0 ? 1 - rw : fw);
    const shake = win(t, s('f4') + 1.0, s('f4') + 3.2, 0.2) * Math.sin(t * 70) * 0.004;
    pivot.rotation.x = TILT * k + shake;
    spin.rotation.x = -0.75 * k; // the bolt itself turned: the mark on its head no longer lines up
    place(rewind, 960, 200, win(t, s('f4'), s('f4') + 1.0, 0.2));
    trackify(boltMat, win(t, s('f5'), s('f6'), 0.4));
    trackify(pm, 0);
    // beam
    pivot.updateMatrixWorld(true);
    const lw = lens.getWorldPosition(new THREE.Vector3()); const dir = v3(0, 0, 1).applyQuaternion(pivot.getWorldQuaternion(new THREE.Quaternion()));
    beam.position.copy(lw).addScaledVector(dir, 165); beam.quaternion.setFromUnitVectors(v3(0, 1, 0), dir);
    bottles.forEach((b, i) => { b.position.set(((t * 240 + i * 190) % 1520) - 760, 0, 0); });
    place(logo, 960, 300, win(t, s('f6') + 0.6, 1e9));
  });
  D.shots([
    [0, v3(900, 560, 1100), v3(0, 100, -60)],
    [s('f2') - 0.2, v3(240, 260, -60), v3(22, 225, -205)],
    [s('f3'), v3(120, 245, -150), v3(24, 238, -214)],                 // tight on the split mark
    [s('f4') + 0.1, v3(120, 245, -150), v3(24, 238, -214)],
    [s('f4') + 0.8, v3(330, 330, 130), v3(30, 200, -150)],            // replay: wider, see the sensor aim rise
    [s('f5') + 0.5, v3(300, 300, 60), v3(25, 215, -180)],
    [s('f6'), v3(900, 560, 1100), v3(0, 100, -60)], [ctx.duration, v3(950, 600, 1150), v3(0, 100, -60)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
finale.sfx = ({ cue, duration }) => [{ t: 0, name: 'line_ambience', gain: 0.4, dur: cue('f6') }, { t: cue('f3') + 0.6, name: 'pop', gain: 0.25 }, { t: cue('f4') + 0.2, name: 'knock', gain: 0.4 }, { t: cue('f6') + 0.6, name: 'chime', gain: 0.3 }];
