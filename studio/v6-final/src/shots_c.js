// EPISODE 6 · worker C : "Shadow Play on Parched Earth", lines 10-13 (the canal today, and who dug it)
//   C1 Chennai plan: the gold 8 km famine link, older stretches shoot out north and south (tiny diggers at the heads)
//   C2 the camera races up the coast while the canal line draws itself north to KAKINADA
//   C3 the whole thin coast map, a light bead runs the canal, "~796 km" counts up in woodblock; cracks race across
//   C4 shards fall away: TODAY, grey-green water under a Chennai skyline + elevated railway, debris drifting
//   C5 long perspective down the choked stretch: hyacinth mats, bottles, a bottle plops in, "NEGLECTED"
//   C6 a low road bridge, a passer-by puppet walks across, its reflection in the water
//   C7 camera tilts into the reflection: it becomes a row of 1877 digger puppets, digging, lamp-lit under water
//   C8 end card: lamp-lit screen in its wooden frame, one digger bows beside his planted hoe, AAZHI woodblock
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { lg, poly, fillP, rgba, mixc, cached, blit, dust, palm } from './art.js';

const UMB0 = '#1E130C', UMB1 = '#3A2418', DUST0 = '#8E5E3A', DUST1 = '#A8744A', BONE = '#EFE4CC', GLOW = '#F6D9A0', INK = '#120B07', GOLD = '#E9B949', MUD = '#6F7F62';
const WEED = '#232B1D', WEED2 = '#2F3A27';

