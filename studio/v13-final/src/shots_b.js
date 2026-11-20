// EPISODE 13 · worker B : "Paper Theatre", lines 5-9 (Tipu's family, the wedding, 2 am, the barracks, the dead, Mysore flag, word to Arcot)
//   b1  curtain rises on a palace hall; a pierced jali screen slides in, veiled card figures slide in behind it
//   b2  limelight iris opens on the veiled family; a tiger-stripe hanging backdrop rolls down from the fly
//   b3  night fort gate: two blue-grey sentries slide in on rods, a bar gate drops; moon on a wire; "1799" card
//   b4  a day backdrop rolls down over night, a garlanded wedding canopy slides in, bride + groom slide under it, petals fall
//   b5  the fort gate by day, decked with garlands: two rows of guests slide across toward the open gate (parallax)
//   b6  footlights dim to night: a card clock on strings swings, hands run to two; moon on a wire; "10 JULY 1806"
//   b7  limelight on a row of sepoys sliding in; on "struck" gun-flash starbursts pop, cotton smoke puffs
//   b8  barracks hall, moonlit arched windows, two rows of cots with sleeping card soldiers; "69th REGIMENT"
//   b9  flashes pop at the windows, the sleeping cards topple flat one by one, smoke drifts, empty cots remain
//   b10 "ACCOUNTS SAY" card; 14 officers' bicorne hat cards pop onto the dim stage in two rows
//   b11 five wire rows of small shako tokens slide in (115), "~115" card; on "dead" a half-drop curtain falls
//   b12 bastion tower: the Company flag is lowered, the gold tiger-stripe Mysore flag is hoisted and flies; sepoys cheer
//   b13 night gate: a lone card rider slips out of the gate and gallops off on its rod, dust puffs
//   b14 the stage pops up like a book page: a painted floor map, the rider slides along the groove to Arcot; "ARCOT 25 km"
//   b15 Arcot camp at night: tents, campfires, cavalry riders slide in on rods and wheel toward Vellore
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, lg, poly, mixc, rgba, palm } from './art.js';

const K = {
  paper: '#EADBB8', ink: '#3A2A1C', maroon: '#7A1E22', ochre: '#C08A2E', velvet: '#8C1C24', fringe: '#D9A441', flame: '#FFC864',
  night: '#1C2340', night2: '#2B3561', moon: '#F3E6C4', lat: '#A0623E', lat2: '#7C4A2E', red: '#B8302A', brit: '#44506A',
  gold: '#D99A2B', iron: '#2A2A2E', flash: '#FFF6DC', smoke: '#9A938A', skin: '#6A4329', skinL: '#C99A78', white: '#EDE4D0',
  wood: '#6A4426', wood2: '#4A2E18', navy: '#22243A', bill: '#2B1408', teal: '#3E6A66',
};
const OX = 110, OY = 250, OW = 860, OH = 920, OB = OY + OH;   // stage opening (bottom 1170); table edge ~1300
const M = new Map();
const memo = (k, f) => (M.has(k) ? M.get(k) : (M.set(k, f()), M.get(k)));
const pan = (lt, d, amt) => (0.5 - clamp(lt / d)) * amt;
const flick = (t) => 0.9 + 0.06 * Math.sin(t * 13.1) + 0.04 * Math.sin(t * 29.3 + 1);

// ───────────── path parts (for card cut-outs) ─────────────
const R = (x, y, w, h) => () => { ctx.beginPath(); ctx.rect(x, y, w, h); };
const RR = (x, y, w, h, r) => () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const E = (x, y, rx, ry, rot = 0) => () => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); };
const PL = (pts) => () => poly(pts);
const PF = (f) => () => { ctx.beginPath(); f(); };

