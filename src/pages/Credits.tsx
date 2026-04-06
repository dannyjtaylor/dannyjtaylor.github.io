import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import styles from './Credits.module.css';

/* ═══════════════════════════════════════════
   Track & Credits Data
   ═══════════════════════════════════════════ */

const TRACKS = [
  { name: 'Kasane Teto - Machine Love', file: '/kasane_1.mp3' },
  { name: 'FMAB - Again (YUI)', file: '/fmab_1.mp3' },
  { name: 'JJK - AIZO', file: '/jjk_1.mp3' },
  { name: 'Deltarune - Paradise, Paradise', file: '/deltarune_1.mp3' },
  { name: 'I Wish That I Could Fall', file: '/iwishthaticouldfall.mp3' },
];

interface CreditEntry {
  name: string;
  role?: string;
  photo?: string;
  needsLastName?: boolean;
}

interface CreditSection {
  title: string;
  entries: CreditEntry[];
}

const CREDITS_DATA: CreditSection[] = [
  {
    title: '2404-1313',
    entries: [
      { name: 'Bryon Catlin' },
      { name: 'Noah Campise' },
      { name: 'George Mancini' },
    ],
  },
  {
    title: "Bryon's Family",
    entries: [
      { name: 'Bryon Catlin II' },
      { name: 'Dylan Catlin' },
      { name: 'Leona Catlin' },
      { name: 'Stephanie Catlin' },
      { name: 'Sam Critchlow' },
      { name: 'Tyler Critchlow' },
    ],
  },
  {
    title: 'Good Mythical Morning Enjoyers',
    entries: [
      { name: 'Emma', needsLastName: true },
      { name: 'Jaylee', needsLastName: true },
    ],
  },
  {
    title: 'My Family',
    entries: [
      { name: 'Katherine Taylor', role: 'Mother' },
      { name: 'John Taylor', role: 'Father' },
      { name: 'Johnny Taylor', role: 'Brother' },
      { name: 'Patricia Taylor', role: 'Sister' },
      { name: 'Forrest Taylor', role: 'Brother' },
      { name: 'Aunt Caroline', role: 'Aunt' },
      { name: 'Aunt Silvia', role: 'Aunt' },
      { name: 'Aunt Sue', role: 'Aunt' },
      { name: 'Uncle Boo', role: 'Uncle' },
      { name: 'Uncle Clagget', role: 'Uncle' },
      { name: 'Uncle Randy', role: 'Uncle' },
      { name: 'Andrew Livingston', role: 'Cousin' },
      { name: 'George Livingston', role: 'Cousin' },
      { name: 'Hannah Livingston', role: 'Cousin' },
      { name: 'Hunter Livingston', role: 'Cousin' },
      { name: 'Jacob Livingston', role: 'Cousin' },
    ],
  },
  {
    title: 'Paul Patullo',
    entries: [{ name: 'Paul Patullo' }],
  },
  {
    title: "Polk County Sheriff's Office LiDAR Team (Capstone)",
    entries: [
      { name: 'James Allegra' },
      { name: 'Gaspar Chayer' },
      { name: 'Gerardo Claudio' },
      { name: 'Jackson Giles' },
      { name: 'Leon Harry' },
      { name: 'Michael Stevenson' },
      { name: 'Lillian Wright' },
      { name: 'Michael Kennon', role: 'Sponsor' },
      { name: 'Jeremy Webb', role: 'Sponsor' },
    ],
  },
  {
    title: 'Professors',
    entries: [
      { name: 'Dr. Rawa Adla' },
      { name: 'Dr. Hoan Ngo' },
      { name: 'Dr. Sundari Ramabhotla' },
      { name: 'Dr. Onur Toker' },
      { name: 'Dr. Muhammad Ullah' },
    ],
  },
  {
    title: 'Rotaract',
    entries: [
      { name: 'Alex Cam' },
      { name: 'Brittany Cam' },
      { name: 'Jeremy Casanova' },
      { name: 'Jack Everheart' },
      { name: 'Bobby Green' },
      { name: 'Izzy Greer' },
      { name: 'Domenic Iorfida' },
      { name: 'Tommy Jackson' },
      { name: 'Trenton McCutcheon' },
      { name: 'Aidan Morris' },
      { name: 'Melanie Najera' },
      { name: 'Danielle Rivers' },
      { name: 'Jesus Sanchez' },
      { name: 'Bryden Silva' },
      { name: 'Alyson Smyth' },
      { name: 'Ryan Thomas' },
      { name: 'Jeff Tillman' },
      { name: 'Brian Tran' },
      { name: 'Larry Walker' },
    ],
  },
  {
    title: 'SHPE',
    entries: [
      { name: 'Sebastian Anzola' },
      { name: 'Carlos Marillo' },
      { name: 'Samuel Marillo' },
      { name: 'Gabriel Sanchez' },
    ],
  },
  {
    title: 'SHPE Eboard 2025\u20132026',
    entries: [
      { name: 'Ines Alonso' },
      { name: 'Naibys "Kro" Alzugaray' },
      { name: 'Gabriel Basalo' },
      { name: 'Nicolas Izquierdo' },
      { name: 'Shriraj Mandulapalli' },
      { name: 'Alex Meert' },
      { name: 'Ethan Puig' },
    ],
  },
  {
    title: 'Student Government Association',
    entries: [
      { name: 'Colby Mandrodt', role: 'President' },
      { name: 'Nolan Nguyen', role: 'Vice President' },
    ],
  },
  {
    title: 'VALORANT Varsity',
    entries: [
      { name: 'Bethany', needsLastName: true },
      { name: 'Jay', needsLastName: true },
      { name: 'Jonathan', needsLastName: true },
      { name: 'Julian', needsLastName: true },
      { name: 'Ryan', needsLastName: true },
      { name: 'Wack', needsLastName: true },
    ],
  },
  {
    title: 'Winter Haven Technology Services',
    entries: [
      { name: 'Michael Adams' },
      { name: 'Angel', needsLastName: true },
      { name: 'Praythusa Bhuma' },
      { name: 'Blake', needsLastName: true },
      { name: 'Adriana Bottega' },
      { name: 'Connor', needsLastName: true },
      { name: 'Christopher Duclos' },
      { name: 'Esteban', needsLastName: true },
      { name: 'Jeremiah', needsLastName: true },
      { name: 'Aizan "Bobby" Khan' },
      { name: 'Mikey LaFollette' },
      { name: 'Hiep Nguyen' },
      { name: 'Nickolas Phan' },
      { name: 'Pickleball John', needsLastName: true },
      { name: 'Kristina Smith' },
      { name: 'Joshua Stone' },
      { name: 'Christopher Taylor' },
      { name: 'Katiya Taylor' },
      { name: 'Robert van Druten' },
      { name: 'Jose Vega' },
      { name: 'Wen Zhang' },
    ],
  },
  {
    title: 'Special Thanks',
    entries: [
      { name: 'Edward Elric' },
      { name: 'Maya Fey' },
      { name: 'Toby Fox' },
      { name: 'Hornet' },
      { name: 'Itadori Yuji' },
      { name: 'Apollo Justice' },
      { name: 'Hideo Kojima' },
      { name: 'Jotaro Kujo' },
      { name: 'Akira Kurusu' },
      { name: 'Lucy MacLean' },
      { name: 'Roy Mustang' },
      { name: 'Yu Narukami' },
      { name: 'Kasane Teto' },
      { name: 'The Knight' },
      { name: 'Thorfinn Son of Thors' },
      { name: 'Phoenix Wright' },
      { name: 'Makoto Yuki' },
    ],
  },
];

