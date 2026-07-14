import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import type {
  GameState,
  Action,
  PhaseId,
  AtmVisualState,
  ToolChoices,
  NarrativeCheckpoint,
  TermLine,
} from './jackpot/types';
import { PHASE_LINES, CONTINUATIONS, CHOICES, ATM_INITIAL } from './jackpot/phaseData';
import {
  classifyAt,
  cmdsMatch,
  outputBlockEnd,
  outputStartAfterCmd,
  rebuildAtmFromChoices,
  skipNoise,
} from './jackpot/terminalLogic';
import {
  HELP_EASTER_EGG_LINES,
  isBasicLinuxCommand,
  isWorkingDemoCommand,
} from './jackpot/cheatSheetData';
import {
  initialSandbox,
  matchesPrologueBootstrap,
  matchesPrologueLs,
  runSandboxCommand,
  tabCompleteExpected,
  tabCompleteSandbox,
} from './jackpot/sandboxFs';
import { AtmSvg } from './jackpot/AtmSvg';
import { CheatSheet, computeCheatUnlocks } from './jackpot/CheatSheet';
import { TerminalPanel } from './jackpot/TerminalPanel';
import { AlarmOverlay } from './jackpot/AlarmOverlay';
import { Sounds } from './jackpot/sound';

/* ── Initial state ── */

const INITIAL_CHOICES: ToolChoices = {
  panelAccess: null,
  ethernet: null,
  alarmSensor: null,
  installMethod: null,
  persistMethod: null,
  activateMethod: null,
};

const POLICE_ETA_INITIAL = 40;
const POLICE_ETA_PENALTY = 20;
const POLICE_ETA_FLOOR = 5;
const POLICE_ARRIVED_REASON = 'Police on scene - vestibule locked down, ATM seized as evidence';
/** Full cassette haul before any customer withdrawals */
const JACKPOT_CASSETTE_TOTAL = 212_000;

function makeInitialState(): GameState {
  const sand = initialSandbox();
  return {
    phase: 1,
    effectiveLines: PHASE_LINES[1]!,
    revealedLines: 0,
    charIndex: 0,
    waitingForChoice: null,
    choices: { ...INITIAL_CHOICES },
    siemDelayed: false,
    started: false,
    termMode: 'at-announce',
    inputBuffer: '',
    cursorIndex: 0,
    failedCmds: [],
    termClearAt: null,
    cmdHistory: [],
    historyBrowseIndex: null,
    autofillTarget: null,
    typingOutIndex: null,
    checkpoints: [],
    policeTriggered: false,
    policeEtaSeconds: null,
    policeArrived: false,
    policeStrikeCount: 0,
    lastEtaPenalty: null,
    lastAlarmReason: '',
    alarm: null,
    atmBeforeAlarm: null,
    atm: { ...ATM_INITIAL },
    cashAmount: 0,
    jackpotComplete: false,
    customerWithdrawn: 0,
    atmUiState: 'idle',
    inputFocus: 'terminal',
    pinBuffer: '',
    amountBuffer: '',
    atmBalance: 500,
    atmError: '',
    lastWithdrawAmount: 0,
    shellTier: 'user',
    sandboxCwd: sand.cwd,
    sandboxEchoes: [],
    showPloutusBanner: false,
  };
}

function snapshotCheckpoint(state: GameState): NarrativeCheckpoint {
  return {
    phase: state.phase,
    effectiveLines: state.effectiveLines,
    revealedLines: state.revealedLines,
    choices: { ...state.choices },
    siemDelayed: state.siemDelayed,
    atm: { ...state.atm },
    termMode: state.termMode,
    inputBuffer: state.inputBuffer,
    failedCmds: state.failedCmds,
    waitingForChoice: state.waitingForChoice,
    cashAmount: state.cashAmount,
    jackpotComplete: state.jackpotComplete,
    customerWithdrawn: state.customerWithdrawn,
    policeTriggered: state.policeTriggered,
    policeEtaSeconds: state.policeEtaSeconds,
    policeArrived: state.policeArrived,
    policeStrikeCount: state.policeStrikeCount,
    lastEtaPenalty: state.lastEtaPenalty,
    lastAlarmReason: state.lastAlarmReason,
    alarm: state.alarm,
    atmBeforeAlarm: state.atmBeforeAlarm ? { ...state.atmBeforeAlarm } : null,
    cmdHistory: [...state.cmdHistory],
    shellTier: state.shellTier,
    sandboxCwd: state.sandboxCwd,
    sandboxEchoes: state.sandboxEchoes,
    showPloutusBanner: state.showPloutusBanner,
  };
}

function pushCheckpoint(state: GameState): GameState {
  return {
    ...state,
    checkpoints: [...state.checkpoints, snapshotCheckpoint(state)],
  };
}

/** Align termMode / waitingForChoice with content at revealedLines. */
function settleAt(state: GameState, revealedLines: number, lines = state.effectiveLines): GameState {
  const { index, mode, line } = classifyAt(lines, revealedLines);
  return {
    ...state,
    effectiveLines: lines,
    revealedLines: index,
    charIndex: 0,
    termMode: mode,
    waitingForChoice: mode === 'at-choice' && line && line.t === 'choice' ? line.id : null,
    inputBuffer: '',
    cursorIndex: 0,
    failedCmds: [],
    historyBrowseIndex: null,
    autofillTarget: null,
    typingOutIndex: null,
  };
}

/**
 * Enter a phase at the first interactive beat.
 * Phase 1 cold-start: bare danny@kali prompt — no history, no autofill.
 */
function beginPhaseContent(state: GameState, lines: TermLine[]): GameState {
  const start = skipNoise(lines, 0);
  return settleAt({ ...state, effectiveLines: lines, started: true }, start, lines);
}

/** Absolute path in the prompt — same as a default bash PS1 with \w expanded. */
function cwdDisplayFor(state: GameState): string {
  if (state.shellTier === 'root') return '/root/ploutus';
  return state.sandboxCwd || '/home/danny';
}

function nextScriptedCmd(state: GameState): string | null {
  const line = state.effectiveLines[state.revealedLines];
  if (line?.t === 'cmd') return line.text;
  return null;
}

function helpOutputLines(state: GameState): string[] {
  const hintCmd = nextScriptedCmd(state);
  const hint = hintCmd ? `Hint: Try the \`${hintCmd}\`` : 'Hint: open the Cheat Sheet (top right) if you\'re stuck.';
  if (state.shellTier === 'user') {
    return [...HELP_EASTER_EGG_LINES, hint];
  }
  return [hint];
}

function applyHelpTyped(state: GameState, typed: string): GameState {
  const echo = {
    cmd: typed,
    lines: helpOutputLines(state),
    tier: state.shellTier,
    cwdDisplay: cwdDisplayFor(state),
  };
  return {
    ...state,
    sandboxEchoes: [...state.sandboxEchoes, echo],
    inputBuffer: '',
    cursorIndex: 0,
    failedCmds: [],
    historyBrowseIndex: null,
    autofillTarget: null,
    cmdHistory: [...state.cmdHistory.filter((c) => c !== typed), typed],
  };
}

function applySandboxTyped(state: GameState, typed: string): GameState {
  const first = typed.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  if (first === 'help') return applyHelpTyped(state, typed);

  const result = runSandboxCommand(typed, { cwd: state.sandboxCwd });
  const echo = {
    cmd: typed,
    lines: result.lines,
    tier: state.shellTier,
    cwdDisplay: cwdDisplayFor(state),
  };
  return {
    ...state,
    sandboxCwd: result.cwd || state.sandboxCwd,
    sandboxEchoes: [...state.sandboxEchoes, echo],
    inputBuffer: '',
    cursorIndex: 0,
    failedCmds: [],
    historyBrowseIndex: null,
    autofillTarget: null,
    cmdHistory: [...state.cmdHistory.filter((c) => c !== typed), typed],
  };
}