/** engraved parallel hatch strokes over a box (use inside a clip) */
function hatch(x0, y0, x1, y1, gap = 7, a = 0.22, w = 1.2, slope = 1) {
  ctx.save(); ctx.strokeStyle = `rgba(58,42,28,${a})`; ctx.lineWidth = w; ctx.beginPath(); const h = y1 - y0;
  for (let x = x0 - h * Math.abs(slope); x < x1 + h; x += gap) { ctx.moveTo(x, y1); ctx.lineTo(x + h * slope, y0); }
  ctx.stroke(); ctx.restore();
}
/** a card cut-out, drawn once: baked cast shadow, cream paper margin, loose hand-tint fills offset from the engraved ink outline */
function card(key, w, h, ox, oy, build, q = 1) {
  return memo('c' + key, () => {
    const c = cached('b' + key, w, h, q, () => {
      const parts = build(); ctx.translate(ox, oy); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const fill = (o) => ctx.fill(o && o.eo ? 'evenodd' : 'nonzero');
      ctx.save(); ctx.translate(11, 12); ctx.fillStyle = 'rgba(8,5,3,0.42)'; ctx.strokeStyle = 'rgba(8,5,3,0.42)'; ctx.lineWidth = 10;
      for (const [p, , o] of parts) { if (o && o.noshadow) continue; p(); fill(o); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = K.paper; ctx.strokeStyle = K.paper; ctx.lineWidth = 11;
      for (const [p, , o] of parts) { p(); fill(o); ctx.stroke(); }
      ctx.save(); ctx.translate(4, -3);
      for (const [p, f, o] of parts) {
        if (!f) continue; p(); ctx.fillStyle = f; fill(o);
        if (o && o.hatch) { ctx.save(); p(); ctx.clip(o.eo ? 'evenodd' : 'nonzero'); hatch(-ox, -oy, w - ox, h - oy, o.hatch === 2 ? 5 : 8, 0.28); ctx.restore(); }
      }
      ctx.restore();
      ctx.strokeStyle = K.ink; ctx.lineWidth = 3;
      for (const [p, , o] of parts) { if (o && o.noline) continue; p(); ctx.stroke(); }
    });
    c._ox = ox; c._oy = oy; return c;
  });
}
/** blit a card at (x, y) = its origin. o: { flip, rot, a, sy, rod: -1 | 1 (rod to the left / right wing), rodY } */
function fl(c, x, y, s = 1, o = {}) {
  if (o.rod) {
    const ry = y - (o.rodY ?? 10) * s, ex = o.rod < 0 ? OX - 90 : OX + OW + 90;
    ctx.strokeStyle = '#17100A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(ex, ry); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,205,170,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, ry - 2); ctx.lineTo(ex, ry - 2); ctx.stroke();
  }
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale((o.flip ? -1 : 1) * s, s * (o.sy ?? 1));
  if (o.a != null) ctx.globalAlpha *= o.a;
  ctx.drawImage(c, -c._ox, -c._oy, c.width / c._q, c.height / c._q); ctx.restore();
}
/** slide-in on a rod: x eases in, a little wobble when it stops, a hop while it travels */
function sl(t, t0, dur, x0, x1) {
  const u = seg(t, t0, t0 + dur), k = t - (t0 + dur);
  const rot = k > 0 ? Math.sin(k * 22) * 0.05 * Math.exp(-k * 5) : u > 0 ? -0.03 * Math.sin(u * Math.PI) * Math.sign(x1 - x0) : 0;
  return { x: lerp(x0, x1, eo(u)), rot, y: u > 0 && u < 1 ? -Math.abs(Math.sin(u * Math.PI * 5)) * 7 * (1 - u) : 0, u };
}

// ───────────── figures ─────────────
const musket = () => [[R(58, -392, 8, 300), K.wood], [PL([[59, -392], [65, -392], [62, -432]]), '#CFC8B6']];
const sepoy = () => card('sepoy', 190, 470, 85, 440, () => [
  [R(-60, -232, 19, 112), K.red], [R(41, -232, 19, 112), K.red],
  [R(-27, -126, 21, 126), K.white], [R(6, -126, 21, 126), K.white],
  [PL([[-42, -238], [42, -238], [50, -104], [-50, -104]]), K.red, { hatch: 1 }],
  [PL([[-40, -236], [-27, -238], [44, -112], [31, -108]]), K.white], [PL([[40, -236], [27, -238], [-44, -112], [-31, -108]]), K.white],
  [E(0, -262, 21, 25), K.skin],
  [R(-27, -320, 54, 42), K.navy, { hatch: 1 }], [R(-34, -284, 68, 8), K.navy],
  ...musket(),
]);
const brit = () => card('brit', 190, 480, 85, 450, () => [
  [R(-60, -232, 19, 112), K.brit], [R(41, -232, 19, 112), K.brit],
  [R(-27, -126, 21, 126), K.white], [R(6, -126, 21, 126), K.white],
  [PL([[-42, -238], [42, -238], [50, -104], [-50, -104]]), K.brit, { hatch: 1 }],
  [PL([[-40, -236], [-27, -238], [44, -112], [31, -108]]), K.white], [PL([[40, -236], [27, -238], [-44, -112], [-31, -108]]), K.white],
  [R(-42, -238, 84, 12), K.red],
  [E(0, -262, 21, 25), K.skinL],
  [PL([[-22, -336], [22, -336], [25, -282], [-25, -282]]), '#1C1C22', { hatch: 1 }], [R(-30, -288, 60, 8), '#1C1C22'], [E(0, -344, 8, 13), K.white],
  ...musket(),
]);
const veiled = (key, col, band) => card('veil' + key, 220, 350, 110, 330, () => [
  [PF(() => { ctx.moveTo(0, -300); ctx.bezierCurveTo(40, -300, 52, -252, 50, -212); ctx.bezierCurveTo(70, -150, 86, -60, 92, 0); ctx.lineTo(-92, 0); ctx.bezierCurveTo(-86, -60, -70, -150, -50, -212); ctx.bezierCurveTo(-52, -252, -40, -300, 0, -300); ctx.closePath(); }), col, { hatch: 1 }],
  [PF(() => { ctx.moveTo(-52, -205); ctx.quadraticCurveTo(0, -150, 62, -120); ctx.lineTo(70, -100); ctx.quadraticCurveTo(0, -128, -58, -186); ctx.closePath(); }), band],
  [PL([[-92, 0], [-89, -24], [89, -24], [92, 0]]), band],
]);
const childVeil = () => card('child', 160, 240, 80, 225, () => [
  [PF(() => { ctx.moveTo(0, -200); ctx.bezierCurveTo(28, -200, 36, -168, 34, -140); ctx.bezierCurveTo(46, -100, 56, -40, 60, 0); ctx.lineTo(-60, 0); ctx.bezierCurveTo(-56, -40, -46, -100, -34, -140); ctx.bezierCurveTo(-36, -168, -28, -200, 0, -200); ctx.closePath(); }), K.paper, { hatch: 1 }],
  [PL([[-60, 0], [-58, -18], [58, -18], [60, 0]]), K.ochre],
]);
const guest = (key, coat, turban, sash) => card('guest' + key, 200, 380, 100, 360, () => [
  [R(-58, -238, 18, 110), coat], [R(40, -238, 18, 110), coat],
  [R(-24, -70, 18, 70), K.white], [R(6, -70, 18, 70), K.white],
  [PL([[-38, -244], [38, -244], [62, -64], [-62, -64]]), coat, { hatch: 1 }],
  [R(-40, -170, 80, 14), sash],
  [E(0, -268, 21, 25), K.skin],
  [E(0, -298, 32, 20), turban, { hatch: 1 }],
]);
const groom = () => guest('groom', '#E9DDBF', K.ochre, K.maroon);
const bride = () => veiled('bride', '#A8242A', K.gold);
const hooves = (c) => [[R(-84, -140, 14, 140), c], [R(-58, -140, 14, 140), c], [R(54, -140, 14, 140), c], [R(80, -140, 14, 140), c]];
/** horse + rider facing right. kind: 'mess' (cloaked messenger) | 'cav' (blue-grey cavalry with plumed helmet) */
const rider = (kind) => card('rider' + kind, 400, 440, 170, 420, () => {
  const hb = kind === 'mess' ? '#3E2616' : '#5A3620', cloth = kind === 'mess' ? K.night2 : K.red, coat = kind === 'mess' ? '#3A3448' : K.brit;
  const P = [
    ...hooves(mixc(hb, '#000000', 0.25)),
    [PF(() => { ctx.moveTo(-100, -196); ctx.quadraticCurveTo(-150, -170, -146, -90); ctx.lineTo(-130, -92); ctx.quadraticCurveTo(-130, -160, -96, -176); ctx.closePath(); }), hb],
    [E(0, -172, 108, 46), hb, { hatch: 1 }],
    [PL([[66, -204], [104, -150], [158, -252], [122, -276]]), hb],
    [PL([[120, -278], [156, -254], [200, -208], [188, -192], [132, -226]]), hb],
    [PL([[124, -274], [132, -300], [142, -270]]), hb],
    [R(-44, -222, 76, 54), cloth, { hatch: 1 }],
    [R(-12, -214, 18, 78), K.white],
    [PL([[-26, -306], [22, -306], [28, -206], [-28, -206]]), coat, { hatch: 1 }],
    [PL([[14, -296], [30, -296], [70, -238], [58, -228]]), coat],
    [E(0, -328, 18, 21), kind === 'mess' ? K.skin : K.skinL],
  ];
  if (kind === 'mess') P.push([E(0, -350, 28, 17), K.ochre, { hatch: 1 }], [PL([[-26, -300], [26, -300], [36, -190], [-40, -190]]), '#2C2838', { hatch: 2 }]);
  else P.push([PF(() => { ctx.ellipse(0, -346, 24, 22, 0, Math.PI, 0); ctx.closePath(); }), '#C9B37A'], [PF(() => { ctx.moveTo(-18, -366); ctx.quadraticCurveTo(0, -400, 30, -372); ctx.quadraticCurveTo(6, -380, -18, -360); }), '#1C1C22'], [R(-26, -348, 52, 6), '#1C1C22']);
  return P;
});

// ───────────── props ─────────────
const bicorne = () => card('bicorne', 200, 120, 100, 90, () => [
  [PF(() => { ctx.moveTo(-80, 0); ctx.quadraticCurveTo(-60, -66, 0, -70); ctx.quadraticCurveTo(60, -66, 80, 0); ctx.quadraticCurveTo(0, -18, -80, 0); }), '#1E1A1E', { hatch: 1 }],
  [PF(() => { ctx.moveTo(-74, -6); ctx.quadraticCurveTo(0, -24, 74, -6); ctx.lineTo(72, 0); ctx.quadraticCurveTo(0, -16, -72, 0); ctx.closePath(); }), K.gold],
  [E(34, -36, 11, 11), K.red], [E(34, -36, 5, 5), K.white],
]);
const shakoRow = () => card('shakorow', 820, 90, 10, 70, () => {
  const P = [];
  for (let i = 0; i < 23; i++) { const x = 18 + i * 34; P.push([PL([[x - 11, -44], [x + 11, -44], [x + 13, -6], [x - 13, -6]]), '#22222A'], [R(x - 16, -8, 32, 6), '#22222A'], [E(x, -49, 4, 7), K.white]); }
  return P;
});
const cot = () => card('cot', 300, 120, 150, 100, () => [
  [R(-130, -50, 12, 50), K.wood2], [R(118, -50, 12, 50), K.wood2], [R(-138, -84, 14, 84), K.wood2],
  [R(-130, -58, 260, 16), K.wood, { hatch: 1 }],
  [PL([[-124, -60], [124, -60], [128, -44], [-128, -44]]), K.white],
  [E(-100, -66, 26, 12), K.white],
]);
const sleeper = () => card('sleeper', 260, 120, 130, 100, () => [
  [PF(() => { ctx.moveTo(-82, 0); ctx.bezierCurveTo(-74, -44, -30, -52, 10, -46); ctx.bezierCurveTo(60, -40, 96, -30, 110, 0); ctx.closePath(); }), K.brit, { hatch: 1 }],
  [E(-100, -24, 22, 20), K.skinL],
  [PF(() => { ctx.moveTo(-70, -6); ctx.quadraticCurveTo(10, -18, 108, -4); ctx.lineTo(108, 0); ctx.lineTo(-74, 0); ctx.closePath(); }), K.white],
]);
const tent = () => card('tent', 300, 230, 150, 210, () => [
  [PL([[-130, 0], [0, -180], [130, 0]]), '#D9C9A0', { hatch: 1 }],
  [PL([[-130, 0], [-80, -110], [-56, 0]]), K.red], [PL([[56, 0], [80, -110], [130, 0]]), K.red],
  [PL([[-24, 0], [0, -96], [24, 0]]), '#2A1A12'],
  [R(-3, -206, 6, 30), K.wood2],
]);
const tower = () => card('tower', 460, 700, 230, 680, () => {
  const P = [[R(-160, -440, 320, 440), K.lat, { hatch: 1 }]];
  for (let k = -4; k <= 3; k++) P.push([R(k * 40 + 6, -478, 28, 40), K.lat]);
  P.push([R(-176, -446, 352, 18), K.lat2], [PF(() => { ctx.moveTo(-34, 0); ctx.lineTo(-34, -110); ctx.arc(0, -110, 34, Math.PI, 0); ctx.lineTo(34, 0); ctx.closePath(); }), '#24140C'],
    [R(-14, -330, 28, 70), '#24140C']);
  return P;
});
/** the fort wall + bastions with an arched gate cut through it (evenodd) */
const gateWall = () => card('gate', 1000, 600, 500, 580, () => [
  [PF(() => { ctx.rect(-470, -380, 940, 380); ctx.moveTo(-95, 0); ctx.lineTo(-95, -200); ctx.arc(0, -200, 95, Math.PI, 0); ctx.lineTo(95, 0); ctx.closePath(); }), K.lat, { hatch: 1, eo: 1 }],
  ...Array.from({ length: 12 }, (_, k) => [R(-460 + k * 80, -412, 46, 34), K.lat]),
  [RR(-470, -520, 150, 520, 10), K.lat2, { hatch: 2 }], [RR(320, -520, 150, 520, 10), K.lat2, { hatch: 2 }],
  ...[-470, 320].flatMap((bx) => [0, 1, 2].map((k) => [R(bx + 8 + k * 50, -552, 34, 34), K.lat2])),
  [PF(() => { ctx.moveTo(-118, 0); ctx.lineTo(-118, -200); ctx.arc(0, -200, 118, Math.PI, 0); ctx.lineTo(118, 0); ctx.lineTo(95, 0); ctx.lineTo(95, -200); ctx.arc(0, -200, 95, 0, Math.PI, true); ctx.lineTo(-95, 0); ctx.closePath(); }), K.ochre],
]);
const barGate = () => card('bars', 220, 330, 110, 320, () => {
  const P = []; for (let k = -2; k <= 2; k++) P.push([R(k * 38 - 7, -300, 14, 300), K.iron]);
  P.push([R(-100, -250, 200, 14), K.iron], [R(-100, -110, 200, 14), K.iron]); return P;
});
const screen = () => card('jali', 600, 700, 300, 680, () => [
  [PF(() => {
    ctx.moveTo(-270, 0); ctx.lineTo(-270, -520); ctx.quadraticCurveTo(-270, -640, 0, -660); ctx.quadraticCurveTo(270, -640, 270, -520); ctx.lineTo(270, 0); ctx.closePath();
    for (let r = 0; r < 11; r++) for (let c = 0; c < 10; c++) { const x = -222 + c * 49 + (r % 2) * 24, y = -560 + r * 50; if (x > 240) continue; ctx.moveTo(x + 15, y); ctx.ellipse(x, y, 15, 19, 0, 0, TAU); }
  }), '#B98A4E', { hatch: 1, eo: 1 }],
  [R(-280, -24, 560, 24), K.wood2],
]);
const canopy = () => card('canopy', 760, 640, 380, 620, () => {
  const P = [[R(-292, -500, 16, 500), K.gold], [R(276, -500, 16, 500), K.gold]];
  P.push([PL([[-330, -500], [0, -600], [330, -500]]), K.maroon, { hatch: 1 }]);
  P.push([PF(() => { ctx.moveTo(-330, -500); ctx.lineTo(330, -500); ctx.lineTo(330, -470); for (let k = 0; k < 10; k++) { const x0 = 330 - k * 66; ctx.quadraticCurveTo(x0 - 33, -420, x0 - 66, -470); } ctx.closePath(); }), K.ochre, { hatch: 1 }]);
  for (let k = 0; k < 10; k++) P.push([E(297 - k * 66, -444, 6, 6), K.red]);
  return P;
});
const clockFace = () => card('clock', 380, 380, 190, 190, () => {
  const P = [[E(0, 0, 150, 150), K.moon], [PF(() => { ctx.arc(0, 0, 150, 0, TAU); ctx.moveTo(132, 0); ctx.arc(0, 0, 132, 0, TAU, true); }), K.ochre, { hatch: 2 }]];
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12, r0 = k % 3 ? 108 : 98; P.push([PL([[Math.cos(a - 0.03) * r0, Math.sin(a - 0.03) * r0], [Math.cos(a - 0.03) * 124, Math.sin(a - 0.03) * 124], [Math.cos(a + 0.03) * 124, Math.sin(a + 0.03) * 124], [Math.cos(a + 0.03) * r0, Math.sin(a + 0.03) * r0]]), K.ink, { noshadow: 1 }]); }
  return P;
});
const townCard = (key, n) => card('town' + key, 300, 220, 150, 200, () => {
  const P = [[R(-120, -80, 240, 80), K.lat, { hatch: 1 }]];
  for (let k = 0; k < n; k++) P.push([R(-120 + k * (240 / n) + 6, -100, 240 / n - 16, 22), K.lat]);
  P.push([RR(-140, -150, 50, 150, 6), K.lat2], [RR(90, -150, 50, 150, 6), K.lat2], [PF(() => { ctx.moveTo(-22, 0); ctx.lineTo(-22, -40); ctx.arc(0, -40, 22, Math.PI, 0); ctx.lineTo(22, 0); ctx.closePath(); }), '#24140C']);
  return P;
});

