// v22 KOPPAM · ART DIRECTION "Leather Shadow Puppets" (tholpavai-style shadow theatre; new to the channel).
// The whole film is a lamp-lit cloth screen. Everything is a translucent dyed-leather puppet pressed against the cloth from
// behind: flat cut shapes in madder red / turmeric / indigo / leaf green, edged in dark leather, pierced with rows of
// punched holes that glow with lamplight, jointed at pins, each held by a thin bamboo rod that runs off the bottom of the
// screen. Arrows and spears are crisp black true shadows. Puppets are FACELESS (profile head shape + crown only, no eyes,
// no mouth). The oil lamp behind the screen flickers: brightness and a moving hot spot are a pure function of t.
// All exports draw into the shared ctx. Use cached() for heavy statics. t = film time (s) unless named lt.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr } from './core/lib.js';
import { cached, blit } from './art.js';

export const PAL = {
  cloth: '#F3DDB0', clothHot: '#FFF1CC', clothEdge: '#7A4A1E', frame: '#2A1608', night: '#0C0603',
  red: '#B8322A', redDk: '#6E1712', ochre: '#D99A2B', ochreDk: '#8A5A12', indigo: '#2E3F7A', indigoDk: '#18214A',
  green: '#4E7A3A', greenDk: '#2A4520', leather: '#3A1E0E', hole: '#FFE7A8', rod: '#5A3A1A', blood: '#A0141A',
};
const sin = Math.sin, cos = Math.cos;

/** lamp flicker 0.85..1.1 (pure fn of t) */
export const flick = (t) => 0.97 + 0.06 * sin(t * 13.1) * sin(t * 4.7 + 1) + 0.04 * sin(t * 29.3);

/** the lit cloth screen filling the frame. hot = [x,y] of the lamp hot spot. dim 0..1 darkens (night/death). tint optional rgb string */
export function screen(t, o = {}) {
  const f = flick(t), [hx, hy] = o.hot || [540 + sin(t * 0.7) * 40, 820], dim = o.dim || 0;
  const base = cached('pp_cloth', W, H, 0.5, () => {
    ctx.fillStyle = PAL.cloth; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,80,30,0.08)'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 2); ctx.stroke(); }
    for (let x = 0; x < W; x += 7) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 2, H); ctx.stroke(); }
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(120,70,20,${0.03 + rnd(i) * 0.05})`; ctx.beginPath(); ctx.ellipse(rnd(i + 3) * W, rnd(i + 9) * H, 40 + rnd(i) * 160, 20 + rnd(i + 1) * 90, rnd(i + 2) * 3, 0, TAU); ctx.fill(); }
  });
  blit(base, 0, 0, 0, 0, 1);
  // hot spot from the lamp behind the cloth
  const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 900 * f);
  g.addColorStop(0, `rgba(255,236,170,${0.55 * f})`); g.addColorStop(0.5, 'rgba(255,190,90,0.12)'); g.addColorStop(1, 'rgba(60,20,0,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.tint) { ctx.fillStyle = `rgba(${o.tint},${o.tintA ?? 0.25})`; ctx.fillRect(0, 0, W, H); }
  if (dim) { ctx.fillStyle = `rgba(12,6,3,${dim})`; ctx.fillRect(0, 0, W, H); }
}
/** dark wooden stage frame + cloth hem (draw last, before labels). ripple 0..1 shakes the hem */
export function stageFrame(t, ripple = 0) {
  ctx.fillStyle = PAL.frame; ctx.fillRect(0, 0, W, 46); ctx.fillRect(0, H - 120, W, 120); ctx.fillRect(0, 0, 34, H); ctx.fillRect(W - 34, 0, 34, H);
  ctx.strokeStyle = PAL.clothEdge; ctx.lineWidth = 6; ctx.beginPath();
  for (let x = 34; x <= W - 34; x += 18) { const y = H - 120 + sin(x * 0.05 + t * 6) * 4 * ripple; x === 34 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
}
/** soft dark vignette like the edge of the lamp's reach */
export function lampEdge(a = 0.55) {
  const g = ctx.createRadialGradient(540, 860, 380, 540, 900, 1250); g.addColorStop(0, 'rgba(20,8,2,0)'); g.addColorStop(1, `rgba(20,8,2,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/** fill the current path as translucent dyed leather: colour + darker edge + punched-hole row along an inset. holes: spacing px (0 = none) */
export function leather(col, dk, holes = 22, a = 0.92) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.fill(); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = dk; ctx.stroke();
  if (holes) { ctx.save(); ctx.clip(); ctx.setLineDash([3, holes]); ctx.lineDashOffset = 0; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = PAL.hole; ctx.globalAlpha *= 0.85; ctx.stroke(); ctx.restore(); }
}
/** a pierced rosette (punched-hole flower) at x,y radius r: glows with lamp light */
export function rosette(x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = PAL.hole;
  for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU; ctx.beginPath(); ctx.arc(x + cos(ang) * r * 0.6, y + sin(ang) * r * 0.6, r * 0.16, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, TAU); ctx.fill(); ctx.restore();
}
/** a bamboo control rod from (x,y) down off the screen bottom (slightly angled) */
export function rod(x, y, lean = 0.08, a = 0.8) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = PAL.rod; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (H - y) * lean, H + 40); ctx.stroke(); ctx.restore();
}
const P = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const pin = (x, y) => { ctx.fillStyle = PAL.leather; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.hole; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); };

