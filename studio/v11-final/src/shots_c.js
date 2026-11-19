// EPISODE 11 · worker C : "Living Mosaic", lines 10-14 (old texts, Pattanam digs, sherds + wharf, MAY BE, end card)
//   c1  L10 → "in"        Muziris port mosaic (ship, sea ripple, warehouses, palms, sacks, amphorae); its tiles start popping out and falling
//   c2  "in" → L11        the port is gone to bare mortar; only a scroll and a papyrus sheet (abstract dash rows) remain; OLD TEXTS; smalti glint
//   c3  L11 → "digs"      tile flip to marble floor; mosaic digits 2007 fly in digit by digit and click into place; glint sweep
//   c4  "digs" → "village"  top-down green field; turf tiles pop out pit by pit opening a 3x3 trench grid; 2007 DIGS
//   c5  "village" → L12   tile flip to Pattanam: coconut palms over fields, river winding to the sea, ripple, birds; gold ring at the river mouth
//   c6  L12 → "Roman"     terracotta sherd tiles rain into a heap while a mosaic counter counts up to 1,000+
//   c7  "Roman" → "traces"  an amphora reassembles from flying shard groups; ROMAN AMPHORA
//   c8  "traces" → L13    top-down river bank: wharf timbers fly in but stay incomplete, dashed outline of the guess; POSSIBLE WHARF
//   c9  L13 → "Not"       two roundels assemble: MUZIRIS? (port, full of holes) linked by gold tiles to PATTANAM (village); MAY BE
//   c10 "Not" → "search"  a decorative lapis panel; tiles fall out leaving a big '?' of bare mortar; UNCERTAIN
//   c11 "search" → L14    tile flip to the port mosaic half-complete; tiles keep flying in to fill the gaps (the search goes on)
//   c12 L14 → "Follow"    Roman ship + pepper sacks + gold coins; on "lost" the picture flips tile by tile into green fields from the bottom up
//   c13 "Follow" → end    end card: AAZHI assembled in gold smalti tiles, glint sweep, FOLLOW tablet, little ship on a rippling wave band
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, fillP } from './art.js';

// ───────────── grid + palette ─────────────
const S = 24, NC = 45, NR = 80, N = NC * NR;
const GROUT = '#2A2622', MORT = '#6E6A62', HOLE = '#FF00FF';
const LAP = ['#1F4E8C', '#2E6DB4', '#7FB2E0'], CREST = '#F4F1E8';
const TER = '#B5552F', TER2 = '#D9794A', PEP = '#232020', VINE = '#2E3A24', GOLD = '#D9A63A', GOLD2 = '#F3CF6B', RED = '#9E2A2B';
const MUD = '#8C6A3A', MUD2 = '#B08A52', GRN = '#4E7A3A', GRN2 = '#7FA65A', CREAM = '#F4EEDF';
const SKY = '#B7D3EA', SKY2 = '#D3E3EE';
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const WATERS = LAP.map(hx), GOLDS = [GOLD, GOLD2].map(hx), MARBLE = ['#E9DFC9', '#D8CBB0', '#F4EEDF'].map(hx);
const near = (r, g, b, Ls, tol) => Ls.some(([R, G, B]) => Math.abs(r - R) + Math.abs(g - G) + Math.abs(b - B) < tol);
const sm = (x) => x * x * (3 - 2 * x);
const cx_ = (i) => (i % NC) * S + S / 2, cy_ = (i) => ((i / NC) | 0) * S + S / 2;
function vnoise(x, y, sd = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy), h = (a, b) => rnd(a * 57.31 + b * 131.7 + sd * 7.7 + 3.1);
  return lerp(lerp(h(ix, iy), h(ix + 1, iy), fx), lerp(h(ix, iy + 1), h(ix + 1, iy + 1), fx), fy);
}

// ───────────── vector paint helpers (used only while sampling a picture) ─────────────
const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const Tl = (c, r, w, h, col) => R(c * S, r * S, w * S, h * S, col);           // rect in tile units (crisp)
const E = (x, y, rx, ry, c, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fillStyle = c; ctx.fill(); };
const Ci = (x, y, r, c) => E(x, y, r, r, c);
const strokeQ = (pts, c, w) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1])); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };

function border() {
  for (let c = 0; c < NC; c++) for (const r of [0, NR - 1]) Tl(c, r, 1, 1, '#3A3430');
  for (let r = 0; r < NR; r++) for (const c of [0, NC - 1]) Tl(c, r, 1, 1, '#3A3430');
  for (let c = 1; c < NC - 1; c++) for (const r of [1, NR - 2]) Tl(c, r, 1, 1, (c + r) % 2 ? TER : CREAM);
  for (let r = 1; r < NR - 1; r++) for (const c of [1, NC - 2]) Tl(c, r, 1, 1, (c + r) % 2 ? TER : CREAM);
  for (let c = 2; c < NC - 2; c++) for (const r of [2, NR - 3]) Tl(c, r, 1, 1, '#3A3430');
  for (let r = 2; r < NR - 2; r++) for (const c of [2, NC - 3]) Tl(c, r, 1, 1, '#3A3430');
}
function palm(x, by, h, lean, sd) {
  const tx = x + lean * h, ty = by - h;
  strokeQ([[x, by], [x + lean * h * 0.15, by - h * 0.55], [tx, ty]], '#6B4A2E', 30);
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI + (k + 0.5) / 9 * Math.PI + (rnd(sd * 9 + k) - 0.5) * 0.3, Lf = h * (0.26 + rnd(sd * 3 + k) * 0.08) + 70;
    strokeQ([[tx, ty], [tx + Math.cos(a) * Lf * 0.55, ty + Math.sin(a) * Lf * 0.5 - Lf * 0.2], [tx + Math.cos(a) * Lf, ty + Math.sin(a) * Lf * 0.35 + Lf * 0.45]], k % 2 ? '#1F3A1C' : '#2F5A2A', 36);
  }
  Ci(tx - 10, ty + 18, 15, MUD); Ci(tx + 14, ty + 16, 15, '#6B4E2A');
}
function ship(cx, wl, s) {
  ctx.save(); ctx.translate(cx, wl); ctx.scale(s, s);
  strokeQ([[150, -20], [195, 70]], '#4A2E1A', 16);
  fillP([[-215, -32], [180, -32], [150, 42], [-160, 42]], '#6B3E22');
  fillP([[150, -32], [200, -110], [240, -160], [228, -96], [172, 42]], '#6B3E22');
  fillP([[-215, -32], [-262, -52], [-160, 42]], '#6B3E22');
  R(-205, -22, 380, 16, TER);
  R(-9, -300, 18, 270, '#4A2E1A'); R(-140, -292, 280, 14, '#4A2E1A');
  fillP([[-128, -278], [128, -278], [140, -62], [-140, -62]], CREAM);
  R(-136, -186, 272, 26, RED);
  ctx.restore();
}
function amph(cx, top, h, c1 = TER, c2 = TER2) {
  strokeQ([[cx - 0.07 * h, top + 0.07 * h], [cx - 0.2 * h, top + 0.1 * h], [cx - 0.12 * h, top + 0.3 * h]], c1, 0.04 * h);
  strokeQ([[cx + 0.07 * h, top + 0.07 * h], [cx + 0.2 * h, top + 0.1 * h], [cx + 0.12 * h, top + 0.3 * h]], c1, 0.04 * h);
  R(cx - 0.1 * h, top, 0.2 * h, 0.045 * h, c1); R(cx - 0.065 * h, top + 0.04 * h, 0.13 * h, 0.24 * h, c1);
  E(cx, top + 0.46 * h, 0.2 * h, 0.22 * h, c1);
  fillP([[cx - 0.185 * h, top + 0.5 * h], [cx + 0.185 * h, top + 0.5 * h], [cx + 0.035 * h, top + 0.92 * h], [cx - 0.035 * h, top + 0.92 * h]], c1);
  R(cx - 0.028 * h, top + 0.9 * h, 0.056 * h, 0.1 * h, c1);
  E(cx - 0.085 * h, top + 0.44 * h, 0.055 * h, 0.15 * h, c2);
}
function sack(cx, by, w, h) {
  ctx.beginPath(); ctx.roundRect(cx - w / 2, by - h, w, h, w * 0.3); ctx.fillStyle = MUD; ctx.fill();
  R(cx - w * 0.22, by - h - 18, w * 0.44, 22, '#6B4E2A'); E(cx, by - h - 22, w * 0.3, 14, PEP);
  for (let k = 0; k < 5; k++) Ci(cx - w * 0.5 + rnd(cx + k) * w * 1.1, by + 2 - rnd(cx * 3 + k) * 10, 11, k % 2 ? PEP : VINE);
}
function skyPort(sunX = 820, sunY = 250) {
  R(0, 0, W, 330, SKY); R(0, 330, W, 300, SKY2); Ci(sunX, sunY, 88, GOLD); Ci(sunX, sunY, 62, GOLD2);
}

