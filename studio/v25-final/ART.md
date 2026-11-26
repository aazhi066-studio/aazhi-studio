# v25 How did Jaffna's last Tamil king really die? (Cankili II, Jaffna kingdom, 1617-1619/1621: usurped the throne per accounts, called Thanjavur Nayak troops, Portuguese under Phillippe de Oliveira took Nallur 1619, fled by boat, winds drove him back (Point Pedro), captured with family, shipped to Goa; HANGED or BEHEADED disputed; year 1619 or 1621 disputed; surviving royals told to take holy orders; the line ended)
ART DIRECTION "Storm Portolan & Wax Seal" (new to the channel): every scene is drawn on an old sea chart of vellum on a dark lamplit table:
ink coastlines with hatched shore lines, radiating rhumb lines (red/green/black) from compass roses, engraved wave rows, ink ships,
faceless engraved figures. Devices: rhumb lines shoot out (G.rhumb p), coastlines ink themselves in (G.coast p), WIND GUSTS of curling
ink streaks (G.wind) = the recurring motif (the wind decides the story; last line "watch the wind"), red WAX SEALS slam down (G.stamp p,
impact at p=0.35: put a cue 'slam' or 'thud' there), the vellum BURNS through (G.burn), ink BLOTS splatter (G.blot), the sheet LIFTS and
flutters in the wind (G.sheet o.lift), the compass needle SPINS (G.rose o.spin), storm night wash (sheet o.ground [PAL.storm, PAL.stormDk]),
G.rain, G.lightning, white flash cuts (G.flash), ink-lettered titles (G.title), parchment ribbon TAGS (G.tag) for labels:
ILLUSTRATION, ACCOUNTS SAY, RECORD, DISPUTED, ONE VERSION, ANOTHER VERSION, PORTUGUESE RECORDS.
Colour code: Jaffna / Cankili = GREEN (robe, pennants, ink); Portuguese = RED pennants and red ink; Thanjavur Nayak soldiers = OCHRE robes.
Cankili = G.figure with hat 'crown' and robe PAL.green. Portuguese soldiers = hat 'helm', robe PAL.red. Monks/nuns = hat 'hood', robe PAL.sepia.
Shared kit: src/chart.js (import * as G from './chart.js'). Read it fully first. Pattern per shot: const r = G.sheet(t, {...}); ...scene...;
G.sheetTop(t, r); then tags/titles/flash on top. sheet() clips + transforms, sheetTop() restores: ALWAYS pair them.
G.GEO has stylised chart geography (INDIA coast path, JAFFNA/north-Lanka path, NALLUR point, POINT, STRAIT) in default-sheet coords.
Timing: L(i), Le(i), Wd(word, line) from ./core/timing.js (never hard-coded absolute seconds except small offsets).
Library: ./core/lib.js (ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line, circle, ell, rr). art.js: rgba, mixc, lg, cached, blit.
Line times (s): 0 0.15-2.669 | 1 3.019-9.069 | 2 9.469-15.133 | 3 15.533-21.044 | 4 21.444-26.411 | 5 26.811-31.643 | 6 32.043-34.917 | 7 35.317-38.909 | 8 39.309-43.779 | 9 44.229-50.427 | 10 50.877-56.443 | end 56.943
 0 "How did Jaffna's last Tamil king really die?"
 1 "Jaffna, in the north of Sri Lanka, sixteen seventeen. A Tamil kingdom, ruled from Nallur."
 2 "Accounts say Cankili seized the throne, killing rival claimants and princes of royal blood."
 3 "The Portuguese wanted Jaffna. Cankili called in soldiers from the Nayaks of Thanjavur."
 4 "In sixteen nineteen, Phillippe de Oliveira marched on Nallur. The kingdom fell."
 5 "Cankili fled by boat for South India. Accounts say the winds drove him back."
 6 "He was captured with his family, and shipped to Goa."
 7 "Some histories say he was hanged. Others say he was beheaded."
 8 "Even the year is disputed. Sixteen nineteen, or sixteen twenty one?"
 9 "The surviving royals, accounts say, were told to become monks and nuns. No heirs. The line ended."
 10 "A usurper, or Jaffna's last defender? Tell me below. Watch again, and watch the wind."
Captions are drawn by main.js at about y 1540-1740 (keep key art, titles and tags between y 110 and 1450; the sheet default is y 110-1450).
Rules: cuts every 1-2.5 s (first 8 s: every 1-1.5 s, strongest motion, bold contrast, sound hit at 0.0); camera handled by main.js
(shot.zoom, shot.cam); every shot moves (wind, waves, needle, sheet lift, ships rolling, coast drawing, stamps); no static frames;
no faces, no portraits, no real writing/inscriptions (only our short tags/titles), no invented quotes, no religious symbols (no crosses,
no temples' deities; a Nallur palace = G.fort), no gore (no blood, no bodies, execution only as symbols G.rope / G.blade + wax seals),
monks/nuns only as hooded silhouettes, with dignity.
Never reuse: reverse-glass/shatter, chessboard/marbled ink, shadow puppets, playing cards, mosaic, linocut, kalamkari, charcoal, palm leaves,
copper plates, iron/rust, gold leaf, sand bottle, paper theatre, blueprint, bronze lamp corridor, ledger/manifest watercolour.
Sound cues via cue(t, type, {gain, dur, pan}): whoosh slide pop plop thud slam tock zip rumble drum swell bell sparkle chisel heartbeat inhale.
