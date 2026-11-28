// v28 shared kit: "Indigo Batik & Wax Crackle". READ FULLY before writing shots.
// Every scene is a hand-dyed BATIK CLOTH: deep indigo cotton with a visible weave, cream WAX-RESIST line art, dye colour blooms that
// spread with ragged edges, and fine CRACKLE veins (where the dye seeped into cracked wax). The cloth gently SWAYS (it hangs on a line).
// Devices: wax lines drawing themselves with a hot glowing tjanting tip (wax), wax drips (drips), dye blooms (bloom), dye-bath FLOOD wipes
// from the bottom with a wavy edge (flood), crackle spreading across a shape (crackle), cloth ripple shake (ripple), madder-red war dye.
// RECURRING MOTIF ("watch the moon"): a cream wax FULL MOON (moon). In the poem's lament the second moon is CRACKED and stained madder red.
// Colour code: Pari = WAX cream; Chera = GREEN; Chola = TURMERIC; Pandya = TEAL; Kapilar (poet) = OCHRE; the daughters = ROSE;
// Avvaiyar = LAVENDER; war / killing / siege = MADDER red; tags = cream wax on a dark patch.
// No faces (figures are faceless silhouettes with a wax outline), no portraits, no real writing or inscription text (only our short tags;
// a poem / palm-leaf is shown as abstract wavy wax lines), no religious symbols, temples or deities, no gore (a death = a figure's wax
// outline cracking and the figure fading into madder dye; fallen crown / spear).
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { cached, rgba } from './art.js';

export const PAL = {
  indigo: '#1A2A63', indigoDk: '#0B1438', indigoLt: '#2F4A93', night: '#070C24',
  wax: '#F2E4C0', waxHi: '#FFF8E4', waxDk: '#C8B48A',
  madder: '#B8322A', madderHi: '#E8594A', turmeric: '#E3A62A', green: '#4F9A52', teal: '#3FA8B5',
  ochre: '#C9873F', rose: '#E39A8E', lavender: '#A890D6', ink: '#050817',
};
const SANS = 'Inter, Arial, sans-serif';

// ---------- helpers ----------
export const pop = (lt, t0, d = 0.3) => eob(clamp((lt - t0) / d));
export function shk(lt, t0, amp, dur = 0.5) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return [0, 0]; const a = amp * k * k; return [Math.sin(lt * 93) * a, Math.cos(lt * 71) * a]; }
/** translate by a shake offset with a slight over-scale so cloth edges never show */
export function shake(sh) { ctx.translate(540, 900); ctx.scale(1.05, 1.05); ctx.translate(-540 + sh[0], -900 + sh[1]); }
export function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
/** first fraction p of a polyline (by length) */
export function part(pts, p) {
  let tot = 0; const Ls = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  let left = tot * clamp(p); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Ls[i - 1]; if (d <= left) { out.push(pts[i]); left -= d; } else { const u = left / d; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); left = 0; } }
  return out;
}
export const circPts = (x, y, r, n = 48, a0 = -Math.PI / 2) => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos(a0 + i / n * TAU) * r, y + Math.sin(a0 + i / n * TAU) * r]);
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
/** a wobbly hand-drawn version of a polyline (seeded, stable) */
export function wob(pts, amp = 3, seed = 1) { return pts.map((p, i) => [p[0] + (rnd(i * 7 + seed) - 0.5) * amp * 2, p[1] + (rnd(i * 11 + seed * 3) - 0.5) * amp * 2]); }

