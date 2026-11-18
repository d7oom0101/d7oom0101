// Slides 41-43: basic tools — inspect before use; metric vs standard spanners; Allen keys; no extension pipes
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, el, place } from '../engine.js';
import * as K from '../kit.js';
import { buildCaliper } from './caliper.js';

export default function tools(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 200 });
  const s = D.s, e = D.e;
  D.header('أدوات أساسية', 'Basic tools');
  D.chip([41, 42, 43]);
  // tool bench
  const bench = new THREE.Group(); D.add(bench);
  const cal = buildCaliper(); cal.g.rotation.x = -Math.PI / 2; cal.g.position.set(-90, 3, -40); cal.g.scale.setScalar(0.8); bench.add(cal.g);
  const tw = K.torqueWrench({ L: 220 }); tw.position.set(-40, 10, 40); tw.rotation.y = 0.2; bench.add(tw);
  const sps = [10, 13, 17, 19].map((sz, i) => { const sp = K.openSpanner({ size: sz, L: 70 + sz * 3, label: sz + ' mm' }); sp.position.set(60, 4, -50 + i * 26); sp.rotation.y = Math.PI; bench.add(sp); return sp; });
  const keys = [4, 6, 8].map((sz, i) => { const k = K.allenKey({ s: sz, L1: 40 + sz * 4, L2: 20 }); k.rotation.z = Math.PI / 2; k.position.set(150 + i * 14, sz / 2, -20); bench.add(k); return k; });
  castAll(bench);
  // the checklist (tl2)
  const checks = ['تآكل', 'تشققات / كسور', 'قطع مكسورة أو مفقودة'];
  checks.forEach((c, i) => D.card(`<div style="font:600 36px Plex;color:#10213F">🔍 ${c}</div>`, 1500, 330 + i * 105, s('tl2') + 0.6 + i * 1.0, s('tl3') - 0.2, 'card', { padding: '16px 34px' }));
  D.card('<div style="font:700 40px Plex;color:#D93A3A">مشكلة واحدة على الأقل؟ لا تستخدم الأداة</div>', 960, 900, s('tl2') + 4.5, s('tl3') - 0.2);
  // cracked spanner under inspection
  const bad = sps[2]; const crackLine = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 0.6), new THREE.MeshBasicMaterial({ color: 0x111111 })); crackLine.position.set(-12, 3.1, 6); crackLine.rotation.y = 0.6; bad.add(crackLine);
  // tl3/tl4: metric spanner vs inch spanner, wrong one on an inch head rounds it off
  const mSp = K.openSpanner({ size: 13, L: 110, label: '13 mm' }); const iSp = K.openSpanner({ size: 12.7, L: 110, label: '1/2"' });
  mSp.position.set(0, 0, 220); iSp.position.set(0, 0, 260); D.add(mSp); D.add(iSp); castAll(mSp); castAll(iSp);
  D.label('متري: المقاس بالرقم', [mSp, v3(55, 4, 0)], [140, -110], s('tl3') + 0.6, s('tl4') - 0.2, { track: t => t < s('tl3') + 2.6 });
  D.label('قياسي: المقاس ككسر', [iSp, v3(55, 4, 0)], [140, 110], s('tl3') + 2.6, s('tl4') - 0.2, { track: t => t > s('tl3') + 2.6 });
  const hb = K.displayBolt({ d: 9.5, L: 20, s: 14.3, k: 6 }); hb.position.set(-80, 0, 240); D.add(hb);
  const hbHead = hb.userData.bolt.getObjectByName('head'); hbHead.material = hbHead.material.clone();
  const wrong = K.openSpanner({ size: 15, L: 90, label: '15 mm' }); D.add(wrong); castAll(wrong);
  D.label('فك المفتاح لازم يطابق رأس البرغي', [hb, v3(0, 26, 0)], [-260, -140], s('tl4') + 2.4, s('tl5') - 0.2, { track: true });
  // tl5 allen in socket, tl6 no pipe extensions
  const sock = K.socketScrew({ d: 10, L: 24 }); sock.position.set(120, 0, 240); D.add(sock); castAll(sock);
  const key8 = K.allenKey({ s: 8, L1: 60, L2: 28 }); D.add(key8); castAll(key8);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 120, 24, 1, true), K.M.zinc()); pipe.material.side = THREE.DoubleSide; pipe.rotation.z = Math.PI / 2; D.add(pipe);
  const no = el('big', '<svg width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="68" fill="#fff" stroke="#D93A3A" stroke-width="14"/><path d="M32 128 L128 32" stroke="#D93A3A" stroke-width="14"/></svg>');
  D.on(t => {
    bench.visible = t < s('tl3') - 0.2;
    sps.forEach((sp, i) => popIn(sp, t, 0.2 + i * 0.1, 1e9));
    trackify(bad.userData.mat, win(t, s('tl2') + 1.6, s('tl3') - 0.2));
    bad.position.y = 4 + 20 * win(t, s('tl2') + 0.8, s('tl3') - 0.2, 0.5); bad.rotation.x = -0.8 * win(t, s('tl2') + 0.8, s('tl3') - 0.2, 0.5);
    const g2 = t > s('tl3') - 0.3 && t < s('tl5') - 0.2; mSp.visible = iSp.visible = t > s('tl3') - 0.3 && t < s('tl4') + 0.4; hb.visible = g2 && t > s('tl4') - 0.2;
    const wk = seg(t, s('tl4') + 0.3, s('tl4') + 1.2, easeOut); wrong.visible = hb.visible; wrong.position.set(-80 + lerp(140, 0, wk), 3, 240);
    const slip = seg(t, s('tl4') + 1.3, s('tl4') + 2.2, easeIO); wrong.rotation.y = slip * 0.9; hb.rotation.y = slip * 0.15;
    trackify(hbHead.material, win(t, s('tl4') + 1.6, s('tl5') - 0.2));
    const a = t > s('tl5') - 0.3; sock.visible = key8.visible = a; pipe.visible = a && t > s('tl6');
    const kk = seg(t, s('tl5') + 0.3, s('tl5') + 1.3, easeOut); key8.position.set(120, 24 + 10 - 4 + (1 - kk) * 50, 240);
    key8.rotation.y = 0; pipe.position.set(120 - 28 - 60 + 14, 24 + 10 + 60 - 4, 240);
    pipe.position.set(120 - 28 / 2 - 60 - 14, 24 + 10 - 4 + 60 + 2.7, 240);
    const pp = D.camera ? null : null;
    place(no, 1350, 380, win(t, s('tl6') + 0.4, 1e9, 0.25));
  });
  D.shots([
    [0, v3(60, 260, 330), v3(30, 0, 0)], [s('tl2'), v3(80, 140, 170), v3(30, 10, 0)], [s('tl3') - 0.3, v3(80, 140, 170), v3(30, 10, 0)],
    [s('tl3'), v3(60, 160, 360), v3(40, 0, 240)], [s('tl4') - 0.2, v3(60, 160, 360), v3(40, 0, 240)],
    [s('tl4') + 0.2, v3(-60, 90, 330), v3(-75, 10, 240)], [s('tl5') - 0.3, v3(-60, 90, 330), v3(-75, 10, 240)],
    [s('tl5'), v3(230, 170, 430), v3(120, 40, 240)], [ctx.duration, v3(230, 170, 440), v3(120, 40, 240)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
tools.sfx = ({ cue }) => [{ t: cue('tl2') + 0.8, name: 'whoosh', gain: 0.2 }, { t: cue('tl4') + 1.3, name: 'knock', gain: 0.45 }, { t: cue('tl5') + 1.3, name: 'clink', gain: 0.35 }, { t: cue('tl6') + 0.4, name: 'stamp', gain: 0.35 }];