// ───────────── light ─────────────
const hmix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const flick = (t) => 1 + 0.015 * (0.55 * Math.sin(t * 13.1) + 0.3 * Math.sin(t * 7.3 + 1.2) + 0.15 * Math.sin(t * 23.7 + 0.4));
const clothImg = () => cached('c:cloth', 1200, 2040, 0.5, () => {
  for (let i = 0; i < 10; i++) { const x = rnd(i * 3.3 + 1) * 1200, y = rnd(i * 5.1 + 2) * 2040, r = 160 + rnd(i * 7.7) * 380, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(142,94,58,0.07)'); g.addColorStop(1, 'rgba(142,94,58,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.fillStyle = 'rgba(58,36,24,0.05)'; for (let y = 0; y < 2040; y += 7) ctx.fillRect(0, y, 1200, 2); for (let x = 0; x < 1200; x += 7) ctx.fillRect(x, 0, 2, 2040);
  for (let i = 0; i < 1600; i++) { ctx.fillStyle = `rgba(58,36,24,${0.04 + rnd(i * 1.3) * 0.08})`; ctx.fillRect(rnd(i * 3.7) * 1200, rnd(i * 7.9) * 2040, 3 + rnd(i * 5.3) * 14, 1.6); }
});
/** the backlit cloth: bone-white with a warm hot-spot where the lamp is, falling to umber. dim 0..1 = duller, cooler (today) */
function screen(t, o = {}) {
  const lx = o.lx ?? 540, ly = o.ly ?? 760, f = flick(t), dim = o.dim || 0, r = (o.r ?? 1250) * f;
  ctx.fillStyle = UMB0; ctx.fillRect(-300, -300, W + 600, H + 600);
  const base = hmix(BONE, '#AFAE9A', dim), hot = hmix(GLOW, '#D6D2B8', dim);
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
  g.addColorStop(0, hot); g.addColorStop(0.32, base); g.addColorStop(0.72, hmix(base, DUST0, 0.55 + dim * 0.15)); g.addColorStop(1, UMB1);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  blit(clothImg(), 0, 0, -60, -60, 1, 0.9);
}
function vig(a = 0.65, cy = 880) { const g = ctx.createRadialGradient(540, cy, 420, 540, cy, 1300); g.addColorStop(0, 'rgba(18,11,7,0)'); g.addColorStop(1, `rgba(18,11,7,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
const motes = (t, n = 34, seed = 3, a = 0.45) => dust(t, n, seed, '255,226,170', a);
function glowAt(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }

// ───────────── type ─────────────
function note(s, x, y, sz, col = INK, a = 1, align = 'center', ls = 2) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${sz}px Caladea, serif`; ctx.letterSpacing = ls + 'px'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** one hand-pressed woodblock letter: Inter Black, a faint double impression, chipped edges and grain streaks */
function woodChar(ch, size, col) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; const aw = ctx.measureText(ch).width; ctx.restore();
  const w = aw + size * 0.4, h = size * 1.4, sd = ch.charCodeAt(0) * 13.7 + size * 0.31;
  const c = cached(`wc|${ch}|${size}|${col}`, w, h, 1, () => {
    ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
    ctx.globalAlpha = 0.28; ctx.fillText(ch, w / 2 + size * 0.018, h / 2 + size * 0.06); ctx.globalAlpha = 1; ctx.fillText(ch, w / 2, h / 2 + size * 0.04);
    ctx.globalCompositeOperation = 'destination-out';
    const n = Math.round(w * h / 110);
    for (let i = 0; i < n; i++) { ctx.globalAlpha = 0.25 + rnd(i * 5.1 + sd) * 0.75; ctx.beginPath(); ctx.arc(rnd(i * 1.7 + sd) * w, rnd(i * 2.3 + sd + 5) * h, 0.4 + Math.pow(rnd(i + sd * 11), 4) * size * 0.014, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 0.16; for (let i = 0; i < h / 7; i++) { const yy = rnd(i * 3.1 + sd) * h; ctx.beginPath(); ctx.moveTo(0, yy); ctx.bezierCurveTo(w * 0.3, yy + 3, w * 0.6, yy - 3, w, yy + 1); ctx.lineWidth = 0.6 + rnd(i * 1.9 + sd) * 1.2; ctx.strokeStyle = '#000'; ctx.stroke(); }
    for (let i = 0; i < 2; i++) { ctx.globalAlpha = 0.18; ell(rnd(i * 9 + sd) * w, rnd(i * 4 + sd) * h, size * 0.12, size * 0.05, '#000', rnd(i) * 3); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  });
  c._aw = aw; c._w = w; c._h = h; return c;
}
/** a woodblock word, letters slightly uneven. p 0..1 = the press (comes down from 1.2x, ink lands) */
function wood(str, x, y, size, col = INK, a = 1, p = 1, ls = 0.06) {
  if (a <= 0 || p <= 0) return;
  const cs = [...str].map((ch) => woodChar(ch, size, col)), sp = size * ls, tw = cs.reduce((s, c) => s + c._aw, 0) + sp * (cs.length - 1);
  const sc = lerp(1.22, 1, eo(clamp(p))), al = a * clamp(p * 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= al;
  let xx = -tw / 2;
  cs.forEach((c, i) => { const r = (rnd(i * 7.3 + str.length) - 0.5) * 0.07, dy = (rnd(i * 3.9 + 2) - 0.5) * size * 0.07;
    ctx.save(); ctx.translate(xx + c._aw / 2, dy); ctx.rotate(r); ctx.drawImage(c, -c._w / 2, -c._h / 2, c._w, c._h); ctx.restore(); xx += c._aw + sp; });
  ctx.restore();
}

// ───────────── leather puppets ─────────────
function limb(x0, y0, a, len, w0, w1, col) {
  const dx = Math.sin(a), dy = Math.cos(a), nx = dy, ny = -dx, x1 = x0 + dx * len, y1 = y0 + dy * len;
  ctx.beginPath(); ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  circle(x0, y0, w0 / 2, col); circle(x1, y1, w1 / 2, col); return [x1, y1];
}
const hole = (x, y, r, hc) => circle(x, y, r, hc);
const rivet = (x, y, hc, col) => { circle(x, y, 9, hc); circle(x, y, 4, col); };
/** a flat, faceless leather shadow-puppet, feet at (x, y), h tall. o: { t, pose 'stand'|'dig'|'walk'|'bow', kind 'old'|'modern', dir, ph, cyc, bow, col, hole, holes, sticks, look } */
function puppet(x, y, h, o = {}) {
  const t = o.t ?? 0, s = h / 1000, dir = o.dir ?? 1, col = o.col ?? INK, hc = o.hole ?? GLOW, ph = o.ph ?? 0, modern = o.kind === 'modern';
  const holes = o.holes ?? h >= 150, sticks = o.sticks ?? h >= 150;
  const j = (k, a = 0.035) => a * Math.sin(t * 2.2 + ph * 7 + k * 1.7);
  let lean = 0.02 + j(0, 0.015), uN = 0.16 + j(1), fN = 0.4 + j(2), uF = -0.12 + j(3), fF = 0.12 + j(4);
  let lN = 0.06 + j(6, 0.02), kN = 0.02, lF = -0.06, kF = -0.04, head = j(5, 0.03) + (o.look || 0) * 0.45, tool = modern ? null : (o.tool ?? 'hoe');
  const pose = o.pose ?? 'stand';
  if (pose === 'dig') {
    const c = (((o.cyc ?? t * 0.85) + ph) % 1 + 1) % 1, k = c < 0.62 ? 1 - eio(c / 0.62) : Math.pow((c - 0.62) / 0.38, 2);
    lean = lerp(-0.1, 0.46, k); uN = lerp(2.7, 0.9, k); fN = lerp(3.15, 0.55, k); uF = uN - 0.14; fF = fN - 0.06;
    lN = 0.34; kN = 0.02 + 0.08 * k; lF = -0.24; kF = -0.5; head = lerp(-0.12, 0.25, k);
  } else if (pose === 'walk') {
    const c = (o.cyc ?? t * 1.4) * TAU, sw = Math.sin(c);
    lN = 0.34 * sw; kN = lN - 0.4 * Math.max(0, Math.sin(c + 1.4)); lF = -0.34 * sw; kF = lF - 0.4 * Math.max(0, Math.sin(c + 1.4 + Math.PI));
    uN = -0.28 * sw + j(1, 0.02); fN = uN + 0.3; uF = 0.28 * sw; fF = uF + 0.3; lean = 0.05;
  } else if (pose === 'bow') {
    const b = o.bow ?? 0; lean = 0.9 * b + j(0, 0.01); head += 0.4 * b;
    uN = 0.42 + j(1, 0.015); fN = 2.55; uF = 0.32; fF = 2.5; tool = 'planted';
  }
  const fl = 1 + (flick(t) - 1) * 0.7;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir * fl, s * fl);
  // legs first (to find where the feet land)
  const ank = (a1, a2) => -500 + 250 * Math.cos(a1) + 240 * Math.cos(a2);
  const drop = -8 - Math.max(ank(lN, kN), ank(lF, kF));
  ctx.translate(0, drop);
  const lw = modern ? [52, 44, 42, 30] : [44, 34, 30, 20];
  const leg = (hx, a1, a2) => { const [kx, ky] = limb(hx, -500, a1, 250, lw[0], lw[1], col); const [ax, ay] = limb(kx, ky, a2, 240, lw[2], lw[3], col); fillP([[ax - 16, ay - 10], [ax + 50, ay + 2], [ax + 52, ay + 12], [ax - 18, ay + 12]], col); return [kx, ky]; };
  const kF_ = leg(-10, lF, kF), kN_ = leg(12, lN, kN);
  if (!modern) {   // knee-length dhoti with a zig-zag hem
    const hemY = (kF_[1] + kN_[1]) / 2 - 24, xl = Math.min(kF_[0], kN_[0]) - 40, xr = Math.max(kF_[0], kN_[0]) + 40, pts = [[-54, -528], [56, -528], [xr, hemY]];
    for (let i = 1; i < 8; i++) pts.push([lerp(xr, xl, i / 8), hemY + (i % 2 ? 16 : 0)]);
    pts.push([xl, hemY]); fillP(pts, col);
    if (holes) { for (let i = 1; i < 8; i++) hole(lerp(xr - 14, xl + 14, i / 8), hemY - 22, 5.5, hc); hole(2, -470, 6, hc); hole(-14, -440, 6, hc); hole(18, -440, 6, hc); hole(2, -410, 6, hc); }
  } else { rr(-50, -540, 100, 44, 8); ctx.fillStyle = col; ctx.fill(); }
  if (holes) { rivet(kN_[0], kN_[1], hc, col); }
  if (tool === 'planted') {
    rr(170, -770, 16, 770, 6); ctx.fillStyle = col; ctx.fill(); fillP([[178, -770], [70, -822], [64, -800], [86, -770], [178, -740]], col);
    if (holes) { hole(178, -600, 5, hc); hole(178, -420, 5, hc); }
  }
  // torso, head and arms rotate about the hip
  ctx.save(); ctx.translate(0, -500); ctx.rotate(lean);
  const arm = (sx, sy, u, f, wide) => { const [ex, ey] = limb(sx, sy, u, 165, wide, 26, col); const [hx, hy] = limb(ex, ey, f, 150, 24, 18, col); circle(hx, hy, 17, col); return [ex, ey, hx, hy]; };
  const AF = arm(-8, -284, uF, fF, 32);
  // torso
  if (modern) fillP([[-50, 30], [50, 30], [62, -240], [66, -282], [42, -306], [-42, -306], [-64, -282], [-58, -240]], col);
  else fillP([[-44, 0], [44, 0], [56, -150], [66, -236], [64, -282], [40, -306], [-40, -306], [-62, -282], [-54, -236], [-50, -150]], col);
  // head on its neck pivot
  ctx.save(); ctx.translate(2, -318); ctx.rotate(head);
  rr(-14, -26, 28, 36, 8); ctx.fillStyle = col; ctx.fill();
  ell(10, -62, 40, 47, col); fillP([[30, -40], [52, -46], [46, -24], [24, -14]], col);
  if (modern) { ell(2, -94, 44, 24, col, -0.12); }
  else { ell(2, -96, 50, 22, col, -0.18); circle(-38, -96, 20, col); if (holes) { hole(4, -98, 5, hc); hole(-14, -94, 4, hc); hole(22, -100, 4, hc); } }
  ctx.restore();
  const AN = arm(16, -282, uN, fN, 34);
  if (tool === 'hoe') {
    const [hx, hy] = [AN[2], AN[3]], dx = Math.sin(fN), dy = Math.cos(fN), ex = hx + dx * 360, ey = hy + dy * 360;
    ctx.beginPath(); ctx.moveTo(hx - dx * 50, hy - dy * 50); ctx.lineTo(ex, ey); ctx.lineWidth = 15; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
    const b = fN - 1.35, bx = Math.sin(b), by = Math.cos(b), nx = by, ny = -bx;
    fillP([[ex + nx * 17, ey + ny * 17], [ex + bx * 120 + nx * 36, ey + by * 120 + ny * 36], [ex + bx * 128 - nx * 36, ey + by * 128 - ny * 36], [ex - nx * 17, ey - ny * 17]], col);
  }
  if (holes) {
    for (let yy = -40; yy >= -250; yy -= 28) { const wx = 44 + (60 - 44) * (-yy / 250); hole(wx - 15, yy, 5, hc); hole(-wx + 13, yy, 5, hc); }
    if (modern) { for (let yy = -60; yy >= -260; yy -= 44) hole(18, yy, 5.5, hc); fillP([[-6, -300], [16, -262], [34, -300]], hc); }
    else { hole(2, -150, 8, hc); for (let k = 0; k < 6; k++) hole(2 + Math.cos(k * TAU / 6) * 26, -150 + Math.sin(k * TAU / 6) * 26, 5.5, hc); for (let xx = -28; xx <= 28; xx += 14) hole(xx, -288, 4.5, hc); for (let xx = -36; xx <= 36; xx += 18) hole(xx, -16, 4.5, hc); }
    rivet(AN[0], AN[1], hc, col); rivet(16, -282, hc, col);
  }
  ctx.restore();
  if (sticks) {   // the puppeteer's rods, running down out of frame
    const R = (px, py) => [px * Math.cos(lean) - py * Math.sin(lean), -500 + px * Math.sin(lean) + py * Math.cos(lean)];
    const [bx, by] = R(0, -170), [hx, hy] = R(AN[2], AN[3]);
    ctx.strokeStyle = rgba(INK, 0.85); ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2.6 / s, 6);
    ctx.beginPath(); ctx.moveTo(bx, by + drop * 0); ctx.lineTo(bx + 70, 4000); ctx.moveTo(hx, hy); ctx.lineTo(hx + 210, 4000); ctx.stroke();
  }
  ctx.restore();
}

// ───────────── the coast map (stylised, not to scale) ─────────────
const COAST = [[83.0, 17.6], [82.7, 17.3], [82.45, 17.05], [82.32, 16.95], [82.36, 16.8], [82.32, 16.6], [82.1, 16.45], [81.85, 16.35], [81.55, 16.32], [81.3, 16.25], [81.15, 16.12], [81.12, 15.95], [81.05, 15.78], [80.9, 15.72], [80.65, 15.78], [80.45, 15.82], [80.28, 15.62], [80.15, 15.4], [80.08, 15.15], [80.05, 14.85], [80.12, 14.55], [80.18, 14.25], [80.2, 13.95], [80.27, 13.65], [80.33, 13.4], [80.3, 13.2], [80.293, 13.07], [80.288, 13.0], [80.27, 12.8], [80.2, 12.6], [80.1, 12.4], [80.0, 12.2], [79.86, 12.0], [79.8, 11.7], [79.75, 11.2]];
const CANAL = [[82.2, 16.95], [82.12, 16.72], [81.95, 16.55], [81.65, 16.47], [81.35, 16.38], [81.1, 16.22], [80.95, 16.02], [80.8, 15.92], [80.55, 15.93], [80.35, 15.78], [80.2, 15.5], [80.0, 15.15], [79.97, 14.85], [80.03, 14.55], [80.1, 14.25], [80.12, 13.95], [80.2, 13.65], [80.25, 13.4], [80.25, 13.2], [80.2535, 13.072], [80.2507, 13.012], [80.25, 13.0], [80.22, 12.82], [80.14, 12.6], [80.04, 12.4], [79.93, 12.22]];
const CUM = [0]; for (let i = 1; i < CANAL.length; i++) CUM.push(CUM[i - 1] + Math.hypot((CANAL[i][0] - CANAL[i - 1][0]) * 0.97, CANAL[i][1] - CANAL[i - 1][1]));
const DTOT = CUM[CUM.length - 1], DN = CUM[19], DS = CUM[20];   // the famine link runs CANAL[19] (Cooum) → CANAL[20] (Adyar)
function canalAt(d) { d = clamp(d, 0, DTOT); let i = 1; while (i < CUM.length - 1 && CUM[i] < d) i++; const u = (d - CUM[i - 1]) / ((CUM[i] - CUM[i - 1]) || 1); return [lerp(CANAL[i - 1][0], CANAL[i][0], u), lerp(CANAL[i - 1][1], CANAL[i][1], u)]; }
function canalPath(a, b) { const out = [canalAt(a)]; for (let i = 0; i < CUM.length; i++) if (CUM[i] > a && CUM[i] < b) out.push(CANAL[i]); out.push(canalAt(b)); return out; }
const COOUM = [[80.293, 13.068], [80.272, 13.073], [80.254, 13.071], [80.232, 13.077], [80.21, 13.074], [80.19, 13.081], [80.16, 13.078], [80.12, 13.086], [80.06, 13.08]];
const ADYAR = [[80.287, 13.012], [80.266, 13.007], [80.251, 13.012], [80.23, 13.005], [80.205, 13.011], [80.18, 13.003], [80.14, 13.009], [80.1, 13.0], [80.04, 13.006]];
const BLOCKS = []; for (let gx = 0; gx < 22; gx++) for (let gy = 0; gy < 26; gy++) { const lo = 80.12 + gx * 0.0075, la = 12.94 + gy * 0.0082 + (gx % 2) * 0.002, k = gx * 31 + gy;
  if (rnd(k * 1.3) < 0.28 || lo > 80.282 || Math.abs(lo - 80.252) < 0.007 || Math.abs(la - 13.074) < 0.007 || Math.abs(la - 13.009) < 0.007) continue; BLOCKS.push([lo, la, 0.004 + rnd(k) * 0.0022, 0.004 + rnd(k * 2.1) * 0.0028]); }
const crackImg = () => cached('c:cracks', 1080, 1920, 0.5, () => {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 240; i++) { let x = rnd(i * 1.1) * 1080, y = rnd(i * 2.7 + 4) * 1920, a = rnd(i * 3.3) * TAU; ctx.beginPath(); ctx.moveTo(x, y); const n = 4 + Math.floor(rnd(i * 5.9) * 8);
    for (let k = 0; k < n; k++) { a += (rnd(i * 13 + k) - 0.5) * 1.6; x += Math.cos(a) * 26; y += Math.sin(a) * 26; ctx.lineTo(x, y); }
    ctx.strokeStyle = `rgba(58,36,24,${0.15 + rnd(i * 7) * 0.25})`; ctx.lineWidth = 1 + rnd(i * 9) * 2.4; ctx.stroke(); }
});
const view = (lon0, lat0, cx, cy, s) => ({ s, P: ([lo, la]) => [cx + (lo - lon0) * s * 0.97, cy - (la - lat0) * s] });
const pathV = (V, pts) => { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = V.P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); };
function strokeChannel(V, pts, w, ink = INK, core = BONE) { pathV(V, pts); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = w; ctx.stroke(); if (core) { ctx.strokeStyle = core; ctx.lineWidth = w * 0.34; ctx.stroke(); } }
function boat(x, y, s, t, ph) { ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + ph) * 3 * s); ctx.rotate(Math.sin(t * 1.6 + ph) * 0.06); ctx.scale(s, s);
  fillP([[-34, 0], [34, 0], [26, 8], [-28, 8]], INK); fillP([[-4, -2], [-2, -56], [26, -6]], INK); ctx.restore(); }
/** o: { nD, sD (how far the older stretches have drawn from the link, in map units), link, bead, seaA, lab:{...}, dig } */
function drawMap(t, V, o = {}) {
  const lab = o.lab || {};
  const CX = [[84.5, 19.5]].concat(COAST, [[79.6, 9.5]]), land = CX.concat([[70, 9.5], [70, 19.5]]), sea = CX.concat([[95, 9.5], [95, 19.5]]);
  ctx.save(); pathV(V, land); ctx.closePath(); ctx.fillStyle = rgba(DUST1, 0.46); ctx.fill(); ctx.clip(); blit(crackImg(), 0, 0, 0, 0, 1, 0.9);
  if (V.s > 700) { ctx.strokeStyle = rgba(INK, 0.22 * clamp((V.s - 700) / 900)); ctx.lineWidth = 1.6; for (const [lo, la, w, h] of BLOCKS) { const [x, y] = V.P([lo, la]); if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue; ctx.strokeRect(x, y, w * V.s * 0.97, h * V.s); } }
  ctx.restore();
  // sea: broken wave hatching
  ctx.save(); pathV(V, sea); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = rgba(UMB1, 0.2 + (o.seaA || 0) * 0.25); ctx.lineWidth = 2;
  for (let r = 0; r < 78; r++) { const y = -120 + r * 28, off = (t * 14 * (r % 2 ? 1 : -1) + rnd(r) * 40) % 40; ctx.beginPath();
    for (let k = -2; k < 30; k++) { if (rnd(r * 31 + k) < 0.38) continue; const x = k * 40 + off - 40; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 6, x + 20, y); ctx.quadraticCurveTo(x + 30, y + 6, x + 38, y); }
    ctx.stroke(); }
  ctx.restore();
  // coast: double ink line
  pathV(V, CX); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); ctx.translate(11, 0); pathV(V, CX); ctx.strokeStyle = rgba(INK, 0.3); ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
  // rivers of Madras
  const rw = clamp(V.s / 260, 2.5, 13);
  if (V.s > 500) { strokeChannel(V, COOUM, rw); strokeChannel(V, ADYAR, rw); }
  // the canal: older stretches
  const cw = clamp(V.s / 230, 7, 15);
  if (o.nD > 0) strokeChannel(V, canalPath(Math.max(0, DN - o.nD), DN + 0.0005), cw);
  if (o.sD > 0) strokeChannel(V, canalPath(DS - 0.0005, Math.min(DTOT, DS + o.sD)), cw);
  // a bead of lamp light running the whole canal (C3)
  if (o.bead != null) { const b = o.bead * DTOT; if (b > 0.001) { pathV(V, canalPath(0, b)); ctx.strokeStyle = '#FFF4DA'; ctx.lineWidth = cw * 0.45; ctx.stroke(); } const [bx, by] = V.P(canalAt(b)); glowAt(bx, by, 70, GLOW, 0.9 * clamp(o.bead * 30) * clamp((1 - o.bead) * 30 + 0.3)); circle(bx, by, 6, '#FFF8E8'); }
  // the famine link, gold
  if (o.link > 0) { const a = V.P(CANAL[19]), b = V.P(CANAL[20]), pulse = 0.75 + 0.25 * Math.sin(t * 5);
    ctx.save(); ctx.globalAlpha *= o.link; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = rgba(GOLD, 0.25 * pulse); ctx.lineWidth = cw * 3.6; ctx.stroke(); ctx.strokeStyle = GOLD; ctx.lineWidth = cw * 1.15; ctx.stroke(); ctx.strokeStyle = '#FFE9A6'; ctx.lineWidth = cw * 0.3; ctx.stroke(); ctx.restore(); }
  // tiny diggers at the heads of the drawing lines
  if (o.dig) for (const [d, on, dirn] of [[DN - o.nD, o.nD > 0.002 && o.nD < DN - 0.002, 1], [DS + o.sD, o.sD > 0.002 && o.sD < DTOT - DS - 0.002, -1]]) {
    if (!on) continue; const [x, y] = V.P(canalAt(d)); puppet(x - 10, y + 6, o.dig, { t, pose: 'dig', dir: dirn, ph: dirn > 0 ? 0 : 0.4, cyc: t * 1.6 });
  }
  // labels
  const lt = (k) => lab[k] || 0;
  if (lt('cooum')) { const [x, y] = V.P(COOUM[5]); note('COOUM', x, y - 34, 34, UMB1, lt('cooum'), 'center', 6); }
  if (lt('adyar')) { const [x, y] = V.P(ADYAR[5]); note('ADYAR', x, y + 38, 34, UMB1, lt('adyar'), 'center', 6); }
  if (lt('link')) { const a = V.P(CANAL[19]), b = V.P(CANAL[20]); const my = (a[1] + b[1]) / 2; ctx.save(); ctx.globalAlpha *= lt('link'); rr(a[0] - 330, my - 58, 290, 112, 10); ctx.fillStyle = rgba(BONE, 0.85); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(a[0] - 40, my); ctx.lineTo(a[0] - 14, my); ctx.stroke(); ctx.restore();
    note('8 km', a[0] - 185, my - 20, 50, '#7A5410', lt('link'), 'center', 1); note('dug in the famine', a[0] - 185, my + 26, 29, UMB1, lt('link'), 'center', 1); }
  if (lt('chennai')) { const [x, y] = V.P([80.255, 13.04]); circle(x, y, 9, INK); circle(x, y, 4, GOLD); note('CHENNAI', x - 28, y, 40, INK, lt('chennai'), 'right', 5); }
  if (lt('kak')) { const [x, y] = V.P(CANAL[0]); circle(x, y, 9 * lt('kak'), INK); note('KAKINADA', x - 26, y - 34, 40, INK, lt('kak'), 'right', 5); }
  if (lt('bay')) { const [x, y] = V.P([81.3, 13.4]); note('BAY  OF  BENGAL', x, y, 32, UMB1, lt('bay') * 0.6, 'center', 7); }
}

