import * as THREE from 'three';
import { el } from '../engine.js';
export default (id) => () => { const s = new THREE.Scene(); const c = new THREE.PerspectiveCamera(); const d = el('big', `<div style="font:700 80px PlexLatin;color:#bbb">${id}</div>`); return { scene: s, camera: c, update: () => { d.style.left = '960px'; d.style.top = '540px'; d.style.opacity = 1; } }; };