/** a faceless warrior / king puppet standing on (x,y) = feet, height ~ 620*s, facing dir (1 right, -1 left).
 *  o = { col, dk, crown: 0..1 (crown height, 0 none; >0 = king), arm: deg of the front arm (0 = down, 90 = forward),
 *        weapon: 'bow'|'spear'|'sword'|null, tilt: rad whole-body lean, rodA: rod alpha, shield: bool, step: 0..1 leg swing } */
export function warrior(x, y, s = 1, dir = 1, o = {}) {
  const col = o.col || PAL.red, dk = o.dk || PAL.redDk, st = o.step || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s * dir, s);
  // legs (jointed)
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 26, -250); ctx.rotate(k * st * 0.35); P([[-18, 0], [18, 0], [14, 250], [-14, 250]]); leather(PAL.ochre, PAL.ochreDk, 18); ctx.restore(); }
  // skirt / veshti
  P([[-70, -330], [70, -330], [96, -200], [-96, -200]]); leather(col, dk, 20);
  // torso
  P([[-56, -520], [56, -520], [70, -330], [-70, -330]]); leather(o.torso || PAL.ochre, PAL.ochreDk, 20);
  rosette(0, -430, 34);
  // back arm
  ctx.save(); ctx.translate(-48, -500); ctx.rotate(0.25); P([[-14, 0], [14, 0], [10, 200], [-10, 200]]); leather(PAL.ochre, PAL.ochreDk, 0); ctx.restore();
  // neck + faceless profile head (no eyes, no mouth)
  P([[-16, -540], [16, -540], [14, -520], [-14, -520]]); leather(PAL.ochre, PAL.ochreDk, 0);
  ctx.beginPath(); ctx.moveTo(-34, -560); ctx.bezierCurveTo(-46, -640, 20, -672, 42, -620); ctx.lineTo(56, -600); ctx.lineTo(40, -588); ctx.bezierCurveTo(40, -560, 10, -540, -34, -560); ctx.closePath(); leather(PAL.ochre, PAL.ochreDk, 0);
  if (o.crown) { const ch = 130 * o.crown; P([[-40, -640], [44, -640], [22, -640 - ch], [6, -640 - ch * 1.25], [-14, -640 - ch]]); leather(PAL.ochre, PAL.leather, 14); rosette(4, -640 - ch * 0.55, 18); }
  else { P([[-40, -636], [44, -636], [30, -690], [-30, -690]]); leather(dk, PAL.leather, 12); }
  // front arm
  ctx.save(); ctx.translate(40, -500); ctx.rotate(-((o.arm || 0) * Math.PI / 180));
  P([[-14, 0], [14, 0], [10, 210], [-10, 210]]); leather(PAL.ochre, PAL.ochreDk, 0); pin(0, 0); pin(0, 105);
  if (o.weapon === 'spear') { ctx.fillStyle = PAL.night; ctx.fillRect(-4, 120, 8, -460); P([[-14, -340], [14, -340], [0, -400]]); ctx.fill(); }
  if (o.weapon === 'sword') { ctx.fillStyle = PAL.night; P([[-6, 200], [6, 200], [4, 420], [0, 440], [-4, 420]]); ctx.fill(); }
  if (o.weapon === 'bow') { ctx.strokeStyle = PAL.night; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 210, 150, -1.3, 1.3); ctx.stroke(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cos(-1.3) * 150, 210 + sin(-1.3) * 150); ctx.lineTo(cos(1.3) * 150, 210 + sin(1.3) * 150); ctx.stroke(); }
  ctx.restore();
  if (o.shield) { ctx.beginPath(); ctx.arc(70, -400, 70, 0, TAU); leather(PAL.indigo, PAL.indigoDk, 16); rosette(70, -400, 40); }
  pin(-48, -500); pin(40, -500);
  ctx.restore();
  if ((o.rodA ?? 0.8) > 0) rod(x + 10 * dir * s, y - 420 * s, 0.06 * dir, o.rodA ?? 0.8);
}

