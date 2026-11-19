// EPISODE 7 · worker B: shots b1-b13 (lines 5 to 9): the Tamirabarani's silt builds the delta and strands Korkai, ships
// turn back at the sandbars, trade slides downriver to Kayal, the quiet village ~6 km from the shore, Caldwell's 1876 dig
// and its burial urns, a black-and-red ware sherd with scratch marks (Tamil Brahmi: illustrated with generic strokes and
// the attested fish / bow-and-arrow / sun symbols only, never invented letters).
// ART DIRECTION "Sand-Bottle Strata": coloured sand = time and land, speckled sand silhouettes, coastline creep, sand-pour
// transitions, brush-reveal, glass edge highlights, ONE signal colour (coral).
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { lg, rgba, mixc, cached } from './art.js';

// ───────── palette ─────────
const IND = '#0B2233', IND2 = '#12354D', TEAL = '#1F7A86', CREAM = '#EADBB8', OCHRE = '#D2A45A', RUST = '#A9542E', SILT = '#5B4636', MUD = '#7A5A3C';
const PEARL = '#F4EFE6', PINK = '#F2C6D2', AQUA = '#A9E1DC', CORAL = '#E5533D';
const GRAINC = [CREAM, OCHRE, MUD, OCHRE, RUST];

// ───────── small helpers ─────────
const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const plen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
/** point + heading at fraction k along a polyline */
function along(p, k) {
  const lim = plen(p) * clamp(k); let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + sl >= lim) { const f = (lim - acc) / (sl || 1); return [lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; }
    acc += sl;
  }
  const n = p.length - 1; return [p[n][0], p[n][1], Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0])];
}
/** the first k of a polyline */
function partial(p, k) {
  const lim = plen(p) * clamp(k), out = [p[0]]; let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + sl >= lim) { const f = (lim - acc) / (sl || 1); out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); return out; }
    out.push(p[i]); acc += sl;
  }
  return out;
}
const path = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
const dot = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); };

// speckle texture (generated once): every sand surface gets it, so all fills read as grains
let SPK = null;
function spk() {
  if (SPK) return SPK; SPK = mk(256, 256); const c = SPK.getContext('2d');
  for (let i = 0; i < 1500; i++) {
    const x = rnd(i * 1.31 + 7) * 256, y = rnd(i * 2.77 + 3) * 256, r = 0.6 + rnd(i * 5.1) * 1.7;
    c.fillStyle = rnd(i * 9.7) < 0.5 ? `rgba(255,248,230,${0.22 + 0.35 * rnd(i + 1)})` : `rgba(30,18,10,${0.2 + 0.35 * rnd(i + 2)})`;
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  return SPK;
}
/** fill the current path with sand speckle */
function grain(a = 0.6) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ctx.createPattern(spk(), 'repeat'); ctx.fill(); ctx.restore(); }
/** fill current path with a colour + speckle */
const sandFill = (c, a = 0.6) => { ctx.fillStyle = c; ctx.fill(); grain(a); };

// ───────── type ─────────
/** big word: Inter 900 caps, letter-spaced, pale sand with a dark offset shadow */
function big(text, x, y, size, col = CREAM, a = 1, sc = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  const sp = Math.round(size * 0.06); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${sp}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(6,16,24,0.6)'; ctx.fillText(text, sp / 2 + size * 0.04, size * 0.06);
  ctx.fillStyle = col; ctx.fillText(text, sp / 2, 0); ctx.restore();
}
/** small coral pill tag (Caladea) */
function pill(text, x, y, size = 30, a = 1, sc = 1, bg = CORAL, fg = PEARL) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size * 1.3, h = size * 1.55;
  ctx.fillStyle = 'rgba(6,16,24,0.35)'; rr(-w / 2 + 3, -h / 2 + 5, w, h, h / 2); ctx.fill();
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.fillText(text, 1, 2); ctx.restore();
}
/** map label: Inter 900, dark ink on sand */
function mlabel(text, x, y, size, col = IND, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
}
const popIn = (t, t0, dur = 0.35) => eob(seg(t, t0, t0 + dur));

// ───────── sand art layers ─────────
/** full-frame strata: wavy poured bands, each with a bright skin, speckled, a few pebbles */
function strataImg(key, cols, seed = 1, band = 120, y0 = -40) {
  return cached(key, W, H, 1, () => {
    const tops = []; let y = y0, i = 0;
    while (y < H + 40) { tops.push(y); y += band * (0.55 + rnd(seed * 31 + i) * 0.9); i++; }
    tops.forEach((ty, k) => {
      const a1 = rnd(seed + k * 3) * TAU, a2 = rnd(seed + k * 7) * TAU, amp = 6 + rnd(seed + k) * 20;
      const yt = (x) => ty + amp * Math.sin(x * 0.006 + a1) + amp * 0.5 * Math.sin(x * 0.017 + a2);
      ctx.beginPath(); ctx.moveTo(-10, yt(-10)); for (let x = 10; x <= W + 30; x += 20) ctx.lineTo(x, yt(x));
      ctx.lineTo(W + 30, H + 300); ctx.lineTo(-10, H + 300); ctx.closePath(); sandFill(cols[k % cols.length], 0.55);
      ctx.beginPath(); ctx.moveTo(-10, yt(-10)); for (let x = 10; x <= W + 30; x += 20) ctx.lineTo(x, yt(x));
      ctx.strokeStyle = 'rgba(255,246,225,0.22)'; ctx.lineWidth = 3; ctx.stroke();
    });
    for (let i = 0; i < 80; i++) { const x = rnd(i * 3.3 + seed) * W, yy = y0 + 60 + rnd(i * 7.1 + seed) * (H - y0), r = 3 + rnd(i * 1.9) * 7; ctx.beginPath(); ctx.ellipse(x, yy, r * 1.3, r, rnd(i) * 3, 0, TAU); ctx.fillStyle = rgba(rnd(i * 2.2) < 0.5 ? SILT : CREAM, 0.55); ctx.fill(); }
  });
}
const STRATA = [CREAM, OCHRE, RUST, MUD, OCHRE, SILT, CREAM, RUST];
const strataMain = () => strataImg('b:strata', STRATA, 3, 130);
const strataDark = () => cached('b:strataDark', W, H, 1, () => { ctx.drawImage(strataMain(), 0, 0); ctx.fillStyle = 'rgba(22,13,8,0.55)'; ctx.fillRect(0, 0, W, H); });

/** a stack of poured sand bands with a wavy top (dip pulls the top toward a slit at x 540) */
function sandStack(top, t, cols = [OCHRE, CREAM, RUST, MUD], dip = 0) {
  const yt = (x, k) => top + k * 120 + 10 * Math.sin(x * 0.012 + t * 3 + k) + dip * Math.exp(-(((x - 540) / 170) ** 2)) * (1 - k * 0.15);
  for (let k = 0; k < 16; k++) {
    if (top + k * 120 > H + 60) break;
    ctx.beginPath(); ctx.moveTo(-60, yt(-60, k)); for (let x = -40; x <= W + 60; x += 30) ctx.lineTo(x, yt(x, k));
    ctx.lineTo(W + 60, H + 200); ctx.lineTo(-60, H + 200); ctx.closePath(); sandFill(cols[k % cols.length], 0.6);
  }
}
/** SAND-POUR in: a stream of grains falls and fills the frame bottom-up (last `dur` s of a shot) */
function pourIn(lt, d, cols, dur = 0.55) {
  const p = seg(lt, d - dur, d); if (p <= 0) return;
  const top = H + 40 - (H + 140) * eio(p);
  for (let i = 0; i < 140; i++) {
    const x = rnd(i * 2.1) * W, sp = 0.8 + rnd(i * 4.3) * 0.6, y = ((lt * 2200 * sp + rnd(i * 7.7) * H) % (H + 200)) - 100;
    if (y < top) dot(x, y, 2.5 + rnd(i) * 3, GRAINC[i % 5]);
  }
  sandStack(top, lt, cols);
}
/** SAND-POUR out: the layer drains through a slit at the bottom, revealing the shot (first `dur` s) */
function pourOut(lt, cols, dur = 0.6) {
  const p = seg(lt, 0, dur); if (p >= 1) return;
  const top = -100 + (H + 200) * eio(p);
  sandStack(top, lt, cols, 160 * Math.sin(p * Math.PI) + 60);
}

