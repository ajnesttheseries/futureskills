import { createWorld } from './world.js';
import { initDemos } from './demo.js';

const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const NOTES = window.__NOTES__ || [];
let world = null;
try { world = createWorld(document.getElementById('gl')); } catch (e) { console.warn('WebGL unavailable', e); document.body.classList.add('no-gl'); }
function fit() {
  const sc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stage.style.transform = `translate(-50%,-50%) scale(${sc})`;
  world && world.resize(Math.round(1920 * Math.min(sc, 1)), Math.round(1080 * Math.min(sc, 1)));
}
window.addEventListener('resize', fit); fit();
const bgA = document.getElementById('bgA'), bgB = document.getElementById('bgB'); let bgFlip = false;
function setBg(name) { const [on, off] = bgFlip ? [bgA, bgB] : [bgB, bgA]; bgFlip = !bgFlip; on.className = 'bg bg-' + name + ' on'; off.classList.remove('on'); }
function countUp(el, attr = 'to') {
  const v = el.dataset[attr]; const to = parseFloat(v), dec = (v.split('.')[1] || '').length;
  const pre = el.dataset.pre || '', suf = el.dataset.suf || ''; const dur = 1400;
  const t0 = performance.now() + (parseFloat(el.dataset.delay || 0.4)) * 1000;
  const tick = now => { const k = Math.max(0, Math.min(1, (now - t0) / dur)); const e = 1 - Math.pow(1 - k, 3);
    el.textContent = pre + (to * e).toFixed(dec) + suf; if (k < 1) requestAnimationFrame(tick); };
  el.textContent = pre + (0).toFixed(dec) + suf; requestAnimationFrame(tick);
}
let cur = -1, pw = null;
const bc = { postMessage(d) { if (!pw || pw.closed) return; try { pw.update(d); } catch (e) {} } };
function presenter() {
  pw = window.open('', 'ajnest_notes', 'width=760,height=820'); if (!pw) return;
  pw.document.open();
  pw.document.write(`<!DOCTYPE html><html lang="th"><head><meta charset="utf-8"><title>Speaker Notes</title><style>body{margin:0;background:#0d0d3a;color:#eef;font:19px/1.6 'Leelawadee UI',Tahoma,sans-serif}header{display:flex;gap:12px;align-items:center;padding:12px 18px;background:#14143c;position:sticky;top:0}b#c{font-size:22px;color:#ffc928}#t{margin-left:auto;font:700 26px monospace;color:#5ef2ff}button{font:700 18px sans-serif;padding:8px 16px;border-radius:10px;border:none;background:#2f2fff;color:#fff;cursor:pointer}#n{white-space:pre-wrap;padding:16px 20px}#x{padding:0 20px 20px;color:#9aa0ff}</style></head><body><header><button id=p>‹</button><button id=f>›</button><b id=c></b><span id=t>00:00</span></header><div id=n></div><div id=x></div></body></html>`);
  pw.document.close();
  const d = pw.document; const T0 = Date.now();
  pw.setInterval(() => { const s = Math.floor((Date.now() - T0) / 1000); d.getElementById('t').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
  d.getElementById('p').onclick = () => prevS(); d.getElementById('f').onclick = () => next();
  d.onkeydown = e => { if (e.key === 'ArrowRight' || e.key === ' ') next(); if (e.key === 'ArrowLeft') prevS(); };
  pw.update = o => { d.getElementById('c').textContent = o.apx ? 'คลังสำรอง' : (o.n + 1) + ' / ' + o.mainN; d.getElementById('n').textContent = o.notes; d.getElementById('x').textContent = 'ถัดไป: ' + o.next; };
  const k = cur; cur = -2; go(k);
}

initDemos();

// ── people grid (100 dots) ──
function buildPPL(s) {
  s.querySelectorAll('.ppl').forEach(p => {
    const sp = p.dataset.split.split(',').map(Number); let h = '', k = 0;
    sp.forEach((n, g) => { for (let i = 0; i < n; i++, k++) h += `<i class="c${g}" style="--k:${k}"></i>`; });
    p.innerHTML = h; p.classList.remove('go'); void p.offsetWidth; setTimeout(() => p.classList.add('go'), 300);
  });
}
// ── radar (self-check) ──
const FL = ['F', 'U', 'T', 'U', 'R', 'E'];
function drawRadar(s) {
  const svg = s.querySelector('.radar'); if (!svg) return;
  const rows = [...s.querySelectorAll('.scr')]; const vals = rows.map(r => +(r.dataset.v || 0));
  const R = 150, pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [Math.cos(a) * R * v / 5, Math.sin(a) * R * v / 5]; };
  let g = '';
  for (let l = 1; l <= 5; l++) g += `<polygon points="${FL.map((_, i) => pt(i, l).join(',')).join(' ')}" class="rg${l === 5 ? ' o' : ''}"/>`;
  FL.forEach((_, i) => { const [x, y] = pt(i, 5); g += `<line x1="0" y1="0" x2="${x}" y2="${y}" class="rl"/>`; });
  const any = vals.some(v => v);
  if (any) g += `<polygon points="${vals.map((v, i) => pt(i, v).join(',')).join(' ')}" class="rv"/>` + vals.map((v, i) => { const [x, y] = pt(i, v); return v ? `<circle cx="${x}" cy="${y}" r="7" class="rd" style="fill:${getComputedStyle(rows[i]).getPropertyValue('--c')}"/>` : ''; }).join('');
  FL.forEach((l, i) => { const [x, y] = pt(i, 6.1); g += `<text x="${x}" y="${y + 9}" class="rt" style="fill:${getComputedStyle(rows[i]).getPropertyValue('--c')}">${l}</text>`; });
  svg.innerHTML = g;
  const low = s.querySelector('.low'); if (!low) return;
  if (vals.every(v => v)) { const m = Math.min(...vals); const i = vals.indexOf(m); low.textContent = FL[i] + ' · ' + rows[i].querySelector('span').textContent; low.style.color = getComputedStyle(rows[i]).getPropertyValue('--c'); }
  else low.textContent = 'ให้คะแนนให้ครบ 6 ทักษะ';
}
// ── timers ──
function runTimer(b) {
  if (b._iv) { clearInterval(b._iv); b._iv = null; b.classList.remove('run'); b.textContent = b._label; return; }
  b._label = b._label || b.textContent; let left = +b.dataset.sec; b.classList.add('run'); b.classList.remove('done');
  const show = () => b.textContent = '⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + ' · กดเพื่อหยุด';
  show(); b._iv = setInterval(() => { left--; show(); if (left <= 0) { clearInterval(b._iv); b._iv = null; b.classList.remove('run'); b.classList.add('done'); b.textContent = '⏰ หมดเวลา!'; } }, 1000);
}
function resetSlide(s) {
  s.querySelectorAll('[data-st].on, .qo, .hnt, s[data-n].on, .flip.on, .idea.on').forEach(e => e.classList.remove('on', 'picked', 'right'));
  s.classList.remove('answered', 'alt');
  s.querySelectorAll('.tgb').forEach((b, i) => b.classList.toggle('on', i === 0));
  s.querySelectorAll('.tmr').forEach(b => { if (b._iv) clearInterval(b._iv); b._iv = null; b.classList.remove('run', 'done'); if (b._label) b.textContent = b._label; });
  const hc = s.querySelector('.hc'); if (hc) hc.textContent = 'พบ 0 / 3';
}
document.addEventListener('click', e => {
  const t = e.target, s = t.closest('.slide'); if (!s) return;
  const stp = t.closest('.stp'); if (stp) { const nx = [...s.querySelectorAll('[data-st]:not(.on)')].sort((a, b) => a.dataset.st - b.dataset.st)[0]; if (nx) nx.classList.add('on'); if (!s.querySelector('[data-st]:not(.on)')) stp.classList.add('done'); return; }
  const qo = t.closest('.qo'); if (qo) { if (s.classList.contains('answered')) return; qo.classList.add('picked'); s.classList.add('answered'); s.querySelectorAll('.qo[data-ok="1"]').forEach(x => x.classList.add('right')); s.querySelectorAll('[data-to2]').forEach(el => countUp(el, 'to2')); return; }
  const pl = t.closest('.pgl'); if (pl) { const g = [...pl.parentNode.children].indexOf(pl); const w = s.querySelector('.ppl'); const same = w.dataset.hl == g; w.dataset.hl = same ? '' : g; s.querySelectorAll('.pgl').forEach((x, i) => x.classList.toggle('on', !same && i === g)); return; }
  const tg = t.closest('.tgb'); if (tg) { s.classList.toggle('alt', tg.dataset.v === 'b'); s.querySelectorAll('.tgb').forEach(b => b.classList.toggle('on', b === tg)); return; }
  const hn = t.closest('.hnt'); if (hn) { const nx = [...s.querySelectorAll('s[data-n]:not(.on)')].sort((a, b) => a.dataset.n - b.dataset.n)[0]; if (nx) nx.classList.add('on'); const n = s.querySelectorAll('s[data-n].on').length; s.querySelector('.hc').textContent = 'พบ ' + n + ' / 3'; if (n >= 3) hn.classList.add('done'); return; }
  const tm = t.closest('.tmr'); if (tm) { runTimer(tm); return; }
  const id = t.closest('.idea'); if (id) { id.classList.toggle('on'); return; }
  if (t.closest('.clr')) { s.querySelectorAll('.idea.on').forEach(x => x.classList.remove('on')); return; }
  const fl = t.closest('.flip'); if (fl) { fl.classList.toggle('on'); return; }
  const sb = t.closest('.scbt button'); if (sb) { const r = sb.closest('.scr'); r.dataset.v = sb.dataset.v; r.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v <= +sb.dataset.v)); drawRadar(s); return; }
  if (t.closest('.scx')) { s.querySelectorAll('.scr').forEach(r => { r.dataset.v = ''; r.querySelectorAll('button').forEach(b => b.classList.remove('on')); }); drawRadar(s); return; }
  const g = t.closest('[data-goto]'); if (g) { const i = slides.findIndex(x => x.dataset.id === g.dataset.goto); if (i >= 0) go(i); return; }
});