// ───────────── pictures (painted once as vectors, sampled to one colour per tile) ─────────────
const P_PORT = () => {
  skyPort();
  fillP([[0, 610], [0, 540], [120, 515], [260, 556], [380, 540], [500, 610]], GRN); fillP([[700, 610], [820, 572], [960, 580], [1080, 560], [1080, 610]], GRN2);
  R(0, 600, W, 210, LAP[1]); R(0, 800, W, 320, LAP[0]);
  ship(560, 860, 1);
  for (const [x, y, s] of [[200, 990, 1], [880, 1035, 0.85]]) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fillP([[-74, -14], [74, -14], [52, 16], [-52, 16]], '#5A3420'); R(-26, -38, 52, 24, MUD); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(0, 1090); ctx.quadraticCurveTo(540, 1060, W, 1100); ctx.lineTo(W, 1300); ctx.lineTo(0, 1300); ctx.closePath(); ctx.fillStyle = MUD2; ctx.fill();
  R(30, 930, 270, 170, TER2); fillP([[18, 944], [165, 856], [312, 944]], TER); R(140, 1010, 50, 90, '#5A3420'); R(62, 962, 34, 30, '#5A3420'); R(236, 962, 34, 30, '#5A3420');
  for (const x of [400, 495, 590]) amph(x, 1095, 175);
  sack(760, 1262, 110, 120); sack(880, 1262, 110, 132); sack(820, 1150, 100, 100);
  palm(1010, 1210, 700, -0.22, 1); palm(70, 1170, 640, 0.14, 2);
  R(0, 1290, W, 26, '#6B4E2A'); R(0, 1316, W, 620, MUD);
};
const P_TEXTS = () => {
  R(0, 0, W, H, HOLE);
  Tl(10, 16, 25, 11, '#EAD9AE'); Tl(8, 15, 2, 13, GOLD); Tl(35, 15, 2, 13, GOLD); Tl(8, 14, 2, 1, TER); Tl(8, 28, 2, 1, TER); Tl(35, 14, 2, 1, TER); Tl(35, 28, 2, 1, TER);
  for (let r = 18; r <= 25; r += 2) { let c = 12; while (c < 33) { const l = 1 + Math.floor(rnd(r * 31 + c) * 3); Tl(c, r, Math.min(l, 33 - c), 1, '#4A3A2A'); c += l + 1; } }
  Tl(13, 33, 19, 19, '#D9C38E'); for (let c = 13; c < 32; c += 3) Tl(c, 33, 1, 19, '#CDB57E');
  for (let r = 35; r <= 49; r += 2) { let c = 15; while (c < 30) { const l = 1 + Math.floor(rnd(r * 17 + c * 3) * 3); Tl(c, r, Math.min(l, 30 - c), 1, '#3A2E22'); c += l + 1; } }
  for (let k = 0; k < 14; k++) { const e = Math.floor(rnd(k * 5.3) * 4), j = Math.floor(rnd(k * 2.9) * 19); Tl(e === 0 ? 13 + j : e === 1 ? 13 + j : e === 2 ? 13 : 31, e === 0 ? 33 : e === 1 ? 51 : 33 + j, 1, 1, HOLE); }
};
const P_BG = () => border();
const P_FIELD = () => {
  for (let c = 0; c < NC; c++) Tl(c, 0, 1, NR, c % 3 === 2 ? GRN2 : c % 3 === 1 ? '#5E8A40' : GRN);
  R(0, 1040, W, 48, MUD2);
  for (const [x, y] of [[110, 150], [980, 1150], [940, 200]]) for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; strokeQ([[x, y], [x + Math.cos(a) * 130, y + Math.sin(a) * 130]], k % 2 ? '#2E5A2A' : VINE, 30); }
};
const PIT = (c, r) => { // which pit (0-8) a tile is in, -1 baulk, -2 outside
  if (c < 8 || c > 35 || r < 11 || r > 38) return -2;
  const a = c - 8, b = r - 11; if (a % 9 === 0 || b % 9 === 0) return -1; return Math.floor(b / 9) * 3 + Math.floor(a / 9);
};
const P_TRENCH = () => {
  P_FIELD();
  for (let r = 11; r <= 38; r++) for (let c = 8; c <= 35; c++) {
    const p = PIT(c, r); if (p === -1) { Tl(c, r, 1, 1, '#C8B28A'); continue; }
    const a = (c - 8) % 9, b = (r - 11) % 9, ed = Math.min(a - 1, 8 - a, b - 1, 8 - b);
    Tl(c, r, 1, 1, ed === 0 ? MUD : ed === 1 ? '#6B4E2A' : '#5A4028');
    if (ed > 0 && rnd(c * 13.1 + r * 7.7) > 0.86) Tl(c, r, 1, 1, rnd(c + r) > 0.5 ? TER : TER2);
  }
};
const P_VILLAGE = () => {
  R(0, 0, W, 240, SKY); R(0, 240, W, 160, SKY2);
  R(0, 400, W, 130, LAP[1]); R(0, 400, W, 30, LAP[2]);
  const greens = [GRN, GRN2, '#6E9A4A', '#5E8A40'];
  for (let y = 528, j = 0; y < H; y += 72, j++) { let x = -((j * 53) % 120); while (x < W) { const w = 140 + rnd(j * 7 + x) * 200; R(x, y, w - 24, 48, greens[Math.floor(rnd(j * 3.3 + x * 0.7) * 4)]); R(x, y + 48, w, 24, '#3E6A2E'); R(x + w - 24, y, 24, 72, '#3E6A2E'); x += w; } }
  ctx.beginPath(); ctx.moveTo(840, 440); ctx.bezierCurveTo(700, 640, 900, 780, 700, 900); ctx.bezierCurveTo(540, 1000, 600, 1120, 380, 1230); ctx.strokeStyle = LAP[1]; ctx.lineWidth = 110; ctx.lineCap = 'round'; ctx.stroke();
  for (const [x, y] of [[420, 780], [300, 840], [960, 700], [520, 640]]) { R(x - 40, y - 40, 80, 50, '#D9C9A8'); fillP([[x - 52, y - 36], [x, y - 80], [x + 52, y - 36]], TER); R(x - 10, y - 14, 20, 24, '#5A3420'); }
  palm(130, 1200, 680, 0.12, 3); palm(270, 1010, 470, -0.1, 4); palm(980, 1220, 720, -0.15, 5); palm(860, 1080, 420, 0.1, 6); palm(560, 960, 360, -0.08, 7);
};
const P_BANK = (wharf) => () => {
  R(0, 0, W, H, '#8E6A3C');
  for (let k = 0; k < 40; k++) Ci(rnd(k * 3.1) * 520, rnd(k * 7.7) * 1900, 30 + rnd(k) * 40, k % 3 ? MUD : '#A07E48');
  for (let k = 0; k < 16; k++) Ci(rnd(k * 9.1) * 260, rnd(k * 4.3) * 1900, 40 + rnd(k * 2) * 30, k % 2 ? GRN : '#5E8A40');
  ctx.beginPath(); ctx.moveTo(W, 0); for (let y = 0; y <= H; y += 40) ctx.lineTo(616 + Math.sin(y / 260) * 34 + (y > 1000 ? (y - 1000) * 0.05 : 0), y); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = LAP[1]; ctx.fill();
  R(840, 0, 240, H, LAP[0]);
  if (!wharf) return;
  for (let r = 13; r <= 48; r++) Tl(19, r, 6, 1, r % 2 ? '#E2C08A' : '#C9A066');
  for (let r = 29; r <= 31; r++) Tl(25, r, 10, 1, r % 2 ? '#E2C08A' : '#C9A066');
  for (let r = 13; r <= 48; r += 3) { Tl(18, r, 1, 1, '#3A2A1C'); Tl(25, r, 1, 1, '#3A2A1C'); }
  for (let c = 26; c <= 35; c += 3) { Tl(c, 28, 1, 1, '#3A2A1C'); Tl(c, 32, 1, 1, '#3A2A1C'); }
};
const RA = [360, 430], RB = [720, 960], RR = 220;
const P_ROUND = () => {
  border();
  ctx.save(); ctx.beginPath(); ctx.arc(RA[0], RA[1], RR, 0, TAU); ctx.clip();
  R(0, 0, W, 480, SKY); R(0, 480, W, 200, LAP[1]); R(0, 580, W, 100, LAP[0]); Ci(450, 300, 46, GOLD2); ship(350, 560, 0.62); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(RB[0], RB[1], RR, 0, TAU); ctx.clip();
  R(0, 700, W, 120, SKY2); for (let y = 800, j = 0; y < 1200; y += 48, j++) R(0, y, W, 48, [GRN, GRN2, '#6E9A4A'][j % 3]);
  strokeQ([[900, 790], [760, 1000], [600, 1190]], LAP[1], 70);
  R(690, 1010, 96, 96, '#C8B28A'); R(714, 1034, 48, 48, '#5A4028');
  palm(600, 1060, 250, 0.1, 8); palm(860, 1010, 210, -0.1, 9); ctx.restore();
  for (const [x, y] of [RA, RB]) { ctx.beginPath(); ctx.arc(x, y, RR + 12, 0, TAU); ctx.strokeStyle = GOLD; ctx.lineWidth = 26; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, RR + 32, 0, TAU); ctx.strokeStyle = '#3A3430'; ctx.lineWidth = 14; ctx.stroke(); }
};
const BLUE = '#2B5C9A';
const P_DECOR = () => () => {
  border();
  Tl(5, 12, 35, 38, TER); Tl(6, 13, 33, 36, CREAM); Tl(7, 14, 31, 34, BLUE);
  for (let c = 7; c < 38; c++) for (const r of [14, 47]) if (c % 2) Tl(c, r, 1, 1, '#7FA0C8');
  ctx.save(); ctx.beginPath(); ctx.rect(168, 336, 744, 816); ctx.clip();
  for (const [x, y] of [[168, 336], [912, 336], [168, 1152], [912, 1152]]) { Ci(x, y, 150, TER); Ci(x, y, 100, CREAM); Ci(x, y, 60, RED); }
  ctx.beginPath(); ctx.arc(540, 744, 300, 0, TAU); ctx.strokeStyle = CREAM; ctx.lineWidth = 26; ctx.stroke();
  for (let k = 0; k < 8; k++) E(540 + Math.cos(k * TAU / 8) * 92, 744 + Math.sin(k * TAU / 8) * 92, 70, 30, k % 2 ? GOLD : GOLD2, k * TAU / 8);
  Ci(540, 744, 48, RED); Ci(540, 744, 24, GOLD2);
  ctx.restore();
};
const Q_MASK = () => { ctx.beginPath(); ctx.arc(540, 610, 175, Math.PI * 1.02, Math.PI * 0.5); ctx.lineTo(540, 900); ctx.strokeStyle = '#000'; ctx.lineWidth = 92; ctx.lineCap = 'butt'; ctx.stroke(); Ci(540, 1040, 58, '#000'); };
const P_SHIP = () => {
  skyPort(230, 240);
  R(0, 560, W, 200, LAP[1]); R(0, 760, W, 320, LAP[0]);
  ship(560, 900, 1.45);
  R(0, 1070, W, 230, MUD2); for (let x = 0; x < W; x += 144) R(x, 1070, 24, 230, '#9C7A48');
  sack(130, 1262, 120, 140); sack(262, 1262, 120, 150); sack(196, 1120, 110, 110); sack(850, 1262, 120, 150); sack(975, 1262, 110, 130);
  amph(420, 1080, 180); amph(520, 1080, 180);
  for (let row = 0; row < 4; row++) for (let k = 0; k <= 3 - row; k++) Ci(640 + k * 48 + row * 24, 1240 - row * 40, 22, (k + row) % 2 ? GOLD : GOLD2);
  R(0, 1290, W, 26, '#6B4E2A'); R(0, 1316, W, 620, MUD);
};
const P_FIELDS = () => {
  skyPort(230, 240);
  for (let k = 0; k < 14; k++) Ci(k * 84 + rnd(k) * 30, 455, 40 + rnd(k * 3) * 26, VINE);
  R(0, 455, W, 60, VINE);
  const greens = [GRN, GRN2, '#6E9A4A', '#5E8A40'];
  let y = 500, j = 0; while (y < H) { const h = Math.min(120, 24 + j * 14); R(0, y, W, h, greens[j % 4]); R(0, y + h - 24, W, 24, '#3E6A2E'); for (let x = (j * 97) % 200; x < W; x += 220 + j * 20) R(x, y, 24, h, '#3E6A2E'); y += h; j++; }
  palm(150, 1260, 1060, 0.08, 11); palm(940, 1200, 980, -0.1, 12); palm(560, 760, 520, 0.05, 13);
};
const P_END = () => {
  border(); Tl(4, 16, 37, 15, '#3A3430'); Tl(5, 17, 35, 13, '#22406E');
  Tl(3, 43, 39, 6, LAP[1]); for (let c = 3; c < 42; c++) if (c % 4 < 2) Tl(c, 43, 1, 1, LAP[2]); Tl(3, 47, 39, 2, LAP[0]);
  ship(540, 1104, 0.36);
};
const P_PORTH = P_PORT;

