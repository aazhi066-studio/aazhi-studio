// EPISODE 22 · worker C : "Leather Shadow Puppets", lines 8-11 (the Chola claim / the one-sided record / the debate / end card)
//   c1  L8 -> "rout"          the crowned red brother leads a charge left->right, green puppets flee; THE CHOLAS SAY
//   c2  "rout" -> L9          close: green puppets topple off their rods, red line surges; VICTORY slams on "victory"
//   c3  L9 -> "comes"         seam wipe -> red leather record tablets stack up one by one (punched-dot rows only)
//   c4  "comes" -> "even"     push along the stack to the one empty green slot; CHOLA SIDE ONLY
//   c5  "even" -> "place"     1054? and 1052? swing on rods, a tock each
//   c6  "place" -> L10        leather map, river ribbon, pins wobble between spots; WHERE? then DEBATED stamp
//   c7  L10 -> "only"         a lone small green tablet rises on its rod out of the dark
//   c8  "only" -> "historians" closer on the green tablet; LATER / CHALUKYA RECORD
//   c9  "historians" -> "paid" leather balance: VICTORY tag vs a fallen crown, rocking; A WIN...
//   c10 "paid" -> L11         the crown pan sinks hard; PAID FOR WITH / AN EMPEROR
//   c11 L11 -> "tell"         VICTORY? (red) and DEFEAT REWRITTEN? (green) swing in on rods facing each other
//   c12 "tell" -> "again"     TELL ME BELOW + bouncing leather down arrow
//   c13 "again" -> end        end card: oil lamp centre, WATCH AGAIN, AAZHI; final shadow volley on "arrows"
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, poly } from './art.js';
import * as PP from './puppet.js';

const PAL = PP.PAL, sin = Math.sin, cos = Math.cos;
const pop = (lt, a, d = 0.3) => eob(clamp((lt - a) / d));
const slam = (lt, a, d = 0.22) => { const k = clamp((lt - a) / d); return k <= 0 ? 0 : lerp(1.9, 1, eo(k)); };

// ───────────── local helpers ─────────────
/** an abstract record tablet: rounded leather slab with rows of punched dots (no letters). cached per colour + seed */
function tabletImg(col, dk, seed, w = 340, h = 200) {
  return cached(`c_tab_${col}_${seed}_${w}`, w + 40, h + 40, 1, () => {
    ctx.translate(20, 20);
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, 26); PP.leather(col, dk, 18, 0.95);
    ctx.fillStyle = PAL.hole; const rows = Math.floor((h - 50) / 26);
    for (let r = 0; r < rows; r++) {
      let x = 34; const y = 40 + r * 26;
      while (x < w - 34) { const run = 3 + Math.floor(rnd(seed * 31 + r * 7 + x) * 6);
        for (let k = 0; k < run && x < w - 34; k++, x += 13) { ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, TAU); ctx.fill(); }
        x += 16; }
    }
    ctx.globalAlpha = 1; PP.rosette(w - 30, h - 28, 14, 0.8);
  });
}
const tablet = (col, dk, seed, x, y, s = 1, rot = 0, a = 1, w = 340, h = 200) => {
  const img = tabletImg(col, dk, seed, w, h); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(img, (w + 40) / 2, (h + 40) / 2, 0, 0, s, a); ctx.restore();
};
/** placard held on a rod: pivot at (px,py) (rod bottom off-screen), placard centre `up` px above the pivot, swinging by ang */
function rodPlacard(text, px, py, up, ang, sc, size, col, ink) {
  if (sc <= 0.001) return;
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  ctx.strokeStyle = PAL.rod; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -up); ctx.lineTo(0, H); ctx.stroke();
  PP.placard(text, 0, -up, sc, size, col, ink);
  ctx.restore();
}
/** a crown cut-out (same shape as the king puppet's), base centre at (x,y) */
function crown(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  poly([[-42, 0], [42, 0], [22, -130], [4, -162], [-16, -130]]); PP.leather(PAL.ochre, PAL.leather, 14); PP.rosette(2, -70, 18);
  ctx.restore();
}
/** a leather down arrow, tip at (x,y) */
function downArrow(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly([[0, 0], [-110, -120], [-46, -120], [-46, -260], [46, -260], [46, -120], [110, -120]]); PP.leather(PAL.red, PAL.redDk, 18);
  PP.rosette(0, -170, 26); ctx.restore();
}
const green = (o = {}) => ({ col: PAL.green, dk: PAL.greenDk, ...o });
const shk = (t, th, amp, dur) => { const [x, y] = PP.shake(t, th, amp, dur); ctx.translate(x, y); };
const ground = (y) => { ctx.fillStyle = 'rgba(42,22,8,0.55)'; ctx.fillRect(0, y, W, H - y); };

