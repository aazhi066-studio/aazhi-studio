// EPISODE 16 · worker B : "Soot-Etched Palm Leaves", lines 4-7 (L(4) -> L(8)).
//   b1  stylus etches abstract verse rows across a leaf, soot rub turns them black
//   b2  the bundle fans out into an arc on the desk; NANDI KALAMBAKAM title bar
//   b3  curse ink: strokes inside the fan turn sindoor red and creep like veins, heartbeat; A HIDDEN CURSE?
//   b4  one leaf close-up, the red strokes glow and pulse; ARAM
//   b5  seated faceless king listens to a robed reader, etched lamp burns between them
//   b6  leaf flip on the cord: stylus etches the king large; LEGEND stamp
//   b7  long leaf: a row of eight pavilions etched in perspective, the king walks to the first
//   b8  VERSE 1: the first pavilion roof ignites
//   b9  he moves to the next: it ignites, VERSE 2
//   b10 and the next: pavilions ignite one after another, camera tracks and pulls back
//   b11 the last pavilion, the last leaf in the reader's hand, flames rising around; LAST VERSE
//   b12 EDGE BURN: the leaf showing the king chars inward and swallows him; red flash; THE STORY SAYS
// Leaves, etched art and the pavilion row are baked once with cached(); per frame only blits, a stylus, soot bands,
// flames and embers. No shadowBlur anywhere.
import { ctx, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, poly, smoke, dust } from './art.js';
import { flame, glow, lamp } from './core/kit.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const E = { desk: '#120A05', ink: '#2A1606', soot: '#0E0703', ash: '#F1E6CC', tur: '#E0A526', red: '#C0331F', ind: '#2D3A6B' };
const ROBE = '#D9A03A', LIMB = '#DDAE55', BLANK = '#E6C589', THATCH = '#CFA25A', WOOD = '#C99C55';

// ───────────── shared palm leaf (copied exactly from ART.md) ─────────────
function palmLeaf(x, y, w, h, rot = 0, tone = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, tone ? '#C89A52' : '#E6C27C'); g.addColorStop(0.5, tone ? '#B88A45' : '#D9B36C'); g.addColorStop(1, '#A8782F');
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); ctx.lineTo(w / 2 - h, -h / 2); ctx.quadraticCurveTo(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); ctx.lineTo(-w / 2 + h, h / 2); ctx.quadraticCurveTo(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const yy = -h / 2 + (h * i) / 6; ctx.beginPath(); ctx.moveTo(-w / 2 + h, yy); ctx.lineTo(w / 2 - h, yy); ctx.stroke(); }
  ctx.fillStyle = '#120A05'; for (const hx of [-w * 0.3, w * 0.3]) { ctx.beginPath(); ctx.arc(hx, 0, h * 0.09, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// ───────────── small helpers ─────────────
/** draw local columns [u0,u1) (and rows [v0,v1)) of cached canvas c whose local (ox,oy) sits at (X,Y) */
function part(c, ox, oy, X, Y, u0, u1, a = 1, v0 = 0, v1 = null) {
  const q = c._q, cw = c.width / q, ch = c.height / q; u0 = Math.max(0, u0); u1 = Math.min(cw, u1); v0 = Math.max(0, v0); v1 = Math.min(ch, v1 ?? ch);
  if (u1 <= u0 || v1 <= v0 || a <= 0) return;
  const pa = ctx.globalAlpha; ctx.globalAlpha = pa * a;
  ctx.drawImage(c, u0 * q, v0 * q, (u1 - u0) * q, (v1 - v0) * q, X - ox + u0, Y - oy + v0, u1 - u0, v1 - v0);
  ctx.globalAlpha = pa;
}
const beat = (t, per = 0.85) => { const x = ((t % per) + per) % per; return Math.exp(-x * x / 0.003) + 0.6 * Math.exp(-((x - 0.2) ** 2) / 0.003); };
function stroke(col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
function pl(pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); }

// desk + caption calm band
const deskC = () => cached('bdesk', 1080, 1920, 0.5, () => {
  ctx.fillStyle = E.desk; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 70; i++) {
    const y0 = rnd(i + 3) * 1920; ctx.beginPath();
    for (let x = 0; x <= 1080; x += 40) { const y = y0 + sin(x * 0.004 + i) * 18 + sin(x * 0.013 + i * 2) * 5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = rnd(i) > 0.5 ? 'rgba(70,40,18,0.45)' : 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1 + rnd(i + 1) * 3; ctx.stroke();
  }
});
function desk(t, lx = 540, ly = 640, la = 0.22) {
  blit(deskC(), 540, 960, 540, 960, 1.35);
  glow(lx, ly, 820, '255,160,70', la * (0.93 + 0.07 * sin(t * 9) * sin(t * 5.3)));
}
const calmC = () => cached('bcalm', 4, 640, 1, () => { const g = ctx.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, 'rgba(6,3,1,0)'); g.addColorStop(0.13, 'rgba(6,3,1,0.62)'); g.addColorStop(1, 'rgba(6,3,1,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 640); });
function calm() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(calmC(), 0, 1280, 1080, 640); ctx.restore(); }

// big close-up leaf (flat part covers the frame); local origin = (740, h/2+20) -> screen (540, cy)
function leafTex(cx, cy, w, h, seed) {
  for (let i = 0; i < 80; i++) { const y = cy + (rnd(i + seed) - 0.5) * h * 0.86, x0 = rnd(i * 3 + seed) * w, len = 80 + rnd(i * 5 + seed) * 380; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + len, y + (rnd(i + 7) - 0.5) * 4); stroke(`rgba(110,70,25,${0.08 + rnd(i + 2) * 0.16})`, 1 + rnd(i + 4) * 2.5); }
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(rnd(i * 11 + seed) * w, cy + (rnd(i * 13 + seed) - 0.5) * h * 0.7, 30 + rnd(i) * 90, 14 + rnd(i + 1) * 30, 0, 0, TAU); ctx.fillStyle = 'rgba(95,55,15,0.04)'; ctx.fill(); }
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, cy + s * (h / 2 - 5)); ctx.lineTo(w, cy + s * (h / 2 - 5)); stroke('rgba(100,60,18,0.3)', 8); }
}
const bigLeaf = (h, tone = 0) => cached('bbl' + h + tone, 1480, h + 40, 0.6, () => { palmLeaf(740, h / 2 + 20, 1480 + 2 * h, h, 0, tone); leafTex(0, h / 2 + 20, 1480, h, h); });
const bigSoot = (h) => cached('bbs' + h, 1480, h + 40, 0.3, () => { palmLeaf(740, h / 2 + 20, 1480 + 2 * h, h); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = E.soot; ctx.fillRect(0, 0, 1480, h + 40); ctx.globalCompositeOperation = 'source-over'; });
const leafAt = (h, cy, tone = 0) => blit(bigLeaf(h, tone), 740, h / 2 + 20, 540, cy);
/** soot rub band at screen x sx on a big leaf: faint residue behind, dark smudge at the front */
function sootBand(h, cy, sx, a = 1) {
  const c = bigSoot(h), u = sx + 200;
  part(c, 740, h / 2 + 20, 540, cy, 0, u, 0.1 * a);
  for (let j = 0; j < 12; j++) part(c, 740, h / 2 + 20, 540, cy, u - 14 * (j + 1), u - 14 * j, 0.3 * sin(PI * (j + 0.5) / 12) * a);
}
function frameLines(cy, h) { for (const s of [-1, 1]) { const y = cy + s * (h / 2 - 30); ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(1040, y); stroke(E.ink, 3); ctx.beginPath(); ctx.moveTo(40, y + s * 9); ctx.lineTo(1040, y + s * 9); stroke(E.ink, 1.5); } }

