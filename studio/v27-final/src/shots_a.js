// v27 worker A: script lines 0-3 (hook: the amber neon throne with the crowned amber figure, red torch crowd surging, red flash + sparks;
// 1070 CE sign; Athirajendra crowned; the capital in revolt; cyan Vikramaditya the brother-in-law marches in, crushes the red crowd, seats him;
// Bilhana's version: a neon scroll in a spotlight beside the cyan prince). Shots run 0 .. L(4).
import * as N from './neon.js';
import { L, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = N.PAL;
const WET = 1380;

// ---------- local helpers ----------
// shake: translate, with a slight over-scale so the wall edges never show
function shake(sh) { ctx.translate(540, 900); ctx.scale(1.05, 1.05); ctx.translate(-540 + sh[0], -900 + sh[1]); }
// seated crowned amber king on the throne (throne at x, ty, scale s)
function king(x, ty, s, o = {}) {
  N.throne(x, ty, s, { b: o.tb ?? 1, p: o.tp ?? 1 });
  if (o.fig !== false) N.figure(x, ty + 30 * s, 0.78 * s, { sit: true, hat: o.hat ?? 'crown', col: o.col || P.amber, b: o.b ?? 1, p: o.p ?? 1 });
}
// neon scroll / sheet outline with abstract wavy lines (NOT text)
function scroll(x, y, w, h, b, lt, p = 1) {
  const x0 = x - w / 2, y0 = y - h / 2;
  N.tube([[x0, y0], [x0, y0 + h]], p, { col: P.white, w: 9, b });
  N.tube([[x0 + w, y0], [x0 + w, y0 + h]], p, { col: P.white, w: 9, b });
  N.tube([[x0 - 30, y0], [x0 + w + 30, y0]], p, { col: P.amber, w: 16, b });
  N.tube([[x0 - 30, y0 + h], [x0 + w + 30, y0 + h]], p, { col: P.amber, w: 16, b });
  const n = 7;
  for (let i = 0; i < n; i++) {
    const yy = y0 + 70 + i * (h - 140) / (n - 1), ln = (i % 3 === 2 ? 0.6 : 0.85) * (w - 80), pts = [];
    for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push([x0 + 40 + u * ln, yy + Math.sin(u * 14 + i * 1.7 + lt * 2) * 8]); }
    N.tube(pts, clamp(p * 1.6 - 0.3 - i * 0.08), { col: P.white, w: 5, b: b * 0.8 * N.buzz(lt + i * 0.3, i + 40, 2) });
  }
}
// spotlight cone from above onto (x, y)
function spot(x, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, y + 300); g.addColorStop(0, `rgba(255,240,220,${0.02 * a})`); g.addColorStop(1, `rgba(255,240,220,${0.16 * a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 60, -50); ctx.lineTo(x + 60, -50); ctx.lineTo(x + 360, y + 320); ctx.lineTo(x - 360, y + 320); ctx.closePath(); ctx.fill();
  ctx.restore(); N.glow(x, y + 320, 380, '#FFF0DC', 0.12 * a);
}

export function buildA(add, cue) {
  const t1 = Wd('city', 0) - 0.12, tKill = Wd('kill', 0), t2 = L(1) - 0.05, tSev = Wd('seventy', 1), t3 = Wd('athirajendra', 1) - 0.05,
    t4 = Wd('crowned', 1) - 0.12, t5 = Wd('capital', 1) - 0.4, tRev = Wd('revolt', 1), t6 = tRev - 0.1,
    t7 = L(2) - 0.05, tBil = Wd('brotherinlaw', 2), t8 = Wd('vikramaditya', 2) - 0.05, t9 = Wd('marched', 2) - 0.05,
    t10 = Wd('crushed', 2) - 0.05, t11 = Wd('set', 2) - 0.1, tThr = Wd('throne', 2),
    t12 = L(3) - 0.05, t13 = Wd('bilhana', 3) - 0.05, tCourt = Wd('court', 3);

  // ---------- line 0: HOOK ----------
  add({ id: 'a0_hook', at: 0, cam: [540, 820], zoom: 0.12,
    note: 'HOOK frame 0: amber neon throne with the seated crowned amber figure, red torch crowd surging up below; red flash + sparks + shake at 0.0',
    draw: (lt) => {
      shake(N.shk(lt, 0, 34, 0.7));
      N.wall(lt, { tone: 'red', rain: 0.8, wet: WET, glowCol: P.amber, gy: 780, ga: 0.2 });
      const kb = N.buzz(lt, 3, 2.5) * (lt < 0.25 ? N.ignite(lt, 0, 2, 0.25) : 1);
      N.halo(540, 760, 520, P.amber, kb);
      king(540, 760, 1.25, { b: kb, tb: 1 });
      const rise = eo(seg(lt, 0, 1.1));
      N.crowd(-40, 1120, 1420 - 80 * rise, 9, lt, { torch: true, s: 0.5, march: 0 });
      N.reflect(WET, () => { king(540, 760, 1.25, { b: kb }); }, 0.22, lt);
      N.sparks(540, 460, lt, 0, 50, 520, 1, P.amberHi); N.sparks(300, 1100, lt, 0.05, 30, 380, 9, P.redHi);
      N.flash(0.4 * clamp(1 - lt / 0.2), P.red);
    } });
  cue(0, 'slam', { gain: 1 }); cue(0, 'thud', { gain: 1 }); cue(0, 'rumble', { gain: 0.7, dur: 2.2 }); cue(0.05, 'sparkle', { gain: 0.5 });

  add({ id: 'a1_city', at: t1, cam: [540, 950], zoom: 0.16,
    note: '"own city kill him?": amber city skyline tubes flicker and turn RED left to right, torches rise; on "kill" the small throne on the wall sputters + red flash',
    draw: (lt) => {
      const tk = tKill - t1; shake(N.shk(lt, tk, 22, 0.45));
      N.wall(lt, { rain: 0.7, wet: WET, glowCol: P.red, gy: 1100, ga: 0.18 });
      const kb = N.buzz(lt, 5, 1.5) * (lt > tk ? (N.short(lt, tk, 4, 0.3) > 0.5 ? 1 : 0.3) : 1);
      king(540, 520, 0.7, { b: kb });
      const red = seg(lt, 0.05, 0.8);
      for (let k = 0; k < 3; k++) { const x0 = k * 360, x1 = x0 + 360, on = red > k / 3;
        N.city(x0, x1, 1300, 380, 1, { col: on ? P.red : P.amber, b: on ? N.ignite(lt, 0.05 + k * 0.25, k + 2) : 0.7, seed: 11 + k }); }
      N.crowd(60, 1020, 1400, 7, lt, { torch: true, s: 0.38, b: seg(lt, 0, 0.3) });
      N.reflect(WET, () => { N.city(0, 1080, 1300, 380, 1, { col: P.red, b: red, seed: 11 }); }, 0.2, lt);
      N.sparks(540, 450, lt, tk, 30, 360, 6, P.amberHi);
      N.flash(0.35 * clamp(1 - Math.abs(lt - tk - 0.04) / 0.14), P.red);
    } });
  cue(t1, 'whoosh', { gain: 0.5, pan: 0.3 }); for (let k = 0; k < 3; k++) cue(t1 + 0.05 + k * 0.25, 'zip', { gain: 0.35, pan: -0.5 + k * 0.5 });
  cue(tKill, 'slam', { gain: 0.7 }); cue(tKill + 0.02, 'thud', { gain: 0.6 });

  // ---------- line 1: 1070 CE, Athirajendra crowned, capital in revolt ----------
  add({ id: 'a2_1070', at: t2, cam: [540, 640], zoom: 0.14,
    note: '"Ten seventy": big neon "1070 CE" sign stutters on letter by letter on the rain-wet wall, ILLUSTRATION tag pops in at once',
    draw: (lt) => {
      const ts = tSev - t2;
      N.wall(lt, { tone: 'blue', rain: 0.9, wet: WET, glowCol: P.amber, gy: 620, ga: 0.12 + 0.1 * seg(lt, 0, ts) });
      N.tag('ILLUSTRATION', 540, 200, P.white, N.ignite(lt, 0.03, 1) * 0.85, 40);
      const b1 = N.ignite(lt, 0.02, 3) * N.buzz(lt, 8);
      N.sign('10', 360, 640, 300, P.amber, { b: b1 });
      N.sign('70', 720, 640, 300, P.amber, { b: N.ignite(lt, ts, 4) * N.buzz(lt, 9) });
      N.sign('CE', 540, 900, 150, P.white, { b: N.ignite(lt, ts + 0.3, 5), flick: 1, t: lt });
      N.tube([[200, 1040], [880, 1040]], eo(seg(lt, ts + 0.2, ts + 0.8)), { col: P.amber, w: 10, b: 0.9, tip: true });
      N.sparks(720, 520, lt, ts, 30, 340, 3, P.amberHi);
    } });
  cue(t2, 'zip', { gain: 0.6 }); cue(t2 + 0.03, 'pop', { gain: 0.4 }); cue(tSev, 'zip', { gain: 0.6, pan: 0.3 }); cue(tSev + 0.3, 'sparkle', { gain: 0.4 });

  add({ id: 'a3_athira', at: t3, cam: [540, 900], zoom: 0.2,
    note: '"Athirajendra": a tall amber standing figure draws itself tube by tube in the rain, wall spill light swelling, camera pushing in',
    draw: (lt) => {
      N.wall(lt, { rain: 0.8, wet: WET, glowCol: P.amber, gy: 900, ga: 0.1 + 0.12 * seg(lt, 0, 1) });
      const p = eio(seg(lt, 0, 1.1)), b = N.ignite(lt, 0, 7, 0.4) * N.buzz(lt, 12);
      N.halo(540, 950, 560, P.amber, p);
      N.figure(540, 1360, 1.6, { col: P.amber, b, p });
      N.reflect(WET, () => N.figure(540, 1360, 1.6, { col: P.amber, b: b * 0.8, p }), 0.25, lt);
    } });
  cue(t3, 'whoosh', { gain: 0.5 }); cue(t3 + 0.02, 'zip', { gain: 0.6 }); cue(t3 + 0.6, 'zip', { gain: 0.3, pan: -0.3 });

  add({ id: 'a4_crowned', at: t4, cam: [540, 520], zoom: 0.22,
    note: '"crowned Chola king": an amber crown drops onto the figure\'s head and IGNITES with a stutter + spark burst; rays bloom on the wall',
    draw: (lt) => {
      const land = 0.28; shake(N.shk(lt, land, 18, 0.4));
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: P.amber, gy: 600, ga: 0.22 });
      const cb = lt < land ? 0.15 : N.ignite(lt, land, 11);
      for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i - 5.5) * 0.24, r0 = 330, r1 = r0 + 260 * eo(seg(lt, land, land + 0.5));
        N.tube([[540 + Math.cos(a) * r0, 560 + Math.sin(a) * r0], [540 + Math.cos(a) * r1, 560 + Math.sin(a) * r1]], 1, { col: P.amber, w: 6, b: 0.6 * cb * N.buzz(lt, i + 20) }); }
      N.figure(540, 1360, 1.6, { col: P.amber, b: N.buzz(lt, 12) });
      const cy = lerp(-120, 1360 - 465 * 1.6, eob(seg(lt, 0, land)));
      N.crown(540, cy, 0.9, { b: cb, w: 14 });
      N.sparks(540, cy, lt, land, 50, 460, 21, P.amberHi);
      N.flash(0.25 * clamp(1 - Math.abs(lt - land - 0.03) / 0.12), P.amber);
      N.reflect(WET, () => N.figure(540, 1360, 1.6, { col: P.amber, b: 0.8 }), 0.22, lt);
    } });
  cue(t4, 'whoosh', { gain: 0.5 }); cue(t4 + 0.28, 'thud', { gain: 0.6 }); cue(t4 + 0.28, 'zip', { gain: 0.6 }); cue(t4 + 0.32, 'sparkle', { gain: 0.6 }); cue(t4 + 0.5, 'bell', { gain: 0.3 });

  add({ id: 'a5_capital', at: t5, cam: [540, 1000], zoom: 0.14,
    note: '"his capital": wide amber neon city with a gate; its tubes buzz and flicker RED, torches spark up along the walls',
    draw: (lt) => {
      N.wall(lt, { rain: 0.7, wet: WET, glowCol: P.amber, gy: 1000, ga: 0.15 });
      const rk = (i) => N.buzz(lt * 1.6, i + 50, 4 + 6 * seg(lt, 0, 1.2)) < 0.9;
      N.city(20, 1060, 1340, 520, 1, { col: rk(1) ? P.red : P.amber, b: 0.9, seed: 4 });
      N.city(80, 1000, 1340, 300, 1, { col: rk(2) ? P.red : P.amber, b: 0.75, seed: 21, w: 7 });
      N.gate(540, 1340, 0.9, { col: rk(3) ? P.red : P.amber, b: 0.95 });
      king(540, 470, 0.45, { b: N.buzz(lt, 31, 2) });
      for (let i = 0; i < 6; i++) { const tx = 120 + i * 168, ty = 900 + (i % 2) * 60, tb = N.ignite(lt, 0.15 + i * 0.12, i);
        if (tb > 0) { N.glow(tx, ty, 90, P.red, 0.5 * tb); N.flame(tx, ty, 1.3, lt + i, tb); } }
      N.reflect(WET, () => { N.city(20, 1060, 1340, 520, 1, { col: P.red, b: 0.6, seed: 4 }); }, 0.2, lt);
    } });
  cue(t5, 'whoosh', { gain: 0.4, pan: -0.3 }); for (let i = 0; i < 6; i += 2) cue(t5 + 0.15 + i * 0.12, 'zip', { gain: 0.3, pan: -0.6 + i * 0.25 }); cue(t5 + 0.2, 'rumble', { gain: 0.5, dur: 1.6 });

  add({ id: 'a6_revolt', at: t6, cam: [540, 1100], zoom: 0.18,
    note: '"in revolt": red torch crowd surges forward from the bottom, city tubes all go RED with a red flash + shake; throne flickers above',
    draw: (lt) => {
      shake(N.shk(lt, 0.08, 30, 0.6));
      N.wall(lt, { tone: 'red', rain: 0.8, wet: WET, glowCol: P.red, gy: 1000, ga: 0.25 });
      N.city(20, 1060, 1100, 400, 1, { col: P.red, b: N.buzz(lt, 5, 3), seed: 4 });
      king(540, 470, 0.55, { b: N.buzz(lt, 31, 4) });
      const s = lerp(0.42, 0.55, eo(seg(lt, 0, 1)));
      N.crowd(-60, 520, 1400, 4, lt, { torch: true, s: s * 0.85, march: 60 });
      N.crowd(560, 1140, 1400, 4, lt, { torch: true, s: s * 0.85, march: -60 });
      N.crowd(80, 1000, 1470 - 40 * eo(seg(lt, 0, 0.8)), 6, lt + 0.3, { torch: true, s });
      N.sparks(260, 980, lt, 0.08, 30, 360, 15, P.redHi); N.sparks(820, 1000, lt, 0.12, 30, 360, 16, P.redHi);
      N.flash(0.45 * clamp(1 - Math.abs(lt - 0.1) / 0.16), P.red);
    } });
  cue(tRev, 'slam', { gain: 0.8 }); cue(tRev, 'thud', { gain: 0.7 }); cue(tRev, 'rumble', { gain: 0.8, dur: 1.5 });

  // ---------- line 2: Vikramaditya the brother-in-law marches in, crushes the unrest, seats him ----------
  add({ id: 'a7_inlaw', at: t7, cam: [540, 860], zoom: 0.1,
    note: '"His brother-in-law, the Chalukya prince": amber crowned figure (right) and cyan helmed figure (left) ignite; a white family-line wire with nodes links them',
    draw: (lt) => {
      const tb = tBil - t7;
      N.wall(lt, { tone: 'blue', rain: 0.6, wet: WET, glowCol: P.cyan, gx: 280, gy: 900, ga: 0.14 });
      N.halo(800, 1000, 380, P.amber, 0.7);
      N.figure(800, 1330, 1.0, { col: P.amber, hat: 'crown', b: N.buzz(lt, 4) });
      const cb = N.ignite(lt, tb - 0.1, 6) * N.buzz(lt, 7);
      N.halo(280, 1000, 380, P.cyan, cb);
      N.figure(280, 1330, 1.0, { col: P.cyan, hat: 'helm', spear: true, b: cb, p: eo(seg(lt, tb - 0.1, tb + 0.6)) });
      // family link arcing between the two heads, nodes on top
      const lp = eio(seg(lt, tb + 0.2, tb + 1.0)), arc = [];
      for (let i = 0; i <= 30; i++) { const u = i / 30; arc.push([lerp(280, 800, u), 760 - Math.sin(u * Math.PI) * 260]); }
      N.tube(arc, lp, { col: P.white, w: 7, b: 0.85, tip: true });
      if (lp > 0.05) N.tube(N.circPts(280, 760, 38, 30), 1, { col: P.cyan, w: 10, b: cb });
      if (lp > 0.95) N.tube(N.circPts(800, 760, 38, 30), N.ignite(lt, tb + 1.0, 2), { col: P.amber, w: 10, b: 1 });
      N.lineage([[540, 330, P.white], [540, 470, P.amber]], seg(lt, tb + 0.6, tb + 1.4), { linkCol: P.white });
      N.reflect(WET, () => { N.figure(800, 1330, 1.0, { col: P.amber, b: 0.7 }); N.figure(280, 1330, 1.0, { col: P.cyan, b: cb * 0.7 }); }, 0.22, lt);
    } });
  cue(t7, 'whoosh', { gain: 0.4 }); cue(tBil - 0.1, 'zip', { gain: 0.6, pan: -0.4 }); cue(tBil + 0.2, 'sparkle', { gain: 0.4 }); cue(tBil + 1.0, 'zip', { gain: 0.4, pan: 0.4 });

  add({ id: 'a8_vikram', at: t8, cam: [540, 820], zoom: 0.2,
    note: '"Vikramaditya": big cyan prince with helm and spear snaps on with a stutter, spear tip flares; cyan spill on the wet bricks',
    draw: (lt) => {
      shake(N.shk(lt, 0.05, 14, 0.35));
      N.wall(lt, { tone: 'blue', rain: 0.8, wet: WET, glowCol: P.cyan, gy: 900, ga: 0.2 });
      const b = N.ignite(lt, 0.02, 9) * N.buzz(lt, 19);
      N.halo(500, 950, 600, P.cyan, b);
      N.figure(480, 1360, 1.55, { col: P.cyan, hat: 'helm', spear: true, arm: 0.2 * Math.sin(lt * 3), b, p: eo(seg(lt, 0, 0.5)) });
      N.glow(480 + 150 * 1.55, 1360 - 600 * 1.55, 160, P.cyanHi, 0.6 * b * (0.7 + 0.3 * Math.sin(lt * 12)));
      N.reflect(WET, () => N.figure(480, 1360, 1.55, { col: P.cyan, hat: 'helm', spear: true, b: b * 0.8 }), 0.25, lt);
    } });
  cue(t8, 'slam', { gain: 0.5 }); cue(t8 + 0.02, 'zip', { gain: 0.7 }); cue(t8 + 0.3, 'sparkle', { gain: 0.4 });

  add({ id: 'a9_march', at: t9, cam: [540, 900], zoom: 0.16,
    note: '"marched in": dashed cyan route arrow sweeps from the left edge into an amber city gate; a cyan column of soldiers marches along it',
    draw: (lt, d) => {
      N.wall(lt, { rain: 0.7, wet: WET, glowCol: P.cyan, gx: 300, gy: 1000, ga: 0.12 });
      N.city(560, 1080, 1250, 360, 1, { col: P.red, b: N.buzz(lt, 3, 3), seed: 8 });
      N.gate(820, 1250, 0.7, { col: P.amber, b: 0.9 });
      N.route([40, 600], [760, 980], eo(seg(lt, 0, 0.7)), { col: P.cyan, bend: -120, w: 12 });
      N.crowd(-520, 0, 1330, 6, lt, { col: P.cyan, s: 0.38, march: 520 });
      N.reflect(WET, () => N.city(560, 1080, 1250, 360, 1, { col: P.red, b: 0.6, seed: 8 }), 0.2, lt);
    } });
  cue(t9, 'whoosh', { gain: 0.6, pan: -0.6 }); cue(t9 + 0.05, 'drum', { gain: 0.5 }); cue(t9 + 0.4, 'drum', { gain: 0.5 }); cue(t9 + 0.7, 'zip', { gain: 0.4, pan: 0.4 });

  add({ id: 'a10_crush', at: t10, cam: [540, 1000], zoom: 0.14,
    note: '"crushed the unrest": cyan prince swings in from the left, the red torch rioters SHORT OUT one by one (sparks, dead grey glass) and scatter',
    draw: (lt) => {
      shake(N.shk(lt, 0.1, 22, 0.5));
      N.wall(lt, { rain: 0.7, wet: WET, glowCol: P.cyan, gx: 250, gy: 1000, ga: 0.16 });
      const cx = lerp(-100, 220, eo(seg(lt, 0, 0.35)));
      N.figure(cx, 1360, 1.15, { col: P.cyan, hat: 'helm', spear: true, arm: 0.6, b: N.buzz(lt, 3) });
      for (let i = 0; i < 5; i++) {
        const t0 = 0.12 + i * 0.2, x0 = 470 + i * 130, fled = eo(seg(lt, t0 + 0.2, t0 + 1.2));
        const b = N.short(lt, t0, i + 3), x = x0 + fled * (180 + i * 60), y = 1360 - Math.abs(Math.sin(lt * 7 + i)) * 10 * (1 - fled);
        N.figure(x, y, 0.5, { col: b > 0.5 ? P.red : P.dead, b: b > 0.5 ? 1 : 0, arm: 0.9 * (1 - fled) });
        if (lt < t0 + 0.2) N.flame(x + 87, y - 260, 0.7, lt + i, b);
        N.sparks(x + 30, y - 200, lt, t0, 24, 300, i * 9, P.redHi);
      }
      N.reflect(WET, () => N.figure(cx, 1360, 1.15, { col: P.cyan, hat: 'helm', spear: true, b: 0.8 }), 0.22, lt);
    } });
  cue(t10, 'slam', { gain: 0.8 }); for (let i = 0; i < 5; i++) cue(t10 + 0.12 + i * 0.2, 'thud', { gain: 0.45, pan: -0.2 + i * 0.15 });
  cue(t10 + 0.15, 'sparkle', { gain: 0.4 });

  add({ id: 'a11_seat', at: t11, cam: [540, 820], zoom: 0.16,
    note: '"set him on the throne": cyan prince leads the amber crowned figure in; on "throne" the amber figure snaps into the seated pose, the throne tube ignites full',
    draw: (lt) => {
      const tt = tThr - t11; shake(N.shk(lt, tt, 16, 0.4));
      N.wall(lt, { rain: 0.6, wet: WET, glowCol: P.amber, gy: 800, ga: 0.12 + 0.12 * seg(lt, tt, tt + 0.3) });
      const tb = lt < tt ? 0.45 * N.buzz(lt, 4, 3) : N.ignite(lt, tt, 5);
      N.halo(620, 830, 460, P.amber, tb);
      N.throne(620, 820, 1.1, { b: tb });
      const k = eio(seg(lt, 0, tt));
      if (lt < tt) N.figure(lerp(300, 560, k), 1350 - 40 * k, 0.95, { col: P.amber, hat: 'crown', b: N.buzz(lt, 9) });
      else N.figure(620, 853, 0.86, { sit: true, col: P.amber, hat: 'crown', b: N.ignite(lt, tt, 8) });
      N.figure(lerp(80, 220, k), 1360, 1.0, { col: P.cyan, hat: 'helm', spear: true, arm: lt < tt ? 0.4 * k : 0.6, b: N.buzz(lt, 13) });
      N.sparks(620, 520, lt, tt, 40, 420, 33, P.amberHi);
      N.reflect(WET, () => N.throne(620, 820, 1.1, { b: tb }), 0.22, lt);
    } });
  cue(t11, 'whoosh', { gain: 0.4 }); cue(tThr, 'thud', { gain: 0.6 }); cue(tThr, 'zip', { gain: 0.6 }); cue(tThr + 0.05, 'sparkle', { gain: 0.5 });

  // ---------- line 3: Bilhana's version, the prince's own court poet ----------
  add({ id: 'a12_version', at: t12, cam: [540, 820], zoom: 0.14,
    note: '"That is the version": a neon scroll outline with abstract wavy lines draws itself under a spotlight; BILHANA\'S VERSION tag; the seated king dims behind',
    draw: (lt) => {
      N.wall(lt, { tone: 'blue', rain: 0.5, wet: WET });
      king(900, 1000, 0.42, { b: 0.35 * N.buzz(lt, 2, 3) });
      spot(440, 820, eo(seg(lt, 0, 0.4)) * N.buzz(lt, 70, 1.5));
      scroll(440, 880, 480, 560, N.ignite(lt, 0.05, 3) * N.buzz(lt, 71, 2), lt, eo(seg(lt, 0.05, 0.9)));
      N.tag("BILHANA'S VERSION", 540, 300, P.white, N.ignite(lt, 0.3, 4), 50);
    } });
  cue(t12, 'zip', { gain: 0.5 }); cue(t12 + 0.1, 'chisel', { gain: 0.3 }); cue(t12 + 0.35, 'zip', { gain: 0.4, pan: 0.2 });

  const t14 = tCourt - 0.12;
  const poet = (lt0) => (lt) => {
      lt += lt0; const tc = tCourt - t13;
      N.wall(lt, { tone: 'blue', rain: 0.6, wet: WET, glowCol: P.cyan, gx: 240, gy: 1000, ga: 0.12 });
      N.tag("BILHANA'S VERSION", 540, 210, P.white, 0.8 * N.buzz(lt, 1), 40);
      N.figure(190, 1360, 1.15, { col: P.cyan, hat: 'helm', spear: true, b: N.buzz(lt, 14) });
      spot(760, 860, N.buzz(lt, 72, 2.5));
      // questioning flicker: periodic dips and a slight tilt wobble
      const q = Math.sin(lt * 5) > 0.85 ? 0.3 : N.buzz(lt, 73, 3), tilt = Math.sin(lt * 2.4) * 0.04;
      ctx.save(); ctx.translate(760, 930); ctx.rotate(tilt); ctx.translate(-760, -930);
      scroll(760, 930, 380, 480, q, lt, 1); ctx.restore();
      N.tag('COURT POET', 760, 1290, P.cyan, N.ignite(lt, tc - 0.05, 6), 46);
      N.reflect(WET, () => N.figure(190, 1360, 1.15, { col: P.cyan, hat: 'helm', spear: true, b: 0.7 }), 0.2, lt);
    };
  add({ id: 'a13_poet', at: t13, cam: [420, 900], zoom: 0.1,
    note: '"Bilhana, the prince\'s own": cyan prince left, the neon wavy-line scroll beside him in a flickering spotlight, tilting doubtfully',
    draw: poet(0) });
  add({ id: 'a14_court', at: t14, cam: [720, 1050], zoom: 0.12,
    note: '"court poet": push in on the scroll as the cyan COURT POET tag ignites under it; the scroll keeps dipping and wobbling (questioning flicker)',
    draw: poet(t14 - t13) });
  cue(Wd('bilhana', 3), 'tock', { gain: 0.4 }); cue(tCourt - 0.05, 'zip', { gain: 0.5, pan: 0.3 }); cue(tCourt + 0.6, 'heartbeat', { gain: 0.35 });
}
