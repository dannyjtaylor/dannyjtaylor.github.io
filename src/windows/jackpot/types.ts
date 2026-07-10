export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

export type ChoiceId =
  | 'panel-access'
  | 'ethernet'
  | 'alarm-sensor'
  | 'install-method'
  | 'persist-method'
  | 'activate-method';

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
  persistMethod: 'reseal' | null;
  activateMethod: 'keyboard' | null;
}

export interface AtmVisualState {
  panelOpen: boolean;
  ethState: 'intact' | 'loopback' | 'cut';
  driveState: 'present' | 'removed' | 'reinstalled';
  showLaptop: boolean;
  showBlackbox: boolean;
  screenMode: 'normal' | 'reboot' | 'ploutus' | 'jackpot' | 'seized';
  showExtKeyboard: boolean;
  dispensing: boolean;
  showCassetteCutaway: boolean;
  showMule: boolean;
  showClamp: boolean;
  /** How the top-hat was opened */
  accessMethod: 'tbar' | 'social' | 'crowbar' | null;
  /** USB live-OS stick in the ATM USB port */
  showUsbStick: boolean;
  /** Alarm sensor wire severed */
  showSensorCut: boolean;
  /** Door left ajar / sensor ignored */
  showDoorAjar: boolean;
  /** Mule calling activation server on phone */
  showPhone: boolean;
  /** Fresh tamper tape after reseal */
  showTamperTape: boolean;
}

export type AtmUiState =
  | 'idle'
  | 'inserting'
  | 'pin'
  | 'menu'
  | 'balance'
  | 'amount'
  | 'withdraw'
  | 'error'
  | 'thankyou'
  | 'ejecting';

/** Interactive terminal pacing mode */
export type TermMode = 'at-cmd' | 'at-output' | 'at-announce' | 'at-choice' | 'phase-end';

/** danny@kali sandbox vs root@kali scripted demo */
export type ShellTier = 'user' | 'root';

export interface FailedCmd {
  typed: string;
  expected: string;
  /** true = recognized a real Linux cmd that isn't part of this demo */
  isDemoOnly?: boolean;
}

/** Free-explore / sandbox command echo shown above the live prompt */
export interface SandboxEcho {
  cmd: string;
  lines: string[];
  /** Prompt tier when the cmd was run */
  tier: ShellTier;
  cwdDisplay: string;
}

/** Snapshot for CTRL+SPACE undo (includes police so demo can rewind a bust) */
export interface NarrativeCheckpoint {
  phase: PhaseId;
  effectiveLines: TermLine[];
  revealedLines: number;
  choices: ToolChoices;
  siemDelayed: boolean;
  atm: AtmVisualState;
  termMode: TermMode;
  inputBuffer: string;
  failedCmds: FailedCmd[];
  waitingForChoice: ChoiceId | null;
  cashAmount: number;
  jackpotComplete: boolean;
  /** Sum of customer ATM withdrawals this run (subtracted from jackpot cassette total) */
  customerWithdrawn: number;
  policeTriggered: boolean;
  policeEtaSeconds: number | null;
  policeArrived: boolean;
  policeStrikeCount: number;
  lastEtaPenalty: number | null;
  lastAlarmReason: string;
  alarm: { active: boolean; reason: string; recoverable: boolean; resetToLine: number } | null;
  atmBeforeAlarm: AtmVisualState | null;
  cmdHistory: string[];
  shellTier: ShellTier;
  sandboxCwd: string;
  sandboxEchoes: SandboxEcho[];
  showPloutusBanner: boolean;
}

