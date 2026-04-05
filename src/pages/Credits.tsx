import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import styles from './Credits.module.css';

/* ── Available tracks (same as Music Player) ── */
const TRACKS = [
  { name: 'Kasane Teto - Machine Love', file: '/kasane_1.mp3' },
  { name: 'FMAB - Again (YUI)', file: '/fmab_1.mp3' },
  { name: 'JJK - AIZO', file: '/jjk_1.mp3' },
  { name: 'Deltarune - Paradise, Paradise', file: '/deltarune_1.mp3' },
];

/* ── Credits data ── */
interface CreditEntry {
  name: string;
  role?: string;
  photo?: string; // filename in /credits-photos/
}

interface CreditSection {
  title: string;
  entries: CreditEntry[];
}

const CREDITS_DATA: CreditSection[] = [
  {
    title: 'Family',
    entries: [
      { name: 'Mom', role: 'For everything, always' },
      { name: 'Dad', role: 'For believing in me from day one' },
      { name: 'Sarah Taylor', role: 'Best sister anyone could ask for' },
      { name: 'Grandma Jean', role: 'Unconditional love & Sunday dinners' },
      { name: 'Grandpa Robert', role: 'Teaching me to never give up' },
      { name: 'Uncle Mike', role: 'For the life advice (and the BBQ)' },
    ],
  },
  {
    title: 'Best Friends',
    entries: [
      { name: 'Alex Chen', role: 'Day one. Through everything.' },
      { name: 'Jordan Williams', role: 'Late night study sessions & bad ideas' },
      { name: 'Sam Rivera', role: 'The one who always picked up the phone' },
      { name: 'Taylor Kim', role: 'Roommate, co-conspirator, legend' },
      { name: 'Morgan Davis', role: 'For keeping me grounded' },
      { name: 'Casey Johnson', role: 'Road trips & reality checks' },
    ],
  },
  {
    title: 'The Squad',
    entries: [
      { name: 'Dylan Park' },
      { name: 'Jamie Lee' },
      { name: 'Riley Cooper' },
      { name: 'Drew Martinez' },
      { name: 'Avery Thompson' },
      { name: 'Quinn Mitchell' },
      { name: 'Blake Anderson' },
      { name: 'Reese Carter' },
    ],
  },
  {
    title: 'Professors & Mentors',
    entries: [
      { name: 'Dr. Elizabeth Warren', role: 'Computer Science Department' },
      { name: 'Prof. James Mitchell', role: 'Data Structures & Algorithms' },
      { name: 'Dr. Sarah Chen', role: 'Software Engineering' },
      { name: 'Prof. Michael Torres', role: 'Operating Systems' },
      { name: 'Dr. Amanda Foster', role: 'Capstone Advisor' },
      { name: 'Prof. David Kim', role: 'Discrete Mathematics' },
      { name: 'Dr. Rachel Green', role: 'Database Systems' },
      { name: 'Prof. Christopher Lee', role: 'Computer Networks' },
    ],
  },
  {
    title: 'Teaching Assistants',
    entries: [
      { name: 'Emily Nguyen', role: 'Made office hours actually useful' },
      { name: 'Marcus Brown', role: 'Debugged my life (and my code)' },
      { name: 'Priya Patel', role: 'Turned confusion into clarity' },
    ],
  },
  {
    title: 'Classmates & Lab Partners',
    entries: [
      { name: 'Nathan Wright' },
      { name: 'Olivia Santos' },
      { name: 'Ethan Clark' },
      { name: 'Sophia Hernandez' },
      { name: 'Lucas Martin' },
      { name: 'Mia Robinson' },
      { name: 'Benjamin Hall' },
      { name: 'Isabella Young' },
      { name: 'Daniel King' },
      { name: 'Emma Scott' },
    ],
  },
  {
    title: 'People Who Made College Bearable',
    entries: [
      { name: 'The barista at the campus coffee shop', role: 'Who remembered my order' },
      { name: 'The library security guard', role: 'Who let me stay past closing' },
      { name: 'My therapist', role: 'Seriously. Thank you.' },
      { name: 'The IT help desk crew', role: 'For not judging my questions' },
    ],
  },
  {
    title: 'Online Friends & Communities',
    entries: [
      { name: 'The Discord server' },
      { name: 'Stack Overflow contributors' },
      { name: 'That one Reddit thread from 2023' },
      { name: 'Open source maintainers everywhere' },
    ],
  },
  {
    title: 'Honorable Mentions',
    entries: [
      { name: 'Coffee', role: 'The real MVP' },
      { name: 'My laptop', role: 'For not dying during finals' },
      { name: 'Wikipedia', role: 'You know what you did' },
      { name: 'The vending machine in the CS building', role: 'Consistent. Reliable. There for me at 3 AM.' },
    ],
  },
];

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

