# Credits Phase 4 Redesign & Mobile Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the spokes phase from Last Goodbye, replace Phase 4 with alternating vertical+horizontal rain, and make credits roll photos visible on mobile via inline interleaving.

**Architecture:** All changes are in two files — `src/pages/Credits.tsx` (game engine + JSX) and `src/pages/Credits.module.css` (new mobile layout classes). Game changes are self-contained inside the `AttackGame` component's `useEffect`. Mobile photo changes add a parallel render path toggled by a CSS breakpoint.

**Tech Stack:** React 19, TypeScript, CSS Modules, Canvas 2D API

---

## File Map

| File | Change |
|---|---|
| `src/pages/Credits.tsx` | Remove Phase 7 code; redesign Phase 4; add `buildMobileLayout`; update JSX render |
| `src/pages/Credits.module.css` | Add `.desktopNames`, `.mobileNames`, `.mobilePhotoGroup`, `.mobilePhotoGroupReverse`, `.mobileGroupPhoto`, `.mobileGroupNames` |

---

### Task 1: Remove Phase 7 (Spokes) — Interface & Constants

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Remove orbit fields from `Projectile` interface (~line 566)**

Remove these 5 lines from the interface:
```typescript
// DELETE these lines:
  orbitCx: number;
  orbitCy: number;
  orbitR: number;
  orbitAngle: number;
  orbitSpeed: number;
```

- [ ] **Step 2: Remove orbit defaults from `mkProj` (~line 666)**

The `mkProj` return object currently has:
```typescript
orbitCx: 0, orbitCy: 0, orbitR: 0, orbitAngle: 0, orbitSpeed: 0, slideT: 0,
```
Change to:
```typescript
slideT: 0,
```

- [ ] **Step 3: Remove Phase 7 tuning constants (~line 883)**

Delete:
```typescript
    // Ph7 — Spinning Wheels
    const P7_DRIFT_SPEED_FRAC    = 0.065; // drift speed = W × this
    const P7_ROT_SPEED           = 1.5;   // radians/sec rotation
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Remove Phase 7 spokes: interface and constants cleanup"
```

---

### Task 2: Remove Phase 7 — Phase Thresholds & Routing

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Extend `phase4End` and remove `phase7End` (~line 899)**

Find:
```typescript
    const phase4End = Math.floor(totalNames * 0.68);
    const phase7End = Math.floor(totalNames * 0.82);
```
Replace with:
```typescript
    const phase4End = Math.floor(totalNames * 0.82);
```

- [ ] **Step 2: Update `getPhase()` (~line 905)**

Find:
```typescript
    const getPhase = (idx: number): number => {
      if (idx < phase0End) return 0;  // Aimed spreads
      if (idx < phase2End) return 2;  // Crossing streams
      if (idx < phase3End) return 3;  // Corridor
      if (idx < phase4End) return 4;  // Vertical rain
      if (idx < phase7End) return 7;  // Spinning wheels
      return 6;                       // Fast aimed spreads
    };
```
Replace with:
```typescript
    const getPhase = (idx: number): number => {
      if (idx < phase0End) return 0;  // Aimed spreads
      if (idx < phase2End) return 2;  // Crossing streams
      if (idx < phase3End) return 3;  // Corridor
      if (idx < phase4End) return 4;  // Alternating rain
      return 6;                       // Fast aimed spreads
    };
```

- [ ] **Step 3: Update `getSpawnInterval()` (~line 1381)**

Find and delete:
```typescript
        case 7: base = 4.5; break;   // Spinning wheels (fewer, fuller spokes)
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Remove Phase 7: update phase thresholds and routing"
```

---

### Task 3: Remove Phase 7 — Function & Game Loop References

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Delete `spawnSpinningWheels()` function**

Find and delete the entire function from:
```typescript
    /* ── Phase 7: Spinning Wheels — two rotating spoke-wheels from opposite sides ── */
    const spawnSpinningWheels = () => {
```
through the closing `};` of that function (~90 lines, ends around line 1327).

- [ ] **Step 2: Remove `spokesStillAlive` check (~line 1664)**

