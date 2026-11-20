// EPISODE 14 · worker B : "Ganjifa Round Cards", lines 5-9 (sacks to Srirangapatna, why noses, Tirumala calls the Sethupathi,
// 25,000 drive Mysore back, Madurai strikes into Mysore country)
//   b1  face card on the baize; black paint covers its nose line; "THEY SAY" slip
//   b2  a back flips to the sack card; little nose-mark counters drop into the sack mouth one by one
//   b3  Srirangapatna island-fort card flips up; small sack cards are dealt in and pile at its gate; "SRIRANGAPATNA"
//   b4  "why noses?": the blacked-out face card flips up, three face-down cards are dealt in a row below
//   b5  the row: card 1 flips to a dagger (punishment), card 2 to a bowed figure (humiliation); camera pans
//   b6  closer on the row: card 3 flips to a lamp in a petal mandala (ritual), the flame flickers
//   b7  Tirumala card (seated king, conical crown, palace arches) flips up; the lacquer dulls and crackles (old, ill)
//   b8  the cracked Tirumala card; a gold thread runs out, a dealt card spins in and flips to the conch suit (ally)
//   b9  push-in through the Sethupathi card (figure with conch banner); "RAMNAD"
//   b10 rows of conch suit cards push across the baize, ivory counters stack 5 x 5; "SAID TO BE 25,000"
//   b11 trick taken: a conch card slaps down on the elephant card, the beaten card slides off to a pile, elephant row retreats
//   b12 Madurai gopuram card flips up, fish suit cards fan out below it; "MADURAI"
//   b13 Mysore elephant card at the top of the table; rows of fish suit cards slide in and advance on it; "MYSORE"
//   b14 pull back out of the face card to the table; a fish-tagged sack card slides in; the nose is blacked out; "ACCOUNTS SAY"
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, rgba, mixc } from './art.js';

const G = {
  rim: '#5A1F14', rimD: '#3A120B', gold: '#D8A845', ivory: '#EDE0C2', verm: '#C8401E', leaf: '#3E7A3A', indigo: '#24366B',
  saff: '#E69A2A', black: '#1B1410', baize: '#1F3B2C', maroon: '#6E1F1A', ink: '#2B1408', skin: '#D49A66', white: '#F6EFDC',
  robe: '#F3ECDA', brown: '#6B3A1E', sack: '#D9C49A', sackD: '#C2A877', slip: '#F2E7CC', slipRed: '#B3302A',
};
const K0 = 340;                    // card paint units: the painted ground is a disc of radius 340

// ───────────── paint helpers (card units) ─────────────
function ink(fill, w = 3.2) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.lineWidth = w; ctx.strokeStyle = G.black; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
}
const dot = (x, y, r = 3, c = G.white) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); };
const E = (x, y, rx, ry, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); };
const RR = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
function sprigs(seed, col, n = 26) {
  for (let i = 0; i < n; i++) {
    const a = rnd(seed + i * 1.7) * TAU, rr = Math.sqrt(rnd(seed * 3 + i)) * 320, x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    for (let k = 0; k < 5; k++) dot(x + Math.cos(k * 1.2566) * 6, y + Math.sin(k * 1.2566) * 6, 3.2, col);
    dot(x, y, 2.4, G.gold);
  }
}
function ground(col, seed = 1, spr = 'rgba(237,224,194,0.5)') { ctx.fillStyle = col; ctx.fillRect(-360, -360, 720, 720); sprigs(seed, spr); }
function stroke2(pts, w, col) {      // a thick limb: black outline then colour
  for (const [ww, c] of [[w + 6, G.black], [w, col]]) {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.lineWidth = ww; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
}
const head = (x, y, rx, ry, rot = 0) => { E(x, y, rx, ry, rot); ink(G.skin); dot(x - rx * 0.4, y - ry * 0.45, rx * 0.12, 'rgba(255,248,230,0.8)'); };

// ───────────── emblems ─────────────
function fish(col = G.leaf, fin = G.ivory) {
  ctx.beginPath(); ctx.moveTo(140, 0); ctx.lineTo(240, -90); ctx.quadraticCurveTo(205, 0, 240, 90); ctx.closePath(); ink(fin);
  ctx.beginPath(); ctx.moveTo(-40, -80); ctx.quadraticCurveTo(10, -150, 80, -66); ctx.closePath(); ink(fin);
  ctx.beginPath(); ctx.moveTo(-210, 0); ctx.bezierCurveTo(-120, -125, 80, -115, 155, 0); ctx.bezierCurveTo(80, 115, -120, 125, -210, 0); ink(col);
  ctx.strokeStyle = 'rgba(20,12,6,0.4)'; ctx.lineWidth = 3;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-70 + k * 42, -40 + r * 40, 18, -1.2, 1.2); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-120, 0, 60, -0.9, 0.9); ctx.lineWidth = 4; ctx.strokeStyle = G.black; ctx.stroke();
  E(-160, -18, 13, 13); ink(G.ivory); dot(-158, -18, 5, G.black);
  for (let k = 0; k < 4; k++) dot(-60 + k * 50, -70 + k * 4, 4);
}
function elephant(col = G.indigo, trap = G.saff) {
  ctx.save(); ctx.translate(30, -40);
  for (const lx of [-110, -50, 60, 120]) { RR(lx - 24, 60, 48, 140, 12); ink(mixc(col, '#000000', lx < 0 ? 0 : 0.18)); }
  ctx.beginPath(); ctx.moveTo(185, -10); ctx.quadraticCurveTo(215, 50, 200, 110); ctx.lineWidth = 9; ctx.strokeStyle = G.black; ctx.stroke();
  E(20, 20, 175, 112); ink(col);
  E(-150, -40, 82, 86); ink(col);
  ctx.beginPath(); ctx.moveTo(-218, -20); ctx.quadraticCurveTo(-258, 90, -226, 192); ctx.quadraticCurveTo(-204, 218, -182, 196); ctx.quadraticCurveTo(-204, 100, -160, 30); ctx.closePath(); ink(col);
  ctx.beginPath(); ctx.moveTo(-188, 32); ctx.quadraticCurveTo(-214, 84, -258, 80); ctx.quadraticCurveTo(-218, 60, -174, 44); ctx.closePath(); ink(G.ivory);
  E(-108, -26, 52, 72, 0.1); ink(mixc(col, '#000000', 0.25));
  RR(-30, -84, 170, 134, 16); ink(trap); for (let k = 0; k < 9; k++) { dot(-18 + k * 18.5, -70, 4.5, G.gold); dot(-18 + k * 18.5, 36, 4.5, G.gold); }
  RR(-20, -60, 150, 22, 6); ink(G.verm);
  E(-150, -108, 36, 16); ink(G.gold);
  for (let k = 0; k < 5; k++) dot(-180 + k * 30, -10 + Math.sin(k) * 10, 4);
  ctx.restore();
}
function conch(col = G.white) {
  ctx.beginPath(); ctx.moveTo(-20, -190); ctx.bezierCurveTo(120, -180, 165, -40, 92, 90); ctx.quadraticCurveTo(40, 190, -8, 250);
  ctx.quadraticCurveTo(-40, 160, -112, 90); ctx.bezierCurveTo(-172, 0, -132, -168, -20, -190); ink(col);
  for (const [y, rx, ry] of [[-200, 56, 24], [-232, 38, 18], [-256, 22, 11]]) { E(-10, y, rx, ry); ink(col); }
  ctx.beginPath(); ctx.moveTo(48, -140); ctx.quadraticCurveTo(122, 10, 6, 210); ctx.lineWidth = 5; ctx.strokeStyle = G.black; ctx.stroke();
  ctx.strokeStyle = 'rgba(36,54,107,0.55)'; ctx.lineWidth = 6;
  for (const k of [-90, -30, 30, 90]) { ctx.beginPath(); ctx.moveTo(-130 + Math.abs(k) * 0.3, k); ctx.quadraticCurveTo(-40, k + 30, 40, k - 10); ctx.stroke(); }
  for (let k = 0; k < 5; k++) dot(-80 + k * 12, -120 + k * 40, 5, '#FFFFFF');
}

