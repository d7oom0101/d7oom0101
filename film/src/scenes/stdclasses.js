// Slides 16-17: standard (SAE) grade lines; unmarked Allen = class 9; stainless markings
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, easeBack, lerp, hexGeometry, castAll, trackify, el, place } from '../engine.js';
import * as K from '../kit.js';

function head(spec, mat) {
  const g = new THREE.Group(); const m = mat || K.M.zinc();
  g.add(new THREE.Mesh(hexGeometry(17, 7, 0.5), m));
  if (spec) { const st = K.headStamp(17, spec); st.position.y = 7.05; g.add(st); }
  castAll(g); g.userData.mat = m; return g;
}
export default function stdclasses(ctx) {
  const D = stage(ctx, { target: v3(0, 5, 0), size: 160 });
  const s = D.s, e = D.e;
  D.header('صلابة البراغي القياسية والستانلس', 'Standard (inch) & stainless bolt markings');
  D.chip([16, 17]);
  const strip = [[null, '1-2'], [{ lines: 3 }, '5'], [{ lines: 5 }, '7'], [{ lines: 6 }, '8']].map(([sp, cls], i) => {
    const h = head(sp); h.position.x = 45 - i * 30; D.add(h);
    D.label(`<span class="ltr" style="font-family:PlexLatin">Grade ${cls}</span>`, [h, v3(0, 0, 14)], [0, 90], s('s2') + 0.2 + i * 0.3, s('s3') - 0.2, { noLeader: true, style: { fontSize: '30px' }, track: cls === '5' ? (t => t > s('s2') + 2.5) : false });
    return { h, cls };
  });
  D.track(strip[1].h.userData.mat, s('s2') + 2.5, s('s3') - 0.2);
  const grad = D.card('<div style="font:600 34px Plex;color:#003DA5">← تزيد الصلابة كلما زاد عدد الخطوط</div>', 960, 300, s('s2') + 0.4, s('s3') - 0.2);
  // quiz
  const q = head({ lines: 3 }); q.scale.setScalar(2.2); q.position.set(0, 0, 0); D.add(q); q.visible = false;
  const ring = el('big', '<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" fill="#fff" stroke="#DCE6F2" stroke-width="12"/><circle class="arc" cx="65" cy="65" r="54" fill="none" stroke="#FF7A00" stroke-width="12" stroke-dasharray="339" transform="rotate(-90 65 65)"/><text x="65" y="80" text-anchor="middle" font-family="Plex" font-weight="700" font-size="44" fill="#10213F">؟</text></svg>');
  const ans = el('card', '<div style="font:700 80px Plex;color:#B54F00">3 خطوط = الفئة <span style="font-family:PlexLatin">5</span></div><div style="font:600 34px Plex;color:#1E9E5A">✓ مقبول (الحد الأدنى)</div>');
  // Allen unmarked = class 9
  const sock = K.socketScrew({ d: 12, L: 26 }); sock.position.set(0, 0, 0); D.add(sock); castAll(sock); sock.visible = false;
  D.label('بدون علامات = قياسي فئة <span style="font-family:PlexLatin">9</span>', [sock, v3(0, 38, 0)], [220, -120], s('s5') + 2.4, s('s6') - 0.2, { track: true });
  // stainless
  const ss1 = head({ text: '316', sub: 'F593' }, K.M.stainless()); const ss2 = head({ text: 'A2-70', font: 90 }, K.M.stainless()); const ss3 = head({ text: 'A4-80', font: 90 }, K.M.stainless());
  [ss1, ss2, ss3].forEach((h, i) => { h.scale.setScalar(1.6); h.position.set(45 - i * 45, 0, 0); D.add(h); h.visible = false; });
  D.label('قياسي: <span class="ltr" style="font-family:PlexLatin">304 / 316</span>', [ss1, v3(0, 7, 0)], [80, -150], s('s6') + 0.3, 1e9, { track: t => t < s('s7') });
  D.label('متري: <span class="ltr" style="font-family:PlexLatin">A2 / A4</span>', [ss2, v3(0, 7, 0)], [0, -170], s('s7') + 0.2, 1e9, { track: t => t > s('s7') });
  D.card('<div style="direction:rtl;font:600 34px Plex;color:#10213F"><span style="font-family:PlexLatin;color:#B54F00">A4</span> مقاومة تآكل أعلى &nbsp;•&nbsp; <span style="font-family:PlexLatin;color:#B54F00">70</span> = قوة شد <span style="font-family:PlexLatin">700 MPa</span></div>', 960, 900, s('s7') + 2.5, 1e9);
  D.on(t => {
    strip.forEach(({ h }, i) => popIn(h, t, s('s1') + 0.1 + i * 0.1, s('s3') - 0.2));
    const quiz = t > s('s3') - 0.3 && t < s('s5') - 0.2; q.visible = quiz; q.rotation.y = 0.2;
    trackify(q.userData.mat, win(t, s('s4'), s('s5') - 0.2) * 0.7);
    place(ring, 1500, 300, win(t, s('s3') + 0.3, e('s3') + 1.8, 0.2)); ring.querySelector('.arc').setAttribute('stroke-dashoffset', 339 * seg(t, s('s3') + 0.6, e('s3') + 1.6));
    place(ans, 1440, 330, win(t, s('s4'), s('s5') - 0.2), lerp(0.85, 1, seg(t, s('s4'), s('s4') + 0.4, easeBack)));
    sock.visible = t > s('s5') - 0.2 && t < s('s6') - 0.2; sock.rotation.y = t * 0.3;
    [ss1, ss2, ss3].forEach((h, i) => { h.visible = t > s('s6') - 0.2; popIn(h, t, s('s6') - 0.2 + (i ? s('s7') - s('s6') + i * 0.3 : 0), 1e9, 1.6); });
  });
  D.shots([
    [0, v3(0, 120, 140), v3(0, 3, 0)], [s('s2') - 0.2, v3(0, 120, 140), v3(0, 3, 0)], [s('s2') + 0.4, v3(0, 130, 170), v3(0, 3, 0)],
    [s('s3') - 0.3, v3(0, 130, 170), v3(0, 3, 0)], [s('s3'), v3(0, 95, 70), v3(0, 10, 0)], [s('s5') - 0.3, v3(0, 95, 70), v3(0, 10, 0)],
    [s('s5') + 0.1, v3(0, 110, 110), v3(0, 25, 0)], [s('s6') - 0.3, v3(0, 110, 110), v3(0, 25, 0)],
    [s('s6') + 0.2, v3(0, 160, 120), v3(0, 5, 0)], [ctx.duration, v3(0, 165, 130), v3(0, 5, 0)],
  ]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
stdclasses.sfx = ({ cue }) => [{ t: cue('s3', 'end') + 1.6, name: 'chime', gain: 0.25 }, { t: cue('s5') + 2.4, name: 'pop', gain: 0.3 }, { t: cue('s6') + 0.3, name: 'pop', gain: 0.25 }, { t: cue('s7') + 0.2, name: 'pop', gain: 0.25 }];
