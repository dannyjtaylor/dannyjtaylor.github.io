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
      "Our guys left ya somethin' on the laptop. Find it, run da script, and make sure you're on the same network as the ATM, y'hear?",
    commands: [
      {
        cmd: 'ls ~/drop',
        parts: [
          { token: 'ls', meaning: 'list files in a directory' },
          { token: '~/drop', meaning: 'Train de Aqua kit folder in your home dir' },
        ],
        outputs: [
          { token: 'bootstrap.sh', meaning: 'the script that escalates you to root + mounts the op overlay' },
          { token: 'tools/', meaning: 'field kit notes (T-bar, loopback, crowbar receipt, etc.)' },
          { token: '.oprc', meaning: 'tiny op config — ignore unless you\'re poking around' },
        ],
      },
      {
        cmd: 'sudo ./drop/bootstrap.sh',
        parts: [
          { token: 'sudo', meaning: 'run as root (danny is a sudoer on this box)' },
          { token: './drop/bootstrap.sh', meaning: 'operator bootstrap — mounts ~/ploutus and flips you to root' },
        ],
        outputs: [
          { token: '[sudo] password…', meaning: 'sudo asking for danny\'s password (demo autofills)' },
          { token: '[*] Train de Aqua // bootstrap', meaning: 'crew bootstrap banner — you\'re in the kit now' },
          { token: 'verifying drop signature… OK', meaning: 'ed25519 check passed — drop wasn\'t tampered' },
          { token: 'mounting … → /root/ploutus', meaning: 'op workspace lands at /root/ploutus' },
          { token: 'switching uid=0', meaning: 'you\'re root now — prompt becomes root@kali' },
        ],
      },
      {
        cmd: 'ip -4 addr show eth0 | grep inet',
        parts: [
          { token: 'ip', meaning: 'iproute2 tool — talk to the kernel about interfaces/routes' },
          { token: '-4', meaning: 'IPv4 only (skip IPv6 noise)' },
          { token: 'addr show eth0', meaning: 'print addresses on the eth0 NIC' },
          { token: '|', meaning: 'pipe stdout into the next command' },
          { token: 'grep inet', meaning: 'keep lines that mention inet (your IPv4 address)' },
        ],
        outputs: [
          { token: 'inet 192.168.1.104/24', meaning: 'your laptop\'s IPv4 on the branch LAN' },
          { token: 'scope global eth0', meaning: 'address is on eth0 (the cable you plugged in)' },
        ],
      },
      {
        cmd: 'ip route | head -n1',
        parts: [
          { token: 'ip route', meaning: 'print the routing table' },
          { token: '|', meaning: 'pipe into head' },
          { token: 'head -n1', meaning: 'first line only — usually the default gateway' },
        ],
        outputs: [
          { token: 'default via 192.168.1.1', meaning: 'branch router / gateway — same /24 as the ATM' },
          { token: 'dev eth0 proto dhcp', meaning: 'got the route from DHCP on eth0' },
        ],
      },
      {
        cmd: 'nmap -sV -p8080 --open 192.168.1.0/24',
        parts: [
          { token: 'nmap', meaning: 'network scanner' },
          { token: '-sV', meaning: 'probe open ports and guess service/version' },
          { token: '-p8080', meaning: 'only scan port 8080' },
          { token: '--open', meaning: 'only show hosts that actually have the port open' },
          { token: '192.168.1.0/24', meaning: 'whole /24 subnet (256 addresses)' },
        ],
        outputs: [
          { token: '192.168.1.47', meaning: 'the ATM\'s IP on the branch LAN' },
          { token: '8080/tcp open http', meaning: 'Agilis status/service port is open' },
          { token: 'Agilis ATM XFS 3.20', meaning: 'XFS stack version — matches our Ploutus target' },
          { token: 'Windows XP … SP3', meaning: 'EOL OS — soft target for the install phase' },
        ],
      },
      {
        cmd: 'curl -s http://192.168.1.47/status | python3 -m json.tool',
        parts: [
          { token: 'curl', meaning: 'HTTP client' },
          { token: '-s', meaning: 'silent — no progress meter' },
          { token: 'http://192.168.1.47/status', meaning: 'hit the ATM status endpoint' },
          { token: '|', meaning: 'pipe the body into python' },
          { token: 'python3 -m json.tool', meaning: 'pretty-print JSON so it\'s readable' },
        ],
        outputs: [
          { token: '"model": "Optiva740"', meaning: 'Dyebold Optiva 740 confirmed' },
          { token: '"vendor": "Dyebold"', meaning: 'vendor string from the status API' },
          { token: '"cassettes": 4', meaning: 'four cash cassettes in this AFD' },
          { token: '"xfs": "Kalignite"', meaning: 'XFS middleware brand — CDM path we abuse later' },
        ],
      },
      {
        cmd: 'cat recon/target.md',
        parts: [
          { token: 'cat', meaning: 'print a file to the terminal' },
          { token: 'recon/target.md', meaning: 'op notes for this ATM (model, OS, kit, blind spot)' },
        ],
        outputs: [
          { token: 'Dyebold Optiva 740', meaning: 'target model + ~$50K per cassette' },
          { token: 'Windows XP SP3', meaning: 'EOL since 2014 — no patches' },
          { token: 'CDM_DISPENSE via MSXFS.dll', meaning: 'the dispense call we\'ll hit in jackpot' },
          { token: 'camera blind … 02:00-05:30', meaning: 'vestibule corner dead zone for the mule' },
          { token: 'kit: T-bar … Ploutus-D', meaning: 'what you should have in the drop/tools bag' },
        ],
      },
    ],
    choices: [],
  },
  {
    phase: 2,
    title: 'BREACH',
    blurb:
      "Physical access time. Open the top-hat, kill the log stream, keep the door sensor happy. Wrong picks start the police timer.",
    commands: [
      {
        cmd: 'echo "vestibule clear - DN tech cover ready"',
        parts: [
          { token: 'echo', meaning: 'print the string (just a beat marker in this demo)' },
          { token: '"…"', meaning: 'vestibule clear + cover story set — then the choices hit' },
        ],
        outputs: [
          { token: 'vestibule clear - DN tech cover ready', meaning: 'echo just repeats the string — green light to start the choices' },
        ],
      },
      {
        cmd: 'echo "[*] internal access confirmed"',
        parts: [
          { token: 'echo', meaning: 'print confirmation after the three breach choices' },
          { token: '"[*] …"', meaning: 'you\'re inside — install is next' },
        ],
        outputs: [
          { token: '[*] internal access confirmed', meaning: 'all three breach beats done — cabinet is yours' },
        ],
      },
    ],
    choices: [
      {
        id: 'panel-access',
        prompt: 'SELECT PANEL ACCESS METHOD',
        tip: '1 or 3. Crowbar is a trap.',
        options: [
          { key: '1', label: 'Ebay Dyebold T-bar Key (SKU 001-0006522)', verdict: 'go', note: 'Real Dyebold top-hat key. Quiet, panel opens.' },
          { key: '2', label: 'Crow bar', verdict: 'no', note: 'Vibration sensor → monitoring center. Police ETA starts.' },
          { key: '3', label: 'Social Engineering - Wear DN field technician gear & badge', verdict: 'go', note: 'Badge + cover story. Guard opens it for you.' },
        ],
      },
      {
        id: 'ethernet',
        prompt: 'HANDLE NETWORK / LOG STREAM',
        tip: 'Loopback is the clean play. Cut-only is a delayed SIEM bomb.',
        options: [
          { key: '1', label: 'Cut cable + insert RJ45 loopback plug', verdict: 'go', note: 'SIEM stream dies, NIC still looks "up" to the ATM.' },
          { key: '2', label: 'Cut cable only', verdict: 'maybe', note: 'Looks fine now. Buffered logs flush when the cable comes back — police hit on phase advance.' },
          { key: '3', label: 'Leave cable intact', verdict: 'no', note: 'Live tamper hits SIEM immediately.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'ip link show eth0 | head -n2',
              parts: [
                { token: 'ip link show eth0', meaning: 'link-layer status for eth0 (UP / NO-CARRIER / etc.)' },
                { token: '| head -n2', meaning: 'first two lines only' },
              ],
              outputs: [
                { token: 'NO-CARRIER … UP', meaning: 'cable cut but interface still administratively UP' },
                { token: 'RJ45 loopback seated', meaning: 'SIEM stream dead — NIC still looks healthy to the ATM' },
              ],
            },
          ],
        },
      },
      {
        id: 'alarm-sensor',
        prompt: 'DOOR ALARM SENSOR',
        tip: "Clamp it. Don't cut it. Don't ignore it.",
        options: [
          { key: '1', label: 'Magnetic reed-switch clamp', verdict: 'go', note: 'Sensor still reads CLOSED while the lid is open.' },
          { key: '2', label: 'Cut alarm sensor wire', verdict: 'no', note: 'Broken loop → central station alarm.' },
          { key: '3', label: 'Ignore sensor & hope nobody is watching', verdict: 'no', note: 'Door-open alert fires. Units rolling.' },
        ],
      },
    ],
  },
  {
    phase: 3,
    title: 'INSTALL',
    blurb:
      'Get Ploutus on the box. All three paths work — HDD pull, USB live, or black box. Follow-up cmds show up after you pick.',
    commands: [
      {
        cmd: 'lsblk -o NAME,SIZE,TYPE,MODEL | grep -E "NAME|sda|sdb"',
        parts: [
          { token: 'lsblk', meaning: 'list block devices (disks/partitions)' },
          { token: '-o NAME,SIZE,TYPE,MODEL', meaning: 'only show those columns' },
          { token: '| grep -E "…"', meaning: 'keep the header + sda/sdb lines (-E = extended regex)' },
        ],
        outputs: [
          { token: 'sdb … 80G … ATM-HDD-2.5SATA', meaning: 'ATM hard drive visible — that\'s the install target' },
          { token: 'Winlogon\\Userinit -> svchost32.exe', meaning: 'persistence hook we\'ll plant on the XP disk' },
        ],
      },
    ],
    choices: [
      {
        id: 'install-method',
        prompt: 'SELECT INSTALL METHOD',
        tip: "All three work. Know which path you're demoing.",
        options: [
          {
            key: '1',
            label: 'Remove the HDD and deploy Ploutus on NTFS partition',
            verdict: 'go',
            note: 'Mount XP, drop svchost32.exe, patch Winlogon\\Userinit with chntpw.',
          },
          {
            key: '2',
            label: 'Boot from USB live OS and inject Ploutus',
            verdict: 'go',
            note: 'Boot the stick, run ploutus-installer.sh. Same Userinit persist.',
          },
          {
            key: '3',
            label: 'Use a Raspberry Pi black box',
            verdict: 'go',
            note: 'Hardware shim on the dispenser cable. Skips phases 4–5 in this demo.',
          },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'lsblk | grep sdb',
              parts: [
                { token: 'lsblk', meaning: 'list disks again' },
                { token: '| grep sdb', meaning: 'confirm the ATM HDD showed up as sdb' },
              ],
              outputs: [
                { token: 'sdb … ATM HDD via USB-SATA', meaning: 'drive is on your USB-SATA bridge — ready to mount' },
              ],
            },
            {
              cmd: 'ntfs-3g /dev/sdb1 /mnt/atm -o remove_hiberfile',
              parts: [
                { token: 'ntfs-3g', meaning: 'FUSE driver — mount an NTFS volume on Linux' },
                { token: '/dev/sdb1', meaning: 'first partition on the ATM drive' },
                { token: '/mnt/atm', meaning: 'mount point' },
                { token: '-o remove_hiberfile', meaning: 'clear Windows hibernation lock so the mount works' },
              ],
              outputs: [
                { token: 'Mounted /dev/sdb1 at /mnt/atm', meaning: 'XP filesystem is readable/writable now' },
                { token: 'Windows XP SP3 - Agilis XFS 3.20', meaning: 'confirms the target stack before we drop payload' },
              ],
            },
            {
              cmd: 'ls /mnt/atm/Windows/System32/ | grep -iE "xfs|cdm"',
              parts: [
                { token: 'ls …/System32/', meaning: 'list system DLLs on the mounted XP disk' },
                { token: '| grep -iE "xfs|cdm"', meaning: '-i ignore case, -E regex — find XFS/CDM bits' },
              ],
              outputs: [
                { token: 'MSXFS.dll', meaning: 'XFS middleware — the API Ploutus will call' },
                { token: 'CDM_ServiceProvider.dll', meaning: 'cash dispenser service provider' },
              ],
            },
            {
              cmd: 'cp ~/ploutus/payload/svchost32.exe /mnt/atm/Windows/System32/',
              parts: [
                { token: 'cp', meaning: 'copy a file' },
                { token: '~/ploutus/payload/svchost32.exe', meaning: 'Ploutus payload (disguised name)' },
                { token: '…/System32/', meaning: 'drop it where Windows will load it from' },
              ],
              outputs: [
                { token: 'svchost32.exe (847360 bytes)', meaning: 'payload landed in System32 under a boring name' },
              ],
            },
            {
              cmd: 'chntpw -e /mnt/atm/Windows/System32/config/SOFTWARE',
              parts: [
                { token: 'chntpw', meaning: 'offline Windows registry editor' },
                { token: '-e', meaning: 'edit mode (interactive hive editor)' },
                { token: '…/config/SOFTWARE', meaning: 'SOFTWARE hive — patch Winlogon\\Userinit here' },
              ],
              outputs: [
                { token: '> ed Userinit', meaning: 'editing the Winlogon Userinit value' },
                { token: 'userinit.exe,…\\svchost32.exe', meaning: 'autorun chain now includes Ploutus' },
                { token: '[ PERSISTENCE ] … modified', meaning: 'registry hook stuck — survives reboot' },
              ],
            },
            {
              cmd: 'sync && umount /mnt/atm',
              parts: [
                { token: 'sync', meaning: 'flush pending writes to disk' },
                { token: '&&', meaning: 'only run umount if sync succeeded' },
                { token: 'umount /mnt/atm', meaning: 'unmount so you can reseat the drive' },
              ],
              outputs: [
                { token: 'umount: /mnt/atm: clean', meaning: 'safe to pull the drive and reseat it in the bay' },
              ],
            },
          ],
          '2': [
            {
              cmd: 'lsusb | grep -i kingston',
              parts: [
                { token: 'lsusb', meaning: 'list USB devices' },
                { token: '| grep -i kingston', meaning: 'confirm the installer stick is plugged in' },
              ],
              outputs: [
                { token: 'Kingston DataTraveler 32GB', meaning: 'live-OS installer stick is attached' },
                { token: 'BIOS USB-first set', meaning: 'ATM will boot the stick on next power cycle' },
              ],
            },
            {
              cmd: './ploutus-installer.sh --target ntfs --persist userinit',
              parts: [
                { token: './ploutus-installer.sh', meaning: 'run the live-OS installer script' },
                { token: '--target ntfs', meaning: 'write onto the NTFS Windows partition' },
                { token: '--persist userinit', meaning: 'hook Winlogon\\Userinit for reboot persistence' },
              ],
              outputs: [
                { token: '[*] mounting NTFS via live OS…', meaning: 'installer mounts the XP disk from the stick' },
                { token: '[*] payload written; Userinit patched', meaning: 'same end state as the HDD-pull path' },
                { token: '[ PERSISTENCE ] … modified', meaning: 'autorun hook is in place' },
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
      'Payload is on disk. Leave the machine looking normal. Only option 1 is safe. If you cut eth earlier (option 2), advancing past this phase detonates SIEM.',
    commands: [],
    choices: [
      {
        id: 'persist-method',
        prompt: 'SELECT PERSISTENCE / EXIT METHOD',
        tip: 'Only option 1. Everything else is a bust.',
        options: [
          { key: '1', label: 'Reseal panel, restore sensor, power-cycle ATM', verdict: 'go', note: 'Tamper tape on, sensor restored, XP boots, Ploutus loads via Userinit.' },
          { key: '2', label: 'Leave panel ajar / skip reseal', verdict: 'no', note: 'Passerby / camera → silent alarm.' },
          { key: '3', label: 'Skip reboot - leave malware unloaded until next crash', verdict: 'no', note: 'Malware never loads. Op wasted.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'echo "reseal; unclamp; power-cycle"',
              parts: [
                { token: 'echo', meaning: 'beat marker for reseal + reboot' },
                { token: '"reseal; …"', meaning: 'what you physically do before the boot log' },
              ],
              outputs: [
                { token: 'reseal; unclamp; power-cycle', meaning: 'physical steps done — watch the serial boot log next' },
              ],
            },
            {
              cmd: 'cat /tmp/atm-serial.log',
              parts: [
                { token: 'cat', meaning: 'print the file' },
                { token: '/tmp/atm-serial.log', meaning: 'boot log — XP → Userinit → svchost32.exe (Ploutus)' },
              ],
              outputs: [
                { token: 'Windows XP loading…', meaning: 'ATM is booting like a normal branch machine' },
                { token: 'executing userinit.exe', meaning: 'Winlogon running the autorun chain' },
                { token: 'svchost32.exe <- PLOUTUS-D LOADING', meaning: 'payload loaded — still invisible to customers' },
                { token: 'ATM UI: ready for customer', meaning: 'looks normal; waits for USB keyboard + code' },
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
      "ATM looks fine to customers. Mule shows up later with a keyboard + today's code. Do NOT try the customer PIN screen.",
    commands: [],
    choices: [
      {
        id: 'activate-method',
        prompt: 'SELECT ACTIVATION METHOD',
        tip: "Keyboard + code. That's it.",
        options: [
          { key: '1', label: 'Plug USB keyboard + enter rotating activation code', verdict: 'go', note: 'Hidden F-key menu. F4 dumps all cassettes.' },
          { key: '2', label: 'Trigger dispense from the normal customer PIN screen', verdict: 'no', note: 'No jackpot path there. Attempt gets logged.' },
          { key: '3', label: 'Call activation server from a phone next to the ATM', verdict: 'no', note: 'Cellular burst near vestibule is a fraud flag.' },
        ],
        afterPick: {
          '1': [
            {
              cmd: 'echo "mule1 on-site; USB HID keyboard attached"',
              parts: [
                { token: 'echo', meaning: 'mule is on site, keyboard plugged in' },
              ],
              outputs: [
                { token: 'mule1 on-site; USB HID keyboard attached', meaning: 'keyboard is live — Ploutus will accept the code next' },
              ],
            },
            {
              cmd: 'cat codes/today.txt',
              parts: [
                { token: 'cat', meaning: 'print the file' },
                { token: 'codes/today.txt', meaning: "today's rotating activation code" },
              ],
              outputs: [
                { token: 'X9K2-M7PQ-…', meaning: "today's rotating code — mule types this on the hidden UI" },
                { token: 'rotating activation code accepted', meaning: 'Ploutus unlocked the F-key menu' },
              ],
            },
            {
              cmd: 'cat /proc/ploutus/menu',
              parts: [
                { token: 'cat', meaning: 'print the file' },
                { token: '/proc/ploutus/menu', meaning: 'hidden F-key menu — demo path is F4 DISPENSE ALL' },
              ],
              outputs: [
                { token: '[F1]…[F4] DISPENSE ALL', meaning: 'hidden menu — demo path is F4 (all cassettes)' },
                { token: 'mule selects F4', meaning: 'jackpot path armed — next phase is dispense' },
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
      'Cash is coming out. Hit SPACE through dmesg — CDM_DISPENSE fires, cassettes spin, money animation runs. That\'s the win.',
    commands: [
      {
        cmd: 'dmesg | tail -n 8',
        parts: [
          { token: 'dmesg', meaning: 'kernel ring buffer (driver / hardware messages)' },
          { token: '| tail -n 8', meaning: 'last 8 lines — CDM_DISPENSE chatter in the demo' },
        ],
        outputs: [
          { token: 'WFSExecute(… CDM_DISPENSE …)', meaning: 'XFS dispense call — no bank auth, no txn record' },
          { token: 'cassette1 $20 … DISPENSING', meaning: 'cassette 1 dumping twenties' },
          { token: 'cassette2 $50 … DISPENSING', meaning: 'cassette 2 dumping fifties' },
          { token: 'cassette3/4 $100 … DISPENSING', meaning: 'hundreds flying — that\'s the jackpot animation' },
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
