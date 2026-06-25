let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => null);
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, startDelay = 0): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startDelay);
  g.gain.setValueAtTime(gain, c.currentTime + startDelay);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startDelay + duration);
  osc.start(c.currentTime + startDelay);
  osc.stop(c.currentTime + startDelay + duration + 0.01);
}

export const Sounds = {
  keypress(): void {
    tone(1200, 0.012, 'sine', 0.04);
  },
  advance(): void {
    tone(440, 0.15, 'sine', 0.08);
    tone(550, 0.15, 'sine', 0.06, 0.04);
  },
  correct(): void {
    tone(600, 0.06, 'sine', 0.12);
    tone(900, 0.12, 'sine', 0.12, 0.07);
  },
  wrong(): void {
    tone(300, 0.18, 'sawtooth', 0.18);
    tone(150, 0.22, 'sawtooth', 0.14, 0.18);
  },
  siren(): void {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);
    osc.type = 'sawtooth';
    g.gain.setValueAtTime(0.28, c.currentTime);
    for (let i = 0; i < 8; i++) {
      osc.frequency.setValueAtTime(780, c.currentTime + i * 0.4);
      osc.frequency.setValueAtTime(1180, c.currentTime + i * 0.4 + 0.2);
    }
    g.gain.setValueAtTime(0.28, c.currentTime + 2.8);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.4);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 3.5);
  },
  cashClick(): void {
    tone(220, 0.04, 'square', 0.1);
  },
  jackpotWin(): void {
    ([523, 659, 784] as const).forEach((f, i) => {
      tone(f, 0.35, 'sine', 0.15, i * 0.16);
    });
  },
};
