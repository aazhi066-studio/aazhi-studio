// EPISODE 22 · worker A : "Leather Shadow Puppets", lines 0-3 (t 0 -> L(4)). THE HOOK.
// a0 arrow volley + war elephant rears, faceless crowned king, blood-red flash + shake · a1 the king drops off his rod,
// crown tumbles, lamp dims · a2 elephant close-up, arrows thud into the howdah, WHO WON? swings in · a3/a3b cut-leather
// map: indigo ribbon river, KOPPAM pinned, TUNGABHADRA label · a4 c. 1054 stamps in + swinging (or 1052?) tag ·
// a5 the king on the elephant leads, RAJADHIRAJA · a5b rows of red Chola infantry march · a6 green Chalukyas enter from
// the right, WESTERN CHALUKYAS · a6b the two lines face off · a7 leather record tablet (dots only) rises, CHOLA RECORDS SAY ·
// a8 red line pushes right, green puppets topple back, WINNING? (hedged).
// Statics (map, soldier sprites, tablet) baked once with cached(); per frame only blits + a few puppets / arrows.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, poly } from './art.js';
import * as PP from './puppet.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const PAL = PP.PAL;
const RED = { col: PAL.red, dk: PAL.redDk }, GRN = { col: PAL.green, dk: PAL.greenDk };

// ───────────── local helpers ─────────────
/** slam-in scale: big -> 1 with overshoot, 0 before t0 */
const slam = (t, t0, dur = 0.22, from = 1.9) => (t < t0 ? 0 : lerp(from, 1, eob(clamp((t - t0) / dur))));
/** pop-in scale 0 -> 1 with overshoot */
const pop = (t, t0, dur = 0.3) => (t < t0 ? 0 : eob(clamp((t - t0) / dur)));
/** damped swing angle after t0 */
const swing = (t, t0, amp = 0.22, f = 7, k = 2.2) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) * k) * sin((t - t0) * f) + 0.02 * sin(t * 2.1));
/** a placard hung on two cords from a pivot at (x, top); rot swings about the pivot */
function hang(text, x, y, sc, size, rot, col = PAL.ochre, ink = PAL.leather, top = 46) {
  if (sc <= 0.001) return;
  ctx.save(); ctx.translate(x, top); ctx.rotate(rot);
  const hy = y - top, hw = 110 * sc;
  ctx.strokeStyle = PAL.night; ctx.lineWidth = 4; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-hw, hy - size * 0.7 * sc); ctx.moveTo(0, 0); ctx.lineTo(hw, hy - size * 0.7 * sc); ctx.stroke();
  ctx.globalAlpha = 1; PP.placard(text, 0, hy, sc, size, col, ink); ctx.restore();
}
/** a placard on a bamboo rod rising from below */
function rodPlacard(text, x, y, sc, size, rot = 0, col = PAL.ochre, ink = PAL.leather) {
  if (sc <= 0.001) return; PP.rod(x, y + size * 0.7 * sc, 0.0, 0.9); PP.placard(text, x, y, sc, size, col, ink, rot);
}
/** the king's crown alone (same shape as PP.warrior crown 1), centred at x,y, scale s */
function crown(x, y, s, rot) {
  const ch = 130; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-2, 640 + ch * 0.6);
  poly([[-40, -640], [44, -640], [22, -640 - ch], [6, -640 - ch * 1.25], [-14, -640 - ch]]); PP.leather(PAL.ochre, PAL.leather, 14);
  PP.rosette(4, -640 - ch * 0.55, 18); ctx.restore();
}
/** the king rider: crowned, faceless, sword raised */
const king = (o = {}) => (x, y) => PP.warrior(x, y + 12, o.s || 0.42, o.dir || 1, { crown: o.crown ?? 1, arm: o.arm ?? 110, weapon: 'sword', rodA: o.rodA ?? 0, tilt: o.tilt || 0 });
/** a stuck arrow (shadow) pointing along angle a, tip at x,y */
function stuck(x, y, a, len = 150, w = 6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = PAL.night; ctx.fillRect(-len, -w / 2, len, w);
  poly([[-len, 0], [-len - 26, -w * 3], [-len + 26, 0], [-len - 26, w * 3]]); ctx.fill(); ctx.restore();
}
/** shake wrapper for several hits */
function shakeAll(lt, hits, amp, dur) { let x = 0, y = 0; for (const h of hits) { const [a, b] = PP.shake(lt, h, amp, dur); x += a; y += b; } return [x, y]; }

