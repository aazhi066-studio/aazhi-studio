// EPISODE 13 · worker C : "Paper Theatre", lines 10-14 (Gillespie rides, the gate, crushed, trials, withdrawn, recalled, Calcutta, forgotten, end card)
//   c1  L10 → "ahead"        night stage; Gillespie's card rider slides in on a rod from the wing; limelight iris opens on him
//   c2  "ahead" → "Then"     map stage: the rider and three horsemen slide along a dotted groove from ARCOT to VELLORE
//   c3  "Then" → L11         two cannon flats roll in on rods; cut-paper starbursts on "blasted"; the gate leaves topple flat; cotton smoke
//   c4  L11 → "Around"       half-drop curtain ("later"); dawn; the tiger-stripe flag slides down the pole, the Company flag climbs
//   c5  "Around" → "About"   three rows of sepoy card figures topple flat in a wave; ~350 card drops
//   c6  "About" → "shot"     a painted cloth of 100 small figures rolls down from the fly; ACCOUNTS SAY card
//   c7  "shot" → L12         a firing line of card soldiers; starburst flashes and smoke; WITHOUT TRIAL card (no victims shown)
//   c8  L12 → "cannon"       court backdrop; judges' bench slides in; a lone sepoy figure in the limelight; AFTER TRIALS card
//   c9  "cannon" → "Others"  a cannon silhouette slides in; on "blown" a white starburst and cotton smoke fill the stage
//   c10 "Others" → "And"     grey dawn; a row of empty posts rises from the stage traps; smoke drifts; footlights low
//   c11 "And" → L13          the 1805 orders sheet flies out, the new hat slides off, the forehead mark returns; WITHDRAWN
//   c12 L13 → "Tipu's"       pop-up book stage; a card ship with two hatted silhouettes sails off on rocking sea rows; RECALLED
//   c13 "Tipu's" → "Whether" map stage: a covered palanquin slides up the groove from VELLORE to CALCUTTA
//   c14 "Whether" → L14      palace screen; veiled figures behind it; the limelight searches; NOT CLEAR
//   c15 L14 → "half"         a day backdrop rolls down over the night; the fort rises from the trap; the sun climbs on its wire
//   c16 "half" → "Follow"    1806 / 1857 cards slide in and out; footlights go out one by one; the stage greys; FORGOTTEN
//   c17 "Follow" → end       end card: the curtain falls on the little theatre; AAZHI playbill; FOLLOW
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, poly, lg } from './art.js';

// ───────────── palette + stage geometry ─────────────
const CREAM = '#EADBB8', CARD = '#F1E6C8', INK = '#3A2A1C', TXT = '#2B1408', MAR = '#7A1E22', OCH = '#C08A2E', VEL = '#8C1C24', GOLD = '#D9A441', FL = '#FFC864';
const NI1 = '#1C2340', NI2 = '#2B3561', MOON = '#F3E6C4', LAT = '#A0623E', LAT2 = '#7C4A2E', CRED = '#B8302A', BLUG = '#44506A', TIG = '#D99A2B', IRON = '#2A2A2E';
const FLASH = '#FFF6DC', SKIN = '#7A5038', WOOD = '#6B4A2E', TROU = '#2E3550', BELT = '#F4EEDD';
const OX0 = 110, OX1 = 970, OY0 = 290, OY1 = 1170, OW = OX1 - OX0, OH = OY1 - OY0, FLOOR = 1100, SERIF = 'Caladea, Georgia, serif';

