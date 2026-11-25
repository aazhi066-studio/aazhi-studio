// v24 shared kit: "Thanjavur Reverse-Glass Painting & Shatter". Read fully before writing shots.
// Every scene is a REVERSE-GLASS PAINTING (a Thanjavur folk craft): flat saturated colour fields behind glass, bold black
// outlines, gold-foil accents, a glossy diagonal sheen, set in a carved dark-teak frame with a gilt bead. Figures are flat and
// FACELESS (head = plain shape, no eyes/mouth). The story's violence is shown only as glass CRACKING and SHATTERING, flame,
// smoke and a white/vermilion flash. No blood, no bodies, no faces, no real script.
import { ctx, W, H, clamp, lerp, eo, eio, rnd, TAU, ell, circle, rr, line } from './core/lib.js';
import { cached, blit, rgba, mixc, lg } from './art.js';

export const PAL = {
  room: '#0B0806', teak: '#3A2414', teakDk: '#1E120A', teakHi: '#6A4426', gilt: '#E2B548', giltDk: '#8C6418', giltHi: '#FFE7A0',
  ink: '#0E0A08', cream: '#F3E6C8', vermil: '#C8281E', vermilDk: '#7E140F', green: '#1F6B3A', greenHi: '#3E9A5A',
  ultra: '#1F3A8C', ultraHi: '#4664C0', night: '#0F1430', ochre: '#D98A2B', pink: '#E7A5A0', smoke: '#5A5350', fire: '#FF8A1E', fireHi: '#FFE08A',
};
// SIDES (keep consistent): Thanjavur (Vijayaraghava, his son) = GREEN banners/robes; Madurai (Chokkanatha's army) = VERMILION;
// Marathas = ULTRAMARINE pennants. Royal women = pink/cream veiled silhouettes (faceless). The palace = cream walls, ochre roofs,
// many ARCHED WINDOWS that glow gold when "alive" (recurring device; the end line says "watch the windows").

