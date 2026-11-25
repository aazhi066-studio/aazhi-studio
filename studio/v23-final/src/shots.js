// EPISODE 23 · PANDYA PARRICIDE c.1310 ("Ebony Chessboard & Marbled Ink")
import { buildA } from './shots_a.js';
import { buildB } from './shots_b.js';
import { buildC } from './shots_c.js';
export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  buildA(add, cue); buildB(add, cue); buildC(add, cue);
  if (!S.length || S[0].at > 0) S.push({ id: "stub0", at: 0, draw() {} });
  S.sort((a, b) => a.at - b.at);
  return { shots: S, cues: CUES };
}