// ───────────── mosaic builder: one colour per tile, cached tile layer ─────────────
const MZ = new Map();
function mosaic(key, paint, o = {}) {
  let m = MZ.get(key); if (m) return m;
  const k = 4, cw = W / k, ch = H / k, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const c2 = cv.getContext('2d', { willReadFrequently: true }), prev = ctx;
  setCtx(c2); c2.scale(1 / k, 1 / k); paint(); setCtx(prev);
  const d = c2.getImageData(0, 0, cw, ch).data;
  let md = null; if (o.mask) { c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, cw, ch); c2.scale(1 / k, 1 / k); setCtx(c2); o.mask(); setCtx(prev); md = c2.getImageData(0, 0, cw, ch).data; }
  const K = new Uint8Array(N), RGB = new Uint8Array(N * 3), CS = new Array(N);
  for (let i = 0; i < N; i++) {
    const x = i % NC, y = (i / NC) | 0, p = ((Math.min(ch - 1, ((y + 0.5) * S / k) | 0)) * cw + Math.min(cw - 1, ((x + 0.5) * S / k) | 0)) * 4;
    let r = d[p], g = d[p + 1], b = d[p + 2], kind = 1;
    if (d[p + 3] < 128) { [r, g, b] = MARBLE[rnd(i * 3.1 + 7) < 0.45 ? 0 : rnd(i * 5.3) < 0.55 ? 2 : 1]; kind = 0; }
    else if (r > 230 && g < 40 && b > 230) kind = 4;
    else if (near(r, g, b, WATERS, 30)) kind = 2; else if (near(r, g, b, GOLDS, 36)) kind = 3;
    if (md && md[p + 3] > 128) kind = 4;
    if (o.holes && kind !== 4 && o.holes(x, y, i)) kind = 4;
    K[i] = kind; RGB[i * 3] = r; RGB[i * 3 + 1] = g; RGB[i * 3 + 2] = b;
  }
  for (let i = 0; i < N; i++) {
    const x = i % NC, y = (i / NC) | 0; let r = RGB[i * 3], g = RGB[i * 3 + 1], b = RGB[i * 3 + 2];
    if (o.tint) { const tt = o.tint(x, y, i, K); if (tt) [r, g, b] = tt; }
    if (K[i] !== 0 && K[i] !== 4 && o.outline !== false) {
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < NC && Y < NR && K[Y * NC + X] === 0; });
      if (nb) { r = r * 0.45 + 42 * 0.55; g = g * 0.45 + 38 * 0.55; b = b * 0.45 + 34 * 0.55; }
    }
    const j = 1 + (rnd(i * 1.71 + 0.3) - 0.5) * (K[i] === 0 ? 0.08 : 0.16);
    CS[i] = `rgb(${Math.min(255, r * j) | 0},${Math.min(255, g * j) | 0},${Math.min(255, b * j) | 0})`;
  }
  m = { key, K, RGB, CS, L: {} }; MZ.set(key, m); return m;
}
const mortarTex = () => cached('c:mort', W, H, 1, () => {
  R(0, 0, W, H, MORT);
  for (let k = 0; k < 900; k++) { const x = rnd(k * 1.3) * W, y = rnd(k * 2.7 + 1) * H, r = 40 + rnd(k * 3.9) * 180, a0 = rnd(k * 5.1) * TAU;
    ctx.beginPath(); ctx.arc(x, y, r, a0, a0 + 0.3 + rnd(k) * 0.8); ctx.strokeStyle = k % 2 ? 'rgba(40,36,30,0.28)' : 'rgba(160,154,142,0.25)'; ctx.lineWidth = 1 + rnd(k * 7) * 2.5; ctx.stroke(); }
  for (let k = 0; k < 5000; k++) R(rnd(k * 1.17) * W, rnd(k * 3.31) * H, 2, 2, k % 3 ? 'rgba(30,28,24,0.3)' : 'rgba(200,195,185,0.25)');
});
function tileAt(x, y, s, css, sd, sc = 1, rot = 0, a = 1) {
  const w = (s - 3) * (0.93 + rnd(sd * 1.3 + 0.7) * 0.08);
  ctx.save(); ctx.translate(x + (rnd(sd + 2.2) - 0.5) * 1.6, y + (rnd(sd + 3.3) - 0.5) * 1.6); ctx.rotate((rnd(sd * 0.7 + 1.1) - 0.5) * 0.1 + rot); ctx.scale(sc, sc);
  if (a < 1) ctx.globalAlpha *= a;
  ctx.fillStyle = css; ctx.fillRect(-w / 2, -w / 2, w, w);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(-w / 2, -w / 2, w, 2.5); ctx.fillRect(-w / 2, -w / 2, 2.5, w);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-w / 2, w / 2 - 2.5, w, 2.5); ctx.fillRect(w / 2 - 2.5, -w / 2, 2.5, w);
  ctx.restore();
}
const lay = (m) => cached('c:L:' + m.key, W, H, 1, () => {
  R(0, 0, W, H, GROUT);
  ctx.save(); ctx.beginPath(); let any = false;
  for (let i = 0; i < N; i++) if (m.K[i] === 4) { ctx.rect((i % NC) * S, ((i / NC) | 0) * S, S, S); any = true; }
  if (any) { ctx.clip(); ctx.drawImage(mortarTex(), 0, 0); } ctx.restore();
  for (let i = 0; i < N; i++) if (m.K[i] !== 4) tileAt(cx_(i), cy_(i), S, m.CS[i], i);
});
const cell = (Lc, i) => { const x = (i % NC) * S, y = ((i / NC) | 0) * S; ctx.drawImage(Lc, x, y, S, S, x, y, S, S); };
const lst = (m, name, pred) => m.L[name] || (m.L[name] = Array.from({ length: N }, (_, i) => i).filter(pred));