export function buildC(add, cue) {
  // ── c1 · the charge ─────────────────────────────────────────────
  const c1 = L(8), c2 = Wd('rout', 8), vic = Wd('victory', 8);
  add({ id: 'c1', at: c1, zoom: 0.08, cam: [600, 900], note: 'crowned red brother leads the charge, green puppets flee; THE CHOLAS SAY', draw: (lt, d, t) => {
    PP.screen(t, { hot: [500 + lt * 60, 820] });
    ground(1440);
    // fleeing green puppets ahead (running right) — one stumbles and drops off its rod
    for (let i = 0; i < 3; i++) {
      const x = 560 + i * 200 + lt * (110 + i * 20), fall = i === 1 ? eo(seg(lt, 0.9, 1.5)) : 0;
      PP.warrior(x, 1440 + fall * 80, 0.52, i === 2 ? -1 : 1, green({ shield: true, arm: 40 + 40 * sin(t * 9 + i), step: sin(t * 10 + i * 2), tilt: 0.12 + fall * 1.3, rodA: fall ? 0 : 0.7 }));
    }
    // red line behind the leader
    for (let i = 0; i < 3; i++) PP.warrior(-60 + i * 150 + lt * 150, 1450 + (i % 2) * 20, 0.54, 1, { weapon: 'spear', arm: 80 + 6 * sin(t * 8 + i), step: sin(t * 11 + i * 1.7), tilt: 0.1 });
    // the crowned brother, sword up
    PP.warrior(330 + lt * 140, 1470, 0.74, 1, { crown: 1, weapon: 'sword', arm: 150 + 12 * sin(t * 7), step: sin(t * 10), tilt: 0.14 });
    PP.volley(seg(lt, 0.2, 1.6), 8, 31, 1, 380, 900);
    PP.stageFrame(t, 0.6); PP.lampEdge();
    PP.placard('THE CHOLAS SAY', 560, 330, pop(lt, 0.15), 72, PAL.ochre);
  } });
  cue(c1, 'drum', { gain: 0.8 }); cue(c1 + 0.05, 'whoosh', { gain: 0.6 }); cue(c1 + 0.15, 'pop', { gain: 0.5 }); cue(c1 + 1.0, 'thud', { gain: 0.6 });

  // ── c2 · the rout turns: green topple, VICTORY slams ────────────
  add({ id: 'c2', at: c2, zoom: 0.07, cam: [540, 1000], note: 'green puppets topple off their rods, red surges; VICTORY slams', draw: (lt, d, t) => {
    const vt = vic - c2;
    ctx.save(); shk(t, vic, 30, 0.4);
    PP.screen(t, { hot: [560, 900] }); ground(1460);
    for (let i = 0; i < 4; i++) {
      const fall = eo(seg(lt, 0.15 + i * 0.22, 0.65 + i * 0.22)), x = 520 + i * 150 + fall * 60;
      PP.warrior(x, 1450 + fall * 120, 0.5, i % 2 ? -1 : 1, green({ shield: i % 2 === 0, arm: 30 + fall * 70, tilt: fall * (1.2 + i * 0.1), rodA: 0.7 * (1 - seg(lt, 0.15 + i * 0.22, 0.3 + i * 0.22)) }));
    }
    // the abandoned rods stay standing, empty
    for (let i = 0; i < 4; i++) PP.rod(530 + i * 150, 1290 - 40 * sin(t * 3 + i), 0.06, 0.55 * seg(lt, 0.3 + i * 0.22, 0.5 + i * 0.22));
    PP.warrior(250 + lt * 70, 1480, 0.72, 1, { crown: 1, weapon: 'sword', arm: 120 + 50 * eo(seg(lt, vt - 0.3, vt)), step: sin(t * 6) * 0.5 });
    PP.warrior(70 + lt * 60, 1470, 0.56, 1, { weapon: 'spear', arm: 90, step: sin(t * 7 + 1) * 0.5 });
    PP.flash(seg(lt, vt, vt + 0.4), '255,231,168', 0.5);
    PP.stageFrame(t, seg(lt, vt, vt + 0.2) * (1 - seg(lt, vt + 0.3, vt + 1))); PP.lampEdge();
    ctx.restore();
    PP.placard('VICTORY', 540, 520, slam(lt, vt), 140, PAL.red, PAL.clothHot, sin(t * 2) * 0.03);
  } });
  cue(c2, 'whoosh', { gain: 0.5 }); for (let i = 0; i < 4; i++) cue(c2 + 0.5 + i * 0.22, 'thud', { gain: 0.45 });
  cue(vic, 'slam', { gain: 1 }); cue(vic, 'drum', { gain: 0.9 }); cue(vic + 0.05, 'swell', { gain: 0.5, dur: 1 });

  // ── c3 / c4 · seam wipe to the stack of red records ─────────────
  const c3 = L(9), c4 = Wd('comes', 9), side = Wd('side', 9);
  const STACK = [[300, 1260, -0.04], [700, 1270, 0.05], [500, 1080, 0.02], [260, 890, -0.06], [740, 900, 0.03], [480, 710, -0.02]];
  const drawStack = (lt, t, gapA = 0) => {
    STACK.forEach(([x, y, r], i) => {
      const k = eo(clamp((lt - i * 0.22) / 0.3)); if (k <= 0) return;
      if (i === 5) { // the missing green slot: empty dashed outline
        if (gapA <= 0) return;
        ctx.save(); ctx.globalAlpha = gapA; ctx.setLineDash([14, 12]); ctx.lineWidth = 6; ctx.strokeStyle = PAL.greenDk;
        ctx.beginPath(); ctx.roundRect(x - 120, y - 70, 240, 140, 22); ctx.fillStyle = 'rgba(42,69,32,0.18)'; ctx.fill(); ctx.stroke(); ctx.restore(); return;
      }
      tablet(PAL.red, PAL.redDk, i + 3, x, y - (1 - k) * 260 + sin(t * 2 + i) * 4, 1, r + sin(t * 1.5 + i) * 0.01, k);
    });
  };
  add({ id: 'c3', at: c3, zoom: 0.06, cam: [540, 1000], note: 'seam wipe -> red record tablets stack up (dot rows only)', draw: (lt, d, t) => {
    PP.screen(t, { hot: [520, 960] }); drawStack(lt + 0.15, t, 0);
    PP.stageFrame(t); PP.lampEdge();
    PP.seamWipe(seg(lt, -0.05, 0.4));
  } });
  cue(c3, 'zip', { gain: 0.6 }); for (let i = 0; i < 5; i++) cue(c3 + i * 0.22 + 0.15, 'tock', { gain: 0.35 });
  add({ id: 'c4', at: c4, zoom: 0.1, cam: [480, 760], note: 'push to the one empty green slot; CHOLA SIDE ONLY', draw: (lt, d, t) => {
    PP.screen(t, { hot: [480, 760] }); drawStack(5, t, 0.4 + 0.5 * seg(lt, 0.1, 0.6) + 0.1 * sin(t * 6));
    PP.rod(300, 1330, -0.03, 0.6); PP.rod(700, 1340, 0.04, 0.6);
    PP.stageFrame(t); PP.lampEdge();
    PP.placard('CHOLA SIDE ONLY', 500, 420, pop(lt, side - c4 - 0.1), 68, PAL.red, PAL.clothHot);
  } });
  cue(c4, 'slide', { gain: 0.4 }); cue(side - 0.1, 'pop', { gain: 0.7 }); cue(side, 'thud', { gain: 0.4 });

  // ── c5 · the date: 1054? / 1052? ─────────────────────────────────
  const c5 = Wd('even', 9), dt = Wd('date', 9);
  add({ id: 'c5', at: c5, zoom: 0.05, note: '1054? and 1052? swing on rods', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 820] });
    PP.stageFrame(t); PP.lampEdge();
    const a = dt - c5;
    rodPlacard('1054?', 400, 1700, 1000, -0.05 + 0.08 * sin(t * 3.2), pop(lt, a - 0.05), 110, PAL.ochre, PAL.leather);
    rodPlacard('1052?', 700, 1700, 640, 0.05 - 0.08 * sin(t * 3.0 + 1), pop(lt, a + 0.3), 110, PAL.ochre, PAL.leather);
  } });
  cue(c5, 'slide', { gain: 0.35 }); cue(dt - 0.05, 'tock', { gain: 0.7 }); cue(dt + 0.3, 'tock', { gain: 0.7 });

  // ── c6 · the place: map, wobbling pins, DEBATED ──────────────────
  const c6 = Wd('place', 9), deb = Wd('debated', 9);
  const mapImg = () => cached('c_map', 900, 1040, 1, () => {
    ctx.translate(450, 520);
    poly([[-400, -470], [-120, -500], [180, -460], [410, -490], [390, -120], [420, 200], [380, 480], [80, 450], [-200, 490], [-410, 460], [-380, 120], [-420, -200]]); PP.leather(PAL.ochre, PAL.ochreDk, 22, 0.9);
    ctx.lineCap = 'round'; ctx.strokeStyle = PAL.indigoDk; ctx.lineWidth = 50;
    const rv = () => { ctx.beginPath(); ctx.moveTo(-420, -260); ctx.bezierCurveTo(-160, -320, -200, 40, 20, 20); ctx.bezierCurveTo(240, 0, 160, 340, 420, 300); };
    rv(); ctx.stroke(); ctx.strokeStyle = PAL.indigo; ctx.lineWidth = 34; rv(); ctx.stroke();
    ctx.setLineDash([3, 22]); ctx.strokeStyle = PAL.hole; ctx.lineWidth = 7; rv(); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 6; i++) PP.rosette(-300 + rnd(i + 40) * 600, -380 + rnd(i + 50) * 760, 22, 0.6);
  });
  const SPOTS = [[[-180, -140], [120, 160]], [[60, -60], [-120, 260]], [[220, 120], [-40, -240]]];
  add({ id: 'c6', at: c6, zoom: 0.07, cam: [540, 960], note: 'leather map, river ribbon, pins wobble between spots; WHERE? / DEBATED', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 960] });
    const my = 1000 + sin(t * 1.3) * 8, mr = sin(t * 0.9) * 0.015;
    ctx.save(); ctx.translate(540, my); ctx.rotate(mr); blit(mapImg(), 450, 520, 0, 0, 1, eo(seg(lt, 0, 0.25)));
    SPOTS.forEach(([A, B], i) => {
      const k = 0.5 + 0.5 * sin(t * (2.2 + i * 0.5) + i * 2), x = lerp(A[0], B[0], eio(k)), y = lerp(A[1], B[1], eio(k)), hop = Math.abs(sin(t * (4.4 + i) + i * 2)) * 30;
      ctx.fillStyle = 'rgba(20,8,2,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 22, 8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = PAL.leather; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 60 - hop); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - 78 - hop, 26, 0, TAU); PP.leather(PAL.red, PAL.redDk, 0); PP.rosette(x, y - 78 - hop, 14);
    });
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge();
    const a = deb - c6;
    PP.placard('WHERE?', 540, 300, pop(lt, 0.05) * (1 - 0.15 * seg(lt, a, a + 0.2)), 110, PAL.ochre, PAL.leather, sin(t * 2.5) * 0.04);
    PP.placard('DEBATED', 560, 640, slam(lt, a), 120, PAL.red, PAL.clothHot, -0.1);
  } });
  cue(c6, 'whoosh', { gain: 0.4 }); cue(c6 + 0.05, 'pop', { gain: 0.6 }); cue(deb, 'slam', { gain: 0.9 });

  // ── c7 / c8 · the lone green tablet ──────────────────────────────
  const c7 = L(10), c8 = Wd('only', 10), later = Wd('later', 10);
  add({ id: 'c7', at: c7, zoom: 0.08, cam: [540, 1000], note: 'a lone small green tablet rises on its rod', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 1000], dim: 0.35 * (1 - seg(lt, 0, 1.4)) + 0.12 });
    const y = lerp(1500, 930, eo(seg(lt, 0.1, 1.4))) + sin(t * 2) * 8;
    PP.rod(540, y + 100, 0.0, 0.8);
    tablet(PAL.green, PAL.greenDk, 9, 540, y, 1.4, sin(t * 1.4) * 0.03, 1, 280, 170);
    PP.stageFrame(t); PP.lampEdge(0.7);
  } });
  cue(c7, 'whoosh', { gain: 0.4 }); cue(c7 + 0.1, 'rumble', { gain: 0.3, dur: 1.3 });
  add({ id: 'c8', at: c8, zoom: 0.07, cam: [540, 900], note: 'closer on the green tablet; LATER / CHALUKYA RECORD', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 960], dim: 0.12 });
    ctx.save(); ctx.globalAlpha = 0.25; tablet(PAL.red, PAL.redDk, 3, 200, 760, 0.8, -0.1); tablet(PAL.red, PAL.redDk, 4, 880, 820, 0.8, 0.1); ctx.restore();
    const y = 1010 + sin(t * 2) * 10;
    PP.rod(540, y + 150, 0.0, 0.8);
    tablet(PAL.green, PAL.greenDk, 9, 540, y, 1.6, sin(t * 1.4) * 0.03, 1, 280, 170);
    PP.stageFrame(t); PP.lampEdge(0.65);
    const a = later - c8 - 0.15;
    PP.placard('LATER', 540, 330, pop(lt, a), 80, PAL.ochre, PAL.leather);
    PP.placard('CHALUKYA RECORD', 540, 500, pop(lt, a + 0.2), 66, PAL.green, PAL.clothHot);
  } });
  cue(later - 0.15, 'pop', { gain: 0.6 }); cue(later + 0.05, 'pop', { gain: 0.6 });

  // ── c9 / c10 · the balance ───────────────────────────────────────
  const c9 = Wd('historians', 10), win = Wd('win', 10), c10 = Wd('paid', 10), emp = Wd('emperor', 10);
  const balance = (ang, t) => {
    const cx = 540, cy = 760, arm = 330;
    poly([[cx - 26, cy], [cx + 26, cy], [cx + 34, 1380], [cx - 34, 1380]]); PP.leather(PAL.ochre, PAL.ochreDk, 18);
    poly([[cx - 200, 1400], [cx + 200, 1400], [cx + 150, 1340], [cx - 150, 1340]]); PP.leather(PAL.indigo, PAL.indigoDk, 16);
    PP.rod(cx, 1400, 0, 0.7);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); poly([[-arm - 20, -16], [arm + 20, -16], [arm + 20, 16], [-arm - 20, 16]]); PP.leather(PAL.ochre, PAL.leather, 16); ctx.restore();
    PP.rosette(cx, cy, 30);
    [-1, 1].forEach((k, i) => {
      const x = cx + k * arm * cos(ang), y = cy + k * arm * sin(ang);
      const sw = sin(t * 2.6 + i) * 0.04, px = x + sin(sw) * 300, py = y + 300;
      ctx.strokeStyle = PAL.leather; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(px - 110, py); ctx.moveTo(x, y); ctx.lineTo(px + 110, py); ctx.stroke();
      if (i === 0) PP.placard('VICTORY', px, py - 50, 1, 44, PAL.red, PAL.clothHot, sw);
      else crown(px + 20, py - 4, 0.95, -0.55 + sw);
      ctx.beginPath(); ctx.ellipse(px, py, 130, 34, sw, 0, Math.PI); ctx.closePath(); PP.leather(PAL.indigo, PAL.indigoDk, 14);
      PP.rosette(x, y, 12);
    });
  };
  add({ id: 'c9', at: c9, zoom: 0.06, cam: [540, 900], note: 'leather balance: VICTORY tag vs fallen crown, rocking; A WIN...', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 820] });
    balance(0.16 * sin(t * 2.1) * (1 - 0.4 * seg(lt, 0, d)), t);
    PP.stageFrame(t); PP.lampEdge();
    PP.placard('A WIN...', 540, 260, pop(lt, win - c9 - 0.1), 110, PAL.red, PAL.clothHot, sin(t * 2) * 0.03);
  } });
  cue(c9, 'slide', { gain: 0.4 }); cue(c9 + 0.2, 'tock', { gain: 0.3 }); cue(win - 0.1, 'pop', { gain: 0.7 });
  add({ id: 'c10', at: c10, zoom: 0.09, cam: [700, 1000], note: 'the crown pan sinks hard; PAID FOR WITH / AN EMPEROR', draw: (lt, d, t) => {
    ctx.save(); shk(t, c10 + 0.35, 22, 0.35);
    PP.screen(t, { hot: [600, 900], dim: 0.3 * seg(lt, 0.4, d) });
    const k = eob(seg(lt, 0.05, 0.45)); balance(lerp(0.05, 0.4, k) + sin(t * 9) * 0.012 * (1 - seg(lt, 0.4, 1.5)), t);
    PP.stageFrame(t, seg(lt, 0.3, 0.5) * (1 - seg(lt, 0.7, 1.4))); PP.lampEdge(0.7);
    ctx.restore();
    PP.placard('PAID FOR WITH', 540, 260, pop(lt, 0.0), 84, PAL.ochre, PAL.leather);
    PP.placard('AN EMPEROR', 540, 430, slam(lt, emp - c10), 110, PAL.red, PAL.clothHot, -0.03);
  } });
  cue(c10, 'pop', { gain: 0.6 }); cue(c10 + 0.35, 'thud', { gain: 0.9 }); cue(emp, 'slam', { gain: 0.9 }); cue(emp, 'bell', { gain: 0.4, dur: 1.5 });

  // ── c11 · VICTORY? vs DEFEAT REWRITTEN? ─────────────────────────
  const c11 = L(11), def = Wd('defeat', 11);
  add({ id: 'c11', at: c11, zoom: 0.06, note: 'VICTORY? (red) and DEFEAT REWRITTEN? (green) swing in facing each other', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540 + sin(t * 1.6) * 200, 860] });
    ctx.fillStyle = 'rgba(184,50,42,0.10)'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = 'rgba(78,122,58,0.12)'; ctx.fillRect(W / 2, 0, W / 2, H);
    PP.warrior(250, 1460, 0.42, 1, { crown: 1, weapon: 'sword', arm: 110 + 15 * sin(t * 3), step: sin(t * 2) * 0.3 });
    PP.warrior(830, 1460, 0.42, -1, green({ shield: true, arm: 60 + 15 * sin(t * 3 + 1), step: sin(t * 2 + 1) * 0.3 }));
    PP.stageFrame(t); PP.lampEdge();
    const sa = eo(seg(lt, 0, 0.35)), sb = eo(seg(lt, def - c11 - 0.1, def - c11 + 0.25));
    rodPlacard('VICTORY?', lerp(-300, 360, sa), 1750, 1350, 0.04 + 0.04 * sin(t * 3) - (1 - sa) * 0.5, 1, 84, PAL.red, PAL.clothHot);
    if (sb > 0) {
      rodPlacard('DEFEAT', lerp(1380, 720, sb), 1750, 1020, -0.04 - 0.04 * sin(t * 3 + 1) + (1 - sb) * 0.5, 1, 84, PAL.green, PAL.clothHot);
      PP.placard('REWRITTEN?', lerp(1500, 680, sb), 870 + sin(t * 3 + 1) * 10, 1, 68, PAL.green, PAL.clothHot, -0.04);
    }
  } });
  cue(c11, 'whoosh', { gain: 0.7 }); cue(c11 + 0.3, 'tock', { gain: 0.5 }); cue(def - 0.1, 'whoosh', { gain: 0.7 }); cue(def + 0.25, 'tock', { gain: 0.5 });

  // ── c12 · TELL ME BELOW ─────────────────────────────────────────
  const c12 = Wd('tell', 11), bel = Wd('below', 11);
  add({ id: 'c12', at: c12, zoom: 0.05, note: 'TELL ME BELOW + bouncing leather down arrow', draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 1000] });
    const b = Math.abs(sin(t * 5.5)) * 60;
    PP.rod(540, 1100 + b, 0, 0.7);
    downArrow(540, 1300 + b, 1.15 * eob(seg(lt, 0.1, 0.4)));
    PP.stageFrame(t); PP.lampEdge();
    PP.placard('TELL ME', 540, 420, pop(lt, 0), 110, PAL.ochre, PAL.leather, sin(t * 2) * 0.03);
    PP.placard('BELOW', 540, 640, pop(lt, bel - c12 - 0.05), 130, PAL.red, PAL.clothHot, -sin(t * 2) * 0.03);
  } });
  cue(c12, 'pop', { gain: 0.7 }); cue(bel - 0.05, 'pop', { gain: 0.8 }); cue(c12 + 0.4, 'drum', { gain: 0.4 });

  // ── c13 · end card ──────────────────────────────────────────────
  const c13 = Wd('again', 11), arr = Wd('arrows', 11);
  add({ id: 'c13', at: c13, zoom: 0.05, cam: [540, 1000], note: 'end card: oil lamp, WATCH AGAIN, AAZHI; shadow volley on "arrows"', draw: (lt, d, t) => {
    const a = arr - c13;
    PP.screen(t, { hot: [540, 1000], dim: 0.15 });
    PP.oilLamp(540, 1360, 2.1, t);
    const g = ctx.createRadialGradient(540, 920, 0, 540, 920, 520 * PP.flick(t)); g.addColorStop(0, 'rgba(255,220,140,0.35)'); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1200);
    ctx.save(); shk(t, arr + 0.25, 10, 0.3);
    PP.volley(seg(lt, a - 0.1, a + 1.0), 14, 77, 1, 260, 1200);
    PP.volley(seg(lt, a + 0.35, a + 1.5), 10, 91, -1, 300, 1200);
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge();
    PP.placard('WATCH AGAIN', 540, 400, pop(lt, 0), 104, PAL.ochre, PAL.leather, sin(t * 2) * 0.025);
    PP.placard('AAZHI', 540, 600, pop(lt, 0.25), 60, PAL.red, PAL.clothHot);
  } });
  cue(c13, 'swell', { gain: 0.5, dur: 1.5 }); cue(c13 + 0.25, 'pop', { gain: 0.5 }); cue(arr - 0.1, 'whoosh', { gain: 0.9 }); cue(arr + 0.35, 'whoosh', { gain: 0.8 }); cue(arr + 0.25, 'drum', { gain: 0.6 });
}
