// v23 shared kit: "Ebony Chessboard & Marbled Ink". Read fully before writing shots.
// Everything is drawn on a dark carved board game under one hard spotlight; the chroniclers' ink spills as marbled swirls.
import { ctx, W, H, clamp, lerp, eo, eio, rnd, TAU, ell, circle, rr, line } from './core/lib.js';
import { cached, blit, rgba, mixc, lg } from './art.js';

export const PAL = {
  void: '#07060A', felt: '#101318', ebony: '#17120F', ebonyHi: '#3A2C22', rose: '#4A2218', roseHi: '#6B3426',
  ivory: '#EFE5CF', ivoryMid: '#D6C6A4', ivoryDk: '#9E8B69', sandal: '#C9AE84', gold: '#D2A043', goldDk: '#8A6420',
  blood: '#B0141E', bloodDk: '#5E0A10', indigo: '#24346A', indigoHi: '#4A62A8', steel: '#7C8692', steelDk: '#3C434C', steelHi: '#B7C0CA',
  paper: '#E9DDC0', ink: '#1A120C',
};
// SIDES: Sundara = ivory pieces with blood-red sash; Vira = ebony pieces with indigo sash; old king Kulasekhara = gold;
// Delhi army (Malik Kafur) = steel-grey pieces. Pandya emblem = two small fish (PANDYA.fish) - an emblem, not an inscription.

// ---------- background: dark wood table with grain (cached) ----------
export function table(t = 0, tint = 0) {
  const c = cached('ch_table', W, H, 1, () => {
    const g = ctx; g.fillStyle = '#0D0A08'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) {
      const y = rnd(i) * H, a = 0.03 + rnd(i + 9) * 0.05;
      g.strokeStyle = `rgba(${90 + rnd(i + 3) * 40},${55 + rnd(i + 4) * 25},30,${a})`; g.lineWidth = 1 + rnd(i + 5) * 3;
      g.beginPath(); for (let x = -20; x <= W + 20; x += 30) g.lineTo(x, y + Math.sin(x * 0.004 + i) * 18 + Math.sin(x * 0.017 + i * 2) * 4); g.stroke();
    }
  });
  ctx.drawImage(c, 0, 0);
  if (tint) { ctx.fillStyle = rgba(PAL.bloodDk, tint); ctx.fillRect(0, 0, W, H); }
}

