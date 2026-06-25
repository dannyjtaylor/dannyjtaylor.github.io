# Jackpot — Design Spec
**Date:** 2026-06-24  
**Status:** Awaiting user approval  
**Scope:** Two independent deliverables in one PR

---

## 1. AOL Chat Message-Ordering Fix

### Problem
Firebase push keys are generated **client-side** using the local system clock. If two users send messages close together but their clocks differ by even 100ms, the user with the ahead clock generates a lexicographically larger push key — making their message appear later in the sort — even if their message arrived second at the server.

### Fix
Sort messages by the `timestamp` field (written via `serverTimestamp()`, resolved server-side and therefore authoritative) instead of by push key. Fall back to push-key comparison only if both timestamps are null (the brief window before the server resolves the sentinel).

**File:** `src/hooks/useMultiplayerChat.ts`, lines 134–135  
**Change:** Replace `.sort(([keyA], [keyB]) => keyA.localeCompare(keyB))` with:
```ts
.sort(([keyA, dataA], [keyB, dataB]) => {
  const tsA = (dataA as Record<string, unknown>).timestamp as number | null;
  const tsB = (dataB as Record<string, unknown>).timestamp as number | null;
  if (tsA != null && tsB != null) return tsA - tsB;
  if (tsA != null) return -1;
  if (tsB != null) return 1;
  return keyA.localeCompare(keyB);
})
```

No other files change. Build impact: zero.

---

## 2. Jackpot Program — Interactive ATM Jackpotting Demo

### Overview
A standalone interactive demo designed for a 300-person cybersecurity workshop. Lives inside the existing Win95 desktop as a new window application. The window's interior is a full dark-theme cyberpunk experience — not Win95-styled. Keyboard-driven (SPACE to advance type-on animation), with branching tool-selection at critical phases that can trigger a full alarm/police failure state.

### Accuracy Basis
Content sourced from: Kaspersky Securelist, Mandiant/Google, Secret Service 2018 advisory, EUROPOL ATM malware whitepaper, FBI 2025/2026 incident reports.

- **Malware:** Ploutus-D (Dimboa), targets Diebold Opteva via Kalignite/Agilis XFS layer
- **Persistence:** `Winlogon\Userinit` registry key injection
- **Physical tools:** Diebold generic T-bar key, USB-SATA hard drive bridge, ethernet loopback plug, magnetic reed-switch clamp for alarm bypass
- **Black box variant:** Attacker device wired directly to the cash dispenser's control cable — bypasses the ATM CPU entirely, no malware needed
- **Activation:** External keyboard + 24-character rotating code (valid 24 hrs), generated server-side by the operator
- **Dispense rate:** 100+ notes/minute (Ploutus-D on Opteva AFD cassette)
- **Real incidents:** Jan 2018 US debut; 700+ cases in 2025 per FBI; Cobalt Group responsible for >€1B in losses

---

### Desktop Integration

| Item | Value |
|---|---|
| Window ID | `jackpot` |
| Icon ID | `icon-jackpot` |
| Icon label | `Jackpot.exe` |
| Icon asset | Inline SVG (pixelated lucky 7) — no external file needed |
| Default size | 1000 × 680 |
| Default position | 60, 20 |
| Win95 menu | None (full-screen content, no file/edit menus) |

The Lucky 7 SVG icon (pixelated, ~32×32) is defined inline in Desktop.tsx's icon render path. Same pixel-art style as the mockup.

---

### Visual Design

**Color palette:**
- Background: `#060606`
- Terminal green: `#00e639`
- Alert red: `#ff0033`
- Warning amber: `#ff9900`
- Info blue: `#4488ff`
- Gold (cash): `#ffd700`
- Font: `'Share Tech Mono', 'Courier New', monospace` (loaded via Google Fonts)

**Layout (fixed, 3 rows):**
```
┌──────────────────────────────────────────────────────┐
│  HEADER: Lucky7 logo | JACKPOT glitch title | meta   │
├──┬──┬──┬──┬──┬──┬───────────────────────────────────┤
│01│02│03│04│05│06│  PHASE BAR (active phase pulses)   │
├────────────────────────┬─────────────────────────────┤
│                        │                             │
│   ATTACKER TERMINAL    │     ANIMATED ATM SVG        │
│   (55% width)          │     (45% width)             │
│                        │                             │
├────────────────────────┴─────────────────────────────┤
│  [SPACE] Next  [B] Back  [R] Reset  │ narrative │ ph │
└──────────────────────────────────────────────────────┘
```

