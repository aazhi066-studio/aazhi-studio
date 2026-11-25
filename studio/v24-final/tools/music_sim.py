"""Music window-similarity check: python3 -I music_sim.py <new script.json> [old script.json ...]
Renders each gen:<style> track with its seed (80 s, 22050 Hz), cuts 6 s windows every 3 s, describes each window by a
fine magnitude spectrum (100-4000 Hz, ~1.3 Hz bins) minus the track's average spectrum (the steady drone) and reports cosine similarity:
  self  = max over non-overlapping window pairs inside the new track (catches loops/repeats)
  cross = max over window pairs between the new track and each old track (catches reused music)
Pass when the MEAN window similarity is < 0.3 (self and each cross) and no repeated passage exists
(3+ consecutive window pairs along a diagonal all > 0.8, i.e. >= ~12 s of copied music). Single-window maxima are printed
but not used: one sustained note of the same pitch makes two windows look alike without any loop."""
import sys, json, numpy as np
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent)); from music_gen import music_gen
SR, DUR, WIN, HOP = 22050, 80, 6.0, 3.0
_f = np.fft.rfftfreq(int(WIN * SR), 1 / SR); BAND = (_f >= 100) & (_f <= 4000)
def feats(style, seed):
    x = music_gen(style, seed, SR * DUR, SR); out = []
    n, h = int(WIN * SR), int(HOP * SR)
    for i in range(0, len(x) - n, h):
        S = np.sqrt(np.abs(np.fft.rfft(x[i:i + n] * np.hanning(n))))
        out.append(np.add.reduceat(S[BAND], np.arange(0, BAND.sum(), 8)))  # ~1.3 Hz bins, 100-4000 Hz: fine pitch detail
    F = np.array(out); F /= np.linalg.norm(F, axis=1, keepdims=True) + 1e-9; F -= F.mean(0)  # level-normalise windows (fades), then  # remove the track's average timbre so only change over time is compared
    return F / (np.linalg.norm(F, axis=1, keepdims=True) + 1e-9)
def spec(p):
    s = json.load(open(p)); m = s.get('music', '')
    return (m.split(':')[1], int(s.get('music_seed', 7))) if m.startswith('gen:') else None
def judge(M, name, diag_from=0):
    mean = float(M[np.triu_indices_from(M, diag_from)].mean()) if diag_from else float(M.mean())
    rep = 0
    for off in range(-M.shape[0] + 1, M.shape[1]):
        if diag_from and off < diag_from: continue
        run = 0
        for v in np.diagonal(M, off): run = run + 1 if v > 0.8 else 0; rep = max(rep, run)
    ok = mean < 0.3 and rep < 3
    print(f'{name}: mean {mean:.3f}, max {M[np.triu_indices_from(M, diag_from)].max() if diag_from else M.max():.3f}, longest repeat run {rep} -> {"ok" if ok else "FAIL"}'); return ok
new = spec(sys.argv[1]); A = feats(*new); k = int(WIN / HOP)
ok = judge(A @ A.T, f'self {new}', k)
for p in sys.argv[2:]:
    o = spec(p)
    if not o: print(f'{p}: not gen music, skipped'); continue
    if o == new: print(f'{p}: SAME style+seed as new -> FAIL'); ok = False; continue
    ok &= judge(A @ feats(*o).T, f'cross {p} {o}')
print('PASS' if ok else 'FAIL')