// ───────────── crack-spread transition (C3 → C4) ─────────────
const GX = 7, GY = 11, GX0 = -80, GY0 = -80, CW_ = (1160 - GX0) / GX, CH_ = (2000 - GY0) / GY, ORIGIN = [372, 1036];
const GV = []; for (let i = 0; i <= GX; i++) { GV.push([]); for (let j = 0; j <= GY; j++) { const inner = i > 0 && i < GX && j > 0 && j < GY; GV[i].push([GX0 + i * CW_ + (inner ? (rnd(i * 17 + j * 3) - 0.5) * 120 : 0), GY0 + j * CH_ + (inner ? (rnd(i * 5 + j * 29) - 0.5) * 120 : 0)]); } }
const EDGES = new Map();
function edge(k, A, B, sd) { if (EDGES.has(k)) return EDGES.get(k); const pts = [A]; const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1;
  for (let f = 1; f < 5; f++) { const jt = (rnd(sd + f * 7.1) - 0.5) * 52; pts.push([A[0] + dx * f / 5 - dy / l * jt, A[1] + dy * f / 5 + dx / l * jt]); } pts.push(B); EDGES.set(k, pts); return pts; }
const eH = (i, j) => edge(`h${i},${j}`, GV[i][j], GV[i + 1][j], i * 13 + j * 71), eV = (i, j) => edge(`v${i},${j}`, GV[i][j], GV[i][j + 1], i * 41 + j * 7 + 500);
const CELLS = []; for (let i = 0; i < GX; i++) for (let j = 0; j < GY; j++) { const pts = [...eH(i, j), ...eV(i + 1, j), ...eH(i, j + 1).slice().reverse(), ...eV(i, j).slice().reverse()];
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; CELLS.push({ pts, cx, cy, d: Math.hypot(cx - ORIGIN[0], cy - ORIGIN[1]), sd: i * 31 + j * 7 }); }
const ALLEDGES = [...EDGES.values()];
function cracks(p) {   // p = front radius in px
  if (p <= 0) return; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pts of ALLEDGES) {
    const d0 = Math.hypot(pts[0][0] - ORIGIN[0], pts[0][1] - ORIGIN[1]), d1 = Math.hypot(pts[pts.length - 1][0] - ORIGIN[0], pts[pts.length - 1][1] - ORIGIN[1]);
    const P = d0 <= d1 ? pts : pts.slice().reverse(), dmin = Math.min(d0, d1), dmax = Math.max(d0, d1), f = clamp((p - dmin) / (dmax - dmin + 60)); if (f <= 0) continue;
    const n = (P.length - 1) * f; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let k = 1; k <= Math.ceil(n); k++) { const u = Math.min(1, n - (k - 1)); ctx.lineTo(lerp(P[k - 1][0], P[k][0], u), lerp(P[k - 1][1], P[k][1], u)); }
    ctx.strokeStyle = rgba(DUST1, 0.8); ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke();
  }
  circle(ORIGIN[0], ORIGIN[1], 10, INK);
}

