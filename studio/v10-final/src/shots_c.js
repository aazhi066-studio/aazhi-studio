// EPISODE 10 · worker C : "Raking-Light Stone Relief", lines 10-14 (the twelve years, Paranjothi, Vatapi Ganapati, Badami today, end card)
//   c1  L10 → "held"        sandstone city relief, a granite LION BANNER drops in and plants on the temple top (thud, chips); SOME ACCOUNTS plaque; raking sweep
//   c2  "held" → L11        time-lapse: sun and moon relief discs ride a carved arc over the city (light flips day/night), 12 tally notches chiselled into a granite slab; ABOUT 12 YEARS
//   c3  L11 → "and"         CHISEL CHIP REVEAL of the granite general (tall crown, sword, faceless) rising from the stone; TRADITION plaque; lion banner relief behind
//   c4  "and" → "became"    close-up: the sword swings down from upright and lands flat on a granite ledge on "war" (clank, chips, dust skirt)
//   c5  "became" → L12      the same figure seated calm in a warm halo glow, carved halo ring; lichen creeps, the carving weathers; TRADITION
//   c6  L12 → "worshipped"  RELIEF MAP (granite peninsula on a sunk sea): a small Ganesha icon is carried along a lit route channel Vatapi → Kanchi; LEGEND
//   c7  "worshipped" → "That"  temple niche cut in granite, Ganesha relief inside, bronze oil lamp flickers warm light up the carving, smoke wisp
//   c8  "That" → L13        LEGEND plaque slams in big under the Ganesha relief; RECORD plaque drops, a chisel strikes a groove through it and it greys
//   c9  L13 → "red"         Badami today: red sandstone cliff with cave-temple openings stepping up over the lake, daylight raking sun, rippling reflection; TODAY
//   c10 "red" → "The"       close on a cave facade: pillars and brackets, sun beam sweeps, FRIEZE TRACK along a gana band, lichen spots creep in
//   c11 "The" → L14         carved flames over sandstone roofs: the fire light fades out of the carving, wind blows sand across and buries the flames
//   c12 L14 → "Follow"      SLAB SLIDE: three stone slabs drop one by one on "defeat" / "revenge" / "burning": broken banner, raised sword, burning city
//   c13 "Follow" → end      end card: FOLLOW bronze plaque, AAZHI chisel-carved into granite letter by letter, raking light sweep, closing line
import { ctx, W, H, TAU, clamp, lerp, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, lg, rgba, mixc } from './art.js';

const GR = { base: '#8C8A85', lt: '#C9C5BC', dk: '#3F3D3A' };
const SS = { base: '#A4553A', lt: '#D88A62', dk: '#5A2A1C' };
const FIRE = '#FF8A2A', FIRE2 = '#FFD27A';
const ST = (k) => (k === 'ss' ? SS : GR);
const sg = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t) => t * t * (3 - 2 * t);