// ───────────── card faces (all in card units) ─────────────
function noseLine() {
  ctx.beginPath(); ctx.moveTo(-4, -70); ctx.quadraticCurveTo(28, 6, 20, 28); ctx.quadraticCurveTo(10, 40, -12, 34);
  ctx.lineWidth = 8; ctx.strokeStyle = G.brown; ctx.lineCap = 'round'; ctx.stroke();
}
function blackPatch(p = 1) {           // the nose painted over in black (p = how far the brush has gone)
  const n = 9, m = Math.ceil(n * clamp(p));
  for (let k = 0; k < m; k++) { const u = k / (n - 1); const x = lerp(-6, 18, u) + Math.sin(k * 2.1) * 6, y = lerp(-86, 46, u); E(x, y, 40 + rnd(k) * 8, 30 + rnd(k + 3) * 6, 0.3); ctx.fillStyle = G.black; ctx.fill(); }
}
function pFace(black) {
  ground(G.indigo, 11);
  ctx.beginPath(); ctx.moveTo(-280, 360); ctx.quadraticCurveTo(-250, 170, -90, 150); ctx.lineTo(90, 150); ctx.quadraticCurveTo(250, 170, 280, 360); ctx.closePath(); ink(G.verm);
  for (let k = 0; k < 12; k++) dot(-150 + k * 27, 175 + Math.abs(k - 5.5) * 3, 5, G.gold);
  RR(-42, 80, 84, 96, 10); ink(G.skin);
  ctx.beginPath(); ctx.arc(0, 120, 70, 0.35, Math.PI - 0.35); ctx.lineWidth = 7; ctx.strokeStyle = G.gold; ctx.stroke();
  head(0, -30, 120, 150);
  ctx.beginPath(); ctx.moveTo(-122, -40); ctx.bezierCurveTo(-130, -170, -60, -190, 0, -190); ctx.bezierCurveTo(60, -190, 130, -170, 122, -40);
  ctx.quadraticCurveTo(80, -150, 0, -150); ctx.quadraticCurveTo(-80, -150, -122, -40); ctx.closePath(); ink(G.black);
  for (const sx of [-1, 1]) { E(sx * 124, 30, 13, 13); ink(G.gold); dot(sx * 124, 52, 7, G.verm); }
  noseLine();
  if (black) blackPatch(1);
}
function sackBody() {
  ctx.beginPath(); ctx.moveTo(-62, -140); ctx.bezierCurveTo(-210, -80, -235, 150, -175, 250); ctx.quadraticCurveTo(0, 300, 175, 250); ctx.bezierCurveTo(235, 150, 210, -80, 62, -140); ctx.closePath();
}
function pSack(emb) {
  ground(G.saff, 21, 'rgba(200,64,30,0.5)');
  sackBody(); ink(G.sack, 4);
  ctx.save(); sackBody(); ctx.clip(); ctx.fillStyle = G.sackD; E(130, 120, 120, 170); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(60,36,14,0.55)'; ctx.lineWidth = 4;
  for (const [a, b, c] of [[-40, -120, -110], [10, -110, 20], [50, -120, 110]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c * 1.3, 60, c, 240); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-62, -140); ctx.lineTo(-118, -232); ctx.quadraticCurveTo(0, -256, 118, -232); ctx.lineTo(62, -140); ctx.closePath(); ink(G.sackD);
  RR(-80, -166, 160, 32, 14); ink(G.verm);
  ctx.beginPath(); ctx.moveTo(40, -150); ctx.quadraticCurveTo(110, -110, 96, -40); ctx.moveTo(48, -150); ctx.quadraticCurveTo(140, -130, 150, -70); ctx.lineWidth = 9; ctx.strokeStyle = G.black; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = G.verm; ctx.stroke();
  for (let k = 0; k < 6; k++) dot(-150 + k * 8, -20 + k * 34, 5);
  if (emb) {
    E(0, 100, 92, 92); ink(G.ivory); ctx.save(); ctx.translate(0, 100); ctx.scale(0.34, 0.34);
    if (emb === 'fish') fish(); else elephant(G.indigo, G.saff); ctx.restore();
  }
}
function pFort() {
  ground(G.leaf, 31);
  ctx.lineCap = 'round';
  for (const [w, c] of [[96, G.black], [88, G.indigo]]) { ctx.beginPath(); ctx.moveTo(-380, -170); ctx.quadraticCurveTo(-240, -40, -180, 0); ctx.moveTo(180, 70); ctx.quadraticCurveTo(250, 160, 380, 250); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
  E(0, 40, 300, 215, -0.12); ink(G.indigo);
  ctx.strokeStyle = 'rgba(246,239,220,0.75)'; ctx.lineWidth = 4;
  for (let k = 0; k < 26; k++) { const a = k / 26 * TAU, x = Math.cos(a) * 262, y = 40 + Math.sin(a) * 180; ctx.beginPath(); ctx.arc(x, y, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  E(0, 44, 214, 132, -0.12); ink('#E3C98E');
  sprigs(77, 'rgba(62,122,58,0.6)', 8);
  // fort walls on the island
  RR(-170, -30, 340, 120, 6); ink(G.saff);
  for (let k = 0; k < 15; k++) { RR(-166 + k * 23, -50, 14, 22, 2); ink(G.saff, 2.4); }
  for (const [x, y] of [[-170, -30], [170, -30], [-170, 90], [170, 90]]) { E(x, y, 30, 30); ink(mixc(G.saff, G.verm, 0.35)); dot(x - 10, y - 10, 5); }
  ctx.beginPath(); ctx.moveTo(-34, 90); ctx.lineTo(-34, 40); ctx.arc(0, 40, 34, Math.PI, 0); ctx.lineTo(34, 90); ctx.closePath(); ink(G.black);
  // a temple tower and a dome inside the walls
  ctx.beginPath(); ctx.moveTo(-120, -40); ctx.lineTo(-100, -170); ctx.lineTo(-40, -170); ctx.lineTo(-20, -40); ctx.closePath(); ink(G.verm);
  for (const y of [-80, -120, -150]) { ctx.beginPath(); ctx.moveTo(-112, y); ctx.lineTo(-28, y); ctx.lineWidth = 3; ctx.strokeStyle = G.black; ctx.stroke(); }
  E(-70, -182, 34, 14); ink(G.ivory); dot(-70, -200, 7, G.gold);
  ctx.beginPath(); ctx.moveTo(30, -40); ctx.lineTo(30, -90); ctx.arc(80, -90, 50, Math.PI, 0); ctx.lineTo(130, -40); ctx.closePath(); ink(G.ivory); dot(80, -150, 7, G.gold);
  for (let k = 0; k < 8; k++) dot(-140 + k * 40, 8, 4.5);
}
function pDagger() {
  ground(G.verm, 41, 'rgba(237,224,194,0.45)');
  ctx.beginPath(); ctx.arc(0, 0, 300, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = G.ivory; ctx.stroke();
  for (let k = 0; k < 36; k++) { const a = k / 36 * TAU; dot(Math.cos(a) * 280, Math.sin(a) * 280, 6, G.ivory); }
  ctx.fillStyle = G.black;
  ctx.beginPath(); ctx.moveTo(-46, 30); ctx.lineTo(0, -270); ctx.lineTo(46, 30); ctx.closePath(); ctx.fill();
  RR(-90, 26, 180, 22, 6); ctx.fill(); RR(-86, 30, 24, 210, 8); ctx.fill(); RR(62, 30, 24, 210, 8); ctx.fill();
  RR(-66, 110, 132, 18, 6); ctx.fill(); RR(-66, 150, 132, 18, 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -230); ctx.lineWidth = 3; ctx.strokeStyle = G.gold; ctx.stroke();
  for (const [x, y] of [[-74, 60], [74, 60], [-74, 200], [74, 200], [0, 38]]) dot(x, y, 6, G.gold);
}
function pBowed() {
  ground(G.ivory, 51, 'rgba(200,64,30,0.45)');
  ctx.beginPath(); ctx.rect(-360, 180, 720, 200); ink(G.saff);
  for (let k = 0; k < 14; k++) dot(-300 + k * 46, 210, 5, G.verm);
  ctx.beginPath(); ctx.moveTo(150, 182); ctx.bezierCurveTo(150, 40, 80, -60, -10, -40); ctx.bezierCurveTo(-90, -20, -110, 60, -110, 182); ctx.closePath(); ink(G.indigo);
  stroke2([[-60, 30], [-150, 110], [-200, 176]], 26, G.skin);
  head(-150, 60, 44, 54, 0.6);
  E(-120, 14, 24, 22); ink(G.black);
  RR(-40, 120, 170, 18, 6); ink(G.gold);
  for (let k = 0; k < 4; k++) dot(20 + k * 30, -10 + k * 20, 5);
}
function flame(x, y, s = 1, f = 0) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - 30 * s, y - 20 * s, x - 14 * s + f, y - 70 * s, x + f * 1.5, y - 104 * s); ctx.bezierCurveTo(x + 14 * s + f, y - 70 * s, x + 30 * s, y - 20 * s, x, y); ink(G.saff, 3);
  ctx.beginPath(); ctx.moveTo(x, y - 6 * s); ctx.bezierCurveTo(x - 12 * s, y - 20 * s, x - 4 * s, y - 50 * s, x + f, y - 66 * s); ctx.bezierCurveTo(x + 6 * s, y - 50 * s, x + 12 * s, y - 20 * s, x, y - 6 * s); ctx.fillStyle = '#FFF1B8'; ctx.fill();
}
function pLamp() {
  ground(G.indigo, 61);
  for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; ctx.save(); ctx.rotate(a); E(250, 0, 34, 14); ink(G.ivory, 2.4); ctx.restore(); dot(Math.cos(a + 0.13) * 205, Math.sin(a + 0.13) * 205, 6, G.saff); }
  E(0, 230, 130, 32); ink(G.saff); RR(-20, 10, 40, 220, 8); ink(G.saff);
  for (const y of [70, 150]) { E(0, y, 36, 14); ink(mixc(G.saff, G.gold, 0.5)); }
  ctx.beginPath(); ctx.moveTo(-140, -10); ctx.quadraticCurveTo(0, 90, 140, -10); ctx.closePath(); ink(G.saff);
  E(0, -10, 140, 18); ink(mixc(G.saff, '#000000', 0.15));
  for (let k = 0; k < 6; k++) dot(-90 + k * 36, 22, 4.5);
  flame(0, -18, 1, 0);
}
function pTirumala() {
  ground(G.verm, 71);
  for (const bx of [-190, 0, 190]) { ctx.beginPath(); ctx.moveTo(bx - 64, 200); ctx.lineTo(bx - 64, -170); ctx.arc(bx, -170, 64, Math.PI, 0); ctx.lineTo(bx + 64, 200); ctx.closePath(); ink(G.indigo); }
  for (const px of [-285, -95, 95, 285]) {
    RR(px - 30, -250, 60, 470, 8); ink(G.ivory);
    for (const y of [-200, -60, 80]) { RR(px - 36, y, 72, 22, 6); ink(G.saff, 2.6); }
    dot(px - 12, -150, 5, '#FFFFFF');
  }
  ctx.beginPath(); ctx.rect(-360, 200, 720, 200); ink(G.saff);
  RR(-240, 150, 480, 80, 18); ink(G.verm); for (let k = 0; k < 14; k++) dot(-220 + k * 34, 190, 5, G.gold);
  E(175, 70, 50, 90); ink(G.leaf);
  // robe
  ctx.beginPath(); ctx.moveTo(-82, -40); ctx.lineTo(82, -40); ctx.quadraticCurveTo(124, -30, 132, 40); ctx.lineTo(205, 196); ctx.quadraticCurveTo(0, 236, -205, 196); ctx.lineTo(-132, 40); ctx.quadraticCurveTo(-124, -30, -82, -40); ctx.closePath(); ink(G.robe);
  ctx.strokeStyle = 'rgba(80,60,40,0.4)'; ctx.lineWidth = 3;
  for (const k of [-120, -60, 40, 100]) { ctx.beginPath(); ctx.moveTo(k * 0.4, 40); ctx.quadraticCurveTo(k * 0.8, 120, k * 1.4, 200); ctx.stroke(); }
  stroke2([[-80, -10], [-130, 80], [-60, 140]], 22, G.robe);
  stroke2([[80, -10], [128, 80], [70, 120]], 22, G.robe);
  E(-54, 142, 18, 14); ink(G.skin); E(64, 120, 18, 14); ink(G.skin);
  stroke2([[-78, -38], [104, 140]], 20, G.saff);
  ctx.beginPath(); ctx.arc(0, -40, 58, 0.25, Math.PI - 0.25); ctx.lineWidth = 7; ctx.strokeStyle = G.gold; ctx.stroke();
  for (let k = 0; k < 7; k++) { const a = 0.4 + k * 0.39; dot(Math.cos(a) * 58, -40 + Math.sin(a) * 58, 6, G.verm); }
  RR(-22, -76, 44, 40, 8); ink(G.skin);
  head(0, -100, 46, 56);
  ctx.beginPath(); ctx.moveTo(-50, -142); ctx.lineTo(-30, -300); ctx.quadraticCurveTo(0, -338, 30, -300); ctx.lineTo(50, -142); ctx.closePath(); ink(G.gold);
  ctx.strokeStyle = G.black; ctx.lineWidth = 3;
  for (const [y, w] of [[-180, 45], [-220, 40], [-262, 34]]) { ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.stroke(); }
  for (const [x, y] of [[0, -160], [-22, -200], [22, -200], [0, -242], [0, -282]]) dot(x, y, 6, G.verm);
  E(0, -332, 9, 9); ink(G.white, 2);
  dot(-30, -170, 4, '#FFFFFF');
}
function pSethu() {
  ground(G.leaf, 81);
  ctx.beginPath(); ctx.rect(-360, 250, 720, 200); ink(G.saff);
  // pole + banner with the conch
  stroke2([[-40, -240], [-40, 300]], 10, G.brown);
  ctx.beginPath(); ctx.moveTo(-40, -240); ctx.lineTo(-222, -222); ctx.lineTo(-186, -178); ctx.lineTo(-222, -134); ctx.lineTo(-40, -132); ctx.closePath(); ink(G.indigo);
  for (let k = 0; k < 6; k++) dot(-60 - k * 28, -226 + k * 1.6, 3.6, G.gold);
  ctx.save(); ctx.translate(-118, -184); ctx.scale(0.17, 0.17); conch(); ctx.restore();
  E(-40, -250, 12, 12); ink(G.gold);
  // the Sethupathi
  ctx.beginPath(); ctx.moveTo(20, 40); ctx.lineTo(130, 40); ctx.lineTo(160, 262); ctx.lineTo(-12, 262); ctx.closePath(); ink(G.robe);
  for (const x of [40, 80, 115]) { ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x + (x - 75) * 0.3, 255); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(80,60,40,0.4)'; ctx.stroke(); }
  RR(0, 238, 60, 26, 10); ink(G.skin); RR(92, 238, 60, 26, 10); ink(G.skin);
  RR(22, -60, 108, 112, 22); ink(G.saff);
  RR(16, 30, 120, 22, 6); ink(G.verm);
  stroke2([[40, -40], [-6, -110], [-34, -150]], 20, G.skin);
  stroke2([[118, -40], [148, 40], [150, 110]], 20, G.skin);
  ctx.beginPath(); ctx.arc(76, -58, 40, 0.3, Math.PI - 0.3); ctx.lineWidth = 6; ctx.strokeStyle = G.gold; ctx.stroke();
  head(76, -104, 38, 46);
  E(76, -146, 46, 22); ink(G.white); E(96, -160, 16, 14); ink(G.white); dot(60, -150, 5, G.verm);
  for (const [x, y] of [[44, -30], [40, 120], [60, 200]]) dot(x, y, 5);
}
function pGopuram() {
  ground(G.saff, 91, 'rgba(200,64,30,0.45)');
  for (let i = 0; i < 6; i++) {
    const y0 = 160 - i * 62, w0 = 380 - i * 44, w1 = w0 - 40;
    ctx.beginPath(); ctx.moveTo(-w0 / 2, y0); ctx.lineTo(-w1 / 2, y0 - 62); ctx.lineTo(w1 / 2, y0 - 62); ctx.lineTo(w0 / 2, y0); ctx.closePath(); ink(i % 2 ? G.ivory : G.verm);
    const n = 5 - Math.floor(i / 2);
    for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * (w1 / n); RR(x - 9, y0 - 46, 18, 30, 8); ink(i % 2 ? G.indigo : G.ivory, 2.2); }
  }
  ctx.beginPath(); ctx.ellipse(0, -212, 100, 46, 0, Math.PI, TAU); ctx.closePath(); ink(G.verm);
  for (let k = -2; k <= 2; k++) { E(k * 36, -246 - (2 - Math.abs(k)) * 8, 9, 13); ink(G.gold, 2.4); }
  RR(-200, 160, 400, 160, 6); ink(G.ivory);
  ctx.beginPath(); ctx.moveTo(-46, 320); ctx.lineTo(-46, 220); ctx.arc(0, 220, 46, Math.PI, 0); ctx.lineTo(46, 320); ctx.closePath(); ink(G.black);
  for (const x of [-150, 150]) { E(x, 230, 40, 40); ink(G.indigo); ctx.save(); ctx.translate(x, 230); ctx.scale(0.14, 0.14); fish(G.leaf, G.ivory); ctx.restore(); }
  for (let k = 0; k < 5; k++) dot(-140 + k * 14, 120 - k * 62, 5);
}
function pMysore() {
  ground(G.verm, 101, 'rgba(237,224,194,0.45)');
  ctx.save(); ctx.translate(10, 20); ctx.scale(1.1, 1.1); elephant(G.indigo, G.saff); ctx.restore();
}
function pSuit(kind) {
  if (kind === 'fish') { ground(G.saff, 3, 'rgba(62,122,58,0.0)'); ctx.save(); ctx.scale(1.2, 1.2); ctx.translate(-10, 0); fish(G.leaf, G.ivory); ctx.restore(); }
  else if (kind === 'eleph') { ground(G.verm, 4, 'rgba(0,0,0,0)'); ctx.save(); ctx.scale(1.15, 1.15); ctx.translate(10, 20); elephant(G.indigo, G.saff); ctx.restore(); }
  else { ground(G.indigo, 5, 'rgba(0,0,0,0)'); ctx.save(); ctx.scale(1.05, 1.05); ctx.translate(0, 10); conch(G.white); ctx.restore(); }
}
function pBack() {
  ctx.fillStyle = G.maroon; ctx.fillRect(-360, -360, 720, 720);
  ctx.beginPath(); ctx.arc(0, 0, 300, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = G.gold; ctx.stroke();
  ctx.fillStyle = G.gold;
  for (let k = 0; k < 8; k++) { ctx.save(); ctx.rotate(k * TAU / 8); E(0, -52, 18, 44); ctx.fill(); ctx.restore(); }
  E(0, 0, 26, 26); ctx.fillStyle = G.maroon; ctx.fill(); E(0, 0, 14, 14); ctx.fillStyle = G.gold; ctx.fill();
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.785; dot(Math.cos(a) * 200, Math.sin(a) * 200, 8, G.gold); }
}

