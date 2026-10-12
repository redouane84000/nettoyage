import * as THREE from 'three';

export function mountRestoScene(els) {
  let dispose = () => {};
  let disposed = false;
  let rafId = 0;

const V3 = THREE.Vector3;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const UP = new V3(0, 1, 0), _a = new V3(), _b = new V3(), _c = new V3(), _t = new V3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new V3(1, 1, 1), _e = new THREE.Euler();
function placeBone(m, A, B) { _a.subVectors(B, A); const len = _a.length(); m.position.copy(A).addScaledVector(_a, .5); if (len > 1e-6) m.quaternion.setFromUnitVectors(UP, _a.multiplyScalar(1 / len)); return len; }
function placeStretch(m, A, B) { const len = placeBone(m, A, B); m.scale.set(1, len, 1); }

const cv = els.canvas;
const stage = els.stage;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = Math.min(screen.width, screen.height) < 700;
const Q = small ? 0.32 : 0.5;
const tick = () => new Promise(r => requestAnimationFrame(r));

/* ---------- Plan (mètres) ---------- */
const GZ = -3.5;                       // plan des vitres
const FZ1 = 3.6;                       // bord avant du parquet
const WALL_H = 3.1, GTOP = 2.75, ALLEGE = .32;
const CLN = { x0: -3.3, x1: 3.5, z0: -3.42, z1: 3.6 };     // zone lavée à l'autolaveuse
const TABLES = [{ x: -1.6, z: -.75 }, { x: 1.6, z: -.75 }, { x: -1.6, z: 1.75 }, { x: 1.6, z: 1.75 }];
const SMALLT = [-2.1, 0, 2.1];
const PANES = [{ x0: -5, x1: -2.8 }, { x0: -2.8, x1: -.6 }, { x0: -.6, x1: .6, door: true }, { x0: .6, x1: 2.8 }, { x0: 2.8, x1: 5 }];
const groundY = (x, z) => (x < CLN.x0 - .02 && z > -3.45 ? .12 : 0);

/* ---------- Peinture procédurale ---------- */
function grain(ctx, w, h, n, a) {
  n = Math.max(80, (n * Q) | 0);
  for (let i = 0; i < n; i++) { ctx.fillStyle = Math.random() < .5 ? `rgba(0,0,0,${Math.random() * a})` : `rgba(255,255,255,${Math.random() * a})`; const s = Math.random() * 2 * w / 1024 + .6; ctx.fillRect(Math.random() * w, Math.random() * h, s, s); }
}
function blob(ctx, x, y, r, rgb, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function ao(ctx, path, blur, a) { ctx.save(); ctx.shadowColor = `rgba(30,20,10,${a})`; ctx.shadowBlur = blur; ctx.fillStyle = `rgba(30,20,10,${a})`; ctx.beginPath(); path(); ctx.fill(); ctx.restore(); }
const tex = (c, srgb = true, rep) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
let ANISO = 8;

/* Parquet point de Hongrie, chêne verni */
const FW = 10, FD = GZ * -1 + FZ1;      // 10 × 7,1
function floorPaint(ctx, w, h, mode) {
  const C = mode === 'c', s = w / FW, cw = .42 * s, P = .1414 * s;
  ctx.fillStyle = C ? '#5A3F28' : '#1a1a1a'; ctx.fillRect(0, 0, w, h);
  const ncol = Math.ceil(w / cw) + 1;
  for (let c = 0; c < ncol; c++) {
    const x0 = c * cw, x1 = x0 + cw, sg = c % 2 ? -1 : 1, base = c % 2 ? cw : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, cw, h); ctx.clip();
    for (let k = -Math.ceil(cw / P) - 2; k * P < h + cw; k++) {
      const yA = k * P + base, yB = yA + sg * cw;
      ctx.beginPath(); ctx.moveTo(x0, yA + .9); ctx.lineTo(x1, yB + .9); ctx.lineTo(x1, yB + P - .9); ctx.lineTo(x0, yA + P - .9); ctx.closePath();
      if (C) {
        const l = rand(47, 58); ctx.fillStyle = `hsl(${rand(28, 34)},${rand(24, 34)}%,${Math.random() < .08 ? l + 6 : l}%)`; ctx.fill();
        ctx.save(); ctx.clip();
        for (let g = 0; g < 5; g++) { const t = rand(.1, .9); ctx.strokeStyle = `rgba(${Math.random() < .5 ? '90,60,30' : '255,235,200'},${rand(.05, .12)})`; ctx.lineWidth = rand(.6, 1.6) * w / 2048; ctx.beginPath(); ctx.moveTo(x0, yA + P * t + rand(-1, 1)); ctx.lineTo(x1, yB + P * t + rand(-1, 1)); ctx.stroke(); }
        if (Math.random() < .05) blob(ctx, rand(x0, x1), (yA + yB) / 2 + P / 2, P * .25, '80,50,25', .35);
        ctx.restore();
      } else { const l = rand(165, 190) | 0; ctx.fillStyle = `rgb(${l},${l},${l})`; ctx.fill(); }
    }
    ctx.restore();
  }
  grain(ctx, w, h, w * h / 40, C ? .05 : .12);
  if (C) {
    const px = (x) => (x + 5) / FW * w, pz = (z) => (z - GZ) / FD * h;
    for (const t of TABLES) ao(ctx, () => ctx.arc(px(t.x), pz(t.z), .3 * s, 0, 7), .35 * s, .38);
    ao(ctx, () => ctx.rect(px(3.5), pz(-2.4), .7 * s, 4.7 * s), .25 * s, .5);
    ao(ctx, () => ctx.rect(px(-5.1), pz(-3.5), 1.85 * s, 7.2 * s), .18 * s, .55);
    ao(ctx, () => ctx.rect(0, pz(-3.62), w, .12 * s), .22 * s, .55);
    ao(ctx, () => ctx.rect(px(4.55), pz(-2.7), .5 * s, 5.4 * s), .2 * s, .5);
  }
}
function floorDirt(ctx, w, h) {
  const s = w / FW, px = (x) => (x + 5) / FW * w, pz = (z) => (z - GZ) / FD * h;
  ctx.save();
  ctx.beginPath(); ctx.rect(px(CLN.x0), pz(CLN.z0), (CLN.x1 - CLN.x0) * s, (CLN.z1 - CLN.z0) * s); ctx.clip();
  ctx.fillStyle = 'rgba(88,82,70,.62)'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) blob(ctx, rand(0, w), rand(0, h), rand(.1, .6) * s, pick(['78,72,62', '110,100,84', '58,54,48']), rand(.12, .3));
  // traces de pas depuis la porte vers le bar et les tables
  const trail = (pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / .32);
      const ang = Math.atan2(bz - az, bx - ax);
      for (let k = 0; k < n; k++) {
        const t = k / n, side = k % 2 ? 1 : -1, x = ax + (bx - ax) * t - Math.sin(ang) * .09 * side, z = az + (bz - az) * t + Math.cos(ang) * .09 * side;
        ctx.save(); ctx.translate(px(x), pz(z)); ctx.rotate(ang + Math.PI / 2 + rand(-.12, .12));
        const a = rand(.25, .5);
        ctx.fillStyle = `rgba(66,54,40,${a})`; ctx.beginPath(); ctx.ellipse(0, -.05 * s, .048 * s, .095 * s, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, .1 * s, .042 * s, .05 * s, 0, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(40,30,22,${a * .5})`; for (let r = -3; r < 3; r++) ctx.fillRect(-.04 * s, (-.05 + r * .028) * s, .08 * s, .008 * s);
        ctx.restore();
      }
    }
  };
  trail([[-.1, -3.3], [.4, -2.2], [2.2, -1.2], [3.2, -.3]]);
  trail([[.2, -3.3], [-.3, -1.9], [-1.0, -.1], [-1.2, 1.0]]);
  trail([[3.1, .6], [2.0, .5], [.2, .6], [-.6, 2.4], [-.4, 3.5]]);
  trail([[-.2, -3.2], [1.0, -.1], [.6, 1.2], [1.3, 3.5]]);
  // auréoles de boissons, taches collantes, miettes, traces de semelles
  for (const t of TABLES) for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(${pick(['110,46,30', '90,60,30'])},${rand(.25, .45)})`; ctx.lineWidth = rand(2, 4) * w / 2048; ctx.beginPath(); ctx.arc(px(t.x + rand(-.7, .7)), pz(t.z + rand(-.7, .7)), rand(.035, .07) * s, 0, 7); ctx.stroke(); }
  for (let i = 0; i < 26; i++) blob(ctx, px(rand(2.6, 3.45)), pz(rand(-2.4, 2.3)), rand(.05, .16) * s, pick(['80,50,30', '60,40,26']), rand(.25, .5));
  for (let i = 0; i < (700 * Q) | 0; i++) { const t = pick(TABLES); ctx.fillStyle = `rgba(${pick(['150,110,60', '200,170,120', '70,50,30'])},${rand(.4, .8)})`; const r = rand(1, 3.2) * w / 2048; ctx.fillRect(px(t.x + rand(-1.1, 1.1)), pz(t.z + rand(-1.1, 1.1)), r, r); }
  for (let i = 0; i < 150; i++) { const x = rand(0, w), y = rand(0, h), a = rand(0, 6.3), L = rand(.04, .16) * s; ctx.strokeStyle = `rgba(20,18,16,${rand(.3, .6)})`; ctx.lineWidth = rand(1.2, 3) * w / 2048; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * L * .5 + rand(-4, 4), y + Math.sin(a) * L * .5 + rand(-4, 4), x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
  for (let i = 0; i < 60; i++) blob(ctx, px(rand(CLN.x0, CLN.x0 + .4)), pz(rand(-3.4, 3.5)), rand(.05, .14) * s, '120,114,104', rand(.3, .5));
  for (let i = 0; i < 60; i++) blob(ctx, px(rand(-3.3, 3.5)), pz(rand(-3.42, -3.2)), rand(.05, .14) * s, '120,114,104', rand(.3, .5));
  ctx.restore();
}
/* Vitrage : film gris, coulures de pluie, traces de doigts, calcaire */
function glassDirt(ctx, w, h) {
  const s = w / 10, py = y => (GTOP - y) / GTOP * h, px = x => (x + 5) / 10 * w;
  ctx.fillStyle = 'rgba(176,172,158,.52)'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) blob(ctx, rand(0, w), rand(0, h), rand(.1, .5) * s, pick(['160,154,138', '190,186,172', '140,134,118']), rand(.12, .3));
  for (let i = 0; i < 160; i++) { const x = rand(0, w), y0 = rand(0, h * .4), L = rand(.3, 1.6) * s; const g = ctx.createLinearGradient(0, y0, 0, y0 + L); g.addColorStop(0, 'rgba(130,124,108,.42)'); g.addColorStop(1, 'rgba(130,124,108,0)'); ctx.fillStyle = g; ctx.fillRect(x, y0, rand(1.2, 3.5) * w / 1536, L); }
  for (let i = 0; i < 900; i++) { const x = rand(0, w), y = rand(0, h), r = rand(1.5, 5) * w / 1536; ctx.strokeStyle = `rgba(235,232,222,${rand(.35, .7)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(150,146,132,.25)'; ctx.fill(); }
  for (let i = 0; i < 40; i++) { const x = px(rand(-1.1, 1.1)), y = py(rand(.9, 1.45)); ctx.save(); ctx.translate(x, y); ctx.rotate(rand(-.5, .5)); for (let f = 0; f < 4; f++) { ctx.fillStyle = `rgba(150,142,126,${rand(.25, .45)})`; ctx.beginPath(); ctx.ellipse((f - 1.5) * .022 * s, -Math.abs(f - 1.5) * .01 * s, .009 * s, .016 * s, 0, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(150,142,126,.25)'; ctx.beginPath(); ctx.ellipse(0, .04 * s, .045 * s, .035 * s, 0, 0, 7); ctx.fill(); ctx.restore(); }
  const g = ctx.createLinearGradient(0, h, 0, h - .55 * s); g.addColorStop(0, 'rgba(124,114,96,.6)'); g.addColorStop(1, 'rgba(124,114,96,0)'); ctx.fillStyle = g; ctx.fillRect(0, h - .55 * s, w, .55 * s);
}
function wallPaint(kind) {
  return (ctx, w, h) => {
    const s = w / 7.2, py = y => (WALL_H - y) * s;
    ctx.fillStyle = '#EDE6D9'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) blob(ctx, rand(0, w), rand(0, h), rand(.2, .8) * s, Math.random() < .5 ? '255,250,240' : '150,130,100', rand(.03, .06));
    grain(ctx, w, h, w * h / 30, .05);
    if (kind === 'tile') {
      const tw = .15 * s, th = .075 * s; let r = 0;
      for (let y = py(2.75); y < py(.9); y += th, r++) for (let x = -(r % 2) * tw / 2; x < w; x += tw) {
        const g = ctx.createLinearGradient(x, y, x, y + th); g.addColorStop(0, '#FBFAF6'); g.addColorStop(1, '#E3DFD6');
        ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, tw - 2, th - 2);
      }
    }
    const wy = py(1.05);
    ctx.fillStyle = '#7E5A3A'; ctx.fillRect(0, wy, w, h - wy);
    const pw = .7 * s;
    for (let x = .08 * s; x < w; x += pw) {
      ctx.fillStyle = '#8D6844'; ctx.fillRect(x, wy + .1 * s, pw - .14 * s, (1.05 - .3) * s);
      ctx.fillStyle = 'rgba(255,230,190,.12)'; ctx.fillRect(x, wy + .1 * s, pw - .14 * s, 3);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, wy + .1 * s + (1.05 - .3) * s - 3, pw - .14 * s, 3);
    }
    ctx.fillStyle = '#5F4229'; ctx.fillRect(0, wy - .05 * s, w, .06 * s);
    ctx.fillStyle = '#4A3320'; ctx.fillRect(0, h - .12 * s, w, .12 * s);
  };
}
function plainCanvas(w, h, fn) { const c = mkCanvas(w, h); fn(c.getContext('2d'), w, h); return c; }

/* ---------- Masques de lavage (R = saleté, G = eau / mousse) ---------- */
class Mask {
  constructor(w, h) {
    this.w = w; this.h = h; this.d = new Uint8Array(w * h * 2);
    this.tex = new THREE.DataTexture(this.d, w, h, THREE.RGFormat, THREE.UnsignedByteType);
    this.tex.magFilter = this.tex.minFilter = THREE.LinearFilter; this.tex.generateMipmaps = false; this.tex.unpackAlignment = 1;
    this.wb = null; this.acc = 0; this.reset();
  }
  reset() { const d = this.d; for (let i = 0; i < d.length; i += 2) { d[i] = 255; d[i + 1] = 0; } this.wb = null; this.tex.needsUpdate = true; }
  rect(cx, cy, fx, fy, ha, hp, op) {
    const r = Math.ceil(Math.hypot(ha, hp)) + 1, w = this.w, d = this.d;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(this.h - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x + .5 - cx, dy = y + .5 - cy, a = dx * fx + dy * fy, p = -dx * fy + dy * fx;
      const cov = clamp(ha - Math.abs(a) + .5, 0, 1) * clamp(hp - Math.abs(p) + .5, 0, 1);
      if (cov > 0) op(d, (y * w + x) * 2, cov);
    }
    this.dirty = true;
    if (!this.wb) this.wb = [x0, y0, x1, y1]; else { const b = this.wb; b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0); b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1); }
  }
  dry(dt, rate) {
    if (!this.wb) return;
    this.acc += dt * rate; const dec = this.acc | 0; if (!dec) return; this.acc -= dec;
    const [x0, y0, x1, y1] = this.wb, w = this.w, d = this.d; let any = false;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const j = (y * w + x) * 2 + 1, g = d[j]; if (g) { const n = g - dec; d[j] = n > 0 ? n : 0; any = true; } }
    if (!any) this.wb = null; this.dirty = true;
  }
  flush() { if (this.dirty) { this.tex.needsUpdate = true; this.dirty = false; } }
}
const NOISE = `
uniform sampler2D uDirt; uniform sampler2D uMask; uniform float uFade; uniform vec2 uNS; uniform vec3 uGlint;
float fcH(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float fcN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(fcH(i), fcH(i + vec2(1.0, 0.0)), f.x), mix(fcH(i + vec2(0.0, 1.0)), fcH(i + vec2(1.0, 1.0)), f.x), f.y); }
`;

/* ---------- Démarrage ---------- */
async function start() {
  if (disposed) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !small, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return; }
  ANISO = Math.min(small ? 2 : 4, renderer.capabilities.getMaxAnisotropy());
  const dprMax = Math.min(devicePixelRatio, small ? 1.15 : 1.35); let dpr = 1;
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
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
  const camera = new THREE.PerspectiveCamera(26, 1, .5, 200);

  // Environnement : ciel clair, horizon lumineux, soleil
  {
    const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; void main(){ float h = vP.y; vec3 top = vec3(.48,.64,.86), hor = vec3(1.02,1.0,.97), gr = vec3(.42,.39,.35);
        vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h,0.,1.), .55)) : mix(hor * .85, gr, pow(clamp(-h,0.,1.), .4)); gl_FragColor = vec4(c, 1.0); }` })));
    scene.environment = pm.fromScene(env, .08).texture; pm.dispose();
  }
  await tick();
  if (disposed) return;
  const sun = new THREE.DirectionalLight(0xFFF1DE, 2.7);
  sun.position.set(-6.5, 9.5, -12); sun.castShadow = true;
  const SM = small ? 384 : 512; sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 2, far: 40 });
  sun.shadow.bias = -.0003; sun.shadow.normalBias = .02; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xDCE8EE, .55); fill.position.set(4, 10, 12); scene.add(fill);

  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o });
  const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  const box = (w, h, d, m, x, y, z, parent = scene) => { const me = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)); me.position.set(x, y, z); parent.add(me); return me; };

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: .16 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -.5; catcher.receiveShadow = true; scene.add(catcher);

  /* Socle */
  const PL = { x0: -5.6, x1: 5.6, z0: -5.6, z1: 4.2 };
  const label = mkCanvas(1024, 56); {
    const c = label.getContext('2d'); c.fillStyle = '#0B3A5C'; c.fillRect(0, 0, 1024, 56);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, 0, 1024, 2);
    c.textBaseline = 'middle'; c.fillStyle = '#F4F6F5'; c.font = '700 24px Outfit, Arial, sans-serif'; try { c.letterSpacing = '4px'; } catch (e) {}
    c.fillText('FAST & CLEAN', 36, 30);
    c.font = '500 13px "Source Sans 3", Arial, sans-serif'; try { c.letterSpacing = '2px'; } catch (e) {}
    c.fillStyle = 'rgba(244,246,245,.7)'; c.textAlign = 'right'; c.fillText('NETTOYAGE PROFESSIONNEL · VITRES & SOLS', 988, 30);
  }
  const pet = mat(0x05445E, { roughness: .38 }), petTop = mat(0x0A5674, { roughness: .45 });
  const plinth = sh(new THREE.Mesh(new THREE.BoxGeometry(PL.x1 - PL.x0, .5, PL.z1 - PL.z0), [pet, pet, petTop, pet, new THREE.MeshStandardMaterial({ map: tex(label), roughness: .38 }), pet]));
  plinth.position.set(0, -.25, (PL.z0 + PL.z1) / 2); scene.add(plinth);

  /* Trottoir et jardinières, visibles à travers la vitrine */
  {
    const c = plainCanvas(1024, 192, (x, w, h) => {
      x.fillStyle = '#A9A49A'; x.fillRect(0, 0, w, h);
      const s = w / 11.2, t = .45 * s; let r = 0;
      for (let y = 0; y < h; y += t, r++) for (let xx = -(r % 2) * t / 2; xx < w; xx += t) { const l = rand(70, 78); x.fillStyle = `hsl(36,6%,${l}%)`; x.fillRect(xx + 1.5, y + 1.5, t - 3, t - 3); }
      grain(x, w, h, w * h / 20, .1);
    });
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 1.9), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .9 }));
    sw.rotation.x = -Math.PI / 2; sw.position.set(0, .002, -4.65); sw.receiveShadow = true; scene.add(sw);
    const woodBox = mat(0x3A2C22, { roughness: .8 }), boxw = mat(0x4E7A3A, { roughness: .9, flatShading: true });
    const bushGeo = new THREE.IcosahedronGeometry(.3, 2); { const p = bushGeo.attributes.position; for (let i = 0; i < p.count; i++) { _a.fromBufferAttribute(p, i); _a.multiplyScalar(1 + (Math.random() - .5) * .18); p.setXYZ(i, _a.x, _a.y, _a.z); } bushGeo.computeVertexNormals(); }
    for (const x of [-3.6, 3.6]) {
      box(1.0, .42, .44, woodBox, x, .21, -4.75);
      for (const dx of [-.25, .25]) { const b = sh(new THREE.Mesh(bushGeo, boxw)); b.position.set(x + dx, .62, -4.75); scene.add(b); }
    }
  }

  /* Parquet lavable */
  const TSF = small ? 512 : 1024, FHpx = Math.round(TSF * FD / FW);
  const floorC = plainCanvas(TSF, FHpx, (c, w, h) => floorPaint(c, w, h, 'c'));
  const floorB = plainCanvas(TSF / 2, Math.round(FHpx / 2), (c, w, h) => floorPaint(c, w, h, 'b'));
  const floorD = plainCanvas(TSF, FHpx, floorDirt);
  const FMW = small ? 448 : 704, FMH = Math.round(FMW * FD / FW);
  const fMask = new Mask(FMW, FMH);
  const fFade = { value: 1 };
  const floorMat = new THREE.MeshStandardMaterial({ map: tex(floorC), bumpMap: tex(floorB, false), bumpScale: 1.1, roughness: .34 });
  const floorDirtTex = tex(floorD);
  floorMat.onBeforeCompile = s => {
    Object.assign(s.uniforms, { uDirt: { value: floorDirtTex }, uMask: { value: fMask.tex }, uFade: fFade, uNS: { value: new THREE.Vector2(FW * 9, FD * 9) }, uGlint: { value: new V3() } });
    s.fragmentShader = NOISE + s.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec4 dTx = texture2D(uDirt, vMapUv); vec2 mk = texture2D(uMask, vMapUv).rg;
        float nz = fcN(vMapUv * uNS);
        float edge = smoothstep(.4, .6, mk.r + (nz - .5) * .05);
        float dAmt = dTx.a * edge * uFade;
        diffuseColor.rgb = mix(diffuseColor.rgb, dTx.rgb, dAmt);
        float wet = mk.g; diffuseColor.rgb *= 1.0 - wet * .3;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, .05, wet);
        roughnessFactor = mix(roughnessFactor, .86, dAmt * .9);`);
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, .001, (GZ + FZ1) / 2); floor.receiveShadow = true; scene.add(floor);
  const fx = x => (x + 5) / FW * FMW, fz = z => (FZ1 - z) / FD * FMH, fpm = FMW / FW;
  await tick();
  if (disposed) return;

  /* Murs */
  const plaster = mat(0xF2EDE3, { roughness: .95 });
  const wallTexL = tex(plainCanvas(512, Math.round(512 * WALL_H / 7.2), wallPaint('plain')));
  const wallTexR = tex(plainCanvas(512, Math.round(512 * WALL_H / 7.2), wallPaint('tile')));
  const wallL = sh(new THREE.Mesh(new THREE.BoxGeometry(.2, WALL_H, 7.2), [new THREE.MeshStandardMaterial({ map: wallTexL, roughness: .9 }), plaster, plaster, plaster, plaster, plaster]));
  wallL.position.set(-5.1, WALL_H / 2, .05); scene.add(wallL);
  const wallR = sh(new THREE.Mesh(new THREE.BoxGeometry(.2, WALL_H, 7.2), [plaster, new THREE.MeshStandardMaterial({ map: wallTexR, roughness: .7 }), plaster, plaster, plaster, plaster]));
  wallR.position.set(5.1, WALL_H / 2, .05); scene.add(wallR);
  box(10.4, WALL_H - GTOP - .04, .2, plaster, 0, (GTOP + .04 + WALL_H) / 2, GZ - .05);
  const steel = mat(0x1D2326, { roughness: .45, metalness: .6 });
  for (const p of PANES) if (!p.door) box(p.x1 - p.x0, ALLEGE, .2, plaster, (p.x0 + p.x1) / 2, ALLEGE / 2, GZ - .05);
  for (const x of [-4.965, -2.8, -.6, .6, 2.8, 4.965]) box(.07, GTOP + .04, .13, steel, x, (GTOP + .04) / 2, GZ);
  box(10, .07, .13, steel, 0, GTOP + .005, GZ);
  for (const p of PANES) if (!p.door) box(p.x1 - p.x0, .05, .16, steel, (p.x0 + p.x1) / 2, ALLEGE + .02, GZ);
  box(1.13, .08, .1, steel, 0, .06, GZ);
  const inox = mat(0xC9CED0, { roughness: .22, metalness: .95 });
  { const bar = sh(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .9, 12), inox)); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.05, GZ + .1); scene.add(bar);
    for (const x of [-.45, .45]) { const st = sh(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .1, 8), inox)); st.rotation.x = Math.PI / 2; st.position.set(x, 1.05, GZ + .05); scene.add(st); } }

  /* Vitrage lavable */
  const GTW = small ? 512 : 768, GTH = Math.round(GTW * GTOP / 10);
  const gDirtTex = tex(plainCanvas(GTW, GTH, glassDirt));
  const GMW = small ? 512 : 896, GMH = Math.round(GMW * GTOP / 10);
  const gMask = new Mask(GMW, GMH);
  const gFade = { value: 1 }, glint = { value: new V3(0, 1, -2) };
  const glassMat = new THREE.MeshStandardMaterial({ map: gDirtTex, transparent: true, depthWrite: false, roughness: .05, metalness: 0 });
  glassMat.onBeforeCompile = s => {
    Object.assign(s.uniforms, { uDirt: { value: gDirtTex }, uMask: { value: gMask.tex }, uFade: gFade, uNS: { value: new THREE.Vector2(10 * 12, GTOP * 12) }, uGlint: glint });
    s.fragmentShader = NOISE + s.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec4 dTx = texture2D(uDirt, vMapUv); vec2 mk = texture2D(uMask, vMapUv).rg;
        float nz = fcN(vMapUv * uNS);
        float dirt = dTx.a * smoothstep(.42, .58, mk.r + (nz - .5) * .04) * uFade;
        float foam = smoothstep(.3, .62, mk.g);
        float bub = smoothstep(.45, .8, fcN(vMapUv * uNS * 4.0)) * .6 + smoothstep(.6, .9, fcN(vMapUv * uNS * 11.0)) * .4;
        vec3 col = mix(vec3(.78, .86, .89), dTx.rgb, dirt);
        col = mix(col, vec3(.97, .98, .99), foam * (.7 + .3 * bub));
        float gx = (vMapUv.x - uGlint.x) / max(.0001, uGlint.y - uGlint.x);
        float gin = step(0.0, gx) * step(gx, 1.0) * step(.13, vMapUv.y);
        float gl = gin * (exp(-pow((gx + (1.0 - vMapUv.y) * .5 - uGlint.z) * 10.0, 2.0)) + .5 * exp(-pow((gx + (1.0 - vMapUv.y) * .5 - uGlint.z + .09) * 22.0, 2.0)));
        diffuseColor.rgb = col;
        diffuseColor.a = .045 + dirt * .8 + foam * (.62 + .22 * bub);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(.03, .9, max(dirt, foam * .55));`)
      .replace('#include <opaque_fragment>', `
        float sp = clamp(dot(totalSpecular, vec3(.299, .587, .114)), 0.0, 1.0);
        outgoingLight += vec3(1.0) * gl * .9;
        gl_FragColor = vec4(outgoingLight, clamp(diffuseColor.a + sp * .85 + gl * .55, 0.0, 1.0));`);
  };
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(10, GTOP), glassMat);
  glass.position.set(0, GTOP / 2, GZ); glass.renderOrder = 5; scene.add(glass);
  const gx = x => (x + 5) / 10 * GMW, gy = y => y / GTOP * GMH, gpm = GMW / 10;

  /* Estrade, banquette et miroirs (côté gauche) */
  const walnut = plainCanvas(256, 512, (c, w, h) => { c.fillStyle = '#2E2119'; c.fillRect(0, 0, w, h); const pw = w / 12; for (let i = 0; i < 12; i++) { let y = -rand(0, 300); while (y < h) { const L = rand(260, 520); c.fillStyle = `hsl(${rand(18, 26)},${rand(28, 36)}%,${rand(20, 28)}%)`; c.fillRect(i * pw + 1, y + 1, pw - 2, L - 2); y += L; } } grain(c, w, h, w * h / 20, .08); });
  box(1.7, .12, 7.0, new THREE.MeshStandardMaterial({ map: tex(walnut), roughness: .5 }), -4.15, .06, .05);
  box(.04, .03, 7.0, mat(0x6E5034, { roughness: .4, metalness: .3 }), -3.3, .105, .05);
  const leatherC = plainCanvas(256, 512, (c, w, h) => { c.fillStyle = '#7A4427'; c.fillRect(0, 0, w, h); const cw = h / 30; for (let i = 0; i < 30; i++) { const g = c.createLinearGradient(0, i * cw, 0, (i + 1) * cw); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.5, 'rgba(255,200,150,.14)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(0, i * cw, w, cw); } grain(c, w, h, 1800, .08); });
  const leather = new THREE.MeshStandardMaterial({ map: tex(leatherC), roughness: .45 });
  box(.55, .42, 6.0, leather, -4.73, .33, .05);
  box(.18, .6, 6.0, leather, -4.9, .84, .05);
  const brass = mat(0xB08D57, { roughness: .3, metalness: .85 }), mirror = mat(0xD5DCDE, { roughness: .03, metalness: 1 });
  for (const z of [-2, 0, 2]) { box(.03, 1.06, 1.36, brass, -4.985, 1.85, z); box(.02, .96, 1.26, mirror, -4.965, 1.85, z); }

  /* Mobilier : géométries fusionnées et instanciées */
  function merge(parts) {
    let n = 0; const gs = parts.map(([g, m]) => { const ng = g.toNonIndexed(); ng.applyMatrix4(m); n += ng.attributes.position.count; return ng; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    for (const g of gs) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
  }
  const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(sx, sy, sz));
  const chairGeo = merge([
    [new THREE.CylinderGeometry(.2, .2, .035, 28), M4(0, .46, 0)],
    ...[[.13, .13], [-.13, .13], [.13, -.13], [-.13, -.13]].map(([x, z]) => [new THREE.CylinderGeometry(.014, .017, .47, 8), M4(x * 1.08, .225, z * 1.08, z * .12, 0, -x * .12)]),
    [new THREE.TorusGeometry(.115, .011, 6, 28), M4(0, .2, 0, Math.PI / 2)],
    [new THREE.TorusGeometry(.16, .013, 8, 32, Math.PI), M4(0, .7, -.17, 0, 0, 0)],
    [new THREE.CylinderGeometry(.013, .013, .3, 8), M4(-.16, .6, -.17)], [new THREE.CylinderGeometry(.013, .013, .3, 8), M4(.16, .6, -.17)],
  ]);
  const stoolGeo = merge([
    [new THREE.CylinderGeometry(.17, .16, .05, 28), M4(0, .76, 0)],
    ...[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([x, z]) => [new THREE.CylinderGeometry(.013, .016, .78, 8), M4(x * .11, .38, z * .11, z * .1, 0, -x * .1)]),
    [new THREE.TorusGeometry(.14, .01, 6, 28), M4(0, .26, 0, Math.PI / 2)],
  ]);
  const woodDark = mat(0x3A281C, { roughness: .55 }), castIron = mat(0x1C1F21, { roughness: .5, metalness: .5 });
  const marbleC = plainCanvas(256, 256, (c, w, h) => { c.fillStyle = '#EEECE7'; c.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) { c.strokeStyle = `rgba(${pick(['120,120,124', '160,158,150'])},${rand(.12, .35)})`; c.lineWidth = rand(.6, 2.4); c.beginPath(); let x = rand(0, w), y = 0; c.moveTo(x, y); while (y < h) { x += rand(-30, 30); y += rand(20, 50); c.lineTo(x, y); } c.stroke(); } grain(c, w, h, 2200, .04); });
  const marble = new THREE.MeshStandardMaterial({ map: tex(marbleC), roughness: .18 });
  const chairs = [], stools = [];
  for (const t of TABLES) {
    const top = sh(new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .035, 40), marble)); top.position.set(t.x, .757, t.z); scene.add(top);
    const col = sh(new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, .72, 12), castIron)); col.position.set(t.x, .38, t.z); scene.add(col);
    const ft = sh(new THREE.Mesh(new THREE.CylinderGeometry(.2, .23, .035, 28), castIron)); ft.position.set(t.x, .02, t.z); scene.add(ft);
    const a0 = rand(0, 1); for (const a of [a0, a0 + Math.PI]) chairs.push({ x: t.x + Math.cos(a) * .2, z: t.z + Math.sin(a) * .2, ry: -a + Math.PI / 2, y: .775 });
  }
  for (const z of SMALLT) {
    const y0 = .12;
    box(.62, .035, .62, marble, -3.95, y0 + .74, z);
    const col = sh(new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, .7, 12), castIron)); col.position.set(-3.95, y0 + .37, z); scene.add(col);
    box(.4, .03, .4, castIron, -3.95, y0 + .02, z);
    chairs.push({ x: -3.8, z, ry: Math.PI / 2, y: y0 + .758 });
  }
  const chairIM = new THREE.InstancedMesh(chairGeo, woodDark, chairs.length); chairIM.castShadow = chairIM.receiveShadow = true;
  chairs.forEach((c, i) => { _e.set(Math.PI, c.ry, 0); _q.setFromEuler(_e); _m.compose(_t.set(c.x, c.y + .478, c.z), _q, _s.set(1, 1, 1)); chairIM.setMatrixAt(i, _m); });
  scene.add(chairIM);

  /* Bar en zinc, étagères, bouteilles */
  const slatsC = plainCanvas(512, 128, (c, w, h) => { c.fillStyle = '#3B271A'; c.fillRect(0, 0, w, h); const n = 40; for (let i = 0; i < n; i++) { const x = i * w / n; const g = c.createLinearGradient(x, 0, x + w / n, 0); g.addColorStop(0, '#4A3222'); g.addColorStop(.5, '#6A4A31'); g.addColorStop(1, '#3A2619'); c.fillStyle = g; c.fillRect(x + 1, 0, w / n - 2, h); } grain(c, w, h, 2500, .06); });
  const slats = new THREE.MeshStandardMaterial({ map: tex(slatsC), roughness: .6 });
  const zinc = mat(0xA9B0B2, { roughness: .32, metalness: .85 });
  const counter = sh(new THREE.Mesh(new THREE.BoxGeometry(.7, 1.05, 4.7), [woodDark, slats, woodDark, woodDark, woodDark, woodDark]));
  counter.position.set(3.85, .525, -.05); scene.add(counter);
  box(.85, .05, 4.8, zinc, 3.83, 1.075, -.05);
  { const r = sh(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 4.8, 16), zinc)); r.rotation.x = Math.PI / 2; r.position.set(3.41, 1.07, -.05); scene.add(r);
    const fr = sh(new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, 4.6, 12), brass)); fr.rotation.x = Math.PI / 2; fr.position.set(3.38, .16, -.05); scene.add(fr); }
  for (const z of [-1.6, 0, 1.6]) stools.push({ x: 3.86, z, y: 1.1 });
  const stoolIM = new THREE.InstancedMesh(stoolGeo, woodDark, stools.length); stoolIM.castShadow = true;
  stools.forEach((c, i) => { _e.set(Math.PI, rand(0, 3), 0); _q.setFromEuler(_e); _m.compose(_t.set(c.x, c.y + .785, c.z), _q, _s.set(1, 1, 1)); stoolIM.setMatrixAt(i, _m); });
  scene.add(stoolIM);
  box(.45, .95, 5.4, woodDark, 4.77, .475, -.05);
  box(.5, .04, 5.5, marble, 4.75, .97, -.05);
  for (const y of [1.45, 1.92]) box(.26, .035, 4.8, woodDark, 4.86, y, -.05);
  box(.02, 1.3, 4.9, mirror, 4.995, 1.95, -.05);
  { // machine à expresso
    const g = new THREE.Group(); g.position.set(4.72, .99, -1.4); scene.add(g);
    box(.38, .38, .7, inox, 0, .19, 0, g); box(.4, .04, .72, castIron, 0, .4, 0, g);
    for (const z of [-.2, 0, .2]) { const h = sh(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .07, 12), castIron)); h.rotation.z = Math.PI / 2; h.position.set(-.22, .2, z); g.add(h); }
  }
  { // bouteilles
    const prof = [[0, 0], [.034, 0], [.036, .02], [.036, .19], [.03, .22], [.013, .25], [.012, .31], [0, .31]].map(([x, y]) => new THREE.Vector2(x, y));
    const bGeo = new THREE.LatheGeometry(prof, 14), list = [];
    for (const y of [1.47, 1.94]) for (let z = -2.3; z < 2.3; z += rand(.13, .2)) list.push([4.88 + rand(-.03, .03), y, z, rand(.8, 1.15)]);
    for (let z = .6; z < 2.4; z += rand(.12, .2)) list.push([4.7 + rand(-.05, .05), .99, z, rand(.85, 1.1)]);
    const bm = new THREE.MeshStandardMaterial({ roughness: .12, metalness: .05 }), im = new THREE.InstancedMesh(bGeo, bm, list.length); im.castShadow = true;
    const cc = new THREE.Color();
    list.forEach(([x, y, z, s], i) => { _m.compose(_t.set(x, y, z), _q.identity(), _s.set(s, s, s)); im.setMatrixAt(i, _m); im.setColorAt(i, cc.set(pick([0x2E4A2A, 0x5A3A16, 0x8C6A2C, 0xC9D6D2, 0x3E2A1E, 0x6E1F22, 0x224038]))); });
    scene.add(im);
  }

  /* Plantes, seau de vitrier, panneau « sol glissant » */
  const ceramic = mat(0xEDEAE4, { roughness: .4 });
  const potGeo = (r, h) => new THREE.LatheGeometry([[r * .62, 0], [r * .7, .02], [r * .95, h * .92], [r, h], [r * .9, h]].map(([x, y]) => new THREE.Vector2(x, y)), 32);
  const leafGeo = new THREE.SphereGeometry(1, 8, 6); leafGeo.scale(.075, .012, .14);
  const leafMat = new THREE.MeshStandardMaterial({ roughness: .55, color: 0xFFFFFF });
  function plant(x, y, z, N) {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    g.add(sh(new THREE.Mesh(potGeo(.24, .5), ceramic)));
    const im = new THREE.InstancedMesh(leafGeo, leafMat, N); im.castShadow = im.receiveShadow = true; const cc = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const h = rand(.6, 1.75), a = rand(0, 6.28), r = rand(.05, .38) * (h < .9 ? .6 : 1);
      _t.set(Math.cos(a) * r, h, Math.sin(a) * r); _e.set(rand(-.9, .3), a + rand(-.5, .5), rand(-.5, .5)); _q.setFromEuler(_e); const s = rand(.7, 1.3);
      _m.compose(_t, _q, _s.set(s, s, s)); im.setMatrixAt(i, _m); im.setColorAt(i, cc.set(pick([0x2F5A2A, 0x3C6B31, 0x274D24, 0x4A7A3A])));
    }
    g.add(im);
    const stem = sh(new THREE.Mesh(new THREE.CylinderGeometry(.015, .025, 1.3, 6), mat(0x4A3A2A))); stem.position.y = 1.05; g.add(stem);
  }
  plant(-4.5, .12, -3.0, small ? 110 : 170);
  plant(4.6, 0, 3.1, small ? 110 : 170);
  { const g = new THREE.Group(); g.position.set(-3.75, .12, -2.95); g.rotation.y = .3; scene.add(g);
    box(.5, .26, .26, mat(0x24343B, { roughness: .5 }), 0, .13, 0, g);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(.44, .2), mat(0xBFD8DE, { roughness: .05 })); water.rotation.x = -Math.PI / 2; water.position.y = .22; g.add(water);
    const handle = sh(new THREE.Mesh(new THREE.TorusGeometry(.22, .008, 6, 24, Math.PI), inox)); handle.position.y = .26; g.add(handle); }
  { const c = plainCanvas(256, 384, (x, w, h) => { x.fillStyle = '#F2C230'; x.fillRect(0, 0, w, h); x.fillStyle = '#1A1A1A'; x.beginPath(); x.moveTo(w / 2, 40); x.lineTo(w - 50, 170); x.lineTo(50, 170); x.closePath(); x.fill(); x.fillStyle = '#F2C230'; x.beginPath(); x.moveTo(w / 2, 68); x.lineTo(w - 72, 156); x.lineTo(72, 156); x.closePath(); x.fill(); x.fillStyle = '#1A1A1A'; x.fillRect(w / 2 - 5, 95, 10, 36); x.fillRect(w / 2 - 5, 138, 10, 10); x.font = '800 30px Archivo, Arial, sans-serif'; x.textAlign = 'center'; x.fillText('ATTENTION', w / 2, 230); x.font = '700 22px Archivo, Arial, sans-serif'; x.fillText('SOL GLISSANT', w / 2, 270); });
    const sm = new THREE.MeshStandardMaterial({ map: tex(c), roughness: .5 }), yel = mat(0xF2C230, { roughness: .5 });
    const g = new THREE.Group(); g.position.set(-3.75, .12, 3.05); g.rotation.y = .5; scene.add(g);
    for (const s of [-1, 1]) { const p = sh(new THREE.Mesh(new THREE.BoxGeometry(.32, .62, .012), [yel, yel, yel, yel, s > 0 ? sm : yel, s < 0 ? sm : yel])); p.position.set(0, .3, s * .09); p.rotation.x = s * .28; g.add(p); } }

  /* ---------- Techniciens ---------- */
  const WM = { jacket: mat(0x123E52, { roughness: .8 }), trousers: mat(0x30373C, { roughness: .9 }), shoe: mat(0x16181A, { roughness: .5 }), skin: mat(0xBE8A6C, { roughness: .55 }),
    glove: mat(0x2B3034, { roughness: .7 }), refl: mat(0xE6EBEC, { roughness: .2, metalness: .4 }), hair: mat(0x2A1F18, { roughness: .8 }) };
  const capsule = (r, len, m) => { const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(.001, len - 2 * r), 6, 14), m); me.castShadow = true; return me; };
  function makeWorker(withCap) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const legs = [];
    for (const sx of [-1, 1]) {
      const thigh = new THREE.Group(); thigh.position.set(sx * .1, .92, 0); body.add(thigh);
      const tm = capsule(.079, .48, WM.trousers); tm.position.y = -.22; thigh.add(tm);
      const shin = new THREE.Group(); shin.position.y = -.44; thigh.add(shin);
      const sm = capsule(.064, .46, WM.trousers); sm.position.y = -.2; shin.add(sm);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(.11, .09, .27), WM.shoe); shoe.position.set(0, -.43, .05); shoe.castShadow = true; shin.add(shoe);
      legs.push({ thigh, shin, sx });
    }
    const pelvis = capsule(.135, .36, WM.trousers); pelvis.rotation.z = Math.PI / 2; pelvis.scale.z = .78; pelvis.position.y = .97; body.add(pelvis);
    const torso = capsule(.17, .62, WM.jacket); torso.position.y = 1.25; torso.scale.set(1.2, 1, .74); body.add(torso);
    for (const y of [1.08, 1.2]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.2045, .2045, .03, 28, 1, true), WM.refl); b.scale.set(1.2, 1, .75); b.position.y = y; body.add(b); }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.047, .052, .1, 12), WM.skin); neck.position.y = 1.57; body.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.104, 24, 18), WM.skin); head.position.y = 1.67; head.scale.set(.9, 1.08, 1); body.add(head);
    if (withCap) {
      const capTop = new THREE.Mesh(new THREE.SphereGeometry(.113, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), WM.jacket); capTop.position.y = 1.7; capTop.scale.set(.95, .78, 1.02); body.add(capTop);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(.108, .108, .012, 20, 1, false, -Math.PI / 2, Math.PI), WM.jacket); brim.position.set(0, 1.7, .04); brim.scale.z = 1.3; body.add(brim);
    } else { const hr = new THREE.Mesh(new THREE.SphereGeometry(.108, 24, 12, 0, Math.PI * 2, 0, Math.PI * .55), WM.hair); hr.position.set(0, 1.685, -.01); hr.scale.set(.93, .85, 1.04); body.add(hr); }
    body.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const arms = [-1, 1].map(sx => { const up = capsule(.054, .31, WM.jacket), fo = capsule(.046, .29, WM.jacket), hand = new THREE.Mesh(new THREE.SphereGeometry(.047, 14, 10), WM.glove); hand.castShadow = true; scene.add(up, fo, hand); return { sx, up, fo, hand, S: new V3(), E: new V3(), Hd: new V3() }; });
    scene.add(root);
    return { root, body, legs, arms, pos: root.position, yaw: 0, phase: 0, walk: 0 };
  }
  const _dir = new V3(), _perp = new V3(), _pole = new V3(), _fw = new V3(), _rt = new V3();
  function ik(S, T, a, b, pole, E, Hd) {
    _dir.subVectors(T, S); let d = _dir.length(); _dir.multiplyScalar(1 / Math.max(d, 1e-5));
    d = clamp(d, .05, a + b - .002); Hd.copy(S).addScaledVector(_dir, d);
    const x = (a * a - b * b + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, a * a - x * x));
    _perp.copy(pole).addScaledVector(_dir, -pole.dot(_dir)); if (_perp.lengthSq() < 1e-6) _perp.set(0, -1, 0); _perp.normalize();
    E.copy(S).addScaledVector(_dir, x).addScaledVector(_perp, hh);
  }
  function moveWorker(w, dt, sx, sz, faceX, faceZ, speed, snap) {
    const dx = sx - w.pos.x, dz = sz - w.pos.z, dist = Math.hypot(dx, dz);
    let v = 0;
    if (snap) { v = dist / Math.max(dt, 1e-4); w.pos.x = sx; w.pos.z = sz; }
    else if (dist > .01) { const k = Math.min(1, speed * dt / dist); w.pos.x += dx * k; w.pos.z += dz * k; v = Math.min(dist, speed * dt) / Math.max(dt, 1e-4); }
    w.pos.y = groundY(w.pos.x, w.pos.z);
    const desired = Math.atan2(faceX - w.pos.x, faceZ - w.pos.z);
    let diff = desired - w.yaw; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); w.yaw += diff * Math.min(1, dt * 6); w.body.rotation.y = w.yaw;
    const moving = v > .08;
    w.walk += ((moving ? 1 : 0) - w.walk) * Math.min(1, dt * 7);
    w.phase += dt * clamp(v * 6.5, 0, 10);
    for (const L of w.legs) { const p = w.phase + (L.sx > 0 ? Math.PI : 0); L.thigh.rotation.x = -Math.sin(p) * .5 * w.walk - .05; L.shin.rotation.x = Math.max(0, -Math.cos(p)) * .9 * w.walk + .1; }
    w.body.position.y = Math.abs(Math.sin(w.phase)) * .028 * w.walk - .01;
    w.root.updateMatrixWorld(true);
    _fw.set(Math.sin(w.yaw), 0, Math.cos(w.yaw)); _rt.set(Math.cos(w.yaw), 0, -Math.sin(w.yaw));
    return dist;
  }
  function setArms(w, TL, TR) {
    for (const A of w.arms) {
      w.body.localToWorld(A.S.set(A.sx * .22, 1.44, 0));
      _pole.set(0, -1, 0).addScaledVector(_rt, A.sx * .7).addScaledVector(_fw, -.35);
      ik(A.S, A.sx < 0 ? TL : TR, .31, .29, _pole, A.E, A.Hd);
      placeBone(A.up, A.S, A.E); placeBone(A.fo, A.E, A.Hd); A.hand.position.copy(A.Hd);
    }
  }

  /* Laveur de vitres : perche, mouilleur, raclette */
  const washer = makeWorker(true);
  washer.pos.set(-3.9, .12, -2.4);
  const alu = mat(0xB9C0C3, { roughness: .3, metalness: .8 });
  const pole = sh(new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 1, 10), alu)); scene.add(pole);
  const tool = new THREE.Group(); scene.add(tool);
  const wetHead = new THREE.Group(), sqHead = new THREE.Group(); tool.add(wetHead, sqHead);
  { const sleeve = sh(new THREE.Mesh(new THREE.CapsuleGeometry(.045, .4, 6, 12), mat(0xDDE9EE, { roughness: .95 }))); sleeve.rotation.z = Math.PI / 2; wetHead.add(sleeve);
    const tb = sh(new THREE.Mesh(new THREE.BoxGeometry(.42, .025, .025), mat(0x1B7A8F, { roughness: .4 }))); tb.position.z = .05; wetHead.add(tb);
    const ch = sh(new THREE.Mesh(new THREE.BoxGeometry(.03, .46, .025), inox)); sqHead.add(ch);
    const blade = sh(new THREE.Mesh(new THREE.BoxGeometry(.012, .46, .02), mat(0x111111, { roughness: .7 }))); blade.position.z = -.02; sqHead.add(blade);
    const hd = sh(new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .06), mat(0x1B7A8F, { roughness: .4 }))); hd.position.z = .05; sqHead.add(hd); }
  const toolPos = new V3(-3.6, 1.0, GZ + .06), toolAim = new V3();

  /* Autolaveuse et son opérateur */
  const scrubber = new THREE.Group(); scene.add(scrubber);
  const grips = [];
  {
    const teal = mat(0x1B7A8F, { roughness: .32 }), dark = mat(0x22292D, { roughness: .5 }), rub = mat(0x111214, { roughness: .8 });
    box(.56, .38, .58, teal, 0, .3, .4, scrubber); box(.5, .14, .48, mat(0x166273, { roughness: .3 }), 0, .56, .42, scrubber);
    const cap = sh(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .03, 20), dark)); cap.position.set(0, .64, .52); scrubber.add(cap);
    const deck = sh(new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .08, 32), dark)); deck.position.set(0, .07, .47); scrubber.add(deck);
    for (const x of [-.29, .29]) { const w = sh(new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .06, 24), rub)); w.rotation.z = Math.PI / 2; w.position.set(x, .11, .2); scrubber.add(w); }
    box(.76, .05, .05, rub, 0, .035, 0, scrubber); box(.7, .035, .07, mat(0x9AA3A6, { roughness: .35, metalness: .7 }), 0, .075, .01, scrubber);
    for (const x of [-.36, .36]) { const wh = sh(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .03, 12), rub)); wh.rotation.z = Math.PI / 2; wh.position.set(x, .03, -.02); scrubber.add(wh); }
    box(.06, .06, .14, dark, 0, .07, .06, scrubber);
    for (const x of [-.2, .2]) { const t = sh(new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, 1, 10), dark)); placeStretch(t, new V3(x, .48, .16), new V3(x, .96, -.16)); scrubber.add(t); }
    const hb = sh(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .5, 10), dark)); hb.rotation.z = Math.PI / 2; hb.position.set(0, .96, -.16); scrubber.add(hb);
    box(.24, .1, .06, dark, 0, .86, -.06, scrubber);
    const led = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0x6CF0A0 })); led.position.set(.08, .9, -.09); scrubber.add(led);
    grips.push(new V3(-.17, .96, -.16), new V3(.17, .96, -.16));
  }
  const operator = makeWorker(false);

  /* ---------- Eau : gouttes et mousse ---------- */
  const MAX = 900;
  const pos = new Float32Array(MAX * 3), size = new Float32Array(MAX), alpha = new Float32Array(MAX), vel = new Float32Array(MAX * 3), life = new Float32Array(MAX), lmax = new Float32Array(MAX), kind = new Uint8Array(MAX);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const pMat = new THREE.ShaderMaterial({ uniforms: { uScale: { value: 1000 } }, transparent: true, depthWrite: false,
    vertexShader: `attribute float aSize; attribute float aAlpha; varying float vA; uniform float uScale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uScale / max(.1, -mv.z); vA = aAlpha; }`,
    fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5) discard;
      float a = smoothstep(.5, .1, d) * vA; gl_FragColor = vec4(mix(vec3(.55,.75,.82), vec3(.98,.99,1.), smoothstep(.42,.05,d)), a); }` });
  const pts = new THREE.Points(pGeo, pMat); pts.frustumCulled = false; pts.renderOrder = 6; scene.add(pts);
  let pc = 0;
  function spawn(k, x, y, z, vx, vy, vz, l, s) { pc = (pc + 1) % MAX; const i3 = pc * 3; kind[pc] = k; pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z; vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz; life[pc] = lmax[pc] = l; size[pc] = s; }
  function updateParticles(dt) {
    for (let i = 0; i < MAX; i++) {
      if (life[i] <= 0) { alpha[i] = 0; continue; }
      life[i] -= dt; const i3 = i * 3, f = Math.max(0, life[i] / lmax[i]);
      if (kind[i] === 1) { vel[i3 + 1] -= 9.8 * dt; if (pos[i3 + 1] < .02) life[i] = 0; alpha[i] = .8 * Math.min(1, f * 3); }
      else { vel[i3] *= .95; vel[i3 + 2] *= .95; alpha[i] = .7 * Math.min(1, f * 2); }
      pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
    }
    pGeo.attributes.position.needsUpdate = pGeo.attributes.aSize.needsUpdate = pGeo.attributes.aAlpha.needsUpdate = true;
  }

  /* ---------- Trajets ---------- */
  class Path {
    constructor(p) { this.p = p; this.c = [0]; for (let i = 1; i < p.length; i++) this.c.push(this.c[i - 1] + p[i].distanceTo(p[i - 1])); this.L = this.c[this.c.length - 1]; }
    at(s, out) {
      s = clamp(s, 0, this.L); const c = this.c; let lo = 0, hi = c.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
      const seg = c[hi] - c[lo] || 1; return out.copy(this.p[lo]).lerp(this.p[hi], (s - c[lo]) / seg);
    }
  }
  // Vitres : mouilleur en passes verticales, puis raclette en « S » de haut en bas
  const gTasks = [];
  for (const p of [...PANES].reverse()) {
    const y0 = p.door ? .1 : ALLEGE + .05, y1 = GTOP - .03, ix0 = p.x0 + .04, ix1 = p.x1 - .04;
    const wet = [], sq = [];
    const cols = Math.max(1, Math.ceil((ix1 - ix0 - .45) / .4) + 1);
    for (let i = 0; i < cols; i++) { const x = cols === 1 ? (ix0 + ix1) / 2 : ix0 + .225 + i * (ix1 - ix0 - .45) / (cols - 1); const a = new V3(x, y0 + .1, GZ + .06), b = new V3(x, y1 - .1, GZ + .06); if (i % 2) wet.push(b, a); else wet.push(a, b); }
    const rowsN = Math.ceil((y1 - y0 - .46) / .4) + 1;
    for (let i = 0; i < rowsN; i++) { const y = y1 - .23 - i * (y1 - y0 - .46) / (rowsN - 1); const a = new V3(ix0 + .05, y, GZ + .06), b = new V3(ix1 - .05, y, GZ + .06); if (i % 2) sq.push(b, a); else sq.push(a, b); }
    gTasks.push({ p, kind: 'wet', path: new Path(wet), speed: 2.3, y0, y1, ix0, ix1 }, { p, kind: 'sq', path: new Path(sq), speed: 1.75, y0, y1, ix0, ix1 });
  }
  // Sol : bandes front-arrière contournant les tables, puis finitions le long de la vitrine et à l'avant
  const OB = TABLES.map(t => ({ x: t.x, z: t.z, R: .82 }));
  const lanesPts = [];
  {
    const HALF = .37, xs = []; for (let x = CLN.x0 + HALF; x <= CLN.x1 - HALF + 1e-6; x += .66) xs.push(x); if (xs[xs.length - 1] < CLN.x1 - HALF - .05) xs.push(CLN.x1 - HALF);
    xs.forEach((xl, i) => {
      const down = i % 2 === 0, za = down ? CLN.z1 - .04 : CLN.z0 + .72, zb = down ? CLN.z0 + .72 : CLN.z1 - .42;
      const n = Math.ceil(Math.abs(zb - za) / .08);
      for (let k = 0; k <= n; k++) {
        const z = za + (zb - za) * k / n; let x = xl;
        for (const o of OB) { const dz = z - o.z; if (Math.abs(dz) < o.R) { const need = Math.sqrt(o.R * o.R - dz * dz); if (Math.abs(x - o.x) < need) x = xl >= o.x ? o.x + need : o.x - need; } }
        lanesPts.push(new V3(clamp(x, CLN.x0 + HALF, CLN.x1 - HALF), 0, z));
      }
    });
    const last = lanesPts[lanesPts.length - 1], right = last.x > 0;
    const near = right ? CLN.x1 - HALF : CLN.x0 + HALF, far = right ? CLN.x0 + HALF : CLN.x1 - HALF;
    const farStop = right ? CLN.x0 + .76 : CLN.x1 - .76, nearStop = right ? CLN.x1 - .76 : CLN.x0 + .76;
    const zB = CLN.z0 + .37, zF = CLN.z1 - .38;
    const seg = (ax, az, bx, bz, n) => { for (let k = 1; k <= n; k++) lanesPts.push(new V3(ax + (bx - ax) * k / n, 0, az + (bz - az) * k / n)); };
    seg(last.x, last.z, near, zB + .5, 12);
    seg(near, zB + .5, near + (right ? -.25 : .25), zB, 6);
    seg(near + (right ? -.25 : .25), zB, farStop, zB, 50);
    seg(farStop, zB, far, zB + .55, 8);
    seg(far, zB + .55, far, zF - .5, 50);
    seg(far, zF - .5, far + (right ? .25 : -.25), zF, 6);
    seg(far + (right ? .25 : -.25), zF, nearStop, zF, 50);
  }
  const fPath = new Path(lanesPts);

  /* ---------- Caméra ---------- */
  let yaw = -.2, el = .8, R0 = 24, intro = 1, pxN = 0, pyN = 0, pin = false;
  const target = new V3(.1, .7, -.45);
  function resize() {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(13)) * 2;
    R0 = Math.max(12.4 / t, (14.4 / t) / Math.max(camera.aspect, 0.72));
    if (camera.aspect < 1.05) R0 *= 1.12;
    pMat.uniforms.uScale.value = camera.projectionMatrix.elements[5] * renderer.domElement.height * .5;
  }
  const resizeObs = new ResizeObserver(resize); resizeObs.observe(stage); resize();
  const onPointerMove = e => {
    const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return;
    pxN = ((e.clientX - r.left) / r.width) * 2 - 1;
    pyN = ((e.clientY - r.top) / r.height) * 2 - 1;
    pin = true;
  };
  const onPointerOut = () => { pin = false; };
  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerleave', onPointerOut);
  cv.addEventListener('pointercancel', onPointerOut);
  let cyaw = yaw, cel = el;
  function updateCamera(dt, time) {
    intro = Math.min(1, intro + dt / 2.6); const k = 1 - Math.pow(1 - intro, 3);
    const ty = yaw + (reduce ? 0 : Math.sin(time * .1) * .1) + (pin ? pxN * .12 : 0) - (1 - k) * .35;
    const te = el + (pin ? pyN * .05 : 0) + (1 - k) * .2;
    cyaw += (ty - cyaw) * Math.min(1, dt * 2.2); cel += (te - cel) * Math.min(1, dt * 2.2);
    const R = R0 * (1 + .25 * (1 - k));
    camera.position.set(target.x + Math.sin(cyaw) * Math.cos(cel) * R, target.y + Math.sin(cel) * R, target.z + Math.cos(cyaw) * Math.cos(cel) * R);
    camera.lookAt(target);
  }

  /* ---------- Simulation ---------- */
  let gi = 0, gs = 0, fs = 0, phase = 'run', phaseT = 0, glintT = -1;
  const S = new V3(), Sprev = new V3(), Sahead = new V3(), fwd = new V3(0, 0, -1);
  let heading = Math.PI;
  fPath.at(0, S); Sprev.copy(S);
  const rest = new V3(-3.85, .12, -2.35);
  const gripW = [new V3(), new V3()], tL = new V3(), tR = new V3(), base = new V3(), pdir = new V3(), poleA = new V3(), poleB = new V3();

  function glassOp(kindOp) {
    return kindOp === 'wet'
      ? (d, j, cov) => { d[j] = (d[j] * (1 - .9 * cov)) | 0; const g = (255 * cov) | 0; if (g > d[j + 1]) d[j + 1] = g; }
      : (d, j, cov) => { d[j] = (d[j] * (1 - cov)) | 0; d[j + 1] = (d[j + 1] * (1 - cov)) | 0; };
  }
  const opWet = glassOp('wet'), opSq = glassOp('sq');
  const opFloor = (d, j, cov) => { d[j] = (d[j] * (1 - cov)) | 0; const g = (95 * cov) | 0; if (g > d[j + 1]) d[j + 1] = g; };
  function finishPane(t) {
    const x0 = Math.floor(gx(t.p.x0)), x1 = Math.ceil(gx(t.p.x1)), y0 = Math.floor(gy(t.y0 - .06)), y1 = Math.ceil(gy(GTOP));
    const d = gMask.d;
    for (let y = Math.max(0, y0); y < Math.min(GMH, y1); y++) for (let x = Math.max(0, x0); x < Math.min(GMW, x1); x++) { const j = (y * GMW + x) * 2; d[j] = 0; d[j + 1] = 0; }
    gMask.dirty = true;
    glint.value.set((t.p.x0 + 5) / 10, (t.p.x1 + 5) / 10, -.4); glintT = 0;
  }
  let lastRowDir = 0;

  function step(dt, time) {
    // Phases du cycle : lavage, finition, pause, retour de la saleté
    if (phase === 'run' && gi >= gTasks.length && fs >= fPath.L) { phase = 'polish'; phaseT = 1.2; }
    else if (phase === 'polish') { phaseT -= dt; const d = fMask.d; for (let i = 0; i < d.length; i += 2) d[i] = (d[i] * .88) | 0; fMask.dirty = true; if (phaseT <= 0) { phase = 'hold'; phaseT = 3.5; } }
    else if (phase === 'hold') { phaseT -= dt; if (phaseT <= 0) { phase = 'refill'; phaseT = 2.2; fMask.reset(); gMask.reset(); fFade.value = gFade.value = 0; gi = 0; gs = 0; fs = 0; } }
    else if (phase === 'refill') { phaseT -= dt; const o = clamp(1 - phaseT / 2.2, 0, 1), e = o * o * (3 - 2 * o); fFade.value = gFade.value = e; if (phaseT <= 0) phase = 'run'; }
    const running = phase === 'run';

    // Laveur de vitres
    const gt = gTasks[gi];
    let standX = rest.x, standZ = rest.z, faceX = rest.x + .6, faceZ = rest.z - 1;
    if (running && gt) {
      gt.path.at(gs, toolAim);
      standX = clamp(toolAim.x, gt.p.x0 + .45, gt.p.x1 - .45); standZ = GZ + .8; faceX = toolAim.x; faceZ = GZ;
    } else toolAim.set(washer.pos.x + Math.sin(washer.yaw) * .55, .25, washer.pos.z + Math.cos(washer.yaw) * .55);
    const wd = moveWorker(washer, dt, standX, standZ, faceX, faceZ, 1.7, false);
    toolPos.lerp(toolAim, 1 - Math.exp(-dt * 14));
    if (running && gt && wd < .3 && toolPos.distanceTo(toolAim) < .12) {
      const prev = gs; gs += gt.speed * dt;
      const mx = gx(toolPos.x), my = gy(toolPos.y);
      if (gt.kind === 'wet') {
        gMask.rect(mx, my, 1, 0, .225 * gpm, .085 * gpm, opWet);
        if (Math.random() < dt * 30) spawn(1, toolPos.x + rand(-.2, .2), toolPos.y - .05, toolPos.z + .03, rand(-.1, .1), -.2, rand(.05, .3), 1.2, rand(.02, .035));
      } else {
        gMask.rect(mx, my, 1, 0, .045 * gpm, .235 * gpm, opSq);
        const segDir = Math.sign(gt.path.at(Math.min(gs + .05, gt.path.L), _c).x - toolPos.x);
        if (segDir && segDir !== lastRowDir) { for (let k = 0; k < 7; k++) spawn(1, toolPos.x, toolPos.y - rand(-.2, .2), toolPos.z + .03, rand(-.15, .15), rand(-.4, 0), rand(.05, .35), 1.4, rand(.02, .04)); lastRowDir = segDir; }
      }
      if (gs >= gt.path.L) { if (gt.kind === 'sq') finishPane(gt); gi++; gs = 0; }
    }
    wetHead.visible = !gt || gt.kind === 'wet' || !running; sqHead.visible = !wetHead.visible;
    // perche et mains
    washer.body.localToWorld(base.set(.02, 1.12, .3));
    pdir.subVectors(toolPos, base).normalize();
    placeStretch(pole, poleA.copy(base).addScaledVector(pdir, -.22), poleB.copy(toolPos).addScaledVector(pdir, -.05));
    tool.position.copy(toolPos); tool.rotation.set(0, 0, 0);
    tR.copy(base); tL.copy(base).addScaledVector(pdir, .42);
    setArms(washer, tL, tR);

    // Autolaveuse
    if (running && fs < fPath.L) {
      fPath.at(fs + .55, Sahead);
      const blocked = gt && Sahead.z < -2.0 && Math.abs(washer.pos.x - Sahead.x) < 1.3;
      if (!blocked) fs += .95 * dt;
    }
    Sprev.copy(S); fPath.at(fs, S); fPath.at(fs + .3, Sahead);
    _c.subVectors(Sahead, S); if (_c.lengthSq() > 1e-6) { const hd = Math.atan2(_c.x, _c.z); let df = hd - heading; df = Math.atan2(Math.sin(df), Math.cos(df)); heading += df * Math.min(1, dt * 5); }
    fwd.set(Math.sin(heading), 0, Math.cos(heading));
    scrubber.position.set(S.x, 0, S.z); scrubber.rotation.y = heading; scrubber.updateMatrixWorld(true);
    const moved = S.distanceTo(Sprev);
    if (running && moved > 1e-4) {
      const cx = (S.x + Sprev.x) / 2, cz = (S.z + Sprev.z) / 2;
      const f2x = fwd.x, f2y = -fwd.z;
      fMask.rect(fx(cx), fz(cz), f2x, f2y, (moved / 2 + .03) * fpm, .37 * fpm, opFloor);
      if (Math.random() < dt * 18) { const sd = Math.random() < .5 ? -1 : 1; spawn(2, S.x + fwd.x * .46 + fwd.z * .31 * sd, .02, S.z + fwd.z * .46 - fwd.x * .31 * sd, fwd.z * .12 * sd, 0, -fwd.x * .12 * sd, .7, rand(.025, .045)); }
    }
    for (let i = 0; i < 2; i++) scrubber.localToWorld(gripW[i].copy(grips[i]));
    moveWorker(operator, dt, S.x - fwd.x * .62, S.z - fwd.z * .62, S.x + fwd.x, S.z + fwd.z, 2, true);
    setArms(operator, gripW[0], gripW[1]);

    fMask.dry(dt, 75);
    fMask.flush(); gMask.flush();
    if (glintT >= 0) { glintT += dt; glint.value.z = -.4 + glintT * 2.1; if (glintT > 1.2) { glintT = -1; glint.value.z = -2; } }
    updateParticles(dt);
  }
  window.__resto = { step, skip: () => { intro = 1; cyaw = yaw; cel = el; } };

  /* ---------- Boucle ---------- */
  let last = performance.now(), time = 0, ft = 0, fn = 0, dprLocked = false, visible = true;
  const visObs = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) last = performance.now(); });
  visObs.observe(stage);
  const onVis = () => { last = performance.now(); };
  document.addEventListener('visibilitychange', onVis);
  updateCamera(0, 0); step(1 / 60, 0);
  renderer.render(scene, camera);
  stage.classList.add('is-ready');
  function frame(now) {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const raw = (now - last) / 1000; last = now;
    if (!visible || document.hidden) return;
    const dt = Math.min(.033, raw); time += dt;
    if (!dprLocked) {
      ft += raw; fn++;
      if (fn >= 48) {
        if (ft / fn < .02 && dpr < dprMax) { dpr = dprMax; renderer.setPixelRatio(dpr); resize(); }
        dprLocked = true;
      }
    }
    if (time < 0.7) {
      renderer.render(scene, camera);
      return;
    }
    updateCamera(dt, time);
    step(dt, time);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  dispose = () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    visObs.disconnect();
    resizeObs.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    cv.removeEventListener('pointermove', onPointerMove);
    cv.removeEventListener('pointerleave', onPointerOut);
    cv.removeEventListener('pointercancel', onPointerOut);
    renderer.dispose();
  };
}
start();
return () => { disposed = true; dispose(); };

}
