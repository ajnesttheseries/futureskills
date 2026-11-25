// Full-screen, realistic (unbranded) AI-assistant demo engine.
// Each .demo-fs slide carries a JSON script (.dxj) of steps that are played like a real session.
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function countUp(el, speed) {
  if (el._counted) return; el._counted = 1;
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '', pre = el.dataset.pre || '';
  const from = parseFloat(el.dataset.from || 0), dur = 1100 / speed, t0 = performance.now();
  const fmt = v => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
  const tick = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

function welcome(J) {
  return `<div class="dx-hello"><div class="dx-logo">✦</div><h3>สวัสดีครับ วันนี้ให้ช่วยอะไรดี?</h3>
  <div class="dx-sugg">${(J.sugg || []).map(s => `<div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('')}</div></div>`;
}

function setup(sl) {
  const J = JSON.parse(sl.querySelector('.dxj').textContent);
  const q = s => sl.querySelector(s);
  const D = { J, tok: 0, speed: 1, dx: q('.dx'), app: q('.dx-app'), thread: q('.dx-thread'), txt: q('.dx-txt'), ph: q('.dx-ph'), att: q('.dx-att'), cv: q('.dx-canvas'), cvb: q('.dx-cv-body'), cvt: q('.dx-cv-head b'), cur: q('.dx-cursor'), play: q('.dx-play'), toast: q('.dx-toast'), send: q('.dx-send') };
  sl._dx = D;
  const reset = () => {
    D.tok++; D.thread.innerHTML = welcome(J); D.txt.textContent = ''; D.ph.style.display = ''; D.att.innerHTML = '';
    D.app.classList.remove('cv-open', 'cv-wide', 'cv-max'); D.cvb.innerHTML = ''; D.cvt.textContent = '';
    D.cur.style.opacity = 0; D.play.classList.remove('off'); D.toast.classList.remove('on'); sl.classList.remove('dx-done');
    sl.querySelectorAll('.dx-side .on').forEach(x => x.classList.remove('on'));
    if (J.side) { const a = sl.querySelector(`.dx-side [data-k="${J.side}"]`); a && a.classList.add('on'); }
    q('.dx-head b').textContent = J.chat || 'แชทใหม่';
  };
  D.reset = reset;
  q('.dx-play button').addEventListener('click', e => { e.stopPropagation(); run(sl); });
  q('.dx-replay').addEventListener('click', e => { e.stopPropagation(); reset(); run(sl); });
  const sp = q('.dx-speed'); sp.addEventListener('click', e => { e.stopPropagation(); D.speed = D.speed === 1 ? 2 : 1; sp.textContent = D.speed === 1 ? '⏩ เร็ว ×2' : '▶ ปกติ'; });
  reset();
  let was = false;
  new MutationObserver(() => { const on = sl.classList.contains('active'); if (on && !was) reset(); if (!on && was) D.tok++; was = on; }).observe(sl, { attributes: true, attributeFilter: ['class'] });
}

async function run(sl) {
  const D = sl._dx, J = D.J, t = ++D.tok;
  const chk = () => { if (D.tok !== t) throw 'stop'; };
  const w = async ms => { await sleep(ms / D.speed); chk(); };
  const scroll = () => { D.thread.scrollTop = D.thread.scrollHeight; };
  const scale = () => D.dx.getBoundingClientRect().width / D.dx.offsetWidth || 1;
  const moveTo = async el => {
    const r = el.getBoundingClientRect(), R = D.dx.getBoundingClientRect(), k = scale();
    D.cur.style.opacity = 1;
    D.cur.style.transform = `translate(${(r.left - R.left + r.width * .5) / k}px,${(r.top - R.top + r.height * .55) / k}px)`;
    await w(750);
  };
  const click = async el => { await moveTo(el); D.cur.classList.add('clk'); el.classList.add('dx-press'); await w(260); D.cur.classList.remove('clk'); el.classList.remove('dx-press'); };
  const reveal = async (els, gap = 380) => {
    for (const el of els) {
      el.classList.add('on'); el.querySelectorAll('[data-count]').forEach(c => countUp(c, D.speed)); if (el.dataset.count) countUp(el, D.speed);
      const sc = el.closest('.dx-cv-body'); if (sc) sc.scrollTop = Math.max(sc.scrollTop, el.offsetTop + el.offsetHeight - sc.clientHeight + 30);
      await w(+(el.dataset.gap || gap));
    }
  };
  let ai = null; // current AI message body
  const newAI = () => {
    const m = document.createElement('div'); m.className = 'dx-msg a';
    m.innerHTML = `<div class="dx-av">✦</div><div class="dx-body"></div>`; D.thread.appendChild(m); ai = m.querySelector('.dx-body'); scroll(); return ai;
  };
  const stream = async (box, html) => {
    const tmp = document.createElement('div'); tmp.className = 'dx-say'; tmp.innerHTML = html; box.appendChild(tmp);
    const tw = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT), nodes = []; while (tw.nextNode()) if (tw.currentNode.textContent.trim()) nodes.push(tw.currentNode);
    const full = nodes.map(n => n.textContent); nodes.forEach(n => n.textContent = '');
    const blocks = [...tmp.querySelectorAll('p,li,tr,h4,table,ul,ol,div,span,b,em,i')]; blocks.forEach(b => b.classList.add('dx-pend'));
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; let p = n.parentElement; while (p && p !== tmp) { p.classList.remove('dx-pend'); p = p.parentElement; }
      const s = [...full[i]], st = Math.max(2, Math.ceil(s.length / 10));
      for (let j = 0; j < s.length; j += st) { n.textContent = s.slice(0, j + st).join(''); scroll(); await w(26); }
    }
    tmp.querySelectorAll('.dx-pend').forEach(b => b.classList.remove('dx-pend')); scroll();
  };
  D.play.classList.add('off');
  try {
    for (const s of J.steps) {
      chk();
      if (s.t === 'attach') {
        D.att.innerHTML = `<div class="dx-file"><i>${s.icon || '📊'}</i><div><b>${esc(s.name)}</b><span>${esc(s.meta || '')}</span></div><em class="dx-up"></em></div>`;
        await click(sl.querySelector('.dx-clip')); await w(900);
      } else if (s.t === 'type') {
        await moveTo(sl.querySelector('.dx-input')); D.ph.style.display = 'none';
        const chars = [...s.text], dur = Math.min(s.max || 5200, chars.length * 22), per = Math.max(1, Math.ceil(chars.length / (dur / 30)));
        for (let i = 0; i < chars.length; i += per) { D.txt.textContent = chars.slice(0, i + per).join(''); D.txt.parentElement.scrollTop = 9999; await w(30); }
        await w(350);
      } else if (s.t === 'send') {
        await click(D.send);
        const m = document.createElement('div'); m.className = 'dx-msg u';
        m.innerHTML = `<div class="dx-bub">${D.att.innerHTML ? `<div class="dx-fchip">${D.att.querySelector('.dx-file').innerHTML}</div>` : ''}<p>${esc(D.txt.textContent)}</p></div>`;
        const h = D.thread.querySelector('.dx-hello'); if (h) h.remove();
        D.thread.appendChild(m); D.txt.textContent = ''; D.ph.style.display = ''; D.att.innerHTML = ''; ai = null; scroll(); await w(500);
      } else if (s.t === 'think') {
        const b = newAI(); const th = document.createElement('div'); th.className = 'dx-think';
        th.innerHTML = `<b><i class="dx-spin"></i><span>${esc(s.title || 'กำลังทำงาน…')}</span></b><ul></ul>`; b.appendChild(th); const ul = th.querySelector('ul');
        for (const it of s.items) { const li = document.createElement('li'); li.innerHTML = `<i class="dx-spin s"></i>${esc(it)}`; ul.appendChild(li); scroll(); await w(s.gap || 750); li.classList.add('ok'); li.querySelector('i').outerHTML = '<i class="dx-ck">✓</i>'; }
        th.classList.add('done'); th.querySelector('b').innerHTML = `<i class="dx-ck">✓</i><span>${esc(s.done || 'ทำเสร็จแล้ว')}</span>`; await w(300);
      } else if (s.t === 'say') {
        await stream(ai || newAI(), s.html); await w(s.wait || 400);
      } else if (s.t === 'canvas') {
        D.cvt.textContent = s.title; D.cvb.innerHTML = s.html; D.cvb.scrollTop = 0;
        D.app.classList.add('cv-open'); D.app.classList.toggle('cv-wide', !!s.wide); D.app.classList.toggle('cv-max', !!s.max); await w(800);
        if (!s.manual) await reveal([...D.cvb.querySelectorAll('.cv:not(.later)')], s.gap);
      } else if (s.t === 'reveal') {
        await reveal([...sl.querySelectorAll(s.sel)], s.gap);
      } else if (s.t === 'click') {
        const el = sl.querySelector(s.sel); await click(el);
        (s.show || []).forEach(x => sl.querySelectorAll(x).forEach(e => e.classList.add('on')));
        (s.hide || []).forEach(x => sl.querySelectorAll(x).forEach(e => e.classList.remove('on')));
        if (s.toggle) sl.querySelectorAll(s.toggle[0]).forEach(e => e.classList.toggle(s.toggle[1], e.matches(s.toggle[2])));
        await w(s.wait || 400);
      } else if (s.t === 'code') {
        const pre = sl.querySelector(s.sel);
        for (const ln of s.lines) { const d = document.createElement('div'); d.innerHTML = ln; pre.appendChild(d); pre.scrollTop = pre.scrollHeight; await w(s.gap || 70); }
      } else if (s.t === 'typein') {
        const el = sl.querySelector(s.sel); await moveTo(el); const ch = [...s.text], per = Math.max(1, Math.ceil(ch.length / 60));
        for (let i = 0; i < ch.length; i += per) { el.textContent = ch.slice(0, i + per).join(''); el.scrollTop = 9999; await w(30); }
      } else if (s.t === 'hitl') {
        const b = ai || newAI(); const c = document.createElement('div'); c.className = 'dx-hitl';
        c.innerHTML = `<b>✋ รอคนตรวจก่อนใช้งาน</b><p>${esc(s.text)}</p><div class="dx-hb"><button class="dx-ok">✅ ${esc(s.ok || 'อนุมัติ')}</button><button>✏️ ขอแก้ไข</button></div>`;
        b.appendChild(c); scroll(); await w(900); await click(c.querySelector('.dx-ok'));
        c.classList.add('done'); c.innerHTML = `<b>✅ ${esc(s.okText || 'อนุมัติแล้ว')}</b><p>โดย คุณ (ฝ่าย HR) · ตรวจครบตาม Checklist</p>`; scroll(); await w(600);
      } else if (s.t === 'toast') {
        D.toast.innerHTML = s.html; D.toast.classList.add('on'); await w(s.ms || 2200); if (!s.keep) D.toast.classList.remove('on');
      } else if (s.t === 'side') {
        const el = sl.querySelector(`.dx-side [data-k="${s.k}"]`); await click(el); sl.querySelectorAll('.dx-side .on').forEach(x => x.classList.remove('on')); el.classList.add('on');
        if (s.chat) sl.querySelector('.dx-head b').textContent = s.chat;
        if (s.clear) { D.thread.innerHTML = ''; ai = null; }
        await w(400);
      } else if (s.t === 'tool') {
        const b = ai || newAI(); const c = document.createElement('div'); c.className = 'dx-tool';
        c.innerHTML = `<i>${s.icon || '🔧'}</i><div><b>${esc(s.app)}</b><span>${esc(s.act)}</span></div><em class="dx-spin"></em>`;
        b.appendChild(c); scroll(); await w(s.ms || 1400);
        c.classList.add('ok'); c.querySelector('em').outerHTML = `<em class="dx-tok">✓ ${esc(s.done || 'เสร็จ')}</em>`; await w(250);
      } else if (s.t === 'cls') {
        sl.querySelectorAll(s.sel).forEach(e => { if (s.add) e.classList.add(...s.add.split(' ')); if (s.rm) e.classList.remove(...s.rm.split(' ')); });
        await w(s.wait || 0);
      } else if (s.t === 'wait') await w(s.ms);
    }
    D.cur.style.opacity = 0; sl.classList.add('dx-done');
  } catch (e) { if (e !== 'stop') console.error(e); }
}

export function initDemos() {
  document.querySelectorAll('.slide.demo-fs').forEach(setup);
  const ab = document.querySelector('.aboutsl');
  if (ab) {
    const lb = ab.querySelector('.ablb'), figs = [...ab.querySelectorAll('.abk')]; let cur = -1;
    const show = n => { cur = (n + figs.length) % figs.length; const f = figs[cur];
      lb.querySelector('img').src = f.querySelector('img').src; lb.querySelector('b').textContent = f.dataset.year;
      lb.querySelector('p').textContent = f.dataset.full; lb.classList.add('on'); };
    const hide = () => lb.classList.remove('on');
    figs.forEach((f, n) => f.addEventListener('click', e => { e.stopPropagation(); show(n); }));
    lb.addEventListener('click', e => { e.stopPropagation(); hide(); });
    window.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') { hide(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ') { show(cur + (e.key === 'ArrowLeft' ? -1 : 1)); }
      else return;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    new MutationObserver(() => { if (!ab.classList.contains('active')) hide(); }).observe(ab, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-speak]'); if (!b || !window.speechSynthesis) return;
    e.stopPropagation(); speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(b.dataset.speak); u.lang = 'th-TH'; u.rate = .95;
    const v = speechSynthesis.getVoices().find(v => /th/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  });
}