// ───────────── morph: per-tile change from picture A to picture B ─────────────
const DIFF = new Map();
function diff(A, B) {
  const k = A.key + '>' + B.key; let d = DIFF.get(k); if (d) return d; d = [];
  for (let i = 0; i < N; i++) if (A.K[i] !== B.K[i] || Math.abs(A.RGB[i * 3] - B.RGB[i * 3]) + Math.abs(A.RGB[i * 3 + 1] - B.RGB[i * 3 + 1]) + Math.abs(A.RGB[i * 3 + 2] - B.RGB[i * 3 + 2]) > 12) d.push(i);
  DIFF.set(k, d); return d;
}
/** p 0..1 overall progress; th(x,y,i) 0..1 when each tile goes; style 'fall' | 'fly' | 'flip'; from(i) → [dx,dy,rot] for 'fly' */
function morph(A, B, p, th, style, o = {}) {
  const LA = lay(A), LB = lay(B), D = diff(A, B), w = o.w || 0.16, us = new Float32Array(D.length);
  let done = 0;
  for (let j = 0; j < D.length; j++) { const i = D[j]; const u = clamp((p - th(i % NC, (i / NC) | 0, i) * (1 - w)) / w); us[j] = u; if (u >= 1) done++; }
  const useB = done > D.length / 2; ctx.drawImage(useB ? LB : LA, 0, 0);
  for (let j = 0; j < D.length; j++) { const u = us[j]; if (useB && u <= 0) cell(LA, D[j]); else if (!useB && u >= 1) cell(LB, D[j]); }
  for (let j = 0; j < D.length; j++) {
    const u = us[j]; if (u <= 0 || u >= 1) continue; const i = D[j], x = cx_(i), y = cy_(i);
    if (style === 'fall') {
      if (useB) {} else cell(LB, i);
      if (A.K[i] === 4) continue;
      const dy = u < 0.2 ? -10 * u / 0.2 : -10 + (u - 0.2) * (u - 0.2) * 1500, dx = (rnd(i * 2.3) - 0.5) * 160 * u;
      tileAt(x + dx, y + dy, S, A.CS[i], i, 1 + 0.18 * Math.min(1, u * 5), (rnd(i * 1.9) - 0.5) * 7 * u, 1 - sm(seg(u, 0.65, 1)));
    } else if (style === 'fly') {
      if (useB) cell(LA, i);
      if (B.K[i] === 4) continue;
      const [fx, fy, fr] = o.from ? o.from(i) : [(rnd(i * 2.3) - 0.5) * 900, -500 - rnd(i * 3.7) * 700, (rnd(i) - 0.5) * 8], e = eo(u);
      tileAt(x + fx * (1 - e), y + fy * (1 - e), S, B.CS[i], i, 1 + (1 - e) * 0.5, fr * (1 - e), clamp(u * 4));
    } else {
      ctx.fillStyle = GROUT; ctx.fillRect(x - S / 2, y - S / 2, S, S);
      const M = u < 0.5 ? A : B; if (M.K[i] === 4) { ctx.fillStyle = MORT; ctx.fillRect(x - S / 2, y - S / 2, S, S); continue; }
      const sx = Math.abs(Math.cos(u * Math.PI));
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.04, sx), 1); tileAt(0, 0, S, M.CS[i], i); ctx.restore();
    }
  }
}
const thDiag = (rev = false) => (x, y, i) => { const v = (x + y * 0.55) / (NC + NR * 0.55); return clamp((rev ? 1 - v : v) * 0.85 + rnd(i * 4.7) * 0.15); };

