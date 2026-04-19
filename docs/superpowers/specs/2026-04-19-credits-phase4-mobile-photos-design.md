# Credits — Phase 4 Redesign & Mobile Photos

**Date:** 2026-04-19  
**Status:** Approved

---

## Overview

Two coordinated changes to the Credits page:

1. **Last Goodbye game** — Remove Phase 7 (spinning spokes) and replace Phase 4 (vertical rain) with an alternating vertical + horizontal rain pattern.
2. **Credits roll** — Make section photos visible on mobile via an inline interleaved layout (Option Y).

---

## Part 1 — Last Goodbye Game

### 1a. Remove Phase 7 (Spokes)

**Delete entirely:**
- `spawnSpinningWheels()` function (~100 lines)
- Constants: `P7_DRIFT_SPEED_FRAC`, `P7_ROT_SPEED`
- `action: 5` orbit movement block in the update loop
- `action: 5` culling branch in the projectile filter
- Spoke-protection logic in the projectile hard cap (simplifies to a plain `slice`)
- `orbitCx`, `orbitCy`, `orbitR`, `orbitAngle`, `orbitSpeed` fields from `Projectile` interface and `mkProj` defaults
- `phase7End` variable
- `if (idx < phase7End) return 7` branch in `getPhase()`
- Phase 7 case in `getSpawnInterval()`

**Budget reallocation:**
```
phase4End = Math.floor(totalNames * 0.82)   // was 0.68
```
Phase 4 absorbs Phase 7's old name budget. Phase 6 (fast aimed spreads) continues to cover the final 18% of names.

**Updated phase sequence:**
| Phase | Name range | Pattern |
|---|---|---|
| 0 | 0–7% | Aimed spreads |
| 2 | 7–29% | Crossing streams |
| 3 | 29–53% | Corridor |
| 4 | 53–82% | Alternating vertical + horizontal rain (redesigned) |
| 6 | 82–100% | Fast aimed spreads |

---

### 1b. Phase 4 Redesign — Alternating Vertical + Horizontal Rain

#### New state variables (scoped inside the `useEffect` game loop)

```typescript
let p4SubPhase: 'vertical' | 'horizontal' = 'vertical';
let p4SubPhaseTimer  = 0;   // seconds elapsed in current sub-phase
let p4SubPhaseCount  = 0;   // number of sub-phases completed
let p4HorizDirection = 1;   // +1 = L→R, -1 = R→L; flips each horizontal pass
let p4HorizBatchTimer = 0;  // seconds since last horizontal batch spawn
```

Reset all of these when `getPhase()` first returns 4 (phase transition into Phase 4).

#### Tuning constants

```typescript
const P4_VERT_DURATION      = isMobileDevice ? 2.8 : 3.5;  // s per vertical sub-phase
const P4_HORIZ_DURATION     = isMobileDevice ? 2.2 : 3.0;  // s per horizontal sub-phase
const P4_MAX_SUBPHASES      = isMobileDevice ? 4  : 6;     // total sub-phases cap
const P4_HORIZ_BATCH_SIZE   = isMobileDevice ? 5  : 8;     // names per horiz batch
const P4_HORIZ_BATCH_RATE   = 0.9;                         // s between horiz batches
const P4_HORIZ_SPEED_FRAC   = 0.50;                        // vx = W × this
```

(Existing vertical rain constants `P4_FALL_SPEED_FRAC`, `P4_NAME_V_GAP`, etc. are unchanged.)

#### Vertical sub-phase

Same wall-column spawning machinery as the current Phase 4, with one modification:

