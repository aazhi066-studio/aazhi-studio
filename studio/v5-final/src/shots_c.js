// EPISODE 5 · worker C : "Survey Blueprint" lines 10-13
//   C1 word-origin card ANICUT <- ANAIKATTU / அணைக்கட்டு = a dam · C2 x-ray section scan through the 1800s blocks
//   C3 punch-in on the hazy old core, big "?" + NOT CLEAR stamp · C4 pull back to the living weir + delta at sunrise
//   C5 end card: the sheet rolls up, compass-rose water-drop emblem, AAZHI stencil, "next chronicle"
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { lg, poly, fillP, rgba, mixc } from './art.js';

const P0 = '#0F2F57', P1 = '#1B4A80', CHALK = '#EAF2FF', TEAL = '#3FB7B0', OCHRE = '#C9954A', SUN = '#FFD34D', SPECK = 'rgba(15,47,87,0.8)';
const FIELD = mixc(TEAL, SUN, 0.45);

// ───────────── type ─────────────
function font(w, sz, fam, ls = 0) { ctx.font = `${w} ${sz}px ${fam}`; ctx.letterSpacing = `${ls}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
function sten(s, x, y, sz, col = CHALK, a = 1, ls = 6, align = 'center') { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; font(900, sz, 'Inter', ls); ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px'; }
function hand(s, x, y, sz, col = CHALK, a = 1, align = 'center', ls = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; font(700, sz, 'Caladea, serif', ls); ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px'; }

// ───────────── paper ─────────────
const paperGrad = () => lg(0, -300, 0, H + 300, [[0, P1], [0.55, '#163F6F'], [1, P0]]);
function paper(seed = 0) {
  ctx.fillStyle = paperGrad(); ctx.fillRect(-300, -300, W + 600, H + 600);
  // cyanotype unevenness
  for (let i = 0; i < 4; i++) { const x = rnd(i + seed) * W, y = rnd(i * 3 + seed + 1) * H, r = 380 + rnd(i + 7 + seed) * 420, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(120,170,230,0.07)'); g.addColorStop(1, 'rgba(120,170,230,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(175,210,255,0.075)'; ctx.beginPath();
  for (let x = -300; x <= W + 300; x += 40) { ctx.moveTo(x, -300); ctx.lineTo(x, H + 300); }
  for (let y = -300; y <= H + 300; y += 40) { ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); }
  ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(175,210,255,0.12)'; ctx.beginPath();
  for (let x = -300; x <= W + 300; x += 200) { ctx.moveTo(x, -300); ctx.lineTo(x, H + 300); }
  for (let y = -300; y <= H + 300; y += 200) { ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); }
  ctx.stroke();
  for (let i = 0; i < 260; i++) { const x = rnd(i * 1.7 + seed) * (W + 200) - 100, y = rnd(i * 2.3 + seed + 4) * (H + 200) - 100, s = 1 + rnd(i + 3) * 2.4; ctx.fillStyle = i % 3 ? 'rgba(220,235,255,0.06)' : 'rgba(5,15,35,0.18)'; ctx.fillRect(x, y, s, s); }
}
/** keep the caption band calm and dark */
function calm(a = 0.5) {
  ctx.fillStyle = lg(0, 1200, 0, 1800, [[0, 'rgba(6,20,42,0)'], [0.3, `rgba(6,20,42,${a})`], [1, `rgba(6,20,42,${a + 0.08})`]]); ctx.fillRect(-300, 1200, W + 600, H + 300 - 1200);
  const g = ctx.createRadialGradient(540, 900, 600, 540, 900, 1350); g.addColorStop(0, 'rgba(4,14,30,0)'); g.addColorStop(1, 'rgba(4,14,30,0.5)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
}

// ───────────── pen ─────────────
/** a polyline that draws itself: p in 0..1 of its length, with a glowing nib at the tip */
function pen(pts, p, col = CHALK, lw = 4, dash = null, nib = true) {
  if (p <= 0) return; p = Math.min(p, 1);
  let tot = 0; const ls = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
  let rem = tot * p, ex = pts[0][0], ey = pts[0][1];
  ctx.beginPath(); ctx.moveTo(ex, ey);
  for (let i = 1; i < pts.length; i++) { const l = ls[i - 1]; if (rem >= l) { ex = pts[i][0]; ey = pts[i][1]; ctx.lineTo(ex, ey); rem -= l; } else { const f = rem / (l || 1); ex = lerp(pts[i - 1][0], pts[i][0], f); ey = lerp(pts[i - 1][1], pts[i][1], f); ctx.lineTo(ex, ey); break; } }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  if (nib && p < 1) { const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, lw * 5); g.addColorStop(0, 'rgba(255,240,190,0.9)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(ex - lw * 5, ey - lw * 5, lw * 10, lw * 10); }
}
const qpts = (x0, y0, cx, cy, x1, y1, n = 24) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push([v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1]); } return o; };
const arcPts = (cx, cy, r, a0, a1, n = 60) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
function arrowHead(x, y, ang, s, col, lw = 4) { ctx.beginPath(); ctx.moveTo(x + Math.cos(ang + 2.6) * s, y + Math.sin(ang + 2.6) * s); ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(ang - 2.6) * s, y + Math.sin(ang - 2.6) * s); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
/** watercolour wash: soft fill + bleed edge */
function wash(pts, col, a = 0.5) {
  poly(pts); ctx.fillStyle = rgba(col, a * 0.75); ctx.fill();
  ctx.save(); ctx.translate(3, 2); poly(pts); ctx.fillStyle = rgba(col, a * 0.25); ctx.fill(); ctx.restore();
  poly(pts); ctx.strokeStyle = rgba(col, a * 0.6); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
}
/** text revealed left→right by a wiping nib */
function wipe(x0, x1, y0, y1, p, fn, col = '255,240,190') {
  if (p <= 0) return; p = clamp(p);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 30, y0, (x1 - x0 + 60) * p, y1 - y0); ctx.clip(); fn(); ctx.restore();
  if (p < 1) { const ex = x0 - 30 + (x1 - x0 + 60) * p, ey = (y0 + y1) / 2, g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 60); g.addColorStop(0, `rgba(${col},0.55)`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(ex - 60, ey - 60, 120, 120); }
}
/** rubber stamp thumped on with a scale bounce; k = seconds since the hit began */
function stamp(s, x, y, k, rot = -0.08, col = SUN, sz = 64, seed = 1) {
  if (k <= 0) return;
  const p = clamp(k / 0.3), sc = lerp(2.3, 1, eob(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k / 0.1) * 0.94;
  font(900, sz, 'Inter', sz * 0.08); const w = ctx.measureText(s).width + sz * 1.1, h = sz * 1.75;
  ctx.strokeStyle = col; ctx.lineWidth = sz * 0.09; rr(-w / 2, -h / 2, w, h, sz * 0.16); ctx.stroke();
  ctx.lineWidth = sz * 0.035; rr(-w / 2 + sz * 0.18, -h / 2 + sz * 0.18, w - sz * 0.36, h - sz * 0.36, sz * 0.08); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(s, sz * 0.04, sz * 0.05);
  ctx.fillStyle = SPECK; for (let i = 0; i < 90; i++) { const r = 1 + rnd(i + seed) * 3.5; ctx.fillRect((rnd(i * 3 + seed) - 0.5) * w, (rnd(i * 5 + seed + 2) - 0.5) * h, r, r * (0.6 + rnd(i) * 0.8)); }
  ctx.restore(); ctx.letterSpacing = '0px';
  if (k > 0.22 && k < 0.8) { const q = seg(k, 0.22, 0.8); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = rgba(col, 0.45 * (1 - q)); ctx.lineWidth = 4; font(900, sz, 'Inter', sz * 0.08); const w = ctx.measureText(s).width + sz * 1.1; rr(-w / 2 - q * 50, -sz * 0.875 - q * 30, w + q * 100, sz * 1.75 + q * 60, 20); ctx.stroke(); ctx.restore(); ctx.letterSpacing = '0px'; }
}
/** horizontal dimension line with ticks + arrowheads, drawn by p */
function dimH(x0, x1, y, p, col = CHALK, lw = 3) {
  if (p <= 0) return; const m = (x0 + x1) / 2, h = (x1 - x0) / 2 * eo(clamp(p));
  pen([[x0, y - 18], [x0, y + 18]], seg(p, 0, 0.3), col, lw, null, false); pen([[x1, y - 18], [x1, y + 18]], seg(p, 0, 0.3), col, lw, null, false);
  ctx.beginPath(); ctx.moveTo(m - h, y); ctx.lineTo(m + h, y); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
  if (p > 0.6) { arrowHead(x0, y, Math.PI, 16, col, lw); arrowHead(x1, y, 0, 16, col, lw); }
}
/** paper slide: the new sheet slides in from the right over the old one */
function slideIn(lt, dur, prev, cur) {
  const p = eio(clamp(lt / dur));
  if (p >= 1) { cur(); return; }
  ctx.save(); ctx.translate(-240 * p, 0); prev(); ctx.restore();
  const x = (W + 120) * (1 - p);
  ctx.fillStyle = lg(x - 70, 0, x, 0, [[0, 'rgba(0,6,16,0)'], [1, 'rgba(0,6,16,0.5)']]); ctx.fillRect(x - 70, -300, 70, H + 600);
  ctx.save(); ctx.translate(x, 0); ctx.beginPath(); ctx.rect(0, -300, W + 600, H + 600); ctx.clip(); cur(); ctx.restore();
  ctx.fillStyle = 'rgba(220,235,255,0.35)'; ctx.fillRect(x, -300, 2, H + 600);
}

// ───────────── C2/C3 cross-section ─────────────
const STONES = [];
for (let r = 0; r < 5; r++) { let x = 110 + (r % 2) * 46, k = 0; const y = 792 + r * 62; while (x < 970) { const w = 82 + rnd(r * 31 + k) * 70; STONES.push({ cx: x + w / 2, cy: y + (rnd(r * 7 + k + 0.5) - 0.5) * 12, rx: w / 2 - 6, ry: 25 + rnd(k + r * 3) * 7, s: r * 31 + k }); x += w; k++; } }
const CORE = [[230, 760], [850, 760], [930, 1080], [150, 1080]], DRESS = [[330, 470], [760, 470], [850, 760], [230, 760]];
function stonePath(st, j = 0) {
  ctx.beginPath();
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, f = 0.78 + rnd(st.s * 9 + k) * 0.3, x = st.cx + Math.cos(a) * st.rx * f + j, y = st.cy + Math.sin(a) * st.ry * f; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
function section(t, beam, t0, haze = 1) {
  paper(3);
  const draw = clamp((t - t0) / 0.8);
  // water + sand washes
  wash([[-300, 560], [299, 560], [230, 760], [150, 1080], [-300, 1080]], TEAL, 0.5 * eo(draw));
  wash([[885, 900], [1400, 900], [1400, 1080], [930, 1080]], TEAL, 0.4 * eo(draw));
  wash([[-300, 1080], [1400, 1080], [1400, 1262], [-300, 1262]], OCHRE, 0.32 * eo(draw));
  for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(240,210,150,${0.25 * draw})`; ctx.fillRect(rnd(i + 0.3) * 1500 - 210, 1092 + rnd(i * 2 + 0.7) * 160, 3, 3); }
  for (let k = 0; k < 4; k++) { const y = 590 + k * 34, ph = t * 40 + k * 60; ctx.strokeStyle = `rgba(234,242,255,${0.3 * draw})`; ctx.lineWidth = 3; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -ph; ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(150 + (y - 560) * 0.2 - 60, y); ctx.stroke(); }
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  // dressed 1800s layer: faint everywhere, crisp where the scan has passed
  wash(DRESS, OCHRE, 0.32 * eo(draw));
  const blocks = (a, lw) => {
    ctx.save(); poly(DRESS); ctx.clip(); ctx.strokeStyle = rgba(CHALK, a); ctx.lineWidth = lw; ctx.beginPath();
    for (let r = 0; r < 5; r++) { const y = 470 + r * 58; ctx.moveTo(150, y); ctx.lineTo(950, y); for (let x = 150 + (r % 2) * 52; x < 950; x += 104) { ctx.moveTo(x, y); ctx.lineTo(x, y + 58); } }
    ctx.stroke(); ctx.restore();
  };
  blocks(0.22 * draw, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, beam + 300); ctx.clip();
  ctx.save(); poly(DRESS); ctx.clip(); ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.fillRect(0, 400, W, 400); ctx.restore();
  blocks(0.95, 3.5);
  // old core: only hazy, dotted, flickering
  ctx.save(); poly(CORE); ctx.clip();
  ctx.fillStyle = rgba(OCHRE, 0.16); ctx.fillRect(0, 740, W, 360);
  const fl = Math.floor(t * 8);
  STONES.forEach((st, i) => {
    const j = (rnd(i + fl * 13) - 0.5) * 6 * haze, a = (0.35 + 0.2 * Math.sin(t * 3 + i * 1.7)) * (0.7 + 0.3 * haze);
    stonePath(st, j); ctx.fillStyle = rgba(OCHRE, 0.12); ctx.fill();
    ctx.setLineDash([3, 10]); ctx.strokeStyle = rgba(CHALK, a); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  });
  for (let i = 0; i < 120; i++) { const s = rnd(i + fl * 7.1); ctx.fillStyle = `rgba(234,242,255,${0.1 + 0.25 * rnd(i * 3 + fl)})`; ctx.fillRect(150 + s * 780, 760 + rnd(i * 5 + fl * 3) * 320, 2.5, 2.5); }
  ctx.restore();
  ctx.restore();
  // outlines that draw themselves
  pen([...DRESS, DRESS[0]], draw, CHALK, 4.5);
  pen([[230, 760], [150, 1080]], seg(t, t0 + 0.3, t0 + 0.9), CHALK, 3, [4, 10], false);
  pen([[850, 760], [930, 1080]], seg(t, t0 + 0.3, t0 + 0.9), CHALK, 3, [4, 10], false);
  pen([[-300, 1080], [1400, 1080]], seg(t, t0 + 0.2, t0 + 1.0), CHALK, 3, null, false);
  // scan beam
  if (beam > 380 && beam < 1240) {
    ctx.fillStyle = lg(0, beam - 160, 0, beam, [[0, 'rgba(255,211,77,0)'], [1, 'rgba(255,211,77,0.22)']]); ctx.fillRect(-300, beam - 160, W + 600, 160);
    ctx.fillStyle = SUN; ctx.fillRect(-300, beam - 2, W + 600, 4);
    const g = ctx.createLinearGradient(0, beam - 14, 0, beam + 14); g.addColorStop(0, 'rgba(255,211,77,0)'); g.addColorStop(0.5, 'rgba(255,230,150,0.45)'); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(-300, beam - 14, W + 600, 28);
    ctx.save(); font(900, 28, 'Inter', 4); rr(940, beam - 46, 120, 40, 20); ctx.fillStyle = SUN; ctx.fill(); ctx.fillStyle = P0; ctx.fillText('SCAN', 1000, beam - 25); ctx.restore(); ctx.letterSpacing = '0px';
  }
  // labels + brackets
  const pD = seg(beam, 560, 760), pO = seg(beam, 860, 1080);
  pen([[948, 470], [972, 470], [972, 760], [948, 760]], pD, SUN, 4, null, false);
  sten('1800s REPAIRS', 1040, 425, 36, SUN, eo(pD), 4, 'right');
  pen([[948, 765], [972, 765], [972, 1078], [948, 1078]], pO, CHALK, 4, [4, 10], false);
  hand('?', 1012, 920, 70, CHALK, eo(pO));
  hand('original stone?', 540, 1172, 56, CHALK, eo(seg(beam, 1000, 1120)));
}