const counter = document.getElementById('counter'), bar = document.getElementById('bar'), notesEl = document.getElementById('notes');
function go(n) {
  n = Math.max(0, Math.min(slides.length - 1, n)); if (n === cur) return;
  const prev = slides[cur]; if (prev) { prev.classList.remove('active'); prev.classList.add('leaving'); setTimeout(() => prev.classList.remove('leaving'), 700); }
  cur = n; const s = slides[n];
  resetSlide(s); void s.offsetWidth; s.classList.add('active');
  const cfg = JSON.parse(s.dataset.scene || '{}');
  setBg(cfg.bg || 'light'); stage.classList.toggle('dark', !!cfg.dark);
  world && world.setScene(cfg);
  s.querySelectorAll('[data-to]').forEach(el => countUp(el));
  buildPPL(s); drawRadar(s);
  const N = slides.length;
  counter.textContent = String(n + 1).padStart(2, '0') + ' / ' + N;
  const cr = document.getElementById('credit'); cr.classList.toggle('on', n >= 2 && n < N - 1);
  bar.style.width = (n + 1) / N * 100 + '%';
  bc.postMessage({ n, mainN: N, notes: NOTES[n] || '', next: slides[n + 1] ? (slides[n + 1].querySelector('h2,h1,.skn')?.textContent || '') : '—' });
  notesEl.querySelector('.nt').textContent = NOTES[n] || '';
  history.replaceState(null, '', '#' + (n + 1));
}
const next = () => go(cur + 1), prevS = () => go(cur - 1);
window.__go = go; window.__next = next; window.__prev = prevS;
document.addEventListener('keydown', e => {
  const t = e.target; if (t && t.closest && t.closest('input,select,textarea')) return;
  if (t && t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prevS(); }
  else if (e.key === 'Home') go(0); else if (e.key === 'End') go(slides.length - 1);
  else if (e.key.toLowerCase() === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  else if (e.key.toLowerCase() === 'n') document.body.classList.toggle('show-notes');
  else if (e.key.toLowerCase() === 'h') document.body.classList.toggle('show-help');
  else if (e.key.toLowerCase() === 'p') presenter();
});
document.getElementById('nav-next').onclick = next; document.getElementById('nav-prev').onclick = prevS;
let tx = null; window.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
window.addEventListener('touchend', e => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) d < 0 ? next() : prevS(); tx = null; });
const timerEl = document.getElementById('timer'); const T0 = Date.now();
setInterval(() => { const s = Math.floor((Date.now() - T0) / 1000); timerEl.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
const isBg = t => t && t.matches && t.matches('#gl, #stage, .bg, body, html, .brand, .brand *, #counter, #credit, #credit *, .slide, #barwrap, #bar');
document.addEventListener('click', e => { if (e.button !== 0 || !isBg(e.target)) return; if (window.getSelection && String(window.getSelection())) return; next(); });
document.addEventListener('contextmenu', e => { if (!isBg(e.target)) return; e.preventDefault(); prevS(); });
const start = parseInt((location.hash || '#1').slice(1)) - 1;
go(isNaN(start) ? 0 : start);
