// v25 shared kit: "Storm Portolan & Wax Seal". Read fully before writing shots.
// Every scene is drawn on an old SEA CHART (portolan) of vellum lying on a dark table under a lamp: ink coastlines with
// hatched shore lines, radiating RHUMB LINES (red / green / black) from COMPASS ROSES, engraved wave lines, ink-drawn ships,
// faceless engraved figures. Devices: rhumb lines shoot out from a rose (rhumb), coastlines ink themselves in (coast),
// WIND GUSTS of curling ink streaks sweep across the chart (wind) — the recurring motif: the wind decides this story,
// RED WAX SEALS slam down and squash (stamp), the vellum BURNS through from a point (burn), ink BLOTS splatter (blot),
// the chart sheet LIFTS and flutters in the wind (sheet o.lift), the compass needle SPINS (rose o.spin), lightning-white flash.
// No faces, no portraits, no real writing or inscription text (labels are only our own short tags), no religious symbols
// (no crosses on flags: the Portuguese use plain RED pennants), no gore (violence = seals, blots, burn, flash).
// SIDES: Jaffna / Cankili = GREEN ink and green pennants; Portuguese = RED ink, red pennants; Thanjavur Nayak soldiers = OCHRE.
import { ctx, W, H, clamp, lerp, eo, eio, eob, rnd, TAU, ell, circle, rr, line } from './core/lib.js';
import { cached, rgba, mixc, lg } from './art.js';

export const PAL = {
  table: '#0B0D10', wood: '#1C1610', vellum: '#E8D7AF', vellumDk: '#C7AE78', vellumHi: '#F6EBCF', stain: '#A88452',
  ink: '#1B140E', sepia: '#5A3A1E', red: '#A8321F', redHi: '#D9583C', green: '#2F6B3A', greenHi: '#58A061', ochre: '#C98A2B',
  sea: '#8FB0AE', seaDk: '#45686A', storm: '#24323B', stormDk: '#121A20', wax: '#8E1B16', waxHi: '#C8402F', waxDk: '#4E0D0A',
  gold: '#C99A3B', lamp: '#FFC66B', white: '#FFFFFF',
};