// ---------- spotlight: darkness everywhere except a soft disc (call AFTER drawing the scene, BEFORE tags) ----------
export function spot(x, y, r, dark = 0.88, t = 0) {
  const fl = 1 + 0.015 * Math.sin(t * 9) + 0.01 * Math.sin(t * 23);
  const g = ctx.createRadialGradient(x, y, r * 0.25 * fl, x, y, r * fl);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(4,3,6,${dark})`);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
}

// ---------- perspective board ----------
// board(o) draws an 8x8 board and returns proj(u, v) -> [x, y, s]  (u, v in squares, 0..8; s = local scale for pieces).
// o: { cx=540, cy=980, size=880 (front edge width), tilt=0.55 (0 top-down .. 0.8 low angle), rot=0 (radians, spins the board),
//      split=0 (0..1 the board splits along the middle file into two halves sliding apart), crack=0 (0..1 crack draws across),
//      light='#CDB48A', dark=PAL.rose, glow=null [u,v] highlights a square in blood red, a=1 }
export function board(o = {}) {
  const cx = o.cx ?? 540, cy = o.cy ?? 980, size = o.size ?? 880, tilt = o.tilt ?? 0.55, rot = o.rot ?? 0, split = o.split ?? 0;
  const depth = 1 - tilt * 0.55;
  const proj = (u, v) => {
    let x = (u - 4) / 8, y = (v - 4) / 8;
    if (split) x += (u < 4 || (u === 4 && x < 0) ? -1 : 1) * split * 0.09;
    const cr = Math.cos(rot), sr = Math.sin(rot); const xr = x * cr - y * sr, yr = x * sr + y * cr;
    const z = 1 + yr * tilt * 0.9;                    // nearer rows (bigger v) are bigger
    const k = size / (1 + tilt * 0.45) * z;
    return [cx + xr * k, cy + yr * size * depth * z, z * size / 880];
  };
  ctx.save(); ctx.globalAlpha = o.a ?? 1;
  // frame (outer rim)
  const rim = (m) => [proj(-m, -m), proj(8 + m, -m), proj(8 + m, 8 + m), proj(-m, 8 + m)];
  const drawQ = (q, fill) => { ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  if (!split) {
    const r = rim(0.55); drawQ(r.map((p) => [p[0], p[1] + 26 * p[2]]), '#050404');
    drawQ(r, lg(0, r[0][1], 0, r[2][1], [[0, PAL.ebonyHi], [1, PAL.ebony]]));
    ctx.strokeStyle = rgba(PAL.gold, 0.55); ctx.lineWidth = 3; ctx.beginPath(); rim(0.2).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke();
  }
  const light = o.light ?? '#CDB48A', dark = o.dark ?? PAL.rose;
  for (let u = 0; u < 8; u++) for (let v = 0; v < 8; v++) {
    const q = [proj(u, v), proj(u + 1, v), proj(u + 1, v + 1), proj(u, v + 1)];
    let f = (u + v) % 2 ? dark : light;
    if (o.glow && o.glow[0] === u && o.glow[1] === v) f = PAL.blood;
    drawQ(q, f);
  }
  // varnish sheen
  const a = proj(0, 0), b = proj(8, 8);
  ctx.globalAlpha = (o.a ?? 1) * 0.18; ctx.fillStyle = lg(a[0], a[1], b[0], b[1], [[0, '#fff'], [0.45, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.6)']]);
  drawQ([proj(0, 0), proj(8, 0), proj(8, 8), proj(0, 8)], ctx.fillStyle);
  ctx.restore();
  if (o.crack) crackLine(proj(4, -0.4), proj(4, 8.4), o.crack, 7, o.crackW ?? 7);
  return proj;
}

// jagged crack from p0 to p1 (screen [x,y]); p = progress 0..1
export function crackLine(p0, p1, p, seed = 1, w = 6, col = '#050304') {
  const n = 22, pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n; pts.push([lerp(p0[0], p1[0], k) + (i && i < n ? (rnd(seed * 31 + i) - 0.5) * 34 : 0), lerp(p0[1], p1[1], k)]); }
  const m = Math.max(1, Math.round(n * clamp(p)));
  line(pts.slice(0, m + 1), col, w); line(pts.slice(0, m + 1), rgba(PAL.blood, 0.55), w * 0.3);
}

// ---------- pieces (faceless, turned-wood shapes). x,y = base centre on screen; s = scale (1 => ~260 px tall king) ----------
// kind: 'king' | 'prince' | 'pawn' | 'elephant' | 'horse' | 'tower'
// o: { col='ivory'|'ebony'|'gold'|'steel', sash=null colour, tip=0 radians (topple, pivots at base edge), glow=0, a=1, crown=true, shadow=true }
const TONES = {
  ivory: [PAL.ivory, PAL.ivoryMid, PAL.ivoryDk], ebony: ['#4A3A30', '#2A1F19', '#0F0B09'], gold: ['#F2CC6B', PAL.gold, PAL.goldDk],
  steel: [PAL.steelHi, PAL.steel, PAL.steelDk],
};
function turned(profile, tone, s) {
  // profile: list of [halfWidth, y] from base (y=0) upward (negative). Drawn as a lathe-turned silhouette with side shading.
  const [hi, mid, dk] = tone;
  ctx.beginPath(); profile.forEach(([w, y], i) => (i ? ctx.lineTo(w * s, y * s) : ctx.moveTo(w * s, y * s)));
  for (let i = profile.length - 1; i >= 0; i--) ctx.lineTo(-profile[i][0] * s, profile[i][1] * s);
  ctx.closePath();
  const wmax = Math.max(...profile.map((p) => p[0])) * s;
  ctx.fillStyle = lg(-wmax, 0, wmax, 0, [[0, dk], [0.28, hi], [0.55, mid], [1, dk]]); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.stroke();
}
const PROF = {
  base: [[62, 0], [64, -14], [50, -24], [52, -34], [36, -44]],
  king: [[62, 0], [64, -14], [50, -24], [52, -34], [36, -44], [26, -120], [30, -150], [44, -160], [30, -172], [22, -196], [38, -214], [30, -228], [0, -236]],
  prince: [[54, 0], [56, -12], [44, -22], [44, -30], [30, -40], [22, -100], [26, -124], [36, -132], [24, -142], [18, -160], [30, -174], [0, -184]],
  pawn: [[46, 0], [48, -10], [36, -18], [36, -26], [20, -34], [14, -70], [26, -78], [12, -86], [24, -104], [20, -118], [0, -124]],
  tower: [[56, 0], [58, -12], [44, -22], [40, -34], [32, -44], [30, -120], [42, -130], [42, -160], [0, -160]],
};
export function piece(kind, x, y, s = 1, o = {}) {
  const tone = TONES[o.col || 'ivory'];
  ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.translate(x, y);
  if (o.shadow !== false) ell(0, 4 * s, 70 * s, 18 * s, 'rgba(0,0,0,0.5)');
  if (o.tip) { const dir = Math.sign(o.tip); ctx.translate(dir * 58 * s, 0); ctx.rotate(o.tip); ctx.translate(-dir * 58 * s, 0); }
  if (o.glow) { const g = ctx.createRadialGradient(0, -110 * s, 10, 0, -110 * s, 190 * s); g.addColorStop(0, rgba(o.glowCol || PAL.gold, 0.45 * o.glow)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-200 * s, -330 * s, 400 * s, 400 * s); }
  if (kind === 'elephant') elephantPiece(tone, s);
  else if (kind === 'horse') horsePiece(tone, s);
  else {
    turned(PROF[kind] || PROF.pawn, tone, s);
    if (kind === 'king' && o.crown !== false) crownTop(0, -232 * s, s * 1.0, o.crownCol || PAL.gold);
    if (kind === 'prince' && o.crown) crownTop(0, -182 * s, s * 0.8, o.crownCol || PAL.gold);
    if (kind === 'tower') for (let i = -1; i <= 1; i++) { rr((i * 26 - 9) * s, -176 * s, 18 * s, 18 * s, 2); ctx.fillStyle = tone[1]; ctx.fill(); }
  }
  if (o.sash) { ctx.fillStyle = o.sash; const yy = kind === 'king' ? -96 : kind === 'prince' ? -78 : -54; ctx.beginPath(); ctx.moveTo(-30 * s, (yy - 8) * s); ctx.lineTo(30 * s, (yy + 8) * s); ctx.lineTo(30 * s, (yy + 22) * s); ctx.lineTo(-30 * s, (yy + 6) * s); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
export function crownTop(x, y, s = 1, col = PAL.gold) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-34 * s, 0); ctx.lineTo(-38 * s, -40 * s); ctx.lineTo(-18 * s, -20 * s); ctx.lineTo(0, -52 * s); ctx.lineTo(18 * s, -20 * s); ctx.lineTo(38 * s, -40 * s); ctx.lineTo(34 * s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  circle(0, -56 * s, 7 * s, PAL.blood); ctx.restore();
}
function elephantPiece(tone, s) {
  turned(PROF.base, tone, s);
  const [hi, mid, dk] = tone; ctx.fillStyle = lg(-70 * s, 0, 70 * s, 0, [[0, dk], [0.35, hi], [1, dk]]);
  ctx.beginPath(); ctx.ellipse(0, -96 * s, 66 * s, 50 * s, 0, 0, TAU); ctx.fill();               // body
  ctx.beginPath(); ctx.ellipse(48 * s, -118 * s, 34 * s, 34 * s, 0, 0, TAU); ctx.fill();          // head
  ctx.beginPath(); ctx.moveTo(70 * s, -112 * s); ctx.quadraticCurveTo(98 * s, -70 * s, 80 * s, -44 * s); ctx.lineTo(70 * s, -48 * s); ctx.quadraticCurveTo(82 * s, -76 * s, 58 * s, -100 * s); ctx.fill(); // trunk
  ctx.fillStyle = dk; ctx.beginPath(); ctx.ellipse(30 * s, -120 * s, 16 * s, 26 * s, -0.3, 0, TAU); ctx.fill();   // ear
  ctx.fillStyle = PAL.ivory; ctx.beginPath(); ctx.moveTo(66 * s, -100 * s); ctx.quadraticCurveTo(92 * s, -96 * s, 96 * s, -110 * s); ctx.lineTo(70 * s, -94 * s); ctx.fill(); // tusk
  rr(-40 * s, -160 * s, 70 * s, 26 * s, 6 * s); ctx.fillStyle = PAL.blood; ctx.fill();            // howdah cloth
}
function horsePiece(tone, s) {
  turned(PROF.base, tone, s); const [hi, mid, dk] = tone;
  ctx.fillStyle = lg(-50 * s, 0, 60 * s, 0, [[0, dk], [0.4, hi], [1, dk]]);
  ctx.beginPath(); ctx.moveTo(-34 * s, -44 * s); ctx.lineTo(-30 * s, -150 * s); ctx.quadraticCurveTo(-10 * s, -210 * s, 30 * s, -200 * s); ctx.lineTo(62 * s, -150 * s); ctx.lineTo(48 * s, -136 * s); ctx.lineTo(14 * s, -150 * s); ctx.lineTo(34 * s, -44 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dk; for (let i = 0; i < 5; i++) ell(-30 * s, (-120 - i * 16) * s, 8 * s, 10 * s, dk);
}

// Pandya emblem: two small fish facing each other (abstract, no text)
export function fish2(x, y, s = 1, col = PAL.gold) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col;
  for (const d of [-1, 1]) { ctx.save(); ctx.scale(d, 1); ctx.beginPath(); ctx.ellipse(-34 * s, 0, 28 * s, 11 * s, 0.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-54 * s, -14 * s); ctx.lineTo(-74 * s, -30 * s); ctx.lineTo(-70 * s, -6 * s); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
}

// ---------- marbled ink (ebru) ----------
// marble(t, p, o): swirling combed ink bands. p 0..1 = how much of the screen is covered (grows as a wobbly disc from o.x,o.y).
// o: { x=540, y=900, cols=[PAL.blood, PAL.ink, PAL.indigo, PAL.paper], seed=1, a=1, full=false (fill whole screen, ignore p) }
// Use as a transition (p 0->1 over ~0.35 s at the end of a shot, then the next shot starts with p 1->0) or as a backdrop (full).
export function marble(t, p, o = {}) {
  if (p <= 0 && !o.full) return;
  const cols = o.cols || [PAL.blood, PAL.ink, PAL.indigo, PAL.paper], seed = o.seed ?? 1, x0 = o.x ?? 540, y0 = o.y ?? 900;
  ctx.save(); ctx.globalAlpha = o.a ?? 1;
  if (!o.full) {
    const R = 2300 * eio(clamp(p)); ctx.beginPath();
    for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, r = R * (1 + 0.12 * Math.sin(a * 5 + seed + t * 2)); i ? ctx.lineTo(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r) : ctx.moveTo(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r); }
    ctx.closePath(); ctx.clip();
  }
  ctx.fillStyle = cols[0]; ctx.fillRect(0, 0, W, H);
  const n = 26, bh = H / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = cols[(i + seed) % cols.length]; ctx.beginPath();
    const yb = i * bh, sw = 1 + (i % 3);
    for (let x = -40; x <= W + 40; x += 36) { const yy = yb + Math.sin(x * 0.006 * sw + t * 1.3 + i) * 60 + Math.sin(x * 0.02 + seed + t * 0.7) * 18; x < 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    for (let x = W + 40; x >= -40; x -= 36) { const yy = yb + bh * 0.55 + Math.sin(x * 0.006 * sw + t * 1.3 + i + 0.8) * 60 + Math.sin(x * 0.02 + seed + t * 0.7 + 1) * 18; ctx.lineTo(x, yy); }
    ctx.closePath(); ctx.fill();
  }
  // comb lines (thin pale strokes dragged through the ink)
  ctx.strokeStyle = rgba(PAL.paper, 0.35); ctx.lineWidth = 3;
  for (let k = 0; k < 9; k++) { const xx = 60 + k * 120; ctx.beginPath(); for (let y = -20; y <= H + 20; y += 40) ctx.lineTo(xx + Math.sin(y * 0.008 + k + t) * 30, y); ctx.stroke(); }
  ctx.restore();
}
// a single ink drop blooming into concentric marbled rings at x,y (radius r, progress p)
export function inkDrop(x, y, r, p, col = PAL.blood, t = 0) {
  const n = 5; ctx.save();
  for (let i = n; i >= 1; i--) { const rr2 = r * eo(clamp(p * 1.4 - (n - i) * 0.08)) * i / n; if (rr2 <= 0) continue;
    ctx.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU, q = rr2 * (1 + 0.06 * Math.sin(a * 6 + t * 2 + i)); k ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath(); ctx.fillStyle = i % 2 ? col : PAL.paper; ctx.globalAlpha = 0.95; ctx.fill(); }
  ctx.restore();
}

// ---------- chronicle page: a parchment sheet with ABSTRACT ink rows only (never real script/quotes) ----------
// p = how many rows are written (0..1); o: { w=640, h=820, rot=0, rows=14, red=[indexes of rows inked red] }
export function chronicle(x, y, p, o = {}) {
  const w = o.w ?? 640, h = o.h ?? 820, rows = o.rows ?? 14;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 20, w, h);
  ctx.fillStyle = lg(0, -h / 2, 0, h / 2, [[0, '#EFE3C6'], [1, '#D8C59D']]); ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = rgba(PAL.gold, 0.8); ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 28, -h / 2 + 28, w - 56, h - 56);
  const shown = rows * clamp(p);
  for (let i = 0; i < rows; i++) {
    const k = clamp(shown - i); if (k <= 0) break;
    const yy = -h / 2 + 80 + i * (h - 160) / rows, len = (w - 140) * (0.75 + 0.25 * rnd(i + 3)) * k;
    ctx.strokeStyle = (o.red || []).includes(i) ? PAL.blood : PAL.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
    for (let xx = 0; xx <= len; xx += 14) ctx.lineTo(w / 2 - 70 - xx, yy + Math.sin(xx * 0.21 + i) * 5 + (rnd(i * 50 + Math.floor(xx / 14)) - 0.5) * 6); // right-to-left
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- carved ivory tag (labels: RECORD, CHRONICLE, LATER ACCOUNTS, CONTESTED, ILLUSTRATION, UNCERTAIN, etc.) ----------
// o: { ink=PAL.blood (text colour), size=54, a=1, sc=1 (scale, use eob for pop), rot=0 }
export function tag(text, x, y, o = {}) {
  const size = o.size ?? 54; ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.sc ?? 1, o.sc ?? 1);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`;
  const tw = ctx.measureText(text).width, w = tw + size * 1.2, h = size * 1.55;
  rr(-w / 2 + 6, -h / 2 + 10, w, h, 14); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill();
  rr(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = lg(0, -h / 2, 0, h / 2, [[0, '#F6EEDA'], [1, '#CDBB95']]); ctx.fill();
  ctx.strokeStyle = PAL.goldDk; ctx.lineWidth = 4; ctx.stroke();
  rr(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 9); ctx.strokeStyle = rgba(PAL.goldDk, 0.5); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = o.ink || PAL.blood; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.04);
  ctx.restore(); ctx.letterSpacing = '0px';
}
// big carved title (e.g. "1310", "MADURAI"): ivory letters with dark bevel; p = reveal 0..1 (letters rise in one by one)
export function title(text, x, y, size, p = 1, o = {}) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.04)}px`; ctx.textBaseline = 'alphabetic';
  const chars = [...text], ws = chars.map((c) => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0);
  let xx = x - tot / 2;
  chars.forEach((c, i) => {
    const k = eo(clamp(p * (chars.length + 2) - i)); if (k <= 0) { xx += ws[i]; return; }
    ctx.globalAlpha = k * (o.a ?? 1); const yy = y + (1 - k) * size * 0.4;
    ctx.fillStyle = '#000'; ctx.fillText(c, xx + 6, yy + 8);
    ctx.fillStyle = o.col || PAL.ivory; ctx.fillText(c, xx, yy);
    ctx.fillStyle = rgba(o.edge || PAL.blood, 0.9); ctx.fillRect(xx, yy + 10, ws[i] * 0.9 * k, size * 0.05);
    xx += ws[i];
  });
  ctx.restore(); ctx.letterSpacing = '0px';
}

export function redFlash(a) { if (a <= 0) return; ctx.fillStyle = `rgba(176,20,30,${clamp(a) * 0.65})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
export function vig(a = 0.7) { const g = ctx.createRadialGradient(540, 900, 300, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
// falling dust motes in the spotlight beam
export function motes(t, n = 40, seed = 0, x0 = 540, w = 700) {
  ctx.save(); for (let i = 0; i < n; i++) { const x = x0 - w / 2 + rnd(i + seed) * w + Math.sin(t * 0.7 + i) * 14, y = ((rnd(i * 7 + seed) * H + t * (20 + rnd(i) * 40)) % H);
    ctx.globalAlpha = 0.18 + 0.3 * rnd(i * 3); circle(x, y, 1.5 + rnd(i * 5) * 2.5, '#F7E7C4'); } ctx.restore();
}