// ---------- the cloth ----------
function clothImg(tone) {
  return cached('b_cloth_' + tone, W, H, 0.5, () => {
    const base = { indigo: PAL.indigo, night: PAL.night, madder: '#4A1218', dawn: '#2B2E66' }[tone] || PAL.indigo;
    const g = ctx.createRadialGradient(540, 820, 100, 540, 900, 1250);
    g.addColorStop(0, tone === 'night' ? '#0F1840' : PAL.indigoLt); g.addColorStop(0.5, base); g.addColorStop(1, PAL.indigoDk);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (tone === 'madder') { ctx.fillStyle = 'rgba(150,30,30,0.45)'; ctx.fillRect(0, 0, W, H); }
    // weave: fine warp + weft threads
    for (let y = 0; y < H; y += 4) { ctx.fillStyle = `rgba(255,255,255,${0.012 + rnd(y) * 0.02})`; ctx.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x += 4) { ctx.fillStyle = `rgba(0,0,0,${0.03 + rnd(x + 9) * 0.04})`; ctx.fillRect(x, 0, 1, H); }
    // uneven dye mottling
    for (let i = 0; i < 70; i++) { const x = rnd(i * 3) * W, y = rnd(i * 5 + 1) * H, r = 60 + rnd(i * 7) * 240;
      const m = ctx.createRadialGradient(x, y, 0, x, y, r); m.addColorStop(0, rnd(i) > 0.5 ? 'rgba(0,0,20,0.18)' : 'rgba(90,120,200,0.07)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = m; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    // crackle veins (dye that seeped through cracked wax)
    crackleRaw(0, 0, W, H, 77, 'rgba(10,20,70,0.55)', 160, 1.2);
    crackleRaw(0, 0, W, H, 13, 'rgba(120,150,230,0.10)', 90, 1);
    // border: a wax-resist stripe band top and bottom
    for (const y0 of [0, H - 46]) { ctx.fillStyle = 'rgba(242,228,192,0.10)'; ctx.fillRect(0, y0, W, 46);
      for (let x = 10; x < W; x += 54) { ctx.beginPath(); ctx.arc(x, y0 + 23, 9, 0, TAU); ctx.fillStyle = 'rgba(242,228,192,0.22)'; ctx.fill(); } }
  });
}
function crackleRaw(x0, y0, w, h, seed, col, n, lw) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    let x = x0 + rnd(i * 13 + seed) * w, y = y0 + rnd(i * 17 + seed * 2) * h, a = rnd(i * 19 + seed) * TAU;
    ctx.beginPath(); ctx.moveTo(x, y);
    const k = 4 + Math.floor(rnd(i + seed * 5) * 6);
    for (let j = 0; j < k; j++) { a += (rnd(i * 31 + j + seed) - 0.5) * 1.6; const L = 14 + rnd(i * 37 + j) * 40; x += Math.cos(a) * L; y += Math.sin(a) * L; ctx.lineTo(x, y); }
    ctx.stroke();
  }
}
/** the background cloth. tone 'indigo' | 'night' | 'madder' (war-stained) | 'dawn'. It sways slightly (sway px). */
export function cloth(lt, o = {}) {
  const sw = o.sway ?? 6; const dx = Math.sin(lt * 0.9) * sw, dy = Math.sin(lt * 0.6 + 1) * sw * 0.5;
  ctx.save(); ctx.translate(dx - 20, dy - 20); ctx.scale((W + 40) / W, (H + 40) / H);
  ctx.drawImage(clothImg(o.tone || 'indigo'), 0, 0, W, H); ctx.restore();
  // soft fold shading that moves
  ctx.save(); ctx.globalAlpha = 0.18;
  for (let i = 0; i < 4; i++) { const x = ((i * 300 + lt * 25) % 1400) - 160; const g = ctx.createLinearGradient(x - 120, 0, x + 120, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,10,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 120, -50, 240, H + 100); }
  ctx.restore();
}
/** crackle veins spreading over a box (p 0..1 how much has cracked), colour col */
export function crackle(x, y, w, h, p, seed = 1, col = PAL.madder, lw = 2.5) {
  if (p <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const n = Math.floor(40 * clamp(p)); crackleRaw(x, y, w, h, seed, rgba(col, 0.85), n, lw); ctx.restore();
}

// ---------- wax line work ----------
/** a WAX line drawing itself (p 0..1) with a glowing hot tjanting tip. o: {col, w, close, fill(colour or null), tip, a} */
export function wax(pts, p = 1, o = {}) {
  if (p <= 0 || pts.length < 2) return;
  const col = o.col || PAL.wax, w = o.w ?? 10, a = o.a ?? 1, q = part(pts, p);
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.fill && p >= 1) { ctx.beginPath(); pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.closePath(); ctx.fillStyle = o.fill; ctx.fill(); }
  ctx.beginPath(); q.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); if (o.close && p >= 1) ctx.closePath();
  ctx.strokeStyle = 'rgba(0,0,10,0.35)'; ctx.lineWidth = w + 6; ctx.stroke();     // dye halo around the resist
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = Math.max(1, w * 0.25); ctx.stroke();
  ctx.restore();
  if ((o.tip ?? true) && p < 1) { const e = q[q.length - 1]; glow(e[0], e[1], 40, '#FFE7A8', 0.8 * a); ctx.beginPath(); ctx.arc(e[0], e[1], w * 0.7, 0, TAU); ctx.fillStyle = PAL.waxHi; ctx.fill(); }
}
/** wax drips falling from (x, y): started at t0, n drops */
export function drips(x, y, lt, t0, n = 5, seed = 1, col = PAL.wax) {
  for (let i = 0; i < n; i++) { const u = lt - t0 - i * 0.12; if (u < 0) continue; const fall = Math.min(1, u / 0.5);
    const dx = (rnd(i + seed) - 0.5) * 120, yy = y + eo(fall) * (120 + rnd(i * 3 + seed) * 200);
    ctx.beginPath(); ctx.ellipse(x + dx, yy, 7 + 4 * fall, 9 - 3 * fall, 0, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
}
/** a DYE BLOOM: colour spreading from (x, y) to radius r with a ragged edge (p 0..1) */
export function bloom(x, y, r, p, col, a = 0.75, seed = 1) {
  if (p <= 0) return; const R = r * eo(clamp(p)); ctx.save(); ctx.globalAlpha *= a; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU, rr = R * (0.82 + 0.18 * rnd(i * 5 + seed)); const px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, col); g.addColorStop(0.8, col); g.addColorStop(1, rgba(col, 0.4));
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
}
/** DYE-BATH FLOOD wipe: colour rises from the bottom (p 0..1 covers the frame) with a wavy edge. Use as a transition. */
export function flood(p, col = PAL.madder, lt = 0, a = 1) {
  if (p <= 0) return; const y = H + 80 - (H + 260) * eio(clamp(p));
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.moveTo(-60, H + 60);
  for (let x = -60; x <= W + 60; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.012 + lt * 5) * 26 + Math.sin(x * 0.031) * 12);
  ctx.lineTo(W + 60, H + 60); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = rgba(PAL.wax, 0.5); ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
}
/** full-frame flash */
export function flash(a, col = '#FFF4DE') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
/** dark vignette */
export function vignette(a = 0.6) { const g = ctx.createRadialGradient(540, 860, 300, 540, 900, 1200); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(2,4,16,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }

// ---------- the MOTIF ----------
/** the wax FULL MOON. o: {p draw-in, crack 0..1 (madder crackle + split), col, glow, stain 0..1 (madder dye fills it)} */
export function moon(x, y, r, o = {}) {
  const p = o.p ?? 1; glow(x, y, r * 2.4, '#F6E7B8', 0.25 * (o.glow ?? 1) * p);
  if (p >= 1) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = o.col || PAL.wax; ctx.fill();
    // inner batik pattern: concentric dotted rings
    for (let k = 1; k <= 3; k++) for (let i = 0; i < 12 + k * 6; i++) { const an = i / (12 + k * 6) * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(an) * r * k * 0.24, y + Math.sin(an) * r * k * 0.24, r * 0.025, 0, TAU); ctx.fillStyle = 'rgba(160,130,80,0.5)'; ctx.fill(); }
    if (o.stain) bloom(x, y, r * 1.02, o.stain, PAL.madder, 0.8, 9);
    crackle(x - r, y - r, 2 * r, 2 * r, 0.6, 21, PAL.waxDk, 1.4);
  }
  wax(circPts(x, y, r, 60), p, { w: 8 });
  if (o.crack) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); crackle(x - r, y - r, 2 * r, 2 * r, o.crack, 5, PAL.madder, 4);
    const pts = [[x - r * 0.1, y - r], [x + r * 0.12, y - r * 0.4], [x - r * 0.08, y + r * 0.1], [x + r * 0.15, y + r * 0.55], [x - r * 0.02, y + r]];
    wax(pts, o.crack, { col: PAL.madder, w: 9, tip: false }); ctx.restore(); }
}

