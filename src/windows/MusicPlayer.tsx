import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Types ─── */
interface PresetTrack {
  name: string;
  file: string;
  art?: string;
}

interface LoadedTrack {
  name: string;
  url: string;
  duration: number;
  art?: string;
}

// Preset tracks - populate later with actual audio files
const PRESET_TRACKS: PresetTrack[] = [
  { name: 'Kasane Teto - Machine Love', file: '/kasane_1.mp3', art: '/art/kasane.png' },
  { name: 'FMAB - Again (YUI)', file: '/fmab_1.mp3', art: '/art/fmab.png' },
  { name: 'JJK - AIZO', file: '/jjk_1.mp3', art: '/art/jjk.png' },
  { name: 'Deltarune - Paradise, Paradise', file: '/deltarune_1.mp3', art: '/art/deltarune.png' },
];

type MusicPlayerTab = 'Player' | 'Composer';

/* ─── Win95 style constants ─── */
const gray = 'var(--win-gray, #c0c0c0)';
const darkGray = 'var(--win-dark, #808080)';
const white = 'var(--win-white, #ffffff)';
const black = 'var(--win-black, #000000)';

const sunken: React.CSSProperties = {
  borderTop: `1px solid ${darkGray}`,
  borderLeft: `1px solid ${darkGray}`,
  borderBottom: `1px solid ${white}`,
  borderRight: `1px solid ${white}`,
};

const raised: React.CSSProperties = {
  borderTop: `1px solid ${white}`,
  borderLeft: `1px solid ${white}`,
  borderBottom: `1px solid ${darkGray}`,
  borderRight: `1px solid ${darkGray}`,
};

const btnStyle: React.CSSProperties = {
  ...raised,
  background: gray,
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  padding: '3px 8px',
  cursor: 'default',
  color: black,
  minWidth: 28,
  textAlign: 'center',
  outline: 'none',
  whiteSpace: 'nowrap',
};

