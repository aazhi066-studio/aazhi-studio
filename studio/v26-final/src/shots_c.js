// v26 worker C: script lines 8-10 (once or twice? / the start of the end / traitor or breaking free + "watch the dots").
import { ctx, W, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { rgba } from './art.js';
import * as K from './kolam.js';
const P = K.PAL;

// ---------- local helpers ----------
// clip drawing to a vertical band (x0..x1)
function band(x0, x1, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x0, -300, x1 - x0, 2600); ctx.clip(); fn(); ctx.restore(); }
// tag that slams down (big -> normal, shake) at local time t0
function slamTag(text, x, y, lt, t0, col) {
  if (lt < t0) return; const k = eo(clamp((lt - t0) / 0.2)), [sx, sy] = K.shk(lt, t0, 10, 0.35);
  ctx.save(); ctx.translate(x + sx, y + sy); ctx.scale(lerp(1.9, 1, k), lerp(1.9, 1, k)); ctx.globalAlpha *= clamp(k * 2); K.tag(text, 0, 0, 1, col); ctx.restore();
}
// powder arrow pointing down
function arrowDown(x, y0, y1, p, lt) {
  const yy = y1 + Math.sin(lt * 8) * 10 * clamp(p * 2 - 1);
  K.stroke([[x, y0], [x + 8, (y0 + yy) / 2], [x, yy]], p, { w: 12, seed: 71, tip: true });
  K.stroke([[x - 60, yy - 60], [x, yy], [x + 60, yy - 60]], clamp(p * 2 - 1), { w: 12, seed: 72 });
}
// the big crown kolam: yellow dot grid + flower loop + crown. a = alpha, out(i,j) -> true if that dot has gone out
function crownKolam(lt, p, o = {}) {
  const cx = o.x ?? 540, cy = o.y ?? 820;
  K.dots(cx, cy, 7, 7, 100, clamp(p * 1.6), { r: 10, col: (i, j) => (o.out && o.out(i, j) ? P.ash : (i + j) % 2 ? P.yellow : P.yellowHi) });
  K.stroke(K.loopPts(cx, cy, 380, 8, 0.16, 260, lt * 0.05), clamp(p * 1.3 - 0.2), { w: 11, seed: 81, tip: true });
  K.stroke(K.loopPts(cx, cy, 250, 4, 0.3, 200, -lt * 0.08), clamp(p * 1.3 - 0.3), { w: 8, seed: 82, col: P.yellowHi });
  K.crown(cx, cy + 20, 1.7, clamp(p * 1.4 - 0.3));
  K.glow(cx, cy, 420, P.yellow, 0.12 * clamp(p));
}

