// EPISODE 9 · worker B : "Ember Linocut", lines 5-9 (exile near Dindigul, Hyder Ali, the march back, RECORD vs FOLK SONG)
//   b1  print pull (black block peels off from the corner): carved Dindigul rock with fort walls, vermilion hills, a sun / moon
//       cycling over it (years passing), tiny queen + daughter at the foot; "8 YEARS" gouge-carved out of a black block,
//       "NEAR DINDIGUL" ribbon
//   b2  Hyder Ali as a huge turbaned carved silhouette from BEHIND (no face) is carved out of a black block in the foreground,
//       looking at the distant camp; vermilion dashed arcs rise over the camp as a protective dome; "HYDER ALI" ribbon, "of Mysore"
//   b3  "ACCOUNTS SAY" ribbon; the queen (sword planted) on the left, a file of carved musket soldiers marches in from the right,
//       two cannons roll in with spinning wheels; a giant ink roller (brayer) rolls across and inks the page black
//   b4  on the fresh black ink "1780" is gouge-carved in paper, "AROUND" ribbon; the queen on horseback (paper-white carved
//       rider, sword raised) gallops across, paper chips fly from the hooves
//   b5  carved map of the south (black land, paper sea with wavy cuts, echoed coast): a paper chevron trail is carved from
//       DINDIGUL to SIVAGANGA, the queen leads, two matching Maruthu brother silhouettes join, a vermilion pennant slams into
//       Sivaganga, "RETAKEN" ribbon
//   b6  pull-back: the map is now a finished print hanging on a drying line between two other prints (rock, Hyder), pegged;
//       "RECORD" ribbon unfurls across it
//   b7  a vermilion carved palace gateway with fluttering pennants is carved out of a black block; the queen stands in the
//       arch, sword planted; "of Sivaganga" note, then "QUEEN" slams on with an off-register shake
//   b8  paper burn: a burning hole with ember rim eats the queen print, revealing the black night page: a woman silhouette
//       inside a carved flame (heat shimmer, rising embers), "KUYILI", then "DIFFERENT"
//   b9  night: five seated singers (one drummer) around a small fire, rim-lit; dashed ember song-lines rise from them and
//       feed a small flame with a shifting woman silhouette (the details vary); "FOLK SONG" ribbon, "oral tradition" note
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd, lineWords } from './core/timing.js';
import { rgba, cached, blit, lg } from './art.js';

const PAPER = '#EADBC0', SHADE = '#D6C29E', INK = '#141010', VER = '#D2401F', VERD = '#8E2412', EMB = '#F39A2B', SOOT = '#4A4440', VERM = '#B3341A';

// ───────────── drawing primitives (work on whatever ctx is current, so they run inside cached()) ─────────────
const P = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
const C = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
const E = (x, y, rx, ry, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); };
const limb = (x1, y1, x2, y2, w) => { ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
/** a V-gouge cut: a tapered lens-shaped sliver from (x1,y1) to (x2,y2), bowed by `bend`, `w` wide at the middle */
function gstroke(x1, y1, x2, y2, bend = 3, w = 2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const cx = mx + nx * bend, cy = my + ny * bend;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx + nx * w, cy + ny * w, x2, y2); ctx.quadraticCurveTo(cx - nx * w, cy - ny * w, x1, y1); ctx.fill();
}
/** scattered parallel gouge cuts over a box */
function hatch(x0, y0, x1, y1, ang, gap, seed, dens = 0.5, len = [18, 60], wid = [1.4, 3], bend = 4) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2, ca = Math.cos(ang), sa = Math.sin(ang); let n = 0;
  for (let v = -R; v <= R; v += gap) for (let u = -R; u < R;) {
    n++; const l = len[0] + rnd(seed + n * 1.37) * (len[1] - len[0]);
    if (rnd(seed + n * 2.71) < dens) {
      const vv = v + (rnd(seed + n * 0.53) - 0.5) * gap * 0.5;
      gstroke(cx + ca * u - sa * vv, cy + sa * u + ca * vv, cx + ca * (u + l) - sa * vv, cy + sa * (u + l) + ca * vv, bend * (rnd(seed + n) - 0.5) * 2, wid[0] + rnd(seed + n * 3.3) * (wid[1] - wid[0]));
    }
    u += l + 6 + rnd(seed + n * 5.1) * 30;
  }
}
function blade(x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  ctx.beginPath(); ctx.moveTo(x1 + nx * w * 0.5, y1 + ny * w * 0.5);
  ctx.quadraticCurveTo((x1 + x2) / 2 + nx * w * 1.5, (y1 + y2) / 2 + ny * w * 1.5, x2, y2);
  ctx.quadraticCurveTo((x1 + x2) / 2 + nx * w * 0.1, (y1 + y2) / 2 + ny * w * 0.1, x1 - nx * w * 0.5, y1 - ny * w * 0.5); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(x1, y1); ctx.rotate(Math.atan2(dy, dx)); ctx.fillRect(-4, -20, 9, 40); ctx.restore();   // guard
}

// ───────────── paper, night ink, grain ─────────────
const paperImg = () => cached('b:paper', 1240, 2120, 0.5, () => {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1240, 2120);
  for (let i = 0; i < 60; i++) {
    const x = rnd(i * 3.1) * 1240, y = rnd(i * 7.7 + 1) * 2120, r = 80 + rnd(i * 1.3) * 260, lt = rnd(i * 5.9) < 0.4, c = lt ? '#F4EAD6' : SHADE;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(c, lt ? 0.5 : 0.42)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  const v = ctx.createRadialGradient(620, 1060, 520, 620, 1060, 1300); v.addColorStop(0, 'rgba(120,90,50,0)'); v.addColorStop(1, 'rgba(120,90,50,0.26)'); ctx.fillStyle = v; ctx.fillRect(0, 0, 1240, 2120);
});
const paper = () => blit(paperImg(), 0, 0, -80, -100);
const nightImg = () => cached('b:night', 1240, 2120, 0.5, () => {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1240, 2120); ctx.fillStyle = rgba(SOOT, 0.5);
  for (let r = 0; r < 70; r++) {
    const y0 = r * 31 + rnd(r) * 10;
    for (let x = -40; x < 1260;) { const l = 60 + rnd(r * 13 + x) * 160, yy = (xx) => y0 + Math.sin(xx * 0.004 + r) * 14; if (rnd(r * 7 + x * 0.37) < 0.5) gstroke(x, yy(x), x + l, yy(x + l), 4, 1.2 + rnd(x + r) * 1.6); x += l + 20 + rnd(x * 3 + r) * 80; }
  }
});
const night = () => blit(nightImg(), 0, 0, -80, -100);
const grainImg = () => cached('b:grain', 256, 256, 1, () => {
  for (let i = 0; i < 900; i++) { const x = rnd(i * 1.7) * 256, y = rnd(i * 2.3 + 5) * 256, r = 0.5 + rnd(i * 3.1) * 1.3; ctx.fillStyle = i % 3 ? `rgba(20,16,16,${0.05 + rnd(i) * 0.12})` : `rgba(250,240,220,${0.05 + rnd(i + 1) * 0.1})`; ctx.fillRect(x, y, r, r); }
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 70; i++) { const x = rnd(i * 9.1) * 256, y = rnd(i * 4.4) * 256, a = rnd(i * 6.6) * TAU, l = 4 + rnd(i * 2.2) * 12; ctx.strokeStyle = i % 2 ? 'rgba(90,70,40,0.13)' : 'rgba(255,248,230,0.10)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 2, y + Math.sin(a) * l * 0.5 - 2, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
});
let GP = null;
function grain(a = 1) { if (!GP) GP = ctx.createPattern(grainImg(), 'repeat'); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = GP; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore(); }

