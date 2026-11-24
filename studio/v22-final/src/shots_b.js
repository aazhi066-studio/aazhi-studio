// EPISODE 22 · worker B : "Leather Shadow Puppets", lines 4-7 (L(4) -> L(8)).
//   b1  CHALUKYA ARCHERS: green kneeling archer puppets slide in on their rods, strings draw back
//   b2  ONE TARGET: big arrow tips converge, a punched-hole target ring closes on one point
//   b3  the faceless crowned king in the howdah; punched target rings tighten round him, arrow tips inch in
//   b4  VOLLEY: arrows converge on the howdah; on "struck" shake + blood-red flash, black shafts stick in the howdah
//   b5  THE EMPEROR FELL: the king slips off his rod and drops, crown tumbles separately, the lamp dims
//   b6  ARMY BREAKS: red Chola puppets flip round on their rods and run, rods tilting
//   b7  RAJENDRA rises into the lamp's hot spot (no crown yet) · YOUNGER BROTHER
//   b8  TAKES COMMAND: sword arm up, the scattered puppets flip back to face him
//   b9  RECORDS SAY: a leather crown on its own bamboo rod is lowered onto his head on "crowned"; rosettes flare
//   b10 ON THE BATTLEFIELD: wide; fallen king flat, elephant kneeling, the new king standing; lamp low & warm
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { poly } from './art.js';
import * as PP from './puppet.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI, PAL = PP.PAL;
const GREEN = { col: PAL.green, dk: PAL.greenDk }, RED = { col: PAL.red, dk: PAL.redDk };

