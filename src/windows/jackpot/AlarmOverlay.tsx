import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  reason: string;
  isBlocking: boolean;   // true = game is paused on this alarm
  recoverable: boolean;  // true = ENTER can retry (only relevant when isBlocking)
}

function PoliceBadge({ flash }: { flash: boolean }) {
  const blue = flash ? '#0044dd' : '#002299';
  const highlight = flash ? '#2266ff' : '#1144cc';
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
      <rect x="19" y="4" width="2" height="12" fill="#001166" />
    </svg>
  );
}

export function AlarmOverlay({ reason, isBlocking, recoverable }: Props) {
  const [flash, setFlash] = useState(false);
  // Countdown runs once from 90 and never resets — persists across dismissals
  const [countdown, setCountdown] = useState(90);

  useEffect(() => {
    const iv = setInterval(() => setFlash(f => !f), 350);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const iv = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(iv);
  }, [countdown]);

  const arrived = countdown <= 0;
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timeStr = arrived ? 'HERE' : `${mins}:${secs.toString().padStart(2, '0')}`;
  const urgent = countdown <= 20;

  const borderColor = arrived
    ? '#ff0000'
    : flash ? '#ff1133' : '#0033cc';
  const glowColor = arrived
    ? '#ff000044'
    : flash ? '#ff003344' : '#0044ff22';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute',
        top: 50,
        right: 10,
        zIndex: 20,
        width: 168,
        background: '#0a0106',
        border: `2px solid ${borderColor}`,
        borderRadius: 3,
        padding: '10px 12px',
        fontFamily: '"Share Tech Mono","Courier New",monospace',
        boxShadow: `0 0 18px ${glowColor}, 0 2px 8px #0004`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Header: badge + ETA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <PoliceBadge flash={flash} />
        <div>
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

      {/* Divider */}
      <div style={{ borderTop: '1px solid #330a0a', marginBottom: 7 }} />

      {/* Reason — always shown */}
      <div style={{ fontSize: 8.5, color: '#bb3344', lineHeight: 1.55, marginBottom: 8 }}>
        {reason}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #330a0a', marginBottom: 6 }} />

      {/* Actions */}
      <div style={{ fontSize: 8, color: '#664444', letterSpacing: 1 }}>
        <span style={{ color: '#ff7755' }}>R</span>
        <span style={{ color: '#553333' }}> — RESET DEMO</span>
      </div>
      {isBlocking && recoverable && (
        <div style={{ fontSize: 8, color: '#664444', letterSpacing: 1, marginTop: 4 }}>
          <span style={{ color: '#6699ff' }}>ENTER</span>
          <span style={{ color: '#553333' }}> — RETRY CHOICE</span>
        </div>
      )}
      {isBlocking && !recoverable && (
        <div style={{ fontSize: 8, color: '#553333', letterSpacing: 1, marginTop: 4 }}>
          Operation blown — reset only
        </div>
      )}
    </motion.div>
  );
}
