/**
 * Tiny fake userspace for the danny@kali cold-start.
 * Active only while shellTier === 'user'. After bootstrap → root, this is off.
 */

export type SandboxNode =
  | { kind: 'dir'; children: Record<string, SandboxNode> }
  | { kind: 'file'; content: string };

export interface SandboxState {
  cwd: string; // absolute, e.g. /home/danny
}

const KIT_DIR = '/home/danny/kit';
const BOOTSTRAP_PATH = `${KIT_DIR}/bootstrap.sh`;

const BOOTSTRAP_SH = `#!/usr/bin/env bash
# Train de Aqua — operator bootstrap
# Plants /root/ploutus overlay + drops you into the recon workspace.
set -euo pipefail
echo "[*] verifying kit signature…"
# … ed25519 check, overlay mount, profile switch …
exec sudo -i
`;

const MISSION = `Listen up, kid. I know you're new 'n all, but the boss needs some moola for our next big operation. I made some rules for ya to stick by:

1. Your cover story is that you're a field technician for Dyebold Nyxdwarf. Just inspectin' the ATM, y'know?
2. Don't leave prints. Wear the gloves we got ya.
3. If ya mess up, the cops WILL get called.
4. If ya get stuck or lost, use the cheat sheet I made ya.
5. Don't get caught. Good luck, kid.
`;

const CONTACT = `use ur burner
the handle is aqua_relay_4
check in 15 mins after the job
do NOT call next to that welsh phargo branch. get out of there first
`;

const CROWBAR_RECEIPT = `Harbor Freight — RECEIPT
SKU 69548  Pry Bar 30" Crowbar
TOTAL: $14.99
*** DO NOT USE THIS ON THE ATM ***
vibration sensor will light you up. boss will kill me.
`;

const DN_GUIDE = `Train de Aqua — Dyebold Nyxdwarf field tech cover
- Badge lanyard, polo, clipboard
- Walk in like you belong. Ask the guard for panel access.
- If they push back: "scheduled Agilis XFS inspection, ticket #4482"
`;

const TBAR = `Dyebold Optiva top-hat T-bar
SKU 001-0006522
ebay seller: atm_parts_midwest
quiet open. this is the move.
`;

const LOOPBACK = `RJ45 loopback plug
pull the wall cable, seat this in the jack so the NIC stays "up"
SIEM stream dies. leave-cable-intact = instant bust.
cut-only (no loopback) = delayed SIEM bomb. don't.
`;

const REED_CLAMP = `magnetic clamp
clips over the door sensor so it still reads CLOSED
with the lid open. cutting the wire = central station.
ignoring it = same thing. clamp it.
`;

const BLACKBOX = `RPi Zero W + CDM firmware shim
splice on the dispenser CONTROL cable (CPU ↔ CDM),
NOT into the cash mouth / bill slot.
no malware on the XP box. SMS trigger.
skips persist/activate in our runbook — know what you're demoing.
`;

const GLOVES = `nitrile, black, medium — two pairs
wipe tools. wipe laptop. wipe the T-bar.
no prints. no excuses.
`;

const MULE_NOTES = `mule1: USB HID keyboard + today's rotating code
codes live in ~/ploutus/codes/today.txt after bootstrap
F4 = DISPENSE ALL. do NOT use the customer PIN screen.
`;

const BASH_HISTORY = `whoami
pwd
ip -4 addr show eth0 | head
ping -c1 192.168.1.1
cd ~/kit
ls
ls tools
cat ~/train-de-aqua/mission.txt
`;

function dir(children: Record<string, SandboxNode>): SandboxNode {
  return { kind: 'dir', children };
}

function file(content: string): SandboxNode {
  return { kind: 'file', content };
}