Find:
```typescript
          /* Wait for transition delay before spawning new phase.
             Phase 6 also waits for all spinning wheel spokes to exit. */
          const spokesStillAlive = currentPhase === 6 && projectiles.some(p => p.action === 5);
          if (phaseTransitionDelay > 0) {
            phaseTransitionDelay -= dt;
          } else if (spokesStillAlive) {
            /* Hold phase 6 spawning until spokes are gone */
          } else if (currentPhase === 3 && !corridorActive) {
```
Replace with:
```typescript
          if (phaseTransitionDelay > 0) {
            phaseTransitionDelay -= dt;
          } else if (currentPhase === 3 && !corridorActive) {
```

- [ ] **Step 3: Remove Phase 7 spawn call from the switch (~line 1696)**

Find and delete:
```typescript
                case 7:
                  spawnSpinningWheels();
                  phaseRound++;
                  break;
```

- [ ] **Step 4: Remove `action: 5` movement block (~line 1786)**

Find and delete:
```typescript
        } else if (p.action === 5) {
          /* Spinning wheel spoke — orbit around moving center */
          p.orbitCx += p.vx * dt;
          p.orbitAngle += p.orbitSpeed * dt;
          p.x = p.orbitCx + Math.cos(p.orbitAngle) * p.orbitR - p.w / 2;
          p.y = p.orbitCy + Math.sin(p.orbitAngle) * p.orbitR - p.h / 2;
          p.angle = p.orbitAngle;
        } else if (p.action === 6) {
```
Replace with:
```typescript
        } else if (p.action === 6) {
```

- [ ] **Step 5: Remove `action: 5` culling block (~line 1813)**

Find and delete:
```typescript
        if (p.action === 5) {
          /* Spinning-wheel spokes: cull when the entire wheel (center ± its max
             spoke extent) is fully off screen. The wheel spawns at cx ≈ ±2R, so
             use the largest possible spoke reach (spokeRadius) as the margin —
             this guarantees every spoke (6 on mobile, 8 on desktop) survives the initial off-screen entry
             regardless of name length. */
          const entryMargin = Math.max(260, W() * 0.35);
          return p.orbitCx > -entryMargin - p.orbitR && p.orbitCx < w + entryMargin + p.orbitR;
        }
```

- [ ] **Step 6: Simplify projectile hard cap (~line 1831)**

Find:
```typescript
      if (projectiles.length > MAX_PROJECTILES) {
        const spokes = projectiles.filter(p => p.action === 5);
        const others = projectiles.filter(p => p.action !== 5);
        const keepOthers = Math.max(0, MAX_PROJECTILES - spokes.length);
        projectiles = [...others.slice(others.length - keepOthers), ...spokes];
      }
```
Replace with:
```typescript
      if (projectiles.length > MAX_PROJECTILES) {
        projectiles = projectiles.slice(projectiles.length - MAX_PROJECTILES);
      }
```

- [ ] **Step 7: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Remove Phase 7: delete spawnSpinningWheels and all action:5 references"
```

---

### Task 4: Phase 4 Redesign — State, Constants & Helpers

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Add Phase 4 sub-phase constants after existing P4 constants (~line 882)**

After the existing `P4_SPAWN_INTERVAL_MAX` and `P4_INITIAL_SEED_*` lines, add:

```typescript
    // Ph4 — Sub-phase alternation (vertical ↔ horizontal)
    const P4_VERT_DURATION      = isMobileDevice ? 2.8 : 3.5;  // s per vertical sub-phase
    const P4_HORIZ_DURATION     = isMobileDevice ? 2.2 : 3.0;  // s per horizontal sub-phase
    const P4_MAX_SUBPHASES      = isMobileDevice ? 4  : 6;     // total sub-phases before drain
    const P4_HORIZ_BATCH_SIZE   = isMobileDevice ? 5  : 8;     // names per horizontal batch
    const P4_HORIZ_BATCH_RATE   = 0.9;                         // s between horizontal batches
    const P4_HORIZ_SPEED_FRAC   = 0.50;                        // vx = W × this