/** GLASS: the bottle's wall reflections at the frame edges, with a glint sliding down */
function glass(t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = lg(0, 0, 150, 0, [[0, 'rgba(244,239,230,0.02)'], [0.28, 'rgba(244,239,230,0.17)'], [0.42, 'rgba(244,239,230,0.04)'], [1, 'rgba(244,239,230,0)']]); ctx.fillRect(-150, -300, 300, H + 600);
  ctx.fillStyle = lg(W - 90, 0, W, 0, [[0, 'rgba(169,225,220,0)'], [0.65, 'rgba(169,225,220,0.13)'], [1, 'rgba(169,225,220,0.03)']]); ctx.fillRect(W - 90, -300, 250, H + 600);
  const gy = ((t * 300) % (H + 700)) - 350;
  ctx.fillStyle = lg(0, gy - 200, 0, gy + 200, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.28)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(36, gy - 200, 14, 400);
  ctx.restore();
}
/** floating dust grains in a light shaft */
function motes(t, x0, x1, y0, y1, n = 40, seed = 0, col = '244,239,230', a = 0.6) {
  for (let i = 0; i < n; i++) {
    const x = x0 + ((rnd(i + seed) * (x1 - x0) + t * (6 + rnd(i * 3 + seed) * 14)) % (x1 - x0)), y = y0 + ((rnd(i * 7 + seed) * (y1 - y0) - t * (8 + rnd(i * 5) * 12) + 9999 * (y1 - y0)) % (y1 - y0));
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2 + i * 1.7));
    ctx.fillStyle = `rgba(${col},${a * tw})`; ctx.beginPath(); ctx.arc(x, y, 1.6 + rnd(i + 9) * 2.4, 0, TAU); ctx.fill();
  }
}
/** an iridescent pearl with a moving specular glint */
function pearl(x, y, r, t, ph = 0) {
  const a = t * 1.6 + ph, g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, PEARL); g.addColorStop(0.55, mixc(PEARL, PINK, 0.5 + 0.5 * Math.sin(a))); g.addColorStop(1, mixc(AQUA, '#6FA7A8', 0.3));
  dot(x, y, r, g); dot(x + Math.cos(a) * r * 0.42, y - Math.abs(Math.sin(a)) * r * 0.42, r * 0.22, 'rgba(255,255,255,0.9)');
}

// ═════════════════════ THE MAP (coastline creep) ═════════════════════
const Y0 = (x) => 880 + 36 * Math.sin(x * 0.007 + 0.6) + 20 * Math.sin(x * 0.019 + 2) + (x - 540) * 0.08;   // the old shore
const BUL = (x) => 340 * Math.exp(-(((x - 620) / 290) ** 2));                                              // what the silt adds
const coastY = (x, g) => Y0(x) + g * BUL(x);
const RIV = [[230, -80], [290, 120], [300, 270], [250, 410], [330, 550], [450, 650], [520, 750], [560, Y0(560) + 12]];
const M0 = RIV[RIV.length - 1];
const mouth = (g) => { const x = 560 + 110 * g; return [x, coastY(x, g) + 14]; };
function riverExt(g, u1 = 1) { const E = mouth(g), c = [578, (M0[1] + E[1]) / 2], out = []; for (let i = 1; i <= 12; i++) { const u = (i / 12) * u1; out.push([(1 - u) ** 2 * M0[0] + 2 * u * (1 - u) * c[0] + u * u * E[0], (1 - u) ** 2 * M0[1] + 2 * u * (1 - u) * c[1] + u * u * E[1]]); } return out; }
const riverPts = (g) => (g > 0.005 ? RIV.concat(riverExt(g)) : RIV);
const KORKAI = [498, 806], KAYAL = [716, 1150];
const TRADE = [KORKAI, [540, 832], M0].concat(riverExt(1, 0.72), [[KAYAL[0] - 8, KAYAL[1] + 4]]);

function landImg() {
  return cached('b:land', W, H, 1, () => {
    ctx.fillStyle = OCHRE; ctx.fillRect(0, 0, W, H);
    const cols = [mixc(OCHRE, CREAM, 0.35), mixc(OCHRE, MUD, 0.22), mixc(OCHRE, CREAM, 0.6), OCHRE, mixc(OCHRE, RUST, 0.22)];
    for (let k = 0; k < 34; k++) {
      const y0 = -160 + k * 62, a1 = rnd(k * 3.1) * TAU, tilt = 0.18;
      ctx.beginPath(); ctx.moveTo(0, y0); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, y0 + x * tilt + 18 * Math.sin(x * 0.008 + a1));
      ctx.lineTo(W, H + 400); ctx.lineTo(0, H + 400); ctx.closePath(); ctx.fillStyle = cols[k % 5]; ctx.fill();
    }
    ctx.beginPath(); ctx.rect(0, 0, W, H); grain(0.45);
    for (let i = 0; i < 46; i++) { // field plots
      const x = rnd(i * 4.1) * W, y = rnd(i * 6.3) * 900, w = 60 + rnd(i * 2.3) * 90, h = 40 + rnd(i * 8.1) * 60;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15 + rnd(i) * 0.3); ctx.fillStyle = rgba(CREAM, 0.22); ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = rgba(MUD, 0.25); ctx.lineWidth = 2; for (let r = -h / 2 + 8; r < h / 2; r += 10) { ctx.beginPath(); ctx.moveTo(-w / 2, r); ctx.lineTo(w / 2, r); ctx.stroke(); } ctx.restore();
    }
    for (let c = 0; c < 11; c++) { // palm groves (top-down tufts)
      const cx = rnd(c * 9.3 + 1) * W, cy = 80 + rnd(c * 5.7 + 2) * 640;
      for (let i = 0; i < 16; i++) { const x = cx + (rnd(c * 40 + i) - 0.5) * 120, y = cy + (rnd(c * 40 + i + 0.5) - 0.5) * 80; dot(x, y, 5 + rnd(c + i * 3) * 4, rgba(SILT, 0.55)); }
    }
  });
}
function coastPath(g, closeTop) {
  ctx.beginPath(); ctx.moveTo(-300, coastY(-300, g)); for (let x = -280; x <= W + 300; x += 16) ctx.lineTo(x, coastY(x, g));
  if (closeTop) { ctx.lineTo(W + 300, -400); ctx.lineTo(-300, -400); ctx.closePath(); }
}
function oldShorePath() { ctx.beginPath(); ctx.moveTo(-300, Y0(-300)); for (let x = -280; x <= W + 300; x += 16) ctx.lineTo(x, Y0(x)); }