function enterPhase(state: GameState, nextPhase: PhaseId): GameState {
  const baseAtm = rebuildAtmFromChoices(state.choices);
  const newAtm = atmForPhase(nextPhase, baseAtm);
  return beginPhaseContent(
    {
      ...state,
      phase: nextPhase,
      atm: newAtm,
      cashAmount: nextPhase === 6 ? state.cashAmount : state.cashAmount,
      jackpotComplete: nextPhase === 6 ? state.jackpotComplete : false,
    },
    PHASE_LINES[nextPhase]!,
  );
}

function finishTypingOut(state: GameState): GameState {
  if (state.typingOutIndex === null) return state;
  const idx = state.typingOutIndex;
  return settleAt(
    { ...state, typingOutIndex: null, charIndex: 0 },
    idx + 1,
  );
}

/** Start or accelerate the police ETA. Never resets the clock upward. */
function applyPoliceTrigger(
  state: GameState,
  reason: string,
  recoverable: boolean,
  resetToLine: number,
  atmPatch?: AtmVisualState,
): GameState {
  if (state.policeArrived || state.policeEtaSeconds === 0) {
    return {
      ...state,
      policeTriggered: true,
      policeArrived: true,
      policeEtaSeconds: 0,
      lastAlarmReason: POLICE_ARRIVED_REASON,
      alarm: {
        active: true,
        reason: POLICE_ARRIVED_REASON,
        recoverable: false,
        resetToLine: -1,
      },
      atm: {
        ...(atmPatch ?? state.atm),
        screenMode: 'seized',
        dispensing: false,
      },
      waitingForChoice: null,
    };
  }

  const first = state.policeEtaSeconds === null;
  const prevEta = state.policeEtaSeconds ?? POLICE_ETA_INITIAL;

  // Already at the floor (5s) — another strike means they're here. Don't clamp back up to 5.
  if (!first && prevEta <= POLICE_ETA_FLOOR) {
    const busted = applyPoliceArrived(state);
    return atmPatch
      ? { ...busted, atm: { ...atmPatch, screenMode: 'seized' as const, dispensing: false } }
      : busted;
  }

  const nextEta = first
    ? POLICE_ETA_INITIAL
    : Math.max(POLICE_ETA_FLOOR, prevEta - POLICE_ETA_PENALTY);
  const penalty = first ? null : prevEta - nextEta;

  return {
    ...state,
    policeTriggered: true,
    policeEtaSeconds: nextEta,
    policeStrikeCount: state.policeStrikeCount + 1,
    lastEtaPenalty: penalty && penalty > 0 ? penalty : null,
    lastAlarmReason: reason,
    alarm: {
      active: true,
      reason,
      recoverable,
      resetToLine,
    },
    atm: atmPatch ?? state.atm,
    waitingForChoice: null,
  };
}

function applyPoliceArrived(state: GameState): GameState {
  if (state.policeArrived && state.policeEtaSeconds === 0) {
    // Already busted — keep non-recoverable alarm up
    return {
      ...state,
      policeEtaSeconds: 0,
      policeArrived: true,
      lastAlarmReason: POLICE_ARRIVED_REASON,
      alarm: {
        active: true,
        reason: POLICE_ARRIVED_REASON,
        recoverable: false,
        resetToLine: -1,
      },
      atm: { ...state.atm, screenMode: 'seized', dispensing: false },
      waitingForChoice: null,
    };
  }
  return {
    ...state,
    policeTriggered: true,
    policeEtaSeconds: 0,
    policeArrived: true,
    lastEtaPenalty: null,
    lastAlarmReason: POLICE_ARRIVED_REASON,
    alarm: {
      active: true,
      reason: POLICE_ARRIVED_REASON,
      recoverable: false,
      resetToLine: -1,
    },
    atm: { ...state.atm, screenMode: 'seized', dispensing: false },
    waitingForChoice: null,
  };
}

/* ── ATM state helpers ── */

function atmForPhase(phase: PhaseId, prev: AtmVisualState): AtmVisualState {
  switch (phase) {
    case 4:
      return {
        ...prev,
        driveState: prev.driveState === 'removed' ? 'reinstalled' : prev.driveState,
        showLaptop: false,
        showUsbStick: false,
        screenMode: 'reboot',
      };
    case 5:
      return { ...prev, screenMode: 'ploutus' };
    case 6:
      return { ...prev, screenMode: 'jackpot', showCassetteCutaway: true, showPhone: false };
    default:
      return prev;
  }
}

function applyChoiceToAtm(atm: AtmVisualState, choiceId: string, key: string): AtmVisualState {
  if (choiceId === 'panel-access') {
    if (key === '1') return { ...atm, panelOpen: true, accessMethod: 'tbar', showDoorAjar: false };
    if (key === '2') return { ...atm, panelOpen: true, accessMethod: 'crowbar', showDoorAjar: true };
    if (key === '3') return { ...atm, panelOpen: true, accessMethod: 'social', showDoorAjar: false };
  }
  if (choiceId === 'ethernet') {
    if (key === '1') return { ...atm, ethState: 'loopback' };
    if (key === '2') return { ...atm, ethState: 'cut' };
    if (key === '3') return { ...atm, ethState: 'intact' };
  }
  if (choiceId === 'alarm-sensor') {
    if (key === '1') return { ...atm, showClamp: true, showSensorCut: false, showDoorAjar: false };
    if (key === '2') return { ...atm, showClamp: false, showSensorCut: true, showDoorAjar: false };
    if (key === '3') return { ...atm, showClamp: false, showSensorCut: false, showDoorAjar: true };
  }
  if (choiceId === 'install-method') {
    if (key === '1') return { ...atm, driveState: 'removed', showLaptop: true, showUsbStick: false, showBlackbox: false };
    if (key === '2') return { ...atm, showLaptop: true, showUsbStick: true, showBlackbox: false, driveState: atm.driveState === 'removed' ? 'present' : atm.driveState };
    if (key === '3') return { ...atm, showBlackbox: true, showLaptop: false, showUsbStick: false, driveState: atm.driveState === 'removed' ? 'present' : atm.driveState };
  }
  if (choiceId === 'persist-method') {
    if (key === '1') {
      return {
        ...atm,
        driveState: atm.driveState === 'removed' ? 'reinstalled' : atm.driveState,
        panelOpen: false,
        showLaptop: false,
        showUsbStick: false,
        showClamp: false,
        showSensorCut: false,
        showDoorAjar: false,
        showTamperTape: true,
        accessMethod: null,
        screenMode: 'reboot',
      };
    }
    if (key === '2') {
      return {
        ...atm,
        panelOpen: true,
        showDoorAjar: true,
        showTamperTape: false,
        showLaptop: false,
        showUsbStick: false,
      };
    }
    if (key === '3') {
      return {
        ...atm,
        panelOpen: false,
        showTamperTape: false,
        showClamp: false,
        showSensorCut: false,
        showDoorAjar: false,
        showLaptop: false,
        showUsbStick: false,
        accessMethod: null,
        screenMode: 'normal',
      };
    }
  }
  if (choiceId === 'activate-method') {
    if (key === '1') return { ...atm, screenMode: 'ploutus', showExtKeyboard: true, showMule: true, showPhone: false };
    if (key === '2') return { ...atm, screenMode: 'normal', showExtKeyboard: false, showMule: true, showPhone: false };
    if (key === '3') return { ...atm, screenMode: 'normal', showMule: true, showPhone: true, showExtKeyboard: false };
  }
  return atm;
}