```

- [ ] **Step 2: Add sub-phase state variables near game state section (~line 827, after `let wallSpawnInterval = 0;`)**

After `let wallSpawnInterval = 0;`, add:
```typescript
    /* Phase 4 alternating sub-phase state */
    let p4SubPhase: 'vertical' | 'horizontal' = 'vertical';
    let p4SubPhaseTimer  = 0;   // s elapsed in current sub-phase
    let p4SubPhaseCount  = 0;   // completed sub-phases
    let p4HorizDirection = 1;   // +1 = L→R, -1 = R→L
    let p4HorizBatchTimer = 0;  // s since last horizontal batch spawn
```

- [ ] **Step 3: Left-align names in `spawnOneNameInColumn` (~line 1150)**

Find:
```typescript
      projectiles.push(mkProj({
        id: nextProjId++, text: name,
        x: col.x - tw / 2,
        y: cy - th / 2,
        vy,
        w: tw, h: th,
        angle: Math.PI / 2, // 90° CW — text reads top→bottom on screen
        action: 6,          // reuse "straight-fall" movement + cull path
      }));
```
Replace with:
```typescript
      projectiles.push(mkProj({
        id: nextProjId++, text: name,
        x: col.x,           // left-align: first letter at column x
        y: cy - th / 2,
        vy,
        w: tw, h: th,
        angle: Math.PI / 2, // 90° CW — text reads top→bottom on screen
        action: 6,          // reuse "straight-fall" movement + cull path
      }));
```

- [ ] **Step 4: Add `spawnHorizBatch` function after `updateWalls` function (~line 1233)**

Add after the closing `};` of `updateWalls`:
```typescript
    /* ── Phase 4 horizontal sub-phase: batch of names flying across screen ── */
    const spawnHorizBatch = () => {
      if (nameIdx >= phase4End) return;
      const w = W(), h = H();
      const speed = w * P4_HORIZ_SPEED_FRAC * p4HorizDirection;
      const startX = p4HorizDirection > 0 ? -300 : w + 300;
      const count = P4_HORIZ_BATCH_SIZE;
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        /* Spread evenly from 10%–90% of screen height, ±20px jitter */
        const yFrac = 0.10 + 0.80 * (i / Math.max(1, count - 1));
        const y = h * yFrac + (Math.random() - 0.5) * 40;
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: startX, y: y - th / 2,
          vx: speed, w: tw, h: th,
          /* angle: 0 — no rotation, text reads naturally */
        }));
      }
    };
```

- [ ] **Step 5: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Phase 4 redesign: add sub-phase state, constants, spawnHorizBatch, left-align columns"
```

---

### Task 5: Phase 4 Redesign — Game Loop Update

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Reset Phase 4 sub-phase state on phase entry**

Find the phase transition block (~line 1652):
```typescript
          if (newPhase !== currentPhase) {
            /* Tear down phase-specific state when leaving a phase. */
            if (currentPhase === 4 && newPhase !== 4) wallColumns = null;
            currentPhase = newPhase;
            phaseTimer = 0;
            phaseRound = 0;
            phaseTransitionDelay = PHASE_TRANSITION_DURATION;
          }
```
Replace with:
```typescript
          if (newPhase !== currentPhase) {
            /* Tear down phase-specific state when leaving a phase. */
            if (currentPhase === 4 && newPhase !== 4) wallColumns = null;
            currentPhase = newPhase;
            phaseTimer = 0;
            phaseRound = 0;
            phaseTransitionDelay = PHASE_TRANSITION_DURATION;
            /* Reset Phase 4 sub-phase state on entry */
            if (newPhase === 4) {
              p4SubPhase = 'vertical';
              p4SubPhaseTimer = 0;
              p4SubPhaseCount = 0;
              p4HorizDirection = 1;
              p4HorizBatchTimer = 0;
            }
          }
```

- [ ] **Step 2: Replace Phase 4 update block in the game loop**

