// v23 worker A: script lines 0-3 (hook, Madurai 1310, chroniclers' favour, the strike). Shots run from 0 until L(4).
import * as CH from './chess.js';
import { L, Le, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line, circle, ell } from './core/lib.js';
import { cached, blit, rgba } from './art.js';

const P = CH.PAL;
const KING = (u, v, o = {}) => ({ k: 'king', col: 'gold', u, v, ...o });
const SUN = (u, v, o = {}) => ({ k: 'prince', col: 'ivory', sash: P.blood, u, v, ...o });
const VIRA = (u, v, o = {}) => ({ k: 'prince', col: 'ebony', sash: P.indigo, glow: 0.55, glowCol: P.ivoryMid, u, v, ...o });
const PAWN = (u, v, col, o = {}) => ({ k: 'pawn', col, u, v, s: 0.5, ...(col === 'ebony' ? { glow: 0.35, glowCol: P.ivoryMid } : {}), ...o });

// the board + depth-sorted pieces + spotlight + motes. o: { under(proj), after(proj, list), spot(proj, list) -> [x,y,r,dark], tint, motes }
function stage(t, bo, pcs, o = {}) {
  CH.table(t, o.tint || 0);
  const proj = CH.board(bo);
  if (o.under) o.under(proj);
  const list = pcs.map((p) => { const [x, y, z] = proj(p.u + 0.5, p.v + 0.5); return { ...p, x: x + (p.dx || 0), y: y + (p.dy || 0), z }; }).sort((a, b) => a.y - b.y);
  for (const p of list) CH.piece(p.k, p.x, p.y, p.z * (p.s ?? 0.62), p);
  if (o.after) o.after(proj, list);
  if (o.spot) { const s = o.spot(proj, list); CH.spot(s[0], s[1], s[2], s[3] ?? 0.88, t); }
  if (o.motes !== false) CH.motes(t, 34, o.seed || 0, list[0] ? list[0].x : 540);
  return { proj, list };
}
const find = (list, k, col) => list.find((p) => p.k === k && p.col === col);
function shake(lt, t0, amp, dur = 0.35) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return; const a = amp * k * k; ctx.translate(Math.sin(lt * 91) * a, Math.cos(lt * 77) * a); }
// speed streaks behind a sliding piece
function streaks(x, y, dir, a, len = 220) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a) * 0.7;
  for (let i = 0; i < 6; i++) { const yy = y - 40 - i * 34, l = len * (0.5 + rnd(i + 3) * 0.6); line([[x - dir * 70, yy], [x - dir * (70 + l), yy]], i % 2 ? P.ivory : P.blood, 5); }
  ctx.restore();
}
// carved ivory tally marks (groups of five), n of total shown
function tally(cx, cy, n, total = 40, sc = 1) {
  const groups = Math.ceil(total / 5), gw = 92 * sc, cols = 4, rows = Math.ceil(groups / cols);
  for (let i = 0; i < Math.floor(n); i++) {
    const g = Math.floor(i / 5), j = i % 5, gx = cx + ((g % cols) - (cols - 1) / 2) * gw * 1.25, gy = cy + (Math.floor(g / cols) - (rows - 1) / 2) * 110 * sc;
    const k = clamp(n - i);
    if (j < 4) { const x = gx - 30 * sc + j * 20 * sc; line([[x + 4, gy - 38 * sc + 6], [x + 4, gy - 38 * sc + 6 + 76 * sc * k]], 'rgba(0,0,0,0.7)', 11 * sc); line([[x, gy - 38 * sc], [x, gy - 38 * sc + 76 * sc * k]], P.ivory, 10 * sc); }
    else { line([[gx - 44 * sc + 4, gy + 30 * sc + 6], [gx - 44 * sc + 4 + 92 * sc * k, gy - 26 * sc + 6 - 56 * sc * (k - 1) * 0]], 'rgba(0,0,0,0.7)', 11 * sc); line([[gx - 44 * sc, gy + 30 * sc], [lerp(gx - 44 * sc, gx + 46 * sc, k), lerp(gy + 30 * sc, gy - 26 * sc, k)]], P.blood, 10 * sc); }
  }
}
// small persistent tag in the corner after the big pop
function cornerTag(text, lt, o = {}) { const k = eob(clamp(lt / 0.3)); CH.tag(text, o.x ?? 540, o.y ?? 210, { sc: k * (o.sc ?? 0.85), rot: o.rot ?? -0.03, ink: o.ink }); }
// marble wipe-in at the end of a shot (p 0->1 over the last w s)
const wipeOut = (lt, d, w = 0.32) => eio(clamp((lt - (d - w)) / w));
const wipeIn = (lt, w = 0.36) => 1 - eio(clamp(lt / w));
// perspective ink bloom on the board surface at a projected point
function boardInk(x, y, r, p, col, t) { ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.42); CH.inkDrop(0, 0, r, p, col, t); ctx.restore(); }
// a cached parchment pair (static rows fully written) - drawn live while writing, cache only used as a backdrop element
const fishGlow = (x, y, s, a) => { const g = ctx.createRadialGradient(x, y, 10, x, y, 260 * s); g.addColorStop(0, rgba(P.gold, 0.35 * a)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 300 * s, y - 300 * s, 600 * s, 600 * s); };