function updateChoices(choices: ToolChoices, choiceId: string, key: string): ToolChoices {
  switch (choiceId) {
    case 'panel-access': return { ...choices, panelAccess: key === '1' ? 'tbar' : 'social' };
    case 'ethernet': return { ...choices, ethernet: key === '1' ? 'loopback' : key === '2' ? 'cut' : 'live' };
    case 'alarm-sensor': return { ...choices, alarmSensor: 'clamp' };
    case 'install-method': return { ...choices, installMethod: key === '1' ? 'hdd' : key === '2' ? 'usb' : 'blackbox' };
    case 'persist-method': return { ...choices, persistMethod: 'reseal' };
    case 'activate-method': return { ...choices, activateMethod: 'keyboard' };
    default: return choices;
  }
}

function jackpotTarget(state: GameState): number {
  return Math.max(0, JACKPOT_CASSETTE_TOTAL - state.customerWithdrawn);
}

function tryWithdraw(state: GameState, amount: number): GameState {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { ...state, atmUiState: 'error', atmError: 'INVALID AMOUNT', amountBuffer: '' };
  }
  if (amount > state.atmBalance) {
    return { ...state, atmUiState: 'error', atmError: 'INSUFFICIENT FUNDS', lastWithdrawAmount: 0, amountBuffer: '' };
  }
  return {
    ...state,
    atmUiState: 'withdraw',
    atmBalance: state.atmBalance - amount,
    lastWithdrawAmount: amount,
    // Customer cash leaves the cassettes — jackpot haul shrinks by the same amount
    customerWithdrawn: state.customerWithdrawn + amount,
    atm: { ...state.atm, dispensing: true },
    atmError: '',
    amountBuffer: '',
  };
}

/* ── Reducer ── */

function acceptCommand(state: GameState, cmdIndex: number): GameState {
  const line = state.effectiveLines[cmdIndex];
  const cmdText = line && line.t === 'cmd' ? line.text : '';
  const isBootstrap = !!(cmdText && matchesPrologueBootstrap(cmdText, '/home/danny'));
  const history = cmdText
    ? [...state.cmdHistory.filter(c => c !== cmdText), cmdText]
    : state.cmdHistory;
  const withCp = pushCheckpoint({
    ...state,
    cmdHistory: history,
    historyBrowseIndex: null,
    autofillTarget: null,
    inputBuffer: '',
    cursorIndex: 0,
    failedCmds: [],
    ...(isBootstrap
      ? {
          shellTier: 'root' as const,
          showPloutusBanner: true,
          sandboxCwd: '/root/ploutus',
          sandboxEchoes: [], // drop free-explore clutter once you're root
        }
      : {}),
  });
  const outStart = outputStartAfterCmd(withCp.effectiveLines, cmdIndex);
  const outLine = withCp.effectiveLines[outStart];
  // Typed/autofilled Enter should feel like a real shell: cmd + stdout in one beat
  if (outLine && outLine.t === 'out') {
    // Bootstrap: dump through banner + PHASE header + on-site note, land on first recon cmd
    if (isBootstrap) {
      const reconCmdIdx = withCp.effectiveLines.findIndex(
        (l, i) => i > cmdIndex && l.t === 'cmd' && l.text.startsWith('ip -4'),
      );
      const end = reconCmdIdx >= 0 ? reconCmdIdx : outputBlockEnd(withCp.effectiveLines, outStart);
      return settleAt(withCp, end);
    }
    const end = outputBlockEnd(withCp.effectiveLines, outStart);
    return settleAt(withCp, end);
  }
  // No output — settle on whatever follows
  return settleAt(withCp, cmdIndex + 1);
}

function scriptedCmdMatches(typed: string, expected: string, cwd: string): boolean {
  if (cmdsMatch(typed, expected)) return true;
  if (matchesPrologueLs(expected, '/home/danny') && matchesPrologueLs(typed, cwd)) return true;
  if (matchesPrologueBootstrap(expected, '/home/danny') && matchesPrologueBootstrap(typed, cwd)) return true;
  return false;
}

function revealOutputBlock(state: GameState): GameState {
  const withCp = pushCheckpoint(state);
  // Find the output block starting at/after revealedLines
  const start = outputStartAfterCmd(withCp.effectiveLines, withCp.revealedLines - 1);
  const blockStart = withCp.effectiveLines[start]?.t === 'out'
    ? start
    : classifyAt(withCp.effectiveLines, withCp.revealedLines).index;
  if (withCp.effectiveLines[blockStart]?.t !== 'out') {
    return settleAt(withCp, withCp.revealedLines);
  }
  const end = outputBlockEnd(withCp.effectiveLines, blockStart);
  return settleAt(withCp, end);
}

function revealAnnounce(state: GameState, annIndex: number): GameState {
  const withCp = pushCheckpoint(state);
  const end = outputBlockEnd(withCp.effectiveLines, annIndex);
  return settleAt(withCp, end);
}