// ───────────── today: skyline, water, debris ─────────────
const skylineImg = () => cached('c:skyline', 1700, 760, 1, () => {
  const B = 760; let x = 0, i = 0; ctx.fillStyle = INK;
  while (x < 1700) {
    const w = 56 + rnd(i * 3.1) * 120, tall = rnd(i * 9.3) > 0.82, h = (110 + rnd(i * 5.7) * 260) * (tall ? 1.75 : 1);
    ctx.fillStyle = INK; ctx.fillRect(x, B - h, w, h);
    if (rnd(i * 2.2) > 0.55) { ctx.fillRect(x + w * 0.25, B - h - 30, w * 0.36, 22); ctx.fillRect(x + w * 0.28, B - h - 8, 4, 8); ctx.fillRect(x + w * 0.56, B - h - 8, 4, 8); }
    if (rnd(i * 4.4) > 0.72) { ctx.fillRect(x + w * 0.7, B - h - 70, 3, 70); }
    ctx.fillStyle = 'rgba(232,222,196,0.55)';
    for (let yy = B - h + 18; yy < B - 30; yy += 26) for (let xx = x + 9; xx < x + w - 14; xx += 19) if (rnd(xx * 0.37 + yy * 0.11) > 0.62) ctx.fillRect(xx, yy, 8, 12);
    x += w + rnd(i * 7) * 16 - 3; i++;
  }
  // a lattice tower and a few palms in front
  ctx.strokeStyle = INK; ctx.lineWidth = 3; const tx = 1180; ctx.beginPath(); ctx.moveTo(tx - 30, B); ctx.lineTo(tx, B - 560); ctx.lineTo(tx + 30, B); for (let k = 1; k < 12; k++) { const y = B - k * 46, wv = 30 * (1 - k * 46 / 560); ctx.moveTo(tx - wv, y); ctx.lineTo(tx + wv, y - 46); } ctx.stroke();
  for (const [px, ph, ln] of [[90, 260, 0.12], [420, 210, -0.1], [760, 290, 0.08], [1460, 240, -0.06]]) palm(px, B, ph, ln, px, INK, 0);
});
function bird(x, y, s, t, ph) { const f = Math.sin(t * 9 + ph) * 0.6; ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 10 * s * f); ctx.quadraticCurveTo(x - 6 * s, y - 4 * s, x, y); ctx.quadraticCurveTo(x + 6 * s, y - 4 * s, x + 18 * s, y - 10 * s * f); ctx.strokeStyle = INK; ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.stroke(); }
function water(t, y0, o = {}) {
  ctx.fillStyle = lg(0, y0, 0, y0 + 1100, [[0, mixc(MUD, '#C9C7AE', 0.25)], [0.18, MUD], [1, '#3A4433']]); ctx.fillRect(-300, y0, W + 600, H + 600 - y0);
  if (o.warm) { const g = ctx.createRadialGradient(540, o.wy ?? 1050, 0, 540, o.wy ?? 1050, 760); g.addColorStop(0, rgba(GLOW, 0.75 * o.warm)); g.addColorStop(0.5, rgba(DUST1, 0.35 * o.warm)); g.addColorStop(1, rgba(DUST1, 0)); ctx.fillStyle = g; ctx.fillRect(-300, y0, W + 600, H + 600 - y0); }
}
function streaks(t, y0, y1, n = 50, a = 1) {
  for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i * 3.3 + 1), 1.4), yy = y0 + u * (y1 - y0), ww = 40 + rnd(i * 1.7) * 160 * (1 + u), xx = ((rnd(i * 5.1) * (W + 500) + t * (10 + rnd(i) * 14)) % (W + 500)) - 250;
    ctx.fillStyle = `rgba(214,216,192,${(0.05 + rnd(i * 7) * 0.11) * a})`; ctx.fillRect(xx, yy, ww, 1.5 + u * 2.5); }
}
function hyacinth(x, y, s, t, sd) {
  ell(x, y + 4 * s, 46 * s, 10 * s, 'rgba(20,26,16,0.35)');
  for (let k = 0; k < 6; k++) { const a = rnd(sd + k) * TAU, r = rnd(sd * 3 + k) * 26 * s; ell(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.35, 18 * s, 7 * s, k % 2 ? WEED : WEED2, (rnd(sd + k * 5) - 0.5) * 0.6); }
  for (let k = 0; k < 4; k++) { const bx = x + (rnd(sd * 7 + k) - 0.5) * 50 * s, sw = Math.sin(t * 1.4 + sd + k) * 0.08, hh = (26 + rnd(sd + k * 9) * 22) * s;
    ctx.save(); ctx.translate(bx, y); ctx.rotate((rnd(sd * 2 + k) - 0.5) * 0.7 + sw); rr(-2.5 * s, -hh, 5 * s, hh, 2); ctx.fillStyle = WEED; ctx.fill(); ell(0, -hh - 9 * s, 11 * s, 13 * s, k % 2 ? WEED2 : WEED); ctx.restore(); }
}
function bottle(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(-26, -9, 44, 18, 8); ctx.fillStyle = 'rgba(176,184,160,0.85)'; ctx.fill(); rr(16, -5, 14, 10, 3); ctx.fill(); ctx.fillStyle = 'rgba(255,255,240,0.35)'; ctx.fillRect(-18, -6, 26, 3); ctx.restore(); }
function bag(x, y, s, t, sd) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = 22 + rnd(sd + k) * 14 + Math.sin(t * 1.5 + k) * 2; k ? ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.5) : ctx.moveTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.5); } ctx.closePath(); ctx.fillStyle = 'rgba(206,204,186,0.6)'; ctx.fill(); ctx.restore(); }
function tyre(x, y, s) { ctx.beginPath(); ctx.ellipse(x, y, 38 * s, 13 * s, 0, 0, TAU); ctx.strokeStyle = INK; ctx.lineWidth = 11 * s; ctx.stroke(); }
function foam(x, y, s, sd) { for (let k = 0; k < 5; k++) ell(x + (rnd(sd + k) - 0.5) * 60 * s, y + (rnd(sd * 2 + k) - 0.5) * 10 * s, (6 + rnd(sd + k * 3) * 12) * s, (2.5 + rnd(k + sd) * 3) * s, 'rgba(200,202,180,0.5)'); }
function debris(kind, x, y, s, t, sd) { if (kind < 0.5) hyacinth(x, y, s, t, sd); else if (kind < 0.66) bottle(x, y, s, Math.sin(t + sd) * 0.3 + rnd(sd) * 3); else if (kind < 0.82) bag(x, y, s, t, sd); else if (kind < 0.93) foam(x, y, s, sd); else tyre(x, y, s); }
function viaduct(t, y, xoff, train) {
  ctx.fillStyle = INK; ctx.fillRect(-300, y, W + 600, 26); ctx.fillRect(-300, y + 30, W + 600, 6);
  for (let px = -200 + (xoff % 190); px < W + 200; px += 190) { ctx.fillRect(px - 14, y + 30, 28, 200); fillP([[px - 34, y + 26], [px + 34, y + 26], [px + 14, y + 60], [px - 14, y + 60]], INK); }
  if (train != null) for (let c = 0; c < 4; c++) { const x = train + c * 236; rr(x, y - 50, 228, 50, [16, 16, 2, 2]); ctx.fillStyle = INK; ctx.fill(); ctx.fillStyle = 'rgba(232,222,196,0.55)'; for (let k = 0; k < 7; k++) ctx.fillRect(x + 14 + k * 30, y - 40, 18, 16); }
}
function bank(y, seed) {
  ctx.fillStyle = lg(0, y - 30, 0, y + 60, [[0, UMB1], [1, UMB0]]); ctx.beginPath(); ctx.moveTo(-300, y + 50); for (let x = -300; x <= W + 300; x += 40) ctx.lineTo(x, y - 6 - rnd(seed + x * 0.1) * 18); ctx.lineTo(W + 300, y + 50); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 7; k++) { const hx = rnd(seed + k * 3.7) * W, hw = 60 + rnd(k + seed) * 120; ctx.beginPath(); ctx.moveTo(hx - hw, y + 4); ctx.quadraticCurveTo(hx, y - 40 - rnd(k * 2 + seed) * 30, hx + hw, y + 4); ctx.fillStyle = INK; ctx.fill(); }
  ctx.fillStyle = rgba(DUST1, 0.5); ctx.fillRect(-300, y + 44, W + 600, 4);
}

