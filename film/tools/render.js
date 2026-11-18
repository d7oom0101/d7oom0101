#!/usr/bin/env node
// Deterministic frame renderer: serves the project, drives window.__seek(t)
// in headless Chromium and pipes JPEG frames into ffmpeg.
//   node tools/render.js                      -> build/video.mp4 (whole timeline, no audio)
//   node tools/render.js --stills 3.2,10.5    -> build/stills/t_3.20.png ...
//   node tools/render.js --from 20 --to 30    -> partial render
//   node tools/render.js --part 2/4           -> render a quarter (parallel workers), concat later
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? a.concat([[x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]]) : a), []));
const FPS = +(args.fps || 30);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/src/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${port}/` + (args.debug ? `?debug=${args.debug}` : ''));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const total = await page.evaluate(() => window.__timeline.duration);
  const sfx = await page.evaluate(() => window.__sfx());
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'sfx.json'), JSON.stringify(sfx, null, 1));

  if (args.stills) {
    const dir = path.join(ROOT, 'build', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const s of String(args.stills).split(',')) {
      const t = +s; await page.evaluate(t => window.__seek(t), t);
      const f = path.join(dir, `t_${t.toFixed(2)}.png`); await page.screenshot({ path: f }); console.log(f);
    }
    await browser.close(); server.close(); return;
  }

  let from = +(args.from || 0), to = Math.min(+(args.to || total), total);
  let nFrames = Math.round((to - from) * FPS), f0 = Math.round(from * FPS);
  let out = args.out || path.join(ROOT, 'build', 'video.mp4');
  if (args.part) {
    const [k, n] = String(args.part).split('/').map(Number);
    const all = nFrames, per = Math.ceil(all / n);
    f0 = f0 + (k - 1) * per; nFrames = Math.min(per, all - (k - 1) * per);
    out = path.join(ROOT, 'build', `part_${k}.mp4`);
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'animation', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < nFrames; i++) {
    const t = (f0 + i) / FPS;
    await page.evaluate(t => window.__seek(t), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stderr.write(`frame ${i}/${nFrames}  t=${t.toFixed(2)}  ${((Date.now() - t0) / 1000 / (i + 1)).toFixed(3)} s/frame\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
