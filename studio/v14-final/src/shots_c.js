// EPISODE 14 · worker C : "Ganjifa Round Cards", lines 10-13 (the king's nose legend, Tirumala dies, forgotten war, end card)
//   c1  L10 → "king"          a face-down card is dealt spinning onto the baize, flips to the Madurai gopuram; a pothi card lands; MADURAI
//   c2  "king" → "Historians" the Mysore king card flips (turbaned, faceless); push-in through the card to his face; the nose line is painted over in black
//   c3  "Historians" → L11    pull back; painted cloud scrolls drift round the card; LEGEND slip slaps down on it on "legend"
//   c4  L11 → "around"        Tirumala's card under the lamp; on "died" the lamp dims, the lacquer crackles, the card turns face-down
//   c5  "around" → L12        ivory counter chips drop into four stacks before the face-down card; c. 1659 slip
//   c6  L12 → "fighting"      suits as armies: fish cards (Madurai) and elephant cards (Mysore) slide in from both sides; MADURAI / MYSORE
//   c7  "fighting" → "cruel"  tricks taken back and forth: fish slaps elephant, elephant slaps fish... the beaten card slides to a pile
//   c8  "cruel" → "forgotten" the sack-and-dagger card fills the frame, camera pulls back: one little card on a table full of cards
//   c9  "forgotten" → "old"   lamp dims, the whole table greys, the card's paint crackles; FORGOTTEN slip
//   c10 "old" → "few"         the lamp returns; one card slides out from under a dusty pile (survives)
//   c11 "few" → "Follow"      three pothi (book) cards are dealt; on "hunt" the survivor flips to the hunt card: rider, spear, sack
//   c12 "Follow" → end        end card: cards gather into a stack, the top card flips to AAZHI; FOLLOW slip
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, poly } from './art.js';

// ───────────── palette ─────────────
const RIM = '#5A1F14', GOLD = '#D8A845', IV = '#EDE0C2', VER = '#C8401E', LEAF = '#3E7A3A', IND = '#24366B', SAF = '#E69A2A', BLK = '#1B1410';
const SKIN = '#B9784A', WHT = '#F6F0E0', MAROON = '#6E2418', PALM = '#E0BF78', TXT = '#2B1408', SLIPRED = '#B3261E';
const CX = 540, CY = 700;

// ───────────── painting helpers (used only inside cached()) ─────────────
const E = (x, y, rx, ry, r = 0) => () => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, r, 0, TAU); };
const PL = (pts) => () => poly(pts);
const RR = (x, y, w, h, r) => () => rr(x, y, w, h, r);
function fo(path, fill, lw = 4) { path(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = BLK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function limb(pts, w, col) {
  const tr = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; tr(); ctx.strokeStyle = BLK; ctx.lineWidth = w + 8; ctx.stroke(); tr(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
const hl = (x, y, r = 4) => circle(x, y, r, '#FFFFFF');
function dotRing(r, n, rad, col, a0 = 0) { for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; circle(Math.cos(a) * r, Math.sin(a) * r, rad, col); } }
function stroke(pts, col, w) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); }

// ───────────── the round card (rim, floral band, gouache ground, gloss) ─────────────
// painters draw in "card units": a card of radius 400 with the painted ground inside radius 334
function cardImg(key, R, ground, paint, q = 1) {
  return cached('c' + key, 2 * R + 40, 2 * R + 40, q, () => {
    ctx.translate(R + 20, R + 20);
    const k = R / 400;
    circle(0, 0, R, RIM);
    ctx.beginPath(); ctx.arc(0, 0, R - 2 * k, 0, TAU); ctx.strokeStyle = '#3A120B'; ctx.lineWidth = 4 * k; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R - 10 * k, 0, TAU); ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(1.2, 4 * k); ctx.stroke();
    const N = R > 200 ? 54 : 26, br = R - 35 * k;
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU;
      ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(br, 0, 13 * k, 7.5 * k, 0, 0, TAU); ctx.fillStyle = i % 2 ? SAF : IV; ctx.fill(); ctx.restore();
      const a2 = a + Math.PI / N; circle(Math.cos(a2) * br, Math.sin(a2) * br, 3.2 * k, GOLD);
    }
    ctx.beginPath(); ctx.arc(0, 0, R - 58 * k, 0, TAU); ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(1.2, 5 * k); ctx.stroke();
    const Ri = R - 64 * k;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, Ri, 0, TAU); ctx.clip();
    ctx.fillStyle = ground; ctx.fillRect(-R, -R, 2 * R, 2 * R);
    ctx.save(); ctx.scale(k, k); paint(); ctx.restore();
    // gouache grain
    for (let i = 0; i < 500; i++) { const a = rnd(i * 3.1 + R) * TAU, r = Math.sqrt(rnd(i * 7.7 + 2)) * Ri; ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 2.5 * k + 1, 2.5 * k + 1); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, Ri, 0, TAU); ctx.strokeStyle = BLK; ctx.lineWidth = Math.max(1, 3 * k); ctx.stroke();
    // lacquer gloss
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.84, Math.PI * 1.1, Math.PI * 1.42); ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 16 * k; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.77, Math.PI * 1.16, Math.PI * 1.3); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 8 * k; ctx.stroke();
    circle(-R * 0.36, -R * 0.74, 7 * k, 'rgba(255,255,255,0.45)');
  });
}
const backImg = (R = 400, q = 1) => cardImg('back' + R, R, MAROON, () => {
  ctx.beginPath(); ctx.arc(0, 0, 250, 0, TAU); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.stroke();
  dotRing(205, 36, 6, GOLD);
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); fo(E(0, -62, 24, 52), GOLD, 3); ctx.restore(); }
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate((i + 0.5) / 8 * TAU); fo(E(0, -50, 12, 30), SAF, 2); ctx.restore(); }
  circle(0, 0, 26, VER); circle(0, 0, 12, GOLD);
}, q);
const shadowImg = () => cached('cshadow', 960, 960, 0.4, () => {
  const g = ctx.createRadialGradient(480, 480, 330, 480, 480, 470); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 960);
});
/** draw a card centred at (x, y); R = its own radius; f = flip 0 (back) .. 1 (face); over() draws in card units on the face */
function card(front, x, y, s, o = {}) {
  const R = o.R || 400, f = o.f ?? 1, c = -Math.cos(Math.PI * f), sx = Math.max(0.02, Math.abs(c)), lift = Math.sin(Math.PI * clamp(f)) * (o.flipping === false ? 0 : 1);
  const img = c >= 0 ? front : (o.back || backImg(R)), sc = s * (1 + 0.08 * lift), sr = R / 400;
  if (o.shadow !== false) { const sh = shadowImg(), ds = sc * sr; ctx.save(); ctx.globalAlpha *= (o.a ?? 1) * 0.9; ctx.translate(x + (12 + 40 * lift) * ds, y + (20 + 60 * lift) * ds); ctx.scale(ds * sx, ds); ctx.drawImage(sh, -480, -480, 960, 960); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y - lift * 26 * s * sr); ctx.rotate(o.rot || 0); ctx.scale(sc * sx, sc);
  const wd = img.width / img._q; ctx.drawImage(img, -wd / 2, -wd / 2, wd, wd);
  if (c >= 0 && o.over) { ctx.save(); ctx.scale(sr, sr); o.over(); ctx.restore(); }
  ctx.restore();
}