// word after a given time (for repeated words)
function wx(word, line, after = -1) {
  const n = word.toLowerCase().replace(/[^a-z0-9']+/g, '');
  const w = T.words.find((w) => w.line === line && w.s > after && w.w.toLowerCase().replace(/[^a-z0-9']+/g, '').startsWith(n));
  if (!w) throw new Error(`word "${word}" not found in line ${line} after ${after}`); return w.s;
}

// ───────────── path builders + hand-tinted card drawing (used only inside cached()) ─────────────
const pp = (pts) => () => poly(pts);
const pc = (x, y, r) => () => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
const pe = (x, y, rx, ry, rot = 0) => () => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); };
const prr = (x, y, w, h, r = 2) => () => rr(x, y, w, h, r);
const bar = (x1, y1, x2, y2, w) => () => { const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2; poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]); };
function hatchIn(path, h = {}) {
  const a = h.a ?? -0.8, gap = h.gap ?? 7, [x0, y0, x1, y1] = h.box ?? [-700, -700, 700, 700];
  ctx.save(); path(); ctx.clip(); ctx.strokeStyle = h.col ?? INK; ctx.globalAlpha = h.al ?? 0.3; ctx.lineWidth = h.lw ?? 1.4; ctx.beginPath();
  const d = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ca = Math.cos(a), sa = Math.sin(a);
  for (let k = -d / 2; k < d / 2; k += gap) { const px = cx - sa * k, py = cy + ca * k; ctx.moveTo(px - ca * d / 2, py - sa * d / 2); ctx.lineTo(px + ca * d / 2, py + sa * d / 2); }
  ctx.stroke(); ctx.restore();
}
/** loose hand colouring: the wash sits a few px off the engraved outline */
function tint(path, fill, o = {}) {
  const off = o.off ?? 4;
  ctx.save(); ctx.translate(off, off * 0.7); path(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  if (o.hatch) hatchIn(path, o.hatch);
  if (o.ink !== false) { path(); ctx.strokeStyle = o.inkc ?? INK; ctx.lineWidth = o.lw ?? 3; ctx.lineJoin = 'round'; ctx.stroke(); }
}
/** the white card margin around a cut-out piece */
function back(path, m = 7) {
  path(); ctx.lineJoin = 'round'; ctx.strokeStyle = '#A88E62'; ctx.lineWidth = 2 * m + 3; ctx.stroke();
  ctx.strokeStyle = CREAM; ctx.lineWidth = 2 * m; ctx.stroke(); ctx.fillStyle = CREAM; ctx.fill();
}
function parts(list, m = 7) { for (const p of list) if (p.back !== false) back(p.path, p.m ?? m); for (const p of list) tint(p.path, p.fill, p); }
/** a flat: drawn once, with its cast shadow baked in (shadowBlur only here, never per frame) */
function flat(key, w, h, fn, o = {}) {
  const q = o.q ?? 1;
  return cached(key, w, h, q, () => {
    const main = ctx, tmp = document.createElement('canvas'); tmp.width = Math.ceil(w * q); tmp.height = Math.ceil(h * q);
    const tc = tmp.getContext('2d'); setCtx(tc); tc.scale(q, q); fn(); setCtx(main);
    if (o.night) { tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = o.night; tc.fillRect(0, 0, tmp.width, tmp.height); }
    main.save();
    if (o.shadow !== false) { main.shadowColor = 'rgba(0,0,0,0.5)'; main.shadowOffsetX = 9 * q; main.shadowOffsetY = 7 * q; main.shadowBlur = 7 * q; }
    main.drawImage(tmp, 0, 0, w, h); main.restore();
  });
}

// ───────────── the room, the table, the proscenium, footlights, curtain ─────────────
const roomImg = () => cached('cRoom', W, H, 0.5, () => {
  ctx.fillStyle = '#0B0807'; ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(540, 700, 60, 540, 700, 980); g.addColorStop(0, 'rgba(120,66,30,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = lg(0, 1270, 0, H, [[0, '#3C2719'], [0.2, '#25170F'], [1, '#110A06']]); ctx.fillRect(0, 1270, W, H - 1270);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) { const y = 1300 + i * 28 + rnd(i) * 12; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + (rnd(i + 3) - 0.5) * 18, 700, y + (rnd(i + 7) - 0.5) * 18, W, y + (rnd(i + 9) - 0.5) * 10); ctx.stroke(); }
  g = ctx.createRadialGradient(540, 1290, 20, 540, 1290, 640); g.addColorStop(0, 'rgba(255,170,80,0.2)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1270, W, 700);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 30; ell(540, 1296, 540, 18, 'rgba(0,0,0,0.6)'); ctx.restore();
});
function star8(cx, cy, r1, r2, n = 8) { const P = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; }
const velvetGrad = (x0, x1, n) => { const st = []; for (let i = 0; i <= n; i++) { const k = i / n; st.push([k, ['#5A0F15', VEL, '#B0303A', VEL][i % 4]]); } return lg(x0, 0, x1, 0, st); };
const prosImg = () => cached('cPros', W, 1320, 1, () => {
  // frame body (cream printed card) with a hole for the stage opening
  const body = () => { ctx.beginPath(); ctx.moveTo(22, 128); ctx.lineTo(380, 128); ctx.quadraticCurveTo(540, 10, 700, 128); ctx.lineTo(1058, 128); ctx.lineTo(1058, 1290); ctx.lineTo(22, 1290); ctx.closePath(); ctx.rect(OX0, OY0, OW, OH); };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; body(); ctx.fillStyle = CREAM; ctx.fill('evenodd'); ctx.restore();
  ctx.save(); body(); ctx.clip('evenodd'); hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, W, 1320); }, { box: [0, 0, W, 1320], gap: 9, al: 0.12 }); ctx.restore();
  body(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  // bevel hatch around the opening
  ctx.save(); ctx.beginPath(); ctx.rect(OX0 - 18, OY0 - 18, OW + 36, OH + 18); ctx.rect(OX0, OY0, OW, OH); ctx.clip('evenodd'); hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, W, 1320); }, { box: [0, 0, W, 1320], gap: 4, al: 0.4, a: 0.9 }); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(OX0 - 18, OY0 - 18, OW + 36, OH + 18);
  // pediment cartouche with an abstract star
  tint(pe(540, 96, 64, 40), OCH); tint(pe(540, 96, 50, 29), CREAM, { off: 2 }); tint(pp(star8(540, 96, 22, 9)), MAR, { off: 2, lw: 2 });
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 70, 110); ctx.bezierCurveTo(540 + s * 110, 70, 540 + s * 140, 130, 540 + s * 170, 104); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); circle(540 + s * 172, 104, 6, OCH); }
  // cornice + frieze
  tint(prr(40, 138, 1000, 18, 3), OCH);
  tint(prr(58, 166, 964, 98, 4), MAR, { hatch: { gap: 6, al: 0.22, a: 0.6 } });
  tint(prr(66, 174, 948, 82, 3), 'rgba(0,0,0,0)', { off: 0, inkc: GOLD, lw: 3 });
  tint(pe(540, 215, 128, 36), CREAM, { off: 3 }); tint(pe(540, 215, 116, 26), 'rgba(0,0,0,0)', { off: 0, lw: 1.5 });
  for (const x of [130, 250, 370, 710, 830, 950]) { tint(pc(x, 215, 17), OCH, { off: 2, lw: 2 }); circle(x, 215, 6, MAR); }
  // pilasters
  for (const x of [32, 976]) {
    tint(prr(x, 272, 72, 26, 3), OCH); tint(prr(x + 8, 306, 56, 846, 3), MAR, { hatch: { a: Math.PI / 2, gap: 9, al: 0.35, box: [x, 300, x + 80, 1160] } });
    tint(prr(x + 16, 318, 40, 822, 14), 'rgba(0,0,0,0)', { off: 0, inkc: GOLD, lw: 2.5 }); tint(prr(x, 1150, 72, 22, 3), OCH);
    for (let k = 0; k < 4; k++) tint(pp(star8(x + 36, 420 + k * 220, 13, 5, 4)), OCH, { off: 2, lw: 1.5 });
  }
  // apron: stage lip, footlight trough, front panel
  tint(prr(30, 1170, 1020, 14, 2), OCH);
  ctx.fillStyle = '#1A0F0A'; ctx.fillRect(120, 1184, 840, 24);
  tint(prr(30, 1208, 1020, 80, 3), MAR, { hatch: { gap: 6, al: 0.2 } });
  tint(prr(40, 1216, 1000, 64, 3), 'rgba(0,0,0,0)', { off: 0, inkc: GOLD, lw: 2.5 });
  tint(pe(540, 1248, 150, 24), CREAM, { off: 3 }); tint(pe(540, 1248, 136, 15), 'rgba(0,0,0,0)', { off: 0, lw: 1.5 });
  for (const x of [170, 300, 780, 910]) tint(pp(star8(x, 1248, 14, 6, 4)), OCH, { off: 2, lw: 1.5 });
  // velvet tormentor legs
  for (const [x0, x1] of [[OX0, OX0 + 46], [OX1 - 46, OX1]]) { ctx.fillStyle = velvetGrad(x0, x1, 4); ctx.fillRect(x0, OY0, x1 - x0, OH); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(x0, OY0, x1 - x0, OH); }
  // valance with swags + gold fringe
  const n = 5, sw = OW / n;
  ctx.beginPath(); ctx.moveTo(OX0, OY0); ctx.lineTo(OX1, OY0); ctx.lineTo(OX1, OY0 + 70);
  for (let i = n - 1; i >= 0; i--) { const xa = OX0 + (i + 1) * sw, xb = OX0 + i * sw; ctx.quadraticCurveTo((xa + xb) / 2, OY0 + 130, xb, OY0 + 70); }
  ctx.closePath(); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 8; ctx.fillStyle = velvetGrad(OX0, OX1, 30); ctx.fill(); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < n; i++) {
    const xa = OX0 + i * sw, xb = xa + sw;
    for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(xa, xb, u), y = OY0 + 70 + (1 - (2 * u - 1) ** 2) * 30; line([[x, y], [x + 1, y + 16]], GOLD, 3); }
    ctx.beginPath(); for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(xa, xb, u), y = OY0 + 66 + (1 - (2 * u - 1) ** 2) * 30; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = OCH; ctx.lineWidth = 5; ctx.stroke();
    if (i) { tint(pe(xa, OY0 + 92, 9, 26), GOLD, { off: 2, lw: 2 }); circle(xa, OY0 + 66, 8, OCH); }
  }
});
const glowImg = () => cached('cGlow', 160, 160, 0.5, () => { const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80); g.addColorStop(0, 'rgba(255,200,110,0.9)'); g.addColorStop(0.4, 'rgba(255,170,70,0.3)'); g.addColorStop(1, 'rgba(255,150,50,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 160, 160); });
const upImg = () => cached('cUp', OW, 640, 0.25, () => { const g = ctx.createRadialGradient(OW / 2, 700, 40, OW / 2, 700, 700); g.addColorStop(0, 'rgba(255,190,100,0.7)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, OW, 640); });
const lampImg = () => cached('cLamp', 50, 30, 1, () => { tint(pp([[4, 6], [46, 6], [38, 26], [12, 26]]), '#8A6A30', { off: 1, lw: 2 }); tint(pe(25, 6, 21, 4), '#C9A050', { off: 1, lw: 1.5 }); });
const NL = 9, lampX = (i) => 168 + i * (744 / (NL - 1));
/** the row of oil-lamp footlights; lv = overall level, lvi(i) = per lamp override */
function foot(t, lv = 1, lvi = null) {
  for (let i = 0; i < NL; i++) {
    const x = lampX(i), y = 1200, l = lvi ? lvi(i) : lv;
    blit(lampImg(), 25, 20, x, y + 2, 1);
    if (l <= 0.02) continue;
    const fk = 0.85 + 0.1 * Math.sin(t * 13 + i * 1.7) + 0.07 * Math.sin(t * 31 + i * 4.1), fh = 26 * fk * l;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 80, 80, x, y - 10, 0.9 + 0.3 * l, 0.7 * l * fk); ctx.restore();
    ctx.beginPath(); ctx.moveTo(x - 7 * l, y - 2); ctx.quadraticCurveTo(x - 8 * l, y - fh * 0.5, x + Math.sin(t * 9 + i) * 3, y - fh); ctx.quadraticCurveTo(x + 8 * l, y - fh * 0.5, x + 7 * l, y - 2); ctx.closePath(); ctx.fillStyle = FL; ctx.fill();
    ell(x, y - 7 * l, 3 * l, 6 * l, '#FFF4D6');
  }
}
function uplight(lv) { if (lv <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(upImg(), 0, 640, OX0, OY1 + 20, 1, 0.32 * lv); ctx.restore(); }
const curtImg = () => cached('cCurt', OW, 960, 0.6, () => {
  ctx.fillStyle = velvetGrad(0, OW, 44); ctx.fillRect(0, 0, OW, 900);
  ctx.globalAlpha = 0.12; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; for (let x = 4; x < OW; x += 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900); ctx.stroke(); } ctx.globalAlpha = 1;
  ctx.fillStyle = OCH; ctx.fillRect(0, 858, OW, 22); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-2, 858, OW + 4, 22);
  for (let x = 3; x < OW; x += 7) line([[x, 882], [x + 1, 916 + rnd(x) * 12]], GOLD, 3.5);
  for (let x = 30; x < OW; x += 80) { tint(pe(x, 928, 8, 22), GOLD, { off: 1, lw: 1.5 }); }
});
/** main curtain: p 0 = flown out, 1 = down */
function curtain(p, t) { if (p <= 0) return; const y = lerp(OY0 - 970, OY0 - 30, p); blit(curtImg(), OW / 2, 0, OX0 + OW / 2 + Math.sin(t * 2.3) * 4 * (1 - p * 0.6), y, 1); }
function iris(cx, cy, r, a = 0.72) {
  ctx.save(); ctx.beginPath(); ctx.rect(OX0 - 20, OY0 - 20, OW + 40, OH + 40); ctx.arc(cx, cy, Math.max(0, r), 0, TAU, true); ctx.fillStyle = `rgba(6,6,16,${a})`; ctx.fill('evenodd');
  if (r > 4) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = `rgba(255,236,190,${0.25 * a})`; ctx.lineWidth = 6; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,230,170,${0.08 * a})`; ctx.fill(); }
  ctx.restore();
}
/** one stage frame: room → (clip) scene → curtain → uplight → proscenium → footlights */
function frame(t, scene, o = {}) {
  blit(roomImg(), 0, 0, 0, 0);
  const k = o.fold ?? 1, lv = o.lights ?? 1;
  ctx.save();
  if (k !== 1) { ctx.translate(0, 1290); ctx.scale(1, Math.max(0.002, k)); ctx.translate(0, -1290); }
  ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, OH); ctx.clip();
  scene();
  if (o.veil) { ctx.fillStyle = o.veil; ctx.fillRect(OX0, OY0, OW, OH); }
  if (o.iris) iris(...o.iris);
  if (o.curtain) curtain(o.curtain, t);
  if (o.front) o.front();
  uplight(lv);
  if (o.flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,246,220,${0.6 * o.flash})`; ctx.fillRect(OX0, OY0, OW, OH); ctx.restore(); }
  ctx.restore();
  blit(prosImg(), 0, 0, 0, 0);
  foot(t, lv, o.lvi);
  ctx.restore();
}

// ───────────── backdrops + ground rows ─────────────
function hills(y, col, seed, amp = 60, hatch = true) {
  const P = [[0, 880], [0, y]]; for (let x = 0; x <= OW; x += 20) P.push([x, y - Math.abs(Math.sin(x * 0.006 + seed)) * amp - Math.sin(x * 0.017 + seed * 2) * amp * 0.3]); P.push([OW, 880]);
  tint(pp(P), col, { off: 3, hatch: hatch ? { gap: 8, al: 0.25, box: [0, 400, OW, 880] } : null });
}
function pinholes(n, yMax, seed) {
  ctx.save(); ctx.shadowColor = 'rgba(255,240,200,0.9)'; ctx.shadowBlur = 8;
  for (let i = 0; i < n; i++) circle(rnd(i + seed) * OW, 20 + rnd(i * 7 + seed) * yMax, 1.4 + rnd(i * 3 + seed) * 2.2, '#FFF4D8');
  ctx.restore();
}
const bdImg = (kind) => cached('cBd:' + kind, OW, OH, 0.8, () => {
  if (kind === 'night') { ctx.fillStyle = lg(0, 0, 0, OH, [[0, '#141A33'], [0.6, NI1], [1, NI2]]); ctx.fillRect(0, 0, OW, OH); pinholes(80, 560, 3); hills(700, '#232B4E', 1, 70); hills(780, '#171C36', 4, 50); }
  else if (kind === 'dawn') { ctx.fillStyle = lg(0, 0, 0, OH, [[0, NI2], [0.5, '#6A5470'], [0.85, '#C98A5E'], [1, '#D9A070']]); ctx.fillRect(0, 0, OW, OH); pinholes(25, 240, 9); hills(720, '#3A2E44', 2, 60); hills(800, '#28213A', 5, 40); }
  else if (kind === 'grey') { ctx.fillStyle = lg(0, 0, 0, OH, [[0, '#4A4E60'], [0.7, '#8A8278'], [1, '#A89A86']]); ctx.fillRect(0, 0, OW, OH); hills(740, '#5A5660', 2, 50); hills(810, '#45424C', 6, 35); }
  else if (kind === 'day') {
    ctx.fillStyle = lg(0, 0, 0, OH, [[0, '#86A8C0'], [0.7, '#CFD6C4'], [1, '#E9D8B0']]); ctx.fillRect(0, 0, OW, OH);
    for (const [cx, cy, s] of [[170, 210, 1], [620, 140, 0.8], [760, 330, 0.65]]) { const C = [[0, 0, 60], [55, -18, 52], [105, 4, 46], [-50, 10, 40]].map(([x, y, r]) => pc(cx + x * s, cy + y * s, r * s)); for (const c of C) back(c, 5); for (const c of C) tint(c, '#F4EEDF', { off: 3, lw: 2 }); }
    hills(700, '#8E9460', 2, 70); hills(790, '#6E7A48', 5, 45);
  } else if (kind === 'sea') {
    ctx.fillStyle = lg(0, 0, 0, 620, [[0, '#2E3A66'], [0.6, '#7A6680'], [1, '#D29A6E']]); ctx.fillRect(0, 0, OW, 620);
    ctx.save(); ctx.shadowColor = 'rgba(255,220,160,0.8)'; ctx.shadowBlur = 30; circle(640, 560, 54, '#F6C98A'); ctx.restore(); tint(pc(640, 560, 54), '#F6C98A', { off: 2, lw: 2 });
    ctx.fillStyle = '#2B3F66'; ctx.fillRect(0, 600, OW, OH - 600); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 600); ctx.lineTo(OW, 600); ctx.stroke();
    hatchIn(() => { ctx.beginPath(); ctx.rect(0, 600, OW, 300); }, { a: 0, gap: 10, al: 0.3, box: [0, 600, OW, 900] });
    for (const [x, y, w] of [[90, 200, 180], [470, 120, 220], [700, 260, 140]]) tint(prr(x, y, w, 16, 8), '#B8A4A8', { off: 2, lw: 1.5 });
  } else if (kind === 'court') {
    ctx.fillStyle = lg(0, 0, 0, OH, [[0, '#2E2A2C'], [1, '#4C4038']]); ctx.fillRect(0, 0, OW, OH);
    for (const x of [150, 610]) { const win = () => { ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 260); ctx.arc(x + 50, 260, 50, Math.PI, 0); ctx.lineTo(x + 100, 640); ctx.closePath(); }; back(win, 6); tint(win, '#4A5A86', { off: 3 }); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (const yy of [340, 440, 540]) line([[x, yy], [x + 100, yy]], INK, 4); line([[x + 50, 210], [x + 50, 640]], INK, 4); }
    for (let x = 0; x < OW; x += 108) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(x + 10, 700, 88, 160); }
    hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, OW, OH); }, { gap: 8, al: 0.14, box: [0, 0, OW, OH] });
    tint(prr(-10, 680, OW + 20, 16, 2), '#6A5440', { off: 2 });
  } else if (kind === 'palace') {
    ctx.fillStyle = lg(0, 0, 0, OH, [[0, '#2E1612'], [1, '#5A2A22']]); ctx.fillRect(0, 0, OW, OH);
    for (let i = 0; i < 4; i++) { const x = 40 + i * 205; const ar = () => { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x, 330); ctx.quadraticCurveTo(x + 6, 230, x + 80, 200); ctx.quadraticCurveTo(x + 154, 230, x + 160, 330); ctx.lineTo(x + 160, 760); ctx.closePath(); }; tint(ar, '#24100C', { off: 3, inkc: OCH, lw: 4 }); }
    ctx.save(); ctx.shadowColor = 'rgba(255,180,90,0.9)'; ctx.shadowBlur = 40; for (const x of [222, 632]) { line([[x, 0], [x, 150]], '#8A6A30', 3); tint(pe(x, 170, 18, 24), FL, { off: 1, lw: 2 }); } ctx.restore();
    hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, OW, OH); }, { gap: 8, al: 0.12, box: [0, 0, OW, OH] });
  }
});
const drawBd = (kind) => blit(bdImg(kind), 0, 0, OX0, OY0);
const floorImg = (dark = 0) => cached('cFloor' + dark, OW, 150, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, 150, [[0, '#3E2818'], [1, '#6A4428']]); ctx.fillRect(0, 0, OW, 150);
  ctx.strokeStyle = 'rgba(20,10,4,0.55)'; ctx.lineWidth = 2;
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(OW / 2 + k * 40, 0); ctx.lineTo(OW / 2 + k * 90, 150); ctx.stroke(); }
  for (const y of [34, 72, 116]) { ctx.fillStyle = 'rgba(10,6,2,0.7)'; ctx.fillRect(0, y, OW, 4); ctx.fillStyle = 'rgba(200,190,170,0.35)'; ctx.fillRect(0, y + 4, OW, 1.5); }
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, OW, 8);
  if (dark) { ctx.fillStyle = `rgba(10,10,24,${dark})`; ctx.fillRect(0, 0, OW, 150); }
});
const drawFloor = (dark = 0) => blit(floorImg(dark), 0, 0, OX0, 1030);
/** the slider rod: a thin wire running off into the wing */
function rod(x1, y1, x2, y2) { line([[x1, y1], [x2, y2]], '#1A120C', 5); line([[x1, y1 - 1.5], [x2, y2 - 1.5]], 'rgba(220,200,160,0.4)', 1.2); }
/** slide-in with a little wobble when it stops */
function slideX(lt, t0, dur, from, to) { const p = seg(lt, t0, t0 + dur), k = lt - t0 - dur; return lerp(from, to, eo(p)) + (k > 0 ? Math.sin(k * 20) * 7 * Math.exp(-k * 6) * Math.sign(to - from) : 0); }
const wob = (lt, t0, dur) => { const k = lt - t0 - dur; return k > 0 ? Math.sin(k * 20) * 0.03 * Math.exp(-k * 6) : 0; };