// ───────────── carved figures: black (or paper) silhouette + gouge cuts, plus a vermilion copy for the off-register print ─────────────
function carved(key, w, h, ox, oy, shape, gouge, fg = INK, gc = PAPER, rc = VER) {
  const k = cached('b:' + key, w, h, 1, () => {
    ctx.translate(ox, oy); ctx.fillStyle = ctx.strokeStyle = fg; shape();
    if (gouge) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = ctx.strokeStyle = gc; gouge(); ctx.globalCompositeOperation = 'source-over'; }
  });
  const r = cached('b:' + key + ':r', w, h, 0.5, () => { ctx.translate(ox, oy); ctx.fillStyle = ctx.strokeStyle = rc; shape(); });
  return { k, r, ox, oy };
}
/** print a carved figure with its foot/origin at (x, y); j = vermilion off-register offset */
function stamp(F, x, y, s = 1, j = [5, 4], a = 1, flip = false) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  if (j) blit(F.r, F.ox, F.oy, j[0] * (flip ? -1 : 1), j[1], s, a);
  blit(F.k, F.ox, F.oy, 0, 0, s, a); ctx.restore();
}
/** off-register offset of the vermilion layer: rests at (5,4), shakes on the beats */
function reg(t, beats = []) {
  let dx = 5, dy = 4;
  for (const b of beats) { const u = t - b; if (u > 0 && u < 0.7) { const k = Math.exp(-u * 7); dx += Math.sin(u * 55) * 10 * k; dy += Math.cos(u * 47) * 7 * k; } }
  return [dx, dy];
}

// Velu Nachiyar / a woman in profile facing right, feet at (0,0), ~620 tall. pose: plant (sword point down) | raise | none
const womanShape = (pose = 'plant', knot = true) => () => {
  P([[-30, -498], [-92, -372], [-112, -258], [-66, -270], [-28, -380]]);                                    // pallu drape
  P([[-36, -342], [30, -342], [56, -150], [76, -24], [86, 0], [-52, 0], [-46, -70], [-50, -210]]);          // sari
  P([[-36, -500], [28, -500], [34, -452], [24, -396], [30, -336], [-36, -336], [-28, -400], [-42, -452]]);  // torso
  P([[-11, -524], [11, -524], [13, -494], [-13, -494]]);
  E(4, -550, 33, 37);
  if (knot) { C(-12, -598, 23); E(-4, -578, 18, 12, -0.4); } else { limb(-22, -556, -42, -430, 16); C(-42, -426, 10); }
  limb(-30, -486, -46, -404, 20); limb(-46, -404, -38, -322, 17); C(-38, -318, 11);
  if (pose === 'plant') { limb(22, -486, 54, -412, 20); limb(54, -412, 82, -350, 17); C(84, -346, 12); blade(84, -346, 112, -6, 12); }
  else if (pose === 'raise') { limb(22, -486, 66, -548, 20); limb(66, -548, 86, -628, 17); C(87, -632, 12); blade(87, -632, 170, -840, 12); }
  else { limb(22, -486, 40, -404, 20); limb(40, -404, 42, -322, 17); C(42, -318, 11); }
};
const womanGouge = (seed) => () => {
  for (let i = 0; i < 6; i++) gstroke(-26 + i * 11, -322, -40 + i * 23, -24, (i - 2.5) * 3, 2.3);
  gstroke(-24, -480, -80, -300, 6, 2.2); gstroke(-32, -466, -98, -282, 8, 1.6);
  gstroke(-26, -440, 20, -424, -4, 2); gstroke(-26, -372, 22, -362, -3, 1.8);
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-12, -598, 11, 0.3, 4.6); ctx.stroke();
  hatch(-120, -640, 120, 0, -1.2, 28, seed, 0.16, [10, 30], [1, 2]);
};
const girlShape = () => {
  P([[-26, -150], [22, -150], [40, 0], [-36, 0]]); P([[-18, -200], [16, -200], [20, -146], [-22, -146]]); C(0, -226, 22);
  limb(-14, -226, -26, -168, 9); limb(16, -194, 42, -150, 10); limb(-14, -192, -22, -140, 9);
};
const hyderShape = () => {
  P([[-450, 760], [-420, 120], [-396, -150], [-350, -290], [-256, -372], [-120, -412], [120, -412], [256, -372], [350, -290], [396, -150], [420, 120], [450, 760]]);
  P([[-72, -392], [72, -392], [66, -470], [-66, -470]]);
  E(0, -532, 90, 100);
  E(0, -600, 134, 90); E(8, -660, 110, 72); E(-28, -702, 62, 40, -0.3);
  P([[18, -560], [64, -566], [96, -360], [46, -352]]);   // turban tail cloth down the back
};
const hyderGouge = () => {
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -600, 134, 90, 0, 0, TAU); ctx.ellipse(8, -660, 110, 72, 0, 0, TAU); ctx.ellipse(-28, -702, 62, 40, -0.3, 0, TAU); ctx.clip();
  for (let k = 0; k < 11; k++) gstroke(-150, -548 - k * 19, 150, -628 - k * 17, -22, 3.2 - k * 0.1);
  ctx.restore();
  for (const x of [-320, -230, -150, 130, 220, 310]) gstroke(x, -340 + Math.abs(x) * 0.12, x * 1.08, 300, x > 0 ? 14 : -14, 3);
  gstroke(-250, -360, 250, -360, -40, 2.4); gstroke(-6, -400, 4, 400, 6, 2.2);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -532, 90, 100, 0, 0, TAU); ctx.clip(); hatch(-90, -520, 90, -430, 1.45, 12, 3, 0.6, [10, 24], [0.8, 1.6], 2); ctx.restore();
  gstroke(54, -540, 80, -380, 4, 2);
};
const soldierShape = (lp) => () => {
  C(2, -352, 21); E(0, -374, 25, 13); E(-6, -388, 14, 9);
  P([[-10, -334], [10, -334], [10, -320], [-10, -320]]);
  P([[-24, -326], [24, -326], [26, -206], [-24, -206]]);
  P([[-26, -214], [26, -214], [46, -118], [-44, -118]]);
  if (lp) { limb(-12, -124, -32, -4, 15); limb(12, -124, 28, -4, 15); } else { limb(-6, -124, -4, -4, 15); limb(8, -124, 12, -4, 15); }
  limb(-18, -318, -26, -250, 13); limb(-26, -250, -8, -206, 12);
  limb(18, -316, 30, -260, 13); limb(30, -260, 38, -226, 12);
  limb(44, -214, -22, -476, 7); P([[30, -200], [52, -238], [62, -222], [44, -188]]);
};
const soldierGouge = () => { gstroke(-14, -300, -10, -220, 3, 1.8); for (let i = 0; i < 4; i++) gstroke(-20 + i * 13, -200, -36 + i * 24, -124, 2, 1.6); };
const brotherShape = () => {
  C(4, -292, 20); C(-10, -314, 12);
  P([[-9, -274], [9, -274], [10, -262], [-10, -262]]);
  P([[-30, -266], [30, -266], [22, -160], [-22, -160]]);
  P([[-26, -166], [24, -166], [34, -80], [-34, -80]]);
  limb(-12, -84, -20, -4, 13); limb(12, -84, 22, -4, 13);
  limb(24, -258, 42, -200, 12); limb(42, -200, 52, -160, 11);
  limb(54, -8, 54, -360, 6); P([[54, -396], [63, -358], [45, -358]]);
  E(-30, -200, 30, 34);
};
const rockShape = () => {
  ctx.beginPath(); ctx.moveTo(-450, 0); ctx.bezierCurveTo(-410, -200, -310, -380, -150, -420); ctx.lineTo(170, -430); ctx.bezierCurveTo(300, -400, 410, -220, 460, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(-150, -468, 320, 50); for (let i = 0; i < 9; i++) ctx.fillRect(-150 + i * 38, -492, 22, 26);
  ctx.fillRect(108, -540, 62, 80); for (let i = 0; i < 3; i++) ctx.fillRect(108 + i * 24, -560, 14, 22);
};
const rockGouge = () => {
  const dome = (x, k) => -425 * Math.pow(Math.max(0, 1 - Math.pow(x / 455, 2)), 0.55) * (1 - k * 0.1) + 10;
  for (let k = 1; k < 10; k++) for (let x = -420; x < 420; x += 46) if (rnd(k * 31 + x) > 0.38) { const y1 = dome(x, k), y2 = dome(x + 40, k); if (y1 < -8 && y2 < -8) gstroke(x, y1, x + 40, y2, -2, 2.6 - k * 0.15); }
  for (let i = 0; i < 6; i++) { const x = -300 + i * 120 + rnd(i) * 40; gstroke(x, -60, x + 30, dome(x, 2) * 0.6, 6, 1.8); }
  ctx.fillRect(-150, -440, 320, 3);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 50, -430); ctx.lineTo(-120 + i * 50, -448); ctx.arc(-114 + i * 50, -448, 6, Math.PI, 0); ctx.lineTo(-108 + i * 50, -430); ctx.fill(); }
};
const hutShape = () => { P([[-90, 0], [-80, -90], [0, -150], [80, -90], [90, 0]]); P([[-110, -82], [0, -170], [110, -82], [96, -70], [0, -146], [-96, -70]]); };
const hutGouge = () => { for (let i = 0; i < 7; i++) gstroke(-90 + i * 30, -88 + Math.abs(i - 3) * -10 + 30, -86 + i * 30, -4, 1, 1.8); ctx.fillRect(-20, -70, 40, 70); };
const gateShape = () => {
  for (const sx of [-1, 1]) {
    const cx = sx * 330; ctx.fillRect(cx - 100, -900, 200, 900);
    ctx.beginPath(); ctx.ellipse(cx, -900, 104, 96, 0, Math.PI, TAU); ctx.fill(); P([[cx - 6, -990], [cx + 6, -990], [cx, -1036]]); ctx.fillRect(cx - 120, -912, 240, 24);
  }
  ctx.beginPath(); ctx.rect(-240, -800, 480, 800);
  ctx.moveTo(-170, 0); ctx.lineTo(-170, -520); ctx.bezierCurveTo(-170, -640, -60, -700, 0, -742); ctx.bezierCurveTo(60, -700, 170, -640, 170, -520); ctx.lineTo(170, 0); ctx.closePath(); ctx.fill('evenodd');
  ctx.fillRect(-250, -832, 500, 34); for (let i = 0; i < 10; i++) ctx.fillRect(-244 + i * 50, -862, 30, 32);
};
const gateGouge = () => {
  for (let r = 0; r < 22; r++) for (let x = -440; x < 440; x += 70) if (rnd(r * 17 + x) > 0.42) gstroke(x + (r % 2) * 35, -40 - r * 40, x + 52 + (r % 2) * 35, -40 - r * 40, 0, 1.7);
  for (const sx of [-1, 1]) for (const y of [-720, -470, -220]) { const cx = sx * 330; ctx.beginPath(); ctx.moveTo(cx - 18, y + 70); ctx.lineTo(cx - 18, y); ctx.arc(cx, y, 18, Math.PI, 0); ctx.lineTo(cx + 18, y + 70); ctx.fill(); }
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-186, 0); ctx.lineTo(-186, -520); ctx.bezierCurveTo(-186, -650, -66, -716, 0, -760); ctx.bezierCurveTo(66, -716, 186, -650, 186, -520); ctx.lineTo(186, 0); ctx.stroke();
  for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) gstroke(sx * 330 - 90 + k * 40, -930, sx * 330 - 70 + k * 32, -990 + Math.abs(k - 2) * 14, 4, 1.8);
};
const hillsImg = () => cached('b:hills', 1240, 520, 0.5, () => {
  ctx.fillStyle = VER; ctx.beginPath(); ctx.moveTo(0, 520);
  for (let x = 0; x <= 1240; x += 20) ctx.lineTo(x, 200 - Math.sin(x * 0.006 + 1) * 90 - Math.sin(x * 0.017) * 40 - Math.max(0, Math.sin(x * 0.004 + 4)) * 80);
  ctx.lineTo(1240, 520); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = PAPER;
  for (let r = 0; r < 14; r++) for (let x = 0; x < 1240; x += 60) if (rnd(r * 9 + x) > 0.45) gstroke(x, 150 + r * 26 + Math.sin(x * 0.01 + r) * 10, x + 46, 150 + r * 26 + Math.sin((x + 46) * 0.01 + r) * 10, -3, 1.8);
  ctx.globalCompositeOperation = 'source-over';
});
const groundImg = () => cached('b:ground', 1240, 900, 0.5, () => {
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(0, 900); for (let x = 0; x <= 1240; x += 30) ctx.lineTo(x, 8 + Math.sin(x * 0.02) * 5 + rnd(x) * 6); ctx.lineTo(1240, 900); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = PAPER;
  for (let r = 0; r < 12; r++) for (let x = 0; x < 1240; x += 80) if (rnd(r * 5 + x * 0.3) > 0.4) gstroke(x + rnd(r + x) * 40, 34 + r * r * 4, x + 60 + rnd(r * 2 + x) * 40, 34 + r * r * 4 + 4, -2, 2.4 - r * 0.12);
  ctx.globalCompositeOperation = 'source-over';
});
const ground = (y) => blit(groundImg(), 0, 0, -80, y);

