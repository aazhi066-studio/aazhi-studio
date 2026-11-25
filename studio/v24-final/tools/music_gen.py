# Non-looping, seeded, per-video music for AAZHI. Style + seed give a fresh piece every time: no fixed period, events at random times, random note choice.
import numpy as np
from scipy import signal
STY = {
 # root Hz, scale ratios, drone partials, event density (per s), bell/pluck mix, brightness lowpass, reverb wet
 'abyss': dict(root=55.0,  sc=[1,16/15,6/5,4/3,3/2,8/5,9/5], dens=0.16, kind='glass', lpf=2600, wet=0.45, swell=True,  wind=0.00),
 'ember': dict(root=73.4,  sc=[1,9/8,6/5,3/2,8/5,15/8],      dens=0.28, kind='bow',   lpf=3000, wet=0.35, swell=True,  wind=0.02),
 'frost': dict(root=196.0, sc=[1,9/8,5/4,45/32,3/2,27/16],   dens=0.22, kind='box',   lpf=5200, wet=0.50, swell=False, wind=0.015),
 'dust':  dict(root=82.4,  sc=[1,9/8,6/5,4/3,3/2,5/3,9/5],   dens=0.20, kind='pluck', lpf=3200, wet=0.30, swell=False, wind=0.05),
 'tide':  dict(root=65.4,  sc=[1,9/8,4/3,3/2,16/9],          dens=0.18, kind='glass', lpf=3000, wet=0.55, swell=True,  wind=0.04),
}
def music_gen(style, seed, N, SR):
    p = STY[style]; rng = np.random.default_rng(seed); DUR = N / SR; t = np.arange(N) / SR; x = np.zeros(N)
    R = p['root']
    # drone: detuned partials with slowly wandering amplitude/pitch (random phases and LFO rates -> never repeats)
    for h, g in [(1,.5),(2,.3),(3,.18),(1.5,.22),(4,.08)]:
        for det in (-0.7, 0.0, 0.9):
            f = R*h + det*rng.uniform(.3,1.2); ph = rng.uniform(0,6.28); lf = rng.uniform(.03,.11); lp_ = rng.uniform(0,6.28)
            x += np.sin(2*np.pi*f*t + ph + 0.4*np.sin(2*np.pi*lf*t+lp_)) * g * (0.6+0.4*np.sin(2*np.pi*rng.uniform(.02,.07)*t+rng.uniform(0,6.28)))*0.35
    if p['wind']:
        n = signal.lfilter(*signal.butter(2,[300/(SR/2),1800/(SR/2)],'band'), rng.standard_normal(N))
        x += n * p['wind'] * (0.5+0.5*np.sin(2*np.pi*rng.uniform(.04,.09)*t+rng.uniform(0,6.28)))
    def put(y, at):
        i = int(at*SR); k = min(len(y), N-i)
        if k > 0 and i >= 0: x[i:i+k] += y[:k]
    def tone(f, d, kind, g):
        tt = np.arange(int(d*SR))/SR
        if kind == 'glass': y = sum(np.sin(2*np.pi*f*r*tt)*a*np.exp(-tt*(0.9+0.7*r)) for r,a in [(1,1),(2.76,.4),(5.4,.18),(8.9,.07)])
        elif kind == 'box': y = sum(np.sin(2*np.pi*f*r*tt)*a*np.exp(-tt*(2.2+r)) for r,a in [(1,1),(3,.3),(5,.12)])
        elif kind == 'pluck': y = sum(np.sin(2*np.pi*f*h*tt)*(1/h**1.1)*np.exp(-tt*(1.3+.5*h)) for h in range(1,8))
        else: y = (signal.sawtooth(2*np.pi*f*tt)*0.5+np.sin(2*np.pi*f*tt))*np.minimum(1,tt/(d*.35))*np.minimum(1,(d-tt)/(d*.45))   # bowed
        y = y.copy(); a = int(.004*SR); y[:a] *= np.linspace(0,1,a); return y*g
    # random events (Poisson), notes drawn from the scale, octave and length vary, occasional repeat-avoidance
    last = -1; at = rng.uniform(1.5, 4)
    while at < DUR-1.0:
        d = rng.choice(range(len(p['sc']))); 
        while d == last: d = rng.choice(range(len(p['sc'])))
        last = d; octv = rng.choice([2,4,4,8]) if p['kind']!='bow' else rng.choice([2,4])
        f = R*p['sc'][d]*octv; kind = p['kind']
        put(tone(f, rng.uniform(2.0,4.5), kind, rng.uniform(.07,.16)), at)
        if rng.random()<.25: put(tone(f*p['sc'][rng.integers(len(p['sc']))]/1, rng.uniform(2.0,4.0), kind, .06), at+rng.uniform(.3,.9))
        at += rng.exponential(1/p['dens']) + 0.8
    if p['swell']:                                     # slow risers/swells at random places
        for _ in range(max(1,int(DUR/22))):
            a = rng.uniform(2, max(3,DUR-9)); L = rng.uniform(5,9); i0 = int(a*SR); i1 = min(N,int((a+L)*SR)); tt = np.arange(i1-i0)/SR
            e = np.sin(np.pi*np.linspace(0,1,i1-i0))**2; f0 = R*rng.choice([1,2,3])*p['sc'][rng.integers(len(p['sc']))]
            x[i0:i1] += (np.sin(2*np.pi*f0*tt)+0.5*np.sin(2*np.pi*f0*1.006*tt)+0.25*np.sin(2*np.pi*f0*2*tt))*e*0.10
    # reverb (random decaying-noise impulse), filter, fades
    ir = rng.standard_normal(int(2.6*SR))*np.exp(-np.arange(int(2.6*SR))/SR*1.7); ir /= np.abs(ir).sum()+1e-9
    wet = signal.fftconvolve(x, ir*40)[:N]; x = (1-p['wet'])*x + p['wet']*wet
    x = signal.lfilter(*signal.butter(2, p['lpf']/(SR/2), 'low'), x)
    fade = np.ones(N); fo = int(2.0*SR); fade[-fo:] = np.linspace(1,0,fo); fi = int(1.5*SR); fade[:fi] *= np.linspace(0,1,fi)
    return x/(np.abs(x).max()+1e-9)*fade