// ───────────── stone textures (generated once) ─────────────
const tex = (k) => cached('c:tex:' + k, 640, 640, 1, () => {
  const S = ST(k), N = 640;
  ctx.fillStyle = S.base; ctx.fillRect(0, 0, N, N);
  const wrap = (f) => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { ctx.save(); ctx.translate(ox, oy); f(); ctx.restore(); } };
  for (let i = 0; i < 46; i++) {
    const x = rnd(i * 3.7 + 1) * N, y = rnd(i * 5.1 + 2) * N, r = 60 + rnd(i * 2.3) * 180, c = i % 2 ? S.lt : S.dk;
    wrap(() => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(c, 0.13)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); });
  }
  if (k === 'ss') { // soft bedding stripes, periodic in x
    for (let y = 0, j = 0; y < N; y += 9 + rnd(j * 3.3) * 22, j++) {
      ctx.beginPath(); for (let x = 0; x <= N; x += 16) { const yy = y + Math.sin((x / N) * TAU * 2 + j) * 4 + Math.sin((x / N) * TAU * 5 + j * 2) * 1.5; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.strokeStyle = j % 3 ? rgba(S.dk, 0.08 + rnd(j) * 0.1) : rgba(S.lt, 0.12); ctx.lineWidth = 1.5 + rnd(j * 7) * 4; ctx.stroke();
    }
    for (let i = 0; i < 2600; i++) { ctx.fillStyle = i % 2 ? 'rgba(60,20,10,0.12)' : 'rgba(255,210,170,0.10)'; ctx.fillRect(rnd(i * 1.3) * N, rnd(i * 2.9 + 3) * N, 1.5, 1.5); }
  } else { // granite: black + white mica speckle
    for (let i = 0; i < 5200; i++) {
      const x = rnd(i * 1.37) * N, y = rnd(i * 2.91 + 4) * N, r = 0.7 + rnd(i * 4.1) * 1.9, m = rnd(i * 6.6);
      ctx.fillStyle = m < 0.45 ? `rgba(20,20,22,${0.25 + rnd(i) * 0.4})` : m < 0.8 ? `rgba(240,238,230,${0.18 + rnd(i + 2) * 0.35})` : `rgba(120,100,90,0.3)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
});
const pat = (k) => ctx.createPattern(tex(k), 'repeat');

// ───────────── shape builders (Path2D) ─────────────
const P2 = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; };
const E2 = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; };
const R2 = (x, y, w, h, r = 0) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const limb = (x0, y0, x1, y1, w0, w1) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; return P2([[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]]); };
function tube(pts, w0, w1) {
  const Lf = [], Rt = [];
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    Lf.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rt.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
  return P2(Lf.concat(Rt.reverse()));
}
function frameP(x, y, w, h, b) { const p = new Path2D(); p.moveTo(x, y); p.lineTo(x + w, y); p.lineTo(x + w, y + h); p.lineTo(x, y + h); p.closePath(); p.moveTo(x + b, y + b); p.lineTo(x + b, y + h - b); p.lineTo(x + w - b, y + h - b); p.lineTo(x + w - b, y + b); p.closePath(); return p; }
function ringP(x, y, r0, r1) { const p = new Path2D(); p.arc(x, y, r1, 0, TAU, false); p.moveTo(x + r0, y); p.arc(x, y, r0, 0, TAU, true); return p; }
function flameP(x, y, w, h, lean) {
  const p = new Path2D(); p.moveTo(x - w / 2, y); p.quadraticCurveTo(x - w * 0.55, y - h * 0.55, x + lean, y - h); p.quadraticCurveTo(x + w * 0.2, y - h * 0.62, x + w * 0.12, y - h * 0.45);
  p.quadraticCurveTo(x + w * 0.5, y - h * 0.5, x + w / 2, y); p.quadraticCurveTo(x, y + w * 0.2, x - w / 2, y); return p;
}

// figures (origin at the feet / base centre, faceless)
let _gen, _genArm, _saint, _saintArm, _gan, _ganF, _lion, _city, _sword;
const GEN = () => _gen ||= [
  P2([[-31, -530], [31, -530], [24, -580], [14, -628], [0, -662], [-14, -628], [-24, -580]]), E2(0, -500, 31, 38), R2(-13, -478, 26, 28),
  E2(-70, -446, 26, 22), E2(70, -446, 26, 22),
  P2([[-80, -462], [80, -462], [70, -420], [44, -340], [36, -300], [-36, -300], [-44, -340], [-70, -420]]),
  P2([[-44, -308], [44, -308], [68, -210], [60, -146], [-60, -146], [-68, -210]]), P2([[-62, -214], [-104, -150], [-66, -140]]),
  limb(-24, -160, -26, -14, 36, 24), limb(24, -160, 26, -14, 36, 24), P2([[-54, -20], [-8, -20], [-2, 0], [-60, 0]]), P2([[8, -20], [54, -20], [60, 0], [2, 0]]),
  E2(-112, -300, 50, 56), // round shield on the far arm
];
const GENARM = () => _genArm ||= [
  limb(74, -450, 106, -350, 32, 26), limb(106, -350, 118, -284, 26, 22), E2(118, -280, 15, 15),
  P2([[110, -292], [126, -292], [124, -596], [118, -630], [112, -596]]), R2(96, -302, 44, 12, 4), E2(118, -276, 9, 9),
  limb(-74, -450, -100, -350, 30, 24), E2(-112, -300, 18, 18),
];
const SAINT = () => _saint ||= [
  P2([[-170, 0], [170, 0], [158, -40], [120, -78], [60, -100], [-60, -100], [-120, -78], [-158, -40]]), E2(-52, -290, 24, 20), E2(52, -290, 24, 20),
  P2([[-60, -304], [60, -304], [52, -240], [42, -170], [48, -100], [-48, -100], [-42, -170], [-52, -240]]),
  R2(-12, -326, 24, 30), E2(0, -360, 32, 40), E2(0, -414, 24, 26), E2(0, -440, 14, 14),
];
const SAINTARM = () => _saintArm ||= [tube([[-60, -290], [-82, -230], [-86, -175], [-60, -134], [-22, -116]], 28, 18), tube([[60, -290], [82, -230], [86, -175], [60, -134], [22, -116]], 28, 18), E2(0, -112, 36, 16)];
const GAN = () => _gan ||= [R2(-60, -14, 120, 14, 4), E2(0, -26, 56, 17), E2(0, -60, 41, 37), E2(-38, -120, 21, 27, -0.25), E2(38, -120, 21, 27, 0.25), E2(0, -118, 27, 26), P2([[-17, -140], [17, -140], [9, -162], [0, -174], [-9, -162]])];
const GANF = () => _ganF ||= [tube([[3, -104], [2, -88], [-2, -74], [-10, -62], [-22, -58], [-28, -68]], 16, 8), limb(-34, -84, -58, -58, 14, 11), limb(34, -84, 58, -58, 14, 11), E2(60, -54, 9, 8)];
const LION = () => _lion ||= [
  P2([[-56, -12], [36, -20], [52, 0], [50, 22], [-50, 22], [-62, 6]]), E2(40, -16, 27, 29), E2(64, -14, 13, 10),
  R2(-52, 16, 13, 30, 3), R2(-30, 16, 13, 30, 3), R2(18, 16, 13, 30, 3), R2(38, 16, 13, 30, 3),
  tube([[-58, 0], [-80, -18], [-76, -42], [-64, -50]], 9, 6), E2(-62, -52, 9, 8),
];
const CITY = () => _city ||= (() => { // sandstone city, origin bottom-left, 700 wide
  const a = [R2(0, -140, 700, 140)];
  for (let i = 0; i < 15; i++) a.push(R2(8 + i * 47, -162, 26, 26, 2));
  a.push(R2(30, -270, 100, 270), R2(570, -258, 100, 258));
  for (const x0 of [30, 570]) for (let i = 0; i < 3; i++) a.push(R2(x0 + 4 + i * 36, -292 + (x0 > 300 ? 12 : 0), 22, 26, 2));
  a.push(R2(250, -230, 200, 92), R2(274, -302, 152, 76), R2(298, -364, 104, 66), P2([[314, -364], [386, -364], [372, -404], [350, -424], [328, -404]]));
  a.push(R2(150, -204, 86, 66), P2([[140, -204], [246, -204], [193, -244]]), R2(470, -212, 86, 74), P2([[460, -212], [566, -212], [513, -254]]));
  return a;
})();
const SWORD = () => _sword ||= [P2([[-150, -14], [230, -11], [270, 0], [230, 11], [-150, 14]]), R2(-170, -44, 22, 88, 6), R2(-250, -12, 82, 24, 8), E2(-262, 0, 16, 16)];

// ───────────── the relief renderer ─────────────
/** raised relief: cast shadow away from the light, bright rim toward it, then the textured face. a = angle pointing TO the light */
function relief(parts, o = {}) {
  const st = o.st || 'gr', S = ST(st), a = o.a ?? -2.3, d = o.d ?? 8, x = o.x || 0, y = o.y || 0, s = o.s || 1, sy = o.sy ?? s;
  const lx = Math.cos(a), ly = Math.sin(a), arr = Array.isArray(parts) ? parts : [parts];
  const pass = (ox, oy, fs) => { ctx.save(); ctx.translate(x + ox, y + oy); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, sy); ctx.fillStyle = fs; for (const p of arr) ctx.fill(p); ctx.restore(); };
  pass(-lx * d * 1.3, -ly * d * 1.3, 'rgba(10,8,6,0.22)'); pass(-lx * d, -ly * d, 'rgba(10,8,6,0.4)');
  pass(-lx * d * 0.5, -ly * d * 0.5, rgba(S.dk, 0.92));
  pass(lx * 3.4, ly * 3.4, o.rim || S.lt);
  pass(0, 0, pat(st)); pass(0, 0, st === 'ss' ? 'rgba(255,200,160,0.07)' : 'rgba(255,250,240,0.11)');
  if (o.tint) pass(0, 0, o.tint);
  if (o.bb) { // directional shading across the face
    const [cx, cy, R] = o.bb; ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, sy);
    ctx.fillStyle = lg(cx + lx * R, cy + ly * R, cx - lx * R, cy - ly * R, [[0, 'rgba(255,244,222,0.20)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.28)']]);
    for (const p of arr) ctx.fill(p); ctx.restore();
  }
}
/** sunk (cut-in) shape: lit lip on the far wall, shadow on the near-light wall, darker floor */
function sunk(path, o = {}) {
  const S = ST(o.st || 'gr'), a = o.a ?? -2.3, d = o.d ?? 8, lx = Math.cos(a), ly = Math.sin(a), x = o.x || 0, y = o.y || 0, s = o.s || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(-lx * 2.4 / s, -ly * 2.4 / s); ctx.fillStyle = S.lt; ctx.fill(path); ctx.restore();
  ctx.save(); ctx.clip(path); ctx.fillStyle = o.deep || '#120d0a'; ctx.fill(path);
  ctx.translate(-lx * d / s, -ly * d / s); ctx.fillStyle = pat(o.st || 'gr'); ctx.fill(path); ctx.fillStyle = o.floor || 'rgba(15,10,8,0.42)'; ctx.fill(path); ctx.restore();
  ctx.restore();
}
/** carved (incised) caps text, light-direction aware. p = left-to-right reveal */
let SCR = null;
function carve(s, x, y, size, o = {}) {
  const st = o.st || 'gr', S = ST(st), a = o.a ?? -2.3, alpha = o.alpha ?? 1, p = o.p ?? 1;
  if (alpha <= 0 || p <= 0) return null;
  const lx = Math.cos(a), ly = Math.sin(a), dep = o.dep ?? Math.max(2, size * 0.05);
  ctx.save();
  ctx.font = o.font || `900 ${size}px Inter`; const lsp = Math.round(size * (o.ls ?? 0.06)); ctx.letterSpacing = lsp + 'px';
  const tw = ctx.measureText(s).width, f = Math.min(1, (o.maxW ?? 960) / tw) * (o.sc || 1);
  const cw = Math.ceil(tw + size * 0.5), chh = Math.ceil(size * 1.5);
  if (!SCR) SCR = document.createElement('canvas');
  if (SCR.width < cw || SCR.height < chh) { SCR.width = Math.max(SCR.width, cw); SCR.height = Math.max(SCR.height, chh); }
  const c = SCR.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, cw + 2, chh + 2);
  c.font = ctx.font; c.letterSpacing = ctx.letterSpacing; c.textAlign = 'center'; c.textBaseline = 'middle';
  const cx = cw / 2 + lsp / 2, cy = chh / 2;
  c.fillStyle = o.deep || '#15100c'; c.fillText(s, cx, cy);
  c.globalCompositeOperation = 'source-atop'; c.fillStyle = c.createPattern(tex(st), 'repeat'); c.fillText(s, cx - lx * dep, cy - ly * dep);
  c.fillStyle = o.floor || 'rgba(20,12,8,0.55)'; c.fillText(s, cx - lx * dep, cy - ly * dep);
  if (o.glow) { c.fillStyle = o.glow; c.fillText(s, cx - lx * dep, cy - ly * dep); }
  ctx.translate(x, y); ctx.scale(f, f); ctx.globalAlpha *= alpha;
  if (p < 1) { ctx.beginPath(); ctx.rect(-cw / 2, -chh / 2, cw * p, chh); ctx.clip(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba(S.lt, 0.85); ctx.fillText(s, lsp / 2 - lx * 1.8, -ly * 1.8);
  ctx.drawImage(SCR, 0, 0, cw, chh, -cw / 2, -chh / 2, cw, chh);
  ctx.restore(); ctx.letterSpacing = '0px';
  return { w: cw * f, x0: x - (cw / 2) * f };
}
function note(s, x, y, size, col, a = 1, align = 'center') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea, serif`; ctx.letterSpacing = '3px'; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,240,215,0.35)'; ctx.fillText(s, x + 1, y + 2); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** BRONZE PLAQUE: bevelled plate, engraved caps, two rivets; pops in with p; grey = tarnished/struck */
function plaque(s, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const { rot = 0, grey = 0, glint = -1 } = o, sc = eob(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(p * 4);
  ctx.font = `900 ${size}px Inter`; const lsp = Math.round(size * 0.12); ctx.letterSpacing = lsp + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(s).width, w = tw + size * 2.3, h = size * 1.85, x0 = -w / 2, y0 = -h / 2, r = size * 0.16;
  ctx.fillStyle = 'rgba(8,6,4,0.5)'; ctx.beginPath(); ctx.roundRect(x0 + 8, y0 + 10, w, h, r); ctx.fill();
  const c1 = mixc('#E6C77E', '#A8A49B', grey), c2 = mixc('#B08A42', '#7E7B74', grey), c3 = mixc('#6A4E1E', '#55534F', grey);
  ctx.fillStyle = lg(x0, y0, x0 + w * 0.35, y0 + h * 1.8, [[0, c1], [0.45, c2], [1, c3]]); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba('#FFF2CC', 0.6 - grey * 0.3); ctx.beginPath(); ctx.moveTo(x0 + r, y0 + 2); ctx.lineTo(x0 + w - r, y0 + 2); ctx.moveTo(x0 + 2, y0 + r); ctx.lineTo(x0 + 2, y0 + h - r); ctx.stroke();
  ctx.strokeStyle = 'rgba(30,18,6,0.55)'; ctx.beginPath(); ctx.moveTo(x0 + r, y0 + h - 2); ctx.lineTo(x0 + w - r, y0 + h - 2); ctx.moveTo(x0 + w - 2, y0 + r); ctx.lineTo(x0 + w - 2, y0 + h - r); ctx.stroke();
  const ins = size * 0.24; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,24,8,0.4)'; ctx.beginPath(); ctx.roundRect(x0 + ins, y0 + ins, w - 2 * ins, h - 2 * ins, r * 0.6); ctx.stroke();
  ctx.strokeStyle = rgba('#FFE9B0', 0.25); ctx.beginPath(); ctx.roundRect(x0 + ins + 1.5, y0 + ins + 1.5, w - 2 * ins, h - 2 * ins, r * 0.6); ctx.stroke();
  ctx.fillStyle = rgba('#FFE9B0', 0.55 - grey * 0.25); ctx.fillText(s, lsp / 2 + 1.5, 3);
  ctx.fillStyle = mixc('#2A1B08', '#34332F', grey); ctx.fillText(s, lsp / 2, 1);
  for (const sx of [-1, 1]) {
    const rx = sx * (w / 2 - size * 0.55), rr = size * 0.15;
    ctx.fillStyle = 'rgba(20,12,4,0.6)'; ctx.beginPath(); ctx.arc(rx + 1.5, 2.5, rr, 0, TAU); ctx.fill();
    ctx.fillStyle = lg(rx - rr, -rr, rx + rr, rr, [[0, c1], [1, c3]]); ctx.beginPath(); ctx.arc(rx, 0, rr, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,215,0.7)'; ctx.beginPath(); ctx.arc(rx - rr * 0.35, -rr * 0.35, rr * 0.3, 0, TAU); ctx.fill();
  }
  if (glint >= 0 && glint <= 1) {
    ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const gx = x0 - h + (w + 2 * h) * glint; ctx.transform(1, 0, -0.5, 1, 0, 0);
    ctx.fillStyle = lg(gx - 50, 0, gx + 50, 0, [[0, 'rgba(255,236,190,0)'], [0.5, 'rgba(255,236,190,0.55)'], [1, 'rgba(255,236,190,0)']]); ctx.fillRect(gx - 50, y0, 100, h);
  }
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── light, air, particles ─────────────
function field(st, ox = 0, oy = 0, dark = 0) {
  ctx.save(); ctx.translate(ox, oy); ctx.fillStyle = pat(st); ctx.fillRect(-ox - 220, -oy - 220, W + 440, H + 440); ctx.restore();
  ctx.fillStyle = `rgba(8,6,5,${0.12 + dark})`; ctx.fillRect(-220, -220, W + 440, H + 440);
}
/** raking light wash: warm from the light side, falling into shadow on the far side */
function rake(a, k = 1, warm = '#FFE6BE', cx = 540, cy = 820) {
  const lx = Math.cos(a), ly = Math.sin(a), R = 1250;
  ctx.fillStyle = lg(cx + lx * R, cy + ly * R, cx - lx * R, cy - ly * R, [[0, rgba(warm, 0.24 * k)], [0.42, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${0.55 * k})`]]);
  ctx.fillRect(-220, -220, W + 440, H + 440);
}
/** a bright slanted beam band sliding across (additive) */
function beam(x, w, a = 0.18, col = '#FFE2B0', tilt = 0.35) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, 900); ctx.rotate(tilt);
  ctx.fillStyle = lg(-w, 0, w, 0, [[0, rgba(col, 0)], [0.5, rgba(col, a)], [1, rgba(col, 0)]]); ctx.fillRect(-w, -1700, 2 * w, 3400); ctx.restore();
}
function glow(x, y, r, col, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.4, rgba(col, a * 0.4)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
const vigImg = () => cached('c:vig', W + 400, H + 400, 0.4, () => { const g = ctx.createRadialGradient(740, 1000, 380, 740, 1060, 1350); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W + 400, H + 400); });
const vig = (a = 1) => blit(vigImg(), 200, 200, 0, 0, 1, a);
function motes(t, n = 26, seed = 0, col = '255,232,190', a = 0.45) {
  for (let i = 0; i < n; i++) {
    const sp = 10 + rnd(i + seed) * 26, x = ((rnd(i * 3 + seed) * (W + 200) + t * sp) % (W + 200)) - 100, y = ((rnd(i * 7 + seed) * H - t * 12 * rnd(i + 5) + Math.sin(t * 0.7 + i) * 30) % H + H) % H;
    ctx.fillStyle = `rgba(${col},${a * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.3)))})`; ctx.fillRect(x, y, 2 + rnd(i + 9) * 3, 2 + rnd(i + 9) * 3);
  }
}
function chips(x, y, age, n, seed, col = '#D6D0C4', pw = 1) {
  if (age < 0 || age > 0.85) return;
  for (let i = 0; i < n; i++) {
    const r1 = rnd(seed + i * 1.7), r2 = rnd(seed + i * 3.1 + 5), r3 = rnd(seed + i * 7.3 + 2);
    const px = x + (r1 - 0.5) * 760 * pw * age, py = y - (140 + r2 * 520) * pw * age + 1500 * age * age, sz = (2.5 + r3 * 7) * Math.sqrt(pw);
    ctx.save(); ctx.translate(px, py); ctx.rotate(age * 14 * (r1 - 0.5) + i); ctx.globalAlpha *= 1 - age / 0.85;
    ctx.fillStyle = i % 3 ? col : 'rgba(40,30,24,0.9)'; ctx.beginPath(); ctx.moveTo(-sz, -sz * 0.4); ctx.lineTo(sz * 0.8, -sz * 0.6); ctx.lineTo(sz * 0.2, sz * 0.7); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function puff(x, y, age, r = 80, col = '210,200,186', a = 0.4, wide = 1) {
  if (age < 0 || age > 1.5) return;
  const k = 1 - age / 1.5;
  for (let i = 0; i < 8; i++) {
    const cx = x + (rnd(i * 2.2) - 0.5) * r * 2.4 * wide * (0.35 + age), cy = y - age * 50 * rnd(i + 3) - r * 0.15, rr = r * (0.35 + age * 0.9) * (0.6 + rnd(i + 7) * 0.6);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, `rgba(${col},${a * k})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(cx - rr, cy - rr, 2 * rr, 2 * rr);
  }
}
/** continuous chip spray from a moving chisel point: pos(time) → [x, y] */
function spray(pos, t, t0, t1, seed, col, n = 3) {
  const step = 0.05;
  for (let k = Math.ceil(Math.max(t0, t - 0.8) / step); k * step <= Math.min(t, t1); k++) { const tk = k * step, [px, py] = pos(tk); chips(px, py, t - tk, n, seed + k * 13.7, col, 0.7); }
}
function chisel(x, y, t, ang = -0.75, s = 1) {
  const tap = Math.abs(Math.sin(t * 30)) * 9;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.translate(-tap, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(10, 8, 190, 16);
  ctx.fillStyle = lg(0, -8, 0, 8, [[0, '#9AA0A6'], [0.5, '#4D5257'], [1, '#2A2D31']]); ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(22, -8); ctx.lineTo(170, -8); ctx.lineTo(170, 8); ctx.lineTo(22, 8); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lg(0, -11, 0, 11, [[0, '#8A6A3E'], [1, '#4A3218']]); ctx.beginPath(); ctx.roundRect(150, -11, 70, 22, 6); ctx.fill();
  ctx.fillStyle = '#FFF4D8'; ctx.fillRect(0, -1.5, 8, 3);
  ctx.restore();
}
function lichen(seed, n, x0, y0, w, h, g, a = 0.6) {
  if (g <= 0) return;
  for (let i = 0; i < n; i++) {
    const r = (3 + rnd(seed + i * 2.7) * 15) * clamp(g * 1.6 - rnd(seed + i) * 0.7); if (r <= 0.3) continue;
    const x = x0 + rnd(seed + i * 5.3) * w, y = y0 + rnd(seed + i * 9.1) * h;
    for (let k = 0; k < 5; k++) { const ox = (rnd(seed + i * 3 + k * 1.7) - 0.5) * r * 2.2, oy = (rnd(seed + i * 7 + k * 2.3) - 0.5) * r * 1.4, rk = r * (0.25 + rnd(seed + i + k * 4.1) * 0.35);
      ctx.fillStyle = k % 2 ? `rgba(150,160,96,${a * 0.6})` : `rgba(96,112,60,${a * 0.55})`; ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rk * 1.3, rk, 0, 0, TAU); ctx.fill(); }
  }
}
function sparks(t, n, x0, x1, yb, seed = 0, a = 0.9) {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.25 + rnd(i + seed) * 0.35) + rnd(i * 3 + seed)) % 1, x = lerp(x0, x1, rnd(i * 5 + seed)) + Math.sin(ph * 7 + i) * 40, y = yb - ph * 900;
    ctx.fillStyle = `rgba(255,${180 + Math.round(rnd(i) * 60)},90,${a * (1 - ph)})`; ctx.fillRect(x, y, 3 + rnd(i + 2) * 3, 3 + rnd(i + 2) * 3);
  }
}
const shake = (lt, t0, amp = 10) => { const k = lt - t0; if (k < 0 || k > 0.5) return [0, 0]; const e = amp * Math.exp(-k * 9); return [Math.sin(k * 70) * e, Math.cos(k * 53) * e * 0.8]; };

