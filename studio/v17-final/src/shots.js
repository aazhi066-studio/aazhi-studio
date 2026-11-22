// EPISODE 17 · THE ERASED KINGS (KALABHRAS)
import { buildA } from './shots_a.js';
import { buildB } from './shots_b.js';
import { buildC } from './shots_c.js';
export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  buildA(add, cue); buildB(add, cue); buildC(add, cue);
  S.sort((a, b) => a.at - b.at);
  return { shots: S, cues: CUES };
}