// ───────────── the round card (drawn once to a cache) ─────────────
const FACES = { face: () => pFace(false), faceX: () => pFace(true), sack: () => pSack(null), sackE: () => pSack('eleph'), sackF: () => pSack('fish'),
  fort: pFort, dagger: pDagger, bowed: pBowed, lamp: pLamp, tiru: pTirumala, sethu: pSethu, gopuram: pGopuram, mysore: pMysore,
  fish: () => pSuit('fish'), eleph: () => pSuit('eleph'), conch: () => pSuit('conch'), back: pBack };
function disc(kind, r = 400, q = 1) {
  const key = `b:${kind}:${r}:${q}`;
  const P = Math.round(r * 0.12) + 10, S = 2 * (r + P);
  const c = cached(key, S, S, q, () => {
    const back = kind === 'back';
    ctx.translate(S / 2, S / 2);
    ctx.save(); ctx.filter = `blur(${Math.max(2, r * 0.03).toFixed(1)}px)`; ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.beginPath(); ctx.arc(r * 0.03, r * 0.055, r * 1.005, 0, TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = G.rim; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, TAU); ctx.lineWidth = Math.max(1, r * 0.006); ctx.strokeStyle = G.rimD; ctx.stroke();
    const ring = (rr, w) => { ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.lineWidth = w; ctx.strokeStyle = G.gold; ctx.stroke(); };
    ring(r * 0.965, Math.max(1.2, r * 0.008));
    ctx.beginPath(); ctx.arc(0, 0, r * 0.952, 0, TAU); ctx.fillStyle = back ? G.maroon : G.rimD; ctx.fill();
    if (!back) {
      const n = Math.max(24, Math.round(r * 0.3)), rb = r * 0.912;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(rb, 0, r * 0.024, r * 0.0125, 0, 0, TAU); ctx.fillStyle = i % 2 ? G.saff : G.ivory; ctx.fill();
        ctx.beginPath(); ctx.arc(rb, 0, r * 0.005, 0, TAU); ctx.fillStyle = G.verm; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(Math.cos(a + Math.PI / n) * rb, Math.sin(a + Math.PI / n) * rb, r * 0.004, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      }
    }
    ring(r * 0.868, Math.max(1, r * 0.006));
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, TAU); ctx.clip(); const k = r * 0.86 / K0; ctx.scale(k, k); FACES[kind](); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, TAU); ctx.lineWidth = Math.max(1, r * 0.007); ctx.strokeStyle = G.black; ctx.stroke();
    // lacquer gloss: a soft sheen + one curved highlight arc
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, 'rgba(255,246,220,0.16)'); g.addColorStop(0.45, 'rgba(255,246,220,0)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, Math.PI * 1.06, Math.PI * 1.4); ctx.lineWidth = r * 0.028; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.72, Math.PI * 1.12, Math.PI * 1.26); ctx.lineWidth = r * 0.012; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  });
  c._S = S; c._r = r; return c;
}
/** draw a card centred at (x, y) with radius R; sx = horizontal squash (flip), rot = spin */
function put(kind, x, y, R, o = {}) {
  const base = o.base || (R > 220 ? 400 : R > 90 ? 160 : 64), c = disc(kind, base, o.q || 1), s = R / base;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s * (o.sx ?? 1), s); if (o.a != null) ctx.globalAlpha *= o.a;
  ctx.drawImage(c, -c._S / 2, -c._S / 2, c._S, c._S); ctx.restore();
}
/** flip a card from its back to `kind`; p 0..1 */
function flipCard(kind, x, y, R, p, o = {}) {
  p = clamp(p); const a = eio(p) * Math.PI, cs = Math.cos(a), lift = Math.sin(a);
  put(cs > 0 ? 'back' : kind, x, y - lift * R * 0.12, R * (1 + 0.14 * lift), { ...o, sx: Math.max(0.02, Math.abs(cs)) });
}
/** draw on top of a card's painted ground, in card units (clipped to the ground) */
function onCard(x, y, R, fn, rot = 0) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); const k = R * 0.86 / K0; ctx.scale(k, k);
  ctx.beginPath(); ctx.arc(0, 0, K0, 0, TAU); ctx.clip(); fn(); ctx.restore();
}
function crackleImg() {
  return cached('bCrackle', 720, 720, 1, () => {
    ctx.translate(360, 360); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 110; i++) {
      let a = rnd(i * 5.3) * TAU, r = Math.sqrt(rnd(i * 2.9 + 1)) * 330, x = Math.cos(a) * r, y = Math.sin(a) * r, dir = rnd(i + 0.7) * TAU;
      const pts = [[x, y]];
      for (let k = 0; k < 7 + Math.floor(rnd(i * 1.1) * 7); k++) { dir += (rnd(i * 13 + k) - 0.5) * 1.6; x += Math.cos(dir) * (14 + rnd(i + k * 3) * 26); y += Math.sin(dir) * (14 + rnd(i * 7 + k) * 26); pts.push([x, y]); }
      for (const [w, c, ox] of [[2.2, 'rgba(255,240,210,0.35)', 1.5], [1.6, 'rgba(30,18,8,0.85)', 0]]) {
        ctx.beginPath(); pts.forEach((p, j) => (j ? ctx.lineTo(p[0] + ox, p[1] + ox) : ctx.moveTo(p[0] + ox, p[1] + ox))); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke();
      }
    }
  });
}
function crackle(x, y, R, p, rot = 0) {
  if (p <= 0) return;
  onCard(x, y, R, () => {
    ctx.fillStyle = `rgba(70,58,44,${0.42 * p})`; ctx.fillRect(-360, -360, 720, 720);
    ctx.globalAlpha = clamp(p * 1.3); ctx.drawImage(crackleImg(), -360, -360, 720, 720);
  }, rot);
}

