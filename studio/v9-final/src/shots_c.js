// EPISODE 9 · worker C : "Ember Linocut", lines 10-14 (Kuyili's story as folk song, the fire, the doubt, today, end card)
//   c1  58.6-60.3  GOUGE CARVE: a black block is carved away to reveal Kuyili as a faceless spear-bearer before a vermilion sun; FOLK SONG ribbon; "KUYILI"
//   c2  60.3-61.9  a column of women soldiers (carved silhouettes, spears) marches right over a gouged ground band, off-register vermilion print shakes on "soldiers"; "WOMEN SOLDIERS"
//   c3  61.9-64.4  the Company magazine as a carved fort block, two slate-blue sentries pace, gunpowder barrels in the doorway; a vermilion chevron trail is carved from a watching silhouette to the door; "GUNPOWDER"; PRINT PULL peels to c4
//   c4  64.4-66.7  festival day: bunting swings, lamps flicker, a carved gateway's doors swing open on "let in" and women carrying pots file in; "FESTIVAL DAY"; INK ROLLER lays black ink into the night
//   c5  66.7-69.0  night page: a tall jar tips, amber oil lines run down a plain soot silhouette (no detail); a torch flame drifts in on "lit"; FOLK SONG ribbon
//   c6  69.0-71.9  the silhouette becomes a running FLAME FIGURE with embers + shimmer, runs into the store door; FLASH on "store", vermilion burst; PAPER BURN eats a hole into the black
//   c7  71.9-75.2  black page: charred print fragments drift with glowing rims (slivers of the fire print); "FIRM EVIDENCE" then "SCARCE" as fragments crumble; UNCERTAIN ribbon
//   c8  75.2-79.1  the same scene in three different prints (day / night / vermilion), each changed in detail, swapped by PRINT PULLS on "change" and "telling"; "DETAILS CHANGE"; UNCERTAIN ribbon
//   c9  79.1-81.6  TODAY ribbon; GOUGE CARVE reveals Velu Nachiyar (sword, hair knot) and Kuyili (flame-edged) facing each other under a vermilion arch; petals fall; name notes
//   c10 81.6-85.3  CARVED MAP of Tamil Nadu (black land, paper sea with wave cuts), camera pushes to Sivaganga, pin drops; MEMORIALS PLANNED ribbon; dashed unbuilt plinth roundel labelled ILLUSTRATION
//   c11 85.3-88.1  split print: top = Velu Nachiyar on horseback + RECORD ribbon; bottom paper burns open on "torch" to a torch flame on black + FOLK SONG ribbon
//   c12 88.1-end   INK ROLLER rolls black over c11, AAZHI carved out of the block letter by letter with vermilion off-register, FOLLOW ribbon, embers; "for the stories behind the stories"
import { ctx, W, H, TAU, clamp, lerp, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd, lineWords } from './core/timing.js';
import { cached, blit } from './art.js';

const PAP = '#EADBC0', SHD = '#D6C29E', INK = '#141010', VER = '#D2401F', VERD = '#8E2412', EMB = '#F39A2B', SOOT = '#4A4440', SLATE = '#3E5872';
const PAPB = '#F4EAD6';
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const rgba = (c, a) => { const A = hx(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const sg = (t, a, b) => clamp((t - a) / (b - a));
const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };

// ───────────── paper, ink and grain ─────────────
const bgImg = (kind) => cached('c:bg:' + kind, W + 200, H + 200, 0.5, () => {
  ctx.translate(100, 100);
  const base = kind === 'paper' ? PAP : kind === 'black' ? INK : VER;
  ctx.fillStyle = base; ctx.fillRect(-100, -100, W + 200, H + 200);
  for (let i = 0; i < 40; i++) {
    const x = rnd(i * 3.1 + 7) * W, y = rnd(i * 5.3 + 2) * H, r = 120 + rnd(i * 7.7) * 300;
    const c = kind === 'paper' ? (i % 2 ? SHD : PAPB) : kind === 'black' ? (i % 2 ? '#221A17' : '#0A0808') : (i % 2 ? VERD : '#E0583A');
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(c, kind === 'paper' ? 0.5 : 0.35)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  if (kind !== 'paper') { // carved chatter: faint paper gouge strokes across the inked page
    ctx.strokeStyle = rgba(PAP, kind === 'black' ? 0.06 : 0.1); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let y = -60, k = 0; y < H + 60; y += 26, k++) {
      let x = -80 + rnd(k) * 60;
      while (x < W + 80) { const len = 60 + rnd(k * 7 + x) * 260; ctx.beginPath(); ctx.moveTo(x, y + Math.sin(x * 0.004 + k) * 14); ctx.quadraticCurveTo(x + len / 2, y + Math.sin((x + len / 2) * 0.004 + k) * 14 - 6, x + len, y + Math.sin((x + len) * 0.004 + k) * 14); ctx.stroke(); x += len + 30 + rnd(k + x * 3) * 140; }
    }
  }
});
const bg = (kind) => blit(bgImg(kind), 100, 100, 0, 0, 1);
const grainTile = () => cached('c:grain', 256, 256, 1, () => {
  for (let i = 0; i < 1100; i++) { const x = rnd(i * 1.37) * 256, y = rnd(i * 2.91 + 4) * 256, r = 0.6 + rnd(i * 4.1) * 1.4; ctx.fillStyle = i % 3 ? `rgba(40,25,10,${0.06 + rnd(i) * 0.12})` : `rgba(255,248,230,${0.08 + rnd(i + 2) * 0.12})`; ctx.fillRect(x, y, r, r); }
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 70; i++) { const x = rnd(i * 5.7) * 256, y = rnd(i * 8.3 + 1) * 256, a = rnd(i * 2.2) * TAU, l = 6 + rnd(i * 3.3) * 18; ctx.strokeStyle = `rgba(70,45,20,${0.08 + rnd(i * 9) * 0.08})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
});
function grain(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat'); ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
function vig(a = 0.45, col = INK) { const g = ctx.createRadialGradient(540, 820, 420, 540, 860, 1250); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a)); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120); }

/** paper-coloured V-gouge strokes inside the current clip (call after ctx.clip()) */
function gouges(x0, y0, x1, y1, o = {}) {
  const { gap = 16, amp = 8, freq = 0.012, col = PAP, a = 0.4, lw = 2.4, seed = 1, slope = 0 } = o;
  ctx.strokeStyle = rgba(col, a); ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let y = y0, k = 0; y < y1; y += gap, k++) {
    let x = x0 + rnd(k + seed) * 30;
    while (x < x1) {
      const len = 40 + rnd(k * 3.3 + x * 0.1 + seed) * 180, f = (xx) => y + (xx - x0) * slope + Math.sin(xx * freq + k * 0.7 + seed) * amp;
      ctx.beginPath(); ctx.moveTo(x, f(x)); ctx.quadraticCurveTo(x + len / 2, f(x + len / 2) - 3, x + len, f(x + len)); ctx.stroke();
      x += len + 12 + rnd(k * 5.1 + x + seed) * 60;
    }
  }
}

// ───────────── type ─────────────
/** big carved word: Inter 900 caps with an off-register vermilion copy behind */
function big(s, x, y, size, col = INK, off = 5, a = 1, sc = 1, maxW = 960, col2 = VER) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.03) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width, f = Math.min(1, maxW / w); ctx.scale(sc * f, sc * f);
  if (col2) { ctx.fillStyle = col2; ctx.fillText(s, off, off * 0.7); }
  ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); ctx.letterSpacing = '0px';
}
function note(s, x, y, size, col = INK, a = 1, align = 'center') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea, serif`; ctx.letterSpacing = '2px'; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** print shake: off-register offset that kicks on a beat and settles */
const reg = (lt, beat, base = 4) => { const k = lt - beat; return base + (k > 0 ? 9 * Math.exp(-k * 5) * Math.cos(k * 30) : 0); };

/** PAPER-CUT RIBBON: vermilion band, forked tails, fold shadows; unfurls from the left (p 0..1) */
function ribbon(s, x, y, p, size = 40, rot = -0.025, col = VER, dk = VERD, tc = PAP) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.14) + 'px'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(s).width, w = tw + size * 1.6, h = size * 1.75, tl = size * 1.3, dr = size * 0.35;
  ctx.beginPath(); ctx.rect(-tl - 10, -h, (w + 2 * tl + 20) * eo(clamp(p)), h * 3); ctx.clip();
  // tails (behind, lower) + fold shadow triangles
  const tail = (x0, sgn) => { poly([[x0, -h / 2 + dr], [x0 - sgn * tl, -h / 2 + dr], [x0 - sgn * tl * 0.7, dr], [x0 - sgn * tl, h / 2 + dr], [x0, h / 2 + dr]]); ctx.fillStyle = dk; ctx.fill(); };
  tail(size * 0.4, 1); tail(w - size * 0.4, -1);
  poly([[0, h / 2], [size * 0.4, h / 2], [size * 0.4, h / 2 + dr]]); ctx.fillStyle = '#5A160B'; ctx.fill();
  poly([[w, h / 2], [w - size * 0.4, h / 2], [w - size * 0.4, h / 2 + dr]]); ctx.fill();
  ctx.fillStyle = 'rgba(20,16,16,0.25)'; ctx.fillRect(6, -h / 2 + 8, w, h);
  ctx.fillStyle = col; ctx.fillRect(0, -h / 2, w, h);
  ctx.fillStyle = 'rgba(234,219,192,0.18)'; ctx.fillRect(0, -h / 2 + 4, w, 3); ctx.fillRect(0, h / 2 - 7, w, 3);
  ctx.fillStyle = tc; ctx.fillText(s, size * 0.8, size * 0.04);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── figures: faceless carved silhouettes (profile, facing right when dir = 1) ─────────────
function woman(x, y, s, o = {}) {
  const { pose = 'stand', ph = 0, dir = 1, col = INK, spear = false, sword = false, pot = false, lean = 0, gouge = false, torch = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.rotate(lean);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const amp = pose === 'run' ? 0.85 : pose === 'walk' ? 0.42 : 0.04, sw = Math.sin(ph);
  if (pose !== 'ride') {
    const leg = (a, bend) => {
      const kx = Math.sin(a) * 80, ky = -158 + Math.cos(a) * 80, fa = a - bend, fx = kx + Math.sin(fa) * 80, fy = ky + Math.cos(fa) * 80;
      ctx.lineWidth = 21; ctx.beginPath(); ctx.moveTo(0, -158); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(fx - 4, fy); ctx.lineTo(fx + 22, fy + 2); ctx.stroke();
    };
    const bk = pose === 'run' ? 1.1 : 0.5;
    leg(sw * amp, bk * Math.max(0, -Math.cos(ph)) * (pose === 'stand' ? 0 : 1));
    leg(-sw * amp, bk * Math.max(0, Math.cos(ph)) * (pose === 'stand' ? 0 : 1));
  } else {
    ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(0, -158); ctx.lineTo(46, -150); ctx.lineTo(40, -70); ctx.stroke();
  }
  // knee-length tucked saree with a back pleat flare
  poly([[-22, -222], [20, -222], [34, -122], [-36, -118], [-54, -134]]); ctx.fill();
  if (gouge) { ctx.save(); ctx.clip(); ctx.strokeStyle = rgba(PAP, 0.55); ctx.lineWidth = 2.6; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-26 + k * 13, -206); ctx.quadraticCurveTo(-18 + k * 15, -170, -30 + k * 18, -126); ctx.stroke(); } ctx.restore(); ctx.fillStyle = col; }
  // torso, neck, head, high hair knot
  poly([[-24, -326], [22, -322], [17, -250], [14, -214], [-18, -214], [-25, -252]]); ctx.fill();
  ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, -326); ctx.lineTo(3, -346); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(5, -370, 24, 29, 0.08, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-9, -390, 19, 12, -0.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(-18, -404, 15, 0, TAU); ctx.fill();
  // arms
  const arm = (pts, w = 14) => { ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
  if (pose === 'run') {
    arm([[2, -314], [34 + sw * 10, -280], [58 + sw * 14, -300]]); arm([[0, -314], [-26 - sw * 12, -270], [-44 - sw * 10, -246]]);
  } else if (sword) {
    arm([[2, -314], [30, -360], [46, -416]]);
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(42, -400); ctx.quadraticCurveTo(62, -470, 92, -520); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(26, -414); ctx.lineTo(64, -404); ctx.stroke();
    arm([[0, -314], [-14, -262], [-6, -214]]);
  } else if (spear) {
    arm([[2, -314], [26, -270], [48, -268]]);
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(48, -520); ctx.lineTo(48, 4); ctx.stroke();
    poly([[48, -566], [58, -526], [48, -512], [38, -526]]); ctx.fill();
    arm([[0, -314], [-12 - sw * 8, -264], [-4 - sw * 10, -218]]);
  } else if (pot) {
    arm([[0, -314], [22, -360], [14, -420]]);
    ctx.beginPath(); ctx.ellipse(6, -428, 32, 25, 0, 0, TAU); ctx.fill(); ctx.fillRect(-8, -462, 28, 14);
    arm([[2, -314], [16 + sw * 10, -264], [24 + sw * 12, -222]]);
  } else if (torch) {
    arm([[2, -314], [34, -350], [52, -410]]);
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(44, -380); ctx.lineTo(62, -470); ctx.stroke();
    arm([[0, -314], [-14, -262], [-6, -214]]);
  } else {
    arm([[2, -314], [10, -262], [12, -214]]); arm([[0, -314], [-14, -262], [-6, -216]]);
  }
  ctx.restore();
}
function horse(x, y, s, ph, col = INK, gouge = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const legs = [[96, -214, 0], [118, -214, 2.2], [-104, -222, 3.3], [-82, -222, 1.1]];
  for (const [lx, ly, o] of legs) {
    const a = Math.sin(ph + o) * 0.5, kx = lx + Math.sin(a) * 74, ky = ly + Math.cos(a) * 74, b = a - 0.5 * Math.max(0, Math.cos(ph + o));
    ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(lx, ly - 20); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.sin(b) * 84, ky + Math.cos(b) * 84); ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(0, -262, 152, 64, -0.04, 0, TAU); ctx.fill();
  poly([[96, -300], [150, -322], [190, -412], [214, -432], [232, -404], [176, -270], [118, -214]]); ctx.fill();
  poly([[190, -420], [212, -448], [286, -382], [276, -358], [226, -382]]); ctx.fill();
  poly([[204, -436], [212, -476], [224, -440]]); ctx.fill();
  ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-146, -282); ctx.quadraticCurveTo(-214 + Math.sin(ph * 2) * 10, -230, -192, -130); ctx.stroke();
  if (gouge) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, -262, 152, 64, -0.04, 0, TAU); ctx.clip(); ctx.strokeStyle = rgba(PAP, 0.5); ctx.lineWidth = 2.6; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-130 + k * 10, -236 + k * 6); ctx.quadraticCurveTo(-10, -214 + k * 6, 120, -250 + k * 5); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