// ───────────── worker-B helpers ─────────────
// a jointed leather limb from (ax,ay) to (bx,by), width w
function limb(ax, ay, bx, by, w = 26, col = PAL.ochre, dk = PAL.ochreDk) {
  const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
  poly([[ax + nx, ay + ny], [bx + nx * 0.8, by + ny * 0.8], [bx - nx * 0.8, by - ny * 0.8], [ax - nx, ay - ny]]); PP.leather(col, dk, 0);
}
const pin = (x, y) => { ctx.fillStyle = PAL.leather; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.hole; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); };
// faceless profile head + cap (same cut as PP.warrior), shifted by oy
function head(oy, dk) {
  ctx.save(); ctx.translate(0, oy);
  poly([[-16, -540], [16, -540], [14, -520], [-14, -520]]); PP.leather(PAL.ochre, PAL.ochreDk, 0);
  ctx.beginPath(); ctx.moveTo(-34, -560); ctx.bezierCurveTo(-46, -640, 20, -672, 42, -620); ctx.lineTo(56, -600); ctx.lineTo(40, -588); ctx.bezierCurveTo(40, -560, 10, -540, -34, -560); ctx.closePath(); PP.leather(PAL.ochre, PAL.ochreDk, 0);
  poly([[-40, -636], [44, -636], [30, -690], [-30, -690]]); PP.leather(dk, PAL.leather, 12);
  ctx.restore();
}
// KNEELING ARCHER puppet, knee on (x,y), facing dir. o = { col, dk, pull 0..1 (string drawn), aim rad (up), loose: bool (arrow gone), rodA }
function archer(x, y, s = 1, dir = 1, o = {}) {
  const col = o.col || PAL.green, dk = o.dk || PAL.greenDk, pull = o.pull ?? 1, aim = o.aim ?? 0.12;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  limb(0, -230, -20, -6, 30); limb(-20, -6, -200, 0, 26);                 // back leg: thigh to knee on the ground, shin flat
  limb(0, -230, 150, -222, 30); limb(150, -222, 156, 0, 28);              // front leg
  pin(-20, -6); pin(150, -222);
  poly([[-82, -300], [72, -300], [110, -180], [-104, -180]]); PP.leather(col, dk, 18);
  poly([[-56, -490], [56, -490], [70, -300], [-70, -300]]); PP.leather(PAL.ochre, PAL.ochreDk, 20); PP.rosette(0, -400, 32);
  head(30, dk);
  // bow arm (front) along aim, bow stave across the hand, string to the nock, arrow on the string
  const sx = 40, sy = -462, ca = cos(aim), sa = -sin(aim), hx = sx + ca * 210, hy = sy + sa * 210;
  const px = -sa, py = ca, tip1 = [hx + px * 170 - ca * 40, hy + py * 170 - sa * 40], tip2 = [hx - px * 170 - ca * 40, hy - py * 170 - sa * 40];
  const nk = 40 + pull * 150, nx = hx - ca * nk, ny = hy - sa * nk;
  ctx.strokeStyle = PAL.night; ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(tip1[0], tip1[1]); ctx.quadraticCurveTo(hx + ca * 60, hy + sa * 60, tip2[0], tip2[1]); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tip1[0], tip1[1]); ctx.lineTo(nx, ny); ctx.lineTo(tip2[0], tip2[1]); ctx.stroke();
  if (!o.loose) { ctx.save(); ctx.translate(nx, ny); ctx.rotate(Math.atan2(sa, ca)); ctx.fillStyle = PAL.night; ctx.fillRect(0, -3.5, nk + 70, 7);
    poly([[nk + 60, -14], [nk + 100, 0], [nk + 60, 14]]); ctx.fill(); poly([[0, 0], [-26, -14], [16, 0], [-26, 14]]); ctx.fill(); ctx.restore(); }
  limb(-30, -470, nx - 50, ny + 30, 24); limb(nx - 50, ny + 30, nx, ny, 22); pin(nx - 50, ny + 30);   // draw arm to the string
  limb(sx, sy, hx, hy, 26); pin(sx, sy); pin(lerp(sx, hx, 0.5), lerp(sy, hy, 0.5));
  ctx.restore();
  PP.rod(x - 10 * dir * s, y - 380 * s, -0.05 * dir, o.rodA ?? 0.8);
}
// a separate leather crown (same cut as the PP.warrior crown) whose base centre sits at (x,y)
function crown(x, y, s, dir = 1, rot = 0, ch = 130) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * dir, s); ctx.translate(0, 640);
  poly([[-40, -640], [44, -640], [22, -640 - ch], [6, -640 - ch * 1.25], [-14, -640 - ch]]); PP.leather(PAL.ochre, PAL.leather, 14); PP.rosette(4, -640 - ch * 0.55, 18);
  ctx.restore();
}
// punched-hole target ring
function ring(x, y, r, a = 1, col = PAL.leather) {
  if (a <= 0 || r <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.stroke();
  ctx.setLineDash([2, 20]); ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = PAL.hole; ctx.stroke(); ctx.restore();
}
// warm additive glow
function glow(x, y, r, a = 0.6, col = '255,226,150') {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// a black arrow shaft stuck in at (x,y) (local), tail toward angle ang, length len
function stuck(x, y, ang, len = 150) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = PAL.night; ctx.fillRect(0, -3.5, len, 7);
  poly([[len - 10, 0], [len + 22, -16], [len - 2, 0], [len + 22, 16]]); ctx.fill(); ctx.restore();
}
// WAR ELEPHANT (variant of PP.elephant): open howdah with the rider drawn INSIDE it (legs hidden by the howdah wall),
// o = { rear, step, kneel 0..1, rider: fn() drawn in local coords at the seat (0,-560 → origin), arrows: n stuck shafts, kingRod }
// returns world position of the seat (0,-700 local) for a falling rider.
function eleph(x, y, s = 1, dir = 1, o = {}) {
  const rear = o.rear || 0, ph = o.step || 0, kn = o.kneel || 0, col = PAL.indigo, dk = PAL.indigoDk, drop = kn * 180;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.rotate(-rear * 0.28);
  [[-260, 0], [-140, 1], [150, 0], [260, 1]].forEach(([lx, k], i) => { ctx.save(); ctx.translate(lx, -300 + drop); const front = lx > 0;
    ctx.rotate((front ? -rear * 0.7 : 0) + sin(ph + i * 1.6) * 0.12 * (1 - kn) ); ctx.scale(1, 1 - 0.6 * kn); poly([[-46, 0], [46, 0], [42, 300], [-42, 300]]); PP.leather(k ? dk : col, PAL.leather, 18); ctx.restore(); });
  ctx.translate(0, drop);
  ctx.beginPath(); ctx.ellipse(0, -430, 360, 210, 0, 0, TAU); PP.leather(col, dk, 24);
  poly([[-220, -560], [200, -560], [240, -320], [-250, -320]]); PP.leather(PAL.red, PAL.redDk, 18);
  for (let k = -2; k <= 2; k++) PP.rosette(k * 80, -440, 26);
  ctx.beginPath(); ctx.ellipse(330, -520, 140, 130, 0.2, 0, TAU); PP.leather(col, dk, 16);
  ctx.beginPath(); ctx.ellipse(270, -500, 90, 120, -0.2, 0, TAU); PP.leather(dk, PAL.leather, 14);
  const tr = sin(ph * 0.5) * 0.2 + rear * 0.9 - kn * 0.5;
  ctx.save(); ctx.translate(430, -470); ctx.rotate(-tr); poly([[-34, 0], [34, 0], [22, 160], [40, 280], [10, 300], [-14, 170]]); PP.leather(col, dk, 12); ctx.restore();
  poly([[400, -430], [420, -420], [520, -360], [510, -350]]); ctx.fillStyle = PAL.hole; ctx.fill();
  // canopy poles + roof behind the rider
  ctx.fillStyle = PAL.leather; ctx.fillRect(-138, -900, 12, 280); ctx.fillRect(126, -900, 12, 280);
  poly([[-160, -900], [160, -900], [0, -980]]); PP.leather(PAL.red, PAL.redDk, 10);
  if (o.kingRod) { ctx.save(); ctx.globalAlpha *= 0.85; ctx.strokeStyle = PAL.rod; ctx.lineWidth = 9 / s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -800); ctx.lineTo(-10 + o.kingRod, 900); ctx.stroke(); ctx.restore(); }
  if (o.rider) { ctx.save(); ctx.translate(0, -560); o.rider(); ctx.restore(); }
  // howdah wall (front of the rider's legs)
  poly([[-150, -700], [150, -700], [170, -560], [-170, -560]]); PP.leather(PAL.ochre, PAL.ochreDk, 16); PP.rosette(-70, -630, 22); PP.rosette(70, -630, 22);
  for (let i = 0; i < (o.arrows || 0); i++) stuck(-120 + rnd(i + 4) * 240, -690 + rnd(i + 9) * 120, -0.35 - rnd(i + 2) * 0.5, 120 + rnd(i) * 70);
  ctx.restore();
  PP.rod(x - 40 * dir * s, y - (330 - drop) * s, 0.05 * dir); PP.rod(x + 240 * dir * s, y - (360 - drop) * s, 0.03 * dir);
  const ang = -rear * 0.28, sy = -700 + drop; return [x + dir * s * (-sy * sin(ang)), y + s * (sy * cos(ang))];
}
// the king rider (local, inside the howdah): crowned, faceless, red & ochre
const king = (o = {}) => PP.warrior(0, 0, 0.62, 1, { ...RED, crown: o.crown ?? 1, arm: o.arm ?? 40, weapon: o.weapon ?? null, rodA: 0, tilt: o.tilt || 0 });
function frame(t, rip = 0, edge = 0.55) { PP.stageFrame(t, rip); PP.lampEdge(edge); }
const pop = (lt, a = 0.05) => eob(seg(lt, a, a + 0.35));