// soldier sprites: cached per side / weapon / step phase (6 phases); drawn without rod (rods added live)
const SPR_W = 520, SPR_H = 1000, SPR_OX = 260, SPR_OY = 930;
function soldierImg(side, weapon, k, dir) {
  return cached(`a22sold_${side}_${weapon}_${k}_${dir}`, SPR_W, SPR_H, 0.55, () => {
    const c = side === 'r' ? RED : GRN;
    PP.warrior(SPR_OX, SPR_OY, 1, dir, { ...c, arm: weapon === 'bow' ? 80 : weapon === 'spear' ? 18 : 40, weapon, shield: side === 'g' && weapon !== 'bow', step: sin(k / 6 * TAU), rodA: 0 });
  });
}
/** a marching soldier: feet x,y, scale s, phase ph (rad), tilt */
function soldier(side, weapon, x, y, s, dir, ph, tilt = 0, rodA = 0.75) {
  const k = ((Math.floor(((ph / TAU) % 1 + 1) % 1 * 6)) % 6), bob = Math.abs(sin(ph)) * 8 * s;
  const img = soldierImg(side, weapon, k, dir);
  if (rodA > 0) PP.rod(x + 10 * dir * s, y - 420 * s - bob, 0.06 * dir, rodA);
  if (tilt) { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); blit(img, SPR_OX, SPR_OY, 0, -bob, s); ctx.restore(); }
  else blit(img, SPR_OX, SPR_OY, x, y - bob, s);
}

// cut-leather map (cached): indigo ribbon river with punched-dot banks, leather hills, little trees
const riverX = (y) => 600 + 210 * sin(y / 250 + 0.4) - (y - 900) * 0.18;
const KOP = [riverX(860) - 175, 860];
function mapImg() {
  return cached('a22map', W, H, 1, () => {
    // leather hills
    const hills = [[160, 470, 120], [880, 640, 150], [250, 1180, 140], [900, 1300, 130], [700, 300, 100]];
    hills.forEach(([x, y, r], i) => { poly([[x - r * 1.4, y + r * 0.5], [x - r * 0.3, y - r * 0.8], [x + r * 0.2, y - r * 0.4], [x + r * 0.6, y - r], [x + r * 1.5, y + r * 0.5]]); PP.leather(i % 2 ? PAL.green : PAL.ochre, i % 2 ? PAL.greenDk : PAL.ochreDk, 18, 0.75); });
    // trees
    for (let i = 0; i < 14; i++) { const y = 200 + rnd(i + 40) * 1250, x = riverX(y) + (rnd(i + 50) > 0.5 ? 1 : -1) * (150 + rnd(i + 60) * 220);
      ctx.beginPath(); ctx.arc(x, y - 40, 28, 0, TAU); PP.leather(PAL.green, PAL.greenDk, 0, 0.85); ctx.fillStyle = PAL.leather; ctx.fillRect(x - 5, y - 16, 10, 34); }
    // ribbon river
    const ys = []; for (let y = 60; y <= 1640; y += 20) ys.push(y);
    const wd = (y) => 58 + 18 * sin(y / 140);
    const left = ys.map((y) => [riverX(y) - wd(y), y]), right = ys.map((y) => [riverX(y) + wd(y), y]).reverse();
    poly([...left, ...right]); PP.leather(PAL.indigo, PAL.indigoDk, 0, 0.95);
    // ripple slits
    ctx.strokeStyle = 'rgba(255,231,168,0.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let y = 90; y < 1620; y += 46) { const x = riverX(y) + sin(y) * 20; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y + 4); ctx.stroke(); }
    // punched-dot banks
    for (const sd of [-1, 1]) for (let y = 70; y < 1630; y += 26) { const x = riverX(y) + sd * (wd(y) + 26);
      ctx.fillStyle = PAL.leather; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.hole; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); }
  });
}

