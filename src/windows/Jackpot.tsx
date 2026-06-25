import { useReducer, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GameState, Action, PhaseId, AtmVisualState, ToolChoices } from './jackpot/types';
import { PHASE_LINES, CONTINUATIONS, CHOICES, ATM_INITIAL, NARRATIVES } from './jackpot/phaseData';
import { AtmSvg } from './jackpot/AtmSvg';
import { TerminalPanel } from './jackpot/TerminalPanel';
import { AlarmOverlay } from './jackpot/AlarmOverlay';
import { Sounds } from './jackpot/sound';

/* ── Initial state ── */

const INITIAL_CHOICES: ToolChoices = {
  panelAccess: null,
  ethernet: null,
  alarmSensor: null,
  installMethod: null,
};

function makeInitialState(): GameState {
  return {
    phase: 1,
    effectiveLines: PHASE_LINES[1]!,
    revealedLines: 0,
    charIndex: 0,
    waitingForChoice: null,
    choices: { ...INITIAL_CHOICES },
    siemDelayed: false,
    alarm: null,
    atm: { ...ATM_INITIAL },
    cashAmount: 0,
    jackpotComplete: false,
  };
}

/* ── ATM state helpers ── */

function atmForPhase(phase: PhaseId, prev: AtmVisualState): AtmVisualState {
  switch (phase) {
    case 4: return { ...prev, driveState: 'reinstalled', panelOpen: false, showLaptop: false, screenMode: 'reboot' };
    case 5: return { ...prev, screenMode: 'ploutus', showExtKeyboard: true, showMule: true };
    case 6: return { ...prev, screenMode: 'jackpot', dispensing: true, showCassetteCutaway: true };
    default: return prev;
  }
}

function applyChoiceToAtm(atm: AtmVisualState, choiceId: string, key: string): AtmVisualState {
  if (choiceId === 'panel-access') return { ...atm, panelOpen: true };
  if (choiceId === 'ethernet') {
    if (key === '1') return { ...atm, ethState: 'loopback' };
    if (key === '2') return { ...atm, ethState: 'cut' };
    return { ...atm, ethState: 'intact' };
  }
  if (choiceId === 'install-method') {
    if (key === '1') return { ...atm, driveState: 'removed', showLaptop: true };
    if (key === '2') return { ...atm, showLaptop: true };
    if (key === '3') return { ...atm, showBlackbox: true };
  }
  return atm;
}

function updateChoices(choices: ToolChoices, choiceId: string, key: string): ToolChoices {
  switch (choiceId) {
    case 'panel-access': return { ...choices, panelAccess: key === '1' ? 'tbar' : 'social' };
    case 'ethernet': return { ...choices, ethernet: key === '1' ? 'loopback' : key === '2' ? 'cut' : 'live' };
    case 'alarm-sensor': return { ...choices, alarmSensor: 'clamp' };
    case 'install-method': return { ...choices, installMethod: key === '1' ? 'hdd' : key === '2' ? 'usb' : 'blackbox' };
    default: return choices;
  }
}