// ───────────── set pieces ─────────────
function lionBanner(x, y, a, t, s = 1, st = 'gr', wave = 1) { // pole base at (x, y)
  const pole = [R2(-7, -470, 14, 470, 4), E2(0, -478, 13, 13)];
  relief(pole, { x, y, s, a, d: 6, st });
  const pts = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10, xx = 8 + u * 250, dy = Math.sin(t * 5 - u * 4) * 10 * u * wave; pts.push([xx, -460 + dy]); }
  const bot = []; for (let i = 10; i >= 0; i--) { const u = i / 10, xx = 8 + u * 250, dy = Math.sin(t * 5 - u * 4) * 10 * u * wave; bot.push([xx - (i === 10 ? 40 : 0), -300 + dy - (i === 10 ? 80 : 0)]); }
  const pen = P2(pts.concat(bot));
  relief(pen, { x, y, s, a, d: 7, st });
  const my = Math.sin(t * 5 - 2) * 5 * wave;
  relief(LION(), { x: x + 128 * s, y: y + (-386 + my) * s, s: s * 0.95, a, d: 4, st });
}
function cityRelief(x, y, a, s = 1, o = {}) {
  relief(CITY(), { x, y, s, a, d: o.d ?? 9, st: 'ss', tint: o.tint, bb: [350, -200, 420] });
  sunk(R2(310, -110, 80, 110, [40, 40, 0, 0]), { x, y, s, a, st: 'ss', d: 10 });
  for (const [gx, gy] of [[68, -230], [608, -220], [178, -180], [498, -186], [330, -280], [366, -280]]) sunk(R2(gx, gy, 18, 28, [9, 9, 0, 0]), { x, y, s, a, st: 'ss', d: 4 });
}
function ganesha(x, y, s, a, o = {}) {
  relief(GAN(), { x, y, s, a, d: o.d ?? 8, st: o.st || 'gr', tint: o.tint, rim: o.rim, bb: [0, -90, 110] });
  relief(GANF(), { x, y, s, a, d: (o.d ?? 8) * 0.55, st: o.st || 'gr', tint: o.tint, rim: o.rim });
}