/** top-down map. o: { g (delta growth 0..1), old (dashed old shoreline alpha), korkai (dot alpha), kdim (0..1 fade to silt) } */
function drawMap(t, o = {}) {
  const g = o.g || 0;
  ctx.fillStyle = lg(0, 500, 0, H + 200, [[0, IND2], [1, IND]]); ctx.fillRect(-400, -400, W + 800, H + 800);
  // shallow water and swells running out from the coast
  coastPath(g, false); ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(TEAL, 0.5); ctx.lineWidth = 150; ctx.stroke(); ctx.strokeStyle = rgba(AQUA, 0.16); ctx.lineWidth = 56; ctx.stroke();
  for (let k = 0; k < 4; k++) {
    const f = (t * 0.22 + k / 4) % 1, off = 60 + f * 360;
    ctx.beginPath(); for (let x = -260; x <= W + 260; x += 24) { const y = coastY(x, g) + off + 10 * Math.sin(x * 0.02 + t * 1.2 + k); x === -260 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = rgba(AQUA, 0.22 * (1 - f) * Math.min(1, f * 5)); ctx.lineWidth = 3; ctx.stroke();
  }
  // land: the sand-art bands, and the fresh silt in a paler cream
  ctx.save(); coastPath(g, true); ctx.clip(); ctx.drawImage(landImg(), 0, 0);
  if (g > 0.003) {
    ctx.beginPath(); ctx.moveTo(-300, Y0(-300) - 6); for (let x = -280; x <= W + 300; x += 16) ctx.lineTo(x, Y0(x) - 6);
    for (let x = W + 300; x >= -300; x -= 16) ctx.lineTo(x, coastY(x, g) + 2); ctx.closePath();
    ctx.fillStyle = lg(0, 650, 0, 1150, [[0, mixc(CREAM, OCHRE, 0.25)], [1, mixc(CREAM, MUD, 0.2)]]); ctx.fill(); grain(0.7);
    // growth rings inside the new land (each flood's layer)
    for (let k = 1; k <= 5; k++) { const gk = g * k / 6; ctx.beginPath(); for (let x = 260; x <= 980; x += 16) { const y = coastY(x, gk); x === 260 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = rgba(MUD, 0.18); ctx.lineWidth = 3; ctx.stroke(); }
  }
  ctx.restore();
  // the creeping front: grains settling along the new coast
  if (g > 0.003) for (let i = 0; i < 170; i++) {
    const x = 280 + rnd(i * 3.1) * 680, b = BUL(x) * g; if (b < 6) continue;
    const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.3), y = coastY(x, g) - rnd(i * 1.7) * Math.min(46, b) + 4;
    dot(x, y, 2 + rnd(i * 2.9) * 2.6, rgba(GRAINC[i % 5] === RUST ? CREAM : GRAINC[i % 5], 0.5 + 0.5 * tw));
  }
  // the old shoreline, left behind as a dashed coral line
  if (o.old > 0) { oldShorePath(); ctx.save(); ctx.globalAlpha = o.old; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 18; ctx.strokeStyle = CORAL; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
  // river + the silt it carries
  const rp = riverPts(g); path(rp); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = mixc(TEAL, MUD, 0.35); ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = rgba(AQUA, 0.28); ctx.lineWidth = 10; ctx.stroke();
  for (let i = 0; i < 46; i++) { const [x, y, h] = along(rp, (t * 0.2 + i / 46) % 1), off = (rnd(i * 3.3) - 0.5) * 16; dot(x - Math.sin(h) * off, y + Math.cos(h) * off, 3 + rnd(i) * 1.8, GRAINC[i % 4]); }
  const E = rp[rp.length - 1];
  const pg = ctx.createRadialGradient(E[0], E[1] + 50, 10, E[0], E[1] + 50, 190); pg.addColorStop(0, rgba(MUD, 0.55)); pg.addColorStop(1, rgba(MUD, 0)); ctx.fillStyle = pg; ctx.fillRect(E[0] - 200, E[1] - 150, 400, 400);
  for (let i = 0; i < 34; i++) { const f = (t * 0.45 + rnd(i * 5.1)) % 1, an = Math.PI / 2 + (rnd(i * 2.3) - 0.5) * 2.0, r = 20 + f * 180; dot(E[0] + Math.cos(an) * r, E[1] + Math.sin(an) * r * 0.8, 2.6, rgba(OCHRE, 0.8 * (1 - f))); }
  // Korkai
  if ((o.korkai ?? 1) > 0) portDot(KORKAI[0], KORKAI[1], t, o.korkai ?? 1, o.kdim || 0);
}
function portDot(x, y, t, a = 1, dim = 0, s = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const f = (t * 0.9) % 1; ctx.beginPath(); ctx.arc(x, y, (20 + f * 46) * s, 0, TAU); ctx.strokeStyle = rgba(CORAL, 0.7 * (1 - f) * (1 - dim)); ctx.lineWidth = 4; ctx.stroke();
  dot(x, y, 20 * s, PEARL); dot(x, y, 13 * s, mixc(CORAL, SILT, dim)); ctx.restore();
}
/** coral trade arrow drawn along a path up to fraction p */
function arrow(pts, p, w = 16) {
  if (p <= 0) return; const pp = partial(pts, p), [x, y, h] = along(pts, p);
  path(pp); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(PEARL, 0.85); ctx.lineWidth = w + 8; ctx.stroke(); ctx.strokeStyle = CORAL; ctx.lineWidth = w; ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(h); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(-14, -24); ctx.lineTo(-14, 24); ctx.closePath(); ctx.fillStyle = CORAL; ctx.fill(); ctx.strokeStyle = rgba(PEARL, 0.85); ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
}
/** top-down boat */
function boatTop(x, y, rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -46); ctx.quadraticCurveTo(22, -10, 14, 40); ctx.lineTo(-14, 40); ctx.quadraticCurveTo(-22, -10, 0, -46); ctx.closePath(); sandFill(SILT, 0.5);
  ctx.fillStyle = CREAM; ctx.fillRect(-20, -6, 40, 8); ctx.restore();
}

// ═════════════════════ SIDE-VIEW PIECES ═════════════════════
/** side-view ship, bow toward +x, waterline at y=0 */
function shipSide(s = 1) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-180, -18); ctx.lineTo(196, -40); ctx.quadraticCurveTo(170, 30, 110, 62); ctx.lineTo(-120, 62); ctx.quadraticCurveTo(-170, 40, -180, -18); ctx.closePath(); sandFill(SILT, 0.55);
  ctx.fillStyle = rgba(CREAM, 0.25); ctx.fillRect(-170, -12, 340, 6);
  ctx.strokeStyle = MUD; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -330); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(SILT, 0.8); ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(190, -40); ctx.moveTo(0, -330); ctx.lineTo(-175, -16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-108, -292); ctx.quadraticCurveTo(0, -306, 108, -292); ctx.quadraticCurveTo(128, -190, 112, -96); ctx.quadraticCurveTo(0, -80, -112, -96); ctx.quadraticCurveTo(-96, -190, -108, -292); ctx.closePath(); sandFill(CREAM, 0.5);
  ctx.strokeStyle = rgba(MUD, 0.5); ctx.lineWidth = 3; for (const yy of [-240, -190, -140]) { ctx.beginPath(); ctx.moveTo(-104, yy); ctx.quadraticCurveTo(0, yy + 14, 106, yy); ctx.stroke(); }
  ctx.restore();
}
function palmSide(x, y, h, lean, t, col, seed = 0, w = 12) {
  const tx = x + lean * h, ty = y - h, sw = Math.sin(t * 1.3 + seed) * 0.06;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * h * 0.2, y - h * 0.6, tx, ty); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
  ctx.lineWidth = w * 0.6;
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.42 + sw + (rnd(seed + i) - 0.5) * 0.2, len = h * (0.32 + rnd(seed * 3 + i) * 0.1);
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.5 + len * 0.42;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.75 - len * 0.12, ex, ey); ctx.stroke();
  }
}
function hut(x, y, w, h, roof, seed) {
  ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); sandFill(mixc(CREAM, OCHRE, 0.25 + rnd(seed) * 0.3), 0.5);
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 16, y - h + 4); ctx.lineTo(x - w * 0.18, y - h - h * 0.75); ctx.lineTo(x + w * 0.18, y - h - h * 0.75); ctx.lineTo(x + w / 2 + 16, y - h + 4); ctx.closePath(); sandFill(roof, 0.5);
  ctx.fillStyle = rgba(SILT, 0.85); ctx.fillRect(x - w * 0.1 + (rnd(seed * 2) - 0.5) * w * 0.4, y - h * 0.62, w * 0.2, h * 0.62);
}
/** a faceless sand villager walking (feet at 0,0) */
function walker(x, y, s, t, col = SILT) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const ph = t * 5.2, sw = Math.sin(ph) * 0.35;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 14;
  for (const k of [1, -1]) { ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(Math.sin(sw * k) * 50, -4 + Math.abs(Math.cos(ph)) * 0); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-16, -62); ctx.quadraticCurveTo(-20, -110, -10, -128); ctx.lineTo(12, -128); ctx.quadraticCurveTo(22, -100, 18, -62); ctx.closePath(); sandFill(col, 0.5);
  ctx.beginPath(); ctx.ellipse(2, -146, 14, 17, 0, 0, TAU); sandFill(col, 0.5);
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(8, -122); ctx.lineTo(14, -168); ctx.stroke(); // arm up, steadying the pot
  ctx.beginPath(); ctx.ellipse(4, -178, 22, 15, 0, 0, TAU); sandFill(RUST, 0.5);
  ctx.restore();
}

