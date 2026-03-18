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
  windowId?: string;
  size?: number;
}

const FS: FSNode = {
  type: 'dir',
  children: {
    'Windows': {
      type: 'dir',
      children: {
        'System': {
          type: 'dir',
          children: {
            'Win95.sys': { type: 'file', content: '[Binary data — Windows 95 kernel]', size: 1024000 },
            'Kernel32.dll': { type: 'file', content: '[Binary data]', size: 512000 },
            'Gdi32.dll': { type: 'file', content: '[Binary data]', size: 256000 },
          },
        },
        'Fonts': {
          type: 'dir',
          children: {
            'W95FA.otf': { type: 'file', content: '[Font file]', size: 48000 },
            'Arial.ttf': { type: 'file', content: '[Font file]', size: 72000 },
            'Cour.ttf': { type: 'file', content: '[Font file]', size: 58000 },
          },
        },
        'Desktop': {
          type: 'dir',
          children: {
            'About.txt': { type: 'program', windowId: 'about', size: 420 },
            'Projects': { type: 'program', windowId: 'projects', size: 0 },
            'Resume.txt': { type: 'program', windowId: 'resume', size: 842 },
            'Contact.eml': { type: 'program', windowId: 'contact', size: 256 },
            'Portfolio.txt': { type: 'program', windowId: 'portfolio', size: 1024 },
            'Transcript.txt': { type: 'program', windowId: 'transcript', size: 2048 },
            'Interests.txt': { type: 'program', windowId: 'interests', size: 512 },
          },
        },
      },
    },
    'Programs': {
      type: 'dir',
      children: {
        'Valorant.exe': { type: 'program', windowId: 'valorant', size: 13370 },
        'Undertale.exe': { type: 'program', windowId: 'undertale', size: 9999 },
        'CaveStory.exe': { type: 'program', windowId: 'cavestory', size: 8080 },
        'Minesweeper.exe': { type: 'program', windowId: 'minesweeper', size: 4096 },
        'Breadbox.exe': { type: 'program', windowId: 'breadbox', size: 16384 },
        'Gather.exe': { type: 'program', windowId: 'discord', size: 2048 },
        'AOL.exe': { type: 'program', windowId: 'aol', size: 3072 },
        'Paint.exe': { type: 'program', windowId: 'paint', size: 5120 },
        'Settings.exe': { type: 'program', windowId: 'settings', size: 1536 },
        'DateTime.exe': { type: 'program', windowId: 'datetime', size: 1024 },
        'Steam.exe': { type: 'program', windowId: 'steam', size: 24576 },
        'MusicPlayer.exe': { type: 'program', windowId: 'musicplayer', size: 8192 },
      },
    },
    'Users': {
      type: 'dir',
      children: {
        'Danny': {
          type: 'dir',
          children: {
            'My Documents': {
              type: 'dir',
              children: {
                'Secret.txt': { type: 'file', content: "Nice job, you found the secret! Now I'll tell you what DJT really stands for...", size: 128 },
                'Todo.txt': { type: 'file', content: '[ ] Graduate\n[ ] Get a job\n[x] Build DannyOS\n[x] Have fun', size: 64 },
              },
            },
            'Desktop.ini': { type: 'file', content: '[.ShellClassInfo]\nIconResource=explorer.exe,0', size: 42 },
          },
        },
      },
    },
    'My Computer': { type: 'program', windowId: 'mycomputer', size: 0 },
    'Recycle Bin': { type: 'program', windowId: 'recycle', size: 0 },
    'Danny.exe': { type: 'file', content: 'MZ\x90\x00... [Binary data — That\'s me!]', size: 1337 },
    'About.txt': { type: 'file', content: "Hey, I'm Danny! I'm a Computer Engineering senior at Florida Polytechnic University! I hope you enjoy DannyOS!!", size: 420 },
    'Autoexec.bat': { type: 'file', content: '@echo off\nSET PATH=C:\\Windows;C:\\Programs\nSET PROMPT=$P$G\necho Welcome to DannyOS!', size: 96 },
    'Config.sys': { type: 'file', content: 'DEVICE=C:\\Windows\\System\\Himem.sys\nDOS=HIGH,UMB\nFILES=40\nBUFFERS=20', size: 84 },
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
      // Case-insensitive lookup against current node
      const node = getNode(result);
      if (node?.type === 'dir' && node.children) {
        const match = Object.keys(node.children).find(
          (k) => k.toLowerCase() === part.toLowerCase()
        );
        result.push(match ?? part);
      } else {
        result.push(part);
      }
    }
  }
  return result;
}

