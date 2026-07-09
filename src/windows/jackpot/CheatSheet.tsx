import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChoiceId, PhaseId, TermLine, ToolChoices } from './types';
import { CHEAT_PHASES, type CheatCmd, type CheatChoice } from './cheatSheetData';

interface Props {
  open: boolean;
  onClose: () => void;
  phase: PhaseId;
  waitingForChoice: ChoiceId | null;
  currentCmd: string | null;
  choices: ToolChoices;
  /** Cmd texts the demo has reached (completed + next peek) */
  unlockedCmds: string[];
  /** Choice ids the demo has reached */
  unlockedChoices: ChoiceId[];
  started: boolean;
}

const FONT = '"Courier New", Courier, monospace';
const GOLD = '#ffcd11';
const RED = '#e8203a';

function VerdictChip({ verdict }: { verdict: 'go' | 'maybe' | 'no' }) {
  const map = {
    go: { bg: '#0a2a14', border: '#33ff66', color: '#33ff66', label: 'GO' },
    maybe: { bg: '#2a2008', border: '#ffcd11', color: '#ffcd11', label: 'RISKY' },
    no: { bg: '#2a080c', border: '#ff4466', color: '#ff6688', label: 'NO' },
  } as const;
  const s = map[verdict];
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      padding: '1px 5px',
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      marginRight: 6,
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function CmdBlock({ cmd, highlight }: { cmd: CheatCmd; highlight: boolean }) {
  return (
    <div
      style={{
        marginBottom: 8,
        padding: '7px 8px',
        background: highlight ? '#0a1a10' : '#111',
        borderLeft: highlight ? '3px solid #33ff66' : '3px solid #333',
      }}
    >
      <div style={{ color: '#33ff66', fontSize: 13, wordBreak: 'break-all', marginBottom: 6 }}>
        {cmd.cmd}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {cmd.parts.map((p) => (
          <div key={`${cmd.cmd}:${p.token}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <code style={{
              color: GOLD,
              fontSize: 12,
              fontFamily: FONT,
              background: '#1a1a12',
              border: '1px solid #3a3010',
              padding: '1px 5px',
              flexShrink: 0,
              maxWidth: '42%',
              wordBreak: 'break-all',
            }}>
              {p.token}
            </code>
            <span style={{ color: '#999', fontSize: 12.5, lineHeight: 1.4 }}>{p.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function pickedKey(ch: CheatChoice, choices: ToolChoices): '1' | '2' | '3' | null {
  switch (ch.id) {
    case 'panel-access':
      if (choices.panelAccess === 'tbar') return '1';
      if (choices.panelAccess === 'social') return '3';
      return null;
    case 'ethernet':
      if (choices.ethernet === 'loopback') return '1';
      if (choices.ethernet === 'cut') return '2';
      if (choices.ethernet === 'live') return '3';
      return null;
    case 'alarm-sensor':
      return choices.alarmSensor === 'clamp' ? '1' : null;
    case 'install-method':
      if (choices.installMethod === 'hdd') return '1';
      if (choices.installMethod === 'usb') return '2';
      if (choices.installMethod === 'blackbox') return '3';
      return null;
    case 'persist-method':
      return choices.persistMethod === 'reseal' ? '1' : null;
    case 'activate-method':
      return choices.activateMethod === 'keyboard' ? '1' : null;
    default:
      return null;
  }
}

/**
 * Build unlock sets from the live terminal cursor.
 * Completed beats stay visible; the next upcoming cmd/choice peeks in
 * so interns always see "what do I do now?" without the whole phase dump.
 */
export function computeCheatUnlocks(
  lines: TermLine[],
  revealedLines: number,
  waitingForChoice: ChoiceId | null,
): { unlockedCmds: string[]; unlockedChoices: ChoiceId[] } {
  const cmds: string[] = [];
  const choiceSet = new Set<ChoiceId>();

  for (let i = 0; i < revealedLines; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.t === 'cmd') cmds.push(line.text);
    if (line.t === 'choice') choiceSet.add(line.id);
  }

  if (waitingForChoice) choiceSet.add(waitingForChoice);

  // Peek forward to the next interactive beat (cmd or choice)
  for (let i = revealedLines; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.t === 'cmd') {
      if (!cmds.includes(line.text)) cmds.push(line.text);
      break;
    }
    if (line.t === 'choice') {
      choiceSet.add(line.id);
      break;
    }
  }

  return { unlockedCmds: cmds, unlockedChoices: [...choiceSet] };
}

export function CheatSheet({
  open,
  onClose,
  phase,
  waitingForChoice,
  currentCmd,
  choices,
  unlockedCmds,
  unlockedChoices,
  started,
}: Props) {
  const activeRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const unlockedCmdSet = new Set(unlockedCmds);
  const unlockedChoiceSet = new Set(unlockedChoices);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      (latestRef.current ?? activeRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
    return () => clearTimeout(t);
  }, [open, phase, waitingForChoice, currentCmd, unlockedCmds.length, unlockedChoices.length]);

  const visiblePhases = started
    ? CHEAT_PHASES.filter((p) => p.phase <= phase)
    : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cheat-sheet"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            background: '#0c0c0c',
            borderLeft: `3px solid ${RED}`,
            fontFamily: FONT,
            color: '#e0e0e0',
            boxShadow: '-8px 0 24px #0008',
          }}
        >
          <div style={{
            background: RED,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: `2px solid #a81428`,
          }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              TRAIN DE AQUA NOTES
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notes"
              style={{
                background: 'transparent',
                border: '1px solid #ffcd11',
                color: '#fff',
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 700,
                width: 28,
                height: 28,
                lineHeight: '24px',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 20px', scrollbarWidth: 'thin', scrollbarColor: '#444 #0c0c0c' }}>
            {!started && (
              <div style={{ color: '#888', fontSize: 14, lineHeight: 1.5, padding: '12px 4px' }}>
                Hey newbie. Boss needs this money, so Train de Aqua made this cheat sheet for ya. Look at it any time you get stuck. (Start with the terminal)
              </div>
            )}

            {visiblePhases.map((p) => {
              const isActive = p.phase === phase;
              const past = p.phase < phase;
              // Past phases: full notes. Current phase: only what's unlocked so far.
              const shownCmds = past
                ? p.commands
                : p.commands.filter((c) => unlockedCmdSet.has(c.cmd));

              return (
                <div
                  key={p.phase}
                  ref={isActive ? activeRef : undefined}
                  style={{
                    marginBottom: 14,
                    border: isActive ? `1px solid ${RED}` : '1px solid #222',
                    background: isActive ? '#14080c' : '#0e0e0e',
                    padding: '10px 10px 8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      color: isActive ? '#fff' : '#666',
                      background: isActive ? RED : '#1a1a1a',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                      padding: '2px 6px',
                    }}>
                      0{p.phase}
                    </span>
                    <span style={{ color: isActive ? GOLD : '#888', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
                      {p.title}
                    </span>
                  </div>

                  {isActive && (
                    <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                      {p.blurb}
                    </div>
                  )}

                  {shownCmds.map((c) => {
                    const highlight = isActive && currentCmd === c.cmd;
                    return (
                      <div key={c.cmd} ref={highlight ? latestRef : undefined}>
                        <CmdBlock cmd={c} highlight={highlight} />
                      </div>
                    );
                  })}

                  {p.choices.map((ch) => {
                    const reached = past || unlockedChoiceSet.has(ch.id);
                    if (!reached) return null;
                    const choiceLive = isActive && waitingForChoice === ch.id;
                    const pick = pickedKey(ch, choices);
                    const followUps = (() => {
                      if (!pick) return [] as CheatCmd[];
                      const path = ch.afterPick?.[pick] ?? [];
                      if (past) return path;
                      return path.filter((c) => unlockedCmdSet.has(c.cmd));
                    })();

                    return (
                      <div
                        key={ch.id}
                        ref={choiceLive ? latestRef : undefined}
                        style={{
                          marginTop: 6,
                          padding: '7px 8px',
                          background: choiceLive ? '#1a080c' : '#111',
                          border: choiceLive ? `1px solid ${RED}` : '1px solid #222',
                        }}
                      >
                        <div style={{ color: choiceLive ? '#ff6688' : GOLD, fontSize: 12, letterSpacing: 1, marginBottom: 3, fontWeight: 700 }}>
                          CHOICE · {ch.prompt}
                          {choiceLive ? ' · YOUR TURN' : ''}
                        </div>
                        <div style={{ color: '#888', fontSize: 12.5, marginBottom: 6, lineHeight: 1.4 }}>{ch.tip}</div>
                        {ch.options.map((opt) => (
                          <div key={opt.key} style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
                            <span style={{
                              color: '#fff',
                              background: pick === opt.key ? '#2a1a08' : '#1a1a1a',
                              border: `1px solid ${pick === opt.key ? GOLD : '#555'}`,
                              fontSize: 12,
                              padding: '0 5px',
                              flexShrink: 0,
                              lineHeight: '18px',
                            }}>
                              {opt.key}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                                <VerdictChip verdict={opt.verdict} />
                                <span style={{ color: '#ddd', fontSize: 12.5 }}>{opt.label}</span>
                              </div>
                              <div style={{ color: '#888', fontSize: 12, lineHeight: 1.4 }}>{opt.note}</div>
                            </div>
                          </div>
                        ))}

                        {followUps.map((c) => (
                          <div key={c.cmd} ref={currentCmd === c.cmd ? latestRef : undefined} style={{ marginTop: 6 }}>
                            <CmdBlock cmd={c} highlight={isActive && currentCmd === c.cmd} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