function tongue(x, y, w, h, lean, col) {
  ctx.beginPath(); ctx.moveTo(x - w / 2, y);
  ctx.bezierCurveTo(x - w / 2, y - h * 0.45, x + lean * 0.6 - w * 0.2, y - h * 0.72, x + lean, y - h);
  ctx.bezierCurveTo(x + lean * 0.5 + w * 0.3, y - h * 0.62, x + w / 2, y - h * 0.4, x + w / 2, y);
  ctx.arc(x, y, w / 2, 0, Math.PI); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
/** a flame (torch/lamp) built from 3 tongues */
function flame(x, y, s, t, seed = 0) {
  const f = (k) => 1 + 0.12 * Math.sin(t * 13 + seed + k) * Math.sin(t * 5.3 + k * 2);
  const lean = Math.sin(t * 3 + seed) * 10 * s;
  tongue(x, y, 64 * s, 150 * s * f(0), lean, VER); tongue(x, y, 44 * s, 112 * s * f(1), lean * 0.8, EMB); tongue(x, y + 4 * s, 22 * s, 62 * s * f(2), lean * 0.5, PAP);
}
const FLAME_PTS = [[5, -370, 1.2], [-18, -404, 1], [-24, -320, 1], [20, -320, 0.9], [-28, -260, 1.1], [16, -250, 0.8], [-40, -180, 1], [26, -170, 0.8], [-52, -130, 0.9], [6, -140, 0.7]];
/** FLAME FIGURE: a running silhouette made only of fire (no body detail) */
function flameFigure(x, y, s, t, ph, dir = 1, pose = 'run', heat = 1) {
  const back = -dir;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [px, py, k] of FLAME_PTS) { const i = px + py; tongue(px * dir, py, 54 * k, (120 + 60 * Math.sin(t * 11 + i)) * k * heat, back * (60 + 20 * Math.sin(t * 7 + i)), VER); }
  woman(0, 0, 1, { pose, ph, dir, col: EMB, lean: pose === 'run' ? 0.22 : 0, torch: pose !== 'run' });
  for (const [px, py, k] of FLAME_PTS) { const i = px * 2 + py; tongue(px * dir + back * 6, py + 10, 30 * k, (70 + 40 * Math.sin(t * 13 + i)) * k * heat, back * (40 + 14 * Math.sin(t * 9 + i)), EMB); }
  for (const [px, py, k] of FLAME_PTS.slice(0, 6)) tongue(px * dir, py + 12, 14 * k, (34 + 16 * Math.sin(t * 17 + px)) * k * heat, back * 18, PAP);
  ctx.restore();
}
function embers(t, n, x0, x1, y0, y1, seed = 0, a = 1) {
  for (let i = 0; i < n; i++) {
    const sp = 90 + rnd(i * 3 + seed) * 160, rng = y1 - y0, yy = y1 - ((t * sp + rnd(i * 7 + seed) * rng) % rng);
    const xx = x0 + rnd(i * 5 + seed) * (x1 - x0) + Math.sin(t * 2 + i) * 24 + (y1 - yy) * 0.06;
    const r = 2 + rnd(i * 11 + seed) * 5, life = (y1 - yy) / rng, tw = 0.5 + 0.5 * Math.sin(t * 9 + i * 1.7);
    ctx.fillStyle = rgba(i % 4 === 0 ? PAP : i % 2 ? EMB : VER, a * (1 - life) * (0.5 + 0.5 * tw));
    ctx.save(); ctx.translate(xx, yy); ctx.rotate(i + t); ctx.fillRect(-r / 2, -r / 2, r, r * 1.6); ctx.restore();
  }
}
function shimmer(t, x0, x1, y0, y1, a = 0.12) {
  ctx.strokeStyle = rgba(PAP, a); ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) { const y = y1 - ((t * 120 + k * (y1 - y0) / 6) % (y1 - y0)); ctx.beginPath(); for (let x = x0; x <= x1; x += 20) { const yy = y + Math.sin(x * 0.03 + t * 8 + k) * 6; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
}

// ───────────── set pieces (cached) ─────────────
/** Company magazine as a carved fort block: 640 x 560, base at y 560 */
const storeImg = (kind) => cached('c:store:' + kind, 640, 560, 1, () => {
  const wall = kind === 'ink' ? INK : SOOT, line = kind === 'ink' ? PAP : EMB;
  const body = () => { ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(0, 200); for (let x = 0; x < 640; x += 64) { ctx.lineTo(x, 160); ctx.lineTo(x + 36, 160); ctx.lineTo(x + 36, 200); ctx.lineTo(x + 64, 200); } ctx.lineTo(640, 560); ctx.closePath(); ctx.moveTo(150, 200); ctx.lineTo(150, 120); ctx.quadraticCurveTo(320, 10, 490, 120); ctx.lineTo(490, 200); ctx.closePath(); };
  body(); ctx.fillStyle = wall; ctx.fill('nonzero');
  ctx.save(); body(); ctx.clip(); gouges(0, 110, 640, 560, { gap: 30, amp: 3, freq: 0.02, col: line, a: kind === 'ink' ? 0.35 : 0.3, lw: 2.5, seed: 4 });
  for (let y = 230; y < 560; y += 60) for (let x = (y / 60) % 2 ? 0 : 40; x < 640; x += 80) { ctx.strokeStyle = rgba(line, 0.25); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30); ctx.stroke(); }
  ctx.restore();
  // door arch opening with powder barrels inside
  const door = () => { ctx.beginPath(); ctx.moveTo(250, 560); ctx.lineTo(250, 380); ctx.arc(320, 380, 70, Math.PI, 0); ctx.lineTo(390, 560); ctx.closePath(); };
  door(); ctx.fillStyle = kind === 'ink' ? PAP : '#241C18'; ctx.fill();
  ctx.save(); door(); ctx.clip();
  for (const [bx, by] of [[284, 500], [356, 500], [320, 440], [284, 380], [356, 380]]) { ctx.beginPath(); ctx.roundRect(bx - 32, by - 30, 64, 60, 14); ctx.fillStyle = VER; ctx.fill(); ctx.fillStyle = VERD; ctx.fillRect(bx - 32, by - 14, 64, 6); ctx.fillRect(bx - 32, by + 8, 64, 6); }
  ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; door(); ctx.stroke();
  // vault ridge cuts
  ctx.strokeStyle = rgba(line, 0.6); ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(170 + k * 10, 150 - k * 8); ctx.quadraticCurveTo(320, 46 + k * 22, 470 - k * 10, 150 - k * 8); ctx.stroke(); }
});
const store = (kind, x, y, s = 1) => blit(storeImg(kind), 320, 560, x, y, s);

