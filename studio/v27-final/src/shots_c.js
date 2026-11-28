// v27 worker C: script lines 7-10 (the line ends / who was behind it? / suspect the cousin, no proof / angry city or cousin's plan + "watch the throne").
import { ctx, W, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { L, Wd, T, lineWords } from './core/timing.js';
import { rgba } from './art.js';
import * as N from './neon.js';
const P = N.PAL;
const WET = 1390;

// ---------- local helpers ----------
// boxed tag that slams in (big -> normal + shake), flickering on with ignite
function slamTag(text, x, y, lt, t0, col = P.white, size = 44, seed = 0) {
  if (lt < t0) return; const k = eo(clamp((lt - t0) / 0.18)), [sx, sy] = N.shk(lt, t0 + 0.18, 9, 0.35);
  ctx.save(); ctx.translate(x + sx, y + sy); const s = lerp(1.8, 1, k); ctx.scale(s, s);
  N.tag(text, 0, 0, col, N.ignite(lt, t0, seed, 0.3) * N.buzz(lt, seed + 3, 0.5), size); ctx.restore();
}
// clip to a vertical band
function band(x0, x1, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x0, -300, x1 - x0, 2600); ctx.clip(); fn(); ctx.restore(); }
// a lineage node: ring + tiny crown inside
function node(x, y, col, b, r = 58) {
  if (b > 0.05) N.halo(x, y, r * 3, col, b);
  N.tube(N.circPts(x, y, r, 40), 1, { col, w: 11, b });
  N.crown(x, y + 6, 0.26, { col, b, w: 9 });
}
// half of a split disc: side -1 = left, +1 = right; jagged seam down the middle
function halfDisc(cx, cy, R, side, col, b, seam) {
  const arc = N.circPts(cx, cy, R, 40, side < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI);
  const sm = seam.map(([sx, sy]) => [cx + sx, cy + sy]); const pts = [...arc, ...(side < 0 ? sm : sm.reverse())];
  N.tube(pts, 1, { col, w: 13, b, close: true });
}
// zigzag seam from top (y=-R) to bottom (y=+R) of a disc, relative coords
const SEAM = (R) => Array.from({ length: 9 }, (_, i) => [(i % 2 ? 1 : -1) * (i === 0 || i === 8 ? 0 : R * 0.08), -R + (2 * R * i) / 8]);
// balance scale; tilt in radians
function scale(cx, top, tilt, b, leftFn, rightFn, lt) {
  N.tube([[cx, top], [cx, 1290]], 1, { col: P.white, w: 11, b });
  N.tube([[cx - 170, 1290], [cx + 170, 1290]], 1, { col: P.white, w: 11, b });
  N.tube(N.circPts(cx, top - 26, 22, 24), 1, { col: P.white, w: 8, b });
  const arm = 300, c = Math.cos(tilt), s = Math.sin(tilt);
  const lx = cx - arm * c, ly = top - arm * s, rx = cx + arm * c, ry = top + arm * s;
  N.tube([[lx, ly], [rx, ry]], 1, { col: P.white, w: 11, b });
  for (const [px, py, fn] of [[lx, ly, leftFn], [rx, ry, rightFn]]) {
    const pany = py + 300;
    N.tube([[px, py], [px - 120, pany]], 1, { col: P.white, w: 6, b: b * 0.8 });
    N.tube([[px, py], [px + 120, pany]], 1, { col: P.white, w: 6, b: b * 0.8 });
    N.tube([[px - 150, pany], [px - 110, pany + 40], [px + 110, pany + 40], [px + 150, pany]], 1, { col: P.white, w: 9, b });
    fn(px, pany);
  }
}
// neon arrow pointing down
function arrowDown(x, y0, y1, p, b) {
  N.tube([[x, y0], [x, y1]], p, { col: P.white, w: 18, b, tip: true });
  const k = clamp(p * 2 - 1);
  if (k > 0) N.tube([[x - 110, y1 - 110], [x, y1], [x + 110, y1 - 110]], k, { col: P.white, w: 18, b });
}

