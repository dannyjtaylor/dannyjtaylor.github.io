export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

export type ChoiceId =
  | 'panel-access'
  | 'ethernet'
  | 'alarm-sensor'
  | 'install-method';

export type TermLine =
  | { t: 'banner' }
  | { t: 'blank' }
  | { t: 'cmd'; text: string }
  | { t: 'out'; text: string; s?: 'ok' | 'warn' | 'err' | 'hi' | 'ann' }
  | { t: 'choice'; id: ChoiceId };

export interface ChoiceOption {
  key: '1' | '2' | '3';
  label: string;
  outcome: 'correct' | 'partial' | 'wrong';
  wrongReason?: string;
}

export interface ChoiceConfig {
  prompt: string;
  options: ChoiceOption[];
}

export interface ToolChoices {
  panelAccess: 'tbar' | 'social' | null;
  ethernet: 'loopback' | 'cut' | 'live' | null;
  alarmSensor: 'clamp' | null;
  installMethod: 'hdd' | 'usb' | 'blackbox' | null;
}

export interface AtmVisualState {
  panelOpen: boolean;
  ethState: 'intact' | 'loopback' | 'cut';
  driveState: 'present' | 'removed' | 'reinstalled';
  showLaptop: boolean;
  showBlackbox: boolean;
  screenMode: 'normal' | 'reboot' | 'ploutus' | 'activate' | 'jackpot';
  showExtKeyboard: boolean;
  dispensing: boolean;
  showCassetteCutaway: boolean;
  showMule: boolean;
}

export interface GameState {
  phase: PhaseId;
  effectiveLines: TermLine[];
  revealedLines: number;
  charIndex: number;
  waitingForChoice: ChoiceId | null;
  choices: ToolChoices;
  siemDelayed: boolean;
  alarm: { active: boolean; reason: string } | null;
  atm: AtmVisualState;
  cashAmount: number;
  jackpotComplete: boolean;
}

export type Action =
  | { type: 'SPACE' }
  | { type: 'CHOOSE'; key: '1' | '2' | '3' }
  | { type: 'CHAR_TICK' }
  | { type: 'LINE_ADVANCE' }
  | { type: 'DISMISS_ALARM' }
  | { type: 'CASH_TICK' }
  | { type: 'JACKPOT_COMPLETE' }
  | { type: 'RESET' };
