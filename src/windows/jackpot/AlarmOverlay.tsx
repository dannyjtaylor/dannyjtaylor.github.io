import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  reason: string;
  onDismiss: () => void;
}

function PoliceCar({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 30" width="90" height="45" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', transform: flip ? 'scaleX(-1)' : undefined }}>
      <rect x="4"  y="8"  width="52" height="18" fill="#1a1a88" />
      <rect x="6"  y="10" width="48" height="14" fill="#2222aa" />
      <rect x="14" y="8"  width="32" height="8"  fill="#111177" />
      <rect x="16" y="10" width="12" height="5"  fill="#4444cc" />
      <rect x="32" y="10" width="12" height="5"  fill="#4444cc" />
      {/* Light bar */}
      <rect x="18" y="5"  width="10" height="5"  fill="#ff0033" />
      <rect x="32" y="5"  width="10" height="5"  fill="#0044ff" />
      {/* Wheels */}
      <rect x="4"  y="22" width="10" height="6"  fill="#222" />
      <rect x="46" y="22" width="10" height="6"  fill="#222" />
      <rect x="4"  y="8"  width="10" height="6"  fill="#222" />
      <rect x="46" y="8"  width="10" height="6"  fill="#222" />
      {/* White stripe */}
      <rect x="6"  y="14" width="48" height="3"  fill="#fff" opacity="0.12" />
    </svg>
  );
}

export function AlarmOverlay({ reason, onDismiss }: Props) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setFlash(f => !f), 250);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono","Courier New",monospace', overflow: 'hidden' }}
    >
      {/* Flashing bg */}
      <div style={{ position: 'absolute', inset: 0, background: flash ? '#ff003322' : '#0044ff18', transition: 'background 0.12s' }} />

      {/* Corner light beams */}
      <div style={{ position: 'absolute', inset: 0, background: flash ? 'radial-gradient(ellipse at 10% 10%, #ff003444 0%, transparent 55%)' : 'radial-gradient(ellipse at 90% 10%, #0044ff44 0%, transparent 55%)', pointerEvents: 'none' }} />

      {/* Police cars */}
      <div style={{ position: 'absolute', bottom: 40, display: 'flex', width: '100%', justifyContent: 'space-between', padding: '0 20px' }}>
        <motion.div initial={{ x: -220 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 80, delay: 0.4 }}>
          <PoliceCar />
        </motion.div>
        <motion.div initial={{ x: 220 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 80, delay: 0.6 }}>
          <PoliceCar flip />
        </motion.div>
      </div>

      {/* Alert content */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 32px' }}
      >
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#ff0033', marginBottom: 12, textTransform: 'uppercase' }}>
          Alert — Bank SIEM Triggered
        </div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ffffff', letterSpacing: 3, marginBottom: 8, textShadow: '0 0 20px #ff003380' }}>
          ATM TAMPER DETECTED
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#ff003388', marginBottom: 20, textTransform: 'uppercase' }}>
          Police Dispatched — Operation Blown
        </div>
        <div style={{ fontSize: 11, color: '#666', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7 }}>
          {reason}
        </div>
        <div style={{ fontSize: 9, color: '#ff003444', letterSpacing: 2, marginBottom: 14 }}>
          [ R ] or [ ENTER ] to reset and try again
        </div>
        <button
          onClick={onDismiss}
          style={{ background: '#1a0000', border: '1px solid #ff003366', color: '#ff0033', fontFamily: 'inherit', fontSize: 10, letterSpacing: 2, padding: '8px 28px', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          Reset Operation
        </button>
      </motion.div>
    </motion.div>
  );
}