const btnActiveStyle: React.CSSProperties = {
  ...sunken,
  background: gray,
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ════════════════════════════════════════════════════════════
   Player Mode
   ════════════════════════════════════════════════════════════ */
function PlayerMode() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<LoadedTrack[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Stop audio on unmount (window close)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Load preset tracks on mount
  useEffect(() => {
    if (PRESET_TRACKS.length > 0) {
      const presets: LoadedTrack[] = PRESET_TRACKS.map((p) => ({
        name: p.name,
        url: p.file,
        duration: 0,
        art: p.art,
      }));
      setTracks(presets);
    }
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Time update interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setDuration(audioRef.current.duration);
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const playTrack = useCallback((idx: number) => {
    if (idx < 0 || idx >= tracks.length) return;
    setCurrentTrackIdx(idx);
    const track = tracks[idx]!;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(track.url);
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      // Update track duration
      setTracks((prev) => prev.map((t, i) => i === idx ? { ...t, duration: audio.duration } : t));
    });

    audio.addEventListener('ended', () => {
      // Auto next
      if (idx + 1 < tracks.length) {
        playTrack(idx + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, volume]);

  const handlePlayPause = () => {
    if (!audioRef.current || currentTrackIdx < 0) {
      if (tracks.length > 0) {
        playTrack(0);
      }
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    if (currentTrackIdx > 0) {
      playTrack(currentTrackIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentTrackIdx < tracks.length - 1) {
      playTrack(currentTrackIdx + 1);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks: LoadedTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const url = URL.createObjectURL(file);
      newTracks.push({
        name: file.name.replace(/\.[^.]+$/, ''),
        url,
        duration: 0,
      });
    }
    setTracks((prev) => [...prev, ...newTracks]);
    if (e.target) e.target.value = '';
  };

  const currentTrack = currentTrackIdx >= 0 ? tracks[currentTrackIdx] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* ─── Now Playing Display ─── */}
      <div style={{
        ...sunken,
        background: '#000',
        padding: '6px 8px',
        margin: '4px 6px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        minHeight: 56,
      }}>
        {/* Album Art */}
        <div style={{
          width: 48,
          height: 48,
          ...sunken,
          background: '#1a1a1a',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {currentTrack?.art ? (
            <img
              src={currentTrack.art}
              alt="Album art"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
          ) : (
            <span style={{ color: '#333', fontSize: 20 }}>{'\u266A'}</span>
          )}
        </div>
        {/* Track info */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            color: '#00ff00',
            fontFamily: 'var(--font-terminal, monospace)',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 2,
          }}>
            {currentTrack ? currentTrack.name : 'No track loaded'}
          </div>
          <div style={{ fontSize: 10, color: '#00cc00', fontFamily: 'var(--font-terminal, monospace)' }}>
            {currentTrack
              ? `${formatTime(currentTime)} / ${formatTime(duration)}`
              : '--:-- / --:--'
            }
            {isPlaying && ' \u25B6'}
            {!isPlaying && currentTrack && ' \u275A\u275A'}
          </div>
        </div>
      </div>

      {/* ─── Progress Bar ─── */}
      <div style={{ padding: '2px 6px' }}>
        <div
          ref={progressRef}
          onClick={handleSeek}
          style={{
            ...sunken,
            height: 14,
            background: white,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: duration ? `${(currentTime / duration) * 100}%` : '0%',
            background: 'var(--win-navy, #000080)',
            transition: 'width 0.2s linear',
          }} />
        </div>
      </div>

      {/* ─── Transport Controls ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px 6px',
      }}>
        <button style={btnStyle} onClick={handlePrev} title="Previous">
          &#9198;
        </button>
        <button
          style={{ ...btnStyle, minWidth: 36, fontWeight: 'bold' }}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '\u275A\u275A' : '\u25B6'}
        </button>
        <button style={btnStyle} onClick={handleStop} title="Stop">
          &#9632;
        </button>
        <button style={btnStyle} onClick={handleNext} title="Next">
          &#9197;
        </button>

        <div style={{ width: 8 }} />

        {/* Volume */}
        <span style={{ fontSize: 10, color: black, fontFamily: 'var(--font-system)' }}>
          Vol:
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: 70, accentColor: darkGray }}
        />
        <span style={{ fontSize: 10, color: black, fontFamily: 'var(--font-system)', minWidth: 24 }}>
          {volume}%
        </span>
      </div>

      {/* ─── Load Files Button ─── */}
      <div style={{ padding: '2px 6px' }}>
        <button
          style={{ ...btnStyle, width: '100%' }}
          onClick={() => fileInputRef.current?.click()}
        >
          Open Audio Files...
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.flac,.m4a"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileLoad}
        />
      </div>

      {/* ─── Track List ─── */}
      <div style={{
        ...sunken,
        flex: 1,
        margin: '4px 6px 6px',
        background: white,
        overflow: 'auto',
        minHeight: 0,
      }}>
        {tracks.length === 0 ? (
          <div style={{
            padding: 16,
            textAlign: 'center',
            color: darkGray,
            fontFamily: 'var(--font-system)',
            fontSize: 11,
          }}>
            No tracks loaded.{'\n'}Click "Open Audio Files..." to add music.
          </div>
        ) : (
          tracks.map((track, idx) => (
            <div
              key={idx}
              onDoubleClick={() => playTrack(idx)}
              style={{
                padding: '2px 6px',
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                color: currentTrackIdx === idx ? white : black,
                background: currentTrackIdx === idx ? 'var(--win-navy, #000080)' : 'transparent',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: '#1a1a1a',
                  borderRadius: 1,
                }}>
                  {track.art ? (
                    <img
                      src={track.art}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      draggable={false}
                    />
                  ) : (
                    <span style={{ color: '#666', fontSize: 10 }}>{'\u266A'}</span>
                  )}
                </span>
                {currentTrackIdx === idx && isPlaying ? '\u25B6 ' : ''}
                {idx + 1}. {track.name}
              </span>
              <span style={{ marginLeft: 8, flexShrink: 0, color: currentTrackIdx === idx ? '#aaaaff' : darkGray }}>
                {track.duration > 0 ? formatTime(track.duration) : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Composer Mode - Step Sequencer / Drum Machine
   ════════════════════════════════════════════════════════════ */

interface Instrument {
  name: string;
  color: string;
  synth: (ctx: AudioContext, time: number) => void;
}

function createInstruments(): Instrument[] {
  return [
    {
      name: 'Kick',
      color: '#cc3333',
      synth: (ctx, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
      },
    },
    {
      name: 'Snare',
      color: '#cc9933',
      synth: (ctx, time) => {
        // Noise burst for snare
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        // Tonal component
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
        oscGain.gain.setValueAtTime(0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        noise.start(time);
        osc.start(time);
        osc.stop(time + 0.15);
      },
    },
    {
      name: 'HiHat',
      color: '#33cc33',
      synth: (ctx, time) => {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        // Highpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(time);
      },
    },
    {
      name: 'Clap',
      color: '#cc33cc',
      synth: (ctx, time) => {
        // Multiple short noise bursts
        for (let i = 0; i < 3; i++) {
          const offset = i * 0.01;
          const bufferSize = ctx.sampleRate * 0.02;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let j = 0; j < bufferSize; j++) {
            data[j] = (Math.random() * 2 - 1);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2000;
          filter.Q.value = 0.5;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.6, time + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.08);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(time + offset);
        }
      },
    },
    {
      name: 'Bass',
      color: '#3366cc',
      synth: (ctx, time) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);
        osc.frequency.setValueAtTime(55, time);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      },
    },
    {
      name: 'Lead',
      color: '#33cccc',
      synth: (ctx, time) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.15);
      },
    },
    {
      name: 'Perc',
      color: '#cccc33',
      synth: (ctx, time) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.05);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.08);
      },
    },
    {
      name: 'Tom',
      color: '#cc6633',
      synth: (ctx, time) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(250, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.2);
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      },
    },
  ];
}

const STEPS = 16;

function ComposerMode() {
  const [instruments] = useState(createInstruments);
  const [grid, setGrid] = useState<boolean[][]>(
    () => instruments.map(() => new Array(STEPS).fill(false) as boolean[])
  );
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Keep bpmRef in sync
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const toggleCell = (row: number, col: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row]![col] = !next[row]![col];
      return next;
    });
  };

  const clearGrid = () => {
    setGrid(instruments.map(() => new Array(STEPS).fill(false) as boolean[]));
  };

  const startPlayback = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stepRef.current = 0;
    setIsPlaying(true);

    const tick = () => {
      const stepInterval = (60 / bpmRef.current / 4) * 1000; // 16th notes
      const step = stepRef.current;
      setCurrentStep(step);

      const currentGrid = gridRef.current;
      for (let row = 0; row < instruments.length; row++) {
        if (currentGrid[row]![step]) {
          instruments[row]!.synth(ctx, ctx.currentTime);
        }
      }

      stepRef.current = (step + 1) % STEPS;
      timerRef.current = window.setTimeout(tick, stepInterval);
    };

    tick();
  }, [instruments]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* ─── Composer Controls ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 6px',
        background: gray,
        borderBottom: `1px solid ${darkGray}`,
        flexShrink: 0,
      }}>
        <button
          style={{ ...btnStyle, minWidth: 36, fontWeight: 'bold', ...(isPlaying ? btnActiveStyle : {}) }}
          onClick={isPlaying ? stopPlayback : startPlayback}
        >
          {isPlaying ? '\u25A0 Stop' : '\u25B6 Play'}
        </button>
        <button style={btnStyle} onClick={clearGrid}>
          Clear
        </button>

        <div style={{ width: 8 }} />

        <span style={{ fontSize: 10, color: black, fontFamily: 'var(--font-system)' }}>
          BPM:
        </span>
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ width: 70, accentColor: darkGray }}
        />
        <span style={{ fontSize: 10, color: black, fontFamily: 'var(--font-system)', minWidth: 24 }}>
          {bpm}
        </span>
      </div>

      {/* ─── Step Sequencer Grid ─── */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '4px 6px 6px',
        minHeight: 0,
      }}>
        {/* Step numbers header */}
        <div style={{ display: 'flex', marginBottom: 2, paddingLeft: 46 }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                width: 22,
                height: 14,
                fontSize: 8,
                fontFamily: 'var(--font-system)',
                color: darkGray,
                textAlign: 'center',
                lineHeight: '14px',
                flexShrink: 0,
                fontWeight: i % 4 === 0 ? 'bold' : 'normal',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Instrument rows */}
        {instruments.map((inst, row) => (
          <div key={inst.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            {/* Instrument label */}
            <div style={{
              width: 42,
              fontSize: 9,
              fontFamily: 'var(--font-system)',
              color: black,
              textAlign: 'right',
              paddingRight: 4,
              flexShrink: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
              {inst.name}
            </div>

            {/* Step cells */}
            {Array.from({ length: STEPS }, (_, col) => {
              const active = grid[row]![col];
              const isCurrent = col === currentStep && isPlaying;
              const isBeatBoundary = col % 4 === 0;

              return (
                <div
                  key={col}
                  onClick={() => toggleCell(row, col)}
                  style={{
                    width: 20,
                    height: 18,
                    margin: '0 1px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    background: active
                      ? inst.color
                      : isCurrent
                        ? '#e0e0a0'
                        : isBeatBoundary
                          ? '#d8d8d8'
                          : '#ececec',
                    border: isCurrent
                      ? '2px solid #ffcc00'
                      : active
                        ? `1px solid ${darkGray}`
                        : '1px solid #b0b0b0',
                    boxShadow: active && isCurrent ? '0 0 4px #ffcc00' : 'none',
                    borderRadius: 1,
                    transition: 'background 0.05s',
                  }}
                />
              );
            })}
          </div>
        ))}

        {/* Beat markers */}
        <div style={{ display: 'flex', marginTop: 4, paddingLeft: 46 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 22 * 4,
                textAlign: 'center',
                fontSize: 8,
                fontFamily: 'var(--font-system)',
                color: darkGray,
                borderLeft: `1px solid ${darkGray}`,
              }}
            >
              Beat {i + 1}
            </div>
          ))}
        </div>

        {/* Pattern presets */}
        <div style={{
          marginTop: 8,
          padding: '4px 0',
          borderTop: `1px solid ${darkGray}`,
        }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-system)', color: black }}>
            Patterns:
          </span>
          <div style={{ display: 'flex', gap: 2, marginTop: 4, flexWrap: 'wrap' }}>
            <button style={btnStyle} onClick={() => {
              // Basic 4-on-the-floor
              const newGrid = instruments.map(() => new Array(STEPS).fill(false) as boolean[]);
              // Kick on every beat
              [0, 4, 8, 12].forEach((s) => { newGrid[0]![s] = true; });
              // Snare on 2 and 4
              [4, 12].forEach((s) => { newGrid[1]![s] = true; });
              // Hi-hat on every other step
              [0, 2, 4, 6, 8, 10, 12, 14].forEach((s) => { newGrid[2]![s] = true; });
              setGrid(newGrid);
            }}>
              4/4 Rock
            </button>
            <button style={btnStyle} onClick={() => {
              const newGrid = instruments.map(() => new Array(STEPS).fill(false) as boolean[]);
              // Kick
              [0, 6, 8, 14].forEach((s) => { newGrid[0]![s] = true; });
              // Snare
              [4, 12].forEach((s) => { newGrid[1]![s] = true; });
              // Hi-hat all 8ths
              [0, 2, 4, 6, 8, 10, 12, 14].forEach((s) => { newGrid[2]![s] = true; });
              // Clap
              [4, 12].forEach((s) => { newGrid[3]![s] = true; });
              // Bass
              [0, 0, 6, 8].forEach((s) => { newGrid[4]![s] = true; });
              setGrid(newGrid);
            }}>
              Hip-Hop
            </button>
            <button style={btnStyle} onClick={() => {
              const newGrid = instruments.map(() => new Array(STEPS).fill(false) as boolean[]);
              // Kick
              [0, 3, 6, 9, 12, 15].forEach((s) => { newGrid[0]![s] = true; });
              // Hi-hat all 16ths
              for (let s = 0; s < 16; s++) newGrid[2]![s] = true;
              // Snare
              [4, 12].forEach((s) => { newGrid[1]![s] = true; });
              // Clap
              [2, 8, 14].forEach((s) => { newGrid[3]![s] = true; });
              // Lead
              [0, 4, 7, 8, 12].forEach((s) => { newGrid[5]![s] = true; });
              setGrid(newGrid);
            }}>
              Techno
            </button>
            <button style={btnStyle} onClick={() => {
              const newGrid = instruments.map(() => new Array(STEPS).fill(false) as boolean[]);
              // Kick on 1 and 3
              [0, 8].forEach((s) => { newGrid[0]![s] = true; });
              // Snare on 2 and 4
              [4, 12].forEach((s) => { newGrid[1]![s] = true; });
              // Hi-hat offbeats
              [2, 6, 10, 14].forEach((s) => { newGrid[2]![s] = true; });
              // Bass
              [0, 3, 8, 11].forEach((s) => { newGrid[4]![s] = true; });
              // Perc
              [1, 5, 9, 13].forEach((s) => { newGrid[6]![s] = true; });
              setGrid(newGrid);
            }}>
              Reggae
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Main MusicPlayer Component
   ════════════════════════════════════════════════════════════ */