// cached figure set
const FIG = {};
const fig = (k) => FIG[k] || (FIG[k] = ({
  queen: () => carved('queen', 360, 900, 160, 860, womanShape('plant'), womanGouge(11)),
  queenR: () => carved('queenR', 380, 1100, 170, 1060, womanShape('raise'), womanGouge(12)),
  queenP: () => carved('queenP', 360, 900, 160, 860, womanShape('plant'), womanGouge(13), PAPER, INK),
  kuy: () => carved('kuy', 300, 700, 150, 660, womanShape('none', false), womanGouge(14)),
  girl: () => carved('girl', 140, 280, 70, 270, girlShape, () => gstroke(-10, -140, 20, -6, 2, 1.6)),
  hyder: () => carved('hyder', 920, 1540, 460, 780, hyderShape, hyderGouge),
  sold0: () => carved('sold0', 180, 520, 90, 500, soldierShape(0), soldierGouge),
  sold1: () => carved('sold1', 180, 520, 90, 500, soldierShape(1), soldierGouge),
  brotherP: () => carved('brotherP', 180, 440, 90, 420, brotherShape, () => { gstroke(-20, -150, -26, -86, 2, 1.6); gstroke(4, -150, 20, -86, 2, 1.6); }, PAPER, INK),
  rock: () => carved('rock', 940, 600, 470, 580, rockShape, rockGouge),
  hut: () => carved('hut', 240, 200, 120, 190, hutShape, hutGouge),
  gate: () => carved('gate', 1000, 1060, 500, 1050, gateShape, gateGouge, VER, PAPER, INK),
}[k])());