// ───────────── card faces ─────────────
function fishShape(x, y, s, dir = 1, col = SAF) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  fo(PL([[-150, 0], [-230, -70], [-210, 0], [-230, 70]]), col, 8);
  fo(E(0, 0, 170, 80), col, 8);
  fo(PL([[-20, -70], [40, -120], [60, -72]]), col, 7); fo(PL([[-10, 70], [40, 110], [50, 70]]), col, 7);
  ctx.strokeStyle = BLK; ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-80 + i * 45, 0, 40, -1, 1); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(100, 0, 60, -1.2, 1.2); ctx.stroke();
  circle(125, -18, 13, BLK); hl(129, -22, 4); hl(-40, -40, 7); hl(10, -50, 5);
  ctx.restore();
}
function elephantShape(x, y, s, col = IND) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const lx of [-120, -50, 50, 115]) fo(RR(lx - 26, 40, 52, 140, 12), col, 8);
  fo(E(0, 10, 175, 115), col, 8);
  ctx.beginPath(); ctx.moveTo(200, -20); ctx.quadraticCurveTo(270, 60, 240, 170); ctx.quadraticCurveTo(232, 210, 205, 190);
  ctx.strokeStyle = BLK; ctx.lineWidth = 50; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 36; ctx.stroke();
  fo(E(170, -45, 80, 78), col, 8);
  fo(E(120, -30, 50, 74, -0.2), '#33498A', 6);
  fo(PL([[205, 20], [270, 60], [215, 45]]), IV, 5);
  fo(RR(-90, -120, 170, 80, 14), VER, 6);
  for (let i = 0; i < 7; i++) circle(-80 + i * 25, -36, 7, GOLD);
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-210, 40, -200, 90); ctx.strokeStyle = BLK; ctx.lineWidth = 8; ctx.stroke();
  hl(150, -80, 8); hl(-40, -20, 9); hl(10, -30, 6);
  ctx.restore();
}
function faceless(x, y, rx, ry) { fo(E(x, y, rx, ry), SKIN, 5); hl(x - rx * 0.4, y - ry * 0.45, Math.max(4, rx * 0.08)); }
function sack(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fo(() => { ctx.beginPath(); ctx.moveTo(-40, -150); ctx.bezierCurveTo(-60, -110, -170, -60, -160, 60); ctx.bezierCurveTo(-150, 150, 150, 150, 160, 60); ctx.bezierCurveTo(170, -60, 60, -110, 40, -150); ctx.closePath(); }, IV, 7);
  fo(PL([[-40, -150], [-70, -205], [-20, -175], [0, -215], [20, -175], [70, -205], [40, -150]]), IV, 6);
  stroke([[-50, -140], [50, -140]], BLK, 22); stroke([[-50, -140], [50, -140]], VER, 14);
  ctx.beginPath(); ctx.moveTo(40, -140); ctx.quadraticCurveTo(90, -120, 80, -60); ctx.moveTo(40, -140); ctx.quadraticCurveTo(110, -150, 120, -90); ctx.strokeStyle = VER; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(27,20,16,0.55)'; ctx.lineWidth = 5;
  for (const [a, b, c2, d] of [[-60, -90, -90, 40], [10, -100, 20, 60], [70, -80, 100, 30]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2 - 20, (b + d) / 2, c2, d); ctx.stroke(); }
  hl(-110, -10, 10); hl(-90, 30, 6);
  ctx.restore();
}
function pothi(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  fo(RR(-240, 52, 480, 36, 16), VER, 5);
  for (let k = 0; k < 6; k++) fo(RR(-228, 40 - k * 16, 456, 16, 8), k % 2 ? PALM : '#D2AE62', 3);
  fo(RR(-240, -88, 480, 36, 16), VER, 5);
  for (let i = 0; i < 9; i++) circle(-200 + i * 50, -70, 5, GOLD);
  for (const cx of [-110, 110]) { stroke([[cx, -96], [cx, 94]], BLK, 12); stroke([[cx, -96], [cx, 94]], GOLD, 6); }
  stroke([[110, 94], [150, 150], [140, 200]], GOLD, 6); circle(140, 205, 12, VER);
  hl(-200, -78, 6); hl(-160, -80, 4);
  ctx.restore();
}

