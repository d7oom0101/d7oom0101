// debug gallery of kit parts (not part of the film)
import * as THREE from 'three';
import { stage } from '../director.js';
import { v3 } from '../engine.js';
import * as K from '../kit.js';
export default function (ctx) {
  const D = stage(ctx, { target: v3(0, 0, 0), size: 200 });
  const parts = [
    K.displayBolt({ d: 10, L: 30, stamp: { text: '8.8', sub: 'JD' } }), K.displayBolt({ d: 10, L: 30, stamp: { lines: 3, slots: 6 } }),
    K.driveScrew({ drive: 'slot' }), K.driveScrew({ drive: 'phillips' }), K.driveScrew({ drive: 'torx', head: 'flat' }), K.socketScrew({}),
    K.hexNut({}), K.nylockNut({}), K.flangeNut({}), K.wingNut({}), K.slottedNut({}),
    K.washer({ chamfer: true }), K.splitWasher({}), K.toothWasher({}), K.toothWasher({ external: false }), K.squareWasher({}), K.circlip({}),
    K.dowel({}), K.taperPin({}), K.rollPin({}), K.cotterPin({}), K.rClip({}), K.blindRivet({}),
    K.openSpanner({ size: 17, L: 120 }), K.allenKey({}), K.loctite(),
  ];
  parts.forEach((p, i) => { p.position.x = (i % 9) * 34 - 136; p.position.z = Math.floor(i / 9) * 60 - 60; D.add(p); });
  D.shots([[0, v3(0, 260, 330), v3(0, 0, -10)], [10, v3(0, 260, 330), v3(0, 0, -10)]]);
  return { scene: D.scene, camera: D.camera, update: t => D.update(t) };
}