// ───────────── living overlays: ripple, shimmer, glint, twinkle ─────────────
function ripple(m, t, keep = null, amp = 1) {
  const ids = lst(m, 'w', (i) => m.K[i] === 2), P = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  for (const i of ids) {
    if (keep && !keep(i)) continue;
    const x = (i % NC) * S, y = ((i / NC) | 0) * S, v = Math.sin(x * 0.011 + y * 0.05 - t * 2.4) * 0.62 + Math.sin(x * 0.029 - y * 0.021 + t * 1.7) * 0.38;
    const b = v > 0.8 ? 3 : v > 0.5 ? 2 : v > 0.22 ? 1 : v < -0.5 ? 0 : -1; if (b >= 0) P[b].rect(x + 4, y + 4, S - 8, S - 8);
  }
  ['rgba(8,18,48,0.25)', 'rgba(255,255,255,0.12)', 'rgba(220,236,250,0.3)', 'rgba(244,241,232,0.8)'].forEach((c, k) => { ctx.fillStyle = c; ctx.globalAlpha = amp; ctx.fill(P[k]); ctx.globalAlpha = 1; });
}
function shimmer(m, t, keep = null) {
  const ids = lst(m, 'gr', (i) => m.K[i] === 1 && m.RGB[i * 3 + 1] > m.RGB[i * 3] + 15 && m.RGB[i * 3 + 1] > m.RGB[i * 3 + 2] + 15), P = new Path2D();
  for (const i of ids) { if (keep && !keep(i)) continue; const x = (i % NC) * S, y = ((i / NC) | 0) * S; if (Math.sin(x * 0.012 - y * 0.006 - t * 2.2 + Math.sin(y * 0.02) * 0.8) > 0.72) P.rect(x + 4, y + 4, S - 8, S - 8); }
  ctx.fillStyle = 'rgba(235,255,190,0.2)'; ctx.fill(P);
}
function glintM(m, pos, a = 1) {
  const ids = lst(m, 'g', (i) => m.K[i] === 3), P = [new Path2D(), new Path2D(), new Path2D()];
  for (const i of ids) { const x = (i % NC) * S, y = ((i / NC) | 0) * S, dd = Math.abs(x + y * 0.55 - pos); if (dd > 130) continue; const k = 1 - dd / 130; P[k > 0.66 ? 2 : k > 0.33 ? 1 : 0].rect(x + 2, y + 2, S - 4, S - 4); }
  [0.2, 0.4, 0.7].forEach((al, k) => { ctx.fillStyle = `rgba(255,250,225,${al * a})`; ctx.fill(P[k]); });
}
function sparkle(x, y, a, r = 22) {
  if (a <= 0.02) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#FFFBEA'; ctx.fillRect(x - 7, y - 7, 14, 14);
  ctx.fillRect(x - r, y - 1.5, r * 2, 3); ctx.fillRect(x - 1.5, y - r, 3, r * 2); ctx.restore();
}
function twinkle(pts, t, n, sd = 0) {
  if (!pts.length) return;
  for (let k = 0; k < n; k++) { const ph = t * 1.4 + rnd(k * 3.3 + sd), cyc = Math.floor(ph), fr = ph - cyc, [x, y] = pts[Math.floor(rnd(k * 7.31 + cyc * 1.917 + sd) * pts.length)]; sparkle(x, y, Math.pow(Math.sin(fr * Math.PI), 3)); }
}
const goldPts = (m) => m.L.gp || (m.L.gp = lst(m, 'g', (i) => m.K[i] === 3).map((i) => [cx_(i), cy_(i)]));