function getNode(path: string[]): FSNode | null {
  let node: FSNode = FS;
  for (const part of path) {
    if (node.type !== 'dir' || !node.children) return null;
    // Case-insensitive child lookup
    const key = Object.keys(node.children).find(
      (k) => k.toLowerCase() === part.toLowerCase()
    );
    if (!key) return null;
    node = node.children[key]!;
  }
  return node;
}

function pathString(path: string[]): string {
  return 'C:\\' + path.join('\\');
}

/* ══════════════════════════════════════════════════════════
   Terminal Component
   ══════════════════════════════════════════════════════════ */

export function Terminal() {
  const openWindow = useDesktopStore((s) => s.openWindow);
  const closeWindow = useDesktopStore((s) => s.closeWindow);

  const [history, setHistory] = useState<string[]>([
    'DannyOS [Version 1.0.2004]',
    'Copyright (c) 2004 DJTech.',
    '',
    'Type help for a list of commands.',
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
          const topic = args[0]?.toLowerCase();
          if (!topic) {
            output = [
              '',
              'DOS Command Reference',
              '=====================',
              '',
              'Navigation',
              '  cd [path]       Change directory',
              '  dir [path]      List directory contents',
              '  ls [path]       Same as dir, clean view',
              '  tree [path]     Show directory tree',
              '  pwd             Print working directory',
              '',
              'Files',
              '  type [file]     Display file contents',
              '  cat [file]      Same as type',
              '',
              'Programs',
              '  start [name]    Launch a program',
              '  [name].exe      Run directly',
              '',
              'System',
              '  cls / clear     Clear the screen',
              '  ver             Show OS version',
              '  whoami          Current user',
              '  date            Current date',
              '  time            Current time',
              '  echo [text]     Print text',
              '  ping [host]     Ping a host',
              '  exit            Close the terminal',
              '',
              'Easter Eggs',
              '  neofetch        System info',
              '  cowsay [text]   Moo!',
              '  matrix          Take the red pill',
              '',
              'Type help start for more detail on a specific command.',
              'Use Tab for filename autocomplete, Up/Down for command history.',
              '',
            ];
          } else if (topic === 'cd') {
            output = ['', 'cd [path]  -  Change the current directory.', '', '  cd            Show current directory', '  cd ..         Go up one level', '  cd \\          Go to root (C:\\)', '  cd Programs   Enter the Programs folder', ''];
          } else if (topic === 'dir' || topic === 'ls') {
            output = ['', 'dir [path]  /  ls [path]  -  List directory contents.', '', '  dir           List current directory', '  ls            Same as dir (clean output)', '  dir Windows   List a specific directory', ''];
          } else if (topic === 'start') {
            output = [
              '', 'start [program]  -  Launch a program by name.', '',
              '  Available programs:',
              '    about        About Me          minesweeper  Minesweeper',
              '    projects     Projects          breadbox     Breadbox',
              '    resume       Resume            valorant     Valorant',
              '    contact      Contact           undertale    Undertale',
              '    portfolio    Portfolio          cavestory    Cave Story',
              '    transcript   Transcript        discord      /gather Bot',
              '    interests    Interests         aol          AOL Messenger',
              '    mycomputer   My Computer       steam        Steam',
              '    terminal     MS-DOS Prompt     recycle      Recycle Bin',
              '    paint        Paint             settings     Settings',
              '    datetime     Date/Time         musicplayer  Music Player',
              '',
              '  You can also run .exe files directly from the Programs folder.', '',
            ];
          } else if (topic === 'type' || topic === 'cat') {
            output = ['', 'type [file]  /  cat [file]  -  Display file contents.', '', '  type About.txt           View a text file', '  cat Config.sys           Same thing', ''];
          } else if (topic === 'tree') {
            output = ['', 'tree [path]  -  Display a directory tree.', '', '  tree            Tree of current directory', '  tree Programs   Tree of a specific directory', ''];
          } else {
            output = [`No help available for '${topic}'.`];
          }
          break;
        }

        case 'dir': {
          const targetPath = args.length > 0 ? resolvePath(cwd, args.join(' ')) : cwd;
          const node = getNode(targetPath);
          if (!node || node.type !== 'dir' || !node.children) {
            output = [`The system cannot find the path specified.`];
          } else {
            const dirPath = pathString(targetPath);
            output = [
              ` Volume in drive C is DannyOS`,
              ` Volume Serial Number is D4N-NY04`,
              '',
              ` Directory of ${dirPath}`,
              '',
            ];
            let fileCount = 0;
            let dirCount = 0;
            let totalSize = 0;

            for (const [name, child] of Object.entries(node.children).sort()) {
              if (child.type === 'dir') {
                output.push(`  <DIR>   ${name}`);
                dirCount++;
              } else {
                const size = child.size ?? 0;
                totalSize += size;
                const sizeStr = size > 0 ? size.toLocaleString().padStart(10) : '         0';
                output.push(`  ${sizeStr}   ${name}`);
                fileCount++;
              }
            }

            output.push('');
            output.push(`  ${fileCount} file(s)    ${totalSize.toLocaleString()} bytes`);
            output.push(`  ${dirCount} dir(s)     418,123,456 bytes free`);
          }
          break;
        }

        case 'ls': {
          const targetPath = args.length > 0 ? resolvePath(cwd, args.join(' ')) : cwd;
          const node = getNode(targetPath);
          if (!node || node.type !== 'dir' || !node.children) {
            output = [`The system cannot find the path specified.`];
          } else {
            const entries = Object.entries(node.children).sort();
            const dirs: string[] = [];
            const files: string[] = [];
            for (const [name, child] of entries) {
              if (child.type === 'dir') {
                dirs.push(name + '/');
              } else {
                files.push(name);
              }
            }
            const all = [...dirs, ...files];
            if (all.length === 0) {
              output = ['  (empty directory)'];
            } else {
              const maxLen = Math.max(...all.map((s) => s.length));
              const colWidth = maxLen + 3;
              const cols = Math.max(1, Math.floor(60 / colWidth));
              for (let i = 0; i < all.length; i += cols) {
                const row = all.slice(i, i + cols).map((s) => s.padEnd(colWidth)).join('');
                output.push('  ' + row);
              }
            }
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
              output = [`[Program file — use start ${args.join(' ')} to run it]`];
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
                lines.push(`${prefix}${connector}${name}`);
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
          output = ['', 'DannyOS [Version 1.0.2004]', 'Copyright (c) 2004 DJTech.', ''];
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
          output = ['Danny'];
          break;
        }

        case 'pwd': {
          output = [pathString(cwd)];
          break;
        }

        case 'ping': {
          if (args.length === 0) {
            output = ['Usage: ping <hostname>'];
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
            output = [`A subdirectory or file ${args[0]} already exists.`];
          }
          break;
        }

        case 'start': {
          if (args.length === 0) {
            output = ['Usage: start <program>', 'Type help start for available programs.'];
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

        case 'exit':
        case 'quit': {
          closeWindow('terminal');
          setInput('');
          return;
        }

        case 'color': {
          output = ['Color commands are not supported in DannyDOS.'];
          break;
        }

        case 'neofetch': {
          output = [
            '        ___________',
            '       /           \\     danny@dannyos',
            '      |  DannyOS   |     --------------',
            '      |  ________  |     OS: DannyOS 95',
            '      | |        | |     Host: dannyjtaylor.github.io',
            '      | |  D95   | |     Kernel: React 19',
            '      | |________| |     Uptime: since 2004',
            '      |            |     Shell: DannyDOS v1.0',
            '       \\__________/      Resolution: whatever fits',
            '         ||||||||         CPU: Danny\'s Brain',
            '         ||||||||         Memory: DDR7.-2',
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
            'This incident will be reported.',
          ];
          break;
        }

        case 'rm': {
          if (args.includes('-rf') || args.includes('-rf /')) {
            output = ['Nice try! No deleting the entire filesystem.'];
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
            const progPath = resolvePath([], 'Programs/' + cmd + '.exe');
            const bareNode = getNode(progPath);
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
    [cwd, prompt, pushOutput, openWindow, closeWindow],
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
      const partial = input.trim().split(/\s+/).pop() ?? '';
      if (partial) {
        const node = getNode(cwd);
        if (node?.type === 'dir' && node.children) {
          const matches = Object.keys(node.children).filter((name) =>
            name.toLowerCase().startsWith(partial.toLowerCase()),
          );
          if (matches.length === 1) {
            const inputParts = input.trim().split(/\s+/);
            inputParts[inputParts.length - 1] = matches[0]!;
            setInput(inputParts.join(' '));
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