// ═════════════════════ EXCAVATION PIECES ═════════════════════
let COV = null;
/** BRUSH-REVEAL: draw `img` as a cover with the brushed path erased (path up to k), soft edged */
function brushCover(img, pts, k, w = 140) {
  if (!COV) COV = mk(W, H); const c = COV.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.drawImage(img, 0, 0);
  if (k > 0) {
    const pp = partial(pts, k); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pp.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = w * 1.4; c.stroke(); c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = w * 1.15; c.stroke(); c.strokeStyle = '#000'; c.lineWidth = w; c.stroke();
    c.globalCompositeOperation = 'source-over';
  }
  ctx.drawImage(COV, 0, 0);
}
/** the archaeologist's brush at a point, sweeping, with grains flicking off */
function brush(x, y, h, t) {
  for (let i = 0; i < 22; i++) { const f = (t * 3 + rnd(i * 3.7)) % 1, a = h + Math.PI + (rnd(i * 1.9) - 0.5) * 1.6, r = 20 + f * 120; dot(x + Math.cos(a) * r, y + Math.sin(a) * r - f * 30, 2 + rnd(i) * 2.5, rgba(GRAINC[i % 5], 1 - f)); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7 + Math.sin(t * 14) * 0.12);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-30, -40, -16, -62); ctx.lineTo(16, -62); ctx.quadraticCurveTo(30, -40, 34, 0); ctx.closePath(); sandFill(mixc(OCHRE, CREAM, 0.3), 0.7);
  ctx.strokeStyle = rgba(SILT, 0.5); ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 8, -4); ctx.lineTo(i * 4, -58); ctx.stroke(); }
  rr(-20, -84, 40, 26, 5); ctx.fillStyle = '#8D8A80'; ctx.fill();
  rr(-12, -300, 24, 220, 12); sandFill(RUST, 0.4); ctx.restore();
}
/** a large burial urn (base at 0,0) */
function urn(x, y, s, rot, seed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const shape = () => { ctx.beginPath(); ctx.moveTo(-70, -470); ctx.quadraticCurveTo(-78, -430, -120, -405); ctx.bezierCurveTo(-260, -360, -230, -120, -70, -10); ctx.quadraticCurveTo(0, 14, 70, -10); ctx.bezierCurveTo(230, -120, 260, -360, 120, -405); ctx.quadraticCurveTo(78, -430, 70, -470); ctx.closePath(); };
  shape(); ctx.fillStyle = 'rgba(15,8,4,0.45)'; ctx.save(); ctx.translate(14, 12); ctx.fill(); ctx.restore();
  shape(); ctx.fillStyle = lg(-230, 0, 230, 0, [[0, mixc(RUST, CREAM, 0.35)], [0.35, RUST], [1, mixc(RUST, SILT, 0.65)]]); ctx.fill(); grain(0.55);
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = 'rgba(255,230,200,0.12)'; ctx.beginPath(); ctx.ellipse(-90, -260, 50, 150, 0.15, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = rgba(SILT, 0.55); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-205, -300); ctx.quadraticCurveTo(0, -270, 205, -300); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(SILT, 0.7); ctx.beginPath(); ctx.moveTo(60 + seed * 20, -380); ctx.lineTo(90, -320); ctx.lineTo(70, -250); ctx.lineTo(110, -190); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -470, 78, 20, 0, 0, TAU); ctx.fillStyle = mixc(RUST, CREAM, 0.25); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -468, 62, 13, 0, 0, TAU); ctx.fillStyle = '#24140B'; ctx.fill();
  ctx.restore();
}
// the sherd (local coords, centred) and its marks
const SHERD = [[-262, -150], [-180, -168], [-96, -186], [10, -178], [122, -176], [200, -150], [262, -112], [244, -30], [252, 40], [186, 138], [92, 150], [30, 176], [-60, 160], [-146, 150], [-226, 82], [-244, 10], [-276, -54]];
const RIMY = (x) => -64 + 14 * Math.sin(x * 0.018 + 1);
const SCRATCH = [[[-214, 6], [-200, 70]], [[-188, 0], [-176, 64]], [[-162, -4], [-152, 60]], [[-120, 118], [-20, 128], [70, 112]], [[150, 96], [196, 60]]];
function fishMark(x, y) { return [[[x + 46, y], [x + 22, y - 22], [x - 10, y - 20], [x - 32, y], [x - 10, y + 20], [x + 22, y + 22], [x + 46, y]], [[x - 32, y], [x - 56, y - 22], [x - 56, y + 22], [x - 32, y]]]; }
function bowMark(x, y) { const bow = []; for (let i = 0; i <= 10; i++) { const a = -1.15 + i * 0.23; bow.push([x + 8 - Math.cos(a) * 52 + 30, y + Math.sin(a) * 52]); } return [bow, [bow[0], bow[10]], [[x - 50, y], [x + 54, y]], [[x + 54, y], [x + 38, y - 14]], [[x + 54, y], [x + 38, y + 14]]]; }
function sunMark(x, y) { const c = []; for (let i = 0; i <= 16; i++) c.push([x + Math.cos(i / 16 * TAU) * 24, y + Math.sin(i / 16 * TAU) * 24]); const out = [c]; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; out.push([[x + Math.cos(a) * 33, y + Math.sin(a) * 33], [x + Math.cos(a) * 50, y + Math.sin(a) * 50]]); } return out; }
const SYMS = [fishMark(-100, 30), bowMark(30, 20), sunMark(170, -10)];
/** draw incised strokes (list of polylines) up to fraction p of the list */
function incise(lines, p, glowA = 0) {
  if (p <= 0) return; const n = lines.length;
  lines.forEach((ln, i) => {
    const k = clamp(p * n - i); if (k <= 0) return; const pp = partial(ln, k);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(pp); ctx.save(); ctx.translate(2, 3); ctx.strokeStyle = 'rgba(10,6,4,0.7)'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    path(pp); ctx.strokeStyle = 'rgba(234,219,184,0.9)'; ctx.lineWidth = 5; ctx.stroke();
    if (glowA > 0) { path(pp); ctx.strokeStyle = rgba(CORAL, glowA); ctx.lineWidth = 3; ctx.stroke(); }
  });
}
/** black-and-red ware sherd. o: { scratch 0..1, syms [p0,p1,p2], glow, sheen } */
function sherd(x, y, s, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const shape = () => path(SHERD);
  ctx.save(); ctx.translate(8, 16); shape(); ctx.closePath(); ctx.fillStyle = 'rgba(12,6,3,0.55)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(0, 10); shape(); ctx.closePath(); ctx.fillStyle = mixc(RUST, CREAM, 0.35); ctx.fill(); ctx.restore(); // broken edge thickness
  shape(); ctx.closePath(); ctx.fillStyle = lg(0, -190, 0, 180, [[0, '#9E3B26'], [1, '#7E2C1C']]); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-300, -260); for (let xx = -300; xx <= 300; xx += 20) ctx.lineTo(xx, RIMY(xx)); ctx.lineTo(300, -260); ctx.closePath(); ctx.fillStyle = '#1E1714'; ctx.fill();
  ctx.beginPath(); for (let xx = -300; xx <= 300; xx += 20) (xx === -300 ? ctx.moveTo : ctx.lineTo).call(ctx, xx, RIMY(xx) + 3); ctx.strokeStyle = 'rgba(60,30,20,0.6)'; ctx.lineWidth = 8; ctx.stroke();
  ctx.beginPath(); ctx.rect(-300, -260, 600, 520); grain(0.35);
  const sx = -320 + ((t * 0.35 + (o.sheenPh || 0)) % 1) * 640; ctx.fillStyle = lg(sx - 90, 0, sx + 90, 0, [[0, 'rgba(255,240,220,0)'], [0.5, 'rgba(255,240,220,0.16)'], [1, 'rgba(255,240,220,0)']]); ctx.fillRect(sx - 90, -260, 180, 520);
  incise(SCRATCH, o.scratch || 0, o.glow || 0);
  if (o.syms) SYMS.forEach((sy, i) => incise(sy, o.syms[i] || 0, o.glow || 0));
  ctx.restore();
  ctx.restore();
}
/** Robert Caldwell as a faceless hat-and-coat sand silhouette with a spade. feet at (0,0); spade blade tip B and handle top T */
function caldwell(x, y, s, t, B, Tp, lean = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // crumbling grains drifting off his back
  for (let i = 0; i < 26; i++) { const f = (t * 0.5 + rnd(i * 2.3)) % 1, y0 = -100 - rnd(i * 5.7) * 360; dot(-60 - f * 140 - rnd(i) * 20, y0 - f * 60 + Math.sin(f * 6 + i) * 10, 2.2 + rnd(i * 3) * 2, rgba(i % 3 ? SILT : OCHRE, 0.8 * (1 - f))); }
  ctx.rotate(lean);
  const col = SILT;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 30;
  ctx.beginPath(); ctx.moveTo(-26, -130); ctx.lineTo(-34, -6); ctx.moveTo(24, -130); ctx.lineTo(40, -6); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-30, -4, 30, 12, 0, 0, TAU); ctx.ellipse(48, -4, 30, 12, 0, 0, TAU); sandFill(col, 0.5);
  // long coat
  ctx.beginPath(); ctx.moveTo(-50, -392); ctx.quadraticCurveTo(-74, -300, -96, -116); ctx.lineTo(-30, -126); ctx.lineTo(0, -150); ctx.lineTo(30, -126); ctx.lineTo(92, -112); ctx.quadraticCurveTo(70, -300, 52, -392); ctx.quadraticCurveTo(0, -410, -50, -392); ctx.closePath(); sandFill(col, 0.55);
  ctx.strokeStyle = rgba(CREAM, 0.18); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, -384); ctx.lineTo(4, -150); ctx.stroke();
  // head (plain, faceless) + wide-brimmed hat
  ctx.beginPath(); ctx.ellipse(4, -436, 32, 40, 0, 0, TAU); sandFill(col, 0.5);
  ctx.beginPath(); ctx.ellipse(4, -466, 76, 13, -0.04, 0, TAU); sandFill(MUD, 0.5);
  ctx.beginPath(); ctx.moveTo(-38, -470); ctx.quadraticCurveTo(-40, -528, 0, -532); ctx.quadraticCurveTo(44, -528, 42, -470); ctx.closePath(); sandFill(MUD, 0.5);
  ctx.restore();
  // spade + arms (unrotated so the blade can meet the ground)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h1 = [lerp(Tp[0], B[0], 0.1), lerp(Tp[1], B[1], 0.1)], h2 = [lerp(Tp[0], B[0], 0.42), lerp(Tp[1], B[1], 0.42)];
  ctx.strokeStyle = MUD; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(Tp[0], Tp[1]); ctx.lineTo(lerp(Tp[0], B[0], 0.8), lerp(Tp[1], B[1], 0.8)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(Tp[0] - 16, Tp[1]); ctx.lineTo(Tp[0] + 16, Tp[1]); ctx.stroke();
  const ang = Math.atan2(B[1] - Tp[1], B[0] - Tp[0]);
  ctx.save(); ctx.translate(B[0], B[1]); ctx.rotate(ang - Math.PI / 2); ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(26, -70); ctx.lineTo(22, -10); ctx.quadraticCurveTo(0, 6, -22, -10); ctx.closePath(); ctx.fillStyle = '#7F7C74'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = SILT; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(lean * 400 + 30, -376); ctx.lineTo(h1[0], h1[1]); ctx.moveTo(lean * 400 + 0, -372); ctx.lineTo(h2[0], h2[1]); ctx.stroke();
  dot(h1[0], h1[1], 15, SILT); dot(h2[0], h2[1], 15, SILT);
  ctx.restore();
}

