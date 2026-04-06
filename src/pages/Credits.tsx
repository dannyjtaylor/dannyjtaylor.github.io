import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import styles from './Credits.module.css';

/* ── Available tracks (same as Music Player) ── */
const TRACKS = [
  { name: 'Kasane Teto - Machine Love', file: '/kasane_1.mp3' },
  { name: 'FMAB - Again (YUI)', file: '/fmab_1.mp3' },
  { name: 'JJK - AIZO', file: '/jjk_1.mp3' },
  { name: 'Deltarune - Paradise, Paradise', file: '/deltarune_1.mp3' },
  { name: 'I Wish That I Could Fall', file: '/iwishthaticouldfall.mp3' },
];

/* ── Credits data ── */
interface CreditEntry {
  name: string;
  role?: string;
  photo?: string; // filename in /credits-photos/
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
    entries: [
      { name: 'Paul Patullo' },
    ],
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

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

const BASE_DURATION = 180; // seconds at 1x speed (more content now)

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
          {isPlaying ? '\u23F8' : '\u25B6'}
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
                  {entry.needsLastName && (
                    <div className={styles.placeholder}>[INSERT LAST NAME]</div>
                  )}
                </div>
              ))}
              <div className={styles.divider} />
            </div>
          ))}

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
