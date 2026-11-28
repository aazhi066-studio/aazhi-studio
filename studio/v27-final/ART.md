# v27 Did a Chola king's own city kill him? (Athirajendra, 1070 CE: crowned amid a revolt in the capital; his brother-in-law, the Western Chalukya prince Vikramaditya, marches in, crushes the unrest and seats him, per Bilhana, Vikramaditya's own court poet; soon after the prince goes home a new rising breaks out and Athirajendra is killed after a reign of only months; within days the Vengi cousin Rajendra Chalukya, son of a Chola princess, takes the throne as Kulottunga I; the old father-to-son Chola line ends; who was behind it is disputed: religious strife (from much later stories) vs suspicion of the cousin; no record proves either)
ART DIRECTION "Neon Noir Wall" (new to the channel): every scene is NEON TUBE line art on a dark, rain-wet brick wall at night, wet pavement reflections at the bottom.
Kit: src/neon.js (import * as N from './neon.js'; READ IT FULLY FIRST). N.wall(lt, {tone:'brick'|'red'|'blue', rain, wet:y, glowCol, gx, gy}) background; N.rain; N.reflect(y, fn, a, lt) mirrored reflection of a draw callback;
N.tube(pts, p, {col, w, b, close, tip}) a neon tube drawing itself (p) with brightness b (0 = dead grey glass); N.ignite(lt, t0, seed) stutter-on brightness; N.short(lt, t0, seed) sputter-off brightness; N.buzz(t, seed) flicker;
N.sign(text, x, y, size, col, {b, p, flick, t}) neon lettering (our short tags/titles ONLY); N.tag(text, x, y, col, b, size) boxed neon label; N.sparks(x, y, lt, t0, n, R, seed, col) short-circuit spark shower;
N.flash(a, col); N.blackout(a); N.crown; N.throne(x, y, s, {col, b, p}) THE MOTIF; N.figure(x, y, s, {col, b, p, hat:'crown'|'turban'|'helm', spear, arm, sit}) faceless stick figures (feet at y);
N.crowd(x0, x1, y, n, lt, {torch, col, s, march, b}) red rioters with torches; N.flame; N.city(x0, x1, y, h, p, {col, b, seed}) secular skyline (no temple towers); N.gate; N.route(a, b, p, {col, bend}) dashed arrow;
N.wire; N.lineage(nodes, p, {linkCol}) family-line nodes; N.debris; N.halo; N.rectPts / N.circPts / N.at / N.part; N.pop, N.shk, N.glow. Palette N.PAL (amber, cyan, magenta, red, white, dead, glass...).
RECURRING MOTIF ("watch the throne"): the AMBER neon THRONE. Its seated occupant flickers. When Athirajendra dies the seated amber figure SHORTS OUT (sparks + red flash + figure goes dead grey) but the throne stays lit.
In line 6 a MAGENTA figure sits down and the throne tube itself turns MAGENTA (amber tube shorts, magenta ignites). At the very end the throne glows magenta with the dead amber figure's grey outline beside it.
Colour code: Chola / Athirajendra = AMBER (crown hat); Vikramaditya (Western Chalukya prince, brother-in-law) = CYAN (helm + spear); Kulottunga / Rajendra Chalukya of Vengi = MAGENTA (turban, later crown); revolt / city = RED (torch crowd); tags = WHITE.
Line times (s) and lines (data/lines.json):
0 0.15-2.217 | 1 2.567-8.743 | 2 9.143-16.111 | 3 16.511-20.544 | 4 20.944-24.437 | 5 24.787-28.528 | 6 28.978-37.165 | 7 37.565-40.864 | 8 41.314-45.64 | 9 45.99-50.048 | 10 50.498-55.847 | end 56.647
 0 "Did a Chola king's own city kill him?"
 1 "Ten seventy. Athirajendra had just been crowned Chola king, and his capital was in revolt."
 2 "His brother-in-law, the Chalukya prince Vikramaditya, marched in, crushed the unrest, and set him on the throne."
 3 "That is the version told by Bilhana, the prince's own court poet."
 4 "Soon after the prince rode home, a new rising broke out."
 5 "Athirajendra was killed. His reign had lasted only months."
 6 "Within days, a cousin from Vengi, Rajendra Chalukya, son of a Chola princess, took the throne as Kulottunga the First."
 7 "The old Chola line, father to son, ended right there."
 8 "Who was behind it? Some point to religious strife, from much later stories."
 9 "Some suspect the cousin who gained the crown. No record proves either."
 10 "An angry city, or a cousin's plan? Tell me below. Watch again, and watch the throne."
Timing: L(i), Le(i), Wd(word, line) from ./core/timing.js (never hard-code absolute seconds except small offsets; Wd matches a word prefix, case-insensitive, e.g. Wd('seventy', 1), Wd('athirajendra', 1), Wd('brotherinlaw', 2) (hyphens removed), Wd('kulottunga', 6)). Library ./core/lib.js (ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line). art.js: rgba, mixc.
Shot object: add({ id, at, cam:[x,y], zoom, note, draw: (lt, d, t) => {...} }) where lt = time since shot start, d = shot duration; cue(t, type, {gain, dur, pan}) types: whoosh slide pop plop thud slam tock zip rumble drum swell bell sparkle chisel heartbeat inhale (use zip/sparkle for neon ignition, thud/slam for shorts and hits, rumble for crowd/revolt, heartbeat for tension).
Captions are drawn by main.js at about y 1540-1740: keep key art, titles and tags between y 110 and 1450 (wet pavement / reflection zone can go 1350-1920 behind captions).
Rules: cuts every 1-2.5 s (first 8 s: every 1-1.5 s, strongest motion, bold contrast, sound hit at 0.0); camera via shot.zoom/shot.cam; every shot moves (tubes drawing/igniting, rain, flicker, crowd bob, sparks); no static frames;
no faces, no portraits, no real writing/inscription text (only our short tags/titles), no invented quotes, no religious symbols, temples or deities (religious strife = an abstract split: two neon colours cracking apart, plus a LATER STORIES tag), no gore.
Tags to use where relevant: ILLUSTRATION (early), 1070 CE, BILHANA'S VERSION, COURT POET, ONLY MONTHS, WITHIN DAYS, KULOTTUNGA I, SON OF A CHOLA PRINCESS, DISPUTED, LATER STORIES, SUSPECT?, NO PROOF.
Never reuse: kolam powder, storm portolan/wax seal, reverse-glass/shatter, chessboard/marbled ink, shadow puppets, playing cards, mosaic, linocut, kalamkari, charcoal, palm leaves, copper plates, iron/rust, gold leaf/sonar, sand bottle, paper theatre, blueprint, bronze lamp corridor, ledger watercolour.
