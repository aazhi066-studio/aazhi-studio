// Worker B: script lines 4-7 (L(4) .. L(8)). Held at Sendamangalam (red fort, yellow dot caged inside); the Hoysala ally
// (teal) sends two armies south; Kadava towns sacked, teal siege ring tightens, the chief lowers his spear and a white peace
// line is drawn; INSCRIPTIONS SAY the red loop breaks open at Tiruvendipuram. "Kolam Threshold" kit.
import * as K from './kolam.js';
import { L, Wd } from './core/timing.js';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = K.PAL;
const sh = (a) => ctx.translate(a[0], a[1]);

export function buildB(add, cue) {
  // ---------------- line 4: held at Sendamangalam ----------------
  const t4 = L(4), tSen = Wd('sendamangalam', 4), tChief = Wd('chief', 4), tFort = Wd('fortified', 4);

  add({ id: 'b4_fort', at: t4, cam: [540, 1000], zoom: 0.1, note: 'night floor; red-filled fort draws itself while powder pours on the wall; SENDAMANGALAM in powder',
    draw(lt, d) {
      K.floor(lt, { tone: 'night', lamp: 0.2, lx: 200, ly: 900 });
      const p = eo(seg(lt, 0, 1.2));
      ctx.save(); sh(K.shk(lt, tSen - t4, 10, 0.4));
      K.fort(540, 1260, 1.25, p, { col: P.red });
      const px = lerp(-260, 860, p); K.pour(px, lerp(860, 900, p), lt, 0.9 * (1 - seg(lt, 1.6, 1.9)));
      K.dots(540, 1360, 9, 1, 100, seg(lt, 0.3, 1.2), { r: 7 });
      ctx.restore();
      K.title('SENDAMANGALAM', 540, 420, seg(lt, tSen - t4, tSen - t4 + 0.6), { size: 96, ls: 4 });
      K.tag('THE KADAVA CAPITAL', 540, 560, seg(lt, tSen - t4 + 0.4, tSen - t4 + 0.8), P.redHi);
      K.motes(lt, 30, 3, 0.4);
      K.flash(0.35 * (1 - seg(lt, 0, 0.15)), P.red);
    } });
  cue(t4, 'thud', { gain: 0.8 }); cue(t4 + 0.05, 'whoosh', { gain: 0.5 }); cue(Wd('held', 4), 'chisel', { gain: 0.4 });
  cue(tSen, 'slam', { gain: 0.7 });

  add({ id: 'b4_cell', at: tChief, cam: [540, 820], zoom: 0.14, note: 'inside the walls: emperor (crown), queen (veil) and ministers held inside a red cage loop; cell wall draws on "fortified"',
    draw(lt, d) {
      K.floor(lt, { tone: 'night', lamp: 0.26, lx: 900, ly: 700 });
      const tf = tFort - tChief;
      K.stroke(K.rectPts(110, 300, 860, 1080, 50), eio(seg(lt, tf - 0.1, tf + 0.9)), { col: P.redHi, w: 14, seed: 3, tip: true });
      for (let i = 0; i < 4; i++) K.dots(220 + i * 213, 360, 1, 1, 0, seg(lt, tf + 0.6 + i * 0.08, tf + 0.9 + i * 0.08), { r: 9, col: () => P.red });
      K.cage(540, 900, 330, eio(seg(lt, 0, 1.0)), { k: 10, d: 0.08, rot: lt * 0.15 });
      K.figure(470, 1060, 0.95, { p: seg(lt, 0.0, 0.9), hat: 'crown' });
      K.figure(630, 1060, 0.8, { p: seg(lt, 0.2, 1.1), hat: 'veil' });
      K.figure(340, 1080, 0.5, { p: seg(lt, 0.4, 1.2), col: P.powderDk });
      K.figure(750, 1080, 0.5, { p: seg(lt, 0.5, 1.3), col: P.powderDk });
      K.tag('RECORDS SAY', 540, 200, seg(lt, 0.2, 0.6));
      K.motes(lt, 30, 11, 0.4);
    } });
  cue(tChief, 'whoosh', { gain: 0.5 }); cue(tChief + 0.3, 'chisel', { gain: 0.4 }); cue(tFort, 'thud', { gain: 0.6 });

  // ---------------- line 5: the Hoysala ally sends armies ----------------
  const t5 = L(5), tHoy = Wd('hoysala', 5), tVira = Wd('vira', 5), tSent = Wd('sent', 5), tArm = Wd('armies', 5);

  add({ id: 'b5_ally', at: t5, cam: [540, 860], zoom: 0.1, note: 'two dots: yellow emperor (crown) left, teal ally right, a white powder alliance line draws between them; dot grid pops',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.22, lx: 540, ly: 860 });
      K.dots(540, 860, 7, 7, 120, seg(lt, 0, 0.8), { r: 6, col: () => rgba(P.powder, 0.5) });
      const pl = eio(seg(lt, 0.4, 1.2)), w = Math.sin(lt * 3) * 18;
      K.stroke([[300, 860], [420, 820 + w], [540, 860], [660, 900 - w], [780, 860]], pl, { w: 9, tip: true, seed: 4 });
      K.glow(300, 860, 160, P.yellow, 0.35); K.dot(300, 860, 40 * K.pop(lt, 0), P.yellow);
      K.crown(300, 720, 0.6, seg(lt, 0, 0.6));
      K.glow(780, 860, 160, P.teal, 0.4); K.dot(780, 860, 40 * K.pop(lt, 0.25), P.teal);
      K.title('ALLY', 540, 1100, seg(lt, 0.6, 1.1), { size: 90, font: 'sans', col: P.powderDk });
      K.motes(lt, 30, 21, 0.4);
    } });
  cue(t5, 'pop', { gain: 0.6 }); cue(t5 + 0.25, 'plop', { gain: 0.5 }); cue(t5 + 0.4, 'zip', { gain: 0.4 });

  add({ id: 'b5_king', at: tHoy, cam: [540, 900], zoom: 0.12, note: 'teal crowned Hoysala king draws himself from a teal pour; HOYSALA, then VIRA NARASIMHA II',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.24, lx: 200, ly: 700 });
      const tv = tVira - tHoy;
      K.glow(540, 1050, 420, P.teal, 0.25 + 0.05 * Math.sin(lt * 5));
      K.pour(540, 1300, lt, 1 - seg(lt, 0.8, 1.2), P.tealHi);
      K.figure(540, 1300, 1.7, { p: eio(seg(lt, 0, 1.3)), col: P.teal, hat: 'crown' });
      K.title('HOYSALA', 540, 330, seg(lt, 0.05, 0.5), { size: 120, col: P.tealHi });
      K.tag('VIRA NARASIMHA II', 540, 470, seg(lt, tv, tv + 0.4), P.tealHi);
      K.gust(seg(lt, 1.4, d + 0.3), { y: 500, y1: 1400, col: P.tealHi, n: 120 });
      K.motes(lt, 30, 31, 0.4);
    } });
  cue(tHoy, 'whoosh', { gain: 0.6 }); cue(tHoy + 0.05, 'swell', { gain: 0.5, dur: 1.2 }); cue(tVira, 'pop', { gain: 0.5 });

  const RL = [[300, 280], [240, 620], [360, 980], [440, 1340]], RR = [[790, 280], [850, 640], [720, 1000], [640, 1340]];
  add({ id: 'b5_march', at: tSent, cam: [540, 760], zoom: 0.1, note: 'two teal dashed route arrows race down the frame toward the small red fort; teal dot-army marches in',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.2, lx: 540, ly: 300 });
      K.fort(540, 1420, 0.5, 1, { col: P.red });
      K.route(RL, eio(seg(lt, 0, 1.3)), P.teal, 11);
      K.route(RR, eio(seg(lt, 0.15, 1.45)), P.teal, 11);
      const ta = tArm - tSent;
      for (const [R, o] of [[RL, 0], [RR, 0.03]]) for (let k = 0; k < 7; k++) { // dot-soldiers marching down each route
        const f = lerp(0.05, 0.9, eio(seg(lt, ta - 0.4, d + 0.4))) - k * 0.075 - o; if (f <= 0.02) continue;
        const q = K.part(R, f), [x, y] = q[q.length - 1], b = Math.sin(lt * 14 + k) * 5, s = K.pop(lt, ta - 0.4 + k * 0.05);
        K.dot(x + 28, y + b, 14 * s, P.teal); K.stroke([[x + 46, y + b + 10], [x + 46, y + b - 44 * s]], 1, { w: 4, seed: k * 5 }); }
      K.title('ARMIES SOUTH', 540, 180, seg(lt, tArm - tSent, tArm - tSent + 0.4), { size: 70, font: 'sans', col: P.tealHi });
      K.motes(lt, 25, 41, 0.35);
    } });
  cue(tSent, 'zip', { gain: 0.6 }); cue(tSent + 0.15, 'zip', { gain: 0.5, pan: 0.3 });
  for (let i = 0; i < 4; i++) cue(tArm + i * 0.38, 'drum', { gain: 0.75 - i * 0.07 });

  // ---------------- line 6: towns sacked, siege, peace ----------------
  const t6 = L(6), tSack = Wd('sacked', 6), tSiege = Wd('siege', 6), tCh6 = Wd('chief', 6), tPeace = Wd('peace', 6);
  const TOWNS = [[260, 620, 0], [780, 760, 1], [380, 1100, 2], [760, 1250, 3]];
  add({ id: 'b6_towns', at: t6, cam: [540, 900], zoom: 0.1, note: 'four small red kolam towns; on "sacked" teal gust blows, smudges wipe them, floor cracks',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.2, lx: 900, ly: 400 });
      const ts = tSack - t6;
      ctx.save(); sh(K.shk(lt, ts, 14, 0.5));
      for (const [x, y, i] of TOWNS) {
        const pts = K.loopPts(x, y, 110, 4 + i, 0.22, 140, i);
        K.bloom(pts, x, y, 160, seg(lt, 0.1 + i * 0.1, 0.7 + i * 0.1), P.red, 0.6);
        K.stroke(pts, eio(seg(lt, i * 0.1, 0.6 + i * 0.1)), { w: 8, seed: 50 + i });
        K.dot(x, y, 12, P.powder);
      }
      for (const [x, y, i] of TOWNS) K.smudge(x + 20, y, 150, seg(lt, ts + 0.05 + i * 0.12, ts + 0.5 + i * 0.12), -0.3 + i * 0.2);
      K.crack(120, 900, 700, 0.15, seg(lt, ts, ts + 0.5), 3);
      ctx.restore();
      K.gust(seg(lt, ts - 0.2, ts + 0.9), { y: 450, y1: 1400, col: P.tealHi, n: 300 });
      K.title('SACKED', 540, 300, seg(lt, ts, ts + 0.3), { size: 110, font: 'sans', col: P.tealHi });
      K.flash(0.3 * (1 - seg(lt, ts, ts + 0.2)) * (lt > ts ? 1 : 0), P.teal);
    } });
  cue(t6, 'pop', { gain: 0.5 }); cue(t6 + 0.2, 'plop', { gain: 0.4 }); cue(tSack - 0.15, 'whoosh', { gain: 0.8 }); cue(tSack, 'slam', { gain: 0.85 });

  add({ id: 'b6_siege', at: tSiege, cam: [540, 860], zoom: 0.18, note: 'top view: red fort ringed by teal soldier dots, ring tightens with a rumble',
    draw(lt, d) {
      K.floor(lt, { tone: 'night', lamp: 0.18, lx: 540, ly: 860 });
      ctx.save(); sh(K.shk(lt, 0.4, 5, 1.0));
      K.fort(540, 960, 0.55, 1, { col: P.red });
      K.glow(540, 870, 300, P.red, 0.2 + 0.08 * Math.sin(lt * 9));
      const r = lerp(560, 360, eio(seg(lt, 0, d))), n = 28;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + lt * 0.25, q = K.pop(lt, i * 0.02, 0.25);
        K.dot(540 + Math.cos(a) * r, 870 + Math.sin(a) * r * 0.9, 15 * q, P.teal); }
      K.stroke(K.loopPts(540, 870, r + 40, 28, 0.04, 200, lt * 0.25), seg(lt, 0, 0.8), { col: P.tealHi, w: 5, seed: 9, a: 0.7 });
      ctx.restore();
      K.title('SIEGE', 540, 300, seg(lt, 0, 0.3), { size: 120, font: 'sans', col: P.tealHi });
    } });
  cue(tSiege, 'rumble', { gain: 0.7, dur: 1.3 }); cue(tSiege, 'drum', { gain: 0.6 }); cue(tSiege + 0.5, 'drum', { gain: 0.6 });

  add({ id: 'b6_peace', at: tCh6, cam: [540, 980], zoom: 0.1, note: 'red turbaned chief lowers his spear facing a teal soldier; on "peace" a white powder line draws between them',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.26, lx: 540, ly: 700 });
      const tp = tPeace - tCh6, sp = eio(seg(lt, 0.15, tp)), ang = -sp * 1.5;
      K.figure(300, 1250, 1.2, { col: P.red, hat: 'turban' });
      ctx.save(); ctx.translate(300 + 80 * 1.2 - sp * 20, 1250 - 140 * 1.2 + sp * 130); ctx.rotate(ang); // spear pivots at the hand and lowers
      K.stroke([[0, 150], [0, -190], [-10, -165], [10, -165], [0, -190]].map(([x, y]) => [x * 1.2, y * 1.2]), 1, { w: 8, seed: 17 }); ctx.restore();
      K.figure(800, 1250, 1.2, { col: P.teal, hat: 'helm' });
      K.stroke([[400, 1060], [470, 1045], [540, 1060 + Math.sin(lt * 4) * 10], [610, 1075], [690, 1060]], eio(seg(lt, tp, tp + 0.5)), { w: 12, tip: true, seed: 8 });
      K.glow(540, 1060, 220, P.white, 0.3 * seg(lt, tp, tp + 0.4));
      K.title('PEACE', 540, 520, seg(lt, tp, tp + 0.4), { size: 130 });
      K.motes(lt, 30, 61, 0.4);
    } });
  cue(tCh6, 'whoosh', { gain: 0.5 }); cue(tCh6 + 0.6, 'tock', { gain: 0.5 }); cue(tPeace, 'swell', { gain: 0.6, dur: 1.0 }); cue(tPeace + 0.1, 'zip', { gain: 0.4 });

  // ---------------- line 7: set free at Tiruvendipuram ----------------
  const t7 = L(7), tFree = Wd('free', 7), tTiru = Wd('tiruvendipuram', 7);
  add({ id: 'b7_tag', at: t7, cam: [540, 860], zoom: 0.22, note: 'INSCRIPTIONS SAY; the motif: yellow dot inside the red loop on the dot grid, loop trembles, camera pushes in',
    draw(lt, d) {
      K.floor(lt, { tone: 'night', lamp: 0.24, lx: 860, ly: 640 });
      K.dots(540, 860, 7, 7, 115, seg(lt, 0, 0.7), { r: 7 });
      const tr = seg(lt, d - 0.9, d) * 6;
      ctx.save(); sh([Math.sin(lt * 60) * tr, Math.cos(lt * 47) * tr]);
      K.cage(540, 860, 230, 1, { rot: lt * 0.3 });
      ctx.restore();
      K.glow(540, 860, 140, P.yellow, 0.35 + 0.1 * Math.sin(lt * 6)); K.dot(540, 860, 30, P.yellow);
      K.tag('INSCRIPTIONS SAY', 540, 300, K.pop(lt, 0.05, 0.35));
      K.motes(lt, 30, 71, 0.4);
    } });
  cue(t7, 'tock', { gain: 0.6 }); cue(t7 + 0.05, 'whoosh', { gain: 0.4 }); cue(tFree - 0.8, 'heartbeat', { gain: 0.5 });

  add({ id: 'b7_free', at: tFree, cam: [540, 880], zoom: 0.06, note: 'red loop BREAKS OPEN, yellow bloom spreads over the grid, sparkle; TIRUVENDIPURAM in yellow powder',
    draw(lt, d) {
      K.floor(lt, { tone: 'oxide', lamp: 0.3 + 0.1 * seg(lt, 0, 0.5), lx: 540, ly: 860 });
      K.dots(540, 860, 7, 7, 115, 1, { r: 7, col: (i, j) => Math.hypot(i - 3, j - 3) < 1 + 4 * eo(seg(lt, 0.1, 1.4)) ? P.yellowHi : P.powder });
      const op = eo(seg(lt, 0, 0.6));
      K.cage(540, 860, 230, 1, { open: op, spread: 260, rot: 0.3 });
      K.bloom(K.loopPts(540, 860, 300, 8, 0.12, 120), 540, 860, 380, seg(lt, 0.05, 1.0), P.yellow, 0.45);
      K.glow(540, 860, 360, P.yellowHi, 0.45 * (1 - seg(lt, 0.3, 1.6)) + 0.15);
      K.dot(540, 860, 30 + 10 * eob(seg(lt, 0, 0.4)), P.yellowHi);
      for (let i = 0; i < 26; i++) { const a = rnd(i) * TAU, rr = 40 + eo(seg(lt, 0, 1.4)) * (180 + rnd(i + 5) * 300), s = 1 - seg(lt, 0.8, 1.9);
        if (s > 0) K.dot(540 + Math.cos(a) * rr, 860 + Math.sin(a) * rr, 5 * s, P.yellowHi); }
      K.title('TIRUVENDIPURAM', 540, 1300, seg(lt, tTiru - tFree, tTiru - tFree + 0.6), { size: 88, col: P.yellowHi, ls: 3 });
      K.title('SET FREE', 540, 330, seg(lt, 0.05, 0.4), { size: 110, font: 'sans' });
      K.flash(0.55 * (1 - seg(lt, 0, 0.2)), P.yellowHi);
      K.motes(lt, 40, 81, 0.5);
    } });
  cue(tFree, 'bell', { gain: 0.8 }); cue(tFree + 0.02, 'sparkle', { gain: 0.7 }); cue(tTiru, 'chisel', { gain: 0.4 });
}