function groundBand(y0, y1, col = INK, seed = 2, gcol = PAP) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(-80, y0); for (let x = -80; x <= W + 80; x += 40) ctx.lineTo(x, y0 + Math.sin(x * 0.011 + seed) * 10 + Math.sin(x * 0.037) * 4); ctx.lineTo(W + 80, y1); ctx.lineTo(-80, y1); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.clip(); gouges(-80, y0 + 14, W + 80, y1, { gap: 18, amp: 5, freq: 0.01, a: 0.32, seed, col: gcol }); ctx.restore();
}
/** cached ground band image (static) */
const groundImg = (key, y0, y1, col = INK, seed = 2) => cached('c:gr:' + key, W + 160, y1 - y0 + 40, 0.75, () => { ctx.translate(80, -y0 + 20); groundBand(y0, y1, col, seed); });
const ground = (key, y0, y1, col, seed) => blit(groundImg(key, y0, y1, col, seed), 80, 20, 0, y0, 1);

/** vermilion sun disc with carved rays */
const sunImg = () => cached('c:sun', 760, 760, 0.75, () => {
  ctx.translate(380, 380); ctx.beginPath(); ctx.arc(0, 0, 360, 0, TAU); ctx.fillStyle = VER; ctx.fill(); ctx.save(); ctx.clip();
  ctx.strokeStyle = rgba(PAP, 0.55); ctx.lineCap = 'round';
  for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, r0 = 120 + rnd(k) * 60, r1 = 300 + rnd(k + 3) * 70; ctx.lineWidth = 3 + rnd(k * 2) * 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a + 0.03) * r1, Math.sin(a + 0.03) * r1); ctx.stroke(); }
  ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 360, 0, TAU); ctx.lineWidth = 10; ctx.strokeStyle = VERD; ctx.stroke();
});
const sun = (x, y, s = 1, a = 1) => blit(sunImg(), 380, 380, x, y, s, a);