// ---------- the room behind the frame (cached) + frame ----------
// panel(t, o) draws room + frame + glass ground and returns the inner rect {x,y,w,h}. Draw the scene, then call glassTop(t, r, o).
// o: { x=60, y=110, w=960, h=1330, ground: colour or [top,bottom] gradient, frame=1 (0 hides frame), rot=0, sc=1 }
export function room() {
  const c = cached('g_room', W, H, 0.5, () => {
    ctx.fillStyle = PAL.room; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(80,50,28,${0.02 + rnd(i) * 0.04})`; ctx.fillRect(0, rnd(i + 3) * H, W, 2 + rnd(i + 7) * 10); }
    const g = ctx.createRadialGradient(540, 760, 100, 540, 900, 1200); g.addColorStop(0, 'rgba(255,190,110,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  ctx.drawImage(c, 0, 0, W, H);
}
export function frame(x, y, w, h, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const b = 46;
  ctx.fillStyle = PAL.teakDk; rr(x - b - 10, y - b - 10, w + 2 * b + 20, h + 2 * b + 20, 10); ctx.fill();
  ctx.fillStyle = lg(x - b, y - b, x + w + b, y + h + b, [[0, PAL.teakHi], [0.5, PAL.teak], [1, PAL.teakDk]]); rr(x - b, y - b, w + 2 * b, h + 2 * b, 6); ctx.fill();
  // carved beads along the frame
  ctx.fillStyle = rgba(PAL.teakDk, 0.8);
  for (let i = 0; i < 26; i++) { const u = (i + 0.5) / 26; circle(x + u * w, y - b / 2, 6, ctx.fillStyle); circle(x + u * w, y + h + b / 2, 6, ctx.fillStyle); }
  for (let i = 0; i < 34; i++) { const u = (i + 0.5) / 34; circle(x - b / 2, y + u * h, 6, ctx.fillStyle); circle(x + w + b / 2, y + u * h, 6, ctx.fillStyle); }
  ctx.strokeStyle = PAL.gilt; ctx.lineWidth = 7; ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
  ctx.strokeStyle = PAL.giltDk; ctx.lineWidth = 2; ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
  ctx.restore();
}
export function panel(t, o = {}) {
  const r = { x: o.x ?? 60, y: o.y ?? 110, w: o.w ?? 960, h: o.h ?? 1330 };
  room();
  ctx.save();
  if (o.rot || (o.sc && o.sc !== 1)) { const cx = r.x + r.w / 2, cy = r.y + r.h / 2; ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(o.sc || 1, o.sc || 1); ctx.translate(-cx, -cy); }
  if (o.frame !== 0) frame(r.x, r.y, r.w, r.h, o.frame ?? 1);
  const gr = o.ground || [PAL.ultra, PAL.night];
  ctx.fillStyle = Array.isArray(gr) ? lg(0, r.y, 0, r.y + r.h, [[0, gr[0]], [1, gr[1]]]) : gr; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  r._open = true; return r;
}
// glassTop: closes the clip opened by panel (ctx.restore), adds glass sheen (a diagonal bright band that slides), dust and edge glint.
// o: { sheen=1 strength, speed=0.35 }
export function glassTop(t, r, o = {}) {
  const s = o.sheen ?? 1, k = ((t * (o.speed ?? 0.35)) % 1.6) - 0.3;
  const x0 = r.x + k * (r.w + 600) - 300;
  const g = ctx.createLinearGradient(x0, r.y, x0 + 260, r.y + 260);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${0.16 * s})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
  const g2 = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
  g2.addColorStop(0, `rgba(255,255,255,${0.10 * s})`); g2.addColorStop(0.35, 'rgba(255,255,255,0)'); g2.addColorStop(1, `rgba(255,240,210,${0.05 * s})`);
  ctx.fillStyle = g2; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
}

// ---------- reverse painting: outline first, colour floods in from behind ----------
// paint(pathFn, fill, p, o): pathFn() builds a path (beginPath..); p 0..1. 0-0.45 the black outline draws (dash reveal),
// 0.35-1 the fill floods in (alpha + slight "wet" brighten). o: { lw=7, ink=PAL.ink, len=3000 (dash length estimate) }
export function paint(pathFn, fill, p = 1, o = {}) {
  const pf = clamp((p - 0.35) / 0.65), po = clamp(p / 0.45);
  if (pf > 0 && fill) { ctx.save(); ctx.globalAlpha *= eo(pf); pathFn(); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  if (po > 0 && (o.lw ?? 7) > 0) {
    ctx.save(); const len = o.len ?? 3000; ctx.setLineDash([len * eo(po), len]); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    pathFn(); ctx.strokeStyle = o.ink || PAL.ink; ctx.lineWidth = o.lw ?? 7; ctx.stroke(); ctx.restore();
  }
}
// foil(x, y, w, h, t, n): twinkling gold-foil flecks inside a rect (decoration)
export function foil(x, y, w, h, t, n = 24, seed = 0) {
  for (let i = 0; i < n; i++) {
    const fx = x + rnd(i + seed) * w, fy = y + rnd(i * 3 + seed + 1) * h, tw = 0.5 + 0.5 * Math.sin(t * (2 + rnd(i) * 3) + i);
    ctx.fillStyle = rgba(PAL.giltHi, 0.25 + 0.6 * tw); ctx.save(); ctx.translate(fx, fy); ctx.rotate(rnd(i + 9) * 3);
    ctx.fillRect(-4, -4, 8 + 6 * tw, 8); ctx.restore();
  }
}
// gilt arch/border band (Thanjavur-style arched top inside the panel): call inside panel clip
export function archTop(r, a = 1, col = PAL.gilt) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + 260);
  ctx.quadraticCurveTo(r.x + r.w, r.y + 70, r.x + r.w / 2, r.y + 50); ctx.quadraticCurveTo(r.x, r.y + 70, r.x, r.y + 260); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(r.x + r.w, r.y + 260); ctx.quadraticCurveTo(r.x + r.w, r.y + 70, r.x + r.w / 2, r.y + 50); ctx.quadraticCurveTo(r.x, r.y + 70, r.x, r.y + 260); ctx.stroke();
  ctx.restore();
}

// ---------- glass cracks and shatter ----------
// crack(x, y, p, seed, o): radial crack from an impact point; p 0..1 grows. o: { n=9 arms, len=700, col='rgba(255,255,255,0.85)', lw=4 }
export function crack(x, y, p, seed = 1, o = {}) {
  if (p <= 0) return; const n = o.n ?? 9, len = o.len ?? 700;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    let a = (i / n) * TAU + rnd(i + seed) * 0.5, px = x, py = y; const L = len * (0.5 + rnd(i * 7 + seed) * 0.6) * eo(p);
    const pts = [[px, py]]; const steps = 7;
    for (let s = 1; s <= steps; s++) { a += (rnd(i * 31 + s + seed) - 0.5) * 0.5; px = x + Math.cos(a) * L * s / steps; py = y + Math.sin(a) * L * s / steps; pts.push([px, py]); }
    line(pts, 'rgba(0,0,0,0.55)', (o.lw ?? 4) + 3); line(pts, o.col || 'rgba(255,255,255,0.85)', o.lw ?? 4);
  }
  // concentric ring segments
  for (let k = 1; k <= 2; k++) { const rr2 = (len * 0.18 * k) * eo(clamp(p * 1.4 - 0.2 * k)); if (rr2 <= 0) continue; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, rr2, rnd(k + seed) * 3, rnd(k + seed) * 3 + 4.4); ctx.stroke(); }
  circle(x, y, 10 * eo(p), 'rgba(255,255,255,0.9)');
  ctx.restore();
}
// shatter(drawBehind, drawFront, r, p, o): the FRONT image breaks into shards that fall/spin away revealing drawBehind().
// drawFront() must draw the full front scene (no clip needed). p 0..1. o: { cx, cy impact point (default centre), seed, cols=6, rows=9 }
// Cost: the front is cached per shot key (o.key REQUIRED, static front only) for speed.
export function shatter(drawBehind, drawFront, r, p, o = {}) {
  if (drawBehind) drawBehind();
  if (p >= 1) return;
  const key = 'shat_' + o.key, img = cached(key, W, H, 0.6, drawFront);
  const cols = o.cols ?? 6, rows = o.rows ?? 9, cx = o.cx ?? r.x + r.w / 2, cy = o.cy ?? r.y + r.h / 2, seed = o.seed ?? 3;
  const jx = (i, j) => r.x + (i / cols) * r.w + ((i > 0 && i < cols) ? (rnd(i * 13 + j * 7 + seed) - 0.5) * r.w / cols * 0.7 : 0);
  const jy = (i, j) => r.y + (j / rows) * r.h + ((j > 0 && j < rows) ? (rnd(i * 5 + j * 17 + seed) - 0.5) * r.h / rows * 0.7 : 0);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) for (let tri = 0; tri < 2; tri++) {
    const A = [jx(i, j), jy(i, j)], B = [jx(i + 1, j), jy(i + 1, j)], C = [jx(i + 1, j + 1), jy(i + 1, j + 1)], D = [jx(i, j + 1), jy(i, j + 1)];
    const pts = tri ? [A, B, C] : [A, C, D]; const mx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, my = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    const dist = Math.hypot(mx - cx, my - cy), delay = dist / 1400 * 0.45, q = clamp((p - delay) / (1 - delay + 1e-6));
    const id = i * 31 + j * 7 + tri;
    const dx = (mx - cx) * 0.6 * q + (rnd(id) - 0.5) * 120 * q, dy = 1300 * q * q + (my - cy) * 0.3 * q, rot = (rnd(id + 5) - 0.5) * 5 * q;
    if (q >= 1) continue;
    ctx.save(); ctx.globalAlpha *= 1 - q * q; ctx.translate(mx + dx, my + dy); ctx.rotate(rot); ctx.scale(1 - 0.3 * q, 1 - 0.3 * q); ctx.translate(-mx, -my);
    ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.lineTo(...pts[2]); ctx.closePath(); ctx.save(); ctx.clip(); ctx.drawImage(img, 0, 0, W, H);
    ctx.fillStyle = `rgba(255,255,255,${0.15 * q + 0.05})`; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
}
// flash(a, col): full-screen flash (white or vermilion) for impact cuts
export function flash(a, col = '#FFFFFF') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }

// ---------- labels: gilt cartouche tags + foil titles ----------
// tag(text, x, y, o): gilt cartouche with black lettering. o: { sc=1, rot=0, col=PAL.gilt, ink=PAL.ink, size=46 }
export function tag(text, x, y, o = {}) {
  const sc = o.sc ?? 1; if (sc <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(sc, sc);
  const size = o.size ?? 46; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '5px'; const w = ctx.measureText(text).width + 70, h = size + 40;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(-w / 2 + 6, -h / 2 + 8, w, h, h / 2); ctx.fill();
  ctx.fillStyle = o.col || PAL.gilt; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = rgba(PAL.giltHi, 0.8); ctx.lineWidth = 2; rr(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, h / 2 - 8); ctx.stroke();
  ctx.fillStyle = o.ink || PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
  ctx.restore(); ctx.letterSpacing = '0px';
}
// title(text, x, y, size, p, o): big gold-foil letters with thick black outline; letters drop in one by one with p 0..1.
// o: { font='Caladea' | 'Inter', fill=PAL.gilt }
export function title(text, x, y, size, p = 1, o = {}) {
  ctx.save(); const f = o.font === 'Inter' ? `900 ${size}px Inter` : `700 ${size}px Caladea`; ctx.font = f; ctx.letterSpacing = '4px';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const tw = ctx.measureText(text).width; let cx = x - tw / 2;
  const chars = [...text];
  chars.forEach((ch, i) => {
    const w = ctx.measureText(ch).width + 4, q = eo(clamp(p * (chars.length + 2) - i)); if (q > 0) {
      ctx.save(); ctx.globalAlpha *= q; ctx.translate(cx + w / 2, y - 60 * (1 - q)); ctx.textAlign = 'center';
      ctx.lineWidth = size * 0.14; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0);
      ctx.fillStyle = lg(0, -size / 2, 0, size / 2, [[0, PAL.giltHi], [0.5, o.fill || PAL.gilt], [1, PAL.giltDk]]); ctx.fillText(ch, 0, 0); ctx.restore();
    }
    cx += w;
  });
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ---------- scenery ----------
// palace(x, y, s, o): flat Nayak-era palace (cream walls, ochre tiered roofs, a tall central tower, rows of ARCHED WINDOWS).
// (x, y) = centre of the base. o: { lit=1 (0..1 windows glow gold), dark=0 (0..1 night tint), burn=0 (0..1 fire in windows), p=1 paint reveal }
export function palace(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const p = o.p ?? 1, wall = mixc(PAL.cream, '#5A5068', o.dark ?? 0), roof = mixc(PAL.ochre, '#4A3020', o.dark ?? 0);
  const body = () => { ctx.beginPath(); ctx.rect(-380, -330, 760, 330); ctx.rect(-130, -700, 260, 380); };
  paint(body, wall, p, { lw: 7, len: 4000 });
  const roofs = () => { ctx.beginPath(); ctx.moveTo(-410, -330); ctx.lineTo(-340, -400); ctx.lineTo(340, -400); ctx.lineTo(410, -330); ctx.closePath();
    ctx.moveTo(-160, -700); ctx.lineTo(-110, -770); ctx.lineTo(110, -770); ctx.lineTo(160, -700); ctx.closePath();
    ctx.moveTo(-90, -770); ctx.lineTo(0, -880); ctx.lineTo(90, -770); ctx.closePath(); };
  paint(roofs, roof, p, { lw: 7, len: 3000 });
  // windows
  const lit = o.lit ?? 1, burn = o.burn ?? 0, wp = clamp((p - 0.6) / 0.4);
  const win = (wx, wy, ww, wh, k) => {
    ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy); ctx.lineTo(wx - ww / 2, wy - wh * 0.6); ctx.quadraticCurveTo(wx - ww / 2, wy - wh, wx, wy - wh); ctx.quadraticCurveTo(wx + ww / 2, wy - wh, wx + ww / 2, wy - wh * 0.6); ctx.lineTo(wx + ww / 2, wy); ctx.closePath();
    const fl = burn > 0 ? 0.75 + 0.25 * Math.sin((o.t || 0) * 13 + k * 2.1) : 1;
    ctx.fillStyle = burn > 0 ? mixc(PAL.fireHi, PAL.vermil, clamp(burn * fl)) : mixc('#241A30', PAL.giltHi, lit * (0.85 + 0.15 * Math.sin((o.t || 0) * 3 + k)));
    ctx.globalAlpha = wp; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); ctx.globalAlpha = 1;
  };
  let k = 0; for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) win(-300 + i * 100, -40 - r * 150, 54, 100, k++);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) win(-50 + i * 100, -360 - r * 110, 48, 80, k++);
  // gate
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-60, -110); ctx.quadraticCurveTo(0, -170, 60, -110); ctx.lineTo(60, 0); ctx.closePath(); ctx.fillStyle = PAL.ink; ctx.globalAlpha = wp; ctx.fill(); ctx.globalAlpha = 1;
  if ((o.lit ?? 1) > 0.3 && !burn) { const g = ctx.createRadialGradient(0, -300, 50, 0, -300, 700); g.addColorStop(0, rgba(PAL.giltHi, 0.12 * lit)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-700, -1000, 1400, 1100); }
  ctx.restore();
}
// wall(x0, x1, y, h, o): fort wall with crenellations (laterite red-brown). o: { breach=0 (0..1 a V gap opens at o.bx), bx, p=1 }
export function wall(x0, x1, y, h = 220, o = {}) {
  const br = o.breach ?? 0, bx = o.bx ?? (x0 + x1) / 2, bw = 180 * eo(br);
  const path = () => { ctx.beginPath(); const step = 60; ctx.moveTo(x0, y);
    for (let x = x0; x < x1; x += step) { const inGap = Math.abs(x + step / 2 - bx) < bw; const top = inGap ? y - h * 0.15 : y - h; ctx.lineTo(x, top); ctx.lineTo(x + step * 0.5, top); ctx.lineTo(x + step * 0.5, top - (inGap ? 0 : 34)); ctx.lineTo(x + step, top - (inGap ? 0 : 34)); }
    ctx.lineTo(x1, y); ctx.closePath(); };
  paint(path, o.col || '#8E4A2E', o.p ?? 1, { lw: 6, len: 5000 });
  if (br > 0) { for (let i = 0; i < 10; i++) { const q = eo(clamp(br * 1.3 - i * 0.03)); circle(bx + (rnd(i) - 0.5) * 300 * q, y - h * 0.4 + 200 * q * q, 10 + rnd(i + 2) * 14, '#6E3820'); } }
}
// banner(x, y, s, col, t): pennant on a pole that flaps
export function banner(x, y, s = 1, col = PAL.vermil, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line([[0, 0], [0, -240]], PAL.ink, 8);
  ctx.beginPath(); ctx.moveTo(0, -240); for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(u * 140, -240 + Math.sin(t * 6 + u * 5) * 10 * u); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(u * 140 - (i === 10 ? 30 : 0), -170 + Math.sin(t * 6 + u * 5) * 10 * u - (i === 10 ? 35 : 0)); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
// person(x, y, s, o): flat faceless figure, base at (x, y), height ~ 300*s.
// o: { robe colour, kind: 'king' (crown + sash) | 'woman' (veil drape) | 'soldier' (spear + shield) | 'plain', dir=1, walk=0 (phase, 0 = still), t, p=1 }
export function person(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir ?? 1), s); const robe = o.robe || PAL.green, p = o.p ?? 1, w = o.walk ? Math.sin(o.walk) : 0;
  const body = () => { ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-38 + w * 8, -170); ctx.quadraticCurveTo(0, -205, 38 + w * 8, -170); ctx.lineTo(58, 0); ctx.closePath(); };
  const legs = () => { ctx.beginPath(); ctx.rect(-30 + w * 14, -10, 18, 18); ctx.rect(12 - w * 14, -10, 18, 18); };
  paint(legs, PAL.ink, p, { lw: 0 });
  paint(body, robe, p, { lw: 6, len: 900 });
  const head = () => { ctx.beginPath(); ctx.arc(0, -232, 34, 0, TAU); };
  paint(head, o.kind === 'woman' ? PAL.pink : '#B9824F', p, { lw: 6, len: 300 });
  if (o.kind === 'woman') paint(() => { ctx.beginPath(); ctx.moveTo(-40, -230); ctx.quadraticCurveTo(0, -300, 40, -230); ctx.lineTo(62, -60); ctx.lineTo(-62, -60); ctx.closePath(); }, rgba(o.veil || PAL.cream, 0.85), p, { lw: 5, len: 900 });
  if (o.kind === 'king') {
    paint(() => { ctx.beginPath(); ctx.moveTo(-30, -258); ctx.lineTo(-34, -300); ctx.lineTo(-14, -284); ctx.lineTo(0, -318); ctx.lineTo(14, -284); ctx.lineTo(34, -300); ctx.lineTo(30, -258); ctx.closePath(); }, PAL.gilt, p, { lw: 5, len: 500 });
    paint(() => { ctx.beginPath(); ctx.moveTo(-38, -170); ctx.lineTo(48, -40); ctx.lineTo(30, -30); ctx.lineTo(-46, -150); ctx.closePath(); }, PAL.gilt, p, { lw: 4, len: 500 });
  }
  if (o.kind === 'soldier') {
    line([[44, 10], [70, -330]], PAL.ink, 7); ctx.fillStyle = '#C9C2B0'; ctx.beginPath(); ctx.moveTo(70, -330); ctx.lineTo(60, -370); ctx.lineTo(82, -332); ctx.closePath(); ctx.fill();
    paint(() => { ctx.beginPath(); ctx.arc(-36, -100, 40, 0, TAU); }, o.shield || PAL.gilt, p, { lw: 5, len: 400 });
  }
  ctx.restore();
}
// rider(x, y, s, o): flat horse + rider, facing right (o.dir=-1 flips). o: { robe, horse=PAL.cream, gallop phase, kind:'king' adds crown, t }
export function rider(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir ?? 1), s); const g = o.gallop ?? 0, b = Math.sin(g) * 8;
  for (let i = 0; i < 4; i++) { const a = Math.sin(g + i * 1.6) * 0.5; ctx.save(); ctx.translate(-80 + i * 52, -120 + b); ctx.rotate(a); ctx.fillStyle = PAL.ink; ctx.fillRect(-8, 0, 16, 120); ctx.restore(); }
  const horse = () => { ctx.beginPath(); ctx.ellipse(0, -170 + b, 140, 62, 0, 0, TAU); ctx.moveTo(110, -200 + b); ctx.lineTo(190, -300 + b); ctx.lineTo(230, -280 + b); ctx.lineTo(160, -170 + b); ctx.closePath(); };
  paint(horse, o.horse || PAL.cream, 1, { lw: 6 }); line([[-140, -180 + b], [-200, -120 + b + Math.sin(g * 2) * 10]], PAL.ink, 10);
  ctx.restore(); person(x - 10 * (o.dir ?? 1) * s, y - 190 * s + Math.sin(g) * 8 * s, s * 0.8, { robe: o.robe || PAL.green, kind: o.kind || 'soldier', dir: o.dir, shield: o.shield });
}
// keg(x, y, s, o): gunpowder barrel (wood + iron hoops). o: { glow=0 (fuse spark 0..1), t }
export function keg(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => { ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-68, -60, -50, -120); ctx.lineTo(50, -120); ctx.quadraticCurveTo(68, -60, 50, 0); ctx.closePath(); }, '#7A4A22', 1, { lw: 6 });
  for (const yy of [-22, -98]) line([[-56, yy], [56, yy]], PAL.ink, 7);
  if (o.glow) { const tw = 0.7 + 0.3 * Math.sin((o.t || 0) * 30); circle(0, -140, 14 * o.glow * tw, PAL.fireHi); circle(0, -140, 30 * o.glow * tw, rgba(PAL.fire, 0.4)); line([[0, -120], [6, -140]], PAL.ink, 4); }
  ctx.restore();
}
// fire(x, y, s, t, seed): stylised folk-painting flame tongues (vermilion/orange/yellow with black outline)
export function fire(x, y, s = 1, t = 0, seed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [col, k] of [[PAL.vermil, 1], [PAL.fire, 0.72], [PAL.fireHi, 0.42]]) {
    ctx.beginPath(); ctx.moveTo(-90 * k, 0);
    for (let i = 0; i <= 6; i++) { const u = i / 6, xx = lerp(-90, 90, u) * k, hh = (180 + 120 * Math.sin(u * Math.PI)) * k * (0.8 + 0.25 * Math.sin(t * 9 + i * 1.7 + seed)); ctx.quadraticCurveTo(xx - 15 * k, -hh * 0.6, xx, -hh); ctx.quadraticCurveTo(xx + 15 * k, -hh * 0.5, xx + 15 * k, -hh * 0.2); }
    ctx.lineTo(90 * k, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); if (k === 1) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke(); }
  }
  ctx.restore();
}
// puffs(x, y, t, n, a, seed): rising flat smoke puffs (grey with ink outline)
export function puffs(x, y, t, n = 6, a = 0.8, seed = 0) {
  for (let i = 0; i < n; i++) { const q = ((t * 0.35 + rnd(i + seed)) % 1), r = 40 + 90 * q; ctx.save(); ctx.globalAlpha *= a * (1 - q);
    ctx.beginPath(); ctx.arc(x + (rnd(i * 3 + seed) - 0.5) * 200 + q * 60, y - q * 700, r, 0, TAU); ctx.fillStyle = PAL.smoke; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
}
// burst(x, y, r, p, col): folk-art explosion starburst (spiky star + rays), p 0..1 grows then fades
export function burst(x, y, r, p, col = PAL.fireHi) {
  if (p <= 0 || p >= 1) return; const k = eo(p), a = 1 - p * p; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(p * 0.4);
  ctx.beginPath(); for (let i = 0; i < 24; i++) { const rr2 = (i % 2 ? 0.45 : 1) * r * k; ctx.lineTo(Math.cos(i / 24 * TAU) * rr2, Math.sin(i / 24 * TAU) * rr2); } ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 24; i++) { const rr2 = (i % 2 ? 0.45 : 1) * r * k * 0.55; ctx.lineTo(Math.cos(i / 24 * TAU + 0.13) * rr2, Math.sin(i / 24 * TAU + 0.13) * rr2); } ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();
}
// crowd(x0, x1, y, n, s, o): a rank of soldiers (o.robe colour, o.banners every k), marching phase o.walk
export function crowd(x0, x1, y, n, s = 0.6, o = {}) {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, n > 1 ? i / (n - 1) : 0.5); person(x, y + (i % 2) * 12 * s, s, { robe: o.robe || PAL.vermil, kind: 'soldier', dir: o.dir ?? 1, walk: o.walk != null ? o.walk + i : 0, shield: o.shield, p: o.p });
    if (o.banners && i % o.banners === 0) banner(x + 20 * s, y - 330 * s, s * 0.9, o.robe || PAL.vermil, (o.t || 0) + i); }
}
// book(x, y, s, p, t): an open printed book (1924 history) with ABSTRACT text rows (bars, never real words); p 0..1 rows appear
export function book(x, y, s = 1, p = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => { ctx.beginPath(); ctx.moveTo(-330, -200); ctx.quadraticCurveTo(-160, -230, 0, -190); ctx.quadraticCurveTo(160, -230, 330, -200); ctx.lineTo(330, 200); ctx.quadraticCurveTo(160, 170, 0, 210); ctx.quadraticCurveTo(-160, 170, -330, 200); ctx.closePath(); }, PAL.cream, 1, { lw: 7 });
  line([[0, -190], [0, 210]], PAL.ink, 5);
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) { const q = clamp(p * 10 - i); if (q <= 0) continue; const yy = -150 + i * 36, w = (230 - (i === 8 ? 90 : rnd(i + side) * 40)) * q; ctx.fillStyle = rgba(PAL.ink, 0.6); ctx.fillRect(side < 0 ? -300 : 40, yy, w, 12); }
  ctx.restore();
}