// iron stylus, tip at (x,y)
function stylus(x, y, t, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(14, 6); ctx.rotate(0.62); ctx.fillStyle = 'rgba(10,4,0,0.28)'; ctx.fillRect(-6, -360, 12, 360); ctx.restore();
  ctx.rotate(0.45);
  const g = ctx.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#4E4A46'); g.addColorStop(0.45, '#C9C2B6'); g.addColorStop(1, '#5E5852');
  poly([[0, 0], [-5, -40], [-10, -360], [10, -360], [5, -40]]); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#B8862E'; ctx.fillRect(-12, -300, 24, 14); ctx.fillRect(-12, -270, 24, 8);
  ctx.restore();
  for (let i = 0; i < 4; i++) { const a = rnd(i + Math.floor(t * 30)) * TAU, r = 6 + rnd(i * 3 + Math.floor(t * 30)) * 16; ctx.fillStyle = 'rgba(255,236,190,0.8)'; ctx.fillRect(x + cos(a) * r, y + sin(a) * r, 3, 3); }
}

// etched tags
function tag(text, x, y, o = {}) {
  const size = o.size || 44, kind = o.kind || 'dark', a = o.a ?? 1, sc = o.sc ?? 1; if (a <= 0 || sc <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; const ls = Math.round(size * 0.12); ctx.letterSpacing = ls + 'px';
  const tw = ctx.measureText(text).width, pw = tw + size * 1.1, ph = size * 1.5;
  if (kind === 'leaf') { palmLeaf(0, 0, pw + ph * 1.6, ph, 0, 0); ctx.fillStyle = E.ink; }
  else {
    ctx.fillStyle = kind === 'red' ? E.red : kind === 'indigo' ? E.ind : '#1A0D06'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 6); ctx.fill();
    ctx.strokeStyle = kind === 'dark' ? 'rgba(224,165,38,0.55)' : 'rgba(241,230,204,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-pw / 2 + 7, -ph / 2 + 7, pw - 14, ph - 14, 3); ctx.stroke();
    ctx.fillStyle = E.ash;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, ls / 2, size * 0.05);
  ctx.letterSpacing = '0px'; ctx.restore();
}
const pop = (lt, t0, dur = 0.3) => ({ a: seg(lt, t0, t0 + 0.12), sc: eob(seg(lt, t0, t0 + dur)) });
const stamp = (lt, t0) => { const k = seg(lt, t0, t0 + 0.22); return { a: k * 1, sc: lerp(1.9, 1, eo(k)) }; };
function verseTag(n, lt, t0, x = 210, y = 220) { const p = pop(lt, t0, 0.28); tag('VERSE ' + n, x, y, { size: 40, kind: 'leaf', a: p.a, sc: p.sc, rot: -0.03 }); }

// ───────────── abstract verse strokes (unreadable on purpose) ─────────────
function verseRow(x0, x1, y, seed, sz = 1, col = E.ink, lw = 3.4, pick = null) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let x = x0, i = 0;
  while (x < x1) {
    const r = rnd(seed + i * 7.3), gw = (18 + rnd(seed + i * 3.1) * 16) * sz;
    if (rnd(seed + i * 1.7) < 0.12) { x += gw * 0.9; i++; continue; }
    if (!pick || pick(i)) {
      ctx.beginPath();
      if (r < 0.3) { ctx.arc(x + gw * 0.4, y, gw * 0.32, PI * 0.9, PI * 2.6); ctx.lineTo(x + gw, y + gw * 0.2); }
      else if (r < 0.55) { ctx.moveTo(x, y); ctx.bezierCurveTo(x + gw * 0.3, y - gw * 0.8, x + gw * 0.6, y + gw * 0.6, x + gw, y - gw * 0.1); }
      else if (r < 0.8) { ctx.moveTo(x, y - gw * 0.4); ctx.quadraticCurveTo(x + gw * 0.9, y - gw * 0.6, x + gw * 0.5, y + gw * 0.1); ctx.quadraticCurveTo(x + gw * 0.2, y + gw * 0.4, x + gw, y + gw * 0.3); }
      else { ctx.moveTo(x, y + gw * 0.2); ctx.quadraticCurveTo(x + gw * 0.25, y - gw * 0.6, x + gw * 0.5, y + gw * 0.1); ctx.quadraticCurveTo(x + gw * 0.75, y - gw * 0.6, x + gw, y + gw * 0.2); }
      ctx.stroke();
      if (rnd(seed + i * 5.9) < 0.25) { ctx.beginPath(); ctx.arc(x + gw * 0.5, y - gw * 0.75, lw * 0.8, 0, TAU); ctx.fill(); }
    }
    x += gw * 1.05; i++;
  }
}
const curse = (seed) => (i) => rnd(seed + i * 9.1) < 0.2;