// record tablet (cached): dark leather slab, rows of punched dots only (no letters)
function tabletImg() {
  return cached('a22tab', 640, 820, 1, () => {
    ctx.beginPath(); ctx.roundRect(40, 40, 560, 740, 40); PP.leather(PAL.ochreDk, PAL.leather, 18, 1);
    ctx.beginPath(); ctx.roundRect(90, 90, 460, 640, 24); PP.leather(PAL.ochre, PAL.ochreDk, 0, 0.9);
    PP.rosette(320, 150, 40);
  });
}

export function buildA(add, cue) {
  const tDied = Wd('died', 0), tEle = Wd('elephant', 0), tWho = Wd('who', 0), tEmp = Wd('emperor', 0);
  const T1 = L(1), tTung = Wd('tungabhadra', 1), tAround = Wd('around', 1), tTen = Wd('ten', 1), tFifty = Wd('fifty', 1);
  const T2 = L(2), tRaja = Wd('rajadhiraja', 2), tChola2 = Wd('chola', 2), tAgainst = Wd('against', 2), tWest = Wd('western', 2), tChal = Wd('chalukyas', 2);
  const T3 = L(3), tSay = Wd('say', 3), tWin = Wd('winning', 3);

  // ── a0 · volley + rearing elephant, flash, shake ──
  add({ id: 'a0', at: 0, cam: [560, 900], zoom: 0.1, note: 'arrow volley streaks across, Chola war elephant rears with crowned faceless king, blood-red flash + shake', draw: (lt, d, t) => {
    const [jx, jy] = shakeAll(lt, [0, 0.42], 30, 0.4); ctx.save(); ctx.translate(jx, jy);
    PP.screen(t, { hot: [600 + sin(t * 3) * 60, 760] });
    PP.volley(seg(lt, -0.15, 1.0), 10, 31, -1, 260, 1250);
    const rear = 0.25 + 0.45 * eo(seg(lt, 0, 0.5)) - 0.15 * seg(lt, 0.7, d);
    PP.elephant(520, 1600, 1.08, 1, { rear, step: t * 2, rider: king({ s: 0.44, arm: 120 + 25 * sin(t * 7) }) });
    PP.volley(seg(lt, 0.25, 1.4), 8, 77, -1, 200, 900);
    ctx.restore();
    PP.stageFrame(t, 1); PP.lampEdge(0.6);
    PP.flash(seg(lt, 0, 0.35), '160,20,26', 0.8); PP.flash(seg(lt, 0.42, 0.65), '160,20,26', 0.35);
    hang('A CHOLA EMPEROR', 540, 230, slam(t, tEmp - 0.05) * 0.85, 70, swing(t, tEmp + 0.1, 0.12));
  } });

  // ── a1 · the king drops off his rod, crown tumbles, lamp dims ──
  add({ id: 'a1', at: tDied, cam: [560, 700], zoom: 0.08, note: 'king puppet drops off its rod, crown tumbles away, lamp dims (no gore)', draw: (lt, d, t) => {
    const f = eio(seg(lt, 0.05, 0.6));
    PP.screen(t, { dim: 0.08 + 0.5 * f, hot: [560 - 120 * f, 700 + 200 * f] });
    let seat = [0, 0];
    PP.elephant(560, 1640, 1.15, 1, { rear: 0.08 + 0.04 * sin(t * 3), step: t * 1.5, rider: (x, y) => (seat = [x, y]) });
    // the empty rod left standing in the howdah
    const [sx, sy] = seat; PP.rod(sx + 8, sy - 230, 0.03 * sin(t * 4), 0.9);
    // king falls back and down, spinning slowly, off the screen bottom
    const fall = seg(lt, 0.08, 0.85), fy = sy + 1300 * fall * fall, fx = sx - 260 * fall;
    PP.warrior(fx, fy + 12, 0.5, 1, { crown: 0.0001, arm: lerp(110, 200, fall), weapon: 'sword', rodA: 0, tilt: -eo(fall) * 1.7 });
    // the crown tumbles free in its own arc
    const cp = seg(lt, 0.05, 0.9), cx = sx + 40 + 380 * cp, cy = sy - 300 - 260 * sin(cp * PI * 0.9) + 900 * cp * cp;
    crown(cx, cy, 0.62, cp * 7);
    PP.arrow(W + 200, 300, sx + 60, sy - 160, seg(lt, 0, 0.12), 200, 6); if (lt > 0.12) stuck(sx + 60, sy - 160, Math.atan2(sy - 460, sx + 60 - W - 200));
    PP.stageFrame(t); PP.lampEdge(0.6 + 0.25 * f);
    PP.flash(seg(lt, 0.1, 0.3), '160,20,26', 0.4);
  } });

  // ── a2 · elephant close-up, arrows thud into the howdah, WHO WON? ──
  const HITS = [0.12, 0.34, 0.52, 0.78, 1.02, 1.3];
  add({ id: 'a2', at: tEle, cam: [600, 760], zoom: 0.09, note: 'big elephant close-up, trunk raised, arrows thud into the howdah, WHO WON? swings in', draw: (lt, d, t) => {
    const [jx, jy] = shakeAll(lt, HITS, 12, 0.18); ctx.save(); ctx.translate(jx, jy);
    PP.screen(t, { dim: 0.25 - 0.15 * seg(lt, 0, 0.6), hot: [700, 650] });
    let seat = [0, 0];
    PP.elephant(330, 1900, 1.75, 1, { rear: 0.32 + 0.06 * sin(t * 2.4), step: t * 1.2, rider: (x, y) => (seat = [x, y]) });
    PP.rod(seat[0] + 10, seat[1] - 300, 0.03 * sin(t * 4), 0.9);  // empty rod: the king is gone
    HITS.forEach((h, i) => {
      const tx = seat[0] - 180 + rnd(i + 5) * 360, ty = seat[1] + 40 + rnd(i + 9) * 160, x0 = W + 300, y0 = ty - 400 - rnd(i) * 300;
      const p = seg(lt, h - 0.14, h); if (p < 1) PP.arrow(x0, y0, tx, ty, p, 210, 7); else stuck(tx, ty, Math.atan2(ty - y0, tx - x0) + (rnd(i + 2) - 0.5) * 0.1, 170, 7);
    });
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge(0.6);
    hang('WHO WON?', 540, 400, slam(t, tWho - 0.04), 120, swing(t, tWho + 0.1, 0.2), PAL.red, PAL.leather);
  } });

  // ── a3 / a3b · cut-leather map, KOPPAM pinned, TUNGABHADRA ──
  const mapDraw = (lt, d, t) => {
    const k = seg(t, T1, T1 + 0.45);
    PP.screen(t, { hot: [540 + sin(t * 0.9) * 80, 820] });
    ctx.save(); ctx.translate(540, 900); ctx.rotate(0.012 * sin(t * 1.3) + (1 - eo(k)) * 0.12); ctx.scale(lerp(1.25, 1, eo(k)), lerp(1.25, 1, eo(k))); ctx.translate(-540, -900);
    ctx.globalAlpha = eo(k); blit(mapImg(), 0, 0, 0, 0, 1); ctx.globalAlpha = 1;
    // lamplight running down the river
    ctx.strokeStyle = 'rgba(255,231,168,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const y = ((t * 220 + i * 240) % 1600) + 60, x = riverX(y); ctx.beginPath(); ctx.moveTo(x - 10, y - 30); ctx.lineTo(x + 6, y + 30); ctx.stroke(); }
    ctx.restore();
    // KOPPAM pinned on the bank: drops in and settles
    const kp = seg(t, T1 + 0.12, T1 + 0.4), ky = lerp(KOP[1] - 500, KOP[1] - 150, eob(kp));
    if (kp > 0) {
      ctx.strokeStyle = PAL.night; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(KOP[0], KOP[1]); ctx.lineTo(KOP[0], ky); ctx.stroke();
      ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.arc(KOP[0], KOP[1], 22, 0, TAU); ctx.fill(); PP.rosette(KOP[0], KOP[1], 20);
      const ring = seg(t, T1 + 0.38, T1 + 1.1); if (ring > 0 && ring < 1) { ctx.strokeStyle = `rgba(184,50,42,${1 - ring})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(KOP[0], KOP[1], 30 + 120 * ring, 0, TAU); ctx.stroke(); }
      PP.placard('KOPPAM', KOP[0] + 40, ky - 40, eob(kp), 86, PAL.ochre, PAL.leather, swing(t, T1 + 0.4, 0.15, 6));
    }
    // TUNGABHADRA small label along the river
    const tp = pop(t, tTung); const ty = 1180, tx = riverX(ty) + 30;
    PP.placard('TUNGABHADRA', tx, ty, tp * 0.95, 50, PAL.indigo, PAL.hole, -0.18 + swing(t, tTung + 0.2, 0.1, 6));
    PP.stageFrame(t); PP.lampEdge(0.55);
  };
  add({ id: 'a3', at: T1, cam: [KOP[0] + 60, KOP[1] - 120], zoom: 0.12, note: 'cut-leather map: indigo ribbon river, punched-dot banks, KOPPAM placard pinned', draw: mapDraw });
  add({ id: 'a3b', at: tTung, cam: [riverX(1120), 1060], zoom: 0.1, note: 'map push down the river, TUNGABHADRA label pops on the ribbon', draw: mapDraw });

  // ── a4 · c. 1054 stamps in, (or 1052?) tag swings ──
  add({ id: 'a4', at: tAround, cam: [540, 760], zoom: 0.1, note: "calendar wheel turns, 'c. 1054' stamps in, smaller '(or 1052?)' tag swings", draw: (lt, d, t) => {
    const [jx, jy] = PP.shake(t, tTen + 0.12, 16, 0.3); ctx.save(); ctx.translate(jx, jy);
    PP.screen(t, { hot: [540, 700] });
    // big rotating leather wheel (calendar / sun) behind
    const wr = seg(lt, 0, 0.4); ctx.save(); ctx.translate(540, 780); ctx.rotate(t * 0.6); ctx.scale(eo(wr), eo(wr));
    ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 330 : 400; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.closePath(); PP.leather(PAL.ochre, PAL.ochreDk, 22, 0.85);
    ctx.beginPath(); ctx.arc(0, 0, 250, 0, TAU); PP.leather(PAL.indigo, PAL.indigoDk, 18, 0.9);
    for (let i = 0; i < 12; i++) PP.rosette(cos(i / 12 * TAU) * 180, sin(i / 12 * TAU) * 180, 26);
    PP.rosette(0, 0, 70); ctx.restore();
    PP.oilLamp(540, 1460, 1.1, t);
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge(0.55);
    const s = slam(t, tTen + 0.02, 0.18, 2.4);
    PP.placard('c. 1054', 540, 760, s, 150, PAL.red, PAL.leather, -0.04);
    hang('(or 1052?)', 700, 1060, pop(t, tFifty + 0.25) * 0.8, 64, swing(t, tFifty + 0.3, 0.3, 6, 1.4), PAL.green, PAL.leather, 760 - 120);
  } });

  // ── a5 · the king on the elephant leads, RAJADHIRAJA ──
  add({ id: 'a5', at: T2, cam: [540, 880], zoom: 0.08, note: 'king on the elephant strides in leading the Chola army, RAJADHIRAJA placard', draw: (lt, d, t) => {
    PP.screen(t, { hot: [620, 820] });
    const ph = t * 5;
    for (let i = 0; i < 6; i++) soldier('r', 'spear', -120 + i * 150 + lt * 60, 1420, 0.42, 1, ph + i * 0.9, 0, 0.55);
    const ex = lerp(380, 620, eio(clamp(lt / d)));
    PP.elephant(ex, 1520, 0.82, 1, { step: t * 3.2, rear: 0.05 + 0.04 * sin(t * 3.2), rider: king({ s: 0.4, arm: 100 + 12 * sin(t * 3) }) });
    PP.stageFrame(t); PP.lampEdge(0.55);
    rodPlacard('RAJADHIRAJA', 540, 330 + 6 * sin(t * 2), slam(t, tRaja, 0.24, 1.7) * 0.92, 92, swing(t, tRaja + 0.2, 0.06, 5), PAL.red, PAL.leather);
    PP.placard('EMPEROR', 540, 190, pop(t, T2 + 0.05) * 0.6, 60, PAL.ochre, PAL.leather);
  } });

  // ── a5b · rows of red Chola infantry marching ──
  add({ id: 'a5b', at: tChola2, cam: [540, 1050], zoom: 0.1, note: 'three rows of red Chola infantry puppets march right (step anim), rods swaying', draw: (lt, d, t) => {
    ctx.save(); ctx.translate(0, sin(t * 10) * 3);
    PP.screen(t, { hot: [540, 900] });
    const ph = t * 6.5, rows = [[1020, 0.36, 128], [1250, 0.46, 160], [1500, 0.58, 205]];
    rows.forEach(([y, s, gap], r) => { const off = ((lt * 130 * (1 + r * 0.25)) % gap);
      for (let x = -gap + off - r * 40; x < W + gap; x += gap) soldier('r', r === 1 ? 'sword' : 'spear', x, y, s, 1, ph + x * 0.01 + r, 0, 0.5 + r * 0.15); });
    ctx.restore();
    PP.stageFrame(t, 0.6); PP.lampEdge(0.55);
    rodPlacard('CHOLA ARMY', 540, 320, slam(t, tChola2 + 0.02, 0.2, 1.6) * 0.95, 96, 0.04 * sin(t * 3), PAL.red, PAL.leather);
  } });

  // ── a6 · green Chalukyas enter from the right ──
  add({ id: 'a6', at: tAgainst, cam: [700, 1000], zoom: 0.1, note: 'green/indigo Chalukya puppets slide in from the right, WESTERN CHALUKYAS placard', draw: (lt, d, t) => {
    PP.screen(t, { hot: [760, 860], tint: '40,70,60', tintA: 0.1 });
    const ph = t * 5;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
      const arrive = seg(lt, i * 0.12 + r * 0.1, 0.55 + i * 0.12 + r * 0.1), x = lerp(W + 260, 380 + i * 175 + r * 70, eo(arrive));
      soldier('g', r ? 'bow' : 'spear', x, 1260 + r * 230, 0.46 + r * 0.1, -1, ph + i, arrive < 1 ? -0.06 * sin(ph) : 0, 0.65);
    }
    PP.stageFrame(t); PP.lampEdge(0.55);
    rodPlacard('WESTERN', 600, 280, slam(t, tWest, 0.2, 1.7) * 0.9, 84, swing(t, tWest + 0.2, 0.06, 6), PAL.green, PAL.hole);
    rodPlacard('CHALUKYAS', 600, 470, slam(t, tChal, 0.2, 1.7), 100, swing(t, tChal + 0.2, 0.07, 6), PAL.indigo, PAL.hole);
  } });

  // ── a6b · the two lines face off ──
  add({ id: 'a6b', at: tChal + 0.25, cam: [540, 1150], zoom: 0.12, note: 'face-off: red Cholas left, green Chalukyas right, spears level, lamp flickers between them', draw: (lt, d, t) => {
    const [jx, jy] = PP.shake(lt, 0.9, 10, 0.3); ctx.save(); ctx.translate(jx, jy);
    PP.screen(t, { hot: [540, 980 + sin(t * 2) * 30] });
    const close = 60 * eio(seg(lt, 0, d)), ph = t * 3;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const y = 1270 + r * 220, s = 0.44 + r * 0.12;
      soldier('r', r ? 'sword' : 'spear', 110 + i * 140 + close + r * 30, y, s, 1, ph + i, 0, 0.6);
      soldier('g', r ? 'bow' : 'spear', W - 110 - i * 140 - close - r * 30, y, s, -1, ph + i + 2, 0, 0.6);
    }
    // a spark of lamplight in the gap
    const g = ctx.createRadialGradient(540, 1100, 0, 540, 1100, 220); g.addColorStop(0, `rgba(255,236,170,${0.35 * PP.flick(t)})`); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(320, 880, 440, 440);
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge(0.6);
    PP.placard('CHOLA', 270, 360 + 6 * sin(t * 2), 0.85, 80, PAL.red, PAL.leather, -0.05);
    PP.placard('VS', 540, 520, pop(t, tChal + 0.4) * 0.8, 80, PAL.ochre, PAL.leather);
    PP.placard('CHALUKYA', 790, 360 + 6 * sin(t * 2 + 1), 0.85, 80, PAL.green, PAL.hole, 0.05);
  } });

  // ── a7 · a record tablet (punched dots only) rises on a rod ──
  add({ id: 'a7', at: T3, cam: [540, 820], zoom: 0.09, note: "abstract leather tablet with punched-dot rows (no letters) rises on a rod, 'CHOLA RECORDS SAY'", draw: (lt, d, t) => {
    PP.screen(t, { hot: [540, 820] });
    const r = eob(seg(lt, 0, 0.45)), ty = lerp(1900, 900, r) + 8 * sin(t * 2), rot = 0.03 * sin(t * 1.7);
    PP.rod(540, ty + 300, 0.01, 0.9);
    ctx.save(); ctx.translate(540, ty); ctx.rotate(rot);
    blit(tabletImg(), 320, 410, 0, 0, 1);
    // dot rows punch in one by one (glow as they appear)
    const shown = Math.floor(seg(lt, 0.35, d - 0.1) * 9 * 11);
    for (let row = 0; row < 9; row++) for (let c = 0; c < 11; c++) {
      const n = row * 11 + c; if (n >= shown) continue; if (rnd(n + 7) < 0.18) continue;
      const x = -180 + c * 36 + (row % 2) * 8, y = -170 + row * 52, fresh = clamp((shown - n) / 8);
      ctx.fillStyle = PAL.leather; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = PAL.hole; ctx.globalAlpha = 0.6 + 0.4 * (1 - fresh); ctx.beginPath(); ctx.arc(x, y, 5 + 3 * (1 - fresh), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();
    PP.stageFrame(t); PP.lampEdge(0.55);
    hang('CHOLA RECORDS', 540, 250, slam(t, T3 + 0.05, 0.22, 1.7) * 0.85, 84, swing(t, T3 + 0.2, 0.1));
    PP.placard('SAY...', 540, 420, pop(t, tSay) * 0.7, 76, PAL.red, PAL.leather, 0.04 * sin(t * 3));
  } });

  // ── a8 · red line pushes right, green puppets topple: WINNING? ──
  add({ id: 'a8', at: tWin, cam: [600, 1100], zoom: 0.1, note: "red line pushes right, green puppets topple back on their rods, 'WINNING?' (hedged)", draw: (lt, d, t) => {
    const [jx, jy] = shakeAll(lt, [0.1, 0.4], 18, 0.3); ctx.save(); ctx.translate(jx, jy);
    PP.screen(t, { hot: [640, 900] });
    const push = eo(seg(lt, 0, 0.8)) * 150, ph = t * 7;
    for (let i = 0; i < 4; i++) {
      const hit = seg(lt, 0.08 + i * 0.07, 0.5 + i * 0.07), gx = 520 + i * 120 + push * 0.8 + 50 * eo(hit);
      soldier('g', i % 2 ? 'bow' : 'spear', gx, 1440, 0.5, -1, ph + i, eo(hit) * (0.55 + rnd(i) * 0.3), 0.6);
    }
    for (let i = 0; i < 4; i++) soldier('r', i % 2 ? 'sword' : 'spear', 20 + i * 125 + push, 1440, 0.52, 1, ph + i, 0.08, 0.6);
    PP.volley(seg(lt, 0, 0.9), 6, 13, 1, 500, 900);
    ctx.restore();
    PP.stageFrame(t, 0.8); PP.lampEdge(0.55);
    rodPlacard('WINNING?', 540, 420, slam(t, tWin + 0.04, 0.2, 1.8), 120, swing(t, tWin + 0.25, 0.14, 6), PAL.red, PAL.leather);
  } });

  // ── sound ──
  cue(0.0, 'slam', { gain: 1.0 }); cue(0.05, 'whoosh', { gain: 0.8 }); cue(0.1, 'rumble', { gain: 0.7, dur: 1.4 }); cue(0.42, 'thud', { gain: 0.6 });
  cue(tEmp - 0.05, 'drum', { gain: 0.6 });
  cue(tDied, 'whoosh', { gain: 0.5 }); cue(tDied + 0.1, 'thud', { gain: 0.7 }); cue(tDied + 0.15, 'swell', { gain: 0.4, dur: 0.8 });
  cue(tEle, 'whoosh', { gain: 0.5 }); HITS.forEach((h) => cue(tEle + h, 'thud', { gain: 0.45 }));
  cue(tWho - 0.04, 'slam', { gain: 0.9 });
  cue(T1, 'whoosh', { gain: 0.5 }); cue(T1 + 0.38, 'thud', { gain: 0.7 }); cue(T1 + 0.42, 'tock', { gain: 0.35 });
  cue(tTung, 'pop', { gain: 0.45 });
  cue(tAround, 'whoosh', { gain: 0.4 }); cue(tTen + 0.12, 'slam', { gain: 0.85 }); cue(tFifty + 0.25, 'tock', { gain: 0.4 });
  cue(T2, 'drum', { gain: 0.7 }); cue(tRaja + 0.2, 'slam', { gain: 0.7 }); [0.5, 1.0, 1.5].forEach((o) => cue(T2 + o, 'drum', { gain: 0.35 }));
  cue(tChola2, 'whoosh', { gain: 0.4 }); [0.0, 0.3, 0.6].forEach((o) => cue(tChola2 + o, 'drum', { gain: 0.45 }));
  cue(tAgainst, 'slide', { gain: 0.5 }); cue(tWest + 0.2, 'thud', { gain: 0.55 }); cue(tChal + 0.2, 'slam', { gain: 0.65 });
  cue(tChal + 0.25, 'whoosh', { gain: 0.35 }); cue(tChal + 1.15, 'drum', { gain: 0.6 });
  cue(T3, 'whoosh', { gain: 0.4 }); cue(T3 + 0.4, 'thud', { gain: 0.55 }); cue(T3 + 0.7, 'chisel', { gain: 0.3, dur: 0.8 });
  cue(tWin, 'whoosh', { gain: 0.5 }); cue(tWin + 0.1, 'thud', { gain: 0.6 }); cue(tWin + 0.24, 'slam', { gain: 0.6 }); cue(tWin + 0.4, 'tock', { gain: 0.35 });
}
