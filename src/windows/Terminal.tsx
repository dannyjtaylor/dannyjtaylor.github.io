import { useState, useRef, useEffect, useCallback } from 'react';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

/* ══════════════════════════════════════════════════════════
   Virtual Filesystem
   ══════════════════════════════════════════════════════════ */

interface FSNode {
  type: 'dir' | 'file' | 'program';
  children?: Record<string, FSNode>;
  content?: string;
  windowId?: string;       // for programs
  size?: number;
}

const FS: FSNode = {
  type: 'dir',
  children: {
    'WINDOWS': {
      type: 'dir',
      children: {
        'SYSTEM': {
          type: 'dir',
          children: {
            'WIN95.SYS': { type: 'file', content: '[Binary data — Windows 95 kernel]', size: 1024000 },
            'KERNEL32.DLL': { type: 'file', content: '[Binary data]', size: 512000 },
            'GDI32.DLL': { type: 'file', content: '[Binary data]', size: 256000 },
          },
        },
        'FONTS': {
          type: 'dir',
          children: {
            'W95FA.OTF': { type: 'file', content: '[Font file]', size: 48000 },
            'ARIAL.TTF': { type: 'file', content: '[Font file]', size: 72000 },
            'COUR.TTF': { type: 'file', content: '[Font file]', size: 58000 },
          },
        },
        'DESKTOP': {
          type: 'dir',
          children: {
            'ABOUT.TXT': { type: 'program', windowId: 'about', size: 420 },
            'PROJECTS': { type: 'program', windowId: 'projects', size: 0 },
            'RESUME.TXT': { type: 'program', windowId: 'resume', size: 842 },
            'CONTACT.EML': { type: 'program', windowId: 'contact', size: 256 },
            'PORTFOLIO.TXT': { type: 'program', windowId: 'portfolio', size: 1024 },
            'TRANSCRIPT.TXT': { type: 'program', windowId: 'transcript', size: 2048 },
            'INTERESTS.TXT': { type: 'program', windowId: 'interests', size: 512 },
            'DOTCARD.LNK': { type: 'program', windowId: 'dotcard', size: 128 },
          },
        },
      },
    },
    'PROGRAMS': {
      type: 'dir',
      children: {
        'VALORANT.EXE': { type: 'program', windowId: 'valorant', size: 13370 },
        'UNDERTALE.EXE': { type: 'program', windowId: 'undertale', size: 9999 },
        'CAVESTORY.EXE': { type: 'program', windowId: 'cavestory', size: 8080 },
        'MINESWEEPER.EXE': { type: 'program', windowId: 'minesweeper', size: 4096 },
        'VOLTBOX.EXE': { type: 'program', windowId: 'voltbox', size: 16384 },
        'GATHER.EXE': { type: 'program', windowId: 'discord', size: 2048 },
      },
    },
    'USERS': {
      type: 'dir',
      children: {
        'DANNY': {
          type: 'dir',
          children: {
            'MY DOCUMENTS': {
              type: 'dir',
              children: {
                'SECRET.TXT': { type: 'file', content: "Congratulations! You found the secret file.\nDanny's favorite number is 42.\n\n...or is it?", size: 128 },
                'TODO.TXT': { type: 'file', content: '[ ] Graduate\n[ ] Get a job\n[x] Build DannyOS\n[x] Have fun', size: 64 },
              },
            },
            'DESKTOP.INI': { type: 'file', content: '[.ShellClassInfo]\nIconResource=explorer.exe,0', size: 42 },
          },
        },
      },
    },
    'MY COMPUTER': { type: 'program', windowId: 'mycomputer', size: 0 },
    'RECYCLE BIN': { type: 'program', windowId: 'recycle', size: 0 },
    'DANNY.EXE': { type: 'file', content: 'MZ\x90\x00... [Binary data — That\'s me!]', size: 1337 },
    'ABOUT.TXT': { type: 'file', content: "Hey, I'm Danny J. Taylor.\nComputer Engineering student.\nWelcome to DannyOS.", size: 420 },
    'AUTOEXEC.BAT': { type: 'file', content: '@echo off\nSET PATH=C:\\WINDOWS;C:\\PROGRAMS\nSET PROMPT=$P$G\necho Welcome to DannyOS!', size: 96 },
    'CONFIG.SYS': { type: 'file', content: 'DEVICE=C:\\WINDOWS\\SYSTEM\\HIMEM.SYS\nDOS=HIGH,UMB\nFILES=40\nBUFFERS=20', size: 84 },
  },
};

