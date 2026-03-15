import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './BootScreen.module.css';

interface BootLine {
  text: string;
  cls?: string;
  delay: number;
}

const QUOTES = [
  'There IS a letter \'A\' in "Ethan"!',
  'DJT stands for what?',
  '640K ought to be enough for anybody.',
  'Have you tried turning it off and on again?',
  'It works on my machine.',
  'Hello, World!',
];

function buildBootLines(quote: string): BootLine[] {
  return [
    { text: '', delay: 300 },
    { text: '  DJTech BIOS v4.20 — 2004 Edition', cls: 'white', delay: 80 },
    { text: '  (C) 2004 DJTech, Inc.', cls: 'dim', delay: 60 },
    { text: '', delay: 200 },
    { text: '  +=====================================================+', cls: 'white', delay: 20 },
    { text: '  |                                                     |', cls: 'white', delay: 20 },
    { text: '  |   DDDD    AAAA   N   N  N   N  Y   Y                |', cls: 'green', delay: 20 },
    { text: '  |   D   D  A    A  NN  N  NN  N   Y Y                 |', cls: 'green', delay: 20 },
    { text: '  |   D   D  AAAAAA  N N N  N N N    Y                  |', cls: 'green', delay: 20 },
    { text: '  |   D   D  A    A  N  NN  N  NN    Y                  |', cls: 'green', delay: 20 },
    { text: '  |   DDDD   A    A  N   N  N   N    Y                  |', cls: 'green', delay: 20 },
    { text: '  |                                                     |', cls: 'white', delay: 20 },
    { text: '  |                 +===============+                   |', cls: 'white', delay: 20 },
    { text: '  |                 |   O S  v1.0   |                   |', cls: 'yellow', delay: 20 },
    { text: '  |                 +===============+                   |', cls: 'white', delay: 20 },
    { text: '  |                                                     |', cls: 'white', delay: 20 },
    { text: '  +=====================================================+', cls: 'white', delay: 20 },
    { text: '', delay: 400 },
    { text: '  ── BIOS POST (Power-On Self Test) ──────────────────', cls: 'white', delay: 300 },
    { text: '', delay: 80 },
    { text: '  CPU:  DJTech 486DX2-66MHz ..................... OK', delay: 100 },
    { text: '  FPU:  DJTech 487 Co-Processor ................. OK', delay: 60 },
    { text: '  RAM:  640K Conventional ...................... OK', delay: 80 },
    { text: '        8192K Extended ......................... OK', delay: 60 },
    { text: '  ┌───────────────────────────────────────────────┐', cls: 'dim', delay: 30 },
    { text: `  │  "${quote}"`, cls: 'dim', delay: 30 },
    { text: '  └───────────────────────────────────────────────┘', cls: 'dim', delay: 200 },
    { text: '  VGA:  256 Colors @ 640×480 ................... OK', delay: 60 },
    { text: '  HDD:  420MB IDE (C:) ......................... OK', delay: 60 },
    { text: '  FDD:  1.44MB 3½" (A:) ....................... OK', delay: 60 },
    { text: '  CD:   2× Speed ATAPI (D:) ................... OK', delay: 60 },
    { text: '  SND:  SoundBlaster 16 (IRQ 5, DMA 1) ........ OK', delay: 60 },
    { text: '  NET:  NE2000 Compatible (IRQ 10) ............. OK', delay: 60 },
    { text: '  IO:   Serial Mouse on COM1 ................... OK', delay: 60 },
    { text: '', delay: 200 },
    { text: '  All systems nominal.', cls: 'green', delay: 200 },
    { text: '', delay: 200 },
    { text: '  C:\\> DANNY.EXE /portfolio /load', cls: 'yellow', delay: 400 },
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
    { text: '  System ready. Welcome, visitor.', cls: 'green', delay: 500 },
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

        const span = document.createElement('span');
        if (line.cls) span.dataset.cls = line.cls;
        span.textContent = line.text + '\n';
        pre.appendChild(span);
        pre.parentElement?.scrollTo(0, pre.parentElement.scrollHeight);

        if (line.delay > 0) {
          await delay(line.delay);
        }
      }

      // Boot done
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
