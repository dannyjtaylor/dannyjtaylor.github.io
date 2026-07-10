import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AtmVisualState, AtmUiState } from './types';
import { Sounds } from './sound';

interface Props {
  state: AtmVisualState;
  atmUiState: AtmUiState;
  pinBuffer: string;
  atmBalance: number;
  lastWithdrawAmount: number;
  atmError: string;
  onPinDigit: (digit: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onMenuChoice: (choice: 'balance' | 'withdraw' | 'cancel') => void;
  onAmountSelect: (amount: number) => void;
  onAtmOk: () => void;
  onInsertCard: () => void;
  onCardAnimDone: () => void;
}

/** SVG coords for the card reader mouth (short-edge insert). */
const CARD_SLOT = { x: 92, y: 168, w: 46, h: 3.5 };
/** Bank card drawn short-edge-first (portrait) so it feeds into the slot. */
const CARD_W = 34;
const CARD_H = 54;

// Bills fall DOWN from the cash slot
function makeBills(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 52 + (i % 9) * 14,
    dy: 65 + (i % 4) * 22,
    dx: (i % 5) * 10 - 20,
    rot: (i % 7) * 18 - 45,
    delay: i * 0.08,
    color: i % 3 === 0 ? '#4a7c4e' : i % 3 === 1 ? '#6b9e6e' : '#3d6640',
  }));
}

/** Jackpot rain — dense continuous burst (looping). */
const JACKPOT_BILLS = makeBills(18);

/** Customer withdraw — one note per preset denomination ($5/$10/$20/$50). */
function billsForWithdraw(amount: number) {
  if (amount <= 0) return [];
  return makeBills(1);
}

// Larger ATM — viewBox 240×400; legend removed so we can scale up
const SVG_W = 384;
const SVG_H = 640;
const SCALE = SVG_W / 240; // 1.6

const SCR_L = Math.round(44 * SCALE);
const SCR_T = Math.round(46 * SCALE);
const SCR_W = Math.round(146 * SCALE);
const SCR_H = Math.round(102 * SCALE);

// Fill the inner keypad housing (svg 57,182 120×88) — no label strip
const KPD_L = Math.round(57 * SCALE);
const KPD_T = Math.round(182 * SCALE);
const KPD_W = Math.round(120 * SCALE);
const KPD_H = Math.round(88 * SCALE);

const PHOS = '#33ff66';
const PHOS_DIM = '#00aa44';
const PHOS_MUTED = '#006622';
const PHOS_DARK = '#021408';
const AMBER = '#c8a800';

const SCREEN_BASE = {
  width: '100%',
  height: '100%',
  background: PHOS_DARK,
  color: PHOS,
  fontFamily: '"W95FA","Courier New",monospace',
  fontSize: 11,
  display: 'flex',
  flexDirection: 'column',
  padding: '6px 8px',
  boxSizing: 'border-box',
  userSelect: 'none',
  imageRendering: 'pixelated',
  lineHeight: 1.3,
} as const;

const SCREEN_HDR = {
  color: AMBER,
  fontWeight: 'bold',
  fontSize: 13,
  letterSpacing: 1.2,
  borderBottom: `1px solid ${AMBER}44`,
  paddingBottom: 3,
  marginBottom: 4,
  textAlign: 'center',
  flexShrink: 0,
} as const;

const BTN_BASE = {
  background: `${PHOS_MUTED}33`,
  border: `1px solid ${PHOS_DIM}55`,
  color: PHOS,
  fontFamily: 'inherit',
  fontSize: 10,
  cursor: 'pointer',
  padding: '0 6px',
  textAlign: 'left' as const,
  width: '100%',
  imageRendering: 'pixelated' as const,
  boxSizing: 'border-box' as const,
};

const OK_BTN = {
  ...BTN_BASE,
  textAlign: 'center' as const,
  flexShrink: 0,
  padding: '5px 10px',
  display: 'block',
  width: '100%',
  marginTop: 4,
};