// ───────────── C4 landscape (survey perspective) ─────────────
const HZ = 380, F = 900;
const pj = (X, z) => [540 + X * F / z, HZ + F / z];
const ZW0 = 1.38, ZW1 = 1.5;
const CH = [ // downstream channels: centre X(z), half width(z), z range
  { c: (z) => 0.1 * Math.sin(z * 0.7), w: (z) => Math.max(0.16, 0.42 - 0.03 * (z - 1.5)), z0: 1.5, z1: 40 },
  { c: (z) => -0.3 - 0.85 * (z - 1.55), w: () => 0.1, z0: 1.55, z1: 7 },
  { c: (z) => 0.3 + 0.6 * (z - 1.55), w: () => 0.1, z0: 1.55, z1: 9 },
  { c: (z) => -0.2 - 0.28 * (z - 2.4), w: () => 0.06, z0: 2.4, z1: 14 },
  { c: (z) => 0.22 + 0.2 * (z - 3.2), w: () => 0.06, z0: 3.2, z1: 18 },
];
const ROWS = [0.46, 0.6, 0.8, 1.05, ZW0, 1.62, 1.95, 2.4, 3.1, 4.1, 5.6, 8, 12, 20, 40];
const FIELDS = [];
ROWS.forEach((z0, r) => { const z1 = ROWS[r + 1]; if (!z1 || z0 === ZW0) return; for (let c = -12; c < 12; c++) { const X0 = c * 0.62 + (r % 2) * 0.2, X1 = X0 + 0.62; if (z1 <= ZW0 && X1 > -0.6 && X0 < 0.6) continue; FIELDS.push({ X0, X1, z0, z1, col: [FIELD, FIELD, OCHRE, TEAL][Math.floor(rnd(r * 40 + c) * 4)], a: 0.22 + rnd(r * 13 + c + 0.5) * 0.3 }); } });
function chanPoly(ch, zEnd) {
  const L_ = [], R_ = []; const ze = Math.min(ch.z1, zEnd); if (ze <= ch.z0) return null;
  for (let z = ch.z0; ; z *= 1.06) { const zz = Math.min(z, ze); L_.push(pj(ch.c(zz) - ch.w(zz), zz)); R_.push(pj(ch.c(zz) + ch.w(zz), zz)); if (zz >= ze) break; }
  return [...L_, ...R_.reverse()];
}
function land(t, lt) {
  paper(7);
  // sky: sunrise glow above the horizon
  ctx.fillStyle = lg(0, -300, 0, HZ, [[0, 'rgba(15,47,87,0.4)'], [1, 'rgba(255,211,77,0.16)']]); ctx.fillRect(-300, -300, W + 600, HZ + 300);
  const sx = 760, sr = 92 + 4 * Math.sin(t * 1.3);
  let g = ctx.createRadialGradient(sx, HZ, 0, sx, HZ, 560); g.addColorStop(0, 'rgba(255,211,77,0.5)'); g.addColorStop(0.35, 'rgba(255,211,77,0.16)'); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 560, HZ - 560, 1120, 1120);
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI, p = seg(lt, 0.6 + i * 0.08, 1.4 + i * 0.08); pen([[sx + Math.cos(a) * (sr + 26), HZ + Math.sin(a) * (sr + 26)], [sx + Math.cos(a) * (sr + 120 + 30 * (i % 2)), HZ + Math.sin(a) * (sr + 120 + 30 * (i % 2))]], p, rgba(SUN, 0.85), 5, null, false); }
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, HZ + 300); ctx.clip(); circle(sx, HZ, sr, SUN); ctx.restore();
  // distant hills line
  ctx.beginPath(); for (let x = -300; x <= W + 300; x += 20) { const y = HZ - 14 - 22 * Math.sin(x * 0.006 + 1) - 10 * Math.sin(x * 0.021); x === -300 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = rgba(CHALK, 0.35); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = rgba(CHALK, 0.9); ctx.fillRect(-300, HZ - 1.5, W + 600, 3);
  // water reaching outward into the delta
  const zR = 1.5 * Math.pow(40 / 1.5, eo(seg(lt, 0.4, 3.4)));
  for (const f of FIELDS) {
    const lit = f.z1 <= ZW0 ? 1 : clamp((Math.log(zR) - Math.log(f.z0)) * 2.5), q = [pj(f.X0, f.z0), pj(f.X1, f.z0), pj(f.X1, f.z1), pj(f.X0, f.z1)];
    if (q[0][1] < HZ) continue;
    if (lit > 0) { poly(q); ctx.fillStyle = rgba(f.col, f.a * lit); ctx.fill(); }
    poly(q); ctx.strokeStyle = rgba(CHALK, 0.14 + 0.18 * lit); ctx.lineWidth = Math.min(3, 1 + 3 / f.z0); ctx.stroke();
  }
  // upstream river (towards the viewer)
  const up = [pj(-0.56, 0.45), pj(-0.56, ZW0), pj(0.56, ZW0), pj(0.56, 0.45)];
  wash(up, TEAL, 0.62);
  for (const s of [-0.56, 0.56]) { const a = pj(s, 0.45), b = pj(s, ZW0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = rgba(CHALK, 0.8); ctx.lineWidth = 4; ctx.stroke(); }
  // downstream channels
  for (const ch of CH) { const pts = chanPoly(ch, zR); if (pts) wash(pts, TEAL, 0.6); }
  for (const ch of CH) { const pts = chanPoly(ch, zR); if (!pts) continue; const n = pts.length / 2; ctx.strokeStyle = rgba(CHALK, 0.55); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.moveTo(pts[n][0], pts[n][1]); for (let i = n; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  // ripples flowing away from the viewer
  ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const X = (rnd(i + 0.2) - 0.5) * 1.0, u = (rnd(i * 3 + 0.1) + t * 0.11) % 1, z = 0.46 + u * (ZW0 - 0.5), a = pj(X, z), b = pj(X + 0.07, z);
    ctx.strokeStyle = `rgba(234,242,255,${0.55 * Math.sin(u * Math.PI)})`; ctx.lineWidth = Math.min(6, 3 / z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 6 / z, b[0], b[1]); ctx.stroke();
  }
  for (let i = 0; i < 90; i++) {
    const ch = CH[i % CH.length], u = (rnd(i * 5 + 0.4) + t * 0.18) % 1, z = ch.z0 * Math.pow(ch.z1 / ch.z0, u);
    if (z > zR) continue;
    const X = ch.c(z) + (rnd(i + 0.9) - 0.5) * ch.w(z) * 1.4, a = pj(X, z), b = pj(X + 0.05, z * 1.03);
    ctx.strokeStyle = `rgba(234,242,255,${0.6 * Math.sin(u * Math.PI)})`; ctx.lineWidth = Math.max(1.2, Math.min(4, 3 / z)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  // the weir: stone band, water sheeting over, foam on the downstream lip
  const wq = [pj(-0.64, ZW0), pj(0.64, ZW0), pj(0.64, ZW1), pj(-0.64, ZW1)];
  wash(wq, OCHRE, 0.85);
  ctx.strokeStyle = rgba(CHALK, 0.9); ctx.lineWidth = 4; poly(wq); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = rgba(CHALK, 0.55); ctx.beginPath();
  for (let X = -0.64; X < 0.64; X += 0.07) { const a = pj(X, ZW0), b = pj(X, ZW1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
  const m0 = pj(-0.64, (ZW0 + ZW1) / 2), m1 = pj(0.64, (ZW0 + ZW1) / 2); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(m1[0], m1[1]); ctx.stroke();
  poly([pj(-0.56, ZW0), pj(0.56, ZW0), pj(0.56, ZW1), pj(-0.56, ZW1)]); ctx.fillStyle = rgba(TEAL, 0.35); ctx.fill();
  for (let i = 0; i < 46; i++) { const X = -0.55 + i / 45 * 1.1, u = (rnd(i + 0.6) + t * 0.9) % 1, z = lerp(ZW0, ZW1, u), p = pj(X, z); ctx.fillStyle = `rgba(240,248,255,${0.7 * Math.sin(u * Math.PI)})`; ctx.fillRect(p[0] - 1.5, p[1] - 4, 3, 8); }
  for (let i = 0; i < 40; i++) { const X = -0.55 + rnd(i + 0.3) * 1.1, z = ZW1 + 0.03 + 0.05 * rnd(i * 2), p = pj(X, z), r = 3 + 3 * (0.5 + 0.5 * Math.sin(t * 6 + i * 1.9)); circle(p[0], p[1], r, 'rgba(240,248,255,0.65)'); }
}
function landLabels(t, lt, tOld, tStill) {
  // hand notes with pen leaders
  const n1 = seg(t, tOld + 0.5, tOld + 1.1), n2 = seg(t, tOld + 0.9, tOld + 1.5);
  pen(qpts(190, 905, 170, 950, 210, 985), n1, CHALK, 3, null, false); hand('weir', 200, 875, 46, CHALK, eo(n1));
  pen(qpts(250, 520, 300, 570, 360, 600), n2, CHALK, 3, null, false); hand('delta fields', 210, 490, 46, CHALK, eo(n2));
  stamp('ONE OF THE OLDEST', 520, 190, t - tOld, -0.06, CHALK, 62, 5);
  const k = t - tStill;
  if (k > 0) {
    pen([[540, 1080], [540, 1020]], seg(k, 0, 0.3), SUN, 4, null, false);
    const sc = lerp(1.6, 1, eob(clamp(k / 0.3)));
    ctx.save(); ctx.translate(540, 1150); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k / 0.12);
    font(900, 76, 'Inter', 8); const w = ctx.measureText('STILL IN USE').width + 80; rr(-w / 2, -58, w, 116, 58); ctx.fillStyle = 'rgba(8,28,54,0.88)'; ctx.fill(); ctx.strokeStyle = SUN; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = SUN; ctx.fillText('STILL IN USE', 4, 4); ctx.restore(); ctx.letterSpacing = '0px';
  }
}

// ───────────── C5 emblem ─────────────
function drop(x, y, r, col, a = 1) {
  ctx.beginPath(); ctx.moveTo(x, y - r * 1.6); ctx.bezierCurveTo(x + r * 0.5, y - r * 0.8, x + r, y - r * 0.3, x + r, y + r * 0.2); ctx.arc(x, y + r * 0.2, r, 0, Math.PI); ctx.bezierCurveTo(x - r, y - r * 0.3, x - r * 0.5, y - r * 0.8, x, y - r * 1.6); ctx.closePath();
  ctx.fillStyle = rgba(col, 0.85 * a); ctx.fill(); ctx.strokeStyle = rgba(CHALK, a); ctx.lineWidth = 4; ctx.stroke();
}
function rose(x, y, R, lt, t) {
  const p = seg(lt, 0.55, 1.4), rot = lerp(-0.7, 0, eo(seg(lt, 0.55, 1.6))) + 0.03 * Math.sin(t * 0.8);
  for (let k = 0; k < 3; k++) { const q = ((t * 0.35 + k / 3) % 1); ctx.strokeStyle = rgba(TEAL, 0.5 * (1 - q) * eo(p)); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, R * (1.05 + q * 0.9), R * (1.05 + q * 0.9), 0, 0, TAU); ctx.stroke(); }
  pen(arcPts(x, y, R, -Math.PI / 2, Math.PI * 1.5, 90), p, CHALK, 5);
  pen(arcPts(x, y, R * 0.78, -Math.PI / 2, Math.PI * 1.5, 90), seg(lt, 0.7, 1.4), CHALK, 3, [3, 9], false);
  const q = eo(seg(lt, 0.9, 1.5)); if (q <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= q;
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 4, big = i % 2 === 0, len = (big ? R * 1.18 : R * 0.7) * q, wd = big ? R * 0.17 : R * 0.11;
    const tip = [Math.cos(a) * len, Math.sin(a) * len], l = [Math.cos(a - Math.PI / 2) * wd, Math.sin(a - Math.PI / 2) * wd], r = [-l[0], -l[1]];
    fillP([tip, l, [0, 0]], i === 0 ? SUN : CHALK); fillP([tip, r, [0, 0]], i === 0 ? mixc(SUN, '#B8860B', 0.4) : rgba(CHALK, 0.55));
  }
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.strokeStyle = rgba(CHALK, 0.7); ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= q; circle(x, y, R * 0.34, P0); ctx.restore();
  drop(x, y + 6, R * 0.2 * eob(seg(lt, 1.1, 1.5)), TEAL, q);
  hand('N', x, y - R * 1.4, 40, SUN, q);
}

export function buildC(add, cue) {
  const T1 = L(10), T2 = L(11) - 0.15, T3 = Wd('that', 11) - 0.1, T4 = L(12) - 0.1, T5 = L(13) - 0.1;
  const tFrom = Wd('from', 10), tTamil = Wd('tamil', 10), tAnai = Wd('anaikattu', 10), tDam = Wd('a', 10) - 0.05;
  const tRep = Wd('repairs', 11), tNot = Wd('not', 11) - 0.05, tOld = Wd('oldest', 12) - 0.15, tStill = Wd('still', 12) - 0.1;
  const tAazhi = Wd('aazhi', 13), tNext = Wd('next', 13);

  // ═════════ C1 · line 10 · word origin card ═════════
  const d1 = (t) => {
    paper(11);
    const lt = t - T1;
    hand('the British name', 540, 270, 46, rgba(CHALK, 0.85), eo(seg(lt, 0.25, 0.7)), 'center', 3);
    pen([[380, 306], [700, 306]], seg(lt, 0.3, 0.8), CHALK, 3, null, false);
    // ANICUT, thumped on
    font(900, 190, 'Inter', 12); const wF = ctx.measureText('ANICUT').width, wA = ctx.measureText('ANI').width; ctx.letterSpacing = '0px';
    const xs = 540 - wF / 2 + 6, aniC = xs + wA / 2 - 6, cutC = xs + wA + (wF - wA) / 2 - 12;
    const sA = seg(lt, 0.02, 0.32);
    if (sA > 0) { ctx.save(); ctx.translate(540, 430); const sc = lerp(2.0, 1, eob(sA)); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sA * 4); font(900, 190, 'Inter', 12); ctx.textAlign = 'left'; ctx.fillStyle = CHALK; ctx.fillText('ANICUT', xs - 540, 0); ctx.restore(); ctx.letterSpacing = '0px'; }
    // ANAIKATTU
    font(900, 136, 'Inter', 8); const wF2 = ctx.measureText('ANAIKATTU').width, wN = ctx.measureText('ANAI').width; ctx.letterSpacing = '0px';
    const xs2 = 540 - wF2 / 2 + 4, anaiC = xs2 + wN / 2 - 4, katC = xs2 + wN + (wF2 - wN) / 2 - 8;
    // brackets + connectors (the English word points back to its Tamil source)
    const pb = seg(t, tFrom - 0.1, tFrom + 0.25), pc = seg(t, tFrom + 0.1, tTamil + 0.45);
    pen([[xs, 512], [xs, 532], [xs + wA - 22, 532], [xs + wA - 22, 512]], pb, SUN, 4, null, false);
    pen([[xs + wA + 4, 512], [xs + wA + 4, 532], [xs + wF - 18, 532], [xs + wF - 18, 512]], pb, SUN, 4, null, false);
    const c1 = qpts(aniC, 550, aniC - 40, 625, anaiC, 690), c2 = qpts(cutC, 550, cutC + 40, 625, katC, 690);
    pen(c1, pc, CHALK, 5, [2, 13]); pen(c2, pc, CHALK, 5, [2, 13]);
    if (pc >= 1) { arrowHead(anaiC, 694, Math.PI / 2 + 0.2, 20, CHALK, 5); arrowHead(katC, 694, Math.PI / 2 - 0.3, 20, CHALK, 5); }
    hand('from Tamil', (aniC + cutC) / 2 + 10, 622, 46, SUN, eo(seg(t, tTamil - 0.1, tTamil + 0.3)));
    wipe(xs2, xs2 + wF2, 700, 880, seg(t, tAnai - 0.15, tAnai + 0.55), () => { font(900, 136, 'Inter', 8); ctx.textAlign = 'left'; ctx.fillStyle = CHALK; ctx.fillText('ANAIKATTU', xs2, 790); ctx.letterSpacing = '0px'; });
    // the Tamil word, written in yellow
    font(700, 150, 'NotoTamil'); const tw = ctx.measureText('அணைக்கட்டு').width, ts = Math.min(1, 900 / tw);
    const p1 = seg(t, tAnai + 0.05, tAnai + 0.7), p2 = seg(t, tAnai + 0.25, tAnai + 0.9);
    const tam = (fill) => { ctx.save(); ctx.translate(540, 990); ctx.scale(ts, ts); font(700, 150, 'NotoTamil'); if (fill) { ctx.fillStyle = SUN; ctx.fillText('அணைக்கட்டு', 0, 0); } else { ctx.strokeStyle = SUN; ctx.lineWidth = 3; ctx.strokeText('அணைக்கட்டு', 0, 0); } ctx.restore(); };
    wipe(540 - tw * ts / 2, 540 + tw * ts / 2, 870, 1110, p1, () => tam(false));
    wipe(540 - tw * ts / 2, 540 + tw * ts / 2, 870, 1110, p2, () => { const g = ctx.createRadialGradient(540, 990, 0, 540, 990, 460); g.addColorStop(0, 'rgba(255,211,77,0.12)'); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(80, 860, 920, 260); tam(true); });
    const wav = []; for (let x = 540 - tw * ts / 2; x <= 540 + tw * ts / 2; x += 12) wav.push([x, 1086 + 5 * Math.sin(x * 0.05)]);
    pen(wav, seg(t, tAnai + 0.6, tAnai + 1.0), SUN, 4, null, false);
    // gloss "= a dam" + a tiny dam cross-section
    const pg = seg(t, tDam, tDam + 0.35);
    if (pg > 0) { ctx.save(); ctx.globalAlpha = eo(pg); ctx.translate(-30 * (1 - eo(pg)), 0); hand('= a dam', 330, 1190, 92, CHALK); ctx.restore(); }
    const ps = seg(t, tDam + 0.1, tDam + 0.9);
    if (ps > 0) {
      wash([[600, 1162], [742, 1162], [690, 1240], [600, 1240]], TEAL, 0.55 * eo(ps));
      wash([[690, 1240], [770, 1140], [830, 1140], [930, 1240]], OCHRE, 0.75 * eo(seg(ps, 0.3, 1)));
      pen([[690, 1240], [770, 1140], [830, 1140], [930, 1240]], ps, CHALK, 4);
      pen([[590, 1240], [970, 1240]], ps, CHALK, 3, null, false);
      for (let k = 0; k < 2; k++) pen([[615 + k * 40, 1182 + k * 22], [655 + k * 40, 1182 + k * 22]], seg(ps, 0.5, 0.9), rgba(CHALK, 0.7), 3, null, false);
    }
    calm(0.45);
  };
  add({ id: 'c1', at: T1, cam: [540, 760], zoom: 0.05, note: 'word-origin card: ANICUT thumped on, pen brackets ANI/CUT with dotted arrows back to ANAIKATTU, Tamil அணைக்கட்டு written in yellow, "= a dam" + tiny dam section', draw: (lt, d, t) => d1(t) });
  cue(T1 + 0.08, 'thud', { gain: 0.6 }); cue(tFrom + 0.1, 'zip', { gain: 0.4 }); cue(tAnai + 0.05, 'sparkle', { gain: 0.45 }); cue(tDam, 'pop', { gain: 0.4 });

  // ═════════ C2 · line 11a · x-ray section scan ═════════
  const beamAt = (t) => lerp(380, 1150, eio(seg(t, T2 + 0.55, tRep + 0.35)));
  const d2 = (t) => {
    section(t, beamAt(t), T2 + 0.1, 1);
    const lt = t - T2;
    sten('SECTION A–A', 540, 180, 66, CHALK, eo(seg(lt, 0.4, 0.8)), 10);
    pen([[300, 228], [780, 228]], seg(lt, 0.5, 1.0), SUN, 4, null, false);
    hand('x-ray of the weir', 540, 285, 44, rgba(CHALK, 0.85), eo(seg(lt, 0.7, 1.1)));
    calm(0.45);
  };
  add({ id: 'c2', at: T2, cam: [540, 760], zoom: 0.05, note: 'paper slides in: cross-section A-A, yellow scan beam sweeps down; 1800s dressed blocks turn crisp, the old rough core below stays hazy and dotted', draw: (lt, d, t) => slideIn(lt, 0.5, () => d1(T2 - 0.01), () => d2(t)) });
  cue(T2 + 0.02, 'slide', { gain: 0.5 }); cue(T2 + 0.55, 'swell', { gain: 0.35, dur: tRep - T2 }); cue(tRep, 'zip', { gain: 0.3 });

  // ═════════ C3 · line 11b · punch-in: "?" + NOT CLEAR ═════════
  const d3 = (t) => {
    const lt = t - T3;
    ctx.save(); ctx.translate(540, 820); ctx.scale(1.5, 1.5); ctx.translate(-540, -900); section(t, 1300, T2 - 5, 1.6); ctx.restore();
    ctx.fillStyle = 'rgba(6,20,42,0.3)'; ctx.fillRect(-300, -300, W + 600, H + 600);
    const pq = seg(lt, 0.05, 0.4);
    if (pq > 0) {
      const g = ctx.createRadialGradient(540, 700, 0, 540, 700, 420); g.addColorStop(0, `rgba(255,211,77,${0.22 * pq})`); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(120, 280, 840, 840);
      ctx.save(); ctx.translate(540, 720); const sc = lerp(1.8, 1, eob(pq)) * (1 + 0.015 * Math.sin(t * 3)); ctx.scale(sc, sc); ctx.rotate(0.05 * Math.sin(t * 1.4)); ctx.globalAlpha = clamp(pq * 3);
      font(900, 560, 'Inter'); ctx.lineWidth = 18; ctx.strokeStyle = P0; ctx.lineJoin = 'round'; ctx.strokeText('?', 0, 0); ctx.fillStyle = SUN; ctx.fillText('?', 0, 0); ctx.restore();
    }
    stamp('NOT CLEAR', 540, 1150, t - tNot, -0.09, SUN, 92, 9);
    calm(0.45);
  };
  add({ id: 'c3', at: T3, cam: [540, 820], zoom: 0.07, note: 'punch-in on the hazy flickering old core, giant yellow "?" bounces in, NOT CLEAR rubber stamp thumped on', draw: (lt, d, t) => d3(t) });
  cue(T3 + 0.05, 'pop', { gain: 0.5 }); cue(tNot + 0.22, 'slam', { gain: 0.7 });

  // ═════════ C4 · line 12 · pull back to the living weir + delta at sunrise ═════════
  const d4 = (t) => {
    const lt = t - T4, z = lerp(2.4, 1, eio(seg(lt, 0.2, 2.2)));
    ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000); land(t, lt); ctx.restore();
    calm(0.5);
    landLabels(t, lt, tOld, tStill);
  };
  add({ id: 'c4', at: T4, cam: [540, 900], zoom: 0.04, note: 'page slides in, camera pulls back from the weir crest to a perspective survey: teal water ripples over the stone weir, channels fill out into the delta fields, sun-yellow sunrise; ONE OF THE OLDEST stamp, STILL IN USE tag', draw: (lt, d, t) => slideIn(lt, 0.45, () => d3(T4 - 0.01), () => d4(t)) });
  cue(T4 + 0.02, 'whoosh', { gain: 0.5 }); cue(T4 + 0.6, 'bubbles', { gain: 0.35, dur: 2.5 }); cue(tOld + 0.22, 'thud', { gain: 0.6 }); cue(tStill + 0.05, 'tock', { gain: 0.5 });

  // ═════════ C5 · line 13 · end card: the sheet rolls up ═════════
  add({ id: 'c5', at: T5, cam: [540, 760], zoom: 0.05, note: 'end card: the landscape sheet rolls up from the bottom, revealing a compass-rose emblem with a teal water drop, AAZHI stencil thumped on, dimension line + "next chronicle"', draw(lt, d, t) {
    paper(19);
    const rp = eio(seg(lt, 0, 0.95)), rollY = lerp(H + 160, -300, rp);
    // emblem + title
    rose(540, 470, 170, lt, t);
    hand('follow', 540, 735, 54, rgba(CHALK, 0.9), eo(seg(t, tAazhi - 0.5, tAazhi - 0.1)), 'center', 4);
    const ka = t - tAazhi - 0.05;
    if (ka > 0) {
      const sc = lerp(1.9, 1, eob(clamp(ka / 0.3)));
      ctx.save(); ctx.translate(540, 890); ctx.scale(sc, sc); ctx.globalAlpha = clamp(ka / 0.1);
      font(900, 236, 'Inter', 22); const w = ctx.measureText('AAZHI').width; ctx.fillStyle = CHALK; ctx.fillText('AAZHI', 11, 0);
      ctx.fillStyle = paperGrad(); ctx.fillRect(-w / 2 - 20, -8, w + 40, 12); // stencil bridges
      ctx.restore(); ctx.letterSpacing = '0px';
    }
    dimH(170, 910, 1030, seg(t, tAazhi + 0.3, tAazhi + 0.9), CHALK, 3);
    wipe(260, 820, 1050, 1130, seg(t, tNext - 0.1, tNext + 0.6), () => hand('next chronicle', 540, 1092, 70, SUN, 1, 'center', 2));
    calm(0.45);
    // the old sheet rolling up
    if (rollY > -280) {
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, rollY + 300); ctx.clip(); const tl = T5 - 0.01; d4(tl); ctx.restore();
      const R = 46 + 30 * rp;
      ctx.fillStyle = 'rgba(0,6,16,0.45)'; ctx.fillRect(-300, rollY + R * 0.6, W + 600, 50);
      ctx.fillStyle = lg(0, rollY - R, 0, rollY + R, [[0, '#2A5E99'], [0.4, '#4C7FBA'], [0.7, '#1B4A80'], [1, '#0B2546']]); ctx.fillRect(-300, rollY - R, W + 600, R * 2);
      ctx.strokeStyle = 'rgba(220,235,255,0.25)'; ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-300, rollY - R + k * R * 0.5); ctx.lineTo(W + 300, rollY - R + k * R * 0.5); ctx.stroke(); }
    }
  } });
  cue(T5 + 0.02, 'slide', { gain: 0.55 }); cue(tAazhi + 0.12, 'slam', { gain: 0.7 }); cue(tNext, 'bell', { gain: 0.45 });
}