---

### ATM SVG — Progressive Reveal

The ATM SVG is a single `<svg>` element whose child elements are shown/hidden via CSS classes driven by React state. The ATM starts fully assembled and is progressively "opened up" as the attack advances.

**Layer groups (all present in DOM, toggled via opacity/transform):**
1. `atm-body` — cabinet, screen, keypad, slots (always visible)
2. `atm-panel-closed` — top-hat panel flush, with bolts (visible until Phase 2)
3. `atm-panel-open` — panel tilted open at hinge, revealing internal cavity (Phase 2+)
4. `atm-internals` — hard drive bay, motherboard outline, USB port, power cables (Phase 2+, reveals progressively)
5. `atm-hdd-present` — hard drive seated in bay (Phase 1–2, disappears in Phase 3A)
6. `atm-hdd-removed` — drive ejected, lifted above bay with orange arrow (Phase 3A)
7. `atm-laptop` — attacker's laptop in corner with green shell glow (Phase 3)
8. `atm-usb-cable` — USB-SATA cable from drive to laptop (Phase 3A)
9. `atm-blackbox` — Raspberry Pi–style device wired to dispenser cable (Phase 3B alt path)
10. `atm-eth-loopback` — loopback plug in network port, cut cable (Phase 2 if correct choice)
11. `atm-eth-live` — ethernet cable intact, glowing amber (Phase 2 if wrong choice)
12. `atm-panel-closing` — panel swinging shut animation (Phase 4)
13. `atm-screen-reboot` — screen flash sequence (Phase 4)
14. `atm-screen-active` — hidden Ploutus UI glowing on screen (Phase 5)
15. `atm-keyboard-ext` — external USB keyboard attached externally (Phase 5)
16. `atm-cash-bills` — animated bill SVGs flying out of dispenser slot (Phase 6)
17. `atm-cassette-cutaway` — X-ray overlay showing cassette emptying (Phase 6)

CSS animations used: `transform: rotate()` for panel hinge, `translateY` for drive eject, `translateX` + `opacity` for cash bills, `animation: flicker` for screen reboot.

---

### Phase Definitions

#### Phase 01 — RECON
**Terminal lines:** Intelligence gathering — ATM model identification, camera blind spot scouting, generic key purchase, coordinator contact.  
**ATM state:** Fully assembled, normal. Subtle "observed" vignette effect (crosshair overlay fades in/out).  
**No tool choice.** SPACE advances each terminal line.

#### Phase 02 — BREACH
**Terminal:** Attacker in disguise, approaching ATM.  
**Tool Choice A — Panel Access** (keyboard: `1` / `2` / `3`):
- `[1] Diebold T-bar generic key` → CORRECT — panel opens animation, hinge rotates
- `[2] Drill + pry` → WRONG — loud noise, triggers vibration sensor alarm → ALARM STATE
- `[3] Social engineering (fake maintenance)` → RISKY but valid path with extra delay

**Tool Choice B — Ethernet/Logging** (mandatory second choice after A):
- `[1] Cut cable + insert loopback plug` → CORRECT — eth-loopback layer appears, red X on cable
- `[2] Cut cable only` → PARTIAL — logs still buffered; SIEM fires later in Phase 5 → delayed ALARM
- `[3] Leave cable intact` → WRONG — logs live; SIEM alert fires when malware runs in Phase 4 → ALARM

**Tool Choice C — Alarm Sensor**:
- `[1] Magnetic reed-switch clamp` → CORRECT — bypasses door-open sensor
- `[2] Cut the sensor wire` → WRONG — tamper alarm fires → ALARM STATE

**ATM state:** Panel cracks open on success, internal cavity revealed, appropriate cable state set.

#### Phase 03 — INSTALL
**Tool Choice — Method**:
- `[1] Remove HDD + USB-SATA bridge` → Classic Ploutus-D path — detailed terminal sequence, drive eject animation
- `[2] USB boot device` → Faster install path, different terminal (no drive removal)
- `[3] Black box (no malware)` → Skips Phases 4 & 5, jumps directly to Phase 6 — connects cable to dispenser directly

