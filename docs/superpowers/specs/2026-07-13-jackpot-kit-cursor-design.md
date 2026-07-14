# Jackpot Kit Folder + Terminal Cursor — Design Spec

**Date:** 2026-07-13  
**Status:** Approved — implemented  
**Scope:** Cold-start sandbox paths, cwd-aware prologue matchers, and in-buffer caret editing in the Jackpot terminal

## Goal

Make the cold-start laptop feel like a real shell: edit the current line with arrow keys, `ls` / `cd` into the operator kit from home, and run bootstrap from inside that directory. Rename the kit folder from `drop` → `kit` and update the cheat sheet / phase copy to match.

## Non-goals

- Full readline (Ctrl+A/E, word jumps, reverse-i-search)
- Preserving a draft line when browsing Up/Down history (caret still jumps to end on history replace)
- Accepting `sudo bootstrap.sh` without `./` (`.` is not on PATH)
- Renaming unrelated English “drop” (payload drop, network drop cable, CSS `drop-shadow`)
- Root-tier filesystem expansion beyond the current post-bootstrap handoff

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Kit folder name | `kit` (`/home/danny/kit`) |
| Approach | Cwd-aware path resolution for prologue `ls` / bootstrap + in-buffer `cursorIndex` |
| Bootstrap after `cd kit` | `sudo ./bootstrap.sh` (and path-equivalent forms) |
| Plain `ls` at home | Lists home (shows `kit/`) but does **not** advance the scripted `ls` beat unless the listing target is the kit dir |
| Plain `ls` inside kit | Advances the scripted `ls` beat |
| Missing `./` on bootstrap | Still fails (`command not found`) |

---

## 1. Rename `drop` → `kit`

### Filesystem (`sandboxFs.ts`)

- Directory key: `drop` → `kit`
- Contents unchanged: `bootstrap.sh`, `.oprc`, `tools/…`
- Bootstrap script echo that says “verifying drop signature” may keep “drop” as signature jargon, or become “kit signature” — prefer **kit signature** for consistency with the folder name
- Internal comments / `cd ~/drop` strings in script contents → `~/kit`

### Prologue / phase / guide copy

Update every user-facing path that meant the kit folder:

| Was | Becomes |
|-----|---------|
| `~/drop` | `~/kit` |
| `./drop/bootstrap.sh` | `./kit/bootstrap.sh` (from home) or `./bootstrap.sh` (from kit) |
| cheat sheet “kit folder” / “drop/tools bag” | `~/kit` / `kit/tools` |

Keep verb “drop” when it means install/payload placement (e.g. “drop svchost32.exe”).

Touch at least: `sandboxFs.ts`, `phaseData.ts`, `cheatSheetData.ts`, and any cold-start design docs that still say `~/drop` if referenced by runtime (runtime source of truth is the TS files).

---

## 2. Cwd-aware prologue matchers

Today `matchesPrologueLs` / `matchesPrologueBootstrap` use fixed whole-command strings and ignore cwd. That blocks:

```text
cd kit
ls
sudo ./bootstrap.sh
```

### `ls` beat

Advance when the effective listing target resolves to `/home/danny/kit`, including:

- `ls ~/kit`, `ls kit`, `ls -la ~/kit`, etc. (from home)
- `ls`, `ls .`, `ls -la` while `cwd === /home/danny/kit`

Do **not** advance on bare `ls` while still in `/home/danny` (that only lists home).

Implementation sketch: parse optional flags (`-l`, `-la`, `-al`, …), resolve the path argument (default `.`) with `resolvePath(cwd, pathArg)`, compare to `/home/danny/kit`.

### Bootstrap beat

Advance when the executable path resolves to `/home/danny/kit/bootstrap.sh`, with optional leading `sudo`.

Accepted examples:

- From home: `sudo ./kit/bootstrap.sh`, `sudo ~/kit/bootstrap.sh`, `sudo /home/danny/kit/bootstrap.sh`
- From kit: `sudo ./bootstrap.sh`, `sudo /home/danny/kit/bootstrap.sh`
- Demo forgiveness (existing): `./kit/bootstrap.sh` / `./bootstrap.sh` without sudo still OK if path resolves correctly

Rejected (realistic):

- `sudo bootstrap.sh` (no path / not on PATH)
- Wrong paths (`sudo ./drop/bootstrap.sh` after rename)

Export `resolvePath` (or a small helper) if matchers need it outside the private module scope.

Sandbox `sudo` handler should not swallow a successful prologue match before handoff — keep current acceptCommand / matchesPrologueBootstrap call order; only the matcher logic changes.

---

## 3. In-buffer caret (← / →)

### State

Add `cursorIndex: number` to `GameState` (and any checkpoint snapshot that stores `inputBuffer`).

Invariants:

- `0 <= cursorIndex <= inputBuffer.length`
- After any full-line replace (history Up/Down, Tab complete, clear): `cursorIndex = inputBuffer.length`
- On `TERM_TYPE` / paste: insert at `cursorIndex`, then advance index by inserted length
- On Backspace: if `cursorIndex > 0`, delete char before caret and decrement
- ArrowLeft / ArrowRight: move index by 1 (clamped)
- Home / End: `0` / `length`
- Delete: delete char at caret if any

### Rendering (`TerminalPanel.tsx`)

When showing the live input line:

```text
[prompt]{buffer.slice(0, cursorIndex)}█{buffer.slice(cursorIndex)}
```

Blinking block stays the caret (not an extra trailing cursor after the whole string).

### Input routing (`Jackpot.tsx`)

Handle `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Delete` in the terminal-focus keydown path (same gate as typing). Do not steal these keys while ATM-focused.

---

## 4. Cheat sheet / phase guide

Phase 1 cold-start instructions should teach the natural flow:

1. `ls` (see home, notice `kit/`) — optional; not required to advance
2. `cd kit` (or `cd ~/kit`)
3. `ls` — advances scripted beat / unlocks OUTPUT
4. `sudo ./bootstrap.sh` — escalates

Also keep the one-liner shortcuts documented: `ls ~/kit` and `sudo ~/kit/bootstrap.sh` from home.

Update token breakdowns in `cheatSheetData.ts` to match the new commands and meanings.

---

## 5. Out of scope leftovers

- Old cold-start design mentioning `README.txt` / `loot/` stays historical unless we reopen that feature
- No change to ATM visuals or police / choice logic

## Test plan

- [ ] From `/home/danny`, type mid-line with ←/→, Backspace, Delete, Home/End
- [ ] History Up/Down replaces line; caret at end
- [ ] `ls` at home lists `kit/` but does not hand off / advance prologue ls beat alone
- [ ] `cd kit` then `ls` advances prologue ls beat
- [ ] `cd kit` then `sudo ./bootstrap.sh` escalates to root
- [ ] From home, `sudo ./kit/bootstrap.sh` still works
- [ ] `sudo bootstrap.sh` (no `./`) does not escalate
- [ ] Cheat sheet shows `kit` paths and the `cd` flow
- [ ] `npx tsc -b` clean
