import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './windows.module.css';

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () =>
    [
      'Available commands:',
      '  HELP      - Show this help',
      '  DIR       - List directory contents',
      '  CLS       - Clear the screen',
      '  VER       - Show DannyOS version',
      '  ECHO      - Print text to screen',
      '  DATE      - Show current date',
      '  TIME      - Show current time',
      '  TYPE      - Show file contents',
      '  CD        - Change directory',
      '  TREE      - Show directory tree',
      '  WHOAMI    - Show current user',
      '  PING      - Ping a host',
      '  EXIT      - Close this window',
    ].join('\n'),

  dir: () =>
    [
      ' Volume in drive C is DANNYOS',
      ' Volume Serial Number is D4N-NY04',
      '',
      ' Directory of C:\\',
      '',
      '06/15/2004  09:30 AM    <DIR>          WINDOWS',
      '06/15/2004  09:30 AM    <DIR>          PROJECTS',
      '06/15/2004  09:31 AM         1,337     DANNY.EXE',
      '06/15/2004  09:31 AM           420     ABOUT.TXT',
      '06/15/2004  09:31 AM           842     RESUME.TXT',
      '06/15/2004  09:32 AM           256     CONTACT.TXT',
      '               4 File(s)          2,855 bytes',
      '               2 Dir(s)   418,123,456 bytes free',
    ].join('\n'),

  ver: () => '\nDannyOS [Version 1.0.2004]\nCopyright (C) 2004 DJTech.\n',

  date: () => `Current date is ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}`,

  time: () => `Current time is ${new Date().toLocaleTimeString()}`,

  tree: () =>
    [
      'C:\\',
      '├── WINDOWS',
      '│   ├── SYSTEM',
      '│   └── FONTS',
      '├── PROJECTS',
      '│   └── (empty)',
      '├── DANNY.EXE',
      '├── ABOUT.TXT',
      '├── RESUME.TXT',
      '└── CONTACT.TXT',
    ].join('\n'),

  whoami: () => 'C:\\Users\\visitor',

  cd: (args) => {
    if (!args.length) return 'C:\\';
    return `The system cannot find the path specified: ${args[0]}`;
  },

  type: (args) => {
    if (!args.length) return 'The syntax of the command is incorrect.';
    const file = args[0]!.toUpperCase();
    if (file === 'ABOUT.TXT')
      return "Hey, I'm Danny J. Taylor.\nWelcome to DannyOS.";
    if (file === 'CONTACT.TXT')
      return 'GitHub: github.com/dannyjtaylor\nLinkedIn: linkedin.com/in/dannyjtaylor';
    if (file === 'RESUME.TXT') return 'Danny J. Taylor - Software Developer\n[Open the Resume window for full details]';
    return `The system cannot find the file specified: ${args[0]}`;
  },

  ping: (args) => {
    if (!args.length) return 'Usage: PING <hostname>';
    return [
      `Pinging ${args[0]} with 32 bytes of data:`,
      `Reply from ${args[0]}: bytes=32 time=1ms TTL=128`,
      `Reply from ${args[0]}: bytes=32 time<1ms TTL=128`,
      `Reply from ${args[0]}: bytes=32 time=1ms TTL=128`,
      '',
      `Ping statistics for ${args[0]}:`,
      '    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)',
    ].join('\n');
  },

  color: () => 'Color commands are not supported in this terminal.',
};

export function Terminal() {
  const [history, setHistory] = useState<string[]>([
    'DannyOS [Version 1.0.2004]',
    'Copyright (C) 2004 DJTech.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (trimmed) {
        setCmdHistory((prev) => [...prev, trimmed]);
      }
      setHistoryIdx(-1);

      const parts = trimmed.split(/\s+/);
      const command = parts[0]?.toLowerCase() ?? '';
      const args = parts.slice(1);

      let output: string;
      if (!command) {
        output = '';
      } else if (command === 'echo') {
        output = args.join(' ');
      } else if (command === 'cls') {
        setHistory([]);
        setInput('');
        return;
      } else if (command === 'exit') {
        setHistory((prev) => [...prev, `C:\\> ${cmd}`, 'Goodbye.']);
        setInput('');
        return;
      } else if (COMMANDS[command]) {
        output = COMMANDS[command]!(args);
      } else {
        output = `'${command}' is not recognized as an internal or external command,\noperable program or batch file.`;
      }

      setHistory((prev) => [...prev, `C:\\> ${cmd}`, output]);
      setInput('');
    },
    [],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx < 0 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]!);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1;
        if (newIdx >= cmdHistory.length) {
          setHistoryIdx(-1);
          setInput('');
        } else {
          setHistoryIdx(newIdx);
          setInput(cmdHistory[newIdx]!);
        }
      }
    }
  };

  return (
    <div
      className={styles.terminal}
      onClick={() => inputRef.current?.focus()}
      ref={scrollRef}
    >
      {history.map((line, i) => (
        <div key={i} className={styles.termLine}>
          {line.split('\n').map((l, j) => (
            <div key={j}>{l || '\u00A0'}</div>
          ))}
        </div>
      ))}
      <div className={styles.termPrompt}>
        <span>C:\&gt;&nbsp;</span>
        <input
          ref={inputRef}
          className={styles.termInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