export const SANDBOX_ROOT: SandboxNode = dir({
  home: dir({
    danny: dir({
      '.bashrc': file('# ~/.bashrc — Train de Aqua staging box\nexport PS1="\\u@\\h:\\w\\$ "\n'),
      '.profile': file('# ~/.profile\n'),
      '.bash_history': file(BASH_HISTORY),
      Desktop: dir({}),
      Documents: dir({}),
      Downloads: dir({}),
      Pictures: dir({}),
      kit: dir({
        'bootstrap.sh': file(BOOTSTRAP_SH),
        '.oprc': file('CREW=train-de-aqua\nOP=welsh-phargo-vestibule\n'),
        tools: dir({
          'crowbar_receipt.txt': file(CROWBAR_RECEIPT),
          'DNimpersonationguide.txt': file(DN_GUIDE),
          'tbar-sku.txt': file(TBAR),
          'rj45-loopback.txt': file(LOOPBACK),
          'reed-clamp.txt': file(REED_CLAMP),
          'blackbox-rpi.txt': file(BLACKBOX),
          'gloves.txt': file(GLOVES),
          'mule-notes.txt': file(MULE_NOTES),
        }),
      }),
      'train-de-aqua': dir({
        'CONTACT.txt': file(CONTACT),
        'mission.txt': file(MISSION),
      }),
    }),
  }),
  tmp: dir({}),
  etc: dir({
    hostname: file('kali\n'),
    // Real os-release is KEY=value / KEY="quoted" — PRETTY_NAME is the human-readable one.
    // Easter egg for anyone who cats it during cold-start.
    'os-release': file(`PRETTY_NAME="Kali GNU/Linux (Danny Edition)"
NAME="Fullmetal Alchemist: Brotherhood"
VERSION="3.10.11 (Roy Mustang)"
VERSION_ID="3.10.11"
VERSION_CODENAME="aqua-rolling"
ID="train-de-aqua"
ID_LIKE="kali"
HOME_URL="https://dannyjtaylor.github.io/jackpot"
SUPPORT_URL="ask the cheat sheet, kid"
BUG_REPORT_URL="don't. just don't."
ANSI_COLOR="1;31"
CREW="Train de Aqua"
WARNING="don't stick your nose in places where they don't belong. get us that money NOW."
`),
  }),
  root: dir({
    // visible but empty until bootstrap — tease only
    '.keep': file(''),
  }),
});

export function initialSandbox(): SandboxState {
  return { cwd: '/home/danny' };
}

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function resolvePath(cwd: string, input?: string): string {
  if (!input || input === '.') return cwd;
  let raw = input;
  if (raw.startsWith('~/')) raw = `/home/danny/${raw.slice(2)}`;
  else if (raw === '~') raw = '/home/danny';
  const abs = raw.startsWith('/') ? raw : `${cwd}/${raw}`;
  const parts: string[] = [];
  for (const p of splitPath(abs)) {
    if (p === '.') continue;
    if (p === '..') {
      parts.pop();
      continue;
    }
    parts.push(p);
  }
  return '/' + parts.join('/');
}

