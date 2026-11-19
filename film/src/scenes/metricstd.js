// Slide 12: metric vs. standard (inch) bolt — read the head
import * as THREE from 'three';
import { stage, popIn } from '../director.js';
import { v3, seg, win, castAll } from '../engine.js';
import * as K from '../kit.js';

export default function metricstd(ctx) {
  const D = stage(ctx, { target: v3(0, 20, 0), size: 120 });
  const s = D.s, e = D.e;
  D.header('أنواع البراغي', 'Types of bolts');
  D.chip([12]);
  const mk = (stamp, x) => { const b = K.displayBolt({ d: 12, L: 26, s: 19, k: 7.5, stamp }); b.position.x = x; castAll(b); D.add(b); const ms = []; b.traverse(o => { if (o.material && !o.material.transparent) { o.material = o.material.clone(); ms.push(o.material); } }); return { b, ms }; };
  const met = mk({ text: '8.8', sub: 'JD' }, 45), std = mk({ lines: 3 }, -15), none = mk(null, -55);
  D.track(met.ms, s('m2'), s('m3') - 0.1); D.track([...std.ms, ...none.ms], s('m3'), 1e9);
  D.label('متري <span class="ltr" style="font-family:PlexLatin">Metric</span>: رقمان بينهما نقطة', v3(45, 34, 0), [80, -170], s('m2') + 0.3, 1e9, { track: t => t < s('m3') });
  D.label('إنشي <span class="ltr" style="font-family:PlexLatin">Imperial</span>: خطوط', v3(-15, 34, 0), [-40, -190], s('m3') + 0.3, 1e9, { track: true });
  D.label('أو دون علامة', v3(-55, 34, 0), [-120, 120], s('m3') + 2.2, 1e9, { track: true });
  D.card('<div style="font:600 34px Plex">المقاسات بالـ<b>ملّيمتر</b></div>', 1450, 880, s('m2') + 0.6, 1e9);
  D.card('<div style="font:600 34px Plex">المقاسات بالـ<b>بوصة</b></div>', 520, 880, s('m3') + 0.6, 1e9);
  D.on(t => { [met, std, none].forEach((o, i) => popIn(o.b, t, 0.2 + i * 0.15)); });
  D.shots([[0, v3(0, 210, 210), v3(-3, 15, 0)], [s('m2'), v3(35, 150, 120), v3(30, 25, 0)], [s('m3'), v3(35, 150, 120), v3(30, 25, 0)], [s('m3') + 0.8, v3(-30, 155, 135), v3(-30, 25, 0)], [ctx.duration, v3(-5, 190, 190), v3(-5, 20, 0)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
metricstd.sfx = ({ cue }) => [{ t: cue('m2'), name: 'pop', gain: 0.3 }, { t: cue('m3'), name: 'pop', gain: 0.3 }];
