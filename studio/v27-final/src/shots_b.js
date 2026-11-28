// Worker B: script lines 4-6 (L(4) .. L(7)). The cyan prince rides home, the city's red tubes re-ignite (new rising);
// the seated amber king SHORTS OUT on the still-lit throne (killed); ONLY MONTHS; WITHIN DAYS the magenta cousin arrives from
// Vengi (north-east), son of a Chola princess (lineage), sits down and the throne itself re-ignites MAGENTA: KULOTTUNGA I.
// "Neon Noir Wall" kit.
import * as N from './neon.js';
import { L, Wd } from './core/timing.js';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = N.PAL;
const WET = 1360;
const sh = (a) => ctx.translate(a[0], a[1]);
/** seated figure placed on a throne drawn at (x, y, s) */
const seated = (x, y, s, o) => N.figure(x, y + 24 * s, 0.85 * s, { sit: true, ...o });
/** the dead king: grey glass outline (slightly visible) */
const deadFig = (x, y, s, o = {}) => N.figure(x, y, s, { col: P.glass, b: 0.14, hat: 'crown', hatCol: P.glass, ...o });

export function buildB(add, cue) {
  // ---------------- line 4: the prince rides home, a new rising ----------------
  const t4 = L(4), tHome = Wd('home', 4), tRis = Wd('rising', 4), tBroke = Wd('broke', 4), t5 = L(5);

  const sA = t4 - 0.05;
  add({ id: 'b4_home', at: sA, cam: [540, 760], zoom: 0.08, note: 'cyan helm+spear prince walks off, a cyan dashed route arrow leaves north; his tubes dim to grey; amber throne small behind',
    draw(lt, d) {
      N.wall(lt, { rain: 0.5, wet: WET, glowCol: P.cyan, gx: 640, gy: 700, ga: 0.12 * (1 - seg(lt, 0.6, d)) });
      N.halo(300, 1080, 300, P.amber, 0.6);
      N.throne(300, 1020, 0.7, { b: 0.7 * N.buzz(lt, 3) }); seated(300, 1020, 0.7, { col: P.amber, hat: 'crown', b: 0.75 * N.buzz(lt, 5) });
      const pr = eio(seg(lt, 0.15, 1.1)), dim = 1 - seg(lt, 0.7, d - 0.05);
      N.route([700, 1080], [760, 160], pr, { col: P.cyan, bend: 120, b: 0.9 * N.buzz(lt, 8) });
      const fy = lerp(1300, 1180, eio(seg(lt, 0, d))), fx = lerp(700, 760, eio(seg(lt, 0, d)));
      N.figure(fx, fy, lerp(0.85, 0.65, seg(lt, 0, d)), { col: P.cyan, hat: 'helm', spear: true, b: dim * N.buzz(lt, 11) });
      N.tag('HOME', 760, 240, P.cyan, N.ignite(lt, tHome - sA - 0.1, 4) * (0.4 + 0.6 * dim), 44);
      N.reflect(WET, () => { N.throne(300, 1020, 0.7, { b: 0.6 }); }, 0.22, lt);
    } });
  cue(sA, 'whoosh', { gain: 0.45 }); cue(sA + 0.2, 'zip', { gain: 0.35, pan: 0.3 }); cue(tHome - 0.1, 'zip', { gain: 0.3, pan: 0.4 });

  const sB = tHome - 0.05;
  add({ id: 'b4_calm', at: sB, cam: [540, 1000], zoom: 0.07, note: 'quiet: dim amber skyline in the rain; red windows sputter, then on RISING the skyline tube shorts and re-ignites RED',
    draw(lt, d) {
      const tr = tRis - sB;
      N.wall(lt, { tone: lt > tr + 0.3 ? 'red' : 'brick', rain: 0.8, wet: WET, glowCol: lt > tr + 0.3 ? P.red : P.amber, gx: 540, gy: 1200, ga: 0.08 + 0.1 * seg(lt, tr, tr + 0.5) });
      const ab = 0.45 * N.buzz(lt, 2, 0.5) * N.short(lt, tr, 2, 0.3), rb = N.ignite(lt, tr + 0.3, 6) * N.buzz(lt, 4, 1.2);
      const sky = () => { N.city(40, 1040, 1340, 420, 1, { col: P.amber, b: ab, seed: 4 }); if (rb > 0) N.city(40, 1040, 1340, 420, 1, { col: P.red, b: rb, seed: 4 }); };
      sky();
      N.throne(540, 600, 0.55, { b: 0.55 * N.buzz(lt, 9, lt > tr ? 2 : 0.5) }); seated(540, 600, 0.55, { col: P.amber, hat: 'crown', b: 0.6 * N.buzz(lt, 19, lt > tr ? 3 : 0.5) });
      // red windows flickering awake
      const w1 = lt > 0.3 ? (rnd(Math.floor(lt * 18)) > 0.55 ? 0.9 : 0.08) : 0, w2 = lt > 0.6 ? (rnd(Math.floor(lt * 14) + 5) > 0.6 ? 0.8 : 0.05) : 0;
      N.tube(N.rectPts(820, 1120, 70, 60), 1, { col: P.red, w: 7, b: Math.max(w1, rb) });
      N.tube(N.rectPts(170, 1160, 60, 50), 1, { col: P.red, w: 7, b: Math.max(w2, rb) });
      N.sparks(300, 1010, lt, tr, 24, 260, 3, P.redHi);
      N.reflect(WET, sky, 0.25, lt);
    } });
  cue(sB, 'tock', { gain: 0.3 }); cue(sB + 0.35, 'heartbeat', { gain: 0.5 }); cue(tRis, 'thud', { gain: 0.5 }); cue(tRis + 0.3, 'zip', { gain: 0.55 });

  const sC = tBroke - 0.05;
  add({ id: 'b4_rising', at: sC, cam: [540, 1100], zoom: 0.12, note: 'NEW RISING: red skyline flickers; red rioters with torches flood in from both sides toward the small amber throne; shake + rumble',
    draw(lt, d) {
      N.wall(lt, { tone: 'red', rain: 0.65, wet: WET, glowCol: P.red, gx: 540, gy: 1150, ga: 0.24 });
      ctx.save(); sh(N.shk(lt, 0.05, 14, 0.7)); sh(N.shk(lt, 0, 4, d));
      const sky = () => N.city(-40, 1120, 1080, 420, 1, { col: P.red, b: 0.7 * N.buzz(lt, 5, 2.5), seed: 9 });
      sky();
      N.throne(540, 470, 0.5, { b: 0.65 * N.buzz(lt, 9, 2) }); seated(540, 470, 0.5, { col: P.amber, hat: 'crown', b: 0.7 * N.buzz(lt, 29, 3) });
      const fl = eo(seg(lt, 0, d));
      N.crowd(lerp(-500, -60, fl), lerp(-100, 380, fl), 1250, 5, lt, { torch: true, s: 0.34, b: 0.7 * N.ignite(lt, 0.1, 3) });
      N.crowd(lerp(1180, 700, fl), lerp(1580, 1140, fl), 1250, 5, lt, { torch: true, s: 0.34, b: 0.7 * N.ignite(lt, 0.2, 5) });
      N.crowd(lerp(-700, -80, fl), lerp(-150, 420, fl), 1430, 4, lt + 0.4, { torch: true, s: 0.48, b: N.ignite(lt, 0.05, 7) });
      N.crowd(lerp(1230, 660, fl), lerp(1780, 1160, fl), 1440, 4, lt + 0.7, { torch: true, s: 0.48, b: N.ignite(lt, 0.15, 8) });
      ctx.restore();
      N.flash(0.3 * (1 - seg(lt, 0, 0.25)), P.red);
      N.reflect(WET, sky, 0.3, lt);
    } });
  cue(sC + 0.05, 'slam', { gain: 0.6 }); cue(sC + 0.05, 'rumble', { gain: 0.9, dur: 1.4 }); cue(sC + 0.5, 'drum', { gain: 0.45 });

  // ---------------- line 5: killed (THE KEY BEAT), only months ----------------
  const tKill = Wd('killed', 5), tHis = Wd('his', 5), tOnly = Wd('only', 5), tMon = Wd('months', 5), t6 = L(6);

  const sE = t5 - 0.05;
  add({ id: 'b5_killed', at: sE, cam: [540, 860], zoom: 0.16, note: 'KEY BEAT: amber crowned king on the amber throne flickers, red torch glow rises; on KILLED his tubes short out (sparks, red flash, shake) and go dead grey; throne stays lit',
    draw(lt, d) {
      const tk = tKill - sE;
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: lt < tk ? P.amber : P.red, gx: 540, gy: 900, ga: 0.14 + 0.1 * seg(lt, 0, tk) });
      // red torch glow creeping up from below
      N.glow(540, 1500, 700, P.red, 0.25 * seg(lt, 0, tk));
      ctx.save(); sh(N.shk(lt, tk, 26, 0.8));
      N.halo(540, 900, 520, P.amber, 0.9);
      N.throne(540, 860, 1.5, { b: N.buzz(lt, 4, lt > tk ? 1.5 : 0.6) });
      const fb = lt < tk ? 0.4 + 0.6 * (rnd(Math.floor(lt * (8 + 20 * seg(lt, 0, tk)))) > 0.3 * seg(lt, 0.3, tk) ? 1 : 0.35) : N.short(lt, tk, 9, 0.4);
      if (fb > 0.02) seated(540, 860, 1.5, { col: P.amber, hat: 'crown', b: fb });
      else deadFig(540, 860 + 36, 1.275, { sit: true });
      ctx.restore();
      N.crowd(60, 1020, 1440, 8, lt, { torch: true, s: 0.3, b: 0.5 * seg(lt, 0, 0.4) });
      N.sparks(540, 470, lt, tk, 60, 520, 5);
      N.sparks(470, 760, lt, tk + 0.05, 40, 420, 11, P.redHi);
      N.sparks(620, 700, lt, tk + 0.12, 30, 360, 17);
      N.flash(0.55 * (1 - seg(lt, tk, tk + 0.3)) * (lt >= tk ? 1 : 0), P.red);
      N.reflect(WET, () => N.throne(540, 860, 1.5, { b: 0.8 }), 0.2, lt);
    } });
  cue(sE, 'heartbeat', { gain: 0.7 }); cue(sE + 0.55, 'heartbeat', { gain: 0.8 });
  cue(tKill, 'slam', { gain: 1.0 }); cue(tKill + 0.03, 'thud', { gain: 0.9 }); cue(tKill + 0.05, 'sparkle', { gain: 0.6 });

  const sF = tHis - 0.05;
  add({ id: 'b5_dead', at: sF, cam: [540, 820], zoom: 0.1, note: 'aftermath: dead grey king outline on the still-lit amber throne, last sparks dripping, rain; the red crowd glow fades',
    draw(lt, d) {
      N.wall(lt, { rain: 0.9, wet: WET, glowCol: P.amber, gx: 540, gy: 800, ga: 0.1 });
      N.halo(540, 820, 480, P.amber, 0.8);
      N.throne(540, 820, 1.35, { b: N.buzz(lt, 21, 0.8) });
      deadFig(540, 820 + 24 * 1.35, 0.85 * 1.35, { sit: true });
      // one last sputter on the crown
      const cb = lt < 0.5 ? (rnd(Math.floor(lt * 30) + 3) > 0.7 ? 0.7 : 0) : 0;
      if (cb) N.crown(540, 820 + 24 * 1.35 - 415 * 0.85 * 1.35, 0.55 * 0.85 * 1.35, { b: cb });
      N.sparks(560, 420, lt, 0.1, 14, 200, 31);
      N.glow(540, 1600, 600, P.red, 0.18 * (1 - seg(lt, 0, d)));
      N.reflect(WET, () => N.throne(540, 820, 1.35, { b: 0.8 }), 0.22, lt);
    } });
  cue(sF + 0.1, 'tock', { gain: 0.35 });

  const sG = tOnly - 0.1;
  add({ id: 'b5_months', at: sG, cam: [540, 760], zoom: 0.08, note: 'ONLY MONTHS: a neon calendar grid; month cells strike on fast one after another, then the lit run shorts out; small dead throne icon',
    draw(lt, d) {
      N.wall(lt, { tone: 'blue', rain: 0.5, wet: WET, glowCol: P.amber, gx: 540, gy: 760, ga: 0.12 });
      const gx = 200, gy = 420, cw = 170, ch = 130, gap = 30;
      N.tube(N.rectPts(gx - 50, gy - 120, 3 * cw + 2 * gap + 100 + 70, 4 * ch + 3 * gap + 180), 1, { col: P.white, w: 6, b: 0.4 * N.ignite(lt, 0, 2) });
      // calendar rings
      for (let k = 0; k < 4; k++) N.tube(N.circPts(gx + 80 + k * 150, gy - 120, 18, 20), 1, { col: P.white, w: 6, b: 0.4 });
      const lit = Math.floor(seg(lt, 0.05, 0.9) * 5.99), dieT = tMon - sG + 0.45;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const i = r * 3 + c, x = gx + c * (cw + gap) + 35, y = gy + r * (ch + gap);
        let b = 0;
        if (i < lit) b = N.ignite(lt, 0.05 + i * 0.15, i) * N.short(lt, dieT + i * 0.04, i, 0.3);
        N.tube(N.rectPts(x, y, cw, ch), 1, { col: P.amber, w: 8, b });
      }
      N.sign('ONLY MONTHS', 540, 1200, 100, P.white, { p: seg(lt, tMon - sG - 0.35, tMon - sG + 0.05), flick: 0.6, t: lt });
    } });
  for (let i = 0; i < 6; i++) cue(sG + 0.05 + i * 0.15, 'tock', { gain: 0.3 + i * 0.04, pan: -0.4 + i * 0.16 });
  cue(tMon, 'zip', { gain: 0.5 }); cue(tMon + 0.45, 'thud', { gain: 0.5 });

  // ---------------- line 6: within days, Vengi cousin, son of a Chola princess, Kulottunga I ----------------
  const tDays = Wd('days', 6), tCous = Wd('cousin', 6), tVen = Wd('vengi', 6), tRaj = Wd('rajendra', 6), tSon = Wd('son', 6),
    tPrin = Wd('princess', 6), tTook = Wd('took', 6), tThr = Wd('throne', 6), tKul = Wd('kulottunga', 6);

  const sH = t6 - 0.05;
  add({ id: 'b6_days', at: sH, cam: [540, 860], zoom: 0.1, note: 'WITHIN DAYS: a row of short day-tick tubes strikes fast over the empty-lit amber throne with the dead grey outline on it',
    draw(lt, d) {
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: P.amber, gx: 540, gy: 900, ga: 0.1 });
      N.throne(540, 980, 1.0, { b: N.buzz(lt, 41) });
      deadFig(540, 980 + 24, 0.85, { sit: true });
      for (let i = 0; i < 7; i++) {
        const x = 220 + i * 107, b = N.ignite(lt, 0.15 + i * 0.09, i + 3);
        N.tube([[x, 300], [x, 400]], 1, { col: P.white, w: 9, b: b * 0.9 });
      }
      N.tag('WITHIN DAYS', 540, 520, P.white, N.ignite(lt, tDays - sH - 0.1, 2), 58);
      N.reflect(WET, () => N.throne(540, 980, 1.0, { b: 0.8 }), 0.22, lt);
    } });
  for (let i = 0; i < 7; i++) cue(sH + 0.15 + i * 0.09, 'tock', { gain: 0.25, pan: -0.5 + i * 0.16 });
  cue(tDays - 0.1, 'zip', { gain: 0.45 });

  const sI = tCous - 0.05;
  add({ id: 'b6_vengi', at: sI, cam: [600, 760], zoom: 0.1, note: 'VENGI sign top right (north-east); magenta dashed route arrow arrives to the amber city; magenta turban figure ignites at the gate',
    draw(lt, d) {
      N.wall(lt, { tone: 'blue', rain: 0.5, wet: WET, glowCol: P.magenta, gx: 820, gy: 300, ga: 0.18 });
      const tv = tVen - sI, tr = tRaj - sI;
      N.city(60, 760, 1300, 260, 1, { col: P.amber, b: 0.45 * N.buzz(lt, 3), seed: 12 });
      N.throne(380, 1060, 0.45, { b: 0.7 * N.buzz(lt, 6) });
      N.halo(840, 270, 260, P.magenta, N.ignite(lt, tv - 0.15, 3));
      N.sign('VENGI', 820, 260, 96, P.magenta, { b: N.ignite(lt, tv - 0.15, 5), flick: 0.5, t: lt });
      N.route([860, 360], [600, 1000], eio(seg(lt, 0.05, tv + 0.1)), { col: P.magenta, bend: 160, b: N.buzz(lt, 9) });
      N.figure(640, 1300, 0.75, { col: P.magenta, hat: 'turban', p: eo(seg(lt, tv, tv + 0.5)), b: N.ignite(lt, tv, 8) });
      N.reflect(WET, () => N.city(60, 760, 1300, 260, 1, { col: P.amber, b: 0.45, seed: 12 }), 0.25, lt);
    } });
  cue(sI, 'whoosh', { gain: 0.5, pan: 0.5 }); cue(tVen - 0.15, 'zip', { gain: 0.55, pan: 0.5 }); cue(tVen + 0.1, 'sparkle', { gain: 0.4 });

  const sI2 = tRaj - 0.05;
  add({ id: 'b6_rajendra', at: sI2, cam: [540, 900], zoom: 0.12, note: 'close: the magenta turban cousin stands lit at the city gate, magenta route tail behind him; RAJENDRA CHALUKYA tag',
    draw(lt, d) {
      N.wall(lt, { tone: 'blue', rain: 0.6, wet: WET, glowCol: P.magenta, gx: 540, gy: 900, ga: 0.18 });
      N.gate(540, 1340, 1.5, { col: P.amber, b: 0.4 * N.buzz(lt, 2) });
      N.route([980, 160], [700, 900], 1, { col: P.magenta, bend: 80, b: 0.5 * N.buzz(lt, 4) });
      N.halo(540, 1050, 380, P.magenta, 0.9);
      N.figure(540, 1330, 1.25, { col: P.magenta, hat: 'turban', b: N.buzz(lt, 6, 0.6), arm: 0.2 * Math.sin(lt * 2) });
      N.tag('RAJENDRA CHALUKYA', 540, 200, P.magenta, N.ignite(lt, 0.2, 6), 50);
      N.reflect(WET, () => N.figure(540, 1330, 1.25, { col: P.magenta, hat: 'turban', b: 0.8 }), 0.25, lt);
    } });
  cue(sI2, 'whoosh', { gain: 0.35 }); cue(sI2 + 0.2, 'zip', { gain: 0.45 });

  const sJ = tSon - 0.05;
  add({ id: 'b6_lineage', at: sJ, cam: [540, 760], zoom: 0.08, note: 'N.lineage: amber node (Chola princess, small crown) links down to magenta node (son); SON OF A CHOLA PRINCESS tag',
    draw(lt, d) {
      N.wall(lt, { rain: 0.45, wet: WET, glowCol: P.magenta, gx: 540, gy: 900, ga: 0.12 });
      const nodes = [[540, 500, P.amber], [540, 900, P.magenta]], tp = tPrin - sJ;
      ctx.save(); ctx.translate(540, 700); ctx.scale(1.5, 1.5); ctx.translate(-540, -700);
      N.halo(540, 500, 260, P.amber, 0.8); N.halo(540, 900, 260, P.magenta, seg(lt, 0.4, 0.8));
      N.lineage(nodes, eio(seg(lt, 0.0, 0.9)), { b: N.buzz(lt, 4, 0.5) });
      N.crown(540, 410, 0.4, { b: N.ignite(lt, 0.2, 3), p: seg(lt, 0.2, 0.6) });
      N.tube(N.at([[-60, -30], [-40, -75], [0, -90], [40, -75], [60, -30]], 540, 870, 0.8), seg(lt, 0.6, 1.0), { col: P.magenta, w: 8, b: N.buzz(lt, 7) });
      // a tiny glow pulse travelling down the link
      const u = (lt * 0.9) % 1; N.glow(540, lerp(546, 854, u), 50, P.white, 0.5 * seg(lt, 0.9, 1.2));
      ctx.restore();
      N.tag('SON OF A CHOLA PRINCESS', 540, 1300, P.white, N.ignite(lt, tp - 0.25, 4), 46);
      
    } });
  cue(sJ, 'pop', { gain: 0.45 }); cue(sJ + 0.4, 'zip', { gain: 0.4 }); cue(tPrin - 0.25, 'sparkle', { gain: 0.45 });

  const sK = tTook - 0.05;
  add({ id: 'b6_sit', at: sK, cam: [600, 880], zoom: 0.1, note: 'magenta figure steps onto the throne and sits; the amber throne tube shorts (sparks) and re-ignites MAGENTA; dead grey king outline beside it',
    draw(lt, d) {
      const tt = tThr - sK, sit = tt - 0.05;
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: lt < tt ? P.amber : P.magenta, gx: 600, gy: 880, ga: 0.14 });
      ctx.save(); sh(N.shk(lt, tt, 12, 0.4));
      const ab = N.short(lt, tt, 4, 0.28), mb = N.ignite(lt, tt + 0.25, 7);
      N.halo(620, 900, 460, lt < tt + 0.3 ? P.amber : P.magenta, 0.7);
      if (ab > 0.02) N.throne(620, 900, 1.15, { b: ab });
      else if (mb > 0) N.throne(620, 900, 1.15, { col: P.magenta, b: mb });
      else N.throne(620, 900, 1.15, { b: 0 });
      deadFig(200, 1250, 0.6, { sit: true });
      if (lt < sit) N.figure(lerp(980, 760, eo(seg(lt, 0, sit))), 1250, 0.95, { col: P.magenta, hat: 'turban', b: N.buzz(lt, 3) });
      else seated(620, 900, 1.15, { col: P.magenta, hat: 'turban', b: N.ignite(lt, sit, 2) });
      ctx.restore();
      N.sparks(620, 520, lt, tt, 40, 400, 23, P.amberHi);
      N.flash(0.3 * (1 - seg(lt, tt + 0.25, tt + 0.5)) * (lt > tt + 0.25 ? 1 : 0), P.magenta);
      N.reflect(WET, () => N.throne(620, 900, 1.15, { col: lt > tt + 0.25 ? P.magenta : P.amber, b: 0.8 }), 0.22, lt);
    } });
  cue(sK, 'whoosh', { gain: 0.4, pan: 0.4 }); cue(tThr, 'thud', { gain: 0.7 }); cue(tThr + 0.02, 'sparkle', { gain: 0.5 }); cue(tThr + 0.25, 'zip', { gain: 0.6 });

  const sL = tKul - 0.05;
  add({ id: 'b6_kulottunga', at: sL, cam: [540, 800], zoom: 0.1, note: 'KULOTTUNGA I neon sign strikes on above the MAGENTA throne, crowned magenta figure seated; dead grey amber king outline beside; rain',
    draw(lt, d) {
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: P.magenta, gx: 600, gy: 800, ga: 0.18 });
      N.halo(620, 900, 480, P.magenta, 0.9);
      N.throne(620, 940, 1.1, { col: P.magenta, b: N.buzz(lt, 13, 0.6) });
      seated(620, 940, 1.1, { col: P.magenta, hat: 'crown', hatCol: P.magenta, b: N.buzz(lt, 17, 0.6) });
      deadFig(210, 1270, 0.6, { sit: true });
      N.sign('KULOTTUNGA I', 540, 300, 92, P.magenta, { p: eo(seg(lt, 0.0, 0.5)), flick: 0.4, t: lt });
      N.sparks(620, 560, lt, 0.05, 20, 260, 41, P.magentaHi);
      N.reflect(WET, () => N.throne(620, 940, 1.1, { col: P.magenta, b: 0.8 }), 0.25, lt);
    } });
  cue(sL, 'zip', { gain: 0.6 }); cue(sL + 0.1, 'swell', { gain: 0.5, dur: 1.5 }); cue(sL + 0.3, 'sparkle', { gain: 0.4 });
}
