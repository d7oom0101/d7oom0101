// Slide 1 — title card: "المثبتات والهياكل / Fasteners and Structures"
import * as THREE from 'three';
import { studio, shadowFloor, hexBolt, el, place, seg, easeOut, easeBack, lerp, v3 } from '../engine.js';

export default function title({ duration }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1920 / 1080, 1, 3000);
  studio(scene, { target: v3(0, 20, 0), size: 120, keyPos: v3(150, 380, 260) });
  shadowFloor(scene, -12, 1500, 0.12);
  const bolt = hexBolt({ d: 10, pitch: 1.5, L: 46, s: 17, k: 6.4 });
  const pivot = new THREE.Group(); pivot.add(bolt); bolt.position.y = -26; scene.add(pivot);
  pivot.rotation.z = Math.PI / 2;
  const logo = el('big', '<img src="/assets/pg_logo_circle.png" style="width:190px;height:190px">');
  const t1 = el('big', '<div style="font:700 104px Plex;color:#003DA5">المثبّتات والهياكل</div>');
  const t2 = el('big', '<div style="font:600 52px PlexLatin;color:#0A6FD6;letter-spacing:1px">Fasteners and Structures</div>');
  const t3 = el('big', '<div style="font:500 36px Plex;color:#5C6E8A">تدريب فريق التشغيل والصيانة</div>');
  function update(t) {
    pivot.position.set(-62 + 0 * t, 18, 0);
    pivot.rotation.x = t * 1.4;
    camera.position.set(0, 30, 330 - t * 8); camera.lookAt(0, 14, 0);
    const a = seg(t, 0.1, 0.7, easeOut);
    place(logo, 1580, 330, a, lerp(0.7, 1, seg(t, 0.1, 0.6, easeBack)));
    place(t1, 1250, 540, seg(t, 0.25, 0.8), 1);
    t1.style.transform = `translate(-50%,-50%) translateX(${(1 - seg(t, 0.25, 0.9, easeOut)) * 60}px)`;
    place(t2, 1250, 640, seg(t, 0.45, 1.0));
    place(t3, 1250, 715, seg(t, 0.6, 1.1));
  }
  return { scene, camera, update };
}
title.sfx = () => [{ t: 0.05, name: 'whoosh', gain: 0.4 }, { t: 0.3, name: 'chime', gain: 0.25 }];