**Terminal:** Reflects chosen path with accurate commands (ntfs-3g, chntpw for option 1; dd + live boot for option 2; no terminal commands for option 3 — just hardware).  
**ATM:** Corresponding hardware animation.

#### Phase 04 — PERSIST
**No choice.** Type-on shows drive reinstalled, panel closing animation, ATM screen flicker/reboot sequence. Malware icon subtly appears on ATM screen (hidden service, labeled `svchost32`).  
*If ethernet choice was "leave intact" → SIEM alarm fires here.*

#### Phase 05 — ACTIVATE
**No choice.** Money mule appears (simplified silhouette SVG). External keyboard attached. 24-character activation code typed on-screen (each character types out). ATM hidden UI reveals with cassette selection menu.  
*If ethernet choice was "cut only" → delayed SIEM alert fires here.*

#### Phase 06 — JACKPOT
Cash bills (pixelated SVG rectangles in green/grey tones, no emoji) animate flying out of the dispenser slot in rapid sequence. Running dollar counter increments: `$0 → $212,000`. Cassette cutaway X-ray shows the cassette depleting. Lucky 7 slot machine animation plays in terminal panel. Phase bar all green.

---

### Alarm / Failure State

Triggered by any wrong tool selection or leaving ethernet live.

**Visual:**
- Full-screen overlay: alternating red (`#ff0033`) and blue (`#0044ff`) flashing at 2Hz
- Two police car SVGs (pixelated, no emoji) slide in from left and right edges
- Alert banner: `ALERT — BANK SIEM TRIGGERED — ATM TAMPER DETECTED — POLICE DISPATCHED`
- Terminal freezes, then shows: `Connection terminated. Session logged.`

**Audio (Web Audio API — no files):**
- Wailing siren: two oscillators alternating between 800 Hz and 1200 Hz on a 0.5s cycle, sawtooth wave
- Plays for 3 seconds then fades

**Recovery:**
- `[R]` or `[ENTER]` resets to start of current phase (tool re-selection available)
- On-screen prompt: `[ RESET ] Try again?`

---

### Sound Design (Web Audio API — zero external files)

| Event | Type | Params |
|---|---|---|
| Terminal keypress | Short sine click | 1200Hz, 10ms, gain 0.05 |
| Phase advance | Soft chord | 440+550Hz, 200ms, gain 0.1 |
| Tool select correct | Rising chirp | 600→900Hz, 150ms |
| Tool select wrong | Descending buzz | 300→100Hz, 400ms |
| Alarm siren | Alternating saw | 800↔1200Hz, 0.5s cycle, 3s |
| Cash dispensing | Rapid clicks | 200Hz pulses, 50ms each, rate increases |
| Jackpot win | 3-note jingle | 523+659+784Hz (C-E-G), 600ms |

All sounds are opt-out (muted if `AudioContext` is blocked by browser autoplay policy).

---

### State Machine

```
IDLE
  └─ SPACE ──► RECON (typing)
                  └─ SPACE (all lines done) ──► BREACH (tool choices)
                                                    ├─ wrong tool ──► ALARM ──► R ──► BREACH
                                                    └─ all correct ──► INSTALL (tool choice)
                                                                          ├─ blackbox ──► JACKPOT (skip 4&5)
                                                                          └─ other ──► PERSIST ──► ACTIVATE ──► JACKPOT
JACKPOT ──► R ──► IDLE
```

---

### File Changes

| File | Change |
|---|---|
| `src/hooks/useMultiplayerChat.ts` | Sort by serverTimestamp with push-key fallback |
| `src/windows/Jackpot.tsx` | New file — full interactive demo component |
| `src/components/Desktop/Desktop.tsx` | Add `jackpot` to ICONS, WINDOWS, WINDOW_CONTENT; add import |
| `public/icons/jackpot.svg` | Pixelated lucky 7 SVG (32×32, matches mockup style) |

No new npm dependencies. Web Audio API and SVG animations are native browser APIs.

---

### Out of Scope
- No backend, no Firebase, no data persistence
- No real malware code of any kind (all commands are illustrative strings)
- No audio files (all sound via Web Audio API)
- Mobile/responsive layout (presentation context = desktop/projector)
