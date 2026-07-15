import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  reason: string;
  etaSeconds: number;
  arrived: boolean;
  strikeCount: number;
  lastEtaPenalty: number | null;
}

function PoliceBadge({ flash, arrived }: { flash: boolean; arrived: boolean }) {
  const blue = arrived ? (flash ? '#cc1122' : '#880011') : flash ? '#0044dd' : '#002299';
  const highlight = arrived ? (flash ? '#ff3344' : '#aa1122') : flash ? '#2266ff' : '#1144cc';
  return (
    <svg viewBox="0 0 22 28" width="28" height="36" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', flexShrink: 0 }}>
      <rect x="3" y="0" width="16" height="2" fill={blue} />
      <rect x="1" y="2" width="20" height="14" fill={blue} />
      <rect x="2" y="16" width="18" height="3" fill={blue} />
      <rect x="4" y="19" width="14" height="2" fill={blue} />
      <rect x="6" y="21" width="10" height="2" fill={blue} />
      <rect x="8" y="23" width="6" height="2" fill={blue} />
      <rect x="10" y="25" width="2" height="2" fill={blue} />
      <rect x="1" y="2" width="20" height="2" fill={highlight} />
      <rect x="1" y="2" width="2" height="14" fill={highlight} />
      <rect x="10" y="5" width="2" height="12" fill="#ffcc00" />
      <rect x="6" y="9" width="10" height="2" fill="#ffcc00" />
      <rect x="8" y="7" width="2" height="2" fill="#ffcc00" />
      <rect x="12" y="7" width="2" height="2" fill="#ffcc00" />
      <rect x="8" y="13" width="2" height="2" fill="#ffcc00" />
      <rect x="12" y="13" width="2" height="2" fill="#ffcc00" />
      <rect x="19" y="4" width="2" height="12" fill={arrived ? '#440008' : '#001166'} />
    </svg>
  );
}

function EtaBar({ eta, maxEta = 40 }: { eta: number; maxEta?: number }) {
  const pct = Math.max(0, Math.min(100, (eta / maxEta) * 100));
  const color = eta <= 5 ? '#ff2244' : eta <= 15 ? '#ff8800' : '#4488ff';
  return (
    <div style={{ height: 4, background: '#1a080c', borderRadius: 1, overflow: 'hidden', marginBottom: 8 }}>
      <motion.div
        animate={{ width: `${pct}%`, background: color }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ height: '100%', boxShadow: `0 0 6px ${color}88` }}
      />
    </div>
  );
}