// ═════════════════════ SHOTS ═════════════════════
export function buildB(add, cue) {
  // ── LINE 5: the river kept carrying silt, the land grew out into the sea ──
  const tRiv = Wd('Tamirabarani', 5);
  add({ id: 'b1', at: L(5) - 0.5, cam: [520, 820], zoom: 0.09, note: 'COASTLINE CREEP map: sand-art land, Tamirabarani winding down to KORKAI at the mouth, silt riding the river',
    draw(lt, d, t) {
      drawMap(t, { g: 0.04 * eio(seg(lt, 0.4, d)) });
      mlabel('KORKAI', 330, 780, 50, IND);
      const a = eo(seg(t, tRiv - 0.15, tRiv + 0.35)); ctx.save(); ctx.translate(lerp(40, 0, a), 0);
      mlabel('TAMIRABARANI', 600, 416, 40, IND, a); ctx.font = '700 30px Caladea'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillStyle = rgba(IND, 0.8 * a); ctx.fillText('river', 600, 462); ctx.restore();
      big('THE SEA', 540, 1170, 64, rgba(PEARL, 0.85), eo(seg(lt, 0.6, 1.2)) * 0.9);
      glass(t); pourOut(lt, [OCHRE, CREAM, RUST, MUD]);
    } });
  cue(L(5) - 0.45, 'sizzle', { gain: 0.35, dur: 0.7 });

  const b2 = Wd('carrying', 5) - 0.1, tSilt = Wd('silt', 5);
  add({ id: 'b2', at: b2, cam: [420, 760], zoom: 0.1, note: 'cross-section of the river mouth: silt grains rain through teal water and pile into layered sand bands that rise out of the sea',
    draw(lt, d, t) {
      const SURF = 380, FLOOR = 1260;
      ctx.fillStyle = lg(0, 0, 0, SURF, [[0, mixc(CREAM, PEARL, 0.4)], [1, mixc(CREAM, OCHRE, 0.45)]]); ctx.fillRect(-200, -200, W + 400, SURF + 200);
      ctx.fillStyle = lg(0, SURF, 0, FLOOR, [[0, TEAL], [0.45, IND2], [1, IND]]); ctx.fillRect(-200, SURF, W + 400, FLOOR - SURF);
      // light shafts with drifting grains
      ctx.save(); ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 1.3);
      for (const [x0, w] of [[560, 120], [800, 80]]) { ctx.beginPath(); ctx.moveTo(x0, SURF); ctx.lineTo(x0 + w, SURF); ctx.lineTo(x0 + w + 260, FLOOR); ctx.lineTo(x0 + 140, FLOOR); ctx.closePath(); ctx.fillStyle = lg(0, SURF, 0, FLOOR, [[0, 'rgba(169,225,220,0.22)'], [1, 'rgba(169,225,220,0)']]); ctx.fill(); }
      ctx.restore(); motes(t, 560, 1060, SURF + 20, FLOOR - 40, 30, 4, '169,225,220', 0.6);
      // older strata under the sea floor
      ctx.drawImage(strataDark(), 0, FLOOR, W, H - FLOOR, 0, FLOOR, W, H - FLOOR);
      // the new layers: wedges that push outward and stack up
      const N = 6, S = (u) => 1 / (1 + Math.exp(-u));
      const hk = (k, x) => { const pk = eio(seg(lt, -0.35 + k * 0.3, 0.55 + k * 0.3)); return 150 * pk * S((lerp(-120, 760 - k * 70, pk) - x) / 90); };
      const cols = [MUD, OCHRE, RUST, CREAM, OCHRE, MUD];
      let prev = new Array(60).fill(0);
      for (let k = 0; k < N; k++) {
        const cur = prev.map((v, j) => v + hk(k, -40 + j * 20));
        ctx.beginPath(); cur.forEach((v, j) => (j ? ctx.lineTo(-40 + j * 20, FLOOR - v) : ctx.moveTo(-40, FLOOR - v)));
        for (let j = prev.length - 1; j >= 0; j--) ctx.lineTo(-40 + j * 20, FLOOR - prev[j] + 1);
        ctx.closePath(); sandFill(cols[k], 0.6);
        ctx.beginPath(); cur.forEach((v, j) => (j ? ctx.lineTo(-40 + j * 20, FLOOR - v) : ctx.moveTo(-40, FLOOR - v))); ctx.strokeStyle = 'rgba(255,246,225,0.3)'; ctx.lineWidth = 3; ctx.stroke();
        prev = cur;
      }
      // water tint over the drowned part + the surface line
      ctx.fillStyle = rgba(TEAL, 0.16); ctx.fillRect(-200, SURF, W + 400, FLOOR - SURF);
      ctx.beginPath(); for (let x = -200; x <= W + 200; x += 20) { const y = SURF + 5 * Math.sin(x * 0.02 + t * 2.5); x === -200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = rgba(AQUA, 0.7); ctx.lineWidth = 4; ctx.stroke();
      // silt raining out of the river mouth (left), settling onto the pile
      const top = (x) => FLOOR - prev[clamp(Math.round((x + 40) / 20), 0, 59)];
      for (let i = 0; i < 230; i++) {
        const f = (lt * (0.55 + rnd(i * 2.1) * 0.35) + rnd(i * 7.3)) % 1, x = -30 + rnd(i * 3.7) * 140 + f * (220 + rnd(i * 1.3) * 700), y = SURF + 10 + Math.pow(f, 1.5) * 900;
        if (y > top(x) - 2) continue; dot(x, y, 2.4 + rnd(i * 5.5) * 3, GRAINC[i % 5]);
      }
      // the river pouring in from the bank
      pill('SILT', 330, 560, 36, eo(seg(t, tSilt - 0.15, tSilt + 0.2)), popIn(t, tSilt - 0.15));
      pill('RIVER MOUTH', 200, 300, 28, eo(seg(lt, 0.05, 0.4)), 1, IND2, CREAM);
      glass(t);
    } });
  cue(tSilt - 0.1, 'sizzle', { gain: 0.4, dur: 1.4, pan: -0.2 });

  const b3 = Wd('land', 5) - 0.25, tGrew = Wd('grew', 5);
  add({ id: 'b3', at: b3, cam: [600, 1020], zoom: 0.12, note: 'map again: grains build the delta outward, old shoreline left as a dashed coral line, KORKAI stranded inland',
    draw(lt, d, t) {
      const g = eio(seg(t, b3 + 0.05, Le(5) + 0.15));
      drawMap(t, { g, old: eo(seg(g, 0.06, 0.3)) });
      mlabel('KORKAI', 330, 780, 50, IND);
      pill('OLD SHORE', 900, Y0(900) - 46, 30, eo(seg(g, 0.15, 0.4)), popIn(g, 0.15, 0.25));
      pill('NEW LAND', 640, lerp(Y0(640), coastY(640, g), 0.55), 30, eo(seg(g, 0.55, 0.8)), popIn(g, 0.55, 0.25), mixc(CREAM, PEARL, 0.4), IND);
      glass(t);
    } });
  cue(tGrew, 'rumble', { gain: 0.45, dur: 1.2 });

  // ── LINE 6: ships could no longer reach the harbour; trade moved to Kayal ──
  const tReach = Wd('reach', 6);
  add({ id: 'b4', at: L(6) - 0.5, cam: [520, 800], zoom: 0.1, note: 'side view: sand ship sails toward the old harbour, its keel grounds on rising sandbars, it swings round and turns back',
    draw(lt, d, t) {
      const SURF = 700, tr = tReach - (L(6) - 0.5);
      ctx.fillStyle = lg(0, 0, 0, SURF, [[0, mixc(CREAM, PEARL, 0.5)], [1, mixc(OCHRE, CREAM, 0.45)]]); ctx.fillRect(-200, -200, W + 400, SURF + 200);
      dot(820, 330, 70, rgba(PEARL, 0.8)); dot(820, 330, 110, rgba(PEARL, 0.18));
      ctx.fillStyle = lg(0, SURF, 0, 1300, [[0, TEAL], [0.5, IND2], [1, IND]]); ctx.fillRect(-200, SURF, W + 400, 700);
      ctx.drawImage(strataDark(), 0, 1250, W, H - 1250, 0, 1250, W, H - 1250);
      // sandbars
      const bed = (x) => 1060 - 285 * Math.exp(-(((x - 560) / 230) ** 2)) - 150 * Math.exp(-(((x - 180) / 200) ** 2)) - 110 * Math.exp(-(((x - 920) / 170) ** 2)) - 8 * Math.sin(x * 0.045) - 5 * Math.sin(x * 0.11);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-200, 1400); for (let x = -200; x <= W + 200; x += 20) ctx.lineTo(x, bed(x) + k * 60); ctx.lineTo(W + 200, 1400); ctx.closePath(); sandFill([CREAM, OCHRE, MUD][k], 0.6); }
      // the old harbour on the left: shore + posts + huts
      ctx.beginPath(); ctx.moveTo(-200, SURF - 30); ctx.lineTo(90, SURF - 26); ctx.quadraticCurveTo(150, SURF - 10, 170, SURF + 40); ctx.lineTo(-200, SURF + 300); ctx.closePath(); sandFill(OCHRE, 0.6);
      hut(30, SURF - 26, 90, 70, RUST, 3); hut(-50, SURF - 26, 70, 56, MUD, 5);
      ctx.strokeStyle = SILT; ctx.lineWidth = 9; for (const px of [140, 178, 216]) { ctx.beginPath(); ctx.moveTo(px, SURF - 40); ctx.lineTo(px, SURF + 60); ctx.stroke(); }
      pill('KORKAI', 120, SURF - 190, 30, 1, 1, IND2, CREAM);
      // water tint + surface
      ctx.fillStyle = rgba(TEAL, 0.18); ctx.fillRect(-200, SURF, W + 400, 600);
      ctx.beginPath(); for (let x = -200; x <= W + 200; x += 20) { const y = SURF + 6 * Math.sin(x * 0.018 + t * 2.4); x === -200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = rgba(AQUA, 0.75); ctx.lineWidth = 4; ctx.stroke();
      // the ship: approaches, grounds, swings round, leaves
      const pa = eo(seg(lt, 0, tr)), turn = eio(seg(lt, tr + 0.3, tr + 0.85)), back = eio(seg(lt, tr + 0.75, d + 0.3));
      const sx = lerp(1060, 600, pa) + 260 * back, hit = seg(lt, tr - 0.05, tr + 0.5), rock = Math.sin(hit * 20) * 0.06 * (1 - hit) * (hit > 0 ? 1 : 0);
      const bob = Math.sin(t * 2.4) * 5, dir = lerp(-1, 1, turn);
      ctx.save(); ctx.translate(sx, SURF + bob + 6 * hit * (1 - turn)); ctx.rotate(rock - 0.02 * (1 - hit)); ctx.scale(Math.abs(dir) < 0.08 ? 0.08 * Math.sign(dir || 1) : dir, 1); shipSide(0.92); ctx.restore();
      // grains kicked up where the keel scrapes the bar
      if (lt > tr - 0.05) for (let i = 0; i < 40; i++) { const f = clamp((lt - tr + 0.05) * (0.9 + rnd(i) * 0.6)), an = -Math.PI / 2 + (rnd(i * 3.1) - 0.5) * 2.6, r = f * (60 + rnd(i * 5) * 120); if (f >= 1) continue; dot(600 + Math.cos(an) * r, SURF + 80 + Math.sin(an) * r * 0.5 + f * f * 60, 2.5 + rnd(i * 7) * 2.5, rgba(GRAINC[i % 5], 1 - f)); }
      pill('SANDBARS', 600, 930, 32, eo(seg(lt, tr, tr + 0.3)), popIn(lt, tr));
      glass(t);
    } });
  cue(tReach + 0.02, 'thud', { gain: 0.6, pan: 0.1 });

  const b5 = Wd('Trade', 6) - 0.12;
  add({ id: 'b5', at: b5, cam: [600, 980], zoom: 0.1, note: 'map: a coral arrow of trade flows from fading KORKAI down the river, iridescent pearls riding it, to a new mouth',
    draw(lt, d, t) {
      const p = eio(seg(lt, 0.1, d + 0.15));
      drawMap(t, { g: 1, old: 0.85, kdim: 0.75 * seg(p, 0.25, 0.9) });
      mlabel('KORKAI', 330, 780, 50, mixc(IND, SILT, 0.5 * seg(p, 0.25, 0.9)));
      arrow(TRADE, p * 0.94);
      for (let i = 0; i < 6; i++) { const k = p * 0.94 - i * 0.07; if (k < 0.02) continue; const [x, y] = along(TRADE, k); i % 2 ? (rr(x - 11, y - 9, 22, 18, 4), sandFill(CREAM, 0.5)) : pearl(x + 20, y - 4, 11, t, i); }
      pill('TRADE', 860, 820, 36, eo(seg(lt, 0, 0.3)), popIn(lt, 0));
      if (p > 0.85) portDot(KAYAL[0], KAYAL[1], t, seg(p, 0.85, 1) * 0.6, 0.5, 0.8);
      glass(t);
    } });
  cue(b5 + 0.15, 'slide', { gain: 0.45, dur: 1.2, pan: 0.2 });

  const b6 = Wd('new', 6) - 0.45, tKayal = Wd('Kayal', 6);
  add({ id: 'b6', at: b6, cam: [540, 860], zoom: 0.08, note: 'closer on the new mouth: boats glide in, KAYAL pops as a coral port dot with ripples, KORKAI grey upstream; sand pours in',
    draw(lt, d, t) {
      ctx.save(); ctx.translate(540, 820); ctx.scale(1.5, 1.5); ctx.translate(-KAYAL[0], -KAYAL[1]);
      drawMap(t, { g: 1, old: 0.85, kdim: 0.8 }); arrow(TRADE, 0.94, 14);
      const bp = eo(seg(lt, 0, d - 0.3));
      [[[780, 1560], [756, 1212]], [[620, 1600], [694, 1226]], [[930, 1520], [794, 1196]]].forEach(([a, b], i) => {
        const k = clamp(bp * 1.15 - i * 0.12), x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k), r = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
        ctx.strokeStyle = rgba(AQUA, 0.4 * (1 - k)); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(r + 1.3) * 60, y + Math.sin(r + 1.3) * 60); ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(r - 1.3 + Math.PI) * -60, y + Math.sin(r - 1.3 + Math.PI) * -60); ctx.stroke();
        boatTop(x, y, r, 0.55);
      });
      const kp = popIn(t, tKayal - 0.15, 0.4);
      if (t > tKayal - 0.15) { for (let k = 0; k < 3; k++) { const f = ((t - tKayal + 0.15) * 0.8 + k / 3) % 1; ctx.beginPath(); ctx.arc(KAYAL[0], KAYAL[1], 24 + f * 90, 0, TAU); ctx.strokeStyle = rgba(PEARL, 0.6 * (1 - f)); ctx.lineWidth = 3; ctx.stroke(); } portDot(KAYAL[0], KAYAL[1], t, 1, 0, Math.max(0.01, kp)); }
      else portDot(KAYAL[0], KAYAL[1], t, 0.6, 0.5, 0.8);
      ctx.restore();
      mlabel('KORKAI', 250, 150, 40, rgba(SILT, 0.9));
      pill('NEW PORT', 540, 955, 32, eo(seg(t, Wd('new', 6) - 0.1, Wd('new', 6) + 0.25)), popIn(t, Wd('new', 6) - 0.1));
      big('KAYAL', 540, 1080, 140, CREAM, eo(seg(t, tKayal - 0.15, tKayal + 0.2)), lerp(0.7, 1, popIn(t, tKayal - 0.15, 0.4)));
      glass(t); pourIn(lt, d, [CREAM, OCHRE, MUD, RUST]);
    } });
  cue(tKayal - 0.05, 'pop', { gain: 0.55 }); cue(b6 + 2.3 - 0.5, 'sizzle', { gain: 0.3, dur: 0.6 });

  // ── LINE 7: today a quiet village, about 6 km from the shore ──
  const villageImg = () => cached('b:village', W + 240, H, 1, () => {
    const VW = W + 240;
    ctx.fillStyle = lg(0, 0, 0, 840, [[0, mixc(CREAM, PEARL, 0.55)], [1, mixc(CREAM, OCHRE, 0.5)]]); ctx.fillRect(0, 0, VW, 860);
    for (let i = 0; i < 26; i++) palmSide(rnd(i * 3.3) * VW, 846, 120 + rnd(i * 5.1) * 120, (rnd(i * 2.2) - 0.5) * 0.3, 0, rgba(MUD, 0.38), i, 8);
    ctx.beginPath(); ctx.moveTo(0, 836); for (let x = 0; x <= VW; x += 30) ctx.lineTo(x, 836 + 6 * Math.sin(x * 0.01)); ctx.lineTo(VW, H); ctx.lineTo(0, H); ctx.closePath(); sandFill(mixc(OCHRE, CREAM, 0.3), 0.55);
    [[250, 960, 120, 80, RUST], [400, 950, 150, 96, MUD], [560, 962, 110, 74, RUST], [720, 952, 160, 90, MUD], [900, 966, 120, 76, RUST], [1060, 958, 140, 86, MUD]].forEach(([x, y, w, h, r], i) => hut(x, y, w, h, r, i + 1));
    // fields: poured stripes running to the foreground
    const cols = [OCHRE, mixc(CREAM, OCHRE, 0.4), MUD, CREAM, OCHRE, RUST];
    let y = 990; for (let k = 0; y < H; k++) { const h = 40 + k * 22; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= VW; x += 40) ctx.lineTo(x, y + 8 * Math.sin(x * 0.006 + k)); ctx.lineTo(VW, H + 10); ctx.lineTo(0, H + 10); ctx.closePath(); sandFill(cols[k % cols.length], 0.55);
      ctx.strokeStyle = 'rgba(40,24,14,0.12)'; ctx.lineWidth = 2; for (let r = 0; r < 6; r++) { ctx.beginPath(); for (let x = 0; x <= VW; x += 40) { const yy = y + 8 + r * h / 6 + 8 * Math.sin(x * 0.006 + k); x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); } y += h; }
  });
  const tVil = Wd('village', 7);
  add({ id: 'b7', at: L(7) - 0.42, cam: [560, 820], zoom: 0.08, note: 'present day side view: sand-coloured huts, palm rows and striped fields, a faceless villager with a pot walks by, KORKAI / TODAY',
    draw(lt, d, t) {
      ctx.drawImage(villageImg(), -lt * 40, 0);
      dot(800, 470, 64, rgba(PEARL, 0.85)); dot(800, 470, 120, rgba(PEARL, 0.2));
      ctx.save(); ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(740, 470); ctx.lineTo(860, 470); ctx.lineTo(620, 1250); ctx.lineTo(300, 1250); ctx.closePath(); ctx.fillStyle = lg(0, 470, 0, 1250, [[0, 'rgba(244,239,230,0.35)'], [1, 'rgba(244,239,230,0)']]); ctx.fill(); ctx.restore();
      motes(t, 320, 860, 560, 1240, 34, 9, '255,248,230', 0.7);
      for (let i = 0; i < 7; i++) { const f = (t * 0.25 + i / 7) % 1; dot(400 - lt * 40 + Math.sin(f * 5 + i) * 18 * f, 830 - f * 260, 12 + f * 30, `rgba(244,239,230,${0.22 * (1 - f)})`); }
      walker(lerp(180, 420, lt / d) - lt * 40, 1010, 0.95, t);
      palmSide(90, 1180, 700, 0.12, t, SILT, 2, 18); palmSide(1000, 1210, 620, -0.1, t, mixc(SILT, MUD, 0.4), 5, 16);
      big('KORKAI', 540, 250, 128, SILT, eo(seg(lt, 0.45, 0.9)), lerp(0.85, 1, eo(seg(lt, 0.45, 0.9))));
      pill('TODAY', 540, 370, 34, eo(seg(lt, 0.55, 0.85)), popIn(lt, 0.55));
      ctx.save(); ctx.font = '700 40px Caladea'; ctx.textAlign = 'center'; ctx.fillStyle = rgba(SILT, eo(seg(t, tVil - 0.1, tVil + 0.3))); ctx.fillText('a quiet village', 540, 445); ctx.restore();
      glass(t); pourOut(lt, [CREAM, OCHRE, MUD, RUST]);
    } });
  cue(tVil, 'bell', { gain: 0.3, dur: 1.2 });

  const PATHP = [[540, 450], [600, 540], [530, 650], [470, 770], [550, 880], [640, 980], [600, 1080], [620, 1160]];
  const pathImg = () => cached('b:path', W, H, 1, () => {
    ctx.fillStyle = mixc(OCHRE, CREAM, 0.3); ctx.fillRect(0, 0, W, H);
    const cols = [OCHRE, mixc(CREAM, OCHRE, 0.4), mixc(OCHRE, MUD, 0.3), CREAM, mixc(OCHRE, RUST, 0.25)];
    for (let i = 0; i < 90; i++) { const x = (i % 9) * 130 - 40 + rnd(i) * 30, y = 460 + Math.floor(i / 9) * 76 + rnd(i * 2) * 20, w = 120 + rnd(i * 3) * 30, h = 66;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06 + rnd(i * 5) * 0.12); ctx.beginPath(); ctx.rect(0, 0, w, h); sandFill(cols[i % 5], 0.5); ctx.strokeStyle = 'rgba(60,36,20,0.16)'; ctx.lineWidth = 2; for (let r = 8; r < h; r += 11) { ctx.beginPath(); ctx.moveTo(4, r); ctx.lineTo(w - 4, r); ctx.stroke(); } ctx.restore(); }
    // village cluster
    for (let i = 0; i < 30; i++) { const x = 300 + rnd(i * 4.4) * 480, y = 180 + rnd(i * 6.6) * 220; ctx.save(); ctx.translate(x, y); ctx.rotate((rnd(i) - 0.5) * 0.5); ctx.beginPath(); ctx.rect(-26, -18, 52, 36); sandFill(i % 2 ? RUST : MUD, 0.5); ctx.strokeStyle = rgba(CREAM, 0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.stroke(); ctx.restore(); }
    for (let i = 0; i < 70; i++) { const x = rnd(i * 7.7) * W, y = 120 + rnd(i * 3.9) * 1000; if (Math.abs(x - 560) < 120) continue; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + i; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); ctx.strokeStyle = rgba(SILT, 0.7); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); } }
    // beach
    ctx.beginPath(); ctx.moveTo(0, 1150); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, 1150 + 14 * Math.sin(x * 0.01)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); sandFill(CREAM, 0.6);
  });
  const tSix = Wd('six', 7), tShore = Wd('shore', 7);
  add({ id: 'b8', at: Wd('about', 7) - 0.1, cam: [560, 820], zoom: 0.1, note: 'top-down: dotted coral footpath with walking footprints from the village through striped fields to the shore, "≈ 6 km" plate',
    draw(lt, d, t) {
      ctx.drawImage(pathImg(), 0, 0);
      ctx.fillStyle = lg(0, 1200, 0, H, [[0, TEAL], [0.4, IND2], [1, IND]]); ctx.beginPath(); ctx.moveTo(-200, 1210); for (let x = -200; x <= W + 200; x += 20) ctx.lineTo(x, 1206 + 14 * Math.sin(x * 0.01) + 10 * Math.sin(x * 0.03 + t * 1.8)); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 3; k++) { const f = (t * 0.35 + k / 3) % 1; ctx.beginPath(); for (let x = -200; x <= W + 200; x += 24) { const y = 1206 + 14 * Math.sin(x * 0.01) + 10 + (1 - f) * 220 + 8 * Math.sin(x * 0.03 + k); x === -200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = `rgba(244,239,230,${0.5 * f})`; ctx.lineWidth = 4; ctx.stroke(); }
      path(PATHP); ctx.setLineDash([4, 18]); ctx.lineCap = 'round'; ctx.strokeStyle = rgba(CORAL, 0.75); ctx.lineWidth = 8; ctx.stroke(); ctx.setLineDash([]);
      const p = eio(seg(lt, 0.1, d - 0.5)), len = plen(PATHP), n = Math.floor(len / 46);
      for (let i = 0; i < n; i++) {
        const k = (i + 0.5) / n; if (k > p) break; const [x, y, h] = along(PATHP, k), side = i % 2 ? 1 : -1, age = (p - k) * 6;
        const s = i === Math.floor(p * n - 0.5) ? eob(clamp((p * n - i - 0.5) * 2)) : 1;
        ctx.save(); ctx.translate(x - Math.sin(h) * side * 11, y + Math.cos(h) * side * 11); ctx.rotate(h + Math.PI / 2); ctx.scale(s, s);
        ctx.fillStyle = rgba('#2A1C12', clamp(1 - age * 0.2, 0.55, 1)); ctx.beginPath(); ctx.ellipse(0, 0, 10, 17, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -24, 8, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      const [wx, wy] = along(PATHP, p); for (let i = 0; i < 12; i++) { const f = (t * 1.5 + rnd(i * 3)) % 1; dot(wx + (rnd(i) - 0.5) * 40, wy - f * 40, 2.5, rgba(CREAM, 1 - f)); }
      pill('KORKAI', 540, 110, 32, 1, 1, IND2, CREAM);
      const a6 = popIn(t, tSix - 0.1, 0.4);
      if (t > tSix - 0.1) { ctx.save(); ctx.translate(810, 790); ctx.scale(a6, a6); rr(-170, -78, 340, 156, 40); ctx.fillStyle = 'rgba(11,34,51,0.82)'; ctx.fill(); ctx.strokeStyle = CORAL; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); big('≈ 6 km', 810, 792, 92, CREAM, 1, a6); }
      pill('SHORE', 860, 1130, 30, eo(seg(t, tShore - 0.1, tShore + 0.2)), popIn(t, tShore - 0.1));
      glass(t); pourIn(lt, d, [OCHRE, RUST, CREAM, MUD]);
    } });
  cue(tSix, 'pop', { gain: 0.45 }); cue(Wd('about', 7) + 0.3, 'tock', { gain: 0.3 });

  // ── LINE 8: 1876, Robert Caldwell dug here and found burial urns ──
  const b9 = L(8) - 0.45;
  add({ id: 'b9', at: b9, cam: [540, 640], zoom: 0.09, note: 'inside the glass bottle: a sand stream pours the year 1876 full of coloured layers above a strata pile; RECORD tag',
    draw(lt, d, t) {
      ctx.fillStyle = lg(0, 0, 0, H, [[0, IND2], [1, IND]]); ctx.fillRect(-200, -200, W + 400, H + 400);
      const pile = 1080 - 40 * eio(seg(lt, 0, d));
      ctx.save(); ctx.beginPath(); ctx.moveTo(-200, pile); for (let x = -200; x <= W + 200; x += 20) ctx.lineTo(x, pile + 30 * Math.sin(x * 0.006 + 1) - 50 * Math.exp(-(((x - 540) / 200) ** 2))); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.closePath(); ctx.clip(); ctx.drawImage(strataMain(), 0, 0); ctx.restore();
      motes(t, 60, 1020, 120, 1000, 30, 21, '169,225,220', 0.5);
      const p = eio(seg(t, Wd('eighteen', 8) - 0.2, Wd('six', 8) + 0.35)), fs = 320, ty = 600, top = ty - fs * 0.37, bot = ty + fs * 0.37, cut = 1 - p, lvl = lerp(top, bot, cut);
      ctx.save(); ctx.font = `900 ${fs}px Inter`; ctx.letterSpacing = '14px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(234,219,184,0.4)'; ctx.lineWidth = 3; ctx.strokeText('1876', 547, ty);
      const gr = ctx.createLinearGradient(0, top, 0, bot), bands = [CREAM, OCHRE, RUST, MUD], st = [[0, 'rgba(0,0,0,0)'], [cut, 'rgba(0,0,0,0)']];
      bands.forEach((c, b) => { const e = (b + 1) / 4; if (e <= cut) return; st.push([Math.max(b / 4, cut), c], [e, c]); });
      st.forEach(([o, c]) => gr.addColorStop(clamp(o), c)); ctx.fillStyle = gr; ctx.fillText('1876', 547, ty);
      ctx.beginPath(); ctx.rect(0, lvl, W, bot - lvl + 40); ctx.clip(); ctx.fillStyle = ctx.createPattern(spk(), 'repeat'); ctx.globalAlpha = 0.7; ctx.fillText('1876', 547, ty);
      ctx.restore();
      // the pouring stream
      if (p < 1) { const px = 540 + 300 * Math.sin(t * 2.3), endY = p > 0 ? lvl : pile;
        for (let i = 0; i < 70; i++) { const f = (t * 1.8 + i / 70) % 1, y = -40 + f * (endY + 40); dot(px + (rnd(i) - 0.5) * 16 * (0.4 + f), y, 2.4 + rnd(i * 3) * 2, GRAINC[i % 5]); }
        for (let i = 0; i < 14; i++) { const f = (t * 3 + rnd(i * 2)) % 1, a = -Math.PI / 2 + (rnd(i * 5) - 0.5) * 2.2; dot(px + Math.cos(a) * f * 40, endY + Math.sin(a) * f * 30 + f * f * 30, 2.2, rgba(CREAM, 1 - f)); } }
      pill('RECORD', 540, 860, 32, eo(seg(t, Wd('six', 8), Wd('six', 8) + 0.3)), popIn(t, Wd('six', 8)));
      glass(t); pourOut(lt, [OCHRE, RUST, CREAM, MUD]);
    } });
  cue(Wd('eighteen', 8) - 0.15, 'sizzle', { gain: 0.4, dur: 1.4 });

  const b10 = Wd('Robert', 8) - 0.4, tDug = Wd('dug', 8);
  add({ id: 'b10', at: b10, cam: [470, 820], zoom: 0.1, note: 'faceless hat-and-coat sand silhouette drives a spade into the strata, grains fly, tag R. CALDWELL, 1876',
    draw(lt, d, t) {
      const G = 1030;
      ctx.fillStyle = lg(0, 0, 0, G, [[0, mixc(CREAM, PEARL, 0.5)], [1, mixc(OCHRE, CREAM, 0.4)]]); ctx.fillRect(-200, -200, W + 400, G + 200);
      for (let i = 0; i < 9; i++) palmSide(60 + i * 130 + rnd(i) * 40 - lt * 14, G + 4, 160 + rnd(i * 3) * 120, (rnd(i * 7) - 0.5) * 0.3, t, rgba(MUD, 0.3), i + 10, 7);
      ctx.drawImage(strataMain(), 0, 0, W, H - G, 0, G, W, H - G);
      ctx.fillStyle = 'rgba(255,246,225,0.35)'; ctx.fillRect(0, G - 2, W, 4);
      // hole and spoil heap
      const dg = eo(seg(t, tDug - 0.05, tDug + 0.6));
      ctx.beginPath(); ctx.ellipse(590, G + 6, 30 + 60 * dg, 6 + 26 * dg, 0, 0, TAU); ctx.fillStyle = '#24140B'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(680, G + 2); ctx.quadraticCurveTo(760, G - 20 - 70 * dg, 860, G + 2); ctx.closePath(); sandFill(mixc(OCHRE, MUD, 0.3), 0.6);
      // spade choreography: ready, lift, thrust on "dug", lever and fling
      const rel = t - tDug, lift = eio(seg(rel, -0.55, -0.1)), thrust = eo(seg(rel, -0.1, 0.05)), lever = eio(seg(rel, 0.3, 0.7));
      let B = [150, -50], T = [74, -330];
      B = [lerp(B[0], 140, lift), lerp(B[1], -110, lift)]; T = [lerp(T[0], 60, lift), lerp(T[1], -390, lift)];
      B = [lerp(B[0], 200, thrust), lerp(B[1], 34, thrust)]; T = [lerp(T[0], 120, thrust), lerp(T[1], -270, thrust)];
      B = [lerp(B[0], 230, lever), lerp(B[1], -40, lever)]; T = [lerp(T[0], 30, lever), lerp(T[1], -250, lever)];
      const sway = Math.sin(t * 1.6) * 0.012;
      caldwell(400, G, 1, t, B, T, sway + 0.05 * thrust * (1 - lever) - 0.03 * lever);
      if (rel > 0.4) for (let i = 0; i < 46; i++) { const f = clamp((rel - 0.4) * (1.1 + rnd(i) * 0.8)); if (f >= 1) continue; const vx = 140 + rnd(i * 3) * 300, vy = -260 - rnd(i * 5) * 260; dot(630 + vx * f, G - 40 + vy * f + 520 * f * f, 2.5 + rnd(i * 7) * 3, rgba(GRAINC[i % 5], 1 - f * f)); }
      const tR = Wd('Robert', 8), a = popIn(t, tR - 0.1, 0.4);
      pill('R. CALDWELL, 1876', 420, 360, 36, eo(seg(t, tR - 0.1, tR + 0.2)), a);
      ctx.save(); ctx.globalAlpha = eo(seg(t, tR + 0.1, tR + 0.4)); ctx.font = '700 32px Caladea'; ctx.textAlign = 'center'; ctx.fillStyle = SILT; ctx.fillText('missionary', 420, 430); ctx.restore();
      glass(t);
    } });
  cue(tDug + 0.02, 'chisel', { gain: 0.55 }); cue(tDug + 0.45, 'whoosh', { gain: 0.3, pan: 0.4 });

  const b11 = Wd('found', 8) - 0.15, tUrns = Wd('urns', 8);
  const URNPATH = []; for (let r = 0; r < 10; r++) { const y = 380 + r * 84; URNPATH.push(r % 2 ? [920, y] : [180, y], r % 2 ? [180, y + 42] : [920, y + 42]); }
  add({ id: 'b11', at: b11, cam: [540, 780], zoom: 0.1, note: 'BRUSH-REVEAL: a brush sweeps the strata away in a trench, two big rust burial urns emerge; BURIAL URNS tag',
    draw(lt, d, t) {
      ctx.drawImage(strataDark(), 0, 0);
      urn(420, 1180, 1.25, -0.05, 0); urn(790, 1170, 0.82, 0.1, 1);
      const k = eio(seg(t, b11 + 0.05, tUrns + 0.75));
      brushCover(strataMain(), URNPATH, k, 150);
      if (k > 0 && k < 1) { const [x, y, h] = along(URNPATH, k); brush(x, y, h, t); }
      motes(t, 100, 980, 200, 1250, 26, 31, '244,239,230', 0.55);
      pill('BURIAL URNS', 540, 230, 36, eo(seg(t, tUrns - 0.1, tUrns + 0.2)), popIn(t, tUrns - 0.1));
      glass(t);
    } });
  cue(tUrns, 'swell', { gain: 0.45, dur: 1.2 }); cue(b11 + 0.1, 'sizzle', { gain: 0.3, dur: 1.2 });

  // ── LINE 9: pottery scratched with early Tamil letters (Tamil Brahmi) ──
  const b12 = Wd('pottery', 9) - 0.6, tScr = Wd('scratched', 9);
  const SHPATH = []; for (let r = 0; r < 7; r++) { const y = 470 + r * 64; SHPATH.push(r % 2 ? [860, y] : [220, y], r % 2 ? [220, y + 32] : [860, y + 32]); }
  add({ id: 'b12', at: b12, cam: [540, 760], zoom: 0.1, note: 'BRUSH-REVEAL of a black-and-red ware sherd in the strata, generic scratch strokes incise themselves; marks: illustration tag',
    draw(lt, d, t) {
      ctx.drawImage(strataDark(), 0, 0);
      sherd(540, 740, 1.12, -0.06, t, { scratch: eio(seg(t, tScr - 0.1, tScr + 0.9)) });
      const k = eio(seg(t, b12 + 0.1, Wd('pottery', 9) + 0.4));
      brushCover(strataMain(), SHPATH, k, 130);
      if (k > 0 && k < 1) { const [x, y, h] = along(SHPATH, k); brush(x, y, h, t); }
      motes(t, 100, 980, 200, 1250, 24, 41, '244,239,230', 0.55);
      pill('BLACK-AND-RED WARE', 540, 250, 32, eo(seg(t, Wd('pottery', 9), Wd('pottery', 9) + 0.3)), popIn(t, Wd('pottery', 9)));
      pill('marks: illustration', 540, 1150, 28, eo(seg(t, tScr, tScr + 0.3)), 1, IND2, CREAM);
      glass(t);
    } });
  cue(tScr, 'chisel', { gain: 0.45, pan: -0.2 });

  const b13 = Wd('letters', 9) + 0.35, tBr = Wd('Brahmi', 9);
  add({ id: 'b13', at: b13, cam: [540, 760], zoom: 0.1, note: 'close on the sherd: attested symbols fish, bow-and-arrow, sun incise with a coral trace; TAMIL BRAHMI title, marks: illustration tag',
    draw(lt, d, t) {
      ctx.drawImage(strataDark(), 0, 0);
      ctx.save(); ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(380, -100); ctx.lineTo(620, -100); ctx.lineTo(900, 1250); ctx.lineTo(260, 1250); ctx.closePath(); ctx.fillStyle = lg(0, 0, 0, 1250, [[0, 'rgba(244,239,230,0.3)'], [1, 'rgba(244,239,230,0)']]); ctx.fill(); ctx.restore();
      motes(t, 260, 900, 100, 1240, 36, 51, '255,248,230', 0.7);
      const sp = (i) => eio(seg(lt, 0.15 + i * 0.45, 0.65 + i * 0.45));
      sherd(540, 770, 1.6, -0.06 + lt * 0.012, t, { scratch: 1, syms: [sp(0), sp(1), sp(2)], glow: 0.55 + 0.35 * Math.sin(t * 3) });
      const a = eo(seg(t, tBr - 0.45, tBr + 0.05)), sc = lerp(0.85, 1, popIn(t, tBr - 0.45, 0.45));
      big('TAMIL BRAHMI', 540, 250, 92, CREAM, a, sc);
      pill('marks: illustration', 540, 1170, 28, 1, 1, IND2, CREAM);
      ctx.save(); ctx.globalAlpha = eo(seg(lt, 0.4, 0.8)); ctx.font = '700 30px Caladea'; ctx.textAlign = 'center'; ctx.fillStyle = CREAM;
      [['fish', 380, 1060], ['bow and arrow', 560, 1080], ['sun', 760, 1030]].forEach(([s, x, y], i) => { ctx.globalAlpha = eo(seg(lt, 0.4 + i * 0.45, 0.8 + i * 0.45)); ctx.fillText(s, x, y); });
      ctx.restore();
      glass(t);
    } });
  cue(b13 + 0.2, 'chisel', { gain: 0.35, pan: 0.2 }); cue(tBr - 0.1, 'sparkle', { gain: 0.5 });
}