function resolvePath(cwd: string[], relPath: string): string[] {
  const parts = relPath.replace(/\\/g, '/').split('/').filter(Boolean);
  const result = [...cwd];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (result.length > 0) result.pop();
    } else {
      result.push(part.toUpperCase());
    }
  }
  return result;
}

function getNode(path: string[]): FSNode | null {
  let node: FSNode = FS;
  for (const part of path) {
    if (node.type !== 'dir' || !node.children) return null;
    const child = node.children[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

function pathString(path: string[]): string {
  return 'C:\\' + path.join('\\');
}

function formatDate(): string {
  return '06/15/2004  09:30 AM';
}

function formatSize(size: number): string {
  return size.toLocaleString().padStart(12);
}

/* ══════════════════════════════════════════════════════════
   Terminal Component
   ══════════════════════════════════════════════════════════ */

export function Terminal() {
  const openWindow = useDesktopStore((s) => s.openWindow);

  const [history, setHistory] = useState<string[]>([
    'DannyOS [Version 1.0.2004]',
    'Copyright (C) 2004 DJTech.',
    '',
    'Type HELP for a list of commands.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cwd, setCwd] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt = `${pathString(cwd)}> `;

  const pushOutput = useCallback((lines: string[]) => {
    setHistory((prev) => [...prev, ...lines]);
  }, []);

  const handleCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      pushOutput([`${prompt}${raw}`]);

      if (trimmed) {
        setCmdHistory((prev) => [...prev, trimmed]);
      }
      setHistoryIdx(-1);

      const parts = trimmed.split(/\s+/);
      const cmd = (parts[0] ?? '').toLowerCase();
      const args = parts.slice(1);

      if (!cmd) {
        setInput('');
        return;
      }

      let output: string[] = [];

      switch (cmd) {
        case 'help': {
          output = [
            'Available commands:',
            '  HELP        - Show this help message',
            '  DIR / LS    - List directory contents',
            '  CD          - Change directory',
            '  TYPE / CAT  - Display file contents',
            '  TREE        - Show directory tree',
            '  CLS / CLEAR - Clear the screen',
            '  VER         - Show OS version',
            '  ECHO        - Print text',
            '  DATE        - Show current date',
            '  TIME        - Show current time',
            '  WHOAMI      - Show current user',
            '  PING        - Ping a host',
            '  START       - Open a program',
            '  PWD         - Print working directory',
            '  MKDIR       - Create directory (simulated)',
            '  COLOR       - Change terminal colors',
            '  NEOFETCH    - System info (Easter egg)',
            '  COWSAY      - Moo!',
            '  MATRIX      - Enter the matrix',
            '  EXIT        - Close terminal',
            '',
            'Programs you can START:',
            '  about, projects, resume, contact, portfolio,',
            '  transcript, interests, dotcard, valorant,',
            '  undertale, cavestory, minesweeper, voltbox,',
            '  discord, mycomputer, recycle, terminal',
            '',
            'You can also run .EXE files directly!',
          ];
          break;
        }

        case 'dir':
        case 'ls': {
          const targetPath = args.length > 0 ? resolvePath(cwd, args[0]!) : cwd;
          const node = getNode(targetPath);
          if (!node || node.type !== 'dir' || !node.children) {
            output = [`The system cannot find the path specified.`];
          } else {
            const dirPath = pathString(targetPath);
            output = [
              ` Volume in drive C is DANNYOS`,
              ` Volume Serial Number is D4N-NY04`,
              '',
              ` Directory of ${dirPath}`,
              '',
            ];
            let fileCount = 0;
            let dirCount = 0;
            let totalSize = 0;

            // Show . and ..
            output.push(`${formatDate()}    <DIR>          .`);
            output.push(`${formatDate()}    <DIR>          ..`);
            dirCount += 2;

            for (const [name, child] of Object.entries(node.children).sort()) {
              if (child.type === 'dir') {
                output.push(`${formatDate()}    <DIR>          ${name}`);
                dirCount++;
              } else {
                const size = child.size ?? 0;
                totalSize += size;
                output.push(`${formatDate()} ${formatSize(size)} ${name}`);
                fileCount++;
              }
            }

            output.push(`               ${fileCount} File(s)    ${totalSize.toLocaleString().padStart(10)} bytes`);
            output.push(`               ${dirCount} Dir(s)    418,123,456 bytes free`);
          }
          break;
        }

        case 'cd': {
          if (args.length === 0) {
            output = [pathString(cwd)];
          } else {
            const arg = args.join(' ');
            if (arg === '\\' || arg === '/') {
              setCwd([]);
              break;
            }
            const newPath = resolvePath(cwd, arg);
            const node = getNode(newPath);
            if (node && node.type === 'dir') {
              setCwd(newPath);
            } else if (node && (node.type === 'file' || node.type === 'program')) {
              output = [`'${arg}' is not a directory.`];
            } else {
              output = [`The system cannot find the path specified.`];
            }
          }
          break;
        }

        case 'type':
        case 'cat': {
          if (args.length === 0) {
            output = ['The syntax of the command is incorrect.'];
          } else {
            const targetPath = resolvePath(cwd, args.join(' '));
            const node = getNode(targetPath);
            if (!node) {
              output = [`The system cannot find the file specified.`];
            } else if (node.type === 'dir') {
              output = [`Access is denied.`];
            } else if (node.content) {
              output = node.content.split('\n');
            } else if (node.windowId) {
              output = [`[Program file — use START to run it]`];
            } else {
              output = [`[Empty file]`];
            }
          }
          break;
        }

        case 'tree': {
          const targetPath = args.length > 0 ? resolvePath(cwd, args[0]!) : cwd;
          const node = getNode(targetPath);
          if (!node || node.type !== 'dir') {
            output = [`Invalid path.`];
          } else {
            output = [pathString(targetPath)];
            const buildTree = (n: FSNode, prefix: string): string[] => {
              if (!n.children) return [];
              const entries = Object.entries(n.children).sort();
              const lines: string[] = [];
              entries.forEach(([name, child], i) => {
                const isLast = i === entries.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const nextPrefix = isLast ? '    ' : '│   ';
                const indicator = child.type === 'dir' ? '' : ` (${child.size ?? 0}b)`;
                lines.push(`${prefix}${connector}${name}${indicator}`);
                if (child.type === 'dir') {
                  lines.push(...buildTree(child, prefix + nextPrefix));
                }
              });
              return lines;
            };
            output.push(...buildTree(node, ''));
          }
          break;
        }

        case 'cls':
        case 'clear': {
          setHistory([]);
          setInput('');
          return;
        }

        case 'ver': {
          output = ['', 'DannyOS [Version 1.0.2004]', 'Copyright (C) 2004 DJTech.', ''];
          break;
        }

        case 'echo': {
          output = [args.join(' ')];
          break;
        }

        case 'date': {
          output = [`Current date is ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}`];
          break;
        }

        case 'time': {
          output = [`Current time is ${new Date().toLocaleTimeString()}`];
          break;
        }

        case 'whoami': {
          output = ['C:\\USERS\\DANNY'];
          break;
        }

        case 'pwd': {
          output = [pathString(cwd)];
          break;
        }

        case 'ping': {
          if (args.length === 0) {
            output = ['Usage: PING <hostname>'];
          } else {
            const host = args[0];
            output = [
              `Pinging ${host} with 32 bytes of data:`,
              `Reply from ${host}: bytes=32 time=1ms TTL=128`,
              `Reply from ${host}: bytes=32 time<1ms TTL=128`,
              `Reply from ${host}: bytes=32 time=1ms TTL=128`,
              `Reply from ${host}: bytes=32 time<1ms TTL=128`,
              '',
              `Ping statistics for ${host}:`,
              '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
              'Approximate round trip times in milli-seconds:',
              '    Minimum = 0ms, Maximum = 1ms, Average = 0ms',
            ];
          }
          break;
        }

        case 'mkdir':
        case 'md': {
          if (args.length === 0) {
            output = ['The syntax of the command is incorrect.'];
          } else {
            output = [`A subdirectory or file ${args[0]} already exists. (Simulation)`];
          }
          break;
        }

        case 'start': {
          if (args.length === 0) {
            output = ['Usage: START <program>'];
          } else {
            const name = args[0]!.toLowerCase().replace('.exe', '');
            try {
              openWindow(name);
              output = [`Starting ${name}...`];
            } catch {
              output = [`'${args[0]}' is not recognized as a program.`];
            }
          }
          break;
        }

        case 'exit': {
          pushOutput(['Goodbye.']);
          setInput('');
          return;
        }

        case 'color': {
          output = ['Color commands are not supported in this terminal.', 'But nice try! 🎨'];
          break;
        }

        case 'neofetch': {
          output = [
            '        ___________',
            '       /           \\     danny@dannyos',
            '      |  DannyOS   |     --------------',
            '      |  ________  |     OS: DannyOS 95',
            '      | |        | |     Host: dannyjtaylor.github.io',
            '      | |  D95   | |     Kernel: React 18',
            '      | |________| |     Uptime: since 2004',
            '      |            |     Shell: DannyDOS v1.0',
            '       \\__________/      Resolution: whatever fits',
            '         ||||||||         CPU: Danny\'s Brain',
            '         ||||||||         Memory: Lots of coffee',
            '',
          ];
          break;
        }

        case 'cowsay': {
          const msg = args.length > 0 ? args.join(' ') : 'Moo!';
          const border = '-'.repeat(msg.length + 2);
          output = [
            ` ${border}`,
            `< ${msg} >`,
            ` ${border}`,
            '        \\   ^__^',
            '         \\  (oo)\\_______',
            '            (__)\\       )\\/\\',
            '                ||----w |',
            '                ||     ||',
          ];
          break;
        }

        case 'matrix': {
          output = [
            'Wake up, Danny...',
            'The Matrix has you...',
            'Follow the white rabbit.',
            '',
            '01001000 01100101 01101100 01101100 01101111',
            '',
            'Knock, knock, Danny.',
          ];
          break;
        }

        case 'sudo': {
          output = [
            "Nice try. You don't have admin privileges on DannyOS.",
            'This incident will be reported. 🚨',
          ];
          break;
        }

        case 'rm': {
          if (args.includes('-rf') || args.includes('-rf /')) {
            output = ['Nice try! 💀 No deleting the entire filesystem.'];
          } else {
            output = ['Access is denied.'];
          }
          break;
        }

        default: {
          // Check if the user typed a filename directly — try to run it
          const lookupPath = resolvePath(cwd, trimmed);
          const node = getNode(lookupPath);
          if (node?.type === 'program' && node.windowId) {
            openWindow(node.windowId);
            output = [`Starting ${trimmed}...`];
          } else if (node?.type === 'file') {
            output = node.content ? node.content.split('\n') : ['[Empty file]'];
          } else {
            // Try as bare program name
            const bareNode = getNode(['PROGRAMS', cmd.toUpperCase() + '.EXE']);
            if (bareNode?.type === 'program' && bareNode.windowId) {
              openWindow(bareNode.windowId);
              output = [`Starting ${cmd}...`];
            } else {
              output = [
                `'${cmd}' is not recognized as an internal or external command,`,
                `operable program or batch file.`,
              ];
            }
          }
          break;
        }
      }

      if (output.length > 0) {
        pushOutput(output);
      }
      setInput('');
    },
    [cwd, prompt, pushOutput, openWindow],
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion
      const partial = input.trim().split(/\s+/).pop()?.toUpperCase() ?? '';
      if (partial) {
        const node = getNode(cwd);
        if (node?.type === 'dir' && node.children) {
          const matches = Object.keys(node.children).filter((name) =>
            name.startsWith(partial),
          );
          if (matches.length === 1) {
            const parts = input.trim().split(/\s+/);
            parts[parts.length - 1] = matches[0]!;
            setInput(parts.join(' '));
          } else if (matches.length > 1) {
            pushOutput([`${prompt}${input}`, matches.join('  ')]);
          }
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
        <span>{prompt}</span>
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
