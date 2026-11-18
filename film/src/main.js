// Film driver: loads the narration timeline, instantiates scenes, exposes a
// deterministic seek(t) used by the frame renderer (tools/render.js).
import { renderer, clearOverlay, fadeEl, smooth } from './engine.js';
import coldopen from './scenes/coldopen.js';
import title from './scenes/title.js';
import caliper from './scenes/caliper.js';

const REGISTRY = { coldopen, title, caliper };
const FADE = 0.35; // white dip between scenes (s)

const timeline = await (await fetch('/build/timeline.json')).json();
await document.fonts.load('600 40px Plex'); await document.fonts.load('700 40px PlexLatin');
await document.fonts.ready;

let active = null, activeId = null;
function cueFn(sc) {
  return (id, which = 'start') => { const c = sc.cues[id]; if (!c) throw new Error('missing cue ' + id); return c[which]; };
}
function activate(sc) {
  if (activeId === sc.id) return;
  if (active && active.dispose) active.dispose();
  clearOverlay();
  const make = REGISTRY[sc.id];
  if (!make) throw new Error('no scene module for ' + sc.id);
  active = make({ cue: cueFn(sc), duration: sc.duration, slides: sc.slides });
  activeId = sc.id;
}

window.__timeline = timeline;
window.__seek = (t) => {
  const scenes = timeline.scenes;
  let sc = scenes.find(s => t >= s.start && t < s.start + s.duration) || scenes[scenes.length - 1];
  activate(sc);
  const lt = t - sc.start;
  active.update(lt);
  renderer.render(active.scene, active.camera);
  // white dip at scene boundaries (skip the very first fade-in)
  const fin = sc === scenes[0] ? 1 : smooth(lt / FADE);
  const fout = sc === scenes[scenes.length - 1] ? 1 : smooth((sc.duration - lt) / FADE);
  fadeEl.style.opacity = 1 - Math.min(fin, fout);
  return true;
};
/** Sound-effect cue list for the whole film: [{t, name, gain}] */
window.__sfx = () => {
  const out = [];
  for (const sc of timeline.scenes) {
    const mod = REGISTRY[sc.id];
    if (mod && mod.sfx) for (const e of mod.sfx({ cue: cueFn(sc), duration: sc.duration })) out.push({ ...e, t: +(sc.start + e.t).toFixed(3) });
  }
  return out;
};
window.__ready = true;