function AtmScreen({
  atmUiState,
  screenMode,
  pinBuffer,
  atmBalance,
  lastWithdrawAmount,
  atmError,
  onMenuChoice,
  onAmountSelect,
  onAtmOk,
  onInsertCard,
}: {
  atmUiState: AtmUiState;
  screenMode: AtmVisualState['screenMode'];
  pinBuffer: string;
  atmBalance: number;
  lastWithdrawAmount: number;
  atmError: string;
  onMenuChoice: (choice: 'balance' | 'withdraw' | 'cancel') => void;
  onAmountSelect: (amount: number) => void;
  onAtmOk: () => void;
  onInsertCard: () => void;
}) {
  const menuRow = (num: string, label: string, choice: 'balance' | 'withdraw' | 'cancel') => (
    <button
      key={choice}
      onClick={() => onMenuChoice(choice)}
      style={{
        ...BTN_BASE,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderLeft: `4px solid ${PHOS}`,
        paddingLeft: 8,
        background: `${PHOS_MUTED}22`,
        minHeight: 0,
      }}
    >
      <span style={{ color: AMBER, fontWeight: 'bold', minWidth: 12, fontSize: 12 }}>{num}</span>
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );

  const quickAmounts = [5, 10, 20, 50] as const;

  /* Ops overlays take over the CRT when the demo is past customer UI */
  if (screenMode === 'seized') {
    return (
      <div style={{ ...SCREEN_BASE, background: '#1a0408' }}>
        <div style={{ ...SCREEN_HDR, color: '#ff4466', borderBottomColor: '#ff446644' }}>SEIZED</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
          <motion.div
            animate={{ opacity: [1, 0.45, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ fontSize: 13, fontWeight: 'bold', color: '#ff3355' }}
          >
            OUT OF SERVICE
          </motion.div>
          <div style={{ fontSize: 9, color: '#aa4455', letterSpacing: 1 }}>POLICE HOLD</div>
          <div style={{ fontSize: 8, color: '#663344' }}>Evidence · Do not operate</div>
        </div>
      </div>
    );
  }

  if (screenMode === 'reboot') {
    return (
      <div style={SCREEN_BASE}>
        <div style={{ ...SCREEN_HDR, color: '#ff8844', borderBottomColor: '#ff884444' }}>SYSTEM</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
          <motion.div
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 13, fontWeight: 'bold', color: '#ffaa66' }}
          >
            REBOOTING…
          </motion.div>
          <div style={{ fontSize: 10, color: PHOS_DIM }}>XFS services starting</div>
          <div style={{ fontSize: 9, color: PHOS_MUTED, fontFamily: 'inherit' }}>
            [████████░░] 78%
          </div>
        </div>
      </div>
    );
  }

  if (screenMode === 'ploutus') {
    return (
      <div style={{ ...SCREEN_BASE, background: '#0a0410' }}>
        <div style={{ ...SCREEN_HDR, color: '#cc66ff', borderBottomColor: '#cc66ff44' }}>PLOUTUS.D</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#dd88ff' }}>REMOTE SHELL ACTIVE</div>
          <div style={{ fontSize: 10, color: '#9966bb' }}>XFS · CDM unlocked</div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ fontSize: 10, color: '#66ff99', marginTop: 4 }}
          >
            ▌ awaiting F-keys
          </motion.div>
        </div>
      </div>
    );
  }

  if (screenMode === 'jackpot') {
    return (
      <div style={{ ...SCREEN_BASE, background: '#041208' }}>
        <div style={{ ...SCREEN_HDR, color: '#33ff66', borderBottomColor: '#33ff6644' }}>JACKPOT</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: PHOS_DIM }}>DISPENSE ALL</div>
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ fontSize: 16, fontWeight: 'bold', color: PHOS }}
          >
            CASSETTES 1–4
          </motion.div>
          <div style={{ fontSize: 9, color: AMBER }}>CDM · unrestricted</div>
        </div>
      </div>
    );
  }

  if (atmUiState === 'idle') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELSH PHARGO</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 18, color: PHOS, fontWeight: 'bold' }}>Welcome</div>
          <div style={{ color: PHOS_DIM, fontSize: 13 }}>Please insert your card</div>
          <button
            type="button"
            onClick={onInsertCard}
            style={{
              ...BTN_BASE,
              textAlign: 'center',
              padding: '8px 10px',
              fontWeight: 'bold',
              fontSize: 12,
              letterSpacing: 1,
              borderLeft: `3px solid ${AMBER}`,
              color: AMBER,
              width: 'auto',
              alignSelf: 'center',
            }}
          >
            INSERT CARD
          </button>
        </div>
      </div>
    );
  }

  if (atmUiState === 'inserting') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELSH PHARGO</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <motion.div
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ fontSize: 14, color: PHOS, fontWeight: 'bold' }}
          >
            Reading card…
          </motion.div>
          <div style={{ fontSize: 11, color: PHOS_MUTED }}>Do not remove card</div>
        </div>
      </div>
    );
  }

  if (atmUiState === 'ejecting') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELSH PHARGO</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, color: PHOS, fontWeight: 'bold' }}>Please take your card</div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ fontSize: 11, color: AMBER }}
          >
            Ejecting…
          </motion.div>
        </div>
      </div>
    );
  }

  if (atmUiState === 'pin') {
    const filled = pinBuffer.length;
    const isWrong = filled === 4 && pinBuffer !== '1234';
    return (
      <div style={{ ...SCREEN_BASE, padding: '4px 6px' }}>
        <div style={{ ...SCREEN_HDR, fontSize: 12, marginBottom: 2, paddingBottom: 2 }}>WELSH PHARGO</div>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          minHeight: 0,
        }}>
          <div style={{ color: PHOS, fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5 }}>
            Enter your PIN
          </div>
          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            width: '100%',
            padding: '0 2px',
            boxSizing: 'border-box',
          }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 42,
                  aspectRatio: '3 / 4',
                  minHeight: 36,
                  border: `2px solid ${i < filled ? PHOS : PHOS_MUTED}`,
                  background: i < filled ? '#042810' : '#010804',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: PHOS,
                }}
              >
                {i < filled ? '*' : ''}
              </div>
            ))}
          </div>
          {isWrong && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#ff4444', fontWeight: 'bold', lineHeight: 1.3 }}>
              INCORRECT PIN
            </div>
          )}
        </div>
      </div>
    );
  }

  if (atmUiState === 'menu') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>MAIN MENU</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0 }}>
          {menuRow('1', 'Check Balance', 'balance')}
          {menuRow('2', 'Withdraw Cash', 'withdraw')}
          {menuRow('3', 'Exit', 'cancel')}
        </div>
      </div>
    );
  }

  if (atmUiState === 'balance') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>ACCOUNT</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, color: PHOS_DIM, marginBottom: 6 }}>Available Balance</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: PHOS, letterSpacing: 0.5, fontFamily: 'inherit' }}>
            ${atmBalance.toFixed(2)}
          </div>
        </div>
        <button onClick={onAtmOk} style={OK_BTN}>OK</button>
      </div>
    );
  }

  if (atmUiState === 'amount') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>SELECT AMOUNT</div>
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 4,
          minHeight: 0,
          marginBottom: 4,
        }}>
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => onAmountSelect(amount)}
              style={{
                ...BTN_BASE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 0,
                borderLeft: `3px solid ${PHOS}`,
                fontWeight: 'bold',
                fontSize: 22,
                letterSpacing: 0.5,
                color: AMBER,
                height: '100%',
                minHeight: 0,
              }}
            >
              ${amount}
            </button>
          ))}
        </div>
        <button
          onClick={() => onMenuChoice('cancel')}
          style={{ ...OK_BTN, color: PHOS_DIM, borderColor: `${PHOS_MUTED}88` }}
        >
          Back
        </button>
      </div>
    );
  }

  if (atmUiState === 'withdraw') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WITHDRAWAL</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: PHOS, fontFamily: 'inherit' }}>
            ${lastWithdrawAmount.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: PHOS_DIM }}>Dispensing...</div>
          <div style={{ fontSize: 10, color: PHOS_MUTED }}>Please take your cash</div>
        </div>
        <button onClick={onAtmOk} style={OK_BTN}>Done</button>
      </div>
    );
  }

  if (atmUiState === 'error') {
    return (
      <div style={SCREEN_BASE}>
        <div style={{ ...SCREEN_HDR, color: '#ff4444', borderBottomColor: '#ff444444' }}>ERROR</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 11, color: '#ff6666', lineHeight: 1.5, padding: '0 6px' }}>
          {atmError || 'An error occurred'}
        </div>
        <button onClick={onAtmOk} style={{ ...OK_BTN, borderColor: '#ff444466', color: '#ff8888' }}>OK</button>
      </div>
    );
  }

  if (atmUiState === 'thankyou') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELSH PHARGO</div>
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, color: PHOS, fontWeight: 'bold' }}>Thank you</div>
          <div style={{ fontSize: 11, color: PHOS_DIM }}>Another transaction?</div>
        </div>
        <button onClick={onAtmOk} style={OK_BTN}>OK</button>
      </div>
    );
  }

  return <div style={SCREEN_BASE} />;
}

// Phone-style ATM pad (1–9 top→bottom), not calculator layout
const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['CLR', '0', 'OK'],
];