// ───────────── bridge (C6, C7) ─────────────
const BR = { deck: 520, wl: 690 };
function bridgeScene(t, o = {}) {
  const d = BR.deck, x0 = o.xoff || 0;
  if (o.sky !== false) blit(skylineImg(), 850, 760, 540 + x0 * 0.4, BR.wl - 4, 0.62, 0.5);
  // railing, deck, piers, lamps
  ctx.fillStyle = INK; ctx.fillRect(-300, d - 66, W + 600, 10); ctx.fillRect(-300, d - 14, W + 600, 8);
  for (let x = -300 + ((x0 % 34) + 34) % 34; x < W + 300; x += 34) ctx.fillRect(x, d - 60, 8, 50);
  ctx.fillRect(-300, d, W + 600, 46); ctx.fillStyle = rgba(DUST1, 0.35); ctx.fillRect(-300, d + 6, W + 600, 3);
  ctx.fillStyle = INK; for (const px of [120, 540, 960]) { const x = px + x0; ctx.fillRect(x - 34, d + 46, 68, BR.wl - d + 30); fillP([[x - 60, d + 46], [x + 60, d + 46], [x + 34, d + 80], [x - 34, d + 80]], INK); }
  for (const lx of [300, 790]) { const x = lx + x0; ctx.fillStyle = INK; ctx.fillRect(x - 5, d - 330, 10, 330); ctx.beginPath(); ctx.moveTo(x, d - 326); ctx.quadraticCurveTo(x + 10, d - 360, x + 60, d - 352); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); rr(x + 44, d - 356, 44, 14, 5); ctx.fill();
    if (o.lamps) glowAt(x + 66, d - 336, 120, GLOW, 0.4 * o.lamps); }
}
let RC = null;
function withCanvas(fn) { if (!RC) { RC = document.createElement('canvas'); RC.width = W; RC.height = H; } const prev = ctx, c = RC.getContext('2d'); setCtx(c); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H); fn(); setCtx(prev); return RC; }
/** mirror fn()'s drawing about the water line, broken into rippling strips */
function reflection(t, wl, fn, a = 0.55, amp = 1, mirror = true) {
  const c = withCanvas(() => { if (mirror) { ctx.translate(0, 2 * wl); ctx.scale(1, -1); } fn(); });
  ctx.save(); ctx.globalAlpha *= a;
  for (let y = wl; y < H; y += 4) { const k = (y - wl), dx = Math.sin(k * 0.05 - t * 3.2) * (1.5 + k * 0.012) * amp + Math.sin(k * 0.013 + t * 1.3) * 3 * amp; ctx.drawImage(c, 0, y, W, 4, dx, y, W, 4.6); }
  ctx.restore();
}

// ───────────── end card ─────────────
function woodFrame(t, bottom) {
  const bar = (x, y, w, h) => { ctx.fillStyle = lg(x, y, x + (w < h ? w : 0), y + (w < h ? 0 : h), [[0, '#4A2E1A'], [0.5, '#2E1C10'], [1, '#160D07']]); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); if (w < h) { const xx = x + 6 + k * (w - 12) / 5; ctx.moveTo(xx, y); ctx.bezierCurveTo(xx + 5, y + h * 0.3, xx - 5, y + h * 0.6, xx + 3, y + h); } else { const yy = y + 5 + k * (h - 10) / 5; ctx.moveTo(x, yy); ctx.bezierCurveTo(x + w * 0.3, yy + 4, x + w * 0.6, yy - 4, x + w, yy + 2); } ctx.stroke(); } };
  bar(-300, -300, 346, H + 600); bar(W - 46, -300, 346, H + 600); bar(-300, -300, W + 600, 362); bar(-300, bottom, W + 600, 70);
  ctx.strokeStyle = rgba(INK, 0.7); ctx.lineWidth = 3; for (let y = 120; y < bottom; y += 110) for (const x of [46, W - 46]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x < 540 ? 22 : -22), y + 8); ctx.stroke(); }
  for (let x = 110; x < W - 60; x += 110) { ctx.beginPath(); ctx.moveTo(x, 62); ctx.lineTo(x + 8, 84); ctx.stroke(); }
}
function grainHeap(x, y, w, h, t) {
  ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y - h * 2, x + w, y); ctx.closePath(); ctx.fillStyle = lg(0, y - h, 0, y, [[0, '#F3CF6A'], [1, '#B8862A']]); ctx.fill();
  for (let i = 0; i < 70; i++) { const u = rnd(i * 2.1) * 2 - 1, top = y - h * (1 - u * u), gy = lerp(top, y, rnd(i * 4.3)), gx = x + u * w * 0.95; ell(gx, gy, 4.5, 2.6, i % 3 ? '#F6D77E' : '#9C6E1E', rnd(i) * 3); }
  for (let i = 0; i < 6; i++) { const ph = (t * 0.9 + i / 6) % 1, gx = x + (rnd(i * 3) - 0.5) * 30, gy = y - h - 140 + ph * 140; ctx.globalAlpha = clamp((1 - ph) * 4) * clamp(ph * 6); ell(gx, gy, 4, 2.4, GOLD, ph * 6); ctx.globalAlpha = 1; }
}