// ───────────── effects ─────────────
const starImg = () => card('star', 260, 260, 130, 130, () => [
  [PF(() => { for (let k = 0; k < 24; k++) { const a = k * TAU / 24, r = k % 2 ? 40 : 100 + (k % 4 ? 0 : 22); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }), K.flash, { noshadow: 1 }],
  [PF(() => { for (let k = 0; k < 16; k++) { const a = k * TAU / 16 + 0.2, r = k % 2 ? 22 : 52; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }), K.flame, { noshadow: 1 }],
]);
function burst(x, y, t, t0, s = 1) {
  const k = t - t0; if (k < 0 || k > 0.5) return;
  const u = k / 0.5, sc = s * (k < 0.08 ? eob(k / 0.08) : 1 + u * 0.25);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, 240 * s); g.addColorStop(0, `rgba(255,230,170,${0.55 * (1 - u)})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 240 * s, y - 240 * s, 480 * s, 480 * s); ctx.restore();
  fl(starImg(), x, y, sc, { rot: k * 1.5, a: 1 - u * u });
}
const puffImg = () => memo('puff', () => { const c = cached('bpuff', 200, 160, 1, () => {
  for (const [x, y, r] of [[60, 96, 44], [100, 76, 56], [146, 98, 40], [84, 116, 34], [124, 120, 36]]) { const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, 'rgba(236,230,218,0.95)'); g.addColorStop(0.7, 'rgba(176,168,156,0.85)'); g.addColorStop(1, 'rgba(154,147,138,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
}); c._ox = 100; c._oy = 100; return c; });
/** cotton-wool smoke puffs on a wire, drifting from (x, y) */
function puffs(x, y, t, t0, n = 4, s = 1, a = 0.8, dx = 60) {
  const k = t - t0; if (k < 0) return;
  for (let i = 0; i < n; i++) { const kk = k - i * 0.12; if (kk < 0) continue; const u = Math.min(1, kk / 2.2);
    fl(puffImg(), x + (i - n / 2) * 30 * s + dx * u * (rnd(i + x) + 0.4), y - 90 * u * s - i * 8, s * (0.5 + 0.8 * eo(Math.min(1, kk / 0.5))) * (0.8 + rnd(i * 3) * 0.4), { a: a * (1 - u * 0.7) }); }
}
function moon(x, y, r = 60) {
  ctx.strokeStyle = 'rgba(20,14,10,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, OY); ctx.lineTo(x, y - r); ctx.stroke();
  const c = memo('moon' + r, () => { const cc = card('moon' + r, r * 2 + 40, r * 2 + 40, r + 14, r + 14, () => [[E(0, 0, r, r), K.moon, { hatch: 1 }], [PF(() => { ctx.arc(r * 0.35, -r * 0.2, r * 0.22, 0, TAU); }), '#DCCDA6', { noshadow: 1 }]]); return cc; });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, r, x, y, r * 3.2); g.addColorStop(0, 'rgba(243,230,196,0.25)'); g.addColorStop(1, 'rgba(243,230,196,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4); ctx.restore();
  fl(c, x, y);
}
/** limelight iris: darkness everywhere except a soft circle */
function iris(x, y, r, a = 0.82) {
  if (r > 1400) return;
  ctx.save(); ctx.beginPath(); ctx.rect(OX - 100, OY - 100, OW + 200, OH + 200); ctx.arc(x, y, Math.max(1, r), 0, TAU, true); ctx.fillStyle = `rgba(6,5,12,${a})`; ctx.fill('evenodd');
  const g = ctx.createRadialGradient(x, y, r * 0.7, x, y, r); g.addColorStop(0, 'rgba(6,5,12,0)'); g.addColorStop(1, `rgba(6,5,12,${a})`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; const g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, 'rgba(255,236,190,0.16)'); g2.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
/** marigold garland sagging between two points, swaying */
function garland(x0, y0, x1, y1, sag, t, ph = 0, n = 22) {
  const sw = Math.sin(t * 2.2 + ph) * 8;
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u) + sw * Math.sin(u * Math.PI), y = lerp(y0, y1, u) + sag * 4 * u * (1 - u);
    ctx.fillStyle = K.ink; ctx.beginPath(); ctx.arc(x + 1, y + 1, 9, 0, TAU); ctx.fill(); ctx.fillStyle = i % 4 === 0 ? K.paper : i % 2 ? '#E8902A' : '#F2B23A'; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); }
}
function petals(t, t0, n = 40, x0 = OX, x1 = OX + OW) {
  const k = t - t0; if (k < 0) return;
  for (let i = 0; i < n; i++) { const st = rnd(i * 5) * 1.2, kk = k - st; if (kk < 0) continue; const x = lerp(x0, x1, rnd(i)) + Math.sin(kk * 3 + i) * 26, y = OY + 40 + kk * (180 + rnd(i + 7) * 120); if (y > OB) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(kk * 4 + i); ctx.scale(1, Math.abs(Math.cos(kk * 5 + i))); ctx.fillStyle = i % 3 ? '#E8902A' : '#F4D58A'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
}
function bdDrop(img, p, px = 0, py = 0) {
  if (p <= 0) return; const h = OH * clamp(p) + 30;
  ctx.save(); ctx.beginPath(); ctx.rect(OX - 80, OY - 60, OW + 160, h + 60); ctx.clip(); bd(img, px, py); ctx.restore();
  if (p < 1) { const y = OY + h - 30; ctx.fillStyle = 'rgba(8,5,3,0.4)'; ctx.fillRect(OX, y + 18, OW, 14); ctx.fillStyle = lg(0, y - 16, 0, y + 18, [[0, '#8A6A40'], [0.4, '#E0C690'], [1, '#5A3E22']]); ctx.fillRect(OX - 10, y - 16, OW + 20, 34); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(OX - 10, y - 16, OW + 20, 34); }
}

// ───────────── the theatre: table, proscenium, curtain, footlights ─────────────
const tableImg = () => cached('btable', W, H, 0.5, () => {
  ctx.fillStyle = lg(0, 0, 0, 1300, [[0, '#0A0709'], [1, '#17100C']]); ctx.fillRect(0, 0, W, 1300);
  ctx.fillStyle = lg(0, 1290, 0, H, [[0, '#2E1D12'], [0.35, '#1F140C'], [1, '#100A06']]); ctx.fillRect(0, 1290, W, H - 1290);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let y = 1420; y < H; y += 150) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 8); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(120,80,50,0.06)'; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const y = 1320 + rnd(i) * 600; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 10, 700, y - 10, W, y + 4); ctx.stroke(); }
  const g = ctx.createRadialGradient(540, 1300, 0, 540, 1300, 560); g.addColorStop(0, 'rgba(255,190,110,0.18)'); g.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1290, W, 560);
});
const LAMPS = Array.from({ length: 14 }, (_, i) => 152 + i * 59.5);
const proscImg = () => cached('bprosc', W, 1330, 1, () => {
  const outer = () => { ctx.beginPath(); ctx.moveTo(16, 1312); ctx.lineTo(16, 160); ctx.lineTo(320, 160); ctx.quadraticCurveTo(380, 40, 540, 36); ctx.quadraticCurveTo(700, 40, 760, 160); ctx.lineTo(1064, 160); ctx.lineTo(1064, 1312); ctx.closePath(); ctx.rect(OX, OY, OW, OH); };
  ctx.save(); ctx.translate(14, 16); outer(); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill('evenodd'); ctx.restore();
  outer(); ctx.fillStyle = K.paper; ctx.fill('evenodd');
  ctx.save(); outer(); ctx.clip('evenodd'); hatch(0, 0, W, 1330, 9, 0.12, 1);
  // pediment + frieze
  ctx.fillStyle = K.maroon; ctx.beginPath(); ctx.moveTo(300, 176); ctx.quadraticCurveTo(380, 64, 540, 60); ctx.quadraticCurveTo(700, 64, 780, 176); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.ochre; ctx.fillRect(34, 180, 1012, 52); ctx.save(); ctx.beginPath(); ctx.rect(34, 180, 1012, 52); ctx.clip(); hatch(34, 180, 1046, 232, 5, 0.3); ctx.restore();
  for (let x = 60; x < 1040; x += 44) { ctx.fillStyle = K.maroon; ctx.beginPath(); ctx.arc(x, 206, 9, 0, TAU); ctx.fill(); ctx.fillStyle = K.paper; ctx.beginPath(); ctx.arc(x, 206, 3.5, 0, TAU); ctx.fill(); }
  // side pillars
  for (const x of [32, 988]) { ctx.fillStyle = K.maroon; ctx.fillRect(x, 262, 60, 900); ctx.save(); ctx.beginPath(); ctx.rect(x, 262, 60, 900); ctx.clip(); hatch(x, 262, x + 60, 1162, 6, 0.3); ctx.restore();
    ctx.strokeStyle = K.ochre; ctx.lineWidth = 4; ctx.strokeRect(x + 9, 272, 42, 880); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(x, 262, 60, 900);
    for (let y = 330; y < 1120; y += 130) { ctx.fillStyle = K.ochre; ctx.beginPath(); ctx.moveTo(x + 30, y - 24); ctx.lineTo(x + 46, y); ctx.lineTo(x + 30, y + 24); ctx.lineTo(x + 14, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.stroke(); } }
  // apron with lamp trough
  ctx.fillStyle = K.maroon; ctx.fillRect(32, 1214, 1016, 84); ctx.save(); ctx.beginPath(); ctx.rect(32, 1214, 1016, 84); ctx.clip(); hatch(32, 1214, 1048, 1298, 6, 0.3); ctx.restore();
  ctx.strokeStyle = K.ochre; ctx.lineWidth = 4; ctx.strokeRect(44, 1224, 992, 64); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(32, 1214, 1016, 84);
  for (let x = 90; x < 1000; x += 70) { ctx.strokeStyle = K.ochre; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, 1256, 14, Math.PI * 0.1, Math.PI * 1.6); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = '#24160E'; ctx.fillRect(OX - 6, OB, OW + 12, 40); ctx.fillStyle = 'rgba(255,200,120,0.12)'; ctx.fillRect(OX - 6, OB, OW + 12, 4);
  for (const x of LAMPS) { ctx.fillStyle = '#8A6A3C'; ctx.beginPath(); ctx.ellipse(x, OB + 18, 15, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = K.paper; ctx.beginPath(); ctx.ellipse(x, OB + 14, 13, 6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
  // proscenium shadow on the stage + inner double rule
  ctx.fillStyle = lg(OX, 0, OX + 40, 0, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(OX, OY, 40, OH);
  ctx.fillStyle = lg(OX + OW, 0, OX + OW - 40, 0, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(OX + OW - 40, OY, 40, OH);
  ctx.strokeStyle = K.ink; ctx.lineWidth = 3; ctx.strokeRect(OX - 3, OY - 3, OW + 6, OH + 6); ctx.strokeStyle = K.ochre; ctx.lineWidth = 5; ctx.strokeRect(OX - 12, OY - 12, OW + 24, OH + 24); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.strokeRect(OX - 17, OY - 17, OW + 34, OH + 34);
  // pelmet: scalloped velvet valance with gold fringe
  ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, OW, 120); ctx.clip();
  const val = () => { ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX + OW, OY); ctx.lineTo(OX + OW, OY + 46); for (let k = 0; k < 10; k++) { const x0 = OX + OW - k * 86; ctx.quadraticCurveTo(x0 - 43, OY + 92, x0 - 86, OY + 46); } ctx.closePath(); };
  ctx.save(); ctx.translate(0, 12); val(); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ctx.restore();
  val(); ctx.fillStyle = K.velvet; ctx.fill(); ctx.save(); val(); ctx.clip(); hatch(OX, OY, OX + OW, OY + 100, 6, 0.3); ctx.restore(); ctx.strokeStyle = K.fringe; ctx.lineWidth = 6; val(); ctx.stroke(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; val(); ctx.stroke();
  for (let k = 0; k < 10; k++) { const x = OX + 43 + k * 86; ctx.fillStyle = K.fringe; ctx.beginPath(); ctx.moveTo(x - 6, OY + 70); ctx.lineTo(x + 6, OY + 70); ctx.lineTo(x + 10, OY + 100); ctx.lineTo(x - 10, OY + 100); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.2; ctx.stroke(); }
  ctx.restore();
  // crest cartouche: blank oval with an abstract star
  ctx.fillStyle = K.paper; ctx.beginPath(); ctx.ellipse(540, 120, 92, 58, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = K.ochre; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(540, 120, 98, 64, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(540, 120, 84, 50, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k * TAU / 16 - Math.PI / 2, r = k % 2 ? 14 : 36; ctx.lineTo(540 + Math.cos(a) * r, 120 + Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = K.ochre; ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.stroke();
  for (const s of [-1, 1]) { ctx.strokeStyle = K.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(540 + s * 150, 128, 26, s > 0 ? Math.PI : 0, s > 0 ? Math.PI * 2.6 : Math.PI * 1.6, s < 0); ctx.stroke(); ctx.beginPath(); ctx.arc(540 + s * 196, 136, 14, 0, TAU); ctx.stroke(); }
  outer(); ctx.strokeStyle = K.ink; ctx.lineWidth = 3; ctx.stroke();
});
const glowImg = () => cached('bglow', W, 520, 0.5, () => {
  for (const x of LAMPS) { const g = ctx.createRadialGradient(x, 440, 0, x, 440, 300); g.addColorStop(0, 'rgba(255,190,100,0.36)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 300, 140, 600, 380); }
});
const curtainImg = () => cached('bcurtain', OW + 40, OH + 80, 0.75, () => {
  const w = OW + 40, h = OH + 40; const st = []; for (let k = 0; k <= 24; k++) st.push([k / 24, k % 2 ? '#6A121A' : '#A42A32']);
  ctx.fillStyle = lg(0, 0, w, 0, st); ctx.fillRect(0, 0, w, h); hatch(0, 0, w, h, 7, 0.18);
  ctx.fillStyle = lg(0, h - 300, 0, h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.3)']]); ctx.fillRect(0, h - 300, w, 300);
  ctx.fillStyle = K.fringe; ctx.fillRect(0, h - 30, w, 22); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(0, h - 30, w, 22);
  for (let x = 6; x < w; x += 14) { ctx.strokeStyle = K.fringe; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, h - 8); ctx.lineTo(x, h + 26); ctx.stroke(); }
  for (let x = 30; x < w; x += 72) { ctx.fillStyle = K.fringe; ctx.beginPath(); ctx.ellipse(x, h + 28, 9, 14, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.2; ctx.stroke(); }
});
/** curtain: p = how far it is up (0 = down / closed, 1 = gone into the fly) */
function curtain(p, t) {
  if (p >= 1) return; const y = OY - 20 - clamp(p) * (OH + 120), sw = Math.sin(t * 2.4) * 5 * (p > 0 && p < 1 ? 1 : 0.4);
  ctx.drawImage(curtainImg(), OX - 20 + sw, y, OW + 40, OH + 80);
}
function flames(t, lit) {
  const sc = 0.45 + 0.55 * lit;
  for (let i = 0; i < LAMPS.length; i++) {
    const x = LAMPS[i], f = 0.8 + 0.2 * Math.sin(t * (11 + (i % 3) * 3.3) + i * 1.7) * Math.sin(t * 5.1 + i), h = 30 * f * sc, w = 8 * sc, y = OB + 12, lean = Math.sin(t * 3 + i) * 3;
    ctx.fillStyle = K.flame; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w, y - h * 0.5, x + lean, y - h); ctx.quadraticCurveTo(x + w, y - h * 0.5, x + w, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF3CC'; ctx.beginPath(); ctx.moveTo(x - w * 0.45, y); ctx.quadraticCurveTo(x - w * 0.45, y - h * 0.3, x + lean * 0.6, y - h * 0.6); ctx.quadraticCurveTo(x + w * 0.45, y - h * 0.3, x + w * 0.45, y); ctx.closePath(); ctx.fill();
  }
}
/** a whole frame of the theatre. o: { lights 0..1+, curtain (up amount), pop (book hinge 0..1) } */
function stage(t, scene, o = {}) {
  const lights = o.lights ?? 1, fk = flick(t);
  ctx.drawImage(tableImg(), 0, 0, W, H);
  ctx.save();
  if (o.pop != null && o.pop < 1) { ctx.translate(0, 1300); ctx.scale(1, Math.max(0.02, o.pop)); ctx.translate(0, -1300); }
  ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, OW, OH); ctx.clip();
  scene();
  if (lights < 1) { ctx.fillStyle = `rgba(8,6,18,${(1 - lights) * 0.5})`; ctx.fillRect(OX, OY, OW, OH); }
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(0.5 * lights * fk, 0, 1); ctx.drawImage(glowImg(), 0, OB - 440, W, 520); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (o.curtain != null) curtain(o.curtain, t);
  ctx.restore();
  ctx.drawImage(proscImg(), 0, 0, W, 1330);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(0.28 * lights * fk, 0, 1); ctx.drawImage(glowImg(), 0, OB - 300, W, 520); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  flames(t, clamp(lights));
  ctx.restore();
}

// ───────────── playbill cards ─────────────
function billImg(label, size) {
  return memo('bill' + label + size, () => {
    ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '3px'; const tw = ctx.measureText(label).width; ctx.letterSpacing = '0px'; ctx.restore();
    const w = Math.ceil(tw + size * 1.5), h = Math.ceil(size * 1.85);
    const c = cached('bbill:' + label + size, w + 34, h + 34, 1.5, () => {
      ctx.translate(10, 10); ctx.fillStyle = 'rgba(8,5,3,0.45)'; ctx.fillRect(8, 9, w, h);
      ctx.fillStyle = '#EFE3C4'; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip(); hatch(0, 0, w, h, 6, 0.07); ctx.restore();
      ctx.strokeStyle = K.bill; ctx.lineWidth = 3.5; ctx.strokeRect(7, 7, w - 14, h - 14); ctx.lineWidth = 1.3; ctx.strokeRect(13, 13, w - 26, h - 26);
      ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '3px'; ctx.fillStyle = K.bill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, w / 2 + 1.5, h / 2 + size * 0.06);
      for (const sx of [0.18, 0.82]) { ctx.fillStyle = '#6A5A44'; ctx.beginPath(); ctx.arc(w * sx, 4, 3, 0, TAU); ctx.fill(); }
    });
    c._ox = 10 + w / 2; c._oy = 10; c._w = w; return c;
  });
}
/** a playbill card dropping on two strings from the fly; p 0..1 */
function bill(label, x, y, p, t, size = 40) {
  if (p <= 0) return; const c = billImg(label, size), yy = lerp(OY - 200, y, eob(clamp(p))), sw = Math.sin(t * 2.6 + x * 0.01) * 0.022 + Math.sin(clamp(p) * 9) * 0.05 * (1 - clamp(p));
  ctx.save(); ctx.translate(x, yy); ctx.rotate(sw);
  ctx.strokeStyle = 'rgba(230,214,176,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); for (const sx of [0.18, 0.82]) { const xx = (sx - 0.5) * c._w; ctx.moveTo(xx, 4); ctx.lineTo(xx, OY - yy - 60); } ctx.stroke();
  ctx.drawImage(c, -c._ox, -c._oy, c.width / c._q, c.height / c._q); ctx.restore();
}

// ───────────── backdrops (980 x 1000, drawn at OX-60, OY-40) ─────────────
const BW = 980, BH = 1000;
function bd(img, px = 0, py = 0) { ctx.drawImage(img, OX - 60 + px, OY - 40 + py, BW, BH); }
function pinholes(n, yMax, seed = 0) {
  for (let i = 0; i < n; i++) { const x = rnd(i + seed) * BW, y = 60 + rnd(i * 5 + 3 + seed) * yMax, r = 1.4 + rnd(i + 8) * 2.2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
}
function cuspArch(x, y, w, h) { const r = w / 2; ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); for (let k = 0; k < 5; k++) { const a0 = Math.PI + k * Math.PI / 5, a1 = a0 + Math.PI / 5, am = (a0 + a1) / 2; ctx.quadraticCurveTo(x + r + Math.cos(am) * r * 1.25, y + r + Math.sin(am) * r * 1.25, x + r + Math.cos(a1) * r, y + r + Math.sin(a1) * r); } ctx.lineTo(x + w, y + h); ctx.closePath(); }
function inkPath(f, fill, lw = 3, hat = 0) { ctx.beginPath(); f(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (hat) { ctx.save(); ctx.beginPath(); f(); ctx.clip(); hatch(0, 0, BW, BH, hat, 0.25); ctx.restore(); } ctx.beginPath(); f(); ctx.strokeStyle = K.ink; ctx.lineWidth = lw; ctx.stroke(); }
function fortRow(y, tint, seed = 0) {
  const col = mixc(K.lat2, K.night, tint), col2 = mixc(K.lat, K.night, tint);
  inkPath(() => { ctx.rect(-10, y, BW + 20, BH - y + 10); for (let k = 0; k < 22; k++) ctx.rect(k * 46, y - 26, 28, 28); }, col2, 2, 7);
  for (const bx of [140, 520, 860]) inkPath(() => { ctx.roundRect(bx - 70, y - 120, 140, BH - y + 130, 18); for (let k = -1; k <= 1; k++) ctx.rect(bx + k * 44 - 14, y - 148, 28, 30); }, col, 2, 5);
}
const bdNight = (fort = 1) => cached('bbdnight' + fort, BW, BH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BH, [[0, '#121831'], [0.55, K.night2], [1, '#46507A']]); ctx.fillRect(0, 0, BW, BH);
  pinholes(110, 620, 3);
  inkPath(() => { ctx.moveTo(-10, 760); for (let x = 0; x <= BW + 40; x += 70) ctx.quadraticCurveTo(x + 35, 700 + rnd(x) * 50, x + 70, 740 + rnd(x + 1) * 30); ctx.lineTo(BW + 10, BH); ctx.lineTo(-10, BH); ctx.closePath(); }, '#262C4E', 2, 9);
  if (fort) fortRow(820, 0.45);
});
const bdPalace = () => cached('bbdpalace', BW, BH, 1, () => {
  ctx.fillStyle = '#5A1C22'; ctx.fillRect(0, 0, BW, BH); hatch(0, 0, BW, BH, 10, 0.12);
  ctx.fillStyle = K.ochre; ctx.fillRect(0, 100, BW, 40); ctx.fillRect(0, 850, BW, 34); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(-2, 100, BW + 4, 40); ctx.strokeRect(-2, 850, BW + 4, 34);
  for (const [x, y, w] of [[90, 400, 200], [340, 260, 300], [690, 400, 200]]) {
    inkPath(() => cuspArch(x - 18, y - 18, w + 36, 850 - y + 18), K.ochre, 2, 6);
    ctx.save(); ctx.beginPath(); cuspArch(x, y, w, 850 - y); ctx.clip(); ctx.fillStyle = lg(0, y, 0, 850, [[0, '#141A33'], [1, K.night2]]); ctx.fillRect(x, y, w, 850 - y);
    for (let i = 0; i < 14; i++) { ctx.fillStyle = '#FFF0CC'; ctx.beginPath(); ctx.arc(x + rnd(i + x) * w, y + 40 + rnd(i * 3 + x) * 300, 1.5 + rnd(i) * 1.5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#2A2240'; ctx.fillRect(x, 720, w, 130); ctx.restore();
    ctx.beginPath(); cuspArch(x, y, w, 850 - y); ctx.strokeStyle = K.ink; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = K.paper; ctx.lineWidth = 2; ctx.beginPath(); cuspArch(x + 6, y + 6, w - 12, 850 - y - 6); ctx.stroke();
  }
  for (const x of [312, 668]) inkPath(() => ctx.rect(x - 14, 150, 28, 700), K.ochre, 2, 5);
  for (let x = 20; x < BW; x += 60) inkPath(() => { ctx.moveTo(x, 140); ctx.lineTo(x + 30, 176); ctx.lineTo(x + 60, 140); }, null, 2);
});
const bdTiger = () => cached('bbdtiger', BW, BH, 1, () => {
  ctx.fillStyle = '#4A1A1E'; ctx.fillRect(0, 0, BW, BH); hatch(0, 0, BW, BH, 9, 0.14);
  inkPath(() => cuspArch(330, 300, 320, 560), '#1C2340', 3, 0);
  for (const bx of [90, 710]) {
    inkPath(() => { ctx.moveTo(bx, 60); ctx.lineTo(bx + 180, 60); ctx.lineTo(bx + 180, 820); ctx.lineTo(bx + 90, 880); ctx.lineTo(bx, 820); ctx.closePath(); }, K.gold, 3, 0);
    ctx.save(); ctx.beginPath(); ctx.moveTo(bx, 60); ctx.lineTo(bx + 180, 60); ctx.lineTo(bx + 180, 820); ctx.lineTo(bx + 90, 880); ctx.lineTo(bx, 820); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#1A1210';
    for (let k = 0; k < 9; k++) { const y = 100 + k * 86, s = k % 2 ? 1 : -1, x0 = s > 0 ? bx - 4 : bx + 184; ctx.beginPath(); ctx.moveTo(x0, y - 18); ctx.bezierCurveTo(x0 + s * 60, y - 14, x0 + s * 100, y + 4, x0 + s * 130, y + 22); ctx.bezierCurveTo(x0 + s * 90, y + 10, x0 + s * 50, y + 14, x0, y + 18); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = K.fringe; for (let x = bx; x <= bx + 180; x += 20) { ctx.beginPath(); ctx.arc(x, 60, 6, 0, TAU); ctx.fill(); }
  }
  ctx.fillStyle = K.ochre; ctx.fillRect(0, 880, BW, 30); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(-2, 880, BW + 4, 30);
});
const bdDay = () => cached('bbdday', BW, BH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BH, [[0, '#D9A868'], [0.6, '#EED29C'], [1, '#F3E6C4']]); ctx.fillRect(0, 0, BW, BH); hatch(0, 0, BW, 600, 12, 0.06);
  for (const [x, y, s] of [[180, 260, 1], [700, 200, 1.3], [480, 400, 0.8]]) inkPath(() => { ctx.moveTo(x - 90 * s, y); ctx.arc(x - 50 * s, y - 10 * s, 40 * s, Math.PI, Math.PI * 1.9); ctx.arc(x + 5 * s, y - 30 * s, 52 * s, Math.PI * 1.1, Math.PI * 1.95); ctx.arc(x + 60 * s, y - 8 * s, 36 * s, Math.PI * 1.2, 0); ctx.lineTo(x + 96 * s, y); ctx.closePath(); }, '#F7EBCF', 2, 0);
  for (const [x, h, l] of [[70, 420, 0.12], [930, 380, -0.1], [820, 300, -0.06]]) palm(x, 860, h, l, x, '#5E4A30');
  fortRow(780, 0.0);
});
const bdBarracks = () => cached('bbdbarr', BW, BH, 1, () => {
  ctx.fillStyle = '#5E3A26'; ctx.fillRect(0, 0, BW, BH); hatch(0, 0, BW, BH, 9, 0.16);
  ctx.strokeStyle = 'rgba(30,18,10,0.35)'; ctx.lineWidth = 2; for (let y = 60; y < 900; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BW, y); ctx.stroke(); for (let x = (y / 54 % 2) * 60; x < BW; x += 120) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 54); ctx.stroke(); } }
  for (const x of [130, 430, 730]) {
    inkPath(() => { ctx.moveTo(x, 640); ctx.lineTo(x, 300); ctx.arc(x + 60, 300, 60, Math.PI, 0); ctx.lineTo(x + 120, 640); ctx.closePath(); }, '#1A2142', 3, 0);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 300); ctx.arc(x + 60, 300, 60, Math.PI, 0); ctx.lineTo(x + 120, 640); ctx.closePath(); ctx.clip();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = '#FFF0CC'; ctx.beginPath(); ctx.arc(x + rnd(i + x) * 120, 260 + rnd(i * 3 + x) * 320, 1.6, 0, TAU); ctx.fill(); } ctx.restore();
    for (let k = 1; k < 4; k++) { ctx.fillStyle = '#1A120C'; ctx.fillRect(x + k * 30 - 3, 240, 6, 400); }
    ctx.fillStyle = K.lat; ctx.fillRect(x - 14, 640, 148, 18); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(x - 14, 640, 148, 18);
  }
  ctx.fillStyle = '#2E1C10'; ctx.fillRect(0, 0, BW, 70); for (let x = 0; x < BW; x += 140) { ctx.fillStyle = '#3E2614'; ctx.fillRect(x, 0, 40, 110); ctx.strokeStyle = K.ink; ctx.strokeRect(x, 0, 40, 110); }
  ctx.fillStyle = '#3E2818'; ctx.fillRect(0, 800, BW, 200);
  for (let k = 0; k < 7; k++) { const x = 60 + k * 26; ctx.fillStyle = K.wood; ctx.fillRect(x, 560, 7, 230); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x, 560, 7, 230); }
  inkPath(() => ctx.rect(40, 780, 200, 16), K.wood2, 2, 0);
});
const MAPA = [300, 800], MAPB = [740, 330], MAPC = [380, 400];   // Vellore → Arcot groove (backdrop coords)
const mapPt = (u) => { const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; return [a * MAPA[0] + b * MAPC[0] + c * MAPB[0], a * MAPA[1] + b * MAPC[1] + c * MAPB[1]]; };
const bdMap = () => cached('bbdmap', BW, BH, 1, () => {
  ctx.fillStyle = '#1C140C'; ctx.fillRect(0, 0, BW, BH);
  inkPath(() => ctx.rect(70, 60, 840, 900), '#CDB47C', 3, 0); ctx.save(); ctx.beginPath(); ctx.rect(70, 60, 840, 900); ctx.clip();
  for (let i = 0; i < 9; i++) { const x = 120 + rnd(i * 4) * 740, y = 120 + rnd(i * 9) * 760; inkPath(() => { ctx.moveTo(x - 50, y + 20); ctx.quadraticCurveTo(x, y - 50, x + 50, y + 20); ctx.closePath(); }, '#A98F58', 2, 5); }
  ctx.strokeStyle = '#5D7A8C'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(60, 620); ctx.bezierCurveTo(300, 540, 520, 700, 940, 520); ctx.stroke();
  ctx.strokeStyle = '#86A2AE'; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, 607); ctx.bezierCurveTo(300, 527, 520, 687, 940, 507); ctx.moveTo(60, 633); ctx.bezierCurveTo(300, 553, 520, 713, 940, 533); ctx.stroke();
  for (let i = 0; i < 26; i++) { const x = 90 + rnd(i + 50) * 800, y = 90 + rnd(i * 2 + 51) * 840; ctx.fillStyle = '#5E6A34'; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); ctx.fillStyle = K.wood2; ctx.fillRect(x - 1.5, y + 5, 3, 8); }
  ctx.restore();
  ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(84, 74, 812, 872);
  ctx.strokeStyle = '#3A2614'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(...MAPA); ctx.quadraticCurveTo(...MAPC, ...MAPB); ctx.stroke();
  ctx.strokeStyle = '#F3E6C4'; ctx.lineWidth = 4; ctx.setLineDash([2, 18]); ctx.stroke(); ctx.setLineDash([]);
});
const bdCamp = () => cached('bbdcamp', BW, BH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BH, [[0, '#10162C'], [0.6, '#283258'], [1, '#3C3A52']]); ctx.fillRect(0, 0, BW, BH); pinholes(80, 520, 9);
  inkPath(() => { ctx.moveTo(-10, 700); for (let x = 0; x <= BW + 40; x += 90) ctx.quadraticCurveTo(x + 45, 640 + rnd(x + 4) * 40, x + 90, 690); ctx.lineTo(BW + 10, BH); ctx.lineTo(-10, BH); ctx.closePath(); }, '#2A2E48', 2, 9);
  for (let i = 0; i < 9; i++) { const x = 60 + i * 110, y = 760 + (i % 2) * 30, s = 0.55; inkPath(() => { ctx.moveTo(x - 60 * s * 2, y); ctx.lineTo(x, y - 110 * s * 2 * 0.7); ctx.lineTo(x + 60 * s * 2, y); ctx.closePath(); }, '#7E7462', 2, 6); }
  ctx.fillStyle = '#3A3A4C'; ctx.fillRect(0, 790, BW, 210);
});
const floorImg = () => cached('bfloor', BW, 160, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, 160, [[0, '#6A4628'], [1, '#3A2414']]); ctx.fillRect(0, 0, BW, 160);
  ctx.strokeStyle = 'rgba(20,10,4,0.5)'; ctx.lineWidth = 2; for (let y = 22; y < 160; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BW, y); ctx.stroke(); }
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(490 + k * 70, 0); ctx.lineTo(490 + k * 100, 160); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,220,160,0.25)'; ctx.fillRect(0, 0, BW, 3); hatch(0, 0, BW, 160, 8, 0.12);
});
const floor = (px = 0, y = OB - 130) => ctx.drawImage(floorImg(), OX - 60 + px, y, BW, 160);
function lamp(x, y, t, i) {
  ctx.strokeStyle = '#17100A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, OY); ctx.lineTo(x, y - 30); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y - 30, 0, x, y - 30, 130); g.addColorStop(0, `rgba(255,190,100,${0.35 * flick(t + i)})`); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 130, y - 160, 260, 260); ctx.restore();
  ctx.fillStyle = K.ochre; ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.quadraticCurveTo(x, y + 26, x + 26, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.stroke();
  const h = 26 + 5 * Math.sin(t * 12 + i); ctx.fillStyle = K.flame; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.quadraticCurveTo(x - 6, y - h * 0.6, x + Math.sin(t * 4 + i) * 3, y - h); ctx.quadraticCurveTo(x + 6, y - h * 0.6, x + 7, y); ctx.closePath(); ctx.fill();
}
/** flag texture: 'mysore' (gold field, abstract tiger stripes) or 'co' (plain Company red with white bands) */
const flagImg = (kind) => cached('bflag' + kind, 300, 190, 1, () => {
  if (kind === 'mysore') {
    ctx.fillStyle = K.gold; ctx.fillRect(0, 0, 300, 190); ctx.fillStyle = '#1A1210';
    for (let k = 0; k < 7; k++) { const x = 20 + k * 42, top = k % 2 === 0; ctx.beginPath(); if (top) { ctx.moveTo(x - 10, 0); ctx.bezierCurveTo(x - 4, 40, x + 14, 70, x + 8, 104); ctx.bezierCurveTo(x + 4, 70, x - 14, 40, x + 12, 0); } else { ctx.moveTo(x - 10, 190); ctx.bezierCurveTo(x - 2, 150, x + 16, 120, x + 10, 84); ctx.bezierCurveTo(x + 4, 120, x - 12, 150, x + 12, 190); } ctx.closePath(); ctx.fill(); }
    hatch(0, 0, 300, 190, 7, 0.12);
  } else { ctx.fillStyle = K.red; ctx.fillRect(0, 0, 300, 190); ctx.fillStyle = K.white; for (let k = 1; k < 6; k += 2) ctx.fillRect(0, k * 190 / 6, 300, 190 / 6); hatch(0, 0, 300, 190, 7, 0.14); }
  ctx.strokeStyle = K.ink; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 296, 186);
});
/** waving flag from a pole at x, top-left at y: drawn in vertical slices */
function flag(kind, x, y, t, s = 1, amp = 1) {
  const img = flagImg(kind), n = 30, sw = 300 / n;
  for (let i = 0; i < n; i++) { const u = i / n, dy = Math.sin(u * 5 - t * 7) * 12 * u * amp * s, sh = Math.cos(u * 5 - t * 7);
    ctx.drawImage(img, i * sw, 0, sw, 190, x + i * sw * s - 0.5, y + dy, sw * s + 1, 190 * s);
    if (sh * amp > 0.2) { ctx.fillStyle = `rgba(0,0,0,${0.18 * sh * amp * u})`; ctx.fillRect(x + i * sw * s, y + dy, sw * s + 1, 190 * s); } }
}

// ───────────── the shots ─────────────
export function buildB(add, cue) {
  const t5 = L(5), t6 = L(6), t7 = L(7), t8 = L(8), t9 = L(9), t10 = L(10);
  const tFam = Wd('family', 5), tTipu = Wd('tipu', 5), tHeld = Wd('held', 5), tSev = Wd('seventeen', 5);
  const tDau = Wd('daughters', 6), tMar = Wd('married', 6), tMany6 = Wd('many', 6), tGue = Wd('guests', 6);
  const tTwo = Wd('two', 7), tMorn = Wd('morning', 7), tSep = Wd('sepoys', 7), tStr = Wd('struck', 7), tMany7 = Wd('many', 7), tSix = Wd('sixty', 7), tKil = Wd('killed', 7), tSlept = Wd('slept', 7);
  const tFour = Wd('fourteen', 8), tOff = Wd('officers', 8), tAbout = Wd('about', 8), tFif = Wd('fifteen', 8), tDead = Wd('dead', 8), tFlag = Wd('flag', 8), tMys = Wd('mysore', 8), tRai = Wd('raised', 8);
  const tWord = Wd('word', 9), tOut = Wd('out', 9), tReach = Wd('reached', 9), tCav = Wd('cavalry', 9), tArc = Wd('arcot', 9), tTw = Wd('twenty', 9), tAway = Wd('away', 9);
  const b2 = tFam - 0.05, b3 = tHeld - 0.1, b4 = t6 - 0.05, b5 = tMany6 - 0.1, b7 = tMorn + 0.1, b8 = tMany7 - 0.05, b9 = tKil - 0.1, b11 = tAbout - 0.1, b12 = tFlag - 0.15;
  const b14 = tReach + 0.3, b15 = tTw - 0.1;

  // b1 · palace hall, curtain rises, jali screen + veiled figures
  add({ id: 'b1', at: t5, cam: [540, 760], zoom: 0.06, note: 'curtain rises on a palace hall; jali screen slides in, veiled card figures slide in behind it', draw(lt, d, t) {
    stage(t, () => {
      bd(bdPalace(), pan(lt, d, 30)); floor(pan(lt, d, 50));
      lamp(300, 470, t, 0); lamp(780, 470, t, 1);
      const fig = [[veiled('a', K.paper, K.ochre), 330, 0.35], [veiled('b', '#C9B07A', K.maroon), 520, 0.5], [veiled('c', '#8E6A8A', K.gold), 700, 0.62]];
      fig.forEach(([c, x, st], i) => { const m = sl(lt, st, 0.7, -200, x + pan(lt, d, 70)); fl(c, m.x, OB - 34 + m.y, 1.15, { rot: m.rot, rod: -1 }); });
      const s = sl(lt, 0.15, 0.75, 1300, 640 + pan(lt, d, 90)); fl(screen(), s.x, OB - 20 + s.y, 1.05, { rot: s.rot * 0.5, rod: 1 });
    }, { curtain: eio(seg(lt, 0, 0.9)) });
  } });
  cue(t5 + 0.02, 'whoosh', { gain: 0.5, dur: 0.9 }); cue(t5 + 0.2, 'slide', { gain: 0.4, pan: 0.4 }); cue(t5 + 0.45, 'slide', { gain: 0.3, pan: -0.4 });

  // b2 · limelight on the family; tiger-stripe hanging rolls down
  add({ id: 'b2', at: b2, cam: [540, 860], zoom: 0.08, note: 'limelight iris opens on the veiled family; a tiger-stripe hanging backdrop rolls down from the fly', draw(lt, d, t) {
    stage(t, () => {
      bd(bdPalace(), pan(lt, d, 20)); bdDrop(bdTiger(), eio(seg(t, tTipu - 0.1, tTipu + 0.6)), pan(lt, d, 20)); floor(pan(lt, d, 40));
      const xs = [[veiled('a', K.paper, K.ochre), 360, 1.25], [veiled('c', '#8E6A8A', K.gold), 700, 1.25], [veiled('b', '#C9B07A', K.maroon), 540, 1.4]];
      xs.forEach(([c, x, s], i) => fl(c, x + pan(lt, d, 60), OB - 30 + Math.sin(t * 1.5 + i) * 3, s, { rot: Math.sin(t * 1.2 + i * 2) * 0.012 }));
      const ch = sl(lt, 0.3, 0.6, -150, 440 + pan(lt, d, 60)); fl(childVeil(), ch.x, OB - 26 + ch.y, 1.1, { rot: ch.rot, rod: -1 });
      iris(540, 860, lerp(60, 520, eo(seg(lt, 0, 0.7))), 0.78);
    });
  } });
  cue(b2 + 0.05, 'swell', { gain: 0.35, dur: 1.2 }); cue(tTipu, 'zip', { gain: 0.3 }); cue(b2 + 0.3, 'slide', { gain: 0.3, pan: -0.3 });

  // b3 · night gate, sentries, bars drop, 1799
  add({ id: 'b3', at: b3, cam: [540, 780], zoom: 0.08, note: 'night fort gate: two blue-grey sentries slide in on rods, bar gate drops; moon on a wire arcs; "1799" card', draw(lt, d, t) {
    stage(t, () => {
      bd(bdNight(0), pan(lt, d, 20));
      const mu = lt / d; moon(lerp(260, 780, mu), 470 - Math.sin(mu * Math.PI) * 120, 54);
      const gx = 540 + pan(lt, d, 50);
      ctx.fillStyle = '#120C10'; ctx.fillRect(gx - 100, OB - 330, 200, 320);
      const by = lerp(OB - 360, OB - 16, eob(seg(lt, 0.9, 1.25))); ctx.save(); ctx.beginPath(); ctx.rect(gx - 120, OB - 340, 240, 340); ctx.clip(); fl(barGate(), gx, by, 0.95); ctx.restore();
      fl(gateWall(), gx, OB - 10, 0.95);
      floor(pan(lt, d, 70));
      const a = sl(lt, 0.1, 0.7, -160, 300 + pan(lt, d, 90)), b = sl(lt, 0.3, 0.7, 1240, 780 + pan(lt, d, 90));
      fl(brit(), a.x, OB - 24 + a.y, 0.95, { rot: a.rot, rod: -1 }); fl(brit(), b.x, OB - 24 + b.y, 0.95, { rot: b.rot, rod: 1, flip: 1 });
      bill('1799', 540 + pan(lt, d, 30), 340, seg(t, tSev - 0.15, tSev + 0.45), t, 54);
    }, { lights: 0.7 });
  } });
  cue(b3 + 0.1, 'slide', { gain: 0.35, pan: -0.5 }); cue(b3 + 0.3, 'slide', { gain: 0.35, pan: 0.5 }); cue(b3 + 1.2, 'slam', { gain: 0.6 }); cue(tSev - 0.05, 'pop', { gain: 0.45 });

  // b4 · day backdrop rolls down; wedding canopy, bride + groom, petals
  add({ id: 'b4', at: b4, cam: [540, 820], zoom: 0.07, note: 'day backdrop rolls down over night; garlanded wedding canopy slides in; bride + groom slide under it; petals fall', draw(lt, d, t) {
    stage(t, () => {
      bd(bdNight(1), pan(lt, d, 20)); bdDrop(bdDay(), eio(seg(lt, 0, 0.7)), pan(lt, d, 20));
      const sx = lerp(820, 860, lt / d); ctx.strokeStyle = 'rgba(20,14,10,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, OY); ctx.lineTo(sx, 380); ctx.stroke();
      if (lt > 0.5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, 420, 30, sx, 420, 200); g.addColorStop(0, 'rgba(255,220,150,0.4)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 200, 220, 400, 400); ctx.restore(); }
      fl(memo('sun', () => card('sun', 180, 180, 90, 90, () => [[PF(() => { for (let k = 0; k < 24; k++) { const a = k * TAU / 24, r = k % 2 ? 50 : 70; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }), '#F2B23A', { hatch: 1 }], [E(0, 0, 44, 44), '#F7D27A']])), sx, 420 + (1 - eo(seg(lt, 0.3, 0.9))) * -300, 1, { rot: t * 0.3 });
      floor(pan(lt, d, 50));
      const cx = sl(lt, 0.35, 0.8, -500, 540 + pan(lt, d, 60));
      fl(canopy(), cx.x, OB - 30 + cx.y, 1, { rot: cx.rot * 0.4, rod: -1 });
      const g = sl(t, tDau - 0.15, 0.6, -200, 450 + pan(lt, d, 60)), br = sl(t, tDau + 0.05, 0.6, 1300, 630 + pan(lt, d, 60));
      fl(groom(), g.x, OB - 30 + g.y, 1.1, { rot: g.rot, rod: -1 }); fl(bride(), br.x, OB - 30 + br.y, 1.05, { rot: br.rot, rod: 1 });
      if (cx.u >= 1) { garland(cx.x - 284, OB - 520, cx.x - 40, OB - 520, 70, t, 0); garland(cx.x + 40, OB - 520, cx.x + 284, OB - 520, 70, t, 1.4); }
      petals(t, tMar, 46);
    });
  } });
  cue(b4 + 0.05, 'zip', { gain: 0.35 }); cue(b4 + 0.4, 'slide', { gain: 0.4, pan: -0.5 }); cue(tDau - 0.1, 'slide', { gain: 0.3, pan: -0.3 }); cue(tDau + 0.1, 'slide', { gain: 0.3, pan: 0.3 }); cue(tMar, 'sparkle', { gain: 0.4 }); cue(tMar + 0.05, 'bell', { gain: 0.25 });

  // b5 · guests slide toward the garlanded gate
  add({ id: 'b5', at: b5, cam: [540, 820], zoom: 0.07, note: 'fort gate by day decked with garlands; two rows of guests slide across toward the open gate (parallax)', draw(lt, d, t) {
    stage(t, () => {
      bd(bdDay(), pan(lt, d, 20));
      const gx = 540 + pan(lt, d, 40);
      ctx.fillStyle = lg(0, OB - 330, 0, OB, [[0, '#E8A858'], [1, '#B86A30']]); ctx.fillRect(gx - 100, OB - 330, 200, 320);
      fl(gateWall(), gx, OB - 100, 0.82);
      garland(gx - 380, OB - 420, gx - 120, OB - 420, 60, t, 0); garland(gx + 120, OB - 420, gx + 380, OB - 420, 60, t, 2);
      garland(gx - 100, OB - 350, gx + 100, OB - 350, 40, t, 1, 14);
      floor(pan(lt, d, 60));
      const back = [['g1', '#C08A2E', K.maroon, K.paper], ['g2', K.paper, K.red, K.ochre], ['g3', '#8E6A8A', K.ochre, K.gold]];
      for (let i = 0; i < 5; i++) { const [k, a, b, c] = back[i % 3], x = -120 + ((lt * 150 + i * 190) % 1100); fl(i % 2 ? guest(k, a, b, c) : veiled(k, a, c), x, OB - 70 + Math.abs(Math.sin(lt * 6 + i)) * -6, 0.72, { rod: -1, rodY: 6 }); }
      for (let i = 0; i < 4; i++) { const [k, a, b, c] = back[(i + 1) % 3], x = -200 + ((lt * 260 + i * 290) % 1300); fl(i % 2 ? veiled(k, a, c) : guest(k, a, b, c), x, OB - 6 + Math.abs(Math.sin(lt * 7 + i)) * -8, 1.05, { rod: -1, rodY: 6 }); }
      petals(t, b5 - 1.4, 30);
    });
  } });
  cue(b5 + 0.05, 'whoosh', { gain: 0.3 }); cue(tGue, 'slide', { gain: 0.35, pan: -0.3 }); cue(tGue + 0.8, 'slide', { gain: 0.3, pan: 0.2 });

  // b6 · night falls, clock to two
  add({ id: 'b6', at: t7, cam: [540, 700], zoom: 0.06, note: 'footlights dim to night: a card clock on strings swings, hands run to two; moon on a wire; "10 JULY 1806"', draw(lt, d, t) {
    const dim = lerp(1, 0.35, eo(seg(lt, 0, 0.6)));
    stage(t, () => {
      bd(bdNight(1), pan(lt, d, 30)); moon(760 + pan(lt, d, 40), 420, 50); floor(pan(lt, d, 50), OB - 100);
      const cx = 480 + pan(lt, d, 70), cy = 700 + (1 - eob(seg(lt, 0, 0.45))) * -500, sw = Math.sin(lt * 3) * 0.04;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(sw);
      ctx.strokeStyle = 'rgba(230,214,176,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-90, -120); ctx.lineTo(-90, -800); ctx.moveTo(90, -120); ctx.lineTo(90, -800); ctx.stroke();
      fl(clockFace(), 0, 0, 1.1);
      const u = eio(seg(t, t7 + 0.15, tTwo + 0.15)), mA = -Math.PI / 2 + u * TAU * 2.08, hA = -Math.PI / 2 + u * TAU * (2.08 / 12);
      const hand = (a, len, w) => { ctx.save(); ctx.rotate(a); ctx.fillStyle = K.ink; ctx.beginPath(); ctx.moveTo(-16, -w); ctx.lineTo(len, 0); ctx.lineTo(-16, w); ctx.closePath(); ctx.fill(); ctx.restore(); };
      hand(hA, 80, 9); hand(mA, 126, 6); ctx.fillStyle = K.gold; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      bill('10 JULY 1806', 540, 1000, seg(lt, 0.25, 0.75), t, 46);
    }, { lights: dim });
  } });
  cue(t7 + 0.05, 'whoosh', { gain: 0.3 }); cue(tTwo + 0.15, 'bell', { gain: 0.5 }); cue(tTwo + 0.75, 'bell', { gain: 0.4 }); cue(t7 + 0.3, 'pop', { gain: 0.3 });

  // b7 · sepoys slide in under the limelight, flashes
  add({ id: 'b7', at: b7, cam: [540, 860], zoom: 0.1, note: 'limelight on a row of sepoys sliding in; on "struck" gun-flash starbursts pop, cotton smoke puffs', draw(lt, d, t) {
    const sh = t > tStr && t < tStr + 0.3 ? Math.sin((t - tStr) * 80) * 7 * (1 - (t - tStr) / 0.3) : 0;
    ctx.save(); ctx.translate(sh, sh * 0.5);
    stage(t, () => {
      bd(bdNight(1), pan(lt, d, 30)); floor(pan(lt, d, 50));
      for (let i = 0; i < 5; i++) { const m = sl(lt, 0.05 + i * 0.12, 0.6, -150 - i * 40, 230 + i * 150 + pan(lt, d, 70)); fl(sepoy(), m.x, OB - 30 + m.y + (i % 2) * 14, 1.08 - (i % 2) * 0.06, { rot: m.rot, rod: -1 }); }
      for (let i = 0; i < 5; i++) burst(230 + i * 150 + 67 + pan(lt, d, 70), OB - 30 - 455, t, tStr + [0, 0.12, 0.05, 0.18, 0.09][i], 0.62);
      for (let i = 0; i < 5; i++) puffs(230 + i * 150 + 67 + pan(lt, d, 70), OB - 490, t, tStr + 0.1 + i * 0.05, 3, 0.7, 0.75, 80);
      iris(540, 880, lerp(300, 640, eo(seg(lt, 0, 0.6))) + (t > tStr ? 200 * eo(seg(t, tStr, tStr + 0.3)) : 0), 0.75);
    }, { lights: 0.45 + (t > tStr ? 0.6 * (1 - seg(t, tStr, tStr + 0.5)) : 0) });
    ctx.restore();
  } });
  cue(b7 + 0.05, 'slide', { gain: 0.45, pan: -0.5 }); cue(b7 + 0.4, 'drum', { gain: 0.4 }); cue(tStr, 'slam', { gain: 0.85 }); cue(tStr + 0.1, 'pop', { gain: 0.6 }); cue(tStr + 0.18, 'pop', { gain: 0.5 }); cue(tStr + 0.25, 'rumble', { gain: 0.45, dur: 1 });

  // b8 · barracks, sleeping soldiers
  const COTS = [[300, 880, 0.72], [540, 880, 0.72], [780, 880, 0.72], [250, 1110, 1], [560, 1110, 1], [870, 1110, 1]];
  const barracks = (lt, d, t, topple) => {
    bd(bdBarracks(), pan(lt, d, 25));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const x of [130, 430, 730]) { const bx = OX - 60 + x + pan(lt, d, 25); ctx.fillStyle = 'rgba(160,180,255,0.08)'; ctx.beginPath(); ctx.moveTo(bx, OY + 260); ctx.lineTo(bx + 120, OY + 260); ctx.lineTo(bx + 260, OB); ctx.lineTo(bx + 60, OB); ctx.closePath(); ctx.fill(); } ctx.restore();
    floor(pan(lt, d, 40));
    COTS.forEach(([x, y, s], i) => {
      const px = x + pan(lt, d, s * 70);
      fl(cot(), px, y, s);
      const a = topple ? topple(i) : 0, br = 1 + Math.sin(t * 2 + i * 1.3) * 0.03;
      if (a < 1) fl(sleeper(), px + 10 * s, y - 42 * s, s, { sy: br * Math.cos(a * Math.PI / 2), a: 1 - a * 0.3 });
    });
  };
  add({ id: 'b8', at: b8, cam: [540, 860], zoom: 0.07, note: 'barracks hall, moonlit arched windows, two rows of cots with sleeping card soldiers; "69th REGIMENT"', draw(lt, d, t) {
    stage(t, () => { barracks(lt, d, t, null); bill('69th REGIMENT', 540 + pan(lt, d, 20), 380, seg(t, tSix - 0.2, tSix + 0.4), t, 44); }, { lights: 0.42 });
  } });
  cue(b8 + 0.05, 'whoosh', { gain: 0.25 }); cue(b8 + 0.3, 'inhale', { gain: 0.25 }); cue(tSix - 0.1, 'pop', { gain: 0.45 });

  // b9 · flashes, sleepers topple, empty cots
  const TOP = [0.25, 0.5, 0.38, 0.62, 0.8, 0.95];
  add({ id: 'b9', at: b9, cam: [560, 900], zoom: 0.09, note: 'flashes pop at the windows, the sleeping cards topple flat one by one, smoke drifts, empty cots remain', draw(lt, d, t) {
    stage(t, () => {
      barracks(lt, d, t, (i) => eio(seg(lt, TOP[i], TOP[i] + 0.3)));
      [[250, 530, 0.1], [550, 520, 0.32], [850, 540, 0.55], [400, 760, 0.7]].forEach(([x, y, k], i) => burst(x + pan(lt, d, 25), y, t, b9 + k, 0.7));
      puffs(320, 1020, t, b9 + 0.4, 4, 1, 0.55, 120); puffs(720, 1000, t, b9 + 0.7, 4, 1, 0.55, 100);
    }, { lights: 0.4 + 0.5 * Math.max(0, 1 - Math.abs(lt - 0.4) * 3) });
  } });
  cue(b9 + 0.1, 'slam', { gain: 0.6 }); cue(b9 + 0.32, 'pop', { gain: 0.5 }); cue(b9 + 0.55, 'slam', { gain: 0.5 });
  TOP.forEach((k, i) => cue(b9 + k + 0.25, 'thud', { gain: 0.35, pan: [-0.5, 0, 0.5, -0.6, 0, 0.6][i] })); cue(tSlept, 'rumble', { gain: 0.3, dur: 1.2 });

  // b10 · ACCOUNTS SAY, 14 officers' hats
  add({ id: 'b10', at: t8, cam: [540, 800], zoom: 0.07, note: '"ACCOUNTS SAY" card; 14 officers\' bicorne hat cards pop onto the dim stage in two rows', draw(lt, d, t) {
    stage(t, () => {
      bd(bdNight(0), pan(lt, d, 20)); floor(pan(lt, d, 30), OB - 160);
      ctx.fillStyle = K.wood2; ctx.fillRect(OX, 900, OW, 18); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(OX - 2, 900, OW + 4, 18);
      for (let i = 0; i < 14; i++) { const row = i < 7 ? 0 : 1, c = i % 7, x = 220 + c * 106 + row * 20 + pan(lt, d, 50), y = row ? 1110 : 900, p = eob(clamp((t - (tFour + i * 0.075)) / 0.25));
        if (p > 0) fl(bicorne(), x, y + (1 - p) * -60, 0.82 * p, { rot: Math.sin(t * 1.5 + i) * 0.02 }); }
      bill('ACCOUNTS SAY', 540 + pan(lt, d, 20), 370, seg(lt, 0.05, 0.55), t, 44);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 1000, 0, 540, 1000, 520); g.addColorStop(0, 'rgba(255,220,160,0.12)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(OX, OY, OW, OH); ctx.restore();
    }, { lights: 0.5 });
  } });
  cue(t8 + 0.1, 'pop', { gain: 0.45 }); for (let i = 0; i < 14; i += 2) cue(tFour + i * 0.075, 'tock', { gain: 0.3, pan: -0.6 + (i % 7) * 0.2 });

  // b11 · 115 shako tokens on wires, half-drop curtain
  add({ id: 'b11', at: b11, cam: [540, 760], zoom: 0.07, note: 'five wire rows of small shako tokens slide in (115), "~115" card; on "dead" a half-drop curtain falls, smoke', draw(lt, d, t) {
    const half = eio(seg(t, tDead - 0.05, tDead + 0.6));
    stage(t, () => {
      bd(bdNight(0), pan(lt, d, 20)); floor(pan(lt, d, 30), OB - 140);
      for (let r = 0; r < 5; r++) { const y = 560 + r * 120, dir = r % 2 ? 1 : -1, m = sl(lt, 0.05 + r * 0.22, 0.55, dir < 0 ? -900 : 1100, 130 + pan(lt, d, 40 + r * 10));
        ctx.strokeStyle = '#17100A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(OX - 10, y + 2); ctx.lineTo(OX + OW + 10, y + 2); ctx.stroke();
        fl(shakoRow(), m.x, y, 1, { rot: m.rot * 0.2 }); }
      bill('~115', 540 + pan(lt, d, 20), 360, seg(t, tFif - 0.2, tFif + 0.4), t, 56);
      puffs(300, 1100, t, tDead, 4, 1.1, 0.5, 140); puffs(760, 1100, t, tDead + 0.15, 4, 1.1, 0.5, 120);
    }, { lights: 0.55 - half * 0.2, curtain: 1 - half * 0.42 });
  } });
  for (let r = 0; r < 5; r++) cue(b11 + 0.05 + r * 0.22, 'slide', { gain: 0.3, pan: r % 2 ? 0.5 : -0.5 }); cue(tFif - 0.1, 'pop', { gain: 0.45 }); cue(tDead, 'whoosh', { gain: 0.4 }); cue(tDead + 0.1, 'drum', { gain: 0.35 });

  // b12 · flags: Company lowered, Mysore raised
  add({ id: 'b12', at: b12, cam: [540, 620], zoom: 0.12, note: 'bastion tower: the Company flag is lowered, the gold tiger-stripe Mysore flag is hoisted and flies; sepoys cheer on the wall', draw(lt, d, t) {
    const up = eio(seg(t, tMys, tRai + 0.55)), down = eio(seg(t, tFlag, tMys + 0.1));
    stage(t, () => {
      bd(bdNight(1), pan(lt, d, 30)); moon(280 + pan(lt, d, 40), 420, 46);
      const tx = 560 + pan(lt, d, 60);
      ctx.fillStyle = '#B9A882'; ctx.fillRect(tx - 6, 330, 10, 380); ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.strokeRect(tx - 6, 330, 10, 380); ctx.fillStyle = K.gold; ctx.beginPath(); ctx.arc(tx - 1, 326, 9, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(230,214,176,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx + 6, 336); ctx.lineTo(tx + 6, 700); ctx.stroke();
      if (down < 1) ctx.save(), ctx.beginPath(), ctx.rect(OX, OY, OW, 700 - OY), ctx.clip(), flag('co', tx + 4, lerp(340, 700, down), t, 0.8, 0.7), ctx.restore();
      if (up > 0) { ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, OW, 700 - OY); ctx.clip(); flag('mysore', tx + 4, lerp(700, 340, up), t, 0.95, 0.6 + 0.6 * up); ctx.restore(); }
      fl(tower(), tx, 1060, 0.85);
      fortRow2(lt, d);
      for (let i = 0; i < 4; i++) { const x = [210, 340, 790, 910][i] + pan(lt, d, 80), j = t > tRai ? Math.abs(Math.sin((t - tRai) * 8 + i)) * 18 * (1 - seg(t, tRai + 1.2, tRai + 1.8)) : 0; fl(sepoy(), x, 1120 - j, 0.75, { flip: i > 1 }); }
      floor(pan(lt, d, 90), OB - 60);
      if (t > tRai) { burst(tx + 140, 400, t, tRai + 0.4, 0.4); burst(tx - 200, 470, t, tRai + 0.6, 0.35); }
    }, { lights: 0.5 + 0.45 * up });
  } });
  function fortRow2(lt, d) { const img = memo('wallrow', () => card('wallrow', 1000, 260, 500, 240, () => { const P = [[R(-480, -150, 960, 150), K.lat2, { hatch: 1 }]]; for (let k = 0; k < 12; k++) P.push([R(-470 + k * 80, -186, 46, 38), K.lat2]); return P; })); fl(img, 540 + pan(lt, d, 70), OB + 10, 1); }
  cue(tFlag, 'zip', { gain: 0.35 }); cue(tMys + 0.05, 'zip', { gain: 0.45 }); cue(tRai + 0.4, 'swell', { gain: 0.5, dur: 1.5 }); cue(tRai + 0.4, 'pop', { gain: 0.4 }); cue(tRai + 0.6, 'pop', { gain: 0.35 }); cue(tRai + 0.1, 'drum', { gain: 0.45 });

  // b13 · rider slips out of the gate
  add({ id: 'b13', at: t9, cam: [540, 860], zoom: 0.08, note: 'night gate: a lone card rider slips out of the gate and gallops off on its rod, dust puffs', draw(lt, d, t) {
    stage(t, () => {
      bd(bdNight(0), pan(lt, d, 30)); moon(800 + pan(lt, d, 30), 400, 44);
      const gx = 470 + pan(lt, d, 50);
      ctx.fillStyle = '#120C10'; ctx.fillRect(gx - 100, OB - 330, 200, 320);
      ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, OW, OH); ctx.clip();
      const u = seg(t, tWord, tOut + 0.6), x = lerp(gx, 1250, Math.pow(u, 1.6)), s = lerp(0.6, 1.05, eo(Math.min(1, u * 2.5))), bob = Math.abs(Math.sin(t * 14)) * -12 * (u > 0 && u < 1 ? 1 : 0), rk = Math.sin(t * 14) * 0.05;
      const inGate = u < 0.25;
      if (inGate) fl(rider('mess'), x, OB - 30 + bob, s, { rot: rk });
      fl(gateWall(), gx, OB - 10, 0.95);
      floor(pan(lt, d, 70));
      if (!inGate) { puffs(x - 160, OB - 30, t, tWord + 0.3, 5, 0.6, 0.45, -80); fl(rider('mess'), x, OB - 20 + bob, s, { rot: rk, rod: 1 }); }
      ctx.restore();
    }, { lights: 0.55 });
  } });
  cue(tWord, 'tock', { gain: 0.4 }); for (let k = 0; k < 6; k++) cue(tWord + 0.15 + k * 0.22, 'tock', { gain: 0.35 - k * 0.04, pan: 0.2 + k * 0.12 }); cue(tOut, 'whoosh', { gain: 0.35, pan: 0.6 });

  // b14 · pop-up map stage, rider to Arcot
  add({ id: 'b14', at: b14, cam: [540, 760], zoom: 0.06, note: 'the stage pops up like a book page: painted floor map, the rider slides along the groove to Arcot; "ARCOT 25 km"', draw(lt, d, t) {
    stage(t, () => {
      const px = pan(lt, d, 20), ox = OX - 60 + px, oy = OY - 40; bd(bdMap(), px);
      fl(townCard('v', 4), ox + MAPA[0], oy + MAPA[1] + 40, 0.9); fl(townCard('a', 3), ox + MAPB[0] + 30, oy + MAPB[1] + 30, 0.75);
      const u = eio(seg(t, b14 + 0.35, tArc + 0.3)), [rx, ry] = mapPt(u * 0.86), bob = Math.abs(Math.sin(t * 14)) * -8 * (u < 1 ? 1 : 0);
      fl(rider('mess'), ox + rx, oy + ry + 10 + bob, 0.42, { rot: Math.sin(t * 14) * 0.05 });
      if (u > 0.98) { const k = seg(t, tArc + 0.3, tArc + 0.9); ctx.strokeStyle = `rgba(255,240,200,${1 - k})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ox + MAPB[0] + 30, oy + MAPB[1] - 20, 60 + k * 120, 0, TAU); ctx.stroke(); }
      bill('ARCOT 25 km', 330 + px, 400, seg(t, tArc - 0.1, tArc + 0.5), t, 46);
    }, { pop: eob(seg(lt, 0, 0.45)), lights: 0.85 });
  } });
  cue(b14 + 0.02, 'boing', { gain: 0.3 }); cue(b14 + 0.1, 'whoosh', { gain: 0.3 }); for (let k = 0; k < 6; k++) cue(b14 + 0.45 + k * 0.25, 'tock', { gain: 0.28 }); cue(tArc, 'pop', { gain: 0.45 }); cue(tArc + 0.3, 'sparkle', { gain: 0.3 });

  // b15 · Arcot camp, cavalry slide in
  add({ id: 'b15', at: b15, cam: [540, 860], zoom: 0.08, note: 'Arcot camp at night: tents, campfires, cavalry riders slide in on rods and wheel toward Vellore', draw(lt, d, t) {
    stage(t, () => {
      bd(bdCamp(), pan(lt, d, 30));
      for (let i = 0; i < 3; i++) { const x = 250 + i * 290 + pan(lt, d, 60); fl(tent(), x, 1010, 0.9); }
      for (const fx of [400, 700]) { const x = fx + pan(lt, d, 60); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, 1000, 0, x, 1000, 140); g.addColorStop(0, `rgba(255,170,80,${0.4 * flick(t + fx)})`); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 140, 860, 280, 280); ctx.restore();
        for (let k = 0; k < 3; k++) { const h = 40 + 14 * Math.sin(t * 9 + k * 2 + fx), xx = x + (k - 1) * 14; ctx.fillStyle = k === 1 ? '#FFD27A' : '#E8702A'; ctx.beginPath(); ctx.moveTo(xx - 14, 1012); ctx.quadraticCurveTo(xx - 10, 1012 - h * 0.6, xx + Math.sin(t * 5 + k) * 6, 1012 - h); ctx.quadraticCurveTo(xx + 10, 1012 - h * 0.6, xx + 14, 1012); ctx.closePath(); ctx.fill(); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.stroke(); } }
      floor(pan(lt, d, 80), OB - 110);
      for (let i = 0; i < 3; i++) { const m = sl(lt, 0.2 + i * 0.3, 0.8, 1350 + i * 100, 260 + i * 270 + pan(lt, d, 90)), bob = Math.abs(Math.sin(t * 10 + i)) * -8;
        fl(rider('cav'), m.x, OB - 20 + bob + (i % 2) * 16, 0.95 - (i % 2) * 0.05, { flip: 1, rot: m.rot, rod: 1 }); }
      bill('ARCOT 25 km', 540 + pan(lt, d, 20), 360, Math.max(0.01, seg(lt, 0, 0.4)), t, 46);
    }, { lights: 0.6 });
  } });
  cue(b15 + 0.1, 'pop', { gain: 0.3 }); for (let i = 0; i < 3; i++) cue(b15 + 0.2 + i * 0.3, 'slide', { gain: 0.35, pan: 0.6 - i * 0.3 }); cue(tAway, 'drum', { gain: 0.45 }); cue(tAway + 0.3, 'alarm', { gain: 0.2 });
  void tCav; void tOff; void eio; void t10; void rgba;
}
