import { useEffect, useRef } from 'react';
import type { TermLine, ChoiceId, TermMode, FailedCmd, ShellTier, SandboxEcho } from './types';
import { CHOICES } from './phaseData';

interface Props {
  lines: TermLine[];
  revealedLines: number;
  waitingForChoice: ChoiceId | null;
  cashAmount: number;
  jackpotComplete: boolean;
  phaseId: number;
  started: boolean;
  termMode: TermMode;
  inputBuffer: string;
  cursorIndex: number;
  failedCmds: FailedCmd[];
  charIndex: number;
  typingOutIndex: number | null;
  termClearAt: number | null;
  shellTier: ShellTier;
  cwdDisplay: string;
  showPloutusBanner: boolean;
  sandboxEchoes: SandboxEcho[];
}

const FONT = '"Courier New", Courier, monospace';
const CMD_GREEN = '#33ff66';
const OUT_WHITE = '#e0e0e0';
const COMMENT_YELLOW = '#ffcd11';

function outColor(text: string, _s?: string): string {
  const t = text.trimStart();
  if (t.startsWith('#') || t.startsWith('//')) return COMMENT_YELLOW;
  return OUT_WHITE;
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

function renderPrompt(tier: ShellTier, cwd: string) {
  if (tier === 'user') {
    return (
      <>
        <span style={{ color: '#33ff66' }}>danny@kali</span>
        <span style={{ color: '#888888' }}>:</span>
        <span style={{ color: '#5c7cfa' }}>{cwd}</span>
        <span style={{ color: '#33ff66' }}>$</span>
        <span> </span>
      </>
    );
  }
  return (
    <>
      <span style={{ color: '#ff5555' }}>root@kali</span>
      <span style={{ color: '#888888' }}>:</span>
      <span style={{ color: '#5c7cfa' }}>{cwd}</span>
      <span style={{ color: '#ff5555' }}>#</span>
      <span> </span>
    </>
  );
}

/** Prompt for a historical scripted cmd line based on whether banner already shown. */
function promptForHistoryLine(
  lines: TermLine[],
  absIdx: number,
  showPloutusBanner: boolean,
): { tier: ShellTier; cwd: string } {
  // Before the banner line in phase 1 → user home; after → root workspace
  const bannerIdx = lines.findIndex((l) => l.t === 'banner');
  if (bannerIdx >= 0 && absIdx < bannerIdx) {
    return { tier: 'user', cwd: '/home/danny' };
  }
  if (showPloutusBanner || (bannerIdx >= 0 && absIdx > bannerIdx)) {
    return { tier: 'root', cwd: '/root/ploutus' };
  }
  return { tier: 'user', cwd: '/home/danny' };
}

const BANNER = `██████╗ ██╗      ██████╗ ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██╔═══██╗██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║██║   ██║   ██║   ██║   ██║╚════██║
██║     ███████╗╚██████╔╝╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝  ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝`;

function renderFullLine(
  line: TermLine,
  key: number | string,
  prompt: { tier: ShellTier; cwd: string },
) {
  if (line.t === 'blank') return <span key={key} style={{ display: 'block', height: '0.5em' }} />;
  if (line.t === 'banner') return null;
  if (line.t === 'cmd') {
    return (
      <span key={key} style={{ display: 'block', color: CMD_GREEN }}>
        {renderPrompt(prompt.tier, prompt.cwd)}{line.text}
      </span>
    );
  }
  if (line.t === 'out') {
    return (
      <span key={key} style={{ display: 'block', color: outColor(line.text, line.s), background: outBg(line.s), borderLeft: outBorderLeft(line.s), paddingLeft: outPaddingLeft(line.s), margin: outMargin(line.s) }}>
        {line.text}
      </span>
    );
  }
  return null;
}

function PixelatedSeven() {
  return (
    <div style={{ animation: 'svgGlow 6s infinite', display: 'inline-block' }}>
      <svg viewBox="0 0 22 38" width="30" height="50" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block', filter: 'drop-shadow(0 0 6px #e8203a88) drop-shadow(0 0 14px #e8203a33)' }}>
        <rect x="1" y="1" width="20" height="5" fill="#e8203a" />
        <rect x="1" y="1" width="20" height="2" fill="#ff3d5a" />
        <rect x="19" y="1" width="2" height="5" fill="#a81428" />
        <rect x="16" y="6" width="5" height="6" fill="#e8203a" />
        <rect x="19" y="6" width="2" height="6" fill="#a81428" />
        <rect x="11" y="12" width="5" height="6" fill="#e8203a" />
        <rect x="14" y="12" width="2" height="6" fill="#a81428" />
        <rect x="6" y="18" width="5" height="6" fill="#e8203a" />
        <rect x="9" y="18" width="2" height="6" fill="#a81428" />
        <rect x="1" y="24" width="5" height="13" fill="#e8203a" />
        <rect x="1" y="24" width="2" height="13" fill="#ff3d5a" />
        <rect x="4" y="24" width="2" height="13" fill="#a81428" />
      </svg>
    </div>
  );
}

export function TerminalPanel({
  lines,
  revealedLines,
  waitingForChoice,
  cashAmount,
  jackpotComplete,
  phaseId,
  started,
  termMode,
  inputBuffer,
  cursorIndex,
  failedCmds,
  charIndex,
  typingOutIndex,
  termClearAt,
  shellTier,
  cwdDisplay,
  showPloutusBanner,
  sandboxEchoes,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [revealedLines, waitingForChoice, cashAmount, inputBuffer, cursorIndex, failedCmds.length, termMode, charIndex, typingOutIndex, termClearAt, sandboxEchoes.length, showPloutusBanner]);

  const historyEnd = revealedLines;
  const historyStart = Math.max(0, termClearAt ?? 0);
  const historyLines = lines.slice(historyStart, historyEnd);

  // Show banner when we've revealed past the banner line OR handoff flipped the flag
  const bannerIdx = lines.findIndex((l) => l.t === 'banner');
  const bannerRevealed = showPloutusBanner && bannerIdx >= 0 && bannerIdx < revealedLines
    && (termClearAt === null || bannerIdx >= termClearAt);

  const expectedCmd =
    termMode === 'at-cmd' && lines[revealedLines]?.t === 'cmd'
      ? lines[revealedLines].text
      : null;
  const typingLine =
    typingOutIndex !== null && lines[typingOutIndex]?.t === 'out'
      ? lines[typingOutIndex]
      : null;

  const livePrompt = { tier: shellTier, cwd: cwdDisplay };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        fontFamily: FONT,
        fontSize: 14.5,
        lineHeight: 1.7,
        background: '#0c0c0c',
        scrollbarWidth: 'thin',
        scrollbarColor: '#333 #0c0c0c',
        userSelect: 'text',
        WebkitUserSelect: 'text',
        cursor: 'text',
      }}
    >
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes svgGlow{0%,90%,100%{filter:drop-shadow(0 0 6px #e8203a88) drop-shadow(0 0 14px #e8203a33)}92%{filter:drop-shadow(-2px 0 #0066ff66) drop-shadow(0 0 14px #e8203a55)}94%{filter:drop-shadow(2px 0 #e8203aaa) drop-shadow(-2px 0 #0066ff44)}}`}</style>

      {/* Fully revealed history */}
      {historyLines.map((line, i) => {
        const absIdx = historyStart + i;
        if (line.t === 'banner') {
          return bannerRevealed && absIdx === bannerIdx ? (
            <div key={`h-${absIdx}`} style={{ color: '#888888', fontSize: 10, lineHeight: 1.3, margin: '10px 0 14px', whiteSpace: 'pre', letterSpacing: 0 }}>
              {BANNER}
            </div>
          ) : null;
        }
        if (line.t === 'choice') {
          if (line.id === waitingForChoice) return null;
          const cfg = CHOICES[line.id];
          return (
            <div key={`h-${absIdx}`} style={{ background: '#12080c', border: '1px solid #ff224455', padding: '10px 14px', margin: '6px 0', borderRadius: 2, opacity: 0.55 }}>
              <div style={{ color: '#ff2244', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{cfg.prompt}</div>
              {cfg.options.map(opt => (
                <span key={opt.key} style={{ display: 'block', color: '#888888', padding: '3px 0' }}>
                  <kbd style={{ background: '#1a1a1a', border: '1px solid #333', padding: '0 6px', color: '#aaa', marginRight: 8, fontFamily: 'inherit', fontSize: 13 }}>{opt.key}</kbd>
                  {opt.label}
                </span>
              ))}
            </div>
          );
        }
        return renderFullLine(line, `h-${absIdx}`, promptForHistoryLine(lines, absIdx, showPloutusBanner));
      })}

      {/* Free-explore sandbox echoes (user tier) */}
      {sandboxEchoes.map((echo, i) => (
        <div key={`sand-${i}`} style={{ margin: '2px 0 6px' }}>
          {echo.cmd !== '' && (
            <span style={{ display: 'block', color: CMD_GREEN }}>
              {renderPrompt(echo.tier, echo.cwdDisplay)}{echo.cmd}
            </span>
          )}
          {echo.lines.map((l, j) => (
            <span key={j} style={{ display: 'block', color: OUT_WHITE, whiteSpace: 'pre-wrap' }}>{l}</span>
          ))}
        </div>
      ))}

      {/* Failed command attempts (bash-style) — root tier */}
      {failedCmds.map((f, i) => {
        const bin = f.typed.split(/\s+/)[0] || f.typed;
        return (
          <div key={`fail-${i}`} style={{ margin: '4px 0 8px' }}>
            <span style={{ display: 'block', color: CMD_GREEN }}>
              {renderPrompt(livePrompt.tier, livePrompt.cwd)}{f.typed}
            </span>
            <span style={{ display: 'block', color: '#ff5555' }}>
              {f.isDemoOnly
                ? `bash: ${bin}: hey, this is just a demo`
                : `bash: ${bin}: command not found`}
            </span>
            <span style={{ display: 'block', color: COMMENT_YELLOW }}>
              Did you mean &apos;{f.expected}&apos;?
            </span>
          </div>
        );
      })}

      {typingLine && typingLine.t === 'out' && (
        <span
          style={{
            display: 'block',
            color: outColor(typingLine.text, typingLine.s),
            background: outBg(typingLine.s),
            borderLeft: outBorderLeft(typingLine.s),
            paddingLeft: outPaddingLeft(typingLine.s),
            margin: outMargin(typingLine.s),
          }}
        >
          {typingLine.text.slice(0, charIndex)}
          <span style={{ color: CMD_GREEN, animation: 'blink 1s step-end infinite' }}>█</span>
        </span>
      )}

      {/* Live prompt — shown from cold boot so it feels like a real shell */}
      {((!started) || (started && termMode === 'at-cmd' && expectedCmd !== null && !typingLine)) && (
        <span style={{ display: 'block', color: CMD_GREEN }}>
          {renderPrompt(livePrompt.tier, livePrompt.cwd)}
          {started && (
            <>
              <span>{inputBuffer.slice(0, cursorIndex)}</span>
              <span style={{ color: CMD_GREEN, animation: 'blink 1s step-end infinite' }}>█</span>
              <span>{inputBuffer.slice(cursorIndex)}</span>
            </>
          )}
          {!started && (
            <span style={{ color: CMD_GREEN, animation: 'blink 1s step-end infinite' }}>█</span>
          )}
        </span>
      )}

      {!started && (
        <div style={{ color: '#666', fontSize: 12, marginTop: 10, letterSpacing: 0.5 }}>
          JACKPOTTING GAME — press <span style={{ color: '#aaa', animation: 'blink 1.2s step-end infinite' }}>[ SPACE ]</span>
        </div>
      )}

      {waitingForChoice && (
        <div style={{ background: '#12080c', border: '1px solid #ff224499', padding: '10px 14px', margin: '6px 0', borderRadius: 2 }}>
          <div style={{ color: '#ff2244', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{CHOICES[waitingForChoice].prompt}</div>
          {CHOICES[waitingForChoice].options.map(opt => (
            <span key={opt.key} style={{ display: 'block', color: '#e0e0e0', padding: '3px 0' }}>
              <kbd style={{ background: '#1a1a1a', border: '1px solid #666', padding: '0 6px', color: '#fff', marginRight: 8, fontFamily: 'inherit', fontSize: 13 }}>{opt.key}</kbd>
              {opt.label}
            </span>
          ))}
        </div>
      )}

      {phaseId === 6 && cashAmount > 0 && (
        <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#ffd700', textShadow: '0 0 16px #ffd70066, 1px 1px 0 #a07800', letterSpacing: 4, textAlign: 'center', padding: '14px 0' }}>
          ${cashAmount.toLocaleString()}
        </div>
      )}

      {jackpotComplete && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '12px 0 6px' }}>
            <PixelatedSeven />
            <PixelatedSeven />
            <PixelatedSeven />
          </div>
          <div style={{ textAlign: 'center', color: '#ffd700', fontSize: 12, letterSpacing: 3, marginTop: 4 }}>
            JACKPOT - OPERATION SUCCESSFUL
          </div>
          <div style={{ textAlign: 'center', color: '#ff003355', fontSize: 11, letterSpacing: 2, marginTop: 8 }}>
            PRESS [R] TO RESET DEMO
          </div>
        </>
      )}

      {started && !waitingForChoice && !jackpotComplete && !typingLine && (termMode === 'at-output' || termMode === 'at-announce' || termMode === 'phase-end') && (
        <span style={{ display: 'block', color: '#e0e0e0', marginTop: 2 }}>
          {renderPrompt(livePrompt.tier, livePrompt.cwd)}
          <span style={{ color: '#33ff66', animation: 'blink 1s step-end infinite' }}>█</span>
        </span>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
