import { motion, AnimatePresence } from 'framer-motion';
import type { AtmVisualState } from './types';

interface Props {
  state: AtmVisualState;
}

function makeBills() {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    startX: 52 + (i % 9) * 14,
    dy: -(130 + (i % 4) * 30),
    dx: (i % 5) * 8 - 16,
    rot: (i % 7) * 12 - 30,
    delay: i * 0.08,
    color: i % 3 === 0 ? '#4a7c4e' : i % 3 === 1 ? '#6b9e6e' : '#3d6640',
  }));
}
const BILLS = makeBills();

const KEY_ROWS = [0, 1, 2, 3];
const KEY_COLS = [0, 1, 2];

export function AtmSvg({ state }: Props) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        viewBox="0 0 240 400"
        width="220"
        height="367"
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block' }}
      >
        {/* Cabinet shadow */}
        <rect x="28" y="14" width="186" height="378" fill="#111" />
        {/* Cabinet body */}
        <rect x="24" y="10" width="186" height="378" fill="#2a2a2a" />
        {/* Highlight left */}
        <rect x="24" y="10" width="3" height="378" fill="#363636" />
        {/* Highlight top */}
        <rect x="24" y="10" width="186" height="3" fill="#363636" />
        {/* Shadow right */}
        <rect x="207" y="10" width="3" height="378" fill="#1a1a1a" />
        {/* Front panel recess */}
        <rect x="32" y="18" width="170" height="364" fill="#222" />

        {/* Screen bezel */}
        <rect x="40" y="34" width="154" height="110" fill="#111" />
        <rect x="42" y="36" width="150" height="106" fill="#0a0a0a" />

        {/* Screen content by mode */}
        {state.screenMode === 'normal' && (
          <>
            <rect x="44" y="38" width="146" height="102" fill="#040f04" />
            <rect x="52" y="48" width="60" height="5" fill="#00e63933" />
            <rect x="52" y="56" width="100" height="4" fill="#00e63922" />
            <rect x="52" y="63" width="80" height="4" fill="#00e63922" />
            <rect x="52" y="70" width="90" height="4" fill="#00e63922" />
            <rect x="44" y="128" width="146" height="10" fill="#000" />
            <rect x="46" y="129" width="50" height="8" fill="#00e63918" />
          </>
        )}
        {state.screenMode === 'reboot' && (
          <>
            <rect x="44" y="38" width="146" height="102" fill="#000" />
            <rect x="70" y="80" width="94" height="6" fill="#00e63944" />
            <rect x="80" y="90" width="74" height="4" fill="#00e63922" />
            <rect x="80" y="98" width="50" height="4" fill="#00e63922" />
          </>
        )}
        {state.screenMode === 'ploutus' && (
          <>
            <rect x="44" y="38" width="146" height="102" fill="#000820" />
            <rect x="52" y="46" width="80" height="5" fill="#ff003366" />
            <rect x="52" y="56" width="110" height="4" fill="#ff003333" />
            <rect x="52" y="68" width="60" height="10" fill="#ff003322" />
            <rect x="118" y="68" width="60" height="10" fill="#ff003322" />
            <rect x="52" y="82" width="60" height="10" fill="#ff003322" />
            <rect x="118" y="82" width="60" height="10" fill="#ff003322" />
          </>
        )}
        {(state.screenMode === 'activate' || state.screenMode === 'jackpot') && (
          <>
            <rect x="44" y="38" width="146" height="102" fill="#000820" />
            <rect x="52" y="46" width="130" height="6" fill="#ff003355" />
            <rect x="52" y="60" width="60" height="10" fill="#ff003333" />
            <rect x="52" y="74" width="60" height="10" fill="#ff003333" />
            <rect x="52" y="88" width="60" height="10" fill="#00e63933" />
            <rect x="118" y="88" width="60" height="10" fill="#00e63933" />
          </>
        )}

        {/* Card reader */}
        <rect x="60" y="152" width="114" height="14" fill="#1e1e1e" />
        <rect x="62" y="154" width="110" height="10" fill="#0d0d0d" />
        <rect x="68" y="156" width="80" height="6" fill="#080808" />
        <rect x="158" y="156" width="8" height="6" fill="#003310" />

        {/* Keypad */}
        <rect x="55" y="172" width="124" height="90" fill="#1a1a1a" />
        <rect x="57" y="174" width="120" height="86" fill="#161616" />
        {KEY_ROWS.map(row =>
          KEY_COLS.map(col => (
            <rect
              key={`k-${row}-${col}`}
              x={63 + col * 34} y={180 + row * 20}
              width={28} height={16}
              fill={row === 3 && col !== 1 ? '#ff00331a' : '#1f1f1f'}
              stroke={row === 3 && col !== 1 ? '#ff003322' : 'none'}
              strokeWidth={1}
            />
          ))
        )}

        {/* Cash dispenser slot */}
        <rect x="40" y="278" width="154" height="28" fill="#161616" />
        <rect x="42" y="280" width="150" height="24" fill="#0d0d0d" />
        <rect x="50" y="284" width="134" height="14" fill="#080808" />
        <rect x="50" y="284" width="134" height="14" fill="none" stroke="#ff003333" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`r-${i}`} x={58 + i * 10} y={289} width={4} height={4} fill="#1a1a1a" />
        ))}

        {/* Receipt slot */}
        <rect x="82" y="314" width="70" height="10" fill="#161616" />
        <rect x="84" y="316" width="66" height="6" fill="#0d0d0d" />

        {/* Status lights */}
        <rect x="180" y="318" width="8" height="8" fill="#ff003344" />
        <rect x="192" y="318" width="8" height="8" fill="#ff990044" />

        {/* Panel (rotates open on breach) */}
        <motion.g
          style={{ transformOrigin: '24px 10px' }}
          animate={{ rotate: state.panelOpen ? -72 : 0 }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <rect x="32" y="10" width="170" height="22" fill="#2e2e2e" />
          <rect x="32" y="10" width="170" height="3" fill="#3a3a3a" />
          <rect x="38" y="13" width="4" height="4" fill="#222" />
          <rect x="192" y="13" width="4" height="4" fill="#222" />
          <rect x="85" y="14" width="64" height="10" fill="#1e1e1e" />
          <rect x="90" y="16" width="54" height="6" fill="#282828" />
        </motion.g>

        {/* Internals revealed when panel open */}
        <AnimatePresence>
          {state.panelOpen && (
            <motion.g
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <rect x="36" y="18" width="90" height="16" fill="#0d1a0d" stroke="#00e63922" strokeWidth="1" />
              <rect x="42" y="20" width="14" height="12" fill="#1a2a1a" />
              <rect x="44" y="22" width="10" height="8" fill="#223322" />
              <rect x="60" y="20" width="6" height="12" fill="#1a1a2a" />
              <rect x="70" y="20" width="6" height="12" fill="#1a1a2a" />
              <rect x="130" y="16" width="28" height="18" fill="#1a0505" stroke="#ff003333" strokeWidth="1" />
              <rect x="133" y="22" width="10" height="6" fill="#0d0d0d" stroke="#333" strokeWidth="0.5" />
              <rect x="163" y="18" width="22" height="8" fill="#111" />
              <rect x="165" y="20" width="4" height="4" fill="#ff9900" />
              <rect x="171" y="20" width="4" height="4" fill="#ff0033" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Ethernet state */}
        {state.ethState === 'intact' && (
          <rect x="24" y="340" width="16" height="4" fill="#888" />
        )}
        {state.ethState === 'loopback' && (
          <>
            <rect x="24" y="340" width="8" height="4" fill="#888" />
            <rect x="30" y="338" width="2" height="8" fill="#ff0033" />
            <rect x="24" y="340" width="6" height="4" fill="#4488ff" />
            <rect x="25" y="341" width="4" height="2" fill="#6699ff" />
          </>
        )}
        {state.ethState === 'cut' && (
          <>
            <rect x="24" y="340" width="8" height="4" fill="#888" />
            <rect x="30" y="338" width="2" height="8" fill="#ff9900" />
          </>
        )}

        {/* HDD states */}
        {state.driveState === 'present' && state.panelOpen && (
          <rect x="132" y="18" width="24" height="14" fill="#3a3a3a" />
        )}
        {state.driveState === 'removed' && (
          <motion.g initial={{ y: 0 }} animate={{ y: -28 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <rect x="132" y="18" width="24" height="14" fill="#3a3a3a" />
            <rect x="133" y="19" width="22" height="6" fill="#444" />
            <rect x="143" y="32" width="2" height="60" fill="#4488ff" />
          </motion.g>
        )}

        {/* Laptop */}
        <AnimatePresence>
          {state.showLaptop && (
            <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <rect x="178" y="190" width="44" height="30" fill="#1a1a1a" />
              <rect x="179" y="191" width="42" height="28" fill="#111" />
              <rect x="180" y="192" width="40" height="26" fill="#001400" />
              <rect x="182" y="194" width="24" height="3" fill="#00e63933" />
              <rect x="182" y="199" width="32" height="2" fill="#00e63922" />
              <rect x="182" y="203" width="20" height="2" fill="#00e63922" />
              <rect x="176" y="220" width="50" height="4" fill="#222" />
              <rect x="196" y="220" width="10" height="2" fill="#2a2a2a" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Black box */}
        <AnimatePresence>
          {state.showBlackbox && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="172" y="260" width="40" height="28" fill="#1a0a1a" stroke="#ff003344" strokeWidth="1" />
              <rect x="174" y="262" width="36" height="24" fill="#220a22" />
              <rect x="178" y="266" width="10" height="10" fill="#2a1a2a" />
              <rect x="200" y="266" width="4" height="4" fill="#00e639" />
              <rect x="182" y="288" width="2" height="10" fill="#ff0033" />
              <rect x="186" y="288" width="2" height="10" fill="#888" />
              <rect x="180" y="296" width="12" height="2" fill="#444" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* External keyboard */}
        <AnimatePresence>
          {state.showExtKeyboard && (
            <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <rect x="36" y="360" width="80" height="26" fill="#1a1a1a" stroke="#ff003333" strokeWidth="1" />
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={`ek-${i}`} x={40 + (i % 5) * 14} y={365 + Math.floor(i / 5) * 12} width={10} height={8} fill="#222" />
              ))}
              <rect x="116" y="370" width="2" height="20" fill="#4488ff" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Money mule silhouette */}
        <AnimatePresence>
          {state.showMule && (
            <motion.g initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="4" y="290" width="14" height="14" fill="#444" />
              <rect x="2" y="304" width="18" height="30" fill="#333" />
              <rect x="20" y="306" width="8" height="4" fill="#333" />
              <rect x="4" y="334" width="5" height="20" fill="#2a2a2a" />
              <rect x="13" y="334" width="5" height="20" fill="#2a2a2a" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cassette cutaway overlay */}
        <AnimatePresence>
          {state.showCassetteCutaway && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x="40" y="180" width="60" height="80" fill="#0000ff08" stroke="#4488ff22" strokeWidth="1" />
              <rect x="44" y="184" width="12" height="70" fill="#00e63922" />
              <rect x="58" y="214" width="12" height="40" fill="#00e63922" />
              <rect x="72" y="224" width="12" height="30" fill="#00e63922" />
              <rect x="86" y="234" width="8" height="20" fill="#00e63922" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cash bills flying out */}
        <AnimatePresence>
          {state.dispensing && BILLS.map((bill) => (
            <motion.rect
              key={`bill-${bill.id}`}
              x={bill.startX} y={284}
              width={20} height={8}
              rx={1}
              fill={bill.color}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: bill.dx, y: bill.dy, opacity: 0, rotate: bill.rot }}
              transition={{ duration: 0.9, delay: bill.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.4 }}
            />
          ))}
        </AnimatePresence>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 9, color: '#444', letterSpacing: 1, fontFamily: '"Courier New",monospace', justifyContent: 'center', flexWrap: 'wrap' }}>
        {state.showLaptop && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: '#4488ff', display: 'inline-block' }} />USB</div>}
        {state.ethState === 'loopback' && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: '#ff0033', display: 'inline-block' }} />LOGS BLOCKED</div>}
        {state.ethState === 'cut' && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: '#ff9900', display: 'inline-block' }} />LOGS BUFFERED</div>}
        {state.showBlackbox && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: '#aa44aa', display: 'inline-block' }} />BLACK BOX</div>}
        {state.dispensing && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, background: '#00e639', display: 'inline-block' }} />DISPENSING</div>}
      </div>
    </div>
  );
}