export interface GameState {
  phase: PhaseId;
  effectiveLines: TermLine[];
  /** Exclusive end of fully revealed history / index of current interactive line */
  revealedLines: number;
  /** @deprecated kept at 0 — narrative no longer typewrites */
  charIndex: number;
  waitingForChoice: ChoiceId | null;
  choices: ToolChoices;
  siemDelayed: boolean;
  started: boolean;
  termMode: TermMode;
  /** Live command being typed at the prompt */
  inputBuffer: string;
  /** Mistyped commands shown above the live prompt */
  failedCmds: FailedCmd[];
  /**
   * After `clear`, hide history lines with index < this value.
   * null = nothing cleared (show full history).
   */
  termClearAt: number | null;
  /** Successfully run commands (↑ history) */
  cmdHistory: string[];
  /** Index into cmdHistory while browsing with ↑/↓; null = live buffer */
  historyBrowseIndex: number | null;
  /** Target string while SPACE autofill is typing into the prompt */
  autofillTarget: string | null;
  /** Narrative out line currently being typewritten (null = none) */
  typingOutIndex: number | null;
  /** Undo stack (CTRL+SPACE) */
  checkpoints: NarrativeCheckpoint[];
  policeTriggered: boolean;
  /** Seconds until police arrive; null until first trigger; 0 = on scene */
  policeEtaSeconds: number | null;
  /** True after ETA hits 0 — operation permanently blown until RESET */
  policeArrived: boolean;
  /** How many times police were (re)dispatched this run */
  policeStrikeCount: number;
  /** Seconds just shaved off ETA (for overlay flash); cleared next tick */
  lastEtaPenalty: number | null;
  lastAlarmReason: string;
  alarm: { active: boolean; reason: string; recoverable: boolean; resetToLine: number } | null;
  /** Snapshot of ATM visuals before a wrong choice — restored on DISMISS_ALARM */
  atmBeforeAlarm: AtmVisualState | null;
  atm: AtmVisualState;
  cashAmount: number;
  jackpotComplete: boolean;
  /** Sum of customer ATM withdrawals this run (subtracted from jackpot cassette total) */
  customerWithdrawn: number;
  atmUiState: AtmUiState;
  pinBuffer: string;
  amountBuffer: string;
  atmBalance: number;
  atmError: string;
  lastWithdrawAmount: number;
  /** Keyboard target: click ATM to enter PIN/menu; click terminal to type cmds */
  inputFocus: 'terminal' | 'atm';
  /** user = cold-start sandbox; root = scripted demo */
  shellTier: ShellTier;
  /** Absolute cwd for danny@kali sandbox */
  sandboxCwd: string;
  /** Free-typed sandbox command history (not part of effectiveLines) */
  sandboxEchoes: SandboxEcho[];
  /** Giant PLOUTUS art — only after bootstrap */
  showPloutusBanner: boolean;
}

export type Action =
  | { type: 'ADVANCE' } // SPACE or ENTER — step narrative forward
  | { type: 'STEP_BACK' } // CTRL+SPACE
  | { type: 'TERM_TYPE'; key: string }
  | { type: 'TERM_PASTE'; text: string }
  | { type: 'TERM_BACKSPACE' }
  | { type: 'TERM_TAB' }
  | { type: 'AUTOFILL_TICK' }
  | { type: 'OUT_TICK' }
  | { type: 'HISTORY_UP' }
  | { type: 'HISTORY_DOWN' }
  | { type: 'CHOOSE'; key: '1' | '2' | '3' }
  | { type: 'DISMISS_ALARM' }
  | { type: 'POLICE_TICK' }
  | { type: 'POLICE_ARRIVED' }
  | { type: 'CLEAR_ETA_PENALTY' }
  | { type: 'CASH_TICK' }
  | { type: 'JACKPOT_COMPLETE' }
  | { type: 'ATM_DISPENSE_DONE' }
  | { type: 'RESET' }
  | { type: 'ATM_PIN_DIGIT'; digit: string }
  | { type: 'ATM_CLEAR' }
  | { type: 'ATM_ENTER' }
  | { type: 'ATM_MENU'; choice: 'balance' | 'withdraw' | 'cancel' }
  | { type: 'ATM_AMOUNT'; amount: number }
  | { type: 'ATM_OK' }
  | { type: 'ATM_INSERT_CARD' }
  | { type: 'ATM_CARD_ANIM_DONE' }
  | { type: 'SET_INPUT_FOCUS'; focus: 'terminal' | 'atm' };