// ───────────── figures + props ─────────────
function soldierParts(o = {}) {
  const coat = o.coat ?? CRED, P = [];
  P.push({ path: prr(-26, -150, 20, 150, 3), fill: o.trou ?? TROU }, { path: prr(6, -150, 20, 150, 3), fill: o.trou ?? TROU });
  P.push({ path: prr(-30, -10, 26, 12, 4), fill: '#151010' }, { path: prr(4, -10, 26, 12, 4), fill: '#151010' });
  P.push({ path: pp([[-40, -268], [40, -268], [48, -148], [36, -126], [-36, -126], [-48, -148]]), fill: coat, hatch: { gap: 6, al: 0.3, box: [-60, -280, 60, -120] } });
  if (!o.aim) { P.push({ path: bar(-44, -260, -52, -150, 18), fill: coat }); P.push({ path: bar(44, -260, 52, -150, 18), fill: coat }); }
  P.push({ path: bar(-34, -262, 32, -138, 9), fill: BELT, back: false, lw: 1.5 }, { path: bar(34, -262, -32, -138, 9), fill: BELT, back: false, lw: 1.5 });
  P.push({ path: prr(-9, -284, 18, 20, 3), fill: SKIN }, { path: pc(0, -300, 24), fill: o.skin ?? SKIN });
  if (o.hat === 'shako') P.push({ path: pp([[-22, -318], [22, -318], [25, -368], [-25, -368]]), fill: '#18161A' }, { path: pe(8, -318, 30, 6), fill: '#18161A' }, { path: pc(0, -352, 6), fill: GOLD, back: false, lw: 1.5 });
  else P.push({ path: prr(-26, -366, 52, 52, 10), fill: '#1E1A1A' }, { path: pe(0, -316, 36, 8), fill: '#1E1A1A' }, { path: pc(0, -338, 8), fill: CREAM, back: false, lw: 1.5 });
  if (o.musket) P.push({ path: bar(48, -140, 58, -400, 7), fill: WOOD, back: false, lw: 1.5 });
  if (o.aim) { P.push({ path: bar(-20, -236, 200, -250, 9), fill: WOOD }); P.push({ path: bar(-40, -256, 40, -238, 18), fill: coat }); P.push({ path: bar(40, -230, 90, -244, 16), fill: coat }); }
  return P;
}
const sepoyImg = () => flat('cSepoy', 180, 440, () => { ctx.translate(80, 420); parts(soldierParts({ musket: true })); });
const britAimImg = () => flat('cBritAim', 320, 440, () => { ctx.translate(90, 420); parts(soldierParts({ coat: BLUG, trou: '#C8C2B2', hat: 'shako', aim: true, skin: '#C9A88E' })); });
function riderDraw(plume) {
  const HB = '#6A3E24', P = [
    { path: bar(-95, -160, -150, -120, 16), fill: HB }, // tail
    { path: bar(-55, -120, -70, -50, 14), fill: HB }, { path: bar(-70, -50, -88, -6, 12), fill: HB },
    { path: bar(-70, -120, -122, -64, 14), fill: HB }, { path: bar(-122, -64, -150, -42, 12), fill: HB },
    { path: bar(52, -118, 82, -52, 14), fill: HB }, { path: bar(82, -52, 72, -6, 12), fill: HB },
    { path: bar(70, -122, 132, -44, 14), fill: HB }, { path: bar(132, -44, 146, -14, 12), fill: HB },
    { path: pe(0, -150, 96, 46), fill: HB, hatch: { gap: 6, al: 0.3, box: [-100, -200, 100, -100] } },
    { path: pp([[52, -176], [92, -244], [124, -254], [112, -200], [86, -132]]), fill: HB },
    { path: pp([[102, -258], [150, -226], [162, -204], [142, -198], [106, -214]]), fill: HB }, { path: pp([[108, -254], [114, -276], [122, -252]]), fill: HB },
    { path: pp([[-40, -196], [40, -196], [36, -150], [-36, -150]]), fill: MAR, back: false },
    { path: bar(4, -190, 20, -128, 15), fill: '#1C1C24' },
    { path: pp([[-12, -184], [30, -184], [36, -254], [-6, -258]]), fill: plume ? '#2C3C6E' : CRED, hatch: { gap: 6, al: 0.3, box: [-20, -260, 40, -180] } },
    { path: bar(26, -240, 92, -214, 13), fill: plume ? '#2C3C6E' : CRED },
    { path: pc(14, -276, 18), fill: '#C9A88E' },
  ];
  if (plume) P.push({ path: pp([[-20, -288], [48, -292], [36, -306], [-6, -306]]), fill: '#18161A' }, { path: () => { ctx.beginPath(); ctx.moveTo(4, -304); ctx.bezierCurveTo(-30, -360, 24, -390, 30, -350); ctx.bezierCurveTo(26, -330, 14, -320, 12, -304); ctx.closePath(); }, fill: '#F4F0E6', hatch: { gap: 4, al: 0.35, box: [-30, -390, 40, -300] } });
  else P.push({ path: pp([[-4, -290], [32, -290], [30, -318], [-2, -318]]), fill: '#18161A' });
  parts(P);
  line([[96, -232], [30, -214]], '#E8D8B0', 2);
}
const riderImg = (plume) => flat('cRider' + (plume ? 'P' : ''), 380, 420, () => { ctx.translate(190, 405); riderDraw(plume); });
function cannonDraw(sil) {
  const bc = sil ? '#0C0C10' : IRON, wc = sil ? '#0C0C10' : '#4A3420';
  const P = [
    { path: pp([[-40, -60], [-200, -10], [-196, 8], [-30, -30]]), fill: wc },
    { path: pp([[-150, -98], [-120, -142], [190, -150], [192, -122], [-120, -96]]), fill: bc, hatch: sil ? null : { a: 0, gap: 5, al: 0.35, box: [-160, -160, 200, -90] } },
    { path: pc(-160, -120, 18), fill: bc }, { path: prr(176, -158, 22, 42, 4), fill: bc }, { path: prr(30, -152, 14, 34, 3), fill: bc },
    { path: () => { ctx.beginPath(); ctx.arc(-20, -78, 76, 0, TAU); ctx.arc(-20, -78, 62, 0, TAU, true); }, fill: wc },
    { path: pc(-20, -78, 16), fill: wc },
  ];
  parts(P, 6);
  if (!sil) { ctx.strokeStyle = INK; ctx.lineWidth = 7; for (let k = 0; k < 10; k++) { const a = k * TAU / 10; line([[-20 + Math.cos(a) * 16, -78 + Math.sin(a) * 16], [-20 + Math.cos(a) * 64, -78 + Math.sin(a) * 64]], wc, 9); } line([[-120, -140], [190, -148]], 'rgba(255,240,210,0.35)', 3); }
  else for (let k = 0; k < 10; k++) { const a = k * TAU / 10; line([[-20 + Math.cos(a) * 16, -78 + Math.sin(a) * 16], [-20 + Math.cos(a) * 64, -78 + Math.sin(a) * 64]], bc, 9); }
}
const cannonImg = (sil) => flat('cCannon' + (sil ? 'S' : ''), 440, 280, () => { ctx.translate(220, 262); cannonDraw(sil); });
const MUZ = [196, -137];  // muzzle in cannon local coords
function courses(path, x0, y0, x1, y1, gap = 26) {
  ctx.save(); path(); ctx.clip(); ctx.strokeStyle = 'rgba(40,20,10,0.45)'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let y = y1, r = 0; y > y0; y -= gap, r++) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); for (let x = x0 + (r % 2) * 22; x < x1; x += 44) { ctx.moveTo(x, y); ctx.lineTo(x, y - gap); } }
  ctx.stroke(); ctx.restore();
}
function merlons(x0, x1, y, w = 26, h = 26, g = 18) { const L = []; for (let x = x0; x + w <= x1 + 1; x += w + g) L.push(prr(x, y - h, w, h, 2)); return L; }
function fortDraw(doors) {
  const wall = pp([[-450, 0], [-450, -300], [450, -300], [450, 0]]);
  const bL = pp([[-410, 0], [-252, 0], [-262, -380], [-400, -380]]), bR = pp([[410, 0], [252, 0], [262, -380], [400, -380]]);
  const gate = pp([[-100, 0], [-100, -420], [100, -420], [100, 0]]);
  const all = [wall, bL, bR, gate, ...merlons(-450, 450, -300), ...merlons(-404, -258, -380), ...merlons(258, 404, -380), ...merlons(-100, 100, -420, 28, 30, 16)];
  for (const p of all) back(p, 7);
  tint(wall, LAT, { hatch: { gap: 9, al: 0.18 } }); courses(wall, -450, -300, 450, 0);
  for (const p of merlons(-450, 450, -300)) tint(p, LAT, { lw: 2 });
  for (const b of [bL, bR]) { tint(b, LAT2, { hatch: { gap: 6, al: 0.3 } }); courses(b, -420, -380, 420, 0, 30); }
  for (const p of [...merlons(-404, -258, -380), ...merlons(258, 404, -380)]) tint(p, LAT2, { lw: 2 });
  tint(gate, '#B07048', { hatch: { gap: 7, al: 0.22, a: -0.4 } }); courses(gate, -100, -420, 100, 0, 30);
  for (const p of merlons(-100, 100, -420, 28, 30, 16)) tint(p, '#B07048', { lw: 2 });
  for (const x of [-330, 330]) for (const y of [-300, -200]) tint(prr(x - 8, y, 16, 34, 6), '#1A0F0A', { off: 0, lw: 2 });
  for (const x of [-200, -150, 150, 200]) tint(prr(x - 6, -240, 12, 26, 5), '#1A0F0A', { off: 0, lw: 2 });
  const arch = () => { ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-58, -186); ctx.arc(0, -186, 58, Math.PI, 0); ctx.lineTo(58, 0); ctx.closePath(); };
  tint(arch, '#1A0F0A', { off: 0, lw: 4 }); tint(() => { ctx.beginPath(); ctx.arc(0, -186, 72, Math.PI, 0); ctx.arc(0, -186, 58, 0, Math.PI, true); ctx.closePath(); }, OCH, { off: 2, lw: 2 });
  if (doors) for (const s of [-1, 1]) doorDraw(s);
}
function doorDraw(s) {
  const p = () => { ctx.beginPath(); if (s < 0) { ctx.moveTo(-56, 0); ctx.lineTo(-56, -186); ctx.arc(0, -186, 56, Math.PI, Math.PI * 1.5); ctx.lineTo(0, 0); } else { ctx.moveTo(56, 0); ctx.lineTo(56, -186); ctx.arc(0, -186, 56, 0, -Math.PI * 0.5, true); ctx.lineTo(0, 0); } ctx.closePath(); };
  tint(p, '#5A3A22', { off: 2, hatch: { a: Math.PI / 2, gap: 9, al: 0.5 }, lw: 2.5 });
  for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) circle(s * (14 + j * 24), -30 - k * 50, 3.5, '#C9B080');
}
const fortImg = (v) => flat('cFort' + v, 920, 600, () => { ctx.translate(460, 590); fortDraw(v !== 'NoDoor'); }, { night: v === 'D' ? null : 'rgba(26,32,72,0.42)' });
const doorImg = (s) => flat('cDoor' + s, 140, 280, () => { ctx.translate(70, 270); doorDraw(s); }, { night: 'rgba(26,32,72,0.42)' });
const flagImg = (k) => cached('cFlag' + k, 190, 120, 1, () => {
  ctx.translate(5, 5);
  if (k === 'M') { tint(prr(0, 0, 176, 106, 2), TIG, { off: 2 }); ctx.strokeStyle = '#141010'; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const x = 20 + i * 28; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, 8); ctx.quadraticCurveTo(x + 14, 40, x - 2, 60); ctx.quadraticCurveTo(x - 10, 80, x + 6, 98); ctx.stroke(); } }
  else { tint(prr(0, 0, 176, 106, 2), CRED, { off: 2 }); ctx.fillStyle = BELT; for (let i = 0; i < 4; i++) ctx.fillRect(0, 14 + i * 24, 176, 9); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(0, 0, 176, 106); }
});
/** a waving cloth flag: the cached flag blitted in vertical strips */
function flag(img, x, y, s, t) {
  const n = 12, sw = img.width / n, w = img.width / img._q * s, h = img.height / img._q * s;
  for (let i = 0; i < n; i++) { const u = i / n, dy = Math.sin(t * 5 - u * 6) * 8 * u * s; ctx.drawImage(img, i * sw, 0, sw + 1, img.height, x + u * w, y + dy, w / n + 1, h); }
}
const burstImg = () => flat('cBurst', 420, 420, () => {
  ctx.translate(210, 210); const P1 = [], P2 = [];
  for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14, r = i % 2 ? 70 + rnd(i) * 30 : 160 + rnd(i + 4) * 30; P1.push([Math.cos(a) * r, Math.sin(a) * r]); }
  for (let i = 0; i < 20; i++) { const a = 0.2 + i * Math.PI / 10, r = i % 2 ? 40 : 96; P2.push([Math.cos(a) * r, Math.sin(a) * r]); }
  back(pp(P1), 6); tint(pp(P1), FLASH, { off: 3 }); tint(pp(P2), '#FFD884', { off: 2, lw: 2 });
}, { shadow: false });
function burst(lt, t0, x, y, s) { const k = lt - t0; if (k < 0 || k > 0.55) return; const p = eob(clamp(k / 0.12)), a = 1 - seg(k, 0.25, 0.55); ctx.save(); ctx.translate(x, y); ctx.rotate(k * 0.6); blit(burstImg(), 210, 210, 0, 0, s * p * (1 + k * 0.4), a); ctx.restore(); }
const puffImg = () => cached('cPuff', 160, 160, 0.5, () => {
  for (const [x, y, r, a] of [[80, 84, 60, 0.75], [58, 70, 38, 0.6], [104, 72, 40, 0.6], [80, 56, 34, 0.5]]) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(236,232,224,${a})`); g.addColorStop(0.6, `rgba(200,194,184,${a * 0.6})`); g.addColorStop(1, 'rgba(170,163,152,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 160, 160); }
});
/** cotton-wool smoke puffs swelling from (x, y) after t0 */
function cotton(lt, t0, x, y, n, spread, seed, drift = 40, size = 1, life = 3) {
  for (let i = 0; i < n; i++) {
    const k = lt - t0 - i * 0.025; if (k < 0) continue;
    const g = eo(clamp(k / 0.7)), a = clamp(k * 6) * (1 - seg(k, life * 0.6, life));
    if (a <= 0) continue;
    const px = x + (rnd(i + seed) - 0.3) * spread * g + k * drift * (0.5 + rnd(i * 3 + seed)), py = y - (rnd(i * 5 + seed) - 0.2) * spread * 0.55 * g - k * 14;
    blit(puffImg(), 80, 80, px, py, size * (0.6 + rnd(i * 7 + seed) * 0.9) * (0.5 + g * 0.7 + k * 0.08), a * 0.95);
  }
}
const moonImg = () => flat('cMoon', 170, 170, () => { tint(pc(85, 85, 56), MOON, { off: 3, hatch: { gap: 5, al: 0.18, box: [20, 20, 150, 150] } }); for (const [x, y, r] of [[70, 70, 10], [100, 96, 8], [76, 108, 6]]) tint(pc(x, y, r), '#E0CFA4', { off: 1, lw: 1.2 }); }, { shadow: false });
const sunImg = () => flat('cSun', 260, 260, () => { ctx.translate(130, 130); back(pp(star8(0, 0, 110, 70, 12)), 5); tint(pp(star8(0, 0, 110, 70, 12)), '#F2B64A', { off: 3 }); tint(pc(0, 0, 64), '#F8D27A', { off: 2, hatch: { gap: 6, al: 0.15 } }); });
function wired(img, ox, oy, x, y, s = 1, a = 1) { line([[x, OY0 - 10], [x, y - (oy - 10) * s]], 'rgba(30,22,16,0.8)', 2); blit(img, ox, oy, x, y, s, a); }

// ── playbill cards ──
const PBM = 24;
function pbImg(label, size) {
  ctx.save(); ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = '3px'; const tw = ctx.measureText(label).width; ctx.restore();
  const w = Math.ceil(tw + size * 1.7), h = Math.ceil(size * 1.85);
  return flat('cPB:' + label + size, w + PBM * 2, h + PBM * 2, () => {
    ctx.translate(PBM, PBM);
    tint(prr(0, 0, w, h, 4), CARD, { off: 0, lw: 2.5 });
    ctx.fillStyle = 'rgba(160,120,60,0.12)'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.strokeStyle = TXT; ctx.lineWidth = 3; ctx.strokeRect(8, 8, w - 16, h - 16); ctx.lineWidth = 1.2; ctx.strokeRect(14, 14, w - 28, h - 28);
    for (const x of [size * 0.42, w - size * 0.42]) tint(pp([[x, h / 2 - 9], [x + 7, h / 2], [x, h / 2 + 9], [x - 7, h / 2]]), MAR, { off: 0, lw: 1 });
    ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TXT; ctx.fillText(label, w / 2 + 1.5, h / 2 + size * 0.05);
  });
}
/** a playbill card dropping on strings from the fly loft, swinging to rest with its top at y */
function hang(lt, t0, label, x, y, size = 52, o = {}) {
  if (lt < t0) return;
  const img = pbImg(label, size), cw = img.width / img._q - PBM * 2, k = lt - t0, p = clamp(k / 0.5);
  const top = lerp(OY0 - 260, y, eob(p)) - (o.out ? eio(seg(lt, o.out, o.out + 0.45)) * (y - OY0 + 300) : 0);
  const piv = OY0 - 80, rot = Math.sin(k * 6) * 0.07 * Math.exp(-k * 2.4) + Math.sin(lt * 1.6 + x) * 0.006;
  ctx.save(); ctx.translate(x, piv); ctx.rotate(rot);
  for (const s of [-1, 1]) line([[s * cw * 0.32, top - piv + PBM * 0 + 4], [s * cw * 0.18, 0]], 'rgba(230,215,180,0.75)', 1.6);
  blit(img, img.width / img._q / 2, PBM, 0, top - piv, 1); ctx.restore();
}
/** a playbill card on a stick, popping up from a stage slot */
function stickCard(lt, t0, label, x, y, size = 34) {
  if (lt < t0) return; const img = pbImg(label, size), p = eob(clamp((lt - t0) / 0.4)), hh = img.height / img._q;
  line([[x, y], [x, y + 60]], '#2A1A10', 4); blit(img, img.width / img._q / 2, hh - PBM, x, y + 4, 1, 1, Math.max(0.01, p));
}

// ── other flats ──
const grassImg = (v) => flat('cGrass' + v, 1000, 180, () => {
  const P = [[0, 180], [0, 60]]; for (let x = 0; x <= 1000; x += 25) P.push([x, 60 - Math.abs(Math.sin(x * 0.03)) * 26 - rnd(x) * 12]); P.push([1000, 180]);
  back(pp(P), 5); tint(pp(P), v === 'D' ? '#6E7A3E' : '#2A3628', { hatch: { gap: 6, al: 0.3, box: [0, 0, 1000, 180] } });
}, { night: v === 'D' ? null : 'rgba(20,26,60,0.35)' });
const townImg = () => flat('cTown', 280, 200, () => {
  ctx.translate(140, 185);
  const P = [];
  for (const [x, w, h] of [[-110, 50, 50], [-58, 44, 64], [30, 48, 56], [82, 40, 44]]) P.push({ path: prr(x, -h, w, h, 2), fill: '#D9B88A', hatch: { gap: 6, al: 0.25 } }, { path: pp([[x - 6, -h], [x + w / 2, -h - 26], [x + w + 6, -h]]), fill: CRED });
  P.push({ path: prr(-14, -84, 40, 84, 2), fill: '#E8D4A8' }, { path: () => { ctx.beginPath(); ctx.arc(6, -84, 24, Math.PI, 0); ctx.closePath(); }, fill: '#E8D4A8', hatch: { gap: 5, al: 0.3 } });
  parts(P, 5);
});
const palkImg = () => flat('cPalk', 330, 230, () => {
  ctx.translate(165, 215);
  parts([
    { path: bar(-160, -96, 160, -96, 11), fill: WOOD },
    { path: prr(-74, -160, 148, 118, 4), fill: MAR, hatch: { gap: 6, al: 0.3 } },
    { path: () => { ctx.beginPath(); ctx.moveTo(-84, -160); ctx.quadraticCurveTo(0, -232, 84, -160); ctx.closePath(); }, fill: OCH, hatch: { gap: 5, al: 0.3 } },
    { path: pc(0, -212, 9), fill: GOLD },
    { path: prr(-50, -146, 100, 86, 3), fill: '#D9C49A', hatch: { a: Math.PI / 2, gap: 7, al: 0.4 } },
    { path: prr(-70, -46, 10, 40, 2), fill: WOOD }, { path: prr(60, -46, 10, 40, 2), fill: WOOD },
  ], 6);
});
const shipImg = () => flat('cShip', 560, 600, () => {
  ctx.translate(280, 580); const S = '#EFE3C6';
  const P = [
    { path: bar(-70, -150, -70, -520, 10), fill: WOOD }, { path: bar(60, -150, 60, -560, 10), fill: WOOD },
    { path: pp([[-140, -480], [0, -480], [8, -330], [-148, -330]]), fill: S, hatch: { gap: 7, al: 0.22 } }, { path: pp([[-150, -320], [10, -320], [18, -190], [-160, -190]]), fill: S, hatch: { gap: 7, al: 0.22 } },
    { path: pp([[-10, -520], [130, -520], [138, -370], [-18, -370]]), fill: S, hatch: { gap: 7, al: 0.22 } }, { path: pp([[-20, -360], [140, -360], [150, -200], [-28, -200]]), fill: S, hatch: { gap: 7, al: 0.22 } },
    { path: pp([[60, -560], [140, -548], [60, -536]]), fill: CRED },
    // two hatted silhouettes on deck: a top hat and a bicorne
    { path: pp([[-130, -150], [-90, -150], [-92, -214], [-128, -214]]), fill: '#1E2030' }, { path: pc(-110, -230, 15), fill: '#C9A88E' }, { path: prr(-126, -284, 32, 44, 3), fill: '#141418' }, { path: pe(-110, -244, 24, 5), fill: '#141418' },
    { path: pp([[160, -150], [200, -150], [198, -214], [162, -214]]), fill: '#2C3C6E' }, { path: pc(180, -230, 15), fill: '#C9A88E' }, { path: pe(180, -250, 34, 12), fill: '#141418' }, { path: pc(180, -258, 9), fill: '#141418' },
    { path: pp([[-250, -150], [250, -160], [212, -40], [-206, -40]]), fill: '#5A3A24', hatch: { a: 0, gap: 6, al: 0.35 } },
    { path: pp([[-244, -136], [246, -146], [240, -126], [-238, -116]]), fill: CRED, back: false, lw: 1.5 },
  ];
  parts(P, 6);
  for (let k = 0; k < 6; k++) circle(-160 + k * 66, -92, 7, '#1A0F0A');
});
const waveImg = (k) => flat('cWave' + k, 1100, 160, () => {
  const P = [[0, 160]]; for (let x = 0; x <= 1100; x += 10) P.push([x, 50 + Math.sin(x * 0.028 + k) * 18 + Math.sin(x * 0.07) * 5]); P.push([1100, 160]);
  back(pp(P), 4); tint(pp(P), ['#2E4C7C', '#26406E', '#1E3360'][k], { hatch: { a: 0, gap: 7, al: 0.3, box: [0, 0, 1100, 160] } });
  ctx.beginPath(); for (let x = 0; x <= 1100; x += 10) { const y = 54 + Math.sin(x * 0.028 + k) * 18 + Math.sin(x * 0.07) * 5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = '#E6EEF0'; ctx.lineWidth = 4; ctx.stroke();
});
const veilImg = (k) => flat('cVeil' + k, 170, 360, () => {
  ctx.translate(85, 345); const c = ['#3E5A4A', '#5A3D5C', '#8A6A3A', '#3B4A6A'][k];
  parts([
    { path: () => { ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(-58, -170, -32, -240); ctx.quadraticCurveTo(0, -300, 32, -240); ctx.quadraticCurveTo(58, -170, 60, 0); ctx.closePath(); }, fill: c, hatch: { a: Math.PI / 2 - 0.15, gap: 8, al: 0.35 } },
    { path: () => { ctx.beginPath(); ctx.ellipse(0, -262, 30, 40, 0, 0, TAU); }, fill: c },
    { path: prr(-60, -18, 120, 14, 3), fill: OCH, back: false, lw: 1.5 },
  ], 6);
});
const jaliImg = () => flat('cJali', OW, 720, () => {
  ctx.fillStyle = '#C9A66A'; ctx.fillRect(0, 0, OW, 720);
  hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, OW, 720); }, { gap: 8, al: 0.2, box: [0, 0, OW, 720] });
  const ar = (x) => () => { ctx.beginPath(); ctx.moveTo(x, 700); ctx.lineTo(x, 260); ctx.quadraticCurveTo(x + 4, 150, x + 100, 110); ctx.quadraticCurveTo(x + 196, 150, x + 200, 260); ctx.lineTo(x + 200, 700); ctx.closePath(); };
  const xs = [40, 330, 620];
  ctx.globalCompositeOperation = 'destination-out'; for (const x of xs) { ar(x)(); ctx.fill(); } ctx.globalCompositeOperation = 'source-over';
  for (const x of xs) {
    ctx.save(); ar(x)(); ctx.clip(); ctx.strokeStyle = '#B08A50'; ctx.lineWidth = 7;
    for (let k = -14; k <= 14; k++) { line([[x + k * 30, 100], [x + k * 30 + 600, 700]], '#B08A50', 6); line([[x + k * 30 + 200, 100], [x + k * 30 - 400, 700]], '#B08A50', 6); }
    ctx.restore(); ar(x)(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ar(x)(); ctx.strokeStyle = OCH; ctx.lineWidth = 3; ctx.save(); ctx.translate(-8, 0); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = MAR; ctx.fillRect(0, 0, OW, 40); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(0, 0, OW, 40); ctx.strokeRect(0, 0, OW, 720);
  for (let x = 30; x < OW; x += 60) tint(pp(star8(x, 20, 10, 4, 4)), OCH, { off: 1, lw: 1 });
}, { shadow: true });
const benchImg = () => flat('cBench', 640, 360, () => {
  ctx.translate(320, 345); const P = [];
  for (const x of [-170, 0, 170]) P.push({ path: pp([[x - 50, -150], [x + 50, -150], [x + 44, -250], [x - 44, -250]]), fill: '#2C3450', hatch: { gap: 6, al: 0.3 } }, { path: pe(x - 46, -246, 16, 6), fill: GOLD, back: false, lw: 1.5 }, { path: pe(x + 46, -246, 16, 6), fill: GOLD, back: false, lw: 1.5 }, { path: pc(x, -278, 24), fill: '#C9A88E' }, { path: pe(x, -302, 48, 14), fill: '#141418' }, { path: pc(x, -312, 12), fill: '#141418' });
  P.push({ path: pp([[-300, -170], [300, -170], [310, 0], [-310, 0]]), fill: MAR, hatch: { a: Math.PI / 2, gap: 10, al: 0.35 } }, { path: prr(-310, -180, 620, 16, 3), fill: WOOD }, { path: prr(-300, -40, 600, 12, 2), fill: GOLD, back: false, lw: 1.5 });
  parts(P, 6);
});
const postImg = () => flat('cPost', 90, 460, () => { ctx.translate(45, 450); parts([{ path: pp([[-15, 0], [-15, -400], [-6, -420], [6, -420], [15, -400], [15, 0]]), fill: WOOD, hatch: { a: Math.PI / 2 - 0.05, gap: 5, al: 0.4 } }, { path: prr(-22, -330, 44, 10, 2), fill: '#4A3220' }]); });
const sheetImg = () => flat('cSheet', 460, 580, () => {
  ctx.translate(230, 20);
  parts([{ path: pp([[-190, 0], [190, 0], [194, 500], [150, 530], [-190, 524]]), fill: '#F2E8CC', hatch: { gap: 9, al: 0.08 } }]);
  ctx.strokeStyle = 'rgba(43,20,8,0.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let r = 0; r < 11; r++) { const y = 70 + r * 36, x0 = -150 + (r === 0 ? 70 : 0), x1 = r === 10 ? 20 : 150; ctx.beginPath(); ctx.moveTo(x0, y); for (let x = x0; x < x1; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.5 + r * 2) * 4 + (rnd(x + r * 9) - 0.5) * 3); ctx.stroke(); }
  tint(pc(110, 470, 30), '#A82424', { off: 2, lw: 2 }); tint(pp(star8(110, 470, 18, 8, 6)), '#7A1414', { off: 0, lw: 1 });
});
const hatImg = () => flat('cHat', 280, 420, () => {
  ctx.translate(140, 410);
  parts([{ path: prr(-8, -230, 16, 230, 3), fill: WOOD }, { path: pe(0, -6, 60, 10), fill: WOOD }, { path: prr(-62, -352, 124, 118, 18), fill: '#1E1A1A', hatch: { gap: 5, al: 0.25, col: '#C9B48A' } }, { path: pe(0, -234, 92, 18), fill: '#1E1A1A' }, { path: pc(0, -300, 22), fill: '#C9A88E', hatch: { gap: 4, al: 0.3 } }], 6);
});
const headImg = () => flat('cHead', 440, 560, () => {
  ctx.translate(220, 545);
  const p = () => { ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(120, -150); ctx.bezierCurveTo(200, -200, 200, -420, 40, -470); ctx.bezierCurveTo(-60, -500, -130, -440, -140, -370); ctx.lineTo(-150, -330); ctx.lineTo(-180, -270); ctx.lineTo(-150, -260); ctx.lineTo(-150, -238); ctx.lineTo(-160, -226); ctx.lineTo(-148, -212); ctx.quadraticCurveTo(-150, -170, -100, -168); ctx.lineTo(-90, -150); ctx.lineTo(-120, 0); ctx.closePath(); };
  back(p, 8); tint(p, SKIN, { hatch: { gap: 6, al: 0.22 } });
});
const gridImg = () => cached('cGrid', OW, 760, 0.8, () => {
  ctx.fillStyle = lg(0, 0, 0, 760, [[0, '#E4D3AC'], [1, '#D2BC90']]); ctx.fillRect(0, 0, OW, 760);
  hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, OW, 760); }, { gap: 9, al: 0.1, box: [0, 0, OW, 760] });
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    const x = 92 + c * 75, y = 92 + r * 60;
    tint(pp([[x - 18, y + 24], [x - 16, y + 4], [x + 16, y + 4], [x + 18, y + 24]]), CRED, { off: 2, lw: 1.6 }); tint(pc(x, y - 6, 9), SKIN, { off: 1, lw: 1.4 });
    tint(prr(x - 10, y - 30, 20, 18, 4), '#1E1A1A', { off: 1, lw: 1.2 }); line([[x - 13, y + 5], [x + 11, y + 22]], BELT, 2.4); line([[x + 13, y + 5], [x - 11, y + 22]], BELT, 2.4);
  }
  ctx.strokeStyle = TXT; ctx.lineWidth = 4; ctx.strokeRect(30, 30, OW - 60, 680); ctx.lineWidth = 1.5; ctx.strokeRect(40, 40, OW - 80, 660);
});
const rollerImg = () => cached('cRoller', OW + 40, 50, 1, () => { ctx.fillStyle = lg(0, 0, 0, 44, [[0, '#8A6A40'], [0.4, '#D2B27A'], [1, '#5A4024']]); rr(0, 4, OW + 40, 40, 20); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); });
/** a painted cloth rolling down from the fly: draw(img) clipped from OY0 to the roller */
function rollDown(img, p, y0 = OY0, h = OH) { if (p <= 0) return; const yb = y0 + h * p; ctx.save(); ctx.beginPath(); ctx.rect(OX0, y0, OW, yb - y0); ctx.clip(); blit(img, 0, 0, OX0, y0, 1); ctx.restore(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(OX0, yb, OW, 10); if (p < 1) blit(rollerImg(), 0, 0, OX0 - 20, yb - 22, 1); else ctx.fillStyle = INK, ctx.fillRect(OX0, yb - 6, OW, 6); }
// maps painted on the stage floor
const mapImg = (k) => cached('cMap' + k, OW, 560, 0.8, () => {
  ctx.fillStyle = '#D8C59A'; ctx.fillRect(0, 0, OW, 560);
  hatchIn(() => { ctx.beginPath(); ctx.rect(0, 0, OW, 560); }, { gap: 10, al: 0.12, box: [0, 0, OW, 560] });
  if (k === 'A') {
    ctx.beginPath(); ctx.moveTo(-10, 430); ctx.bezierCurveTo(250, 380, 500, 520, 870, 440); ctx.strokeStyle = '#6F8DA8'; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    for (const [x, y] of [[400, 120], [470, 140], [560, 110], [120, 150], [760, 160]]) { tint(pp([[x - 40, y + 20], [x, y - 24], [x + 40, y + 20]]), '#B49A6A', { off: 2, lw: 2, hatch: { gap: 4, al: 0.4 } }); }
  } else {
    const sea = () => { ctx.beginPath(); ctx.moveTo(OW, 0); ctx.lineTo(760, 0); ctx.bezierCurveTo(700, 90, 690, 160, 640, 220); ctx.bezierCurveTo(580, 300, 600, 420, 520, 560); ctx.lineTo(OW, 560); ctx.closePath(); };
    tint(sea, '#7E9CB4', { off: 3, hatch: { a: 0, gap: 7, al: 0.35, box: [400, 0, OW, 560] } });
    for (const [x, y] of [[200, 200], [280, 150], [130, 320]]) tint(pp([[x - 40, y + 20], [x, y - 24], [x + 40, y + 20]]), '#B49A6A', { off: 2, lw: 2, hatch: { gap: 4, al: 0.4 } });
  }
  ctx.strokeStyle = MAR; ctx.lineWidth = 6; ctx.strokeRect(6, 6, OW - 12, 548); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(16, 16, OW - 32, 528);
});
const qpt = (p0, c, p1, u) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
function groove(p0, c, p1, upto = 1) { for (let u = 0; u <= upto; u += 0.025) { const [x, y] = qpt(p0, c, p1, u); ell(x, y, 5, 3, 'rgba(43,20,8,0.85)'); } }

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const t10 = L(10), tAhead = Wd('ahead', 10), tThen = Wd('Then', 10), tBlast = Wd('blasted', 10), tGate = Wd('gate', 10);
  const t11 = L(11), tCrushed = Wd('crushed', 11), tAround = Wd('Around', 11), tThree = Wd('three', 11), tKilled = Wd('killed', 11), tAbout = Wd('About', 11), tShot = Wd('shot', 11), tWithout = Wd('without', 11);
  const t12 = L(12), tSome = Wd('some', 12), tCannon = Wd('cannon', 12), tBlown = Wd('blown', 12), tOthers = Wd('Others', 12), tHanged = Wd('hanged', 12);
  const tAnd = wx('and', 12, tHanged), tDress = Wd('dress', 12), tWithdr = Wd('withdrawn', 12);
  const t13 = L(13), tRecalled = Wd('recalled', 13), tTipu = Wd('Tipu', 13), tCalc = Wd('Calcutta', 13), tWhether = Wd('Whether', 13), tNot = Wd('not', 13);
  const t14 = L(14), tStands = Wd('stands', 14), tHalf = Wd('half', 14), tEarly = Wd('early', 14), tForgot = Wd('forgotten', 14), tFollow = Wd('Follow', 14), tAazhi = Wd('Aazhi', 14);

  // c1 ─ Gillespie's card rider slides in on a rod; the limelight opens on him
  add({ id: 'c1', at: t10, cam: [520, 760], zoom: 0.07, note: 'night stage, moon on a wire; Gillespie (plumed rider card) slides in from the wing on a rod; limelight iris opens on him; COL. GILLESPIE card',
    draw(lt, d, t) {
      const x = slideX(lt, 0, 0.9, OX0 - 260, 500), y = FLOOR + 30 + Math.sin(lt * 15) * 5;
      frame(t, () => {
        drawBd('night'); wired(moonImg(), 85, 85, lerp(760, 820, lt / d), 430 - Math.sin(lt / d * 1.2) * 30, 1);
        blit(grassImg('N'), 500, 180, 540 + lt * -20, 1050, 1); drawFloor(0.4);
        rod(x - 160, y - 60, OX0 - 80, y - 60);
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(lt * 15) * 0.02 + wob(lt, 0, 0.9)); blit(riderImg(true), 190, 405, 0, 0, 1.05); ctx.restore();
        hang(lt, 0.55, 'COL. GILLESPIE', 700, 470, 40);
      }, { iris: [x + 10, y - 220, lerp(30, 340, eo(seg(lt, 0.15, 0.9))), 0.7], lights: 0.8 });
    } });
  cue(t10, 'whoosh', { gain: 0.35 }); cue(t10 + 0.1, 'slide', { gain: 0.3, pan: -0.4 }); cue(t10 + 0.3, 'drum', { gain: 0.25 }); cue(t10 + 0.6, 'pop', { gain: 0.3 });

  // c2 ─ map stage: the riders slide along the groove from Arcot to Vellore
  const A0 = [150, 330], AC = [430, 190], A1 = [720, 310], MY = 760, MS = 0.62;
  add({ id: 'c2', at: tAhead, cam: [560, 860], zoom: 0.07, note: 'map stage on the floor (river, hills); dotted groove from ARCOT town card to a small VELLORE fort card; Gillespie + three horsemen slide along it',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('night'); wired(moonImg(), 85, 85, 300, 420, 0.8);
        blit(mapImg('A'), 0, 0, OX0, MY, 1, 1, MS);
        ctx.save(); ctx.translate(OX0, MY); ctx.scale(1, MS); groove(A0, AC, A1); ctx.restore();
        const sc = (p) => [OX0 + p[0], MY + p[1] * MS];
        const [ax, ay] = sc(A0), [vx, vy] = sc(A1);
        blit(townImg(), 140, 185, ax - 10, ay + 10, 0.8);
        blit(fortImg('N'), 460, 590, vx + 10, vy + 14, 0.22);
        stickCard(lt, 0.1, 'ARCOT', ax - 10, ay - 200, 30); stickCard(lt, 0.35, 'VELLORE', vx + 10, vy - 210, 30);
        const u0 = lerp(0.12, 0.72, eio(seg(lt, 0, d)));
        for (let i = 3; i >= 0; i--) {
          const u = Math.max(0, u0 - i * 0.07), [mx, my] = qpt(A0, AC, A1, u), [px, py] = sc([mx, my]);
          ctx.save(); ctx.translate(px, py + 4 + Math.sin(lt * 16 + i * 2) * 3); ctx.rotate(Math.sin(lt * 16 + i) * 0.03); blit(riderImg(i === 0), 190, 405, 0, 0, i === 0 ? 0.36 : 0.3); ctx.restore();
        }
      }, { lights: 0.85 });
    } });
  cue(tAhead, 'slide', { gain: 0.3 }); cue(tAhead + 0.1, 'drum', { gain: 0.3 }); cue(tAhead + 0.9, 'drum', { gain: 0.25 });

  // c3 ─ the guns come; starbursts; the gate leaves topple flat
  const bl = tBlast - tThen, gf = bl + 0.12;
  add({ id: 'c3', at: tThen, cam: [540, 880], zoom: 0.08, note: 'night fort flat with closed gate; two cannon flats roll in on rods from both wings; on "blasted" cut-paper starbursts pop, the gate leaves topple flat, cotton smoke billows',
    draw(lt, d, t) {
      const fl = Math.max(0, 1 - (lt - bl) / 0.35) * (lt > bl ? 1 : 0);
      frame(t, () => {
        drawBd('night');
        blit(fortImg('NoDoor'), 460, 590, 540, FLOOR - 20, 0.95);
        if (lt > gf) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 80, 80, 540, FLOOR - 140, 1.6, 0.5 * (1 - seg(lt, gf + 0.2, d))); ctx.restore(); }
        for (const s of [-1, 1]) { const ph = eio(seg(lt, gf, gf + 0.45)) * Math.PI / 2 * 0.98; blit(doorImg(s), 70, 270, 540, FLOOR - 20, 0.95, 1, 0.95 * Math.cos(ph)); }
        blit(grassImg('N'), 500, 180, 540, 1080, 1); drawFloor(0.3);
        for (const s of [-1, 1]) {
          const rec = lt > bl ? -s * 26 * Math.exp(-(lt - bl) * 4) * Math.sin(Math.min(1, (lt - bl) * 8) * Math.PI / 2) : 0;
          const x = slideX(lt, s < 0 ? 0 : 0.2, 1.0, 540 + s * 760, 540 + s * 250) + rec, y = 1150;
          rod(x + s * 150, y - 40, x + s * 600, y - 40);
          ctx.save(); ctx.translate(x, y); ctx.scale(-s, 1); blit(cannonImg(false), 220, 262, 0, 0, 0.8); ctx.restore();
          burst(lt, bl + (s > 0 ? 0.05 : 0), x - s * MUZ[0] * 0.8, y + MUZ[1] * 0.8, 0.6);
          cotton(lt, bl + 0.02, x - s * MUZ[0] * 0.8, y + MUZ[1] * 0.8, 9, 160, s > 0 ? 11 : 5, -s * 30, 1.1, 3);
        }
        burst(lt, gf, 540, FLOOR - 180, 0.9);
        cotton(lt, gf + 0.05, 540, FLOOR - 160, 12, 260, 21, 20, 1.3, 3);
      }, { flash: fl, lights: 0.8 + fl * 0.4 });
    } });
  cue(tThen, 'rumble', { gain: 0.35 }); cue(tThen + 0.1, 'slide', { gain: 0.3, pan: -0.5 }); cue(tThen + 0.3, 'slide', { gain: 0.3, pan: 0.5 });
  cue(tBlast, 'slam', { gain: 0.6 }); cue(tBlast + 0.05, 'rumble', { gain: 0.5 }); cue(tBlast + 0.4, 'thud', { gain: 0.45 }); cue(tGate, 'thud', { gain: 0.3 });

  // c4 ─ half-drop curtain ("later"); dawn; the flags change
  add({ id: 'c4', at: t11, cam: [540, 760], zoom: 0.06, note: 'half-drop curtain falls and rises ("within hours"); dawn backdrop; the gold tiger-stripe flag slides down the gate pole, the striped Company flag climbs it; smoke over the walls',
    draw(lt, d, t) {
      const cp = lt < 0.45 ? eo(lt / 0.45) * 0.55 : 0.55 * (1 - eio(seg(lt, 0.6, 1.1)));
      frame(t, () => {
        drawBd('dawn');
        const fx = 540, fy = FLOOR - 40, fs = 0.8, top = fy - 420 * fs, pole = top - 300;
        cotton(lt, -2, 380, top + 40, 6, 200, 3, 18, 1.2, 9); cotton(lt, -2, 720, top + 60, 6, 200, 7, 18, 1.1, 9);
        line([[fx, top], [fx, pole]], '#2A1A10', 6);
        const pM = eio(seg(lt, 0.7, 1.5)), pC = eio(seg(lt, tCrushed - t11 - 0.1, d - 0.1));
        ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, top - OY0); ctx.clip();
        flag(flagImg('M'), fx + 3, lerp(pole + 6, top + 10, pM), 0.9, t);
        flag(flagImg('C'), fx + 3, lerp(top + 10, pole + 6, pC), 0.9, t);
        ctx.restore();
        blit(fortImg('N'), 460, 590, fx, fy, fs);
        blit(grassImg('N'), 500, 180, 540, 1080, 1); drawFloor(0.2);
      }, { curtain: cp, lights: 0.8 });
    } });
  cue(t11, 'whoosh', { gain: 0.4 }); cue(t11 + 0.7, 'slide', { gain: 0.25 }); cue(tCrushed, 'slide', { gain: 0.3 });

  // c5 ─ rows of sepoy cards topple flat; ~350
  const ROWS = [[9, 0.4, 960], [8, 0.5, 1030], [7, 0.62, 1120]];
  add({ id: 'c5', at: tAround, cam: [540, 820], zoom: 0.07, note: 'dawn stage; three rows of red-coat sepoy card figures stand in the floor grooves and topple flat in a wave, left to right; ~350 card drops',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('dawn'); drawFloor(0.3);
        ctx.fillStyle = 'rgba(60,40,30,0.5)'; ctx.fillRect(OX0, 900, OW, 140);
        ROWS.forEach(([n, s, y], r) => {
          for (let i = 0; i < n; i++) {
            const x = OX0 + 70 + (i + 0.5) * (OW - 140) / n + (r % 2) * 20, k = lt - 0.5 - i * 0.13 - r * 0.22 - rnd(i + r * 9) * 0.1;
            const ph = k > 0 ? Math.min(1, eo(k / 0.35)) * Math.PI / 2 * 0.96 : 0, bounce = k > 0.35 ? Math.sin((k - 0.35) * 22) * 0.06 * Math.exp(-(k - 0.35) * 8) : 0;
            const sy = Math.max(0.03, Math.cos(ph) + bounce);
            ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(i * 1.7 + r) * 0.03 * (1 - ph)); blit(sepoyImg(), 80, 420, 0, 0, s, 1, s * sy); ctx.restore();
          }
        });
        cotton(lt, 0.8, 300, 1000, 8, 300, 4, 40, 1, 4);
        hang(lt, tThree - tAround - 0.2, '~350', 540, 420, 78);
      }, { lights: 0.75 });
    } });
  cue(tAround, 'whoosh', { gain: 0.25 }); for (let k = 0; k < 8; k++) cue(tAround + 0.55 + k * 0.28, 'tock', { gain: 0.18 + 0.03 * (k % 3), pan: -0.6 + k * 0.17 }); cue(tThree - 0.2, 'pop', { gain: 0.35 });

  // c6 ─ a painted cloth of 100 figures rolls down; ACCOUNTS SAY
  add({ id: 'c6', at: tAbout, cam: [540, 720], zoom: 0.06, note: 'dark stage; a painted cloth of 100 small sepoy figures (10 x 10) rolls down from the fly loft on its roller; ACCOUNTS SAY card swings in in front',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('night'); drawFloor(0.5);
        rollDown(gridImg(), eo(seg(lt, 0, 0.9)), OY0 + 70, 760);
        hang(lt, 0.6, 'ACCOUNTS SAY', 540, 1010, 50);
      }, { lights: 0.7 });
    } });
  cue(tAbout, 'zip', { gain: 0.35 }); cue(tAbout + 0.6, 'pop', { gain: 0.35 });

  // c7 ─ firing line: flashes and smoke; WITHOUT TRIAL
  const FIRE = [[200, 1070, 0.62], [300, 1110, 0.68], [150, 1150, 0.75], [260, 1190, 0.8]];
  add({ id: 'c7', at: tShot, cam: [460, 860], zoom: 0.08, note: 'dim dawn; a line of four blue-grey card soldiers aiming right from the left wing; cut-paper starbursts pop at the muzzles one after another, cotton smoke rolls across an empty right half; WITHOUT TRIAL card',
    draw(lt, d, t) {
      let fl = 0;
      frame(t, () => {
        drawBd('dawn'); drawFloor(0.5);
        FIRE.forEach(([x0, y, s], i) => {
          const x = slideX(lt, 0, 0.35, x0 - 300, x0), tf = 0.35 + i * 0.12, rec = lt > tf ? -10 * Math.exp(-(lt - tf) * 6) : 0;
          rod(x - 60 * s, y - 120 * s, OX0 - 60, y - 120 * s);
          blit(britAimImg(), 90, 420, x + rec, y, s);
          const mx = x + rec + 200 * s, my = y - 250 * s;
          burst(lt, tf, mx + 16, my, 0.3 * s / 0.7); cotton(lt, tf, mx + 40, my, 6, 120, 31 + i, 70, 0.8, 3);
          if (lt > tf) fl = Math.max(fl, 1 - (lt - tf) / 0.25);
        });
        hang(lt, tWithout - tShot + 0.1, 'WITHOUT TRIAL', 720, 470, 44);
      }, { flash: fl * 0.5, lights: 0.6 + 0.3 * fl, veil: 'rgba(16,14,30,0.3)' });
    } });
  for (let i = 0; i < 4; i++) cue(tShot + 0.35 + i * 0.12, 'thud', { gain: 0.4, pan: -0.5 }); cue(tWithout + 0.1, 'pop', { gain: 0.3 });

  // c8 ─ the trial: bench + lone figure in the limelight
  add({ id: 'c8', at: t12, cam: [540, 820], zoom: 0.07, note: 'court backdrop (panelled wall, barred windows); the judges\' bench with three bicorne officers slides in from the right; a lone sepoy card stands at left in the limelight; AFTER TRIALS card',
    draw(lt, d, t) {
      const sx = slideX(lt, 0.1, 0.6, OX0 - 120, 290);
      frame(t, () => {
        drawBd('court'); drawFloor(0.2);
        const bx = slideX(lt, 0, 0.6, OX1 + 360, 650);
        rod(bx + 300, 1000, OX1 + 80, 1000);
        blit(benchImg(), 320, 345, bx, 1110, 0.95);
        rod(sx - 40, 1000, OX0 - 80, 1000);
        ctx.save(); ctx.translate(sx, 1130); ctx.rotate(wob(lt, 0.1, 0.6)); blit(sepoyImg(), 80, 420, 0, 0, 0.95); ctx.restore();
        hang(lt, 0.15, 'AFTER TRIALS', 540, 360, 46);
      }, { iris: [sx, 950, lerp(520, 210, eio(seg(lt, 0.4, 1.4))), 0.55], lights: 0.85 });
    } });
  cue(t12, 'slide', { gain: 0.3, pan: 0.5 }); cue(t12 + 0.1, 'slide', { gain: 0.25, pan: -0.5 }); cue(t12 + 0.2, 'pop', { gain: 0.3 }); cue(tSome, 'tock', { gain: 0.45 });

  // c9 ─ cannon silhouette; white starburst + cotton smoke (nothing else shown)
  const bw = tBlown - tCannon;
  add({ id: 'c9', at: tCannon, cam: [560, 840], zoom: 0.09, note: 'dark rose dawn; a black cannon silhouette slides in; on "blown" a huge white cut-paper starburst and cotton-wool smoke fill the stage (no figures)',
    draw(lt, d, t) {
      const fl = lt > bw ? Math.max(0, 1 - (lt - bw) / 0.4) : 0;
      frame(t, () => {
        drawBd('dawn'); drawFloor(0.6);
        const x = slideX(lt, 0, 0.4, OX0 - 260, 420), y = 1140;
        rod(x - 180, y - 40, OX0 - 60, y - 40);
        blit(cannonImg(true), 220, 262, x - (lt > bw ? 20 * Math.exp(-(lt - bw) * 5) : 0), y, 1.25);
        const mx = x + MUZ[0] * 1.25, my = y + MUZ[1] * 1.25;
        burst(lt, bw, mx + 60, my, 1.5);
        cotton(lt, bw + 0.03, mx + 80, my, 18, 420, 41, 50, 1.8, 4);
      }, { flash: fl, lights: 0.6 + 0.5 * fl, veil: 'rgba(30,10,20,0.25)' });
    } });
  cue(tCannon, 'slide', { gain: 0.3, pan: -0.5 }); cue(tBlown, 'slam', { gain: 0.65 }); cue(tBlown + 0.03, 'rumble', { gain: 0.6 });

  // c10 ─ a row of empty posts rises from the traps
  const POSTS = [[220, 1110, 0.95], [380, 1080, 0.82], [520, 1056, 0.72], [640, 1036, 0.63], [745, 1020, 0.56], [835, 1006, 0.5]];
  add({ id: 'c10', at: tOthers, cam: [600, 820], zoom: 0.07, note: 'grey dawn; a row of six empty wooden posts rises one after another from the stage traps, receding; thin smoke drifts across; footlights low',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('grey'); drawFloor(0.45);
        ctx.fillStyle = 'rgba(70,64,60,0.6)'; ctx.fillRect(OX0, 960, OW, 80);
        POSTS.slice().reverse().forEach(([x, y, s], j) => {
          const i = POSTS.length - 1 - j, p = eob(seg(lt, 0.05 + i * 0.1, 0.45 + i * 0.1));
          ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, y - OY0); ctx.clip(); blit(postImg(), 45, 450, x, y + (1 - p) * 430 * s, s); ctx.restore();
          ctx.fillStyle = 'rgba(10,6,2,0.8)'; ctx.fillRect(x - 24 * s, y - 2, 48 * s, 5);
        });
        cotton(lt, -3, 150, 900, 10, 400, 51, 90, 1.3, 9);
      }, { lights: 0.45, veil: 'rgba(30,30,40,0.18)' });
    } });
  cue(tOthers, 'whoosh', { gain: 0.25 }); for (let i = 0; i < 6; i++) cue(tOthers + 0.3 + i * 0.1, 'tock', { gain: 0.15 });

  // c11 ─ orders withdrawn
  const wd = tWithdr - tAnd;
  add({ id: 'c11', at: tAnd, cam: [540, 800], zoom: 0.06, note: 'warm stage; the 1805 orders sheet (abstract script, wax seal) hangs centre and flies up out of sight; the new round hat on its stand slides off on a rod; a big head profile gets its forehead mark back; WITHDRAWN card',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('court'); drawFloor(0.1);
        // head profile on the right; the mark returns
        const hx = slideX(lt, 0, 0.5, OX1 + 300, 790);
        rod(hx + 120, 900, OX1 + 80, 900); blit(headImg(), 220, 545, hx, 1160, 0.95);
        const mp = eo(seg(lt, wd + 0.25, wd + 0.65));
        if (mp > 0) { const mx = hx - 120, my = 1160 - 425 * 0.95; ctx.save(); ctx.globalAlpha = mp; rr(mx - 6, my - 30 * mp, 12, 60 * mp, 5); ctx.fillStyle = '#F2E6CF'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); circle(mx, my + 34, 6 * mp, '#C0262A'); ctx.restore(); }
        // the hat slides off to the left wing
        const ax = lerp(slideX(lt, 0, 0.4, OX0 - 200, 260), OX0 - 260, eio(seg(lt, wd, wd + 0.5)));
        rod(ax - 60, 1000, OX0 - 80, 1000); blit(hatImg(), 140, 410, ax, 1130, 0.85);
        // the orders sheet flies out
        const sy = lerp(OY0 - 560, 380, eob(seg(lt, 0, 0.5))) - eio(seg(lt, wd - 0.1, wd + 0.35)) * 700;
        for (const s of [-1, 1]) line([[540 + s * 150, OY0 - 20], [540 + s * 150, sy + 20]], 'rgba(230,215,180,0.75)', 1.6);
        blit(sheetImg(), 230, 20, 540, sy, 0.85);
        hang(lt, wd + 0.05, 'WITHDRAWN', 520, 560, 60);
      }, { lights: 1 });
    } });
  cue(tAnd, 'slide', { gain: 0.25 }); cue(tAnd + 0.1, 'whoosh', { gain: 0.25 }); cue(tWithdr - 0.1, 'whoosh', { gain: 0.4 }); cue(tWithdr, 'slide', { gain: 0.3, pan: -0.5 }); cue(tWithdr + 0.1, 'pop', { gain: 0.4 }); cue(tWithdr + 0.4, 'sparkle', { gain: 0.2 });

  // c12 ─ pop-up book stage; the ship sails off; RECALLED
  add({ id: 'c12', at: t13, cam: [560, 800], zoom: 0.07, note: 'the stage pops up from the table like a book page; dusk sea backdrop with a sun; a card ship with a top-hat and a bicorne silhouette sails off right over three rocking sea rows; RECALLED card',
    draw(lt, d, t) {
      const fold = lt < 0.5 ? eob(clamp(lt / 0.5)) : 1;
      frame(t, () => {
        drawBd('sea');
        blit(waveImg(0), 550, 160, 540 + Math.sin(t * 1.4) * 30, 960, 1);
        const sx = lerp(520, 920, eio(seg(lt, 0.3, d))), sy = 1010 + Math.sin(t * 2.2) * 8;
        rod(sx + 200, sy - 80, OX1 + 120, sy - 80);
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(t * 2.2 + 1) * 0.04); blit(shipImg(), 280, 580, 0, 0, 0.78); ctx.restore();
        blit(waveImg(1), 550, 160, 540 - Math.sin(t * 1.6) * 36, 1060, 1);
        blit(waveImg(2), 550, 160, 540 + Math.sin(t * 1.9 + 1) * 40, 1170, 1);
        hang(lt, tRecalled - t13, 'RECALLED', 360, 450, 56);
      }, { fold, lights: 0.9 });
    } });
  cue(t13, 'whoosh', { gain: 0.45 }); cue(t13 + 0.45, 'thud', { gain: 0.3 }); cue(t13 + 0.6, 'bubbles', { gain: 0.15 }); cue(tRecalled, 'pop', { gain: 0.35 });

  // c13 ─ map: Vellore → Calcutta
  const B0 = [300, 470], BC = [380, 200], B1 = [690, 80], MY2 = 740, MS2 = 0.62;
  add({ id: 'c13', at: tTipu, cam: [600, 860], zoom: 0.08, note: 'map stage: land and a hatched sea up the east coast; a covered palanquin card slides up the dotted groove from the VELLORE fort card to the far CALCUTTA town card, shrinking with distance',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('dawn');
        blit(mapImg('B'), 0, 0, OX0, MY2, 1, 1, MS2);
        const sc = (p) => [OX0 + p[0], MY2 + p[1] * MS2], u = eio(seg(lt, 0.2, d - 0.1));
        ctx.save(); ctx.translate(OX0, MY2); ctx.scale(1, MS2); groove(B0, BC, B1); ctx.restore();
        const [cx, cy] = sc(B1), [vx, vy] = sc(B0);
        blit(townImg(), 140, 185, cx + 10, cy + 6, 0.5);
        stickCard(lt, tCalc - tTipu - 0.5, 'CALCUTTA', cx + 4, cy - 170, 32);
        const [px, py] = sc(qpt(B0, BC, B1, u)), s = lerp(0.6, 0.26, u);
        blit(fortImg('D'), 460, 590, vx - 30, vy + 20, 0.2);
        stickCard(lt, 0.05, 'VELLORE', vx - 30, vy - 210, 28);
        ctx.save(); ctx.translate(px, py + Math.sin(lt * 10) * 3 * s); ctx.rotate(Math.sin(lt * 10) * 0.02); blit(palkImg(), 165, 215, 0, 0, s); ctx.restore();
      }, { lights: 0.9 });
    } });
  cue(tTipu, 'slide', { gain: 0.3 }); cue(tCalc - 0.5, 'pop', { gain: 0.3 });

  // c14 ─ the palace screen; veiled figures; NOT CLEAR
  add({ id: 'c14', at: tWhether, cam: [540, 780], zoom: 0.06, note: 'warm palace interior; four veiled figures sway faintly behind a pierced lattice screen with three arches; the limelight searches across them and narrows; NOT CLEAR card',
    draw(lt, d, t) {
      const ix = 540 + Math.sin(lt * 1.6) * 260, ir = lerp(260, 150, seg(lt, 2, d));
      frame(t, () => {
        drawBd('palace'); drawFloor(0.3);
        [[230, 0, 0.9], [420, 1, 0.85], [650, 2, 0.88], [840, 3, 0.82]].forEach(([x, k, s], i) => { ctx.save(); ctx.translate(x + Math.sin(t * 0.9 + i) * 6, 1090); ctx.rotate(Math.sin(t * 1.1 + i * 2) * 0.015); blit(veilImg(k), 85, 345, 0, 0, s); ctx.restore(); });
        blit(jaliImg(), 0, 0, OX0, 440, 1);
        hang(lt, tNot - tWhether - 0.15, 'NOT CLEAR', 540, 360, 62);
      }, { iris: [ix, 800, ir, 0.6], lights: 0.85 });
    } });
  cue(tWhether, 'heartbeat', { gain: 0.25 }); cue(tNot - 0.15, 'pop', { gain: 0.4 });

  // c15 ─ day backdrop rolls down; the fort rises from the trap; sun on its wire
  add({ id: 'c15', at: t14, cam: [540, 760], zoom: 0.07, note: 'a painted day sky rolls down over the night backdrop on its roller; the laterite fort rises from the stage trap and stands; the paper sun climbs on its wire',
    draw(lt, d, t) {
      frame(t, () => {
        drawBd('night'); rollDown(bdImg('day'), eo(seg(lt, 0, 1.0)));
        if (lt > 0.6) wired(sunImg(), 130, 130, 800, lerp(760, 470, eo(seg(lt, 0.6, d))), 0.75);
        const fp = eob(seg(lt, tStands - t14 - 0.3, tStands - t14 + 0.4));
        ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, FLOOR - 30 - OY0); ctx.clip(); blit(fortImg('D'), 460, 590, 540, FLOOR - 30 + (1 - fp) * 520, 0.92); ctx.restore();
        blit(grassImg('D'), 500, 180, 540 + lt * 14, 1085, 1); drawFloor(0);
      }, { lights: 1 });
    } });
  cue(t14, 'zip', { gain: 0.4 }); cue(tStands - 0.3, 'swell', { gain: 0.35 }); cue(tStands + 0.2, 'thud', { gain: 0.25 });

  // c16 ─ 1806 / 1857; footlights go out; FORGOTTEN
  const fg = tForgot - tHalf;
  add({ id: 'c16', at: tHalf, cam: [540, 760], zoom: 0.06, note: 'day fort; 1806 and 1857 playbill cards slide in on rods from both wings then away; the footlights go out one by one, the stage greys and dims; FORGOTTEN card drops',
    draw(lt, d, t) {
      const g = seg(lt, fg - 0.5, d);
      frame(t, () => {
        drawBd('day'); wired(sunImg(), 130, 130, 800, 470 + g * 90, 0.75);
        blit(fortImg('D'), 460, 590, 540, FLOOR - 30, 0.92);
        blit(grassImg('D'), 500, 180, 540 - lt * 12, 1085, 1); drawFloor(0);
        for (const [s, lab, t0] of [[-1, '1806', 0], [1, '1857', 0.25]]) {
          const out = eio(seg(lt, fg - 0.6, fg - 0.15)), x = lerp(slideX(lt, t0, 0.5, 540 + s * 700, 540 + s * 230), 540 + s * 720, out), y = 640;
          rod(x + s * 120, y, 540 + s * 700, y);
          const img = pbImg(lab, 72); blit(img, img.width / img._q / 2, img.height / img._q / 2, x, y, 1);
        }
        if (lt > 0.7 && lt < fg - 0.2) { const p = seg(lt, 0.7, 1.4); for (let k = 0; k < 14 * p; k++) { const xx = lerp(370, 710, k / 14); circle(xx, 640, 5, 'rgba(240,230,200,0.85)'); } }
        hang(lt, fg, 'FORGOTTEN', 540, 380, 64);
      }, { lights: 1 - g * 0.6, lvi: (i) => (1 - seg(lt, fg - 0.4 + i * 0.12, fg - 0.25 + i * 0.12) * 0.9) * (1 - g * 0.2), veil: `rgba(40,36,34,${g * 0.55})` });
    } });
  cue(tHalf, 'slide', { gain: 0.3, pan: -0.5 }); cue(tHalf + 0.25, 'slide', { gain: 0.3, pan: 0.5 }); cue(tEarly, 'tock', { gain: 0.25 }); cue(tForgot, 'pop', { gain: 0.35 }); cue(tForgot + 0.2, 'swell', { gain: 0.2 });

  // c17 ─ end card: curtain falls; AAZHI; FOLLOW
  add({ id: 'c17', at: tFollow, cam: [540, 700], zoom: 0.035, note: 'end card: the velvet curtain falls on the little theatre with a bounce; footlights glow warm; an AAZHI playbill drops in front of the curtain, then a FOLLOW card',
    draw(lt, d, t) {
      const cp = lt < 0.75 ? eob(clamp(lt / 0.75)) : 1;
      frame(t, () => {
        drawBd('day'); blit(fortImg('D'), 460, 590, 540, FLOOR - 30, 0.92); drawFloor(0);
      }, { curtain: cp, lights: 0.5 + 0.5 * seg(lt, 0, 0.8), veil: 'rgba(40,36,34,0.5)',
        front: () => { hang(lt, tAazhi - tFollow - 0.1, 'AAZHI', 540, 560, 120); hang(lt, tAazhi - tFollow + 0.35, 'FOLLOW', 540, 860, 60); } });
    } });
  cue(tFollow, 'whoosh', { gain: 0.45 }); cue(tFollow + 0.7, 'thud', { gain: 0.4 }); cue(tAazhi - 0.1, 'pop', { gain: 0.45 }); cue(tAazhi + 0.35, 'pop', { gain: 0.35 }); cue(tAazhi + 0.6, 'bell', { gain: 0.3 });
}
