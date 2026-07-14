# Jackpot Kit + Cursor Implementation Plan

> **For agentic workers:** Required habit: after each task, mark it complete in this plan. Spec: `docs/superpowers/specs/2026-07-13-jackpot-kit-cursor-design.md`. Do not commit unless the user asks.

**Goal:** Rename `~/drop` → `~/kit`, cwd-aware prologue `ls`/bootstrap, left/right caret editing, update cheat sheet.

**Files:**
- `src/windows/jackpot/types.ts` — `cursorIndex` on state + checkpoint
- `src/windows/jackpot/sandboxFs.ts` — rename dir, export `resolvePath`, cwd-aware matchers
- `src/windows/jackpot/phaseData.ts` — expected cmds / bootstrap output copy
- `src/windows/jackpot/cheatSheetData.ts` — guide cmds
- `src/windows/Jackpot.tsx` — cursor actions + matcher cwd args
- `src/windows/jackpot/TerminalPanel.tsx` — render caret mid-line

## Task 1: Rename FS + cwd-aware matchers
## Task 2: cursorIndex + key handlers + TerminalPanel
## Task 3: phaseData + cheatSheetData
## Task 4: `npx tsc -b` + spot-check

No separate test runner; verify with `tsc -b`.
