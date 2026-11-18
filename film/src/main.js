// Film driver: loads the narration timeline, instantiates scenes, exposes a
// deterministic seek(t) used by the frame renderer (tools/render.js).
import { renderer, clearOverlay, fadeEl, smooth } from './engine.js';

const REGISTRY = {};
const FADE = 0.35; // white dip between scenes (s)

const timeline = await (await fetch('/build/timeline.json')).json();
for (const sc of timeline.scenes) {
  try { REGISTRY[sc.id] = (await import(`./scenes/${sc.id}.js`)).default; }
  catch (e) { console.warn('placeholder for', sc.id); REGISTRY[sc.id] = (await import('./scenes/_placeholder.js')).default(sc.id); }
}
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
    const own = mod && mod.sfx ? mod.sfx({ cue: cueFn(sc), duration: sc.duration }) : [];
    for (const e of own) out.push({ ...e, t: +(sc.start + e.t).toFixed(3) });
    // soft whoosh on every scene change (unless the scene already opens with a sound)
    if (sc.start > 0 && !own.some(e => e.t < 0.4 && e.name !== 'line_ambience')) out.push({ t: +Math.max(0, sc.start - 0.25).toFixed(3), name: 'whoosh', gain: 0.12 });
  }
  return out;
};
const dbg = new URLSearchParams(location.search).get('debug');
if (dbg) {
  const mod = (await import(`./scenes/${dbg}.js`)).default;
  const inst = mod({ cue: (id, w) => (w === 'end' ? 1.5 : 0.5), duration: 10, slides: [] });
  window.__seek = (t) => { inst.update(t); renderer.render(inst.scene, inst.camera); fadeEl.style.opacity = 0; return true; };
}
window.__ready = true;
