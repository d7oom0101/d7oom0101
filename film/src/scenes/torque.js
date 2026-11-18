// Slides 33-34: why controlled torque; torque = force x distance; reading the torque table
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, castAll, trackify, paint, cutaway, el, place, project, svgEl, threadGeometry } from '../engine.js';
import * as K from '../kit.js';

const ROWS = [['5', '4.63', '6.18'], ['6', '7.87', '10.50'], ['8', '19.10', '25.50'], ['10', '37.80', '50.50'], ['12', '66', '88'], ['14', '105', '140'], ['16', '170', '226']];
export default function torque(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 200 });
  const s = D.s, e = D.e;
  D.header('مفتاح العزم', 'Torque wrench');
  D.chip([33, 34]);
  // over / under tightening (cutaway joint)
  const J = K.boltedJoint({ d: 10, L: 40, plates: [10, 10] }); D.add(J.g); cutaway(J.g, new THREE.Vector3(0, 0, -1), 0);
  const tw = K.torqueWrench({ L: 300 }); D.add(tw); castAll(tw);
  const crack = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.6, 6, 32), new THREE.MeshBasicMaterial({ color: 0xD93A3A })); crack.rotation.x = Math.PI / 2; crack.position.y = 18; D.add(crack);
  const over = D.card('<div style="font:700 40px Plex;color:#D93A3A">شد زائد</div><div style="font:600 30px Plex">قطع السن • كسر البرغي • تلف القطع الحساسة</div>', 1450, 260, s('tq3'), s('tq4') - 0.1);
  const under = D.card('<div style="font:700 40px Plex;color:#D93A3A">شد ضعيف</div><div style="font:600 30px Plex">يرتخي مع الوقت بسبب الاهتزاز</div>', 1450, 260, s('tq4'), s('tq5') - 0.2);
  // T = F x d diagram (svg)
  const fd = el('big', `<svg width="900" height="360" viewBox="0 0 900 360"><rect width="900" height="360" rx="26" fill="#fff"/>
    <circle cx="140" cy="200" r="40" fill="none" stroke="#10213F" stroke-width="6"/><line x1="180" y1="200" class="arm" x2="560" y2="200" stroke="#10213F" stroke-width="18" stroke-linecap="round"/>
    <line class="farrow" x1="560" y1="80" x2="560" y2="180" stroke="#FF7A00" stroke-width="10"/><path class="fhead" d="M540 165 L560 195 L580 165 Z" fill="#FF7A00"/><text class="flab" x="590" y="110" font-family="Plex" font-weight="700" font-size="36" fill="#B54F00">القوة</text>
    <line class="dline" x1="140" y1="290" x2="560" y2="290" stroke="#003DA5" stroke-width="5" stroke-dasharray="12 8"/><text class="dlab" x="350" y="335" text-anchor="middle" font-family="Plex" font-weight="700" font-size="34" fill="#003DA5">المسافة</text>
    <path d="M100 140 A70 70 0 0 1 200 140" fill="none" stroke="#FF7A00" stroke-width="7"/><text x="150" y="110" text-anchor="middle" font-family="Plex" font-weight="700" font-size="34" fill="#B54F00">العزم</text>
    <text class="tq" x="760" y="60" text-anchor="middle" font-family="PlexLatin" font-weight="700" font-size="44" fill="#10213F">T = F × d</text></svg>`);
  // table
  const tbl = el('card', `<div style="font:600 30px PlexLatin;color:#5C6E8A;margin-bottom:8px">Torque-Tension Relationships for Metric Bolts — Class 8.8</div>
    <table style="border-collapse:collapse;direction:ltr">${'<tr>' + ['Dia. (mm)', 'N·m  K = .15', 'N·m  K = .20'].map(h => `<th style="padding:8px 30px;font:600 28px PlexLatin;color:#fff;background:#003DA5">${h}</th>`).join('') + '</tr>'}
    ${ROWS.map(r => `<tr class="${r[0] === '10' ? 'hi' : ''}">${r.map((c, j) => `<td class="c${j}" style="padding:6px 30px;font:600 34px PlexLatin;text-align:center;color:#10213F">${c}</td>`).join('')}</tr>`).join('')}</table>`);
  D.label('نقيس القطر', [J.bolt, v3(0, -20, 0)], [-200, -100], s('tq6') + 0.2, s('tq7') - 0.2, { track: true });
  D.on(t => {
    const showJ = t < s('tq5') - 0.2 || (t > s('tq6') - 0.2 && t < s('tq7') - 0.4);
    J.g.visible = showJ;
    // tq2: wrench comes and tightens
    const come = seg(t, s('tq2') - 0.2, s('tq2') + 0.8, easeOut);
    tw.visible = t > s('tq2') - 0.3 && t < s('tq5') - 0.3;
    tw.position.set(0, J.top + 2 + 6.4 + 14 + (1 - come) * 60, 0);
    tw.rotation.y = -seg(t, s('tq2') + 1.0, e('tq2'), easeIO) * 0.8 - seg(t, s('tq3'), s('tq3') + 1.0) * 0.5;
    trackify(J.bolt.userData.mat, win(t, s('tq3'), s('tq5') - 0.2));
    crack.visible = t > s('tq3') + 1.0 && t < s('tq4');
    // tq4: loose joint jiggles, gap opens
    const loose = win(t, s('tq4'), s('tq5') - 0.2);
    J.nut.position.y = -2 - loose * 6 - loose * Math.abs(Math.sin(t * 30)) * 1.5;
    place(fd, 960, 560, win(t, s('tq5') - 0.1, s('tq6') - 0.2));
    const arm = lerp(560, 760, seg(t, s('tq5') + 3.0, s('tq5') + 4.0, easeIO));
    fd.querySelector('.arm').setAttribute('x2', arm);
    for (const c of ['.farrow']) { fd.querySelector(c).setAttribute('x1', arm); fd.querySelector(c).setAttribute('x2', arm); }
    fd.querySelector('.fhead').setAttribute('d', `M${arm - 20} 165 L${arm} 195 L${arm + 20} 165 Z`); fd.querySelector('.flab').setAttribute('x', arm + 30);
    fd.querySelector('.dline').setAttribute('x2', arm);
    fd.querySelector('.tq').style.opacity = seg(t, s('tq5') + 0.4, s('tq5') + 1.0);
    place(tbl, 1340, 560, win(t, s('tq6') + 1.6, 1e9));
    const hi = t > s('tq7') + 0.2; tbl.querySelectorAll('tr.hi td').forEach((td, j) => { td.style.background = hi ? '#FFE8D2' : ''; td.style.color = hi ? '#B54F00' : '#10213F'; td.style.fontSize = hi && j > 0 ? '44px' : '34px'; });
  });
  D.card('<div style="font:600 34px Plex;color:#10213F">المعامل <span style="font-family:PlexLatin">K</span> يعتمد على حالة السن والتزييت — اتبع القيمة المعتمدة في معيار خطّك</div>', 960, 960, s('tq8'), 1e9);
  D.shots([
    [0, v3(140, 120, 200), v3(0, 10, 0)], [s('tq2'), v3(160, 160, 260), v3(40, 15, 0)], [s('tq3'), v3(60, 40, 120), v3(0, 5, 0)],
    [s('tq5') - 0.3, v3(60, 40, 120), v3(0, 5, 0)], [s('tq6') - 0.2, v3(-90, 40, 140), v3(-45, 5, 0)], [ctx.duration, v3(-90, 40, 140), v3(-45, 5, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
torque.sfx = ({ cue }) => [{ t: cue('tq2', 'end') - 0.3, name: 'torque_click', gain: 0.6 }, { t: cue('tq3') + 1.0, name: 'knock', gain: 0.5 }, { t: cue('tq4'), name: 'line_ambience', gain: 0.25, dur: 2 }, { t: cue('tq7') + 0.2, name: 'pop', gain: 0.3 }];
