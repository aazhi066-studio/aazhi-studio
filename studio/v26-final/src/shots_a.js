// v26 worker A: script lines 0-3 (hook: red loop slams around the yellow emperor; c.1231 the Chola empire cracking; Rajaraja III on the throne;
// Kopperunchinga the Kadava vassal rises with a red army; Tellaru: the yellow army gusted away, emperor, queen and ministers caught in the red loop). Shots run 0 .. L(4).
import * as K from './kolam.js';
import { L, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = K.PAL;

// ---------- local helpers ----------
// floor with a shake offset already applied (a solid under-fill so shaken edges never show black)
function bg(lt, o = {}, sh = [0, 0]) { ctx.fillStyle = P.floorDk; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.translate(sh[0], sh[1]); K.floor(lt, o); }
// powder grains bursting out from (x, y) after a hit at t0
function burst(x, y, lt, t0, col, n = 70, R = 520, seed = 0) {
  const u = lt - t0; if (u < 0 || u > 1) return; const k = eo(clamp(u / 0.6)), a = 1 - clamp(u / 1);
  for (let i = 0; i < n; i++) { const ang = rnd(i + seed) * TAU, d = R * k * (0.35 + 0.65 * rnd(i + seed + 11)), s = 3 + rnd(i + seed + 5) * 5;
    ctx.fillStyle = rgba(col, a * (0.4 + 0.6 * rnd(i + seed + 3))); ctx.fillRect(x + Math.cos(ang) * d, y + Math.sin(ang) * d, s, s); }
}
// figure with a bow (0 upright .. 1 kneeling / bowed low), pivoting at the feet
function figPose(x, y, s, o, bow = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(bow * 0.32); ctx.scale(1, 1 - bow * 0.42); K.figure(0, 0, s, o); ctx.restore(); }
// crown that splits in two halves (sp 0..1) along a jagged centre line
function crownSplit(x, y, s, p, sp, col = P.yellow) {
  if (sp <= 0) { K.crown(x, y, s, p, col); return; }
  for (const side of [-1, 1]) { ctx.save(); ctx.beginPath();
    const jag = [[x, y - 200 * s], [x + 18 * s, y - 100 * s], [x - 14 * s, y - 20 * s], [x + 12 * s, y + 50 * s], [x, y + 120 * s]];
    ctx.moveTo(x + side * 400 * s, y - 220 * s); jag.forEach((q) => ctx.lineTo(q[0], q[1])); ctx.lineTo(x + side * 400 * s, y + 140 * s); ctx.closePath(); ctx.clip();
    ctx.translate(side * 70 * s * eo(sp), 30 * s * eo(sp)); ctx.translate(x, y + 50 * s); ctx.rotate(side * 0.16 * eo(sp)); ctx.translate(-x, -y - 50 * s);
    K.crown(x, y, s, p, col); ctx.restore(); }
}
// dais / throne kolam: stacked powder steps, drawn with p
function dais(x, y, p, lt) {
  for (let i = 0; i < 3; i++) { const w = 560 - i * 140, h = 70, yy = y - (i + 1) * h; K.stroke(K.rectPts(x - w / 2, yy, w, h, 18), clamp(p * 3 - i), { w: 9, seed: 50 + i, col: i === 2 ? P.yellowHi : P.powder, tip: true }); }
  K.stroke(K.loopPts(x, y - 330, 300, 12, 0.07, 200, lt * 0.15), clamp(p * 1.5 - 0.3), { w: 7, col: P.yellow, seed: 57, a: 0.7 });
}

export function buildA(add, cue) {
  const t1 = Wd('emperor', 0) - 0.05, tPris = Wd('prisoner', 0), t2 = L(1) - 0.05, t3 = Wd('one', 1) - 0.05, tCr = Wd('cracking', 1), t4 = tCr - 0.1,
    t5 = Wd('rajaraja', 1) - 0.05, t6 = Wd('throne', 1) - 0.1, t7 = L(2) - 0.05, t8 = Wd('once', 2) - 0.05, t9 = Wd('raised', 2) - 0.05,
    t10 = L(3) - 0.05, tBeat = Wd('beaten', 3), t11 = tBeat - 0.05, t12 = Wd('queen', 3) - 0.15, tTake = Wd('taken', 3);

  // ---------- line 0: HOOK ----------
  add({ id: 'a0_slam', at: 0, cam: [540, 880], zoom: 0.14,
    note: 'HOOK frame 0: crowned yellow figure on the floor, a RED powder loop is already racing round him and SLAMS shut at 0.1 s: red flash, grain burst, floor crack, shake',
    draw: (lt) => { bg(lt, { lamp: 0.3, lx: 760, ly: 700 }, K.shk(lt, 0.08, 34, 0.6));
      K.dots(540, 880, 7, 8, 110, 1, { r: 5 }); K.motes(lt, 40, 3, 0.6);
      K.crack(540, 1250, 520, 0.35, seg(lt, 0.1, 0.5), 3); K.crack(520, 520, 420, -2.6, seg(lt, 0.14, 0.55), 8);
      K.glow(540, 900, 420, P.yellow, 0.25); K.figure(540, 1130, 1.25, { hat: 'crown', p: 1 });
      K.cage(540, 900, 350 - 18 * eo(seg(lt, 0.1, 0.9)), clamp(0.45 + lt / 0.11), { w: 16, rot: 0.6 });
      burst(540, 900, lt, 0.1, P.red, 90, 600, 1); burst(540, 900, lt, 0.1, P.powder, 50, 460, 40);
      K.flash(0.55 * clamp(1 - Math.abs(lt - 0.12) / 0.14), P.redHi); K.flash(0.5 * clamp(1 - lt / 0.08), P.white); } });
  cue(0, 'slam', { gain: 0.9 }); cue(0, 'thud', { gain: 0.9 }); cue(0.1, 'rumble', { gain: 0.6, dur: 1.2 }); cue(0.12, 'zip', { gain: 0.4 });

  add({ id: 'a1_dot', at: t1, cam: [540, 820], zoom: 0.22,
    note: '"emperor prisoner?": the motif close up: ONE YELLOW DOT on a white dot grid; a second red loop slams tight around it on "prisoner" (flash + shake)',
    draw: (lt) => { const th = tPris - t1; bg(lt, { lamp: 0.26, lx: 300, ly: 600 }, K.shk(lt, th + 0.05, 26, 0.5));
      K.dots(540, 820, 7, 9, 130, 1, { r: 8 }); K.motes(lt, 30, 9, 0.5);
      K.glow(540, 820, 260, P.yellowHi, 0.35 + 0.1 * Math.sin(lt * 9)); K.dot(540, 820, 46 * (0.8 + 0.2 * K.pop(lt, 0, 0.3)), P.yellow);
      K.cage(540, 820, 300, 1, { w: 14, rot: lt * 0.3 });
      K.cage(540, 820, lerp(260, 140, eob(seg(lt, th, th + 0.18))), seg(lt, th - 0.12, th + 0.05), { w: 16, k: 6, d: 0.18, rot: -0.4 });
      burst(540, 820, lt, th + 0.05, P.red, 70, 520, 7);
      K.flash(0.5 * clamp(1 - Math.abs(lt - th - 0.06) / 0.12), P.redHi); } });
  cue(t1, 'whoosh', { gain: 0.6, pan: -0.3 }); cue(t1 + 0.05, 'pop', { gain: 0.5 }); cue(tPris + 0.05, 'slam', { gain: 0.8 }); cue(tPris + 0.07, 'thud', { gain: 0.6 });

  // ---------- line 1: c.1231, the empire cracking, Rajaraja III ----------
  add({ id: 'a2_1231', at: t2, cam: [540, 760], zoom: 0.12,
    note: '"Around 1231": white pulli grid pops in fast, a yellow kolam loop draws through it, "c.1231" pours in as powder lettering; ILLUSTRATION tag',
    draw: (lt) => { const tw = Wd('twelve', 1) - t2; bg(lt, { lamp: 0.24, lx: 860, ly: 500 });
      K.dots(540, 900, 7, 9, 120, seg(lt, 0, 0.7), { r: 7 }); K.motes(lt, 35, 13, 0.5);
      K.stroke(K.loopPts(540, 900, 380, 8, 0.22, 240, lt * 0.2), seg(lt, 0.05, 1.0), { col: P.yellow, w: 11, seed: 3, tip: true });
      K.pour(540, 760, lt, clamp(1 - seg(lt, 0.9, 1.2)), P.powder);
      K.title('c.1231', 540, 880, seg(lt, tw, tw + 0.35), { size: 210, col: P.powder });
      K.tag('ILLUSTRATION', 540, 200, K.pop(lt, 0.1, 0.3)); } });
  cue(t2, 'whoosh', { gain: 0.6, pan: 0.3 }); for (let i = 0; i < 4; i++) cue(t2 + 0.05 + i * 0.15, 'pop', { gain: 0.4, pan: -0.4 + i * 0.25 });
  cue(Wd('twelve', 1), 'chisel', { gain: 0.5 });

  add({ id: 'a3_empire', at: t3, cam: [540, 820], zoom: 0.16,
    note: '"the Chola empire": a big yellow crown blooms over a yellow dot-grid kolam (the empire), rings of loops drawing around it',
    draw: (lt) => { bg(lt, { lamp: 0.3, lx: 540, ly: 760 });
      K.dots(540, 900, 7, 9, 115, 1, { r: 9, col: (i, j) => ((i + j) % 2 ? P.yellow : P.powderDk) });
      K.stroke(K.loopPts(540, 820, 330, 10, 0.12, 240, -lt * 0.25), seg(lt, 0, 0.9), { col: P.yellowHi, w: 9, seed: 9, tip: true });
      K.stroke(K.loopPts(540, 820, 470, 14, 0.05, 260, lt * 0.15), seg(lt, 0.2, 1.3), { col: P.powder, w: 7, seed: 10, tip: true });
      K.glow(540, 780, 360, P.yellow, 0.3); K.crown(540, 800, 1.9 + 0.1 * eo(seg(lt, 0, 1.6)), seg(lt, 0.05, 0.75));
      K.motes(lt, 40, 21, 0.6); } });
  cue(t3, 'whoosh', { gain: 0.5, pan: -0.3 }); cue(t3 + 0.3, 'swell', { gain: 0.5, dur: 1.2 });

  add({ id: 'a4_crack', at: t4, cam: [540, 820], zoom: 0.1,
    note: '"was cracking": a floor crack tears through the yellow kolam, the crown splits in two halves, grains spill, shake + rumble',
    draw: (lt) => { bg(lt, { lamp: 0.26, lx: 540, ly: 760 }, K.shk(lt, 0.1, 24, 0.7));
      K.dots(540, 900, 7, 9, 115, 1, { r: 9, col: (i, j) => ((i + j) % 2 ? P.yellow : P.powderDk) });
      K.stroke(K.loopPts(540, 820, 330, 10, 0.12, 240, -0.9), 1, { col: P.yellowHi, w: 9, seed: 9, a: 0.8 });
      K.crack(540, 120, 1300, 1.62, seg(lt, 0.08, 0.5), 5); K.crack(540, 900, 520, 0.5, seg(lt, 0.25, 0.7), 11); K.crack(540, 1000, 420, 2.6, seg(lt, 0.3, 0.75), 17);
      crownSplit(540, 800, 2, 1, seg(lt, 0.12, 0.7)); burst(540, 820, lt, 0.12, P.yellow, 60, 420, 33);
      K.gust(seg(lt, 0.2, 0.9), { y: 500, y1: 1300, n: 140, col: P.yellow }); K.flash(0.3 * clamp(1 - Math.abs(lt - 0.12) / 0.1)); } });
  cue(tCr, 'rumble', { gain: 0.8, dur: 1.2 }); cue(tCr + 0.02, 'thud', { gain: 0.7 }); cue(tCr + 0.1, 'chisel', { gain: 0.4 });

  add({ id: 'a5_rajaraja', at: t5, cam: [540, 900], zoom: 0.16,
    note: '"Rajaraja the Third": the crowned yellow powder figure draws itself, lamp glow, "RAJARAJA III" lettering; faint cracks still on the floor',
    draw: (lt) => { bg(lt, { lamp: 0.32, lx: 820, ly: 820 });
      K.crack(80, 1380, 600, -0.4, 1, 23); K.dots(540, 820, 9, 3, 110, 1, { r: 5 }); K.motes(lt, 35, 25, 0.6);
      K.glow(540, 1000, 380, P.yellow, 0.28); K.figure(540, 1360, 1.6, { hat: 'crown', p: seg(lt, 0, 1.0) });
      K.pour(540, 820 - 0, lt, clamp(1 - seg(lt, 0.7, 1.0)) * 0.6, P.yellow);
      K.title('RAJARAJA III', 540, 330, seg(lt, 0.25, 0.7), { size: 110, col: P.yellowHi }); } });
  cue(t5, 'whoosh', { gain: 0.6, pan: 0.4 }); cue(t5 + 0.3, 'tock', { gain: 0.5 });

  add({ id: 'a6_throne', at: t6, cam: [540, 980], zoom: 0.1,
    note: '"on the throne": pull back, the yellow figure stands on a stepped powder dais kolam with a ring of yellow loops behind, crown dots',
    draw: (lt) => { bg(lt, { lamp: 0.3, lx: 540, ly: 900 });
      K.dots(540, 700, 11, 3, 90, 1, { r: 5 }); K.motes(lt, 40, 31, 0.6);
      dais(540, 1400, seg(lt, 0, 0.7), lt); K.glow(540, 1000, 330, P.yellow, 0.3);
      K.figure(540, 1190, 1.15, { hat: 'crown' }); K.crown(540, 520, 0.8, seg(lt, 0.2, 0.8));
      for (let i = 0; i < 6; i++) K.dot(540 + Math.cos(i / 6 * TAU + lt) * 250, 900 + Math.sin(i / 6 * TAU + lt) * 250 * 0.4, 9 * K.pop(lt, 0.3 + i * 0.06), P.yellowHi); } });
  cue(t6, 'whoosh', { gain: 0.5, pan: -0.4 }); cue(t6 + 0.1, 'bell', { gain: 0.4 });

  // ---------- line 2: Kopperunchinga, the Kadava chief, once a Chola vassal, raises an army ----------
  add({ id: 'a7_chief', at: t7, cam: [600, 900], zoom: 0.14,
    note: '"Kopperunchinga, a Kadava chief": a RED turbaned powder figure with a spear draws himself in the lamp light; name lettering, KADAVA CHIEF tag; red dots ring',
    draw: (lt) => { const tk = Wd('kadava', 2) - t7; bg(lt, { lamp: 0.3, lx: 300, ly: 800 });
      K.dots(540, 900, 7, 9, 120, 1, { r: 5 }); K.motes(lt, 35, 41, 0.6);
      K.glow(600, 1000, 380, P.red, 0.3); K.figure(600, 1330, 1.45, { col: P.red, hat: 'turban', spear: 1, p: seg(lt, 0.05, 1.1) });
      K.stroke(K.loopPts(600, 1000, 380, 9, 0.1, 240, lt * 0.2), seg(lt, 0.3, 1.6), { col: P.red, w: 8, seed: 44, tip: true, a: 0.85 });
      K.title('KOPPERUNCHINGA', 540, 300, seg(lt, 0.05, 0.5), { size: 92, col: P.redHi, font: 'sans', ls: 4 });
      K.tag('KADAVA CHIEF', 540, 430, K.pop(lt, tk, 0.3), P.redHi); } });
  cue(t7, 'whoosh', { gain: 0.6, pan: 0.4 }); cue(t7 + 0.1, 'drum', { gain: 0.6 }); cue(Wd('kadava', 2), 'pop', { gain: 0.5 });

  add({ id: 'a8_vassal', at: t8, cam: [540, 760], zoom: 0.16,
    note: '"once a Chola vassal": a huge yellow crown looms at the top; the red chief, small and bowed low beneath it, inside a yellow dot ring',
    draw: (lt) => { bg(lt, { lamp: 0.26, lx: 540, ly: 500 });
      K.dots(540, 1000, 7, 7, 120, 1, { r: 5 }); K.motes(lt, 30, 51, 0.5);
      K.glow(540, 480, 420, P.yellow, 0.35); K.crown(540, 500 + Math.sin(lt * 2) * 6, 2.3, 1);
      K.stroke([[540, 620], [540, 1000]], seg(lt, 0.1, 0.6), { col: P.yellow, w: 6, seed: 60, a: 0.6 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + lt * 0.3; K.dot(540 + Math.cos(a) * 230, 1220 + Math.sin(a) * 120, 9 * K.pop(lt, 0.05 + i * 0.04), P.yellow); }
      figPose(540, 1300, 0.8, { col: P.red, hat: 'turban', spear: 1 }, 1 - 0.08 * Math.sin(lt * 3)); } });
  cue(t8, 'whoosh', { gain: 0.5, pan: -0.3 }); cue(t8 + 0.2, 'heartbeat', { gain: 0.5 });

  add({ id: 'a9_rise', at: t9, cam: [540, 980], zoom: 0.12,
    note: '"raised an army against him": the red chief stands up tall, the yellow crown above is smudged out, a red army of dot-soldiers spreads across the floor',
    draw: (lt, d) => { const ta = Wd('army', 2) - t9; bg(lt, { lamp: 0.28, lx: 760, ly: 900 }, K.shk(lt, ta, 14, 0.4));
      K.dots(540, 900, 7, 9, 120, 1, { r: 4 }); K.motes(lt, 30, 61, 0.5);
      K.crown(540, 360, 1.4 * (1 - 0.3 * seg(lt, 0.2, 1)), 1); K.smudge(540, 360, 260, seg(lt, 0.25, 1.1), -0.3);
      const up = eio(seg(lt, 0, 0.55));
      K.army(120 - 120 * eo(seg(lt, ta, d)), 1080, 9, 4, 100, seg(lt, ta - 0.1, ta + 0.9), P.red, lt * 30, 3);
      K.glow(540, 980, 360, P.red, 0.25 + 0.15 * up); figPose(540, 1000, lerp(0.8, 1.3, up), { col: P.red, hat: 'turban', spear: 1 }, 1 - up);
      K.flash(0.35 * clamp(1 - Math.abs(lt - ta) / 0.12), P.redHi); } });
  cue(t9, 'whoosh', { gain: 0.6, pan: 0.3 }); cue(Wd('army', 2), 'thud', { gain: 0.7 }); cue(Wd('army', 2) + 0.05, 'drum', { gain: 0.6 });
  for (let i = 0; i < 4; i++) cue(Wd('army', 2) + 0.15 + i * 0.2, 'pop', { gain: 0.35, pan: -0.6 + i * 0.35 });

  // ---------- line 3: Tellaru, records say, beaten, captured ----------
  add({ id: 'a10_tellaru', at: t10, cam: [540, 860], zoom: 0.14,
    note: '"At Tellaru, records say": two dot armies on the floor, yellow from the top-left, red from the bottom-right, dashed routes clash at the centre; TELLARU lettering, RECORDS SAY tag',
    draw: (lt) => { const tr = Wd('records', 3) - t10; bg(lt, { tone: 'night', lamp: 0.26, lx: 540, ly: 860 });
      K.dots(540, 880, 7, 9, 120, 1, { r: 4 }); K.motes(lt, 30, 71, 0.5);
      K.route([[150, 560], [380, 760], [500, 880]], seg(lt, 0.1, 1.0), P.yellow, 9); K.route([[930, 1240], [700, 1020], [580, 900]], seg(lt, 0.2, 1.1), P.red, 9);
      K.army(90 + 60 * seg(lt, 0, 2.4), 560, 5, 4, 82, seg(lt, 0, 0.7), P.yellow, lt * 20, 7);
      K.army(620 - 60 * seg(lt, 0, 2.4), 1080, 5, 4, 82, seg(lt, 0.1, 0.8), P.red, -lt * 20, 9);
      K.glow(540, 890, 200, P.lamp, 0.25 + 0.15 * Math.sin(lt * 8));
      K.title('TELLARU', 540, 300, seg(lt, 0.15, 0.6), { size: 140 });
      K.tag('RECORDS SAY', 540, 1390, K.pop(lt, tr, 0.3)); } });
  cue(t10, 'whoosh', { gain: 0.6, pan: -0.4 }); cue(t10 + 0.2, 'drum', { gain: 0.5 }); cue(Wd('records', 3), 'tock', { gain: 0.5 });

  add({ id: 'a11_beaten', at: t11, cam: [520, 860], zoom: 0.1,
    note: '"was beaten": red flash, a gust blows the yellow army away into streaks, footstep smudges wipe the yellow dots, floor cracks',
    draw: (lt) => { bg(lt, { tone: 'night', lamp: 0.24, lx: 540, ly: 860 }, K.shk(lt, 0.05, 28, 0.6));
      K.dots(540, 880, 7, 9, 120, 1, { r: 4 });
      const g = seg(lt, 0.05, 0.9); ctx.save(); ctx.globalAlpha = 1 - 0.85 * g;
      K.army(170 + 500 * eo(g), 640, 5, 4, 82, 1, P.yellow, 0, 7); ctx.restore();
      K.army(560, 1020, 5, 4, 82, 1, P.red, lt * 25, 9);
      K.smudge(360, 720, 210, seg(lt, 0.1, 0.6), -0.5); K.smudge(640, 620, 170, seg(lt, 0.3, 0.8), 0.3);
      K.gust(seg(lt, 0, 1.1), { y: 450, y1: 950, n: 220, col: P.yellow }); K.gust(seg(lt, 0.15, 1.2), { y: 500, y1: 1200, n: 120 });
      K.crack(300, 1250, 560, -0.3, seg(lt, 0.05, 0.5), 29);
      K.flash(0.6 * clamp(1 - lt / 0.16), P.red); } });
  cue(tBeat, 'slam', { gain: 0.8 }); cue(tBeat + 0.02, 'thud', { gain: 0.7 }); cue(tBeat + 0.1, 'whoosh', { gain: 0.7, pan: 0.6, dur: 0.8 });

  add({ id: 'a12_taken', at: t12, cam: [540, 1020], zoom: 0.16,
    note: '"He, his queen and his ministers were taken": crowned emperor, veiled queen and two small powderDk ministers stand in a row; on "taken" the red loop closes round all of them',
    draw: (lt) => { const tq = Wd('queen', 3) - t12, tm = Wd('ministers', 3) - t12, tt = tTake - t12;
      bg(lt, { lamp: 0.28, lx: 760, ly: 900 }, K.shk(lt, tt + 0.12, 18, 0.45));
      K.dots(540, 1000, 9, 7, 110, 1, { r: 4 }); K.motes(lt, 35, 81, 0.5);
      K.glow(540, 1060, 380, P.yellow, 0.22);
      K.figure(500, 1210, 1.0, { hat: 'crown' });
      K.figure(340, 1220, 0.85, { hat: 'veil', p: seg(lt, tq - 0.05, tq + 0.6) });
      K.figure(650, 1230, 0.58, { col: P.powderDk, p: seg(lt, tm - 0.05, tm + 0.5) }); K.figure(750, 1230, 0.58, { col: P.powderDk, p: seg(lt, tm + 0.1, tm + 0.65) });
      K.cage(540, 1030, lerp(420, 375, eob(seg(lt, tt + 0.05, tt + 0.4))), seg(lt, tt - 0.35, tt + 0.12), { w: 15, rot: 0.3 });
      burst(540, 1030, lt, tt + 0.12, P.red, 70, 560, 91);
      K.flash(0.5 * clamp(1 - Math.abs(lt - tt - 0.12) / 0.14), P.redHi); } });
  cue(t12, 'whoosh', { gain: 0.5, pan: -0.3 }); cue(Wd('queen', 3), 'pop', { gain: 0.4 }); cue(Wd('ministers', 3), 'pop', { gain: 0.4, pan: 0.3 });
  cue(tTake - 0.3, 'zip', { gain: 0.5 }); cue(tTake + 0.12, 'slam', { gain: 0.85 }); cue(tTake + 0.14, 'thud', { gain: 0.6 });
}