// ───────────── tablets + mosaic glyphs ─────────────
function tablet(txt, x, y, size, k) {
  if (k <= 0) return; const e = eob(clamp(k));
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${(size * 0.08) | 0}px`;
  const tw = ctx.measureText(txt).width, w = tw + size * 1.2, h = size * 1.55;
  ctx.translate(x, y - (1 - e) * 90); ctx.globalAlpha *= clamp(k * 4);
  ctx.fillStyle = 'rgba(20,16,12,0.4)'; ctx.fillRect(-w / 2 + 7, -h / 2 + 9, w, h);
  ctx.fillStyle = CREAM; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(150,135,110,0.25)'; ctx.lineWidth = 2; for (let v = 0; v < 3; v++) { ctx.beginPath(); ctx.moveTo(-w / 2 + w * (0.1 + v * 0.3), -h / 2); ctx.quadraticCurveTo(-w / 2 + w * (0.25 + v * 0.3), 0, -w / 2 + w * (0.15 + v * 0.32), h / 2); ctx.stroke(); }
  ctx.strokeStyle = GROUT; ctx.lineWidth = 5; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  ctx.fillStyle = GROUT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, size * 0.04, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
const FONT = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ',': ['000', '000', '000', '000', '000', '010', '100'], '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'], ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], 'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], 'I': ['111', '010', '010', '010', '010', '010', '111'],
};
function glyphCells(str) {
  const cells = []; let gx = 0;
  [...str].forEach((ch, ci) => { const g = FONT[ch]; g.forEach((row, r) => [...row].forEach((v, c) => { if (v === '1') cells.push([gx + c, r, ci]); })); gx += g[0].length + 1; });
  return { cells, w: gx - 1 };
}
/** mosaic letters: ps = size of one font pixel, sub = tiles per font pixel side; uF(ci, k) → 0..1 arrival of tile k of char ci */
function glyphs(str, cx, cy, ps, sub, colF, uF, sd = 0) {
  const { cells, w } = glyphCells(str), ts = ps / sub, x0 = cx - w * ps / 2, y0 = cy - 3.5 * ps, out = [];
  let k = 0;
  for (const [gx, gy, ci] of cells) for (let a = 0; a < sub; a++) for (let b = 0; b < sub; b++, k++) {
    const x = x0 + gx * ps + (a + 0.5) * ts, y = y0 + gy * ps + (b + 0.5) * ts, u = uF(ci, k, x, y), sk = k * 3.7 + sd;
    if (u <= 0) continue;
    if (u >= 1) { ctx.fillStyle = GROUT; ctx.fillRect(x - ts / 2 - 1, y - ts / 2 - 1, ts + 2, ts + 2); tileAt(x, y, ts, colF(ci, k, sk), sk); out.push([x, y]); continue; }
    const e = eo(u), fx = (rnd(sk) - 0.5) * 700, fy = -400 - rnd(sk * 1.3) * 500;
    tileAt(x + fx * (1 - e), y + fy * (1 - e), ts, colF(ci, k, sk), sk, 1 + (1 - e) * 0.8, (rnd(sk * 2) - 0.5) * 6 * (1 - e), clamp(u * 4));
  }
  return out;
}

// ───────────── sherd heap (c6) ─────────────
let HEAP = null;
function heap() {
  if (HEAP) return HEAP; HEAP = [];
  const cols = ['#B5552F', '#D9794A', '#A04A28', '#C8643A', '#8C3E22', '#E0B080'];
  for (let c = 2; c < NC - 2; c++) { const x = c * S + S / 2, hh = Math.round(12 * Math.exp(-(((x - 540) / 300) ** 2)) + rnd(c * 3.1) * 1.6);
    for (let r = 0; r < hh; r++) HEAP.push({ x: x + (rnd(c * 9 + r) - 0.5) * 6, y: 1250 - r * (S - 2) - S / 2, r, ta: 0.15 + (r / 13) * 1.9 + rnd(c * 7.7 + r * 3.1) * 0.55, col: cols[Math.floor(rnd(c * 2.3 + r * 5.9) * cols.length)], rot: (rnd(c + r * 13) - 0.5) * 0.5, sd: c * 31 + r }); }
  return HEAP;
}

// ───────────── amphora shard groups (c7) ─────────────
const SEEDS = [[540, 330], [460, 520], [620, 540], [450, 720], [630, 720], [540, 900], [500, 1060], [580, 1150]];
const grp = (x, y) => { let b = 0, bd = 1e9; SEEDS.forEach(([sx, sy], k) => { const d = (x - sx - Math.sin(y * 0.03) * 24) ** 2 + (y - sy) ** 2; if (d < bd) { bd = d; b = k; } }); return b; };
const P_AMPH = (on) => () => { border(); if (on) amph(540, 300, 900); };

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const t10 = L(10), tIn = Wd('in', 10), t11 = L(11), tTwo = Wd('two', 11), tDigs = Wd('digs', 11), tVil = Wd('village', 11);
  const t12 = L(12), tThou = Wd('thousand', 12), tRom = Wd('Roman', 12), tTr = Wd('traces', 12), tWh = Wd('wharf', 12);
  const t13 = L(13), tMay = Wd('may', 13), tNot = Wd('Not', 13), tSea = Wd('search', 13), t14 = L(14), tLost = Wd('lost', 14), tFol = Wd('Follow', 14), END = T.dur;

  const M = {
    port: () => mosaic('port', P_PORT), texts: () => mosaic('texts', P_TEXTS), bg: () => mosaic('bg', P_BG),
    field: () => mosaic('field', P_FIELD), trench: () => mosaic('trench', P_TRENCH), village: () => mosaic('village', P_VILLAGE),
    amph0: () => mosaic('amph0', P_AMPH(false)), amph: () => mosaic('amph', P_AMPH(true), { tint: (x, y, i, K) => { if (K[i] !== 1) return null; const g = grp(x * S + 12, y * S + 12); return (grp(x * S + 36, y * S + 12) !== g && K[i + 1] === 1) || (grp(x * S + 12, y * S + 36) !== g && K[i + NC] === 1) ? [110, 50, 30] : null; } }),
    bank: () => mosaic('bank', P_BANK(false)), wharf: () => mosaic('wharf', P_BANK(true)),
    round: () => mosaic('round', P_ROUND, { holes: (x, y) => Math.hypot(x * S + 12 - RA[0], y * S + 12 - RA[1]) < RR - 6 && vnoise(x / 3.2, y / 3.2, 5) > 0.56 }),
    decor: () => mosaic('decor', P_DECOR(false)), decorq: () => mosaic('decorq', P_DECOR(false), { mask: Q_MASK }),
    porth: () => mosaic('porth', P_PORTH, { holes: (x, y) => vnoise(x / 4.5, y / 4.5, 2) > 0.5 && y < 56 }),
    ship: () => mosaic('ship', P_SHIP), fields: () => mosaic('fields', P_FIELDS), end: () => mosaic('end', P_END),
  };

  // c1 + c2 share the port → mortar loss
  const lossP = (t) => seg(t, t10 + 0.8, tIn + 0.9);
  const lossTh = (x, y, i) => clamp(0.78 * (1 - Math.hypot(x * S - 540, (y * S - 760) * 0.8) / 900) + 0.22 * rnd(i * 9.7));
  const loss = (t) => { const A = M.port(), B = M.texts(), p = lossP(t); morph(A, B, p, lossTh, 'fall', { w: 0.14 }); ripple(A, t, (i) => B.K[i] !== 2 && p < lossTh(i % NC, (i / NC) | 0, i) * 0.86); };

  add({ id: 'c1', at: t10, cam: [540, 820], zoom: 0.08, note: 'Muziris port mosaic (ship, rippling sea, warehouse, palms, amphorae, sacks); tiles begin popping out and falling',
    draw(lt, d, t) { loss(t); if (lossP(t) < 0.4) glintM(M.port(), -200 + lt * 900, 1 - lossP(t) * 2.5); twinkle(goldPts(M.port()), t, lossP(t) < 0.3 ? 3 : 0, 1); } });
  cue(t10 + 0.05, 'swell', { gain: 0.3 }); cue(t10 + 0.2, 'bubbles', { gain: 0.18 });
  for (let k = 0; k < 7; k++) cue(t10 + 0.9 + k * 0.28, 'pop', { gain: 0.16 + rnd(k) * 0.1, pan: (rnd(k * 3) - 0.5) * 0.8 });
  cue(t10 + 1.0, 'rumble', { gain: 0.22 });

  add({ id: 'c2', at: tIn, cam: [540, 760], zoom: 0.1, note: 'port gone to bare mortar; only a scroll and a papyrus sheet of abstract dash rows remain; OLD TEXTS tablet; glint on the scroll rolls',
    draw(lt, d, t) {
      loss(t);
      glintM(M.texts(), -300 + seg(lt, 0.5, 1.5) * 1800); twinkle(goldPts(M.texts()), t, 2, 4);
      for (let k = 0; k < 26; k++) { const ph = (lt * (0.5 + rnd(k) * 0.4) + rnd(k * 3.3)) % 1; ctx.fillStyle = `rgba(150,145,135,${0.55 * (1 - ph)})`; ctx.fillRect(rnd(k * 7.1) * W, ph * 1300, 5, 5); }
      tablet('OLD TEXTS', 540, 220, 64, seg(lt, 0.25, 0.7));
    } });
  cue(tIn + 0.3, 'thud', { gain: 0.4 }); cue(tIn + 0.7, 'sparkle', { gain: 0.25 });

  add({ id: 'c3', at: t11, cam: [540, 640], zoom: 0.09, note: 'tile flip to a marble floor; mosaic digits 2007 fly in digit by digit and click into place; glint sweep',
    draw(lt, d, t) {
      const A = M.texts(), B = M.bg();
      morph(A, B, seg(lt, 0, 0.7), thDiag(), 'flip', { w: 0.2 });
      const td = (ci) => tTwo - 0.25 + ci * 0.24;
      const pts = glyphs('2007', 540, 640, 40, 2, (ci, k, sk) => (rnd(sk) < 0.3 ? TER : rnd(sk * 1.7) < 0.15 ? '#7E2222' : RED), (ci, k) => seg(t, td(ci) + rnd(k * 1.3) * 0.25, td(ci) + 0.35 + rnd(k * 1.3) * 0.25), 11);
      const gp = -400 + seg(t, tTwo + 1.0, tDigs) * 2200, P = new Path2D();
      for (const [x, y] of pts) { const dd = Math.abs(x + y * 0.55 - gp); if (dd < 90) P.rect(x - 8, y - 8, 16, 16); }
      ctx.fillStyle = 'rgba(255,240,220,0.45)'; ctx.fill(P);
      twinkle(pts, t, pts.length > 40 ? 3 : 0, 7);
    } });
  cue(t11, 'whoosh', { gain: 0.35 }); for (let k = 0; k < 4; k++) cue(tTwo + 0.1 + k * 0.24, 'tock', { gain: 0.4 }); cue(tTwo + 1.1, 'sparkle', { gain: 0.3 });

  const pitTh = (x, y, i) => { const p = PIT(x, y); return p === -2 ? rnd(i) * 0.2 : p === -1 ? 0.05 + rnd(i) * 0.1 : clamp(0.12 + p / 9 * 0.78 + rnd(i * 3.3) * 0.08); };
  add({ id: 'c4', at: tDigs, cam: [540, 600], zoom: 0.12, note: 'top-down green field; turf tiles pop out pit by pit opening a 3x3 excavation trench grid; 2007 DIGS tablet',
    draw(lt, d, t) {
      const A = M.field(), B = M.trench(), p = seg(lt, 0.1, d - 0.15);
      morph(A, B, p, pitTh, 'fall', { w: 0.12 }); shimmer(A, t, (i) => PIT(i % NC, (i / NC) | 0) === -2);
      tablet('2007 DIGS', 540, 1060, 62, seg(lt, 0.3, 0.75));
    } });
  for (let k = 0; k < 9; k++) cue(tDigs + 0.15 + k * 0.17, 'pop', { gain: 0.2, pan: ((k % 3) - 1) * 0.4 }); cue(tDigs + 0.35, 'thud', { gain: 0.4 });

  add({ id: 'c5', at: tVil, cam: [620, 760], zoom: 0.07, note: 'tile flip to Pattanam village: coconut palms over fields, river winding to the sea, ripple, birds; gold ring pulses at the river mouth; PATTANAM',
    draw(lt, d, t) {
      const A = M.trench(), B = M.village(), p = seg(lt, 0, 0.6);
      morph(A, B, p, thDiag(true), 'flip', { w: 0.2 });
      if (p > 0.6) { ripple(B, t, null, seg(p, 0.6, 1)); shimmer(B, t); }
      for (let b = 0; b < 4; b++) { const bx = 1180 - ((lt * 120 + b * 260) % 1400), by = 150 + b * 50 + Math.sin(lt * 3 + b) * 10, f = Math.sin(lt * 9 + b * 2) > 0 ? 1 : 0;
        for (const [dx, dy] of [[-18, -6 * f], [0, 0], [18, -6 * f]]) { ctx.fillStyle = '#2A2622'; ctx.fillRect(bx + dx - 7, by + dy - 5, 14, 10); } }
      const rk = seg(lt, 0.9, 1.4); if (rk > 0) { const n = 16; for (let k = 0; k < n; k++) { const a = k / n * TAU, rr = 92 + Math.sin(lt * 4) * 6; if (k / n <= rk) tileAt(840 + Math.cos(a) * rr, 450 + Math.sin(a) * rr * 0.6, 26, k % 2 ? GOLD : GOLD2, k * 9.1); } sparkle(840 + Math.cos(lt * 2.5) * 92, 450 + Math.sin(lt * 2.5) * 55, 0.5 + 0.5 * Math.sin(lt * 6)); }
      tablet('PATTANAM', 540, 200, 62, seg(lt, 0.45, 0.9));
    } });
  cue(tVil, 'whoosh', { gain: 0.35 }); cue(tVil + 0.5, 'thud', { gain: 0.4 }); cue(tVil + 0.6, 'bubbles', { gain: 0.2 }); cue(tVil + 1.0, 'sparkle', { gain: 0.3 });

  add({ id: 'c6', at: t12, cam: [540, 760], zoom: 0.07, note: 'terracotta sherd tiles rain into a growing heap while a mosaic counter counts up to 1,000+',
    draw(lt, d, t) {
      ctx.drawImage(lay(M.bg()), 0, 0);
      for (const h of heap()) { const u = seg(lt, h.ta - 0.45, h.ta); if (u <= 0) continue; const y = lerp(-80 - rnd(h.sd) * 200, h.y, u * u), bounce = u >= 1 ? Math.max(0, Math.sin(seg(lt, h.ta, h.ta + 0.18) * Math.PI)) * 8 : 0;
        tileAt(h.x, y - bounce, S, h.col, h.sd, 1, h.rot * (u < 1 ? 4 * (1 - u) + 1 : 1)); }
      const n = Math.round(1000 * eo(seg(t, t12 + 0.15, tThou + 0.1))), plus = t > tThou + 0.4, s = n.toLocaleString('en-US');
      glyphs((s.length < 5 ? ' '.repeat(5 - s.length) : '') + s + (plus ? '+' : ' '), 540, 470, 25, 1, (ci, k, sk) => (ci === 5 ? (rnd(sk) < 0.5 ? GOLD : GOLD2) : rnd(sk) < 0.25 ? '#3A3430' : PEP), () => 1, 3);
      if (plus) sparkle(540 + 14 * 25, 470, 1 - seg(t, tThou + 0.4, tThou + 1.1), 40);
      tablet('AMPHORA PIECES', 540, 260, 54, seg(lt, 0.2, 0.6));
    } });
  for (let k = 0; k < 11; k++) cue(t12 + 0.15 + k * 0.24, 'plop', { gain: 0.14 + rnd(k) * 0.08, pan: (rnd(k * 5) - 0.5) * 0.8 });
  cue(t12 + 0.25, 'thud', { gain: 0.35 }); cue(tThou + 0.4, 'slam', { gain: 0.4 }); cue(tThou + 0.45, 'sparkle', { gain: 0.3 });

  const ord = SEEDS.map((s, k) => k).sort((a, b) => SEEDS[b][1] - SEEDS[a][1]), rank = (g) => ord.indexOf(g);
  add({ id: 'c7', at: tRom, cam: [540, 740], zoom: 0.1, note: 'a Roman amphora reassembles from shard groups flying in, cracks still visible; ROMAN AMPHORA tablet',
    draw(lt, d, t) {
      const A = M.amph0(), B = M.amph();
      morph(A, B, seg(lt, 0, 1.3), (x, y, i) => clamp(rank(grp(x * S + 12, y * S + 12)) / 8 * 0.9 + rnd(i) * 0.04), 'fly', { w: 0.22, from: (i) => { const g = grp(cx_(i), cy_(i)), a = rnd(g * 3.3 + 1) * TAU; return [Math.cos(a) * 760, Math.sin(a) * 640 - 120, (rnd(g * 5.1) - 0.5) * 1.6]; } });
      const sp = (lt * 1.1) % 1; sparkle(470 + Math.sin(lt * 2) * 30, 560 + sp * 300, seg(lt, 1.2, 1.4) * Math.sin(sp * Math.PI));
      tablet('ROMAN AMPHORA', 540, 190, 58, seg(lt, 0.1, 0.5));
    } });
  for (let k = 0; k < 8; k++) cue(tRom + 0.15 + k * 0.145, 'tock', { gain: 0.32, pan: (rnd(k * 2) - 0.5) * 0.6 }); cue(tRom + 0.15, 'thud', { gain: 0.35 });

  const wharfTh = (x, y, i) => (rnd(i * 7.3) > 0.6 ? 5 : clamp(1 - y / 50 + rnd(i * 2.1) * 0.15));
  add({ id: 'c8', at: tTr, cam: [560, 700], zoom: 0.1, note: 'top-down river bank: wharf timbers fly in but stay full of gaps, dashed outline of the possible structure; POSSIBLE WHARF',
    draw(lt, d, t) {
      const A = M.bank(), B = M.wharf();
      morph(A, B, seg(lt, 0.05, 1.6) * 0.62, wharfTh, 'fly', { w: 0.2 }); ripple(A, t);
      const k = seg(lt, 0.9, 1.4); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([18, 14]); ctx.lineDashOffset = -lt * 40; ctx.strokeStyle = CREAM; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(18 * S - 8, 13 * S - 8); ctx.lineTo(26 * S + 8, 13 * S - 8); ctx.lineTo(26 * S + 8, 28 * S - 8); ctx.lineTo(36 * S + 8, 28 * S - 8); ctx.lineTo(36 * S + 8, 33 * S + 8); ctx.lineTo(26 * S + 8, 33 * S + 8); ctx.lineTo(26 * S + 8, 49 * S + 8); ctx.lineTo(18 * S - 8, 49 * S + 8); ctx.closePath(); ctx.stroke(); ctx.restore(); }
      tablet('POSSIBLE WHARF', 540, 190, 58, seg(t, tWh - 0.15, tWh + 0.3));
    } });
  cue(tTr + 0.1, 'bubbles', { gain: 0.2 }); for (let k = 0; k < 5; k++) cue(tTr + 0.3 + k * 0.25, 'tock', { gain: 0.25 }); cue(tWh - 0.1, 'thud', { gain: 0.45 });

  const rTh = (x, y, i) => { const px = x * S + 12, py = y * S + 12, da = Math.hypot(px - RA[0], py - RA[1]), db = Math.hypot(px - RB[0], py - RB[1]); return da < RR + 50 ? clamp(da / (RR + 50) * 0.45 + rnd(i) * 0.05) : db < RR + 50 ? clamp(0.45 + db / (RR + 50) * 0.45 + rnd(i) * 0.05) : 0; };
  add({ id: 'c9', at: t13, cam: [540, 700], zoom: 0.07, note: 'two gold-ringed roundels assemble: MUZIRIS? (port, full of mortar holes) and PATTANAM (village, trench); a gold tile link lays itself; MAY BE',
    draw(lt, d, t) {
      const A = M.bg(), B = M.round();
      morph(A, B, seg(lt, 0, 1.1), rTh, 'fly', { w: 0.25 }); if (lt > 1.1) ripple(B, t);
      const n = 9; for (let k = 0; k < n; k++) { const u = seg(lt, 1.0 + k * 0.07, 1.2 + k * 0.07); if (u <= 0) continue; const f = k / (n - 1); tileAt(lerp(526, 560, f) + (k % 2 ? 7 : -7), lerp(610, 770, f), 26 * eob(u), k % 2 ? GOLD : GOLD2, 900 + k); }
      twinkle(goldPts(B), t, lt > 1.1 ? 3 : 0, 9);
      tablet('MUZIRIS?', 820, 300, 56, seg(lt, 0.4, 0.8)); tablet('PATTANAM', 270, 1060, 56, seg(lt, 0.7, 1.1));
      tablet('MAY BE', 800, 690, 72, seg(t, tMay - 0.1, tMay + 0.35));
    } });
  cue(t13, 'whoosh', { gain: 0.3 }); for (let k = 0; k < 4; k++) cue(t13 + 0.2 + k * 0.22, 'tock', { gain: 0.25 }); cue(t13 + 1.1, 'zip', { gain: 0.2 }); cue(tMay - 0.05, 'thud', { gain: 0.5 });

  add({ id: 'c10', at: tNot, cam: [540, 700], zoom: 0.1, note: 'decorative lapis panel with gold rosette; tiles fall out top to bottom leaving a big ? of bare mortar; UNCERTAIN',
    draw(lt, d, t) {
      const A = M.decor(), B = M.decorq();
      morph(A, B, seg(lt, 0.05, 1.25), (x, y, i) => clamp((y - 13) / 34 * 0.85 + rnd(i * 2.2) * 0.15), 'fall', { w: 0.14 });
      glintM(A, -200 + lt * 1300, 0.9); twinkle(goldPts(A), t, 2, 12);
      tablet('UNCERTAIN', 540, 180, 62, seg(lt, 0.7, 1.1));
    } });
  for (let k = 0; k < 6; k++) cue(tNot + 0.1 + k * 0.18, 'pop', { gain: 0.2, pan: (rnd(k * 9) - 0.5) * 0.6 }); cue(tNot + 0.75, 'thud', { gain: 0.45 });

  const fillTh = (x, y) => clamp((vnoise(x / 4.5, y / 4.5, 2) - 0.5) * 2.2);
  add({ id: 'c11', at: tSea, cam: [540, 820], zoom: 0.08, note: 'tile flip to the port mosaic half-complete (big mortar gaps); tiles keep flying in to fill the gaps: the search goes on',
    draw(lt, d, t) {
      const A = M.porth(), B = M.port();
      if (lt < 0.55) morph(M.decorq(), A, seg(lt, 0, 0.55), thDiag(), 'flip', { w: 0.2 });
      else { morph(A, B, seg(lt, 0.55, d + 0.6) * 0.55, fillTh, 'fly', { w: 0.3 }); ripple(A, t); }
      glintM(A, -300 + lt * 900, 0.8);
    } });
  cue(tSea, 'whoosh', { gain: 0.3 }); for (let k = 0; k < 5; k++) cue(tSea + 0.65 + k * 0.24, 'tock', { gain: 0.22 });

  const fieldTh = (x, y, i) => clamp((1 - y / NR) * 0.8 + vnoise(x / 3, y / 3, 6) * 0.2);
  const fP = (t) => seg(t, tLost - 0.15, tFol - 0.1);
  add({ id: 'c12', at: t14, cam: [540, 820], zoom: 0.1, note: 'Roman ship, pepper sacks, amphorae and gold coins on the quay, ripple + glint; on "lost" the tiles flip into green fields from the bottom up',
    draw(lt, d, t) {
      const A = M.ship(), B = M.fields(), p = fP(t);
      if (p <= 0) ctx.drawImage(lay(A), 0, 0); else morph(A, B, p, fieldTh, 'flip', { w: 0.1 });
      ripple(A, t, p > 0 ? (i) => fieldTh(i % NC, (i / NC) | 0, i) * 0.85 > p : null);
      if (p > 0.3) shimmer(B, t, (i) => fieldTh(i % NC, (i / NC) | 0, i) * 0.85 + 0.15 < p);
      glintM(A, -300 + lt * 1100, 1 - p); twinkle(goldPts(A), t, p < 0.2 ? 3 : 1, 13);
    } });
  cue(t14 + 0.1, 'sparkle', { gain: 0.3 }); cue(t14 + 0.2, 'bubbles', { gain: 0.18 }); cue(tLost - 0.1, 'rumble', { gain: 0.3 }); cue(tLost, 'whoosh', { gain: 0.3, dur: 1.2 });

  add({ id: 'c13', at: tFol, cam: [540, 700], zoom: 0.05, note: 'end card: AAZHI assembles in gold smalti tiles, glint sweeps, FOLLOW tablet drops, little ship on a rippling wave band',
    draw(lt, d, t) {
      const A = M.fields(), B = M.end();
      morph(A, B, seg(lt, 0, 0.55), thDiag(), 'flip', { w: 0.2 }); ripple(B, t, null, seg(lt, 0.4, 0.8));
      const pts = glyphs('AAZHI', 540, 560, 30, 1, (ci, k, sk) => (rnd(sk) < 0.45 ? GOLD : rnd(sk * 1.3) < 0.7 ? GOLD2 : '#C08A2A'), (ci, k) => seg(lt, 0.4 + ci * 0.18 + rnd(k * 1.7) * 0.3, 0.75 + ci * 0.18 + rnd(k * 1.7) * 0.3), 21);
      const gp = -500 + ((lt - 1.7) % 1.6) / 1.6 * 2300;
      if (lt > 1.7) { const P1 = new Path2D(), P2 = new Path2D(); for (const [x, y] of pts) { const dd = Math.abs(x + y * 0.55 - gp); if (dd < 50) P2.rect(x - 7, y - 7, 14, 14); else if (dd < 110) P1.rect(x - 7, y - 7, 14, 14); } ctx.fillStyle = 'rgba(255,250,225,0.4)'; ctx.fill(P1); ctx.fillStyle = 'rgba(255,253,240,0.8)'; ctx.fill(P2); }
      twinkle(pts, t, lt > 1.5 ? 3 : 0, 23);
      tablet('FOLLOW', 540, 860, 70, seg(lt, 1.2, 1.6));
    } });
  cue(tFol, 'whoosh', { gain: 0.3 }); for (let k = 0; k < 5; k++) cue(tFol + 0.65 + k * 0.18, 'tock', { gain: 0.35 });
  cue(tFol + 1.25, 'thud', { gain: 0.45 }); cue(tFol + 1.75, 'sparkle', { gain: 0.35 }); cue(tFol + 1.8, 'bell', { gain: 0.3 });
}