// relief map
const MAPL = [[-140, -40], [10, 60], [40, 300], [88, 520], [121, 565], [231, 851], [341, 1034], [385, 1172], [528, 1378], [594, 1290], [726, 1235], [786, 1125], [781, 949], [836, 817], [814, 663], [913, 531], [1045, 410], [1166, 322], [1240, 260], [1240, -40]];
const VAT = [330, 520], KAN = [770, 869];
const ROUTE = Array.from({ length: 41 }, (_, i) => { const u = i / 40, c = [500, 760]; return [(1 - u) * (1 - u) * VAT[0] + 2 * u * (1 - u) * c[0] + u * u * KAN[0], (1 - u) * (1 - u) * VAT[1] + 2 * u * (1 - u) * c[1] + u * u * KAN[1]]; });
const routeAt = (u) => { const f = clamp(u) * 40, i = Math.min(39, Math.floor(f)), k = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], k), lerp(ROUTE[i][1], ROUTE[i + 1][1], k)]; };
const seaImg = () => cached('c:sea', W + 400, H + 400, 0.6, () => {
  ctx.translate(200, 200); ctx.fillStyle = pat('gr'); ctx.fillRect(-200, -200, W + 400, H + 400); ctx.fillStyle = 'rgba(14,18,26,0.62)'; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.lineCap = 'round';
  for (let y = -160, j = 0; y < H + 200; y += 46, j++) for (let x = -180 + (j % 2) * 60; x < W + 200; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 22, y - 14, x + 44, y); ctx.quadraticCurveTo(x + 66, y + 14, x + 88, y);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; ctx.stroke(); ctx.translate(1.5, 2); ctx.strokeStyle = 'rgba(190,200,210,0.16)'; ctx.lineWidth = 2; ctx.stroke(); ctx.translate(-1.5, -2);
  }
});

// Badami cliff (cached daylight layer, x from -120, y 0..1100; waterline at 1000)
const CAVES = [[110, 812, 170, 112], [380, 712, 200, 122], [640, 594, 206, 126], [880, 506, 176, 116]];
const cliffTop = (x) => 360 - 150 * sm(clamp((x + 100) / 1300)) + Math.sin(x * 0.011 + 1) * 30 + Math.sin(x * 0.031) * 12;
const cliffImg = () => cached('c:cliff', W + 240, 1100, 0.8, () => {
  ctx.translate(120, 0);
  const mass = new Path2D(); mass.moveTo(-120, 1010); for (let x = -120; x <= W + 120; x += 20) mass.lineTo(x, cliffTop(x)); mass.lineTo(W + 120, 1010); mass.closePath();
  ctx.fillStyle = 'rgba(70,30,20,0.5)'; ctx.save(); ctx.translate(10, 12); ctx.fill(mass); ctx.restore();
  ctx.fillStyle = pat('ss'); ctx.fill(mass);
  ctx.save(); ctx.clip(mass);
  ctx.fillStyle = lg(0, 200, 0, 1010, [[0, 'rgba(255,214,170,0.28)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(40,12,6,0.45)']]); ctx.fillRect(-120, 0, W + 240, 1010);
  for (let i = 0; i < 16; i++) { // big fractured block faces
    const x = -100 + rnd(i * 4.1) * (W + 200), y = cliffTop(x) + 30 + rnd(i * 2.7) * 520, w = 120 + rnd(i * 3.3) * 220, h = 60 + rnd(i * 5.9) * 160;
    ctx.fillStyle = i % 2 ? 'rgba(255,190,150,0.10)' : 'rgba(60,20,10,0.16)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 10); ctx.lineTo(x + w - 20, y + h); ctx.lineTo(x + 14, y + h - 8); ctx.closePath(); ctx.fill();
  }
  for (let y = 220, j = 0; y < 1010; y += 34 + rnd(j) * 30, j++) { // strata
    ctx.beginPath(); for (let x = -120; x <= W + 120; x += 30) { const yy = y + Math.sin(x * 0.006 + j) * 10 + (x * 0.04); x > -120 ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
    ctx.strokeStyle = 'rgba(60,18,8,0.32)'; ctx.lineWidth = 3; ctx.stroke(); ctx.translate(0, 3); ctx.strokeStyle = 'rgba(255,196,150,0.18)'; ctx.lineWidth = 2; ctx.stroke(); ctx.translate(0, -3);
  }
  for (let i = 0; i < 22; i++) { // vertical joints
    const x = -100 + rnd(i * 7.7) * (W + 200), y0 = cliffTop(x) + 10, l = 120 + rnd(i * 1.9) * 420;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 8, y0 + l * 0.4); ctx.lineTo(x - 4, y0 + l); ctx.strokeStyle = 'rgba(40,12,6,0.45)'; ctx.lineWidth = 3; ctx.stroke();
  }
  for (const [x, y, w, h] of CAVES) { // cave temples: ledge, opening, pillars, steps
    ctx.fillStyle = 'rgba(255,200,160,0.25)'; ctx.fillRect(x - 18, y - 22, w + 36, 12); ctx.fillStyle = 'rgba(40,12,6,0.5)'; ctx.fillRect(x - 18, y - 10, w + 36, 8);
    ctx.fillStyle = '#1C0B06'; ctx.fillRect(x, y, w, h);
    const np = 4; for (let k = 0; k < np; k++) { const px = x + 8 + k * (w - 30) / (np - 1); ctx.fillStyle = '#B86848'; ctx.fillRect(px, y + 8, 16, h - 8); ctx.fillStyle = '#7A3A24'; ctx.fillRect(px + 10, y + 8, 6, h - 8); ctx.fillStyle = '#D28C66'; ctx.fillRect(px - 4, y + 6, 24, 8); }
    for (let s = 0; s < 4; s++) { ctx.fillStyle = s % 2 ? 'rgba(255,200,160,0.25)' : 'rgba(40,12,6,0.4)'; ctx.fillRect(x + w * 0.3 - s * 6, y + h + s * 7, w * 0.4 + s * 12, 4); }
  }
  ctx.restore();
  // little shrine on the lake edge
  const sh = [R2(30, 930, 130, 70), R2(46, 880, 98, 52), R2(62, 842, 66, 40), P2([[70, 842], [120, 842], [108, 812], [95, 800], [82, 812]])];
  ctx.fillStyle = 'rgba(40,14,8,0.5)'; ctx.save(); ctx.translate(8, 6); sh.forEach((p) => ctx.fill(p)); ctx.restore();
  ctx.fillStyle = '#E09A72'; ctx.save(); ctx.translate(-2.5, -2.5); sh.forEach((p) => ctx.fill(p)); ctx.restore();
  ctx.fillStyle = pat('ss'); sh.forEach((p) => ctx.fill(p));
  ctx.fillStyle = 'rgba(50,20,12,0.6)'; ctx.fillRect(-120, 990, W + 240, 20);
});

