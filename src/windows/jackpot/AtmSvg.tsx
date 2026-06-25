import { motion, AnimatePresence } from 'framer-motion';
import type { AtmVisualState, AtmUiState } from './types';
import { Sounds } from './sound';

interface Props {
  state: AtmVisualState;
  atmUiState: AtmUiState;
  pinBuffer: string;
  atmBalance: number;
  onPinDigit: (digit: string) => void;
  onClear: () => void;
  onEnter: () => void;
  onMenuChoice: (choice: 'balance' | 'withdraw' | 'cancel') => void;
  onAtmOk: () => void;
}

// Bills fall DOWN from the cash slot
function makeBills() {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    startX: 52 + (i % 9) * 14,
    dy: 65 + (i % 4) * 22,      // positive = downward
    dx: (i % 5) * 10 - 20,
    rot: (i % 7) * 18 - 45,
    delay: i * 0.08,
    color: i % 3 === 0 ? '#4a7c4e' : i % 3 === 1 ? '#6b9e6e' : '#3d6640',
  }));
}
const BILLS = makeBills();

// Uniform 1.05× scale: viewBox 240×400 → rendered 252×420
const SVG_W = 252;
const SVG_H = 420;
const SCALE = SVG_W / 240; // 1.05

// Screen overlay: SVG inner screen rect is x=44,y=46,w=146,h=102 in viewBox 240x400
const SCR_L = Math.round(44 * SCALE);
const SCR_T = Math.round(46 * SCALE);
const SCR_W = Math.round(146 * SCALE);
const SCR_H = Math.round(102 * SCALE);

// Keypad overlay: inner housing x=57,y=192 after moving label inside (w=120,h=78)
const KPD_L = Math.round(57 * SCALE);
const KPD_T = Math.round(192 * SCALE);
const KPD_W = Math.round(120 * SCALE);
const KPD_H = Math.round(78 * SCALE);

const SCREEN_BASE = {
  width: '100%', height: '100%',
  background: '#071407',
  color: '#00cc33',
  fontFamily: '"W95FA","Courier New",monospace',
  fontSize: 9,
  display: 'flex',
  flexDirection: 'column',
  padding: '5px 7px',
  boxSizing: 'border-box',
  userSelect: 'none',
  imageRendering: 'pixelated',
} as const;

const SCREEN_HDR = {
  color: '#c8a800',
  fontWeight: 'bold',
  fontSize: 9,
  letterSpacing: 1,
  borderBottom: '1px solid #c8a80033',
  paddingBottom: 3,
  marginBottom: 4,
} as const;

