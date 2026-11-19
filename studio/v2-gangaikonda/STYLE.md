# Chola Chronicle: Tamil history as an epic, lamplit painting, 9:16

Grand, warm, reverent. Built from four reference images: a lamplit stack of palm-leaf manuscripts, a sunken temple city under
god rays, a bronze king on an elephant-prow ship, and a golden-hour painting of a king, a map, a fleet and a gopuram.
Style sheet: `style-sheet.png` (drawn by `src/sheet.js` with this style's own kit; re-render to refresh).
Status: **kit + style sheet are done; there is no `example/` short yet** (see section 8), so `new_video.sh` can't copy it until one exists.

## 1. The look (rules from the sheet)
- **Light is the hero.** Flat painted shapes, and the only gradients allowed are light: lamp glow, sun, god rays, metal sheen,
  depth of water. No outlines on scenery.
- **One mood per scene:** warm gold (lamps, golden hour, bronze hall) OR deep teal (sunken city). Never half and half.
- **Gold** = crowns, jewellery, dates, treasure, the key caption word. **Kumkum red** = routes, sashes, flags, danger.
- **Heroes** (`K.figure`) are faceless: bronze skin, gold jewellery, a moustache or beard only. Roles: king, warrior, sailor,
  scribe, priest. `metal: true` turns one into a bronze statue.
- **Sets:** gopurams and pillars, dragon/elephant-prow warships, palm-leaf manuscripts, oil lamps, old sea charts, treasure.
- No gore: tell conquest with fleets, flags, ports, routes and treasure, never fighting or injury.
- Respect the culture: no invented religious scenes or quotes; real Tamil text only as plaques/inscriptions (`K.tamil`, font bundled).
  Manuscript "writing" is deliberately invented marks.

## 2. Palette (`K.P`)
night `#150B06` · umber `#2A1608` · palm leaf `#C9985A` · lamp `#FFB13B` · gold `#E8B63A` · bronze `#B56A3C` · kumkum `#B3262B` ·
sea teal `#1C6B78` · deep sea `#0A2A38` · stone `#8C7A62` · cream `#F6E7C4` (+ derived shades in `kit.js`).

## 3. Format
1080x1920, 30 fps, 30-45 s. Narration: calm documentary, `bm_george` (or `am_michael`). Music `"tension"` (low drone + soft plucks).
Story shape: a date plaque + a place (map, harbour, temple) → the people → the turning point → the legacy shot (manuscript, statue,
sunken city) → a quiet last line. Facts checked against museums, encyclopaedias, inscriptions; list them in `script.json` "sources".

## 4. Captions
Caladea Bold 88 px, cream on a dark palm-leaf strip with a gold edge and a cord hole, y 1640, 2-4 words, ONE gold word
(`"caps": "In *1025, | the fleet *sailed."`). Same `|` and `*` rules as the other styles.

## 5. Engine map
Same as Paper Atlas/Inside Out (`script.json`, `src/shots.js`, `src/core/{lib,timing,captions}.js`, `src/main.js`, `tools/`).
New here: `src/core/kit.js`, `src/sheet.js`, `fonts/NotoSerifTamil-Bold.woff2` (loaded as `NotoTamil`).

## 6. Kit (`import * as K from './core/kit.js'`)
- **Light:** `glow(x, y, r, 'r,g,b', a)` · `vignette(a)` · `embers(t, n, seed)` · `godrays(t, a, n)` · `bubbles(t, n, seed)`
- **Manuscripts:** `leaf(x, y, w, h, rot, { lines, seed, tie, warm })` · `manuscript(x, y, s, rot, { n, warm })`
- **Lamps:** `flame(x, y, s, t)` · `lamp(x, y, s, t, lit)`
- **Temples:** `gopuram(x, y, s, K.STONE.warm|gold|sea, { w, tiers, lit })` · `pillar(x, y, h, pal)` · `colonnade(x0, y, n, gap, h, pal)` · `lotus`
- **Sea & sky:** `sky(t)` · `wave(y, colour, t, amp)` · `ship(x, y, s, rot, t, { crew, lions, metal, noFlag })`
- **People:** `figure({ x, y, h, dir, role, arm, bend, sword, walk, metal, hold })` (arm angle: 0 down, 90 forward, 180 up)
- **Treasure & graphics:** `coin` · `kalasam` · `treasure` · `plaque('1025 CE', x, y, sc)` (date plaque, pop it with `eob`) ·
  `tamil(text, x, y, size)` · `label` · `statue(x, y, s, t, inscription)`
- **Maps:** `map({ route: 0..1, highlight, labels })` (invented coastlines: draw a simplified real outline in `shots.js` for real places) ·
  `route(pts, p)` · `landPts`
- **Scenes:** `scriptorium(t)` (A) · `sunken(t)` (B) · `harbor(t, { temple })` (C) · `bronzeHall(t)` (D)
- **Captions:** `captionStrip(words, x, y, sc)`, `CAPLOOK`

## 7. QA pitfalls
- Keep plaques/labels above y 1450 and heroes above y 1450 so the caption strip (y 1640) never covers them.
- Teal scenes wash out fast: keep `godrays` alpha ≤ 0.3 and the fog rect on; put the date plaque on top, never under rays.
- A statue's ship must overlap the plinth top only, never the inscription.
- Figures are 700 px at `h: 700`; two figures closer than ~200 px collide with swords or arms.

## 8. To finish the style (not done yet)
Write `example/` (a ~30 s short: `script.json`, `shots.js`, timing via `voice.py` + `words.py`), add a row to the SKILL.md table, run `selftest.sh`.
Optional: a bell/sea-swell sound in `tools/mix.py`.