// ───────────── shots ─────────────
export function buildC(add, cue) {
  const T10 = L(10), tPal = Wd('pallavas', 10), tHeld = Wd('held', 10), tTwelve = Wd('twelve', 10);
  const T11 = L(11), tTrad = Wd('tradition', 11), tPar = Wd('paranjothi', 11), tAnd = Wd('and', 11), tWar = Wd('war', 11), tBec = Wd('became', 11), tSaint = Wd('saint', 11);
  const T12 = L(12), tCar = Wd('carried', 12), tGan = Wd('ganesha', 12), tWor = Wd('worshipped', 12), tVat = Wd('vatapi', 12), tThat = Wd('that', 12), tLeg = Wd('legend', 12), tRec = Wd('record', 12);
  const T13 = L(13), tBad = Wd('badami', 13), tRed = Wd('red', 13), tCaves = Wd('caves', 13), tThe = Wd('the', 13), tFire = Wd('fire', 13), tRare = Wd('rarely', 13), tTold = Wd('told', 13);
  const T14 = L(14), tDef = Wd('defeat', 14), tRev = Wd('revenge', 14), tBurn = Wd('burning', 14), tFol = Wd('follow', 14), tAaz = Wd('aazhi', 14), tSto = Wd('stories', 14);

  // c1 · sandstone city, granite lion banner planted on top
  const c1 = (lt, d) => {
    const a = lerp(-2.75, -1.75, eio(lt / d)), land = tPal - T10;
    const [sx, sy] = shake(lt, land, 12); ctx.translate(sx, sy);
    field('ss', -lt * 20, 0);
    // carved sun disc in the upper corner, the source of the light
    relief([E2(0, 0, 70, 70)], { x: 170 + lt * 30, y: 300, a: -2.4, d: 6, st: 'ss', tint: 'rgba(255,190,120,0.25)' });
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + lt * 0.3; relief(limb(Math.cos(an) * 88, Math.sin(an) * 88, Math.cos(an) * 128, Math.sin(an) * 128, 16, 4), { x: 170 + lt * 30, y: 300, a: -2.4, d: 4, st: 'ss' }); }
    relief(frameP(40, 120, 1000, 1160, 34), { a, d: 9, st: 'ss' });
    relief([R2(74, 1080, 932, 60)], { a, d: 6, st: 'ss' }); // ground line
    cityRelief(190, 1080, a, 1);
    const p = eo(sg(lt, land - 0.55, land)), by = lerp(-700, 0, p * p);
    if (lt > land - 0.6) lionBanner(540, 706 + by, a, lt, 1, 'gr', lt > land ? 1 - Math.exp(-(lt - land) * 2) : 0);
    chips(540, 706, lt - land, 16, 11, '#D88A62', 1.1); puff(540, 712, lt - land, 90, '230,190,160', 0.45);
    rake(a, 1, '#FFD9A8'); beam(lerp(-200, 1300, lt / d), 160, 0.12);
    plaque('SOME ACCOUNTS', 540, 236, 40, sg(lt, 0.05, 0.4), { rot: -0.02, glint: sg(lt, 0.5, 1.3) });
    motes(lt + 10, 24, 3); vig();
  };
  add({ id: 'c1', at: T10, cam: [540, 760], zoom: 0.07, note: 'sandstone city relief, granite lion banner drops and plants on the temple top on "Pallavas" (chips, dust); SOME ACCOUNTS plaque; raking sweep', draw: c1 });
  cue(T10 + 0.05, 'pop', { gain: 0.35 }); cue(tPal - 0.35, 'whoosh', { gain: 0.35 }); cue(tPal, 'thud', { gain: 0.7 });

  // c2 · time-lapse: sun & moon over the city, 12 notches cut into a tally slab
  const NOT = Array.from({ length: 12 }, (_, i) => 0.3 + (T11 - tHeld - 0.75) * Math.pow(i / 11, 0.85));
  const c2 = (lt, d) => {
    const k = lt / 0.62 + 0.25, w = ((k % 2) + 2) % 2, dayK = 0.5 + 0.5 * Math.sin(Math.PI * w), u = k % 1;
    const bx = 540 - Math.cos(u * Math.PI) * 420, byy = 640 - Math.sin(u * Math.PI) * 400, isSun = w < 1;
    const a = Math.atan2(byy - 560, bx - 540);
    field('ss', 0, 0, 0.12);
    // carved arc track
    sunk(ringP(540, 640, 412, 428), { a, st: 'ss', d: 3 });
    if (isSun) { relief(E2(0, 0, 54, 54), { x: bx, y: byy, a, d: 5, st: 'ss', tint: 'rgba(255,200,120,0.3)' }); glow(bx, byy, 220, '#FFC878', 0.3 * Math.sin(u * Math.PI)); }
    else { const m = new Path2D(); m.arc(0, 0, 50, 0.9, TAU - 0.9 + 0.0, false); m.arc(22, -4, 40, TAU - 1.25, 1.25, true); m.closePath(); relief(m, { x: bx, y: byy, a, d: 5, st: 'gr', rot: 0.5 }); glow(bx, byy, 200, '#9FB8E8', 0.18 * Math.sin(u * Math.PI)); }
    cityRelief(330, 680, a, 0.6, { d: 7 });
    lionBanner(540, 680 - 364 * 0.6 + 0, a, lt, 0.6, 'gr', 0.6);
    relief([R2(150, 676, 780, 26)], { a, d: 5, st: 'ss' });
    // tally slab (granite)
    relief([R2(110, 820, 860, 300, 10)], { a: -2.3, d: 12, st: 'gr', bb: [540, 970, 500] });
    let cut = 0;
    NOT.forEach((tn, i) => {
      const x = 175 + i * 66, pr = eo(sg(lt, tn, tn + 0.14)); if (pr <= 0) return; cut = i;
      sunk(R2(x - 10, 870, 20, 200 * pr, 6), { a: -2.3, d: 7 });
      chips(x, 870 + 200 * pr, lt - tn, 9, i * 7 + 3, '#D6D0C4', 0.8);
    });
    const tl = NOT.findIndex((tn) => tn > lt), ci = tl < 0 ? 11 : tl, tn = NOT[ci], cx = 175 + ci * 66, cpr = eo(sg(lt, tn - 0.08, tn + 0.14));
    if (lt < NOT[11] + 0.3) chisel(cx + 4, 870 + 200 * cpr - 6, lt, -0.9);
    // light & time of day
    ctx.fillStyle = `rgba(14,22,48,${0.5 * (1 - dayK)})`; ctx.fillRect(-220, -220, W + 440, H + 440);
    rake(a, 0.5 + 0.5 * dayK, isSun ? '#FFD9A8' : '#B8C8F0', 540, 600);
    plaque('ABOUT 12 YEARS', 540, 1196, 36, sg(lt, tTwelve - tHeld - 0.1, tTwelve - tHeld + 0.25), { glint: sg(lt, tTwelve - tHeld + 0.4, tTwelve - tHeld + 1.2) });
    motes(lt + 20, 18, 7); vig();
  };
  add({ id: 'c2', at: tHeld, cam: [540, 820], zoom: 0.08, note: 'time-lapse: sun and moon discs ride a carved arc over the city (light flips day/night), 12 tally notches chiselled into granite; ABOUT 12 YEARS', draw: c2 });
  [0, 3, 6, 9].forEach((i) => cue(tHeld + NOT[i], 'chisel', { gain: 0.4, dur: 0.6 })); cue(tHeld + NOT[11] + 0.1, 'tock', { gain: 0.5 }); cue(tTwelve, 'pop', { gain: 0.35 });

  // c3 · the general revealed from granite
  const c3 = (lt, d) => {
    const a = lerp(-2.9, -2.0, eio(lt / d)), rev = eio(sg(lt, 0.05, 1.5)), ry = lerp(1240, 230, rev), gx = 590, gy = 1180, s = 1.38;
    field('gr', lt * 10, 0);
    relief(frameP(40, 110, 1000, 1170, 30), { a, d: 9 });
    lionBanner(220, 1120, a, lt, 0.95, 'gr', 0.7);
    relief([R2(70, 1180, 940, 70)], { a, d: 7 });
    ctx.save(); ctx.beginPath(); ctx.moveTo(-200, ry); for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, ry + Math.sin(x * 0.05 + lt * 9) * 7); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.clip();
    relief(GEN(), { x: gx, y: gy, s, a, d: 11, bb: [0, -330, 360] });
    relief(GENARM(), { x: gx, y: gy, s, a, d: 6 });
    // incised details: belt + sash folds
    ctx.save(); ctx.translate(gx, gy); ctx.scale(s, s); ctx.strokeStyle = 'rgba(25,22,20,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-42, -304); ctx.lineTo(42, -304); ctx.moveTo(-50, -270); ctx.quadraticCurveTo(0, -240, 50, -270); ctx.moveTo(-58, -200); ctx.quadraticCurveTo(0, -180, 58, -200); ctx.stroke(); ctx.restore();
    ctx.restore();
    if (rev < 1) { const cxp = 540 + Math.sin(lt * 4.2) * 300; chisel(cxp, ry - 4, lt, -0.8); spray((tt) => [540 + Math.sin(tt * 4.2) * 300, lerp(1240, 230, eio(sg(tt, 0.05, 1.5)))], lt, 0.05, 1.5, 31, '#D6D0C4'); puff(cxp, ry, 0.3, 70, '200,196,188', 0.25); }
    rake(a, 1); beam(lerp(-300, 1400, sg(lt, 1.2, d)), 170, 0.14);
    plaque('TRADITION', 300, 238, 42, sg(lt, tTrad - T11 - 0.05, tTrad - T11 + 0.3), { rot: -0.03, glint: sg(lt, tTrad - T11 + 0.4, tTrad - T11 + 1.2) });
    motes(lt + 30, 22, 11, '235,235,230', 0.35); vig();
  };
  add({ id: 'c3', at: T11, cam: [590, 720], zoom: 0.09, note: 'chisel chip reveal of the granite general (tall crown, sword, shield, faceless) rising out of the stone; lion banner relief; TRADITION plaque', draw: c3 });
  cue(T11, 'chisel', { gain: 0.5, dur: 1.4 }); cue(tTrad, 'pop', { gain: 0.4 }); cue(tPar, 'thud', { gain: 0.35 });

  // c4 · the sword laid down on a stone ledge
  const c4 = (lt, d) => {
    const land = tWar - tAnd, p = eio(sg(lt, 0, land)), a = lerp(-2.5, -1.9, lt / d);
    const [sx, sy] = shake(lt, land, 14); ctx.translate(sx, sy);
    field('gr', -lt * 30, 0, 0.1);
    relief([R2(-100, 900, W + 200, 120, 6)], { a, d: 12, bb: [540, 960, 600] }); // ledge
    relief([R2(-100, 1020, W + 200, 60)], { a, d: 6, tint: 'rgba(0,0,0,0.25)' });
    const rot = lerp(-Math.PI / 2 + 0.15, 0, p), cx = lerp(640, 560, p), cy = lerp(560, 878, p * p);
    relief(SWORD(), { x: cx, y: cy, rot, a, d: lerp(26, 7, p), s: 1.25, bb: [0, 0, 260], tint: 'rgba(225,232,240,0.22)' });
    // arm lowering it, then releasing and drawing back
    chips(560, 890, lt - land, 22, 41, '#E2DCD0', 1.3); puff(560, 905, lt - land, 120, '220,214,204', 0.5, 2.4);
    rake(a, 1, '#FFE1B8', 400, 900); beam(lerp(-200, 1300, lt / d), 140, 0.12);
    plaque('TRADITION', 820, 260, 34, 1, { rot: 0.02 });
    motes(lt + 40, 24, 13, '235,235,230', 0.4); vig();
  };
  add({ id: 'c4', at: tAnd, cam: [560, 860], zoom: 0.1, note: 'close-up: the sword swings down from upright and lands flat on a granite ledge on "war" (clank, chips, dust skirt)', draw: c4 });
  cue(tWar - 0.3, 'whoosh', { gain: 0.3 }); cue(tWar, 'slam', { gain: 0.6 }); cue(tWar + 0.02, 'chisel', { gain: 0.3, dur: 0.3 });

  // c5 · the saint: seated, halo glow, weathering
  const c5 = (lt, d) => {
    const a = -Math.PI / 2 + Math.sin(lt * 0.9) * 0.5, gx = 540, gy = 1110, s = 1.55, sa = sg(lt, tSaint - tBec - 0.3, tSaint - tBec + 0.6);
    field('gr', 0, lt * 14, 0.18);
    glow(540, 560, 620, '#FFB45A', 0.22 + 0.2 * sa + Math.sin(lt * 3) * 0.02);
    relief(ringP(540, 560, 220, 250), { a, d: 6, rim: '#F4D9A8' });
    for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + lt * 0.12; relief(E2(Math.cos(an) * 285, Math.sin(an) * 285, 12, 12), { x: 540, y: 560, a, d: 4, rim: '#F4D9A8' }); }
    relief([R2(220, 1110, 640, 70, 8)], { a, d: 8 }); // plinth
    relief(SAINT(), { x: gx, y: gy, s, a, d: 10, rim: '#F7DDB0', bb: [0, -220, 320] });
    relief(SAINTARM(), { x: gx, y: gy, s, a, d: 5, rim: '#F7DDB0' });
    // warm light washes the figure; time softens it
    glow(540, 600, 480, '#FFC070', 0.12 + 0.12 * sa);
    const wk = eio(sg(lt, 0.3, d));
    ctx.fillStyle = `rgba(140,138,133,${0.18 * wk})`; ctx.fillRect(-220, -220, W + 440, H + 440);
    lichen(51, 46, 260, 420, 560, 760, wk, 0.55); lichen(91, 30, 60, 200, 960, 1080, wk * 0.8, 0.4);
    rake(a, 0.7, '#FFD8A0', 540, 700);
    plaque('TRADITION', 540, 214, 36, 1, { glint: sg(lt, 0.6, 1.5) });
    motes(lt + 50, 30, 17, '255,220,170', 0.5); vig(0.9);
  };
  add({ id: 'c5', at: tBec, cam: [540, 720], zoom: 0.08, note: 'the same figure seated calm (faceless), warm halo glow + carved halo ring of beads, lichen creeps and the carving weathers; TRADITION', draw: c5 });
  cue(tSaint, 'bell', { gain: 0.55 });

  // c6 · relief map: Ganesha carried Vatapi → Kanchi
  const c6 = (lt, d) => {
    const a = lerp(-2.6, -1.8, lt / d), go = eio(sg(lt, tCar - T12 - 0.1, d - 0.15));
    blit(seaImg(), 200, 200, lt * 6, 0, 1);
    const land = P2(MAPL);
    relief(land, { a, d: 12, bb: [540, 600, 700] });
    // carved hills (texture of the Deccan plateau)
    relief(tube([[60, 120], [100, 360], [160, 560], [250, 780], [340, 960], [410, 1120], [500, 1280]], 34, 18), { a, d: 5, tint: 'rgba(0,0,0,0.06)' });
    relief(tube([[600, 200], [700, 330], [800, 420]], 22, 12), { a, d: 4, tint: 'rgba(0,0,0,0.06)' });
    // route channel: groove + gold light
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lx = Math.cos(a), ly = Math.sin(a), path = new Path2D(); ROUTE.forEach((q, i) => (i ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1])));
    ctx.save(); ctx.translate(-lx * 2, -ly * 2); ctx.strokeStyle = rgba(GR.lt, 0.9); ctx.lineWidth = 18; ctx.stroke(path); ctx.restore();
    ctx.strokeStyle = '#1A1714'; ctx.lineWidth = 16; ctx.stroke(path);
    ctx.save(); ctx.translate(-lx * 3, -ly * 3); ctx.strokeStyle = 'rgba(70,66,62,0.9)'; ctx.lineWidth = 9; ctx.stroke(path); ctx.restore();
    if (go > 0) {
      const lit = new Path2D(), n = Math.max(1, Math.round(go * 40)); for (let i = 0; i <= n; i++) { const q = routeAt(i / 40 * (go * 40 / n)); i ? lit.lineTo(q[0], q[1]) : lit.moveTo(q[0], q[1]); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,170,70,0.35)'; ctx.lineWidth = 30; ctx.stroke(lit); ctx.strokeStyle = '#FFC66A'; ctx.lineWidth = 9; ctx.stroke(lit); ctx.restore();
    }
    // cities
    relief(CITY(), { x: VAT[0] - 60, y: VAT[1] + 10, s: 0.17, a, d: 4, st: 'ss' });
    relief([R2(-30, -40, 60, 40), R2(-20, -64, 40, 24), P2([[-12, -64], [12, -64], [0, -86]])], { x: KAN[0], y: KAN[1] + 6, s: 1.1, a, d: 4 });
    note('VATAPI', VAT[0] - 10, VAT[1] + 50, 34, '#2A1A10'); note('KANCHI', KAN[0] - 130, KAN[1] + 10, 34, '#22201C');
    // Ganesha carried along
    const [gx, gy] = routeAt(go), bob = Math.abs(Math.sin(lt * 9)) * 8 * (go > 0 && go < 1 ? 1 : 0), gs = 0.62 + 0.16 * eob(sg(lt, tGan - T12 - 0.05, tGan - T12 + 0.35));
    glow(gx, gy - 40, 140, '#FFC070', 0.3 + 0.25 * sg(lt, tGan - T12, tGan - T12 + 0.3));
    ganesha(gx, gy - 6 - bob, gs, a, { d: 5, rim: '#F4DDB0' });
    rake(a, 0.8); motes(lt + 60, 16, 21, '255,228,180', 0.35);
    plaque('LEGEND', 820, 250, 44, sg(lt, tGan - T12 - 0.1, tGan - T12 + 0.25), { rot: 0.03, glint: sg(lt, tGan - T12 + 0.4, tGan - T12 + 1.1) });
    vig(0.8);
  };
  add({ id: 'c6', at: T12, cam: [560, 720], zoom: 0.1, note: 'relief map (granite peninsula on a sunk sea), small Ganesha relief icon carried along a gold-lit route channel Vatapi -> Kanchi; LEGEND plaque on "Ganesha"', draw: c6 });
  cue(tCar, 'slide', { gain: 0.35 }); cue(tGan, 'pop', { gain: 0.45 }); cue(tGan + 0.1, 'sparkle', { gain: 0.25 });

  // c7 · temple niche with lamp glow
  const c7 = (lt, d) => {
    const fl = 0.85 + 0.15 * Math.sin(lt * 23) * Math.sin(lt * 7.3 + 1), a = Math.PI / 2 + Math.sin(lt * 5) * 0.12 - 0.15;
    field('gr', 0, -lt * 12, 0.42);
    const niche = new Path2D(); niche.moveTo(300, 1060); niche.lineTo(300, 520); niche.arc(540, 520, 240, Math.PI, 0); niche.lineTo(780, 1060); niche.closePath();
    relief(frameP(250, 240, 580, 860, 30), { a: -2.2, d: 8 });
    relief(ringP(540, 520, 262, 288), { a: -2.2, d: 6 });
    sunk(niche, { a, d: 14, floor: 'rgba(20,12,6,0.45)' });
    glow(540, 1000, 560 * fl, '#FF9A3A', 0.42 * fl); glow(540, 820, 300, '#FFD27A', 0.18 * fl);
    ganesha(540, 1040, 2.5, a, { d: 9, rim: '#FFD9A0', tint: `rgba(255,150,60,${0.12 * fl})` });
    relief([R2(380, 1040, 320, 30, 6)], { a, d: 5 });
    // marigold garland across the arch
    for (let i = 0; i < 23; i++) { const u = i / 22, x = lerp(320, 760, u), y = 330 + Math.sin(u * Math.PI) * -40 + Math.sin(u * Math.PI * 3) * 26 + 110; ctx.fillStyle = 'rgba(40,20,0,0.5)'; ctx.beginPath(); ctx.arc(x + 3, y + 4, 13, 0, TAU); ctx.fill(); ctx.fillStyle = i % 2 ? '#E8901E' : '#F2B33A'; ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,240,180,0.5)'; ctx.beginPath(); ctx.arc(x - 4, y - 4, 5, 0, TAU); ctx.fill(); }
    // bronze lamp
    ctx.save(); ctx.translate(540, 1136);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(10, 46, 90, 16, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lg(-80, 0, 80, 0, [[0, '#6A4E1E'], [0.4, '#E6C77E'], [1, '#6A4E1E']]); ctx.beginPath(); ctx.moveTo(-36, 44); ctx.lineTo(36, 44); ctx.lineTo(16, 10); ctx.lineTo(-16, 10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 76, 20, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#3A2A10'; ctx.beginPath(); ctx.ellipse(0, -2, 70, 12, 0, 0, TAU); ctx.fill();
    ctx.restore();
    const fh = 70 * fl; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,140,40,0.85)'; ctx.fill(flameP(560, 1132, 30, fh, Math.sin(lt * 9) * 6)); ctx.fillStyle = 'rgba(255,230,150,0.9)'; ctx.fill(flameP(560, 1130, 15, fh * 0.6, Math.sin(lt * 9) * 4)); ctx.restore();
    glow(560, 1090, 160, '#FFD27A', 0.5 * fl);
    for (let i = 0; i < 6; i++) { const ph = (lt * 0.5 + i / 6) % 1, x = 560 + Math.sin(ph * 6 + i) * 30 * ph, y = 1050 - ph * 520, r = 20 + ph * 60; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(220,210,200,${0.14 * (1 - ph)})`); g.addColorStop(1, 'rgba(220,210,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    plaque('LEGEND', 540, 160, 34, 1);
    sparks(lt, 10, 480, 620, 1100, 3, 0.5); vig(1);
  };
  add({ id: 'c7', at: tWor, cam: [540, 820], zoom: 0.1, note: 'arched temple niche cut in granite, Ganesha relief inside, marigold garland; bronze oil lamp flickers warm light up the carving, smoke wisp', draw: c7 });
  cue(tWor + 0.05, 'bell', { gain: 0.45 }); cue(tVat, 'sizzle', { gain: 0.15, dur: 1.0 });

  // c8 · LEGEND vs RECORD
  const c8 = (lt, d) => {
    const a = lerp(-2.7, -1.6, eio(lt / d)), kL = tLeg - tThat, kR = tRec - tThat, strike = sg(lt, kR + 0.2, kR + 0.6);
    const [sx, sy] = shake(lt, kL + 0.15, 9); ctx.translate(sx, sy);
    field('gr', lt * 16, 0, 0.15);
    relief(frameP(40, 110, 1000, 1170, 30), { a, d: 9 });
    glow(540, 470, 380, '#FFC070', 0.18);
    ganesha(540, 610, 1.9, a, { d: 9, bb: [0, -90, 110] });
    relief([R2(380, 610, 280, 26, 6)], { a, d: 6 });
    plaque('LEGEND', 540, 800, 84, sg(lt, kL - 0.05, kL + 0.3), { glint: sg(lt, kL + 0.5, kL + 1.4) });
    // RECORD plaque, struck through with a chisel groove, greyed
    const gp = sg(lt, kR - 0.05, kR + 0.3), grey = eo(sg(lt, kR + 0.4, kR + 0.9));
    if (gp > 0) {
      plaque('RECORD', 540, 1040, 52, gp, { grey, rot: -0.02 });
      if (strike > 0) {
        const x0 = 330, x1 = lerp(330, 750, eo(strike)), y0 = 1060, y1 = lerp(1060, 1016, eo(strike));
        ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(230,226,215,0.7)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x0 + 2, y0 + 3); ctx.lineTo(x1 + 2, y1 + 3); ctx.stroke();
        ctx.strokeStyle = '#1A1612'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        if (strike < 1) chisel(x1, y1, lt, -0.7);
      }
      spray((tt) => { const e = eo(sg(tt, kR + 0.2, kR + 0.6)); return [lerp(330, 750, e), lerp(1060, 1016, e)]; }, lt, kR + 0.2, kR + 0.6, 71, '#D8C79A', 4);
    }
    rake(a, 1); beam(lerp(-250, 1350, lt / d), 150, 0.13);
    motes(lt + 70, 20, 23, '240,230,210', 0.35); vig();
  };
  add({ id: 'c8', at: tThat, cam: [540, 760], zoom: 0.08, note: 'Ganesha relief; LEGEND bronze plaque slams in big on "legend"; RECORD plaque drops on "record", a chisel strikes a groove through it and it greys', draw: c8 });
  cue(tLeg, 'slam', { gain: 0.6 }); cue(tRec, 'pop', { gain: 0.4 }); cue(tRec + 0.2, 'chisel', { gain: 0.55, dur: 0.45 });

  // c9 · Badami today: red cliff with caves over the lake
  const c9 = (lt, d) => {
    const sa = lerp(-2.4, -2.0, lt / d), sunX = 160 + lt * 40, sunY = 230 - lt * 10, pan = -lt * 18;
    ctx.fillStyle = lg(0, -200, 0, 1000, [[0, '#7FA2BC'], [0.55, '#D7C7AC'], [1, '#F0D4A8']]); ctx.fillRect(-220, -220, W + 440, 1240);
    glow(sunX, sunY, 420, '#FFE2A8', 0.55); ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(sunX, sunY, 46, 0, TAU); ctx.fill();
    // distant hills
    ctx.fillStyle = 'rgba(150,110,100,0.45)'; ctx.beginPath(); ctx.moveTo(-220, 520); for (let x = -220; x <= W + 220; x += 40) ctx.lineTo(x, 470 + Math.sin(x * 0.006 + 2) * 40); ctx.lineTo(W + 220, 1000); ctx.lineTo(-220, 1000); ctx.fill();
    const img = cliffImg();
    // water + reflection
    ctx.fillStyle = lg(0, 1000, 0, 1940, [[0, '#56706E'], [1, '#22343A']]); ctx.fillRect(-220, 1000, W + 440, 960);
    ctx.save(); ctx.globalAlpha = 0.42;
    for (let i = 0; i < 26; i++) { const y0 = i * 36, ox = Math.sin(lt * 2.2 + i * 0.7) * (3 + i * 0.6); ctx.drawImage(img, 0, (1000 - y0 - 36) * img._q, img.width, 36 * img._q, -120 + pan + ox, 1000 + y0, W + 240, 36); }
    ctx.restore();
    ctx.fillStyle = 'rgba(30,50,56,0.25)'; ctx.fillRect(-220, 1000, W + 440, 960);
    for (let i = 0; i < 30; i++) { const y = 1010 + rnd(i * 3) * 880, x = ((rnd(i * 7) * (W + 300) + lt * 30) % (W + 300)) - 150, w = 40 + rnd(i) * 120; ctx.fillStyle = `rgba(255,236,200,${0.12 + 0.12 * Math.sin(lt * 3 + i)})`; ctx.fillRect(x, y, w, 3); }
    blit(img, 120, 0, pan, 0, 1);
    // raking sun: cave interiors keep slanted shadows, a beam slides over the cliff
    ctx.save(); ctx.translate(pan, 0);
    for (const [x, y, w, h] of CAVES) { ctx.fillStyle = 'rgba(10,4,2,0.35)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h * 0.3 + Math.sin(sa) * 10); ctx.lineTo(x, y + h * 0.75); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(-220, -220, W + 440, 1220); ctx.clip(); beam(lerp(-300, 1300, lt / d), 200, 0.14, '#FFE6C0', -0.4); ctx.restore();
    rake(sa, 0.45, '#FFE2B0', 540, 700);
    plaque('TODAY', 860, 200, 40, sg(lt, 0.05, 0.4), { rot: 0.03, glint: sg(lt, 0.5, 1.4) });
    motes(lt + 80, 14, 29, '255,240,210', 0.4); vig(0.7);
  };
  add({ id: 'c9', at: T13, cam: [560, 700], zoom: 0.09, note: 'Badami today: red sandstone cliff with four cave-temple openings stepping up over the lake, daylight raking sun, rippling reflection, lichen; TODAY', draw: c9 });
  cue(T13, 'swell', { gain: 0.3, dur: 2.0 }); cue(T13 + 0.1, 'pop', { gain: 0.3 });

  // c10 · cave facade close-up, frieze track along a gana band
  const c10 = (lt, d) => {
    const a = lerp(-2.6, -1.9, lt / d), tx = -lt * 70;
    field('ss', tx, 0);
    ctx.save(); ctx.translate(tx * 0.6, 0);
    const mouth = R2(40, 360, 1120, 560);
    relief([R2(10, 300, 1180, 44, 4)], { a, d: 10, st: 'ss' }); // cornice
    for (let i = 0; i < 16; i++) relief(R2(30 + i * 72, 344, 40, 22, 3), { a, d: 4, st: 'ss' });
    sunk(mouth, { a, st: 'ss', d: 26, deep: '#140804', floor: 'rgba(16,6,3,0.82)' });
    for (let i = 0; i < 5; i++) { // pillars with brackets
      const px = 110 + i * 236;
      relief([R2(px - 34, 400, 68, 520), R2(px - 46, 860, 92, 60, 4), R2(px - 50, 520, 100, 70, 8), P2([[px - 34, 400], [px + 34, 400], [px + 70, 368], [px - 70, 368]])], { a, d: 12, st: 'ss', bb: [px, 640, 300] });
      sunk(R2(px - 20, 600, 40, 220, 6), { a, st: 'ss', d: 5 });
    }
    relief([R2(-20, 920, 1260, 50, 4)], { a, d: 8, st: 'ss' }); // plinth
    ctx.restore();
    // FRIEZE TRACK: band of squat ganas below the plinth
    ctx.save(); ctx.translate(tx * 1.5, 0);
    relief([R2(-200, 990, 2200, 230, 6)], { a, d: 6, st: 'ss', tint: 'rgba(40,12,6,0.12)' });
    for (let i = 0; i < 18; i++) {
      const gx = -120 + i * 130, ph = i * 1.3, arm = Math.sin(ph) * 0.4;
      relief([E2(0, -60, 34, 32), E2(0, -112, 22, 22), limb(-14, -30, -24, 0, 18, 14), limb(14, -30, 26, 0, 18, 14), limb(-28, -78, -50, -100 + arm * 40, 14, 11), limb(28, -78, 52, -110 - arm * 40, 14, 11)], { x: gx, y: 1190, a, d: 5, st: 'ss', bb: [0, -70, 80] });
    }
    ctx.restore();
    const g = eio(sg(lt, 0, d));
    ctx.fillStyle = `rgba(164,85,58,${0.12 * g})`; ctx.fillRect(-220, -220, W + 440, H + 440); // erosion softening
    lichen(201, 60, -100, 260, W + 200, 1000, 0.3 + g * 0.8, 0.5);
    rake(a, 0.9, '#FFE2B0'); beam(lerp(-200, 1400, lt / d), 150, 0.18, '#FFE6C0', 0.4);
    motes(lt + 90, 26, 31, '255,230,190', 0.5); vig(0.9);
  };
  add({ id: 'c10', at: tRed, cam: [520, 760], zoom: 0.1, note: 'close on a red sandstone cave facade: pillars + brackets in deep shade, sun beam sweeps, frieze track along a gana band, erosion + lichen creep', draw: c10 });
  cue(tRed + 0.05, 'whoosh', { gain: 0.25 });

  // c11 · carved flames lose their fire; sand blows over
  const c11 = (lt, d) => {
    const fire = 1 - eio(sg(lt, tFire - tThe + 0.1, tTold - tThe + 0.4)), a = lerp(Math.PI / 2 - 0.3, -2.2, eio(sg(lt, 0.3, d))), flick = 0.85 + 0.15 * Math.sin(lt * 19) * Math.sin(lt * 6.1);
    field('ss', lt * 12, 0, 0.35 * fire);
    relief(frameP(40, 160, 1000, 1080, 28), { a, d: 9, st: 'ss' });
    const fl = []; for (let i = 0; i < 9; i++) { const x = 140 + i * 100 + (i % 2) * 20, h = 210 + rnd(i * 3.3) * 200; fl.push(flameP(x, 820 - (i % 3) * 30, 110 + rnd(i) * 40, h, Math.sin(lt * 2 + i) * 14 * fire + (rnd(i + 5) - 0.5) * 40)); }
    relief(fl, { a, d: 8, st: 'ss', tint: `rgba(255,120,30,${0.35 * fire * flick})`, rim: mixc(SS.lt, '#FFD27A', fire) });
    cityRelief(190, 1150, a, 1, { tint: `rgba(255,120,40,${0.15 * fire})` });
    glow(540, 1150, 820, '#FF8A2A', 0.42 * fire * flick); glow(540, 700, 420, '#FFD27A', 0.15 * fire * flick);
    sparks(lt, 26, 140, 940, 1100, 5, fire);
    ctx.fillStyle = `rgba(20,24,34,${0.25 * (1 - fire)})`; ctx.fillRect(-220, -220, W + 440, H + 440);
    // sand: wind streaks + a drift climbing over the carving
    const sand = eio(sg(lt, 0.35, d)), top = lerp(1260, 760, sand);
    ctx.fillStyle = lg(0, top - 80, 0, top + 300, [[0, 'rgba(216,170,120,0)'], [0.3, 'rgba(206,160,112,0.75)'], [1, 'rgba(190,140,96,0.95)']]);
    ctx.beginPath(); ctx.moveTo(-220, H + 200); for (let x = -220; x <= W + 220; x += 30) ctx.lineTo(x, top + Math.sin(x * 0.012 + lt * 0.8) * 30 + Math.sin(x * 0.031 - lt * 1.5) * 10); ctx.lineTo(W + 220, H + 200); ctx.fill();
    for (let i = 0; i < 70; i++) { const y = 200 + rnd(i * 3.1) * 1200, sp = 900 + rnd(i) * 700, x = W + 200 - ((rnd(i * 5.7) * 2400 + lt * sp) % 2400), l = 60 + rnd(i * 2) * 180; ctx.fillStyle = `rgba(230,196,150,${(0.15 + rnd(i + 4) * 0.25) * sand})`; ctx.fillRect(x, y + Math.sin(lt * 3 + i) * 10, l, 2 + rnd(i) * 3); }
    rake(a, 0.6 + 0.3 * (1 - fire), fire > 0.5 ? '#FFB060' : '#FFE2B8');
    vig(1);
  };
  add({ id: 'c11', at: tThe, cam: [540, 820], zoom: 0.1, note: 'carved flames over sandstone roofs: the orange fire light fades out of the carving on "fire", wind streaks blow sand across and a drift buries the flames', draw: c11 });
  cue(tThe, 'sizzle', { gain: 0.3, dur: 1.2 }); cue(tRare, 'whoosh', { gain: 0.45, dur: 1.4 });

  // c12 · three slabs drop: defeat, revenge, burning city
  const SL = [[200, tDef, 'gr', 'DEFEAT'], [540, tRev, 'gr', 'REVENGE'], [880, tBurn, 'ss', 'BURNING CITY']];
  const c12 = (lt, d) => {
    const a = lerp(-2.7, -1.2, eio(lt / d));
    let sx = 0, sy = 0; SL.forEach(([, tt]) => { const [x, y] = shake(lt, tt - T14, 13); sx += x; sy += y; }); ctx.translate(sx, sy);
    field('gr', -lt * 14, 0, 0.45);
    relief([R2(-100, 1130, W + 200, 90)], { a, d: 8, tint: 'rgba(0,0,0,0.25)' });
    const burnK = sg(lt, tBurn - T14, tBurn - T14 + 0.3);
    if (burnK > 0) { glow(880, 760, 520, '#FF8A2A', 0.3 * burnK); }
    SL.forEach(([cx, tt, st, word], i) => {
      const land = tt - T14, f = sg(lt, land - 0.3, land); if (f <= 0) return;
      const yo = lerp(-1300, 0, f * f), x0 = cx - 155, y0 = 330 + yo;
      relief([R2(x0, y0, 310, 800, 8)], { a, d: 16, st, bb: [cx, y0 + 400, 500] });
      relief(frameP(x0 + 16, y0 + 16, 278, 768, 12), { a, d: 4, st });
      const ix = cx, iy = y0 + 470;
      if (i === 0) { // broken lion banner
        relief([R2(-62, -300, 14, 300, 4), R2(-72, -10, 150, 20, 4)], { x: ix, y: iy, a, d: 6 });
        relief([R2(-10, -7, 180, 14, 4)], { x: ix - 40, y: iy - 300, rot: 1.05, a, d: 6 });
        const pen = P2([[0, 0], [110, 6], [94, 70], [110, 140], [0, 128]]); relief(pen, { x: ix - 16, y: iy - 160, rot: 0.3, a, d: 6 });
        relief(LION(), { x: ix + 36, y: iy - 92, s: 0.55, rot: 0.3 + Math.PI / 2 * 0.0, a, d: 3 });
      } else if (i === 1) { // raised sword in a ray burst
        for (let k = 0; k < 14; k++) { const an = k / 14 * TAU; relief(limb(Math.cos(an) * 70, Math.sin(an) * 70, Math.cos(an) * 128, Math.sin(an) * 128, 14, 4), { x: ix, y: iy - 140, a, d: 3 }); }
        relief(SWORD(), { x: ix, y: iy - 110, rot: -Math.PI / 2, s: 0.92, a, d: 8 });
      } else { // burning city
        const fk = burnK, fls = []; for (let k = 0; k < 5; k++) fls.push(flameP(-100 + k * 50, -150 - (k % 2) * 20, 60, 140 + rnd(k) * 80, Math.sin(lt * 4 + k) * 10));
        relief(fls, { x: ix, y: iy, a, d: 5, st: 'ss', tint: `rgba(255,130,40,${0.45 * fk})`, rim: mixc(SS.lt, FIRE2, fk) });
        cityRelief(ix - 120, iy + 60, a, 0.34, { d: 5, tint: `rgba(255,120,40,${0.2 * fk})` });
        glow(ix, iy - 60, 260, '#FF8A2A', 0.35 * fk * (0.85 + 0.15 * Math.sin(lt * 17)));
      }
      const words = word.split(' ');
      words.forEach((wd, j) => carve(wd, cx, y0 + 640 + j * 66 - (words.length - 1) * 30, 58, { a, st, maxW: 250, dep: 4, floor: 'rgba(10,6,4,0.7)', glow: i === 2 ? `rgba(255,140,50,${0.5 * burnK})` : null }));
      const age = lt - land; puff(cx, 1130, age, 110, st === 'ss' ? '220,170,140' : '214,210,202', 0.32, 2.2); chips(cx - 140, 1128, age, 8, i * 9 + 1, '#D6D0C4', 1); chips(cx + 140, 1128, age, 8, i * 9 + 5, '#D6D0C4', 1);
    });
    if (burnK > 0) sparks(lt, 20, 760, 1000, 1100, 9, burnK);
    rake(a, 0.9); beam(lerp(-200, 1400, lt / d), 150, 0.12);
    vig();
  };
  add({ id: 'c12', at: T14, cam: [540, 760], zoom: 0.06, note: 'slab slide: three carved stone slabs drop one by one on "defeat" (broken lion banner), "revenge" (raised sword, ray burst), "burning" (sandstone city with glowing carved flames); dust skirts', draw: c12 });
  cue(tDef, 'thud', { gain: 0.75 }); cue(tRev, 'thud', { gain: 0.8 }); cue(tBurn, 'slam', { gain: 0.8 }); cue(tBurn + 0.08, 'sizzle', { gain: 0.3, dur: 1.0 });

  // c13 · end card: FOLLOW plaque, AAZHI carved into granite
  const c13 = (lt, d) => {
    const a = lerp(-2.9, -0.5, eio(sg(lt, 0, d))), cs = tAaz - tFol - 0.08, ce = cs + 1.05, cp = sg(lt, cs, ce);
    field('gr', lt * 10, 0, 0.12);
    relief(frameP(50, 150, 980, 1100, 32), { a, d: 10 });
    relief(frameP(100, 200, 880, 1000, 8), { a, d: 3 });
    for (let i = 0; i < 2; i++) relief(E2(0, 0, 30, 30), { x: [130, 950][i], y: 230, a, d: 4 });
    plaque('FOLLOW', 540, 390, 58, sg(lt, 0.05, 0.4), { glint: sg(lt, 2.0, 2.9) });
    const r = carve('AAZHI', 540, 690, 250, { a, p: cp, ls: 0.04, dep: 12 });
    if (cp > 0 && cp < 1 && r) { const px = r.x0 + r.w * cp; chisel(px, 690 - 60 + Math.sin(lt * 21) * 70, lt, -0.7, 1.2); }
    if (r) spray((tt) => { const q = sg(tt, cs, ce); return [r.x0 + r.w * q, 690 + Math.sin(tt * 21) * 70 - 60]; }, lt, cs, ce, 91, '#E0DACE', 4);
    carve('for the stories behind the stories', 540, 900, 44, { a, font: '700 44px Caladea, serif', ls: 0.04, p: eio(sg(lt, tSto - tFol - 0.2, tSto - tFol + 0.7)), dep: 2.5 });
    rake(a, 1); beam(lerp(-300, 1400, sg(lt, 0.4, d)), 190, 0.17);
    motes(lt + 99, 26, 37, '240,236,226', 0.4); vig();
  };
  add({ id: 'c13', at: tFol, cam: [540, 700], zoom: 0.07, note: 'end card: FOLLOW bronze plaque, AAZHI chisel-carved into granite letter by letter with chips, raking light sweep, "for the stories behind the stories"', draw: c13 });
  cue(tFol, 'swell', { gain: 0.5, dur: 3.5 }); cue(tFol + 0.05, 'pop', { gain: 0.45 }); cue(tAaz - 0.05, 'chisel', { gain: 0.6, dur: 1.1 }); cue(tAaz + 1.1, 'bell', { gain: 0.5 });
}