export function buildC(add, cue) {
  const t1 = L(10), t2 = Wd('Buckingham', 10), t3 = Wd('seven', 10), t4 = Le(10) + 0.54, t5 = Wd('stretches', 11), t6 = L(12), t7 = Wd('remember', 12), t8 = Le(12) + 0.95;
  const tOld = Wd('older', 10), tKm = Wd('kilometres', 10), tAlong = Wd('along', 10), tToday = L(11), tChen = Wd('Chennai', 11), tChoke = Wd('choked', 11), tNeg = Wd('neglected', 11), tDug = Wd('dug', 12), tAaz = Wd('Aazhi', 13), tNext = Wd('next', 13);
  const VC1 = (lt) => view(80.255, 13.04 + lt * 0.006, 560, 800, 3000 * (1 + 0.04 * lt));
  const NC1 = 0.29, SC1 = 0.3;

  // C1 · the gold famine link in the Madras plan; older stretches shoot out north and south
  add({ id: 'C1', at: t1, cam: [560, 780], zoom: 0.05, note: 'Madras plan, gold 8 km link, older stretches draw N+S with tiny diggers',
    draw(lt, d, t) {
      lt = Math.max(0, lt); t = Math.max(t, t1);   // robust if drawn before its start (e.g. while other groups are stubs)
      screen(t, { lx: 620, ly: 760 });
      const g = eio(seg(t, tOld - 0.15, t2 + 0.05));
      drawMap(t, VC1(lt), { nD: NC1 * g, sD: SC1 * g, link: 1, dig: 74, lab: { cooum: eo(seg(lt, 0.1, 0.5)), adyar: eo(seg(lt, 0.2, 0.6)), link: eo(seg(lt, 0.05, 0.45)) } });
      const p = seg(t, tOld - 0.05, tOld + 0.45);
      ctx.save(); ctx.globalAlpha = eo(p); rr(150, 190, 780, 128, 10); ctx.fillStyle = rgba(BONE, 0.82); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.55); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      wood('+ OLDER STRETCHES', 540, 236, 58, INK, 1, p);
      note('some cut as early as 1806', 540, 290, 32, UMB1, eo(seg(p, 0.4, 1)), 'center', 2);
      motes(t, 30, 3, 0.4); vig(0.6);
    } });
  cue(t1 + 0.02, 'slide', { gain: 0.35 }); cue(tOld - 0.12, 'zip', { gain: 0.4 }); cue(tOld + 0.05, 'tock', { gain: 0.3 });

  // C2 · race up the coast: the line draws itself north to Kakinada
  const VC2 = (e) => view(lerp(80.255, 81.0, e), lerp(13.04 + 1.86 * 0.006, 15.9, e), lerp(560, 560, e), lerp(800, 760, e), 3000 * 1.074 * Math.pow(380 / (3000 * 1.074), e));
  add({ id: 'C2', at: t2, cam: [540, 760], zoom: 0.04, note: 'camera races N up the coast map as the canal ink line draws to KAKINADA',
    draw(lt, d, t) {
      screen(t, { lx: 560, ly: 640 });
      const e = eio(seg(lt, 0, d)), eh = Math.pow(e, 1.7), hd = canalAt(DN - lerp(NC1, DN, eh));
      const st = [80.255, 13.04 + 1.86 * 0.006], k1 = eo(seg(e, 0, 0.35)), k2 = eio(seg(e, 0.55, 1));
      const cLL = [lerp(lerp(st[0], hd[0] + 0.3 * e, k1), 81.0, k2), lerp(lerp(st[1], hd[1] - 0.15 * e, k1), 15.9, k2)];
      const sc = 3000 * 1.074 * Math.pow(380 / (3000 * 1.074), e);
      drawMap(t, view(cLL[0], cLL[1], 560, lerp(800, 760, e), sc), { nD: lerp(NC1, DN, eh), sD: lerp(SC1, DTOT - DS, e), link: 1, dig: 70, lab: { chennai: eo(seg(lt, 0.3, 0.7)), kak: eo(seg(lt, d - 0.35, d)), cooum: 1 - seg(lt, 0, 0.3), adyar: 1 - seg(lt, 0, 0.3), link: 1 - seg(lt, 0, 0.25) } });
      motes(t, 26, 5, 0.35); vig(0.6);
    } });
  cue(t2 + 0.02, 'whoosh', { gain: 0.45 }); cue(t2 + 0.1, 'zip', { gain: 0.35, dur: 1.2 }); cue(t3 - 0.3, 'tock', { gain: 0.35 });

  // C3 · the whole thin coast; a bead of lamp light runs the canal while ~796 km counts up; then the earth cracks
  const VC3 = (lt) => { const e = eio(seg(lt, 0, 1.0)); return view(lerp(81.0, 81.1, e), lerp(15.9, 14.6, e), 540, lerp(760, 720, e), 380 * Math.pow(208 / 380, e)); };
  const d3 = t4 - t3, C3 = { id: 'C3', at: t3, cam: [540, 820], zoom: 0.05, note: 'whole coast map Kakinada→south, light bead runs canal, ~796 km woodblock counter, cracks race at end' };
  C3.draw = (lt, d, t) => {
    screen(t, { lx: 560, ly: 820 });
    const pc = eio(seg(t, t3 + 0.1, tKm + 0.25));
    drawMap(t, VC3(lt), { nD: DN, sD: DTOT - DS, link: 1, bead: pc, seaA: eo(seg(t, tAlong - 0.1, tAlong + 0.5)), lab: { chennai: 1, kak: 1, bay: eo(seg(t, tAlong - 0.2, tAlong + 0.4)) } });
    // boats on the hatched sea, "along the coast"
    const V = VC3(lt), ba = eo(seg(t, tAlong - 0.3, tAlong + 0.4));
    if (ba > 0) { ctx.save(); ctx.globalAlpha = ba; for (const [lo, la, ph] of [[81.95, 15.55, 0], [80.75, 14.35, 2], [80.85, 12.75, 4], [81.9, 16.12, 1]]) { const [x, y] = V.P([lo, la]); boat(x + Math.sin(t * 0.5 + ph) * 8, y, 0.8, t, ph); } ctx.restore(); }
    // a bracket along the land side, growing with the count
    const k = V.P(CANAL[0]), s = V.P(CANAL[CANAL.length - 1]), bx = 232, by1 = lerp(k[1], s[1], pc);
    if (pc > 0) { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx + 24, k[1]); ctx.lineTo(bx, k[1]); ctx.lineTo(bx, by1); if (pc > 0.99) ctx.lineTo(bx + 24, by1); ctx.stroke(); }
    // the count, woodblock, below the caption band
    const cnt = Math.round(796 * pc), pp = seg(t, t3 + 0.05, t3 + 0.4), done = seg(t, tKm + 0.25, tKm + 0.5);
    wood('~' + cnt + ' km', 700, 640, 120, INK, 1, pp);
    if (done > 0) { ctx.save(); ctx.globalAlpha = eo(done); ctx.fillStyle = GOLD; ctx.fillRect(700 - 190 * eo(done), 716, 380 * eo(done), 7); ctx.restore(); }
    note('along the Coromandel coast', 700, 760, 32, UMB1, eo(seg(t, tAlong - 0.2, tAlong + 0.3)), 'center', 1);
    motes(t, 30, 7, 0.4); vig(0.6);
    cracks((lt - (d - 0.5)) * 3400);
  };
  add(C3);
  cue(t3 + 0.05, 'tock', { gain: 0.35 }); cue(t3 + 0.15, 'swell', { gain: 0.3, dur: 2.2 }); cue(tKm + 0.25, 'thud', { gain: 0.6 }); cue(tAlong + 0.05, 'whoosh', { gain: 0.25 }); cue(t4 - 0.5, 'rumble', { gain: 0.55, dur: 0.9 });
  const c3Final = () => cached('c:c3final', W, H, 0.75, () => { const z = 1 + C3.zoom; ctx.translate(C3.cam[0], C3.cam[1]); ctx.scale(z, z); ctx.translate(-C3.cam[0], -C3.cam[1]); C3.draw(d3 - 1e-3, d3, t4 - 1e-3); });

  // C4 · the map shatters away: TODAY, choked grey-green water under the Chennai skyline
  const todayDebris = []; for (let i = 0; i < 26; i++) { let y = rnd(i * 2.9) < 0.6 ? 1030 + rnd(i * 4.1) * 230 : 1560 + rnd(i * 6.3) * 330; todayDebris.push({ x: rnd(i * 1.7) * 1400 - 100, y, k: rnd(i * 8.1), s: 0.8 + (y - 1000) / 900 * 1.2, v: 10 + rnd(i * 3) * 14, sd: i * 11 }); }
  add({ id: 'C4', at: t4, cam: [540, 900], zoom: 0.07, note: 'cracked map shards fall away → TODAY: skyline + elevated railway, dull grey-green water, drifting debris',
    draw(lt, d, t) {
      screen(t, { lx: 600, ly: 560, dim: 0.6, r: 1150 });
      blit(skylineImg(), 850, 760, 560 - lt * 24, 968, 1, 1);
      for (let i = 0; i < 4; i++) bird(700 + i * 50 - lt * 90 + Math.sin(i) * 30, 420 + i * 22 + Math.sin(t * 2 + i) * 6, 0.9, t, i);
      viaduct(t, 818, -lt * 30, 1150 - lt * 460);
      bank(984, 7);
      water(t, 1010);
      reflection(t, 1010, () => { blit(skylineImg(), 850, 760, 560 - lt * 24, 968, 1, 1); viaduct(t, 818, -lt * 30, 1150 - lt * 460); }, 0.32, 1.2);
      streaks(t, 1012, 1920, 60);
      for (const b of todayDebris) { const x = ((b.x - lt * b.v) % 1400 + 1400) % 1400 - 160; debris(b.k, x, b.y + Math.sin(t * 1.3 + b.sd) * 3, b.s * (b.y > 1500 ? 1 : 0.8), t, b.sd); }
      const p = seg(t, tToday - 0.05, tToday + 0.3);
      wood('TODAY', 540, 250, 170, INK, 1, p);
      note('CHENNAI', 540, 362, 44, INK, eo(seg(t, tChen - 0.15, tChen + 0.25)), 'center', 12);
      motes(t, 24, 9, 0.25); vig(0.6);
      // shards of the map fall away
      if (lt < 0.95) { const img = c3Final();
        for (const c of CELLS) { const tau = lt - c.d / 4200 - 0.03; let dy = 0, dx = 0, rot = 0, sc = 1;
          if (tau > 0) { dy = 0.5 * 6400 * tau * tau + 200 * tau; dx = (c.cx - ORIGIN[0]) * tau * 0.5; rot = (rnd(c.sd) - 0.5) * tau * 3; sc = 1 - tau * 0.2; if (dy > 2300) continue; }
          ctx.save(); ctx.translate(c.cx + dx, c.cy + dy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-c.cx, -c.cy);
          if (tau > 0) { ctx.save(); ctx.translate(0, 16); poly(c.pts); ctx.fillStyle = '#5A3A22'; ctx.fill(); ctx.restore(); }
          poly(c.pts); ctx.save(); ctx.clip(); ctx.drawImage(img, 0, 0, W, H); if (tau > 0) { ctx.fillStyle = `rgba(18,11,7,${clamp(tau * 1.2) * 0.5})`; ctx.fillRect(c.cx - 400, c.cy - 400, 800, 800); } ctx.restore();
          ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke(); ctx.restore(); }
      }
    } });
  cue(t4 + 0.02, 'slam', { gain: 0.5 }); cue(t4 + 0.1, 'rumble', { gain: 0.35, dur: 0.6 }); cue(tToday, 'thud', { gain: 0.45 }); cue(tToday + 0.4, 'bubbles', { gain: 0.3 });

  // C5 · down the long choked stretch: hyacinth mats, plastic, a bottle plops in
  const VY = 640, xL = (y) => lerp(486, -340, (y - VY) / 1280), xR = (y) => lerp(600, 1420, (y - VY) / 1280);
  const items = []; for (let i = 0; i < 64; i++) { const edge = rnd(i * 2.3) < 0.72, sg = rnd(i * 5.5) < 0.5 ? -1 : 1; items.push({ l: edge ? sg * (0.5 + rnd(i * 3.1) * 0.48) : (rnd(i * 4.7) - 0.5) * 0.8, w0: rnd(i * 1.9), k: edge ? rnd(i * 7.7) * 0.62 : rnd(i * 7.7), sd: i * 13 }); }
  const mats = []; for (let i = 0; i < 90; i++) mats.push({ l: (i % 2 ? 1 : -1) * (0.86 + rnd(i * 2.2) * 0.13), w0: rnd(i * 3.9), sd: i * 7 + 300 });
  const posts = []; for (let i = 0; i < 10; i++) posts.push({ side: i % 2 ? 1 : -1, w0: i / 10 + rnd(i) * 0.04 });
  const tPlop = tChoke + 0.05;
  add({ id: 'C5', at: t5, cam: [540, 760], zoom: 0.08, note: 'perspective down the choked canal: hyacinth mats, plastic, posts receding, bottle plop, NEGLECTED woodblock',
    draw(lt, d, t) {
      screen(t, { lx: 560, ly: 470, dim: 0.65, r: 1100 });
      blit(skylineImg(), 850, 760, 520 - lt * 10, VY + 6, 0.42, 0.75);
      // banks
      ctx.fillStyle = lg(0, VY, 0, H, [[0, '#4A3020'], [1, UMB0]]); ctx.fillRect(-300, VY, W + 600, H - VY + 300); blit(crackImg(), 0, 0, 0, VY, 1, 0.9); blit(crackImg(), 0, 0, 300, VY + 500, 1, 0.7);
      // water trapezoid
      ctx.beginPath(); ctx.moveTo(xL(VY), VY); ctx.lineTo(xR(VY), VY); ctx.lineTo(xR(H + 200), H + 200); ctx.lineTo(xL(H + 200), H + 200); ctx.closePath();
      ctx.save(); ctx.clip(); water(t, VY - 10); streaks(t * 0.6, VY + 6, H, 70, 0.8); ctx.restore();
      ctx.strokeStyle = rgba(DUST1, 0.55); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xL(VY), VY); ctx.lineTo(xL(H + 200), H + 200); ctx.moveTo(xR(VY), VY); ctx.lineTo(xR(H + 200), H + 200); ctx.stroke();
      const dolly = lt * 0.05, uOf = (w) => 0.012 + 0.988 * w * w, yOf = (u) => VY + 1280 * u;
      // posts & rubble along the banks, receding
      for (const p of posts) { const w = (p.w0 + dolly) % 1, u = uOf(w), y = yOf(u), sc = u * 1.1 + 0.02, x = p.side < 0 ? xL(y) - 70 * sc : xR(y) + 70 * sc;
        ctx.fillStyle = INK; ctx.fillRect(x - 6 * sc, y - 420 * sc, 12 * sc, 420 * sc); ctx.beginPath(); ctx.moveTo(x - 90 * sc, y + 4); ctx.quadraticCurveTo(x, y - 60 * sc, x + 90 * sc, y + 4); ctx.fill(); }
      const all = [];
      for (const m of mats) { const w = (m.w0 + dolly) % 1, u = uOf(w); all.push([u, () => { const y = yOf(u), x = lerp(xL(y), xR(y), (m.l + 1) / 2); hyacinth(x, y, u * 2.4 + 0.08, t, m.sd); }]); }
      for (const it of items) { const w = (it.w0 + dolly) % 1, u = uOf(w); all.push([u, () => { const y = yOf(u), x = lerp(xL(y), xR(y), (it.l + 1) / 2) + Math.sin(t * 0.7 + it.sd) * 8 * u, calm = 1 - 0.55 * clamp(1 - Math.abs(y - 1400) / 140); ctx.save(); ctx.globalAlpha = calm; debris(it.k, x, y + Math.sin(t * 1.2 + it.sd) * 3 * u, u * 2.2 + 0.08, t, it.sd); ctx.restore(); }]); }
      all.sort((a, b) => a[0] - b[0]).forEach((a) => a[1]());
      // the plop: a bottle tossed in at "choked"
      const tf = t - (tPlop - 0.45);
      if (tf > 0 && tf < 0.45) { const u = tf / 0.45; bottle(lerp(760, 610, u), lerp(260, 1060, u * u), 1.4, tf * 9); }
      if (t > tPlop) { const r = t - tPlop; for (let k = 0; k < 3; k++) { const rr_ = (r - k * 0.18) * 260; if (rr_ <= 0) continue; ctx.beginPath(); ctx.ellipse(610, 1062, rr_, rr_ * 0.22, 0, 0, TAU); ctx.strokeStyle = `rgba(220,224,200,${clamp(0.6 - r * 0.25 - k * 0.1)})`; ctx.lineWidth = 3; ctx.stroke(); }
        if (r < 0.5) for (let k = 0; k < 8; k++) { const a = -Math.PI * (0.15 + 0.7 * rnd(k)), sp = 300 + rnd(k * 3) * 300; circle(610 + Math.cos(a) * sp * r, 1062 + Math.sin(a) * sp * r + 900 * r * r, 4, 'rgba(200,206,182,0.8)'); }
        bottle(610 + Math.sin(t) * 4, 1066, 1.0, 0.2); }
      const p = seg(t, tNeg - 0.05, tNeg + 0.3);
      wood('NEGLECTED', 540, 300, 120, INK, 0.95, p);
      motes(t, 20, 11, 0.25); vig(0.65);
    } });
  cue(t5 + 0.05, 'bubbles', { gain: 0.3 }); cue(tPlop, 'plop', { gain: 0.55 }); cue(tNeg + 0.02, 'thud', { gain: 0.4 });

  // C6 · a low bridge over the canal; a passer-by puppet walks across, its reflection below
  const debB = []; for (let i = 0; i < 14; i++) debB.push({ x: rnd(i * 3.3 + 50) * 1300 - 100, y: rnd(i * 1.3 + 9) < 0.5 ? 1260 + rnd(i * 2.1) * 30 : 1570 + rnd(i * 5.7) * 300, k: rnd(i * 7.1 + 3), sd: i * 17 + 900 });
  const passerX = (t) => lerp(150, 540, eo(clamp((t - t6) / (t7 - t6 - 0.12))));
  const walking = (t) => t < t7 - 0.12;
  const passer = (t, lookK, alpha = 1) => { if (alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; puppet(passerX(t), BR.deck, 220, { t, kind: 'modern', pose: walking(t) ? 'walk' : 'stand', cyc: (t - t6) * 1.5, look: lookK, holes: true, sticks: true, hole: mixc(BONE, '#AFAE9A', 0.5) }); ctx.restore(); };
  add({ id: 'C6', at: t6, cam: [540, 640], zoom: 0.07, note: 'low road bridge, passer-by puppet walks across and stops mid-span; rippling reflection in grey-green water',
    draw(lt, d, t) {
      screen(t, { lx: 640, ly: 380, dim: 0.5, r: 1150 });
      const xo = -lt * 12;
      bridgeScene(t, { xoff: xo, lamps: 1 });
      passer(t, 0);
      water(t, BR.wl);
      reflection(t, BR.wl, () => { bridgeScene(t, { xoff: xo }); passer(t, 0); }, 0.5);
      streaks(t, BR.wl + 4, 1920, 50);
      for (const b of debB) debris(b.k, ((b.x - lt * 16) % 1400 + 1400) % 1400 - 160, b.y + Math.sin(t + b.sd) * 3, b.y > 1500 ? 1.6 : 1.1, t, b.sd);
      motes(t, 20, 13, 0.25); vig(0.6);
    } });
  for (let k = 0; k < 4; k++) cue(t6 + 0.15 + k * 0.33, 'tock', { gain: 0.16, pan: -0.4 + k * 0.15 });

  // C7 · the camera tilts into the reflection: it becomes the row of 1877 diggers, lamp-lit under the water
  const DIG = [540, 330, 750, 130, 950];
  add({ id: 'C7', at: t7, cam: [540, 980], zoom: 0.1, note: 'tilt into reflection: passer-by reflection fades, 5 upright 1877 digger puppets rise under the rippling surface digging, water warms with lamp glow, 1877',
    draw(lt, d, t) {
      const ty = -280 * eio(seg(lt, 0, 1.3));
      ctx.save(); ctx.translate(0, ty);
      const warm = eo(seg(lt, 0.15, 1.1));
      screen(t, { lx: 640, ly: 380, dim: 0.5 - warm * 0.3, r: 1150 });
      bridgeScene(t, { xoff: -19 - lt * 8, lamps: 1 });
      passer(t, eo(seg(lt, 0, 0.5)));
      water(t, BR.wl, { warm, wy: 1080 });
      const morph = (k) => eo(seg(lt, 0.15 + k * 0.12, 0.7 + k * 0.12));
      reflection(t, BR.wl, () => { bridgeScene(t, { xoff: -19 - lt * 8, sky: false }); passer(t, eo(seg(lt, 0, 0.5)), 1 - morph(0)); }, lerp(0.5, 0.22, warm));
      // under the surface, the people who dug it: a row of 1877 digger puppets, lamp-lit, rippling
      reflection(t, BR.wl, () => {
        DIG.forEach((x, k) => { const m = morph(k); if (m <= 0) return; ctx.save(); ctx.globalAlpha = m; puppet(x, 1250 + (1 - m) * 60, k ? 340 : 380, { t, pose: 'dig', dir: k % 2 ? -1 : 1, ph: k * 0.17, cyc: (t - t7) * 0.95 + 0.62, hole: GLOW, sticks: true }); ctx.restore(); });
      }, 0.92, 0.7, false);
      streaks(t, BR.wl + 4, 2300, 50, 1 - warm * 0.5);
      for (const b of debB) { const x = ((b.x - (lt + 1.6) * 16) % 1400 + 1400) % 1400 - 160; ctx.save(); ctx.globalAlpha = 1 - warm * 0.6; debris(b.k, x + (x < 540 ? -1 : 1) * warm * 120, b.y + Math.sin(t + b.sd) * 3, b.y > 1500 ? 1.6 : 1.1, t, b.sd); ctx.restore(); }
      const p = seg(t, tDug - 0.05, tDug + 0.3);
      wood('1877', 540, 2040, 96, BONE, 0.95, p);
      motes(t, 26, 15, 0.35 + warm * 0.2);
      ctx.restore();
      vig(0.6, 900);
      // flash to the lamp-lit end card
      const fl = seg(lt, d - 0.25, d); if (fl > 0) { ctx.fillStyle = rgba(GLOW, fl * 0.85); ctx.fillRect(-300, -300, W + 600, H + 600); }
    } });
  cue(t7 + 0.02, 'swell', { gain: 0.45, dur: 1.8 }); cue(t7 + 0.25, 'inhale', { gain: 0.25 });
  // dig strikes: cycle phase c = (t - t7)*0.95 + 0.62 + ph hits 1 when (t - t7) = (0.38 - ph)/0.95 (+ n/0.95)
  for (const ph of [0]) for (let n = 0; n < 2; n++) { const ts = t7 + (0.38 - ph + n) / 0.95; if (ts < t8) cue(ts, 'chisel', { gain: 0.35 }); }

  // C8 · end card: the lamp-lit screen, one digger bows beside his planted hoe; AAZHI in woodblock
  add({ id: 'C8', at: t8, cam: [540, 860], zoom: 0.05, note: 'end card: framed lamp-lit screen, single digger puppet bows by planted hoe + grain heap, AAZHI woodblock, follow · next chronicle',
    draw(lt, d, t) {
      screen(t, { lx: 540, ly: 820, r: 1200 });
      glowAt(540, 820, 260 * flick(t), GLOW, 0.55);
      ctx.fillStyle = lg(0, 1600, 0, 1920, [[0, '#24160D'], [1, '#0E0805']]); ctx.fillRect(-300, 1600, W + 600, 700);
      glowAt(540, 1640, 360, GLOW, 0.18 * flick(t));
      const bow = eio(seg(t, tAaz - 0.1, tAaz + 0.55)) * (1 - eio(seg(t, tNext + 0.3, tNext + 0.9)));
      puppet(500, 1250, 640, { t, pose: 'bow', bow, hole: GLOW });
      grainHeap(760, 1252, 70, 34, t);
      ctx.fillStyle = rgba(INK, 0.5); ctx.fillRect(60, 1250, W - 120, 5);
      wood('AAZHI', 540, 470, 200, INK, 1, seg(t, tAaz - 0.08, tAaz + 0.25), 0.1);
      const f = eo(seg(t, tNext - 0.4, tNext + 0.1));
      note('follow  ·  next chronicle', 540, 610, 46, UMB1, f, 'center', 4);
      if (f > 0) { ctx.save(); ctx.globalAlpha = f; ctx.fillStyle = GOLD; for (const x of [300, 780]) { ctx.save(); ctx.translate(x, 610); ctx.rotate(Math.PI / 4); ctx.fillRect(-7, -7, 14, 14); ctx.restore(); } ctx.restore(); }
      motes(t, 36, 17, 0.5);
      woodFrame(t, 1560);
      vig(0.55, 860);
    } });
  cue(t8 + 0.02, 'swell', { gain: 0.25, dur: 1.2 }); cue(tAaz - 0.05, 'drum', { gain: 0.5 }); cue(tAaz + 0.15, 'thud', { gain: 0.35 }); cue(Le(13) - 0.35, 'bell', { gain: 0.5, dur: 2.2 });
}