/** WELSH PHARGO debit card — Wells Fargo red (#D71E28) + gold (#FFCD11). */
function BankCardGraphic() {
  return (
    <g>
      {/* Plastic body — brand red */}
      <rect width={CARD_W} height={CARD_H} rx="2.5" fill="#a81428" stroke="#6e1020" strokeWidth="0.75" />
      <rect x="1" y="1" width={CARD_W - 2} height={CARD_H - 2} rx="2" fill="#d71e28" />
      {/* Gold accent stripe under top edge */}
      <rect x="1" y="1" width={CARD_W - 2} height="3" rx="1.5" fill="#ffcd11" opacity="0.95" />
      {/* Chip — gold */}
      <rect x="4" y="9" width="10" height="8" rx="1" fill="#ffcd11" stroke="#c9990a" strokeWidth="0.45" />
      <rect x="5.5" y="10.5" width="7" height="5" fill="#e6b800" />
      <line x1="5.5" y1="12" x2="12.5" y2="12" stroke="#8a6800" strokeWidth="0.35" />
      <line x1="5.5" y1="13.5" x2="12.5" y2="13.5" stroke="#8a6800" strokeWidth="0.35" />
      {/* Mag stripe */}
      <rect x="0" y="23" width={CARD_W} height="7" fill="#1a1a1a" />
      <rect x="0" y="23" width={CARD_W} height="1.5" fill="#333" />
      {/* Brand — gold on red */}
      <text x={CARD_W / 2} y="39" textAnchor="middle" fill="#ffcd11" fontFamily="Arial, sans-serif" fontSize="4.2" fontWeight="bold" letterSpacing="0.6">
        WELSH
      </text>
      <text x={CARD_W / 2} y="44.5" textAnchor="middle" fill="#fff4c2" fontFamily="Arial, sans-serif" fontSize="3.2" letterSpacing="0.4">
        PHARGO
      </text>
      {/* Embossed digits */}
      <text x={CARD_W / 2} y="50.5" textAnchor="middle" fill="#ffcd11" fontFamily="Courier New, monospace" fontSize="2.8" letterSpacing="0.3" opacity="0.85">
        •••• 4482
      </text>
    </g>
  );
}

/**
 * Card insert / eject choreography (original vertical path):
 * Continuous ease — no hold-then-jerk at the mouth. Fades out as it
 * swallows so unmounting the overlay doesn't snap.
 */
function CardReaderAnimation({
  mode,
  onDone,
}: {
  mode: 'inserting' | 'ejecting';
  onDone: () => void;
}) {
  const slotCx = CARD_SLOT.x + CARD_SLOT.w / 2;
  const cardX = slotCx - CARD_W / 2;
  const yInside = CARD_SLOT.y - CARD_H + 6;
  const yMid = CARD_SLOT.y + 10; // halfway up the pad → reader
  const yAtMouth = CARD_SLOT.y - 2;
  const yBelow = CARD_SLOT.y + 42;
  const insertMs = 1.85;
  const ejectMs = 1.45;

  useEffect(() => {
    const ms = (mode === 'inserting' ? insertMs : ejectMs) * 1000 + 40;
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [mode, onDone]);

  // Single continuous easeInOut across the whole path (no per-segment snaps)
  const smooth = [0.4, 0, 0.2, 1] as const;

  return (
    <g>
      <motion.ellipse
        cx={slotCx}
        cy={CARD_SLOT.y + 10}
        rx={28}
        ry={10}
        fill="#ffcd1144"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0.4, 0] }}
        transition={{ duration: mode === 'inserting' ? insertMs : ejectMs, ease: smooth }}
      />

      {/* Clip so the card disappears into the slot as it feeds upward */}
      <defs>
        <clipPath id="card-feed-clip">
          <rect x={cardX - 4} y={CARD_SLOT.y - 2} width={CARD_W + 8} height={100} />
        </clipPath>
      </defs>

      <g clipPath="url(#card-feed-clip)">
        <motion.g
          key={mode}
          initial={
            mode === 'inserting'
              ? { y: yBelow, opacity: 0 }
              : { y: yInside, opacity: 0.35 }
          }
          animate={
            mode === 'inserting'
              ? {
                  // Even spacing — rise, kiss mouth, feed in; fade as it vanishes into the slot
                  y: [yBelow, yMid, yAtMouth, yInside],
                  opacity: [0, 1, 1, 0],
                }
              : {
                  y: [yInside, yAtMouth, yMid, yBelow + 6],
                  opacity: [0, 1, 1, 0],
                }
          }
          transition={{
            duration: mode === 'inserting' ? insertMs : ejectMs,
            times: mode === 'inserting' ? [0, 0.38, 0.58, 1] : [0, 0.28, 0.55, 1],
            ease: smooth,
          }}
        >
          <g transform={`translate(${cardX}, 0)`}>
            <BankCardGraphic />
          </g>
        </motion.g>
      </g>

      <motion.rect
        x={CARD_SLOT.x}
        y={CARD_SLOT.y}
        width={CARD_SLOT.w}
        height={CARD_SLOT.h}
        fill="#222"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: mode === 'inserting' ? [0.35, 0.45, 0.9, 0.45] : [0.45, 0.85, 0.5, 0.35] }}
        transition={{
          duration: mode === 'inserting' ? insertMs : ejectMs,
          times: [0, 0.4, 0.7, 1],
          ease: smooth,
        }}
      />

      <motion.rect
        x="141"
        y="167"
        width="5"
        height="5"
        rx="1"
        initial={{ fill: '#00cc44' }}
        animate={{
          fill: mode === 'inserting'
            ? ['#00cc44', '#ffcd11', '#ffcd11', '#00cc44']
            : ['#00cc44', '#ff9900', '#888', '#00cc44'],
        }}
        transition={{
          duration: mode === 'inserting' ? insertMs : ejectMs,
          times: [0, 0.35, 0.75, 1],
          ease: smooth,
        }}
      />

      {mode === 'inserting' && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.65, 0] }}
          transition={{ duration: insertMs, times: [0, 0.45, 0.68, 1], ease: smooth }}
        >
          {[0, 1, 2].map((i) => (
            <line
              key={`streak-${i}`}
              x1={slotCx - 8 + i * 8}
              y1={CARD_SLOT.y + 6 + i * 3}
              x2={slotCx - 8 + i * 8}
              y2={CARD_SLOT.y + 16 + i * 2}
              stroke="#ffcd11"
              strokeWidth="1"
              strokeLinecap="round"
              opacity={0.5 - i * 0.12}
            />
          ))}
        </motion.g>
      )}
    </g>
  );
}

const INTERACTIVE_UI: AtmUiState[] = ['idle', 'menu', 'balance', 'amount', 'withdraw', 'error', 'thankyou'];