export function buildA(add, cue) {
  // ---------------- LINE 0: HOOK ----------------
  const tKill = Wd('kill', 0), tFather = Wd('father', 0);
  // a0: impact close-up - ivory prince already lunging at frame 0, gold king toppling, red flash + slam
  add({ id: 'a0_strike', at: 0, cam: [540, 980], zoom: 0.1, note: 'HOOK: ivory prince slams the gold king, red flash, crack bursts',
    draw(lt, d, t) {
      ctx.save(); shake(lt, 0.0, 26, 0.5);
      const hit = 0.1, su = lerp(1.7, 3.05, eo(clamp(lt / hit))) - 0.12 * eo(seg(lt, hit, 0.5));
      const tip = 1.52 * eio(seg(lt, 0.04, 0.75)) + 0.06 * Math.sin(seg(lt, 0.75, 1.1) * Math.PI) * (lt > 0.75 ? 1 : 0);
      stage(t, { cx: 560, cy: 1060, size: 2300, tilt: 0.78, rot: 0.12 - lt * 0.12, crack: 0 },
        [SUN(su, 4.0, { s: 0.6 }), KING(4.05, 4.05, { s: 0.6, tip, glow: 0.4 }), PAWN(5.6, 2.6, 'ebony'), PAWN(1.3, 2.3, 'ivory')],
        { seed: 1,
          under: (proj) => { const a = proj(4.4, 4.5), b = proj(8.2, 7.4), c = proj(1.0, 8.4); CH.crackLine(a, b, seg(lt, 0.05, 0.45), 3, 10); CH.crackLine(a, c, seg(lt, 0.15, 0.6), 5, 8); CH.crackLine(a, proj(6.5, 0), seg(lt, 0.1, 0.5), 9, 7); },
          after: (proj, list) => { const s = find(list, 'prince', 'ivory'); streaks(s.x, s.y, 1, 1 - seg(lt, 0, 0.3), 300); },
          spot: (proj) => { const p = proj(3.6, 4.4); return [p[0], p[1] - 220, 820, 0.86]; } });
      ctx.restore();
      CH.redFlash(Math.max(0.75 * (1 - lt / 0.3), 0.6 * (1 - seg(lt, hit, hit + 0.3))));
      CH.vig(0.6);
    } });
  cue(0, 'slam', { gain: 1 }); cue(0.02, 'thud', { gain: 1 }); cue(0.55, 'thud', { gain: 0.6 });

  // a1: wide, spinning board, the crack races down the middle file, king lies fallen
  add({ id: 'a1_crack', at: tKill - 0.02, cam: [540, 900], zoom: 0.08, note: 'HOOK: board spins, crack races across, fallen king, second red flash on "father"',
    draw(lt, d, t) {
      const f2 = tFather - (tKill - 0.02);
      ctx.save(); shake(lt, f2, 18, 0.4);
      const rot = lerp(-0.55, 0.12, eo(clamp(lt / d)));
      stage(t, { cx: 540, cy: 880, size: 960, tilt: 0.42, rot, crack: eio(seg(lt, 0.05, 0.75)), crackW: 9, split: 0.25 * eo(seg(lt, f2, f2 + 0.45)) },
        [KING(3.9, 3.6, { tip: 1.5, s: 0.58 }), SUN(2.7, 3.7, { s: 0.6, glow: 0.5 * seg(lt, f2, f2 + 0.2), glowCol: P.blood }), VIRA(5.2, 1.6, { s: 0.52 }),
          PAWN(1, 6, 'ivory'), PAWN(6, 6, 'ebony'), PAWN(2, 1, 'ebony'), PAWN(6.5, 4.5, 'ivory')],
        { seed: 2, spot: (proj) => { const p = proj(3.6, 4); return [p[0], p[1] - 120, lerp(560, 760, lt / d), 0.84]; } });
      ctx.restore();
      CH.redFlash(Math.max(0.55 * (1 - lt / 0.2), 0.9 * (1 - seg(lt, f2, f2 + 0.3)) * (lt >= f2 ? 1 : 0)));
      CH.vig(0.55);
      CH.marble(t, wipeOut(lt, d, 0.3), { seed: 4, x: 540, y: 820, cols: [P.blood, P.ink, P.bloodDk, P.paper] });
    } });
  cue(tKill - 0.02, 'whoosh', { gain: 0.7 }); cue(tKill + 0.05, 'zip', { gain: 0.6 }); cue(tFather, 'slam', { gain: 0.9 }); cue(L(1) - 0.35, 'whoosh', { gain: 0.6 });

  // ---------------- LINE 1: MADURAI c.1310, ~40 years ----------------
  const tThirteen = Wd('thirteen', 1), tKing = Wd('king', 1), tKul = Wd('kulasekhara', 1), tRuled = Wd('ruled', 1), tForty = Wd('forty', 1);
  const court = (o = {}) => [KING(3.5, 3.5, { s: 0.62, glow: o.kg ?? 0.5 }), SUN(2.5, 4.6, { s: 0.58 }), VIRA(4.6, 4.6, { s: 0.58 }),
    PAWN(1, 6, 'ivory'), PAWN(2, 6, 'ivory'), PAWN(5, 6, 'ebony'), PAWN(6, 6, 'ebony'), PAWN(1.5, 1.5, 'ivory'), PAWN(5.5, 1.5, 'ebony')];
  // a2: MADURAI carved title over the slowly spinning board, spotlight iris opens, emblem on the rim
  add({ id: 'a2_madurai', at: L(1) - 0.27, cam: [540, 860], zoom: 0.09, note: 'MADURAI carved title, iris opens on the full board, fish emblem on rim',
    draw(lt, d, t) {
      stage(t, { cx: 540, cy: 960, size: 900, tilt: 0.5, rot: lerp(0.5, 0.15, eo(clamp(lt / d))) },
        court(), { seed: 3, after: (proj) => { const p = proj(4, 8.38); CH.fish2(p[0], p[1] + 6, 0.55 * p[2], P.gold); },
          spot: (proj) => { const p = proj(4, 4); return [p[0], p[1] - 100, lerp(260, 700, eo(clamp(lt / 0.7))), 0.9]; } });
      CH.marble(t, wipeIn(lt, 0.3), { seed: 4, x: 540, y: 820, cols: [P.blood, P.ink, P.bloodDk, P.paper] });
      CH.title('MADURAI', 540, 400, 170, seg(lt, 0.2, 0.9));
      CH.vig(0.5);
    } });
  cue(L(1) + 0.02, 'chisel', { gain: 0.7 });

  // a3: 1310 - low tilting push on the gold king, year carved large
  add({ id: 'a3_1310', at: tThirteen - 0.06, cam: [540, 760], zoom: 0.1, note: '"around 1310": carved 1310 rises, board tilts up toward camera',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d));
      stage(t, { cx: 540, cy: lerp(1120, 1060, k), size: 1500, tilt: lerp(0.35, 0.7, k), rot: lerp(-0.25, -0.05, k) },
        court({ kg: 0.7 }), { seed: 4, spot: (proj) => { const p = proj(4, 4); return [p[0], p[1] - 180, 640, 0.9]; } });
      CH.title('1310', 540, 470, 280, seg(lt, 0.05, 0.6), { edge: P.gold });
      ctx.save(); ctx.globalAlpha = eo(seg(lt, 0.35, 0.7)); ctx.font = '900 52px Inter'; ctx.letterSpacing = '10px'; ctx.textAlign = 'center';
      ctx.fillStyle = '#000'; ctx.fillText('AROUND', 544, 196); ctx.fillStyle = P.sandal; ctx.fillText('AROUND', 540, 190); ctx.restore(); ctx.letterSpacing = '0px';
      CH.vig(0.5);
    } });
  cue(tThirteen - 0.06, 'whoosh', { gain: 0.5 }); cue(tThirteen + 0.05, 'chisel', { gain: 0.8 });

  // a4: the gold king close, low angle; the twin-fish emblem glowing behind; ILLUSTRATION tag
  add({ id: 'a4_king', at: tKing - 0.05, cam: [540, 820], zoom: 0.1, note: 'King Kulasekhara = gold king close-up, Pandya twin fish glow, ILLUSTRATION tag',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d));
      CH.table(t);
      const ex = 540, ey = 400, es = 1.6 + 0.15 * k;
      fishGlow(ex, ey, 1.6, eo(seg(lt, 0.1, 0.6)));
      ctx.save(); ctx.globalAlpha = eo(seg(lt, 0.05, 0.45)); ctx.translate(ex, ey); ctx.rotate(Math.sin(t * 1.2) * 0.05); ctx.scale(es / 1.6, es / 1.6);
      circle(6, 10, 190, 'rgba(0,0,0,0.6)'); circle(0, 0, 190, P.ebony); ctx.strokeStyle = P.gold; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 178, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(P.gold, 0.6); ctx.beginPath(); ctx.arc(0, 0, 156, 0, TAU); ctx.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 0.3; circle(Math.cos(a) * 167, Math.sin(a) * 167, 4, P.gold); }
      ctx.rotate(-0.25); CH.fish2(0, 0, 1.75, P.gold); ctx.restore();
      const { list } = (() => {
        const proj = CH.board({ cx: 540, cy: 1250, size: 2200, tilt: 0.72, rot: lerp(0.18, -0.06, k) });
        const pr = proj(4, 4.6); const s = pr[2] * 0.62;
        CH.piece('king', pr[0], pr[1], s, { col: 'gold', glow: 0.6 + 0.3 * Math.sin(t * 5) });
        const pv = proj(6.6, 3.2); CH.piece('prince', pv[0], pv[1], pv[2] * 0.58, { col: 'ebony', sash: P.indigo, glow: 0.5, glowCol: P.ivoryMid });
        const ps = proj(1.5, 3.2); CH.piece('prince', ps[0], ps[1], ps[2] * 0.58, { col: 'ivory', sash: P.blood });
        CH.spot(pr[0], pr[1] - 250 * s, 720, 0.82, t);
        return { list: [] };
      })();
      CH.motes(t, 40, 5);
      // sparkle glint on the crown at "Kulasekhara"
      const gk = seg(t, tKul, tKul + 0.5); if (gk > 0 && gk < 1) { ctx.save(); ctx.globalAlpha = Math.sin(gk * Math.PI); ctx.translate(560, 560); ctx.rotate(gk * 2); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); line([[-60, 0], [60, 0]], '#FFF3C8', i % 2 ? 3 : 6); } ctx.restore(); }
      CH.tag('ILLUSTRATION', 540, 175, { sc: eob(seg(lt, 0.15, 0.45)) * 0.8, ink: P.ink, size: 46 });
      CH.vig(0.45);
    } });
  cue(tKing - 0.05, 'whoosh', { gain: 0.5 }); cue(tKul + 0.1, 'sparkle', { gain: 0.6 }); cue(tKing + 0.2, 'pop', { gain: 0.4 });

  // a5: time passing - board seen from above turns, the spotlight sweeps like a sun, tally marks carve in
  add({ id: 'a5_years', at: tRuled - 0.04, cam: [540, 900], zoom: 0.08, note: 'decades pass: board rotates from above, light sweeps, tally carves 1..40',
    draw(lt, d, t) {
      const rot = lerp(0, 2.2, eio(clamp(lt / (d + 1.4))));
      const a = t * 2.6; const sx = 540 + Math.cos(a) * 260, sy = 920 + Math.sin(a) * 120;
      stage(t, { cx: 540, cy: 960, size: 860, tilt: 0.22, rot },
        court({ kg: 0.8 }), { seed: 6, spot: () => [sx, sy - 80, 680, 0.85] });
      tally(540, 330, 24 * eio(clamp(lt / d)), 40, 1.15);
      CH.vig(0.5);
    } });
  cue(tRuled - 0.04, 'whoosh', { gain: 0.45 }); for (let i = 0; i < 5; i++) cue(tRuled + 0.08 + i * 0.16, 'tock', { gain: 0.35 });

  // a6: ~40 YEARS carved title, tally completes, gold king glowing at centre; ends in a marbled-ink wipe
  add({ id: 'a6_forty', at: tForty - 0.04, cam: [540, 760], zoom: 0.1, note: '~40 YEARS title, tally completes to 40, king glows; ink wipe out',
    draw(lt, d, t) {
      const st = (tForty - 0.04) - (tRuled - 0.04), total = d + st + 0.05;
      stage(t, { cx: 540, cy: 1040, size: 1100, tilt: 0.38, rot: lerp(2.2 * eio(clamp(st / (st + 1.4))), 2.6, eo(clamp(lt / d))) },
        court({ kg: 0.9 + 0.2 * Math.sin(t * 6) }), { seed: 7, spot: (proj) => { const p = proj(4, 4); return [p[0], p[1] - 120, 560, 0.88]; } });
      tally(540, 270, lerp(24, 40, eo(seg(lt, 0, 0.5))), 40, 0.9);
      CH.title('~40 YEARS', 540, 590, 150, seg(lt, 0.05, 0.6), { edge: P.gold });
      CH.vig(0.5);
      CH.marble(t, wipeOut(lt, d, 0.34), { seed: 1, x: 540, y: 760 });
    } });
  cue(tForty + 0.02, 'drum', { gain: 0.7 }); cue(tForty + 0.1, 'chisel', { gain: 0.5 }); cue(L(2) - 0.32, 'whoosh', { gain: 0.7 });

  // ---------------- LINE 2: the chroniclers say ----------------
  const tFav = Wd('favoured', 2), tVira = Wd('vira', 2), tCall = Wd('call', 2), tIll = Wd('illegitimate', 2), tOver = Wd('over', 2), tSun = Wd('sundara', 2);
  // a7: two parchment pages float on marbled ink, abstract rows writing right-to-left; CHRONICLE SAYS
  add({ id: 'a7_chronicle', at: L(2) - 0.05, cam: [540, 760], zoom: 0.08, note: '"Two Persian chroniclers": two parchment pages on marbled ink, CHRONICLE SAYS tag',
    draw(lt, d, t) {
      CH.marble(t, 1, { full: true, seed: 1 });
      ctx.fillStyle = 'rgba(8,6,10,0.35)'; ctx.fillRect(0, 0, W, H);
      const k = eio(clamp(lt / d));
      CH.chronicle(lerp(330, 345, k), 790 + Math.sin(t * 1.3) * 8, seg(lt, 0.25, d), { w: 440, h: 640, rot: -0.09 + 0.02 * Math.sin(t), rows: 11, red: [3, 8] });
      CH.chronicle(lerp(760, 735, k), 850 + Math.sin(t * 1.1 + 1) * 8, seg(lt, 0.45, d + 0.2), { w: 440, h: 640, rot: 0.08 - 0.02 * Math.sin(t * 0.9), rows: 11, red: [5] });
      CH.inkDrop(540, 1180, 120, seg(lt, 0.4, 1.4), P.indigo, t);
      CH.marble(t, wipeIn(lt, 0.34), { seed: 1, x: 540, y: 760 });
      CH.tag('CHRONICLE SAYS', 540, 300, { sc: eob(seg(lt, 0.25, 0.55)), ink: P.blood, rot: -0.03 });
      CH.vig(0.45);
    } });
  cue(L(2) + 0.25, 'pop', { gain: 0.6 }); cue(L(2) + 0.5, 'chisel', { gain: 0.35 }); cue(L(2) + 0.6, 'plop', { gain: 0.4 });

  // a8: the gold king nudges the ebony prince Vira forward; Vira glows indigo
  add({ id: 'a8_favour', at: tFav - 0.06, cam: [540, 860], zoom: 0.09, note: '"favoured Vira": gold king nudges ebony prince (indigo sash) forward',
    draw(lt, d, t) {
      const tv = tVira - (tFav - 0.06);
      const nudge = eob(seg(lt, tv - 0.25, tv + 0.05)), fwd = eio(seg(lt, tv - 0.05, tv + 0.6));
      const ku = 3.5 + 0.35 * nudge - 0.35 * fwd * 0.6;
      stage(t, { cx: 540, cy: 1000, size: 1300, tilt: 0.6, rot: lerp(-0.18, 0.06, eio(clamp(lt / d))) },
        [KING(ku, 3.4, { s: 0.62, glow: 0.6 }), VIRA(5.5, 3.2 + 2.0 * fwd, { s: 0.6, glow: 0.55 + 0.5 * fwd, glowCol: P.indigoHi }), SUN(2.2, 3.8, { s: 0.6 }),
          PAWN(1, 6.5, 'ivory'), PAWN(6.5, 6.5, 'ebony'), PAWN(6.2, 1.5, 'ebony')],
        { seed: 8, glow: null,
          under: (proj) => { const p = proj(6.0, 6.3); boardInk(p[0], p[1], 170 * p[2], seg(lt, tv, tv + 0.9), P.indigo, t); },
          spot: (proj, list) => { const v = find(list, 'prince', 'ebony'); return [lerp(540, v.x, 0.7), v.y - 170, 640, 0.86]; } });
      cornerTag('CHRONICLE SAYS', 1, { y: 230, sc: 0.7 });
      CH.vig(0.5);
    } });
  cue(tFav - 0.06, 'whoosh', { gain: 0.5 }); cue(tVira - 0.2, 'tock', { gain: 0.6 }); cue(tVira, 'slide', { gain: 0.7 }); cue(tVira + 0.3, 'plop', { gain: 0.4 });

  // a9: "a son they call illegitimate" - Vira alone on indigo marbled ink, ink rings bloom behind him
  add({ id: 'a9_ink', at: tCall - 0.06, cam: [540, 880], zoom: 0.1, note: '"they call illegitimate": ebony prince on indigo marbled ink, ink rings bloom',
    draw(lt, d, t) {
      CH.marble(t * 0.8, 1, { full: true, seed: 2, cols: [P.indigo, P.ink, '#141C3A', P.paper] });
      ctx.fillStyle = 'rgba(5,4,10,0.45)'; ctx.fillRect(0, 0, W, H);
      const ti = tIll - (tCall - 0.06);
      CH.inkDrop(540, 820, 470, seg(lt, ti - 0.1, ti + 1.0), P.indigoHi, t);
      CH.inkDrop(540, 820, 300, seg(lt, ti + 0.15, ti + 1.2), P.indigo, t);
      const k = eio(clamp(lt / d));
      { const g = ctx.createRadialGradient(540, 880, 40, 540, 880, 420); g.addColorStop(0, rgba(P.paper, 0.75)); g.addColorStop(0.5, rgba(P.indigoHi, 0.35)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(100, 440, 880, 880); }
      CH.piece('prince', 540, 1160 - 10 * k, 2.4 + 0.15 * k, { col: 'ebony', sash: P.indigo, glow: 0.8, glowCol: P.ivoryMid, tip: Math.sin(t * 2) * 0.02 });
      // pale rim light on the ebony piece
      CH.spot(540, 900, 820, 0.7, t);
      cornerTag('CHRONICLE SAYS', 1, { y: 230, sc: 0.7 });
      CH.vig(0.5);
    } });
  cue(tCall - 0.06, 'whoosh', { gain: 0.5 }); cue(tIll, 'plop', { gain: 0.7 }); cue(tIll + 0.25, 'plop', { gain: 0.45 });

  // a10: "over Sundara" - the ivory prince is pushed back to the far edge, the light leaves him; red ink wipe out
  add({ id: 'a10_pushed', at: tOver - 0.06, cam: [540, 820], zoom: 0.08, note: '"over Sundara": ivory prince (red sash) pushed back to the edge, light leaves him',
    draw(lt, d, t) {
      const ts = tSun - (tOver - 0.06), back = eio(seg(lt, ts - 0.1, ts + 0.7));
      stage(t, { cx: 540, cy: 1000, size: 1250, tilt: 0.58, rot: lerp(0.1, -0.08, eio(clamp(lt / d))) },
        [KING(4.2, 3.6, { s: 0.62, glow: 0.5 }), VIRA(4.9, 5.3, { s: 0.6 }), SUN(2.6 - 0.8 * back, 4.4 - 3.6 * back, { s: 0.6, tip: -0.06 * Math.sin(back * Math.PI) }),
          PAWN(1, 6.5, 'ivory'), PAWN(6.5, 6.5, 'ebony')],
        { seed: 9,
          after: (proj, list) => { const s = find(list, 'prince', 'ivory'); if (back > 0.05 && back < 0.9) streaks(s.x, s.y, -1, 0.6, 160); },
          spot: (proj, list) => { const k = find(list, 'king', 'gold'); return [k.x + 40, k.y - 140, lerp(700, 520, back), 0.92]; } });
      cornerTag('CHRONICLE SAYS', 1, { y: 230, sc: 0.7 });
      CH.vig(0.55);
      CH.marble(t, wipeOut(lt, d, 0.32), { seed: 3, x: 540, y: 820, cols: [P.blood, P.ink, P.bloodDk, P.paper] });
    } });
  cue(tOver - 0.06, 'whoosh', { gain: 0.5 }); cue(tSun, 'slide', { gain: 0.8 }); cue(L(3) - 0.32, 'whoosh', { gain: 0.7 });

  // ---------------- LINE 3: in their story, the strike ----------------
  const tStruck = Wd('struck', 3), tDown = Wd('down', 3), tFa3 = Wd('father', 3), tTook = Wd('took', 3);
  // a11: IN THEIR STORY - the ivory prince creeps along the file toward the king; spotlight narrows
  add({ id: 'a11_creep', at: L(3) - 0.04, cam: [540, 900], zoom: 0.12, note: 'IN THEIR STORY tag; ivory prince creeps toward the gold king, iris narrows',
    draw(lt, d, t) {
      const k = clamp(lt / d), su = lerp(1.2, 2.7, eio(k));
      stage(t, { cx: 540, cy: 1080, size: 1700, tilt: 0.7, rot: lerp(-0.12, 0.02, k) },
        [KING(4.4, 3.6, { s: 0.62, glow: 0.4 }), SUN(su, 3.8, { s: 0.62, glow: 0.3 + 0.4 * k, glowCol: P.blood }), VIRA(6.8, 1.6, { s: 0.55, a: 0.8 })],
        { seed: 10, spot: (proj) => { const p = proj((su + 4.4) / 2 + 0.5, 4.2); return [p[0], p[1] - 200, lerp(820, 520, eio(k)), 0.92]; } });
      CH.marble(t, wipeIn(lt, 0.34), { seed: 3, x: 540, y: 820, cols: [P.blood, P.ink, P.bloodDk, P.paper] });
      CH.tag('IN THEIR STORY', 540, 300, { sc: eob(seg(lt, 0.25, 0.55)), ink: P.blood, rot: 0.02 });
      CH.vig(0.55);
    } });
  cue(L(3) + 0.25, 'pop', { gain: 0.6 }); cue(L(3) + 0.4, 'heartbeat', { gain: 0.6 }); cue(L(3) + 0.4, 'slide', { gain: 0.35, dur: 1 });

  // a12: "struck down his father" - fast slide into the king, topple, red flash, crack; fallen king is pushed to the edge
  add({ id: 'a12_struck', at: tStruck - 0.12, cam: [540, 950], zoom: 0.1, note: '"struck down": ivory prince slams the king, king topples, red flash, crack',
    draw(lt, d, t) {
      const t0 = tStruck - 0.12, hit = tStruck - t0 + 0.02, dn = tDown - t0 + 0.1, ft = tFa3 - t0;
      const su = lerp(2.2, 3.35, eio(seg(lt, 0, hit)));
      const tip = 1.5 * eio(seg(lt, hit, dn));
      const slide = eio(seg(lt, ft, ft + 0.45));
      ctx.save(); shake(lt, hit, 24, 0.45); shake(lt, dn, 12, 0.3);
      stage(t, { cx: 540, cy: 1060, size: 1500, tilt: 0.62, rot: lerp(0.08, -0.05, clamp(lt / d)) },
        [SUN(su, 3.8, { s: 0.62, glow: 0.4, glowCol: P.blood }), KING(4.3 + 3.6 * slide, 3.7 + 0.2 * slide, { s: 0.6, tip, a: 1 - 0.25 * slide }), VIRA(6.6, 1.3, { s: 0.52, a: 0.75 }),
          PAWN(1, 6.5, 'ivory'), PAWN(7.5, 6.8, 'ebony', { tip: 1.4 })],
        { seed: 11,
          under: (proj) => { const a = proj(4.6, 4.4); CH.crackLine(a, proj(8.4, 8.2), seg(lt, hit, hit + 0.4), 13, 9); CH.crackLine(a, proj(0.5, 8.4), seg(lt, hit + 0.05, hit + 0.5), 17, 7); },
          after: (proj, list) => { const s = find(list, 'prince', 'ivory'); streaks(s.x, s.y, 1, 1 - seg(lt, hit - 0.15, hit + 0.1), 260); },
          spot: (proj) => { const p = proj(4.2, 4.3); return [p[0], p[1] - 180, 700, 0.88]; } });
      ctx.restore();
      CH.redFlash(lt >= hit ? 1 - seg(lt, hit, hit + 0.4) : 0);
      CH.redFlash(lt >= dn ? 0.5 * (1 - seg(lt, dn, dn + 0.25)) : 0);
      cornerTag('IN THEIR STORY', 1, { y: 230, sc: 0.7 });
      CH.vig(0.55);
    } });
  cue(tStruck - 0.12, 'whoosh', { gain: 0.6 }); cue(tStruck + 0.02, 'slam', { gain: 1 }); cue(tDown + 0.1, 'thud', { gain: 0.9 }); cue(tFa3, 'slide', { gain: 0.5 });

  // a13: "took Madurai" - the ivory prince alone on the glowing centre square, blood-red ink blooms, a crown settles on him
  add({ id: 'a13_took', at: tTook - 0.08, cam: [540, 820], zoom: 0.1, note: '"took Madurai": ivory prince on glowing centre square, red ink bloom, crown settles',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d)), cr = eo(seg(lt, 0.3, 0.9));
      stage(t, { cx: 540, cy: 1060, size: 1350, tilt: 0.55, rot: lerp(-0.3, 0.12, k), glow: [3, 4] },
        [SUN(3, 4, { s: 0.66, glow: 0.7 + 0.2 * Math.sin(t * 6), glowCol: P.blood }), KING(8.6, 5.2, { s: 0.5, tip: -1.5, a: 0.85 }), VIRA(6.5, 0.6, { s: 0.5, a: 0.7 }),
          PAWN(-0.9, 6.2, 'ebony', { tip: 1.45, s: 0.46 })],
        { seed: 12,
          under: (proj) => { const p = proj(3.5, 4.5); ctx.save(); ctx.globalAlpha = 0.8; boardInk(p[0], p[1], 300 * p[2], seg(lt, 0.05, 1.2), P.blood, t); ctx.restore(); },
          after: (proj, list) => { const s = find(list, 'prince', 'ivory'), sc = s.z * 0.66; ctx.save(); ctx.globalAlpha = cr; CH.crownTop(s.x, s.y - 182 * sc - (1 - cr) * 160, sc * 0.8, P.gold); ctx.restore(); },
          spot: (proj, list) => { const s = find(list, 'prince', 'ivory'); return [s.x, s.y - 150, lerp(620, 470, k), 0.9]; } });
      CH.redFlash(0.6 * (1 - seg(lt, 0, 0.3)));
      CH.title('MADURAI', 540, 330, 120, seg(t, Wd('madurai', 3) - 0.05, Wd('madurai', 3) + 0.4), { edge: P.blood });
      cornerTag('IN THEIR STORY', 1, { y: 190, sc: 0.6 });
      CH.vig(0.55);
    } });
  cue(tTook - 0.08, 'whoosh', { gain: 0.5 }); cue(tTook + 0.05, 'plop', { gain: 0.6 }); cue(tTook + 0.4, 'bell', { gain: 0.5 }); cue(Wd('madurai', 3), 'chisel', { gain: 0.5 });
}