const madurai = () => cardImg('madurai', 400, IV, () => {
  circle(0, -120, 150, SAF);
  ctx.fillStyle = LEAF; ctx.fillRect(-400, 215, 800, 200);
  // palace arches with round pillars either side
  for (const sx of [-1, 1]) {
    for (let j = 0; j < 2; j++) { const px = sx * (225 + j * 90); fo(RR(px - 18, -10, 36, 225, 6), WHT, 4); fo(RR(px - 26, -26, 52, 20, 4), GOLD, 4); }
    ctx.beginPath(); ctx.arc(sx * 270, -26, 45, Math.PI, 0); ctx.strokeStyle = BLK; ctx.lineWidth = 18; ctx.stroke(); ctx.strokeStyle = VER; ctx.lineWidth = 10; ctx.stroke();
  }
  // the gopuram
  fo(RR(-150, 80, 300, 140, 4), VER, 5);
  fo(() => { ctx.beginPath(); ctx.moveTo(-40, 220); ctx.lineTo(-40, 140); ctx.arc(0, 140, 40, Math.PI, 0); ctx.lineTo(40, 220); ctx.closePath(); }, BLK, 3);
  for (let i = 0; i < 7; i++) {
    const w0 = 280 - i * 28, w1 = w0 - 28, y0 = 80 - i * 44, y1 = y0 - 44;
    fo(PL([[-w0 / 2, y0], [w0 / 2, y0], [w1 / 2, y1], [-w1 / 2, y1]]), i % 2 ? SAF : VER, 4);
    stroke([[-w1 / 2, y1 + 6], [w1 / 2, y1 + 6]], IV, 4);
    for (let n = -2; n <= 2; n++) circle(n * w1 / 6, y0 - 24, 5, BLK);
  }
  fo(() => { ctx.beginPath(); ctx.ellipse(0, -228, 72, 42, 0, Math.PI, 0); ctx.closePath(); }, GOLD, 5);
  for (const kx of [-44, 0, 44]) { fo(E(kx, -280, 9, 16), GOLD, 3); }
  hl(-30, -250, 6);
  fishShape(-130, 275, 0.32, 1); fishShape(130, 275, 0.32, -1);
});
const mysoreKing = (q = 1.7) => cardImg('mysking', 400, VER, () => {
  circle(0, -40, 210, '#D8592F');
  dotRing(210, 40, 5, GOLD);
  fo(() => { ctx.beginPath(); ctx.moveTo(-300, 360); ctx.lineTo(-250, 170); ctx.quadraticCurveTo(-200, 110, -60, 100); ctx.lineTo(60, 100); ctx.quadraticCurveTo(200, 110, 250, 170); ctx.lineTo(300, 360); ctx.closePath(); }, IND, 5);
  fo(RR(-38, 50, 76, 70, 10), SKIN, 4);
  ctx.beginPath(); ctx.arc(0, 90, 95, 0.35, Math.PI - 0.35); ctx.strokeStyle = BLK; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = GOLD; ctx.lineWidth = 9; ctx.stroke();
  for (let i = -3; i <= 3; i++) { const a = Math.PI / 2 + i * 0.3; circle(Math.cos(a) * 95, 90 + Math.sin(a) * 95, 8, i % 2 ? WHT : GOLD); }
  stroke([[-150, 150], [-120, 330]], '#33498A', 10); stroke([[150, 150], [120, 330]], '#33498A', 10);
  hl(-200, 210, 9); hl(-180, 240, 5);
  faceless(0, -40, 92, 118);
  // the nose: one simple curved line
  ctx.beginPath(); ctx.moveTo(8, -62); ctx.quadraticCurveTo(38, -10, 6, 4); ctx.strokeStyle = BLK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
  // turban
  fo(() => { ctx.beginPath(); ctx.ellipse(0, -140, 118, 66, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(0, -95, -116, -128); ctx.closePath(); }, IV, 5);
  for (const yy of [-160, -136]) { ctx.beginPath(); ctx.moveTo(-100, yy + 20); ctx.quadraticCurveTo(0, yy - 30, 100, yy + 20); ctx.strokeStyle = SAF; ctx.lineWidth = 9; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(40, -195); ctx.quadraticCurveTo(80, -290, 140, -280); ctx.strokeStyle = BLK; ctx.lineWidth = 20; ctx.stroke(); ctx.strokeStyle = GOLD; ctx.lineWidth = 12; ctx.stroke();
  fo(E(36, -186, 18, 22), VER, 4); circle(36, -186, 7, WHT);
  hl(-60, -175, 7);
}, q);
const NOSE = [[8, -62], [38, -10], [6, 4]]; // quadratic nose curve on mysoreKing
const tirumala = () => cardImg('tiru', 400, LEAF, () => {
  for (const sx of [-1, 1]) { fo(RR(sx * 200 - 26, -150, 52, 380, 10), WHT, 4); fo(RR(sx * 200 - 36, -172, 72, 26, 6), GOLD, 4); fo(RR(sx * 200 - 36, 216, 72, 22, 6), GOLD, 4); }
  fo(() => { ctx.beginPath(); ctx.moveTo(-174, 230); ctx.lineTo(-174, -150); ctx.arc(0, -150, 174, Math.PI, 0); ctx.lineTo(174, 230); ctx.closePath(); }, VER, 5);
  ctx.beginPath(); ctx.arc(0, -150, 174, Math.PI, 0); ctx.strokeStyle = GOLD; ctx.lineWidth = 10; ctx.stroke();
  for (let i = 0; i <= 12; i++) { const a = Math.PI + i * Math.PI / 12; circle(Math.cos(a) * 150, -150 + Math.sin(a) * 150, 6, IV); }
  fo(E(0, 205, 190, 42), SAF, 5); fo(E(-170, 175, 40, 32), GOLD, 4);
  // seated king in white
  fo(E(0, 160, 150, 58), WHT, 5);
  fo(PL([[-82, 150], [-62, -40], [62, -40], [82, 150]]), WHT, 5);
  stroke([[-70, 60], [70, 40]], GOLD, 12);
  limb([[-62, -20], [-110, 60], [-80, 120]], 22, WHT); limb([[62, -20], [112, 50], [70, 100]], 22, WHT);
  circle(-80, 122, 13, SKIN); circle(70, 102, 13, SKIN);
  fo(RR(-20, -70, 40, 34, 8), SKIN, 4);
  faceless(0, -100, 44, 56);
  fo(PL([[-44, -130], [44, -130], [12, -300], [-12, -300]]), GOLD, 5);
  for (const [dx, dy] of [[-22, -150], [0, -150], [22, -150], [-12, -195], [12, -195], [0, -240]]) circle(dx, dy, 6, VER);
  fo(RR(-48, -142, 96, 16, 6), GOLD, 3); circle(0, -306, 9, GOLD);
  hl(-50, 0, 7); hl(-100, 140, 6); hl(-18, -220, 5);
});
const sackCard = () => cardImg('sack', 400, BLK, () => {
  ctx.fillStyle = VER; ctx.fillRect(-400, 170, 800, 300);
  ctx.fillStyle = '#A8331A'; ctx.fillRect(-400, 170, 800, 10);
  ctx.save(); ctx.translate(205, -20); ctx.rotate(0.35);
  fo(PL([[-16, -40], [16, -40], [0, 230]]), '#CFCBC0', 4); stroke([[0, -30], [0, 200]], '#8E8A80', 3);
  fo(RR(-55, -58, 110, 20, 8), GOLD, 4); fo(RR(-14, -150, 28, 92, 8), SAF, 4); fo(E(0, -160, 22, 16), GOLD, 4);
  ctx.restore();
  sack(-40, 40, 1.05);
  for (let i = 0; i < 12; i++) circle(-300 + i * 55, 260, 6, GOLD);
});
const bookCard = () => cardImg('book', 400, LEAF, () => {
  dotRing(270, 30, 6, SAF);
  pothi(0, 60, 0.95, -0.06);
  pothi(10, -80, 0.8, 0.05);
});
const huntCard = (q = 1.2) => cardImg('hunt', 400, SAF, () => {
  ctx.fillStyle = LEAF; ctx.fillRect(-400, 215, 800, 200);
  for (let i = 0; i < 9; i++) { circle(-280 + i * 70, 262 + (i % 2) * 22, 9, IV); circle(-280 + i * 70, 262 + (i % 2) * 22, 4, VER); }
  ctx.save(); ctx.translate(-20, 20);
  // far legs
  limb([[-100, 70], [-190, 120], [-215, 175]], 22, '#CBBE9E'); limb([[110, 70], [190, 120], [230, 110]], 22, '#CBBE9E');
  // tail
  ctx.beginPath(); ctx.moveTo(-140, 10); ctx.quadraticCurveTo(-220, -40, -260, 30); ctx.strokeStyle = BLK; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = IV; ctx.lineWidth = 16; ctx.stroke();
  fo(E(0, 40, 150, 62), IV, 5);
  fo(PL([[95, 15], [150, -90], [195, -78], [160, 45]]), IV, 5);
  fo(E(200, -76, 54, 25, 0.5), IV, 5); fo(PL([[160, -100], [168, -132], [182, -98]]), IV, 4);
  stroke([[120, -60], [160, 20]], BLK, 5);
  // near legs
  limb([[-110, 80], [-210, 120], [-250, 100]], 24, IV); limb([[120, 80], [170, 150], [215, 190]], 24, IV);
  // saddle cloth + the sack
  fo(RR(-65, -12, 130, 74, 10), VER, 5); for (let i = 0; i < 6; i++) circle(-52 + i * 21, 58, 6, GOLD);
  ctx.save(); sack(-100, 70, 0.32); ctx.restore();
  // rider
  limb([[0, 0], [30, 70], [10, 110]], 26, IND);
  fo(PL([[-45, -5], [-26, -130], [30, -130], [45, -5]]), IND, 5);
  faceless(4, -168, 30, 38);
  fo(E(4, -200, 38, 20), IV, 4); stroke([[-26, -204], [34, -204]], SAF, 6);
  stroke([[-150, -110], [290, -235]], BLK, 9); fo(PL([[290, -235], [262, -212], [256, -238], [318, -250]]), GOLD, 4);
  limb([[20, -110], [70, -150]], 18, IND); circle(74, -152, 12, SKIN);
  hl(-80, 10, 8); hl(-30, -110, 6); hl(180, -90, 5);
  ctx.restore();
}, q);
const aazhiCard = (q = 1.3) => cardImg('aazhi', 400, IND, () => {
  for (let r = 0; r < 4; r++) {
    const y = 170 + r * 46;
    ctx.beginPath(); for (let x = -400; x < 400; x += 80) { ctx.moveTo(x, y); ctx.arc(x + 40, y, 40, Math.PI, 0); }
    ctx.strokeStyle = r % 2 ? SAF : IV; ctx.lineWidth = 8; ctx.stroke();
  }
  circle(0, -170, 70, SAF);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[Math.cos(a) * 88, -170 + Math.sin(a) * 88], [Math.cos(a) * 112, -170 + Math.sin(a) * 112]], SAF, 8); }
  ctx.font = '700 150px Caladea'; ctx.letterSpacing = '10px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = BLK; ctx.strokeText('AAZHI', 6, 30); ctx.fillStyle = GOLD; ctx.fillText('AAZHI', 6, 30);
  ctx.letterSpacing = '0px';
  stroke([[-220, 110], [220, 110]], GOLD, 5); for (const x of [-240, 240]) circle(x, 110, 9, VER);
}, q);
const fishSuit = () => cardImg('fish', 72, LEAF, () => { fishShape(10, 0, 1.25, 1); }, 2.2);
const eleSuit = () => cardImg('ele', 72, VER, () => { elephantShape(-25, -20, 1.05); }, 2.2);

