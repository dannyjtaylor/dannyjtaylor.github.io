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
}

function outColor(s?: string): string {
  switch (s) {
    case 'ok':  return '#00e639';
    case 'warn': return '#ff9900';
    case 'err':  return '#ff0033';
    case 'hi':   return '#ffffff';
    case 'ann':  return '#ff003399';
    default:     return '#555555';
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
    <span key={key} style={{ display: 'block', color: '#00e639' }}>
      <span style={{ color: '#00e63955' }}>$ </span>{line.text}
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
  const color = isCmd ? '#00e639' : outColor((line as { s?: string }).s);
  return (
    <span style={{ display: 'block', color }}>
      {isCmd && <span style={{ color: '#00e63955' }}>$ </span>}
      {text}
      <span style={{ borderRight: '2px solid #00e639', animation: 'blink 1s step-end infinite' }} />
    </span>
  );
}

export function TerminalPanel({ lines, revealedLines, charIndex, waitingForChoice, cashAmount, jackpotComplete, phaseId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isBanner = lines[0]?.t === 'banner';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [revealedLines, charIndex, waitingForChoice, cashAmount]);

  const currentLine = lines[revealedLines];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontFamily: '"Share Tech Mono","Courier New",monospace', fontSize: 12.5, lineHeight: 1.85, background: '#040404', scrollbarWidth: 'thin', scrollbarColor: '#1a1a1a #040404' }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* ASCII banner (phase 1 only) */}
      {isBanner && (
        <div style={{ color: '#ff003355', fontSize: 8, lineHeight: 1.3, marginBottom: 14, whiteSpace: 'pre', letterSpacing: 0 }}>
          {BANNER}
          <div style={{ color: '#ff003377', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>
            Ploutus-D Loader v2.1 — Kalignite XFS — Cobalt Group Toolkit
          </div>
        </div>
      )}

      {/* Fully revealed lines */}
      {lines.slice(isBanner ? 1 : 0, revealedLines).map((line, i) => {
        if (line.t === 'choice') {
          const cfg = CHOICES[line.id];
          return (
            <div key={i} style={{ background: '#0a0005', border: '1px solid #ff003344', padding: '10px 14px', margin: '6px 0', borderRadius: 2 }}>
              <div style={{ color: '#ff0033', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{cfg.prompt}</div>
              {cfg.options.map(opt => (
                <span key={opt.key} style={{ display: 'block', color: '#888', padding: '3px 0' }}>
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
        <div style={{ background: '#0a0005', border: '1px solid #ff003366', padding: '10px 14px', margin: '6px 0', borderRadius: 2 }}>
          <div style={{ color: '#ff0033', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{CHOICES[waitingForChoice].prompt}</div>
          {CHOICES[waitingForChoice].options.map(opt => (
            <span key={opt.key} style={{ display: 'block', color: '#cccccc', padding: '3px 0' }}>
              <kbd style={{ background: '#1a1a1a', border: '1px solid #555', padding: '0 6px', color: '#fff', marginRight: 8, fontFamily: 'inherit', fontSize: 11 }}>{opt.key}</kbd>
              {opt.label}
            </span>
          ))}
        </div>
      )}

      {/* Cash counter (phase 6) */}
      {phaseId === 6 && cashAmount > 0 && (
        <div style={{ fontSize: 26, fontWeight: 'bold', color: '#ffd700', textShadow: '0 0 20px #ffd70080', letterSpacing: 3, textAlign: 'center', padding: '16px 0' }}>
          ${cashAmount.toLocaleString()}
        </div>
      )}

      {/* Lucky 7 slot machine on jackpot complete */}
      {jackpotComplete && (
        <>
          <div style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, color: '#ff0033', padding: '8px 0', textShadow: '0 0 12px #ff003380' }}>
            [ 7 ]  [ 7 ]  [ 7 ]
          </div>
          <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
            JACKPOT — OPERATION SUCCESSFUL
          </div>
          <div style={{ textAlign: 'center', color: '#ff003355', fontSize: 9, letterSpacing: 2, marginTop: 8 }}>
            PRESS [R] TO RESET DEMO
          </div>
        </>
      )}

      {/* SPACE prompt when all lines done */}
      {!currentLine && !waitingForChoice && phaseId < 6 && !jackpotComplete && (
        <div style={{ color: '#ff003355', fontSize: 9, letterSpacing: 2, marginTop: 6 }}>
          [ SPACE ] CONTINUE...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
