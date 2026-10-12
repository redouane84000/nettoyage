/*!
 * Fast & Clean — entrée « vitre nettoyée »
 * L'écran devient une vitre sale, savonnée au mouilleur puis nettoyée à la raclette en « S » ;
 * le site apparaît net derrière. Aucune dépendance, aucun changement du design existant.
 *
 * Utilisation (Vite / React) — uniquement sur la page Contact :
 *   import { playGlassIntro } from './glassIntro';
 *   playGlassIntro({ once: 'session', key: 'fc-glass-contact' });
 *
 * Options :
 *   once      'session' (défaut : une fois par visite), 'always' (à chaque chargement)
 *   reveal    sélecteur CSS des éléments qui « montent » au passage de la raclette, ou false
 *   maxReveal nombre maximum d'éléments animés (défaut 40)
 *   zIndex    calque de l'animation (défaut très élevé)
 *   onDone    fonction appelée à la fin
 * Retourne une fonction qui arrête et retire l'animation.
 */
export function playGlassIntro(opts = {}) {
  const o = Object.assign({
    once: 'session', key: 'fc-glass-intro', reveal: 'h1, h2, h3, p, img, button, a',
    maxReveal: 40, zIndex: 2147483000, onDone: null,
  }, opts);
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  if (o.once === 'session') { try { if (sessionStorage.getItem(o.key)) return () => {}; } catch (e) { /* stockage indisponible : on joue l'animation */ } }

  const rand = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0];
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeIOq = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- Calques ---------- */
  const root = document.createElement('div');
  root.setAttribute('aria-hidden', 'true');
  root.title = 'Toucher pour passer';
  root.style.cssText = `position:fixed;inset:0;z-index:${o.zIndex};background:#D3CDBE;cursor:pointer;opacity:1;transition:opacity .5s ease;`;
  const gc = mk(1, 1), dc = mk(1, 1);
  for (const c of [gc, dc]) c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  const toolCss = 'position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;will-change:transform;pointer-events:none;';
  const wetEl = document.createElement('div'), sqEl = document.createElement('div');
  wetEl.style.cssText = toolCss; sqEl.style.cssText = toolCss;
  root.append(gc, dc, wetEl, sqEl);
  document.body.appendChild(root);
  const g = gc.getContext('2d'), d = dc.getContext('2d');

  const html = document.documentElement, body = document.body;
  const prevOverflow = [html.style.overflow, body.style.overflow];
  html.style.overflow = 'hidden'; body.style.overflow = 'hidden';

  /* ---------- Textures ---------- */
  function blob(c, x, y, r, rgb, a) { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  function paintDirt(c, w, h) {
    const k = Math.max(w, h) / 1600;
    c.fillStyle = 'rgba(194,188,172,.86)'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 150; i++) blob(c, rand(0, w), rand(0, h), rand(60, 380) * k, pick(['168,162,144', '212,208,196', '150,142,124', '182,176,160']), rand(.15, .38));
    for (let i = 0; i < 220; i++) { const x = rand(0, w), y = rand(-h * .05, h * .55), L = rand(60, 520) * k; const gr = c.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, 'rgba(132,124,106,.42)'); gr.addColorStop(1, 'rgba(132,124,106,0)'); c.fillStyle = gr; c.fillRect(x, y, rand(1.2, 4) * k, L); }
    for (let i = 0; i < 1500; i++) { const x = rand(0, w), y = rand(0, h), r = rand(2, 7) * k; c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = 'rgba(150,144,128,.22)'; c.fill(); c.strokeStyle = `rgba(240,238,230,${rand(.4, .75)})`; c.lineWidth = Math.max(1, k); c.stroke(); }
    for (let n = 0; n < 6; n++) {
      const x = rand(.1, .9) * w, y = rand(.35, .75) * h, s = rand(.8, 1.2) * k;
      c.save(); c.translate(x, y); c.rotate(rand(-.5, .5));
      c.fillStyle = 'rgba(140,132,114,.28)'; c.beginPath(); c.ellipse(0, 0, 42 * s, 50 * s, 0, 0, 7); c.fill();
      for (let f = 0; f < 4; f++) { c.beginPath(); c.ellipse((f - 1.5) * 22 * s, -62 * s + Math.abs(f - 1.5) * 6 * s, 9 * s, 24 * s, 0, 0, 7); c.fill(); }
      c.beginPath(); c.ellipse(-50 * s, -6 * s, 9 * s, 22 * s, -.7, 0, 7); c.fill();
      c.restore();
    }
    const gr = c.createLinearGradient(0, h, 0, h * .7); gr.addColorStop(0, 'rgba(120,110,90,.55)'); gr.addColorStop(1, 'rgba(120,110,90,0)'); c.fillStyle = gr; c.fillRect(0, h * .7, w, h * .3);
    const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(110,100,82,0)'); vg.addColorStop(1, 'rgba(110,100,82,.32)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  }
  function paintFoam(c, w, h) {
    const k = Math.max(w, h) / 1600;
    c.fillStyle = 'rgba(244,247,248,.84)'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) blob(c, rand(0, w), rand(0, h), rand(40, 220) * k, pick(['255,255,255', '214,228,233']), rand(.25, .5));
    for (let i = 0; i < 2600; i++) {
      const x = rand(0, w), y = rand(0, h), r = Math.pow(Math.random(), 2.2) * 15 * k + 1.5 * k;
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = 'rgba(205,222,228,.22)'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = Math.max(.8, .9 * k); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(x - r * .35, y - r * .4, Math.max(.6, r * .22), 0, 7); c.fill();
    }
  }

  /* ---------- Outils ---------- */
  function buildSqueegee(bh) {
    const h2 = bh / 2;
    sqEl.innerHTML = `<svg width="1" height="1" style="position:absolute;left:0;top:0;overflow:visible">
      <defs>
        <linearGradient id="fcgi-st" x1="0" x2="1"><stop offset="0" stop-color="#e9edef"/><stop offset=".45" stop-color="#9aa4a8"/><stop offset=".7" stop-color="#d5dbdd"/><stop offset="1" stop-color="#7f898d"/></linearGradient>
        <linearGradient id="fcgi-tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a93aa"/><stop offset=".5" stop-color="#1B7A8F"/><stop offset="1" stop-color="#0d4d5c"/></linearGradient>
        <filter id="fcgi-sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      <g opacity=".28" filter="url(#fcgi-sb)" transform="translate(14 18)"><rect x="-6" y="${-h2}" width="26" height="${bh}" rx="6" fill="#0E1D25"/><rect x="20" y="-12" width="250" height="24" rx="12" transform="rotate(32)" fill="#0E1D25"/></g>
      <rect x="-5" y="${-h2 - 2}" width="10" height="${bh + 4}" rx="4" fill="#141617"/>
      <rect x="-3" y="${-h2 - 2}" width="2" height="${bh + 4}" fill="#3a3f42"/>
      <rect x="4" y="${-h2 - 8}" width="15" height="${bh + 16}" rx="3" fill="url(#fcgi-st)"/>
      <rect x="16" y="-34" width="18" height="68" rx="5" fill="#0d4d5c"/>
      <g transform="rotate(32)">
        <rect x="26" y="-11" width="236" height="22" rx="11" fill="url(#fcgi-tl)"/>
        <rect x="190" y="-12" width="76" height="24" rx="12" fill="#16191b"/>
        <rect x="34" y="-7" width="150" height="4" rx="2" fill="rgba(255,255,255,.28)"/>
      </g>
    </svg>`;
  }
  function buildWetter(ww) {
    const w2 = ww / 2;
    let fib = ''; for (let x = -w2 + 6; x < w2 - 6; x += 7) fib += `<path d="M${x} -20 q 3 20 0 40" stroke="rgba(150,185,198,.55)" stroke-width="1.4" fill="none"/>`;
    wetEl.innerHTML = `<svg width="1" height="1" style="position:absolute;left:0;top:0;overflow:visible">
      <defs><linearGradient id="fcgi-fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e3eef2"/><stop offset="1" stop-color="#b9d3dc"/></linearGradient>
      <filter id="fcgi-wb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>
      <rect x="${-w2 + 10}" y="-10" width="${ww - 20}" height="44" rx="22" fill="#0E1D25" opacity=".22" filter="url(#fcgi-wb)"/>
      <rect x="${-w2}" y="-24" width="${ww}" height="48" rx="24" fill="url(#fcgi-fb)"/>${fib}
      <rect x="${-w2 + 18}" y="-30" width="${ww - 36}" height="8" rx="4" fill="#1B7A8F"/>
      <rect x="-9" y="-30" width="18" height="150" rx="9" fill="#1B7A8F" transform="rotate(12)"/>
      <rect x="-10" y="60" width="20" height="70" rx="10" fill="#16191b" transform="rotate(12)"/>
    </svg>`;
  }

  /* ---------- Plan ---------- */
  const W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 1.5);
  for (const c of [gc, dc]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
  d.setTransform(DPR, 0, 0, DPR, 0, 0);
  const dirt = mk(gc.width, gc.height); paintDirt(dirt.getContext('2d'), dirt.width, dirt.height);
  const foam = mk(gc.width, gc.height); paintFoam(foam.getContext('2d'), foam.width, foam.height);
  g.drawImage(dirt, 0, 0);
  root.style.background = 'transparent';
  const portrait = H > W * 1.05;
  const nc = portrait ? 3 : 5, nr = portrait ? 4 : 3, cw = W / nc, bandH = H / nr, ov = Math.min(18, bandH * .06);
  const steps = []; let tt = .45;
  for (let c = 0; c < nc; c++) { steps.push({ k: 'wet', t: tt, dur: .24, x: cw * (c + .5), w: cw * 1.02, up: c % 2 === 0 }); tt += .26; }
  tt += .14;
  const sqStart = tt, passDur = portrait ? .58 : .7;
  for (let r = 0; r < nr; r++) {
    steps.push({ k: 'sq', t: tt, dur: passDur, y0: r === 0 ? 0 : r * bandH - ov, y1: r === nr - 1 ? H : (r + 1) * bandH, dir: r % 2 ? -1 : 1, last: r === nr - 1 });
    tt += passDur + .1;
  }
  const END = tt;
  buildWetter(cw * .96); buildSqueegee(bandH + ov + 10);
  wetEl.style.transform = `translate3d(${-W}px,${H + 200}px,0)`; sqEl.style.transform = `translate3d(-400px,${bandH / 2}px,0)`;

  /* ---------- Éléments du site qui apparaissent au passage de la raclette ---------- */
  let els = [], prepared = false;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  function prepare() {
    prepared = true;
    if (!o.reveal) return;
    let list = [...document.querySelectorAll(o.reveal)].filter(el => {
      if (root.contains(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H;
    });
    const set = new Set(list);
    list = list.filter(el => { for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; }).slice(0, o.maxReveal);
    els = list.map(el => {
      const r = el.getBoundingClientRect();
      const saved = { o: el.style.opacity, t: el.style.transform, tr: el.style.transition };
      el.style.transition = 'none'; el.style.opacity = '.35'; el.style.transform = 'translate3d(0,14px,0)';
      return { el, saved, cx: r.left + r.width / 2, cy: r.top + r.height / 2, done: false };
    });
  }
  function reveal(test) {
    for (const e of els) if (!e.done && test(e)) {
      e.done = true;
      e.el.style.transition = `opacity .9s ${EASE}, transform 1s ${EASE}`;
      e.el.style.opacity = e.saved.o; e.el.style.transform = e.saved.t;
    }
  }
  function restoreEls() { for (const e of els) { e.el.style.opacity = e.saved.o; e.el.style.transform = e.saved.t; e.el.style.transition = e.saved.tr; } els = []; }

  /* ---------- Gouttes ---------- */
  let drops = [];
  function spawnDrop(x, y) { drops.push({ x, y, v: rand(30, 70), r: rand(2.2, 4.2), len: 0, life: rand(1.1, 1.8), t: 0 }); }
  function drawDrops(dt) {
    d.clearRect(0, 0, W, H);
    for (const p of drops) {
      p.t += dt; p.v *= .985; p.y += p.v * dt; p.len = Math.min(70, p.len + p.v * dt * .9);
      const a = Math.max(0, 1 - p.t / p.life); if (a <= 0) continue;
      const gr = d.createLinearGradient(0, p.y - p.len, 0, p.y); gr.addColorStop(0, 'rgba(120,170,190,0)'); gr.addColorStop(1, `rgba(120,170,190,${.25 * a})`);
      d.fillStyle = gr; d.fillRect(p.x - p.r * .35, p.y - p.len, p.r * .7, p.len);
      d.beginPath(); d.ellipse(p.x, p.y, p.r, p.r * 1.25, 0, 0, 7); d.fillStyle = `rgba(150,195,212,${.35 * a})`; d.fill();
      d.strokeStyle = `rgba(40,80,95,${.35 * a})`; d.lineWidth = 1; d.stroke();
      d.beginPath(); d.arc(p.x - p.r * .35, p.y - p.r * .4, p.r * .3, 0, 7); d.fillStyle = `rgba(255,255,255,${.95 * a})`; d.fill();
    }
    drops = drops.filter(p => p.t < p.life);
  }

  /* ---------- Reflet final sur la page ---------- */
  function glint() {
    const gl = document.createElement('div');
    gl.setAttribute('aria-hidden', 'true');
    gl.style.cssText = `position:fixed;inset:0;z-index:${o.zIndex - 1};pointer-events:none;mix-blend-mode:screen;background:linear-gradient(100deg,transparent 42%,rgba(255,255,255,.85) 50%,transparent 58%);transform:translate3d(-100%,0,0);will-change:transform;`;
    document.body.appendChild(gl);
    const an = gl.animate([{ transform: 'translate3d(-100%,0,0)' }, { transform: 'translate3d(100%,0,0)' }], { duration: 1300, easing: 'cubic-bezier(.45,0,.2,1)' });
    an.onfinish = () => gl.remove();
  }

  /* ---------- Boucle ---------- */
  const prevP = new Map(); let t0 = 0, last = 0, raf = 0, alive = true, finished = false;
  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!t0) { t0 = last = now; }
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!prepared && t > .25) prepare();
    let wetShown = false;
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i]; if (t < st.t) continue;
      const p = Math.min(1, (t - st.t) / st.dur), prev = prevP.get(i) ?? 0; if (prev >= 1) continue;
      if (st.k === 'wet') {
        const e = easeIOq(p), ep = easeIOq(prev);
        const yA = st.up ? H + 40 - (H + 80) * ep : -40 + (H + 80) * ep, yB = st.up ? H + 40 - (H + 80) * e : -40 + (H + 80) * e;
        const x0 = (st.x - st.w / 2) * DPR, y0 = (Math.min(yA, yB) - 26) * DPR, hh = (Math.abs(yB - yA) + 52) * DPR, ww = st.w * DPR;
        g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(x0, y0, ww, hh); g.restore();
        const cx0 = Math.max(0, x0), cy0 = Math.max(0, y0), cx1 = Math.min(gc.width, x0 + ww), cy1 = Math.min(gc.height, y0 + hh);
        if (cx1 > cx0 && cy1 > cy0) g.drawImage(foam, cx0, cy0, cx1 - cx0, cy1 - cy0, cx0, cy0, cx1 - cx0, cy1 - cy0);
        wetEl.style.transform = `translate3d(${st.x}px,${yB}px,0) rotate(${st.up ? -3 : 3}deg)`; wetShown = true;
      } else {
        const e = easeIO(p), ep = easeIO(prev), a = -120, b = W + 120;
        const xA = st.dir > 0 ? a + (b - a) * ep : b - (b - a) * ep, xB = st.dir > 0 ? a + (b - a) * e : b - (b - a) * e;
        const lo = Math.min(xA, xB), hi = Math.max(xA, xB);
        g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect((lo - 2) * DPR, st.y0 * DPR, (hi - lo + 4) * DPR, (st.y1 - st.y0) * DPR); g.restore();
        if (!st.last) { g.fillStyle = 'rgba(214,232,238,.75)'; g.fillRect(lo * DPR, (st.y1 - 3) * DPR, (hi - lo) * DPR, 2.2 * DPR); g.fillStyle = 'rgba(90,130,145,.25)'; g.fillRect(lo * DPR, (st.y1 - .8) * DPR, (hi - lo) * DPR, DPR); }
        sqEl.style.transform = `translate3d(${xB}px,${(st.y0 + st.y1) / 2}px,0) scaleX(${st.dir > 0 ? -1 : 1}) rotate(${st.dir > 0 ? 4 : -4}deg)`;
        reveal(el => el.cy >= st.y0 - 4 && el.cy <= st.y1 + 4 && (st.dir > 0 ? xB > el.cx : xB < el.cx));
        if (p >= 1) for (let k = 0; k < 4; k++) spawnDrop(st.dir > 0 ? W - rand(8, 60) : rand(8, 60), st.y1 - rand(4, 30));
      }
      prevP.set(i, p);
    }
    if (!wetShown && t > sqStart - .1) wetEl.style.transform = `translate3d(-300px,${H + 300}px,0)`;
    if (t > END) sqEl.style.transform = `translate3d(${W + 500}px,${H / 2}px,0)`;
    drawDrops(dt);
    if (t > END && !finished) {
      finished = true; reveal(() => true);
      for (let k = 0; k < 9; k++) spawnDrop(rand(.05, .95) * W, rand(.05, .5) * H);
      glint(); unlock();
      try { if (o.once === 'session') sessionStorage.setItem(o.key, '1'); } catch (e) { /* rien */ }
    }
    if (t > END + 1.9) close();
  }
  function unlock() { html.style.overflow = prevOverflow[0]; body.style.overflow = prevOverflow[1]; }
  function close() {
    if (!alive) return;
    alive = false; cancelAnimationFrame(raf);
    if (!prepared) prepare();
    reveal(() => true); unlock();
    root.style.opacity = '0'; root.style.pointerEvents = 'none';
    setTimeout(() => { root.remove(); restoreEls(); if (typeof o.onDone === 'function') o.onDone(); }, 1100);
  }
  root.addEventListener('click', () => { try { if (o.once === 'session') sessionStorage.setItem(o.key, '1'); } catch (e) { /* rien */ } close(); });
  const onResize = () => { if (alive && Math.abs(innerWidth - W) > 40) close(); };
  addEventListener('resize', onResize);
  raf = requestAnimationFrame(frame);
  return () => { removeEventListener('resize', onResize); close(); };
}