const BASE_DURATION = 140; // seconds at 1x speed

export function Credits() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [speed, setSpeed] = useState(1);
  const [scrollEnd, setScrollEnd] = useState(-6000);

  // Measure content height synchronously before paint
  useLayoutEffect(() => {
    if (trackRef.current) {
      setScrollEnd(-(trackRef.current.scrollHeight + 100));
    }
  }, []);

  // Initialize audio on mount only
  useEffect(() => {
    const track = TRACKS[0];
    if (!track) return;
    const audio = new Audio(track.file);
    audio.volume = volume / 100;
    audio.loop = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const handleTrackChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    const wasPlaying = isPlaying;
    // Tear down old audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setSelectedTrack(idx);
    const nextTrack = TRACKS[idx];
    if (!nextTrack) return;
    // Create new audio (single source of truth — no useEffect race)
    const audio = new Audio(nextTrack.file);
    audio.volume = volume / 100;
    audio.loop = true;
    audioRef.current = audio;
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [isPlaying, volume]);

  const duration = BASE_DURATION / speed;

  return (
    <div className={styles.creditsPage}>
      {/* Vignette overlay */}
      <div className={styles.vignette} />

      {/* Top controls */}
      <div className={styles.controlsBar}>
        <span className={styles.controlsLabel}>Music:</span>
        <select
          className={styles.trackSelect}
          value={selectedTrack}
          onChange={handleTrackChange}
        >
          {TRACKS.map((t, i) => (
            <option key={t.file} value={i}>{t.name}</option>
          ))}
        </select>
        <button className={styles.playBtn} onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          className={styles.volumeSlider}
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <div className={styles.speedControls}>
          <span className={styles.controlsLabel}>Speed:</span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.speedBtn} ${speed === opt.value ? styles.speedBtnActive : ''}`}
              onClick={() => setSpeed(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <a href="/" className={styles.backLink}>Back to Desktop</a>
      </div>

      {/* Scrolling credits */}
      <div className={styles.scrollContainer}>
        <div
          ref={trackRef}
          className={`${styles.creditsTrack} ${isPlaying ? styles.playing : ''}`}
          style={{
            '--scroll-duration': `${duration}s`,
            '--scroll-end': `${scrollEnd}px`,
          } as React.CSSProperties}
        >
          <div className={styles.openingSpace} />

          <div className={styles.mainTitle}>Danny Taylor</div>
          <div className={styles.subtitle}>Class of 2026</div>

          <div className={styles.divider} />

          <div className={styles.quote}>
            &ldquo;We do not remember days, we remember moments.&rdquo;
            <div className={styles.quoteAttribution}>&mdash; Cesare Pavese</div>
          </div>

          <div className={styles.divider} />

          {CREDITS_DATA.map((section) => (
            <div key={section.title}>
              <div className={styles.sectionTitle}>{section.title}</div>
              {section.entries.map((entry) => (
                <div key={entry.name}>
                  {entry.photo && (
                    <div className={styles.photoSlot}>
                      <img src={`/credits-photos/${entry.photo}`} alt={entry.name} />
                    </div>
                  )}
                  <div className={styles.name}>{entry.name}</div>
                  {entry.role && <div className={styles.role}>{entry.role}</div>}
                </div>
              ))}
              <div className={styles.divider} />
            </div>
          ))}

          <div className={styles.quote}>
            &ldquo;The tassel was worth the hassle.&rdquo;
          </div>

          <div className={styles.divider} />

          <div className={styles.closingMessage}>Thank You</div>
          <div className={styles.closingSubtext}>
            To everyone who helped me get here.
          </div>
          <div className={styles.closingSubtext}>
            I couldn&apos;t have done it without you.
          </div>

          <div className={styles.year}>2026</div>

          <div className={styles.endSpace} />
        </div>
      </div>
    </div>
  );
}
