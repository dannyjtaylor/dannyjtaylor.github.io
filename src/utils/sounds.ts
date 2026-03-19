// Centralized sound effects for DannyOS
// Uses HTMLAudioElement for MP3 playback, Web Audio API for synthesized sounds

let _audioCtx: AudioContext | null = null;
function actx(): AudioContext {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
}

function tone(freq: number, dur: number, vol = 0.06, type: OscillatorType = 'square') {
  try {
    const c = actx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.frequency.value = freq;
    osc.type = type;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch { /* silent */ }
}

function noiseBurst(dur: number, lpFreq: number, vol = 0.05) {
  try {
    const c = actx();
    const len = Math.max(1, Math.round(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
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

// Preloaded audio cache
const audioCache: Record<string, HTMLAudioElement> = {};
export function playMP3(path: string, volume = 0.3) {
  try {
    let audio = audioCache[path];
    if (!audio) {
      audio = new Audio(path);
      audioCache[path] = audio;
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch { /* silent */ }
}

export const Sounds = {
  // Windows 95 UI sounds (synthesized)
  click: () => tone(800, 0.05, 0.04),
  doubleClick: () => { tone(800, 0.04, 0.04); setTimeout(() => tone(1000, 0.04, 0.04), 60); },
  menuOpen: () => tone(600, 0.08, 0.03, 'triangle'),
  menuClose: () => tone(400, 0.06, 0.03, 'triangle'),
  windowOpen: () => { tone(400, 0.08, 0.03, 'triangle'); setTimeout(() => tone(600, 0.08, 0.03, 'triangle'), 80); },
  windowClose: () => { tone(500, 0.08, 0.03, 'triangle'); setTimeout(() => tone(300, 0.08, 0.03, 'triangle'), 80); },
  minimize: () => tone(500, 0.1, 0.03, 'triangle'),
  maximize: () => { tone(400, 0.06, 0.03, 'triangle'); setTimeout(() => tone(600, 0.06, 0.03, 'triangle'), 60); },
  error: () => { tone(300, 0.15, 0.06); setTimeout(() => tone(200, 0.2, 0.06), 150); },
  notify: () => { tone(800, 0.1, 0.04, 'sine'); setTimeout(() => tone(1000, 0.1, 0.04, 'sine'), 120); },
  recycle: () => noiseBurst(0.15, 1200, 0.04),

  // AOL-specific sounds
  aolDialup: () => {
    // Simulate modem handshake sounds
    tone(1000, 0.3, 0.04, 'sine');
    setTimeout(() => tone(2000, 0.2, 0.04, 'sine'), 300);
    setTimeout(() => noiseBurst(0.5, 3000, 0.03), 500);
    setTimeout(() => tone(1400, 0.15, 0.04, 'sine'), 1000);
    setTimeout(() => tone(2100, 0.15, 0.04, 'sine'), 1150);
  },
  aolWelcome: () => {
    // "Welcome" chime - ascending notes
    tone(523, 0.15, 0.05, 'sine'); // C5
    setTimeout(() => tone(659, 0.15, 0.05, 'sine'), 150); // E5
    setTimeout(() => tone(784, 0.2, 0.05, 'sine'), 300); // G5
    setTimeout(() => tone(1047, 0.3, 0.06, 'sine'), 450); // C6
  },
  aolYouveGotMail: () => {
    // Classic "You've Got Mail" ascending pattern
    tone(440, 0.12, 0.05, 'sine');
    setTimeout(() => tone(554, 0.12, 0.05, 'sine'), 140);
    setTimeout(() => tone(659, 0.15, 0.05, 'sine'), 280);
    setTimeout(() => tone(880, 0.25, 0.06, 'sine'), 420);
  },
  aolDoorOpen: () => {
    // Buddy sign on sound - quick ascending
    tone(600, 0.08, 0.04, 'sine');
    setTimeout(() => tone(800, 0.08, 0.04, 'sine'), 80);
    setTimeout(() => tone(1000, 0.1, 0.04, 'sine'), 160);
  },
  aolDoorClose: () => {
    // Buddy sign off - descending
    tone(1000, 0.08, 0.04, 'sine');
    setTimeout(() => tone(800, 0.08, 0.04, 'sine'), 80);
    setTimeout(() => tone(600, 0.1, 0.04, 'sine'), 160);
  },
  aolMessageSend: () => tone(880, 0.08, 0.04, 'sine'),
  aolMessageReceive: () => {
    tone(660, 0.06, 0.04, 'sine');
    setTimeout(() => tone(880, 0.08, 0.04, 'sine'), 70);
  },

  // Shutdown sound
  shutdown: () => {
    tone(784, 0.2, 0.05, 'triangle'); // G5
    setTimeout(() => tone(659, 0.2, 0.05, 'triangle'), 200); // E5
    setTimeout(() => tone(523, 0.2, 0.05, 'triangle'), 400); // C5
    setTimeout(() => tone(392, 0.4, 0.05, 'triangle'), 600); // G4
  },

  // Startup chime — layered, ambient, Windows 95-inspired (Brian Eno style)
  startup: () => {
    const vol = 0.045;
    // Layer 1: Warm foundation chord (C major) — sine waves for smooth pad feel
    tone(262, 2.5, vol, 'sine');       // C4
    tone(330, 2.5, vol * 0.8, 'sine'); // E4
    tone(392, 2.5, vol * 0.7, 'sine'); // G4

    // Layer 2: Higher octave shimmer, slightly delayed for swell effect
    setTimeout(() => {
      tone(523, 2.0, vol * 0.6, 'sine');     // C5
      tone(659, 2.0, vol * 0.5, 'sine');     // E5
      tone(784, 2.0, vol * 0.45, 'sine');    // G5
    }, 200);

    // Layer 3: Triangle wave warmth — adds body and texture
    setTimeout(() => {
      tone(262, 2.0, vol * 0.5, 'triangle');  // C4
      tone(392, 2.0, vol * 0.4, 'triangle');  // G4
      tone(523, 1.8, vol * 0.35, 'triangle'); // C5
    }, 350);

    // Layer 4: Gentle melodic rise — the "hopeful" motif
    setTimeout(() => tone(659, 1.2, vol * 0.5, 'sine'), 600);   // E5
    setTimeout(() => tone(784, 1.0, vol * 0.5, 'sine'), 900);   // G5
    setTimeout(() => tone(1047, 1.5, vol * 0.4, 'sine'), 1200); // C6

    // Layer 5: Soft high sparkle for air and space
    setTimeout(() => tone(1568, 1.2, vol * 0.2, 'sine'), 800);  // G6
    setTimeout(() => tone(2093, 1.0, vol * 0.15, 'sine'), 1100); // C7

    // Layer 6: Final resolving chord swell
    setTimeout(() => {
      tone(523, 1.8, vol * 0.4, 'sine');     // C5
      tone(659, 1.8, vol * 0.35, 'sine');    // E5
      tone(784, 1.8, vol * 0.3, 'sine');     // G5
      tone(1047, 1.5, vol * 0.25, 'sine');   // C6
    }, 1400);
  },
};