/* ── Reducer ── */

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'CHAR_TICK': {
      if (state.alarm || state.waitingForChoice) return state;
      const line = state.effectiveLines[state.revealedLines];
      if (!line || line.t === 'blank' || line.t === 'banner' || line.t === 'choice') return state;
      if (state.charIndex >= line.text.length) return state;
      return { ...state, charIndex: state.charIndex + 1 };
    }

    case 'LINE_ADVANCE': {
      if (state.alarm || state.waitingForChoice) return state;
      const line = state.effectiveLines[state.revealedLines];
      if (!line) return state;
      if (line.t === 'blank' || line.t === 'banner') {
        return { ...state, revealedLines: state.revealedLines + 1, charIndex: 0 };
      }
      if (line.t === 'choice') {
        return { ...state, revealedLines: state.revealedLines + 1, charIndex: 0, waitingForChoice: line.id };
      }
      if (state.charIndex >= line.text.length) {
        return { ...state, revealedLines: state.revealedLines + 1, charIndex: 0 };
      }
      return state;
    }

    case 'SPACE': {
      if (state.alarm || state.waitingForChoice || state.jackpotComplete) return state;
      const line = state.effectiveLines[state.revealedLines];
      // Mid-line typing: skip to end
      if (line && line.t !== 'blank' && line.t !== 'banner' && line.t !== 'choice' && state.charIndex < line.text.length) {
        return { ...state, charIndex: line.text.length };
      }
      // All lines shown: advance phase
      if (!line) {
        const isBlackbox = state.choices.installMethod === 'blackbox';
        const nextPhase = (isBlackbox && state.phase === 3) ? 6 : (state.phase + 1) as PhaseId;
        if (nextPhase > 6) return state;
        // Delayed SIEM fires on entering phase 5
        if (nextPhase === 5 && state.siemDelayed) {
          return { ...state, alarm: { active: true, reason: 'Buffered logs flushed to bank SIEM when cable reconnected — police dispatched' } };
        }
        const newAtm = atmForPhase(nextPhase, state.atm);
        return { ...state, phase: nextPhase, effectiveLines: PHASE_LINES[nextPhase]!, revealedLines: 0, charIndex: 0, waitingForChoice: null, atm: newAtm };
      }
      return state;
    }

    case 'CHOOSE': {
      if (!state.waitingForChoice) return state;
      const choiceId = state.waitingForChoice;
      const cfg = CHOICES[choiceId];
      const option = cfg.options.find(o => o.key === action.key);
      if (!option) return state;

      if (option.outcome === 'wrong') {
        return { ...state, alarm: { active: true, reason: option.wrongReason ?? 'Operation detected' }, waitingForChoice: null };
      }

      const contKey = `${choiceId}:${action.key}`;
      const contLines = CONTINUATIONS[contKey] ?? [];
      const insertAt = state.revealedLines;
      const newLines = [
        ...state.effectiveLines.slice(0, insertAt),
        ...contLines,
        ...state.effectiveLines.slice(insertAt),
      ];

      const newChoices = updateChoices(state.choices, choiceId, action.key);
      const newAtm = applyChoiceToAtm(state.atm, choiceId, action.key);
      const newSiemDelayed = state.siemDelayed || (choiceId === 'ethernet' && action.key === '2');

      return { ...state, choices: newChoices, waitingForChoice: null, effectiveLines: newLines, atm: newAtm, siemDelayed: newSiemDelayed };
    }

    case 'CASH_TICK': {
      if (state.phase !== 6 || state.jackpotComplete) return state;
      const next = Math.min(state.cashAmount + 2500, 212000);
      return { ...state, cashAmount: next };
    }

    case 'JACKPOT_COMPLETE':
      return { ...state, jackpotComplete: true };

    case 'DISMISS_ALARM': {
      // Find last choice line index so the user can re-select
      const lastChoiceIdx = state.effectiveLines.reduce((acc, l, i) => l.t === 'choice' ? i : acc, -1);
      const resetTo = lastChoiceIdx >= 0 ? lastChoiceIdx : Math.max(0, state.revealedLines - 1);
      return { ...state, alarm: null, revealedLines: resetTo, charIndex: 0, waitingForChoice: null };
    }

    case 'RESET':
      return makeInitialState();

    default:
      return state;
  }
}

/* ── Component ── */

const PHASE_LABELS = ['RECON', 'BREACH', 'INSTALL', 'PERSIST', 'ACTIVATE', 'JACKPOT'];