// ───────────── etched figures (faceless) ─────────────
function shp(pts, mode, fill) { poly(pts); if (mode === 'solid') { ctx.fillStyle = E.soot; ctx.fill(); } else { ctx.fillStyle = fill; ctx.fill(); stroke(E.ink, 4.5); } }
function limb(x0, y0, x1, y1, r, mode) { pl([[x0, y0], [x1, y1]]); if (mode === 'solid') stroke(E.soot, 2 * r); else { stroke(E.ink, 2 * r + 9); pl([[x0, y0], [x1, y1]]); stroke(LIMB, 2 * r); } }
function head(x, y, rx, ry, mode) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = mode === 'solid' ? E.soot : BLANK; ctx.fill(); if (mode !== 'solid') stroke(E.ink, 4.5); }
function hatch(pts, gap = 14, w = 2) { ctx.save(); poly(pts); ctx.clip(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  ctx.beginPath(); for (let k = x0 - (y1 - y0); k < x1; k += gap) { ctx.moveTo(k, y1); ctx.lineTo(k + (y1 - y0), y0); } stroke('rgba(42,22,6,0.5)', w); ctx.restore(); }
const CROWN = (cx, by, k = 1) => [[cx - 36 * k, by], [cx + 36 * k, by], [cx + 28 * k, by - 42 * k], [cx + 14 * k, by - 94 * k], [cx, by - 138 * k], [cx - 14 * k, by - 94 * k], [cx - 28 * k, by - 42 * k]];
/** seated king facing right; (x,y) = base centre, ~570 tall at s=1 */
function kingSeated(x, y, s = 1, mode = 'etch') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const back = [[-168, -150], [-132, -150], [-130, -372], [-166, -372]], seat = [[-176, -150], [124, -150], [124, -110], [-176, -110]];
  shp(back, mode, WOOD); ctx.beginPath(); ctx.arc(-148, -386, 16, 0, TAU); mode === 'solid' ? (ctx.fillStyle = E.soot, ctx.fill()) : stroke(E.ink, 4);
  shp(seat, mode, WOOD); shp([[-164, -110], [-138, -110], [-138, 0], [-164, 0]], mode, WOOD); shp([[84, -110], [110, -110], [110, 0], [84, 0]], mode, WOOD);
  if (mode !== 'solid') { hatch(back, 12); hatch(seat, 12); }
  limb(108, -176, 118, -26, 17, mode); shp([[96, -28], [170, -22], [172, 0], [98, 0]], mode, LIMB);
  const torso = [[-120, -150], [16, -150], [4, -332], [-94, -338]];
  shp([[-72, -206], [114, -198], [120, -150], [-72, -150]], mode, ROBE); shp(torso, mode, ROBE);
  if (mode !== 'solid') { hatch(torso, 16); ctx.beginPath(); ctx.moveTo(-90, -330); ctx.lineTo(10, -170); stroke(E.red, 7); }
  limb(-40, -314, 8, -230, 15, mode); limb(8, -230, 96, -208, 13, mode);
  limb(-44, -336, -40, -364, 12, mode); head(-40, -400, 34, 42, mode);
  const cr = CROWN(-40, -430); shp(cr, mode, E.tur);
  if (mode !== 'solid') { for (const yy of [-448, -488]) { ctx.beginPath(); ctx.moveTo(-70 + (-430 - yy) * 0.2, yy); ctx.lineTo(-10 - (-430 - yy) * 0.2, yy); stroke(E.ink, 3); } ctx.beginPath(); ctx.arc(-40, -452, 7, 0, TAU); ctx.fillStyle = E.red; ctx.fill(); }
  ctx.restore();
}
/** robed reader standing, facing left, holding a palm leaf; ~470 tall */
function reader(x, y, s = 1, mode = 'etch', bob = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const robe = [[-58, 0], [64, 0], [46, -290], [30, -372], [-28, -372], [-44, -290]];
  shp(robe, mode, '#BFA67A');
  if (mode !== 'solid') { for (const k of [-24, 0, 24]) { ctx.beginPath(); ctx.moveTo(k * 0.5, -360); ctx.quadraticCurveTo(k - 6, -180, k * 1.6, -4); stroke('rgba(42,22,6,0.55)', 2.5); } shp([[-28, -372], [30, -372], [48, -296], [-38, -236]], mode, '#C8664A'); }
  ctx.translate(0, bob);
  limb(0, -372, 0, -394, 11, mode); head(0, -430, 30, 38, mode); ctx.beginPath(); ctx.arc(20, -466, 13, 0, TAU); ctx.fillStyle = mode === 'solid' ? E.soot : BLANK; ctx.fill(); if (mode !== 'solid') stroke(E.ink, 4);
  limb(-16, -352, -50, -290, 13, mode); limb(-50, -290, -94, -318, 11, mode);
  palmLeaf(-126, -322, 160, 26, -0.08, 0);
  if (mode !== 'solid') { ctx.beginPath(); ctx.ellipse(-126, -322, 80, 13, -0.08, 0, TAU); stroke(E.ink, 2.5); }
  ctx.restore();
}
/** walking king silhouette (per frame, a few polygons) */
function kingWalk(x, y, s, ph, dir = 1) {
  ctx.save(); ctx.translate(x, y + Math.abs(sin(ph)) * -6 * s); ctx.scale(s * dir, s);
  ctx.beginPath(); ctx.ellipse(0, 6, 70, 10, 0, 0, TAU); ctx.fillStyle = 'rgba(14,7,3,0.25)'; ctx.fill();
  limb(0, -190, sin(ph) * 48, 0, 13, 'solid'); limb(0, -190, -sin(ph) * 48, 0, 13, 'solid');
  shp([[-48, -150], [48, -150], [36, -380], [-36, -380]], 'solid');
  limb(-20, -360, -20 - sin(ph) * 40, -230, 12, 'solid'); limb(20, -360, 20 + sin(ph) * 40, -230, 12, 'solid');
  limb(0, -380, 0, -400, 11, 'solid'); head(0, -432, 28, 35, 'solid'); shp(CROWN(0, -458, 0.85), 'solid');
  ctx.restore();
}