Find:
```typescript
          } else if (currentPhase === 4) {
            /* Falling walls: init on entry, continuously top up each frame. */
            if (!wallColumns) initWallColumns();
            updateWalls(dt);
          } else if (currentPhase !== 3) {
```
Replace with:
```typescript
          } else if (currentPhase === 4) {
            /* Alternating vertical + horizontal rain sub-phases */
            if (p4SubPhaseCount < P4_MAX_SUBPHASES && nameIdx < phase4End) {
              if (p4SubPhase === 'vertical') {
                if (!wallColumns) initWallColumns();
                updateWalls(dt);
                p4SubPhaseTimer += dt;
                if (p4SubPhaseTimer >= P4_VERT_DURATION) {
                  /* Switch to horizontal */
                  wallColumns = null;
                  p4SubPhase = 'horizontal';
                  p4SubPhaseTimer = 0;
                  p4HorizBatchTimer = 0;
                  p4SubPhaseCount++;
                  spawnHorizBatch(); /* first batch immediately */
                }
              } else {
                /* Horizontal sub-phase */
                p4HorizBatchTimer += dt;
                if (p4HorizBatchTimer >= P4_HORIZ_BATCH_RATE) {
                  p4HorizBatchTimer = 0;
                  spawnHorizBatch();
                }
                p4SubPhaseTimer += dt;
                if (p4SubPhaseTimer >= P4_HORIZ_DURATION) {
                  /* Switch back to vertical */
                  p4HorizDirection *= -1;
                  p4SubPhase = 'vertical';
                  p4SubPhaseTimer = 0;
                  p4SubPhaseCount++;
                  wallColumns = null;
                  wallSpawnTimer = 0;
                  wallSpawnInterval = 0;
                }
              }
            }
            /* After cap: drain existing projectiles — no new spawns */
          } else if (currentPhase !== 3) {
```

- [ ] **Step 3: Verify build compiles**
```bash
npm run build 2>&1 | head -40
```
Expected: no TypeScript errors related to `orbitCx`, `orbitCy`, `orbitR`, `orbitAngle`, `orbitSpeed`, `phase7End`, `spawnSpinningWheels`, or `spokesStillAlive`.

- [ ] **Step 4: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Phase 4 redesign: alternating vertical/horizontal rain with sub-phase timer"
```

---

### Task 6: Credits Roll — Mobile CSS

**Files:**
- Modify: `src/pages/Credits.module.css`

- [ ] **Step 1: Add mobile layout classes before the `/* Responsive — Mobile */` block**

Find the comment `/* ═══════════════════════════════════════════` before `Responsive — Mobile` and insert the new classes immediately before it:

```css
/* ═══════════════════════════════════════════
   Mobile Inline Photo Layout
   ═══════════════════════════════════════════ */

/* Desktop names — hidden on mobile */
.desktopNames {
  display: block;
}

/* Mobile names with inline photos — hidden on desktop */
.mobileNames {
  display: none;
}

/* Flex row: photo (42%) + names (flex:1), reversed for right-side photos */
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
```

- [ ] **Step 2: Add breakpoint rules to the existing `@media (max-width: 900px)` block**

Inside the existing `@media (max-width: 900px)` block (which already has `.sectionGrid { display: block; }` and `.sideColLeft, .sideColRight { display: none; }`), add:
```css
  .desktopNames { display: none; }
  .mobileNames  { display: block; }
```

- [ ] **Step 3: Commit**
```bash
git add src/pages/Credits.module.css
git commit -m "Add mobile inline photo layout CSS classes"
```

---

### Task 7: Credits Roll — Mobile JSX & `buildMobileLayout`

**Files:**
- Modify: `src/pages/Credits.tsx`

- [ ] **Step 1: Add `MOBILE_GROUP_SIZE` constant near `TWO_COL_THRESHOLD` (~line 559)**

Find:
```typescript
const TWO_COL_THRESHOLD = 10;
```
Add after it:
```typescript
const MOBILE_GROUP_SIZE = 3;  // names per inline photo group on mobile
```

- [ ] **Step 2: Add `buildMobileLayout` helper inside the `Credits` component function, before the render helpers section (~line 2338)**

Find the comment:
```typescript
  /* ═══════════════════════════════════════════
     Render helpers
     ═══════════════════════════════════════════ */