export function buildC(add, cue) {
  const t7 = L(7), fat = Wd('father', 7), son = Wd('son', 7), ended = Wd('ended', 7);
  const t8 = L(8), behind = Wd('behind', 8), rel = Wd('religious', 8), later = Wd('later', 8);
  const t9 = L(9), sus = Wd('suspect', 9), cou = Wd('cousin', 9), crn = Wd('crown', 9), no = Wd('no', 9), rec = Wd('record', 9), either = Wd('either', 9);
  const t10 = L(10), angry = Wd('angry', 10), plan = Wd('plan', 10), tell = Wd('tell', 10), below = Wd('below', 10), watch1 = Wd('watch', 10);
  const w10 = lineWords(10), watch2 = w10.filter((w) => /^watch/i.test(w.w))[1]?.s ?? watch1 + 1, thr = Wd('throne', 10);

  // ---- line 7: the old line, father to son ----
  const NODES = [250, 480, 710, 940, 1170];
  add({ id: 'c7_lineage', at: t7 - 0.05, cam: [540, 760], zoom: 0.08, note: 'vertical amber family line: crowned nodes ignite one by one downward (father -> son -> son), the camera tilts down with them', draw: (lt, d) => {
    const ty = -lerp(0, 120, eio(seg(lt, 0, d)));
    N.wall(lt, { tone: 'brick', rain: 0.55, wet: WET, glowCol: P.amber, gx: 540, gy: 760, ga: 0.12 });
    const scene = () => {
      for (let i = 0; i < NODES.length; i++) {
        const t0 = 0.12 + i * 0.36, b = N.ignite(lt, t0, i + 1) * N.buzz(lt, i + 2, 0.5);
        if (i > 0) N.tube([[540, NODES[i - 1] + 62], [540, NODES[i] - 62]], seg(lt, t0 - 0.3, t0), { col: P.amber, w: 8, b: N.ignite(lt, t0 - 0.3, i + 9), tip: true });
        node(540, NODES[i], P.amber, b);
      }
    };
    ctx.save(); ctx.translate(0, ty); scene(); ctx.restore();
    N.reflect(WET, () => { ctx.translate(0, ty); scene(); }, 0.22, lt);
  } });
  for (let i = 0; i < NODES.length; i++) cue(t7 - 0.05 + 0.12 + i * 0.36, i % 2 ? 'sparkle' : 'zip', { gain: 0.45, pan: 0 });

  add({ id: 'c7_short', at: ended - 0.05, cam: [540, 900], zoom: 0.1, note: 'closer on the bottom of the line: the last link SHORTS OUT in sparks, the last node dies grey; a magenta branch swoops in from the side and a magenta node ignites beside the dead end', draw: (lt, d) => {
    const s0 = 0.08, [sx, sy] = N.shk(lt, s0 + 0.2, 14, 0.5);
    N.wall(lt + 5, { tone: 'brick', rain: 0.6, wet: WET, glowCol: lt > 0.7 ? P.magenta : P.amber, gx: 700, gy: 900, ga: 0.12 });
    const scene = () => {
      // two upper nodes still lit
      node(400, 330, P.amber, N.buzz(lt, 4, 0.6));
      N.tube([[400, 392], [400, 588]], 1, { col: P.amber, w: 8, b: N.buzz(lt, 6, 0.6) });
      node(400, 650, P.amber, N.buzz(lt, 5, 0.6) * (lt > s0 && lt < s0 + 0.3 ? 0.5 : 1));
      // the last link and node short out
      const bl = N.short(lt, s0, 3, 0.4);
      N.tube([[400, 712], [400, 908]], 1, { col: P.amber, w: 8, b: bl });
      node(400, 970, P.amber, N.short(lt, s0 + 0.12, 5, 0.4));
      if (lt > s0 + 0.55) N.tube([[400, 1040], [400, 1120]], 1, { col: P.dead, w: 8, b: 0 });
      // magenta branch from the side
      const mp = seg(lt, 0.6, 1.05), mb = N.ignite(lt, 0.6, 7) * N.buzz(lt, 8, 0.5);
      N.tube([[1120, 380], [900, 520], [780, 740], [720, 900]], mp, { col: P.magenta, w: 9, b: mb, tip: true });
      if (lt > 1.0) node(700, 970, P.magenta, N.ignite(lt, 1.0, 11) * N.buzz(lt, 12, 0.5), 64);
    };
    ctx.save(); ctx.translate(sx, sy); scene();
    N.sparks(400, 810, lt, s0, 46, 420, 3, P.amberHi); N.sparks(400, 970, lt, s0 + 0.15, 30, 300, 9, P.amberHi);
    ctx.restore();
    N.reflect(WET, scene, 0.22, lt);
    N.flash(0.35 * (1 - seg(lt, s0, s0 + 0.25)) * (lt > s0 ? 1 : 0), P.redHi);
  } });
  cue(ended, 'slam', { gain: 0.8 }); cue(ended + 0.05, 'thud', { gain: 0.6 }); cue(ended - 0.05 + 0.6, 'zip', { gain: 0.55, pan: 0.5 }); cue(ended - 0.05 + 1.0, 'sparkle', { gain: 0.5, pan: 0.4 });

  // ---- line 8: who was behind it? ----
  add({ id: 'c8_question', at: t8 - 0.05, cam: [540, 760], zoom: 0.12, note: 'huge white neon ? on the wet wall stutters on and keeps flickering; DISPUTED tag slams under it', draw: (lt, d) => {
    N.wall(lt + 9, { tone: 'blue', rain: 0.7, wet: WET, glowCol: P.white, gx: 540, gy: 700, ga: 0.1 });
    const b = N.ignite(lt, 0.08, 2, 0.45);
    const scene = () => {
      N.halo(540, 700, 420, P.white, b * 0.8);
      const bb = b * N.buzz(lt, 4, 2.5);
      N.tube([...N.circPts(540, 520, 180, 40, Math.PI, Math.PI * 1.5), [540, 860]], seg(lt, 0.05, 0.4), { col: P.white, w: 26, b: bb, tip: true });
      if (lt > 0.35) N.tube(N.circPts(540, 990, 26, 20), 1, { col: P.white, w: 22, b: N.ignite(lt, 0.35, 9) * bb });
    };
    scene();
    N.reflect(WET, scene, 0.2, lt);
    slamTag('DISPUTED', 540, 1260, lt, behind - t8 + 0.05, P.white, 52, 6);
  } });
  cue(t8, 'heartbeat', { gain: 0.8 }); cue(t8 + 0.05, 'zip', { gain: 0.5 }); cue(behind + 0.05, 'slam', { gain: 0.6 }); cue(behind + 0.5, 'heartbeat', { gain: 0.7 });

  add({ id: 'c8_split', at: rel - 0.05, cam: [540, 760], zoom: 0.1, note: 'abstract "strife": one disc tube, half white half red, cracks down a jagged seam and the halves pull apart sparking (no symbols)', draw: (lt, d) => {
    const c0 = 0.25, gap = eo(seg(lt, c0, d)) * 120, [sx, sy] = N.shk(lt, c0, 12, 0.45);
    N.wall(lt + 13, { tone: 'red', rain: 0.6, wet: WET, glowCol: P.red, gx: 700, gy: 760, ga: 0.12 });
    const seam = SEAM(320);
    const scene = () => {
      halfDisc(540 - gap, 760, 320, -1, P.white, N.ignite(lt, 0, 1) * N.buzz(lt, 2, 1.5), seam);
      halfDisc(540 + gap, 760, 320, 1, P.red, N.ignite(lt, 0.05, 3) * N.buzz(lt + 0.3, 5, 1.5), seam);
    };
    ctx.save(); ctx.translate(sx, sy); scene();
    for (let k = 0; k < 3; k++) N.sparks(540, 520 + k * 240, lt, c0 + k * 0.12, 26, 300, 20 + k * 5, k % 2 ? P.redHi : '#FFFFFF');
    ctx.restore();
    N.reflect(WET, scene, 0.2, lt);
  } });
  cue(rel + 0.2, 'thud', { gain: 0.7 }); cue(rel + 0.25, 'sparkle', { gain: 0.5 });

  add({ id: 'c8_later', at: later - 0.05, cam: [540, 700], zoom: -0.06, note: 'pull back: the two halves hang far apart and buzz unevenly; LATER STORIES tag slams between them', draw: (lt, d) => {
    const gap = 120 + eo(seg(lt, 0, d)) * 60;
    N.wall(lt + 17, { tone: 'red', rain: 0.6, wet: WET, glowCol: P.red, gx: 540, gy: 700, ga: 0.08 });
    const seam = SEAM(230);
    const scene = () => {
      halfDisc(540 - gap - 40, 640, 230, -1, P.white, N.buzz(lt, 21, 3), seam);
      halfDisc(540 + gap + 40, 640, 230, 1, P.red, N.buzz(lt + 0.5, 23, 3), seam);
    };
    scene();
    N.sparks(540 + gap + 40, 420, lt, 0.5, 18, 220, 31, P.redHi);
    N.reflect(WET, scene, 0.2, lt);
    slamTag('LATER STORIES', 540, 1120, lt, 0.12, P.white, 50, 9);
  } });
  cue(later + 0.07, 'slam', { gain: 0.65 });

  // ---- line 9: some suspect the cousin ----
  add({ id: 'c9_suspect', at: t9 - 0.05, cam: [540, 820], zoom: 0.12, note: 'magenta turbaned figure dim in the rain; a cyan-white spotlight beam sweeps across the wall and lands on him, he blazes on, SUSPECT? tag; on CROWN a magenta crown ignites over his head', draw: (lt, d) => {
    const fx = 600, fy = 1290, s = 1.55;
    const land = sus - t9 + 0.35, ang = lerp(0.15, 0.62, eio(seg(lt, 0.0, land)));
    const lit = lt > land - 0.05 ? N.ignite(lt, land - 0.05, 4) : 0.25 * N.buzz(lt, 3, 2);
    const cb = N.ignite(lt, crn - t9 + 0.02, 6) * N.buzz(lt, 8, 0.6);
    N.wall(lt + 21, { tone: 'blue', rain: 0.75, wet: WET, glowCol: P.magenta, gx: fx, gy: 900, ga: 0.06 + 0.1 * lit });
    // beam from lamp top-left
    const lx = 90, ly = 140, len = 1500, spread = 0.13;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(lx, ly, 20, lx, ly, len); g.addColorStop(0, rgba(P.cyanHi, 0.42)); g.addColorStop(1, rgba(P.cyan, 0.03));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx, ly);
    ctx.lineTo(lx + Math.cos(ang - spread) * len, ly + Math.sin(ang - spread) * len); ctx.lineTo(lx + Math.cos(ang + spread) * len, ly + Math.sin(ang + spread) * len); ctx.closePath(); ctx.fill();
    ctx.restore();
    N.tube(N.circPts(lx, ly, 34, 24), 1, { col: P.cyan, w: 9, b: 1 }); N.glow(lx, ly, 120, P.cyanHi, 0.6);
    const scene = () => {
      N.halo(fx, fy - 330, 380, P.magenta, lit);
      N.figure(fx, fy, s, { col: P.magenta, b: lit * N.buzz(lt, 5, 0.5), hat: lt < crn - t9 ? 'turban' : null });
      if (lt >= crn - t9) { N.crown(fx, fy + (-380 - 85) * s, 0.55 * s, { col: P.magenta, b: cb, p: seg(lt, crn - t9, crn - t9 + 0.3) }); }
    };
    scene();
    N.sparks(fx, fy - 720, lt, crn - t9 + 0.05, 24, 260, 41, P.magentaHi);
    N.reflect(WET, scene, 0.22, lt);
    slamTag('SUSPECT?', 760, 260, lt, cou - t9, P.white, 50, 12);
  } });
  cue(t9, 'whoosh', { gain: 0.5 }); cue(sus + 0.3, 'zip', { gain: 0.65 }); cue(cou, 'slam', { gain: 0.6 }); cue(crn + 0.02, 'sparkle', { gain: 0.7 }); cue(crn + 0.3, 'heartbeat', { gain: 0.55 });

  add({ id: 'c9_noproof', at: no - 0.05, cam: [540, 820], zoom: 0.1, note: 'neon balance scale: left pan holds the split white/red disc, right pan the magenta crown; it wobbles and settles level, both flicker in lockstep; NO PROOF tag slams', draw: (lt, d) => {
    const tilt = 0.22 * Math.exp(-lt * 2.2) * Math.cos(lt * 9);
    const b = N.ignite(lt, 0, 3), both = N.buzz(lt, 51, 2.5);
    N.wall(lt + 25, { tone: 'brick', rain: 0.6, wet: WET, glowCol: P.white, gx: 540, gy: 800, ga: 0.08 });
    const scene = () => scale(540, 560, tilt, b, (px, py) => {
      const seam = SEAM(70);
      halfDisc(px - 10, py - 62, 58, -1, P.white, both, seam); halfDisc(px + 10, py - 62, 58, 1, P.red, both, seam);
    }, (px, py) => { N.crown(px, py - 50, 0.5, { col: P.magenta, b: both }); }, lt);
    scene();
    N.reflect(WET, scene, 0.2, lt);
    slamTag('NO PROOF', 540, 240, lt, rec - no + 0.1, P.white, 54, 14);
  } });
  cue(no, 'tock', { gain: 0.6 }); cue(rec + 0.15, 'slam', { gain: 0.7 }); cue(either, 'tock', { gain: 0.5, pan: -0.4 }); cue(either + 0.25, 'tock', { gain: 0.5, pan: 0.4 });

  // ---- line 10: an angry city, or a cousin's plan? ----
  const leftHalf = (lt, b) => {
    N.city(30, 510, 1270, 260, 1, { col: P.red, w: 6, b: 0.35 * b, seed: 3 });
    N.crowd(110, 430, 1290, 4, lt, { torch: true, s: 0.5, b });
  };
  const rightHalf = (lt, b) => {
    N.halo(810, 960, 330, P.magenta, b);
    N.figure(810, 1290, 1.15, { col: P.magenta, b: b * N.buzz(lt, 61, 0.6), hat: 'crown', hatCol: P.magenta });
  };
  add({ id: 'c10_versus', at: t10 - 0.05, cam: [540, 820], zoom: 0.07, note: 'split screen down a white neon divider: left red torch crowd before a red skyline (AN ANGRY CITY?), right the crowned magenta figure (A COUSIN\'S PLAN?); each side blazes on its word', draw: (lt, d) => {
    const la = angry - t10 + 0.05, pl = plan - t10 + 0.05;
    const bl = N.ignite(lt, la - 0.1, 2) * (lt > pl ? 0.55 : 1), br = lt < pl - 0.1 ? 0.2 : N.ignite(lt, pl - 0.1, 5);
    band(0, 540, () => N.wall(lt + 29, { tone: 'red', rain: 0.6, wet: WET, glowCol: P.red, gx: 270, gy: 1000, ga: 0.14 * bl }));
    band(540, 1080, () => N.wall(lt + 31, { tone: 'blue', rain: 0.6, wet: WET, glowCol: P.magenta, gx: 810, gy: 900, ga: 0.14 * br }));
    const scene = () => { band(0, 532, () => leftHalf(lt, bl)); band(548, 1080, () => rightHalf(lt, br)); };
    scene();
    N.reflect(WET, scene, 0.2, lt);
    N.tube([[540, 130], [540, 1440]], seg(lt, 0, 0.3), { col: P.white, w: 10, b: N.buzz(lt, 71, 0.5), tip: true });
    slamTag('AN ANGRY CITY?', 270, 330, lt, la, P.red, 34, 17);
    slamTag("A COUSIN'S PLAN?", 810, 330, lt, pl, P.magenta, 32, 19);
  } });
  cue(t10, 'whoosh', { gain: 0.6 }); cue(angry + 0.05, 'slam', { gain: 0.65, pan: -0.5 }); cue(angry + 0.1, 'rumble', { gain: 0.45, pan: -0.5, dur: 1.2 });
  cue(plan + 0.05, 'slam', { gain: 0.65, pan: 0.5 }); cue(plan + 0.1, 'zip', { gain: 0.5, pan: 0.5 });

  add({ id: 'c10_below', at: tell - 0.05, cam: [540, 900], zoom: 0.06, note: 'both sides shrink to the top; a big white neon arrow ignites and bounces down toward the captions ("tell me below")', draw: (lt, d) => {
    N.wall(lt + 35, { tone: 'brick', rain: 0.55, wet: WET, glowCol: P.white, gx: 540, gy: 1100, ga: 0.08 });
    ctx.save(); ctx.translate(540, 250); ctx.scale(0.5, 0.5); ctx.translate(-540, -500);
    band(0, 532, () => leftHalf(lt, N.buzz(lt, 81, 1)));
    band(548, 1080, () => rightHalf(lt, N.buzz(lt + 0.4, 83, 1)));
    N.tube([[540, 520], [540, 1340]], 1, { col: P.white, w: 10, b: 0.8 });
    ctx.restore();
    const ap = seg(lt, 0.05, 0.4), bob = Math.abs(Math.sin(lt * 7)) * 40 * clamp(ap * 2 - 1);
    const b = N.ignite(lt, 0.05, 7) * N.buzz(lt, 85, 0.5);
    N.halo(540, 1150, 380, P.white, b * 0.7);
    arrowDown(540, 820 + bob, 1370 + bob * 0.6, ap, b);
  } });
  cue(tell, 'zip', { gain: 0.6 }); cue(below, 'pop', { gain: 0.6 });

  add({ id: 'c10_throne', at: watch1 - 0.05, cam: [480, 860], zoom: 0.08, note: 'THE THRONE stutters on in MAGENTA in the rain; beside it the dead grey outline of the crowned amber figure', draw: (lt, d) => {
    throneScene(lt, N.ignite(lt, 0.05, 3, 0.45) * N.buzz(lt, 91, 0.6), lt + 39);
  } });
  cue(watch1, 'zip', { gain: 0.7 }); cue(watch1 + 0.15, 'sparkle', { gain: 0.5 });

  add({ id: 'c10_final', at: watch2 - 0.05, cam: [480, 820], zoom: 0.16, note: 'slow push in on the magenta throne; it flickers hard on "watch the throne", sparks off the backrest, dead amber outline beside it; fades out', draw: (lt, d) => {
    const tt = thr - watch2 + 0.05;
    const fl = lt < tt ? N.buzz(lt, 93, 4) : lt < tt + 0.45 ? (rnd(Math.floor(lt * 30) + 7) > 0.45 ? 1 : 0.15) : N.buzz(lt, 95, 0.8);
    throneScene(lt, fl, lt + 41, () => N.sparks(780, 640, lt, tt + 0.05, 26, 280, 61, P.magentaHi));
  } });
  cue(watch2, 'heartbeat', { gain: 0.7 }); cue(thr, 'thud', { gain: 0.55 }); cue(thr + 0.05, 'sparkle', { gain: 0.6 }); cue(watch2 + 0.1, 'swell', { gain: 0.8, dur: 2.2 });
}

// final motif: magenta throne + dead grey amber figure beside it
function throneScene(lt, b, wt, extra) {
  N.wall(wt, { tone: 'blue', rain: 0.75, wet: WET, glowCol: P.magenta, gx: 680, gy: 860, ga: 0.16 * b });
  const scene = () => {
    N.halo(680, 880, 500, P.magenta, b);
    N.throne(680, 1000, 1.1, { col: P.magenta, b });
    // dead amber king: grey glass outline only
    N.figure(250, 1300, 0.95, { col: P.dead, b: 0.18, hat: 'crown', hatCol: P.dead });
  };
  scene();
  if (extra) extra();
  N.reflect(WET, scene, 0.24, lt);
}
