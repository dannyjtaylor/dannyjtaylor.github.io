# Jackpot Terminal Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brighten Jackpot brand reds, remove the threat-actor header metadata, and make the left pane read like a real Kali terminal (Courier New, classic prompt, realistic cmd/out) while keeping cyberpunk phase banners and interactive choices.

**Architecture:** Pure presentation + copy changes. No reducer / choice-outcome / ATM state-machine edits. Brand reds are find-replaced across three UI files; terminal chrome is centralized in `TerminalPanel.tsx` prompt helpers; session copy lives entirely in `phaseData.ts`.

**Tech Stack:** React 19 + TypeScript (strict, `noUnusedLocals`), Vite, inline styles (no CSS modules for Jackpot).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-09-jackpot-terminal-polish-design.md`
- Font: `"Courier New", Courier, monospace` only in Jackpot terminal UI (no Share Tech Mono, no emoji)
- Prompt: `root@kali:~/ops/ploutus#` (hardcoded cwd; no `cwd` field in v1)
- Phase banners: `// PHASE 0N - NAME` (ASCII hyphen, keep cyberpunk `ann` style)
- Choice UI structure stays interactive (1/2/3)
- Instant demo pacing — no fake install waits
- Do not change game logic in `Jackpot.tsx` reducer
- Do not touch Credits Wells Fargo, AlarmOverlay alarm reds, or gold accents
- Repo has no test runner — verify visually at `/jackpot` + `npm run build`
- Only commit when the user explicitly asks (plan lists suggested commit messages; skip git commit steps unless requested)

---

## File map

| File | Responsibility |
|------|----------------|
| `src/windows/Jackpot.tsx` | Header, phase bar, title bar, root shell colors/fonts, WELSH PHARGO signage |
| `src/windows/jackpot/AtmSvg.tsx` | ATM cabinet brand reds |
| `src/windows/jackpot/TerminalPanel.tsx` | Prompt render, cursor, ANSI colors, banner tone, pixel-7 reds |
| `src/windows/jackpot/phaseData.ts` | All terminal session copy + choice labels |
| `src/windows/jackpot/types.ts` | **Do not modify** (no optional `cwd` in v1) |

---

### Task 1: Brighten brand reds in Jackpot.tsx

**Files:**
- Modify: `src/windows/Jackpot.tsx`

**Interfaces:**
- Consumes: none
- Produces: brighter red tokens used by header/title/phase bar/signage

- [ ] **Step 1: Replace brand red hexes**

In `src/windows/Jackpot.tsx`, replace only these brand tokens (leave `#fff0f2`, golds, `#ff2244` family alone):

| Old | New |
|-----|-----|
| `#c01e35` | `#e8203a` |
| `#e04060` | `#ff6b7a` |
| `#8a1225` | `#a81428` |

Affected sites: logo SVG fills (~354–361), JACKPOT title color + `textShadow` (~363), phase-bar active border/background (~382), WELSH PHARGO bar bg + border (~419), `glitch` keyframes (~450).

- [ ] **Step 2: Verify**

Open `/jackpot`. Title, active phase tab, and WELSH PHARGO bar should look punchier.

```bash
rg "#c01e35|#e04060|#8a1225" src/windows/Jackpot.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit (only if user asked)**

```bash
git add src/windows/Jackpot.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): brighten brand reds in header and signage

EOF
)"
```

---

### Task 2: Brighten brand reds in AtmSvg.tsx

**Files:**
- Modify: `src/windows/jackpot/AtmSvg.tsx`

**Interfaces:**
- Consumes: none
- Produces: brighter ATM cabinet matching Task 1 reds

- [ ] **Step 1: Replace brand red hexes**

| Old | New |
|-----|-----|
| `#c01e35` | `#e8203a` |
| `#d42244` | `#ff3d5a` |
| `#8a1225` | `#a81428` |
| `#5a0e1c` | `#6e1020` |

Hits: cabinet shadow/body/bevels (~208–213) and top service panel (~311–316). Do not change gold strip colors.

- [ ] **Step 2: Verify**

ATM cabinet matches brighter WELSH PHARGO header.

```bash
rg "#c01e35|#d42244|#8a1225|#5a0e1c" src/windows/jackpot/AtmSvg.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit (only if user asked)**

```bash
git add src/windows/jackpot/AtmSvg.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): brighten AtmSvg cabinet reds