export function buildB(add, cue) {
  const t4 = L(4), tAim = Wd('aimed', 4), tThe = Wd('target', 4, 'e'), t5 = L(5), tStruck = Wd('struck', 5), tEmp = Wd('emperor', 5), tFell = Wd('fell', 5),
    tBegan = Wd('began', 5), t6 = L(6), tTook = Wd('took', 6), tCmd = Wd('command', 6), t7 = L(7), tCrown = Wd('crowned', 7), tBf = Wd('battlefield', 7), tBeside = Wd('beside', 7);

  // ── b1 CHALUKYA ARCHERS ─────────────────────────────────────────────
  add({ id: 'b1', at: t4, zoom: 0.08, cam: [520, 1100], note: 'CHALUKYA ARCHERS: green kneeling archer puppets slide in, strings drawn', draw: (lt, d, t) => {
    PP.screen(t, { hot: [560 + sin(t * 0.7) * 40, 900] });
    const row = [[130, 1300, 0.62], [380, 1360, 0.7], [640, 1420, 0.78], [900, 1480, 0.86]];
    row.forEach(([x, y, s], i) => { const k = eo(seg(lt, i * 0.12, i * 0.12 + 0.6)), bob = sin(t * 2.3 + i) * 6;
      archer(x - (1 - k) * 700, y + bob, s, 1, { ...GREEN, pull: 0.25 + 0.75 * eio(seg(lt, 0.5 + i * 0.1, 1.3 + i * 0.1)), aim: 0.18 + sin(t * 1.7 + i) * 0.02 }); });
    frame(t);
    PP.placard('CHALUKYA ARCHERS', 540, 300, pop(lt), 70, '#8DB06A', PAL.greenDk);
  } });
  cue(t4, 'whoosh', { gain: 0.6 }); cue(t4 + 0.05, 'drum', { gain: 0.5 }); cue(t4 + 0.6, 'slide', { gain: 0.35 }); cue(t4 + 0.9, 'inhale', { gain: 0.3 });

  // ── b2 ONE TARGET ──────────────────────────────────────────────────
  const AIM = [740, 760];
  add({ id: 'b2', at: tAim, zoom: 0.1, cam: AIM, note: 'ONE TARGET: arrow tips converge, punched target ring closes on one point', draw: (lt, d, t) => {
    PP.screen(t, { hot: AIM, dim: 0.12 });
    const k = eio(seg(lt, 0, d));
    ring(AIM[0], AIM[1], lerp(520, 130, k), 0.9); ring(AIM[0], AIM[1], lerp(320, 60, k), 0.6 + 0.3 * sin(t * 12) ** 2);
    ctx.fillStyle = PAL.blood; ctx.beginPath(); ctx.arc(AIM[0], AIM[1], 14 + 4 * sin(t * 9), 0, TAU); ctx.fill();
    // big bow + arrow tips from the lower left, each pointing at AIM, inching in
    const src = [[-120, 1250], [-160, 980], [60, 1480], [-60, 700]];
    src.forEach(([x, y], i) => { const a = Math.atan2(AIM[1] - y, AIM[0] - x), dist = Math.hypot(AIM[0] - x, AIM[1] - y), reach = lerp(0.42, 0.62, k) + sin(t * 3 + i) * 0.01;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = PAL.night; ctx.fillRect(0, -5, dist * reach, 10);
      poly([[dist * reach - 4, -20], [dist * reach + 56, 0], [dist * reach - 4, 20]]); ctx.fill(); ctx.restore(); });
    archer(150, 1560, 1.25, 1, { ...GREEN, pull: 1, aim: Math.atan2(1560 - 470 * 1.25 - AIM[1], AIM[0] - 150) });
    frame(t);
    PP.placard('ONE TARGET', 540, 290, pop(lt), 92, PAL.ochre, PAL.leather, -0.03);
  } });
  cue(tAim, 'zip', { gain: 0.5 }); cue(tAim + 0.05, 'tock', { gain: 0.4 }); cue(Wd('target', 4), 'heartbeat', { gain: 0.6 });

  // ── b3 THE KING ON THE ELEPHANT: rings close round him ──────────────
  add({ id: 'b3', at: tThe, zoom: 0.09, cam: [560, 700], note: 'faceless crowned king in the howdah; punched target rings tighten, arrow tips inch in', draw: (lt, d, t) => {
    PP.screen(t, { hot: [560, 640] });
    const seat = eleph(600, 1500, 0.82, -1, { step: t * 2.4, rider: () => king({ arm: 70 + sin(t * 2) * 6 }), kingRod: 30 });
    const kx = seat[0], ky = seat[1] - 0.82 * 0.62 * 320, k = eo(seg(lt, 0.1, d * 0.9));
    ring(kx, ky, lerp(560, 190, k), 0.85); ring(kx, ky, lerp(400, 120, k), 0.65); ring(kx, ky, lerp(260, 60, eo(seg(lt, 0.4, d))), 0.5);
    for (let i = 0; i < 5; i++) { const y0 = 340 + i * 150, reach = lerp(140, 260, k) + sin(t * 4 + i) * 8, a = Math.atan2(ky - y0, kx);
      ctx.save(); ctx.translate(-20, y0); ctx.rotate(a); ctx.fillStyle = PAL.night; ctx.fillRect(0, -4, reach, 8); poly([[reach - 4, -16], [reach + 46, 0], [reach - 4, 16]]); ctx.fill(); ctx.restore(); }
    frame(t);
    PP.placard('THE KING', 540, 210, pop(lt, 0.1), 70, PAL.red, PAL.leather);
  } });
  cue(tThe, 'whoosh', { gain: 0.45 }); cue(tThe + 0.1, 'rumble', { gain: 0.4, dur: 1.6 }); cue(Wd('king', 4), 'heartbeat', { gain: 0.7 }); cue(Wd('elephant', 4), 'heartbeat', { gain: 0.7 });

  // ── b4 VOLLEY → STRUCK ─────────────────────────────────────────────
  add({ id: 'b4', at: t5, zoom: 0.05, cam: [600, 760], note: 'VOLLEY converges on the howdah; "struck" = shake + blood-red flash, shafts stick in the howdah', draw: (lt, d, t) => {
    const hit = tStruck - t5, [dx, dy] = PP.shake(lt, hit, 30, 0.45), after = lt >= hit;
    ctx.save(); ctx.translate(dx, dy);
    PP.screen(t, { hot: [600, 700] });
    const rear = after ? 0.25 * eo(seg(lt, hit, hit + 0.4)) : 0;
    const seat = eleph(620, 1500, 0.82, -1, { step: t * 2.4, rear, arrows: after ? 6 : 0, kingRod: 30,
      rider: () => king({ arm: after ? 120 : 70, tilt: after ? -0.25 * eo(seg(lt, hit, hit + 0.3)) : 0 }) });
    // volley: arrows from off-left converging on the howdah, landing at `hit`
    for (let i = 0; i < 16; i++) { const y0 = 150 + rnd(i + 21) * 900, st = rnd(i + 5) * 0.12, p = clamp((lt - st) / (hit - st)), tx = seat[0] - 120 + rnd(i + 3) * 240, ty = seat[1] + rnd(i + 8) * 120;
      if (p < 1) PP.arrow(-260, y0, tx, ty, eio(p) * 1.0, 170 + rnd(i) * 80, 6); }
    if (after) for (let i = 0; i < 9; i++) { const k = lt - hit, a = PI + (rnd(i + 31) - 0.5) * 1.6, v = 300 + rnd(i + 2) * 400; // glancing shafts tumble away
      const x = seat[0] + cos(a) * v * k, y = seat[1] + 60 + sin(a) * v * k + 900 * k * k; if (k < 1.2) { ctx.save(); ctx.translate(x, y); ctx.rotate(k * 9 + i); ctx.fillStyle = PAL.night; ctx.fillRect(-70, -3, 140, 6); ctx.restore(); } }
    ctx.restore();
    PP.flash(seg(lt, hit, hit + 0.55), '160,20,26', 0.7);
    frame(t, after ? clamp(1 - (lt - hit)) : 0);
    PP.placard('ARROWS', 540, 220, pop(lt, hit - 0.05), 84, PAL.ochre, PAL.leather, -0.04);
  } });
  cue(t5, 'whoosh', { gain: 0.8, dur: 0.4 }); cue(t5 + 0.12, 'whoosh', { gain: 0.5 }); cue(tStruck, 'thud', { gain: 1 }); cue(tStruck + 0.02, 'slam', { gain: 0.8 }); cue(tStruck + 0.1, 'rumble', { gain: 0.5, dur: 1.2 });

  // ── b5 THE EMPEROR FELL ─────────────────────────────────────────────
  add({ id: 'b5', at: tEmp, zoom: 0.07, cam: [560, 820], note: 'THE EMPEROR FELL: king slips off his rod, crown tumbles separately, lamp dims', draw: (lt, d, t) => {
    const fall = tFell - tEmp, k = Math.max(0, lt - fall), dim = 0.42 * eio(seg(lt, fall, fall + 0.8));
    PP.screen(t, { hot: [560, 700 + dim * 300], dim });
    const S = 0.95, seat = eleph(660, 1560, S, -1, { step: t * 2, rear: 0.2 + 0.05 * sin(t * 3), arrows: 6, kingRod: 30 + sin(k * 7) * 30 * Math.exp(-k * 2),
      rider: lt < fall ? () => king({ arm: 120, tilt: -0.25 + sin(t * 6) * 0.04 }) : null });
    if (lt >= fall) { // the rider (now in world coords) slips out and drops; the crown tumbles separately
      const ks = 0.62 * S, x = seat[0] - 40 * k - 160 * k, y = seat[1] + 140 * S + 1300 * k * k, rot = -0.25 - 2.2 * k;
      PP.warrior(x, y, ks, -1, { ...RED, crown: 0, arm: 150, rodA: 0, tilt: -rot });
      const cx = seat[0] + 20 + 240 * k, cy = seat[1] - 400 * ks - 280 * k + 1500 * k * k;
      crown(cx, cy, ks, -1, 3.5 * k);
    }
    frame(t, 0, 0.55 + dim * 0.4);
    PP.placard('THE EMPEROR FELL', 540, 230, pop(lt, fall), 72, PAL.ochre, PAL.leather, 0.02);
  } });
  cue(tEmp, 'whoosh', { gain: 0.4 }); cue(tFell, 'thud', { gain: 1 }); cue(tFell + 0.05, 'drum', { gain: 0.8 }); cue(tFell + 0.3, 'tock', { gain: 0.5 }); cue(tFell + 0.4, 'heartbeat', { gain: 0.6 });

  // ── b6 ARMY BREAKS ──────────────────────────────────────────────────
  add({ id: 'b6', at: tBegan, zoom: 0.06, note: 'ARMY BREAKS: red Chola puppets flip round on their rods and run, rods tilting', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540 + sin(t) * 60, 900], dim: 0.36 });
    PP.volley(seg(lt, 0, d) * 1.2, 10, 5, 1, 260, 900);
    const men = [[150, 1330, 0.52], [420, 1380, 0.6], [700, 1350, 0.55], [880, 1430, 0.66], [290, 1500, 0.72], [620, 1520, 0.74]];
    men.forEach(([x, y, s], i) => { const st = 0.12 + i * 0.08, flip = seg(lt, st, st + 0.22), dir = cos(PI * flip) * -1 + 0.0001, run = Math.max(0, lt - st - 0.2);
      PP.warrior(x + run * run * 260 + run * 120, y + Math.abs(sin(run * 12)) * -14, s, dir, { ...RED, weapon: i % 2 ? 'spear' : null, arm: i % 2 ? 60 : 20 + run * 80, step: sin(run * 14) * (run > 0 ? 1 : 0), tilt: run > 0 ? 0.18 + 0.04 * sin(t * 5 + i) : 0, shield: i === 2 }); });
    frame(t, 0, 0.75);
    PP.placard('ARMY BREAKS', 540, 280, pop(lt), 90, PAL.red, PAL.leather, -0.05 + sin(t * 3) * 0.015);
  } });
  cue(tBegan, 'whoosh', { gain: 0.6 }); cue(tBegan + 0.15, 'rumble', { gain: 0.6, dur: 1.4 }); cue(Wd('break', 5), 'slam', { gain: 0.7 });

  // ── b7 RAJENDRA rises into the hot spot ────────────────────────────
  add({ id: 'b7', at: t6, zoom: 0.07, cam: [540, 860], note: 'RAJENDRA (younger brother, no crown yet) rises into the lamp hot spot', draw: (lt, d, t) => {
    const k = eo(seg(lt, 0.05, 1.0));
    PP.screen(t, { hot: [540, lerp(1300, 860, k)], dim: lerp(0.55, 0.12, k) });
    PP.warrior(540, lerp(2300, 1500, k) + sin(t * 2.2) * 6, 1.12, 1, { ...RED, arm: 25 + sin(t * 1.8) * 5 });
    glow(540, 1500 - 430 * 1.12, 220, 0.25 * k * PP.flick(t));
    frame(t, 0, 0.6);
    PP.placard('RAJENDRA', 540, 260, pop(lt, Wd('rajendra', 6) - t6 - 0.1), 100, PAL.red, PAL.leather);
    PP.placard('YOUNGER BROTHER', 540, 420, pop(lt, 0.25) * 0.9, 46, PAL.ochre, PAL.leather);
  } });
  cue(t6, 'swell', { gain: 0.6, dur: 1.4 }); cue(t6 + 0.05, 'whoosh', { gain: 0.4 }); cue(Wd('rajendra', 6) - 0.1, 'pop', { gain: 0.6 }); cue(t6 + 0.3, 'pop', { gain: 0.4 });

  // ── b8 TAKES COMMAND ───────────────────────────────────────────────
  add({ id: 'b8', at: tTook, zoom: 0.06, cam: [540, 900], note: 'TAKES COMMAND: sword arm swings up, scattered puppets flip back to face him', draw: (lt, d, t) => {
    const cmd = tCmd - tTook, up = eob(seg(lt, cmd - 0.15, cmd + 0.25));
    PP.screen(t, { hot: [560, 820], dim: 0.12 });
    const side = [[110, 1380, 0.5, -1], [250, 1460, 0.56, -1], [840, 1400, 0.52, 1], [990, 1470, 0.58, 1]];
    side.forEach(([x, y, s, from], i) => { const f = seg(lt, cmd + i * 0.07, cmd + 0.25 + i * 0.07);
      PP.warrior(x, y + sin(t * 3 + i) * 5, s, from * cos(PI * f) + 0.0001, { ...RED, tilt: (1 - f) * 0.15 * -from, arm: f > 0.5 ? 70 : 20, weapon: i % 2 ? 'spear' : null }); });
    PP.warrior(560, 1500 + sin(t * 2) * 5, 1.0, 1, { ...RED, arm: lerp(25, 165, up), weapon: 'sword' });
    glow(560, 1500 - 760, 240, 0.35 * up);
    frame(t, 0, 0.55);
    PP.placard('TAKES COMMAND', 540, 230, pop(lt, cmd - 0.05), 78, PAL.red, PAL.leather, 0.03);
  } });
  cue(tTook, 'whoosh', { gain: 0.5 }); cue(tCmd, 'slam', { gain: 0.9 }); cue(tCmd + 0.03, 'drum', { gain: 0.7 }); cue(tCmd + 0.25, 'slide', { gain: 0.4 });

  // ── b9 RECORDS SAY → CROWNED ───────────────────────────────────────
  add({ id: 'b9', at: t7, zoom: 0.08, cam: [540, 780], note: 'RECORDS SAY: a leather crown on its own bamboo rod is lowered onto his head on "crowned"; rosettes flare', draw: (lt, d, t) => {
    const land = tCrown - t7, X = 540, Y = 1520 + sin(t * 2) * 5, S = 1.05, on = lt >= land, f = Math.max(0, lt - land);
    PP.screen(t, { hot: [540, 760], dim: on ? 0.05 : 0.2 });
    PP.warrior(X, Y, S, 1, { ...RED, crown: on ? 1 : 0, arm: on ? 40 : 25, weapon: 'sword' });
    const cy = on ? Y - 640 * S : lerp(-260, Y - 640 * S, eio(seg(lt, 0.1, land)));
    // the crown's own rod comes from the top of the screen
    const rodY = on ? cy - 160 * S - 600 * eio(seg(f, 0.35, 1.2)) : cy - 160 * S;
    ctx.save(); ctx.strokeStyle = PAL.rod; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(X + 6, rodY); ctx.lineTo(X + 40, -60); ctx.stroke(); ctx.restore();
    if (!on) crown(X, cy, S, 1, sin(t * 3) * 0.05);
    if (on) { const fl = clamp(1 - f / 1.0); // rosettes flare: glows + a ring of rosettes bursting outward from the crown
      glow(X, Y - 640 * S - 80, 420, 0.6 * fl); glow(X, Y - 430 * S, 200, 0.5 * fl);
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + 0.2, r = 120 + 260 * eo(clamp(f / 0.8)); PP.rosette(X + cos(a) * r, Y - 700 * S + sin(a) * r * 0.8, 26, fl); } }
    PP.flash(seg(lt, land, land + 0.4), '255,236,170', 0.6);
    frame(t, 0, 0.5);
    PP.placard('RECORDS SAY', 540, 230, pop(lt), 80, PAL.ochre, PAL.leather, -0.02);
    PP.placard('CROWNED', 540, 400, pop(lt, land + 0.05), 84, PAL.ochre, PAL.leather, 0.03);
  } });
  cue(t7, 'whoosh', { gain: 0.45 }); cue(t7 + 0.1, 'tock', { gain: 0.5 }); cue(t7 + 0.3, 'slide', { gain: 0.4, dur: 0.6 }); cue(tCrown, 'bell', { gain: 0.9 }); cue(tCrown + 0.01, 'slam', { gain: 0.8 }); cue(tCrown + 0.1, 'sparkle', { gain: 0.6 });

  // ── b10 ON THE BATTLEFIELD (wide) ──────────────────────────────────
  add({ id: 'b10', at: tBf, zoom: 0.07, cam: [540, 1150], note: 'ON THE BATTLEFIELD: fallen king flat, elephant kneeling, new king standing; lamp low and warm', draw: (lt, d, t) => {
    const bes = tBeside - tBf, mv = eio(seg(lt, bes - 0.2, bes + 0.8));
    PP.screen(t, { hot: [lerp(820, 470, mv), 1250], dim: 0.32, tint: '255,140,40', tintA: 0.12 });
    eleph(390, 1380, 0.68, 1, { kneel: 1, step: t * 1.2, arrows: 6 });
    PP.warrior(650, 1460, 0.52, 1, { ...RED, crown: 0, arm: 160, rodA: 0, tilt: -PI / 2 + 0.03 * sin(t * 1.3) });
    crown(250, 1480, 0.52, 1, -1.9);
    glow(lerp(820, 420, mv), lerp(900, 1380, mv), 300, 0.22 * PP.flick(t));
    PP.warrior(840, 1450 + sin(t * 2) * 4, 0.82, -1, { ...RED, crown: 1, arm: 30 + sin(t * 1.5) * 4, weapon: 'sword' });
    frame(t, 0, 0.7);
    PP.placard('ON THE BATTLEFIELD', 540, 260, pop(lt), 62, PAL.ochre, PAL.leather);
    PP.placard('BESIDE THE FALLEN KING', 540, 400, pop(lt, bes) * 0.85, 44, PAL.red, PAL.leather);
  } });
  cue(tBf, 'whoosh', { gain: 0.4 }); cue(tBf + 0.05, 'drum', { gain: 0.5 }); cue(tBeside, 'heartbeat', { gain: 0.7 }); cue(tBeside + 0.6, 'rumble', { gain: 0.4, dur: 1.6 });
}
