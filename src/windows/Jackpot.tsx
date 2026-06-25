import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState, Action, PhaseId, AtmVisualState, ToolChoices } from './jackpot/types';
import { PHASE_LINES, CONTINUATIONS, CHOICES, ATM_INITIAL } from './jackpot/phaseData';
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
    started: false,
    policeTriggered: false,
    lastAlarmReason: '',
    alarm: null,
    atm: { ...ATM_INITIAL },
    cashAmount: 0,
    jackpotComplete: false,
    atmUiState: 'idle',
    pinBuffer: '',
    atmBalance: 500,
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
  if (choiceId === 'alarm-sensor') {
    if (key === '1') return { ...atm, showClamp: true };
    return atm;
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
      if (!state.started) return { ...state, started: true };
      if (state.alarm || state.waitingForChoice || state.jackpotComplete) return state;
      const line = state.effectiveLines[state.revealedLines];
      if (line && (line.t === 'cmd' || line.t === 'out') && state.charIndex < line.text.length) {
        return { ...state, charIndex: line.text.length };
      }
      if (line) {
        if (line.t === 'choice') {
          return { ...state, revealedLines: state.revealedLines + 1, charIndex: 0, waitingForChoice: line.id };
        }
        return { ...state, revealedLines: state.revealedLines + 1, charIndex: 0 };
      }
      const isBlackbox = state.choices.installMethod === 'blackbox';
      const nextPhase = (isBlackbox && state.phase === 3) ? 6 : (state.phase + 1) as PhaseId;
      if (nextPhase > 6) return state;
      if (nextPhase === 5 && state.siemDelayed) {
        const reason = 'Buffered logs flushed to bank SIEM when cable reconnected — police dispatched';
        return { ...state, policeTriggered: true, lastAlarmReason: reason, alarm: { active: true, reason, recoverable: false, resetToLine: -1 } };
      }
      const newAtm = atmForPhase(nextPhase, state.atm);
      return { ...state, phase: nextPhase, effectiveLines: PHASE_LINES[nextPhase]!, revealedLines: 0, charIndex: 0, waitingForChoice: null, atm: newAtm };
    }

    case 'CHOOSE': {
      if (!state.waitingForChoice) return state;
      const choiceId = state.waitingForChoice;
      const cfg = CHOICES[choiceId];
      const option = cfg.options.find(o => o.key === action.key);
      if (!option) return state;

      if (option.outcome === 'wrong') {
        const reason = option.wrongReason ?? 'Operation detected';
        return { ...state, policeTriggered: true, lastAlarmReason: reason, alarm: { active: true, reason, recoverable: true, resetToLine: state.revealedLines - 1 }, waitingForChoice: null };
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
      if (!state.alarm?.recoverable) return state;
      const resetTo = state.alarm.resetToLine >= 0 ? state.alarm.resetToLine : Math.max(0, state.revealedLines - 1);
      return { ...state, alarm: null, revealedLines: resetTo, charIndex: 0, waitingForChoice: null };
    }

    case 'RESET':
      return makeInitialState();

    /* ── ATM UI actions ── */

    case 'ATM_PIN_DIGIT': {
      const { digit } = action;
      if (state.atmUiState === 'idle') {
        return { ...state, atmUiState: 'pin', pinBuffer: digit };
      }
      if (state.atmUiState === 'pin' && state.pinBuffer.length < 4) {
        const buf = state.pinBuffer + digit;
        if (buf === '1234') return { ...state, pinBuffer: buf, atmUiState: 'menu' };
        if (buf.length === 4) return { ...state, pinBuffer: buf }; // wrong, length=4 signals error
        return { ...state, pinBuffer: buf };
      }
      if (state.atmUiState === 'menu') {
        if (digit === '1') return { ...state, atmUiState: 'balance' };
        if (digit === '2') {
          if (state.atmBalance <= 0) return state;
          return { ...state, atmUiState: 'withdraw', atmBalance: 0, cashAmount: state.cashAmount + state.atmBalance, atm: { ...state.atm, dispensing: true } };
        }
        if (digit === '3') return { ...state, atmUiState: 'idle', pinBuffer: '' };
      }
      return state;
    }

    case 'ATM_CLEAR': {
      if (state.atmUiState === 'pin') return { ...state, pinBuffer: '' };
      return { ...state, atmUiState: 'idle', pinBuffer: '' };
    }

    case 'ATM_ENTER': {
      if (state.atmUiState === 'pin') {
        if (state.pinBuffer === '1234') return { ...state, atmUiState: 'menu', pinBuffer: '' };
        return { ...state, pinBuffer: '' };
      }
      if (state.atmUiState === 'balance') return { ...state, atmUiState: 'menu' };
      if (state.atmUiState === 'withdraw') return { ...state, atmUiState: 'idle' };
      return state;
    }

    case 'ATM_MENU': {
      if (state.atmUiState !== 'menu') return state;
      if (action.choice === 'balance') return { ...state, atmUiState: 'balance' };
      if (action.choice === 'cancel') return { ...state, atmUiState: 'idle', pinBuffer: '' };
      if (action.choice === 'withdraw') {
        if (state.atmBalance <= 0) return state;
        return { ...state, atmUiState: 'withdraw', atmBalance: 0, cashAmount: state.cashAmount + state.atmBalance, atm: { ...state.atm, dispensing: true } };
      }
      return state;
    }

    case 'ATM_OK': {
      if (state.atmUiState === 'balance') return { ...state, atmUiState: 'menu' };
      if (state.atmUiState === 'withdraw') return { ...state, atmUiState: 'idle' };
      return state;
    }

    default:
      return state;
  }
}

