import * as N from './neon.js';
const P = N.PAL;
export function buildA(add, cue) {
  add({ id: 'test', at: 0, draw: (lt) => { N.wall(lt, { rain: 0.6, wet: 1350, glowCol: P.amber, gy: 900 });
    N.city(60, 1020, 1350, 260, 1, { col: P.amber, b: 0.5 });
    N.throne(540, 950, 1.3, { b: 1 }); N.figure(540, 1180, 1.0, { sit: true, hat: 'crown', col: P.amber, b: N.buzz(lt, 2) });
    N.crowd(100, 980, 1340, 7, lt, { torch: true }); N.sign('1070', 540, 330, 200, P.red); N.tag('ILLUSTRATION', 540, 520, P.white, 0.8);
    N.figure(220, 1100, 0.8, { col: P.cyan, hat: 'helm', spear: true }); N.figure(860, 1100, 0.8, { col: P.magenta, hat: 'turban' });
    N.reflect(1350, () => { N.throne(540, 950, 1.3, { b: 1 }); }, 0.25, lt); N.sparks(540, 700, lt, 0.1); } });
}
