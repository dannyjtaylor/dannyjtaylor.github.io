import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './BootScreen.module.css';

interface BootLine {
  text: string;
  cls?: string;
  delay: number;
  /** Optional: fire a sound cue when this line renders */
  sound?: 'beep' | 'beepHigh' | 'hddSeek' | 'fddSeek' | 'chime';
}

const QUOTES = [
  'There IS a letter \'A\' in "Ethan"!',
  'DJT stands for what?',
  '640K ought to be enough for anybody.',
  'Have you tried turning it off and on again?',
  'It works on my machine.',
  'Hello, World!',
];

/* ── Web Audio boot sound effects ─────────────────────────── */

let _audioCtx: AudioContext | null = null;
function actx(): AudioContext {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
}

/** Simple square-wave tone */
function tone(freq: number, dur: number, vol = 0.06, type: OscillatorType = 'square') {
  try {
    const c = actx();
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.frequency.value = freq;
    osc.type = type;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch { /* silent */ }
}

/** Filtered noise burst (HDD / FDD seek) */
function noiseBurst(dur: number, lpFreq: number, vol = 0.05) {
  try {
    const c   = actx();
    const len = Math.max(1, Math.round(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * vol;

    const src = c.createBufferSource();
    src.buffer = buf;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = lpFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(lp); lp.connect(g); g.connect(c.destination);
    src.start(); src.stop(c.currentTime + dur);
  } catch { /* silent */ }
}

const BootSounds = {
  /** Classic POST single beep */
  beep:     () => tone(1000, 0.18, 0.07),
  /** Higher confirmation beep */
  beepHigh: () => tone(1400, 0.10, 0.05),
  /** Hard-disk seek chatter */
  hddSeek:  () => {
    for (let i = 0; i < 4; i++) setTimeout(() => noiseBurst(0.03, 800, 0.04), i * 40);
  },
  /** Floppy drive seek */
  fddSeek:  () => {
    for (let i = 0; i < 3; i++) setTimeout(() => noiseBurst(0.04, 600, 0.03), i * 70);
  },
  /** Startup chime — layered, ambient, Windows 95-inspired (Brian Eno style) */
  chime: () => {
    const vol = 0.045;
    // Layer 1: Warm foundation chord (C major)
    tone(262, 2.5, vol, 'sine');
    tone(330, 2.5, vol * 0.8, 'sine');
    tone(392, 2.5, vol * 0.7, 'sine');

    // Layer 2: Higher octave shimmer, slightly delayed
    setTimeout(() => {
      tone(523, 2.0, vol * 0.6, 'sine');
      tone(659, 2.0, vol * 0.5, 'sine');
      tone(784, 2.0, vol * 0.45, 'sine');
    }, 200);

    // Layer 3: Triangle wave warmth
    setTimeout(() => {
      tone(262, 2.0, vol * 0.5, 'triangle');
      tone(392, 2.0, vol * 0.4, 'triangle');
      tone(523, 1.8, vol * 0.35, 'triangle');
    }, 350);

    // Layer 4: Gentle melodic rise
    setTimeout(() => tone(659, 1.2, vol * 0.5, 'sine'), 600);
    setTimeout(() => tone(784, 1.0, vol * 0.5, 'sine'), 900);
    setTimeout(() => tone(1047, 1.5, vol * 0.4, 'sine'), 1200);

    // Layer 5: Soft high sparkle
    setTimeout(() => tone(1568, 1.2, vol * 0.2, 'sine'), 800);
    setTimeout(() => tone(2093, 1.0, vol * 0.15, 'sine'), 1100);

    // Layer 6: Final resolving chord swell
    setTimeout(() => {
      tone(523, 1.8, vol * 0.4, 'sine');
      tone(659, 1.8, vol * 0.35, 'sine');
      tone(784, 1.8, vol * 0.3, 'sine');
      tone(1047, 1.5, vol * 0.25, 'sine');
    }, 1400);
  },
};

function playBootSound(id?: BootLine['sound']) {
  if (!id) return;
  BootSounds[id]?.();
}

/* ── Boot sequence definition ─────────────────────────────── */

function buildBootLines(quote: string): BootLine[] {
  return [
    { text: '', delay: 300, sound: 'beep' },
    { text: '  DJTech BIOS v4.20 — 2004 Edition', cls: 'white', delay: 80 },
    { text: '  (C) 2004 DJTech, Inc.', cls: 'dim', delay: 60 },
    { text: '', delay: 200 },
    { text: '  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', cls: 'white', delay: 20 },
    { text: '  \u2502                                                         \u2502', cls: 'white', delay: 20 },
    { text: '  \u2502        \u2588\u2588\u2588\u2588   \u2588\u2588\u2588  \u2588   \u2588 \u2588   \u2588 \u2588   \u2588  \u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588        \u2502', cls: 'green', delay: 20 },
    { text: '  \u2502        \u2588   \u2588 \u2588   \u2588 \u2588\u2588  \u2588 \u2588\u2588  \u2588  \u2588 \u2588  \u2588   \u2588 \u2588            \u2502', cls: 'green', delay: 20 },
    { text: '  \u2502        \u2588   \u2588 \u2588\u2588\u2588\u2588\u2588 \u2588 \u2588 \u2588 \u2588 \u2588 \u2588   \u2588   \u2588   \u2588 \u2588\u2588\u2588\u2588\u2588        \u2502', cls: 'green', delay: 20 },
    { text: '  \u2502        \u2588   \u2588 \u2588   \u2588 \u2588  \u2588\u2588 \u2588  \u2588\u2588   \u2588   \u2588   \u2588     \u2588        \u2502', cls: 'green', delay: 20 },
    { text: '  \u2502        \u2588\u2588\u2588\u2588  \u2588   \u2588 \u2588   \u2588 \u2588   \u2588   \u2588    \u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588        \u2502', cls: 'green', delay: 20 },
    { text: '  \u2502                                                         \u2502', cls: 'white', delay: 20 },
    { text: '  \u2502                    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510                    \u2502', cls: 'white', delay: 20 },
    { text: '  \u2502                    \u2502    v 1 . 0    \u2502                    \u2502', cls: 'yellow', delay: 20 },
    { text: '  \u2502                    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                    \u2502', cls: 'white', delay: 20 },
    { text: '  \u2502                                                         \u2502', cls: 'white', delay: 20 },
    { text: '  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', cls: 'white', delay: 20 },
    { text: '', delay: 400 },
    { text: '  ── BIOS POST (Power-On Self Test) ──────────────────', cls: 'white', delay: 300 },
    { text: '', delay: 80 },
    { text: '  CPU:  DJTech 486DX2-66MHz ..................... OK', delay: 100, sound: 'beepHigh' },
    { text: '  FPU:  DJTech 487 Co-Processor ................. OK', delay: 60 },
    { text: '  RAM:  640K Conventional ...................... OK', delay: 80 },
    { text: '        8192K Extended ......................... OK', delay: 60 },
    { text: '  ┌───────────────────────────────────────────────┐', cls: 'dim', delay: 30 },
    { text: `  │  "${quote}"`, cls: 'dim', delay: 30 },
    { text: '  └───────────────────────────────────────────────┘', cls: 'dim', delay: 200 },
    { text: '  VGA:  256 Colors @ 640×480 ................... OK', delay: 60 },
    { text: '  HDD:  420MB IDE (C:) ......................... OK', delay: 60, sound: 'hddSeek' },
    { text: '  FDD:  1.44MB 3½" (A:) ....................... OK', delay: 60, sound: 'fddSeek' },
    { text: '  CD:   2× Speed ATAPI (D:) ................... OK', delay: 60 },
    { text: '  SND:  SoundBlaster 16 (IRQ 5, DMA 1) ........ OK', delay: 60 },
    { text: '  NET:  NE2000 Compatible (IRQ 10) ............. OK', delay: 60 },
    { text: '  IO:   Serial Mouse on COM1 ................... OK', delay: 60 },
    { text: '', delay: 200 },
    { text: '  All systems nominal.', cls: 'green', delay: 200 },
    { text: '', delay: 200 },
    { text: '  C:\\> DANNY.EXE /portfolio /load', cls: 'yellow', delay: 400, sound: 'hddSeek' },
    { text: '', delay: 200 },
    { text: '  Initializing DannyOS v1.0 ...', cls: 'white', delay: 200 },
    { text: '', delay: 80 },
    { text: '  ├─ Kernel ............................ loaded', delay: 80 },
    { text: '  ├─ Device drivers .................... loaded', delay: 60 },
    { text: '  ├─ File system (DANNYFS) ............. mounted', delay: 60 },
    { text: '  ├─ Network stack ..................... ready', delay: 60 },
    { text: '  ├─ Portfolio services ................ started', delay: 60 },
    { text: '  ├─ Desktop environment ............... loaded', delay: 60 },
    { text: '  └─ Workspace ......................... ready', delay: 80 },
    { text: '', delay: 200 },
    { text: '__PROGRESS__', delay: 0 },
    { text: '', delay: 100 },
    { text: '  System ready. Welcome, visitor.', cls: 'green', delay: 500, sound: 'chime' },
    { text: '  Starting desktop ...', cls: 'green', delay: 600 },
  ];
}

export function BootScreen() {
  const setPhase = useDesktopStore((s) => s.setPhase);
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const cancelRef = useRef(false);
  const [fading, setFading] = useState(false);

  // Pick a random quote once on mount
  const bootLines = useMemo(
    () => buildBootLines(QUOTES[Math.floor(Math.random() * QUOTES.length)]!),
    [],
  );

  const finishBoot = useCallback(() => {
    if (cancelRef.current) return;
    cancelRef.current = true;
    setFading(true);
    setTimeout(() => setPhase('desktop'), 500);
  }, [setPhase]);

  const skipBoot = useCallback(() => {
    finishBoot();
  }, [finishBoot]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        skipBoot();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skipBoot]);

  useEffect(() => {
    let isCancelled = false;

    async function run() {
      const pre = preRef.current;
      if (!pre) return;

      for (const line of bootLines) {
        if (isCancelled || cancelRef.current) return;

        if (line.text === '__PROGRESS__') {
          await animateProgressBar(pre, () => cancelRef.current);
          continue;
        }

        // Fire sound cue for this line
        playBootSound(line.sound);

        const span = document.createElement('span');
        if (line.cls) span.dataset.cls = line.cls;
        span.textContent = line.text + '\n';
        pre.appendChild(span);
        pre.parentElement?.scrollTo(0, pre.parentElement.scrollHeight);

        if (line.delay > 0) {
          await delay(line.delay);
        }
      }

      // Boot done — mark that the user has visited at least once
      localStorage.setItem('dannyos_has_visited', '1');
      if (!cancelRef.current) {
        finishBoot();
      }
    }

    run();
    return () => { isCancelled = true; };
  }, [finishBoot, bootLines]);

  return (
    <div
      ref={containerRef}
      className={`${styles.bootScreen} ${fading ? styles.fadeOut : ''}`}
      onClick={skipBoot}
    >
      <div className={styles.crtOverlay} />
      <img
        src="/energystar.png"
        alt="Energy Star"
        className={styles.energyStar}
        draggable={false}
      />
      <div className={styles.terminal}>
        <pre ref={preRef} className={styles.text} />
        {!fading && <span className={styles.cursor}>_</span>}
      </div>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateProgressBar(
  pre: HTMLPreElement,
  isCancelled: () => boolean,
): Promise<void> {
  const barWidth = 44;
  const span = document.createElement('span');
  span.dataset.cls = 'green';
  pre.appendChild(span);

  for (let p = 0; p <= 100; p++) {
    if (isCancelled()) return;
    const filled = Math.round((p / 100) * barWidth);
    const empty = barWidth - filled;
    span.textContent =
      '  [' + '\u2588'.repeat(filled) + '\u2591'.repeat(empty) + '] ' + p + '%\n';
    pre.parentElement?.scrollTo(0, pre.parentElement.scrollHeight);
    await delay(20);
  }
}
