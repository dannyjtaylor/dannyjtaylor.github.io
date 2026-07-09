# Jackpot Terminal Polish — Design Spec

**Date:** 2026-07-09  
**Status:** Approved for planning  
**Scope:** Visual + content polish of the Jackpot ATM training demo (`/jackpot`)

## Goal

Make the Jackpot demo feel brighter and more like a real Kali Linux terminal session, while keeping the interactive training structure (phase banners, choice prompts, 6-phase flow).

## Non-goals

- No CRT / scanline / phosphor effects
- No emoji in prompts or UI
- No fake package-install waits or progress bars — demo pacing stays instant
- No changes to game logic (reducer, choice outcomes, police timer, ATM visual state machine)
- No rename of Credits-page "Wells Fargo" employment entry
- No new fonts beyond Courier New (drop Share Tech Mono references in Jackpot UI)

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Terminal aesthetic | A — modern Kali / real terminal (not CRT) |
| Red brightness | B — noticeably brighter / punchier bank red |
| Content depth | B+C hybrid — realistic cmd/out rewrite, instant results |
| Approach | Chrome + content rewrite |
| Prompt style | Classic `root@kali:~/path#` (no skull, no twoline box art) |
| Font | Courier New only |
| Phase banners | Keep cyberpunk `// PHASE 01 - RECON` style (hyphen, not em dash) |
| Choice prompts | Keep interactive choice UI as-is in structure |

---

## 1. Brighter red palette

Replace the WELSH PHARGO / brand red family everywhere it appears in Jackpot files.

| Role | Current | New |
|------|---------|-----|
| Primary | `#c01e35` | `#e8203a` |
| Highlight (bevel / logo) | `#d42244`, `#e04060` | `#ff3d5a`, `#ff6b7a` |
| Shadow / border | `#8a1225`, `#5a0e1c` | `#a81428`, `#6e1020` |
| Logo tint bg | `#fff0f2` | keep or slight warm adjust if needed |

**Apply in:**

- `src/windows/Jackpot.tsx` — title, logo SVG, phase-bar active tab, WELSH PHARGO signage, glitch keyframes
- `src/windows/jackpot/AtmSvg.tsx` — cabinet body, bevels, service panel, related shadows
- `src/windows/jackpot/TerminalPanel.tsx` — pixelated 7 SVG fills / glow filters

Gold accents (`#ffcd11`, `#c9990a`, `#8a6800`, `#ffd700`) stay unchanged.

Alarm overlay reds (`#ff2244`, `#ff1133`, etc.) are separate cyberpunk/alarm colors — leave unless they look inconsistent after the brand-red bump.

---

## 2. Header cleanup

In `Jackpot.tsx` header (light chrome bar):

**Remove** the entire top-right metadata stack:

- `THREAT ACTOR: Cobalt Group (APT)`
- `MALWARE: Ploutus-D / Dimboa (XFS)`
- `TARGET: Diebold Opteva 740`
- `CLASSIFICATION: Training Use Only`

**Keep** left side: pixel logo SVG + `JACKPOT` title (with updated reds).

Header layout becomes left-aligned content only (no `space-between` right column). Padding/height may tighten slightly so the bar does not look empty.

---

## 3. Terminal chrome

### Title bar (`Jackpot.tsx`)

- Text: `root@kali: ~/ops/ploutus`
- Remove `● LIVE` badge
- Keep traffic-light dots
- Slightly darker GNOME-terminal-style bar (`#1e1e1e` / border `#2d2d2d` range)

### Body (`TerminalPanel.tsx`)

- Background: `#0c0c0c` (near-black terminal)
- Font: `"Courier New", Courier, monospace` everywhere in Jackpot terminal UI (including cash counter / prompts that currently reference Share Tech Mono)
- Root Jackpot container font family updated to match

### Prompt rendering

Command lines currently render as:

```
$ <command>
```

Change to classic Kali/BackTrack-style prompt:

```
root@kali:~/ops/ploutus# <command>
```

Visual styling:

- `root@kali` — red (`#ff5555` or similar ANSI bright red)
- `:` — default/dim
- `~/ops/ploutus` — blue (`#5555ff` / `#5c7cfa` range)
- `#` — red
- Command text — light gray / near-white (`#e0e0e0`)