const ALL_NAMES = CREDITS_DATA.flatMap((s) => s.entries.map((e) => e.name));
const BASE_DURATION = 180;

/* ═══════════════════════════════════════════
   Attack Mode — Undertale "Last Goodbye"
   ═══════════════════════════════════════════ */

interface Projectile {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
}

let nextProjId = 0;

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  flash: boolean,
) {
  ctx.save();
  ctx.fillStyle = flash ? '#ffffff' : '#ff0000';
  const s = size;
  const top = cy - s * 0.5;
  const curveH = s * 0.3;
  ctx.beginPath();
  ctx.moveTo(cx, top + curveH);
  ctx.bezierCurveTo(cx, top, cx - s * 0.5, top, cx - s * 0.5, top + curveH);
  ctx.bezierCurveTo(cx - s * 0.5, top + s * 0.65, cx, top + s * 0.85, cx, top + s * 1.1);
  ctx.bezierCurveTo(cx, top + s * 0.85, cx + s * 0.5, top + s * 0.65, cx + s * 0.5, top + curveH);
  ctx.bezierCurveTo(cx + s * 0.5, top, cx, top, cx, top + curveH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function AttackGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI setup
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Logical dimensions (CSS pixels)
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Audio
    const audio = new Audio('/lastgoodbye.mp3');
    audio.loop = true;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    // State (all refs for 60fps performance)
    const heart = { x: W() / 2, y: H() * 0.7 };
    let projectiles: Projectile[] = [];
    let hitFlash = 0;
    let spawnTimer = 0;
    let nameIdx = 0;
    let lastTime = 0;
    let frameId = 0;
    let elapsed = 0;
    const HEART_SPEED = 300;
    const HEART_SIZE = 18;
    const HITBOX = 5;

    // Keyboard
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitRef.current();
        return;
      }
      keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Touch
    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchX = touch.clientX;
      touchY = touch.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      heart.x += touch.clientX - touchX;
      heart.y += touch.clientY - touchY;
      touchX = touch.clientX;
      touchY = touch.clientY;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    // Spawn a projectile
    const spawn = () => {
      const name = ALL_NAMES[nameIdx % ALL_NAMES.length] ?? 'Danny';
      nameIdx++;
      const fontSize = Math.max(16, Math.min(26, W() / 28));
      ctx.font = `${fontSize}px Georgia, serif`;
      const tw = ctx.measureText(name).width;
      const th = fontSize * 1.2;
      const speed = 130 + Math.random() * 80 + elapsed * 0.3;
      const id = nextProjId++;
      const w = W();
      const h = H();
      const pattern = Math.floor(Math.random() * 6);

      switch (pattern) {
        case 0: // left → right
          projectiles.push({ id, text: name, x: -tw - 10, y: Math.random() * h, vx: speed, vy: 0, w: tw, h: th });
          break;
        case 1: // right → left
          projectiles.push({ id, text: name, x: w + 10, y: Math.random() * h, vx: -speed, vy: 0, w: tw, h: th });
          break;
        case 2: // top → bottom
          projectiles.push({ id, text: name, x: Math.random() * (w - tw), y: -th, vx: 0, vy: speed, w: tw, h: th });
          break;
        case 3: // bottom → top
          projectiles.push({ id, text: name, x: Math.random() * (w - tw), y: h + th, vx: 0, vy: -speed, w: tw, h: th });
          break;
        case 4: // targeted at player
        case 5: {
          const fromLeft = Math.random() < 0.5;
          const sx = fromLeft ? -tw - 10 : w + 10;
          const sy = Math.random() * h;
          const dx = heart.x - sx;
          const dy = heart.y - sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          projectiles.push({ id, text: name, x: sx, y: sy, vx: (dx / dist) * speed, vy: (dy / dist) * speed, w: tw, h: th });
          break;
        }
      }
    };

    // Game loop
    const gameLoop = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      elapsed += dt;

      const w = W();
      const h = H();

      // Move heart
      if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
      if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
      if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
      if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
      heart.x = Math.max(HEART_SIZE, Math.min(w - HEART_SIZE, heart.x));
      heart.y = Math.max(HEART_SIZE, Math.min(h - HEART_SIZE, heart.y));

      // Spawn
      const spawnInterval = Math.max(0.4, 1.0 - elapsed * 0.005);
      spawnTimer += dt;
      if (spawnTimer > spawnInterval) {
        spawnTimer = 0;
        spawn();
        // Occasionally spawn a burst
        if (Math.random() < 0.2) { spawn(); spawn(); }
      }

      // Update projectiles
      for (const p of projectiles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      projectiles = projectiles.filter(
        (p) => p.x > -500 && p.x < w + 500 && p.y > -200 && p.y < h + 200,
      );

      // Collision (tiny hitbox like Undertale)
      if (hitFlash <= 0) {
        for (const p of projectiles) {
          if (
            heart.x + HITBOX > p.x &&
            heart.x - HITBOX < p.x + p.w &&
            heart.y + HITBOX > p.y - p.h * 0.2 &&
            heart.y - HITBOX < p.y + p.h
          ) {
            hitFlash = 0.5;
            break;
          }
        }
      } else {
        hitFlash -= dt;
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);

      // Hit flash overlay
      if (hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${hitFlash * 0.15})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Projectiles
      const fontSize = Math.max(16, Math.min(26, w / 28));
      ctx.font = `${fontSize}px Georgia, serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      for (const p of projectiles) {
        ctx.fillText(p.text, p.x, p.y);
      }

      // Heart
      drawHeart(ctx, heart.x, heart.y, HEART_SIZE, hitFlash > 0);

      // Hints
      ctx.font = '13px Georgia, serif';
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const isMobile = 'ontouchstart' in window;
      ctx.fillText(
        isMobile ? 'Drag to move \u00B7 Tap \u2715 to exit' : 'Arrow keys / WASD to move \u00B7 ESC to exit',
        w / 2,
        h - 16,
      );

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frameId);
      audio.pause();
      audio.src = '';
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.attackOverlay}>
      <canvas ref={canvasRef} className={styles.attackCanvas} />
      <button className={styles.attackExitBtn} onClick={onExit} aria-label="Exit game">
        &times;
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Credits Component
   ═══════════════════════════════════════════ */

type Mode = 'select' | 'credits' | 'attack';

export function Credits() {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [volume, setVolume] = useState(60);
  const [speed, setSpeed] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const contentHeightRef = useRef(0);
  const blackPauseRef = useRef(false);
  const speedRef = useRef(1);
  const volumeRef = useRef(60);

  // Keep refs in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Measure content height after credits DOM is painted
  useLayoutEffect(() => {
    if (mode === 'credits' && trackRef.current) {
      contentHeightRef.current = trackRef.current.scrollHeight;
    }
  }, [mode]);

  // JS-driven scroll animation (replaces CSS animation for looping + dynamic speed)
  useEffect(() => {
    if (mode !== 'credits') return;

    scrollPosRef.current = 0;
    lastFrameRef.current = 0;
    blackPauseRef.current = false;

    const animate = (time: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = time;
      const dt = Math.min((time - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = time;

      if (!blackPauseRef.current && contentHeightRef.current > 0) {
        const pxPerSec = contentHeightRef.current / BASE_DURATION;
        scrollPosRef.current -= pxPerSec * speedRef.current * dt;

        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(${scrollPosRef.current}px)`;
        }

        // End of scroll — loop with black pause
        if (scrollPosRef.current <= -contentHeightRef.current) {
          blackPauseRef.current = true;
          if (trackRef.current) trackRef.current.style.opacity = '0';

          setTimeout(() => {
            scrollPosRef.current = 0;
            if (trackRef.current) {
              trackRef.current.style.transform = 'translateY(0)';
              trackRef.current.style.opacity = '1';
            }
            // Resume scrolling after fade-in
            setTimeout(() => {
              blackPauseRef.current = false;
            }, 1500);
          }, 3000);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [mode]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  /* ── Audio helpers ── */

  const startAudio = useCallback((trackIdx: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    const track = TRACKS[trackIdx];
    if (!track) return;
    const audio = new Audio(track.file);
    audio.volume = volumeRef.current / 100;
    audio.loop = true;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, []);

  /* ── Event handlers ── */

  const handleSongSelect = useCallback(
    (trackIdx: number) => {
      setSelectedTrack(trackIdx);
      startAudio(trackIdx);
      setMode('credits');
    },
    [startAudio],
  );

  const handleTrackChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = Number(e.target.value);
      setSelectedTrack(idx);
      startAudio(idx);
    },
    [startAudio],
  );

  const handleStartAttack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setShowConfirm(false);
    setMode('attack');
  }, []);

  const handleExitAttack = useCallback(() => {
    startAudio(selectedTrack);
    setMode('credits');
  }, [selectedTrack, startAudio]);

  /* ═══════════════════════════════════════════
     Render: Song Selection
     ═══════════════════════════════════════════ */

  if (mode === 'select') {
    return (
      <div className={styles.creditsPage}>
        <div className={styles.songSelectOverlay}>
          <div className={styles.songSelectCard}>
            <div className={styles.songSelectTitle}>Choose Your Song</div>
            <div className={styles.songSelectSubtitle}>Select the music for the credits</div>
            <div className={styles.songList}>
              {TRACKS.map((t, i) => (
                <button
                  key={t.file}
                  className={`${styles.songItem} ${selectedTrack === i ? styles.songItemActive : ''}`}
                  onClick={() => setSelectedTrack(i)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button className={styles.playButton} onClick={() => handleSongSelect(selectedTrack)}>
              &#9654; Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Attack Mode
     ═══════════════════════════════════════════ */

  if (mode === 'attack') {
    return (
      <div className={styles.creditsPage}>
        <AttackGame onExit={handleExitAttack} />
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Credits Roll
     ═══════════════════════════════════════════ */

  return (
    <div className={styles.creditsPage}>
      <div className={styles.vignette} />

      {/* Controls bar */}
      <div className={styles.controlsBar}>
        <select className={styles.trackSelect} value={selectedTrack} onChange={handleTrackChange}>
          {TRACKS.map((t, i) => (
            <option key={t.file} value={i}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="range"
          className={styles.volumeSlider}
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          title={`Volume: ${volume}%`}
        />
        <div className={styles.speedGroup}>
          <span className={styles.controlsLabel}>
            Speed: {speed % 1 === 0 ? `${speed}x` : `${speed.toFixed(2)}x`}
          </span>
          <input
            type="range"
            className={styles.speedSlider}
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>
        <div className={styles.controlsRight}>
          <a href="/" className={styles.backLink}>
            Back to Desktop
          </a>
          <button className={styles.lastGoodbyeBtn} onClick={() => setShowConfirm(true)}>
            Last Goodbye
          </button>
        </div>
      </div>

      {/* Scrolling credits */}
      <div className={styles.scrollContainer}>
        <div ref={trackRef} className={styles.creditsTrack}>
          <div className={styles.openingSpace} />

          <div className={styles.mainTitle}>Danny Taylor</div>
          <div className={styles.subtitle}>Class of 2026</div>

          <div className={styles.divider} />

          {CREDITS_DATA.map((section) => (
            <div key={section.title}>
              <div className={styles.sectionTitle}>{section.title}</div>
              {section.entries.map((entry) => (
                <div key={`${section.title}-${entry.name}`}>
                  {entry.photo && (
                    <div className={styles.photoSlot}>
                      <img src={`/credits-photos/${entry.photo}`} alt={entry.name} />
                    </div>
                  )}
                  <div className={styles.name}>{entry.name}</div>
                  {entry.role && <div className={styles.role}>{entry.role}</div>}
                  {entry.needsLastName && <div className={styles.placeholder}>[INSERT LAST NAME]</div>}
                </div>
              ))}
              <div className={styles.divider} />
            </div>
          ))}

          <div className={styles.closingMessage}>Thank You</div>
          <div className={styles.closingSubtext}>To everyone who helped me get here.</div>
          <div className={styles.closingSubtext}>I couldn&apos;t have done it without you.</div>
          <div className={styles.year}>2026</div>
          <div className={styles.endSpace} />
        </div>
      </div>

      {/* Confirm dialog for Last Goodbye */}
      {showConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmText}>Are you sure? This will start a game!</div>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmYes} onClick={handleStartAttack}>
                Yes
              </button>
              <button className={styles.confirmNo} onClick={() => setShowConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