// ───────────── devices ─────────────
/** GOUGE CARVE REVEAL: a black block is carved in curved bands (left->right, row by row) to reveal img */
function carve(img, x, y, w, h, p, seed = 1, rows = 9, col = INK) {
  if (p >= 1) { blit(img, 0, 0, x, y, 1); return; }
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  if (p <= 0) return;
  const bh = h / rows, heads = [];
  ctx.save(); ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    const ord = (r * 5 + seed) % rows, st = ord / rows * 0.62, q = eio(clamp((p - st) / 0.38)); if (q <= 0) continue;
    const yc = y + (r + 0.5) * bh, len = (w + 80) * q, x0 = x - 40, amp = bh * 0.22, hw = bh * 0.72;
    const cy = (xx) => yc + Math.sin((xx - x) / w * Math.PI * 1.4 + r * 1.3 + seed) * amp;
    const N = 14, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const xx = x0 + len * i / N, taper = i === N ? 0.8 : 1; top.push([xx, cy(xx) - hw * taper]); bot.push([xx, cy(xx) + hw * taper]); }
    ctx.moveTo(top[0][0], top[0][1]); for (const pt of top) ctx.lineTo(pt[0], pt[1]); for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]); ctx.closePath();
    if (q < 1) heads.push([x0 + len, cy(x0 + len), hw]);
  }
  ctx.clip(); blit(img, 0, 0, x, y, 1); ctx.restore();
  for (const [hx0, hy, hw] of heads) { // the gouge tip + curled chip
    ctx.fillStyle = PAP; poly([[hx0 + 18, hy], [hx0 - 10, hy - hw * 0.5], [hx0 - 4, hy], [hx0 - 10, hy + hw * 0.5]]); ctx.fill();
    ctx.strokeStyle = rgba(PAP, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx0 + 8, hy - hw * 0.7, 9, 0.5, 4.5); ctx.stroke();
  }
}
function clipHalf(pts, f) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { const u = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
  }
  return out;
}
/** PRINT PULL: the top sheet is peeled from the bottom-right corner, showing its light back, revealing `under` */
function pull(p, under, top) {
  if (p <= 0) { top(); return; }
  if (p >= 1) { under(); return; }
  under();
  const k = lerp(W + H + 160, -420, eio(p)), page = [[-90, -90], [W + 90, -90], [W + 90, H + 90], [-90, H + 90]];
  const keep = clipHalf(page, (q) => k - (q[0] + q[1])), peel = clipHalf(page, (q) => q[0] + q[1] - k);
  if (keep.length > 2) { ctx.save(); poly(keep); ctx.clip(); top(); ctx.restore(); }
  if (peel.length > 2) {
    const flap = peel.map(([x, y]) => [k - y, k - x]);
    ctx.save(); ctx.translate(18, 18); poly(flap); ctx.fillStyle = 'rgba(20,16,16,0.3)'; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(k / 2, k / 2, k / 2 - 420, k / 2 - 420); g.addColorStop(0, SHD); g.addColorStop(0.25, PAPB); g.addColorStop(1, PAP);
    poly(flap); ctx.fillStyle = g; ctx.fill();
    ctx.save(); poly(flap); ctx.clip(); grain(0.8); ctx.restore();
    ctx.strokeStyle = 'rgba(20,16,16,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(k + 200, -200); ctx.lineTo(-200, k + 200); ctx.stroke();
  }
}
/** INK ROLLER WIPE: a brayer rolls top->bottom leaving fresh ink (`after` drawn above the roller line) */
function roller(p, after, inkCol = INK) {
  if (p <= 0) return;
  const ry = lerp(-160, H + 200, clamp(p) * (0.6 + 0.4 * clamp(p)));
  ctx.save(); ctx.beginPath(); ctx.rect(-100, -100, W + 200, ry + 100); ctx.clip(); after(); ctx.restore();
  // wet edge sheen
  const g = ctx.createLinearGradient(0, ry - 90, 0, ry); g.addColorStop(0, rgba(inkCol, 0)); g.addColorStop(1, 'rgba(234,219,192,0.12)'); ctx.fillStyle = g; ctx.fillRect(-100, ry - 90, W + 200, 90);
  if (p >= 1) return;
  // handle
  ctx.strokeStyle = '#2B2422'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(60, ry); ctx.lineTo(60, ry + 70); ctx.lineTo(540, ry + 170); ctx.lineTo(1020, ry + 70); ctx.lineTo(1020, ry); ctx.stroke();
  ctx.lineWidth = 46; ctx.strokeStyle = VERD; ctx.beginPath(); ctx.moveTo(540, ry + 170); ctx.lineTo(540, ry + 330); ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = rgba(PAP, 0.3); ctx.beginPath(); ctx.moveTo(530, ry + 190); ctx.lineTo(530, ry + 310); ctx.stroke();
  // roller cylinder
  const cg = ctx.createLinearGradient(0, ry - 64, 0, ry + 64); cg.addColorStop(0, '#0A0808'); cg.addColorStop(0.3, '#5C5450'); cg.addColorStop(0.42, '#8A817A'); cg.addColorStop(0.6, '#2A2422'); cg.addColorStop(1, '#0A0808');
  ctx.beginPath(); ctx.roundRect(40, ry - 64, W - 80, 128, 40); ctx.fillStyle = cg; ctx.fill();
  ctx.fillStyle = '#2B2422'; ctx.fillRect(30, ry - 70, 26, 140); ctx.fillRect(W - 56, ry - 70, 26, 140);
  const rot = (p * 40) % 1; ctx.strokeStyle = 'rgba(234,219,192,0.12)'; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { const yy = ry - 60 + ((rot + k / 4) % 1) * 120; ctx.beginPath(); ctx.moveTo(70, yy); ctx.lineTo(W - 70, yy); ctx.stroke(); }
}
/** PAPER BURN: a noisy burning hole of radius R (in front of whatever is drawn), `inside` fills it */
function burnPath(cx, cy, R, seed, t, grow = 0) {
  ctx.beginPath(); const N = 56;
  for (let i = 0; i <= N; i++) {
    const a = i / N * TAU, n = 0.5 + 0.22 * Math.sin(3 * a + seed) + 0.14 * Math.sin(7 * a + seed * 2 + t * 0.8) + 0.09 * Math.sin(13 * a + seed * 3 - t * 1.4) + 0.05 * Math.sin(29 * a + seed);
    const r = R * (0.72 + 0.45 * n) + grow, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 1.08;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function burn(cx, cy, R, seed, t, inside) {
  if (R <= 0) return;
  // scorch halo
  const g = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.35 + 60); g.addColorStop(0, 'rgba(70,35,15,0.6)'); g.addColorStop(1, 'rgba(70,35,15,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - R * 1.6 - 80, cy - R * 1.6 - 80, R * 3.2 + 160, R * 3.2 + 160);
  burnPath(cx, cy, R, seed, t, 16); ctx.fillStyle = '#2A1A12'; ctx.fill();
  ctx.save(); burnPath(cx, cy, R, seed, t); ctx.clip(); inside(); ctx.restore();
  burnPath(cx, cy, R, seed, t, 4); ctx.lineWidth = 12; ctx.strokeStyle = rgba(EMB, 0.85 + 0.15 * Math.sin(t * 20)); ctx.stroke();
  burnPath(cx, cy, R, seed, t, 1); ctx.lineWidth = 4; ctx.strokeStyle = '#FFE2A8'; ctx.stroke();
}

// ───────────── the print versions (for fragments + "details change") ─────────────
const printImg = (v) => cached('c:print:' + v, W, H, 0.5, () => {
  if (v === 'a') { // day paper: sun, store right, flame runner left
    ctx.fillStyle = PAP; ctx.fillRect(0, 0, W, H); blit(bgImg('paper'), 100, 100, 0, 0, 1);
    blit(sunImg(), 380, 380, 760, 560, 0.9);
    groundBand(1060, 1300, INK, 3); blit(storeImg('ink'), 320, 560, 760, 1090, 0.9);
    flameFigure(330, 1080, 1.35, 0.7, 1.2, 1);
  } else if (v === 'b') { // night page: store left, runner heading left, big burst
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); blit(bgImg('black'), 100, 100, 0, 0, 1);
    ctx.fillStyle = rgba(VER, 0.9); for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; poly([[300, 820], [300 + Math.cos(a - 0.06) * 620, 820 + Math.sin(a - 0.06) * 620], [300 + Math.cos(a + 0.06) * 620, 820 + Math.sin(a + 0.06) * 620]]); ctx.fill(); }
    groundBand(1060, 1300, SOOT, 5, EMB); blit(storeImg('soot'), 320, 560, 300, 1090, 0.95);
    flameFigure(800, 1090, 1.2, 2.1, 3.4, -1);
  } else { // vermilion page: small tower-like store, a standing torch-bearer
    ctx.fillStyle = VER; ctx.fillRect(0, 0, W, H); blit(bgImg('verm'), 100, 100, 0, 0, 1);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(540, 640, 260, 0, TAU); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke();
    groundBand(1080, 1300, INK, 7); blit(storeImg('ink'), 320, 560, 700, 1100, 0.7);
    woman(380, 1100, 1.2, { col: INK, torch: true, gouge: true }); flame(380 + 62 * 1.2, 1100 - 470 * 1.2, 0.9, 1.3, 2);
  }
});

// ───────────── carved map of Tamil Nadu (approximate outline) ─────────────
const TN = [[80.3, 13.4], [80.2, 12.6], [79.85, 11.9], [79.85, 10.9], [79.86, 10.3], [79.3, 10.28], [78.95, 9.9], [79.32, 9.28], [78.6, 9.1], [78.15, 8.75], [77.7, 8.2], [77.55, 8.08], [77.25, 8.3], [77.22, 8.8], [77.2, 9.5], [77.25, 10.0], [76.85, 10.3], [76.75, 10.9], [76.5, 11.3], [76.45, 11.6], [77.0, 11.85], [77.6, 12.2], [78.0, 12.6], [78.4, 12.8], [78.6, 13.1], [79.2, 13.2], [79.9, 13.55]];
const MK = 175, MX0 = 145, MY0 = 175;
const mp = (lon, lat) => [MX0 + (lon - 76) * MK, MY0 + (13.6 - lat) * MK];
const SIVA = mp(78.48, 9.85);
const mapImg = () => cached('c:map', W, 1300, 0.75, () => {
  ctx.fillStyle = PAP; ctx.fillRect(0, 0, W, 1300);
  // sea wave cuts (east + south)
  ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let k = 0; k < 90; k++) { const x = rnd(k * 3.7) * W, y = rnd(k * 5.9 + 2) * 1250; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 14, y - 10, x + 28, y); ctx.quadraticCurveTo(x + 42, y + 10, x + 56, y); ctx.stroke(); }
  // land neighbours (soot, beyond the outline) to the west/north
  const land = () => poly(TN.map(([a, b]) => mp(a, b)));
  land(); ctx.fillStyle = INK; ctx.fill();
  ctx.save(); land(); ctx.clip(); gouges(0, 120, W, 1250, { gap: 20, amp: 14, freq: 0.008, a: 0.3, seed: 9, slope: 0.12 }); ctx.restore();
  land(); ctx.strokeStyle = VER; ctx.lineWidth = 5; ctx.translate(5, 4); ctx.stroke(); ctx.translate(-5, -4);
  ctx.strokeStyle = rgba(PAP, 0.6); ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(...mp(77.35, 11.7)); ctx.lineTo(...mp(77.75, 10.6)); ctx.lineTo(...mp(77.9, 9.6)); ctx.stroke(); ctx.setLineDash([]);
});