function getNode(absPath: string): SandboxNode | null {
  if (absPath === '/') return SANDBOX_ROOT;
  let node: SandboxNode = SANDBOX_ROOT;
  for (const part of splitPath(absPath)) {
    if (node.kind !== 'dir') return null;
    const next = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

function listDir(node: SandboxNode, all: boolean): string[] {
  if (node.kind !== 'dir') return [];
  const names = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
  return all ? names : names.filter((n) => !n.startsWith('.'));
}

function formatLs(names: string[], node: SandboxNode, long: boolean): string {
  if (node.kind !== 'dir') return names.join('  ');
  if (!long) {
    return names
      .map((n) => (node.children[n]?.kind === 'dir' ? `${n}/` : n))
      .join('  ');
  }
  return names
    .map((n) => {
      const child = node.children[n]!;
      if (child.kind === 'dir') return `drwxr-xr-x 2 danny danny 4096 ${n}`;
      const size = child.content.length;
      return `-rw-r--r-- 1 danny danny ${String(size).padStart(4, ' ')} ${n}`;
    })
    .join('\n');
}

function treeLines(node: SandboxNode, name: string, prefix: string, isLast: boolean): string[] {
  const branch = prefix + (isLast ? '└── ' : '├── ');
  const lines = [prefix === '' && name === '.' ? '.' : `${branch}${name}${node.kind === 'dir' ? '/' : ''}`];
  if (node.kind !== 'dir') return lines;
  // root call uses name as label without branch
  const kids = Object.keys(node.children)
    .filter((n) => !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));
  const basePrefix = prefix === '' ? '' : prefix + (isLast ? '    ' : '│   ');
  const out: string[] = prefix === '' ? [name === '.' ? '.' : name + (node.kind === 'dir' ? '/' : '')] : lines;
  kids.forEach((k, i) => {
    const last = i === kids.length - 1;
    const child = node.children[k]!;
    const childPrefix = prefix === '' ? '' : basePrefix;
    if (prefix === '') {
      out.push(...treeLines(child, k, '', last).map((l, idx) => {
        if (idx === 0) return (last ? '└── ' : '├── ') + l.replace(/^\.?\/?/, '') + (child.kind === 'dir' && !l.includes('/') ? '' : '');
        return (last ? '    ' : '│   ') + l;
      }));
      // simpler rewrite below
    }
    void childPrefix;
  });
  return out;
}

/** Cleaner tree walker */
function renderTree(node: SandboxNode, label: string): string {
  const lines: string[] = [label];
  const walk = (n: SandboxNode, prefix: string) => {
    if (n.kind !== 'dir') return;
    const kids = Object.keys(n.children)
      .filter((k) => !k.startsWith('.'))
      .sort((a, b) => a.localeCompare(b));
    kids.forEach((k, i) => {
      const last = i === kids.length - 1;
      const child = n.children[k]!;
      const connector = last ? '└── ' : '├── ';
      const name = child.kind === 'dir' ? `${k}/` : k;
      lines.push(prefix + connector + name);
      if (child.kind === 'dir') {
        walk(child, prefix + (last ? '    ' : '│   '));
      }
    });
  };
  walk(node, '');
  return lines.join('\n');
}

// silence unused helper if treeLines kept for reference
void treeLines;

export interface SandboxResult {
  lines: string[];
  cwd: string;
  /** true = this was handled (even if error output) */
  handled: boolean;
}

function notFound(cmd: string): SandboxResult {
  return { lines: [`bash: ${cmd}: command not found`], cwd: '', handled: true };
}

export function runSandboxCommand(typed: string, sandbox: SandboxState): SandboxResult {
  const cwd = sandbox.cwd;
  const trimmed = typed.trim();
  if (!trimmed) return { lines: [], cwd, handled: false };

  // strip simple sudo for free explore (scripted sudo bootstrap is handled by game)
  let line = trimmed;
  if (line.startsWith('sudo ') && !line.includes('bootstrap')) {
    line = line.slice(5).trim();
  }

  const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((p) => p.replace(/^"|"$/g, '')) ?? [];
  const bin = (parts[0] ?? '').replace(/^\.\//, '');
  const args = parts.slice(1);

  const withCwd = (lines: string[], nextCwd = cwd): SandboxResult => ({
    lines,
    cwd: nextCwd,
    handled: true,
  });

  switch (bin) {
    case 'pwd':
      return withCwd([cwd]);
    case 'whoami':
      return withCwd(['danny']);
    case 'id':
      return withCwd(['uid=1000(danny) gid=1000(danny) groups=1000(danny),27(sudo)']);
    case 'hostname':
      return withCwd(['kali']);
    case 'uname': {
      if (args.includes('-a') || args.includes('--all')) {
        return withCwd([
          'Linux kali 6.6.15-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.15-1kali1 (2024) x86_64 GNU/Linux',
        ]);
      }
      return withCwd(['Linux']);
    }
    case 'clear':
      return { lines: [], cwd, handled: true };
    case 'echo':
      return withCwd([args.join(' ')]);
    case 'who':
    case 'w':
      return withCwd(['danny    tty1         2026-07-09 02:11']);
    case 'date':
      return withCwd(['Thu Jul  9 02:14:08 EDT 2026']);
    case 'uptime':
      return withCwd([' 02:14:08 up 41 min,  1 user,  load average: 0.08, 0.12, 0.09']);
    case 'history':
      return withCwd(
        BASH_HISTORY.trim()
          .split('\n')
          .map((h, i) => `  ${i + 1}  ${h}`),
      );
    case 'which':
    case 'type': {
      const t = args[0];
      if (!t) return withCwd([`${bin}: missing operand`]);
      const known: Record<string, string> = {
        ls: '/usr/bin/ls',
        cat: '/usr/bin/cat',
        sudo: '/usr/bin/sudo',
        bash: '/usr/bin/bash',
        tree: '/usr/bin/tree',
      };
      return withCwd([known[t] ?? `${bin}: ${t}: not found`]);
    }
    case 'cd': {
      const target = resolvePath(cwd, args[0] ?? '/home/danny');
      const node = getNode(target);
      if (!node) return withCwd([`bash: cd: ${args[0] ?? ''}: No such file or directory`]);
      if (node.kind !== 'dir') return withCwd([`bash: cd: ${args[0]}: Not a directory`]);
      return withCwd([], target);
    }
    case 'ls':
    case 'll':
    case 'la': {
      const flags = args.filter((a) => a.startsWith('-')).join('');
      const pathArg = args.find((a) => !a.startsWith('-'));
      const long = bin === 'll' || flags.includes('l');
      const all = bin === 'la' || flags.includes('a');
      const target = resolvePath(cwd, pathArg);
      const node = getNode(target);
      if (!node) return withCwd([`ls: cannot access '${pathArg}': No such file or directory`]);
      if (node.kind === 'file') return withCwd([target.split('/').pop() ?? pathArg ?? '']);
      const names = listDir(node, all);
      const out = formatLs(names, node, long);
      return withCwd([out || '']);
    }
    case 'tree': {
      const pathArg = args.find((a) => !a.startsWith('-'));
      const target = resolvePath(cwd, pathArg ?? '.');
      const node = getNode(target);
      if (!node) return withCwd([`tree: ${pathArg}: No such file or directory`]);
      if (node.kind === 'file') return withCwd([target.split('/').pop() ?? '']);
      const label = pathArg ?? '.';
      return withCwd([renderTree(node, label.endsWith('/') ? label.slice(0, -1) : label)]);
    }
    case 'cat':
    case 'less':
    case 'more':
    case 'head':
    case 'tail': {
      if (!args[0]) return withCwd([`${bin}: missing file operand`]);
      const target = resolvePath(cwd, args[0]);
      const node = getNode(target);
      if (!node) return withCwd([`${bin}: ${args[0]}: No such file or directory`]);
      if (node.kind !== 'file') return withCwd([`${bin}: ${args[0]}: Is a directory`]);
      let text = node.content.replace(/\n$/, '');
      if (bin === 'head') text = text.split('\n').slice(0, 10).join('\n');
      if (bin === 'tail') text = text.split('\n').slice(-10).join('\n');
      return withCwd(text.length ? text.split('\n') : ['']);
    }
    case 'ping': {
      const host = args.find((a) => !a.startsWith('-')) ?? '192.168.1.1';
      return withCwd([
        `PING ${host} (${host}) 56(84) bytes of data.`,
        `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.8 ms`,
        `--- ${host} ping statistics ---`,
        '1 packets transmitted, 1 received, 0% packet loss',
      ]);
    }
    case 'nmap':
      return withCwd([
        'Starting Nmap 7.94 ( https://nmap.org )',
        'WARNING: not on target op overlay yet — run the Train de Aqua bootstrap first.',
        'Nmap done: 0 IP addresses (0 hosts up) scanned in 0.02 seconds',
      ]);
    case 'curl':
    case 'wget':
      return withCwd([
        `${bin}: (7) Failed to connect — finish bootstrap before hitting the ATM LAN tools.`,
      ]);
    case 'ip':
      return withCwd([
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
        '    inet 192.168.1.104/24 brd 192.168.1.255 scope global eth0',
        '# tip: after bootstrap, the sheet has the exact recon one-liners',
      ]);
    case 'ps':
      return withCwd([
        '  PID TTY          TIME CMD',
        ' 1284 tty1     00:00:00 bash',
        ' 1402 tty1     00:00:00 ps',
      ]);
    case 'df':
      return withCwd([
        'Filesystem     1K-blocks    Used Available Use% Mounted on',
        '/dev/sda1       41284928 9821440  29345024  26% /',
      ]);
    case 'free':
      return withCwd([
        '               total        used        free      shared  buff/cache   available',
        'Mem:         7823456     1244224     4210880      132096     2368352     6219136',
      ]);
    case 'env':
    case 'printenv':
      return withCwd([
        'USER=danny',
        'HOME=/home/danny',
        'SHELL=/bin/bash',
        'PWD=' + cwd,
        'CREW=train-de-aqua',
      ]);
    case 'man':
      return withCwd([`No manual entry for ${args[0] ?? '…'} (sandbox). Try the cheat sheet.`]);
    case 'help':
      // Game layer (Jackpot.tsx) owns the real help easter egg + next-cmd hint.
      return withCwd(['(use `help` from the demo prompt — Train de Aqua left notes.)']);
    case 'sudo': {
      if (!args.length) return withCwd(['usage: sudo -h | -K | -k | -V …']);
      // free-typed sudo something else
      return withCwd([
        '[sudo] password for danny: ********',
        `sudo: ${args[0]}: command not found`,
      ]);
    }
    default:
      // Only claim handled for known "basic" looking tokens so game can roast later at root
      return { ...notFound(bin), cwd };
  }
}

/** True when `ls` (optional short flags) lists the kit directory. */
export function matchesPrologueLs(typed: string, cwd: string): boolean {
  const parts = typed.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (parts[0] !== 'ls') return false;
  let i = 1;
  while (i < parts.length && parts[i]!.startsWith('-') && parts[i] !== '--') {
    if (!/^-[alA]+$/.test(parts[i]!)) return false;
    i++;
  }
  if (i < parts.length - 1) return false;
  const target = resolvePath(cwd, parts[i] ?? '.');
  return target === KIT_DIR;
}

/** True when the resolved executable is ~/kit/bootstrap.sh (optional sudo). */
export function matchesPrologueBootstrap(typed: string, cwd: string): boolean {
  let n = typed.trim().replace(/\s+/g, ' ');
  if (n.startsWith('sudo ')) n = n.slice(5).trim();
  if (!n || n.includes(' ')) return false;
  return resolvePath(cwd, n) === BOOTSTRAP_PATH;
}

const TAB_BINS = [
  'ls', 'll', 'la', 'cd', 'cat', 'less', 'more', 'head', 'tail', 'tree',
  'pwd', 'whoami', 'id', 'uname', 'hostname', 'echo', 'clear', 'help', 'history',
  'which', 'type', 'sudo', 'ping', 'nmap', 'curl', 'wget', 'ip', 'ps',
  'df', 'free', 'env', 'date', 'uptime', 'man',
];

/**
 * Tab-complete against the sandbox FS (and common bins).
 * Multiple matches cycle in-place (menu-complete style) — nothing printed above the prompt.
 */
export function tabCompleteSandbox(buffer: string, cwd: string): { buffer: string } {
  const lastSpace = buffer.lastIndexOf(' ');
  const hasArgs = lastSpace >= 0;
  const cmdPrefix = hasArgs ? buffer.slice(0, lastSpace + 1) : '';
  const token = hasArgs ? buffer.slice(lastSpace + 1) : buffer;

  // Binary completion (no space yet)
  if (!hasArgs) {
    const bare = token.replace(/\s+$/, '');
    let cands = TAB_BINS.filter((b) => b.startsWith(bare));
    if (cands.length === 0 && bare.length > 0) {
      // Exact completed bin — cycle siblings sharing the first letter
      cands = TAB_BINS.filter((b) => b.startsWith(bare[0]!));
      if (!cands.includes(bare)) return { buffer };
    }
    if (cands.length === 0) return { buffer };
    if (cands.length === 1) return { buffer: cands[0]! + ' ' };
    const cur = cands.indexOf(bare);
    const next = cands[cur >= 0 ? (cur + 1) % cands.length : 0]!;
    return { buffer: next };
  }

  // Path completion — split token into directory prefix + name
  let dirPart = '';
  let namePart = token;
  const slash = token.lastIndexOf('/');
  if (slash >= 0) {
    dirPart = token.slice(0, slash + 1);
    namePart = token.slice(slash + 1);
  }

  // token ends with "Desktop/" → peel so we can cycle Desktop → Documents → Downloads
  let cycleName = namePart;
  let peeledCompleted = false;
  if (cycleName === '' && dirPart !== '') {
    const trimmed = dirPart.replace(/\/$/, '');
    const segSlash = trimmed.lastIndexOf('/');
    if (segSlash >= 0) {
      dirPart = trimmed.slice(0, segSlash + 1);
      cycleName = trimmed.slice(segSlash + 1);
    } else {
      dirPart = '';
      cycleName = trimmed;
    }
    peeledCompleted = true;
  }

  let parentAbs: string;
  if (dirPart === '') {
    parentAbs = cwd;
  } else if (dirPart === '~/') {
    parentAbs = '/home/danny';
  } else if (dirPart.startsWith('~/')) {
    parentAbs = resolvePath(cwd, dirPart.slice(0, -1));
  } else {
    parentAbs = resolvePath(cwd, dirPart.slice(0, -1) || '.');
  }

  const parent = getNode(parentAbs);
  if (!parent || parent.kind !== 'dir') return { buffer };

  const names = Object.keys(parent.children)
    .filter((n) => !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));

  let stem = cycleName;
  let matches = names.filter((n) => n.startsWith(stem));
  // After completing one D* dir, widen to first letter so Tab keeps cycling the group
  if (peeledCompleted && matches.length <= 1 && cycleName.length > 0) {
    stem = cycleName[0]!;
    matches = names.filter((n) => n.startsWith(stem));
  }
  if (matches.length === 0) return { buffer };

  const decorate = (n: string) => (parent.children[n]!.kind === 'dir' ? `${n}/` : n);

  if (matches.length === 1 && !peeledCompleted) {
    const n = matches[0]!;
    const done = dirPart + decorate(n);
    return {
      buffer: cmdPrefix + done + (parent.children[n]!.kind === 'file' ? ' ' : ''),
    };
  }

  const curIdx = matches.indexOf(cycleName);
  const next = matches[curIdx >= 0 ? (curIdx + 1) % matches.length : 0]!;
  const done = dirPart + decorate(next);
  return {
    buffer: cmdPrefix + done + (parent.children[next]!.kind === 'file' ? ' ' : ''),
  };
}

/** Prefer completing toward the expected scripted command when buffer is a prefix of it. */
export function tabCompleteExpected(buffer: string, expected: string): string | null {
  if (!expected.startsWith(buffer)) return null;
  if (buffer === expected) return expected;
  // Complete up to next path segment or end
  const rest = expected.slice(buffer.length);
  const m = rest.match(/^([^\s/]*\/?|[^\s]*)/);
  const chunk = m?.[1] ?? rest;
  return buffer + chunk;
}
