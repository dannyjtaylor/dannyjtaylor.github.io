import type {
  TermLine,
  ToolChoices,
  AtmVisualState,
  PhaseId,
  TermMode,
  FailedCmd,
  NarrativeCheckpoint,
} from './types';
import { PHASE_LINES, ATM_INITIAL } from './phaseData';

export type { TermMode, FailedCmd, NarrativeCheckpoint };

export function normalizeCmd(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

export function cmdsMatch(typed: string, expected: string): boolean {
  return normalizeCmd(typed) === normalizeCmd(expected);
}

/** Skip blanks/banner starting at idx; return first meaningful index (or lines.length). */
export function skipNoise(lines: TermLine[], idx: number): number {
  let i = idx;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.t === 'blank' || line.t === 'banner') {
      i += 1;
      continue;
    }
    break;
  }
  return i;
}

export function lineAt(lines: TermLine[], idx: number): TermLine | undefined {
  return lines[idx];
}

/** Classify what the player faces at revealedLines (after skipping noise). */
export function classifyAt(lines: TermLine[], revealedLines: number): {
  index: number;
  mode: TermMode;
  line: TermLine | undefined;
} {
  const index = skipNoise(lines, revealedLines);
  const line = lines[index];
  if (!line) return { index, mode: 'phase-end', line: undefined };
  if (line.t === 'choice') return { index, mode: 'at-choice', line };
  if (line.t === 'cmd') return { index, mode: 'at-cmd', line };
  if (line.t === 'out') return { index, mode: 'at-announce', line };
  return { index, mode: 'phase-end', line: undefined };
}

/**
 * End index (exclusive) of an output block starting at `start`.
 * Consumes outs + blanks until the next cmd/choice (or end of phase),
 * so one SPACE dumps a full command's stdout like a real terminal.
 */
export function outputBlockEnd(lines: TermLine[], start: number): number {
  let i = start;
  while (i < lines.length) {
    const t = lines[i]!.t;
    if (t === 'out' || t === 'blank' || t === 'banner') {
      i += 1;
      continue;
    }
    break;
  }
  return i;
}

/** After accepting a cmd at `cmdIndex`, find where its output block starts (may skip blanks). */
export function outputStartAfterCmd(lines: TermLine[], cmdIndex: number): number {
  return skipNoise(lines, cmdIndex + 1);
}

export function rebuildAtmFromChoices(choices: ToolChoices): AtmVisualState {
  let atm: AtmVisualState = { ...ATM_INITIAL };

  if (choices.panelAccess === 'tbar') {
    atm = { ...atm, panelOpen: true, accessMethod: 'tbar', showDoorAjar: false };
  } else if (choices.panelAccess === 'social') {
    atm = { ...atm, panelOpen: true, accessMethod: 'social', showDoorAjar: false };
  }

  if (choices.ethernet === 'loopback') atm = { ...atm, ethState: 'loopback' };
  else if (choices.ethernet === 'cut') atm = { ...atm, ethState: 'cut' };
  else if (choices.ethernet === 'live') atm = { ...atm, ethState: 'intact' };

  if (choices.alarmSensor === 'clamp') {
    atm = { ...atm, showClamp: true, showSensorCut: false, showDoorAjar: false };
  }

  if (choices.installMethod === 'hdd') {
    atm = { ...atm, driveState: 'removed', showLaptop: true, showUsbStick: false, showBlackbox: false };
  } else if (choices.installMethod === 'blackbox') {
    atm = { ...atm, showBlackbox: true, showLaptop: false, showUsbStick: false };
  }

  if (choices.persistMethod === 'reseal') {
    atm = {
      ...atm,
      driveState: atm.driveState === 'removed' ? 'reinstalled' : atm.driveState,
      panelOpen: false,
      showLaptop: false,
      showUsbStick: false,
      showClamp: false,
      showSensorCut: false,
      showDoorAjar: false,
      accessMethod: null,
      screenMode: 'reboot',
    };
  }

  if (choices.activateMethod === 'keyboard') {
    atm = { ...atm, screenMode: 'ploutus', showExtKeyboard: true, showMule: true, showPhone: false };
  }

  return atm;
}

export function phaseBaseLines(phase: PhaseId): TermLine[] {
  return PHASE_LINES[phase]!;
}
