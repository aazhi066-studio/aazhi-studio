# v24 Did a king blow up his own palace? (Thanjavur 1673: Chokkanatha of Madurai's siege; the 1924 history (Sathyanatha Aiyar, from Jesuit records) says the palace was packed with gunpowder and the royal women gathered inside, then blown up; the traveller Manucci says the attackers burned it; the king's death disputed; Marathas take Thanjavur within ~3 years)
ART DIRECTION "Thanjavur Reverse-Glass Painting & Shatter" (new to the channel): every scene is a reverse-glass folk painting in a carved
teak frame: flat saturated colour fields (ultramarine/night blue grounds, vermilion, deep green, cream, ochre), thick black outlines,
gold foil, glossy diagonal sheen. FACELESS flat figures. Devices: outline-draws-then-colour-floods reveal (G.paint / p params),
glass CRACK (G.crack) from an impact point, SHATTER transition (G.shatter: front scene breaks into shards falling away to reveal the
next), white/vermilion flash cuts (G.flash), folk-art starburst (G.burst), stylised fire + smoke puffs, frame tilt/zoom (panel rot/sc),
gilt arch top (G.archTop), gold-foil titles that drop letter by letter (G.title), gilt cartouche TAGS (G.tag) for labels:
ILLUSTRATION, ACCOUNTS SAY, 1924 HISTORY, ANOTHER VERSION, DISPUTED, RECORD, LEGEND?. Recurring motif: the palace's ARCHED WINDOWS
(G.palace lit/burn/dark): alive = gold glow, burning = fire colours, after = dark. The last line says "watch the windows".
Colour code: Thanjavur = GREEN, Madurai army = VERMILION, Marathas = ULTRAMARINE pennants, royal women = pink/cream veiled, faceless.
Shared kit: src/glass.js (import * as G from './glass.js'). Read it fully first. Pattern per shot: const r = G.panel(t, {ground});
...draw scene inside... G.glassTop(t, r); then tags/titles on top (tags may sit over the frame edge). panel() clips, glassTop() restores:
ALWAYS pair them. Timing: L(i), Le(i), Wd(word, line) from ./core/timing.js (never hard-coded absolute seconds except small offsets).
Cache heavy statics via cached()/blit() from ./art.js. Library: ./core/lib.js (ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line, circle, ell, rr).
Line times (s): 0 0.15-2.956 | 1 3.306-8.425 | 2 8.825-13.262 | 3 13.662-17.626 | 4 18.026-20.894 | 5 21.294-26.004 | 6 26.404-30.153 | 7 30.553-33.835 | 8 34.285-39.577 | 9 39.977-44.673 | 10 45.123-49.902 | 11 50.352-55.843 | end 56.743
 0 "Did a king blow up his own palace, and his family?"
 1 "Thanjavur, sixteen seventy three. Vijayaraghava Nayak had ruled for decades."
 2 "Accounts say Chokkanatha, the Nayak of Madurai, asked to marry his daughter."
 3 "The old king refused. The army of Madurai marched on Thanjavur."
 4 "The walls were breached. The city was about to fall."
 5 "A history written in nineteen twenty four says the palace was packed with gunpowder."
 6 "The royal women were gathered inside, so no enemy could take them."
 7 "Then it was blown up. The king rode out with his son, and fell."
 8 "But the traveller Manucci tells it differently. He says the attackers set the palace on fire."
 9 "Even the king's death is disputed. Killed in battle, or captured and beheaded?"
 10 "Within about three years, the Marathas took Thanjavur from both Nayak houses."
 11 "A father's choice, or an enemy's fire? Tell me below. Watch again, and watch the windows."
Captions are drawn by main.js at about y 1500-1720 (keep key art, titles and tags between y 110 and 1440; the panel default is y 110-1440).
Rules: cuts every 1-2.5 s (first 8 s: every 1-1.5 s, strongest motion, bold contrast, sound hit at 0.0); camera handled by main.js
(shot.zoom, shot.cam); every shot moves (sheen slides, flames, walking crowds, banners, panel rot/sc changes, reveals); no static frames;
no faces, no real portraits, no real inscription or manuscript text (book rows are abstract bars), no invented quotes, no religious
symbols or deities, no gore (no blood, no bodies: violence = cracks, shatter, fire, flash), women shown with dignity (veiled silhouettes, never harmed on screen).
Never reuse: chessboard/marbled ink, shadow puppets, playing cards, mosaic, linocut, kalamkari, charcoal, palm leaves, copper plates,
iron/rust, gold leaf/sonar, sand bottle, paper theatre, blueprint, bronze lamp corridor.
Sound cues via cue(t, type, {gain, dur, pan}): whoosh slide pop plop thud slam tock zip rumble drum swell bell sparkle chisel heartbeat inhale.