```
Insert before it:
```typescript
  /* ── Mobile layout: photos interleaved with name groups ── */
  const buildMobileLayout = (section: CreditSection) => {
    const photoPool = [
      ...(section.leftPhotos ?? []),
      ...(section.rightPhotos ?? []),
    ];
    const result: React.ReactNode[] = [];
    let photoIdx = 0;
    const isMemorial = section.title === 'In Memory Of';

    for (let i = 0; i < section.entries.length; i += MOBILE_GROUP_SIZE) {
      const group = section.entries.slice(i, i + MOBILE_GROUP_SIZE);
      const photo = photoPool[photoIdx];
      const isLeft = photoIdx % 2 === 0;

      const nameNodes = group.map((entry) => (
        <div key={`${section.title}-${entry.name}-mob`}>
          <div className={isMemorial ? styles.memorialName : styles.name}>
            {entry.name}
          </div>
          {entry.role && <div className={styles.role}>{entry.role}</div>}
          {entry.needsLastName && (
            <div className={styles.placeholder}>[INSERT LAST NAME]</div>
          )}
        </div>
      ));

      if (photo) {
        result.push(
          <div
            key={`mob-group-${i}`}
            className={`${styles.mobilePhotoGroup}${!isLeft ? ` ${styles.mobilePhotoGroupReverse}` : ''}`}
          >
            <img
              className={styles.mobileGroupPhoto}
              src={`/credits-photos/${photo}`}
              alt=""
            />
            <div className={styles.mobileGroupNames}>{nameNodes}</div>
          </div>
        );
        photoIdx++;
      } else {
        result.push(
          <div key={`mob-group-${i}`}>{nameNodes}</div>
        );
      }
    }

    return result;
  };

```

- [ ] **Step 3: Update the section render in the Credits JSX (~line 2525)**

Find:
```tsx
                  {useTwoCol ? (
                    <div className={styles.twoColumnNames}>{nameEntries}</div>
                  ) : (
                    nameEntries
                  )}
```
Replace with:
```tsx
                  {/* Desktop layout */}
                  <div className={styles.desktopNames}>
                    {useTwoCol ? (
                      <div className={styles.twoColumnNames}>{nameEntries}</div>
                    ) : (
                      nameEntries
                    )}
                  </div>

                  {/* Mobile layout — photos interleaved with name groups */}
                  <div className={styles.mobileNames}>
                    {buildMobileLayout(section)}
                  </div>
```

- [ ] **Step 4: Verify build compiles with no errors**
```bash
npm run build 2>&1 | head -40
```
Expected: clean build, 0 TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add src/pages/Credits.tsx
git commit -m "Add mobile inline photo layout to credits roll"
```

---

## Self-Review

**Spec coverage:**
- [x] Remove Phase 7 (spokes) — Tasks 1, 2, 3
- [x] Extend phase4End to 0.82 — Task 2
- [x] Left-align vertical rain names — Task 4 Step 3
- [x] Phase 4 sub-phase state/constants — Task 4 Steps 1–2
- [x] `spawnHorizBatch` function — Task 4 Step 4
- [x] Phase 4 game loop alternation — Task 5 Steps 1–2
- [x] Mobile CSS classes — Task 6
- [x] `buildMobileLayout` helper — Task 7 Step 2
- [x] Mobile JSX integration — Task 7 Step 3

**No placeholders:** All steps have exact code. ✓

**Type consistency:** `p4SubPhase`, `p4SubPhaseTimer`, `p4SubPhaseCount`, `p4HorizDirection`, `p4HorizBatchTimer` declared in Task 4 and used in Task 5. `spawnHorizBatch` declared in Task 4, called in Task 5. `buildMobileLayout` declared in Task 7 Step 2, called in Task 7 Step 3. `MOBILE_GROUP_SIZE` declared in Task 7 Step 1, used in `buildMobileLayout`. ✓