/* ── Component ── */

const PHASE_LABELS = ['RECON', 'BREACH', 'INSTALL', 'PERSIST', 'ACTIVATE', 'JACKPOT'];

export function Jackpot() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);
  const cashTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  /* Type-on effect — waits for first space before starting */
  useEffect(() => {
    if (!state.started) return;
    if (state.alarm || state.waitingForChoice || state.jackpotComplete) return;
    const line = state.effectiveLines[state.revealedLines];
    if (!line) return;

    if (line.t === 'blank' || line.t === 'banner' || line.t === 'choice') {
      const t = setTimeout(() => dispatch({ type: 'LINE_ADVANCE' }), line.t === 'blank' ? 60 : 0);
      return () => clearTimeout(t);
    }

    const text = line.text;
    if (state.charIndex >= text.length) {
      if (line.t === 'out') {
        const t = setTimeout(() => dispatch({ type: 'LINE_ADVANCE' }), 80);
        return () => clearTimeout(t);
      }
      return;
    }

    const speed = line.t === 'cmd' ? 32 : 10;
    const t = setTimeout(() => {
      if (state.charIndex % 4 === 0) Sounds.keypress();
      dispatch({ type: 'CHAR_TICK' });
    }, speed);
    return () => clearTimeout(t);
  }, [state.started, state.revealedLines, state.charIndex, state.alarm, state.waitingForChoice, state.jackpotComplete, state.effectiveLines]);

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

  /* Siren on alarm — start when alarm fires, stop when it clears */
  useEffect(() => {
    if (state.alarm) {
      Sounds.siren();
    } else {
      Sounds.stopSiren();
    }
  }, [state.alarm]);

  /* Keyboard */
  const handleSpace = useCallback(() => {
    Sounds.advance();
    dispatch({ type: 'SPACE' });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Space') { e.preventDefault(); handleSpace(); return; }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey) { Sounds.stopSiren(); dispatch({ type: 'RESET' }); return; }
      if (e.key === 'Enter' && s.alarm) { if (s.alarm.recoverable) dispatch({ type: 'DISMISS_ALARM' }); return; }
      // Game narrative choices take priority over ATM digit input
      if (['1', '2', '3'].includes(e.key) && s.waitingForChoice) {
        Sounds.correct();
        dispatch({ type: 'CHOOSE', key: e.key as '1' | '2' | '3' });
        return;
      }
      // ATM digit input when idle/pin/menu and no game choice is pending
      if (/^[0-9]$/.test(e.key) && !s.alarm && !s.waitingForChoice && (s.atmUiState === 'idle' || s.atmUiState === 'pin' || s.atmUiState === 'menu')) {
        Sounds.pinPress();
        dispatch({ type: 'ATM_PIN_DIGIT', digit: e.key });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSpace]);

  /* ATM callbacks */
  const handleAtmPinDigit = useCallback((digit: string) => {
    dispatch({ type: 'ATM_PIN_DIGIT', digit });
  }, []);
  const handleAtmClear = useCallback(() => { dispatch({ type: 'ATM_CLEAR' }); }, []);
  const handleAtmEnter = useCallback(() => { dispatch({ type: 'ATM_ENTER' }); }, []);
  const handleAtmMenu = useCallback((choice: 'balance' | 'withdraw' | 'cancel') => {
    dispatch({ type: 'ATM_MENU', choice });
  }, []);
  const handleAtmOk = useCallback(() => { dispatch({ type: 'ATM_OK' }); }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0d1117', color: '#00ff88', fontFamily: '"Share Tech Mono","Courier New",monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header — light chrome */}
      <div style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg viewBox="0 0 32 32" width="30" height="30" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}>
            <rect x="0" y="0" width="32" height="32" fill="#fff0f2"/>
            <rect x="5" y="4" width="22" height="5" fill="#c01e35"/>
            <rect x="5" y="4" width="22" height="2" fill="#e04060"/>
            <rect x="17" y="9"  width="8" height="5" fill="#c01e35"/>
            <rect x="13" y="14" width="8" height="5" fill="#c01e35"/>
            <rect x="9"  y="19" width="8" height="5" fill="#c01e35"/>
            <rect x="17" y="9"  width="2" height="5" fill="#e04060"/>
            <rect x="13" y="14" width="2" height="5" fill="#e04060"/>
            <rect x="9"  y="19" width="2" height="5" fill="#e04060"/>
          </svg>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 10, color: '#c01e35', textShadow: '2px 2px 0 #8a1225', animation: 'glitch 6s infinite', fontFamily: '"Share Tech Mono","Courier New",monospace' }}>
            JACKPOT
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.9, letterSpacing: 0.3, fontFamily: 'Arial, sans-serif' }}>
          <div style={{ color: '#c01e35', fontWeight: 'bold' }}>THREAT ACTOR: Cobalt Group (APT)</div>
          <div style={{ color: '#6c757d' }}>MALWARE: Ploutus-D / Dimboa (XFS)</div>
          <div style={{ color: '#495057' }}>TARGET: Diebold Opteva 740</div>
          <div style={{ color: '#999', fontSize: 9 }}>CLASSIFICATION: Training Use Only</div>
        </div>
      </div>

      {/* Phase bar — light */}
      <div style={{ background: '#f0f2f5', borderBottom: '1px solid #dee2e6', padding: '6px 24px', display: 'flex', gap: 3, flexShrink: 0 }}>
        {PHASE_LABELS.map((label, i) => {
          const ph = i + 1;
          const isDone = ph < state.phase;
          const isActive = ph === state.phase;
          return (
            <div key={ph} style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 4px 5px', border: `1px solid ${isActive ? '#c01e35' : isDone ? '#28a74566' : '#ccc'}`, color: isActive ? '#fff' : isDone ? '#155724' : '#888', background: isActive ? '#c01e35' : isDone ? '#d4edda' : '#e9ecef', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontSize: 6.5, opacity: 0.75, marginBottom: 2 }}>0{ph}</div>
              {label}
            </div>
          );
        })}
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {/* Terminal — left 55% */}
        <div style={{ width: '55%', borderRight: '1px solid #00ff8820', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#1c2128', borderBottom: '1px solid #21262d', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#768390', flexShrink: 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 8 }}>root@kali — ploutus-loader — 80x24</span>
            <span style={{ marginLeft: 'auto', color: '#ff224488' }}>&#x25CF; LIVE</span>
          </div>
          <TerminalPanel
            lines={state.effectiveLines}
            revealedLines={state.revealedLines}
            charIndex={state.charIndex}
            waitingForChoice={state.waitingForChoice}
            cashAmount={state.cashAmount}
            jackpotComplete={state.jackpotComplete}
            phaseId={state.phase}
            started={state.started}
          />
        </div>

        {/* ATM panel — Wells Fargo branch exterior */}
        <div style={{ width: '45%', background: '#c8c3bc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Stone block wall texture */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(0,0,0,0.055) 48px), repeating-linear-gradient(90deg, transparent, transparent 95px, rgba(0,0,0,0.04) 96px)', pointerEvents: 'none', zIndex: 0 }} />
          {/* Wells Fargo red header signage */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#c01e35', padding: '10px 0 8px', textAlign: 'center', zIndex: 2, borderBottom: '3px solid #8a1225' }}>
            <div style={{ color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: 13, letterSpacing: 5, textTransform: 'uppercase' }}>Wells Fargo</div>
            <div style={{ color: '#ffcd11', fontFamily: 'Arial, sans-serif', fontSize: 8, letterSpacing: 3, marginTop: 2 }}>24-HOUR ATM</div>
          </div>
          {/* FDIC footer */}
          <div style={{ position: 'absolute', bottom: 8, fontSize: 8, color: '#9a9590', fontFamily: 'Arial, sans-serif', letterSpacing: 1, zIndex: 2 }}>MEMBER FDIC · EQUAL HOUSING LENDER</div>
          {/* ATM itself */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 36 }}>
            <AtmSvg
              state={state.atm}
              atmUiState={state.atmUiState}
              pinBuffer={state.pinBuffer}
              atmBalance={state.atmBalance}
              onPinDigit={handleAtmPinDigit}
              onClear={handleAtmClear}
              onEnter={handleAtmEnter}
              onMenuChoice={handleAtmMenu}
              onAtmOk={handleAtmOk}
            />
          </div>
          {/* Police timer — mounts on first alarm, stays until Reset */}
          {state.policeTriggered && (
            <AlarmOverlay
              reason={state.alarm?.reason ?? state.lastAlarmReason}
              isBlocking={state.alarm !== null}
              recoverable={state.alarm?.recoverable ?? false}
            />
          )}
        </div>
      </div>

      <style>{`@keyframes glitch{0%,90%,100%{text-shadow:2px 2px 0 #8a1225}92%{text-shadow:-2px 0 #0066ff88,2px 0 #c01e35}94%{text-shadow:2px 0 #c01e35,-2px 0 #0066ff55}}`}</style>
    </div>
  );
}
