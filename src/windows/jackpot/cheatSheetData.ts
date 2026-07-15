import type { ChoiceId, PhaseId } from './types';

export interface CheatPart {
  token: string;
  meaning: string;
}

export interface CheatCmd {
  cmd: string;
  /** Break the command into pieces — flags, pipes, args */
  parts: CheatPart[];
  /**
   * Break down the stdout that follows this cmd.
   * Shown only after the demo has actually printed that output.
   */
  outputs?: CheatPart[];
}

export interface CheatChoiceOpt {
  key: '1' | '2' | '3';
  label: string;
  verdict: 'go' | 'maybe' | 'no';
  note: string;
}

export interface CheatChoice {
  id: ChoiceId;
  prompt: string;
  tip: string;
  options: CheatChoiceOpt[];
  afterPick?: Partial<Record<'1' | '2' | '3', CheatCmd[]>>;
}

export interface CheatPhase {
  phase: PhaseId;
  title: string;
  blurb: string;
  commands: CheatCmd[];
  choices: CheatChoice[];
}

/** Intern notes — unlocks as the demo advances. */
export const CHEAT_PHASES: CheatPhase[] = [
  {
    phase: 1,
    title: 'RECON',
    blurb:
      "Our guys left a kit on the laptop. Find ~/kit, run bootstrap, then make sure you're on the same network as the ATM, y'hear?",
    commands: [
      {
        // Canonical unlock key (phase line). Display path localizes from live cwd in CheatSheet.
        cmd: 'ls ~/kit',
        parts: [
          { token: 'ls', meaning: 'lists files' },
          { token: '~/kit', meaning: 'that\'s the kit folder. cd into it if you want.' },
        ],
      },
      {
        cmd: 'sudo ./kit/bootstrap.sh',
        parts: [
          { token: 'sudo', meaning: 'runs as root. danny can do that here.' },
          { token: './kit/bootstrap.sh', meaning: 'this gets you to root, kid. use it.' },
        ],
      },
      {
        cmd: 'ip -4 addr show eth0 | grep inet',
        parts: [
          { token: 'ip', meaning: 'tool to talk to kernel about interfaces & routes' },
          { token: '-4', meaning: 'IPv4 only' },
          { token: 'addr show eth0', meaning: 'what\'s on eth0' },
          { token: '|', meaning: 'pipes into the next bit' },
          { token: 'grep inet', meaning: 'just the address line' },
        ],
        outputs: [
          { token: 'inet 192.168.1.104/24', meaning: 'your box on the branch LAN' },
          { token: 'scope global eth0', meaning: 'yeah, that\'s the cable you plugged in' },
        ],
      },
      {
        cmd: 'ip route | head -n1',
        parts: [
          { token: 'ip route', meaning: 'routing table' },
          { token: '|', meaning: 'pipes into head' },
          { token: 'head -n1', meaning: 'first line. usually the gateway.' },
        ],
        outputs: [
          { token: 'default via 192.168.1.1', meaning: 'branch router. same neighborhood as the ATM.' },
          { token: 'dev eth0 proto dhcp', meaning: 'DHCP handed you that route' },
        ],
      },
      {
        cmd: 'nmap -sV -p8080 --open 192.168.1.0/24',
        parts: [
          { token: 'nmap', meaning: 'scans the network' },
          { token: '-sV', meaning: 'guesses what\'s listening' },
          { token: '-p8080', meaning: 'only port 8080' },
          { token: '--open', meaning: 'skip the closed junk' },
          { token: '192.168.1.0/24', meaning: 'the whole branch subnet' },
        ],
        outputs: [
          { token: '192.168.1.47', meaning: 'that\'s the ATM' },
          { token: '8080/tcp open http', meaning: 'Agilis is up on 8080' },
          { token: 'Agilis ATM XFS 3.20', meaning: 'same stack Ploutus wants' },
          { token: 'Windows XP … SP3', meaning: 'old XP. soft target.' },
        ],
      },
      {
        cmd: 'curl -s http://192.168.1.47/status | python3 -m json.tool',
        parts: [
          { token: 'curl', meaning: 'hits HTTP' },
          { token: '-s', meaning: 'quiet, no progress bar' },
          { token: 'http://192.168.1.47/status', meaning: 'ATM status page' },
          { token: '|', meaning: 'pipes the body along' },
          { token: 'python3 -m json.tool', meaning: 'makes the JSON readable' },
        ],
        outputs: [
          { token: '"model": "Optiva740"', meaning: 'Optiva 740. that\'s our machine.' },
          { token: '"vendor": "Dyebold"', meaning: 'Dyebold box' },
          { token: '"cassettes": 4', meaning: 'four cash trays' },
          { token: '"xfs": "Kalignite"', meaning: 'XFS stack we mess with later' },
        ],
      },
      {
        cmd: 'cat recon/target.md',
        parts: [
          { token: 'cat', meaning: 'dumps a file' },
          { token: 'recon/target.md', meaning: 'op notes. read \'em in the terminal.' },
        ],
      },
    ],
    choices: [],
  },
  {
    phase: 2,
    title: 'BREACH',
    blurb:
      "Physical access time. Open the top-hat, clamp the door sensor, then kill the log stream. Wrong picks start the cops.",
    commands: [
      {
        cmd: 'echo "vestibule clear - DN tech cover ready"',
        parts: [
          { token: 'echo', meaning: 'just prints text. demo marker.' },
          { token: '"…"', meaning: 'cover story\'s set. choices come next.' },
        ],
      },
      {
        cmd: 'echo "[*] internal access confirmed"',
        parts: [
          { token: 'echo', meaning: 'prints after the three breach picks' },
          { token: '"[*] …"', meaning: 'you\'re in. install next.' },
        ],
      },
    ],
    choices: [
      {
        id: 'panel-access',
        prompt: 'SELECT PANEL ACCESS METHOD',
        tip: '1 or 3. Crowbar is a trap.',
        options: [
          { key: '1', label: 'Key from Dyebold off of Ebay', verdict: 'go', note: 'Real Dyebold key. Quiet open.' },
          { key: '2', label: 'Crow bar', verdict: 'no', note: 'Vibration sensor screams. Cops start coming.' },
          { key: '3', label: 'Wear DN branded ATM field technician gear and badge', verdict: 'go', note: 'Badge + cover. Guard opens it for ya.' },
        ],
      },
      {
        id: 'alarm-sensor',
        prompt: 'DOOR ALARM SENSOR',
        tip: "Clamp it. Don't cut it. Don't ignore it.",
        options: [
          { key: '1', label: 'Magnetic clamp', verdict: 'go', note: 'Still reads CLOSED with the lid open.' },
          { key: '2', label: 'Cut alarm sensor wire', verdict: 'no', note: 'Broken loop. Central station wakes up.' },
          { key: '3', label: 'Ignore sensor & hope nobody is watching', verdict: 'no', note: 'Door-open alert. Units rolling.' },
        ],
      },
      {
        id: 'ethernet',
        prompt: 'HANDLE NETWORK / LOG STREAM',
        tip: 'Loopback is clean. Cut-only is a delayed SIEM bomb.',
        options: [
          { key: '1', label: 'Replace cable with RJ45 loopback plug', verdict: 'go', note: 'Pull the wall cable, seat the loopback. Logs die. NIC still looks up.' },
          { key: '2', label: 'Cut cable only', verdict: 'maybe', note: 'Fine for now. Logs flush later when the cable comes back.' },
          { key: '3', label: 'Leave cable intact', verdict: 'no', note: 'SIEM sees you right away.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'ip link show eth0 | head -n2',
              parts: [
                { token: 'ip link show eth0', meaning: 'is eth0 up or dead?' },
                { token: '| head -n2', meaning: 'first two lines' },
              ],
              outputs: [
                { token: 'NO-CARRIER … UP', meaning: 'cable cut, but the NIC still says up' },
                { token: 'RJ45 loopback seated', meaning: 'logs dead. ATM still thinks the link\'s fine.' },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    phase: 3,
    title: 'INSTALL',
    blurb:
      'Get Ploutus on the box. HDD pull onto NTFS, or Pi black box. Follow-up cmds show after you pick.',
    commands: [
      {
        cmd: 'lsblk -o NAME,SIZE,TYPE,MODEL | grep -E "NAME|sda|sdb"',
        parts: [
          { token: 'lsblk', meaning: 'lists disks' },
          { token: '-o NAME,SIZE,TYPE,MODEL', meaning: 'just those columns' },
          { token: '| grep -E "…"', meaning: 'header + sda/sdb only' },
        ],
        outputs: [
          { token: 'sdb … 80G … ATM-HDD-2.5SATA', meaning: 'ATM hard drive. that\'s the target.' },
          { token: 'Winlogon\\Userinit -> svchost32.exe', meaning: 'where persistence hooks in later' },
        ],
      },
    ],
    choices: [
      {
        id: 'install-method',
        prompt: 'SELECT INSTALL METHOD',
        tip: 'HDD for the malware path. Black box skips persist/activate.',
        options: [
          {
            key: '1',
            label: 'Remove the HDD and deploy Ploutus on NTFS partition',
            verdict: 'go',
            note: 'Mount XP, plant svchost32.exe, patch Userinit with chntpw.',
          },
          {
            key: '2',
            label: 'Use a Raspberry Pi black box',
            verdict: 'go',
            note: 'Hardware shim on the dispenser cable. Skips phases 4–5 here.',
          },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'lsblk | grep sdb',
              parts: [
                { token: 'lsblk', meaning: 'disks again' },
                { token: '| grep sdb', meaning: 'looking for the ATM drive' },
              ],
              outputs: [
                { token: 'sdb … ATM HDD via USB-SATA', meaning: 'drive\'s on your bridge. mount it.' },
              ],
            },
            {
              cmd: 'ntfs-3g /dev/sdb1 /mnt/atm -o remove_hiberfile',
              parts: [
                { token: 'ntfs-3g', meaning: 'mounts NTFS on Linux' },
                { token: '/dev/sdb1', meaning: 'first partition on that drive' },
                { token: '/mnt/atm', meaning: 'where it lands' },
                { token: '-o remove_hiberfile', meaning: 'kills the hibernate lock so it mounts' },
              ],
              outputs: [
                { token: 'Mounted /dev/sdb1 at /mnt/atm', meaning: 'XP disk is open. write to it.' },
                { token: 'Windows XP SP3 - Agilis XFS 3.20', meaning: 'yep, that\'s the target stack' },
              ],
            },
            {
              cmd: 'ls /mnt/atm/Windows/System32/ | grep -iE "xfs|cdm"',
              parts: [
                { token: 'ls …/System32/', meaning: 'DLL folder on the XP disk' },
                { token: '| grep -iE "xfs|cdm"', meaning: 'find the XFS / CDM bits' },
              ],
              outputs: [
                { token: 'MSXFS.dll', meaning: 'XFS middleware Ploutus calls' },
                { token: 'CDM_ServiceProvider.dll', meaning: 'cash dispenser guts' },
              ],
            },
            {
              cmd: 'cp ~/ploutus/payload/svchost32.exe /mnt/atm/Windows/System32/',
              parts: [
                { token: 'cp', meaning: 'copies a file' },
                { token: '~/ploutus/payload/svchost32.exe', meaning: 'Ploutus in a boring name' },
                { token: '…/System32/', meaning: 'where Windows will load it from' },
              ],
              outputs: [
                { token: 'svchost32.exe (847360 bytes)', meaning: 'payload\'s in System32. looks normal.' },
              ],
            },
            {
              cmd: 'chntpw -e /mnt/atm/Windows/System32/config/SOFTWARE',
              parts: [
                { token: 'chntpw', meaning: 'edits the Windows registry offline' },
                { token: '-e', meaning: 'edit mode' },
                { token: '…/config/SOFTWARE', meaning: 'SOFTWARE hive. patch Userinit here.' },
              ],
              outputs: [
                { token: '> ed Userinit', meaning: 'editing Userinit' },
                { token: 'userinit.exe,…\\svchost32.exe', meaning: 'autorun now pulls Ploutus in' },
                { token: '[ PERSISTENCE ] … modified', meaning: 'hook stuck. survives reboot.' },
              ],
            },
            {
              cmd: 'sync && umount /mnt/atm',
              parts: [
                { token: 'sync', meaning: 'flush writes' },
                { token: '&&', meaning: 'umount only if sync worked' },
                { token: 'umount /mnt/atm', meaning: 'unmount so you can reseat the drive' },
              ],
              outputs: [
                { token: 'umount: /mnt/atm: clean', meaning: 'safe to pull and put back in the bay' },
              ],
            },
          ],
          '2': [
            {
              cmd: 'echo "blackbox: RPi Zero W + CDM firmware shim"',
              parts: [
                { token: 'echo', meaning: 'marker — this path is hardware, not shell' },
                { token: '"blackbox: …"', meaning: 'Pi spliced on the CDM control cable' },
              ],
              outputs: [
                { token: 'splice … CPU and CDM', meaning: 'inline. ATM CPU never sees a payload' },
                { token: 'no malware / no reboot', meaning: 'skips persist + activate in this demo' },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    phase: 4,
    title: 'PERSIST',
    blurb:
      'Payload\'s on disk. Leave the machine looking normal. Only option 1 is safe. If you cut eth earlier (option 2), advancing past this phase wakes SIEM.',
    commands: [],
    choices: [
      {
        id: 'persist-method',
        prompt: 'SELECT PERSISTENCE / EXIT METHOD',
        tip: 'Only option 1. Everything else is a bust.',
        options: [
          { key: '1', label: 'Reseal panel, restore sensor, power-cycle ATM', verdict: 'go', note: 'Tape on, sensor back, XP boots, Ploutus loads.' },
          { key: '2', label: 'Leave panel ajar / skip reseal', verdict: 'no', note: 'Someone sees it. Silent alarm.' },
          { key: '3', label: 'Skip reboot - leave malware unloaded until next crash', verdict: 'no', note: 'No reboot, payload never loads. Half-done cabinet gets spotted.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'echo "reseal; unclamp; power-cycle"',
              parts: [
                { token: 'echo', meaning: 'marker for reseal + reboot' },
                { token: '"reseal; …"', meaning: 'what you do with your hands before the boot log' },
              ],
            },
            {
              cmd: 'cat /tmp/atm-serial.log',
              parts: [
                { token: 'cat', meaning: 'dumps a file' },
                { token: '/tmp/atm-serial.log', meaning: 'boot log. watch Userinit pull Ploutus in.' },
              ],
              outputs: [
                { token: 'Windows XP loading…', meaning: 'boots like a normal branch machine' },
                { token: 'executing userinit.exe', meaning: 'Winlogon running the autorun chain' },
                { token: 'svchost32.exe <- PLOUTUS-D LOADING', meaning: 'payload\'s up. customers see nothing.' },
                { token: 'ATM UI: ready for customer', meaning: 'looks fine. waits for keyboard + code.' },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    phase: 5,
    title: 'ACTIVATE',
    blurb:
      "ATM looks fine to customers. Mule shows up later with a keyboard + today's code. Do NOT touch the customer PIN screen.",
    commands: [],
    choices: [
      {
        id: 'activate-method',
        prompt: 'SELECT ACTIVATION METHOD',
        tip: "Keyboard + code. That's it.",
        options: [
          { key: '1', label: 'Plug USB keyboard in and enter activation code', verdict: 'go', note: 'Hidden F-key menu. F4 dumps all cassettes.' },
          { key: '2', label: 'Trigger dispense from the normal customer PIN screen', verdict: 'no', note: 'No jackpot there. Just gets logged.' },
          { key: '3', label: 'Call activation server from a phone next to the ATM', verdict: 'no', note: 'Cell burst by the vestibule is a fraud flag.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'echo "mule1 on-site; USB HID keyboard attached"',
              parts: [
                { token: 'echo', meaning: 'mule\'s there. keyboard plugged in.' },
              ],
            },
            {
              cmd: 'cat codes/today.txt',
              parts: [
                { token: 'cat', meaning: 'dumps a file' },
                { token: 'codes/today.txt', meaning: "today's rotating code" },
              ],
              outputs: [
                { token: 'X9K2-M7PQ-…', meaning: 'mule types this on the hidden UI' },
                { token: 'rotating activation code accepted', meaning: 'F-key menu unlocked' },
              ],
            },
            {
              cmd: 'cat /proc/ploutus/menu',
              parts: [
                { token: 'cat', meaning: 'dumps a file' },
                { token: '/proc/ploutus/menu', meaning: 'hidden F-key menu. demo path is F4.' },
              ],
              outputs: [
                { token: '[F1]…[F4] DISPENSE ALL', meaning: 'F4. all cassettes.' },
                { token: 'mule selects F4', meaning: 'jackpot armed. next phase dumps cash.' },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    phase: 6,
    title: 'JACKPOT',
    blurb:
      "Cash is coming out. Hit SPACE through dmesg. CDM_DISPENSE fires, cassettes spin, money animation runs. That's the win.",
    commands: [
      {
        cmd: 'dmesg | tail -n 8',
        parts: [
          { token: 'dmesg', meaning: 'kernel messages' },
          { token: '| tail -n 8', meaning: 'last 8 lines. CDM chatter.' },
        ],
        outputs: [
          { token: 'WFSExecute(… CDM_DISPENSE …)', meaning: 'XFS dispense. no bank auth, no txn.' },
          { token: 'cassette1 $20 … DISPENSING', meaning: 'twenties coming out' },
          { token: 'cassette2 $50 … DISPENSING', meaning: 'fifties too' },
          { token: 'cassette3/4 $100 … DISPENSING', meaning: 'hundreds. that\'s the jackpot.' },
        ],
      },
    ],
    choices: [],
  },
];

/**
 * Common Linux cmds that aren't part of this scripted demo.
 * `clear` is intentionally NOT here — it actually works.
 */
export const BASIC_LINUX_CMDS = new Set([
  // filesystem / navigation
  'ls', 'll', 'la', 'cd', 'pwd', 'cat', 'tac', 'less', 'more', 'head', 'tail', 'tree',
  'find', 'locate', 'which', 'whereis', 'file', 'stat', 'realpath', 'basename', 'dirname',
  'touch', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'ln', 'chmod', 'chown', 'chgrp', 'umask',
  'du', 'df', 'lsblk', 'mount', 'umount', 'fdisk', 'parted', 'dd', 'sync',
  // text
  'grep', 'egrep', 'fgrep', 'sed', 'awk', 'sort', 'uniq', 'wc', 'tr', 'cut', 'tee', 'xargs',
  'diff', 'patch', 'jq',
  // process / system
  'ps', 'top', 'htop', 'kill', 'killall', 'pkill', 'pgrep', 'nice', 'renice', 'jobs', 'bg', 'fg',
  'free', 'uname', 'whoami', 'id', 'groups', 'w', 'who', 'last', 'uptime', 'hostname', 'timedatectl',
  'date', 'cal', 'env', 'printenv', 'export', 'unset', 'alias', 'unalias', 'history', 'type', 'command',
  'sudo', 'su', 'passwd', 'useradd', 'userdel', 'usermod', 'groupadd',
  // packages / languages
  'apt', 'apt-get', 'aptitude', 'yum', 'dnf', 'pacman', 'zypper', 'snap', 'flatpak',
  'pip', 'pip3', 'python', 'python3', 'node', 'npm', 'npx', 'yarn', 'ruby', 'perl', 'php',
  // network
  'ping', 'traceroute', 'tracepath', 'mtr', 'netstat', 'ss', 'ifconfig', 'ip', 'iwconfig',
  'nmap', 'tcpdump', 'wireshark', 'tshark', 'nc', 'netcat', 'ncat', 'socat',
  'wget', 'curl', 'ssh', 'scp', 'sftp', 'rsync', 'ftp', 'telnet', 'dig', 'nslookup', 'host',
  'arp', 'route', 'iptables', 'nft', 'firewall-cmd',
  // shells / editors
  'bash', 'sh', 'zsh', 'fish', 'dash', 'tmux', 'screen',
  'vim', 'vi', 'nvim', 'nano', 'emacs', 'ed',
  // services / containers
  'systemctl', 'service', 'journalctl', 'reboot', 'shutdown', 'poweroff', 'halt', 'init',
  'docker', 'docker-compose', 'podman', 'kubectl', 'helm',
  // archives / crypto
  'tar', 'gzip', 'gunzip', 'bzip2', 'xz', 'zip', 'unzip', '7z', 'rar',
  'openssl', 'gpg', 'base64', 'md5sum', 'sha1sum', 'sha256sum', 'sha512sum',
  // hardware / debug
  'lsusb', 'lspci', 'lscpu', 'lsmod', 'modprobe', 'dmesg', 'dmidecode', 'hdparm', 'smartctl',
  'lsof', 'strace', 'ltrace', 'gdb', 'ldd', 'objdump', 'readelf', 'hexdump', 'xxd', 'strings',
  // misc common
  'man', 'info', 'help', 'echo', 'printf', 'yes', 'true', 'false', 'sleep', 'time', 'timeout',
  'watch', 'xargs', 'nohup', 'nice', 'chntpw', 'ntfs-3g', 'lsusb',
  'who', 'finger', 'mail', 'wall', 'write', 'mesg',
  'crontab', 'at', 'batch',
  'git', 'svn', 'hg',
  'make', 'cmake', 'gcc', 'g++', 'clang', 'ld', 'ar',
  'curl', 'http', 'httpie',
]);

/** Commands that actually do something in this demo terminal (not a roast). */
export function isWorkingDemoCommand(typed: string): boolean {
  const first = typed.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  return first === 'clear' || first === 'help';
}

/** Cold-start `help` easter egg (user shell). Hint line is appended by the game. */
export const HELP_EASTER_EGG_LINES = [
  'hey, this is just a demo — no real bash help on this box.',
  'Listen up, kid: Train de Aqua made ya a cheat sheet. Use it when ya get lost.',
  'Boss needs this money. Quit pokin\' at help and start sniffin\' around your home dir.',
] as const;

export function isBasicLinuxCommand(typed: string): boolean {
  if (isWorkingDemoCommand(typed)) return false;
  const first = typed.trim().split(/\s+/)[0]?.replace(/^[./]+/, '') ?? '';
  if (!first) return false;
  const lower = first.toLowerCase();
  if (BASIC_LINUX_CMDS.has(lower)) return true;
  const base = lower.split('/').pop() ?? '';
  return BASIC_LINUX_CMDS.has(base);
}