export function Jackpot() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);
  const cashTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Type-on effect */
  useEffect(() => {
    if (state.alarm || state.waitingForChoice || state.jackpotComplete) return;
    const line = state.effectiveLines[state.revealedLines];
    if (!line) return;

    // Instant lines: auto-advance
    if (line.t === 'blank' || line.t === 'banner' || line.t === 'choice') {
      const t = setTimeout(() => dispatch({ type: 'LINE_ADVANCE' }), line.t === 'blank' ? 60 : 0);
      return () => clearTimeout(t);
    }

    const text = line.text;

    // Line fully typed
    if (state.charIndex >= text.length) {
      // Output lines auto-advance; cmd lines wait for SPACE
      if (line.t === 'out') {
        const t = setTimeout(() => dispatch({ type: 'LINE_ADVANCE' }), 80);
        return () => clearTimeout(t);
      }
      return;
    }

    // Type next char
    const speed = line.t === 'cmd' ? 32 : 10;
    const t = setTimeout(() => {
      if (state.charIndex % 4 === 0) Sounds.keypress();
      dispatch({ type: 'CHAR_TICK' });
    }, speed);
    return () => clearTimeout(t);
  }, [state.revealedLines, state.charIndex, state.alarm, state.waitingForChoice, state.jackpotComplete, state.effectiveLines]);

  /* Cash counter */
  useEffect(() => {
    if (state.phase === 6 && !state.jackpotComplete && !state.alarm) {
      cashTickRef.current = setInterval(() => {
        dispatch({ type: 'CASH_TICK' });
        Sounds.cashClick();
      }, 60);
    }
    return () => { if (cashTickRef.current) clearInterval(cashTickRef.current); };
  }, [state.phase, state.jackpotComplete, state.alarm]);

  /* Jackpot complete trigger */
  useEffect(() => {
    if (state.cashAmount >= 212000 && !state.jackpotComplete) {
      dispatch({ type: 'JACKPOT_COMPLETE' });
      Sounds.jackpotWin();
    }
  }, [state.cashAmount, state.jackpotComplete]);

  /* Siren on alarm */
  useEffect(() => {
    if (state.alarm) Sounds.siren();
  }, [state.alarm]);

  /* Keyboard */
  const handleSpace = useCallback(() => {
    Sounds.advance();
    dispatch({ type: 'SPACE' });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleSpace(); return; }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey) { dispatch({ type: 'RESET' }); return; }
      if (e.key === 'Enter' && state.alarm) { dispatch({ type: 'DISMISS_ALARM' }); return; }
      if (['1', '2', '3'].includes(e.key) && state.waitingForChoice) {
        Sounds.correct();
        dispatch({ type: 'CHOOSE', key: e.key as '1' | '2' | '3' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSpace, state.alarm, state.waitingForChoice]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#060606', color: '#00e639', fontFamily: '"Share Tech Mono","Courier New",monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header */}
      <div style={{ background: '#080808', borderBottom: '1px solid #ff003322', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg viewBox="0 0 32 32" width="28" height="28" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}>
            <rect x="0" y="0" width="32" height="32" fill="#1a0505"/>
            <rect x="5" y="4" width="22" height="5" fill="#ff0033"/>
            <rect x="5" y="4" width="22" height="2" fill="#ff6666"/>
            <rect x="17" y="9"  width="8" height="5" fill="#ff0033"/>
            <rect x="13" y="14" width="8" height="5" fill="#ff0033"/>
            <rect x="9"  y="19" width="8" height="5" fill="#ff0033"/>
            <rect x="17" y="9"  width="2" height="5" fill="#ff6666"/>
            <rect x="13" y="14" width="2" height="5" fill="#ff6666"/>
            <rect x="9"  y="19" width="2" height="5" fill="#ff6666"/>
          </svg>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 10, color: '#ff0033', textShadow: '0 0 18px #ff003380,0 0 40px #ff003340', animation: 'glitch 6s infinite' }}>
              JACKPOT
            </div>
            <div style={{ fontSize: 9, color: '#ff003355', letterSpacing: 3 }}>
              ATM JACKPOTTING ATTACK — EDUCATIONAL DEMONSTRATION
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 9, lineHeight: 1.9, letterSpacing: 1.5 }}>
          <div style={{ color: '#ff003388' }}>THREAT ACTOR : COBALT GROUP (APT)</div>
          <div style={{ color: '#ff003388' }}>MALWARE &nbsp;&nbsp;&nbsp;&nbsp;: PLOUTUS-D / DIMBOA</div>
          <div style={{ color: '#00e63966' }}>TARGET &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: DIEBOLD OPTEVA 740 (XFS)</div>
          <div style={{ color: '#333333' }}>CLASSIFICATION : TRAINING USE ONLY</div>
        </div>
      </div>

      {/* Phase bar */}
      <div style={{ background: '#080808', borderBottom: '1px solid #111', padding: '8px 24px', display: 'flex', gap: 3, flexShrink: 0 }}>
        {PHASE_LABELS.map((label, i) => {
          const ph = i + 1;
          const isDone = ph < state.phase;
          const isActive = ph === state.phase;
          return (
            <div key={ph} style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', padding: '7px 4px 6px', border: `1px solid ${isActive ? '#ff003388' : isDone ? '#00e63922' : '#151515'}`, color: isActive ? '#ff0033' : isDone ? '#00e63966' : '#252525', background: isActive ? '#ff003310' : isDone ? '#00e63905' : 'transparent', textShadow: isActive ? '0 0 8px #ff003380' : 'none' }}>
              <div style={{ fontSize: 7, opacity: 0.5, marginBottom: 2 }}>0{ph}</div>
              {label}
            </div>
          );
        })}
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {/* Terminal — left 55% */}
        <div style={{ width: '55%', borderRight: '1px solid #00e63912', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#0a0a0a', borderBottom: '1px solid #111', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#333', flexShrink: 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 8 }}>root@kali — ploutus-loader — 80x24</span>
            <span style={{ marginLeft: 'auto', color: '#ff003366' }}>&#x25CF; LIVE</span>
          </div>
          <TerminalPanel
            lines={state.effectiveLines}
            revealedLines={state.revealedLines}
            charIndex={state.charIndex}
            waitingForChoice={state.waitingForChoice}
            cashAmount={state.cashAmount}
            jackpotComplete={state.jackpotComplete}
            phaseId={state.phase}
          />
        </div>

        {/* ATM panel — right 45% */}
        <div style={{ width: '45%', background: '#040404', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* CRT vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,transparent 40%,#000000aa 100%)', pointerEvents: 'none', zIndex: 2 }} />
          {/* Scanlines */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.15) 3px,rgba(0,0,0,.15) 4px)', pointerEvents: 'none', zIndex: 3 }} />
          <div style={{ fontSize: 8, letterSpacing: 3, color: '#ff003444', position: 'absolute', top: 14, textTransform: 'uppercase', zIndex: 4 }}>
            ATM PHYSICAL STATE — PHASE 0{state.phase}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <AtmSvg state={state.atm} />
          </div>
        </div>

        {/* Alarm overlay */}
        <AnimatePresence>
          {state.alarm && (
            <AlarmOverlay
              reason={state.alarm.reason}
              onDismiss={() => dispatch({ type: 'DISMISS_ALARM' })}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ background: '#080808', borderTop: '1px solid #111', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, color: '#333', flexShrink: 0, gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', whiteSpace: 'nowrap' }}>
          {[['SPACE', 'Next'], ['R', 'Reset'], ['1/2/3', 'Select']].map(([k, v]) => (
            <span key={k}>
              <kbd style={{ background: '#111', border: '1px solid #222', padding: '1px 6px', borderRadius: 2, color: '#555', fontFamily: 'inherit' }}>{k}</kbd> {v}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#444', letterSpacing: 0.4, lineHeight: 1.6, padding: '0 20px' }}>
          {NARRATIVES[state.phase]}
        </div>
        <div style={{ color: '#ff003466', fontSize: 9, letterSpacing: 2, whiteSpace: 'nowrap' }}>
          PHASE {state.phase} / 6 — {PHASE_LABELS[state.phase - 1]}
        </div>
      </div>

      <style>{`@keyframes glitch{0%,90%,100%{text-shadow:0 0 18px #ff003380,0 0 40px #ff003340}92%{text-shadow:-2px 0 #00ffff80,2px 0 #ff003380}94%{text-shadow:2px 0 #ff003380,-2px 0 #00ffff40}}`}</style>
    </div>
  );
}
