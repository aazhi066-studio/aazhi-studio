"""Phoneme narration: python3 -I voice_ph.py <script.json> <outdir>. Tamil names from data/pronunciations.json, rest via espeak en-us. One pass per line."""
import sys, json, re, numpy as np
from pathlib import Path
from scipy.io import wavfile
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
root=Path(__file__).resolve().parent.parent
D=json.load(open(root/'data'/'pronunciations.json'))
S=json.load(open(sys.argv[1])); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
k=Kokoro('/root/.faceless-shorts/kokoro/kokoro-v1.0.onnx','/root/.faceless-shorts/kokoro/voices-v1.0.bin'); t=Tokenizer()
SR=24000
def ph(text):
    toks=re.findall(r"[A-Za-z']+|[.,;!?]",text); res=[]; run=[]
    def flush():
        if run: res.append(t.phonemize(' '.join(run),'en-us').strip()); run.clear()
    for w in toks:
        if w in D: flush(); res.append(D[w])
        elif w in '.,;!?': run.append(w) if False else (flush(), res.append(w))
        else: run.append(w)
    flush(); return ' '.join(res)
def trim(x,thr=0.008):
    i=np.where(np.abs(x)>thr)[0]; return x[max(0,i[0]-240):min(len(x),i[-1]+720)] if len(i) else x
aud=[np.zeros(int(S.get('lead',0.6)*SR))]; cur=aud[0].size/SR; lines=[]
for l in S['lines']:
    x=trim(np.asarray(k.create(ph(l['text']),voice=S['voice'],speed=S['speed'],is_phonemes=True)[0],dtype=np.float64))
    lines.append({'text':l['text'],'caps':l['caps'],'start':round(cur,3),'end':round(cur+len(x)/SR,3)})
    g=np.zeros(int(l.get('gap',0.5)*SR)); aud+= [x,g]; cur+=(len(x)+len(g))/SR
aud.append(np.zeros(int(S.get('outro',0.5)*SR)))
y=np.concatenate(aud); y=y/np.abs(y).max()*0.89
wavfile.write(out/'narration.wav',SR,(y*32767).astype(np.int16)); json.dump(lines,open(out/'lines.json','w'),indent=1)
print('duration',round(len(y)/SR,1),'s; lines',len(lines)); print(ph(S['lines'][4]['text']))