export function buildC(add, cue) {
  const T10 = L(10), tWomen = Wd('women', 10), tSold = Wd('soldiers', 10), tWhere = Wd('where', 10), tGun = Wd('gunpowder', 10), tKept = Wd('kept', 10);
  const T11 = L(11), tFest = Wd('festival', 11), tLet = Wd('let', 11), tWorship = Wd('worship', 11), tPoured = Wd('poured', 11), tOil = Wd('oil', 11), tLit = Wd('lit', 11), tRan = Wd('ran', 11), tStore = Wd('store', 11);
  const T12 = L(12), tEvid = Wd('evidence', 12), tScarce = Wd('scarce', 12), tEven = Wd('even', 12), tChange = Wd('change', 12);
  const tell = lineWords(12).filter((w) => /^telling/i.test(w.w)), tTell2 = tell.length > 1 ? tell[1].s : tChange + 1.3;
  const T13 = L(13), tHon = Wd('honours', 13), tBoth = Wd('both', 13), tWith = Wd('with', 13), tMem = Wd('memorials', 13), tPlanned = Wd('planned', 13), tSiva = Wd('sivaganga', 13);
  const T14 = L(14), tRec = Wd('record', 14), tTorch = Wd('torch', 14), tSong = Wd('song', 14), tFollow = Wd('follow', 14), tAazhi = Wd('aazhi', 14), tStories = Wd('stories', 14);
  const END = T.dur;

  // c1 · carve reveal: Kuyili before the sun, FOLK SONG
  const k1Img = () => cached('c:k1', 900, 1060, 0.75, () => {
    ctx.fillStyle = PAP; ctx.fillRect(0, 0, 900, 1060); blit(bgImg('paper'), 190, 300, 0, 0, 1);
    blit(sunImg(), 380, 380, 520, 420, 0.95);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 860); for (let x = 0; x <= 900; x += 30) ctx.lineTo(x, 860 + Math.sin(x * 0.012) * 12); ctx.lineTo(900, 1060); ctx.lineTo(0, 1060); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.clip(); gouges(0, 876, 900, 1060, { gap: 18, amp: 5, a: 0.35, seed: 3 }); ctx.restore();
    woman(400 + 7, 880 + 5, 1.75, { col: VER, spear: true }); woman(400, 880, 1.75, { col: INK, spear: true, gouge: true });
  });
  const c1 = (lt, d) => {
    bg('paper');
    const sway = Math.sin(lt * 1.6) * 6;
    carve(k1Img(), 90, 200 + sway * 0.2, 900, 1060, clamp(lt / 1.05), 3, 10);
    ctx.save(); ctx.translate(0, Math.sin(lt * 2) * 3); big('KUYILI', 540, 160, 120, INK, reg(lt, 0.9, 5), clamp((lt - 0.55) / 0.25)); ctx.restore();
    ribbon('FOLK SONG', 120, 1210, (lt - 0.35) / 0.5, 40);
    embers(lt, 10, 500, 1000, 300, 900, 4, 0.5);
    grain(0.9); vig(0.35);
  };
  add({ id: 'c1', at: T10, cam: [560, 700], zoom: 0.1, note: 'gouge carve reveal of Kuyili (spear, high knot, faceless) before a vermilion carved sun; KUYILI; FOLK SONG ribbon', draw: c1 });
  cue(T10, 'chisel', { gain: 0.6, dur: 1.0 }); cue(T10 + 0.4, 'zip', { gain: 0.4 }); cue(T10 + 0.9, 'thud', { gain: 0.4 });

  // c2 · women soldiers march
  const c2 = (lt, d) => {
    bg('paper');
    sun(820, 520, 0.75 + 0.02 * Math.sin(lt * 2));
    // distant vermilion hills
    ctx.fillStyle = rgba(VER, 0.85); ctx.beginPath(); ctx.moveTo(-60, 1000); for (let x = -60; x <= W + 60; x += 30) ctx.lineTo(x, 900 + Math.sin((x + lt * 40) * 0.006) * 50 + Math.sin(x * 0.019) * 18); ctx.lineTo(W + 60, 1100); ctx.lineTo(-60, 1100); ctx.fill();
    ground('c2', 1020, 1300, INK, 2);
    const scroll = lt * 150, off = reg(lt, tSold - tWomen, 4);
    for (let i = 0; i < 6; i++) {
      const bx = -260 + i * 230 + scroll * 0.6 - 100, by = 1060 + (i % 2) * 18, ph = lt * 7 + i * 1.3, k = eob(clamp((lt - i * 0.07) / 0.35));
      if (k <= 0) continue;
      const s = 1.15 * k;
      woman(bx + off, by + off * 0.6, s, { pose: 'walk', ph, spear: true, col: VER });
      woman(bx, by, s, { pose: 'walk', ph, spear: true, col: INK, gouge: true });
    }
    big('WOMEN', 540, 220, 140, INK, off, clamp(lt / 0.2), 1); big('SOLDIERS', 540, 360, 120, INK, off, clamp((lt - 0.15) / 0.2), 1);
    ribbon('FOLK SONG', 120, 1210, 1, 34);
    grain(0.9); vig(0.35);
  };
  add({ id: 'c2', at: tWomen, cam: [540, 820], zoom: 0.08, note: 'column of faceless women soldiers with spears marching right over a gouged black ground, vermilion hills + sun; off-register print shake on "soldiers"; WOMEN SOLDIERS', draw: c2 });
  for (let i = 0; i < 5; i++) cue(tWomen + 0.1 + i * 0.32, 'drum', { gain: 0.35 });
  cue(tSold, 'slam', { gain: 0.4 });

  // c3 · the magazine, sentries, carved trail
  const TRAIL = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [lerp(230, 640, u), 1080 - Math.sin(u * Math.PI) * 120 + u * 20]; });
  const c4bg = (lt) => {
    bg('paper'); sun(540, 560, 1.05 + 0.02 * Math.sin(lt * 1.5));
  };
  const c3top = (lt, d) => {
    bg('paper');
    ctx.fillStyle = rgba(SHD, 0.8); ctx.fillRect(-60, 760, W + 120, 300);
    ground('c3', 1080, 1300, INK, 6);
    store('ink', 680, 1100, 1.0);
    // sentries pace at the door
    for (const [sx, ph0] of [[430, 0], [930, 2]]) {
      const walk = Math.sin(lt * 1.4 + ph0) * 30, dirS = Math.cos(lt * 1.4 + ph0) > 0 ? 1 : -1;
      woman(sx + walk, 1090, 0.82, { col: SLATE, pose: 'walk', ph: lt * 5 + ph0, spear: true, dir: dirS });
    }
    // the watching silhouette (left) + carved chevron trail to the door
    woman(150, 1110, 1.05, { col: INK, pose: 'stand', gouge: true, dir: 1 });
    const tp = clamp((lt - (tGun - tWhere) + 0.3) / 1.0);
    for (let i = 0; i < TRAIL.length - 1; i++) {
      if (i / (TRAIL.length - 1) > tp) break;
      const [x0, y0] = TRAIL[i], [x1, y1] = TRAIL[i + 1], a = Math.atan2(y1 - y0, x1 - x0);
      ctx.save(); ctx.translate(x0, y0 - 40); ctx.rotate(a); ctx.fillStyle = VER; poly([[-12, -14], [10, 0], [-12, 14], [-4, 0]]); ctx.fill(); ctx.restore();
    }
    // target ring at the door
    const rp = clamp((lt - (tKept - tWhere)) / 0.3);
    if (rp > 0) { ctx.strokeStyle = VER; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(680, 1000, 90 + 14 * Math.sin(lt * 6), 0, TAU * eo(rp)); ctx.stroke(); }
    big('GUNPOWDER', 540, 260, 130, INK, reg(lt, tGun - tWhere, 4), clamp((lt - (tGun - tWhere)) / 0.2));
    note('kept by the Company', 540, 380, 44, VERD, clamp((lt - (tKept - tWhere)) / 0.3));
    grain(0.9); vig(0.35);
  };
  const c3 = (lt, d) => pull(clamp((lt - (d - 0.5)) / 0.5), () => { c4bg(0); grain(0.9); }, () => c3top(lt, d));
  add({ id: 'c3', at: tWhere, cam: [600, 900], zoom: 0.09, note: 'Company magazine as a carved fort block with powder barrels in the arch, two slate-blue sentries pace; vermilion chevron trail from a watching silhouette; GUNPOWDER; print-pull out', draw: c3 });
  cue(tWhere, 'tock', { gain: 0.4 }); cue(tGun, 'rumble', { gain: 0.35, dur: 1.2 }); cue(tKept, 'pop', { gain: 0.4 }); cue(T11 - 0.45, 'slide', { gain: 0.5 });

  // c4 · festival day, the gate opens, women file in; roller lays the night
  const gateImg = () => cached('c:gate', 560, 760, 1, () => {
    const body = () => { ctx.beginPath(); ctx.moveTo(0, 760); ctx.lineTo(20, 300); ctx.lineTo(60, 300); ctx.lineTo(80, 200); ctx.lineTo(120, 200); ctx.lineTo(140, 110); ctx.lineTo(200, 110); ctx.lineTo(215, 40); ctx.lineTo(345, 40); ctx.lineTo(360, 110); ctx.lineTo(420, 110); ctx.lineTo(440, 200); ctx.lineTo(480, 200); ctx.lineTo(500, 300); ctx.lineTo(540, 300); ctx.lineTo(560, 760); ctx.closePath(); };
    body(); ctx.fillStyle = INK; ctx.fill();
    ctx.save(); body(); ctx.clip(); gouges(0, 50, 560, 760, { gap: 22, amp: 4, a: 0.35, seed: 8 });
    ctx.strokeStyle = rgba(PAP, 0.7); ctx.lineWidth = 4; for (const y of [110, 200, 300]) { ctx.beginPath(); ctx.moveTo(0, y + 10); ctx.lineTo(560, y + 10); ctx.stroke(); }
    ctx.restore();
    for (const x of [262, 280, 298]) { ctx.beginPath(); ctx.arc(x, 24, 10, 0, TAU); ctx.fillStyle = INK; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(170, 760); ctx.lineTo(170, 520); ctx.arc(280, 520, 110, Math.PI, 0); ctx.lineTo(390, 760); ctx.closePath(); ctx.fillStyle = PAP; ctx.fill();
  });
  const c4 = (lt, d) => {
    c4bg(lt);
    ground('c4', 1120, 1300, INK, 4);
    const gx = 540, gy = 1130;
    blit(gateImg(), 280, 760, gx, gy, 1);
    // inside the arch: a lamp glow; doors open on "let in"
    const op = eo(clamp((lt - (tLet - T11) + 0.15) / 0.45));
    flame(gx, gy - 60, 0.5, lt, 1);
    ctx.fillStyle = VERD; const dw = 110 * (1 - op * 0.85);
    ctx.fillRect(gx - 110, gy - 240, dw, 240); ctx.fillRect(gx + 110 - dw, gy - 240, dw, 240);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(gx - 110, gy - 240, dw, 240); ctx.strokeRect(gx + 110 - dw, gy - 240, dw, 240);
    // lamps on posts
    for (const lx of [150, 930]) { ctx.fillStyle = INK; ctx.fillRect(lx - 8, 900, 16, 230); ctx.fillRect(lx - 30, 892, 60, 14); flame(lx, 892, 0.42, lt, lx); }
    // bunting strings
    for (const [y0, sag, ph] of [[460, 90, 0], [560, 70, 1.5]]) {
      const swy = Math.sin(lt * 2.2 + ph) * 12;
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, y0); ctx.quadraticCurveTo(540, y0 + sag * 2 + swy, W + 40, y0); ctx.stroke();
      for (let k = 0; k < 15; k++) { const u = (k + 0.5) / 15, x = lerp(-40, W + 40, u), y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (y0 + sag * 2 + swy) + u * u * y0, fl = Math.sin(lt * 5 + k) * 6; poly([[x - 22, y], [x + 22, y], [x + fl, y + 52]]); ctx.fillStyle = k % 2 ? VER : INK; ctx.fill(); }
    }
    // women with pots file toward the gate
    for (let i = 0; i < 4; i++) {
      const u = clamp(lt * 0.33 + 0.08 - i * 0.16), into = clamp((u - 0.75) / 0.25);
      const bx = lerp(-80, gx - 10, eio(Math.min(u, 0.75) / 0.75)), s = 0.95 * (1 - 0.35 * into), a = 1 - into;
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = a; woman(bx, 1150 - into * 30, s, { col: INK, pose: 'walk', ph: lt * 6 + i * 1.7, pot: true, gouge: true }); ctx.restore();
    }
    big('FESTIVAL DAY', 540, 230, 120, INK, reg(lt, tLet - T11, 4), clamp((lt - (tFest - T11)) / 0.2));
    grain(0.9); vig(0.35);
    // roller into night
    roller(clamp((lt - (d - 0.55)) / 0.55), () => { bg('black'); });
  };
  add({ id: 'c4', at: T11, cam: [540, 860], zoom: 0.09, note: 'festival day: bunting swings, post lamps flicker, carved gateway doors open on "let in", women carrying pots file in; FESTIVAL DAY; ink roller lays black', draw: c4 });
  cue(tFest, 'bell', { gain: 0.5 }); cue(tLet, 'whoosh', { gain: 0.4 }); cue(tWorship - 0.5, 'slide', { gain: 0.5, dur: 0.5 });

  // c5 · night: the jar tips, oil lines run, a torch drifts in on "lit"
  const c5 = (lt, d) => {
    bg('black');
    const fx = 560, fy = 1180, sw = Math.sin(lt * 1.3) * 4;
    // vermilion back disc (moon-print)
    ctx.beginPath(); ctx.arc(560, 640, 330, 0, TAU); ctx.fillStyle = rgba(VERD, 0.55); ctx.fill();
    ground('c5', 1180, 1300, SOOT, 5);
    // the silhouette: plain soot shape, faceless, no detail
    woman(fx + 6, fy + 4, 1.45, { col: VERD, pose: 'stand' }); woman(fx, fy, 1.45, { col: SOOT, pose: 'stand' });
    // the jar tips above the head
    const tip = eo(clamp((lt - (tPoured - tWorship) + 0.1) / 0.5)) * 1.6;
    const jx = 600 + sw, jy = 470;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(-tip);
    ctx.beginPath(); ctx.moveTo(-30, -80); ctx.lineTo(30, -80); ctx.lineTo(40, -60); ctx.quadraticCurveTo(110, -10, 70, 80); ctx.lineTo(-70, 80); ctx.quadraticCurveTo(-110, -10, -40, -60); ctx.closePath(); ctx.fillStyle = VER; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; for (const y of [-30, 10, 50]) { ctx.beginPath(); ctx.moveTo(-80, y); ctx.lineTo(80, y); ctx.stroke(); }
    ctx.restore();
    // oil: amber lines from the jar mouth down the silhouette, revealed progressively
    const op = clamp((lt - (tOil - tWorship)) / 1.2);
    if (op > 0) {
      const mx = jx - Math.sin(tip) * 80 - 10, my = jy - Math.cos(tip) * 80 + 30;
      ctx.strokeStyle = rgba(EMB, 0.9); ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(mx - 20, my + 60, fx + 8, fy - 580 + 40 * Math.sin(lt * 9)); ctx.stroke();
      ctx.lineWidth = 4;
      for (let k = 0; k < 7; k++) { const x = fx - 40 + k * 13, y0 = fy - 560 + Math.abs(k - 3) * 30, len = op * (300 + rnd(k) * 220); ctx.strokeStyle = rgba(EMB, 0.75); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + Math.sin(k + y0) * 6, y0 + len); ctx.stroke(); ctx.beginPath(); ctx.arc(x + Math.sin(k + y0) * 6, y0 + len, 5, 0, TAU); ctx.fillStyle = EMB; ctx.fill(); }
    }
    // a torch drifts in from the right on "lit"
    const tq = eo(clamp((lt - (d - 0.55)) / 0.5));
    if (tq > 0) { const tx = lerp(1180, 760, tq), ty = lerp(900, 760, tq); ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 140, ty + 160); ctx.stroke(); flame(tx, ty, 0.8, lt, 5); embers(lt, 10, tx - 60, tx + 60, ty - 300, ty, 2, 0.8); }
    ribbon('FOLK SONG', 110, 220, (lt - 0.1) / 0.5, 40);
    grain(0.55); vig(0.5);
  };
  add({ id: 'c5', at: tWorship, cam: [580, 820], zoom: 0.12, note: 'night page: a carved jar tips, amber oil lines run down a plain soot silhouette (no detail); torch drifts in on "lit"; FOLK SONG ribbon', draw: c5 });
  cue(tPoured, 'gulp', { gain: 0.4 }); cue(tOil, 'plop', { gain: 0.35 }); cue(tLit - 0.4, 'whoosh', { gain: 0.3 });

  // c6 · flame figure runs into the store: flash, burst, paper burn
  const c6 = (lt, d) => {
    const tr = tRan - tLit, ts = tStore - tLit;
    bg('black');
    ground('c6', 1180, 1300, SOOT, 5);
    store('soot', 870, 1190, 0.85);
    // ignition ring
    const ig = clamp(lt / 0.35);
    const runU = eio(clamp((lt - tr + 0.15) / (ts - tr + 0.25)));
    const fx = lerp(300, 830, runU), fy = 1190;
    if (lt < ts + 0.05) {
      if (ig < 1) { ctx.strokeStyle = rgba(EMB, 1 - ig); ctx.lineWidth = 20 * (1 - ig) + 2; ctx.beginPath(); ctx.arc(fx, fy - 300, 100 + 400 * ig, 0, TAU); ctx.stroke(); }
      const s = 1.3 * (1 - 0.35 * clamp((runU - 0.75) / 0.25));
      flameFigure(fx, fy, s, lt, lt * 12, 1, runU > 0.02 ? 'run' : 'stand', 0.6 + 0.4 * ig);
      shimmer(lt, fx - 200, fx + 200, fy - 900, fy - 500, 0.1);
    }
    embers(lt, 26, 100, 1000, 300, 1200, 7, 0.9);
    // flash + burst on "store"
    const fl = lt - ts;
    if (fl > 0) {
      const b = eo(clamp(fl / 0.35));
      ctx.fillStyle = VER; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + 0.1; poly([[860, 960], [860 + Math.cos(a - 0.07) * 1300 * b, 960 + Math.sin(a - 0.07) * 1300 * b], [860 + Math.cos(a + 0.07) * 1300 * b, 960 + Math.sin(a + 0.07) * 1300 * b]]); ctx.fill(); }
      ctx.beginPath(); ctx.arc(860, 960, 260 * b, 0, TAU); ctx.fillStyle = EMB; ctx.fill();
      ctx.beginPath(); ctx.arc(860, 960, 130 * b, 0, TAU); ctx.fillStyle = PAP; ctx.fill();
      blit(storeImg('ink'), 320, 560, 870, 1190, 0.85, clamp(fl / 0.2));
      ctx.fillStyle = rgba('#FFF4E0', Math.max(0, 1 - fl / 0.4)); ctx.fillRect(-60, -60, W + 120, H + 120);
    }
    ribbon('FOLK SONG', 110, 220, 1, 40);
    grain(0.55); vig(0.4);
    // paper burn opens into the black (into c7)
    const bp = clamp((lt - ts - 0.55) / (d - ts - 0.55));
    if (bp > 0) burn(560, 760, 1300 * eio(bp) + 20, 2.3, lt, () => { bg('black'); embers(lt, 18, 100, 1000, 200, 1300, 3); });
  };
  add({ id: 'c6', at: tLit, cam: [620, 820], zoom: 0.1, note: 'silhouette becomes a running flame figure (fire only, no body detail) with embers + heat shimmer, runs into the store; white flash + vermilion burst on "store"; paper burn opens', draw: c6 });
  cue(tLit, 'sizzle', { gain: 0.6, dur: 1.4 }); cue(tRan, 'whoosh', { gain: 0.6 }); cue(tStore, 'slam', { gain: 0.9 }); cue(tStore + 0.05, 'rumble', { gain: 0.8, dur: 2.0 });
  cue(tStore + 0.7, 'sizzle', { gain: 0.35, dur: 1.4 });

  // c7 · fragments of the print: FIRM EVIDENCE / SCARCE
  const FR = Array.from({ length: 5 }, (_, i) => {
    const n = 9, cx = [300, 780, 540, 210, 860][i], cy = [640, 610, 870, 990, 960][i], r = [140, 130, 160, 100, 110][i];
    return { cx, cy, r, pts: Array.from({ length: n }, (_, k) => { const a = k / n * TAU + rnd(i * 9 + k) * 0.4, rr = r * (0.6 + rnd(i * 13 + k * 3) * 0.55); return [Math.cos(a) * rr, Math.sin(a) * rr]; }) };
  });
  const c7 = (lt, d) => {
    bg('black');
    embers(lt + 3, 22, 80, 1000, 200, 1300, 11, 0.8);
    const sc = tScarce - T12;
    FR.forEach((f, i) => {
      const crumble = clamp((lt - sc - i * 0.08) / 0.6), k = 1 - (i % 2 ? crumble * 0.75 : crumble * 0.3);
      if (k <= 0.05) return;
      const dx = Math.sin(lt * 0.7 + i) * 18, dy = Math.cos(lt * 0.6 + i * 2) * 14 + crumble * 120, rot = Math.sin(lt * 0.5 + i) * 0.12;
      ctx.save(); ctx.translate(f.cx + dx, f.cy + dy); ctx.rotate(rot); ctx.scale(k, k);
      poly(f.pts); ctx.save(); ctx.clip(); blit(printImg('a'), 0, 0, -f.cx, -f.cy, 1); ctx.fillStyle = 'rgba(60,30,10,0.18)'; ctx.fillRect(-300, -300, 600, 600); ctx.restore();
      poly(f.pts); ctx.lineWidth = 16; ctx.strokeStyle = '#2A1A12'; ctx.stroke();
      ctx.lineWidth = 5; ctx.strokeStyle = rgba(EMB, 0.7 + 0.3 * Math.sin(lt * 9 + i)); ctx.stroke();
      ctx.restore();
    });
    big('FIRM', 540, 200, 120, PAP, reg(lt, tEvid - T12, 5), clamp(lt / 0.2), 1, 960, VER);
    big('EVIDENCE', 540, 320, 120, PAP, reg(lt, tEvid - T12, 5), clamp((lt - (tEvid - T12) + 0.1) / 0.2), 1, 960, VER);
    big('SCARCE', 540, 1190, 140, EMB, reg(lt, sc, 6), clamp((lt - sc) / 0.15), 1 + 0.15 * (1 - eo(clamp((lt - sc) / 0.3))), 960, VERD);
    ribbon('UNCERTAIN', 120, 450, (lt - 0.5) / 0.5, 38);
    grain(0.5); vig(0.45);
  };
  add({ id: 'c7', at: T12, cam: [540, 760], zoom: 0.08, note: 'black page: charred print fragments with glowing rims drift (slivers of the fire print); FIRM EVIDENCE then SCARCE as fragments crumble; UNCERTAIN ribbon', draw: c7 });
  cue(T12, 'sizzle', { gain: 0.25, dur: 1.5 }); cue(tEvid, 'tock', { gain: 0.4 }); cue(tScarce, 'thud', { gain: 0.6 }); cue(tScarce + 0.1, 'bubbles', { gain: 0.15 });

  // c8 · details change: three prints swapped by print pulls
  const c8 = (lt, d) => {
    const p1 = clamp((lt - (tChange - tEven) + 0.15) / 0.55), p2 = clamp((lt - (tTell2 - tEven) + 0.1) / 0.55);
    const show = (v, lbl) => () => {
      blit(printImg(v), 0, 0, 0, 0, 1);
      embers(lt, 12, 100, 1000, 400, 1200, v.charCodeAt(0), 0.7);
      note(lbl, 540, 1250, 40, v === 'a' ? INK : PAP, 0.9);
      grain(v === 'a' ? 0.9 : 0.55);
    };
    pull(p2, show('c', 'another telling'), () => pull(p1, show('b', 'another telling'), show('a', 'one telling')));
    const off = reg(lt, tChange - tEven, 5) + (p2 > 0 ? 9 * Math.exp(-(lt - (tTell2 - tEven)) * 5) : 0);
    ctx.fillStyle = 'rgba(234,219,192,0.92)'; ctx.fillRect(-60, 130, W + 120, 300);
    big('DETAILS', 540, 220, 116, INK, off, 1); big('CHANGE', 540, 340, 116, INK, off, clamp((lt - (tChange - tEven)) / 0.15));
    ribbon('UNCERTAIN', 120, 500, (lt - 0.1) / 0.5, 38);
    vig(0.35);
  };
  add({ id: 'c8', at: tEven, cam: [540, 800], zoom: 0.07, note: 'the same fire scene in three different prints (day / night / vermilion), swapped by print pulls on "change" and second "telling"; DETAILS CHANGE; UNCERTAIN ribbon', draw: c8 });
  cue(tChange, 'slide', { gain: 0.5 }); cue(tTell2, 'slide', { gain: 0.5 }); cue(tEven, 'tock', { gain: 0.3 });

  // c9 · today: both women carved under a vermilion arch
  const k9Img = () => cached('c:k9', 960, 1000, 0.75, () => {
    ctx.fillStyle = PAP; ctx.fillRect(0, 0, 960, 1000); blit(bgImg('paper'), 160, 400, 0, 0, 1);
    ctx.beginPath(); ctx.moveTo(80, 1000); ctx.lineTo(80, 420); ctx.arc(480, 420, 400, Math.PI, 0); ctx.lineTo(880, 1000); ctx.closePath(); ctx.fillStyle = VER; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = rgba(PAP, 0.4); ctx.lineWidth = 4; for (let k = 0; k < 40; k++) { const a = Math.PI + k / 39 * Math.PI; ctx.beginPath(); ctx.moveTo(480 + Math.cos(a) * 180, 520 + Math.sin(a) * 180); ctx.lineTo(480 + Math.cos(a) * 420, 520 + Math.sin(a) * 420); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(60, 1000); ctx.lineTo(60, 420); ctx.arc(480, 420, 420, Math.PI, 0); ctx.lineTo(900, 1000); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; ctx.fillRect(0, 900, 960, 100); ctx.save(); ctx.beginPath(); ctx.rect(0, 900, 960, 100); ctx.clip(); gouges(0, 910, 960, 1000, { gap: 16, a: 0.35, seed: 5 }); ctx.restore();
    woman(300, 905, 1.5, { col: INK, sword: true, gouge: true, dir: 1 });
    flameFigure(660, 905, 1.5, 0.4, 0, -1, 'stand', 0.8);
  });
  const PET = Array.from({ length: 22 }, (_, i) => ({ x: rnd(i * 3.3) * 1000 + 40, sp: 120 + rnd(i * 5.1) * 120, ph: rnd(i * 7.7) * 10 }));
  const c9 = (lt, d) => {
    bg('paper');
    carve(k9Img(), 60, 200, 960, 1000, clamp(lt / 1.0), 5, 10);
    if (lt > 1.0) { // live flame lick on the carved Kuyili figure
      ctx.save(); ctx.globalAlpha = clamp((lt - 1.0) / 0.3); for (let k = 0; k < 5; k++) tongue(680 - k * 10 + 36, 1105 - 120 - k * 90, 30, 70 + 20 * Math.sin(lt * 10 + k), 30, EMB); ctx.restore();
    }
    for (const p of PET) { const y = -40 + ((lt + p.ph) * p.sp) % 1300, x = p.x + Math.sin(lt * 2 + p.ph) * 30; ctx.save(); ctx.translate(x, y); ctx.rotate(lt * 2 + p.ph); ctx.fillStyle = p.ph > 5 ? VER : EMB; ctx.beginPath(); ctx.ellipse(0, 0, 10, 5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    note('VELU NACHIYAR', 360, 1250, 42, INK, clamp((lt - 1.0) / 0.3)); note('KUYILI', 740, 1250, 42, INK, clamp((lt - 1.1) / 0.3));
    ribbon('TODAY', 110, 170, (lt - 0.05) / 0.4, 40);
    big('HONOURED', 690, 170, 80, INK, reg(lt, tHon - T13, 4), clamp((lt - (tHon - T13)) / 0.2), 1, 500);
    grain(0.9); vig(0.35);
  };
  add({ id: 'c9', at: T13, cam: [540, 760], zoom: 0.08, note: 'TODAY ribbon; gouge carve reveals Velu Nachiyar (sword, hair knot) and flame-edged Kuyili facing each other under a carved vermilion arch; falling petals; HONOURED', draw: c9 });
  cue(T13, 'chisel', { gain: 0.6, dur: 1.0 }); cue(tHon, 'bell', { gain: 0.45 }); cue(tBoth, 'sparkle', { gain: 0.3 });

  // c10 · carved map, Sivaganga, memorials planned (illustration)
  const c10 = (lt, d) => {
    bg('paper');
    blit(mapImg(), 0, 0, 0, 0, 1);
    note('TAMIL NADU', mp(78.1, 11.3)[0], mp(78.1, 11.3)[1], 46, PAP, 0.9);
    // Sivaganga pin
    const pin = lt - (tSiva - tWith);
    const [sx, sy] = SIVA;
    if (pin > -0.2) {
      const k = eob(clamp((pin + 0.2) / 0.35)), drop = (1 - eo(clamp((pin + 0.2) / 0.3))) * 160;
      ctx.save(); ctx.translate(sx, sy - drop); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, -64, 34, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = VER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAP; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -64, 12, 0, TAU); ctx.fillStyle = PAP; ctx.fill(); ctx.restore();
      if (pin > 0.1) { ctx.strokeStyle = rgba(VER, clamp(1 - (pin % 1.0))); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(sx, sy, 30 + (pin % 1.0) * 90, (30 + (pin % 1.0) * 90) * 0.5, 0, 0, TAU); ctx.stroke(); }
      ctx.save(); ctx.globalAlpha = clamp(pin / 0.3); ctx.font = '700 44px Caladea, serif'; const lw = ctx.measureText('SIVAGANGA').width + 50; ctx.restore();
      ctx.fillStyle = rgba(INK, 0.9 * clamp(pin / 0.3)); ctx.fillRect(sx - 30 - lw, sy + 12, lw, 58);
      note('SIVAGANGA', sx - 30 - lw / 2, sy + 42, 44, PAP, clamp(pin / 0.3));
    }
    // dashed, unbuilt plinth roundel (illustration)
    const ip = clamp((lt - (tPlanned - tWith) - 0.5) / 0.5);
    if (ip > 0) {
      const rx = 820, ry = 1040, k = eob(ip);
      ctx.save(); ctx.translate(rx, ry); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.fillStyle = PAP; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = VER; ctx.stroke();
      ctx.setLineDash([14, 10]); ctx.lineDashOffset = -lt * 30; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.strokeRect(-70, 40, 140, 40); ctx.strokeRect(-46, 0, 92, 40); ctx.strokeRect(-24, -100, 48, 100);
      ctx.setLineDash([]); ctx.restore();
      ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(sx + 10, sy + 20); ctx.lineTo(rx - 140 * k, ry - 40 * k); ctx.stroke(); ctx.setLineDash([]);
      ribbon('ILLUSTRATION', 660, 1225, (lt - (tPlanned - tWith) - 0.7) / 0.4, 30);
    }
    ribbon('MEMORIALS PLANNED', 150, 250, (lt - (tMem - tWith)) / 0.5, 38);
    grain(0.9); vig(0.3);
  };
  add({ id: 'c10', at: tWith, cam: [SIVA[0], SIVA[1]], zoom: 0.12, note: 'carved map of Tamil Nadu (black land with gouges, paper sea with wave cuts), push to Sivaganga, pin drops + ripple; MEMORIALS PLANNED ribbon; dashed unbuilt plinth roundel, ILLUSTRATION', draw: c10 });
  cue(tWith, 'whoosh', { gain: 0.4 }); cue(tMem, 'zip', { gain: 0.4 }); cue(tSiva, 'plop', { gain: 0.6 }); cue(tPlanned + 0.5, 'pop', { gain: 0.4 });

  // c11 · a queen in the record / a torch in the song
  const c11 = (lt, d) => {
    bg('paper');
    // top: queen on horseback, carved; a slow gallop
    const ph = lt * 6;
    ctx.save(); ctx.translate(Math.sin(lt * 0.8) * 20, 0);
    sun(850, 360, 0.42);
    ground('c11', 700, 735, INK, 8);
    horse(450 + 8, 715 + 5, 0.95, ph, VER); horse(450, 715, 0.95, ph, INK, true);
    woman(450 + 10 * 0.95, 715 - 142 * 0.95, 0.95, { pose: 'ride', col: INK, sword: true, gouge: true });
    ctx.restore();
    ribbon('RECORD', 110, 170, (lt - (tRec - T14)) / 0.4, 40);
    note('a queen', 240, 280, 46, INK, clamp(lt / 0.3));
    // divider
    ctx.fillStyle = INK; ctx.fillRect(-60, 730, W + 120, 10);
    // bottom: paper burns open to the torch
    const bp = clamp((lt - (tTorch - T14) + 0.25) / 0.6);
    ctx.save(); ctx.beginPath(); ctx.rect(-60, 740, W + 120, 550); ctx.clip();
    burn(540, 1000, 520 * eo(bp), 4.1, lt, () => {
      bg('black');
      ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540, 1000); ctx.lineTo(560, 1260); ctx.stroke();
      ctx.fillStyle = SOOT; ctx.fillRect(518, 980, 44, 40);
      flame(540, 990, 1.5, lt, 0); embers(lt, 16, 380, 700, 700, 1000, 5); shimmer(lt, 420, 660, 620, 800, 0.1);
    });
    ctx.restore();
    ribbon('FOLK SONG', 110, 800, (lt - (tSong - T14)) / 0.4, 40);
    note('a torch', 860, 810, 46, PAP, clamp((lt - (tTorch - T14)) / 0.3));
    grain(0.85); vig(0.3);
  };
  add({ id: 'c11', at: T14, cam: [540, 600], zoom: 0.07, note: 'split print: top Velu Nachiyar on horseback (carved, sword) + RECORD ribbon; bottom paper burns open on "torch" to a torch flame on black + FOLK SONG ribbon', draw: c11 });
  cue(T14, 'drum', { gain: 0.4 }); cue(tRec, 'thud', { gain: 0.5 }); cue(tTorch, 'sizzle', { gain: 0.5, dur: 1.0 }); cue(tSong, 'bell', { gain: 0.35 });

  // c12 · end card: roller, AAZHI carved, FOLLOW
  const c11End = (tFollow - T14);
  const titleImg = () => cached('c:title', 960, 300, 1, () => {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, 960, 300);
    ctx.font = '900 230px Inter'; ctx.letterSpacing = '16px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = VER; ctx.fillText('AAZHI', 488, 164); ctx.fillStyle = PAP; ctx.fillText('AAZHI', 480, 158); ctx.letterSpacing = '0px';
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = rgba(INK, 0.35); ctx.lineWidth = 3; for (let y = 50; y < 280; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(480, y + 10, 960, y - 4); ctx.stroke(); } ctx.restore();
  });
  const c12 = (lt, d) => {
    const rp = clamp(lt / 0.6);
    if (rp < 1) c11(c11End + lt, 2.84);
    roller(rp, () => {
      bg('black');
      embers(lt, 30, 60, 1020, 200, 1300, 13, 0.9);
      flame(540, 560, 1.3 + 0.05 * Math.sin(lt * 2), lt, 3); shimmer(lt, 420, 660, 280, 420, 0.08);
      const tp = clamp((lt - 0.55) / 0.9);
      ctx.save(); ctx.translate(540, 800); ctx.scale(1 + 0.02 * Math.sin(lt * 1.5), 1 + 0.02 * Math.sin(lt * 1.5));
      carve(titleImg(), -480, -150, 960, 300, tp, 2, 5);
      ctx.restore();
      ribbon('FOLLOW', 330, 1060, (lt - (tAazhi - tFollow) - 0.2) / 0.4, 46, -0.02);
      note('for the stories behind the stories', 540, 1200, 40, PAP, clamp((lt - (tStories - tFollow)) / 0.4));
      grain(0.5); vig(0.45);
    });
  };
  add({ id: 'c12', at: tFollow, cam: [540, 820], zoom: 0.08, note: 'end card: ink roller rolls black over the split print; AAZHI carved out of the block with vermilion off-register; torch flame + embers; FOLLOW ribbon; "for the stories behind the stories"', draw: c12 });
  cue(tFollow, 'slide', { gain: 0.6 }); cue(tFollow + 0.6, 'chisel', { gain: 0.6, dur: 0.9 }); cue(tAazhi + 0.2, 'slam', { gain: 0.5 }); cue(tAazhi + 0.4, 'zip', { gain: 0.4 }); cue(END - 1.2, 'swell', { gain: 0.4, dur: 1.2 });
}