// ───────────── pavilions ─────────────
function roofPath() { ctx.beginPath(); ctx.moveTo(-165, -258); ctx.quadraticCurveTo(-110, -300, -36, -398); ctx.lineTo(0, -418); ctx.lineTo(36, -398); ctx.quadraticCurveTo(110, -300, 165, -258); ctx.quadraticCurveTo(0, -272, -165, -258); ctx.closePath(); }
function pavilion(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const px of [-100, -20, 60, 140]) { ctx.beginPath(); ctx.moveTo(px + 18, -40); ctx.lineTo(px + 18, -262); stroke('rgba(42,22,6,0.4)', 3); }
  ctx.beginPath(); ctx.rect(-150, -36, 300, 36); ctx.fillStyle = 'rgba(150,95,35,0.35)'; ctx.fill(); stroke(E.ink, 4);
  for (const yy of [-12, -24]) { ctx.beginPath(); ctx.moveTo(-150, yy); ctx.lineTo(150, yy); stroke('rgba(42,22,6,0.5)', 2); }
  for (const px of [-128, -44, 44, 128]) { ctx.beginPath(); ctx.rect(px - 9, -250, 18, 214); ctx.fillStyle = WOOD; ctx.fill(); stroke(E.ink, 3.5); ctx.beginPath(); ctx.rect(px - 14, -260, 28, 10); ctx.rect(px - 13, -46, 26, 10); stroke(E.ink, 3); }
  ctx.beginPath(); ctx.rect(-158, -272, 316, 16); ctx.fillStyle = WOOD; ctx.fill(); stroke(E.ink, 3.5);
  roofPath(); ctx.fillStyle = THATCH; ctx.fill(); stroke(E.ink, 4.5);
  ctx.save(); roofPath(); ctx.clip(); ctx.beginPath(); for (let k = -12; k <= 12; k++) { ctx.moveTo(k * 3, -415); ctx.lineTo(k * 14, -255); } stroke('rgba(42,22,6,0.6)', 2);
  ctx.beginPath(); for (const yy of [-300, -340, -376]) { ctx.moveTo(-170, yy + 10); ctx.quadraticCurveTo(0, yy - 14, 170, yy + 10); } stroke('rgba(42,22,6,0.6)', 2.5); ctx.restore();
  ctx.beginPath(); ctx.arc(0, -428, 9, 0, TAU); ctx.moveTo(0, -437); ctx.lineTo(0, -456); stroke(E.ink, 3.5);
  ctx.restore();
}
// world layout of the row (world units; the row leaf is centred at (1250,450))
const NP = 8, PX = [], PY = [], PS = [];
{ let x = 260; for (let i = 0; i < NP; i++) { const s = 1 - 0.065 * i; PS.push(s); PY.push(690 - 22 * i); PX.push(x); x += 330 * (1 - 0.065 * (i + 0.5)); } }
const wLeaf = () => cached('bwleaf', 2900, 760, 0.5, () => { ctx.translate(200, -70); palmLeaf(1250, 450, 5000, 720); leafTex(-200, 450, 2900, 720, 77); });
const wSoot = () => cached('bwsoot', 2900, 760, 0.25, () => { ctx.translate(200, -70); palmLeaf(1250, 450, 5000, 720); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = E.soot; ctx.fillRect(0, 0, 4000, 4000); ctx.globalCompositeOperation = 'source-over'; });
const wRow = () => cached('bwrow', 2400, 800, 1, () => {
  // distant hills, road, ground hatching, then pavilions far -> near
  ctx.beginPath(); ctx.moveTo(0, 330); for (let x = 0; x <= 2400; x += 30) ctx.lineTo(x, 330 - 40 * sin(x * 0.004) - 18 * sin(x * 0.013 + 1) + x * 0.02); stroke('rgba(42,22,6,0.45)', 3);
  ctx.beginPath(); ctx.moveTo(0, 728); ctx.lineTo(2400, 520); stroke(E.ink, 3); ctx.beginPath(); ctx.moveTo(0, 760); ctx.lineTo(2400, 548); stroke('rgba(42,22,6,0.5)', 2);
  ctx.beginPath(); for (let i = 0; i < 140; i++) { const x = rnd(i + 40) * 2400, y = 742 - x * 0.087 + rnd(i + 41) * 30; ctx.moveTo(x, y); ctx.lineTo(x + 14, y - 3); } stroke('rgba(42,22,6,0.45)', 2);
  for (let i = 0; i < 3; i++) { const bx = 700 + i * 520, by = 210 + rnd(i) * 40; ctx.beginPath(); ctx.moveTo(bx - 14, by); ctx.quadraticCurveTo(bx - 6, by - 8, bx, by); ctx.quadraticCurveTo(bx + 6, by - 8, bx + 14, by); stroke('rgba(42,22,6,0.6)', 2.5); }
  for (let i = NP - 1; i >= 0; i--) pavilion(PX[i], PY[i], PS[i]);
});
function embersAt(x, y, t, n, seed, spread, rise, sz = 3) {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.35 + rnd(i + seed) * 0.5) + rnd(i * 3 + seed)) % 1, ex = x + (rnd(i * 7 + seed) - 0.5) * spread + sin(t * 2 + i) * 20 * ph, ey = y - ph * rise;
    ctx.fillStyle = rnd(i + seed * 2) > 0.5 ? `rgba(255,210,90,${1 - ph})` : `rgba(255,138,30,${1 - ph})`;
    ctx.beginPath(); ctx.arc(ex, ey, sz * (1 - ph * 0.5), 0, TAU); ctx.fill();
  }
}
/** roof fire on pavilion i, intensity k (0..~1.6) */
function roofFire(i, t, k) {
  if (k <= 0) return; const x = PX[i], s = PS[i], y = PY[i] - 300 * s;
  ctx.save(); ctx.translate(x, PY[i]); ctx.scale(s, s); roofPath(); ctx.fillStyle = `rgba(28,10,2,${0.6 * clamp(k)})`; ctx.fill(); ctx.restore();
  glow(x, y - 40 * s, 340 * s * Math.min(k, 1.4), '255,130,40', 0.5 * clamp(k));
  for (let j = 0; j < 5; j++) flame(x + (j / 4 - 0.5) * 240 * s, y + 30 * s, s * k * (1.1 + 0.7 * rnd(i * 9 + j)), t + j * 0.37, i * 31 + j * 13);
  flame(x, y - 20 * s, s * k * 2.3, t * 1.1, i * 7 + 99);
  embersAt(x, y - 80 * s, t, 12, i * 17, 260 * s, 520 * s, 4 * s);
}
const IGN = [];
/** draw the row world with view centre (vx,vy) at screen (540,740), scale sc */
function world(t, vx, vy, sc, o = {}) {
  ctx.save(); ctx.translate(540, 740); ctx.scale(sc, sc); ctx.translate(-vx, -vy);
  blit(wLeaf(), 0, 0, -200, 70);
  const row = wRow();
  if (o.scratch != null) {
    part(row, 0, 0, 0, 0, 0, o.scratch, 0.38); part(row, 0, 0, 0, 0, 0, Math.min(o.soot, o.scratch), 1);
    const c = wSoot(), u = o.soot + 200; part(c, 0, 0, -200, 70, 0, u, 0.1); for (let j = 0; j < 12; j++) part(c, 0, 0, -200, 70, u - 18 * (j + 1), u - 18 * j, 0.3 * sin(PI * (j + 0.5) / 12));
  } else blit(row, 0, 0, 0, 0);
  if (o.under) o.under();
  for (let i = NP - 1; i >= 0; i--) if (IGN[i] != null) roofFire(i, t, (o.fk ? o.fk(i) : 1) * eo(clamp((t - IGN[i]) / 0.6)));
  for (let i = NP - 1; i >= 0; i--) if (IGN[i] != null && t > IGN[i] + 0.3) smoke(PX[i], PY[i] - 420 * PS[i], t + i, 3, '60,50,45', 0.28, 60, 480);
  if (o.actors) o.actors();
  ctx.restore();
}
const litCount = (t) => IGN.filter((g) => t >= g).length;

