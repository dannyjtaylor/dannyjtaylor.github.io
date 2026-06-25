import { useEffect, useRef } from 'react';
import type { TermLine, ChoiceId } from './types';
import { CHOICES } from './phaseData';

interface Props {
  lines: TermLine[];
  revealedLines: number;
  charIndex: number;
  waitingForChoice: ChoiceId | null;
  cashAmount: number;
  jackpotComplete: boolean;
  phaseId: number;
  started: boolean;
}

function outColor(s?: string): string {
  switch (s) {
    case 'ok':  return '#00ff88';
    case 'warn': return '#ffaa00';
    case 'err':  return '#ff2244';
    case 'hi':   return '#ffffff';
    case 'ann':  return '#ff224499';
    default:     return '#aaaaaa';
  }
}

function outBorderLeft(s?: string): string {
  return s === 'hi' ? '2px solid #ff0033' : 'none';
}

function outPaddingLeft(s?: string): string {
  return s === 'hi' ? '10px' : '0';
}

function outMargin(s?: string): string {
  return s === 'hi' ? '3px 0' : '0';
}

function outBg(s?: string): string {
  return s === 'hi' ? '#ffffff08' : 'transparent';
}

const BANNER = `██████╗ ██╗      ██████╗ ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██╔═══██╗██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║██║   ██║   ██║   ██║   ██║╚════██║
██║     ███████╗╚██████╔╝╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝  ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝`;

function renderFullLine(line: TermLine, key: number | string) {
  if (line.t === 'blank') return <span key={key} style={{ display: 'block', height: '0.5em' }} />;
  if (line.t === 'banner') return null;
  if (line.t === 'cmd') return (
    <span key={key} style={{ display: 'block', color: '#00ff88' }}>
      <span style={{ color: '#00ff8866' }}>$ </span>{line.text}
    </span>
  );
  if (line.t === 'out') return (
    <span key={key} style={{ display: 'block', color: outColor(line.s), background: outBg(line.s), borderLeft: outBorderLeft(line.s), paddingLeft: outPaddingLeft(line.s), margin: outMargin(line.s) }}>
      {line.text}
    </span>
  );
  return null;
}

function renderPartialLine(line: TermLine, charIndex: number) {
  if (line.t === 'blank' || line.t === 'banner' || line.t === 'choice') return null;
  const text = line.text.slice(0, charIndex);
  const isCmd = line.t === 'cmd';
  const color = isCmd ? '#00ff88' : outColor((line as { s?: string }).s);
  return (
    <span style={{ display: 'block', color }}>
      {isCmd && <span style={{ color: '#00ff8866' }}>$ </span>}
      {text}
      <span style={{ borderRight: '2px solid #00ff88', animation: 'blink 1s step-end infinite' }} />
    </span>
  );
}