function AtmScreen({
  atmUiState, pinBuffer, atmBalance, onMenuChoice, onAtmOk,
}: {
  atmUiState: AtmUiState;
  pinBuffer: string;
  atmBalance: number;
  onMenuChoice: (choice: 'balance' | 'withdraw' | 'cancel') => void;
  onAtmOk: () => void;
}) {
  const menuBtn = (label: string, choice: 'balance' | 'withdraw' | 'cancel', color = '#00cc33') => (
    <button
      onClick={() => onMenuChoice(choice)}
      style={{ background: 'none', border: 'none', color, fontFamily: 'inherit', fontSize: 8, cursor: 'pointer', textAlign: 'left', padding: '2px 0', display: 'block', width: '100%', imageRendering: 'pixelated' as const }}
    >
      {label}
    </button>
  );

  if (atmUiState === 'idle') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELLS FARGO</div>
        <div style={{ textAlign: 'center', color: '#00aa22', fontSize: 8, lineHeight: 1.6, marginTop: 3 }}>
          <div>Welcome</div>
          <div style={{ color: '#007718', marginTop: 4 }}>Please enter your</div>
          <div style={{ color: '#007718' }}>PIN to begin</div>
        </div>
      </div>
    );
  }

  if (atmUiState === 'pin') {
    const filled = pinBuffer.length;
    const isWrong = filled === 4 && pinBuffer !== '1234';
    const stars = Array.from({ length: 4 }, (_, i) => (
      <span key={i} style={{ display: 'inline-block', width: 12, textAlign: 'center', color: i < filled ? '#00ff55' : '#1a4020' }}>
        {i < filled ? '*' : '_'}
      </span>
    ));
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>WELLS FARGO</div>
        <div style={{ fontSize: 8, color: '#009922', marginBottom: 4 }}>Enter PIN:</div>
        <div style={{ textAlign: 'center', fontSize: 14, letterSpacing: 3, margin: '3px 0', fontFamily: 'inherit' }}>{stars}</div>
        {isWrong && (
          <div style={{ textAlign: 'center', fontSize: 8, color: '#ff5555', marginTop: 5 }}>
            Incorrect PIN<br />press CLR
          </div>
        )}
        {!isWrong && filled > 0 && (
          <div style={{ textAlign: 'center', fontSize: 8, color: '#005514', marginTop: 4 }}>
            {4 - filled} more digit{4 - filled !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  if (atmUiState === 'menu') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>MAIN MENU</div>
        {menuBtn('1. Check Balance', 'balance')}
        {menuBtn('2. Withdraw Cash', 'withdraw')}
        {menuBtn('3. Cancel', 'cancel', '#cc4444')}
      </div>
    );
  }

  if (atmUiState === 'balance') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>BALANCE</div>
        <div style={{ fontSize: 8, color: '#007718', marginBottom: 3 }}>CHECKING:</div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#00ff55', margin: '3px 0', letterSpacing: 1, fontFamily: 'inherit' }}>
          ${atmBalance.toFixed(2)}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={onAtmOk} style={{ background: 'none', border: '1px solid #00882244', color: '#00aa22', fontFamily: 'inherit', fontSize: 8, cursor: 'pointer', padding: '2px 6px', display: 'block', margin: '0 auto' }}>
            OK
          </button>
        </div>
      </div>
    );
  }

  if (atmUiState === 'withdraw') {
    return (
      <div style={SCREEN_BASE}>
        <div style={SCREEN_HDR}>DISPENSING</div>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#00ff55', margin: '4px 0', letterSpacing: 1, fontFamily: 'inherit' }}>
          $500.00
        </div>
        <div style={{ textAlign: 'center', fontSize: 8, color: '#007718', lineHeight: 1.5 }}>
          <div>Please collect</div>
          <div>your cash below</div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={onAtmOk} style={{ background: 'none', border: '1px solid #00882244', color: '#00aa22', fontFamily: 'inherit', fontSize: 8, cursor: 'pointer', padding: '2px 6px', display: 'block', margin: '0 auto' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return <div style={SCREEN_BASE} />;
}

const KEY_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['CLR', '0', 'OK'],
];

export function AtmSvg({ state, atmUiState, pinBuffer, atmBalance, onPinDigit, onClear, onEnter, onMenuChoice, onAtmOk }: Props) {
  function handleKeyClick(row: number, col: number) {
    Sounds.pinPress();
    if (row === 3 && col === 0) { onClear(); return; }
    if (row === 3 && col === 2) { onEnter(); return; }
    const digit = row < 3
      ? (['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const)[row * 3 + col]
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
        <rect x="28" y="14" width="186" height="378" fill="#5a0e1c" />
        {/* Cabinet body — Wells Fargo red */}
        <rect x="24" y="10" width="186" height="378" fill="#c01e35" />
        <rect x="24" y="10" width="4" height="378" fill="#d42244" />
        <rect x="24" y="10" width="186" height="4" fill="#d42244" />
        <rect x="207" y="10" width="3" height="378" fill="#8a1225" />

        {/* Front fascia — WHITE */}
        <rect x="32" y="18" width="170" height="364" fill="#f4f4f4" />
        <rect x="32" y="18" width="170" height="2" fill="#e8e8e8" />
        <rect x="32" y="18" width="2" height="364" fill="#e8e8e8" />

        {/* Gold Wells Fargo accent strip at base of cabinet */}
        <rect x="24" y="382" width="186" height="6" fill="#c9990a" />
        <rect x="24" y="382" width="186" height="2" fill="#ffcd11" />
        <rect x="24" y="386" width="186" height="2" fill="#8a6800" />

        {/* Screen bezel */}
        <rect x="40" y="42" width="154" height="110" fill="#1a1a1a" rx="2" />
        <rect x="42" y="44" width="150" height="106" fill="#111" rx="1" />
        {/* Inner screen area — filled by HTML overlay */}
        <rect x="44" y="46" width="146" height="102" fill="#071407" />

        {/* Card reader */}
        <rect x="58" y="162" width="118" height="14" fill="#ccc" rx="1" />
        <rect x="60" y="164" width="114" height="10" fill="#bbb" rx="1" />
        <rect x="66" y="166" width="88" height="6" fill="#999" />
        {/* Card reader LED */}
        <rect x="162" y="165" width="7" height="7" fill="#00cc44" rx="1" />

        {/* Keypad housing */}
        <rect x="55" y="180" width="124" height="92" fill="#c8c8c8" />
        <rect x="57" y="182" width="120" height="88" fill="#d8d8d8" />
        {/* Keypad label — inside housing at top */}
        <text x="117" y="191" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="5" letterSpacing="1">PIN PAD</text>

        {/* Cash dispenser */}
        <rect x="40" y="286" width="154" height="30" fill="#bbb" />
        <rect x="42" y="288" width="150" height="26" fill="#aaa" />
        <rect x="50" y="292" width="134" height="14" fill="#888" />
        <rect x="50" y="292" width="134" height="14" fill="none" stroke="#666" strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`r-${i}`} x={58 + i * 10} y={297} width={4} height={4} fill="#999" />
        ))}
        <text x="117" y="325" textAnchor="middle" fill="#666" fontFamily="Arial, sans-serif" fontSize="4.5" letterSpacing="1">CASH DISPENSER</text>

        {/* Status lights */}
        <rect x="180" y="328" width="8" height="8" fill="#ffcd11" />
        <rect x="192" y="328" width="8" height="8" fill="#00cc44" />

        {/* === RJ45 ETHERNET PORT (left side of fascia, clearly labeled) === */}
        <text x="34" y="343" fill="#777" fontFamily="Arial, sans-serif" fontSize="5" letterSpacing="0.5">LAN</text>
        {/* Port housing */}
        <rect x="34" y="346" width="18" height="13" fill="#aaa" />
        <rect x="36" y="348" width="14" height="9" fill="#222" />
        {/* Port latch tab */}
        <rect x="40" y="348" width="6" height="2" fill="#555" />
        {/* 4 gold pins */}
        <rect x="37" y="351" width="1" height="5" fill="#cc9900" />
        <rect x="39" y="351" width="1" height="5" fill="#cc9900" />
        <rect x="41" y="351" width="1" height="5" fill="#cc9900" />
        <rect x="43" y="351" width="1" height="5" fill="#cc9900" />

        {/* Cable / loopback state */}
        {state.ethState === 'intact' && (
          <g>
            <rect x="24" y="349" width="12" height="6" fill="#aaaaaa" />
            <rect x="22" y="350" width="4" height="4" fill="#999" />
            <rect x="16" y="350" width="8" height="4" fill="#aaa" />
            <rect x="14" y="351" width="4" height="3" fill="#999" />
          </g>
        )}
        {state.ethState === 'loopback' && (
          <g>
            <rect x="24" y="348" width="12" height="9" fill="#4488ff" />
            <rect x="26" y="349" width="8" height="7" fill="#2266dd" />
            <rect x="18" y="346" width="3" height="16" fill="none" stroke="#4488ff" strokeWidth="2" />
            <rect x="18" y="346" width="8" height="2" fill="#4488ff" />
            <rect x="18" y="360" width="8" height="2" fill="#4488ff" />
            <rect x="28" y="362" width="8" height="4" fill="#ff2244" />
          </g>
        )}
        {state.ethState === 'cut' && (
          <g>
            <rect x="30" y="350" width="6" height="5" fill="#aaaaaa" />
            <rect x="26" y="349" width="5" height="2" fill="#ffaa00" />
            <rect x="26" y="352" width="5" height="2" fill="#ffaa00" />
            <rect x="26" y="355" width="5" height="2" fill="#cc7700" />
            <rect x="28" y="362" width="8" height="4" fill="#ffaa00" />
          </g>
        )}

        {/* ATM ID */}
        <text x="117" y="378" textAnchor="middle" fill="#888" fontFamily="Arial, sans-serif" fontSize="4.5" letterSpacing="0.5">DIEBOLD OPTEVA 740</text>

        {/* === TOP SERVICE PANEL (slides UP when open) === */}
        <motion.g
          animate={{
            y: state.panelOpen ? -34 : 0,
            opacity: state.panelOpen ? 0 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <rect x="32" y="10" width="170" height="22" fill="#c01e35" />
          <rect x="32" y="10" width="170" height="3" fill="#d42244" />
          <rect x="38" y="14" width="5" height="5" fill="#8a1225" />
          <rect x="192" y="14" width="5" height="5" fill="#8a1225" />
          <rect x="80" y="15" width="74" height="3" fill="#8a1225" />
          <rect x="80" y="20" width="74" height="3" fill="#8a1225" />
        </motion.g>

        {/* Internals revealed when panel lifts */}
        <AnimatePresence>
          {state.panelOpen && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <rect x="26" y="10" width="188" height="56" fill="#0c0a0a" />
              <rect x="26" y="10" width="188" height="3" fill="#1a1212" />
              <rect x="26" y="10" width="3" height="56" fill="#1a1212" />
              <rect x="211" y="10" width="3" height="56" fill="#060404" />
              <rect x="34" y="20" width="90" height="18" fill="#0d2010" stroke="#00ff8855" strokeWidth="1" />
              <rect x="38" y="22" width="18" height="14" fill="#1a3a1a" />
              <rect x="40" y="24" width="14" height="10" fill="#224422" />
              <rect x="60" y="22" width="8" height="14" fill="#1a1a3a" />
              <rect x="72" y="22" width="8" height="14" fill="#1a1a3a" />
              <rect x="84" y="24" width="4" height="4" fill="#00ff88" />
              <rect x="91" y="24" width="4" height="4" fill="#ffcd11" />
              <rect x="130" y="18" width="32" height="22" fill="#2a1520" stroke="#ff224466" strokeWidth="1" />
              <rect x="134" y="22" width="14" height="8" fill="#1a0a10" stroke="#444" strokeWidth="0.5" />
              <rect x="164" y="20" width="26" height="10" fill="#222" />
              <rect x="166" y="22" width="5" height="5" fill="#ff9900" />
              <rect x="174" y="22" width="5" height="5" fill="#ff2244" />
              <rect x="182" y="22" width="5" height="5" fill="#00ff88" />
              <rect x="34" y="42" width="150" height="4" fill="#1a1a2a" />
              <rect x="34" y="44" width="40" height="3" fill="#4488ff44" />
              <rect x="90" y="44" width="40" height="3" fill="#ff224444" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* === ALARM CLAMP (door sensor bypass) === */}
        <AnimatePresence>
          {state.showClamp && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="28" y="36" width="8" height="6" fill="#8888ee" stroke="#6666cc" strokeWidth="0.5" />
              <rect x="30" y="38" width="4" height="2" fill="#aaaaff" />
              <rect x="31" y="42" width="3" height="3" fill="#00ff88" />
              <rect x="32" y="45" width="1" height="8" fill="#88aaff" />
              <text x="38" y="40" fill="#8888ee" fontFamily="Arial, sans-serif" fontSize="4">CLAMP</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* HDD state */}
        {state.driveState === 'present' && state.panelOpen && (
          <rect x="132" y="14" width="28" height="18" fill="#555" stroke="#777" strokeWidth="0.5" />
        )}
        {state.driveState === 'removed' && (
          <motion.g initial={{ y: 0 }} animate={{ y: -34 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <rect x="132" y="14" width="28" height="18" fill="#555" />
            <rect x="134" y="16" width="24" height="8" fill="#666" />
            <rect x="145" y="32" width="3" height="70" fill="#4488ff" />
          </motion.g>
        )}

        {/* Laptop */}
        <AnimatePresence>
          {state.showLaptop && (
            <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <rect x="176" y="192" width="48" height="34" fill="#2a2a2a" />
              <rect x="177" y="193" width="46" height="32" fill="#1a1a1a" />
              <rect x="178" y="194" width="44" height="30" fill="#061a06" />
              <rect x="180" y="198" width="28" height="4" fill="#00ff8877" />
              <rect x="180" y="204" width="36" height="3" fill="#00ff8844" />
              <rect x="180" y="209" width="22" height="3" fill="#00ff8833" />
              <rect x="174" y="226" width="54" height="5" fill="#333" />
              <rect x="194" y="226" width="14" height="3" fill="#444" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Black box */}
        <AnimatePresence>
          {state.showBlackbox && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="170" y="262" width="44" height="32" fill="#220a22" stroke="#ff224488" strokeWidth="1.5" />
              <rect x="172" y="264" width="40" height="28" fill="#2d0d2d" />
              <rect x="176" y="268" width="12" height="12" fill="#3a1a3a" />
              <rect x="198" y="268" width="6" height="6" fill="#00ff88" />
              <rect x="180" y="294" width="3" height="12" fill="#ff2244" />
              <rect x="186" y="294" width="3" height="12" fill="#aaa" />
              <rect x="178" y="304" width="14" height="3" fill="#555" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* External keyboard (ACTIVATE phase) */}
        <AnimatePresence>
          {state.showExtKeyboard && (
            <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <rect x="36" y="360" width="84" height="28" fill="#2a2a2a" stroke="#ff224466" strokeWidth="1" />
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={`ek-${i}`} x={40 + (i % 5) * 14} y={366 + Math.floor(i / 5) * 12} width={11} height={9} fill="#333" stroke="#444" strokeWidth="0.5" />
              ))}
              <rect x="116" y="370" width="3" height="22" fill="#4488ff" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Money mule silhouette */}
        <AnimatePresence>
          {state.showMule && (
            <motion.g initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="4" y="294" width="16" height="16" fill="#666" />
              <rect x="2" y="310" width="20" height="32" fill="#555" />
              <rect x="22" y="312" width="10" height="5" fill="#555" />
              <rect x="4" y="342" width="6" height="22" fill="#444" />
              <rect x="14" y="342" width="6" height="22" fill="#444" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cassette cutaway overlay */}
        <AnimatePresence>
          {state.showCassetteCutaway && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="40" y="184" width="62" height="84" fill="#0000ff10" stroke="#4488ff44" strokeWidth="1" />
              <rect x="44" y="188" width="14" height="74" fill="#00ff8844" />
              <rect x="60" y="218" width="14" height="44" fill="#00ff8844" />
              <rect x="76" y="228" width="14" height="34" fill="#00ff8844" />
              <rect x="88" y="240" width="8" height="22" fill="#00ff8844" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cash bills — fall DOWN from dispenser slot */}
        <AnimatePresence>
          {state.dispensing && BILLS.map((bill) => (
            <motion.rect
              key={`bill-${bill.id}`}
              x={bill.startX} y={299}
              width={20} height={8}
              rx={1}
              fill={bill.color}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: bill.dx, y: bill.dy, opacity: 0, rotate: bill.rot }}
              transition={{ duration: 1.1, delay: bill.delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 1.3 }}
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
        pointerEvents: atmUiState === 'menu' || atmUiState === 'balance' || atmUiState === 'withdraw' ? 'auto' : 'none',
      }}>
        <AtmScreen
          atmUiState={atmUiState}
          pinBuffer={pinBuffer}
          atmBalance={atmBalance}
          onMenuChoice={onMenuChoice}
          onAtmOk={onAtmOk}
        />
      </div>

      {/* Keypad HTML overlay — blocky pixel-art buttons */}
      <div style={{
        position: 'absolute',
        left: KPD_L,
        top: KPD_T,
        width: KPD_W,
        height: KPD_H,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 2,
        padding: 3,
        boxSizing: 'border-box',
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
                  fontSize: 9,
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

      {/* State legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 9, color: '#555', letterSpacing: 0.5, fontFamily: 'Arial, sans-serif', justifyContent: 'center', flexWrap: 'wrap' }}>
        {state.showLaptop && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#4488ff', display: 'inline-block', flexShrink: 0 }} />USB CABLE</span>}
        {state.ethState === 'loopback' && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#ff2244', display: 'inline-block', flexShrink: 0 }} />LOGS BLOCKED</span>}
        {state.ethState === 'cut' && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#ffaa00', display: 'inline-block', flexShrink: 0 }} />LOGS BUFFERED</span>}
        {state.showClamp && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#8888ee', display: 'inline-block', flexShrink: 0 }} />SENSOR BYPASSED</span>}
        {state.showBlackbox && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#cc55cc', display: 'inline-block', flexShrink: 0 }} />BLACK BOX</span>}
        {state.dispensing && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#00cc44', display: 'inline-block', flexShrink: 0 }} />DISPENSING</span>}
      </div>
    </div>
  );
}