EOF
)"
```

---

### Task 3: Brighten pixel-7 reds in TerminalPanel.tsx

**Files:**
- Modify: `src/windows/jackpot/TerminalPanel.tsx` (`PixelatedSeven` + `svgGlow` only)

**Interfaces:**
- Consumes: none
- Produces: jackpot-complete 7s using new brand reds

- [ ] **Step 1: Replace reds in PixelatedSeven and svgGlow**

| Old | New |
|-----|-----|
| `#c01e35` | `#e8203a` |
| `#d42244` | `#ff3d5a` |
| `#8a1225` | `#a81428` |

Also update alpha variants in filters/keyframes: `#c01e3588` → `#e8203a88`, `#c01e3533` → `#e8203a33`, `#c01e3555` → `#e8203a55`, `#c01e35aa` → `#e8203aaa`.

Do **not** change prompt/banner/choice colors in this task.

- [ ] **Step 2: Verify**

```bash
rg "#c01e35|#d42244|#8a1225" src/windows/jackpot/TerminalPanel.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit (only if user asked)**

```bash
git add src/windows/jackpot/TerminalPanel.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): brighten TerminalPanel pixel-7 reds

EOF
)"
```

---

### Task 4: Remove threat-actor metadata header

**Files:**
- Modify: `src/windows/Jackpot.tsx`

**Interfaces:**
- Consumes: none
- Produces: left-only header chrome

- [ ] **Step 1: Delete metadata column and tighten header flex**

Replace the header block so it keeps logo + JACKPOT only:

```tsx
{/* Header — light chrome */}
<div style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', padding: '10px 24px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <svg viewBox="0 0 32 32" width="30" height="30" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}>
      <rect x="0" y="0" width="32" height="32" fill="#fff0f2"/>
      <rect x="5" y="4" width="22" height="5" fill="#e8203a"/>
      <rect x="5" y="4" width="22" height="2" fill="#ff6b7a"/>
      <rect x="17" y="9"  width="8" height="5" fill="#e8203a"/>
      <rect x="13" y="14" width="8" height="5" fill="#e8203a"/>
      <rect x="9"  y="19" width="8" height="5" fill="#e8203a"/>
      <rect x="17" y="9"  width="2" height="5" fill="#ff6b7a"/>
      <rect x="13" y="14" width="2" height="5" fill="#ff6b7a"/>
      <rect x="9"  y="19" width="2" height="5" fill="#ff6b7a"/>
    </svg>
    <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 10, color: '#e8203a', textShadow: '2px 2px 0 #a81428', animation: 'glitch 6s infinite', fontFamily: '"Courier New", Courier, monospace' }}>
      JACKPOT
    </div>
  </div>
</div>
```

Remove the entire right-side `THREAT ACTOR` / `MALWARE` / `TARGET` / `CLASSIFICATION` div. Drop `justifyContent: 'space-between'`.

- [ ] **Step 2: Verify**

No threat-actor text in the header. Logo + JACKPOT remain left-aligned.

```bash
rg "THREAT ACTOR|CLASSIFICATION: Training" src/windows/Jackpot.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit (only if user asked)**

```bash
git add src/windows/Jackpot.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): remove threat-actor metadata from header

EOF
)"
```

---

### Task 5: Kali-style terminal title bar

**Files:**
- Modify: `src/windows/Jackpot.tsx` (title bar above `TerminalPanel`)

**Interfaces:**
- Consumes: none
- Produces: title bar text/colors matching TerminalPanel chrome

- [ ] **Step 1: Update title bar**

Replace the title-bar div (~395–401) with:

```tsx
<div style={{ background: '#1e1e1e', borderBottom: '1px solid #2d2d2d', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#9a9a9a', flexShrink: 0 }}>
  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
  <span style={{ marginLeft: 8 }}>root@kali: ~/ops/ploutus</span>
</div>
```

Also update the root shell (outermost Jackpot div) font/bg for consistency:

```tsx
<div style={{ width: '100%', height: '100%', background: '#0c0c0c', color: '#cccccc', fontFamily: '"Courier New", Courier, monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
```

- [ ] **Step 2: Verify**

Title shows `root@kali: ~/ops/ploutus`. No LIVE badge. Traffic lights remain.