function PixelatedSeven() {
  return (
    <div style={{ animation: 'svgGlow 6s infinite', display: 'inline-block' }}>
      <svg viewBox="0 0 22 38" width="30" height="50" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block', filter: 'drop-shadow(0 0 6px #c01e3588) drop-shadow(0 0 14px #c01e3533)' }}>
        {/* Top bar */}
        <rect x="1" y="1" width="20" height="5" fill="#c01e35" />
        {/* Highlight on top bar */}
        <rect x="1" y="1" width="20" height="2" fill="#d42244" />
        {/* Shadow edge on top bar */}
        <rect x="19" y="1" width="2" height="5" fill="#8a1225" />
        {/* Top-right descend */}
        <rect x="16" y="6" width="5" height="6" fill="#c01e35" />
        <rect x="19" y="6" width="2" height="6" fill="#8a1225" />
        {/* Middle-right descend */}
        <rect x="11" y="12" width="5" height="6" fill="#c01e35" />
        <rect x="14" y="12" width="2" height="6" fill="#8a1225" />
        {/* Lower diagonal */}
        <rect x="6" y="18" width="5" height="6" fill="#c01e35" />
        <rect x="9" y="18" width="2" height="6" fill="#8a1225" />
        {/* Vertical stroke */}
        <rect x="1" y="24" width="5" height="13" fill="#c01e35" />
        <rect x="1" y="24" width="2" height="13" fill="#d42244" />
        <rect x="4" y="24" width="2" height="13" fill="#8a1225" />
      </svg>
    </div>
  );
}

export function TerminalPanel({ lines, revealedLines, charIndex, waitingForChoice, cashAmount, jackpotComplete, phaseId, started }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isBanner = lines[0]?.t === 'banner';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [revealedLines, charIndex, waitingForChoice, cashAmount]);

  const currentLine = lines[revealedLines];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontFamily: '"Share Tech Mono","Courier New",monospace', fontSize: 12.5, lineHeight: 1.85, background: '#0d1117', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a #0d1117' }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes svgGlow{0%,90%,100%{filter:drop-shadow(0 0 6px #c01e3588) drop-shadow(0 0 14px #c01e3533)}92%{filter:drop-shadow(-2px 0 #0066ff66) drop-shadow(0 0 14px #c01e3555)}94%{filter:drop-shadow(2px 0 #c01e35aa) drop-shadow(-2px 0 #0066ff44)}}`}</style>

      {/* ASCII banner (phase 1 only) */}
      {isBanner && (
        <div style={{ color: '#ff224477', fontSize: 8, lineHeight: 1.3, marginBottom: 14, whiteSpace: 'pre', letterSpacing: 0 }}>
          {BANNER}
          <div style={{ color: '#ff224499', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>
            Ploutus-D Loader v2.1 — Kalignite XFS — Cobalt Group Toolkit
          </div>
        </div>
      )}

      {/* Fully revealed lines */}
      {lines.slice(isBanner ? 1 : 0, revealedLines).map((line, i) => {
        if (line.t === 'choice') {
          // Skip the dim render for the choice that is currently active below
          if (line.id === waitingForChoice) return null;
          const cfg = CHOICES[line.id];
          return (
            <div key={i} style={{ background: '#0d0008', border: '1px solid #ff224433', padding: '10px 14px', margin: '6px 0', borderRadius: 2, opacity: 0.55 }}>
              <div style={{ color: '#ff2244', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{cfg.prompt}</div>
              {cfg.options.map(opt => (
                <span key={opt.key} style={{ display: 'block', color: '#888888', padding: '3px 0' }}>
                  <kbd style={{ background: '#1a1a1a', border: '1px solid #333', padding: '0 6px', color: '#aaa', marginRight: 8, fontFamily: 'inherit', fontSize: 11 }}>{opt.key}</kbd>
                  {opt.label}
                </span>
              ))}
            </div>
          );
        }
        return renderFullLine(line, i);
      })}

      {/* Current line being typed */}
      {currentLine && currentLine.t !== 'choice' && renderPartialLine(currentLine, charIndex)}

      {/* Active choice prompt */}
      {waitingForChoice && (
        <div style={{ background: '#0d0008', border: '1px solid #ff224499', padding: '10px 14px', margin: '6px 0', borderRadius: 2 }}>
          <div style={{ color: '#ff2244', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{CHOICES[waitingForChoice].prompt}</div>
          {CHOICES[waitingForChoice].options.map(opt => (
            <span key={opt.key} style={{ display: 'block', color: '#e0e0e0', padding: '3px 0' }}>
              <kbd style={{ background: '#1a1a1a', border: '1px solid #666', padding: '0 6px', color: '#fff', marginRight: 8, fontFamily: 'inherit', fontSize: 11 }}>{opt.key}</kbd>
              {opt.label}
            </span>
          ))}
        </div>
      )}

      {/* Cash counter (phase 6) */}
      {phaseId === 6 && cashAmount > 0 && (
        <div style={{ fontFamily: '"Share Tech Mono","Courier New",monospace', fontSize: 22, fontWeight: 900, color: '#ffd700', textShadow: '0 0 16px #ffd70066, 1px 1px 0 #a07800', letterSpacing: 4, textAlign: 'center', padding: '14px 0' }}>
          ${cashAmount.toLocaleString()}
        </div>
      )}

      {/* Lucky 7 slot machine on jackpot complete */}
      {jackpotComplete && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '12px 0 6px' }}>
            <PixelatedSeven />
            <PixelatedSeven />
            <PixelatedSeven />
          </div>
          <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 10, letterSpacing: 3, marginTop: 4 }}>
            JACKPOT — OPERATION SUCCESSFUL
          </div>
          <div style={{ textAlign: 'center', color: '#ff003355', fontSize: 9, letterSpacing: 2, marginTop: 8 }}>
            PRESS [R] TO RESET DEMO
          </div>
        </>
      )}

      {/* SPACE to start — shown before first space press */}
      {!started && (
        <div style={{ color: '#ff224466', fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
          <span style={{ animation: 'blink 1.2s step-end infinite' }}>[ SPACE ]</span> START DEMO
        </div>
      )}

      {/* SPACE prompt when all lines done */}
      {started && !currentLine && !waitingForChoice && phaseId < 6 && !jackpotComplete && (
        <div style={{ color: '#ff224488', fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
          [ SPACE ] CONTINUE...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
