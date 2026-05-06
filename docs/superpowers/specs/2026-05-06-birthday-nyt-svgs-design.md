# Design: Birthday App Overhaul + NYT Game SVGs
**Date:** 2026-05-06

---

## Scope

Two independent changes in one implementation pass:

1. **NYT Game SVGs** — Replace emoji icons for Connections, Crossword Mini, and Spelling Bee in the `GameMenu` component with proper inline SVGs matching the NYT app aesthetic.
2. **Birthday App Overhaul** — Rewrite `Birthdays.tsx` from a form/list layout to a full monthly calendar with popup-based birthday entry, month navigation, and per-cell name display.

---

## 1. NYT Game SVGs

### Location
`src/windows/NYTGames.tsx` — the `tiles` array inside `GameMenu`.

### What changes
The three emoji values (`'🔗'`, `'✏️'`, `'🐝'`) are replaced with inline SVG ReactNodes. Wordle already has an SVG — this brings the other three up to parity.

### SVG Designs

**Connections** (~33×33px viewBox)
- 4×4 grid of rounded squares (rx=1.5), 4 rows of 4 columns
- Row colors: yellow `#f9df6d`, green `#a0c35a`, blue `#b0c4ef`, purple `#ba81c5`
- Gap of 2px between squares, each square 6×6px
- Mirrors the NYT Connections color-tier system

**Crossword Mini** (~33×33px viewBox)
- 5×5 grid, cell size 6px, 1px gap
- Black cells at positions matching puzzle #1 from the file: (1,1), (1,3), (3,1), (3,3)
- White cells for all others, gray border `#808080`
- Small number `1` in top-left of first across/down start cell

**Spelling Bee** (~33×33px viewBox)
- 7 hexagons arranged as honeycomb (1 center + 6 outer at 60° intervals)
- Center hex: yellow `#f7da21`, outer hexes: light gray `#e6e6e6`
- Hex radius ~8px, gap between hexes ~1px
- Matches the honeycomb layout already rendered in `SpellingBeeGame`

### No other changes
Game logic, puzzle data, and scoring are untouched.

---

## 2. Birthday App Overhaul

### Icon change
- `public/icons/mccake.svg` is actually a WebP binary. Rename to `public/icons/mccake.webp`.
- Add `mccake: '/icons/mccake.webp'` to `PNG_ICONS` in `src/components/Icons/Icons.tsx`.
- Change `icon: 'cake'` → `icon: 'mccake'` in both the `ICONS` and `WINDOWS` arrays in `Desktop.tsx`.

### Data layer
`useBirthdays` hook and Firebase integration are unchanged. The hook already provides `entries`, `loading`, `addBirthday(name, month, day, year?)`, and `deleteBirthday(id)`.

### Component: `Birthdays.tsx` (full rewrite)

#### State
| Variable | Type | Purpose |
|---|---|---|
| `viewMonth` | `number` (1–12) | Which month the calendar is showing |
| `viewYear` | `number` | Which year the calendar is showing |
| `popup` | `{ month: number, day: number } \| null` | Currently-open date cell |
| `popupName` | `string` | Controlled input inside popup |
| `popupYearStr` | `string` | Controlled year input inside popup |
| `popupError` | `string` | Validation error inside popup |
| `adding` | `boolean` | Async submit in-flight guard |

Initial `viewMonth`/`viewYear` = current month/year from `new Date()`.

#### Layout (top to bottom)

1. **Month navigation header**
   - `[<]  May 2026  [>]` — Win95 raised-border buttons, bold centered month+year label
   - Today's date in small text on the right (`"Today: May 6"`)

2. **Day-name row**
   - 7 equal columns: `Sun Mon Tue Wed Thu Fri Sat`
   - Small bold text, `var(--win-gray)` background, bottom border

3. **Calendar grid**
   - Computes first weekday of month to determine offset
   - 5 or 6 rows of 7 cells
   - Each cell:
     - Date number top-left, 10px, gray for out-of-month days
     - Birthday names stacked in 9px text, truncated with `...` after 2 names if more exist
     - Yellow-tint background (`#fffde7`) if has birthdays
     - Blue border (`#0000cc`) if today
     - Cursor pointer on hover
     - `onClick` → sets `popup` to `{ month: viewMonth, day: cellDay }`

4. **Upcoming strip** (fixed ~44px, sunken border)
   - Label `"Upcoming:"` then up to 3 next birthdays: `"Name (Mon DD, Xd)"`
   - If none upcoming, shows `"No upcoming birthdays"`
   - Uses same `daysUntil` helper from current code

#### Popup dialog
- `position: absolute`, centered over the Birthdays window container
- Dark overlay behind it (`rgba(0,0,0,0.3)`)
- Win95 titlebar: `"Add Birthday — Mon DD"`
- Existing birthdays on that date listed above the form, each with a `[Delete]` button
- Form: `Name:` text input (autofocus) + `Born:` number input (optional, 1900–currentYear)
- Buttons: `[Add]` (Enter key) and `[Cancel]` (Escape key)
- Error message in red if name blank on submit
- Clicking the overlay dismisses the popup

#### No emojis
The current code uses `'\u{1F382} Today!'` — replace with `"* Today!"` or `"Today!"` plain text.

---

## Files Changed

| File | Change |
|---|---|
| `public/icons/mccake.svg` | Rename to `mccake.webp` |
| `src/components/Icons/Icons.tsx` | Add `mccake` entry to `PNG_ICONS` |
| `src/components/Desktop/Desktop.tsx` | `icon: 'cake'` → `icon: 'mccake'` (×2) |
| `src/windows/Birthdays.tsx` | Full rewrite to calendar layout |
| `src/windows/NYTGames.tsx` | Replace 3 emoji with SVG ReactNodes in `GameMenu.tiles` |

No new files. No new hooks. No Firebase changes.

---

## Constraints

- `noUnusedLocals` / `noUnusedParameters` — all imports and variables must be used
- No emojis anywhere in output
- Win95 CSS vars throughout (`--win-gray`, `--win-btn-hilight`, etc.)
- Build must pass `tsc -b && vite build`