// ───────────── type, ribbons ─────────────
function bigT(s, x, y, size, col = INK, off = VER, j = [5, 4], a = 1, sc = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Inter`; const sp = Math.round(size * 0.04); ctx.letterSpacing = sp + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (off) { ctx.fillStyle = off; ctx.fillText(s, j[0] + sp / 2, j[1]); }
  ctx.fillStyle = col; ctx.fillText(s, sp / 2, 0); ctx.restore(); ctx.letterSpacing = '0px';
}
function note(s, x, y, size, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y + (1 - eo(clamp(a))) * 16);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, 1, 0); ctx.restore(); ctx.letterSpacing = '0px';
}
/** paper-cut ribbon banner: vermilion band, forked tails folded behind, paper text; unfurls from the left with k 0..1 */
function ribbon(label, x, y, k, size = 40, rot = -0.03) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `900 ${size}px Inter`; const sp = Math.round(size * 0.12); ctx.letterSpacing = sp + 'px';
  const tw = ctx.measureText(label).width, w = tw + size * 1.2, h = size * 1.75, tl = h * 1.0, dy = h * 0.3, L0 = -w / 2 - tl * 0.7, total = w + tl * 1.4;
  ctx.beginPath(); ctx.rect(L0 - 10, -h * 1.2, total * eo(clamp(k)) + 20, h * 2.8); ctx.clip();
  ctx.fillStyle = 'rgba(20,16,16,0.28)'; ctx.fillRect(-w / 2 + 7, -h / 2 + 9, w, h);
  for (const s of [-1, 1]) {
    const e = s * (w / 2 + tl * 0.7), i = s * (w / 2 - tl * 0.3);
    ctx.fillStyle = VERM; P([[i, -h / 2 + dy], [e, -h / 2 + dy], [e - s * tl * 0.32, dy], [e, h / 2 + dy], [i, h / 2 + dy]]);
    ctx.fillStyle = VERD; P([[s * w / 2, h / 2], [s * w / 2 - s * tl * 0.3, h / 2 + dy], [s * w / 2 - s * tl * 0.3, h / 2]]);
  }
  ctx.fillStyle = VER; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = rgba(PAPER, 0.55); ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, 2); ctx.fillRect(-w / 2 + 6, h / 2 - 8, w - 12, 2);
  ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, sp / 2, size * 0.04);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── devices ─────────────
/** GOUGE CARVE REVEAL: a black block over (x,y,w,h) is cut away by gouge strokes sweeping across with p 0..1 */
const SCR = {};
function carveReveal(key, x, y, w, h, p, col = INK) {
  if (p >= 1) return;
  let c = SCR[key]; if (!c) { c = document.createElement('canvas'); c.width = Math.ceil(w * 0.5); c.height = Math.ceil(h * 0.5); SCR[key] = c; }
  const g = c.getContext('2d'); g.setTransform(0.5, 0, 0, 0.5, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath();
  const sw = 74, sh = 24, ang = -0.35, chips = [];
  for (let r = -2; r < h / sh + 3; r++) for (let q = -2; q < w / sw + 3; q++) {
    const cx = q * sw + (r % 2) * sw * 0.5, cy = r * sh, thr = clamp((cx / w) * 0.55 + (cy / h) * 0.2, 0, 1) * 0.92 + rnd(r * 31 + q * 7 + 3) * 0.14 - 0.06;
    if (p > thr) { const k = clamp((p - thr) / 0.1), rx = sw * 0.66 * k, ry = sh * 0.75 * k; g.moveTo(cx + Math.cos(ang) * rx, cy + Math.sin(ang) * rx); g.ellipse(cx, cy, rx, ry, ang, 0, TAU); if (k < 1) chips.push([cx, cy, k]); }
  }
  g.fill(); ctx.drawImage(c, x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = rgba(PAPER, 0.85);
  for (const [cx, cy, k] of chips) gstroke(x + cx + sw * 0.5 * k, y + cy - 6, x + cx + sw * (0.55 + k * 0.4), y + cy - 18 - k * 10, -5, 1.6);
  ctx.restore();
}
/** PRINT PULL: a black inked sheet over the frame is peeled from the bottom-right corner, its light back folding over (p 0..1) */
function peel(p) {
  if (p >= 1) return;
  const nx = 0.49, ny = 0.87, dmax = nx * W + ny * H, f = lerp(dmax + 40, -220, eio(clamp(p)));
  ctx.save();
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, H + 600); ctx.clip();
  const sh = lg(nx * f, ny * f, nx * (f + 70), ny * (f + 70), [[0, 'rgba(20,16,16,0.45)'], [1, 'rgba(20,16,16,0)']]); ctx.fillStyle = sh; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.restore();
  ctx.beginPath(); const a = Math.atan2(ny, nx); ctx.save(); ctx.rotate(a); ctx.rect(f - 6000, -6000, 6000, 12000); ctx.restore(); ctx.clip();
  night();
  ctx.transform(1 - 2 * nx * nx, -2 * nx * ny, -2 * nx * ny, 1 - 2 * ny * ny, 2 * f * nx, 2 * f * ny);
  ctx.fillStyle = lg(nx * f, ny * f, nx * (f + 500), ny * (f + 500), [[0, '#BFA982'], [0.18, '#F2E7D2'], [1, '#DCC9A6']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.restore();
}
/** INK ROLLER WIPE: a giant brayer rolls left -> right; behind it the page is freshly inked black */
function roller(p) {
  if (p <= 0) return;
  const rx = lerp(-160, W + 260, eio(clamp(p)));
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, rx + 300, H + 600); ctx.clip(); night(); ctx.restore();
  ctx.strokeStyle = SOOT; ctx.lineCap = 'round'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(rx, 60); ctx.lineTo(rx - 280, 960); ctx.lineTo(rx, 1860); ctx.stroke();
  ctx.lineWidth = 46; ctx.strokeStyle = VERD; ctx.beginPath(); ctx.moveTo(rx - 300, 960); ctx.lineTo(rx - 640, 960); ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = rgba(EMB, 0.45); ctx.beginPath(); ctx.moveTo(rx - 310, 948); ctx.lineTo(rx - 620, 948); ctx.stroke();
  ctx.fillStyle = lg(rx - 62, 0, rx + 62, 0, [[0, '#0C0A0A'], [0.3, '#3A3330'], [0.42, '#8A817A'], [0.55, '#2A2524'], [1, '#090707']]); ctx.fillRect(rx - 62, 60, 124, 1800);
  ctx.fillStyle = rgba(PAPER, 0.18); for (let i = 0; i < 14; i++) { const yy = 100 + ((i * 131 + p * 3000) % 1720); ctx.fillRect(rx - 40, yy, 6, 30); }
  ctx.fillStyle = SOOT; for (const y of [60, 1860]) { ctx.beginPath(); ctx.ellipse(rx, y, 62, 16, 0, 0, TAU); ctx.fill(); }
}
/** PAPER BURN: a burning hole of radius r at (x,y). inside() draws the scene revealed through it */
function burnHole(x, y, r, t, inside) {
  if (r <= 0) return;
  const pts = []; const N = 80;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, k = 1 + 0.16 * Math.sin(3 * a + 1.3 + t * 0.7) + 0.09 * Math.sin(7 * a + 4 + t * 1.3) + 0.05 * Math.sin(17 * a + 2) + 0.03 * Math.sin(31 * a); pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); }
  const path = () => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
  ctx.save(); ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = 'rgba(110,60,20,0.22)'; ctx.lineWidth = 120; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(60,30,12,0.55)'; ctx.lineWidth = 44; ctx.stroke();
  ctx.save(); path(); ctx.clip(); inside(); ctx.restore();
  path(); ctx.strokeStyle = VER; ctx.lineWidth = 12; ctx.stroke();
  path(); ctx.strokeStyle = EMB; ctx.lineWidth = 5; ctx.stroke();
  for (let i = 0; i < N; i += 3) { const [px, py] = pts[i], fl = 0.5 + 0.5 * Math.sin(t * 13 + i * 1.7); ctx.fillStyle = rgba('#FFD08A', 0.5 * fl); ctx.fillRect(px - 3, py - 3, 6, 6); }
  ctx.restore();
}
function embers(t, n, x0, x1, yb, h, seed = 0, a = 1) {
  for (let i = 0; i < n; i++) {
    const sp = 60 + rnd(i * 3.3 + seed) * 140, ph = (t * sp / h + rnd(i * 7.1 + seed)) % 1, y = yb - ph * h;
    const x = x0 + rnd(i * 5.7 + seed) * (x1 - x0) + Math.sin(t * 2 + i) * 26 * ph, r = 1.5 + rnd(i * 1.9 + seed) * 3.5 * (1 - ph * 0.6);
    ctx.fillStyle = rgba(i % 3 ? EMB : VER, a * (1 - ph) * Math.min(1, ph * 8)); ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
/** carved flame: a jagged tongue silhouette */
function flame(x, yb, w, h, t, seed, col) {
  const N = 28; ctx.beginPath(); ctx.moveTo(x - w / 2, yb);
  for (let i = 0; i <= N; i++) {
    const u = i / N, env = Math.pow(Math.sin(Math.PI * u), 0.7);
    const tongue = 0.5 + 0.5 * Math.pow(Math.abs(Math.sin(u * Math.PI * 3.5 + t * 5 + seed)), 2.5) * (0.8 + 0.2 * Math.sin(t * 7 + i));
    ctx.lineTo(x - w / 2 + w * u + Math.sin(t * 6 + u * 7 + seed) * w * 0.06, yb - h * env * tongue * (0.86 + 0.14 * Math.sin(t * 9 + seed + u * 4)));
  }
  ctx.lineTo(x + w / 2, yb); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
/** heat shimmer: a cached figure drawn in horizontal slices, each nudged sideways */
function shimmer(F, x, y, s, t, amp = 4, n = 14) {
  const c = F.k, q = c._q, hh = c.height / n;
  for (let i = 0; i < n; i++) { const dx = Math.sin(t * 9 + i * 0.9) * amp * (i / n); ctx.drawImage(c, 0, i * hh, c.width, hh + 1, x - F.ox * s + dx, y - F.oy * s + i * hh / q * s, c.width / q * s, (hh + 1) / q * s); }
}

// ───────────── map of the south (carved block) ─────────────
const MX = (lon) => (lon - 77.0) * 415, MY = (lat) => 120 + (11.0 - lat) * 415;
const LAND = [[76.4, 12.5], [79.9, 12.5], [79.9, 10.32], [79.6, 10.31], [79.4, 10.33], [79.25, 10.15], [79.12, 9.95], [79.02, 9.74], [78.95, 9.55], [78.88, 9.42], [78.95, 9.33], [79.12, 9.29], [78.98, 9.24], [78.82, 9.2], [78.6, 9.15], [78.4, 9.08], [78.22, 8.92], [78.15, 8.75], [78.12, 8.52], [78.03, 8.38], [77.8, 8.22], [77.6, 8.1], [77.54, 8.08], [77.42, 8.15], [77.2, 8.33], [77.0, 8.5], [76.85, 8.6], [76.4, 9.0]];
const ISLE = [[79.2, 9.29], [79.32, 9.31], [79.44, 9.27], [79.42, 9.2], [79.28, 9.24], [79.2, 9.25]];
const jag = (poly) => { const out = []; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length], a = [MX(p[0]), MY(p[1])], b = [MX(q[0]), MY(q[1])]; for (let k = 0; k < 4; k++) { const u = k / 4; out.push([lerp(a[0], b[0], u) + (k ? (rnd(i * 9 + k) - 0.5) * 9 : 0), lerp(a[1], b[1], u) + (k ? (rnd(i * 5 + k * 3) - 0.5) * 9 : 0)]); } }); return out; };
const pathOf = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const mapImg = () => cached('b:map', 1080, 1920, 1, () => {
  const land = jag(LAND), isle = jag(ISLE);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = INK;
  for (let r = 0; r < 76; r++) { const y0 = r * 26 + 6; for (let x = -20; x < 1100;) { const l = 40 + rnd(r * 11 + x) * 90; if (rnd(r * 3 + x * 0.7) < 0.62) gstroke(x, y0 + Math.sin(x * 0.03 + r) * 5, x + l, y0 + Math.sin((x + l) * 0.03 + r) * 5, -3, 1.3); x += l + 14 + rnd(r + x) * 30; } }
  ctx.lineJoin = 'round';
  for (const [lw, c] of [[110, INK], [92, PAPER], [62, INK], [46, PAPER]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; pathOf(land); ctx.stroke(); pathOf(isle); ctx.stroke(); }
  ctx.fillStyle = INK; pathOf(land); ctx.fill(); pathOf(isle); ctx.fill();
  ctx.save(); pathOf(land); ctx.clip(); ctx.fillStyle = rgba(PAPER, 0.75);
  hatch(0, 0, 1080, 1500, 0.35, 34, 77, 0.22, [16, 50], [1, 2.2], 5);
  for (let i = 0; i < 9; i++) { const hx = 90 + i * 34 + rnd(i) * 20, hy = 400 + rnd(i * 3) * 70 + (i % 2) * 20, hw = 26 + rnd(i * 7) * 16; ctx.lineWidth = 3; ctx.strokeStyle = PAPER; ctx.beginPath(); ctx.moveTo(hx - hw, hy); ctx.lineTo(hx, hy - hw * 0.8); ctx.lineTo(hx + hw, hy); ctx.stroke(); }
  ctx.restore();
});
const DIN = [MX(77.98), MY(10.36)], SIV = [MX(78.48), MY(9.85)];
function mkPath(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; }
function along(Pt, d) { d = clamp(d, 0, Pt.len); let i = 0; while (i < Pt.pts.length - 2 && Pt.cum[i + 1] < d) i++; const a = Pt.pts[i], b = Pt.pts[i + 1], u = (d - Pt.cum[i]) / ((Pt.cum[i + 1] - Pt.cum[i]) || 1); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])]; }
const ROUTE = mkPath((() => { const out = []; for (let i = 0; i <= 30; i++) { const u = i / 30; out.push([lerp(DIN[0], SIV[0], u) - Math.sin(u * Math.PI) * 40 + Math.sin(u * 9) * 6, lerp(DIN[1], SIV[1], Math.pow(u, 0.8)) + Math.sin(u * Math.PI) * 30]); } return out; })());
/** map overlay: chevron trail to progress p, flag drop k, labels a */
function mapOver(p, flagK, labA, t, j) {
  const step = 26;
  for (let d = 8; d < ROUTE.len * p; d += step) {
    const [x, y, a] = along(ROUTE, d), pop = eob(clamp((ROUTE.len * p - d) / 40));
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(pop, pop);
    const ch = [[-8, -10], [2, -10], [12, 0], [2, 10], [-8, 10], [2, 0]];
    ctx.fillStyle = VER; ctx.save(); ctx.translate(j[0] * 0.5, j[1] * 0.5); P(ch); ctx.restore(); ctx.fillStyle = PAPER; P(ch); ctx.restore();
  }
  for (const [pt, lab, dx, dy] of [[DIN, 'DINDIGUL', -20, -44], [SIV, 'SIVAGANGA', 30, 48]]) {
    ctx.strokeStyle = PAPER; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(pt[0], pt[1], 11, 0, TAU); ctx.stroke(); ctx.fillStyle = VER; C(pt[0], pt[1], 5);
    bigT(lab, pt[0] + dx, pt[1] + dy, 30, PAPER, VER, [3, 3], labA);
  }
  if (flagK > 0) {
    const drop = (1 - eo(clamp(flagK * 1.6))) * -160, x = SIV[0] + 4, y = SIV[1] + drop;
    ctx.fillStyle = PAPER; ctx.fillRect(x - 3, y - 130, 6, 132);
    ctx.beginPath(); ctx.moveTo(x + 3, y - 128);
    for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x + 3 + u * 84, y - 128 + Math.sin(u * 5 - t * 9) * 6 * u); }
    ctx.lineTo(x + 70, y - 108); ctx.lineTo(x + 87, y - 86);
    for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(x + 3 + u * 84, y - 86 + Math.sin(u * 5 - t * 9) * 6 * u); }
    ctx.closePath(); ctx.fillStyle = VER; ctx.fill();
    if (flagK > 0.6) { const u = clamp((flagK - 0.6) / 0.4); ctx.strokeStyle = rgba(PAPER, 1 - u); ctx.lineWidth = 3; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r0 = 18 + u * 30, r1 = 30 + u * 60; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, SIV[1] + Math.sin(a) * r0 * 0.6); ctx.lineTo(x + Math.cos(a) * r1, SIV[1] + Math.sin(a) * r1 * 0.6); ctx.stroke(); } }
  }
}

// ───────────── animated figures ─────────────
function cannon(x, y, s, roll, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = ctx.strokeStyle = col;
  P([[70, -96], [76, -64], [-170, -96], [-176, -112], [-160, -118]]); C(76, -80, 18); E(-170, -106, 8, 14);
  P([[20, -60], [60, -76], [190, -4], [174, 6]]);
  ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(20, -46, 46, 0, TAU); ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = roll + i * Math.PI / 3; limb(20, -46, 20 + Math.cos(a) * 44, -46 + Math.sin(a) * 44, 6); }
  C(20, -46, 10); ctx.restore();
}
function rider(x, y, s, t, col) {
  const g = t * 10, bob = Math.sin(g * 2) * 7;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s); ctx.fillStyle = ctx.strokeStyle = col;
  const leg = (hx, hy, ph) => { const a = Math.sin(g + ph) * 0.7, b = a + 0.25 + Math.max(0, Math.sin(g + ph + 1)) * 0.9; const kx = hx + Math.sin(a) * 70, ky = hy + Math.cos(a) * 70; limb(hx, hy, kx, ky, 20); limb(kx, ky, kx + Math.sin(-b) * 70, ky + Math.cos(b) * 70, 13); };
  leg(-105, -200, 0); leg(-85, -200, 0.6); leg(95, -205, 2.4); leg(75, -205, 3.0);
  E(0, -222, 140, 58);
  P([[70, -250], [118, -330], [158, -354], [178, -326], [128, -214]]);
  P([[146, -360], [218, -314], [222, -294], [196, -286], [134, -318]]); P([[150, -352], [158, -384], [168, -350]]);
  for (let i = 0; i < 5; i++) gstroke(96 + i * 14, -268 - i * 18, 82 + i * 12, -300 - i * 16 + Math.sin(g + i) * 6, -4, 5);
  ctx.beginPath(); ctx.moveTo(-136, -240); ctx.quadraticCurveTo(-200, -230 + Math.sin(g) * 14, -236, -160 + Math.sin(g + 1) * 20); ctx.lineWidth = 16; ctx.stroke();
  // rider: torso leaning forward, hair knot, sword raised
  P([[-30, -266], [24, -266], [36, -380], [-6, -392]]);
  limb(-10, -266, 34, -206, 18); limb(34, -206, 26, -156, 14);
  C(22, -420, 24); C(4, -450, 15);
  P([[-6, -388], [-70, -340 + Math.sin(g * 1.5) * 10], [-110, -300 + Math.sin(g * 1.5 + 1) * 14], [-60, -320], [-10, -350]]);
  limb(20, -378, 62, -430, 14); limb(62, -430, 78, -488, 12); blade(78, -490, 168, -598, 10);
  ctx.restore();
}
function singer(x, y, s, flip, t, kind, col, ph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s); ctx.fillStyle = ctx.strokeStyle = col;
  E(10, -30, 92, 32); P([[-30, -52], [34, -52], [30, -190], [-24, -200]]);
  C(8, -232, 30); if (kind === 1) { E(4, -258, 32, 16); } else C(-10, -270, 16);
  limb(-18, -184, -10, -112, 15); limb(-10, -112, 30, -92, 13);
  const sw = Math.sin(t * (kind === 1 ? 14 : 7) + ph);
  if (kind === 1) { ctx.fillRect(40, -150, 96, 52); E(136, -124, 10, 26); limb(20, -184, 56, -150, 14); limb(56, -150, 120 + sw * 6, -152 - Math.abs(sw) * 26, 12); }
  else if (kind === 2) { limb(20, -184, 50, -230, 14); limb(50, -230, 70 + sw * 8, -300, 12); C(72 + sw * 8, -306, 10); }
  else { limb(20, -184, 54, -150, 14); limb(54, -150, 86, -168 - sw * 18, 12); C(88, -170 - sw * 18, 10); }
  ctx.restore();
}

// ───────────── shots ─────────────
export function buildB(add, cue) {
  const t1 = L(5), t2 = Wd('under', 5), t3 = L(6), t4 = L(7), t5 = Wd('with', 7), t6 = L(8), t7 = Wd('she', 8), t8 = L(9), t9 = Wd('from', 9), tE = L(10);
  const w7 = lineWords(7), backT = w7[w7.length - 1].s;

  // b1 · eight years near Dindigul
  const wEight = Wd('eight', 5), wYears = Wd('years', 5), wDin = Wd('dindigul', 5);
  add({ id: 'b1', at: t1, cam: [560, 760], zoom: 0.07, note: 'print pull reveals carved Dindigul rock + fort, sun/moon cycling = years, queen + daughter at its foot; "8 YEARS" gouge-carved, NEAR DINDIGUL ribbon',
    draw: (lt, d, t) => {
      paper(); const j = reg(t, [wEight, wDin]);
      const ph = (lt * 1.1) % 1, cyc = Math.floor(lt * 1.1), sx = lerp(-80, 1160, ph), sy = 900 - Math.sin(ph * Math.PI) * 380;
      if (cyc % 2 === 0) { ctx.fillStyle = VER; C(sx, sy, 74); ctx.fillStyle = rgba(PAPER, 0.7); for (let k = 0; k < 3; k++) { ctx.lineWidth = 3; ctx.strokeStyle = rgba(PAPER, 0.7); ctx.beginPath(); ctx.arc(sx, sy, 20 + k * 18, 0.4 + k, 4 + k); ctx.stroke(); } }
      else { ctx.fillStyle = INK; C(sx, sy, 60); ctx.fillStyle = PAPER; C(sx + 24, sy - 12, 54); }
      blit(hillsImg(), 0, 0, -80 + j[0] - lt * 14, 700 + j[1]);
      ground(1080);
      stamp(fig('rock'), 640, 1088, 1, j);
      stamp(fig('hut'), 140, 1088, 0.8, j);
      stamp(fig('queen'), 238, 1088, 0.36, j); stamp(fig('girl'), 286, 1088, 0.62, j);
      ctx.fillStyle = PAPER; for (let i = 0; i < 26; i++) { const gx = i * 44 + rnd(i) * 20, sw = Math.sin(lt * 3 + i) * 5; gstroke(gx, 1100, gx + sw + 6, 1078 - rnd(i * 3) * 14, 2, 2); }
      const pr = seg(t, wEight - 0.25, wYears + 0.4);
      if (pr > 0) { bigT('8 YEARS', 540, 330, 190, INK, VER, j); carveReveal('b1t', 150, 215, 780, 230, pr); }
      ribbon('NEAR DINDIGUL', 540, 470, seg(t, wDin - 0.1, wDin + 0.45), 40);
      grain(); peel(seg(lt, 0, 0.5));
    } });
  cue(t1, 'slide', { gain: 0.4 }); cue(wEight - 0.2, 'chisel', { gain: 0.5, dur: 0.6 }); cue(wYears, 'thud', { gain: 0.45 }); cue(wDin - 0.05, 'whoosh', { gain: 0.3 });

  // b2 · under the protection of Hyder Ali of Mysore
  const wProt = Wd('protection', 5), wHy = Wd('hyder', 5), wMy = Wd('mysore', 5);
  add({ id: 'b2', at: t2, cam: [520, 820], zoom: 0.08, note: 'Hyder Ali as a huge turbaned silhouette from behind carved out of a block, distant camp under rising vermilion dome arcs, HYDER ALI ribbon, "of Mysore"',
    draw: (lt, d, t) => {
      paper(); const j = reg(t, [wProt, wHy]);
      blit(hillsImg(), 0, 0, -80 + j[0] + lt * 10, 820 + j[1], 1, 1, 0.6);
      ground(960); ctx.fillStyle = SHADE; ctx.fillRect(-200, 1010, W + 400, 1100); ctx.fillStyle = rgba(INK, 0.5); for (let i = 0; i < 22; i++) { const gy = 1030 + i * i * 1.6, gx = (i * 173) % 1000; gstroke(gx, gy, gx + 120, gy + 2, 0, 1.6); }
      stamp(fig('rock'), 800, 966, 0.4, j); stamp(fig('hut'), 620, 966, 0.4, j);
      stamp(fig('queen'), 700, 966, 0.2, j); stamp(fig('girl'), 728, 966, 0.34, j);
      const pk = eo(seg(t, wProt - 0.25, wProt + 0.7));
      if (pk > 0) { ctx.save(); ctx.lineCap = 'butt'; for (let i = 0; i < 3; i++) { const r = (190 + i * 62) * pk; ctx.setLineDash([46, 14]); ctx.lineDashOffset = -lt * 60 * (i % 2 ? 1 : -1); ctx.lineWidth = 18 - i * 3; ctx.strokeStyle = i === 1 ? INK : VER; ctx.beginPath(); ctx.arc(720, 966, r, Math.PI, TAU); ctx.stroke(); } ctx.restore(); }
      stamp(fig('hyder'), 290, 1300 - eo(seg(lt, 0, 1.2)) * 30, 0.82, j);
      carveReveal('b2h', -20, 640, 660, 680, seg(lt, 0.05, 1.05));
      ribbon('HYDER ALI', 720, 330, seg(t, wHy - 0.1, wHy + 0.45), 54);
      note('of Mysore', 720, 430, 50, INK, seg(t, wMy - 0.1, wMy + 0.3));
      grain();
    } });
  cue(t2 + 0.05, 'chisel', { gain: 0.5, dur: 0.9 }); cue(wProt, 'swell', { gain: 0.4, dur: 1.0 }); cue(wHy - 0.05, 'whoosh', { gain: 0.35 }); cue(wMy, 'tock', { gain: 0.45 });

  // b3 · accounts say he lent her soldiers and guns
  const wLent = Wd('lent', 6), wSol = Wd('soldiers', 6), wGun = Wd('guns', 6);
  add({ id: 'b3', at: t3, cam: [560, 860], zoom: 0.06, note: 'ACCOUNTS SAY ribbon, queen left, carved musket soldiers march in from right, two cannons roll in, giant ink roller inks the page black',
    draw: (lt, d, t) => {
      paper(); const j = reg(t, [wSol, wGun]);
      blit(hillsImg(), 0, 0, -80 + j[0] - lt * 12, 760 + j[1], 1, 1, 0.8);
      ground(1180);
      stamp(fig('queen'), 150, 1186, 0.86, j);
      const arrive = eo(seg(t, wLent - 0.1, wSol + 0.4));
      for (let i = 0; i < 5; i++) {
        const x = 360 + i * 140 + (1 - arrive) * 760 + Math.max(0, (1 - arrive)) * i * 40, walking = arrive < 1, lp = walking ? Math.floor(lt * 7 + i) % 2 : 1;
        stamp(fig(lp ? 'sold1' : 'sold0'), x, 1186 - (walking ? Math.abs(Math.sin(lt * 11 + i)) * 8 : 0), 0.86, j, 1, true);
      }
      const ca = eo(seg(t, wGun - 0.2, wGun + 0.45));
      if (ca > 0) for (let i = 0; i < 2; i++) { const x = 470 + i * 330 + (1 - ca) * 800; cannon(x + j[0], 1250 + j[1], 0.95, (1 - ca) * 9, VER); cannon(x, 1250, 0.95, (1 - ca) * 9, INK); }
      ribbon('ACCOUNTS SAY', 540, 300, seg(lt, 0.05, 0.5), 50);
      grain();
      roller(seg(lt, d - 0.6, d));
    } });
  cue(t3 + 0.05, 'slide', { gain: 0.45 }); cue(wLent, 'drum', { gain: 0.4 }); cue(wLent + 0.25, 'drum', { gain: 0.4 }); cue(wSol + 0.1, 'drum', { gain: 0.5 });
  cue(wGun, 'rumble', { gain: 0.4, dur: 0.6 }); cue(wGun + 0.45, 'thud', { gain: 0.55 }); cue(t4 - 0.6, 'whoosh', { gain: 0.45 });

  // b4 · around 1780 she marched back
  const wSev = Wd('seventeen', 7), wMar = Wd('marched', 7);
  add({ id: 'b4', at: t4, cam: [540, 820], zoom: 0.07, note: 'fresh black ink: "1780" gouge-carved in paper, AROUND ribbon, the queen on horseback (paper-white carved rider) gallops across',
    draw: (lt, d, t) => {
      night(); const j = reg(t, [wSev + 0.5, wMar]);
      const pr = seg(t, wSev - 0.3, wSev + 0.75);
      bigT('1780', 540, 560, 300, PAPER, VER, j); carveReveal('b4t', 150, 400, 780, 320, pr);
      ribbon('AROUND', 540, 330, seg(lt, 0.1, 0.5), 44);
      const rk = seg(t, wMar - 0.45, t4 + d + 0.3), rx = lerp(-260, 1240, rk);
      ctx.fillStyle = rgba(PAPER, 0.8);
      for (let i = 0; i < 30; i++) { const gx = ((i * 97 - lt * 700) % 1300 + 1300) % 1300 - 100; gstroke(gx, 1200, gx + 50, 1202, 0, 2); }
      if (rk > 0) {
        for (let i = 0; i < 12; i++) { const age = (lt * 3 + i / 12) % 1, px = rx - 160 - age * 220 + rnd(i) * 40, py = 1190 - age * 90 * rnd(i * 3) - Math.sin(age * 3) * 30; ctx.fillStyle = rgba(PAPER, 0.8 * (1 - age)); gstroke(px, py, px - 22, py - 8, 3, 2.5); }
        rider(rx + j[0], 1196 + j[1], 1.05, lt, VER); rider(rx, 1196, 1.05, lt, PAPER);
      }
      grain(0.8);
    } });
  cue(wSev - 0.25, 'chisel', { gain: 0.5, dur: 0.9 }); cue(wSev + 0.55, 'slam', { gain: 0.45 });
  for (let k = 0; k < 4; k++) cue(wMar - 0.2 + k * 0.2, 'drum', { gain: 0.35 + 0.04 * k });

  // b5 · with the Maruthu brothers, took Sivaganga back
  const wMaru = Wd('maruthu', 7), wSiv = Wd('sivaganga', 7);
  add({ id: 'b5', at: t5, cam: [520, 640], zoom: 0.1, note: 'carved map: paper chevron trail DINDIGUL -> SIVAGANGA, queen leads, two Maruthu brothers join, vermilion pennant slams into Sivaganga, RETAKEN ribbon',
    draw: (lt, d, t) => {
      const j = reg(t, [wMaru, wSiv + 0.3]);
      const pan = eio(clamp(lt / d)), cx = lerp(470, 590, pan), cy = lerp(470, 600, pan);
      ctx.save(); ctx.translate(540, 700); ctx.scale(1.3, 1.3); ctx.translate(-cx, -cy);
      blit(mapImg(), 0, 0, 0, 0);
      const p = eio(seg(t, t5 + 0.1, wSiv + 0.2));
      mapOver(p, seg(t, wSiv + 0.05, wSiv + 0.7), seg(lt, 0.1, 0.5), t, j);
      const head = along(ROUTE, Math.max(0, ROUTE.len * p - 46)), bob = (k) => Math.abs(Math.sin(lt * 10 + k)) * 3;
      const back = along(ROUTE, Math.max(0, ROUTE.len * p - 120));
      const bk = eob(seg(t, wMaru - 0.05, wMaru + 0.3));
      if (bk > 0) { stamp(fig('brotherP'), back[0] - 28, back[1] - bob(1), 0.36 * bk, [3, 3]); stamp(fig('brotherP'), back[0] + 6, back[1] + 10 - bob(2), 0.36 * bk, [3, 3]); }
      stamp(fig('queenP'), head[0] + 6, head[1] - 4 - bob(0), 0.22, [3, 3]);
      if (bk > 0) note('Maruthu brothers', back[0] - 70, back[1] + 34, 26, PAPER, seg(t, wMaru, wMaru + 0.4));
      ctx.restore();
      ribbon('RETAKEN', 540, 230, seg(t, backT - 0.25, backT + 0.25), 48);
      grain(0.8);
    } });
  cue(t5, 'whoosh', { gain: 0.35 }); cue(t5 + 0.15, 'chisel', { gain: 0.35, dur: 1.6 }); cue(wMaru, 'pop', { gain: 0.5 }); cue(wMaru + 0.12, 'pop', { gain: 0.45 });
  cue(wSiv + 0.25, 'slam', { gain: 0.6 }); cue(backT - 0.2, 'whoosh', { gain: 0.3 });

  // b6 · that part is in the record
  const wRec = Wd('record', 8);
  add({ id: 'b6', at: t6, cam: [540, 700], zoom: -0.07, note: 'pull back: the map is a finished print pegged on a drying line between the rock and Hyder prints; RECORD ribbon unfurls across it',
    draw: (lt, d, t) => {
      paper(); const j = reg(t, [wRec]);
      const sag = (x) => 210 + Math.pow((x - 540) / 700, 2) * -60 + 40;
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); for (let x = -200; x <= 1280; x += 40) (x === -200 ? ctx.moveTo(x, sag(x)) : ctx.lineTo(x, sag(x))); ctx.stroke();
      const sheet = (cx, w, h, sway, inner) => {
        const top = sag(cx); ctx.save(); ctx.translate(cx, top); ctx.rotate(sway);
        ctx.fillStyle = 'rgba(20,16,16,0.22)'; ctx.fillRect(-w / 2 + 12, 14, w, h);
        ctx.fillStyle = '#F1E5CD'; ctx.fillRect(-w / 2, 0, w, h);
        ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 34, 34, w - 68, h - 90); ctx.clip(); inner(w, h); ctx.restore();
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 34, 34, w - 68, h - 90);
        for (const px of [-w / 2 + 60, w / 2 - 60]) { ctx.fillStyle = VERD; ctx.fillRect(px - 9, -22, 18, 52); ctx.fillStyle = INK; ctx.fillRect(px - 2, -22, 4, 52); }
        ctx.restore();
      };
      const slide = (1 - eo(seg(lt, 0, 0.6))) * 900, sw = Math.sin(lt * 3.2) * 0.012 + (1 - eo(seg(lt, 0, 0.9))) * 0.06;
      sheet(-120, 500, 640, -0.01 + Math.sin(lt * 2.5 + 1) * 0.008, () => { stamp(fig('rock'), 0, 520, 0.45, [3, 2]); ctx.fillStyle = INK; ctx.fillRect(-300, 520, 600, 200); });
      sheet(1200, 500, 640, 0.012 + Math.sin(lt * 2.7) * 0.008, () => stamp(fig('hyder'), 0, 700, 0.5, [3, 2]));
      sheet(540 + slide, 720, 960, sw, (w, h) => { ctx.save(); ctx.translate(0, h / 2 - 20); ctx.scale(0.66, 0.66); ctx.translate(-540, -560); blit(mapImg(), 0, 0, 0, 0); mapOver(1, 1, 1, t, [3, 3]); ctx.restore(); });
      ribbon('RECORD', 540, 930, seg(t, wRec - 0.1, wRec + 0.4), 84, -0.05);
      grain();
    } });
  cue(t6, 'slide', { gain: 0.45 }); cue(wRec + 0.05, 'thud', { gain: 0.6 }); cue(wRec + 0.1, 'bell', { gain: 0.25 });

  // b7 · she ruled Sivaganga as queen
  const wRul = Wd('ruled', 8), wSiv8 = Wd('sivaganga', 8), wQ = Wd('queen', 8);
  const sceneQueen = (lt, t, reveal = true) => {
    paper(); const j = reg(t, [wQ]);
    ground(1236);
    stamp(fig('gate'), 540, 1240, 1, [-5, -4]);
    for (const [fx, dir] of [[210, -1], [870, 1]]) {
      ctx.fillStyle = INK; ctx.fillRect(fx - 3, 120, 6, 90);
      ctx.beginPath(); ctx.moveTo(fx, 124); for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(fx + dir * u * 110, 124 + Math.sin(u * 5 - t * 8) * 8 * u); }
      ctx.lineTo(fx + dir * 92, 148); ctx.lineTo(fx + dir * 112, 172); for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(fx + dir * u * 110, 172 + Math.sin(u * 5 - t * 8) * 8 * u); } ctx.closePath(); ctx.fillStyle = VER; ctx.fill();
    }
    stamp(fig('queen'), 520, 1240, 1.15, j);
    if (reveal) carveReveal('b7g', 20, 180, 1040, 1070, seg(lt, 0.0, 1.0));
    bigT('QUEEN', 540, 300, 150, INK, VER, j, seg(t, wQ - 0.08, wQ + 0.05), lerp(1.4, 1, eo(seg(t, wQ - 0.08, wQ + 0.2))));
    ribbon('SIVAGANGA', 540, 1170, seg(t, wSiv8 - 0.1, wSiv8 + 0.4), 40, 0.02);
    grain();
  };
  add({ id: 'b7', at: t7, cam: [540, 720], zoom: 0.08, note: 'vermilion carved palace gateway + fluttering pennants carved out of a block, queen with planted sword in the arch, SIVAGANGA ribbon, QUEEN slams on',
    draw: (lt, d, t) => sceneQueen(lt, t) });
  cue(t7, 'chisel', { gain: 0.5, dur: 0.9 }); cue(wSiv8, 'whoosh', { gain: 0.3 }); cue(wQ, 'slam', { gain: 0.55 }); cue(wQ + 0.05, 'bell', { gain: 0.35 });

  // b8 · Kuyili's part is different
  const wDif = Wd('different', 9);
  const kuyScene = (lt, t) => {
    night();
    const fl = 1 + Math.sin(t * 11) * 0.03;
    flame(540, 1240, 560, 820 * fl, t, 1, VERD); flame(540, 1240, 440, 700 * fl, t * 1.2, 3, VER); flame(540, 1240, 300, 520 * fl, t * 1.4, 5, EMB);
    shimmer(fig('kuy'), 540, 1210, 0.95, t, 5);
    flame(540, 1260, 380, 220, t * 1.3, 7, VER); flame(540, 1260, 240, 140, t * 1.5, 9, EMB);
    ctx.fillStyle = INK; for (let i = 0; i < 6; i++) { const x = 380 + i * 64 + Math.sin(t * 3 + i) * 8; gstroke(x, 1240, x + Math.sin(t * 4 + i) * 20, 1110 - rnd(i) * 80, 8, 2.5); }
    embers(t, 46, 240, 840, 1260, 1100, 3);
  };
  add({ id: 'b8', at: t8, cam: [540, 760], zoom: 0.07, note: 'paper burn eats the queen print, revealing a woman silhouette inside a carved flame on black (shimmer, embers), "KUYILI", "DIFFERENT"',
    draw: (lt, d, t) => {
      sceneQueen(10, t7 + 2.9, false);
      const r = eio(seg(lt, 0.05, 1.3)) * 1500 + seg(lt, 0, 0.05) * 30;
      burnHole(560, 760, r, t, () => kuyScene(lt, t));
      const j = reg(t, [wDif]);
      bigT('KUYILI', 540, 250, 140, PAPER, VER, j, seg(lt, 0.4, 0.7));
      bigT('DIFFERENT', 540, 380, 84, EMB, VERD, j, seg(t, wDif - 0.05, wDif + 0.2), lerp(1.3, 1, eo(seg(t, wDif - 0.05, wDif + 0.25))));
      grain(0.7);
    } });
  cue(t8, 'sizzle', { gain: 0.5, dur: 1.4 }); cue(t8 + 0.4, 'whoosh', { gain: 0.35 }); cue(wDif, 'heartbeat', { gain: 0.5 });

  // b9 · from folk songs and oral tradition
  const wFolk = Wd('folk', 9), wOral = Wd('oral', 9);
  add({ id: 'b9', at: t9, cam: [540, 760], zoom: 0.08, note: 'night: five seated singers (one drummer) round a fire, ember song-lines rise into a small flame with a shifting woman silhouette, FOLK SONG ribbon, "oral tradition"',
    draw: (lt, d, t) => {
      night(); const j = reg(t, [wFolk]);
      const gl = ctx.createRadialGradient(540, 1180, 20, 540, 1180, 520); gl.addColorStop(0, rgba(EMB, 0.35)); gl.addColorStop(1, rgba(EMB, 0)); ctx.fillStyle = gl; ctx.fillRect(0, 700, W, 900);
      ctx.fillStyle = VERD; ctx.fillRect(-100, 1214, W + 200, 90); ctx.fillStyle = INK; for (let i = 0; i < 16; i++) gstroke(i * 74 - 20, 1236 + (i % 3) * 18, i * 74 + 40, 1238 + (i % 3) * 18, 0, 2);
      // song lines rising from the singers into the flame
      const S = [[110, 0, 0], [270, 0, 1], [800, 1, 2], [960, 1, 0], [410, 0, 2]];
      const grow = eo(seg(lt, 0.1, 1.6));
      ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([26, 14]);
      S.forEach(([sx, fl], i) => {
        const x0 = sx + (fl ? -40 : 40), y0 = 920; ctx.lineDashOffset = lt * 90;
        ctx.beginPath(); const N = 26;
        for (let k = 0; k <= N * grow; k++) { const u = k / N, x = lerp(x0, 540, eio(u)) + Math.sin(u * 7 + t * 2.4 + i) * 40 * Math.sin(u * Math.PI), y = lerp(y0, 760, u) - Math.sin(u * Math.PI) * 150; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = i % 2 ? VER : EMB; ctx.lineWidth = 7; ctx.stroke();
      });
      ctx.restore();
      // the small flame figure: shifts shape as the telling changes
      const fk = eo(seg(lt, 0.6, 1.5));
      if (fk > 0) {
        ctx.save(); ctx.globalAlpha = fk;
        flame(540, 790, 300, 470, t, 2, VER); flame(540, 790, 200, 350, t * 1.3, 4, EMB);
        const v = Math.floor(lt * 1.6) % 3, sk = [0.0, 0.12, -0.1][v], sc = [0.5, 0.46, 0.54][v];
        ctx.save(); ctx.translate(540, 770); ctx.transform(1, 0, sk, 1, 0, 0); shimmer(fig('kuy'), 0, 0, sc, t, 3, 10); ctx.restore();
        flame(540, 800, 200, 110, t * 1.6, 6, VER);
        ctx.restore();
      }
      // fire + singers (rim-lit)
      flame(540, 1216, 130, 150, t, 8, VER); flame(540, 1216, 80, 100, t * 1.3, 9, EMB);
      S.forEach(([sx, fl, kind], i) => { const dx = fl ? -5 : 5; singer(sx + dx, 1214 - 4, 1.1, fl, t, kind, EMB, i); singer(sx, 1214, 1.1, fl, t, kind, INK, i); });
      embers(t, 40, 300, 780, 1220, 1000, 9);
      ribbon('FOLK SONG', 540, 230, seg(t, wFolk - 0.1, wFolk + 0.4), 60);
      note('oral tradition', 540, 345, 54, PAPER, seg(t, wOral - 0.1, wOral + 0.3));
      grain(0.7);
    } });
  cue(t9, 'swell', { gain: 0.35, dur: 1.4 }); cue(wFolk, 'slide', { gain: 0.45 }); cue(wOral, 'sparkle', { gain: 0.35 });
  for (let k = 0; k < 6; k++) cue(t9 + 0.3 + k * 0.42, 'drum', { gain: 0.22 });
  void tE;
}