export function AtmSvg({
  state,
  atmUiState,
  pinBuffer,
  atmBalance,
  lastWithdrawAmount,
  atmError,
  onPinDigit,
  onClear,
  onEnter,
  onMenuChoice,
  onAmountSelect,
  onAtmOk,
  onInsertCard,
  onCardAnimDone,
}: Props) {
  const cardAnimMode =
    atmUiState === 'inserting' || atmUiState === 'ejecting' ? atmUiState : null;
  const cardSeated =
    atmUiState === 'pin'
    || atmUiState === 'menu'
    || atmUiState === 'balance'
    || atmUiState === 'amount'
    || atmUiState === 'withdraw'
    || atmUiState === 'error'
    || atmUiState === 'thankyou';

  const isJackpotRain = state.screenMode === 'jackpot' && state.dispensing;
  const withdrawBills =
    state.dispensing && !isJackpotRain && atmUiState === 'withdraw'
      ? billsForWithdraw(lastWithdrawAmount)
      : [];
  const activeBills = isJackpotRain ? JACKPOT_BILLS : withdrawBills;

  function handleKeyClick(row: number, col: number) {
    if (atmUiState === 'inserting' || atmUiState === 'ejecting') return;
    Sounds.pinPress();
    if (row === 3 && col === 0) { onClear(); return; }
    if (row === 3 && col === 2) { onEnter(); return; }
    const digit = row < 3
      ? (['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const)[row * 3 + col]
      : col === 1 ? '0' : '';
    if (digit) onPinDigit(digit);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        viewBox="0 0 240 400"
        width={SVG_W}
        height={SVG_H}
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block', overflow: 'visible' }}
      >
        {/* Cabinet shadow */}
        <rect x="28" y="14" width="186" height="378" fill="#6e1020" />
        {/* Cabinet body — WELSH PHARGO red */}
        <rect x="24" y="10" width="186" height="378" fill="#e8203a" />
        <rect x="24" y="10" width="4" height="378" fill="#ff3d5a" />
        <rect x="24" y="10" width="186" height="4" fill="#ff3d5a" />
        <rect x="207" y="10" width="3" height="378" fill="#a81428" />

        {/* Front fascia — WHITE */}
        <rect x="32" y="18" width="170" height="364" fill="#f4f4f4" />
        <rect x="32" y="18" width="170" height="2" fill="#e8e8e8" />
        <rect x="32" y="18" width="2" height="364" fill="#e8e8e8" />

        {/* Gold WELSH PHARGO accent strip at base of cabinet */}
        <rect x="24" y="382" width="186" height="6" fill="#c9990a" />
        <rect x="24" y="382" width="186" height="2" fill="#ffcd11" />
        <rect x="24" y="386" width="186" height="2" fill="#8a6800" />

        {/* Screen bezel */}
        <rect x="40" y="42" width="154" height="110" fill="#1a1a1a" rx="2" />
        <rect x="42" y="44" width="150" height="106" fill="#111" rx="1" />
        <rect x="44" y="46" width="146" height="102" fill="#021408" />

        {/*
          Card reader — ID-1 short-edge insert mouth (~card width), not a full-fascia bar.
          Centered over the keypad; thin shutter slot reads as a real dip/motorized reader.
        */}
        <rect x="85" y="163" width="64" height="13" fill="#ccc" rx="1" />
        <rect x="87" y="165" width="60" height="9" fill="#bbb" rx="1" />
        <rect x="92" y="168" width="46" height="3.5" fill={cardSeated ? '#333' : '#666'} />
        <rect
          x="141"
          y="167"
          width="5"
          height="5"
          rx="1"
          fill={cardSeated ? '#00cc44' : cardAnimMode ? '#ffcd11' : '#00cc44'}
        />
        {/* Click / tap the reader to insert when idle */}
        {atmUiState === 'idle' && (
          <rect
            x="85"
            y="163"
            width="64"
            height="13"
            fill="#00000000"
            style={{ cursor: 'pointer' }}
            onClick={onInsertCard}
          />
        )}
        {/* Tiny card edge peeking from slot while session is active */}
        {cardSeated && (
          <rect x="100" y="169.5" width="30" height="2" fill="#d71e28" rx="0.5" />
        )}

        {/* Keypad housing */}
        <rect x="55" y="180" width="124" height="92" fill="#c8c8c8" />
        <rect x="57" y="182" width="120" height="88" fill="#d8d8d8" />

        {/* Cash dispenser — slot graphics only, no label */}
        <rect x="40" y="286" width="154" height="30" fill="#bbb" />
        <rect x="42" y="288" width="150" height="26" fill="#aaa" />
        <rect x="50" y="292" width="134" height="14" fill="#888" />
        <rect x="50" y="292" width="134" height="14" fill="none" stroke="#666" strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`r-${i}`} x={58 + i * 10} y={297} width={4} height={4} fill="#999" />
        ))}

        {/* Status lights */}
        <rect x="180" y="328" width="8" height="8" fill="#ffcd11" />
        <rect x="192" y="328" width="8" height="8" fill="#00cc44" />

        {/* USB port on fascia (left of card reader) */}
        <text x="53" y="164" textAnchor="middle" fill="#666" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="0.8">USB</text>
        <rect x="48" y="166" width="10" height="5" fill="#888" stroke="#666" strokeWidth="0.5" />
        <rect x="50" y="167" width="6" height="3" fill="#222" />

        {/* ── LAN / ETHERNET PORT ──
            Wall plate always drawn; empty cavity/pins only when nothing is seated.
            Plugged states fully cover the mouth so you don't see "exposed port + wire". */}
        <g>
          <text x="44" y="341" textAnchor="middle" fill="#666" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="0.8">LAN</text>
          {/* Wall jack faceplate */}
          <rect x="32" y="343" width="24" height="18" fill="#c8c8c8" stroke="#999" strokeWidth="0.75" />
          <rect x="33" y="344" width="22" height="16" fill="#d4d4d4" />
          {/* Recessed mouth (empty look — covered by plug overlays below) */}
          <rect x="36" y="347" width="16" height="10" fill="#1a1a1a" stroke="#555" strokeWidth="0.5" />

          <AnimatePresence mode="wait">
            {state.ethState === 'intact' && (
              <motion.g
                key="eth-intact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* RJ45 plug fully seated — covers entire cavity */}
                <rect x="35" y="346" width="18" height="12" fill="#5a5a5a" stroke="#333" strokeWidth="0.75" />
                <rect x="36" y="347" width="16" height="10" fill="#6e6e6e" />
                {/* Locking clip tab on top of plug */}
                <path d="M40 346 L44 343 L48 343 L52 346" fill="#4a4a4a" stroke="#333" strokeWidth="0.4" />
                {/* Clear plastic tip / contacts edge (flush with jack) */}
                <rect x="49" y="348" width="3" height="8" fill="#9ab0c0" stroke="#6a8090" strokeWidth="0.4" />
                {/* Strain-relief boot sticking out left */}
                <rect x="22" y="348" width="14" height="8" fill="#3a3a3a" stroke="#222" strokeWidth="0.5" rx="1" />
                <rect x="24" y="350" width="10" height="4" fill="#2a2a2a" />
                {/* Thick gray Cat5 cable → left, then down a bit (reads as plugged in) */}
                <path
                  d="M22 352 L10 352 L4 356 L0 356"
                  fill="none"
                  stroke="#6a6a6a"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 352 L10 352 L4 356 L0 356"
                  fill="none"
                  stroke="#8a8a8a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Far connector stub (other end of drop) */}
                <rect x="-2" y="353" width="5" height="7" fill="#555" stroke="#333" strokeWidth="0.5" />
                {/* Link LED on faceplate */}
                <rect x="50" y="344" width="3" height="2" fill="#00cc44" />
              </motion.g>
            )}
            {state.ethState === 'loopback' && (
              <motion.g
                key="eth-loopback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Blue loopback dongle fully seated in jack */}
                <rect x="35" y="346" width="18" height="12" fill="#2a66cc" stroke="#1a44aa" strokeWidth="0.75" />
                <rect x="36" y="347" width="16" height="10" fill="#4488ff" />
                <path d="M40 346 L44 343 L48 343 L52 346" fill="#2266cc" stroke="#1a44aa" strokeWidth="0.4" />
                <path d="M38 349 Q48 344 48 358 Q48 366 38 361" fill="none" stroke="#88bbff" strokeWidth="2" />
                <text x="44" y="370" textAnchor="middle" fill="#2266cc" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">LOOP</text>
                {/* Cut wall cable stump (not in the jack anymore) */}
                <rect x="6" y="352" width="10" height="5" fill="#555" stroke="#333" strokeWidth="0.5" />
                <rect x="4" y="353" width="4" height="3" fill="#ff8800" />
                <line x1="5" y1="351" x2="14" y2="359" stroke="#ff2244" strokeWidth="1.5" />
                <line x1="14" y1="351" x2="5" y2="359" stroke="#ff2244" strokeWidth="1.5" />
              </motion.g>
            )}
            {state.ethState === 'cut' && (
              <motion.g
                key="eth-cut"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Plug still seated — covers cavity; cable chopped off at boot */}
                <rect x="35" y="346" width="18" height="12" fill="#5a5a5a" stroke="#333" strokeWidth="0.75" />
                <rect x="36" y="347" width="16" height="10" fill="#6e6e6e" />
                <path d="M40 346 L44 343 L48 343 L52 346" fill="#4a4a4a" stroke="#333" strokeWidth="0.4" />
                <rect x="49" y="348" width="3" height="8" fill="#9ab0c0" stroke="#6a8090" strokeWidth="0.4" />
                <rect x="24" y="348" width="12" height="8" fill="#3a3a3a" stroke="#222" strokeWidth="0.5" rx="1" />
                {/* Frayed orange conductors at cut */}
                <rect x="18" y="349" width="7" height="2" fill="#ff8800" />
                <rect x="17" y="352" width="6" height="2" fill="#ffaa00" />
                <rect x="16" y="355" width="5" height="2" fill="#cc6600" />
                {/* Dangling stump */}
                <path d="M20 356 L16 364 L14 372" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" />
                <rect x="12" y="370" width="5" height="3" fill="#ff8800" />
                <text x="18" y="366" textAnchor="middle" fill="#cc6600" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">CUT</text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>

        <text x="117" y="378" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="0.5">DYEBOLD OPTIVA 740</text>

        {/* ── TOP-HAT SERVICE BAY ──
            Closed: red fascia cap sits flush above the screen.
            Open: cap hinges upward (stays visible as a lid); bay reveals tidy internals. */}

        {/* Service bay cavity (always under the lid; only readable when open) */}
        <AnimatePresence>
          {state.panelOpen && (
            <motion.g
              key="service-bay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Recessed bay frame — ends cleanly above screen bezel (y=42) */}
              <rect x="32" y="10" width="170" height="30" fill="#1a1414" />
              <rect x="32" y="10" width="170" height="2" fill="#0a0808" />
              <rect x="32" y="10" width="2" height="30" fill="#0a0808" />
              <rect x="200" y="10" width="2" height="30" fill="#2a2222" />
              <rect x="34" y="12" width="166" height="26" fill="#121010" />

              {/* Left: PCB / controller strip */}
              <rect x="38" y="15" width="58" height="20" fill="#0e1a12" stroke="#2a4a32" strokeWidth="0.75" />
              <rect x="41" y="18" width="16" height="14" fill="#1a2e20" />
              <rect x="43" y="20" width="12" height="10" fill="#243828" />
              <rect x="60" y="18" width="8" height="14" fill="#1a1a2e" />
              <rect x="70" y="18" width="8" height="14" fill="#1a1a2e" />
              <rect x="81" y="19" width="3" height="3" fill="#33ff66" />
              <rect x="86" y="19" width="3" height="3" fill="#ffcd11" />
              <rect x="81" y="25" width="3" height="3" fill="#ff9900" />
              <rect x="86" y="25" width="3" height="3" fill="#4488ff" />
              <text x="67" y="13.5" textAnchor="middle" fill="#4a6a52" fontFamily="Arial, sans-serif" fontSize="5">CTRL</text>

              {/* Center: drive bay */}
              <rect x="102" y="15" width="48" height="20" fill="#0c0c10" stroke="#333344" strokeWidth="0.75" />
              <text x="126" y="13.5" textAnchor="middle" fill="#555566" fontFamily="Arial, sans-serif" fontSize="5">HDD BAY</text>
              {/* Empty bay rails when drive removed */}
              {(state.driveState === 'removed' || state.driveState === 'reinstalled') && (
                <>
                  <rect x="106" y="20" width="40" height="2" fill="#2a2a35" />
                  <rect x="106" y="28" width="40" height="2" fill="#2a2a35" />
                </>
              )}
              {/* Drive seated in bay */}
              {(state.driveState === 'present' || state.driveState === 'reinstalled') && (
                <g>
                  <rect x="106" y="18" width="40" height="14" fill="#3a3a42" stroke="#555" strokeWidth="0.5" />
                  <rect x="108" y="20" width="36" height="6" fill="#4a4a55" />
                  <rect x="110" y="28" width="8" height="2" fill="#00aa44" />
                  <rect x="122" y="28" width="4" height="2" fill="#888" />
                </g>
              )}

              {/* Right: harness / power */}
              <rect x="156" y="15" width="40" height="20" fill="#141018" stroke="#3a2a35" strokeWidth="0.75" />
              <text x="176" y="13.5" textAnchor="middle" fill="#664455" fontFamily="Arial, sans-serif" fontSize="5">PWR</text>
              <rect x="160" y="19" width="6" height="6" fill="#ff9900" />
              <rect x="169" y="19" width="6" height="6" fill="#ff3344" />
              <rect x="178" y="19" width="6" height="6" fill="#33ff66" />
              <rect x="160" y="28" width="32" height="3" fill="#2a2030" />
              <rect x="160" y="28" width="12" height="3" fill="#4488ff66" />
              <rect x="174" y="28" width="10" height="3" fill="#ff224466" />

              {/* Door sensor contact (left edge of bay) */}
              <rect x="33" y="22" width="3" height="8" fill="#666688" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Top-hat lid — slides up and parks above the cabinet when open (stays visible) */}
        <motion.g
          animate={{
            y: state.panelOpen ? -30 : 0,
            x: state.showDoorAjar && state.panelOpen ? 2 : 0,
          }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <rect x="32" y="8" width="170" height="24" fill="#e8203a" />
          <rect x="32" y="8" width="170" height="3" fill="#ff3d5a" />
          <rect x="32" y="29" width="170" height="3" fill="#a81428" />
          {/* Crowbar scuff / dent hint */}
          {state.accessMethod === 'crowbar' && state.panelOpen && (
            <>
              <rect x="38" y="26" width="18" height="3" fill="#8a1020" />
              <rect x="42" y="24" width="8" height="2" fill="#6e0c18" />
            </>
          )}
          {/* Lock / latch detail */}
          <rect x="110" y="16" width="14" height="8" fill="#a81428" rx="1" />
          <rect x="114" y="18" width="6" height="4" fill="#ffcd11" />
          {/* Vent slots */}
          <rect x="42" y="14" width="28" height="2" fill="#a81428" />
          <rect x="42" y="19" width="28" height="2" fill="#a81428" />
          <rect x="164" y="14" width="28" height="2" fill="#a81428" />
          <rect x="164" y="19" width="28" height="2" fill="#a81428" />
          <text x="117" y="28" textAnchor="middle" fill="#ffcd1188" fontFamily="Arial, sans-serif" fontSize="5.5" letterSpacing="0.8">
            {state.panelOpen ? 'OPEN' : 'SERVICE'}
          </text>
        </motion.g>

        {/* Police evidence tape when seized */}
        <AnimatePresence>
          {state.screenMode === 'seized' && (
            <motion.g
              key="evidence-tape"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <rect x="20" y="200" width="200" height="18" fill="#ffcc00" transform="rotate(-18 120 209)" opacity="0.92" />
              <text
                x="120"
                y="212"
                textAnchor="middle"
                fill="#111"
                fontFamily="Arial Black, Arial, sans-serif"
                fontSize="7"
                fontWeight="bold"
                letterSpacing="1.5"
                transform="rotate(-18 120 209)"
              >
                POLICE LINE — DO NOT CROSS
              </text>
              <rect x="28" y="248" width="180" height="14" fill="#ffcc00" transform="rotate(12 118 255)" opacity="0.85" />
              <text
                x="118"
                y="257"
                textAnchor="middle"
                fill="#111"
                fontFamily="Arial Black, Arial, sans-serif"
                fontSize="6"
                fontWeight="bold"
                letterSpacing="1"
                transform="rotate(12 118 255)"
              >
                EVIDENCE — ATM SEIZED
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Tamper tape on resealed closed lid */}
        <AnimatePresence>
          {!state.panelOpen && state.showTamperTape && (
            <motion.g
              key="tamper-tape"
              initial={{ opacity: 0, scaleX: 0.3 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformOrigin: '117px 20px' }}
            >
              <rect x="52" y="18" width="130" height="4" fill="#c9990a" opacity="0.9" />
              <rect x="52" y="18" width="130" height="1" fill="#ffcd11" />
              <rect x="52" y="21" width="130" height="1" fill="#8a6800" />
              <text x="117" y="21.5" textAnchor="middle" fill="#5a4400" fontFamily="Arial, sans-serif" fontSize="5" letterSpacing="0.6" fontWeight="bold">SEALED</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Door ajar gap indicator */}
        <AnimatePresence>
          {state.showDoorAjar && state.panelOpen && (
            <motion.g
              key="door-ajar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect x="30" y="36" width="3" height="6" fill="#ffcd11" />
              <rect x="31" y="37" width="2" height="4" fill="#1a1414" />
              <text x="24" y="35" textAnchor="middle" fill="#c8a800" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">AJAR</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Access method props (panel open) */}
        <AnimatePresence>
          {state.panelOpen && state.accessMethod === 'tbar' && (
            <motion.g
              key="access-tbar"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gold T-bar key in lock */}
              <rect x="116" y="10" width="2" height="10" fill="#ffcd11" />
              <rect x="112" y="8" width="10" height="3" fill="#c9990a" />
              <rect x="114" y="6" width="6" height="2" fill="#ffcd11" />
              <text x="117" y="5" textAnchor="middle" fill="#c9990a" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">T-BAR</text>
            </motion.g>
          )}
          {state.panelOpen && state.accessMethod === 'social' && (
            <motion.g
              key="access-social"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* DN tech badge hanging left */}
              <rect x="8" y="14" width="16" height="22" fill="#2266cc" stroke="#1144aa" strokeWidth="0.75" />
              <rect x="10" y="16" width="12" height="8" fill="#4488ff" />
              <text x="16" y="22" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontSize="6.5" fontWeight="bold">DN</text>
              <rect x="14" y="26" width="4" height="6" fill="#ddd" />
              <rect x="15" y="12" width="2" height="4" fill="#888" />
              <line x1="16" y1="12" x2="16" y2="8" stroke="#888" strokeWidth="1" />
              <text x="16" y="42" textAnchor="middle" fill="#4488ff" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="bold">SOCIAL</text>
            </motion.g>
          )}
          {state.panelOpen && state.accessMethod === 'crowbar' && (
            <motion.g
              key="access-crowbar"
              initial={{ opacity: 0, rotate: -12 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ transformOrigin: '28px 28px' }}
            >
              {/* Crowbar wedged at lid edge */}
              <rect x="20" y="4" width="4" height="28" fill="#888" stroke="#666" strokeWidth="0.5" />
              <rect x="18" y="2" width="8" height="5" fill="#aaa" />
              <rect x="22" y="28" width="12" height="3" fill="#777" transform="rotate(25 22 29)" />
              <text x="14" y="38" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">PRY</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Drive removed — floats beside bay with USB-SATA cable (only while panel open) */}
        <AnimatePresence>
          {state.panelOpen && state.driveState === 'removed' && (
            <motion.g
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: 52, y: -22 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <rect x="106" y="18" width="40" height="14" fill="#3a3a42" stroke="#777" strokeWidth="0.6" />
              <rect x="108" y="20" width="36" height="6" fill="#4a4a55" />
              <rect x="110" y="28" width="8" height="2" fill="#ffaa00" />
              {/* USB-SATA cable routes right edge → laptop (avoids keypad) */}
              <path d="M146 25 L168 25 L168 200 L190 200" fill="none" stroke="#4488ff" strokeWidth="1.5" />
              <rect x="188" y="198" width="6" height="4" fill="#2266cc" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Reed-switch clamp on door sensor — only when panel open */}
        <AnimatePresence>
          {state.panelOpen && state.showClamp && (
            <motion.g
              key="clamp"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: '33px 26px' }}
            >
              <rect x="26" y="20" width="12" height="14" fill="#3a3a88" stroke="#6666cc" strokeWidth="0.8" rx="1" />
              <rect x="28" y="22" width="8" height="5" fill="#aaaaff" />
              <rect x="30" y="28" width="4" height="3" fill="#222" />
              <rect x="31" y="31" width="2" height="2" fill="#33ff66" />
              <rect x="33" y="22" width="3" height="8" fill="#555599" />
              <text x="32" y="17" textAnchor="middle" fill="#8888ee" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">CLAMP</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cut sensor wire */}
        <AnimatePresence>
          {state.panelOpen && state.showSensorCut && (
            <motion.g
              key="sensor-cut"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect x="33" y="22" width="3" height="8" fill="#444466" />
              <rect x="30" y="24" width="4" height="2" fill="#ff6600" />
              <rect x="29" y="26" width="3" height="2" fill="#ff8800" />
              <rect x="35" y="26" width="4" height="2" fill="#ff6600" />
              <rect x="36" y="28" width="3" height="2" fill="#ff8800" />
              {/* Spark marks */}
              <rect x="27" y="23" width="1" height="1" fill="#ffcc00" />
              <rect x="38" y="25" width="1" height="1" fill="#ffcc00" />
              <rect x="32" y="30" width="1" height="1" fill="#ffaa00" />
              <text x="24" y="20" textAnchor="middle" fill="#ff6600" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">CUT</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* USB stick in fascia port */}
        <AnimatePresence>
          {state.showUsbStick && (
            <motion.g
              key="usb-stick"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <rect x="46" y="164" width="14" height="6" fill="#222" stroke="#444" strokeWidth="0.5" />
              <rect x="48" y="165" width="10" height="4" fill="#111" />
              <rect x="38" y="165" width="10" height="4" fill="#4488ff" stroke="#2266cc" strokeWidth="0.5" />
              <rect x="40" y="166" width="6" height="2" fill="#66aaff" />
              <text x="43" y="162" textAnchor="middle" fill="#2266cc" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="bold">LIVE</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Laptop — HDD/USB install path */}
        <AnimatePresence>
          {state.showLaptop && (
            <motion.g
              key="laptop"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <text x="204" y="185" textAnchor="middle" fill="#33ff66" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">KALI</text>
              {/* Screen */}
              <rect x="178" y="188" width="52" height="36" fill="#2a2a2a" stroke="#444" strokeWidth="0.75" />
              <rect x="180" y="190" width="48" height="32" fill="#041204" />
              <rect x="182" y="194" width="32" height="3" fill="#33ff66" />
              <rect x="182" y="199" width="40" height="2" fill="#22cc55" />
              <rect x="182" y="203" width="28" height="2" fill="#118833" />
              <rect x="182" y="207" width="36" height="2" fill="#22cc55" />
              <rect x="182" y="211" width="20" height="2" fill="#118833" />
              <rect x="182" y="215" width="34" height="2" fill="#33ff6644" />
              {/* Base / hinge */}
              <rect x="174" y="224" width="60" height="6" fill="#333" stroke="#555" strokeWidth="0.5" />
              <rect x="198" y="224" width="12" height="3" fill="#444" />
              {/* USB cable to laptop when HDD removed */}
              {state.driveState === 'removed' && (
                <path d="M190 200 L190 224 L204 224" fill="none" stroke="#4488ff" strokeWidth="1.5" />
              )}
              {/* USB cable routes right fascia → USB port (avoids keypad) */}
              {state.showUsbStick && (
                <path d="M204 230 L214 230 L214 169 L58 169" fill="none" stroke="#4488ff" strokeWidth="1.2" strokeDasharray="2 1" />
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/*
          Black box = hardware shim INSIDE the cabinet on the CDM control bus.
          Drawn as a right-side callout (outside the fascia) so it never sits
          under the PIN pad. Dashed cable + "INSIDE" label sell the idea.
        */}
        <AnimatePresence>
          {state.showBlackbox && (
            <motion.g
              key="blackbox"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.35 }}
            >
              {/* Callout card — parked right of cabinet */}
              <rect x="214" y="196" width="56" height="78" fill="#120818" stroke="#9944cc" strokeWidth="1.25" />
              <rect x="216" y="198" width="52" height="14" fill="#2a0e30" />
              <text x="242" y="209" textAnchor="middle" fill="#cc88ee" fontFamily="Arial, sans-serif" fontSize="6.5" fontWeight="bold" letterSpacing="0.4">INSIDE ATM</text>

              {/* Tiny Pi board */}
              <rect x="226" y="220" width="32" height="22" fill="#6a2a8a" stroke="#9944cc" strokeWidth="0.75" />
              <rect x="230" y="224" width="10" height="10" fill="#3a1a4a" />
              <rect x="244" y="224" width="5" height="5" fill="#33ff66" />
              <rect x="252" y="224" width="3" height="3" fill="#ff2244" />
              <text x="242" y="252" textAnchor="middle" fill="#9944cc" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">RPi BLACKBOX</text>
              <text x="242" y="264" textAnchor="middle" fill="#8866aa" fontFamily="Arial, sans-serif" fontSize="4.5">CDM control splice</text>

              {/*
                Dashed lead stays OUTSIDE the fascia: callout → cabinet edge →
                down the right bevel → into the cash/CDM bay below the PIN pad.
              */}
              <path
                d="M214 236 L210 236 L210 300 L117 300"
                fill="none"
                stroke="#cc1133"
                strokeWidth="1.75"
                strokeDasharray="3 2"
              />
              {/* Entry point on cabinet edge */}
              <rect x="207" y="233" width="4" height="6" fill="#aa0022" />
              {/* CDM bus tap at dispenser bay (below PIN pad) */}
              <rect x="112" y="296" width="10" height="6" fill="#aa0022" stroke="#ff4466" strokeWidth="0.5" />
              <text x="117" y="291" textAnchor="middle" fill="#ff6688" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="bold">CDM</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* External USB keyboard — parked below cabinet so it clears model text */}
        <AnimatePresence>
          {state.showExtKeyboard && (
            <motion.g
              key="ext-keyboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <text x="78" y="391" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="bold">KEYBOARD</text>
              <rect x="34" y="394" width="88" height="28" fill="#2a2a2a" stroke="#555" strokeWidth="0.75" />
              <rect x="36" y="396" width="84" height="24" fill="#333" />
              {Array.from({ length: 15 }, (_, i) => (
                <rect
                  key={`ek-${i}`}
                  x={38 + (i % 5) * 16}
                  y={399 + Math.floor(i / 5) * 7}
                  width={13}
                  height={5.5}
                  fill="#444"
                  stroke="#555"
                  strokeWidth="0.4"
                />
              ))}
              {/* Cable routes right edge → USB port */}
              <path d="M122 408 L214 408 L214 169 L58 169" fill="none" stroke="#4488ff" strokeWidth="1.2" />
              <rect x="120" y="406" width="4" height="4" fill="#2266cc" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Money mule silhouette */}
        <AnimatePresence>
          {state.showMule && (
            <motion.g
              key="mule"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <text x="13" y="283" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="bold">MULE</text>
              {/* Head */}
              <rect x="6" y="288" width="14" height="14" fill="#666" stroke="#555" strokeWidth="0.5" />
              <rect x="9" y="292" width="3" height="2" fill="#444" />
              <rect x="14" y="292" width="3" height="2" fill="#444" />
              {/* Body */}
              <rect x="4" y="302" width="18" height="28" fill="#555" stroke="#444" strokeWidth="0.5" />
              <rect x="6" y="306" width="14" height="4" fill="#666" />
              {/* Legs */}
              <rect x="6" y="330" width="6" height="24" fill="#444" />
              <rect x="14" y="330" width="6" height="24" fill="#444" />
              <rect x="5" y="352" width="8" height="4" fill="#333" />
              <rect x="13" y="352" width="8" height="4" fill="#333" />
              {/* Toolbag */}
              <rect x="20" y="318" width="12" height="14" fill="#3a3a2a" stroke="#555" strokeWidth="0.5" />
              <rect x="22" y="316" width="8" height="3" fill="#555" />
              {/* Phone when calling */}
              {state.showPhone && (
                <>
                  <rect x="18" y="296" width="8" height="12" fill="#222" stroke="#4488ff" strokeWidth="0.6" />
                  <rect x="19" y="298" width="6" height="8" fill="#061a06" />
                  <rect x="21" y="294" width="2" height="3" fill="#888" />
                  <text x="26" y="285" textAnchor="middle" fill="#4488ff" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="bold">CALL</text>
                </>
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/*
          CDM cassette cutaway — INSIDE the safe/dispenser bay.
          Parked as a left-side callout so it never paints over the PIN pad.
        */}
        <AnimatePresence>
          {state.showCassetteCutaway && (
            <motion.g
              key="cassette-cutaway"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.35 }}
            >
              {/* Callout card left of cabinet */}
              <rect x="-62" y="184" width="78" height="102" fill="#041208" stroke="#4488ff" strokeWidth="1.25" strokeDasharray="3 2" />
              <rect x="-60" y="186" width="74" height="14" fill="#0a1a28" />
              <text x="-23" y="197" textAnchor="middle" fill="#66aaff" fontFamily="Arial, sans-serif" fontSize="6.5" fontWeight="bold" letterSpacing="0.4">CDM · INSIDE</text>

              {([0, 1, 2, 3] as const).map((i) => (
                <g key={`cass-${i}`}>
                  <rect
                    x={-50 + i * 15}
                    y={208}
                    width={13}
                    height={58}
                    fill="#00cc6644"
                    stroke="#00aa44"
                    strokeWidth="0.75"
                  />
                  <text
                    x={-43.5 + i * 15}
                    y={218}
                    textAnchor="middle"
                    fill="#33ff66"
                    fontFamily="Arial, sans-serif"
                    fontSize="5.5"
                    fontWeight="bold"
                  >
                    {i + 1}
                  </text>
                  <rect x={-48 + i * 15} y={222} width={9} height={5} fill="#33ff6688" />
                  {state.dispensing && (
                    <rect x={-48 + i * 15} y={250} width={9} height={10} fill="#33ff66aa" />
                  )}
                </g>
              ))}
              <text x="-23" y="278" textAnchor="middle" fill="#4488ff" fontFamily="Arial, sans-serif" fontSize="4.5">cassettes 1–4</text>

              {/* Lead into cash dispenser area (where bills actually exit) */}
              <path
                d="M14 236 L32 236 L40 300"
                fill="none"
                stroke="#4488ff"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <rect x="38" y="296" width="6" height="5" fill="#2266cc" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cash bills — jackpot loops; customer withdraw is one finite burst */}
        <AnimatePresence>
          {activeBills.map((bill) => (
            <motion.rect
              key={`${isJackpotRain ? 'jp' : `wd-${lastWithdrawAmount}`}-${bill.id}`}
              x={bill.startX} y={299}
              width={20} height={8}
              rx={1}
              fill={bill.color}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: bill.dx, y: bill.dy, opacity: 0, rotate: bill.rot }}
              transition={
                isJackpotRain
                  ? { duration: 1.1, delay: bill.delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 1.3 }
                  : { duration: 1.1, delay: bill.delay, ease: 'easeIn' }
              }
            />
          ))}
        </AnimatePresence>
      </svg>

      {/* Screen HTML overlay */}
      <div style={{
        position: 'absolute',
        left: SCR_L,
        top: SCR_T,
        width: SCR_W,
        height: SCR_H,
        overflow: 'hidden',
        pointerEvents: state.screenMode === 'normal' && INTERACTIVE_UI.includes(atmUiState) ? 'auto' : 'none',
      }}>
        <AtmScreen
          atmUiState={atmUiState}
          screenMode={state.screenMode}
          pinBuffer={pinBuffer}
          atmBalance={atmBalance}
          lastWithdrawAmount={lastWithdrawAmount}
          atmError={atmError}
          onMenuChoice={onMenuChoice}
          onAmountSelect={onAmountSelect}
          onAtmOk={onAtmOk}
          onInsertCard={onInsertCard}
        />
      </div>

      {/* Keypad HTML overlay */}
      <div style={{
        position: 'absolute',
        left: KPD_L,
        top: KPD_T,
        width: KPD_W,
        height: KPD_H,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 3,
        padding: 4,
        boxSizing: 'border-box',
        zIndex: 2,
      }}>
        {KEY_ROWS.map((row, ri) =>
          row.map((label, ci) => {
            const isCancel = ri === 3 && ci === 0;
            const isOk = ri === 3 && ci === 2;
            const bgColor = isCancel ? '#7a1010' : isOk ? '#102070' : '#383838';
            const hiEdge = isCancel ? '#cc3333' : isOk ? '#2255bb' : '#5a5a5a';
            const loEdge = isCancel ? '#440000' : isOk ? '#001040' : '#1a1a1a';
            const txtColor = isCancel ? '#ff9999' : isOk ? '#99bbff' : '#dddddd';
            return (
              <button
                key={`kb-${ri}-${ci}`}
                onClick={() => handleKeyClick(ri, ci)}
                style={{
                  background: bgColor,
                  borderTop: `2px solid ${hiEdge}`,
                  borderLeft: `2px solid ${hiEdge}`,
                  borderBottom: `2px solid ${loEdge}`,
                  borderRight: `2px solid ${loEdge}`,
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: '"W95FA","Courier New",monospace',
                  color: txtColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  userSelect: 'none',
                  imageRendering: 'pixelated',
                }}
                onMouseDown={e => {
                  const btn = e.currentTarget;
                  btn.style.borderTop = `2px solid ${loEdge}`;
                  btn.style.borderLeft = `2px solid ${loEdge}`;
                  btn.style.borderBottom = `2px solid ${hiEdge}`;
                  btn.style.borderRight = `2px solid ${hiEdge}`;
                }}
                onMouseUp={e => {
                  const btn = e.currentTarget;
                  btn.style.borderTop = `2px solid ${hiEdge}`;
                  btn.style.borderLeft = `2px solid ${hiEdge}`;
                  btn.style.borderBottom = `2px solid ${loEdge}`;
                  btn.style.borderRight = `2px solid ${loEdge}`;
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget;
                  btn.style.borderTop = `2px solid ${hiEdge}`;
                  btn.style.borderLeft = `2px solid ${hiEdge}`;
                  btn.style.borderBottom = `2px solid ${loEdge}`;
                  btn.style.borderRight = `2px solid ${loEdge}`;
                }}
              >
                {label}
              </button>
            );
          })
        )}
      </div>

      {/*
        Card animation overlay — same viewBox as the ATM SVG, stacked ABOVE the
        HTML PIN pad so the vertical insert path paints over the buttons.
      */}
      {cardAnimMode && (
        <svg
          viewBox="0 0 240 400"
          width={SVG_W}
          height={SVG_H}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 5,
            pointerEvents: 'none',
            overflow: 'visible',
            imageRendering: 'pixelated',
            shapeRendering: 'crispEdges',
          }}
        >
          <CardReaderAnimation
            key={cardAnimMode}
            mode={cardAnimMode}
            onDone={onCardAnimDone}
          />
        </svg>
      )}

    </div>
  );
}
