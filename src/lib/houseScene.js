import * as THREE from 'three';

export function mountHouseScene(els) {
  let dispose = () => {};
  let disposed = false;
  let rafId = 0;

const V3 = THREE.Vector3;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const UP = new V3(0, 1, 0), _a = new V3(), _b = new V3(), _t = new V3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new V3(1, 1, 1);
function placeBone(m, A, B) {
  _a.subVectors(B, A); const len = _a.length();
  m.position.copy(A).addScaledVector(_a, .5);
  if (len > 1e-6) m.quaternion.setFromUnitVectors(UP, _a.multiplyScalar(1 / len));
  return len;
}
function placeStretch(m, A, B) { const len = placeBone(m, A, B); m.scale.set(1, len, 1); }

const stage = els.stage;
const cv = els.canvas;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = Math.min(screen.width, screen.height) < 700;
const TS = small ? 384 : 640;
const Q = small ? 0.32 : 0.5;
const tick = () => new Promise(r => requestAnimationFrame(r));

/* ---------- Dimensions (mètres) ---------- */
const W = 4.6, H = 2.6, G = 1.4, D = 3.4, HZ = -1.0, FH = H + G;
const TAN = G / (W / 2), ALPHA = Math.atan(TAN), RT = .12, OV = .35, DR = D + .5;
const RUN = W / 2 + OV, RL = RUN / Math.cos(ALPHA), EAVEY = H + G - RUN * TAN;
const FRONTZ = HZ + D / 2, BACKZ = HZ - D / 2, TW = 10, TD = 8, SOC = .42;
const roofTopY = x => H + G - Math.abs(x) * TAN + RT / Math.cos(ALPHA);
const FAC = { win: [{ x: .55, y: 1.0, w: .74, h: 1.1 }, { x: 3.31, y: 1.0, w: .74, h: 1.1 }], door: { x: 1.85, w: .9, h: 2.15 }, oc: { x: 2.3, y: 3.08, r: .24 } };
const WALLWIN = { x: 1.33, y: 1.0, w: .74, h: 1.1 };
const POTS = [{ x: -2.8, z: FRONTZ + .55, r: .3 }, { x: 2.8, z: FRONTZ + .55, r: .3 }, { x: -.8, z: FRONTZ + .32, r: .18 }, { x: .8, z: FRONTZ + .32, r: .18 }];
const MACH = { x: 3.75, z: 3.1 };

/* ---------- Peinture procédurale ---------- */
function grain(ctx, w, h, n, a) {
  n = Math.max(80, (n * Q) | 0);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = Math.random() < .5 ? `rgba(0,0,0,${Math.random() * a})` : `rgba(255,255,255,${Math.random() * a})`;
    const s = Math.random() * 2 * w / 1024 + .6; ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}
function blob(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function ao(ctx, path, blur, a) {
  ctx.save(); ctx.shadowColor = `rgba(28,20,10,${a})`; ctx.shadowBlur = blur; ctx.fillStyle = `rgba(28,20,10,${a})`;
  ctx.beginPath(); path(); ctx.fill(); ctx.restore();
}
/* Mur enduit à la chaux : chaînes d'angle, soubassement, occlusion au sol. mode 'c' = couleur, 'b' = relief */
function wallBase(ctx, w, h, s, wallH, mode) {
  const C = mode === 'c';
  ctx.fillStyle = C ? '#E4D4B6' : '#808080'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 110; i++) blob(ctx, rand(0, w), rand(0, h), rand(.12, .7) * s, Math.random() < .5 ? (C ? '255,248,232' : '255,255,255') : (C ? '150,124,88' : '0,0,0'), C ? rand(.03, .08) : rand(.04, .1));
  grain(ctx, w, h, w * h / 30, C ? .07 : .22);
  const y0 = h - wallH * s, yS = h - SOC * s;
  for (const [edge, dir] of [[0, 1], [w, -1]]) {
    let y = yS, k = 0;
    while (y > y0 + 2) {
      const bh = Math.min(.25 * s, y - y0), bw = (k % 2 ? .26 : .4) * s, x = dir > 0 ? edge : edge - bw;
      ctx.fillStyle = C ? `hsl(${rand(36, 42)},${rand(18, 26)}%,${rand(77, 83)}%)` : '#a6a6a6'; ctx.fillRect(x, y - bh + 2, bw, bh - 4);
      ctx.fillStyle = C ? 'rgba(60,40,20,.18)' : '#3a3a3a'; ctx.fillRect(x, y - 2.5, bw, 2.5); ctx.fillRect(dir > 0 ? x + bw - 2 : x, y - bh, 2.5, bh);
      y -= bh; k++;
    }
  }
  ctx.fillStyle = C ? '#CDBFA4' : '#8c8c8c'; ctx.fillRect(0, yS, w, SOC * s);
  ctx.strokeStyle = C ? 'rgba(110,92,66,.55)' : '#2e2e2e'; ctx.lineWidth = Math.max(1.5, 2.5 * w / 1024);
  const rh = .21 * s, bw = .48 * s; let r = 0;
  for (let y = yS; y < h; y += rh, r++) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    for (let x = (r % 2) * bw / 2; x < w; x += bw) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, Math.min(h, y + rh)); ctx.stroke(); }
  }
  ctx.fillStyle = C ? '#BFAF92' : '#b0b0b0'; ctx.fillRect(0, yS - .04 * s, w, .04 * s);
  if (C) {
    const g = ctx.createLinearGradient(0, h, 0, h - .3 * s); g.addColorStop(0, 'rgba(30,22,12,.4)'); g.addColorStop(1, 'rgba(30,22,12,0)');
    ctx.fillStyle = g; ctx.fillRect(0, h - .3 * s, w, .3 * s);
  }
}
function glass(ctx, x, y, w, h, s, mode) {
  if (mode !== 'c') { ctx.fillStyle = '#3c3c3c'; ctx.fillRect(x - .02 * s, y - .02 * s, w + .04 * s, h + .04 * s); return; }
  ctx.fillStyle = '#B9A887'; ctx.fillRect(x - .03 * s, y - .03 * s, w + .06 * s, h + .06 * s);
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#8FA6B0'); g.addColorStop(.45, '#4B6470'); g.addColorStop(1, '#1C2E36');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(236,230,214,.28)'; ctx.fillRect(x + .04 * s, y + .04 * s, w - .08 * s, h * .3);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath();
  ctx.moveTo(x, y + h * .6); ctx.lineTo(x + w * .6, y); ctx.lineTo(x + w * .8, y); ctx.lineTo(x, y + h * .85); ctx.closePath(); ctx.fill();
  ctx.restore();
  const sg = ctx.createLinearGradient(x, y, x, y + .1 * s); sg.addColorStop(0, 'rgba(0,0,0,.45)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, .1 * s);
}
function door(ctx, x, y, w, h, s, mode) {
  if (mode !== 'c') {
    ctx.fillStyle = '#5a5a5a'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#2a2a2a'; for (let i = 1; i < 6; i++) ctx.fillRect(x + w * i / 6 - 1, y, 2.5, h);
    return;
  }
  ctx.fillStyle = '#2C5767'; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${rand(.03, .08)})`; ctx.fillRect(x + w * i / 6, y, w / 6, h); }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 6; i++) ctx.fillRect(x + w * i / 6 - 1, y, 2, h);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y + h * .3, w, .05 * s); ctx.fillRect(x, y + h * .75, w, .05 * s);
  ctx.fillStyle = '#2a2a2a'; for (const yy of [.3, .75]) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x + w * (i + .5) / 6, y + h * yy + .025 * s, .008 * s, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#C2A36E'; ctx.fillRect(x + w - .14 * s, y + h * .5, .03 * s, .14 * s);
  const sg = ctx.createLinearGradient(x, y, x, y + .12 * s); sg.addColorStop(0, 'rgba(0,0,0,.5)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, .12 * s);
}
const facadePaint = mode => (ctx, w, h) => {
  const s = w / W;
  wallBase(ctx, w, h, s, H, mode);
  const yc = h - H * s;
  if (mode === 'c') {
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(0, yc, w, .03 * s);
    ctx.fillStyle = '#D8C6A4'; ctx.fillRect(0, yc - .08 * s, w, .08 * s);
    ctx.save(); ctx.strokeStyle = 'rgba(30,22,12,.07)';
    for (let i = 0; i < 7; i++) { ctx.lineWidth = (.04 + i * .05) * s; ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(w / 2, 0); ctx.lineTo(w, yc); ctx.stroke(); }
    ctx.restore();
  } else { ctx.fillStyle = '#b4b4b4'; ctx.fillRect(0, yc - .08 * s, w, .08 * s); }
  for (const wi of FAC.win) glass(ctx, wi.x * s, h - (wi.y + wi.h) * s, wi.w * s, wi.h * s, s, mode);
  door(ctx, FAC.door.x * s, h - FAC.door.h * s, FAC.door.w * s, FAC.door.h * s, s, mode);
  const ox = FAC.oc.x * s, oy = h - FAC.oc.y * s, orr = FAC.oc.r * s;
  if (mode === 'c') {
    const g = ctx.createLinearGradient(ox, oy - orr, ox, oy + orr); g.addColorStop(0, '#8FA6B0'); g.addColorStop(1, '#1C2E36');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, orr, 0, 7); ctx.fill();
  } else { ctx.fillStyle = '#3c3c3c'; ctx.beginPath(); ctx.arc(ox, oy, orr, 0, 7); ctx.fill(); }
};
const wallPaint = mode => (ctx, w, h) => {
  const s = w / D;
  wallBase(ctx, w, h, s, H, mode);
  glass(ctx, WALLWIN.x * s, h - (WALLWIN.y + WALLWIN.h) * s, WALLWIN.w * s, WALLWIN.h * s, s, mode);
  if (mode === 'c') {
    const g = ctx.createLinearGradient(0, 0, 0, .45 * s); g.addColorStop(0, 'rgba(30,22,12,.42)'); g.addColorStop(1, 'rgba(30,22,12,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, .45 * s);
  }
};
function grime(ctx, w, h, s, sills) {
  ctx.fillStyle = 'rgba(92,86,62,.36)'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 170; i++) blob(ctx, rand(0, w), rand(0, h), rand(.12, .5) * s, pick(['80,78,54', '62,62,50', '96,104,62', '70,84,46']), rand(.1, .28));
  const band = 1.0 * s;
  const g = ctx.createLinearGradient(0, h, 0, h - band); g.addColorStop(0, 'rgba(58,70,40,.7)'); g.addColorStop(1, 'rgba(58,70,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, h - band, w, band);
  for (let i = 0; i < 120; i++) blob(ctx, rand(0, w), h - rand(0, .5) * s, rand(.04, .16) * s, '64,86,42', rand(.3, .6));
  const streak = (x, y, len, ww, a) => { const gg = ctx.createLinearGradient(0, y, 0, y + len); gg.addColorStop(0, `rgba(44,44,34,${a})`); gg.addColorStop(1, 'rgba(44,44,34,0)'); ctx.fillStyle = gg; ctx.fillRect(x, y, ww, len); };
  for (const sl of sills) for (let k = 0; k < 14; k++) streak(sl.x + rand(0, sl.w), sl.y, rand(.25, .9) * s, rand(.006, .03) * s, .5);
  for (let k = 0; k < 60; k++) streak(rand(0, w), rand(0, h * .6), rand(.2, 1.3) * s, rand(.005, .018) * s, .24);
  for (let i = 0; i < w * 2.6; i++) { ctx.fillStyle = `rgba(32,36,28,${rand(.12, .45)})`; const r = rand(.6, 2.2) * w / 1024; ctx.fillRect(rand(0, w), rand(0, h), r, r); }
}
function dirtFacade(ctx, w, h) {
  const s = w / W;
  const sills = FAC.win.map(wi => ({ x: wi.x * s, y: h - wi.y * s + .07 * s, w: wi.w * s }));
  sills.push({ x: 0, y: h - H * s, w });
  grime(ctx, w, h, s, sills);
  ctx.strokeStyle = 'rgba(50,50,40,.09)';
  for (let i = 0; i < 7; i++) { ctx.lineWidth = (.06 + i * .06) * s; ctx.beginPath(); ctx.moveTo(0, h - H * s); ctx.lineTo(w / 2, 0); ctx.lineTo(w, h - H * s); ctx.stroke(); }
}
function clipFacade(ctx, w, h) {
  const s = w / W; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w, h - H * s); ctx.lineTo(w / 2, 0); ctx.lineTo(0, h - H * s); ctx.closePath(); ctx.clip();
}
function dirtWall(ctx, w, h) {
  const s = w / D;
  grime(ctx, w, h, s, [{ x: WALLWIN.x * s, y: h - WALLWIN.y * s + .07 * s, w: WALLWIN.w * s }]);
  const g = ctx.createLinearGradient(0, 0, 0, .6 * s); g.addColorStop(0, 'rgba(48,50,38,.55)'); g.addColorStop(1, 'rgba(48,50,38,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, .6 * s);
}
/* Tuiles canal provençales : couvrantes bombées et courants creux, rangs qui se chevauchent */
const roofPaint = (eaveLeft, mode) => (ctx, w, h) => {
  const C = mode === 'c', su = w / RL, sv = h / DR, bw = .155 * sv, cl = .4 * su;
  const nb = Math.ceil(h / bw), nc = Math.ceil(w / cl) + 2;
  ctx.fillStyle = C ? '#6E3520' : '#404040'; ctx.fillRect(0, 0, w, h);
  for (let b = 0; b < nb; b++) {
    const y = b * bw, cover = b % 2 === 0;
    if (C) for (let c = 0; c < nc; c++) {
      ctx.fillStyle = `hsl(${rand(13, 27)},${rand(40, 58)}%,${cover ? rand(42, 54) : rand(32, 42)}%)`;
      ctx.fillRect(c * cl - cl * .5, y, cl + 1, bw + 1);
    }
    const g = ctx.createLinearGradient(0, y, 0, y + bw);
    if (C) {
      if (cover) { g.addColorStop(0, 'rgba(40,10,0,.5)'); g.addColorStop(.42, 'rgba(255,224,190,.2)'); g.addColorStop(1, 'rgba(40,10,0,.55)'); }
      else { g.addColorStop(0, 'rgba(255,210,170,.06)'); g.addColorStop(.5, 'rgba(28,8,0,.45)'); g.addColorStop(1, 'rgba(255,210,170,.05)'); }
    } else {
      if (cover) { g.addColorStop(0, '#383838'); g.addColorStop(.5, '#e0e0e0'); g.addColorStop(1, '#383838'); }
      else { g.addColorStop(0, '#707070'); g.addColorStop(.5, '#1c1c1c'); g.addColorStop(1, '#707070'); }
    }
    ctx.fillStyle = g; ctx.fillRect(0, y, w, bw);
  }
  for (let k = 0; k < nc; k++) {
    const xk = k * cl - cl * .5, sw = .08 * su;
    const g = eaveLeft ? ctx.createLinearGradient(xk, 0, xk - sw, 0) : ctx.createLinearGradient(xk, 0, xk + sw, 0);
    g.addColorStop(0, C ? 'rgba(20,5,0,.6)' : 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(eaveLeft ? xk - sw : xk, 0, sw, h);
    ctx.fillStyle = C ? 'rgba(255,226,192,.3)' : 'rgba(255,255,255,.7)'; ctx.fillRect(eaveLeft ? xk : xk - 2.5, 0, 2.5, h);
  }
  grain(ctx, w, h, w * h / 35, C ? .1 : .2);
};
function dirtRoof(ctx, w, h) {
  const su = w / RL, sv = h / DR, bw = .155 * sv, cl = .4 * su;
  ctx.fillStyle = 'rgba(56,62,40,.42)'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < (900 * Q) | 0; i++) {
    const b = 1 + 2 * Math.floor(rand(0, h / bw / 2));
    blob(ctx, rand(0, w), b * bw + rand(.15, .85) * bw, rand(.02, .075) * su, pick(['86,114,46', '70,98,38', '112,132,58', '58,80,34']), rand(.5, .9));
  }
  for (let k = 0; k < w / cl + 2; k++) { const xk = k * cl - cl * .5; for (let i = 0; i < (22 * Q) | 0; i++) blob(ctx, xk + rand(-.05, .05) * su, rand(0, h), rand(.03, .08) * su, pick(['86,114,46', '70,98,38']), rand(.45, .85)); }
  for (let i = 0; i < (500 * Q) | 0; i++) { ctx.fillStyle = `rgba(${pick(['214,206,140', '190,186,120', '228,226,204'])},${rand(.5, .9)})`; ctx.beginPath(); ctx.arc(rand(0, w), rand(0, h), rand(.005, .018) * su, 0, 7); ctx.fill(); }
  for (let i = 0; i < w * 0.8 * Q; i++) { ctx.fillStyle = `rgba(22,24,18,${rand(.25, .55)})`; const r = rand(.8, 2.6) * w / 1024; ctx.fillRect(rand(0, w), rand(0, h), r, r); }
}
function slabGrid(w, h, fn) {
  const su = w / TW, sv = h / TD, sw = 1.2 * su, sd = .6 * sv; let r = 0;
  for (let y = 0; y < h; y += sd, r++) for (let x = -(r % 2) * sw / 2; x < w; x += sw) fn(x, y, sw, sd, r);
}
const terracePaint = mode => (ctx, w, h) => {
  const C = mode === 'c', su = w / TW, sv = h / TD;
  ctx.fillStyle = C ? '#B3A891' : '#2c2c2c'; ctx.fillRect(0, 0, w, h);
  slabGrid(w, h, (x, y, sw, sd) => {
    if (C) {
      ctx.fillStyle = `hsl(${rand(34, 42)},${rand(15, 24)}%,${rand(79, 87)}%)`; ctx.fillRect(x + 2, y + 2, sw - 4, sd - 4);
      for (let k = 0; k < 4; k++) blob(ctx, x + rand(0, sw), y + rand(0, sd), rand(.05, .22) * su, pick(['176,150,114', '226,216,196']), rand(.05, .13));
      ctx.fillStyle = 'rgba(120,98,66,.35)';
      for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(x + rand(0, sw), y + rand(0, sd), rand(.004, .014) * su, rand(.002, .006) * su, 0, 0, 7); ctx.fill(); }
    } else { const l = rand(150, 180) | 0; ctx.fillStyle = `rgb(${l},${l},${l})`; ctx.fillRect(x + 2, y + 2, sw - 4, sd - 4); }
  });
  grain(ctx, w, h, w * h / 35, C ? .06 : .18);
  const b = .22 * su;
  ctx.strokeStyle = C ? '#EDE6D9' : '#bdbdbd'; ctx.lineWidth = b; ctx.strokeRect(b / 2, b / 2, w - b, h - b);
  ctx.strokeStyle = C ? 'rgba(0,0,0,.14)' : '#202020'; ctx.lineWidth = 2; ctx.strokeRect(b, b, w - 2 * b, h - 2 * b);
  if (C) {
    const fx0 = (-W / 2 + TW / 2) * su, fx1 = (W / 2 + TW / 2) * su, fy0 = (BACKZ + TD / 2) * sv, fy1 = (FRONTZ + TD / 2) * sv;
    ao(ctx, () => ctx.rect(fx0, fy0, fx1 - fx0, fy1 - fy0), .4 * su, .55);
    for (const p of POTS) ao(ctx, () => ctx.arc((p.x + TW / 2) * su, (p.z + TD / 2) * sv, p.r * su, 0, 7), .18 * su, .55);
    ao(ctx, () => ctx.rect((MACH.x + TW / 2 - .25) * su, (MACH.z + TD / 2 - .2) * sv, .5 * su, .4 * sv), .15 * su, .4);
  }
};
function dirtTerrace(ctx, w, h) {
  const su = w / TW;
  ctx.fillStyle = 'rgba(62,64,50,.58)'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 280; i++) blob(ctx, rand(0, w), rand(0, h), rand(.2, .9) * su, pick(['60,66,48', '78,88,58', '44,46,40']), rand(.12, .32));
  ctx.strokeStyle = 'rgba(66,96,46,.7)'; ctx.lineWidth = Math.max(2, 5 * w / 1024);
  slabGrid(w, h, (x, y, sw, sd) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y); ctx.moveTo(x, y); ctx.lineTo(x, y + sd); ctx.stroke(); });
  for (let i = 0; i < w * 3.2; i++) { ctx.fillStyle = `rgba(24,26,22,${rand(.3, .75)})`; ctx.beginPath(); ctx.arc(rand(0, w), rand(0, h), rand(.6, 3.4) * w / 1024, 0, 7); ctx.fill(); }
}
function clipTerrace(ctx, w, h) {
  const su = w / TW, sv = h / TD;
  ctx.beginPath(); ctx.rect(0, 0, w, h);
  const x0 = (-W / 2 + TW / 2) * su, x1 = (W / 2 + TW / 2) * su, y0 = (BACKZ + TD / 2) * sv, y1 = (FRONTZ + TD / 2) * sv;
  ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip('evenodd');
}

/* ---------- Surface salissable : le mélange propre/sale se fait dans le shader ---------- */
const NOISE = `
uniform sampler2D uDirt; uniform sampler2D uMask; uniform float uFade; uniform vec2 uNS;
float fcH(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float fcN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(fcH(i), fcH(i + vec2(1.0, 0.0)), f.x), mix(fcH(i + vec2(0.0, 1.0)), fcH(i + vec2(1.0, 1.0)), f.x), f.y); }
`;
class Surface {
  constructor(o) {
    Object.assign(this, o);
    const mk = (fn, w, h, srgb) => {
      const c = mkCanvas(w, h); fn(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t;
    };
    this.cleanTex = mk(o.paint('c'), o.w, o.h, true);
    this.bumpTex = mk(o.paint('b'), o.w, o.h, false);
    this.dirtTex = mk((c, w, h) => { c.save(); if (o.clip) o.clip(c, w, h); o.dirt(c, w, h); c.restore(); }, o.w, o.h, true);
    const n = o.mw * o.mh;
    this.data = new Uint8Array(n * 4); this.weight = new Float32Array(n);
    const wc = mkCanvas(o.mw, o.mh), wx = wc.getContext('2d', { willReadFrequently: true });
    wx.fillStyle = '#fff';
    if (o.clip) { wx.save(); o.clip(wx, o.mw, o.mh); wx.fillRect(0, 0, o.mw, o.mh); wx.restore(); } else wx.fillRect(0, 0, o.mw, o.mh);
    const wd = wx.getImageData(0, 0, o.mw, o.mh).data; let tot = 0;
    for (let y = 0; y < o.mh; y++) for (let x = 0; x < o.mw; x++) { const a = wd[((o.mh - 1 - y) * o.mw + x) * 4 + 3] / 255; this.weight[y * o.mw + x] = a; tot += a; }
    this.total = tot * 255;
    this.maskTex = new THREE.DataTexture(this.data, o.mw, o.mh, THREE.RGBAFormat);
    this.maskTex.magFilter = this.maskTex.minFilter = THREE.LinearFilter; this.maskTex.generateMipmaps = false;
    this.fade = { value: 1 };
    this.mat = new THREE.MeshStandardMaterial({ map: this.cleanTex, bumpMap: this.bumpTex, bumpScale: o.bump, roughness: o.rough });
    this.mat.onBeforeCompile = sh => {
      sh.uniforms.uDirt = { value: this.dirtTex }; sh.uniforms.uMask = { value: this.maskTex };
      sh.uniforms.uFade = this.fade; sh.uniforms.uNS = { value: new THREE.Vector2(o.wu * 7, o.wv * 7) };
      sh.fragmentShader = NOISE + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
          vec4 dTx = texture2D(uDirt, vMapUv);
          vec4 mk = texture2D(uMask, vMapUv);
          float nz = fcN(vMapUv * uNS) * 0.65 + fcN(vMapUv * uNS * 3.7) * 0.35;
          float edge = smoothstep(0.0, 1.0, mk.r * 1.6 - nz * 0.6);
          float dAmt = dTx.a * edge * uFade;
          diffuseColor.rgb = mix(diffuseColor.rgb, dTx.rgb, dAmt);
          float wet = mk.g;
          diffuseColor.rgb *= 1.0 - wet * 0.34;`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor, 0.16, wet * 0.92);
          roughnessFactor = min(1.0, roughnessFactor + dAmt * 0.06);`);
    };
    this.mat.customProgramCacheKey = () => 'fc-dirt';
    this.reset();
  }
  reset() {
    const d = this.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = 255; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255; }
    this.sum = this.total; this.wetOn = false; this.wacc = 0; this.pct = 0; this.maskTex.needsUpdate = true;
  }
  stamp(u, v, k) {
    const mw = this.mw, mh = this.mh, cx = u * mw, cy = v * mh, ru = this.brush * mw / this.wu, rv = this.brush * mh / this.wv;
    const x0 = Math.max(0, Math.floor(cx - ru)), x1 = Math.min(mw - 1, Math.ceil(cx + ru));
    const y0 = Math.max(0, Math.floor(cy - rv)), y1 = Math.min(mh - 1, Math.ceil(cy + rv));
    const d = this.data, wt = this.weight; let sum = this.sum;
    for (let y = y0; y <= y1; y++) {
      const dy = (y + .5 - cy) / rv;
      for (let x = x0; x <= x1; x++) {
        const dx = (x + .5 - cx) / ru, q = dx * dx + dy * dy;
        if (q >= 1) continue;
        const f = q < .35 ? 1 : (1 - q) / .65, i = y * mw + x, j = i * 4, r = d[j], nr = (r * (1 - k * f)) | 0;
        sum -= (r - nr) * wt[i]; d[j] = nr;
        const g = (240 * f) | 0; if (g > d[j + 1]) d[j + 1] = g;
      }
    }
    if (this.drip) {
      for (let s = 0; s < 2; s++) {
        const sx = Math.round(cx + (Math.random() * 2 - 1) * ru * .8); if (sx < 1 || sx >= mw - 1) continue;
        const len = Math.round(rand(.3, .9) * mh / this.wv), sy = Math.round(cy - rv * .5);
        for (let t = 0; t < len; t++) {
          const y = sy - t; if (y < 0) break;
          const g = (175 * (1 - t / len)) | 0;
          for (let o = 0; o < 2; o++) { const j = (y * mw + sx + o) * 4; if (g > d[j + 1]) d[j + 1] = g; }
        }
      }
    }
    this.sum = sum; this.dirty = true; this.wetOn = true;
    this.pct = clamp((1 - this.sum / this.total) / .94, 0, 1);
  }
  tick(dt) {
    if (this.wetOn) {
      this.wacc += dt * 52;
      const dec = this.wacc | 0;
      if (dec > 0) {
        this.wacc -= dec; const d = this.data; let any = false;
        for (let j = 1; j < d.length; j += 4) { const g = d[j]; if (g) { const n = g - dec; d[j] = n > 0 ? n : 0; any = true; } }
        this.wetOn = any; this.dirty = true;
      }
    }
    if (this.dirty) { this.maskTex.needsUpdate = true; this.dirty = false; }
  }
}
let ANISO = 8;

/* ---------- Démarrage ---------- */
async function start() {
  if (disposed) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }
  ANISO = Math.min(small ? 2 : 4, renderer.capabilities.getMaxAnisotropy());
  const dprMax = Math.min(devicePixelRatio, small ? 1.15 : 1.35);
  let dpr = 1;
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0xffffff, 1);
  {
    const box = stage.getBoundingClientRect();
    if (box.width && box.height) renderer.setSize(box.width, box.height, false);
    renderer.clear();
  }
  dispose = () => { disposed = true; cancelAnimationFrame(rafId); renderer.dispose(); };
  await tick();
  if (disposed) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .5, 120);

  // Lumière d'environnement : ciel provençal, horizon clair, sol chaud, soleil
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 12), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vP; void main(){ float h = vP.y; vec3 top = vec3(.42,.6,.86); vec3 hor = vec3(1.0,.98,.94); vec3 gr = vec3(.34,.31,.27);
        vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h, 0.0, 1.0), .5)) : mix(hor * .85, gr, pow(clamp(-h, 0.0, 1.0), .35)); gl_FragColor = vec4(c, 1.0); }`
    })));
    scene.environment = pmrem.fromScene(env, .08).texture;
    pmrem.dispose();
  }
  await tick();
  if (disposed) return;
  const sun = new THREE.DirectionalLight(0xFFF0DC, 2.6);
  sun.position.set(7, 13, 9); sun.castShadow = true;
  const SM = small ? 384 : 512;
  sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -7.2, right: 7.2, top: 7.2, bottom: -7.2, near: 2, far: 32 });
  sun.shadow.bias = -.0003; sun.shadow.normalBias = .025;
  scene.add(sun);

  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o });
  const shadowed = m => { m.castShadow = true; m.receiveShadow = true; return m; };

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: .18 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -.6; catcher.receiveShadow = true; scene.add(catcher);

  const MS = small ? 128 : 192;
  const S = {
    facade: new Surface({ w: TS, h: Math.round(TS * FH / W), wu: W, wv: FH, mw: MS, mh: Math.round(MS * FH / W), brush: .28, bump: 1.2, rough: .92, drip: true, paint: facadePaint, dirt: dirtFacade, clip: clipFacade }),
    wallL: new Surface({ w: TS, h: Math.round(TS * H / D), wu: D, wv: H, mw: MS, mh: Math.round(MS * H / D), brush: .28, bump: 1.2, rough: .92, drip: true, paint: wallPaint, dirt: dirtWall }),
    wallR: new Surface({ w: TS, h: Math.round(TS * H / D), wu: D, wv: H, mw: MS, mh: Math.round(MS * H / D), brush: .28, bump: 1.2, rough: .92, drip: true, paint: wallPaint, dirt: dirtWall }),
  };
  await tick();
  if (disposed) return;
  S.roofL = new Surface({ w: TS, h: TS, wu: RL, wv: DR, mw: MS, mh: MS, brush: .26, bump: 3.2, rough: .78, drip: false, paint: m => roofPaint(true, m), dirt: dirtRoof });
  S.roofR = new Surface({ w: TS, h: TS, wu: RL, wv: DR, mw: MS, mh: MS, brush: .26, bump: 3.2, rough: .78, drip: false, paint: m => roofPaint(false, m), dirt: dirtRoof });
  S.terrace = new Surface({ w: TS, h: TS, wu: TW, wv: TD, mw: Math.round(MS * 1.25), mh: MS, brush: .44, bump: 1.4, rough: .86, drip: false, paint: terracePaint, dirt: dirtTerrace, clip: clipTerrace });
  const allS = Object.values(S);
  const meshSurf = new Map();
  await tick();
  if (disposed) return;

  // Socle
  const label = mkCanvas(1024, 64); {
    const c = label.getContext('2d');
    c.fillStyle = '#0B3A5C'; c.fillRect(0, 0, 1024, 64);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, 0, 1024, 2);
    c.fillStyle = '#F4F6F5'; c.font = '700 28px Outfit, Arial, sans-serif'; c.textBaseline = 'middle';
    try { c.letterSpacing = '4px'; } catch (e) {}
    c.fillText('FAST & CLEAN', 36, 34);
    c.font = '500 14px "Source Sans 3", Arial, sans-serif'; try { c.letterSpacing = '2px'; } catch (e) {}
    c.fillStyle = 'rgba(244,246,245,.7)'; c.textAlign = 'right';
    c.fillText('NETTOYAGE HAUTE PRESSION · 84130 LE PONTET', 988, 34);
  }
  const labelTex = new THREE.CanvasTexture(label); labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = ANISO;
  const pet = mat(0x05445E, { roughness: .38 }), petTop = mat(0x0A5674, { roughness: .45 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(TW + .4, .6, TD + .4), [pet, pet, petTop, pet, new THREE.MeshStandardMaterial({ map: labelTex, roughness: .38 }), pet]);
  plinth.position.y = -.3; shadowed(plinth); scene.add(plinth);

  const terrace = new THREE.Mesh(new THREE.PlaneGeometry(TW, TD), S.terrace.mat);
  terrace.rotation.x = -Math.PI / 2; terrace.position.y = .002; terrace.receiveShadow = true; scene.add(terrace);
  meshSurf.set(terrace, S.terrace);

  // Maison
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, 0); shape.lineTo(W / 2, 0); shape.lineTo(W / 2, H); shape.lineTo(0, FH); shape.lineTo(-W / 2, H); shape.closePath();
  const fGeo = new THREE.ShapeGeometry(shape);
  { const uv = fGeo.attributes.uv, p = fGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, p.getY(i) / FH); }
  const facade = shadowed(new THREE.Mesh(fGeo, S.facade.mat)); facade.position.z = FRONTZ; scene.add(facade); meshSurf.set(facade, S.facade);
  const back = shadowed(new THREE.Mesh(fGeo, mat(0xE0D0B2, { roughness: .95 }))); back.rotation.y = Math.PI; back.position.z = BACKZ; scene.add(back);
  const wallL = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(D, H), S.wallL.mat)); wallL.rotation.y = -Math.PI / 2; wallL.position.set(-W / 2, H / 2, HZ); scene.add(wallL); meshSurf.set(wallL, S.wallL);
  const wallR = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(D, H), S.wallR.mat)); wallR.rotation.y = Math.PI / 2; wallR.position.set(W / 2, H / 2, HZ); scene.add(wallR); meshSurf.set(wallR, S.wallR);

  const stone = mat(0xD6C7AA, { roughness: .9 }), frameMat = mat(0x2C5767, { roughness: .55 }), terra = mat(0xA4532F, { roughness: .75 });
  const zinc = mat(0x9AA4A8, { roughness: .35, metalness: .75, side: THREE.DoubleSide });
  const louver = mkCanvas(64, 256); {
    const c = louver.getContext('2d'); c.fillStyle = '#5A8492'; c.fillRect(0, 0, 64, 256);
    for (let y = 10; y < 246; y += 9) { c.fillStyle = 'rgba(0,0,0,.32)'; c.fillRect(6, y, 52, 3); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(6, y + 3, 52, 2); }
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.strokeRect(4, 4, 56, 248);
    grain(c, 64, 256, 900, .08);
  }
  const louverTex = new THREE.CanvasTexture(louver); louverTex.colorSpace = THREE.SRGBColorSpace;
  const shutterMat = new THREE.MeshStandardMaterial({ map: louverTex, roughness: .7 });

  function opening(parent, cx, cy, w, h, isDoor) {
    const ft = .055, fd = .06;
    const add = (gw, gh, gd, m, x, y, z) => { const me = shadowed(new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), m)); me.position.set(x, y, z); parent.add(me); return me; };
    add(w + ft * 2, ft, fd, frameMat, cx, cy + h / 2 + ft / 2, fd / 2);
    add(ft, h + ft, fd, frameMat, cx - w / 2 - ft / 2, cy + ft / 2, fd / 2);
    add(ft, h + ft, fd, frameMat, cx + w / 2 + ft / 2, cy + ft / 2, fd / 2);
    add(w + .22, .09, .04, stone, cx, cy + h / 2 + ft + .045, .02);
    if (isDoor) { add(w + .45, .08, .34, stone, cx, .04, .17); return; }
    add(w + ft * 2, ft, fd, frameMat, cx, cy - h / 2 - ft / 2, fd / 2);
    add(.024, h, .03, frameMat, cx, cy, .015);
    add(w, .024, .03, frameMat, cx, cy + h * .08, .015);
    add(w + .24, .055, .14, stone, cx, cy - h / 2 - ft - .028, .07);
    for (const sx of [-1, 1]) {
      const sw = w / 2 + .02;
      const sh = add(sw, h + .06, .03, shutterMat, cx + sx * (w / 2 + ft + sw / 2 + .015), cy, .035);
      sh.rotation.y = sx * .05;
    }
  }
  const fG = new THREE.Group(); fG.position.z = FRONTZ; scene.add(fG);
  for (const wi of FAC.win) opening(fG, wi.x + wi.w / 2 - W / 2, wi.y + wi.h / 2, wi.w, wi.h, false);
  opening(fG, 0, FAC.door.h / 2, FAC.door.w, FAC.door.h, true);
  { const t = shadowed(new THREE.Mesh(new THREE.TorusGeometry(FAC.oc.r + .02, .035, 10, 36), frameMat)); t.position.set(0, FAC.oc.y, .025); fG.add(t);
    const t2 = shadowed(new THREE.Mesh(new THREE.TorusGeometry(FAC.oc.r + .09, .04, 8, 36), stone)); t2.position.set(0, FAC.oc.y, .015); fG.add(t2); }
  for (const wall of [wallL, wallR]) {
    const g = new THREE.Group(); g.position.copy(wall.position); g.rotation.copy(wall.rotation); scene.add(g);
    opening(g, WALLWIN.x + WALLWIN.w / 2 - D / 2, WALLWIN.y + WALLWIN.h / 2 - H / 2, WALLWIN.w, WALLWIN.h, false);
  }
  for (const x of [-W / 2, W / 2]) for (const z of [FRONTZ, BACKZ]) {
    const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.06, H, .06), stone)); t.position.set(x, H / 2, z); scene.add(t);
  }

  // Toiture
  const edgeMat = mat(0x7A3E25, { roughness: .8 }), underMat = mat(0xC9B697, { roughness: .95 });
  const slopes = [];
  for (const side of [-1, 1]) {
    const surf = side < 0 ? S.roofL : S.roofR;
    const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(RL, RT, DR), [edgeMat, edgeMat, surf.mat, underMat, edgeMat, edgeMat]));
    const n = new V3(side * Math.sin(ALPHA), Math.cos(ALPHA), 0);
    m.position.set(side * RUN / 2 + n.x * RT / 2, (FH + EAVEY) / 2 + n.y * RT / 2, HZ);
    m.rotation.z = side < 0 ? ALPHA : -ALPHA;
    m.userData.box = true; m.userData.ridgeSign = side < 0 ? 1 : -1;
    scene.add(m); meshSurf.set(m, surf); slopes.push(m); m.updateMatrixWorld(true);
    // génoise provençale
    const g1 = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.2, .1, DR - .3), terra)); g1.position.set(side * (W / 2 + .1), H - .05, HZ); scene.add(g1);
    const g2 = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.11, .09, DR - .4), stone)); g2.position.set(side * (W / 2 + .055), H - .145, HZ); scene.add(g2);
    // gouttière et descente
    const gu = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, DR, 14, 1, true, -Math.PI / 2, Math.PI), zinc));
    gu.rotation.x = Math.PI / 2; gu.position.set(side * (RUN + .02), EAVEY - .02, HZ); scene.add(gu);
    const dp = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1, 12), zinc));
    placeStretch(dp, new V3(side * (W / 2 + .07), .05, FRONTZ - .14), new V3(side * (W / 2 + .07), EAVEY - .3, FRONTZ - .14)); scene.add(dp);
    const dc = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1, 12), zinc));
    placeStretch(dc, new V3(side * (RUN + .02), EAVEY - .06, FRONTZ - .14), new V3(side * (W / 2 + .07), EAVEY - .32, FRONTZ - .14)); scene.add(dc);
  }
  { const r = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, DR + .06, 14, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0xA75A36, roughness: .75, side: THREE.DoubleSide })));
    r.rotation.x = Math.PI / 2; r.position.set(0, FH + RT * .95, HZ); scene.add(r); }
  const chimney = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.42, 1.2, .42), mat(0xDDCDB0, { roughness: .95 })));
  chimney.position.set(1.05, roofTopY(1.05) + .3, HZ - .9); scene.add(chimney);
  { const slab = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.52, .05, .52), stone)); slab.position.set(1.05, chimney.position.y + .62, HZ - .9); scene.add(slab);
    const hat = shadowed(new THREE.Mesh(new THREE.ConeGeometry(.33, .16, 4), terra)); hat.rotation.y = Math.PI / 4; hat.position.set(1.05, chimney.position.y + .73, HZ - .9); scene.add(hat); }

  // Pots : oliviers et lavandes
  const potMat = mat(0xB0643F, { roughness: .85 }), soil = mat(0x3B3128, { roughness: 1 });
  const potGeo = (r, h) => new THREE.LatheGeometry([new THREE.Vector2(r * .55, 0), new THREE.Vector2(r * .62, .02), new THREE.Vector2(r * .92, h * .9), new THREE.Vector2(r, h * .93), new THREE.Vector2(r, h), new THREE.Vector2(r * .9, h)], 28);
  const leafMat = new THREE.MeshStandardMaterial({ roughness: .85, flatShading: true, envMapIntensity: .5 });
  const leafGeo = new THREE.IcosahedronGeometry(.06, 0);
  const col = new THREE.Color();
  for (const p of POTS) {
    const big = p.r > .25, ph = big ? .5 : .3;
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    g.add(shadowed(new THREE.Mesh(potGeo(p.r, ph), potMat)));
    const so = new THREE.Mesh(new THREE.CircleGeometry(p.r * .9, 20), soil); so.rotation.x = -Math.PI / 2; so.position.y = ph - .02; g.add(so);
    if (big) {
      const trunkM = mat(0x6B5F50, { roughness: .95 });
      const pts = [new V3(0, ph - .02, 0), new V3(.05, ph + .35, .03), new V3(-.04, ph + .7, -.02), new V3(.02, ph + .95, .04)];
      for (let i = 0; i < 3; i++) { const t = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.04 - i * .008, .05 - i * .008, 1, 8), trunkM)); placeStretch(t, pts[i], pts[i + 1]); g.add(t); }
      const N = small ? 160 : 260, im = new THREE.InstancedMesh(leafGeo, leafMat, N); im.castShadow = true; im.receiveShadow = true;
      const centers = [new V3(0, ph + 1.05, 0), new V3(.22, ph + .95, .1), new V3(-.2, ph + .98, -.08), new V3(.05, ph + 1.25, -.05), new V3(-.1, ph + .85, .18)];
      for (let i = 0; i < N; i++) {
        const c = pick(centers); _t.set(rand(-1, 1), rand(-.7, .7), rand(-1, 1)).multiplyScalar(.2).add(c);
        _q.setFromEuler(new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6))); const sc = rand(.7, 1.4); _s.set(sc, sc * .7, sc * 1.3);
        _m.compose(_t, _q, _s); im.setMatrixAt(i, _m);
        im.setColorAt(i, col.set(pick([0x55633F, 0x66744E, 0x4A5838, 0x77845E])));
      }
      g.add(im);
    } else {
      const N = 70, stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(.005, .006, 1, 4), mat(0x7C8A6E), N);
      const flowers = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.014, .06, 2, 6), mat(0x8576B8, { roughness: .8 }), N);
      for (let i = 0; i < N; i++) {
        const a = rand(0, 6.28), r = Math.sqrt(Math.random()) * p.r * .75;
        _a.set(Math.cos(a) * r, ph, Math.sin(a) * r); _b.set(_a.x * 1.6, ph + rand(.2, .32), _a.z * 1.6);
        const len = _t.subVectors(_b, _a).length(); _q.setFromUnitVectors(UP, _t.normalize());
        _m.compose(_t.addVectors(_a, _b).multiplyScalar(.5), _q, _s.set(1, len, 1)); stems.setMatrixAt(i, _m);
        _m.compose(_b, _q, _s.set(1, 1, 1)); flowers.setMatrixAt(i, _m);
        flowers.setColorAt(i, col.set(pick([0x8576B8, 0x7566A8, 0x9888C8])));
      }
      stems.castShadow = flowers.castShadow = true; g.add(stems, flowers);
    }
  }
  // Échelle
  const alu = mat(0xB4BCBF, { roughness: .35, metalness: .7 });
  const LADA = new V3(3.12, 0, .28), LADB = new V3(2.36, 2.32, .28);
  for (const dz of [-.21, .21]) { const r = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.03, 1, .06), alu)); placeStretch(r, LADA.clone().setZ(.28 + dz), LADB.clone().setZ(.28 + dz)); scene.add(r); }
  for (let k = 1; k < 9; k++) { const p = LADA.clone().lerp(LADB, k / 9); const r = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .42, 8), alu)); r.rotation.x = Math.PI / 2; r.position.copy(p); scene.add(r); }
  // Nettoyeur haute pression
  const machine = new THREE.Group(); machine.position.set(MACH.x, 0, MACH.z); machine.rotation.y = -.5; scene.add(machine);
  {
    const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.5, .34, .36), mat(0x1B7A8F, { roughness: .35 }))); body.position.y = .3; machine.add(body);
    const top = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.46, .06, .32), mat(0x1F2B31, { roughness: .5 }))); top.position.y = .49; machine.add(top);
    for (const x of [-.2, .2]) { const wh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .07, 20), mat(0x1A1D1F, { roughness: .6 }))); wh.rotation.x = Math.PI / 2; wh.position.set(x, .12, .2); machine.add(wh); }
    const hd = shadowed(new THREE.Mesh(new THREE.TorusGeometry(.14, .016, 8, 20, Math.PI), alu)); hd.position.set(0, .52, -.13); machine.add(hd);
    const reel = shadowed(new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 10, 24), mat(0x1E2B30, { roughness: .6 }))); reel.rotation.y = Math.PI / 2; reel.position.set(-.27, .32, 0); machine.add(reel);
  }
  machine.updateMatrixWorld(true);
  const outletG = machine.localToWorld(new V3(.26, .3, .05)), outletR = machine.localToWorld(new V3(.26, .3, -.08));

  /* ---------- Techniciens articulés ---------- */
  const WM = {
    jacket: mat(0x0E4A63, { roughness: .8 }), trousers: mat(0x3A4247, { roughness: .9 }), boot: mat(0x1A1C1E, { roughness: .55 }),
    skin: mat(0xBC8768, { roughness: .55 }), glove: mat(0x2B3034, { roughness: .75 }), refl: mat(0xE6EBEC, { roughness: .2, metalness: .4 }),
    gun: mat(0x1E2427, { roughness: .45 }), lance: mat(0xC2C9CC, { roughness: .25, metalness: .9 }), brass: mat(0xB89160, { roughness: .3, metalness: .85 }), harness: mat(0xD4782A, { roughness: .6 })
  };
  const capsule = (r, len, m) => { const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(.001, len - 2 * r), 6, 14), m); me.castShadow = true; return me; };
  const jetMat = new THREE.MeshBasicMaterial({ color: 0xE4F2F6, transparent: true, opacity: .5, depthWrite: false });
  const jetGeo = new THREE.CylinderGeometry(.036, .006, 1, 12, 1, true); jetGeo.translate(0, .5, 0);
  function makeWorker(x, z, roofer) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.position.set(x, 0, z);
    const legs = [];
    for (const sx of [-1, 1]) {
      const thigh = new THREE.Group(); thigh.position.set(sx * .1, .92, 0); body.add(thigh);
      const tm = capsule(.08, .48, WM.trousers); tm.position.y = -.22; thigh.add(tm);
      const shin = new THREE.Group(); shin.position.y = -.44; thigh.add(shin);
      const sm = capsule(.066, .46, WM.trousers); sm.position.y = -.2; shin.add(sm);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(.12, .1, .28), WM.boot); boot.position.set(0, -.43, .045); boot.castShadow = true; shin.add(boot);
      legs.push({ thigh, shin, sx });
    }
    const pelvis = capsule(.135, .36, WM.trousers); pelvis.rotation.z = Math.PI / 2; pelvis.scale.z = .78; pelvis.position.y = .97; body.add(pelvis);
    const torso = capsule(.17, .62, WM.jacket); torso.position.y = 1.25; torso.scale.set(1.2, 1, .74); body.add(torso);
    for (const y of [1.08, 1.2]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.2045, .2045, .03, 28, 1, true), WM.refl); b.scale.set(1.2, 1, .75); b.position.y = y; body.add(b); }
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(.08, .115, .07, 16), WM.jacket); collar.position.y = 1.53; body.add(collar);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.047, .052, .1, 12), WM.skin); neck.position.y = 1.57; body.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.104, 24, 18), WM.skin); head.position.y = 1.67; head.scale.set(.9, 1.08, 1); body.add(head);
    const capTop = new THREE.Mesh(new THREE.SphereGeometry(.113, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), WM.jacket); capTop.position.y = 1.7; capTop.scale.set(.95, .78, 1.02); body.add(capTop);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.108, .108, .012, 20, 1, false, -Math.PI / 2, Math.PI), WM.jacket); brim.position.set(0, 1.7, .04); brim.scale.z = 1.3; body.add(brim);
    if (roofer) {
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(.215, .215, .05, 24, 1, true), WM.harness); belt.scale.set(1.2, 1, .78); belt.position.y = 1.0; body.add(belt);
      for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(.04, .52, .012), WM.harness); st.position.set(sx * .09, 1.27, .13); st.rotation.z = sx * .08; body.add(st); }
    }
    const pivot = new THREE.Object3D(); pivot.position.set(.1, 1.13, .22); body.add(pivot);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(.035, .12, .05), WM.gun); grip.position.set(0, -.07, -.01); grip.rotation.x = .35; pivot.add(grip);
    const gb = new THREE.Mesh(new THREE.BoxGeometry(.05, .06, .22), WM.gun); gb.position.set(0, 0, .06); pivot.add(gb);
    const lg = new THREE.CylinderGeometry(.011, .011, .92, 10); lg.rotateX(Math.PI / 2); lg.translate(0, 0, .63); pivot.add(new THREE.Mesh(lg, WM.lance));
    const ng = new THREE.CylinderGeometry(.02, .014, .07, 12); ng.rotateX(Math.PI / 2); ng.translate(0, 0, 1.11); pivot.add(new THREE.Mesh(ng, WM.brass));
    body.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const arms = [-1, 1].map(sx => {
      const up = capsule(.054, .31, WM.jacket), fo = capsule(.046, .29, WM.jacket), hand = new THREE.Mesh(new THREE.SphereGeometry(.047, 14, 10), WM.glove);
      hand.castShadow = true; scene.add(up, fo, hand);
      return { sx, up, fo, hand, S: new V3(), E: new V3(), Hd: new V3() };
    });
    const jet = new THREE.Mesh(jetGeo, jetMat); jet.visible = false;
    scene.add(root, jet);
    return { root, body, legs, pivot, arms, jet, pos: root.position, yaw: 0, phase: 0, walk: 0, aim: new V3(0, 1, FRONTZ), aimT: new V3(), standT: new V3(),
      nozzle: new V3(), hoseAt: new V3(), speed: 3.2, mUntil: 0, mAim: new V3(), mStand: new V3(), mG: '', roofer };
  }
  const ground = makeWorker(0, 2.6, false), roofer = makeWorker(-.55, HZ, true);
  roofer.speed = 1.9; roofer.pos.y = roofTopY(-.55);

  const FP = { x: W / 2 + .45, z0: BACKZ - .45, z1: FRONTZ + .45 };
  function groundClamp(v) {
    v.x = clamp(v.x, -TW / 2 + .3, TW / 2 - .3); v.z = clamp(v.z, -TD / 2 + .3, TD / 2 - .25); v.y = 0;
    if (Math.abs(v.x) < FP.x && v.z > FP.z0 && v.z < FP.z1) {
      const dx = FP.x - Math.abs(v.x), dzB = v.z - FP.z0, dzF = FP.z1 - v.z, mm = Math.min(dx, dzB, dzF);
      if (mm === dx) v.x = Math.sign(v.x || 1) * FP.x; else if (mm === dzB) v.z = FP.z0; else v.z = FP.z1;
    }
    return v;
  }
  const roofClamp = v => { v.z = clamp(v.z, HZ - DR / 2 + .35, HZ + DR / 2 - .35); v.y = 0; return v; };
  const _dir = new V3(), _perp = new V3(), _pole = new V3(), _fw = new V3(), _rt = new V3();
  function ik(S, T, a, b, pole, E, Hd) {
    _dir.subVectors(T, S); let d = _dir.length(); _dir.multiplyScalar(1 / Math.max(d, 1e-5));
    d = clamp(d, .05, a + b - .002); Hd.copy(S).addScaledVector(_dir, d);
    const x = (a * a - b * b + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, a * a - x * x));
    _perp.copy(pole).addScaledVector(_dir, -pole.dot(_dir)); if (_perp.lengthSq() < 1e-6) _perp.set(0, -1, 0); _perp.normalize();
    E.copy(S).addScaledVector(_dir, x).addScaledVector(_perp, hh);
  }
  function updateWorker(w, dt, stand, aim) {
    const dx = stand.x - w.pos.x, dz = stand.z - w.pos.z, dist = Math.hypot(dx, dz);
    let moving = false;
    if (dist > .02) { const k = Math.min(1, w.speed * dt / dist); w.pos.x += dx * k; w.pos.z += dz * k; moving = dist > .06; }
    if (w.roofer) w.pos.y = roofTopY(w.pos.x) - .04; else groundClamp(w.pos);
    const desired = Math.atan2(aim.x - w.pos.x, aim.z - w.pos.z);
    let diff = desired - w.yaw; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    w.yaw += diff * Math.min(1, dt * 6); w.body.rotation.y = w.yaw;
    w.walk += ((moving ? 1 : 0) - w.walk) * Math.min(1, dt * 7);
    if (moving) w.phase += dt * 9.5;
    for (const L of w.legs) {
      const p = w.phase + (L.sx > 0 ? Math.PI : 0);
      L.thigh.rotation.x = -Math.sin(p) * .5 * w.walk - .05;
      L.shin.rotation.x = Math.max(0, -Math.cos(p)) * .9 * w.walk + .1;
    }
    w.body.position.y = Math.abs(Math.sin(w.phase)) * .03 * w.walk - .01;
    w.root.updateMatrixWorld(true);
    w.pivot.lookAt(aim); w.pivot.updateMatrixWorld(true);
    _fw.set(Math.sin(w.yaw), 0, Math.cos(w.yaw)); _rt.set(Math.cos(w.yaw), 0, -Math.sin(w.yaw));
    for (const A of w.arms) {
      w.body.localToWorld(A.S.set(A.sx * .22, 1.44, 0));
      if (A.sx > 0) w.pivot.localToWorld(_t.set(0, -.07, 0)); else w.pivot.localToWorld(_t.set(0, 0, .34));
      _pole.set(0, -1, 0).addScaledVector(_rt, A.sx * .7).addScaledVector(_fw, -.35);
      ik(A.S, _t, .31, .29, _pole, A.E, A.Hd);
      placeBone(A.up, A.S, A.E); placeBone(A.fo, A.E, A.Hd); A.hand.position.copy(A.Hd);
    }
    w.pivot.localToWorld(w.nozzle.set(0, 0, 1.14));
    w.pivot.localToWorld(w.hoseAt.set(0, -.13, -.04));
    return dist;
  }

  /* ---------- Eau : jet, gouttelettes, brume ---------- */
  const MAX = small ? 2200 : 3200;
  const pos = new Float32Array(MAX * 3), size = new Float32Array(MAX), alpha = new Float32Array(MAX);
  const st = new Uint8Array(MAX), pt = new Float32Array(MAX), pdur = new Float32Array(MAX), plife = new Float32Array(MAX), pmax = new Float32Array(MAX);
  const ps = new Float32Array(MAX * 3), pe = new Float32Array(MAX * 3), pj = new Float32Array(MAX * 3), pv = new Float32Array(MAX * 3), psag = new Float32Array(MAX);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 1000 } }, transparent: true, depthWrite: false,
    vertexShader: `attribute float aSize; attribute float aAlpha; varying float vA; uniform float uScale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * uScale / max(0.1, -mv.z); vA = aAlpha; }`,
    fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.1, d) * vA; vec3 core = vec3(0.97, 0.99, 1.0); vec3 rim = vec3(0.52, 0.74, 0.82);
      gl_FragColor = vec4(mix(rim, core, smoothstep(0.42, 0.05, d)), a); }`
  });
  const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; points.renderOrder = 2; scene.add(points);
  let cursor = 0;
  function alloc() { for (let k = 0; k < 64; k++) { cursor = (cursor + 1) % MAX; if (st[cursor] === 0) return cursor; } cursor = (cursor + 1) % MAX; return cursor; }
  function spawnJet(o, e, n, len) {
    const i = alloc(), i3 = i * 3; st[i] = 1; pt[i] = rand(0, .1); pdur[i] = Math.max(.04, len / 26);
    ps[i3] = o.x; ps[i3 + 1] = o.y; ps[i3 + 2] = o.z;
    pe[i3] = e.x + rand(-.05, .05); pe[i3 + 1] = e.y + rand(-.05, .05); pe[i3 + 2] = e.z + rand(-.05, .05);
    const a = rand(0, 6.283), r = rand(0, 1);
    pj[i3] = Math.cos(a) * r; pj[i3 + 1] = rand(-1, 1) * r; pj[i3 + 2] = Math.sin(a) * r;
    pv[i3] = n.x; pv[i3 + 1] = n.y; pv[i3 + 2] = n.z; psag[i] = len * .03;
  }
  function spawnMist(e, n) {
    const i = alloc(), i3 = i * 3; st[i] = 3;
    pos[i3] = e.x + n.x * .05 + rand(-.08, .08); pos[i3 + 1] = e.y + n.y * .05 + rand(-.05, .08); pos[i3 + 2] = e.z + n.z * .05 + rand(-.08, .08);
    pv[i3] = n.x * rand(.2, .6) + rand(-.3, .3); pv[i3 + 1] = n.y * rand(.2, .6) + rand(0, .35); pv[i3 + 2] = n.z * rand(.2, .6) + rand(-.3, .3);
    pmax[i] = plife[i] = rand(.6, 1.1);
  }
  function updateParticles(dt) {
    const g = 9.8 * dt, drag = Math.pow(.25, dt);
    for (let i = 0; i < MAX; i++) {
      const s = st[i]; if (s === 0) { alpha[i] = 0; continue; }
      const i3 = i * 3;
      if (s === 1) {
        const t = (pt[i] += dt / pdur[i]);
        if (t >= 1) {
          st[i] = 2; pos[i3] = pe[i3]; pos[i3 + 1] = pe[i3 + 1]; pos[i3 + 2] = pe[i3 + 2];
          const k = rand(.8, 2.8);
          pv[i3] = pv[i3] * k + rand(-1.5, 1.5); pv[i3 + 1] = pv[i3 + 1] * k + rand(0, 1.7); pv[i3 + 2] = pv[i3 + 2] * k + rand(-1.5, 1.5);
          pmax[i] = plife[i] = rand(.3, .7);
        } else {
          const sp = .01 + t * .075;
          pos[i3] = ps[i3] + (pe[i3] - ps[i3]) * t + pj[i3] * sp;
          pos[i3 + 1] = ps[i3 + 1] + (pe[i3 + 1] - ps[i3 + 1]) * t + pj[i3 + 1] * sp - psag[i] * 4 * t * (1 - t);
          pos[i3 + 2] = ps[i3 + 2] + (pe[i3 + 2] - ps[i3 + 2]) * t + pj[i3 + 2] * sp;
          size[i] = .026 + t * .03; alpha[i] = .78;
          continue;
        }
      }
      if ((plife[i] -= dt) <= 0) { st[i] = 0; alpha[i] = 0; continue; }
      const f = plife[i] / pmax[i];
      if (st[i] === 2) {
        pv[i3 + 1] -= g;
        size[i] = .018 + .036 * f; alpha[i] = .72 * f;
      } else {
        pv[i3] *= drag; pv[i3 + 1] *= drag; pv[i3 + 2] *= drag;
        size[i] = .12 + .34 * (1 - f); alpha[i] = .16 * f * Math.min(1, (1 - f) * 6);
      }
      pos[i3] += pv[i3] * dt; pos[i3 + 1] += pv[i3 + 1] * dt; pos[i3 + 2] += pv[i3 + 2] * dt;
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true; pGeo.attributes.aAlpha.needsUpdate = true;
  }

  const ray = new THREE.Raycaster(), hitsBuf = [];
  const surfMeshes = [facade, wallL, wallR, terrace, ...slopes];
  const jetTargets = [...surfMeshes, chimney, back, plinth];
  const tD = new V3(), tN = new V3(), tEnd = new V3();
  function surfOf(hit) {
    const s = meshSurf.get(hit.object); if (!s) return null;
    if (hit.object.userData.box && hit.face.materialIndex !== 2) return null;
    return s;
  }
  function runJet(w, dt, on) {
    if (!on) { w.jet.visible = false; return; }
    const noz = w.nozzle; tD.subVectors(w.aim, noz); const dist = tD.length(); tD.multiplyScalar(1 / Math.max(dist, 1e-5));
    ray.set(noz, tD); ray.far = dist + 1.5;
    hitsBuf.length = 0; ray.intersectObjects(jetTargets, false, hitsBuf);
    if (hitsBuf.length) {
      const h = hitsBuf[0]; tEnd.copy(h.point); tN.copy(h.face.normal).transformDirection(h.object.matrixWorld);
      const s = surfOf(h); if (s && h.uv) s.stamp(h.uv.x, h.uv.y, 1 - Math.pow(.66, dt * 60));
    } else { tEnd.copy(noz).addScaledVector(tD, Math.min(dist, 6)); tN.copy(tD).negate(); }
    const len = noz.distanceTo(tEnd);
    w.jet.visible = true; w.jet.position.copy(noz);
    _a.subVectors(tEnd, noz).normalize(); w.jet.quaternion.setFromUnitVectors(UP, _a); w.jet.scale.set(1, len, 1);
    const count = Math.max(1, Math.round(dt * 650));
    for (let k = 0; k < count; k++) spawnJet(noz, tEnd, tN, len);
    const mc = Math.max(1, Math.round(dt * 110));
    for (let k = 0; k < mc; k++) spawnMist(tEnd, tN);
  }

  /* ---------- Tuyaux (segments instanciés, sans réallocation) ---------- */
  const hoseGeo = new THREE.CylinderGeometry(.022, .022, 1, 8, 1, true), hoseMat = mat(0x1E2B30, { roughness: .55 });
  function makeHose(max) {
    const m = new THREE.InstancedMesh(hoseGeo, hoseMat, max); m.castShadow = true; m.frustumCulled = false; m.count = 0; scene.add(m);
    return { m, max, ctrl: Array.from({ length: 12 }, () => new V3()), n: 0, samp: Array.from({ length: max + 2 }, () => new V3()) };
  }
  function cr(p0, p1, p2, p3, t, o) {
    const t2 = t * t, t3 = t2 * t;
    o.x = .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    o.y = .5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    o.z = .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);
  }
  function buildHose(h) {
    const n = h.n, segs = n - 1, per = Math.max(2, Math.floor(h.max / segs)); let k = 0;
    for (let s = 0; s < segs; s++) {
      const p0 = h.ctrl[Math.max(0, s - 1)], p1 = h.ctrl[s], p2 = h.ctrl[s + 1], p3 = h.ctrl[Math.min(n - 1, s + 2)];
      for (let i = 0; i < per && k < h.max; i++) { cr(p0, p1, p2, p3, i / per, h.samp[k]); if (h.samp[k].y < .022) h.samp[k].y = .022; k++; }
    }
    h.samp[k].copy(h.ctrl[n - 1]);
    for (let i = 0; i < k; i++) {
      const A = h.samp[i], B = h.samp[i + 1]; _a.subVectors(B, A); const len = _a.length();
      if (len < 1e-5) _m.makeScale(0, 0, 0);
      else { _q.setFromUnitVectors(UP, _a.multiplyScalar(1 / len)); _b.addVectors(A, B).multiplyScalar(.5); _s.set(1, len * 1.04, 1); _m.compose(_b, _q, _s); }
      h.m.setMatrixAt(i, _m);
    }
    h.m.count = k; h.m.instanceMatrix.needsUpdate = true;
  }
  const hoseG = makeHose(small ? 56 : 80), hoseR = makeHose(small ? 56 : 80);
  function updateHoses() {
    let C = hoseG.ctrl, n = 0; const w = ground;
    C[n++].copy(outletG); C[n++].set(outletG.x - .3, .022, outletG.z - .1);
    const side = Math.sign(w.pos.x) || 1;
    if (w.pos.z < FP.z1 + .1) { C[n++].set(side * (FP.x + .3), .022, FP.z1 + .35); if (w.pos.z < FP.z0 + .25) C[n++].set(side * (FP.x + .3), .022, FP.z0 - .3); }
    C[n++].set(w.pos.x - Math.sin(w.yaw) * .45, .022, w.pos.z - Math.cos(w.yaw) * .45);
    C[n++].set(w.pos.x - Math.sin(w.yaw) * .12, .45, w.pos.z - Math.cos(w.yaw) * .12);
    C[n++].copy(w.hoseAt); hoseG.n = n; buildHose(hoseG);
    C = hoseR.ctrl; n = 0; const r = roofer;
    C[n++].copy(outletR); C[n++].set(outletR.x - .2, .022, outletR.z - .25);
    C[n++].set(LADA.x - .05, .022, .52); C[n++].set(LADB.x + .02, LADB.y, .5);
    C[n++].set(RUN - .05, roofTopY(RUN - .05) + .02, .4);
    if (r.pos.x < 0) { C[n++].set(1.1, roofTopY(1.1) + .02, (r.pos.z + .4) / 2); C[n++].set(0, roofTopY(0) + .07, r.pos.z + .2); }
    else C[n++].set(Math.max(.9, r.pos.x + .3), roofTopY(Math.max(.9, r.pos.x + .3)) + .02, (r.pos.z + .4) / 2);
    C[n++].set(r.pos.x - Math.sin(r.yaw) * .4, roofTopY(r.pos.x - Math.sin(r.yaw) * .4) + .02, r.pos.z - Math.cos(r.yaw) * .4);
    C[n++].copy(r.hoseAt); hoseR.n = n; buildHose(hoseR);
  }

  /* ---------- Plans de nettoyage ---------- */
  function rows(y0, y1, step, fn) {
    const pts = []; let flip = false;
    for (let y = y0; step < 0 ? y >= y1 - 1e-6 : y <= y1 + 1e-6; y += step) {
      const r = fn(y); if (!r) continue;
      if (flip) pts.push(r[1], r[0]); else pts.push(r[0], r[1]);
      flip = !flip;
    }
    return pts;
  }
  const groundStand = n => (p, o) => {
    if (n.y > .6) { let dx = p.x, dz = p.z - HZ, l = Math.hypot(dx, dz) || 1; o.set(p.x + dx / l * 1.5, 0, p.z + dz / l * 1.5); }
    else o.set(p.x + n.x * 2.3, 0, p.z + n.z * 2.3);
    return groundClamp(o);
  };
  const roofStand = (p, o) => roofClamp(o.set((p.x >= 0 ? 1 : -1) * .55, 0, p.z + (p.z < HZ ? 1.45 : -1.45)));
  const nF = new V3(0, 0, 1), nL = new V3(-1, 0, 0), nR = new V3(1, 0, 0), nU = new V3(0, 1, 0);
  const SP = 3.0;
  const groundTasks = [
    { s: S.facade, g: 'facade', label: 'la façade', speed: SP, stand: groundStand(nF), pts: rows(FH - .22, .14, -.34, y => { let half = W / 2 - .18; if (y > H) half *= 1 - (y - H) / G; if (half < .08) return null; return [new V3(-half, y, FRONTZ), new V3(half, y, FRONTZ)]; }) },
    { s: S.wallL, g: 'walls', label: 'le pignon gauche', speed: SP, stand: groundStand(nL), pts: rows(H - .18, .14, -.34, y => [new V3(-W / 2, y, FRONTZ - .15), new V3(-W / 2, y, BACKZ + .15)]) },
    { s: S.terrace, g: 'terrace', label: 'la terrasse', speed: SP + .4, stand: groundStand(nU), pts: rows(FRONTZ + .1, BACKZ - .1, -.55, z => [new V3(-W / 2 - .3, 0, z), new V3(-TW / 2 + .25, 0, z)]) },
    { s: S.terrace, g: 'terrace', label: 'la terrasse', speed: SP + .4, stand: groundStand(nU), pts: rows(BACKZ - .4, -TD / 2 + .25, -.5, z => [new V3(-TW / 2 + .25, 0, z), new V3(TW / 2 - .25, 0, z)]) },
    { s: S.terrace, g: 'terrace', label: 'la terrasse', speed: SP + .4, stand: groundStand(nU), pts: rows(BACKZ - .1, FRONTZ + .1, .55, z => [new V3(W / 2 + .3, 0, z), new V3(TW / 2 - .25, 0, z)]) },
    { s: S.wallR, g: 'walls', label: 'le pignon droit', speed: SP, stand: groundStand(nR), pts: rows(H - .18, .14, -.34, y => [new V3(W / 2, y, BACKZ + .15), new V3(W / 2, y, FRONTZ - .15)]) },
    { s: S.terrace, g: 'terrace', label: 'la terrasse', speed: SP + .4, stand: groundStand(nU), pts: rows(FRONTZ + .35, TD / 2 - .25, .55, z => [new V3(TW / 2 - .25, 0, z), new V3(-TW / 2 + .25, 0, z)]) },
  ];
  const slopePt = (m, a, b) => m.localToWorld(new V3(m.userData.ridgeSign * (RL / 2 - a * RL), RT / 2, (b - .5) * DR));
  const roofTasks = [];
  slopes.forEach((m, i) => {
    const surf = i === 0 ? S.roofL : S.roofR, sx = i === 0 ? -1 : 1, step = .3 / DR;
    const colPts = b => [slopePt(m, .04, b), slopePt(m, .97, b)];
    roofTasks.push({ s: surf, g: 'roof', label: 'la toiture', speed: 1.75, stand: (p, o) => roofClamp(o.set(sx * .55, 0, p.z + 1.45)), pts: rows(.04, .5, step, colPts) });
    roofTasks.push({ s: surf, g: 'roof', label: 'la toiture', speed: 1.75, stand: (p, o) => roofClamp(o.set(sx * .55, 0, p.z - 1.45)), pts: rows(.96, .5, -step, colPts) });
  });
  class Planner {
    constructor(t) { this.tasks = t; this.reset(); }
    reset() { this.ti = 0; this.si = 0; this.d = 0; this.done = false; this.task = null; this.on = false; }
    step(dt, w, aim, stand) {
      for (;;) {
        const task = this.tasks[this.ti];
        if (!task) { this.done = true; this.task = null; return false; }
        if (task.s.pct >= .985 || this.si >= task.pts.length - 1) { this.ti++; this.si = 0; this.d = 0; continue; }
        const A = task.pts[this.si], B = task.pts[this.si + 1], L = A.distanceTo(B) || 1e-6;
        aim.copy(A).lerp(B, Math.min(1, this.d / L)); task.stand(aim, stand);
        const far = Math.hypot(stand.x - w.pos.x, stand.z - w.pos.z) > .75;
        if (!far) {
          this.d += task.speed * dt;
          while (this.si < task.pts.length - 1) { const L2 = task.pts[this.si].distanceTo(task.pts[this.si + 1]); if (this.d < L2) break; this.d -= L2; this.si++; }
        }
        this.on = !far; this.task = task; return true;
      }
    }
  }
  const crew = [{ w: ground, plan: new Planner(groundTasks) }, { w: roofer, plan: new Planner(roofTasks) }];

  /* ---------- Pilotage manuel ---------- */
  const pointer = { inside: false, ndc: new THREE.Vector2(), t: 0 };
  const hint = els.hint; let hinted = false;
  function setPointer(e) {
    const r = cv.getBoundingClientRect();
    pointer.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointer.inside = true; pointer.t = performance.now();
  }
  cv.addEventListener('pointermove', setPointer);
  cv.addEventListener('pointerdown', setPointer);
  const onPointerOut = () => { pointer.inside = false; };
  cv.addEventListener('pointerleave', onPointerOut);
  cv.addEventListener('pointercancel', onPointerOut);
  const camRay = new THREE.Raycaster(), camHits = [], nTmp = new V3();
  function updatePointer(now) {
    if (!pointer.inside || now - pointer.t > 4000 || state !== 'run') return;
    camRay.setFromCamera(pointer.ndc, camera);
    camHits.length = 0; camRay.intersectObjects(surfMeshes, false, camHits);
    for (const h of camHits) {
      const s = surfOf(h); if (!s) continue;
      const isRoof = s === S.roofL || s === S.roofR, who = isRoof ? roofer : ground;
      who.mAim.copy(h.point); who.mUntil = now + 1600;
      if (isRoof) roofStand(h.point, who.mStand);
      else { nTmp.copy(h.face.normal).transformDirection(h.object.matrixWorld); groundStand(nTmp.y > .6 ? nU : nTmp)(h.point, who.mStand); }
      who.mG = isRoof ? 'roof' : s === S.facade ? 'facade' : s === S.terrace ? 'terrace' : 'walls';
      if (!hinted && hint) { hinted = true; hint.style.opacity = 0; }
      break;
    }
  }

  /* ---------- Caméra ---------- */
  let theta = -.62, R0 = 22, intro = 1, px = 0;
  const lookAt = new V3(.1, .75, .1);
  function resize() {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    if (camera.aspect < 0.92) R0 = 32;
    else if (camera.aspect < 1.12) R0 = 27;
    else R0 = 22;
    camera.updateProjectionMatrix();
    pMat.uniforms.uScale.value = camera.projectionMatrix.elements[5] * renderer.domElement.height * .5;
  }
  const resizeObs = new ResizeObserver(resize); resizeObs.observe(stage); resize();
  function updateCamera(dt, time) {
    intro = Math.min(1, intro + dt / 2.6);
    const k = 1 - Math.pow(1 - intro, 3);
    px += ((pointer.inside ? pointer.ndc.x : 0) - px) * Math.min(1, dt * 2);
    const target = -.62 + (reduce ? 0 : Math.sin(time * .12) * .24) + px * .15 - (1 - k) * .5;
    theta += (target - theta) * Math.min(1, dt * 2.5);
    const lift = camera.aspect < 1.05 ? 0.56 : 0.42;
    const R = R0 * (1 + .3 * (1 - k)), Y = R0 * lift + 4.5 * (1 - k);
    camera.position.set(Math.sin(theta) * R, Y, Math.cos(theta) * R - .35);
    camera.lookAt(lookAt);
  }

  /* ---------- Interface ---------- */
  const hud = Object.fromEntries([...els.hud.querySelectorAll('li')].map(li => [li.dataset.k, { li, v: li.querySelector('.v'), bar: li.querySelector('.bar i'), last: -1 }]));
  const groups = { roof: [S.roofL, S.roofR], facade: [S.facade], walls: [S.wallL, S.wallR], terrace: [S.terrace] };
  const modeEl = els.mode, modeText = els.modeText, stamp = els.stamp;
  const gp = k => groups[k].reduce((a, s) => a + s.pct, 0) / groups[k].length;
  const overall = () => (gp('roof') + gp('facade') + gp('walls') + gp('terrace')) / 4;
  const active = new Set();
  function renderHud(manual, label) {
    for (const k in hud) {
      const h = hud[k], p = Math.round(gp(k) * 100);
      if (p !== h.last) { h.v.textContent = p + ' %'; h.bar.style.width = p + '%'; h.last = p; }
      h.li.classList.toggle('is-active', active.has(k));
    }
    const txt = state === 'done' ? 'Chantier terminé' : state === 'refill' ? 'Nouveau chantier' : manual ? 'Vous pilotez la lance' : label ? 'Démonstration · ' + label : 'Démonstration automatique';
    if (modeText.textContent !== txt) modeText.textContent = txt;
    modeEl.classList.toggle('is-auto', !manual && state === 'run');
  }

  /* ---------- Boucle ---------- */
  let state = 'run', stateT = 0, visible = true, last = performance.now(), time = 0, hudT = 0;
  let ft = 0, fn = 0, dprLocked = false;
  const visObs = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) last = performance.now(); });
  visObs.observe(stage);
  const onVis = () => { last = performance.now(); };
  document.addEventListener('visibilitychange', onVis);

  updateCamera(0, 0);
  for (const c of crew) { c.w.aimT.copy(c.w.aim); c.w.standT.copy(c.w.pos); updateWorker(c.w, 0, c.w.standT, c.w.aim); }
  updateHoses();
  renderer.render(scene, camera);
  stage.classList.add('is-ready');

  function frame(now) {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const raw = (now - last) / 1000; last = now;
    if (!visible || document.hidden) return;
    const dt = Math.min(.033, raw);
    time += dt;

    if (!dprLocked) {
      ft += raw; fn++;
      if (fn >= 48) {
        if (ft / fn < .02 && dpr < dprMax) {
          dpr = dprMax;
          renderer.setPixelRatio(dpr);
          resize();
        }
        dprLocked = true;
      }
    }

    if (time < 0.7) {
      renderer.render(scene, camera);
      return;
    }

    updateCamera(dt, time);
    updatePointer(now);

    if (state === 'run' && ((crew[0].plan.done && crew[1].plan.done) || overall() >= .975)) { state = 'done'; stateT = 3.4; stamp.hidden = false; }
    else if (state === 'done') {
      stateT -= dt;
      if (stateT <= 0) { state = 'refill'; stateT = 1.8; stamp.hidden = true; for (const s of allS) { s.reset(); s.fade.value = 0; } crew.forEach(c => c.plan.reset()); }
    } else if (state === 'refill') {
      stateT -= dt; const o = clamp(1 - stateT / 1.8, 0, 1); for (const s of allS) s.fade.value = o * o * (3 - 2 * o);
      if (stateT <= 0) state = 'run';
    }

    active.clear(); let anyManual = false, label = '';
    for (const c of crew) {
      const w = c.w; let on = false, has = false;
      if (state === 'run' && now < w.mUntil) {
        w.aimT.copy(w.mAim); w.standT.copy(w.mStand); has = true; anyManual = true; active.add(w.mG);
        on = Math.hypot(w.standT.x - w.pos.x, w.standT.z - w.pos.z) < 1.4;
      } else if (state === 'run' && c.plan.step(dt, w, w.aimT, w.standT)) {
        has = true; on = c.plan.on; active.add(c.plan.task.g); if (!w.roofer || !label) label = c.plan.task.label;
      }
      if (!has) {
        w.aimT.set(w.pos.x + Math.sin(w.yaw) * 1.4, w.pos.y + (w.roofer ? -.6 : 0), w.pos.z + Math.cos(w.yaw) * 1.4);
        w.standT.copy(w.pos);
      }
      w.aim.lerp(w.aimT, 1 - Math.exp(-dt * 12));
      updateWorker(w, dt, w.standT, w.aim);
      runJet(w, dt, on && state === 'run');
    }
    updateParticles(dt);
    updateHoses();
    for (const s of allS) s.tick(dt);
    hudT -= dt;
    if (hudT <= 0) { hudT = .2; renderHud(anyManual, label); }
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  dispose = () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    visObs.disconnect();
    resizeObs.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    cv.removeEventListener('pointermove', setPointer);
    cv.removeEventListener('pointerdown', setPointer);
    cv.removeEventListener('pointerleave', onPointerOut);
    cv.removeEventListener('pointercancel', onPointerOut);
    renderer.dispose();
  };
}
start();
return () => {
  disposed = true;
  dispose();
};

}
