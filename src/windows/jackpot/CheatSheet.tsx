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
  /** Cmds whose stdout has already printed — show output breakdown */
  unlockedOutputs: string[];
  /** Choice ids the demo has reached */
  unlockedChoices: ChoiceId[];
  started: boolean;
  /** Live sandbox cwd — localizes prologue cheat paths while still on danny@kali */
  sandboxCwd: string;
}

const SANDBOX_HOME = '/home/danny';
const KIT_DIR = `${SANDBOX_HOME}/kit`;
const BOOTSTRAP_PATH = `${KIT_DIR}/bootstrap.sh`;

/** Relative shell path from cwd → abs target (`./x`, `../x`, …). */
function shellRelPath(cwd: string, absTarget: string): string {
  const cwdParts = cwd.split('/').filter(Boolean);
  const tgtParts = absTarget.split('/').filter(Boolean);
  let i = 0;
  while (i < cwdParts.length && i < tgtParts.length && cwdParts[i] === tgtParts[i]) i++;
  const ups = cwdParts.length - i;
  const down = tgtParts.slice(i);
  if (ups === 0 && down.length === 0) return '.';
  if (ups === 0) return `./${down.join('/')}`;
  return `${'../'.repeat(ups)}${down.join('/')}`;
}

/** Rewrite kit prologue cheat lines so the typed path matches the player's cwd. */
function localizePrologueCheatCmd(cmd: CheatCmd, cwd: string): CheatCmd {
  if (cmd.cmd === 'ls ~/kit') {
    if (cwd === KIT_DIR) {
      return {
        ...cmd,
        cmd: 'ls',
        parts: [
          { token: 'ls', meaning: 'lists files. you\'re already in the kit.' },
        ],
      };
    }
    if (cwd === SANDBOX_HOME) {
      return {
        ...cmd,
        cmd: 'ls ~/kit',
        parts: [
          { token: 'ls', meaning: 'lists files' },
          { token: '~/kit', meaning: 'that\'s the kit folder. cd into it if you want.' },
        ],
      };
    }
    const rel = shellRelPath(cwd, KIT_DIR);
    return {
      ...cmd,
      cmd: `ls ${rel}`,
      parts: [
        { token: 'ls', meaning: 'lists files' },
        { token: rel, meaning: 'path to the kit from where you are' },
      ],
    };
  }

  if (cmd.cmd === 'sudo ./kit/bootstrap.sh') {
    const rel = shellRelPath(cwd, BOOTSTRAP_PATH);
    return {
      ...cmd,
      cmd: `sudo ${rel}`,
      parts: [
        { token: 'sudo', meaning: 'runs as root. danny can do that here.' },
        {
          token: rel,
          meaning: 'this gets you to root, kid. use it.',
        },
      ],
    };
  }

  return cmd;
}

function localizePhase1Blurb(cwd: string, fallback: string): string {
  if (!cwd.startsWith(SANDBOX_HOME)) return fallback;
  if (cwd === KIT_DIR) {
    return "You're in the kit. `ls`, then `sudo ./bootstrap.sh`, then get on the ATM's network, y'hear?";
  }
  if (cwd === SANDBOX_HOME) {
    return "Our guys left a kit on the laptop. `cd kit` or `ls ~/kit`, run bootstrap, then get on the ATM's network, y'hear?";
  }
  return "Find the kit from where you are, run bootstrap, then get on the ATM's network, y'hear?";
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

function PartRow({
  token,
  meaning,
  tone,
}: {
  token: string;
  meaning: string;
  tone: 'cmd' | 'out';
}) {
  const colors = tone === 'cmd'
    ? { fg: GOLD, bg: '#1a1a12', border: '#3a3010' }
    : { fg: '#88ccff', bg: '#0e1520', border: '#1a3048' };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <code style={{
        color: colors.fg,
        fontSize: 12,
        fontFamily: FONT,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: '1px 5px',
        flexShrink: 0,
        maxWidth: '42%',
        wordBreak: 'break-all',
      }}>
        {token}
      </code>
      <span style={{ color: '#999', fontSize: 12.5, lineHeight: 1.4 }}>{meaning}</span>
    </div>
  );
}