// ---------- scenery ----------
/** PARAMBU HILL: a rounded batik hill from x0..x1, base y, height h, with stepped terraces, wax outline, dotted villages (dots 0..1 lit) */
export function hill(x0, x1, y, h, p = 1, o = {}) {
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([lerp(x0, x1, u), y - h * Math.pow(Math.sin(u * Math.PI), 0.8) * (0.92 + 0.08 * Math.sin(u * 17))]); }
  if (p >= 1) { ctx.beginPath(); pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.closePath();
    ctx.fillStyle = o.fill || '#14245A'; ctx.fill();
    ctx.save(); ctx.clip(); for (let k = 1; k < 6; k++) { const yy = y - h * k / 6; const q = []; for (let i = 0; i <= 30; i++) q.push([lerp(x0, x1, i / 30), yy + Math.sin(i * 0.9 + k) * 10]); wax(q, 1, { w: 3, a: 0.35, tip: false }); }
    if (o.stain) bloom((x0 + x1) / 2, y - h * 0.4, (x1 - x0) * 0.6, o.stain, PAL.madder, 0.6, 3);
    ctx.restore();
    const n = o.villages ?? 24, lit = o.dots ?? 0; for (let i = 0; i < n * clamp(lit); i++) { const u = 0.12 + rnd(i * 3) * 0.76, hh = h * Math.pow(Math.sin(u * Math.PI), 0.8) * (0.15 + rnd(i * 7) * 0.65);
      const vx = lerp(x0, x1, u), vy = y - hh; glow(vx, vy, 22, '#FFE7A8', 0.5); ctx.beginPath(); ctx.arc(vx, vy, 6, 0, TAU); ctx.fillStyle = PAL.waxHi; ctx.fill(); } }
  wax(pts, p, { w: 9 });
}
/** a JASMINE CREEPER climbing from (x, y) upward to height h (p grows it; flowers bloom at the end) */
export function creeper(x, y, h, p, lt = 0, o = {}) {
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([x + Math.sin(u * 9 + lt * 0.8) * 26 * u + (o.lean || 0) * u * h, y - u * h]); }
  wax(pts, p, { col: PAL.green, w: 7 });
  const q = part(pts, p);
  for (let i = 3; i < q.length; i += 3) { const [px, py] = q[i], s = i % 2 ? 1 : -1;
    ctx.beginPath(); ctx.ellipse(px + s * 22, py, 18, 8, s * 0.5, 0, TAU); ctx.fillStyle = PAL.green; ctx.fill();
    const fb = clamp((p - i / 40) * 4); if (fb > 0) for (let k = 0; k < 5; k++) { const an = k / 5 * TAU + i; ctx.beginPath(); ctx.arc(px - s * 16 + Math.cos(an) * 8 * fb, py - 10 + Math.sin(an) * 8 * fb, 5 * fb, 0, TAU); ctx.fillStyle = PAL.waxHi; ctx.fill(); } }
}
/** a simple CHARIOT in wax line (side view), wheel turning with lt; o: {col, p} */
export function chariot(x, y, s = 1, lt = 0, o = {}) {
  const col = o.col || PAL.wax, p = o.p ?? 1; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  wax(rectPts(-150, -170, 260, 110), p, { col, w: 8, fill: p >= 1 ? 'rgba(242,228,192,0.18)' : null });
  wax([[-150, -170], [-170, -260], [-60, -250]], p, { col, w: 7 });           // canopy
  wax([[110, -90], [260, -110]], p, { col, w: 8 });                            // pole
  const r = 70; wax(circPts(-20, -30, r, 40), p, { col, w: 9 });
  for (let k = 0; k < 8; k++) { const an = k / 8 * TAU + lt * 2.5; wax([[-20, -30], [-20 + Math.cos(an) * r, -30 + Math.sin(an) * r]], p, { col, w: 4, tip: false }); }
  ctx.restore();
}
/** faceless FIGURE (feet at x, y; standing height ~ 300*s). o: {col, p, crown, bow, spear, arm (raise 0..1), sit, kneel, a, dead (0..1 cracks+fades)} */
export function figure(x, y, s = 1, o = {}) {
  const col = o.col || PAL.wax, p = o.p ?? 1, a = (o.a ?? 1) * (1 - 0.7 * (o.dead || 0));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  const hy = o.sit ? -200 : o.kneel ? -210 : -270;
  // body: a tunic shape filled with dye + wax outline
  const body = o.sit ? [[-40, hy + 40], [40, hy + 40], [55, -90], [90, -80], [90, 0], [60, 0], [50, -40], [-50, -40], [-55, hy + 40]]
    : [[-38, hy + 40], [38, hy + 40], [62, -110], [30, -110], [26, 0], [6, 0], [0, -100], [-6, 0], [-26, 0], [-30, -110], [-62, -110]];
  if (p >= 1) { ctx.beginPath(); body.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.closePath(); ctx.fillStyle = rgba(col, 0.55); ctx.fill(); }
  wax([...body, body[0]], p, { col, w: 7 });
  wax(circPts(0, hy, 34, 30), p, { col, w: 7, fill: p >= 1 ? rgba(col, 0.55) : null });
  const ar = o.arm ?? 0; wax([[30, hy + 55], [30 + 60 * (1 - ar), hy + 140 - 200 * ar]], p, { col, w: 8 });
  wax([[-30, hy + 55], [-60, hy + 140]], p, { col, w: 8 });
  if (o.crown) wax([[-30, hy - 30], [-30, hy - 68], [-15, hy - 48], [0, hy - 76], [15, hy - 48], [30, hy - 68], [30, hy - 30]], p, { col: o.crownCol || PAL.turmeric, w: 7 });
  if (o.bow) wax(Array.from({ length: 21 }, (_, i) => { const u = i / 20 - 0.5; return [-80 + Math.cos(u * 2.2) * -30, hy + 90 + u * 220]; }), p, { col, w: 6 });
  if (o.spear) wax([[70, -10], [70, hy - 120]], p, { col, w: 6 });
  if (o.dead) crackle(-100, hy - 80, 200, 400, o.dead, 3, PAL.madder, 3);
  ctx.restore();
}
/** a KING of one of the three crowns, with his dynastic emblem on a banner: emblem 'bow' (Chera) | 'tiger' (Chola) | 'fish' (Pandya) */
export const KCOL = { bow: PAL.green, tiger: PAL.turmeric, fish: PAL.teal };
export function king(x, y, s, emblem, o = {}) {
  const col = KCOL[emblem]; figure(x, y, s, { ...o, col, crown: true, crownCol: col });
  const p = o.p ?? 1; ctx.save(); ctx.translate(x - 110 * s, y - 380 * s); ctx.scale(s, s);
  wax([[0, 260], [0, -40]], p, { col: PAL.wax, w: 6 });
  const fl = Math.sin((o.lt || 0) * 4) * 8; wax([[0, -40], [90, -30 + fl], [90, 40 + fl], [0, 30]], p, { col, w: 6, fill: p >= 1 ? rgba(col, 0.8) : null, close: true });
  if (p >= 1) emblemMark(45, 2 + fl, 26, emblem);
  ctx.restore();
}
/** the small emblem glyph (wax): bow / tiger stripes / two fish */
export function emblemMark(x, y, r, emblem) {
  ctx.save(); ctx.translate(x, y);
  if (emblem === 'bow') { wax(Array.from({ length: 13 }, (_, i) => { const u = i / 12 - 0.5; return [-r * 0.3 + Math.cos(u * 2.4) * r * 0.5, u * r * 1.6]; }), 1, { w: 4, tip: false }); wax([[r * 0.2, -r * 0.8], [r * 0.2, r * 0.8]], 1, { w: 2, tip: false }); }
  else if (emblem === 'tiger') { for (let k = -1; k <= 1; k++) wax([[k * r * 0.5 - 6, -r * 0.7], [k * r * 0.5 + 6, 0], [k * r * 0.5 - 6, r * 0.7]], 1, { w: 4, col: PAL.ink, tip: false }); }
  else { for (const sy of [-1, 1]) { wax([[-r * 0.8, sy * r * 0.35], [-r * 0.1, sy * r * 0.55], [r * 0.5, sy * r * 0.35], [r * 0.8, sy * r * 0.6], [r * 0.8, sy * r * 0.1], [r * 0.5, sy * r * 0.35]], 1, { w: 3, tip: false }); } }
  ctx.restore();
}
/** rows of an ARMY: n spearmen in dye colour col from x0..x1 at y (march offset scroll px), s scale */
export function army(x0, x1, y, n, lt, o = {}) {
  const col = o.col || PAL.madder, s = o.s ?? 0.45;
  for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : 0.5; const bob = Math.abs(Math.sin(lt * 6 + i)) * 8;
    figure(lerp(x0, x1, u) + (o.march || 0), y - bob, s, { col, spear: true, p: o.p ?? 1, a: o.a ?? 1 }); }
}
/** a PALM-LEAF / poem shown as a long leaf with ABSTRACT wavy wax lines (never real text) */
export function leaf(x, y, w, h, p = 1, lt = 0, o = {}) {
  const x0 = x - w / 2, y0 = y - h / 2;
  wax(rectPts(x0, y0, w, h), p, { w: 7, fill: p >= 1 ? 'rgba(201,135,63,0.55)' : null, col: o.col || PAL.wax });
  for (let i = 0; i < (o.rows ?? 3); i++) { const yy = y0 + h * (i + 1) / ((o.rows ?? 3) + 1), pts = [];
    for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push([x0 + 30 + u * (w - 60), yy + Math.sin(u * 22 + i * 1.7 + lt * 2) * 5]); }
    wax(pts, clamp(p * 1.5 - 0.3 - i * 0.1), { w: 3, tip: false, col: PAL.ink }); }
  ctx.beginPath(); ctx.arc(x0 + 26, y, 7, 0, TAU); ctx.fillStyle = PAL.ink; ctx.fill();
}
/** siege ring: a dashed madder circle closing around (x, y) radius r (p 0..1 closes it) */
export function ring(x, y, r, p, lt = 0, col = PAL.madder) {
  const n = 36; for (let i = 0; i < n * clamp(p); i++) { const a0 = -Math.PI / 2 + i / n * TAU + lt * 0.2; const a1 = a0 + TAU / n * 0.6;
    wax([[x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos(a1) * r, y + Math.sin(a1) * r]], 1, { col, w: 12, tip: false }); }
}