// ───────────── cached etched art (screen coordinates) ─────────────
const ROWS1 = [560, 650, 740, 830, 920];
const art1 = () => cached('bart1', 1080, 1300, 1, () => ROWS1.forEach((y, r) => verseRow(110, 980, y, 11 + r * 17, 1.35, E.ink, 4.2)));
const ROWS4 = [540, 625, 710, 795, 880, 965];
const art4 = () => cached('bart4', 1080, 1300, 1, () => ROWS4.forEach((y, r) => verseRow(70, 1010, y, 51 + r * 13, 1.45, E.ink, 4.4)));
const art4r = () => cached('bart4r', 1080, 1300, 1, () => ROWS4.forEach((y, r) => verseRow(70, 1010, y, 51 + r * 13, 1.45, E.red, 5, curse(r * 3))));
const art4g = () => cached('bart4g', 1080, 1300, 0.5, () => { ctx.filter = 'blur(7px)'; ROWS4.forEach((y, r) => verseRow(70, 1010, y, 51 + r * 13, 1.45, '#FF5A2A', 14, curse(r * 3))); ctx.filter = 'none'; });
const fanLeaf = (v, red) => cached('bfan' + v + (red ? 'r' : ''), 840, 130, 1, () => {
  if (!red) palmLeaf(420, 65, 820, 100, 0, v % 2);
  for (const [r, k] of [[-26, 0], [0, 1], [26, 2]]) for (const [a, b] of [[-370, -262], [-230, 230], [262, 370]]) verseRow(420 + a, 420 + b, 65 + r, v * 31 + k * 7 + a, 0.55, red ? E.red : E.ink, red ? 2.6 : 2, red ? curse(v + k) : null);
});
const art5 = () => cached('bart5', 1080, 1300, 1, () => {
  frameLines(740, 700); kingSeated(300, 1030, 0.92); reader(800, 1030, 0.92);
  // etched stand lamp
  ctx.beginPath(); ctx.ellipse(548, 1028, 46, 10, 0, 0, TAU); ctx.fillStyle = WOOD; ctx.fill(); stroke(E.ink, 4);
  ctx.beginPath(); ctx.moveTo(548, 1018); ctx.lineTo(548, 840); stroke(E.ink, 12); ctx.beginPath(); ctx.moveTo(548, 1018); ctx.lineTo(548, 840); stroke(WOOD, 5);
  for (const yy of [900, 960]) { ctx.beginPath(); ctx.ellipse(548, yy, 16, 6, 0, 0, TAU); stroke(E.ink, 3); }
  ctx.beginPath(); ctx.moveTo(514, 836); ctx.quadraticCurveTo(548, 868, 582, 836); ctx.closePath(); ctx.fillStyle = E.tur; ctx.fill(); stroke(E.ink, 4);
});
const art6 = () => cached('bart6', 1080, 1300, 1, () => {
  frameLines(740, 700); kingSeated(520, 1040, 1.05);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 330, 1060); ctx.lineTo(540 + s * 330, 520); ctx.quadraticCurveTo(540 + s * 300, 440, 540, 430); stroke(E.ink, 4); }
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(540 + (i - 4) * 70, 470 + Math.abs(i - 4) * 8, 6, 0, TAU); ctx.fillStyle = E.ink; ctx.fill(); }
});

const art12 = () => cached('bart12', 1080, 1300, 1, () => {
  frameLines(740, 700); kingSeated(520, 1040, 1.05, 'solid');
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 330, 1060); ctx.lineTo(540 + s * 330, 520); ctx.quadraticCurveTo(540 + s * 300, 440, 540, 430); stroke(E.ink, 4); }
});

