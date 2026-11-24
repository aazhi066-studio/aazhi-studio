# v22 A Chola emperor died on his war elephant. Who won? (Battle of Koppam, c. 1054; RECORD vs ONE-SIDED RECORD vs DEBATE)
ART DIRECTION "Leather Shadow Puppets" (new to the channel): the whole film is a lamp-lit cloth shadow-theatre screen (tholpavai style).
Every figure is a translucent dyed-leather puppet (madder red, turmeric ochre, indigo, leaf green) with punched-hole borders and
rosettes glowing with lamplight, pinned joints, bamboo rods running off the bottom. Arrows/spears are crisp black shadows. Puppets
are FACELESS (profile head + crown only). Text = cut-leather PLACARDS (PP.placard) with punched borders. Devices: lamp flicker,
arrow volleys, screen shake on hits, blood-red flash (no gore, never blood on figures), seam wipe (cloth seam sweeps across),
puppet "drop" (a puppet falls off its rod), lamp dimming for death, crown lowered on a rod, two-colour puppet flip (Chola = red/ochre,
Chalukya = green/indigo), stage frame always on (PP.stageFrame(t) then PP.lampEdge() last in each shot, before placards).
Shared kit: src/puppet.js (import * as PP from './puppet.js'). Read it fully first. Timing: L(i), Le(i), Wd(word, line) from ./core/timing.js
(never hard-coded seconds except small offsets). Cached heavy statics via cached()/blit() from ./art.js.
Sides: CHOLA puppets col PP.PAL.red/redDk (king Rajadhiraja: crown 1, ochre; brother Rajendra: crown appears only at line 7).
CHALUKYA puppets col PP.PAL.green/greenDk with indigo shields. Elephant = PP.elephant (indigo leather, red caparison).
Line times (s): 0 0.15-3.464 | 1 3.814-7.53 | 2 7.93-12.741 | 3 13.141-15.325 | 4 15.725-19.922 | 5 20.322-24.183 | 6 24.633-27.082 |
7 27.482-32.191 | 8 32.591-36.364 | 9 36.814-42.822 | 10 43.222-51.432 | 11 51.882-57.343 | end 58.243
 0 "A Chola emperor died on his war elephant. Who won?"
 1 "Koppam, near the Tungabhadra river, around ten fifty four."
 2 "Emperor Rajadhiraja led the Chola army against the Western Chalukyas."
 3 "Chola records say his troops were winning."
 4 "Then Chalukya archers aimed at one target: the king on the elephant."
 5 "Arrows struck him. The emperor fell, and his army began to break."
 6 "His younger brother, Rajendra, took command."
 7 "Records say he was crowned right there, on the battlefield, beside the fallen king."
 8 "The Cholas say Rajendra turned the rout into a great victory."
 9 "But almost every account we have comes from the Chola side. Even the date and the place are debated."
10 "A Chalukya version survives only in a later record. Some historians call it a win the Cholas paid for with their emperor."
11 "Victory, or a defeat rewritten? Tell me below. Then watch again, and watch the arrows."
Captions are drawn by main.js at y ~1640 (keep key art and placards between y 120 and 1480).
Rules: cuts every 1-2.5 s (first 8 s: every 1-1.5 s, strongest motion); camera handled by main.js (shot.zoom, shot.cam);
every shot moves (flicker, rods sway, puppets bob: sin(t)); no static frames; no real portraits, no real inscription text,
no invented quotes; records shown as abstract leather tablets with punched dot rows only.
Sound cues via cue(t, type, {gain, dur}): types whoosh slide pop thud slam tock rumble drum swell bell sparkle zip chisel heartbeat inhale.