export function MusicPlayer() {
  const [activeTab, setActiveTab] = useState<MusicPlayerTab>('Player');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: gray,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-system)',
      fontSize: 11,
      overflow: 'hidden',
    }}>
      {/* ─── Tab Bar ─── */}
      <div style={{
        display: 'flex',
        padding: '4px 4px 0',
        background: gray,
        borderBottom: `1px solid ${black}`,
        flexShrink: 0,
      }}>
        {(['Player', 'Composer'] as MusicPlayerTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '3px 14px',
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              background: activeTab === tab ? white : gray,
              border: `1px solid ${darkGray}`,
              borderBottom: activeTab === tab ? `1px solid ${white}` : 'none',
              borderRadius: '3px 3px 0 0',
              marginRight: 2,
              cursor: 'pointer',
              position: 'relative',
              top: 1,
              color: black,
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              outline: 'none',
            }}
          >
            {tab === 'Player' ? '\u266B Player' : '\u266C Composer'}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {activeTab === 'Player' ? <PlayerMode /> : <ComposerMode />}
      </div>

      {/* ─── Status Bar ─── */}
      <div style={{
        height: 18,
        background: gray,
        borderTop: `1px solid ${darkGray}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        fontSize: 10,
        color: darkGray,
        flexShrink: 0,
      }}>
        <span>DannyOS Music Player v1.0</span>
        <span style={{ marginLeft: 'auto' }}>
          {activeTab === 'Player' ? 'Play Mode' : 'Composer Mode'}
        </span>
      </div>
    </div>
  );
}