```bash
rg "LIVE|ploutus-loader" src/windows/Jackpot.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit (only if user asked)**

```bash
git add src/windows/Jackpot.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): Kali-style terminal title bar without LIVE

EOF
)"
```

---

### Task 6: TerminalPanel chrome — prompt, cursor, colors, banner, Courier New

**Files:**
- Modify: `src/windows/jackpot/TerminalPanel.tsx`

**Interfaces:**
- Consumes: `TermLine` cmd/out shapes unchanged
- Produces: `renderPrompt()` helper used by full + partial cmd rendering

- [ ] **Step 1: Add prompt helper and update color helpers**

Near the top of `TerminalPanel.tsx`, replace `outColor` and add helpers:

```tsx
const FONT = '"Courier New", Courier, monospace';
const CWD = '~/ops/ploutus';

function outColor(s?: string): string {
  switch (s) {
    case 'ok':  return '#33ff66';
    case 'warn': return '#ffaa00';
    case 'err':  return '#ff5555';
    case 'hi':   return '#ffffff';
    case 'ann':  return '#ff5577aa';
    default:     return '#cccccc';
  }
}

function renderPrompt() {
  return (
    <>
      <span style={{ color: '#ff5555' }}>root@kali</span>
      <span style={{ color: '#888888' }}>:</span>
      <span style={{ color: '#5c7cfa' }}>{CWD}</span>
      <span style={{ color: '#ff5555' }}>#</span>
      <span> </span>
    </>
  );
}
```

Keep `outBorderLeft` / `outPaddingLeft` / `outMargin` / `outBg` as-is (hi accent stays).

- [ ] **Step 2: Update cmd rendering + block cursor**

```tsx
function renderFullLine(line: TermLine, key: number | string) {
  if (line.t === 'blank') return <span key={key} style={{ display: 'block', height: '0.5em' }} />;
  if (line.t === 'banner') return null;
  if (line.t === 'cmd') return (
    <span key={key} style={{ display: 'block', color: '#e0e0e0' }}>
      {renderPrompt()}{line.text}
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
  const color = isCmd ? '#e0e0e0' : outColor((line as { s?: string }).s);
  return (
    <span style={{ display: 'block', color }}>
      {isCmd && renderPrompt()}
      {text}
      <span style={{ color: '#33ff66', animation: 'blink 1s step-end infinite' }}>█</span>
    </span>
  );
}
```

- [ ] **Step 3: Update panel container, banner tone, cash font**

Panel container:

```tsx
<div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontFamily: FONT, fontSize: 12.5, lineHeight: 1.7, background: '#0c0c0c', scrollbarWidth: 'thin', scrollbarColor: '#333 #0c0c0c' }}>
```

Banner (quieter tool-banner, not neon pink):

```tsx
{isBanner && (
  <div style={{ color: '#888888', fontSize: 8, lineHeight: 1.3, marginBottom: 14, whiteSpace: 'pre', letterSpacing: 0 }}>
    {BANNER}
    <div style={{ color: '#aaaaaa', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>
      Ploutus-D Loader v2.1 - Kalignite XFS - Cobalt Group Toolkit
    </div>
  </div>
)}
```

Cash counter fontFamily → `FONT`. Success line hyphen: `JACKPOT - OPERATION SUCCESSFUL`.

Choice panels: keep structure; optional bg tweak `#12080c` / border `#ff224455` if contrast needs it on `#0c0c0c` — do not redesign.

- [ ] **Step 4: Verify**

At `/jackpot`, press Space: prompts show colored `root@kali:~/ops/ploutus#`, Courier New, block cursor, dim banner, no emoji, no `$ ` prompt.

```bash
rg "Share Tech Mono|\\$ " src/windows/jackpot/TerminalPanel.tsx
```

Expected: no Share Tech Mono; no `$ ` prompt prefix (dollar may still appear in cash display as `$212,000` — that is fine).

- [ ] **Step 5: Commit (only if user asked)**

```bash
git add src/windows/jackpot/TerminalPanel.tsx
git commit -m "$(cat <<'EOF'
polish(jackpot): Kali prompt, Courier New, cursor, and ANSI colors

EOF
)"
```

---

### Task 7: Hyphenate CHOICES + phase banners; rewrite PHASE_LINES 1–2 + early continuations

**Files:**
- Modify: `src/windows/jackpot/phaseData.ts`

**Interfaces:**
- Consumes: existing `ChoiceId` / `TermLine` shapes
- Produces: updated copy only — same keys, same choice IDs/outcomes

- [ ] **Step 1: Hyphenate CHOICES strings (keep prompts/options structure)**

Replace em dashes `—` with `-` in all `CHOICES` labels and `wrongReason` strings. Do not change keys, outcomes, or prompt wording beyond hyphenation.

- [ ] **Step 2: Replace PHASE_LINES[1] with realistic Kali session**

Keep `{ t: 'banner' }`, phase `ann` line, blanks, and `[ RECON COMPLETE ]` `hi` line. Use this content:

```ts
1: [
  { t: 'banner' },
  { t: 'out', text: '// PHASE 01 - RECON', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'nmap -sV -p8080 --open 192.168.1.0/24' },
  { t: 'out', text: 'Starting Nmap 7.94 ( https://nmap.org ) at 2026-03-14 01:58 EDT' },
  { t: 'out', text: 'Nmap scan report for 192.168.1.47' },
  { t: 'out', text: 'Host is up (0.0042s latency).' },
  { t: 'out', text: 'PORT     STATE SERVICE VERSION' },
  { t: 'out', text: '8080/tcp open  http    Agilis ATM XFS 3.20', s: 'ok' },
  { t: 'out', text: 'Service Info: OS: Windows XP Professional SP3; CPE: cpe:/o:microsoft:windows_xp' },
  { t: 'blank' },
  { t: 'cmd', text: 'curl -s http://192.168.1.47/status | python3 -m json.tool' },
  { t: 'out', text: '{' },
  { t: 'out', text: '    "model": "Opteva740",' },
  { t: 'out', text: '    "vendor": "Diebold",' },
  { t: 'out', text: '    "cassettes": 4,' },
  { t: 'out', text: '    "firmware": "3.20.4",' },
  { t: 'out', text: '    "xfs": "Kalignite"' },
  { t: 'out', text: '}', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'cat recon/target.md' },
  { t: 'out', text: '# target: Diebold Opteva 740 AFD - 4 cassettes (~$50K ea)', s: 'ok' },
  { t: 'out', text: '# os: Windows XP SP3 - EOL, unpatched since 2014-04', s: 'warn' },
  { t: 'out', text: '# attack: CDM_DISPENSE via MSXFS.dll (Agilis XFS 3.20)', s: 'warn' },
  { t: 'out', text: '# camera blind: NW vestibule corner 02:00-05:30', s: 'ok' },
  { t: 'out', text: '# kit: T-bar SKU 001-0006522, Ploutus-D build, 2 mules on standby', s: 'ok' },
  { t: 'blank' },
  { t: 'out', text: '[ RECON COMPLETE ] Proceeding to breach...', s: 'hi' },
],
```

- [ ] **Step 3: Replace PHASE_LINES[2] (keep three choice slots)**

```ts
2: [
  { t: 'out', text: '// PHASE 02 - BREACH', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'date; echo "vestibule clear - NCR tech cover ready"' },
  { t: 'out', text: 'Sat Mar 14 02:14:03 EDT 2026' },
  { t: 'out', text: 'vestibule clear - NCR tech cover ready', s: 'ok' },
  { t: 'blank' },
  { t: 'choice', id: 'panel-access' },
  { t: 'blank' },
  { t: 'choice', id: 'ethernet' },
  { t: 'blank' },
  { t: 'choice', id: 'alarm-sensor' },
  { t: 'blank' },
  { t: 'cmd', text: 'echo "[*] internal access confirmed; elapsed 3m42s"' },
  { t: 'out', text: '[*] internal access confirmed; elapsed 3m42s', s: 'ok' },
  { t: 'blank' },
  { t: 'out', text: '[ BREACH COMPLETE ] Proceeding to install...', s: 'hi' },
],
```

- [ ] **Step 4: Rewrite early CONTINUATIONS (panel / ethernet / alarm)**

```ts
'panel-access:1': [
  { t: 'out', text: '# t-bar 001-0006522 seated - latch released (18s)', s: 'ok' },
  { t: 'out', text: '# top-hat panel open - cavity exposed', s: 'ok' },
],
'panel-access:3': [
  { t: 'out', text: '# social: NCR badge accepted (+4m escort delay)', s: 'warn' },
  { t: 'out', text: '# guard unlocked panel - internal access granted', s: 'ok' },
],
'ethernet:1': [
  { t: 'cmd', text: 'ip link show eth0 | head -n2' },
  { t: 'out', text: '2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500' },
  { t: 'out', text: '# wall jack: RJ45 loopback seated - SIEM stream dead', s: 'ok' },
],
'ethernet:2': [
  { t: 'out', text: '# eth cut - NIC buffering locally (no loopback)', s: 'warn' },
  { t: 'out', text: '# WARNING: buffer flushes to SIEM on reconnect', s: 'warn' },
],
'alarm-sensor:1': [
  { t: 'out', text: '# reed clamp on door sensor - reads CLOSED', s: 'ok' },
  { t: 'out', text: '# monitoring loop intact - no central-station hit', s: 'ok' },
],
```

- [ ] **Step 5: Verify**

Play phases 1–2. Choices still accept 1/2/3. Banners use `-`.

```bash
rg "PHASE 0[0-9] —" src/windows/jackpot/phaseData.ts
```

Expected: no matches for em-dash banners.

- [ ] **Step 6: Commit (only if user asked)**

```bash
git add src/windows/jackpot/phaseData.ts
git commit -m "$(cat <<'EOF'
content(jackpot): rewrite phases 1-2 and early continuations

EOF
)"
```

---

### Task 8: Rewrite PHASE_LINES 3–4 + install continuations

**Files:**
- Modify: `src/windows/jackpot/phaseData.ts`

**Interfaces:**
- Consumes: `install-method` choice outcomes unchanged
- Produces: realistic install/persist session copy

- [ ] **Step 1: Replace PHASE_LINES[3] and [4]**

```ts
3: [
  { t: 'out', text: '// PHASE 03 - INSTALL', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'lsblk -o NAME,SIZE,TYPE,MODEL | grep -E "NAME|sda|sdb"' },
  { t: 'out', text: 'NAME   SIZE TYPE MODEL' },
  { t: 'out', text: 'sdb     80G disk ATM-HDD-2.5SATA', s: 'ok' },
  { t: 'out', text: '# persistence target: Winlogon\\Userinit -> svchost32.exe', s: 'ok' },
  { t: 'blank' },
  { t: 'choice', id: 'install-method' },
  { t: 'blank' },
  { t: 'out', text: '[ INSTALL COMPLETE ] Closing cabinet...', s: 'hi' },
],
4: [
  { t: 'out', text: '// PHASE 04 - PERSIST', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'echo "reseal panel; remove reed clamp; power-cycle ATM"' },
  { t: 'out', text: 'reseal panel; remove reed clamp; power-cycle ATM', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'cat /tmp/atm-serial.log' },
  { t: 'out', text: 'BIOS POST... OK' },
  { t: 'out', text: 'Windows XP loading...' },
  { t: 'out', text: 'Winlogon: executing userinit.exe' },
  { t: 'out', text: 'Winlogon: executing svchost32.exe  <- PLOUTUS-D LOADING', s: 'warn' },
  { t: 'out', text: 'ATM service: Agilis XFS started' },
  { t: 'out', text: 'ATM UI: ready for customer', s: 'ok' },
  { t: 'blank' },
  { t: 'out', text: '# ploutus-d resident; waits on external USB keyboard', s: 'ok' },
  { t: 'blank' },
  { t: 'out', text: '[ PERSIST COMPLETE ] Mule team deploying...', s: 'hi' },
],
```

- [ ] **Step 2: Replace install-method CONTINUATIONS**

```ts
'install-method:1': [
  { t: 'cmd', text: 'lsblk | grep sdb' },
  { t: 'out', text: 'sdb  8:16  0  80G  0  disk  <- ATM HDD via USB-SATA', s: 'ok' },
  { t: 'cmd', text: 'ntfs-3g /dev/sdb1 /mnt/atm -o remove_hiberfile' },
  { t: 'out', text: 'Mounted /dev/sdb1 at /mnt/atm', s: 'ok' },
  { t: 'out', text: 'OS: Windows XP SP3 - Agilis XFS 3.20 confirmed', s: 'ok' },
  { t: 'cmd', text: 'ls /mnt/atm/Windows/System32/ | grep -iE "xfs|cdm"' },
  { t: 'out', text: 'MSXFS.dll' },
  { t: 'out', text: 'CDM_ServiceProvider.dll', s: 'ok' },
  { t: 'cmd', text: 'cp ~/ops/ploutus/payload/svchost32.exe /mnt/atm/Windows/System32/' },
  { t: 'out', text: "'svchost32.exe' -> '/mnt/atm/Windows/System32/svchost32.exe' (847360 bytes)", s: 'ok' },
  { t: 'cmd', text: 'chntpw -e /mnt/atm/Windows/System32/config/SOFTWARE' },
  { t: 'out', text: '> ed Userinit' },
  { t: 'out', text: 'userinit.exe,C:\\Windows\\System32\\svchost32.exe', s: 'ann' },
  { t: 'out', text: '[ PERSISTENCE ] Winlogon\\Userinit autorun key modified', s: 'hi' },
  { t: 'cmd', text: 'sync && umount /mnt/atm' },
  { t: 'out', text: 'umount: /mnt/atm: clean - reinstall drive in bay', s: 'ok' },
],
'install-method:2': [
  { t: 'cmd', text: 'lsusb | grep -i kingston' },
  { t: 'out', text: 'Bus 001 Device 003: ID 0951:1666 Kingston DataTraveler 32GB', s: 'ok' },
  { t: 'out', text: '# BIOS USB-first set - ATM will boot installer stick', s: 'ok' },
  { t: 'cmd', text: './ploutus-installer.sh --target ntfs --persist userinit' },
  { t: 'out', text: '[*] mounting NTFS via live OS...' },
  { t: 'out', text: '[*] payload written; Userinit patched', s: 'ok' },
  { t: 'out', text: '[ PERSISTENCE ] Winlogon\\Userinit modified', s: 'hi' },
],
'install-method:3': [
  { t: 'out', text: '# blackbox: RPi Zero W + CDM firmware shim', s: 'ann' },
  { t: 'out', text: '# splice dispenser control cable behind safe door', s: 'ok' },
  { t: 'out', text: '# inline between ATM CPU and CDM module', s: 'ok' },
  { t: 'out', text: '# intercept/replay WFSExecute CDM_DISPENSE', s: 'ok' },
  { t: 'out', text: '# no malware / no reboot / CPU never sees payload', s: 'hi' },
  { t: 'out', text: '# trigger: encrypted SMS to onboard SIM', s: 'ok' },
],
```

- [ ] **Step 3: Verify**

Exercise all three install options (reset demo between runs if needed). Phase 4 boot log still advances. No changes to `Jackpot.tsx` reducer.

- [ ] **Step 4: Commit (only if user asked)**

```bash
git add src/windows/jackpot/phaseData.ts
git commit -m "$(cat <<'EOF'
content(jackpot): rewrite phases 3-4 and install continuations

EOF
)"
```

---

### Task 9: Rewrite PHASE_LINES 5–6 (keep real-incidents coda)

**Files:**
- Modify: `src/windows/jackpot/phaseData.ts`

**Interfaces:**
- Consumes: cash counter / jackpot complete UI unchanged
- Produces: activate + jackpot session copy

- [ ] **Step 1: Replace PHASE_LINES[5] and [6]**

```ts
5: [
  { t: 'out', text: '// PHASE 05 - ACTIVATE', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'echo "mule1 on-site; USB HID keyboard attached"' },
  { t: 'out', text: 'mule1 on-site; USB HID keyboard attached', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'cat codes/today.txt' },
  { t: 'out', text: 'X9K2-M7PQ-4RNS-8WBT-C3LF-6YDV', s: 'warn' },
  { t: 'out', text: '# rotating activation code - expires 24h', s: 'warn' },
  { t: 'blank' },
  { t: 'out', text: '# code accepted - hidden operator UI unlocked', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'cat /proc/ploutus/menu' },
  { t: 'out', text: '[F1] DISPENSE CASSETTE 1   [F2] DISPENSE CASSETTE 2', s: 'ann' },
  { t: 'out', text: '[F3] DISPENSE CASSETTE 3   [F4] DISPENSE ALL CASSETTES', s: 'ann' },
  { t: 'blank' },
  { t: 'out', text: '# mule selects F4 - DISPENSE ALL CASSETTES', s: 'warn' },
  { t: 'blank' },
  { t: 'out', text: '[ ACTIVATION COMPLETE ] Initiating dispense...', s: 'hi' },
],
6: [
  { t: 'out', text: '// PHASE 06 - JACKPOT', s: 'ann' },
  { t: 'blank' },
  { t: 'cmd', text: 'dmesg | tail -n 8' },
  { t: 'out', text: 'ploutus: WFSExecute(hService, CDM_DISPENSE, pCDMDispense, 30000)', s: 'ann' },
  { t: 'out', text: 'cdm0: cassette1 $20  @100 npm - DISPENSING', s: 'ok' },
  { t: 'out', text: 'cdm0: cassette2 $50  @100 npm - DISPENSING', s: 'ok' },
  { t: 'out', text: 'cdm0: cassette3 $100 @100 npm - DISPENSING', s: 'ok' },
  { t: 'out', text: 'cdm0: cassette4 $100 @100 npm - DISPENSING', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'grep -c . /var/log/atm/txn.log || echo 0' },
  { t: 'out', text: '0', s: 'ok' },
  { t: 'out', text: '# txn records suppressed; on-machine time 11m08s', s: 'ok' },
  { t: 'blank' },
  { t: 'cmd', text: 'cat ~/ops/notes/incidents.txt' },
  { t: 'out', text: '[ REAL INCIDENTS ]', s: 'ann' },
  { t: 'out', text: 'Jan 2018: First confirmed US jackpotting - Ploutus-D, Diebold ATMs' },
  { t: 'out', text: 'Oct 2017: 100+ ATMs hit in Mexico - $100K+ per machine' },
  { t: 'out', text: '2025: FBI reports 700+ cases, $20M+ losses in US alone' },
  { t: 'out', text: 'Cobalt Group: >EUR 1B stolen globally across ATM attack types' },
],
```

- [ ] **Step 2: Optional hyphen pass on NARRATIVES**

Replace `—` with `-` in `NARRATIVES` strings for file consistency (not rendered in terminal UI).

- [ ] **Step 3: Verify**

Full run through phase 6: cash counter, lucky 7s, incidents coda, `[R]` reset still works.

```bash
rg "—" src/windows/jackpot/phaseData.ts
```

Expected: no em dashes remaining (or only if intentionally left — prefer zero).

- [ ] **Step 4: Commit (only if user asked)**

```bash
git add src/windows/jackpot/phaseData.ts
git commit -m "$(cat <<'EOF'
content(jackpot): rewrite phases 5-6 terminal session copy

EOF
)"
```

---

### Task 10: Final build + acceptance sweep

**Files:**
- Verify only (fix unused imports if `tsc` fails)

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: `tsc -b` + `vite build` succeed with no unused-local errors.

- [ ] **Step 2: Acceptance checklist (manual at `/jackpot`)**

1. Brand reds brighter on ATM + JACKPOT title  
2. No threat-actor metadata in header  
3. Prompt is `root@kali:~/ops/ploutus#` in Courier New, no emoji  
4. No LIVE badge in title bar  
5. Phase banners read `// PHASE 0N - NAME`  
6. Choices still interactive (1/2/3)  
7. Commands return immediately (typewriter OK)  
8. Build passes  

- [ ] **Step 3: Grep sanity**

```bash
rg "#c01e35|#d42244|#e04060|#8a1225|#5a0e1c" src/windows/Jackpot.tsx src/windows/jackpot
rg "THREAT ACTOR|Share Tech Mono" src/windows/Jackpot.tsx src/windows/jackpot/TerminalPanel.tsx
rg "PHASE 0[0-9] —" src/windows/jackpot/phaseData.ts
```

Expected: no matches (AlarmOverlay may still mention Share Tech Mono — out of scope).

- [ ] **Step 4: Commit fixes only if build required code changes and user asked**

---

## Spec coverage self-review

| Spec section | Task(s) |
|--------------|---------|
| §1 Brighter red palette | 1, 2, 3 |
| §2 Header cleanup | 4 |
| §3 Terminal chrome (title, font, prompt, cursor, colors, banner) | 5, 6 |
| §4 Session content rewrite | 7, 8, 9 |
| §6 Acceptance criteria | 10 |
| Non-goals (no CRT, no emoji, no logic, no Credits rename) | Global Constraints |

No `types.ts` / `cwd` task (YAGNI). AlarmOverlay Share Tech Mono left out of scope per spec.