function RadioTicker({ arrived }: { arrived: boolean }) {
  const lines = arrived
    ? ['UNIT ON SCENE', 'SECURE THE VESTIBULE', 'SUSPECTS DETAINED', 'ATM SEIZED']
    : ['DISPATCH → PATROL', 'CODE 3 RESPONSE', 'BRANCH ALARM ACTIVE', 'HOLD FOR BACKUP'];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % lines.length), 1800);
    return () => clearInterval(iv);
  }, [lines.length]);
  return (
    <div style={{
      fontSize: 7.5,
      letterSpacing: 1.2,
      color: arrived ? '#ff6677' : '#5577aa',
      fontFamily: '"Share Tech Mono","Courier New",monospace',
      marginBottom: 7,
      minHeight: 12,
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={lines[idx]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          ▸ {lines[idx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AlarmOverlay({
  reason,
  etaSeconds,
  arrived,
  strikeCount,
  lastEtaPenalty,
}: Props) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setFlash(f => !f), arrived ? 220 : 350);
    return () => clearInterval(iv);
  }, [arrived]);

  const mins = Math.floor(Math.max(0, etaSeconds) / 60);
  const secs = Math.max(0, etaSeconds) % 60;
  const timeStr = arrived ? 'HERE' : `${mins}:${secs.toString().padStart(2, '0')}`;
  const urgent = !arrived && etaSeconds <= 15;
  const critical = !arrived && etaSeconds <= 5;

  // Let the yellow evidence tape read on the ATM before the BUSTED veil covers it
  const [showBustVeil, setShowBustVeil] = useState(false);
  useEffect(() => {
    if (!arrived) {
      setShowBustVeil(false);
      return;
    }
    const t = setTimeout(() => setShowBustVeil(true), 1200);
    return () => clearTimeout(t);
  }, [arrived]);

  const borderColor = arrived
    ? (flash ? '#ff2244' : '#aa0011')
    : flash ? '#ff1133' : '#0033cc';
  const glowColor = arrived
    ? '#ff000066'
    : flash ? '#ff003344' : '#0044ff22';

  return (
    <>
      {/* Compact ETA card — always when police en route / arrived */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{
          opacity: 1,
          x: 0,
          scale: critical ? [1, 1.03, 1] : 1,
        }}
        transition={critical ? { scale: { duration: 0.5, repeat: Infinity } } : { duration: 0.25 }}
        style={{
          position: 'absolute',
          top: 50,
          right: 10,
          zIndex: 50, // above cheat sheet (40) so retry hints aren't buried
          width: 178,
          background: arrived ? '#120208' : '#0a0106',
          border: `2px solid ${borderColor}`,
          borderRadius: 3,
          padding: '10px 12px',
          fontFamily: '"Share Tech Mono","Courier New",monospace',
          boxShadow: `0 0 18px ${glowColor}, 0 2px 8px #0004`,
          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <PoliceBadge flash={flash} arrived={arrived} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 7.5, color: arrived ? '#ff4444' : '#ff4455', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 1 }}>
              {arrived ? 'On Scene' : 'Police ETA'}
            </div>
            <div style={{
              fontSize: arrived ? 14 : 26,
              fontWeight: 900,
              letterSpacing: arrived ? 1 : 2,
              lineHeight: 1,
              color: arrived ? '#ff2222' : (urgent ? '#ff2244' : '#ff8800'),
              textShadow: arrived ? '0 0 12px #ff000099' : (urgent ? '0 0 10px #ff224499' : '0 0 8px #ff880066'),
              fontFamily: 'inherit',
            }}>
              {timeStr}
            </div>
          </div>
        </div>

        {!arrived && <EtaBar eta={etaSeconds} />}

        <RadioTicker arrived={arrived} />

        {/* Strike / penalty chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 7, alignItems: 'center' }}>
          {strikeCount > 0 && (
            <span style={{
              fontSize: 7,
              letterSpacing: 1,
              padding: '2px 5px',
              background: '#2a0810',
              border: '1px solid #662233',
              color: '#ff6688',
            }}>
              STRIKE {strikeCount}
            </span>
          )}
          <AnimatePresence>
            {lastEtaPenalty != null && lastEtaPenalty > 0 && (
              <motion.span
                key={`pen-${lastEtaPenalty}-${etaSeconds}`}
                initial={{ opacity: 0, y: -4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: 1,
                  padding: '2px 6px',
                  background: '#3a0808',
                  border: '1px solid #ff3344',
                  color: '#ff4466',
                  textShadow: '0 0 8px #ff2244aa',
                }}
              >
                −{lastEtaPenalty}s
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div style={{ borderTop: '1px solid #330a0a', marginBottom: 7 }} />

        <div style={{ fontSize: 8.5, color: '#bb3344', lineHeight: 1.55, marginBottom: 8 }}>
          {reason}
        </div>

        <div style={{ borderTop: '1px solid #330a0a', marginBottom: 6 }} />

        <div style={{ fontSize: 8, color: '#664444', letterSpacing: 1 }}>
          <span style={{ color: '#ff7755' }}>R</span>
          <span style={{ color: '#553333' }}> — RESET DEMO</span>
        </div>
        {!arrived && (
          <div style={{ fontSize: 8, color: '#446655', letterSpacing: 1, marginTop: 4 }}>
            Keep going — beat the clock
          </div>
        )}
        {arrived && (
          <div style={{ fontSize: 8, color: '#553333', letterSpacing: 1, marginTop: 4 }}>
            Busted — reset only
          </div>
        )}
      </motion.div>

      {/* Full-screen bust takeover — delayed so evidence tape is visible first */}
      <AnimatePresence>
        {arrived && showBustVeil && (
          <motion.div
            key="bust-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              pointerEvents: 'none',
              overflow: 'hidden',
              background:
                'radial-gradient(ellipse at 20% 30%, #0033cc44 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #ff002244 0%, transparent 50%), linear-gradient(180deg, #060810ee 0%, #0a0410f2 55%, #120208ee 100%)',
            }}
          >
            {/* Alternating red / blue edge glow — matched blur + opacity so frames are the same size */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 56px #ff224488, inset 0 0 18px #ff3355cc',
                pointerEvents: 'none',
              }}
            />
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 56px #2266ff88, inset 0 0 18px #4488ffcc',
                pointerEvents: 'none',
              }}
            />

            {/* Full-height red scan line — travels top → bottom of the overlay */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 4,
                marginTop: -2,
                background: 'linear-gradient(90deg, transparent 0%, #ff2244 20%, #ff6688 50%, #ff2244 80%, transparent 100%)',
                boxShadow: '0 0 16px #ff2244cc, 0 0 32px #ff002266',
                pointerEvents: 'none',
              }}
            />
            {/* Soft trail behind the scan line */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 56,
                marginTop: -56,
                background: 'linear-gradient(180deg, transparent, #ff224428)',
                pointerEvents: 'none',
              }}
            />

            {/* Center stamp */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '42%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '90%',
            }}>
              <motion.div
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  textShadow: [
                    '2px 2px 0 #a81428, -1px 0 #0044ff88, 0 0 18px #ff002288',
                    '2px 2px 0 #001166, 1px 0 #ff2244aa, 0 0 22px #2266ff88',
                    '2px 2px 0 #a81428, -1px 0 #0044ff88, 0 0 18px #ff002288',
                  ],
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 280, damping: 18, delay: 0.1 },
                  opacity: { duration: 0.3, delay: 0.1 },
                  textShadow: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: 10,
                  color: '#ff3355',
                  lineHeight: 1,
                  imageRendering: 'pixelated',
                }}
              >
                BUSTED
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                style={{
                  margin: '12px auto 0',
                  width: 120,
                  height: 2,
                  background: 'linear-gradient(90deg, #ff2244, #4488ff, #ff2244)',
                  boxShadow: '0 0 8px #4488ff88',
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ delay: 0.45, duration: 1.4, repeat: Infinity }}
                style={{
                  marginTop: 14,
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: 12,
                  letterSpacing: 2,
                  color: '#88aaff',
                }}
              >
                Press R to reset
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
