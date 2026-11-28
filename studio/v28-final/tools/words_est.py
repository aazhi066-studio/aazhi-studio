"""Word timing estimate: python3 -I words_est.py <project dir>. Reads data/lines.json from voice_ph.py (list) and data/narration.wav,
rewrites data/lines.json as {duration, lines:[..., i]} and writes data/words.json [{w, line, s, e}]: words are spread across each line's exact
start/end in proportion to their phoneme count (+ a small pause weight after , . ;)."""
import sys, json, re
from pathlib import Path
from scipy.io import wavfile
from kokoro_onnx.tokenizer import Tokenizer
P = Path(sys.argv[1]); D = json.load(open(Path(__file__).resolve().parent.parent / 'data' / 'pronunciations.json')); tk = Tokenizer()
sr, x = wavfile.read(P / 'data' / 'narration.wav'); dur = round(len(x) / sr, 3)
L = json.load(open(P / 'data' / 'lines.json')); L = L['lines'] if isinstance(L, dict) else L
words = []
for i, l in enumerate(L):
    l['i'] = i; ws = l['text'].split()
    wt = []
    for w in ws:
        core = re.sub(r"[^A-Za-z']", '', w)
        n = len(D.get(core) or tk.phonemize(core, 'en-us').strip() or core)
        wt.append(max(2, n) + (3 if re.search(r'[,;]$', w) else 5 if re.search(r'[.!?]$', w) else 0))
    tot = sum(wt); t = l['start']; span = l['end'] - l['start']
    for w, k in zip(ws, wt):
        e = t + span * k / tot; words.append({'w': re.sub(r"[^A-Za-z0-9']", '', w), 'line': i, 's': round(t, 3), 'e': round(e, 3)}); t = e
json.dump({'duration': dur, 'lines': L}, open(P / 'data' / 'lines.json', 'w'), indent=1)
json.dump(words, open(P / 'data' / 'words.json', 'w'), indent=1)
print('duration', dur, 'lines', len(L), 'words', len(words))