export function buildC(add, cue) {
  const t8 = L(8), once = Wd('once', 8), twice = Wd('twice', 8), sch = Wd('scholars', 8), dis = Wd('disagree', 8);
  const t9 = L(9), hist = Wd('historians', 9), start = Wd('start', 9), end = Wd('end', 9), fifty = Wd('fifty', 9), gone = Wd('gone', 9);
  const t10 = L(10), trai = Wd('traitor', 10), man = Wd('man', 10), brk = Wd('breaking', 10), free = Wd('free', 10), below = Wd('below', 10);
  const and = Wd('and', 10), dots = Wd('dots', 10);

  // ---- line 8: once or twice? ----
  add({ id: 'c8_split', at: t8, cam: [540, 780], zoom: 0.07, note: 'DISPUTED slams; powder divider splits the floor; left: one red loop closes round a yellow dot ONCE?; right: two loops close TWICE?', draw: (lt) => {
    K.floor(lt, { lamp: 0.24, lx: 540, ly: 700 }); K.motes(lt, 30, 3, 0.4);
    K.stroke([[540, 300], [536, 800], [544, 1380]], seg(lt, 0, 0.5), { w: 8, seed: 91, tip: true, col: P.powderDk });
    K.dots(270, 760, 3, 3, 90, seg(lt, 0.1, 0.6), { r: 7 }); K.dots(810, 760, 3, 3, 90, seg(lt, 0.15, 0.65), { r: 7 });
    const lo = once - t8, tw = twice - t8;
    K.dot(270, 760, 18 * K.pop(lt, 0.25), P.yellow); K.dot(810, 760, 18 * K.pop(lt, 0.3), P.yellow);
    K.glow(270, 760, 80, P.yellowHi, 0.3); K.glow(810, 760, 80, P.yellowHi, 0.3);
    K.cage(270, 760, 170, seg(lt, lo - 0.25, lo + 0.35), { rot: 0.2 });
    K.cage(810, 760, 120, seg(lt, tw - 0.25, tw + 0.2), { rot: 0.5, w: 10 });
    K.cage(810, 760, 190, seg(lt, tw + 0.1, tw + 0.5), { rot: -0.3, w: 10 });
    K.title('ONCE?', 270, 1080, seg(lt, lo, lo + 0.35), { size: 100, col: P.redHi });
    K.title('TWICE?', 810, 1080, seg(lt, tw, tw + 0.35), { size: 100, col: P.redHi });
    slamTag('DISPUTED', 540, 210, lt, 0.05);
  } });
  cue(t8, 'whoosh', { gain: 0.7 }); cue(t8 + 0.05, 'slam', { gain: 0.6 });
  cue(once, 'tock', { gain: 0.75, pan: -0.5 }); cue(twice, 'tock', { gain: 0.75, pan: 0.5 }); cue(twice + 0.3, 'tock', { gain: 0.6, pan: 0.5 });

  add({ id: 'c8_flicker', at: sch, cam: [540, 760], zoom: 0.12, note: 'closer: both diagrams flicker and redraw, halves drift apart, a powder gust blows down the gap; on DISAGREE the floor cracks down the middle, big ? stamps', draw: (lt, d) => {
    const di = dis - sch, [sx, sy] = K.shk(lt, di, 12, 0.5), dr = eio(seg(lt, 0, d)) * 25;
    ctx.save(); ctx.translate(sx, sy);
    K.floor(lt + 3, { lamp: 0.26, lx: 540, ly: 760 });
    // left: single loop, redraws in a flicker
    ctx.save(); ctx.translate(-dr, 0);
    K.dots(270, 760, 3, 3, 90, 1, { r: 7 }); K.dot(270, 760, 18, P.yellow); K.glow(270, 760, 90, P.yellowHi, 0.3 + 0.15 * Math.sin(lt * 20));
    const fl = (lt % 0.75) / 0.75; ctx.globalAlpha = 0.65 + 0.35 * Math.sin(lt * 31) ** 2;
    K.cage(270, 760, 170, fl < 0.15 ? 1 - fl / 0.15 : seg(fl, 0.15, 0.7), { rot: 0.2 });
    ctx.restore();
    // right: two loops, redrawing off-beat
    ctx.save(); ctx.translate(dr, 0);
    K.dots(810, 760, 3, 3, 90, 1, { r: 7 }); K.dot(810, 760, 18, P.yellow); K.glow(810, 760, 90, P.yellowHi, 0.3 + 0.15 * Math.sin(lt * 17));
    const f2 = ((lt + 0.37) % 0.75) / 0.75; ctx.globalAlpha = 0.65 + 0.35 * Math.cos(lt * 27) ** 2;
    K.cage(810, 760, 120, f2 < 0.15 ? 1 - f2 / 0.15 : seg(f2, 0.15, 0.55), { rot: 0.5, w: 10 });
    K.cage(810, 760, 180, f2 < 0.15 ? 1 - f2 / 0.15 : seg(f2, 0.3, 0.8), { rot: -0.3, w: 10 });
    ctx.restore();
    // gust down the gap
    band(400, 680, () => { K.gust((lt * 0.9) % 1, { y: 300, y1: 1350, n: 200 }); K.gust((lt * 0.9 + 0.5) % 1, { y: 300, y1: 1350, n: 160, dir: -1 }); });
    K.crack(540, 260, 1150, Math.PI / 2, seg(lt, di, di + 0.5), 8);
    K.title('ONCE?', 270 - dr, 1080, 1, { size: 90, col: P.redHi }); K.title('TWICE?', 810 + dr, 1080, 1, { size: 90, col: P.redHi });
    K.title('?', 540, 1300, seg(lt, di, di + 0.3), { size: 200, col: P.powder });
    K.tag('DISPUTED', 540, 210, 1);
    ctx.restore();
  } });
  cue(sch, 'whoosh', { gain: 0.6, pan: 0.2 }); cue(sch + 0.3, 'zip', { gain: 0.4, dur: 0.5 }); cue(dis, 'thud', { gain: 0.85 }); cue(dis + 0.05, 'rumble', { gain: 0.5, dur: 0.8 });

  // ---- line 9: the start of the end ----
  add({ id: 'c9_crown', at: t9, cam: [540, 820], zoom: 0.06, note: 'HISTORIANS tag; the large yellow crown kolam draws itself on a yellow dot grid, lamp breathing, powder pouring in', draw: (lt) => {
    K.floor(lt, { lamp: 0.3, lx: 760, ly: 600 }); K.motes(lt, 40, 9, 0.45);
    crownKolam(lt, seg(lt, 0, 1.4));
    K.pour(540 + lerp(-300, 300, seg(lt, 0, 1.8)), 820 - 380, lt, 0.8 * (1 - seg(lt, 1.4, 1.8)), P.yellowHi);
    slamTag('HISTORIANS', 540, 190, lt, hist - t9);
  } });
  cue(t9, 'swell', { gain: 0.5, dur: 1.6 }); cue(t9 + 0.05, 'whoosh', { gain: 0.5 }); cue(hist, 'tock', { gain: 0.7 });

  add({ id: 'c9_crack', at: start, cam: [600, 760], zoom: 0.14, note: 'closer on the crown: on END cracks race across the floor, a footstep smudge wipes the crown, red flash, first dots go out', draw: (lt) => {
    const e = end - start, [sx, sy] = K.shk(lt, e, 16, 0.6);
    ctx.save(); ctx.translate(sx, sy);
    K.floor(lt + 1.4, { lamp: lerp(0.3, 0.18, seg(lt, e, e + 0.8)), lx: 760, ly: 600 });
    crownKolam(lt + 1.8, 1, { out: (i, j) => rnd(i * 7 + j * 3) < seg(lt, e, e + 1.2) * 0.25 });
    K.crack(560, 1380, 900, -Math.PI / 2 + 0.25, seg(lt, e, e + 0.45), 3);
    K.crack(200, 600, 700, 0.2, seg(lt, e + 0.1, e + 0.6), 5);
    K.crack(980, 420, 600, 2.4, seg(lt, e + 0.2, e + 0.7), 9);
    K.smudge(660, 700, 170, seg(lt, e + 0.15, e + 0.75), -0.5);
    K.motes(lt, 30, 4, 0.4);
    ctx.restore();
    K.flash(0.35 * (1 - seg(lt, e, e + 0.3)) * (lt > e ? 1 : 0), P.red);
    K.tag('HISTORIANS', 540, 190, 1);
  } });
  cue(start, 'whoosh', { gain: 0.45 }); cue(end, 'thud', { gain: 0.9 }); cue(end + 0.05, 'rumble', { gain: 0.6, dur: 1 }); cue(end + 0.2, 'heartbeat', { gain: 0.5 });

  add({ id: 'c9_fifty', at: fifty, cam: [540, 760], zoom: 0.1, note: "ash floor: '50 YEARS' in powder; a 10x5 grid of yellow dots goes out one by one, faded cracked crown behind", draw: (lt, d) => {
    K.floor(lt, { tone: 'ash', lamp: lerp(0.22, 0.1, seg(lt, 0, d)), lx: 540, ly: 800 });
    ctx.save(); ctx.globalAlpha = 0.25; K.crown(540, 1220, 1.4, 1); ctx.restore();
    K.crack(100, 1180, 900, 0.1, 1, 12);
    K.title('50 YEARS', 540, 360, seg(lt, 0, 0.35), { size: 130, col: P.yellowHi });
    const n = 50, gone = Math.floor(seg(lt, 0.35, d - 0.1) * n);
    for (let j = 0; j < 5; j++) for (let i = 0; i < 10; i++) {
      const k = j * 10 + i, x = 540 + (i - 4.5) * 86, y = 600 + j * 86, s = K.pop(lt, k * 0.006, 0.25);
      if (k < gone) { K.dot(x, y, 7 * s, P.ash, 0.7); continue; }
      if (k === gone) K.glow(x, y, 60, P.yellowHi, 0.5);
      K.dot(x, y, 13 * s, k === gone ? P.yellowHi : P.yellow);
    }
    K.motes(lt, 25, 6, 0.3);
  } });
  cue(fifty, 'slam', { gain: 0.7 }); for (let i = 1; i <= 4; i++) cue(fifty + i * 0.42, 'tock', { gain: 0.4, pan: (i % 2 ? -0.3 : 0.3) });

  add({ id: 'c9_gone', at: gone, cam: [420, 820], zoom: 0.12, note: "GONE: a great gust blows the crown kolam away to the right in grains, ash floor, 'c. 1279' fades in", draw: (lt) => {
    K.floor(lt, { tone: 'ash', lamp: 0.12, lx: 300, ly: 800 });
    const g = seg(lt, 0, 0.9);
    ctx.save(); ctx.translate(eio(g) * 500, -eio(g) * 60); ctx.globalAlpha = 1 - g;
    crownKolam(lt + 4, 1, { out: (i, j) => rnd(i * 5 + j * 11) < 0.4 + g }); ctx.restore();
    K.gust(seg(lt, 0, 0.8), { y: 300, y1: 1350, n: 340, col: P.yellowHi }); K.gust(seg(lt, 0.15, 1), { y: 400, y1: 1300, n: 200 });
    K.title('c. 1279', 540, 1240, seg(lt, 0.3, 0.7), { size: 110, col: P.powderDk });
  } });
  cue(gone, 'whoosh', { gain: 0.85, pan: 0.4, dur: 1 }); cue(gone + 0.1, 'rumble', { gain: 0.45, dur: 0.9 });

  // ---- line 10: traitor or breaking free? + watch the dots ----
  add({ id: 'c10_traitor', at: t10, cam: [380, 1000], zoom: 0.1, note: 'red turban figure with spear draws itself on the left, a faint yellow crown smudged on the right; TRAITOR? slams in red powder', draw: (lt) => {
    const tr = trai - t10, [sx, sy] = K.shk(lt, tr + 0.05, 10, 0.4);
    K.floor(lt, { lamp: 0.26, lx: 300, ly: 900 }); K.motes(lt, 30, 12, 0.4);
    ctx.save(); ctx.globalAlpha = 0.5; K.crown(800, 1150, 0.9, 1); ctx.restore(); K.smudge(820, 1150, 120, 0.8, 0.3);
    K.figure(380, 1380, 1.55, { p: seg(lt, 0, 0.8), col: P.red, hat: 'turban', spear: 1 });
    K.glow(380, 1100, 300, P.red, 0.15);
    ctx.save(); ctx.translate(sx, sy); K.title('TRAITOR?', 540, 380, seg(lt, tr, tr + 0.3), { size: 140, col: P.redHi }); ctx.restore();
  } });
  cue(t10, 'whoosh', { gain: 0.6, pan: -0.3 }); cue(trai, 'slam', { gain: 0.75 });

  add({ id: 'c10_free', at: man, cam: [540, 1000], zoom: 0.12, note: 'the red figure stands inside a yellow loop (the old overlord); on BREAKING the loop bursts open, gust; BREAKING FREE? in powder', draw: (lt) => {
    const b = brk - man, f = free - man;
    K.floor(lt + 2, { lamp: 0.28, lx: 540, ly: 1000 }); K.motes(lt, 30, 14, 0.4);
    K.cage(540, 1060, 330, seg(lt, 0, 0.25), { col: P.yellow, open: eo(seg(lt, b, b + 0.6)), spread: 220, k: 10, rot: -Math.PI / 2 + lt * 0.15 });
    K.figure(540, 1360, 1.45, { p: 1, col: P.red, hat: 'turban', spear: 1 });
    K.glow(540, 1060, 400, P.yellowHi, 0.25 * (1 - seg(lt, b, b + 0.8)));
    K.gust(seg(lt, b, b + 0.8), { y: 650, y1: 1400, n: 220, col: P.yellowHi });
    K.title('BREAKING', 540, 330, seg(lt, b, b + 0.3), { size: 120, col: P.powder });
    K.title('FREE?', 540, 470, seg(lt, f, f + 0.3), { size: 130, col: P.yellowHi });
    K.flash(0.25 * (1 - seg(lt, b, b + 0.25)) * (lt > b ? 1 : 0), P.yellowHi);
  } });
  cue(man, 'whoosh', { gain: 0.4 }); cue(brk, 'zip', { gain: 0.6, dur: 0.4 }); cue(brk + 0.05, 'whoosh', { gain: 0.7 }); cue(free, 'bell', { gain: 0.5 });

  add({ id: 'c10_motif', at: below, cam: [540, 820], zoom: 0.1, note: 'the motif returns: dot grid pops in, a single yellow dot, the red loop closes round it again; a powder arrow points down to the comments', draw: (lt) => {
    K.floor(lt, { tone: 'night', lamp: 0.3, lx: 540, ly: 820 }); K.motes(lt, 35, 17, 0.45);
    K.dots(540, 820, 5, 5, 120, seg(lt, 0, 0.6), { r: 9 });
    K.dot(540, 820, 22 * K.pop(lt, 0.05), P.yellow); K.glow(540, 820, 120, P.yellowHi, 0.4);
    K.cage(540, 820, 230, seg(lt, 0.2, 0.9), { rot: -Math.PI / 2 + lt * 0.1 });
    arrowDown(540, 1200, 1410, seg(lt, 0, 0.5), lt);
  } });
  cue(below, 'pop', { gain: 0.6 }); cue(below + 0.2, 'zip', { gain: 0.4, dur: 0.6 });

  add({ id: 'c10_dots', at: and, cam: [540, 820], zoom: 0.55, note: 'camera pushes hard into the dots; the red loop pulses, closing and opening like a heartbeat; on DOTS it breaks open and the yellow dot blooms', draw: (lt, d) => {
    const dt = dots - and;
    K.floor(lt + 1.3, { tone: 'night', lamp: 0.3, lx: 540, ly: 820 }); K.motes(lt, 35, 17, 0.45);
    K.dots(540, 820, 5, 5, 120, 1, { r: 9 });
    const beat = Math.max(0, Math.sin(lt * TAU * 1.7)) ** 3, op = lt < dt ? 0.12 * beat : 0.75 * eo(seg(lt, dt, dt + 0.7));
    K.cage(540, 820, 230 - 14 * beat * (lt < dt ? 1 : 0), 1, { rot: -Math.PI / 2 + (below < and ? and - below : 0) * 0.1 + lt * 0.1, open: op, spread: 110 });
    const fr = seg(lt, dt, dt + 0.6);
    K.glow(540, 820, 120 + 260 * fr, P.yellowHi, 0.4 + 0.4 * fr - 0.2 * seg(lt, dt + 0.8, d));
    K.dot(540, 820, 22 * (1 + 0.15 * beat + 0.5 * eob(fr)), P.yellow);
    K.flash(0.3 * (1 - seg(lt, dt, dt + 0.3)) * (lt > dt ? 1 : 0), P.yellowHi);
  } });
  cue(and, 'heartbeat', { gain: 0.6 }); cue(and + 0.59, 'heartbeat', { gain: 0.7 }); cue(dots, 'bell', { gain: 0.85 }); cue(dots + 0.05, 'swell', { gain: 0.5, dur: 1.2 });
}