**Left-align names** (first letter flush at column's left edge):
```typescript
// Before:  x: col.x - tw / 2
// After:
x: col.x
```

`cy` and `col.topY` calculations remain the same (the name's center-y is still used for `cy`; only the x position changes).

When `p4SubPhaseTimer >= P4_VERT_DURATION`:
- Set `wallColumns = null`
- Switch `p4SubPhase = 'horizontal'`
- Reset `p4SubPhaseTimer = 0`, `p4HorizBatchTimer = 0`
- Spawn the first horizontal batch immediately (don't wait for `P4_HORIZ_BATCH_RATE`)
- Increment `p4SubPhaseCount`

#### Horizontal sub-phase

Spawn names flying horizontally across the screen in evenly-spaced rows:

```typescript
const spawnHorizBatch = () => {
  if (nameIdx >= phase4End) return;
  const w = W(), h = H();
  const speed = w * P4_HORIZ_SPEED_FRAC * p4HorizDirection;
  const startX = p4HorizDirection > 0 ? -300 : w + 300;
  for (let i = 0; i < P4_HORIZ_BATCH_SIZE; i++) {
    const name = nextName();
    if (!name) return;
    const { tw, th } = measureName(name);
    // Spread evenly from 10% to 90% of screen height, ±20px jitter
    const yFrac = 0.10 + 0.80 * (i / (P4_HORIZ_BATCH_SIZE - 1));
    const y = h * yFrac + (Math.random() - 0.5) * 40;
    projectiles.push(mkProj({
      id: nextProjId++, text: name,
      x: startX, y: y - th / 2,
      vx: speed, w: tw, h: th,
      // angle: 0 — no rotation, text reads naturally
    }));
  }
};
```

While `p4SubPhaseTimer < P4_HORIZ_DURATION`:
- Tick `p4HorizBatchTimer += dt`
- When `p4HorizBatchTimer >= P4_HORIZ_BATCH_RATE`: spawn a batch, reset timer

When `p4SubPhaseTimer >= P4_HORIZ_DURATION`:
- Flip `p4HorizDirection *= -1`
- Switch `p4SubPhase = 'vertical'`
- Reset `p4SubPhaseTimer = 0`, `wallColumns = null`, `wallSpawnTimer = 0`, `wallSpawnInterval = 0`
- Increment `p4SubPhaseCount`

#### Cap and drain

When `p4SubPhaseCount >= P4_MAX_SUBPHASES`: stop spawning new names. Let existing projectiles exit the screen naturally. `getPhase()` will eventually return 6 as `nameIdx` advances past `phase4End`.

#### Phase 4 update logic (replaces the current `else if (currentPhase === 4)` block)

```
if p4SubPhase === 'vertical':
  if wallColumns is null: initWallColumns()
  updateWalls(dt)
  p4SubPhaseTimer += dt
  if p4SubPhaseTimer >= P4_VERT_DURATION:
    → switch to horizontal (see above)
else: // horizontal
  tick p4HorizBatchTimer, spawn batches
  p4SubPhaseTimer += dt
  if p4SubPhaseTimer >= P4_HORIZ_DURATION:
    → switch to vertical (see above)
```

---

## Part 2 — Credits Roll: Mobile Photos (Option Y)

### Problem

`leftPhotos` / `rightPhotos` are displayed in side columns that are hidden via `display: none` at ≤900px, so mobile users see no photos at all.

### Solution

Render two parallel layouts in the center column, toggled by a CSS breakpoint:

- **Desktop (>900px):** Current behavior unchanged — side columns visible, names in single/two-column grid.
- **Mobile (≤900px):** Side columns remain hidden. A new mobile layout interleaves photos inline with name groups inside the center column.

### CSS additions (`Credits.module.css`)

```css
/* Desktop names — hidden on mobile */
.desktopNames {
  display: block;
}

/* Mobile names with inline photos — hidden on desktop */
.mobileNames {
  display: none;
}

/* Flex row: [photo 42%] + [names flex:1], or reversed */
.mobilePhotoGroup {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  text-align: left;
}
.mobilePhotoGroupReverse {
  flex-direction: row-reverse;
  text-align: right;
}

.mobileGroupPhoto {
  width: 42%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.mobileGroupNames {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 900px) {
  .desktopNames { display: none; }
  .mobileNames  { display: block; }
}
```

### JSX changes (`Credits.tsx`)

In the credits roll render, within each section's center column, replace the existing name render block:

**Before:**
```jsx
{useTwoCol ? (
  <div className={styles.twoColumnNames}>{nameEntries}</div>
) : (
  nameEntries
)}
```

**After:**
```jsx
{/* Desktop layout — unchanged */}
<div className={styles.desktopNames}>
  {useTwoCol ? (
    <div className={styles.twoColumnNames}>{nameEntries}</div>
  ) : (
    nameEntries
  )}
</div>

{/* Mobile layout — photos interleaved inline */}
<div className={styles.mobileNames}>
  {buildMobileLayout(section)}
</div>
```

### `buildMobileLayout` algorithm

```typescript
const MOBILE_GROUP_SIZE = 3;  // names per photo group

function buildMobileLayout(section: CreditSection): React.ReactNode[] {
  const photoPool = [
    ...(section.leftPhotos ?? []),
    ...(section.rightPhotos ?? []),
  ];
  const result: React.ReactNode[] = [];
  let photoIdx = 0;

  for (let i = 0; i < section.entries.length; i += MOBILE_GROUP_SIZE) {
    const group = section.entries.slice(i, i + MOBILE_GROUP_SIZE);
    const photo = photoPool[photoIdx];
    const isLeft = photoIdx % 2 === 0;

    const isMemorial = section.title === 'In Memory Of';
    const nameNodes = group.map((entry) => (
      <div key={`${section.title}-${entry.name}`}>
        <div className={isMemorial ? styles.memorialName : styles.name}>{entry.name}</div>
        {entry.role && <div className={styles.role}>{entry.role}</div>}
        {entry.needsLastName && <div className={styles.placeholder}>[INSERT LAST NAME]</div>}
      </div>
    ));

    if (photo) {
      result.push(
        <div
          key={`group-${i}`}
          className={`${styles.mobilePhotoGroup} ${!isLeft ? styles.mobilePhotoGroupReverse : ''}`}
        >
          <img className={styles.mobileGroupPhoto} src={`/credits-photos/${photo}`} alt="" />
          <div className={styles.mobileGroupNames}>{nameNodes}</div>
        </div>
      );
      photoIdx++;
    } else {
      result.push(<div key={`group-${i}`}>{nameNodes}</div>);
    }
  }

  return result;
}
```

Sections with no `leftPhotos` or `rightPhotos` produce an empty pool → all groups fall through to the plain `nameNodes` path → layout identical to desktop.

---

## Constraints & Edge Cases

- **Horizontal batch with 1 remaining name:** `nextName()` returns `''` early — `spawnHorizBatch` checks `if (!name) return` and stops gracefully.
- **Phase 4 ends mid-sub-phase:** `nameIdx >= phase4End` check inside `spawnHorizBatch` and `spawnOneNameInColumn` prevents over-spending.
- **Mobile photo groups with <3 remaining entries:** `slice` returns a shorter array naturally — no special handling needed.
- **Sections with more photos than groups:** Extra photos are simply not shown on mobile (pool may run out of groups to pair with). This is acceptable — the most important photos appear first.
- **`In Memory Of` section:** Has no leftPhotos/rightPhotos — renders identically on mobile and desktop.
- **TypeScript:** After removing orbit fields from `Projectile`, `mkProj` default values for those fields are removed too. Any reference to `p.orbitCx` etc. must be deleted.