// ---------- table + lamp (cached) ----------
export function table() {
  const c = cached('c_table', W, H, 0.5, () => {
    ctx.fillStyle = PAL.table; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(90,62,36,${0.03 + rnd(i) * 0.05})`; ctx.fillRect(0, rnd(i + 5) * H, W, 2 + rnd(i + 9) * 12); }
    const g = ctx.createRadialGradient(560, 700, 80, 540, 900, 1300); g.addColorStop(0, 'rgba(255,190,110,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  ctx.drawImage(c, 0, 0, W, H);
}
function vellumTex(w, h) {
  return cached('c_vel_' + w + 'x' + h, w, h, 0.5, () => {
    ctx.fillStyle = lg(0, 0, w, h, [[0, PAL.vellumHi], [0.5, PAL.vellum], [1, PAL.vellumDk]]); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = rnd(i) * w, y = rnd(i + 40) * h, r = 40 + rnd(i + 80) * 160; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(PAL.stain, 0.10 + rnd(i + 3) * 0.12)); g.addColorStop(0.8, rgba(PAL.stain, 0.04)); g.addColorStop(1, rgba(PAL.stain, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 400; i++) { ctx.fillStyle = rgba(PAL.sepia, 0.03 + rnd(i * 7) * 0.05); ctx.fillRect(rnd(i * 3) * w, rnd(i * 5) * h, 2, 2); }
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); v.addColorStop(0, 'rgba(60,35,10,0)'); v.addColorStop(1, 'rgba(60,35,10,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  });
}
// deckle (torn) edge outline of a sheet, deterministic
function deckle(x, y, w, h, seed = 0, j = 9) {
  ctx.beginPath(); const n = 40;
  for (let i = 0; i <= n; i++) ctx.lineTo(x + w * i / n, y + (rnd(i + seed) - 0.5) * j);
  for (let i = 0; i <= n; i++) ctx.lineTo(x + w + (rnd(i + seed + 50) - 0.5) * j, y + h * i / n);
  for (let i = n; i >= 0; i--) ctx.lineTo(x + w * i / n, y + h + (rnd(i + seed + 100) - 0.5) * j);
  for (let i = n; i >= 0; i--) ctx.lineTo(x + (rnd(i + seed + 150) - 0.5) * j, y + h * i / n);
  ctx.closePath();
}
// sheet(t, o): table + vellum chart sheet; returns inner rect {x,y,w,h} with the canvas CLIPPED to the sheet. Draw the scene,
// then ALWAYS call sheetTop(t, r). o: { x=50, y=110, w=980, h=1340, rot=0, sc=1, lift=0 (0..1 wind lift: sheet skews + flutters),
// ground: optional colour or [top,bottom] wash painted over the vellum (e.g. storm night: [PAL.storm, PAL.stormDk]), groundA=1, seed }
export function sheet(t, o = {}) {
  const x = o.x ?? 50, y = o.y ?? 110, w = o.w ?? 980, h = o.h ?? 1340, sd = o.seed ?? 3, lift = o.lift ?? 0;
  table();
  ctx.save();
  const cx = x + w / 2, cy = y + h / 2; ctx.translate(cx, cy); ctx.rotate((o.rot ?? 0) + lift * Math.sin(t * 7) * 0.012); ctx.scale(o.sc ?? 1, o.sc ?? 1);
  if (lift) ctx.transform(1, lift * 0.04 * Math.sin(t * 5.3), lift * 0.03 * Math.sin(t * 4.1), 1 - lift * 0.03 * (1 + Math.sin(t * 6)), 0, -lift * 10);
  ctx.translate(-cx, -cy);
  ctx.save(); ctx.translate(14, 18); deckle(x, y, w, h, sd); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); ctx.restore();
  deckle(x, y, w, h, sd); ctx.save(); ctx.clip(); ctx.drawImage(vellumTex(w, h), x, y, w, h);
  if (o.ground) { ctx.globalAlpha = o.groundA ?? 1; ctx.fillStyle = Array.isArray(o.ground) ? lg(0, y, 0, y + h, [[0, o.ground[0]], [1, o.ground[1]]]) : o.ground; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
  // neat double border of the chart
  ctx.strokeStyle = rgba(PAL.sepia, 0.7); ctx.lineWidth = 4; ctx.strokeRect(x + 26, y + 26, w - 52, h - 52); ctx.lineWidth = 1.5; ctx.strokeRect(x + 36, y + 36, w - 72, h - 72);
  return { x, y, w, h };
}
// sheetTop(t, r): lamp sheen + edge darkening + restores the clip/transform from sheet(). Always pair with sheet().
export function sheetTop(t, r, o = {}) {
  const g = ctx.createRadialGradient(r.x + r.w * 0.62, r.y + r.h * 0.3, 40, r.x + r.w * 0.5, r.y + r.h * 0.5, r.h * 0.8);
  g.addColorStop(0, `rgba(255,214,150,${0.16 * (o.lamp ?? 1) * (0.9 + 0.1 * Math.sin(t * 9))})`); g.addColorStop(1, 'rgba(30,15,0,0.25)');
  ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore(); // clip
  deckle(r.x, r.y, r.w, r.h, 3); ctx.strokeStyle = rgba(PAL.sepia, 0.6); ctx.lineWidth = 3; ctx.stroke();
  ctx.restore(); // transform
}

// ---------- chart devices ----------
// rhumb(cx, cy, R, p, o): radiating rhumb lines from a point, growing out with p 0..1. o: { n=32, a=0.8, rot=0, w=2 }
export function rhumb(cx, cy, R, p = 1, o = {}) {
  const n = o.n ?? 32, a = o.a ?? 0.8; if (p <= 0) return;
  for (let i = 0; i < n; i++) { const ang = (o.rot ?? 0) + i / n * TAU, col = i % 4 === 0 ? PAL.ink : i % 2 ? PAL.green : PAL.red, q = eo(clamp(p * 1.4 - (i % 4) * 0.1));
    ctx.strokeStyle = rgba(col, a * (i % 4 === 0 ? 0.9 : 0.6)); ctx.lineWidth = (o.w ?? 2) * (i % 4 === 0 ? 1.5 : 1);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R * q, cy + Math.sin(ang) * R * q); ctx.stroke(); }
}
// rose(x, y, r, t, o): compass rose (16 points, red/green/ink, gold ring) + optional needle. o: { spin=angle of needle (rad, 0 = north),
// needle=true, rot=0 rotation of the rose, a=1 }
export function rose(x, y, r, t = 0, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  circle(0, 0, r * 1.06, rgba(PAL.ink, 0.9)); circle(0, 0, r, PAL.vellumHi);
  ctx.strokeStyle = PAL.gold; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, TAU); ctx.stroke();
  for (let i = 0; i < 64; i++) { const a = i / 64 * TAU; line([[Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82], [Math.cos(a) * r * (i % 4 ? 0.87 : 0.92), Math.sin(a) * r * (i % 4 ? 0.87 : 0.92)]], PAL.ink, 2); }
  const pt = (a, L, wd, c1, c2) => { const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ca * L, sa * L); ctx.lineTo(px * wd, py * wd); ctx.closePath(); ctx.fillStyle = c1; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ca * L, sa * L); ctx.lineTo(-px * wd, -py * wd); ctx.closePath(); ctx.fillStyle = c2; ctx.fill(); };
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU - Math.PI / 2; if (i % 2) pt(a, r * 0.5, r * 0.07, PAL.green, PAL.greenHi); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2 + TAU / 16; if (i % 1 === 0) pt(a, r * 0.62, r * 0.09, PAL.red, PAL.redHi); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU - Math.PI / 2; pt(a, r * 0.8, r * 0.13, PAL.ink, PAL.sepia); }
  // fleur-ish north marker (plain diamond, no symbols)
  ctx.beginPath(); ctx.moveTo(0, -r * 1.2); ctx.lineTo(r * 0.08, -r * 1.05); ctx.lineTo(0, -r * 0.92); ctx.lineTo(-r * 0.08, -r * 1.05); ctx.closePath(); ctx.fillStyle = PAL.red; ctx.fill();
  if (o.needle !== false) { ctx.save(); ctx.rotate(o.spin ?? 0); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.75); ctx.lineTo(r * 0.06, 0); ctx.lineTo(0, r * 0.75); ctx.lineTo(-r * 0.06, 0); ctx.closePath(); ctx.fillStyle = PAL.ink; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.75); ctx.lineTo(r * 0.06, 0); ctx.lineTo(-r * 0.06, 0); ctx.closePath(); ctx.fillStyle = PAL.waxHi; ctx.fill(); ctx.restore(); }
  circle(0, 0, r * 0.07, PAL.gold); circle(0, 0, r * 0.035, PAL.ink);
  ctx.restore();
}
// coast(pts, p, o): an ink coastline drawn progressively (p 0..1) along pts [[x,y]...], with offshore hatch lines and an optional
// land fill once p > 0.85. o: { w=5, col=PAL.ink, land=null (fill colour), closed=false, hatch=true, hatchSide=1 (+1/-1 which side) }
export function coast(pts, p = 1, o = {}) {
  if (p <= 0 || pts.length < 2) return; const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  if (o.land && p > 0.85) { ctx.save(); ctx.globalAlpha *= clamp((p - 0.85) / 0.15); ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = o.land; ctx.fill(); ctx.restore(); }
  let left = tot * clamp(p / 0.85); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const d = L[i - 1]; if (d <= left) { out.push(pts[i]); left -= d; } else { const u = left / d; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); left = 0; } }
  if (o.hatch !== false) { const s = o.hatchSide ?? 1; for (let k = 1; k <= 3; k++) { ctx.save(); ctx.setLineDash([10, 8]); ctx.globalAlpha *= 0.35 / k;
    const off = out.map((q, i) => { const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1; return [q[0] - dy / m * 14 * k * s, q[1] + dx / m * 14 * k * s]; });
    line(off, PAL.seaDk, 3); ctx.restore(); } }
  line(out, o.col || PAL.ink, o.w ?? 5);
}
// Stylised chart geography in sheet coordinates (default sheet). Use these paths with coast(). Not to scale, chart-like.
// INDIA_TIP: south-east coast of India coming down the top-left; LANKA_N: the north of Sri Lanka with the Jaffna peninsula (top-right).
export const GEO = {
  INDIA: [[120, 160], [190, 300], [250, 430], [300, 560], [330, 650], [300, 720], [230, 760], [150, 790], [100, 820]],
  JAFFNA: [[520, 520], [600, 470], [700, 450], [800, 470], [880, 520], [900, 600], [860, 650], [780, 640], [720, 690], [760, 760], [840, 800], [940, 860], [980, 1000],
    [960, 1200], [900, 1380], [700, 1380], [640, 1200], [620, 1000], [580, 860], [500, 760], [460, 640]],
  NALLUR: [700, 560], POINT: [860, 500], STRAIT: [380, 640],
};
// wind(t, x0, y0, x1, y1, a, seed): a sweeping gust of curling ink streaks moving from left to right through the box (motif).
// o: { n=14, col=PAL.ink, dir=1 (-1 = right to left), speed=1 }
export function wind(t, x0, y0, x1, y1, a = 1, seed = 0, o = {}) {
  if (a <= 0) return; const n = o.n ?? 14, dir = o.dir ?? 1, sp = o.speed ?? 1;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const q = (t * (0.35 + rnd(i + seed) * 0.4) * sp + rnd(i * 5 + seed)) % 1, yy = lerp(y0, y1, rnd(i * 3 + seed)), len = 160 + rnd(i * 9 + seed) * 260;
    const hx = dir > 0 ? lerp(x0 - len, x1 + len, q) : lerp(x1 + len, x0 - len, q), fade = Math.sin(q * Math.PI);
    ctx.strokeStyle = rgba(o.col || PAL.ink, a * fade * (0.45 + rnd(i) * 0.4)); ctx.lineWidth = 3 + rnd(i + 2) * 5;
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20, x = hx - dir * len * u, y = yy + Math.sin(u * 5 + t * 3 + i) * 18 * u; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // curl at the head
    ctx.beginPath(); for (let k = 0; k <= 14; k++) { const ang = k / 14 * TAU * 0.85, rr2 = 26 * (1 - k / 18); ctx.lineTo(hx + dir * Math.sin(ang) * rr2, yy - 26 + Math.cos(ang) * rr2); } ctx.stroke();
  }
  ctx.restore();
}
// waves(x0, x1, y, t, o): engraved wave rows (little arcs) moving. o: { rows=4, gap=36, col=PAL.seaDk, a=0.7, storm=0 (0..1 taller, faster) }
export function waves(x0, x1, y, t, o = {}) {
  const rows = o.rows ?? 4, gap = o.gap ?? 36, st = o.storm ?? 0;
  for (let r = 0; r < rows; r++) { const yy = y + r * gap, amp = 8 + st * 22, sp = 40 + st * 160;
    ctx.strokeStyle = rgba(o.col || PAL.seaDk, (o.a ?? 0.7) * (1 - r * 0.12)); ctx.lineWidth = 3 + st * 2;
    for (let x = x0 - 80 + ((t * sp + r * 37) % 80); x < x1; x += 80) { ctx.beginPath(); ctx.arc(x, yy + Math.sin(t * 3 + x * 0.02) * st * 10, 30, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    void amp; }
}
// ship(x, y, s, t, o): ink-engraved ship. o: { kind='carrack' (Portuguese, 3 masts, red pennants) | 'boat' (Cankili's small sailing
// boat, green pennant), roll=0..1 (storm rolling), dir=1 (-1 faces left), sail=1 (0 furled .. 1 full, billowing), a=1 }
export function ship(x, y, s, t, o = {}) {
  const k = o.kind || 'carrack', roll = o.roll ?? 0.2, dir = o.dir ?? 1;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.scale(s * dir, s); ctx.rotate(Math.sin(t * 2.2) * 0.05 * (1 + roll * 4));
  const hullC = '#6B4A2A';
  if (k === 'carrack') {
    ctx.beginPath(); ctx.moveTo(-220, -60); ctx.lineTo(220, -80); ctx.lineTo(180, 10); ctx.quadraticCurveTo(0, 50, -180, 10); ctx.closePath(); ctx.fillStyle = hullC; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.stroke();
    for (let i = -3; i <= 3; i++) line([[i * 50, -50], [i * 50, 0]], PAL.ink, 3);
    ctx.fillStyle = hullC; ctx.fillRect(-230, -120, 80, 60); ctx.strokeRect(-230, -120, 80, 60); ctx.fillRect(150, -130, 70, 55); ctx.strokeRect(150, -130, 70, 55);
    for (const [mx, mh] of [[-110, 300], [20, 380], [130, 260]]) { line([[mx, -60], [mx, -60 - mh]], PAL.ink, 8);
      const sw = 80 + (o.sail ?? 1) * 20, bil = (o.sail ?? 1) * (24 + Math.sin(t * 4 + mx) * 8);
      for (const yy of [-60 - mh * 0.45, -60 - mh * 0.85]) { ctx.beginPath(); ctx.moveTo(mx - sw, yy - 70); ctx.quadraticCurveTo(mx + bil, yy - 35, mx - sw, yy); ctx.lineTo(mx + sw, yy); ctx.quadraticCurveTo(mx + sw + bil, yy - 35, mx + sw, yy - 70); ctx.closePath();
        ctx.fillStyle = PAL.vellumHi; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); }
      pennant(mx, -60 - mh, 70, t, PAL.red); }
  } else {
    ctx.beginPath(); ctx.moveTo(-120, -30); ctx.lineTo(120, -36); ctx.quadraticCurveTo(80, 20, 0, 24); ctx.quadraticCurveTo(-80, 20, -120, -30); ctx.closePath(); ctx.fillStyle = hullC; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.stroke();
    line([[0, -30], [0, -270]], PAL.ink, 7); const bil = (o.sail ?? 1) * (40 + Math.sin(t * 5) * 14);
    ctx.beginPath(); ctx.moveTo(0, -260); ctx.quadraticCurveTo(110 + bil, -150, 10, -44); ctx.lineTo(0, -44); ctx.closePath(); ctx.fillStyle = PAL.vellumHi; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke();
    pennant(0, -270, 60, t, PAL.green);
  }
  ctx.restore();
}
export function pennant(x, y, L, t, col) {
  ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k <= 10; k++) { const u = k / 10; ctx.lineTo(x + L * u, y + Math.sin(t * 8 + u * 4) * 8 * u + 6 * u); }
  for (let k = 10; k >= 0; k--) { const u = k / 10; ctx.lineTo(x + L * u, y + 22 * (1 - u) + Math.sin(t * 8 + u * 4) * 8 * u + 6 * u); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.stroke();
}
// stamp(x, y, r, p, o): red WAX SEAL slams down from above (p 0..0.35 falls, impact at 0.35 with squash + splash ring, then rests).
// o: { mark='ring' | 'cross' (an X, not a religious cross) | 'blank', col=PAL.wax, text=null (1-3 chars only, e.g. '?') }
export function stamp(x, y, r, p = 1, o = {}) {
  if (p <= 0) return; const f = clamp(p / 0.35), imp = clamp((p - 0.35) / 0.3), sq = p < 0.35 ? 1 : 1 + 0.25 * Math.sin(imp * Math.PI) * (1 - imp);
  const yy = y - (1 - eio(f)) * 700, sc = lerp(2.2, 1, eio(f)), col = o.col || PAL.wax;
  ctx.save(); ctx.translate(x, yy); ctx.scale(sc * sq, sc / sq);
  if (p >= 0.35) { ctx.strokeStyle = rgba(col, 0.6 * (1 - imp)); ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, r * (1.1 + imp * 0.8), 0, TAU); ctx.stroke(); }
  ctx.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr2 = r * (1 + (rnd(i + 7) - 0.5) * 0.16); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.save(); ctx.translate(8, 12); ctx.fill(); ctx.restore();
  ctx.fillStyle = lg(-r, -r, r, r, [[0, PAL.waxHi], [0.6, col], [1, PAL.waxDk]]); ctx.fill();
  ctx.strokeStyle = PAL.waxDk; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, TAU); ctx.stroke();
  const m = o.mark || 'ring';
  if (m === 'cross') { line([[-r * 0.35, -r * 0.35], [r * 0.35, r * 0.35]], PAL.waxDk, r * 0.12); line([[r * 0.35, -r * 0.35], [-r * 0.35, r * 0.35]], PAL.waxDk, r * 0.12); }
  if (m === 'ring') { ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, TAU); ctx.stroke(); }
  if (o.text) { ctx.font = `900 ${r * 0.7}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = PAL.waxDk; ctx.fillText(o.text, 0, r * 0.04); }
  ell(-r * 0.3, -r * 0.35, r * 0.25, r * 0.1, 'rgba(255,200,180,0.35)', -0.5);
  ctx.restore();
}
// burn(x, y, p, r, seed): the vellum burns through from (x, y): a growing ragged dark hole with a glowing ember rim (p 0..1, max radius r).
export function burn(x, y, p, r = 600, seed = 1) {
  if (p <= 0) return; const R = r * eo(p);
  const ring = (k) => { ctx.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, q = R * k * (0.78 + rnd(i + seed) * 0.3 + Math.sin(a * 5 + seed) * 0.05); ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); };
  ring(1.12); ctx.fillStyle = 'rgba(70,35,10,0.55)'; ctx.fill(); ring(1.04); ctx.fillStyle = '#FF9A3A'; ctx.fill(); ring(1); ctx.fillStyle = '#060504'; ctx.fill();
}
// blot(x, y, r, p, seed, col): ink blot splatter growing with p (drops fly out then land).
export function blot(x, y, r, p = 1, seed = 1, col = PAL.ink) {
  if (p <= 0) return; const q = eo(clamp(p * 1.6));
  ctx.beginPath(); for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU, rr2 = r * q * (0.7 + rnd(i + seed) * 0.5); ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  for (let i = 0; i < 14; i++) { const a = rnd(i * 3 + seed) * TAU, d = r * (1.2 + rnd(i + seed * 2) * 1.2) * eo(clamp(p * 2)); circle(x + Math.cos(a) * d, y + Math.sin(a) * d, 4 + rnd(i + 9) * 12, col); }
}
// figure(x, y, s, o): faceless engraved figure standing (feet at x, y; ~300px tall at s=1). o: { robe=PAL.green, hat='turban'|'helm'|'hood'|'crown'
// (a simple tall plain crown shape, for Cankili), walk=0 (phase, legs swing), t=0, arm=0 (-1..1 raises an arm), a=1, chain=false (wrists bound with a short rope) }
export function figure(x, y, s = 1, o = {}) {
  const t = o.t ?? 0, w = o.walk ? Math.sin(t * 8 + o.walk) * 0.35 : 0, robe = o.robe || PAL.green;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.scale(s, s);
  line([[0, -120], [-40 * Math.sin(w) - 10, 0]], PAL.ink, 22); line([[0, -120], [40 * Math.sin(w) + 10, 0]], PAL.ink, 22);
  ctx.beginPath(); ctx.moveTo(-50, -100); ctx.quadraticCurveTo(-56, -200, -36, -240); ctx.lineTo(36, -240); ctx.quadraticCurveTo(56, -200, 50, -100); ctx.closePath(); ctx.fillStyle = robe; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.stroke();
  for (let i = -2; i <= 2; i++) line([[i * 14, -230], [i * 18, -110]], rgba(PAL.ink, 0.35), 2);
  const ar = o.arm ?? 0; line([[36, -225], [70, -225 + 90 - ar * 180]], PAL.ink, 18); line([[-36, -225], [-60, -140]], PAL.ink, 18);
  if (o.chain) { ctx.strokeStyle = PAL.sepia; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -150, 40, 14, 0, 0, TAU); ctx.stroke(); }
  circle(0, -275, 38, PAL.ink); circle(0, -275, 32, '#8A6A4A');
  const hat = o.hat || 'turban';
  if (hat === 'turban') { ell(0, -300, 40, 20, PAL.ink); ell(0, -302, 34, 15, PAL.vellumHi); }
  if (hat === 'helm') { ctx.beginPath(); ctx.arc(0, -290, 40, Math.PI, 0); ctx.fillStyle = '#8C8C86'; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); line([[-56, -290], [56, -290]], PAL.ink, 7); }
  if (hat === 'hood') { ctx.beginPath(); ctx.arc(0, -280, 46, Math.PI * 0.9, Math.PI * 2.1); ctx.fillStyle = robe; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); }
  if (hat === 'crown') { ctx.beginPath(); ctx.moveTo(-34, -300); ctx.lineTo(-30, -350); ctx.lineTo(-12, -325); ctx.lineTo(0, -362); ctx.lineTo(12, -325); ctx.lineTo(30, -350); ctx.lineTo(34, -300); ctx.closePath(); ctx.fillStyle = PAL.gold; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); }
  ctx.restore();
}
// fort(x, y, s, o): chart-symbol castle/palace glyph (walls + towers + gate). o: { col=PAL.green (pennant colour), burning=0 (0..1 flames), t=0, fallen=0 (0..1 towers tilt/crumble) }
export function fort(x, y, s = 1, o = {}) {
  const t = o.t ?? 0, fl = o.fallen ?? 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = PAL.vellumHi; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6;
  ctx.fillRect(-160, -120, 320, 120); ctx.strokeRect(-160, -120, 320, 120);
  for (const tx of [-160, -20, 120]) { ctx.save(); ctx.translate(tx + 20, 0); ctx.rotate(fl * (tx < 0 ? -0.3 : 0.3) * (tx === -20 ? -1.4 : 1)); ctx.translate(0, fl * 30);
    ctx.fillRect(-28, -220, 56, 220); ctx.strokeRect(-28, -220, 56, 220); for (let k = -28; k < 28; k += 19) { ctx.fillRect(k, -244, 12, 24); ctx.strokeRect(k, -244, 12, 24); }
    line([[0, -244], [0, -320]], PAL.ink, 5); pennant(0, -320, 56, t, o.col || PAL.green); ctx.restore(); }
  ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(0, -40, 34, Math.PI, 0); ctx.lineTo(34, 0); ctx.lineTo(-34, 0); ctx.closePath(); ctx.fill();
  if (o.burning) for (let i = 0; i < 9; i++) { const fx = -150 + i * 37, h = (60 + rnd(i) * 90) * o.burning * (0.8 + 0.2 * Math.sin(t * 12 + i));
    ctx.beginPath(); ctx.moveTo(fx - 22, -110); ctx.quadraticCurveTo(fx - 10, -110 - h * 0.6, fx + Math.sin(t * 9 + i) * 10, -110 - h); ctx.quadraticCurveTo(fx + 10, -110 - h * 0.6, fx + 22, -110); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#FF8A1E' : '#FFD27A'; ctx.fill(); }
  ctx.restore();
}
// rope(x, y, s) and blade(x, y, s): two plain symbols for "hanged?" vs "beheaded?" (no bodies). o.rot
export function rope(x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(s, s); line([[0, -200], [0, -20]], PAL.sepia, 14);
  ctx.strokeStyle = PAL.sepia; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 40, 50, 64, 0, 0, TAU); ctx.stroke(); for (let i = 0; i < 4; i++) ell(0, -40 + i * 14, 18, 8, PAL.ink); ctx.restore(); }