Optional: allow a future `cwd` field on cmd lines; **v1 hardcodes** `~/ops/ploutus` for all prompts (YAGNI unless a phase clearly needs a path change — if so, a simple optional `cwd?: string` on `{ t: 'cmd' }` is acceptable).

### Cursor

Replace thin `borderRight` caret with a block cursor character `█` (or solid block span) blinking via existing blink keyframes.

### Output colors (ANSI-ish, keep style keys)

| Style key | Role | Target feel |
|-----------|------|-------------|
| default | normal stdout | light gray `#cccccc` |
| `ok` | success / green | `#33ff66` or similar |
| `warn` | warning | `#ffaa00` (keep) |
| `err` | error | `#ff5555` |
| `hi` | highlight banner | white + left accent (keep structure) |
| `ann` | announcement / phase | muted red/pink cyberpunk (keep cyberpunk banners) |

### Banner

Keep PLOUTUS ASCII art. Restyle toward a normal tool banner (dim gray/white), not heavy neon pink — phase `ann` lines remain the cyberpunk accent.

### Choice UI

Keep interactive choice boxes, prompts, and `1/2/3` keyboard selection. Do not redesign into plain bash menus. Minor color tuning allowed so panels sit better on `#0c0c0c`, but structure stays.

---

## 4. Session content rewrite (`phaseData.ts`)

### Keep

- Six phases and labels (RECON → JACKPOT)
- All choice IDs and branching outcomes
- Interactive choice prompts and option labels (wording may get light polish only if needed for clarity)
- Cyberpunk phase banners: `// PHASE 01 - RECON` (use ASCII hyphen `-`, not em dash `—`)
- Highlight completion lines like `[ RECON COMPLETE ] ...` (hyphenate em dashes in surrounding copy where touched)
- Real-incidents coda at end of phase 6 (training value)
- Instant command results — no simulated apt/npm waits

### Change

Rewrite `cmd` / `out` lines (and continuations) so they read like a live Kali session:

- Prefer realistic tool output shapes (`nmap` tables, `curl` JSON, `lsblk`, `mount`, `cp`, `chntpw`, serial/boot log snippets)
- Keep story beats and facts (Opteva 740, XP SP3, XFS, loopback, Ploutus-D, mule code, dispense amounts)
- Replace em dashes with hyphens in rewritten strings for consistency
- Continuations after choices should look like tool/operator output, not slide decks

### Example flavor (illustrative, not final copy)

```
// PHASE 01 - RECON

root@kali:~/ops/ploutus# nmap -sV -p8080 192.168.1.0/24
Nmap scan report for 192.168.1.47
PORT     STATE SERVICE VERSION
8080/tcp open  http    Agilis ATM XFS 3.20
...
```

---

## 5. Files to touch

| File | Changes |
|------|---------|
| `src/windows/Jackpot.tsx` | Red palette, remove metadata header, title bar text, root font/bg |
| `src/windows/jackpot/TerminalPanel.tsx` | Prompt render, cursor, colors, font, banner tone, reds in 7s |
| `src/windows/jackpot/AtmSvg.tsx` | Brighter cabinet reds/shadows |
| `src/windows/jackpot/phaseData.ts` | Content rewrite; hyphenate phase banners; realistic cmd/out |
| `src/windows/jackpot/types.ts` | Only if optional `cwd` on `cmd` is implemented |

No new CSS modules required (Jackpot remains inline styles).

---

## 6. Acceptance criteria

1. Brand red on ATM + JACKPOT title reads clearly brighter than before.
2. Top-right threat-actor metadata is gone.
3. Terminal shows `root@kali:~/ops/ploutus#` prompts in Courier New with no emoji.
4. No LIVE badge in the terminal title bar.
5. Phase banners still read `// PHASE 0N - NAME` with a single hyphen.
6. Choice prompts remain interactive (keyboard 1/2/3).
7. Commands return immediately; demo pacing unchanged in feel (typewriter may remain).
8. `npm run build` passes (`tsc -b` with no unused locals).

## 7. Out of scope follow-ups

- Path changes per phase (`cwd` field) if not needed for v1
- Alarm overlay palette retune
- Credits page Wells Fargo rename
- Loading Share Tech Mono / JetBrains Mono globally