// ---------- labels ----------
/** a stitched-cloth TAG: dark patch, dashed stitching, cream wax letters. Our short tags ONLY. */
export function tag(text, x, y, size = 46, o = {}) {
  const s = o.s ?? 1; if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.font = `900 ${size}px ${SANS}`; ctx.letterSpacing = `${size * 0.08}px`; const tw = ctx.measureText(text).width, pw = tw + size * 1.2, ph = size * 1.6;
  ctx.fillStyle = o.bg || 'rgba(5,8,23,0.85)'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 10); ctx.fill();
  ctx.setLineDash([12, 9]); ctx.strokeStyle = o.col || PAL.wax; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-pw / 2 + 8, -ph / 2 + 8, pw - 16, ph - 16, 6); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.col || PAL.wax; ctx.fillText(text, 0, size * 0.04);
  ctx.restore(); ctx.letterSpacing = '0px';
}
/** big WAX TITLE letters with a dye halo and crackle; p reveals left to right */
export function title(text, x, y, size, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.s ?? 1, o.s ?? 1);
  ctx.font = `900 ${size}px ${SANS}`; ctx.letterSpacing = `${size * 0.04}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width; ctx.beginPath(); ctx.rect(-tw / 2 - 20, -size, (tw + 40) * clamp(p), size * 2); ctx.clip();
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = 'rgba(5,8,23,0.9)'; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = o.col || PAL.wax; ctx.fillText(text, 0, 0);
  crackle(-tw / 2, -size / 2, tw, size, 0.5, 8, o.crackCol || PAL.indigo, 1.5);
  ctx.restore(); ctx.letterSpacing = '0px';
}