// crackle overlay (cached): fine branching black lines inside the painted ground
const crackImg = () => cached('ccrack', 840, 840, 1, () => {
  ctx.translate(420, 420); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 334, 0, TAU); ctx.clip();
  ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    let x = (rnd(i * 2.3) - 0.5) * 660, y = (rnd(i * 5.9 + 1) - 0.5) * 660, a = rnd(i * 9.1) * TAU;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 9; s++) { a += (rnd(i * 31 + s) - 0.5) * 1.6; x += Math.cos(a) * 34; y += Math.sin(a) * 34; ctx.lineTo(x, y); }
    ctx.strokeStyle = `rgba(20,12,8,${0.35 + rnd(i) * 0.4})`; ctx.lineWidth = 1 + rnd(i + 3) * 1.6; ctx.stroke();
  }
  ctx.restore();
});
// painted Ganjifa cloud scroll (cached)
const cloudImg = () => cached('ccloud', 420, 200, 1, () => {
  ctx.translate(210, 120);
  const puffs = [[-120, 10, 60], [-50, -30, 75], [40, -20, 70], [120, 15, 55], [0, 25, 70]];
  for (const [x, y, r] of puffs) { circle(x, y, r + 5, GOLD); }
  for (const [x, y, r] of puffs) { circle(x, y, r, IV); }
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4;
  for (const [x, y, r] of puffs) { ctx.beginPath(); ctx.arc(x, y, r * 0.55, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke(); }
});

// ───────────── table, slips, chips ─────────────
const baizeImg = () => cached('cbaize', W, H, 0.75, () => {
  const cv = ctx.canvas, id = ctx.createImageData(cv.width, cv.height), d = id.data; let s = 12345;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff; const n = (s / 0x7fffffff - 0.5) * 14 + ((x + y) % 3 === 0 ? 3 : 0), i = (y * cv.width + x) * 4;
    d[i] = 31 + n; d[i + 1] = 59 + n; d[i + 2] = 44 + n; d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  let g = ctx.createRadialGradient(540, 660, 40, 540, 700, 980); g.addColorStop(0, 'rgba(255,200,120,0.34)'); g.addColorStop(0.5, 'rgba(255,180,100,0.12)'); g.addColorStop(1, 'rgba(255,180,100,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(540, 760, 520, 540, 860, 1350); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createLinearGradient(0, 1250, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = g; ctx.fillRect(0, 1250, W, H - 1250);
});
function table() { const b = baizeImg(); ctx.drawImage(b, -120, -120, W + 240, H + 240); }
const MC = document.createElement('canvas').getContext('2d');
function slipImg(text) {
  MC.font = '700 46px Caladea'; MC.letterSpacing = '4px'; const w = Math.ceil(MC.measureText(text).width) + 70, h = 80;
  return cached('cslip' + text, w + 30, h + 30, 1.5, () => {
    ctx.translate(12, 10);
    rr(5, 9, w, h, 4); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    rr(0, 0, w, h, 4); ctx.fillStyle = '#F2E6C9'; ctx.fill();
    rr(8, 8, w - 16, h - 16, 2); ctx.strokeStyle = SLIPRED; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.font = '700 46px Caladea'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TXT; ctx.fillText(text, w / 2 + 2, h / 2 + 3);
  });
}
function slip(text, x, y, s = 1, rot = 0, a = 1) {
  if (s <= 0.01 || a <= 0) return; const im = slipImg(text), w = im.width / im._q, h = im.height / im._q;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * 1.3, s * 1.3); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
const popS = (lt, t0) => (lt < t0 ? 0 : eob(clamp((lt - t0) / 0.3)));
const chipImg = () => cached('cchip', 90, 70, 2, () => {
  ctx.translate(45, 32);
  ctx.beginPath(); ctx.ellipse(0, 8, 38, 18, 0, 0, TAU); ctx.fillStyle = '#9C8A66'; ctx.fill();
  ctx.fillRect(-38, 0, 76, 8);
  ctx.beginPath(); ctx.ellipse(0, 0, 38, 18, 0, 0, TAU); ctx.fillStyle = '#EFE5CC'; ctx.fill(); ctx.strokeStyle = '#7A6A4A'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, TAU); ctx.strokeStyle = VER; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, TAU); ctx.fillStyle = GOLD; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-12, -6, 10, 3, -0.2, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
});
function chip(x, y, s = 1) { const c = chipImg(); ctx.drawImage(c, x - 45 * s, y - 32 * s, 90 * s, 70 * s); }
/** lamp-lit motes, kept out of the caption band */
function motes(t, n = 18, a = 0.5) {
  for (let i = 0; i < n; i++) {
    const x = (rnd(i * 3.3) * 1200 + t * (8 + rnd(i) * 14)) % 1200 - 60, y = 220 + (rnd(i * 7.1) * 980 + t * -10 * (0.4 + rnd(i + 4)) + 2000) % 980;
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 2.3));
    ctx.fillStyle = `rgba(255,226,170,${a * tw})`; ctx.fillRect(x, y, 3, 3);
  }
}
function dim(a) { if (a > 0) { ctx.fillStyle = `rgba(6,10,6,${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); } }
// a few face-down cards lying round the edges of the table
const SCAT = [[110, 250, 0.42, 0.3], [985, 330, 0.38, 1.1], [60, 1120, 0.4, 2.0], [1020, 1080, 0.44, 0.7], [880, 150, 0.3, 2.6], [200, 120, 0.28, 1.7]];
function scatter(skip = 0, a = 1) { for (let i = skip; i < SCAT.length; i++) { const [x, y, s, r] = SCAT[i]; card(backImg(), x, y, s, { rot: r, a }); } }

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const shot = (o) => add({ ...o, draw: (lt, d, t) => o.draw(Math.max(0, lt), d, t) });
  const t10 = L(10), tKing = Wd('king', 10), tLost = Wd('lost', 10), tHist = Wd('historians', 10), tLeg = Wd('legend', 10);
  const t11 = L(11), tDied = Wd('died', 11), tAround = Wd('around', 11), t1659 = Wd('sixteen', 11), tFifty = Wd('fifty', 11), tNine = Wd('nine', 11);
  const t12 = L(12), tMys12 = Wd('mysore', 12), tFight = Wd('fighting', 12), tCruel = Wd('cruel', 12), tLittle = Wd('little', 12), tForg = Wd('forgotten', 12);
  const t13 = L(13), tOld = Wd('old', 13), tSurv = Wd('survives', 13), tFew = Wd('few', 13), tBooks = Wd('books', 13), tHunt = Wd('hunt', 13), tNoses = Wd('noses', 13), tFollow = Wd('follow', 13), tAazhi = Wd('aazhi', 13);

  // c1 · the Madurai account
  shot({ id: 'c1', at: t10, cam: [540, 720], zoom: 0.07, note: 'dealt card flips to the Madurai gopuram; pothi card; MADURAI', draw: (lt, d, t) => {
    table(); scatter(); motes(t);
    const aBook = Wd('account', 10) - t10, kb = eo(clamp((lt - aBook) / 0.4));
    if (lt > aBook) card(bookCard(), lerp(-200, 880, kb), lerp(1300, 1080, kb), 0.3, { rot: lerp(3, 0.25, kb) });
    const k = eo(clamp(lt / 0.5));
    card(madurai(), lerp(1300, CX, k), lerp(-350, CY, k), 0.95, { rot: lerp(-2.6, 0, k) + 0.02 * Math.sin(lt), f: eio(seg(lt, 0.45, 0.95)) });
    slip('MADURAI', 540, 1175, popS(lt, 1.0), -0.03);
  } });
  cue(t10, 'whoosh', { gain: 0.5 }); cue(t10 + 0.48, 'slide', { gain: 0.5 }); cue(Wd('account', 10), 'plop', { gain: 0.4, pan: 0.5 }); cue(t10 + 1.0, 'pop', { gain: 0.45 });

  // c2 · the king of Mysore ... lost his own nose (only a line painted over)
  const NX = CX + 20 * 0.95, NY = CY - 30 * 0.95;
  shot({ id: 'c2', at: tKing, cam: [540, 700], zoom: 0.04, note: 'Mysore king card flips; push-in to the faceless head; nose line painted over in black', draw: (lt, d, t) => {
    const aL = tLost - tKing, z = 1 + 1.25 * eio(seg(lt, aL - 0.15, aL + 0.5)), pb = eio(seg(lt, aL + 0.35, aL + 0.95));
    ctx.save(); ctx.translate(NX, NY); ctx.scale(z, z); ctx.translate(-NX, -NY);
    table(); scatter(); motes(t);
    card(mysoreKing(), CX, CY, 0.95, { rot: 0.015 * Math.sin(lt * 1.3), f: eio(seg(lt, 0, 0.42)), over: () => {
      if (pb <= 0) return;
      ctx.save(); ctx.beginPath(); ctx.moveTo(NOSE[0][0], NOSE[0][1]); ctx.quadraticCurveTo(NOSE[1][0], NOSE[1][1], NOSE[2][0], NOSE[2][1]);
      ctx.setLineDash([95 * pb, 400]); ctx.strokeStyle = BLK; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
    } });
    ctx.restore();
    slip('MYSORE', 540, 1175, popS(lt, 0.4) * (1 - seg(lt, aL - 0.2, aL + 0.1)), 0.03);
  } });
  cue(tKing, 'slide', { gain: 0.5 }); cue(tKing + 0.4, 'pop', { gain: 0.4 }); cue(tLost - 0.1, 'whoosh', { gain: 0.45 }); cue(tLost + 0.35, 'zip', { gain: 0.35 });

  // c3 · historians treat it as legend
  const nosePaint = () => { ctx.save(); ctx.beginPath(); ctx.moveTo(NOSE[0][0], NOSE[0][1]); ctx.quadraticCurveTo(NOSE[1][0], NOSE[1][1], NOSE[2][0], NOSE[2][1]); ctx.strokeStyle = BLK; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); };
  shot({ id: 'c3', at: tHist, cam: [540, 720], zoom: 0.08, note: 'cloud scrolls drift round the king card; LEGEND slip slaps down', draw: (lt, d, t) => {
    table(); scatter(); motes(t, 24, 0.6);
    const aG = tLeg - tHist, slap = clamp((lt - aG) / 0.16), bump = lt > aG ? Math.exp(-(lt - aG - 0.16) * 9) * (lt > aG + 0.16 ? 1 : 0) : 0;
    const s0 = lerp(1.4, 0.82, eo(clamp(lt / 0.6))) * (1 - 0.03 * bump), haze = 0.28 * eo(seg(lt, aG + 0.1, aG + 0.9));
    card(mysoreKing(), CX, CY, s0, { rot: -0.05 * eio(clamp(lt / d)), over: () => { nosePaint(); if (haze > 0) { circle(0, 0, 334, `rgba(237,224,194,${haze})`); } } });
    const cl = cloudImg(), ca = eo(seg(lt, 0.1, 0.9));
    for (const [x0, y0, dx, s, ph] of [[120, 390, 40, 0.8, 0], [960, 500, -50, 0.7, 1], [170, 1030, 30, 0.65, 2], [930, 1000, -35, 0.85, 3]]) {
      const x = x0 + dx * lt + Math.sin(t * 0.8 + ph) * 8 - (x0 < 540 ? 200 : -200) * (1 - ca);
      ctx.globalAlpha = 0.95 * ca; ctx.drawImage(cl, x - 210 * s, y0 - 120 * s, 420 * s, 200 * s); ctx.globalAlpha = 1;
    }
    if (lt > aG) slip('LEGEND', 540, 920, lerp(2.4, 1.25, eo(slap)), -0.1, clamp(slap * 3));
  } });
  cue(tHist, 'swell', { gain: 0.35, dur: 2 }); cue(tLeg, 'slam', { gain: 0.6 }); cue(tLeg + 0.2, 'sparkle', { gain: 0.3 });

  // c4 · Tirumala dies
  shot({ id: 'c4', at: t11, cam: [540, 690], zoom: 0.08, note: 'Tirumala card under the lamp; on "died" lamp dims, crackle, card turns face-down', draw: (lt, d, t) => {
    const aD = tDied - t11, k = eo(seg(lt, aD, aD + 0.8));
    table(); scatter(); motes(t, 18, 0.5 * (1 - k));
    const f = 1 - eio(seg(lt, d - 0.75, d));
    card(tirumala(), CX, CY, 0.95, { rot: 0.03 * Math.sin(lt * 0.9), f, over: () => {
      if (k <= 0) return; circle(0, 0, 334, `rgba(70,60,45,${0.35 * k})`);
      ctx.globalAlpha *= k; const c = crackImg(); ctx.drawImage(c, -420, -420, 840, 840); ctx.globalAlpha = 1;
    } });
    dim(0.32 * k);
  } });
  cue(tDied, 'bell', { gain: 0.45, dur: 2 }); cue(tAround - 0.7, 'slide', { gain: 0.35 });

  // c5 · around 1659: counter chips stack up
  const STK = [[300, 6], [450, 9], [630, 5], [780, 9]];
  shot({ id: 'c5', at: tAround, cam: [540, 820], zoom: 0.07, note: 'counter chips drop into four stacks before the face-down card; c. 1659', draw: (lt, d, t) => {
    table(); scatter(); dim(0.3 - 0.15 * eo(clamp(lt / d)));
    motes(t, 14, 0.35);
    card(backImg(), CX, lerp(640, 560, eo(clamp(lt / 0.6))), lerp(0.95, 0.6, eo(clamp(lt / 0.6))), { rot: 0.02 });
    const starts = [t1659 - tAround, t1659 - tAround + 0.25, tFifty - tAround, tNine - tAround];
    STK.forEach(([x, n], j) => {
      for (let i = 0; i < n; i++) {
        const t0 = starts[j] + i * 0.06; if (lt < t0) break;
        const p = clamp((lt - t0) / 0.14), y = 1180 - i * 15 - (1 - p * p) * 120;
        chip(x, y, 1.6);
      }
    });
    slip('c. 1659', 540, 935, popS(lt, t1659 - tAround), 0.02);
  } });
  cue(t1659, 'pop', { gain: 0.45 }); [t1659 + 0.05, t1659 + 0.3, tFifty, tNine].forEach((tt, i) => cue(tt + 0.1, 'tock', { gain: 0.35, pan: -0.4 + i * 0.27 }));

  // c6 · Madurai and Mysore went on fighting: suits as armies
  const GX = [125, 265, 405], GY = [650, 820, 990];
  shot({ id: 'c6', at: t12, cam: [540, 780], zoom: 0.06, note: 'fish suit (Madurai) and elephant suit (Mysore) cards slide in as armies', draw: (lt, d, t) => {
    table(); scatter(4); motes(t);
    for (let side = 0; side < 2; side++) {
      const t0 = side ? tMys12 - t12 - 0.15 : 0, img = side ? eleSuit() : fishSuit();
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const p = eob(clamp((lt - t0 - (2 - c) * 0.07 - r * 0.05) / 0.5)), gx = side ? 1080 - GX[c] : GX[c];
        const x = lerp(side ? 1400 : -320, gx, p) + (side ? -1 : 1) * 10 * Math.sin(lt * 4 + r + c) * (p > 0.99 ? 1 : 0), y = GY[r] + (c % 2) * 30;
        if (p > 0) card(img, x, y, 1.05, { R: 72, rot: (side ? -1 : 1) * (1 - p) * 1.5 });
      }
    }
    slip('MADURAI', 270, 470, popS(lt, 0.15), -0.04); slip('MYSORE', 810, 470, popS(lt, tMys12 - t12), 0.04);
  } });
  cue(t12, 'whoosh', { gain: 0.5, pan: -0.6 }); cue(tMys12 - 0.15, 'whoosh', { gain: 0.5, pan: 0.6 }); cue(tMys12 + 0.3, 'drum', { gain: 0.4 });

  // c7 · tricks taken back and forth
  const PILE = [[190, 1080], [890, 1080]];
  shot({ id: 'c7', at: tFight, cam: [540, 800], zoom: 0.07, note: 'tricks: fish slaps elephant, elephant slaps fish...; beaten card slides to a pile', draw: (lt, d, t) => {
    table(); scatter(4); motes(t);
    const per = d / 3, i = Math.min(2, Math.floor(lt / per)), u = lt - i * per;
    const suit = (k) => (k % 2 === 0 ? eleSuit() : fishSuit()); // base before trick k: 0 ele, 1 fish, 2 ele
    const pileOf = (k) => (k % 2 === 0 ? 1 : 0);
    // piles: 3 cards each + the beaten ones so far
    for (let side = 0; side < 2; side++) {
      let n = 3; for (let k = 0; k < i; k++) if (pileOf(k) === side) n++;
      for (let m = 0; m < n; m++) card(side ? eleSuit() : fishSuit(), PILE[side][0] + rnd(m + side * 9) * 16 - 8, PILE[side][1] - m * 8, 1.45, { R: 72, rot: rnd(m * 3 + side) * 2 });
    }
    const slapAt = 0.26, slide = eio(clamp((u - slapAt - 0.08) / 0.3));
    // the beaten card (the old winner) slides off to its pile
    const [px, py] = PILE[pileOf(i)];
    card(suit(i), lerp(540, px, slide), lerp(700, py - 30, slide), lerp(2.7, 1.45, slide), { R: 72, rot: 0.1 * i + slide * 2 });
    // the new card slaps down on it
    const p = clamp(u / slapAt), from = i % 2 ? [1250, 200] : [-170, 200], bump = u > slapAt ? Math.exp(-(u - slapAt) * 14) : 0;
    card(suit(i + 1), lerp(from[0], 540, eo(p)), lerp(from[1], 700, eo(p)), lerp(3.6, 2.7, p * p) * (1 + 0.04 * bump), { R: 72, rot: lerp(i % 2 ? 2.5 : -2.5, 0.1 * (i + 1), eo(p)) });
  } });
  for (let k = 0; k < 3; k++) { const tt = tFight + k * (tCruel - tFight) / 3; cue(tt + 0.26, 'slam', { gain: 0.5, pan: k % 2 ? 0.3 : -0.3 }); cue(tt + 0.36, 'slide', { gain: 0.3 }); }

  // c8 · this cruel little war: the sack card, pull back to a table full of cards
  const BIG = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + rnd(i) * 0.3, r = 560 + rnd(i + 4) * 380; BIG.push([CX + Math.cos(a) * r * 1.1, CY + Math.min(Math.sin(a) * r * 0.95, 560 + rnd(i) * 60), 0.42 + rnd(i * 2) * 0.12, rnd(i * 5) * 6]); }
  const bigTable = (z, a = 1) => {
    ctx.save(); ctx.translate(CX, CY); ctx.scale(z, z); ctx.translate(-CX, -CY);
    for (const [x, y, s, r] of BIG) if (y < CY + 1000) card(backImg(), x, Math.min(y, CY + 900), s, { rot: r, a });
    ctx.restore();
  };
  const sackAt = (z, over) => card(sackCard(), CX, CY, 0.95 * z, { rot: 0.04, over });
  shot({ id: 'c8', at: tCruel, cam: [540, 700], zoom: 0.03, note: 'sack-and-dagger card fills the frame; pull back: one little card among many', draw: (lt, d, t) => {
    const z = lerp(1.9, 0.56, eio(seg(lt, 0, d)));
    table(); motes(t, 14, 0.4);
    bigTable(z); sackAt(z);
  } });
  cue(tCruel, 'rumble', { gain: 0.45, dur: 2 }); cue(tLittle, 'whoosh', { gain: 0.3 });

  // c9 · forgotten
  shot({ id: 'c9', at: tForg, cam: [540, 760], zoom: 0.05, note: 'lamp dims, table greys, the sack card crackles; FORGOTTEN slip', draw: (lt, d, t) => {
    const z = lerp(0.56, 0.52, eio(clamp(lt / d))), k = eo(clamp(lt / 1.0));
    table(); bigTable(z); sackAt(z, () => { ctx.globalAlpha *= k; ctx.drawImage(crackImg(), -420, -420, 840, 840); ctx.globalAlpha = 1; circle(0, 0, 334, `rgba(90,80,62,${0.3 * k})`); });
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.85 * k})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
    dim(0.38 * k);
    motes(t, 22, 0.35);
    slip('FORGOTTEN', 540, 1150, popS(lt, 0.15), -0.02);
  } });
  cue(tForg + 0.15, 'thud', { gain: 0.45 });

  // c10 · its old name survives: a card slides out from under the dusty pile
  shot({ id: 'c10', at: tOld, cam: [540, 760], zoom: 0.07, note: 'lamp returns; one card slides out from under a dusty pile', draw: (lt, d, t) => {
    const lamp = eo(clamp(lt / 0.8));
    table(); scatter();
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.75 - 0.45 * lamp})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
    dim(0.38 - 0.3 * lamp);
    const aS = tSurv - tOld, p = eio(seg(lt, aS - 0.15, aS + 0.8));
    card(backImg(), lerp(540, 560, p), lerp(900, 600, p), lerp(0.5, 0.7, p), { rot: lerp(0.3, 0, p), f: 0, flipping: false });
    for (let m = 0; m < 5; m++) card(backImg(), 540 + (rnd(m) - 0.5) * 40, 920 - m * 9, 0.52, { rot: rnd(m + 3) * 3 });
    // dust puffs from the pile
    if (lt > aS) for (let i = 0; i < 12; i++) {
      const u = clamp((lt - aS - rnd(i) * 0.2) / 0.9), a = rnd(i * 3) * TAU, r = 60 + u * (120 + rnd(i + 1) * 80);
      if (u > 0 && u < 1) circle(540 + Math.cos(a) * r * 1.4, 880 + Math.sin(a) * r * 0.6 - u * 40, 14 + u * 26, `rgba(230,214,180,${0.35 * (1 - u)})`);
    }
    motes(t, 18, 0.45 * lamp);
  } });
  cue(tOld, 'swell', { gain: 0.3, dur: 1.5 }); cue(tSurv - 0.1, 'slide', { gain: 0.45 }); cue(tSurv, 'bubbles', { gain: 0.15 });

  // c11 · a few books; the hunt for noses
  shot({ id: 'c11', at: tFew, cam: [540, 760], zoom: 0.07, note: 'three pothi cards dealt; survivor card flips to the hunt: rider, spear, sack', draw: (lt, d, t) => {
    table(); scatter(); motes(t);
    const bt = [0, 0.18, tBooks - tFew];
    [300, 540, 780].forEach((x, j) => {
      const p = eo(clamp((lt - bt[j]) / 0.35)); if (p <= 0) return;
      card(bookCard(), lerp(x + (j - 1) * 300, x, p), lerp(1500, 1120, p), 0.28, { rot: lerp(3 * (j - 1) + 2, (j - 1) * 0.12, p) });
    });
    const aH = tHunt - tFew, f = eio(seg(lt, aH - 0.1, aH + 0.4)), g = eo(clamp(lt / d));
    card(huntCard(), 560 - 20 * g, lerp(600, 610, g), lerp(0.7, 0.9, eio(seg(lt, 0, aH + 0.5))), { f, rot: 0.02 * Math.sin(lt * 2) });
  } });
  [0, 0.18, tBooks - tFew].forEach((o, j) => cue(tFew + o, 'tock', { gain: 0.35, pan: (j - 1) * 0.5 })); cue(tHunt - 0.1, 'slide', { gain: 0.5 }); cue(tNoses, 'drum', { gain: 0.4 });

  // c12 · end card
  const GATH = [[-300, 300, 2.2], [1380, 420, -1.8], [-260, 1250, 1.4], [1340, 1200, -2.6], [540, -320, 3.0], [1300, -200, -1.2]];
  shot({ id: 'c12', at: tFollow, cam: [540, 720], zoom: 0.06, note: 'end card: cards gather into a stack, top flips to AAZHI; FOLLOW', draw: (lt, d, t) => {
    table(); motes(t, 20, 0.5);
    GATH.forEach(([x, y, r], i) => {
      const p = eio(clamp((lt - i * 0.07) / 0.55));
      card(backImg(), lerp(x, 540 + (rnd(i) - 0.5) * 24, p), lerp(y, 730 + i * 8, p), lerp(0.6, 0.88, p), { rot: lerp(r, (rnd(i + 2) - 0.5) * 0.5, p) });
    });
    const aA = tAazhi - tFollow, p = eo(clamp((lt - 0.2) / 0.5)), f = eio(seg(lt, aA - 0.05, aA + 0.5));
    const sweep = seg(lt, aA + 0.6, aA + 1.4);
    card(aazhiCard(), 540, lerp(1500, 680, p), 0.92, { rot: lerp(-2, 0, p), f, over: () => {
      if (sweep <= 0 || sweep >= 1) return;
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 334, 0, TAU); ctx.clip(); const x = lerp(-500, 500, sweep);
      ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(x - 60, -400); ctx.lineTo(x + 20, -400); ctx.lineTo(x - 120, 400); ctx.lineTo(x - 200, 400); ctx.closePath(); ctx.fill(); ctx.restore();
    } });
    slip('FOLLOW', 540, 1175, popS(lt, aA + 0.5) * 1.15, -0.02);
  } });
  cue(tFollow, 'whoosh', { gain: 0.5 }); cue(tFollow + 0.25, 'slide', { gain: 0.4 }); cue(tAazhi, 'slide', { gain: 0.5 }); cue(tAazhi + 0.45, 'sparkle', { gain: 0.4 }); cue(tAazhi + 0.5, 'pop', { gain: 0.5 }); cue(tFollow + 0.1, 'swell', { gain: 0.35, dur: 2 });
}