// ───────────── the table ─────────────
const BX = 100, BY = 100, BW = W + 2 * BX, BH = H + 2 * BY;
function baizeImg() {
  return cached('bBaize', BW, BH, 1, () => {
    ctx.fillStyle = G.baize; ctx.fillRect(0, 0, BW, BH);
    for (let i = 0; i < 30000; i++) { const x = rnd(i * 1.31 + 0.2) * BW, y = rnd(i * 2.77 + 5.1) * BH; ctx.fillStyle = rnd(i + 7.3) > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.07)'; ctx.fillRect(x, y, 2, 2); }
    ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1; for (let y = 0; y < BH; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BW, y + 3); ctx.stroke(); }
    const g = ctx.createRadialGradient(BX + 540, BY + 680, 60, BX + 540, BY + 820, 1150);
    g.addColorStop(0, 'rgba(255,196,110,0.30)'); g.addColorStop(0.45, 'rgba(255,170,80,0.10)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, BW, BH);
    const v = ctx.createRadialGradient(BX + 540, BY + 820, 420, BX + 540, BY + 900, 1350); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)'); ctx.fillStyle = v; ctx.fillRect(0, 0, BW, BH);
    // face-down cards lying about the table (corners only: the caption band stays plain baize)
    const prev = ctx;
    for (const [x, y, r, rot] of [[-20, 140, 170, 0.3], [1110, 300, 150, -0.5], [40, 1890, 150, 0.2], [1040, 1910, 175, -0.2], [1130, 1090, 120, 0.7]]) {
      const c = disc('back', 160, 1), s = r / 160; prev.save(); prev.translate(BX + x, BY + y); prev.rotate(rot); prev.scale(s, s); prev.drawImage(c, -c._S / 2, -c._S / 2); prev.restore();
    }
  });
}
function poolImg() {
  return cached('bPool', 540, 960, 0.25, () => { const g = ctx.createRadialGradient(270, 340, 10, 270, 380, 420); g.addColorStop(0, 'rgba(255,200,120,0.5)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 540, 960); });
}
function table(t, dim = 0) {
  const c = baizeImg(); ctx.drawImage(c, -BX, -BY, BW, BH);
  const p = poolImg(); ctx.globalAlpha = 0.32 + 0.05 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 17.1); ctx.drawImage(p, 0, 0, W, H * 0.9); ctx.globalAlpha = 1;
  if (dim > 0) { ctx.fillStyle = `rgba(6,10,8,${dim})`; ctx.fillRect(-BX, -BY, BW, BH); }
}
/** a cream score-slip label; p = pop-in progress */
function slip(text, x, y, sz = 42, rot = 0, p = 1) {
  if (p <= 0) return; const s = eob(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 3);
  ctx.font = `700 ${sz}px Caladea`; ctx.letterSpacing = `${Math.round(sz * 0.06)}px`;
  const w = ctx.measureText(text).width + sz * 1.2, h = sz * 1.6;
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(-w / 2 + 7, -h / 2 + 9, w, h);
  ctx.fillStyle = G.slip; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = G.slipRed; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  ctx.fillStyle = G.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, sz * 0.03, sz * 0.05);
  ctx.restore();
}
function chip(x, y) {
  ctx.beginPath(); ctx.ellipse(x, y + 8, 50, 20, 0, 0, TAU); ctx.fillStyle = '#A8946C'; ctx.fill();
  ctx.fillRect(x - 50, y, 100, 8);
  ctx.beginPath(); ctx.ellipse(x, y, 50, 20, 0, 0, TAU); ctx.fillStyle = G.ivory; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,20,8,0.7)'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, 34, 13, 0, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = G.verm; ctx.stroke();
}
function noseToken(x, y, s = 1, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  E(4, 6, 40, 40); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  E(0, 0, 40, 40); ink(G.ivory, 3); E(0, 0, 31, 31); ctx.lineWidth = 2; ctx.strokeStyle = G.gold; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, -20); ctx.quadraticCurveTo(12, 4, 8, 12); ctx.quadraticCurveTo(3, 17, -7, 14); ctx.lineWidth = 5; ctx.strokeStyle = G.brown; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
/** a card dealt from `from` to `to` ([x, y, rot]) during [t0, t0 + dur] */
function dealPos(t, t0, dur, from, to) { const u = eo(seg(t, t0, t0 + dur)); return [lerp(from[0], to[0], u), lerp(from[1], to[1], u), lerp(from[2], to[2], u), u]; }