function CmdBlock({
  cmd,
  highlight,
  showOutputs,
}: {
  cmd: CheatCmd;
  highlight: boolean;
  showOutputs: boolean;
}) {
  const outs = cmd.outputs ?? [];
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
          <PartRow key={`${cmd.cmd}:p:${p.token}`} token={p.token} meaning={p.meaning} tone="cmd" />
        ))}
      </div>
      {showOutputs && outs.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #222' }}>
          <div style={{
            color: '#6688aa',
            fontSize: 10,
            letterSpacing: 1.2,
            fontWeight: 700,
            marginBottom: 5,
          }}>
            OUTPUT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {outs.map((p) => (
              <PartRow key={`${cmd.cmd}:o:${p.token}`} token={p.token} meaning={p.meaning} tone="out" />
            ))}
          </div>
        </div>
      )}
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
      if (choices.installMethod === 'blackbox') return '2';
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
 * Output breakdowns unlock only after that cmd's stdout has been revealed.
 */
export function computeCheatUnlocks(
  lines: TermLine[],
  revealedLines: number,
  waitingForChoice: ChoiceId | null,
): { unlockedCmds: string[]; unlockedOutputs: string[]; unlockedChoices: ChoiceId[] } {
  const cmds: string[] = [];
  const outputs: string[] = [];
  const choiceSet = new Set<ChoiceId>();

  for (let i = 0; i < revealedLines; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.t === 'cmd') {
      cmds.push(line.text);
      // Cursor past this cmd ⇒ stdout already dumped (acceptCommand jumps the block)
      if (revealedLines > i) outputs.push(line.text);
    }
    if (line.t === 'choice') choiceSet.add(line.id);
  }

  // Choice trees only unlock when the terminal is actually on them (or already past)
  if (waitingForChoice) choiceSet.add(waitingForChoice);

  // Peek the next cmd only — never peek a choice before SPACE lands on it
  for (let i = revealedLines; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.t === 'cmd') {
      if (!cmds.includes(line.text)) cmds.push(line.text);
      break;
    }
    if (line.t === 'choice') break;
  }

  return {
    unlockedCmds: cmds,
    unlockedOutputs: outputs,
    unlockedChoices: [...choiceSet],
  };
}

export function CheatSheet({
  open,
  onClose,
  phase,
  waitingForChoice,
  currentCmd,
  choices,
  unlockedCmds,
  unlockedOutputs,
  unlockedChoices,
  started,
  sandboxCwd,
}: Props) {
  const activeRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const unlockedCmdSet = new Set(unlockedCmds);
  const unlockedOutputSet = new Set(unlockedOutputs);
  const unlockedChoiceSet = new Set(unlockedChoices);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      (latestRef.current ?? activeRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
    return () => clearTimeout(t);
  }, [open, phase, waitingForChoice, currentCmd, unlockedCmds.length, unlockedOutputs.length, unlockedChoices.length, sandboxCwd]);

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
            // Override global user-select:none so presenters can copy commands
            userSelect: 'text',
            WebkitUserSelect: 'text',
            cursor: 'text',
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
                userSelect: 'none',
                WebkitUserSelect: 'none',
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
                      {p.phase === 1 ? localizePhase1Blurb(sandboxCwd, p.blurb) : p.blurb}
                    </div>
                  )}

                  {shownCmds.map((c) => {
                    const highlight = isActive && currentCmd === c.cmd;
                    const display = isActive && p.phase === 1 && sandboxCwd.startsWith(SANDBOX_HOME)
                      ? localizePrologueCheatCmd(c, sandboxCwd)
                      : c;
                    return (
                      <div key={c.cmd} ref={highlight ? latestRef : undefined}>
                        <CmdBlock
                          cmd={display}
                          highlight={highlight}
                          showOutputs={past || unlockedOutputSet.has(c.cmd)}
                        />
                      </div>
                    );
                  })}

                  {p.choices.map((ch) => {
                    // Unlocks only when waiting on this choice or already past it (no forward peek)
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
                            <CmdBlock
                              cmd={c}
                              highlight={isActive && currentCmd === c.cmd}
                              showOutputs={past || unlockedOutputSet.has(c.cmd)}
                            />
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