export function blade(x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-14, -60); ctx.quadraticCurveTo(40, -170, 10, -300); ctx.quadraticCurveTo(-4, -170, -34, -60); ctx.closePath(); ctx.fillStyle = '#B9BDBF'; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.stroke();
  line([[-60, -60], [40, -60]], PAL.ink, 16); line([[-12, -60], [-12, 40]], PAL.sepia, 18); circle(-12, 50, 14, PAL.gold); ctx.restore(); }

// ---------- labels ----------
// tag(text, x, y, o): parchment RIBBON banner label with ink caps. o: { sc=1, rot=0, size=44, col=PAL.vellumHi, ink=PAL.ink }
// Standard tags: ILLUSTRATION, ACCOUNTS SAY, RECORD, DISPUTED, ONE VERSION, ANOTHER VERSION, LEGEND?, PORTUGUESE RECORDS
export function tag(text, x, y, o = {}) {
  const sc = o.sc ?? 1; if (sc <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(sc, sc);
  const size = o.size ?? 44; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '5px'; const w = ctx.measureText(text).width + 80, h = size + 36;
  const ribbon = (dx, dy) => { ctx.beginPath(); ctx.moveTo(-w / 2 - 40 + dx, -h / 2 + dy); ctx.lineTo(w / 2 + 40 + dx, -h / 2 + dy); ctx.lineTo(w / 2 + 10 + dx, dy); ctx.lineTo(w / 2 + 40 + dx, h / 2 + dy); ctx.lineTo(-w / 2 - 40 + dx, h / 2 + dy); ctx.lineTo(-w / 2 - 10 + dx, dy); ctx.closePath(); };
  ribbon(6, 9); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
  ribbon(0, 0); ctx.fillStyle = o.col || PAL.vellumHi; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = o.ink || PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
  ctx.restore(); ctx.letterSpacing = '0px';
}
// title(text, x, y, size, p, o): ink-lettered title written left to right with p 0..1 (each letter fades/settles in, small ink drip).
// o: { col=PAL.ink, font='Caladea' | 'Inter', stroke=PAL.vellumHi (halo) }
export function title(text, x, y, size, p = 1, o = {}) {
  ctx.save(); ctx.font = o.font === 'Inter' ? `900 ${size}px Inter` : `700 ${size}px Caladea`; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const chars = [...text], tw = ctx.measureText(text).width; let cx = x - tw / 2;
  chars.forEach((ch, i) => { const w = ctx.measureText(ch).width + 3, q = eo(clamp(p * (chars.length + 3) - i));
    if (q > 0) { ctx.save(); ctx.globalAlpha *= q; ctx.translate(cx + w / 2, y + 10 * (1 - q)); ctx.scale(1 + 0.3 * (1 - q), 1 + 0.3 * (1 - q));
      ctx.lineWidth = size * 0.16; ctx.strokeStyle = o.stroke || rgba(PAL.vellumHi, 0.9); ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0); ctx.fillStyle = o.col || PAL.ink; ctx.fillText(ch, 0, 0); ctx.restore(); }
    cx += w; });
  ctx.restore(); ctx.letterSpacing = '0px';
}
// flash(a, col): full-frame flash (lightning white or wax red).
export function flash(a, col = '#FFFFFF') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
// rain(t, a, seed): slanted storm rain streaks over the frame.
export function rain(t, a = 0.6, seed = 0) { if (a <= 0) return; ctx.save(); ctx.strokeStyle = `rgba(220,230,235,${a * 0.5})`; ctx.lineWidth = 3;
  for (let i = 0; i < 120; i++) { const x = (rnd(i + seed) * (W + 400) + t * 900) % (W + 400) - 200, y = (rnd(i * 3 + seed) * H + t * 2200) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 40, y - 90); ctx.stroke(); } ctx.restore(); }
// lightning(x, y0, y1, seed, a): forked bolt
export function lightning(x, y0, y1, seed = 1, a = 1) { if (a <= 0) return; const pts = [[x, y0]]; let cx = x; for (let i = 1; i <= 10; i++) { cx += (rnd(i + seed) - 0.5) * 120; pts.push([cx, lerp(y0, y1, i / 10)]); }
  ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = '#DDEEFF'; ctx.shadowBlur = 30; line(pts, '#FFFFFF', 8); ctx.restore(); }
export { mixc, rgba, lg };