/** a war-elephant puppet with a howdah, feet at (x,y), facing dir, size s (~ 900 px wide at s = 1).
 *  o = { rear: 0..1 (front legs lift, body tilts back), step: phase rad, rider: fn(x,y) to draw a rider at the howdah seat (in world coords), col } */
export function elephant(x, y, s = 1, dir = 1, o = {}) {
  const rear = o.rear || 0, ph = o.step || 0, col = o.col || PAL.indigo, dk = o.dk || PAL.indigoDk;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.rotate(-rear * 0.28);
  // legs
  const legs = [[-260, 0], [-140, 1], [150, 0], [260, 1]];
  legs.forEach(([lx, k], i) => { ctx.save(); ctx.translate(lx, -300); const front = lx > 0; ctx.rotate((front ? -rear * 0.7 : 0) + sin(ph + i * 1.6) * 0.12); P([[-46, 0], [46, 0], [42, 300], [-42, 300]]); leather(k ? dk : col, PAL.leather, 18); ctx.restore(); });
  // body
  ctx.beginPath(); ctx.ellipse(0, -430, 360, 210, 0, 0, TAU); leather(col, dk, 24);
  // caparison (cloth) with rosettes
  P([[-220, -560], [200, -560], [240, -320], [-250, -320]]); leather(PAL.red, PAL.redDk, 18);
  for (let k = -2; k <= 2; k++) rosette(k * 80, -440, 26);
  // head + ear + trunk + tusk
  ctx.beginPath(); ctx.ellipse(330, -520, 140, 130, 0.2, 0, TAU); leather(col, dk, 16);
  ctx.beginPath(); ctx.ellipse(270, -500, 90, 120, -0.2, 0, TAU); leather(dk, PAL.leather, 14);
  const tr = sin(ph * 0.5) * 0.2 + rear * 0.9;
  ctx.save(); ctx.translate(430, -470); ctx.rotate(-tr); P([[-34, 0], [34, 0], [22, 160], [40, 280], [10, 300], [-14, 170]]); leather(col, dk, 12); ctx.restore();
  P([[400, -430], [420, -420], [520, -360], [510, -350]]); ctx.fillStyle = PAL.hole; ctx.fill();
  // howdah
  P([[-150, -640], [150, -640], [170, -560], [-170, -560]]); leather(PAL.ochre, PAL.ochreDk, 16);
  P([[-130, -760], [130, -760], [150, -640], [-150, -640]]); leather(PAL.ochre, PAL.leather, 0); ctx.globalAlpha = 1;
  P([[-120, -760], [120, -760], [0, -840]]); leather(PAL.red, PAL.redDk, 10);
  ctx.restore();
  rod(x - 40 * dir * s, y - 330 * s, 0.05 * dir); rod(x + 240 * dir * s, y - 360 * s, 0.03 * dir);
  if (o.rider) { const ang = -rear * 0.28, sx = 0, sy = -770; const wx = x + dir * s * (sx * cos(ang) - sy * sin(ang)), wy = y + s * (sx * sin(ang) + sy * cos(ang)); o.rider(wx, wy); }
}
/** a crisp black arrow shadow from (x0,y0) toward (x1,y1); p 0..1 = how far it has flown; len px */
export function arrow(x0, y0, x1, y1, p, len = 220, w = 6) {
  if (p <= 0) return; const x = lerp(x0, x1, clamp(p)), y = lerp(y0, y1, clamp(p)), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = PAL.night;
  ctx.fillRect(-len, -w / 2, len, w); P([[0, -w * 2.4], [w * 5, 0], [0, w * 2.4]]); ctx.fill();
  P([[-len, 0], [-len - 30, -w * 3], [-len + 30, 0], [-len - 30, w * 3]]); ctx.fill();
  if (p < 1) { ctx.globalAlpha = 0.25; ctx.fillRect(-len * 3, -w / 4, len * 2, w / 2); }
  ctx.restore();
}
/** a volley: n arrows streaking across the screen, staggered, p 0..1; seed varies the paths. dir 1 = left->right */
export function volley(p, n = 14, seed = 0, dir = 1, yA = 300, yB = 1300) {
  for (let i = 0; i < n; i++) {
    const d = rnd(i + seed) * 0.35, pp = clamp((p - d) / 0.55), y0 = lerp(yA, yB, rnd(i * 3 + seed)), dy = (rnd(i * 7 + seed) - 0.5) * 300;
    const x0 = dir > 0 ? -300 : W + 300, x1 = dir > 0 ? W + 300 : -300; arrow(x0, y0, x1, y0 + dy, pp, 160 + rnd(i) * 100, 5);
  }
}
/** a cut-leather placard with punched-hole border, text in dark ink. sc = pop scale; col = leather colour */
export function placard(text, x, y, sc = 1, size = 92, col = PAL.ochre, ink = PAL.leather, rot = 0) {
  if (sc <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '3px';
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.55;
  ctx.save(); ctx.shadowColor = 'rgba(20,8,0,0.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
  P([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 + 24, 0], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2 - 24, 0]]); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  P([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 + 24, 0], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2 - 24, 0]]); leather(col, ink, 20, 1);
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.06);
  ctx.letterSpacing = '0px'; ctx.restore();
}
/** the lamp itself seen low on the stage edge (a brass oil lamp silhouette with a live flame) */
export function oilLamp(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = PAL.night;
  P([[-80, 0], [80, 0], [40, -40], [10, -60], [10, -200], [30, -220], [-30, -220], [-10, -200], [-10, -60], [-40, -40]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -232, 70, 20, 0, 0, TAU); ctx.fill();
  const f = flick(t); const g = ctx.createRadialGradient(0, -280, 0, 0, -280, 160 * f); g.addColorStop(0, 'rgba(255,230,150,0.9)'); g.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = g; ctx.fillRect(-200, -460, 400, 400);
  ctx.fillStyle = '#FFF1BE'; ctx.beginPath(); ctx.moveTo(-14, -246); ctx.quadraticCurveTo(0, -320 - 14 * sin(t * 11), 14, -246); ctx.fill();
  ctx.restore();
}
/** blood-red / white flash over the whole frame, p 0..1 decays */
export function flash(p, col = '160,20,26', a = 0.75) { if (p <= 0 || p >= 1) return; ctx.fillStyle = `rgba(${col},${a * (1 - p)})`; ctx.fillRect(0, 0, W, H); }
/** screen shake offset for a hit at time th (returns [dx,dy]); use ctx.translate */
export function shake(t, th, amp = 26, dur = 0.35) { const k = (t - th) / dur; if (k < 0 || k > 1) return [0, 0]; const e = (1 - k) * amp; return [sin(t * 90) * e, cos(t * 77) * e * 0.6]; }
/** the cloth tear / flip transition: a vertical seam sweeping across at p (0..1); draws a dark band + bright edge */
export function seamWipe(p, col = PAL.night) {
  if (p <= 0 || p >= 1) return; const x = lerp(-120, W + 120, eio(p));
  ctx.fillStyle = col; ctx.fillRect(x - 70, 0, 140, H); ctx.fillStyle = 'rgba(255,231,168,0.7)'; ctx.fillRect(x + 66, 0, 8, H);
}
export { eo, eio, eob, seg, clamp, lerp, rnd };
