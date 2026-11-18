// Slides 8-9: bolt size -> spanner / Allen key; inch sizes; fraction -> mm
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeOut, easeIO, lerp, trackify, castAll } from '../engine.js';
import * as K from '../kit.js';

const METRIC = [['M2.5', '5'], ['M3', '5.5'], ['M4', '7'], ['M5', '8'], ['M6', '10'], ['M8', '13'], ['M10', '17'], ['M12', '19']];
const ALLEN = [['M3', '2.5'], ['M4', '3'], ['M5', '4'], ['M6', '5'], ['M8', '6'], ['M10', '8'], ['M12', '10'], ['M14', '12'], ['M16', '14']];
const INCH = [['1/8', '5/16', '8'], ['3/16', '3/8', '10'], ['1/4', '7/16', '11'], ['5/16', '1/2', '13'], ['3/8', '9/16', '14'], ['7/16', '5/8', '16'], ['1/2', '3/4', '19'], ['9/16', '13/16', '21'], ['5/8', '15/16', '24'], ['3/4', '1-1/8', '29'], ['7/8', '1-5/16', '34'], ['1', '1-1/2', '38']];
const CONV = [['5/16', '0.3125', '7.938'], ['11/32', '0.34375', '8.731'], ['3/8', '0.375', '9.525'], ['13/32', '0.40625', '10.319'], ['7/16', '0.4375', '11.113']];

function table(headers, rows, hi, cls = '') {
  const th = headers.map(h => `<th style="padding:10px 26px;font:600 30px Plex;color:#fff;background:#003DA5">${h}</th>`).join('');
  const tr = rows.map((r, i) => `<tr class="r${i}" style="${i === hi ? 'background:#FFE8D2;outline:4px solid #FF7A00;outline-offset:-2px' : (i % 2 ? 'background:#F3F7FC' : 'background:#fff')}">${r.map(c => `<td style="padding:7px 26px;font:600 34px PlexLatin;color:${i === hi ? '#B54F00' : '#10213F'};text-align:center;direction:ltr">${c}</td>`).join('')}</tr>`).join('');
  return `<table style="border-collapse:collapse;border-radius:14px;overflow:hidden;direction:rtl">${'<tr>' + th + '</tr>'}${tr}</table>`;
}

export default function sizes(ctx) {
  const D = stage(ctx, { target: v3(0, 10, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('مقاسات المسامير مع مفتاح الربط', 'Bolt size vs. spanner size', 0.2);
  D.chip([8, 9]);
  // tables (screen cards on the right)
  D.card(table(['مقاس البرغي', 'مفتاح سداسي (مم)'], METRIC, -1), 1430, 560, s('z1'), s('z2') + 1.2);
  D.card(table(['مقاس البرغي', 'مفتاح سداسي (مم)'], METRIC, 5), 1430, 560, s('z2') + 1.2, s('z3'));
  D.card(table(['مقاس البرغي', 'مفتاح ألن (مم)'], ALLEN, 4), 1430, 580, s('z3'), s('z4'));
  D.card(table(['قطر البرغي (بوصة)', 'المفتاح (بوصة)', 'تقريبًا (مم)'], INCH, 4), 1360, 600, s('z4'), s('z5'));
  D.card(table(['الكسر (بوصة)', 'عشري', 'مم'], CONV, 2), 1360, 560, s('z5'), 1e9);
  // 3D on the left: bolt + spanner / socket screw + Allen key / inch bolt + spanner
  const L = new THREE.Group(); L.position.x = -70; D.add(L);
  const m8 = K.displayBolt({ d: 8, L: 30, s: 13, k: 5.3 }); L.add(m8);
  const sp13 = K.openSpanner({ size: 13, L: 90, label: '13 mm' }); L.add(sp13);
  const sock = K.socketScrew({ d: 8, L: 30 }); L.add(sock);
  const key6 = K.allenKey({ s: 6, L1: 55, L2: 22 }); L.add(key6);
  const in38 = K.displayBolt({ d: 9.5, L: 30, s: 14.3, k: 6, stamp: { lines: 3 } }); L.add(in38);
  const sp916 = K.openSpanner({ size: 14.3, L: 90, label: '9/16"' }); L.add(sp916);
  castAll(L);
  const lab = (html, a, t0, t1) => D.label(html, a, [-40, -140], t0, t1, { track: true });
  lab('<span class="ltr" style="font-family:PlexLatin">M8 → 13 mm</span>', v3(-70, 40, 0), s('z2') + 1.2, s('z3'));
  lab('<span class="ltr" style="font-family:PlexLatin">M8 → 6 mm</span>', v3(-70, 40, 0), s('z3') + 0.8, s('z4'));
  lab('<span class="ltr" style="font-family:PlexLatin">3/8" → 9/16"</span>', v3(-70, 40, 0), s('z4') + 1.2, s('z5'));
  lab('<span class="ltr" style="font-family:PlexLatin">3/8" = 9.525 mm</span>', v3(-70, 40, 0), s('z5') + 0.8, 1e9);
  D.on(t => {
    const a = win(t, s('z1') - 0.3, s('z3')), b = win(t, s('z3'), s('z4')), c = win(t, s('z4'), 1e9);
    m8.visible = a > 0.01; sock.visible = b > 0.01; in38.visible = c > 0.01;
    m8.position.y = (1 - a) * -40; sock.position.y = (1 - b) * -40; in38.position.y = (1 - c) * -40;
    const k1 = seg(t, s('z2') + 0.8, s('z2') + 1.8, easeOut);
    sp13.visible = a > 0.01 && k1 > 0; sp13.position.set(lerp(150, 0, k1), 32.5, 0); sp13.rotation.y = seg(t, s('z2') + 2, e('z2'), easeIO) * 0.6;
    m8.rotation.y = sp13.rotation.y;
    const k2 = seg(t, s('z3') + 0.4, s('z3') + 1.3, easeOut);
    key6.visible = b > 0.01 && k2 > 0; key6.position.set(0, 40 - 3 + (1 - k2) * 60, 0); key6.rotation.y = seg(t, s('z3') + 1.4, e('z3'), easeIO) * 1.2; sock.rotation.y = key6.rotation.y;
    const k3 = seg(t, s('z4') + 0.8, s('z4') + 1.8, easeOut);
    sp916.visible = c > 0.01 && k3 > 0; sp916.position.set(lerp(150, 0, k3), 33, 0);
    trackify(sp13.userData.mat, win(t, s('z2') + 1, s('z3'))); trackify(key6.userData.mat, win(t, s('z3') + 0.5, s('z4'))); trackify(sp916.userData.mat, win(t, s('z4') + 1, 1e9));
  });
  D.shots([[0, v3(40, 120, 260), v3(10, 22, 0)], [ctx.duration, v3(0, 110, 240), v3(10, 22, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
sizes.sfx = ({ cue }) => [{ t: cue('z2') + 1.8, name: 'clink', gain: 0.4 }, { t: cue('z3') + 1.3, name: 'clink', gain: 0.35 }, { t: cue('z4') + 1.8, name: 'clink', gain: 0.4 }, { t: cue('z5'), name: 'pop', gain: 0.3 }];