// ═════════════════════════ BUILD ═════════════════════════
export function buildB(add, cue) {
  const t1 = L(4), t2 = Wd('nandi', 4) - 0.12, t3 = Wd('hid', 4) - 0.15, t4 = Wd('called', 4) - 0.05, t5 = L(5), t6 = Wd('legend', 5) - 0.12, t7 = Wd('under', 5) - 0.1;
  const t8 = L(6), t9 = Wd('he', 6) - 0.35, t10 = Wd('and', 6), t11 = Wd('last', 7) - 0.1, t12 = Wd('king', 7) - 0.15, tEnd = L(8);
  IGN.length = 0; IGN.push(Wd('caught', 6) - 0.05, Wd('next', 6)); for (let k = 2; k < NP; k++) IGN.push(t10 + 0.08 + (k - 2) * ((t11 - 0.2 - t10 - 0.08) / (NP - 3)));
  const tBurn = Wd('burned', 7);

  // b1 · stylus etches verse rows, soot rub
  add({ id: 'b1', at: t1, cam: [540, 740], zoom: 0.08, note: 'stylus etches abstract verse rows, soot rub', draw(lt, d, t) {
    desk(t, 540, 700, 0.25); ctx.save(); ctx.translate(lerp(-25, 25, lt / d), 0);
    leafAt(560, 740); const c = art1();
    const p = seg(lt, 0.08, d * 0.82) * ROWS1.length, sx = lerp(-80, 1180, seg(lt, d * 0.4, d));
    let tip = null;
    ROWS1.forEach((y, r) => {
      const f = clamp(p - r), w = lerp(110, 990, f); if (f <= 0) return;
      part(c, 0, 0, 0, 0, 0, w, 0.36, y - 45, y + 45); part(c, 0, 0, 0, 0, 0, Math.min(w, sx), 1, y - 45, y + 45);
      if (f < 1) tip = [w, y + sin(lt * 40) * 12];
    });
    sootBand(560, 740, sx);
    if (tip) stylus(tip[0], tip[1], t, 1);
    ctx.restore();
    lamp(960, 1236, 0.5, t, 1);
    tag('THE POEM', 540, 330, { ...pop(lt, 0.25), size: 46, kind: 'dark' });
    dust(t, 22, 5, '255,214,150', 0.35); calm();
  } });
  cue(t1, 'whoosh', { gain: 0.5 }); cue(t1 + 0.08, 'chisel', { gain: 0.6, dur: 1.4 }); cue(t1 + 1.0, 'chisel', { gain: 0.4, dur: 0.8 }); cue(t1 + (t2 - t1) * 0.4, 'slide', { gain: 0.3 });

  // fan geometry shared by b2 / b3
  const NF = 9, FA = (k) => lerp(-0.92, 0.92, k / (NF - 1)), PIV = [540, 1110];
  function fan(lt, open, red = 0, veins = 0, t = 0) {
    for (let k = 0; k < NF; k++) {
      const ord = Math.abs(k - 4), a = FA(k) * open(ord);
      ctx.save(); ctx.translate(PIV[0] + sin(a) * 246, PIV[1] - cos(a) * 246); ctx.rotate(a - PI / 2);
      blit(fanLeaf(k % 4, false), 420, 65, 0, 0);
      if (red > 0 && k % 2 === 1) {
        blit(fanLeaf(k % 4, true), 420, 65, 0, 0, 1, red);
        const pr = clamp(veins - ord * 0.12); if (pr > 0) {
          const pts = []; for (let j = 0; j <= 40 * pr; j++) { const x = -230 + j * 15; pts.push([x, sin(j * 0.7 + k) * 14 + sin(j * 1.9) * 6]); }
          if (pts.length > 1) { pl(pts); stroke('rgba(192,51,31,0.95)', 4.5); pl(pts); stroke('rgba(255,120,80,0.8)', 1.5); }
        }
      }
      ctx.restore();
    }
    // brass pin + cord
    ctx.beginPath(); ctx.moveTo(PIV[0], PIV[1]); ctx.bezierCurveTo(PIV[0] + 60, PIV[1] + 70, PIV[0] + 150, PIV[1] + 40 + sin(t * 2) * 8, PIV[0] + 220, PIV[1] + 120); stroke('#5A3A1A', 6);
    ctx.beginPath(); ctx.arc(PIV[0], PIV[1], 17, 0, TAU); ctx.fillStyle = '#B8862E'; ctx.fill(); ctx.beginPath(); ctx.arc(PIV[0] - 4, PIV[1] - 4, 6, 0, TAU); ctx.fillStyle = '#F0C870'; ctx.fill();
  }

  // b2 · bundle fans out; NANDI KALAMBAKAM
  add({ id: 'b2', at: t2, cam: [540, 760], zoom: 0.07, note: 'bundle of leaves fans into an arc; NANDI KALAMBAKAM', draw(lt, d, t) {
    desk(t, 540, 760, 0.28);
    const s = lerp(0.94, 1, eo(seg(lt, 0, 0.6)));
    ctx.save(); ctx.translate(PIV[0], PIV[1]); ctx.scale(s, s); ctx.rotate(lerp(0.05, 0, eo(seg(lt, 0, 0.8)))); ctx.translate(-PIV[0], -PIV[1]);
    fan(lt, (ord) => eob(seg(lt, 0.05 + ord * 0.07, 0.6 + ord * 0.07)), 0, 0, t);
    ctx.restore();
    const p = pop(lt, 0.25, 0.35); tag('NANDI KALAMBAKAM', 540, 300, { size: 56, kind: 'dark', a: p.a, sc: p.sc });
    ctx.globalAlpha = seg(lt, 0.5, 0.8); ctx.beginPath(); ctx.moveTo(540 - 300 * eo(seg(lt, 0.5, 0.9)), 372); ctx.lineTo(540 + 300 * eo(seg(lt, 0.5, 0.9)), 372); stroke(E.tur, 3); ctx.globalAlpha = 1;
    dust(t, 22, 9, '255,214,150', 0.35); calm();
  } });
  cue(t2, 'whoosh', { gain: 0.55 }); cue(t2 + 0.05, 'slide', { gain: 0.6, dur: 0.6 }); cue(t2 + 0.3, 'bell', { gain: 0.35 });

  // b3 · curse ink in the fan, heartbeat
  add({ id: 'b3', at: t3, cam: [540, 720], zoom: 0.14, note: 'strokes in the fan turn sindoor red and creep like veins; A HIDDEN CURSE?', draw(lt, d, t) {
    const b = beat(lt, 0.85);
    desk(t, 540, 760, 0.2); glow(540, 760, 620, '192,51,31', 0.12 + 0.22 * b * seg(lt, 0.2, 0.6));
    ctx.save(); ctx.translate(PIV[0], PIV[1]); const s = 1 + 0.012 * b; ctx.scale(s, s); ctx.translate(-PIV[0], -PIV[1]);
    fan(lt, () => 1, seg(lt, 0.15, 0.9) * (0.65 + 0.35 * b), seg(lt, 0.25, d - 0.2) * 1.4, t);
    ctx.restore();
    tag('A HIDDEN CURSE?', 540, 300, { ...pop(lt, Wd('curse', 4) - t3, 0.35), size: 54, kind: 'red' });
    dust(t, 18, 3, '255,150,110', 0.3); calm();
  } });
  for (let k = 0; k * 0.85 < t4 - t3 - 0.1; k++) cue(t3 + k * 0.85, 'heartbeat', { gain: 0.7 });
  cue(t3, 'whoosh', { gain: 0.35 });

  // b4 · ARAM close-up
  add({ id: 'b4', at: t4, cam: [540, 760], zoom: 0.1, note: 'one leaf close-up, curse strokes glow red; ARAM', draw(lt, d, t) {
    const b = beat(lt + 0.4, 0.7);
    desk(t, 540, 760, 0.22); ctx.save(); ctx.translate(lerp(30, -30, eio(lt / d)), 0);
    leafAt(600, 760, 1); blit(art4(), 0, 0, 0, 0);
    const k = seg(lt, 0.05, 0.5);
    blit(art4g(), 0, 0, 0, 0, 1, k * (0.45 + 0.55 * b)); blit(art4r(), 0, 0, 0, 0, 1, k);
    for (let v = 0; v < 3; v++) {
      const pr = seg(lt, 0.1 + v * 0.15, d), y0 = ROWS4[v * 2 + 1] - 42, pts = [];
      for (let j = 0; j <= 60 * pr; j++) pts.push([60 + j * 16, y0 + sin(j * 0.45 + v * 2) * 22 + sin(j * 1.3) * 6]);
      if (pts.length > 1) { pl(pts); stroke('rgba(192,51,31,0.9)', 4); pl(pts); stroke('rgba(255,140,100,0.7)', 1.4); }
    }
    ctx.restore();
    lamp(110, 1240, 0.5, t, 1);
    const p = stamp(lt, Math.max(0.05, Wd('aram', 4) - t4)); tag('ARAM', 540, 300, { size: 92, kind: 'red', a: p.a, sc: p.sc * (1 + 0.03 * b), rot: -0.04 });
    calm();
  } });
  cue(Wd('aram', 4), 'thud', { gain: 0.7 }); cue(t4 + 0.4, 'heartbeat', { gain: 0.8 }); cue(t4 + 1.1, 'heartbeat', { gain: 0.6 });

  // b5 · the king loved poetry
  const RL = [680, 732], KH = [263, 664];
  add({ id: 'b5', at: t5, cam: [470, 760], zoom: 0.09, note: 'seated faceless king listens to a robed reader; lamp glow', draw(lt, d, t) {
    desk(t, 548, 820, 0.3); ctx.save(); ctx.translate(lerp(-20, 20, lt / d), 0);
    leafAt(700, 740); blit(art5(), 0, 0, 0, 0);
    glow(548, 820, 190, '255,180,80', 0.45); flame(548, 838, 0.55, t, 3);
    for (let j = 0; j < 4; j++) { const ph = (lt * 0.9 + j / 4) % 1, r = 30 + ph * 300; ctx.beginPath(); ctx.arc(RL[0], RL[1], r, PI * 0.86, PI * 1.14); stroke(`rgba(42,22,6,${(1 - ph) * 0.7})`, 3); }
    for (let j = 0; j < 4; j++) {
      const ph = (lt * 0.6 + j / 4) % 1, x = lerp(RL[0] - 40, KH[0] + 60, ph), y = lerp(RL[1] - 30, KH[1] - 40, ph) - sin(ph * PI) * 60;
      ctx.globalAlpha = sin(ph * PI); verseRow(x, x + 60, y, j * 5 + 3, 0.6, '#8A3A12', 2.6); ctx.globalAlpha = 1;
    }
    smoke(548, 800, t, 4, '235,210,170', 0.12, 40, 340);
    ctx.restore();
    lamp(965, 1236, 0.5, t, 1);
    tag('ILLUSTRATION', 840, 1150, { size: 28, kind: 'dark', ...pop(lt, 0.3) });
    dust(t, 22, 12, '255,214,150', 0.35); calm();
  } });
  cue(t5, 'whoosh', { gain: 0.5 }); cue(t5 + 0.2, 'bell', { gain: 0.3 });

  // b6 · leaf flip + stylus etches king large; LEGEND stamp
  add({ id: 'b6', at: t6, cam: [540, 700], zoom: 0.1, note: 'leaf flips on the cord; stylus etches the king; LEGEND', draw(lt, d, t) {
    desk(t, 540, 760, 0.25);
    const f1 = seg(lt, 0, 0.28), f2 = seg(lt, 0.28, 0.62);
    if (f1 < 1) { ctx.save(); ctx.translate(0, 740); ctx.scale(1, 1 - eio(f1)); ctx.translate(0, -740); leafAt(700, 740); blit(art5(), 0, 0, 0, 0); ctx.fillStyle = `rgba(10,4,0,${f1 * 0.6})`; ctx.fillRect(-100, 380, 1280, 720); ctx.restore(); }
    else {
      ctx.save(); ctx.translate(0, 740); ctx.scale(1, eob(f2)); ctx.translate(0, -740); leafAt(700, 740, 1);
      const sx = lerp(150, 960, seg(lt, 0.55, d - 0.2)), so = lerp(60, 1160, seg(lt, 0.9, d));
      const c = art6(); part(c, 0, 0, 0, 0, 0, sx, 0.36); part(c, 0, 0, 0, 0, 0, Math.min(sx, so), 1);
      sootBand(700, 740, so, seg(lt, 0.85, 1.0));
      if (lt > 0.55 && sx < 955) stylus(sx, 760 + sin(lt * 23) * 250, t, 1);
      ctx.restore();
    }
    const p = stamp(lt, 0.4); tag('LEGEND', 540, 285, { size: 70, kind: 'red', a: p.a, sc: p.sc, rot: -0.05 });
    tag('THE LEGEND SAYS', 540, 1170, { size: 30, kind: 'dark', ...pop(lt, 0.7) });
    calm();
  } });
  cue(t6, 'slide', { gain: 0.6 }); cue(t6 + 0.4, 'thud', { gain: 0.8 }); cue(t6 + 0.55, 'chisel', { gain: 0.55, dur: 1.2 });

  // b7 · pavilion row etched; king walks to the first
  add({ id: 'b7', at: t7, cam: [540, 760], zoom: 0.06, note: 'long leaf: row of eight pavilions etched in perspective; king walks to the first', draw(lt, d, t) {
    desk(t, 600, 700, 0.25);
    const sc = 0.92, vx = lerp(720, 980, eio(lt / d)), vy = 470;
    const sx = lerp(140, 1700, seg(lt, 0.05, d * 0.8)), so = lerp(40, 1800, seg(lt, 0.45, d));
    const kx = lerp(-40, PX[0] - 70, eo(seg(lt, 0.2, d))), walking = lt < d - 0.1;
    world(t, vx, vy, sc, { scratch: sx, soot: so, actors() {
      kingWalk(kx, 712 + (kx - PX[0]) * -0.087, 0.42, walking ? lt * 9 : 0);
      if (sx < 1690) stylus(sx, lerp(250, 700, 0.5 + 0.5 * sin(lt * 18)), t, 1 / sc);
    } });
    tag('LEGEND', 540, 250, { size: 44, kind: 'red', ...pop(lt, 0.2), rot: -0.04 });
    calm();
  } });
  cue(t7, 'whoosh', { gain: 0.5 }); cue(t7 + 0.05, 'chisel', { gain: 0.5, dur: 1.8 });

  // b8 · VERSE 1, first pavilion ignites
  const seatK = (i, dx = -60) => () => kingSeated(PX[i] + dx * PS[i], PY[i] - 36 * PS[i], 0.4 * PS[i], 'solid');
  add({ id: 'b8', at: t8, cam: [540, 640], zoom: 0.1, note: 'VERSE 1; the first pavilion roof ignites over the seated king', draw(lt, d, t) {
    desk(t, 400, 600, 0.22 + 0.3 * seg(t, IGN[0], IGN[0] + 0.5));
    world(t, PX[0] + lerp(110, 150, lt / d), PY[0] - 230, 1.5, { actors() { seatK(0)(); reader(PX[0] + 100, PY[0] - 36, 0.4, 'solid', sin(t * 3) * 3); } });
    verseTag(1, lt, Wd('verse', 6) - t8);
    calm();
  } });
  cue(t8, 'whoosh', { gain: 0.45 }); cue(Wd('verse', 6), 'bell', { gain: 0.5 }); cue(IGN[0], 'sizzle', { gain: 0.7, dur: 1.0 }); cue(IGN[0] + 0.1, 'rumble', { gain: 0.5, dur: 1.4 });

  // b9 · he moves to the next
  add({ id: 'b9', at: t9, cam: [540, 700], zoom: 0.08, note: 'king walks to the next pavilion, it ignites; VERSE 2', draw(lt, d, t) {
    desk(t, 500, 600, 0.45);
    const u = eio(seg(lt, 0.1, d * 0.85)), kx = lerp(PX[0] - 60, PX[1] - 60 * PS[1], u), ky = lerp(PY[0], PY[1], u) - 36 * lerp(1, PS[1], u), sk = lerp(1, PS[1], u);
    world(t, lerp(PX[0] + 60, PX[1] + 50, eio(lt / d)), lerp(PY[0], PY[1], u) - 230, lerp(1.45, 1.35, lt / d), { actors() {
      if (u < 1) kingWalk(kx, ky + 36 * sk, 0.42 * sk, lt * 10); else seatK(1)();
      reader(kx + 150 * sk, ky + 36 * sk, 0.4 * sk, 'solid', sin(lt * 10) * 4);
    } });
    if (t < IGN[1]) verseTag(1, 1, 0); else verseTag(2, lt, IGN[1] - t9);
    calm();
  } });
  cue(t9, 'whoosh', { gain: 0.4 }); cue(IGN[1] - 0.1, 'bell', { gain: 0.45 }); cue(IGN[1], 'sizzle', { gain: 0.6, dur: 0.8 });

  // b10 · and the next: fast chain, camera tracks and pulls back
  const kxAt = (t) => { if (t <= IGN[1]) return PX[1]; for (let i = 1; i < NP - 1; i++) if (t < IGN[i + 1]) return lerp(PX[i], PX[i + 1], (t - IGN[i]) / (IGN[i + 1] - IGN[i])); return PX[NP - 1]; };
  const ixAt = (x) => { let i = 0; while (i < NP - 2 && x > PX[i + 1]) i++; return i; };
  add({ id: 'b10', at: t10, cam: [540, 740], zoom: 0.05, note: 'pavilions ignite one after another down the row, camera tracks and pulls back', draw(lt, d, t) {
    desk(t, 540, 650, 0.55);
    const kx = kxAt(t + 0.15) - 40, i = ixAt(kx), f = clamp((kx - PX[i]) / (PX[i + 1] - PX[i])), ks = lerp(PS[i], PS[i + 1], f), ky = lerp(PY[i], PY[i + 1], f);
    const sc = lerp(1.3, 0.62, eio(lt / d)), vx = lerp(kx + 100, PX[4] + 80, eio(seg(lt, 0.2, d))), vy = lerp(ky - 220, 470, eio(lt / d));
    world(t, vx, vy, sc, { actors() { kingWalk(kx, ky, 0.42 * ks, lt * 16); } });
    const n = litCount(t); verseTag(n, (t - IGN[Math.max(0, n - 1)]), 0);
    calm();
  } });
  cue(t10, 'whoosh', { gain: 0.45 }); for (let k = 2; k < NP; k++) { cue(IGN[k], 'bell', { gain: 0.25 + k * 0.03, pan: lerp(-0.4, 0.5, k / NP) }); cue(IGN[k] + 0.05, 'sizzle', { gain: 0.35, dur: 0.4 }); } cue(t10 + 0.3, 'rumble', { gain: 0.6, dur: 1.6 });

  // b11 · the last verse: last pavilion, flames around
  add({ id: 'b11', at: t11, cam: [540, 660], zoom: 0.1, note: 'last pavilion, last leaf in the reader hand, flames rising around; VERSE 8 / LAST VERSE', draw(lt, d, t) {
    desk(t, 540, 650, 0.6);
    const i = NP - 1, s = PS[i];
    world(t, PX[i] + 20, PY[i] - 200 * s, 2.05, { fk: (j) => (j === i ? 1 + 0.6 * seg(lt, 0.5, d) : 1.2),
      under() { pavilion(PX[i], PY[i], s); },
      actors() { seatK(i)(); reader(PX[i] + 105 * s, PY[i] - 36 * s, 0.4 * s, 'solid', sin(t * 3) * 3); glow(PX[i] + 105 * s - 126 * 0.4 * s, PY[i] - 36 * s - 322 * 0.4 * s, 50, '255,220,140', 0.5 + 0.2 * sin(t * 6)); } });
    // foreground fire wall
    const k = eo(seg(lt, 0, d)); glow(540, 1150, 600, '255,110,30', 0.25 + 0.25 * k);
    for (let j = 0; j < 14; j++) flame(20 + j * 80 + sin(j * 3) * 25, 1200 + rnd(j + 4) * 30, (0.6 + 1.3 * k) * (0.5 + 1.0 * rnd(j)) * (1 + 0.15 * sin(t * 4 + j)), t + j * 0.3, j * 11);
    embersAt(540, 1120, t, 26, 5, 1100, 900, 4);
    verseTag(NP, 1, 0); tag('LAST VERSE', 540, 300, { size: 52, kind: 'dark', ...pop(lt, Wd('last', 7) - t11) });
    calm();
  } });
  cue(t11, 'whoosh', { gain: 0.5 }); cue(Wd('verse', 7), 'bell', { gain: 0.6 }); cue(t11 + 0.1, 'rumble', { gain: 0.7, dur: 2.0 }); cue(t11 + 0.8, 'sizzle', { gain: 0.5, dur: 1.2 });

  // b12 · EDGE BURN swallows the king; red flash
  const contour = (u, t, cx = 540, cy = 740) => {
    const rx = 780 * (1 - u), ry = 470 * (1 - u), pts = [];
    for (let j = 0; j < 110; j++) {
      const a = (j / 110) * TAU, c = cos(a), s = sin(a), n = 1 + 0.07 * sin(5 * a + t * 2) + 0.05 * sin(11 * a - t * 3) + 0.03 * sin(19 * a + 1);
      pts.push([cx + rx * Math.sign(c) * Math.abs(c) ** 0.6 * n, cy + ry * Math.sign(s) * Math.abs(s) ** 0.6 * n]);
    }
    return pts;
  };
  add({ id: 'b12', at: t12, cam: [540, 740], zoom: 0.12, note: 'EDGE BURN: the leaf showing the king chars inward and swallows him; red flash; THE STORY SAYS', draw(lt, d, t) {
    desk(t, 540, 740, 0.4);
    const u = lerp(0.16, 0.985, eio(seg(lt, 0, d - 0.1)) * 0.4 + 0.6 * eio(seg(t, tBurn - 0.15, tEnd - 0.05)));
    if (u < 1) {
      const outer = contour(Math.max(0, u - 0.1), t), inner = contour(u, t);
      ctx.save(); poly(outer); ctx.clip(); leafAt(700, 740, 1); ctx.fillStyle = 'rgba(28,12,4,0.9)'; ctx.fillRect(-100, 300, 1280, 900); ctx.restore();
      ctx.save(); poly(inner); ctx.clip(); leafAt(700, 740, 1); blit(art12(), 0, 0, 0, 0); ctx.restore();
      poly(inner); stroke('rgba(255,120,30,0.9)', 14); poly(inner); stroke('#FFD25A', 4);
      for (let j = 0; j < 14; j++) { const p = inner[(j * 8 + Math.floor(t * 3)) % inner.length]; if (p[1] > 360 && p[1] < 1140) flame(p[0], p[1], 0.55 + 0.35 * rnd(j), t + j, j * 7); }
    }
    smoke(540, 600, t, 5, '70,60,55', 0.3, 200, 600);
    embersAt(540, 1100, t, 40, 9, 1000, 1000, 4.5);
    const fl = Math.exp(-Math.max(0, t - tBurn) * 4) * (t >= tBurn ? 1 : 0); if (fl > 0.01) { ctx.fillStyle = `rgba(192,51,31,${0.55 * fl})`; ctx.fillRect(-200, -200, 1480, 2320); }
    tag('THE STORY SAYS', 540, 285, { size: 50, kind: 'dark', ...pop(lt, 0.1) });
    calm();
  } });
  cue(t12, 'sizzle', { gain: 0.7, dur: 1.4 }); cue(tBurn, 'slam', { gain: 1.0 }); cue(tBurn + 0.05, 'rumble', { gain: 0.8, dur: 1.4 });
}