function tryAdvancePhase(state: GameState): GameState {
  const isBlackbox = state.choices.installMethod === 'blackbox';
  const nextPhase = (isBlackbox && state.phase === 3) ? 6 : (state.phase + 1) as PhaseId;
  if (nextPhase > 6) return state;
  const withCp = pushCheckpoint(state);
  if (nextPhase === 5 && state.siemDelayed) {
    const reason = 'Buffered logs flushed to bank SIEM when cable reconnected - police dispatched';
    return applyPoliceTrigger(withCp, reason, false, -1);
  }
  return enterPhase(withCp, nextPhase);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'ADVANCE': {
      if (!state.started) {
        // Start → bare danny@kali prompt only (no history, no autofill)
        return beginPhaseContent({ ...state, started: true }, PHASE_LINES[1]!);
      }
      if (state.alarm || state.policeArrived || state.jackpotComplete) return state;
      if (state.termMode === 'at-choice' || state.waitingForChoice) return state;

      // Skip remaining typewriter on narrative outs
      if (state.typingOutIndex !== null) {
        return finishTypingOut(state);
      }

      if (state.termMode === 'at-cmd') {
        const line = state.effectiveLines[state.revealedLines];
        if (!line || line.t !== 'cmd') return settleAt(state, state.revealedLines);

        // Mid-autofill: finish instantly and accept
        if (state.autofillTarget) {
          return acceptCommand(
            {
              ...state,
              inputBuffer: state.autofillTarget,
              cursorIndex: state.autofillTarget.length,
              autofillTarget: null,
            },
            state.revealedLines,
          );
        }

        const typed = state.inputBuffer;
        const typedTrim = typed.trim();

        // Exact / alias match → accept scripted beat
        if (typedTrim && scriptedCmdMatches(typedTrim, line.text, state.sandboxCwd)) {
          return acceptCommand(state, state.revealedLines);
        }
        // Empty SPACE → letter-by-letter autofill (never on the very first wake)
        if (!typedTrim) {
          return {
            ...state,
            autofillTarget: line.text,
            inputBuffer: '',
            cursorIndex: 0,
            historyBrowseIndex: null,
            failedCmds: [],
          };
        }
        // Working demo builtins — don't roast, don't advance the script
        if (isWorkingDemoCommand(typedTrim)) {
          const first = typedTrim.split(/\s+/)[0]?.toLowerCase() ?? '';
          if (first === 'help') return applyHelpTyped(state, typedTrim);
          // clear
          return {
            ...state,
            failedCmds: [],
            inputBuffer: '',
            cursorIndex: 0,
            historyBrowseIndex: null,
            autofillTarget: null,
            termClearAt: state.revealedLines,
            sandboxEchoes: [],
          };
        }
        // Cold-start sandbox: free Linux cmds actually work
        if (state.shellTier === 'user') {
          return applySandboxTyped(state, typedTrim);
        }
        // Root demo: roast basic Linux + did-you-mean
        return {
          ...state,
          failedCmds: [
            ...state.failedCmds,
            {
              typed: typedTrim,
              expected: line.text,
              isDemoOnly: isBasicLinuxCommand(typedTrim),
            },
          ],
          inputBuffer: '',
          cursorIndex: 0,
          historyBrowseIndex: null,
          autofillTarget: null,
        };
      }

      if (state.termMode === 'at-output') {
        return revealOutputBlock(state);
      }

      if (state.termMode === 'at-announce') {
        return revealAnnounce(state, state.revealedLines);
      }

      if (state.termMode === 'phase-end') {
        return tryAdvancePhase(state);
      }
      return state;
    }

    case 'AUTOFILL_TICK': {
      if (state.termMode !== 'at-cmd' || !state.autofillTarget) return state;
      if (state.alarm || state.policeArrived) return state;
      const target = state.autofillTarget;
      const nextLen = state.inputBuffer.length + 1;
      if (nextLen >= target.length) {
        return acceptCommand(
          { ...state, inputBuffer: target, cursorIndex: target.length, autofillTarget: null },
          state.revealedLines,
        );
      }
      return { ...state, inputBuffer: target.slice(0, nextLen), cursorIndex: nextLen };
    }

    case 'OUT_TICK': {
      if (state.typingOutIndex === null) return state;
      if (state.alarm || state.policeArrived) return state;
      const line = state.effectiveLines[state.typingOutIndex];
      if (!line || line.t !== 'out') return finishTypingOut(state);
      if (state.charIndex + 1 >= line.text.length) {
        return finishTypingOut({ ...state, charIndex: line.text.length });
      }
      return { ...state, charIndex: state.charIndex + 1 };
    }

    case 'HISTORY_UP': {
      if (!state.started || state.termMode !== 'at-cmd') return state;
      if (state.alarm || state.policeArrived) return state;
      if (state.cmdHistory.length === 0) return state;
      const idx = state.historyBrowseIndex === null
        ? state.cmdHistory.length - 1
        : Math.max(0, state.historyBrowseIndex - 1);
      const hist = state.cmdHistory[idx]!;
      return {
        ...state,
        historyBrowseIndex: idx,
        inputBuffer: hist,
        cursorIndex: hist.length,
        autofillTarget: null,
      };
    }

    case 'HISTORY_DOWN': {
      if (!state.started || state.termMode !== 'at-cmd') return state;
      if (state.alarm || state.policeArrived) return state;
      if (state.historyBrowseIndex === null) return state;
      if (state.historyBrowseIndex >= state.cmdHistory.length - 1) {
        return { ...state, historyBrowseIndex: null, inputBuffer: '', cursorIndex: 0, autofillTarget: null };
      }
      const idx = state.historyBrowseIndex + 1;
      const hist = state.cmdHistory[idx]!;
      return {
        ...state,
        historyBrowseIndex: idx,
        inputBuffer: hist,
        cursorIndex: hist.length,
        autofillTarget: null,
      };
    }

    case 'STEP_BACK': {
      // Demo rewind — works even during police/alarm so you can undo a bust
      if (!state.started) return state;
      if (state.checkpoints.length === 0) {
        if (state.inputBuffer || state.failedCmds.length || state.autofillTarget) {
          return { ...state, inputBuffer: '', cursorIndex: 0, failedCmds: [], autofillTarget: null, historyBrowseIndex: null };
        }
        return state;
      }
      const prev = state.checkpoints[state.checkpoints.length - 1]!;
      const rest = state.checkpoints.slice(0, -1);
      return {
        ...state,
        phase: prev.phase,
        effectiveLines: prev.effectiveLines,
        revealedLines: prev.revealedLines,
        choices: { ...prev.choices },
        siemDelayed: prev.siemDelayed,
        atm: { ...prev.atm },
        termMode: prev.termMode,
        inputBuffer: '',
        cursorIndex: 0,
        failedCmds: [],
        waitingForChoice: prev.waitingForChoice,
        cashAmount: prev.cashAmount,
        jackpotComplete: prev.jackpotComplete,
        customerWithdrawn: prev.customerWithdrawn,
        checkpoints: rest,
        charIndex: 0,
        autofillTarget: null,
        typingOutIndex: null,
        historyBrowseIndex: null,
        cmdHistory: [...prev.cmdHistory],
        policeTriggered: prev.policeTriggered,
        policeEtaSeconds: prev.policeEtaSeconds,
        policeArrived: prev.policeArrived,
        policeStrikeCount: prev.policeStrikeCount,
        lastEtaPenalty: prev.lastEtaPenalty,
        lastAlarmReason: prev.lastAlarmReason,
        alarm: prev.alarm,
        atmBeforeAlarm: prev.atmBeforeAlarm ? { ...prev.atmBeforeAlarm } : null,
        shellTier: prev.shellTier,
        sandboxCwd: prev.sandboxCwd,
        sandboxEchoes: prev.sandboxEchoes,
        showPloutusBanner: prev.showPloutusBanner,
      };
    }

    case 'TERM_TYPE': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      if (action.key.length !== 1) return state;
      // Manual typing cancels autofill
      const base = state.autofillTarget ? '' : state.inputBuffer;
      const idx = state.autofillTarget ? 0 : Math.min(state.cursorIndex, base.length);
      const next = base.slice(0, idx) + action.key + base.slice(idx);
      return {
        ...state,
        inputBuffer: next,
        cursorIndex: idx + 1,
        autofillTarget: null,
        historyBrowseIndex: null,
      };
    }

    case 'TERM_PASTE': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      // Strip newlines — paste as a single command line
      const pasted = action.text.replace(/[\r\n]+/g, ' ');
      if (!pasted) return state;
      const base = state.autofillTarget ? '' : state.inputBuffer;
      const idx = state.autofillTarget ? 0 : Math.min(state.cursorIndex, base.length);
      const next = base.slice(0, idx) + pasted + base.slice(idx);
      return {
        ...state,
        inputBuffer: next,
        cursorIndex: idx + pasted.length,
        autofillTarget: null,
        historyBrowseIndex: null,
      };
    }

    case 'TERM_TAB': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      const line = state.effectiveLines[state.revealedLines];
      const expected = line && line.t === 'cmd' ? line.text : null;
      const buf = state.autofillTarget ? '' : state.inputBuffer;

      // Prefer completing toward the scripted expected command when it's a prefix
      if (expected) {
        const toward = tabCompleteExpected(buf, expected);
        if (toward !== null && toward !== buf) {
          return {
            ...state,
            inputBuffer: toward,
            cursorIndex: toward.length,
            autofillTarget: null,
            historyBrowseIndex: null,
          };
        }
      }

      // User-tier: sandbox path/bin completion (cycles in-place, no listing dump)
      if (state.shellTier === 'user') {
        const result = tabCompleteSandbox(buf, state.sandboxCwd);
        if (result.buffer !== buf) {
          return {
            ...state,
            inputBuffer: result.buffer,
            cursorIndex: result.buffer.length,
            autofillTarget: null,
            historyBrowseIndex: null,
          };
        }
      }

      // Root-tier fallback: jump to full expected cmd if buffer is a strict prefix
      if (expected && expected.startsWith(buf) && buf.length > 0) {
        return {
          ...state,
          inputBuffer: expected,
          cursorIndex: expected.length,
          autofillTarget: null,
          historyBrowseIndex: null,
        };
      }
      return state;
    }

    case 'TERM_BACKSPACE': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      if (state.autofillTarget) {
        return { ...state, autofillTarget: null, inputBuffer: '', cursorIndex: 0, historyBrowseIndex: null };
      }
      if (state.cursorIndex <= 0) return state;
      const i = state.cursorIndex;
      const next = state.inputBuffer.slice(0, i - 1) + state.inputBuffer.slice(i);
      return { ...state, inputBuffer: next, cursorIndex: i - 1, historyBrowseIndex: null };
    }

    case 'TERM_DELETE': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      if (state.autofillTarget) {
        return { ...state, autofillTarget: null, inputBuffer: '', cursorIndex: 0, historyBrowseIndex: null };
      }
      if (state.cursorIndex >= state.inputBuffer.length) return state;
      const i = state.cursorIndex;
      const next = state.inputBuffer.slice(0, i) + state.inputBuffer.slice(i + 1);
      return { ...state, inputBuffer: next, cursorIndex: i, historyBrowseIndex: null };
    }

    case 'TERM_CURSOR': {
      if (!state.started || state.alarm || state.policeArrived) return state;
      if (state.termMode !== 'at-cmd') return state;
      if (state.autofillTarget) {
        return { ...state, autofillTarget: null, inputBuffer: '', cursorIndex: 0, historyBrowseIndex: null };
      }
      const len = state.inputBuffer.length;
      let next = state.cursorIndex;
      if (action.dir === 'left') next = Math.max(0, state.cursorIndex - 1);
      else if (action.dir === 'right') next = Math.min(len, state.cursorIndex + 1);
      else if (action.dir === 'home') next = 0;
      else next = len;
      if (next === state.cursorIndex) return state;
      return { ...state, cursorIndex: next, historyBrowseIndex: null };
    }

    case 'CHOOSE': {
      if (!state.waitingForChoice || state.policeArrived || state.alarm) return state;
      const choiceId = state.waitingForChoice;
      const cfg = CHOICES[choiceId];
      const option = cfg.options.find(o => o.key === action.key);
      if (!option) return state;

      if (option.outcome === 'wrong') {
        const reason = option.wrongReason ?? 'Operation detected';
        const wrongAtm = applyChoiceToAtm(state.atm, choiceId, action.key);
        // Checkpoint BEFORE the bust so CTRL+SPACE can rewind it
        const withCp = pushCheckpoint(state);
        return applyPoliceTrigger(
          { ...withCp, atmBeforeAlarm: { ...state.atm } },
          reason,
          true,
          state.revealedLines,
          wrongAtm,
        );
      }

      const withCp = pushCheckpoint(state);
      const contKey = `${choiceId}:${action.key}`;
      const contLines = CONTINUATIONS[contKey] ?? [];
      // Insert continuations AFTER the choice line so it stays in history
      const choiceIdx = withCp.revealedLines;
      const newLines = [
        ...withCp.effectiveLines.slice(0, choiceIdx + 1),
        ...contLines,
        ...withCp.effectiveLines.slice(choiceIdx + 1),
      ];
      const newChoices = updateChoices(withCp.choices, choiceId, action.key);
      const newAtm = applyChoiceToAtm(withCp.atm, choiceId, action.key);
      const newSiemDelayed = withCp.siemDelayed || (choiceId === 'ethernet' && action.key === '2');

      // Move past the choice line into continuations / next content
      return settleAt(
        {
          ...withCp,
          choices: newChoices,
          atm: newAtm,
          siemDelayed: newSiemDelayed,
          waitingForChoice: null,
        },
        choiceIdx + 1,
        newLines,
      );
    }

    case 'CASH_TICK': {
      if (state.phase !== 6 || state.jackpotComplete || state.policeArrived || state.alarm) return state;
      const cap = jackpotTarget(state);
      const next = Math.min(state.cashAmount + 2500, cap);
      return { ...state, cashAmount: next, atm: { ...state.atm, dispensing: true } };
    }

    case 'JACKPOT_COMPLETE':
      if (state.policeArrived) return state;
      return {
        ...state,
        jackpotComplete: true,
        cashAmount: jackpotTarget(state),
        atm: { ...state.atm, dispensing: false },
      };

    case 'ATM_DISPENSE_DONE': {
      // Finite customer withdraw burst finished (jackpot rain uses CASH_TICK / JACKPOT_COMPLETE)
      if (state.atm.screenMode === 'jackpot') return state;
      if (!state.atm.dispensing) return state;
      return { ...state, atm: { ...state.atm, dispensing: false } };
    }

    case 'POLICE_TICK': {
      if (state.policeEtaSeconds === null || state.policeArrived) return state;
      if (state.policeEtaSeconds <= 1) return applyPoliceArrived(state);
      return {
        ...state,
        policeEtaSeconds: state.policeEtaSeconds - 1,
        lastEtaPenalty: null,
      };
    }

    case 'POLICE_ARRIVED':
      return applyPoliceArrived(state);

    case 'CLEAR_ETA_PENALTY':
      if (state.lastEtaPenalty === null) return state;
      return { ...state, lastEtaPenalty: null };

    case 'DISMISS_ALARM': {
      if (!state.alarm?.recoverable || state.policeArrived) return state;
      const resetTo = state.alarm.resetToLine >= 0 ? state.alarm.resetToLine : state.revealedLines;
      return settleAt(
        {
          ...state,
          alarm: null,
          atm: state.atmBeforeAlarm ? { ...state.atmBeforeAlarm } : state.atm,
          atmBeforeAlarm: null,
        },
        resetTo,
      );
    }

    case 'RESET':
      return makeInitialState();

    /* ── ATM UI actions ── */

    case 'ATM_INSERT_CARD': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState !== 'idle') return state;
      return { ...state, atmUiState: 'inserting', pinBuffer: '', inputFocus: 'atm' };
    }

    case 'ATM_CARD_ANIM_DONE': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState === 'inserting') {
        return { ...state, atmUiState: 'pin', pinBuffer: '', inputFocus: 'atm' };
      }
      if (state.atmUiState === 'ejecting') {
        return {
          ...state,
          atmUiState: 'idle',
          pinBuffer: '',
          amountBuffer: '',
          lastWithdrawAmount: 0,
          atm: { ...state.atm, dispensing: false },
        };
      }
      return state;
    }

    case 'ATM_PIN_DIGIT': {
      if (state.alarm || state.policeArrived) return state;
      const { digit } = action;
      // Must insert card before PIN — digits do nothing on idle
      if (state.atmUiState === 'idle' || state.atmUiState === 'inserting' || state.atmUiState === 'ejecting') {
        return state;
      }
      if (state.atmUiState === 'pin') {
        // Wrong PIN: next digit starts a fresh attempt
        if (state.pinBuffer.length >= 4 && state.pinBuffer !== '1234') {
          return { ...state, pinBuffer: digit };
        }
        if (state.pinBuffer.length >= 4) return state;
        const buf = state.pinBuffer + digit;
        if (buf === '1234') return { ...state, pinBuffer: buf, atmUiState: 'menu' };
        return { ...state, pinBuffer: buf };
      }
      if (state.atmUiState === 'menu') {
        if (digit === '1') return { ...state, atmUiState: 'balance' };
        if (digit === '2') return { ...state, atmUiState: 'amount', amountBuffer: '' };
        if (digit === '3') return { ...state, atmUiState: 'ejecting', pinBuffer: '', amountBuffer: '' };
      }
      // Amount screen: presets only (tap $20/$40/$100/$200) — no custom typing
      return state;
    }

    case 'ATM_AMOUNT': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState !== 'amount') return state;
      return tryWithdraw(state, action.amount);
    }

    case 'ATM_CLEAR': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState === 'pin') return { ...state, pinBuffer: '' };
      if (state.atmUiState === 'amount') {
        return { ...state, atmUiState: 'menu', amountBuffer: '' };
      }
      if (state.atmUiState === 'error') return { ...state, atmUiState: 'menu', atmError: '' };
      // Card stays in for more transactions — only Exit (menu #3) ejects
      if (state.atmUiState === 'thankyou' || state.atmUiState === 'withdraw') {
        return { ...state, atmUiState: 'menu', amountBuffer: '', atm: { ...state.atm, dispensing: false } };
      }
      if (state.atmUiState === 'menu' || state.atmUiState === 'balance') {
        return { ...state, atmUiState: 'ejecting', pinBuffer: '', amountBuffer: '' };
      }
      return state;
    }

    case 'ATM_ENTER': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState === 'idle') {
        return { ...state, atmUiState: 'inserting', pinBuffer: '', inputFocus: 'atm' };
      }
      if (state.atmUiState === 'pin') {
        if (state.pinBuffer === '1234') return { ...state, atmUiState: 'menu', pinBuffer: '' };
        return { ...state, pinBuffer: '' };
      }
      if (state.atmUiState === 'balance') return { ...state, atmUiState: 'menu' };
      // Amount screen: Enter does nothing — pick a preset button
      if (state.atmUiState === 'amount') return state;
      if (state.atmUiState === 'withdraw') {
        // Stay in session — back to menu for another withdrawal
        return { ...state, atmUiState: 'menu', atm: { ...state.atm, dispensing: false } };
      }
      if (state.atmUiState === 'error') return { ...state, atmUiState: 'menu', atmError: '' };
      if (state.atmUiState === 'thankyou') {
        return { ...state, atmUiState: 'menu', amountBuffer: '' };
      }
      return state;
    }

    case 'ATM_MENU': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState === 'amount' && action.choice === 'cancel') {
        return { ...state, atmUiState: 'menu', amountBuffer: '' };
      }
      if (state.atmUiState === 'menu') {
        if (action.choice === 'balance') return { ...state, atmUiState: 'balance' };
        if (action.choice === 'cancel') return { ...state, atmUiState: 'ejecting', pinBuffer: '', amountBuffer: '' };
        if (action.choice === 'withdraw') return { ...state, atmUiState: 'amount', amountBuffer: '' };
      }
      return state;
    }

    case 'SET_INPUT_FOCUS':
      return state.inputFocus === action.focus ? state : { ...state, inputFocus: action.focus };

    case 'ATM_OK': {
      if (state.alarm || state.policeArrived) return state;
      if (state.atmUiState === 'idle') {
        return { ...state, atmUiState: 'inserting', pinBuffer: '', inputFocus: 'atm' };
      }
      if (state.atmUiState === 'balance') return { ...state, atmUiState: 'menu' };
      if (state.atmUiState === 'withdraw') {
        // Stay in session — back to menu for another withdrawal
        return { ...state, atmUiState: 'menu', atm: { ...state.atm, dispensing: false } };
      }
      if (state.atmUiState === 'error') return { ...state, atmUiState: 'menu', atmError: '' };
      if (state.atmUiState === 'thankyou') {
        return { ...state, atmUiState: 'menu', amountBuffer: '', lastWithdrawAmount: 0 };
      }
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
  const [cheatOpen, setCheatOpen] = useState(false);
  const cashTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  const cheatOpenRef = useRef(cheatOpen);
  /** Ignore SPACE briefly after cold-start so key-repeat doesn't autofill */
  const ignoreSpaceUntilRef = useRef(0);
  stateRef.current = state;
  cheatOpenRef.current = cheatOpen;

  const currentCheatCmd = (() => {
    if (state.termMode !== 'at-cmd' || state.waitingForChoice) return null;
    const line = state.effectiveLines[state.revealedLines];
    return line?.t === 'cmd' ? line.text : null;
  })();

  /* Cash counter — only after all phase-6 terminal lines have finished */
  const phase6LinesDone =
    state.phase === 6 &&
    state.termMode === 'phase-end' &&
    !state.waitingForChoice;

  useEffect(() => {
    if (phase6LinesDone && !state.jackpotComplete && !state.alarm && !state.policeArrived) {
      cashTickRef.current = setInterval(() => {
        dispatch({ type: 'CASH_TICK' });
        Sounds.cashClick();
      }, 60);
    }
    return () => { if (cashTickRef.current) clearInterval(cashTickRef.current); };
  }, [phase6LinesDone, state.jackpotComplete, state.alarm, state.policeArrived]);

  /* Jackpot complete when counter hits cassette total minus prior customer withdrawals */
  const jackpotCap = JACKPOT_CASSETTE_TOTAL - state.customerWithdrawn;
  useEffect(() => {
    if (state.cashAmount >= jackpotCap && jackpotCap >= 0 && !state.jackpotComplete && !state.policeArrived) {
      dispatch({ type: 'JACKPOT_COMPLETE' });
      Sounds.jackpotWin();
    }
  }, [state.cashAmount, jackpotCap, state.jackpotComplete, state.policeArrived]);

  /* Customer withdraw: one note per preset — stop rain after a single bill burst */
  useEffect(() => {
    if (!state.atm.dispensing) return;
    if (state.atm.screenMode === 'jackpot') return; // phase-6 rain is continuous until complete
    if (state.atmUiState !== 'withdraw' && state.lastWithdrawAmount <= 0) return;
    const ms = 1350;
    const t = setTimeout(() => dispatch({ type: 'ATM_DISPENSE_DONE' }), ms);
    return () => clearTimeout(t);
  }, [state.atm.dispensing, state.atm.screenMode, state.atmUiState, state.lastWithdrawAmount]);

  /* Police ETA countdown — owned by reducer, not the overlay */
  const policeTicking = state.policeEtaSeconds !== null && !state.policeArrived && state.policeEtaSeconds > 0;
  useEffect(() => {
    if (!policeTicking) return;
    const iv = setInterval(() => dispatch({ type: 'POLICE_TICK' }), 1000);
    return () => clearInterval(iv);
  }, [policeTicking]);

  /* Arrival sting once when bust latches */
  const prevArrivedRef = useRef(false);
  useEffect(() => {
    if (state.policeArrived && !prevArrivedRef.current) {
      Sounds.policeArrived();
    }
    prevArrivedRef.current = state.policeArrived;
  }, [state.policeArrived]);

  /* Siren on recoverable/blocking alarm — not during final bust (arrival sting owns that) */
  useEffect(() => {
    if (state.alarm && !state.policeArrived) {
      Sounds.siren();
    } else if (!state.alarm) {
      Sounds.stopSiren();
    }
  }, [state.alarm, state.policeArrived]);

  /* Penalty chirp + clear chip after a beat */
  useEffect(() => {
    if (state.lastEtaPenalty == null || state.lastEtaPenalty <= 0) return;
    Sounds.etaPenalty();
    const t = setTimeout(() => dispatch({ type: 'CLEAR_ETA_PENALTY' }), 1600);
    return () => clearTimeout(t);
  }, [state.lastEtaPenalty, state.policeStrikeCount]);

  /* Wrong-command chirp */
  const failCountRef = useRef(0);
  useEffect(() => {
    if (state.failedCmds.length > failCountRef.current) Sounds.wrong();
    failCountRef.current = state.failedCmds.length;
  }, [state.failedCmds.length]);

  /* Autofill typewriter — letter-by-letter with keypress sounds */
  useEffect(() => {
    if (!state.autofillTarget || state.termMode !== 'at-cmd') return;
    if (state.alarm || state.policeArrived) return;
    const t = setTimeout(() => {
      Sounds.keypress();
      dispatch({ type: 'AUTOFILL_TICK' });
    }, 28);
    return () => clearTimeout(t);
  }, [state.autofillTarget, state.inputBuffer, state.termMode, state.alarm, state.policeArrived]);

  /* Narrative out typewriter (e.g. on-site line after phase header) */
  useEffect(() => {
    if (state.typingOutIndex === null) return;
    if (state.alarm || state.policeArrived) return;
    const line = state.effectiveLines[state.typingOutIndex];
    if (!line || line.t !== 'out') return;
    if (state.charIndex >= line.text.length) {
      dispatch({ type: 'OUT_TICK' });
      return;
    }
    const t = setTimeout(() => {
      if (state.charIndex % 3 === 0) Sounds.keypress();
      dispatch({ type: 'OUT_TICK' });
    }, 12);
    return () => clearTimeout(t);
  }, [state.typingOutIndex, state.charIndex, state.effectiveLines, state.alarm, state.policeArrived]);

  /* Keyboard — narrative SPACE/ENTER, CTRL+SPACE back, typed commands, ↑ history */
  useEffect(() => {
    const hasTextSelection = () => {
      const sel = window.getSelection();
      return !!sel && sel.toString().length > 0;
    };

    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;

      // Never hijack copy / paste / select-all / cut — let the browser handle them
      if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'v', 'V', 'a', 'A', 'x', 'X'].includes(e.key)) {
        return;
      }

      // Cheat sheet open: Escape closes; terminal keys still work underneath
      if (cheatOpenRef.current && e.key === 'Escape') {
        e.preventDefault();
        setCheatOpen(false);
        return;
      }

      // CTRL+SPACE → step back (hidden demo control; works during police)
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        Sounds.keypress();
        Sounds.stopSiren();
        dispatch({ type: 'STEP_BACK' });
        return;
      }

      const atmFocused = s.inputFocus === 'atm';

      // ATM focus: digits / CLR / OK go to the pad (click ATM to steal focus from terminal)
      if (atmFocused && !s.alarm && !s.policeArrived) {
        // Card mid-animation — ignore pad input
        if (s.atmUiState === 'inserting' || s.atmUiState === 'ejecting') {
          if (e.code === 'Space' || e.key === 'Enter' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
            e.preventDefault();
          }
          return;
        }
        if (/^[0-9]$/.test(e.key) && !s.waitingForChoice) {
          e.preventDefault();
          Sounds.pinPress();
          dispatch({ type: 'ATM_PIN_DIGIT', digit: e.key });
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Escape') {
          e.preventDefault();
          dispatch({ type: 'ATM_CLEAR' });
          return;
        }
        if (e.key === 'Enter') {
          if (hasTextSelection()) return;
          e.preventDefault();
          dispatch({ type: 'ATM_ENTER' });
          return;
        }
        // Don't let SPACE/letters advance the terminal while driving the ATM
        if (e.code === 'Space' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
          e.preventDefault();
          return;
        }
      }

      // SPACE → advance / start autofill. At a cmd prompt with typed text, SPACE is a literal.
      // If the user is highlighting text to explain, don't steal SPACE.
      if (e.code === 'Space' && !e.ctrlKey) {
        if (hasTextSelection()) return;
        e.preventDefault();
        if (Date.now() < ignoreSpaceUntilRef.current) return;
        if (
          s.started &&
          s.termMode === 'at-cmd' &&
          !s.alarm &&
          !s.policeArrived &&
          !s.autofillTarget &&
          s.inputBuffer.length > 0
        ) {
          Sounds.keypress();
          dispatch({ type: 'TERM_TYPE', key: ' ' });
          return;
        }
        // First SPACE only wakes the prompt — block key-repeat from autofilling
        if (!s.started) {
          ignoreSpaceUntilRef.current = Date.now() + 350;
        }
        Sounds.advance();
        dispatch({ type: 'ADVANCE' });
        return;
      }

      // Reset — only when not typing a command (so `curl` etc. work)
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && s.termMode !== 'at-cmd') {
        if (hasTextSelection()) return;
        Sounds.stopSiren();
        dispatch({ type: 'RESET' });
        return;
      }

      if (e.key === 'ArrowUp') {
        if (s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'HISTORY_UP' });
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        if (s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'HISTORY_DOWN' });
        }
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (!atmFocused && s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_CURSOR', dir: 'left' });
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        if (!atmFocused && s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_CURSOR', dir: 'right' });
        }
        return;
      }
      if (e.key === 'Home') {
        if (!atmFocused && s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_CURSOR', dir: 'home' });
        }
        return;
      }
      if (e.key === 'End') {
        if (!atmFocused && s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_CURSOR', dir: 'end' });
        }
        return;
      }
      if (e.key === 'Delete') {
        if (!atmFocused && s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_DELETE' });
        }
        return;
      }

      if (e.key === 'Enter') {
        if (hasTextSelection()) return;
        e.preventDefault();
        if (s.alarm?.recoverable && !s.policeArrived) {
          dispatch({ type: 'DISMISS_ALARM' });
          return;
        }
        // Narrative takes Enter while stepping through the terminal
        if (
          s.started &&
          !s.policeArrived &&
          !s.waitingForChoice &&
          (s.termMode === 'at-cmd' || s.termMode === 'at-output' || s.termMode === 'at-announce' || s.termMode === 'phase-end')
        ) {
          Sounds.advance();
          dispatch({ type: 'ADVANCE' });
          return;
        }
        if (!s.alarm && !s.policeArrived && !s.waitingForChoice) {
          dispatch({ type: 'ATM_ENTER' });
        }
        return;
      }

      if (e.key === 'Backspace') {
        if (s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          dispatch({ type: 'TERM_BACKSPACE' });
        }
        return;
      }

      if (e.key === 'Tab') {
        if (s.termMode === 'at-cmd' && s.started && !s.alarm && !s.policeArrived) {
          e.preventDefault();
          Sounds.keypress();
          dispatch({ type: 'TERM_TAB' });
        }
        return;
      }

      // Choice keys
      if (['1', '2', '3'].includes(e.key) && s.waitingForChoice && !s.policeArrived && !s.alarm) {
        const cfg = CHOICES[s.waitingForChoice];
        const opt = cfg.options.find(o => o.key === e.key);
        if (opt?.outcome === 'wrong') Sounds.wrong();
        else Sounds.correct();
        dispatch({ type: 'CHOOSE', key: e.key as '1' | '2' | '3' });
        return;
      }

      // Typed command input (printable, excluding control)
      if (
        s.started &&
        s.termMode === 'at-cmd' &&
        !s.alarm &&
        !s.policeArrived &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        Sounds.keypress();
        dispatch({ type: 'TERM_TYPE', key: e.key });
        return;
      }

      // ATM digit input when terminal-focused but not mid-command (idle between beats)
      if (
        /^[0-9]$/.test(e.key) &&
        !s.alarm &&
        !s.policeArrived &&
        !s.waitingForChoice &&
        s.termMode !== 'at-cmd' &&
        (s.atmUiState === 'idle' || s.atmUiState === 'pin' || s.atmUiState === 'menu' || s.atmUiState === 'amount')
      ) {
        Sounds.pinPress();
        dispatch({ type: 'ATM_PIN_DIGIT', digit: e.key });
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const s = stateRef.current;
      if (!s.started || s.termMode !== 'at-cmd' || s.alarm || s.policeArrived) return;
      const text = e.clipboardData?.getData('text');
      if (!text) return;
      e.preventDefault();
      dispatch({ type: 'TERM_PASTE', text });
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('paste', onPaste);
    };
  }, []);

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
  const handleAtmAmountSelect = useCallback((amount: number) => {
    dispatch({ type: 'ATM_AMOUNT', amount });
  }, []);
  const handleAtmInsertCard = useCallback(() => {
    dispatch({ type: 'ATM_INSERT_CARD' });
  }, []);
  const handleAtmCardAnimDone = useCallback(() => {
    dispatch({ type: 'ATM_CARD_ANIM_DONE' });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0c0c0c', color: '#cccccc', fontFamily: '"Courier New", Courier, monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header — light chrome */}
      <div style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 10, color: '#e8203a', textShadow: '2px 2px 0 #a81428', animation: 'glitch 6s infinite', fontFamily: '"Courier New", Courier, monospace' }}>
          JACKPOT
        </div>
        <button
          type="button"
          onClick={() => setCheatOpen((v) => !v)}
          title="Train de Aqua Notes"
          style={{
            background: '#e8203a',
            border: '2px solid #a81428',
            color: '#fff',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            padding: '8px 14px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '2px 2px 0 #a8142844',
            opacity: cheatOpen ? 0.85 : 1,
          }}
        >
          Cheat Sheet
        </button>
      </div>

      {/* Phase bar — light */}
      <div style={{ background: '#f0f2f5', borderBottom: '1px solid #dee2e6', padding: '6px 24px', display: 'flex', gap: 3, flexShrink: 0 }}>
        {PHASE_LABELS.map((label, i) => {
          const ph = i + 1;
          const isActive = ph === state.phase;
          return (
            <div key={ph} style={{ flex: 1, textAlign: 'center', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '8px 4px', border: `1px solid ${isActive ? '#e8203a' : '#ccc'}`, color: isActive ? '#fff' : '#888', background: isActive ? '#e8203a' : '#e9ecef', fontFamily: 'Arial, sans-serif', fontWeight: isActive ? 700 : 600 }}>
              {label}
            </div>
          );
        })}
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {/* Terminal — left 55% */}
        <div
          onMouseDown={() => dispatch({ type: 'SET_INPUT_FOCUS', focus: 'terminal' })}
          style={{ width: '55%', borderRight: '1px solid #00ff8820', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div style={{ background: '#1e1e1e', borderBottom: '1px solid #2d2d2d', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9a9a9a', flexShrink: 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 8 }}>
              {state.shellTier === 'root'
                ? 'root@kali:/root/ploutus'
                : `danny@kali:${cwdDisplayFor(state)}`}
            </span>
          </div>
          <TerminalPanel
            lines={state.effectiveLines}
            revealedLines={state.revealedLines}
            waitingForChoice={state.waitingForChoice}
            cashAmount={state.cashAmount}
            jackpotComplete={state.jackpotComplete}
            phaseId={state.phase}
            started={state.started}
            termMode={state.termMode}
            inputBuffer={state.inputBuffer}
            cursorIndex={state.cursorIndex}
            failedCmds={state.failedCmds}
            charIndex={state.charIndex}
            typingOutIndex={state.typingOutIndex}
            termClearAt={state.termClearAt}
            shellTier={state.shellTier}
            cwdDisplay={cwdDisplayFor(state)}
            showPloutusBanner={state.showPloutusBanner}
            sandboxEchoes={state.sandboxEchoes}
          />
        </div>

        {/* ATM panel — WELSH PHARGO branch exterior */}
        <div
          onMouseDown={() => dispatch({ type: 'SET_INPUT_FOCUS', focus: 'atm' })}
          style={{ width: '45%', background: '#c8c3bc', position: 'relative', overflow: 'visible' }}
        >
          {/* Stone block wall texture */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(0,0,0,0.055) 48px), repeating-linear-gradient(90deg, transparent, transparent 95px, rgba(0,0,0,0.04) 96px)', pointerEvents: 'none', zIndex: 0 }} />
          {/* WELSH PHARGO red header signage */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#e8203a', padding: '16px 0 14px', textAlign: 'center', zIndex: 2, borderBottom: '3px solid #a81428' }}>
            <div style={{ color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: 18, letterSpacing: 0, textTransform: 'uppercase' }}>WELSH PHARGO</div>
            <div style={{ color: '#ffcd11', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0, marginTop: 3 }}>24-HOUR ATM</div>
          </div>
          {/* Center ATM in the brick area below the red band — overflow visible so side callouts aren't clipped */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 58, bottom: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', boxSizing: 'border-box', overflow: 'visible' }}>
            <AtmSvg
              state={state.atm}
              atmUiState={state.atmUiState}
              pinBuffer={state.pinBuffer}
              atmBalance={state.atmBalance}
              lastWithdrawAmount={state.lastWithdrawAmount}
              atmError={state.atmError}
              onPinDigit={handleAtmPinDigit}
              onClear={handleAtmClear}
              onEnter={handleAtmEnter}
              onMenuChoice={handleAtmMenu}
              onAmountSelect={handleAtmAmountSelect}
              onAtmOk={handleAtmOk}
              onInsertCard={handleAtmInsertCard}
              onCardAnimDone={handleAtmCardAnimDone}
            />
          </div>
          {/* Police timer — mounts on first alarm, stays until Reset */}
          {state.policeTriggered && state.policeEtaSeconds !== null && (
            <AlarmOverlay
              reason={state.alarm?.reason ?? state.lastAlarmReason}
              isBlocking={state.alarm !== null || state.policeArrived}
              recoverable={(state.alarm?.recoverable ?? false) && !state.policeArrived}
              etaSeconds={state.policeEtaSeconds}
              arrived={state.policeArrived}
              strikeCount={state.policeStrikeCount}
              lastEtaPenalty={state.lastEtaPenalty}
            />
          )}
          <CheatSheet
            open={cheatOpen}
            onClose={() => setCheatOpen(false)}
            phase={state.phase}
            waitingForChoice={state.waitingForChoice}
            currentCmd={currentCheatCmd}
            choices={state.choices}
            started={state.started}
            sandboxCwd={state.sandboxCwd}
            {...computeCheatUnlocks(
              state.effectiveLines,
              state.revealedLines,
              state.waitingForChoice,
            )}
          />
        </div>
      </div>

      <style>{`@keyframes glitch{0%,90%,100%{text-shadow:2px 2px 0 #a81428}92%{text-shadow:-2px 0 #0066ff88,2px 0 #e8203a}94%{text-shadow:2px 0 #e8203a,-2px 0 #0066ff55}}`}</style>
    </div>
  );
}