// ───────────── the shots ─────────────
export function buildB(add, cue) {
  const T = (w, l) => Wd(w, l);
  const t5 = L(5), t6 = L(6), t7 = L(7), t8 = L(8), t9 = L(9), tEnd = L(10);
  const tThey = T('they', 5), tSacks = T('sacks', 5), tSent = T('sent', 5), tSri = T('srirangapatna', 5), tTro = T('trophies', 5);
  const tHist = T('historians', 6), tPun = T('punishment', 6), tHum = T('humiliation', 6), tPerh = T('perhaps', 6), tRit = T('ritual', 6);
  const tOld = T('old', 7), tIll = T('ill', 7), tCalled = T('called', 7), tAlly = T('ally', 7), tSeth = T('sethupathi', 7), tRam = T('ramnad', 7);
  const tArmy = T('army', 8), tSaid = T('said', 8), tTw = T('twenty', 8), tDrove = T('drove', 8), tBack8 = T('back', 8);
  const tMad = T('madurai', 9), tStruck = T('struck', 9), tMarch = T('marched', 9), tMys = T('mysore', 9), tAcc = T('accounts', 9), tNoses = T('noses', 9);
  const S = (o) => add({ ...o });

  // b1 · face card, nose painted over in black, THEY SAY
  S({ id: 'b1', at: t5, cam: [540, 700], zoom: 0.08, note: 'face card; black paint covers the nose; THEY SAY',
    draw(lt, d, t) {
      table(t);
      const rot = lerp(-0.05, 0.03, lt / d), y = 690 + Math.sin(t * 0.9) * 4;
      put('face', 540, y, 420, { rot });
      onCard(540, y, 420, () => blackPatch(seg(t, t5 + 0.15, tThey + 0.25)), rot);
      slip('THEY SAY', 560, 1190, 46, -0.04, seg(t, tThey, tThey + 0.35));
    } });
  cue(t5 + 0.15, 'zip', { gain: 0.35, dur: 0.5 }); cue(tThey, 'pop', { gain: 0.45 });

  // b2 · sack card; nose-mark counters drop in
  const drops = [0, 1, 2, 3].map((i) => tSacks + 0.3 + i * 0.36);
  S({ id: 'b2', at: tSacks, cam: [540, 650], zoom: 0.07, note: 'a back flips to the sack card; nose-mark counters drop into the sack mouth',
    draw(lt, d, t) {
      table(t);
      const R = 400, y = 720;
      const tied = seg(t, drops[3] + 0.25, drops[3] + 0.5);
      flipCard('sack', 540, y, R, seg(t, tSacks - 0.05, tSacks + 0.32), { rot: 0.03 });
      const k = R * 0.86 / K0, mouthY = y - 196 * k;
      drops.forEach((t0, i) => {
        const u = seg(t, t0 - 0.42, t0); if (u <= 0 || u >= 1) return;
        const x = 540 + (i % 2 ? 26 : -22) + Math.sin(i * 2) * 10, yy = lerp(-60, mouthY + 40, u * u);
        noseToken(x, yy, 1.1, clamp((mouthY + 40 - yy) / 70)); });
      if (tied > 0) onCard(540, y, R, () => { ctx.save(); ctx.translate(0, -150); ctx.rotate(Math.sin(tied * 12) * 0.04 * (1 - tied)); RR(-80, -16, 160, 32, 14); ink(G.verm); ctx.restore(); }, 0.03);
    } });
  cue(tSacks, 'whoosh', { gain: 0.35, dur: 0.3 }); drops.forEach((t0, i) => cue(t0, 'plop', { gain: 0.4, pan: i % 2 ? 0.2 : -0.2 }));

  // b3 · Srirangapatna: sack cards dealt to the island fort card
  const sk = [[tSri + 0.15, [-200, 1250, -1.2], [410, 1010, -0.22]], [tSri + 0.45, [1280, 1200, 1.4], [670, 1000, 0.25]], [tTro - 0.05, [540, 2150, 2], [540, 1060, 0.04]]];
  S({ id: 'b3', at: tSri, cam: [540, 760], zoom: 0.07, note: 'Srirangapatna fort card flips up; sack cards dealt in, piled at its gate',
    draw(lt, d, t) {
      table(t);
      flipCard('fort', 540, 620, 330, seg(t, tSri - 0.05, tSri + 0.3), { rot: -0.02 });
      const pile = eio(seg(t, tTro + 0.35, tTro + 1.2));
      sk.forEach(([t0, a, b], i) => {
        if (t < t0) return; const [x, y, r] = dealPos(t, t0, 0.42, a, b);
        const tgt = [540 + (i - 1) * 70, 860 + (i === 2 ? 30 : 0)];
        put('sackE', lerp(x, tgt[0], pile), lerp(y, tgt[1], pile), lerp(120, 96, pile), { rot: r });
      });
      if (t > tTro) { const u = seg(t, tTro, tTro + 0.6); ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#FFF1BE'; ctx.lineWidth = 4;
        for (let k = 0; k < 8; k++) { const a = k * TAU / 8; ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * (60 + u * 80), 960 + Math.sin(a) * (60 + u * 80)); ctx.lineTo(540 + Math.cos(a) * (90 + u * 120), 960 + Math.sin(a) * (90 + u * 120)); ctx.stroke(); } ctx.restore(); }
      slip('SRIRANGAPATNA', 540, 215, 44, 0.02, seg(t, tSri + 0.1, tSri + 0.45));
    } });
  cue(tSri, 'whoosh', { gain: 0.3 }); sk.forEach(([t0], i) => cue(t0 + 0.3, 'slide', { gain: 0.4, pan: [-0.4, 0.4, 0][i] })); cue(tSri + 0.15, 'pop', { gain: 0.35 }); cue(tTro, 'sparkle', { gain: 0.35 });

  // b4 · "why noses?": the blacked-out face card and three face-down cards dealt in a row
  const row3 = [[230, -0.08], [540, 0.03], [850, 0.09]];
  S({ id: 'b4', at: t6, cam: [540, 760], zoom: 0.06, note: 'why noses: blacked face card flips up; three backs dealt in a row below',
    draw(lt, d, t) {
      table(t);
      const up = eio(seg(t, tHist, tHist + 0.8)), y = lerp(700, 560, up), R = lerp(400, 300, up);
      flipCard('faceX', 540, y, R, seg(t, t6, t6 + 0.4), { rot: Math.sin(t * 0.8) * 0.03 });
      row3.forEach(([x, r], i) => { const t0 = tHist + 0.15 + i * 0.22; if (t < t0) return; const [px, py, pr] = dealPos(t, t0, 0.45, [1300, 1150, 2.5], [x, 1080, r]); put('back', px, py, 140, { rot: pr }); });
    } });
  cue(t6, 'whoosh', { gain: 0.35 }); row3.forEach((_, i) => cue(tHist + 0.3 + i * 0.22, 'slide', { gain: 0.35, pan: 0.4 }));

  // b5 · the row: dagger (punishment) and bowed figure (humiliation)
  const rowK = ['dagger', 'bowed', 'lamp'], rowT = [tPun, tHum, tRit], rowX = [200, 540, 880];
  function drawRow(t, R, y, hiI) {
    rowK.forEach((k, i) => {
      const p = seg(t, rowT[i] - 0.05, rowT[i] + 0.35), lift = i === hiI ? eo(seg(t, rowT[i], rowT[i] + 0.5)) : 0;
      flipCard(k, rowX[i], y - lift * 30, R * (1 + 0.08 * lift), p, { rot: [-0.06, 0.03, 0.07][i] });
      if (k === 'lamp' && p >= 1) {
        const rr = R * (1 + 0.08 * lift), yy = y - lift * 30, f = Math.sin(t * 9) * 4 + Math.sin(t * 23) * 2;
        onCard(rowX[i], yy, rr, () => {
          const g = ctx.createRadialGradient(0, -60, 10, 0, -60, 200); g.addColorStop(0, `rgba(255,214,120,${0.45 + 0.1 * Math.sin(t * 11)})`); g.addColorStop(1, 'rgba(255,214,120,0)');
          ctx.fillStyle = g; ctx.fillRect(-220, -280, 440, 440); flame(0, -18, 1 + 0.05 * Math.sin(t * 13), f);
        }, 0.07);
      }
    });
  }
  S({ id: 'b5', at: tPun, cam: [540, 800], zoom: 0.05, note: 'row: card 1 flips to a dagger, card 2 to a bowed figure; camera pans',
    draw(lt, d, t) {
      ctx.save(); const px = lerp(150, -60, eio(clamp(lt / d))); ctx.translate(px, 0);
      table(t); drawRow(t, 165, 820, t < tHum ? 0 : 1);
      ctx.restore();
    } });
  cue(tPun, 'whoosh', { gain: 0.4 }); cue(tPun + 0.2, 'thud', { gain: 0.35 }); cue(tHum, 'whoosh', { gain: 0.4 });

  // b6 · card 3 flips to the ritual lamp
  S({ id: 'b6', at: tPerh, cam: [700, 800], zoom: 0.1, note: 'closer on the row: card 3 flips to a lamp in a petal mandala, flame flickers',
    draw(lt, d, t) {
      ctx.save(); ctx.translate(540, 800); const s = lerp(1.05, 1.22, eio(clamp(lt / d))); ctx.scale(s, s); ctx.translate(-700, -800);
      table(t); drawRow(t, 165, 820, t < tRit ? -1 : 2);
      ctx.restore();
    } });
  cue(tRit, 'whoosh', { gain: 0.35 }); cue(tRit + 0.25, 'bell', { gain: 0.35, dur: 1.4 });

  // b7 · Tirumala, old and ill: the card dulls and crackles
  S({ id: 'b7', at: t7, cam: [540, 700], zoom: 0.07, note: 'Tirumala card flips up; the lacquer dulls and crackles (old, ill); lamp dims',
    draw(lt, d, t) {
      const age = eio(seg(t, tOld, tCalled));
      table(t, 0.3 * age);
      const rot = lerp(0.04, -0.02, lt / d);
      flipCard('tiru', 540, 690, 410, seg(t, t7 - 0.05, t7 + 0.4), { rot });
      crackle(540, 690, 410, age, rot);
      slip('MADURAI', 540, 1185, 44, 0.03, seg(t, t7 + 0.4, t7 + 0.75));
    } });
  cue(t7, 'whoosh', { gain: 0.35 }); cue(t7 + 0.4, 'pop', { gain: 0.3 }); cue(tOld, 'heartbeat', { gain: 0.35, dur: 1.4 }); cue(tIll, 'chisel', { gain: 0.2, dur: 0.6 });

  // b8 · "he called on an ally": gold thread, dealt card flips to the conch suit
  S({ id: 'b8', at: tCalled, cam: [540, 760], zoom: 0.08, note: 'cracked Tirumala card; a gold thread runs out; a dealt card flips to the conch suit',
    draw(lt, d, t) {
      table(t, 0.15);
      put('tiru', 340, 540, 260, { rot: -0.03 }); crackle(340, 540, 260, 1, -0.03);
      const [x, y, r] = dealPos(t, tCalled + 0.05, 0.55, [1350, 700, 3], [760, 960, 0.08]);
      const th = seg(t, tCalled + 0.1, tAlly);
      if (th > 0) {
        const pts = []; for (let k = 0; k <= 30 * th; k++) { const u = k / 30; pts.push([lerp(520, 680, u) + Math.sin(u * 9) * 18, lerp(700, 860, u) - Math.sin(u * Math.PI) * 40]); }
        ctx.fillStyle = G.gold; for (const [px, py] of pts) { ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.fill(); }
      }
      flipCard('conch', x, y, 230, seg(t, tAlly - 0.1, tAlly + 0.3), { rot: r });
      if (t > tAlly + 0.3) { const u = seg(t, tAlly + 0.3, tAlly + 1); ctx.save(); ctx.globalAlpha = 0.5 * (1 - u); ctx.beginPath(); ctx.arc(x, y, 230 * (1 + 0.25 * u), 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = '#FFF1BE'; ctx.stroke(); ctx.restore(); }
    } });
  cue(tCalled, 'bell', { gain: 0.25, dur: 1 }); cue(tCalled + 0.3, 'slide', { gain: 0.4, pan: 0.4 }); cue(tAlly, 'whoosh', { gain: 0.35 });

  // b9 · push-in through the Sethupathi card; RAMNAD
  S({ id: 'b9', at: tSeth, cam: [540, 700], zoom: 0.04, note: 'push-in through the Sethupathi card (figure with conch banner); RAMNAD',
    draw(lt, d, t) {
      table(t);
      const u = eio(clamp(lt / d)), R = lerp(380, 820, u), cx = lerp(540, 560, u), cy = lerp(700, 800, u);
      flipCard('sethu', cx, cy, R, seg(t, tSeth - 0.05, tSeth + 0.35), { base: 400, q: 2, rot: lerp(-0.04, 0.02, u) });
      // banner flutter: a row of moving gold glints along the pennant
      if (t > tSeth + 0.35) onCard(cx, cy, R, () => { for (let k = 0; k < 5; k++) { const ph = (t * 1.6 + k / 5) % 1; dot(lerp(-50, -205, ph), -186 + Math.sin(ph * 9 + t * 4) * 14, 4, `rgba(255,241,190,${Math.sin(ph * Math.PI)})`); } }, lerp(-0.04, 0.02, u));
      slip('RAMNAD', 540, 1200, 46, -0.03, seg(t, tRam, tRam + 0.35));
    } });
  cue(tSeth, 'whoosh', { gain: 0.35 }); cue(tSeth + 0.3, 'swell', { gain: 0.3, dur: 2.2 }); cue(tRam, 'pop', { gain: 0.45 });

  // b10 · the conch army and 25 ivory counters
  const armyRows = [330, 450, 570, 690];
  S({ id: 'b10', at: t8, cam: [540, 700], zoom: 0.06, note: 'rows of conch suit cards push across the baize; counters stack 5x5; SAID TO BE 25,000',
    draw(lt, d, t) {
      table(t);
      armyRows.forEach((y, r) => {
        const t0 = t8 + 0.05 + r * 0.18, u = eo(seg(t, t0, t0 + 0.9)), dir = r % 2 ? 1 : -1;
        for (let i = 0; i < 7; i++) {
          const tx = 150 + i * 130 + (r % 2 ? 65 : 0) - 32, x = lerp(dir < 0 ? tx - 1100 : tx + 1100, tx, u) + Math.sin(t * 3 + i + r) * 2;
          put('conch', x, y + Math.sin(t * 4 + i * 0.7 + r) * 3, 56, { rot: Math.sin(i * 3 + r) * 0.15 });
        }
      });
      for (let s = 0; s < 5; s++) for (let c = 0; c < 5; c++) {
        const tc = tTw + (s * 5 + c) * 0.045; if (t < tc) continue;
        const drop = (1 - eo(seg(t, tc, tc + 0.12))) * 50; chip(260 + s * 140, 1030 - c * 15 - drop);
      }
      slip('SAID TO BE 25,000', 540, 1195, 44, 0.02, seg(t, tSaid, tSaid + 0.35));
    } });
  cue(t8 + 0.1, 'slide', { gain: 0.4, pan: -0.3 }); cue(t8 + 0.4, 'slide', { gain: 0.4, pan: 0.3 }); cue(tArmy, 'drum', { gain: 0.4, dur: 1.5 }); cue(tSaid, 'pop', { gain: 0.45 });
  for (let k = 0; k < 25; k += 3) cue(tTw + k * 0.045 + 0.1, 'tock', { gain: 0.3, pan: ((k % 5) - 2) * 0.2 });

  // b11 · trick taken: the conch slaps down, the elephant card slides off; elephant row retreats
  S({ id: 'b11', at: tDrove, cam: [540, 760], zoom: 0.07, note: 'trick taken: conch card slaps the elephant card, which slides off to a pile; elephant row retreats',
    draw(lt, d, t) {
      table(t);
      for (const [x, y, r] of [[900, 250, 0.3], [930, 235, -0.2]]) put('eleph', x, y, 150, { rot: r });
      const away = eio(seg(t, tDrove + 0.45, tBack8 + 0.4));
      put('eleph', lerp(540, 910, away), lerp(760, 250, away), lerp(230, 150, away), { rot: lerp(-0.05, 0.5, away) });
      const back = eio(seg(t, tBack8 - 0.1, tBack8 + 0.7));
      for (let i = 0; i < 6; i++) put('eleph', 160 + i * 152, lerp(1120, 1120 - 260 - i * 40, back) , 62, { rot: lerp(Math.sin(i) * 0.1, -0.6, back), a: 1 - back * 0.6 });
      const sl = eo(seg(t, tDrove - 0.05, tDrove + 0.22)), cx = lerp(560, 540, sl), cy = lerp(700, 790, sl);
      put('conch', cx, cy, 240 * lerp(1.55, 1, sl), { rot: lerp(-0.4, 0.06, sl), a: clamp(sl * 2.5) });
      if (sl >= 1) { const u = seg(t, tDrove + 0.22, tDrove + 0.7); ctx.save(); ctx.globalAlpha = 0.55 * (1 - u); ctx.beginPath(); ctx.ellipse(540, 800, 260 + u * 140, 240 + u * 120, 0, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = '#FFF1BE'; ctx.stroke(); ctx.restore(); }
    } });
  cue(tDrove + 0.2, 'slam', { gain: 0.55 }); cue(tDrove + 0.5, 'slide', { gain: 0.4, pan: 0.4 }); cue(tBack8, 'whoosh', { gain: 0.4 });

  // b12 · Madurai strikes back: the gopuram card, fish suit fan
  const fan = [-2, -1, 0, 1, 2];
  S({ id: 'b12', at: t9, cam: [540, 760], zoom: 0.07, note: 'Madurai gopuram card flips up; fish suit cards fan out below; MADURAI',
    draw(lt, d, t) {
      table(t);
      flipCard('gopuram', 540, 650, 360, seg(t, t9 - 0.05, t9 + 0.35), { rot: 0.02 });
      fan.forEach((k, i) => { const t0 = tStruck + i * 0.1, u = eob(seg(t, t0, t0 + 0.35)); if (t < t0) return;
        const a = k * 0.32 * u, x = 540 + Math.sin(a) * 330, y = 1260 - Math.cos(a) * 240; put('fish', x, y, 84 * clamp(u, 0, 1.1), { rot: a }); });
      slip('MADURAI', 540, 225, 44, -0.02, seg(t, tMad, tMad + 0.35));
    } });
  cue(t9, 'whoosh', { gain: 0.35 }); cue(tMad, 'pop', { gain: 0.4 }); cue(tStruck, 'slam', { gain: 0.45 }); fan.forEach((_, i) => cue(tStruck + 0.1 + i * 0.1, 'tock', { gain: 0.3, pan: (i - 2) * 0.2 }));

  // b13 · into Mysore country: fish rows advance on the elephant card
  S({ id: 'b13', at: tMarch, cam: [540, 700], zoom: 0.07, note: 'Mysore elephant card at the top; rows of fish suit cards slide in and advance on it; MYSORE',
    draw(lt, d, t) {
      table(t);
      put('mysore', 540, 470, 290, { rot: Math.sin(t * 0.7) * 0.02 });
      slip('MYSORE', 790, 735, 42, 0.07, seg(t, tMys, tMys + 0.35));
      const adv = eio(seg(t, tMys + 0.3, tAcc + 0.1));
      [1150, 1030, 910].forEach((y, r) => {
        const t0 = tMarch + r * 0.15, u = eo(seg(t, t0, t0 + 0.7)), dir = r % 2 ? 1 : -1;
        for (let i = 0; i < 6; i++) {
          const tx = 165 + i * 150 + (r % 2 ? 0 : 0), x = lerp(tx + dir * 1100, tx, u), yy = y - adv * (150 + Math.abs(i - 2.5) * -14) + Math.sin(t * 5 + i + r * 2) * 4;
          put('fish', x, yy, 58, { rot: Math.sin(t * 2 + i) * 0.06 });
        }
      });
    } });
  cue(tMarch, 'slide', { gain: 0.4, pan: -0.3 }); cue(tMarch + 0.2, 'slide', { gain: 0.4, pan: 0.3 }); cue(tMys, 'pop', { gain: 0.4 }); cue(tMys + 0.3, 'drum', { gain: 0.4, dur: 1.2 });

  // b14 · accounts say it hunted noses too: pull back out of the face card; a fish-tagged sack; the nose blacked out
  S({ id: 'b14', at: tAcc, cam: [540, 760], zoom: 0.05, note: 'pull back out of the face card to the table; a fish-tagged sack card slides in; the nose is blacked out; ACCOUNTS SAY',
    draw(lt, d, t) {
      table(t);
      const u = eio(seg(t, tAcc, tAcc + 1.2)), R = lerp(1150, 330, u), cx = lerp(540, 370, u), cy = lerp(760, 600, u), rot = lerp(0.04, -0.05, u);
      const [sx, sy, sr] = dealPos(t, tAcc + 0.6, 0.55, [1400, 1000, 2], [770, 960, 0.1]);
      put('face', cx, cy, R, { base: 400, q: 2, rot });
      onCard(cx, cy, R, () => blackPatch(seg(t, tNoses, tNoses + 0.45)), rot);
      if (t > tAcc + 0.6) put('sackF', sx, sy, 230, { rot: sr });
      slip('ACCOUNTS SAY', 540, 1195, 44, -0.03, seg(t, tAcc + 0.1, tAcc + 0.45));
    } });
  cue(tAcc, 'swell', { gain: 0.3, dur: 1.2 }); cue(tAcc + 0.15, 'pop', { gain: 0.4 }); cue(tAcc + 0.8, 'slide', { gain: 0.4, pan: 0.4 }); cue(tNoses, 'zip', { gain: 0.4, dur: 0.5 }); cue(tNoses + 0.5, 'thud', { gain: 0.35 });
}
