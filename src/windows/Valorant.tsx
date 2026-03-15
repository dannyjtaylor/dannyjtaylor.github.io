import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Weapon Data ── */
interface Weapon {
  name: string;
  cost: number;
  damage: number;
  fireRate: number; // ms between shots
  category: string;
}

const WEAPONS: Record<string, Weapon[]> = {
  Sidearms: [
    { name: 'Classic', cost: 0, damage: 12, fireRate: 400, category: 'Sidearms' },
    { name: 'Shorty', cost: 150, damage: 24, fireRate: 600, category: 'Sidearms' },
    { name: 'Ghost', cost: 500, damage: 18, fireRate: 350, category: 'Sidearms' },
    { name: 'Sheriff', cost: 800, damage: 40, fireRate: 700, category: 'Sidearms' },
  ],
  SMGs: [
    { name: 'Stinger', cost: 1100, damage: 14, fireRate: 150, category: 'SMGs' },
    { name: 'Spectre', cost: 1600, damage: 18, fireRate: 200, category: 'SMGs' },
  ],
  Shotguns: [
    { name: 'Bucky', cost: 850, damage: 44, fireRate: 800, category: 'Shotguns' },
    { name: 'Judge', cost: 1850, damage: 34, fireRate: 350, category: 'Shotguns' },
  ],
  Rifles: [
    { name: 'Bulldog', cost: 2050, damage: 22, fireRate: 200, category: 'Rifles' },
    { name: 'Guardian', cost: 2250, damage: 33, fireRate: 400, category: 'Rifles' },
    { name: 'Phantom', cost: 2900, damage: 28, fireRate: 180, category: 'Rifles' },
    { name: 'Vandal', cost: 2900, damage: 32, fireRate: 200, category: 'Rifles' },
  ],
  Snipers: [
    { name: 'Marshal', cost: 950, damage: 55, fireRate: 1200, category: 'Snipers' },
    { name: 'Operator', cost: 4700, damage: 127, fireRate: 2000, category: 'Snipers' },
  ],
  Heavy: [
    { name: 'Ares', cost: 1550, damage: 16, fireRate: 130, category: 'Heavy' },
    { name: 'Odin', cost: 3200, damage: 19, fireRate: 100, category: 'Heavy' },
  ],
};

const CATEGORIES = Object.keys(WEAPONS);

/* ── Enemy Data ── */
interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  dir: number;
  color: string;
}

const ENEMY_COLORS = ['#FD4556', '#00FFDF', '#FFD700', '#FF69B4', '#90FFFC'];

type Phase = 'buy' | 'combat' | 'roundEnd';

export function Valorant() {
  const [credits, setCredits] = useState(4000);
  const [weapon, setWeapon] = useState<Weapon>(WEAPONS['Sidearms']![0]!);
  const [shield, setShield] = useState(0);
  const [selectedCat, setSelectedCat] = useState('Sidearms');
  const [phase, setPhase] = useState<Phase>('buy');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [kills, setKills] = useState(0);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [muzzleFlash, setMuzzleFlash] = useState<{ x: number; y: number } | null>(null);
  const [hitMarker, setHitMarker] = useState<{ x: number; y: number } | null>(null);
  const canShootRef = useRef(true);
  const arenaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);

  /* ── Spawn enemies ── */
  const spawnEnemies = useCallback(() => {
    const count = Math.min(3 + round, 8);
    const spawned: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      spawned.push({
        id: Date.now() + i,
        x: 20 + Math.random() * 260,
        y: 20 + Math.random() * 140,
        hp: 30 + round * 10,
        maxHp: 30 + round * 10,
        speed: 0.3 + Math.random() * 0.4,
        dir: Math.random() * Math.PI * 2,
        color: ENEMY_COLORS[i % ENEMY_COLORS.length]!,
      });
    }
    setEnemies(spawned);
    setKills(0);
  }, [round]);

  /* ── Enemy movement loop ── */
  useEffect(() => {
    if (phase !== 'combat') return;

    const step = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setEnemies((prev) =>
        prev.map((e) => {
          let nx = e.x + Math.cos(e.dir) * e.speed * dt * 0.06;
          let ny = e.y + Math.sin(e.dir) * e.speed * dt * 0.06;
          let nd = e.dir;
          if (nx < 5 || nx > 290) { nd = Math.PI - nd; nx = Math.max(5, Math.min(290, nx)); }
          if (ny < 5 || ny > 170) { nd = -nd; ny = Math.max(5, Math.min(170, ny)); }
          if (Math.random() < 0.005) nd += (Math.random() - 0.5) * 1.5;
          return { ...e, x: nx, y: ny, dir: nd };
        }),
      );

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = 0;
    };
  }, [phase]);

  /* ── Check round end ── */
  useEffect(() => {
    if (phase === 'combat' && enemies.length > 0 && enemies.every((e) => e.hp <= 0)) {
      setTimeout(() => {
        setPhase('roundEnd');
      }, 400);
    }
  }, [enemies, phase]);

  /* ── Shoot ── */
  const handleShoot = useCallback(
    (e: React.MouseEvent) => {
      if (phase !== 'combat' || !canShootRef.current) return;
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      canShootRef.current = false;
      setMuzzleFlash({ x: mx, y: my });
      setTimeout(() => setMuzzleFlash(null), 80);
      setTimeout(() => { canShootRef.current = true; }, weapon.fireRate);

      // Hit detection
      setEnemies((prev) => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          const en = updated[i]!;
          if (en.hp <= 0) continue;
          const dx = mx - en.x;
          const dy = my - en.y;
          if (Math.abs(dx) < 18 && Math.abs(dy) < 22) {
            const dmg = weapon.damage + Math.floor(Math.random() * 5);
            const actualDmg = Math.max(0, dmg - (shield > 0 ? 0 : 0));
            updated[i] = { ...en, hp: Math.max(0, en.hp - actualDmg) };
            setHitMarker({ x: mx, y: my });
            setTimeout(() => setHitMarker(null), 150);
            if (updated[i]!.hp <= 0) {
              setScore((s) => s + 100 + round * 25);
              setKills((k) => k + 1);
            }
            break;
          }
        }
        return updated;
      });
    },
    [phase, weapon, round, shield],
  );

  /* ── Buy weapon ── */
  const buyWeapon = (w: Weapon) => {
    if (w.cost > credits) return;
    setCredits((c) => c - w.cost + (weapon.cost > 0 ? Math.floor(weapon.cost * 0.5) : 0));
    setWeapon(w);
  };

  /* ── Buy shield ── */
  const buyShield = (level: number, cost: number) => {
    if (cost > credits || shield >= level) return;
    setCredits((c) => c - cost);
    setShield(level);
  };

  /* ── Start round ── */
  const startCombat = () => {
    spawnEnemies();
    setPhase('combat');
  };

  /* ── Next round ── */
  const nextRound = () => {
    setRound((r) => r + 1);
    setCredits((c) => c + 2000 + kills * 200);
    setShield(0);
    setPhase('buy');
  };

  /* ── Styles ── */
  const S: Record<string, React.CSSProperties> = {
    root: { width: '100%', height: '100%', background: '#0F1923', color: '#FFFBF5', fontFamily: 'var(--font-system)', fontSize: 11, display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none' },
    topBar: { display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#1A2733', borderBottom: '1px solid #2A3A4A' },
    credits: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
    main: { flex: 1, display: 'flex', overflow: 'hidden' },
    catList: { width: 80, background: '#13202D', borderRight: '1px solid #2A3A4A', overflowY: 'auto' as const },
    catBtn: { width: '100%', padding: '6px 6px', background: 'transparent', border: 'none', color: '#8899AA', fontSize: 10, fontFamily: 'var(--font-system)', cursor: 'pointer', textAlign: 'left' as const },
    catBtnActive: { background: '#FD4556', color: '#fff' },
    weaponList: { flex: 1, padding: 6, overflowY: 'auto' as const },
    weaponRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', marginBottom: 2, cursor: 'pointer', borderLeft: '2px solid transparent' },
    weaponRowHover: { background: '#1A2733', borderLeft: '2px solid #FD4556' },
    weaponActive: { background: '#2A1520', borderLeft: '2px solid #FD4556' },
    weaponName: { fontWeight: 'bold' },
    weaponCost: { color: '#FFD700', fontSize: 10 },
    weaponFree: { color: '#4CAF50', fontSize: 10 },
    rightPanel: { width: 110, background: '#13202D', borderLeft: '1px solid #2A3A4A', padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 6 },
    shieldBtn: { padding: '4px 6px', background: '#1A2733', border: '1px solid #2A3A4A', color: '#8899AA', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-system)' },
    shieldBtnActive: { borderColor: '#00FFDF', color: '#00FFDF' },
    goBtn: { marginTop: 'auto', padding: '8px 0', background: '#FD4556', border: 'none', color: '#fff', fontSize: 12, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-system)' },
    arena: { flex: 1, position: 'relative' as const, background: '#0a1018', cursor: 'crosshair', overflow: 'hidden' },
    combatTop: { display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#1A2733', fontSize: 10 },
    roundEnd: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 12 },
  };

  /* ── BUY PHASE ── */
  if (phase === 'buy') {
    return (
      <div style={S.root}>
        <div style={S.topBar}>
          <span>ROUND {round}</span>
          <span style={S.credits}>{credits} CREDS</span>
          <span>SCORE: {score}</span>
        </div>
        <div style={S.main}>
          {/* Categories */}
          <div style={S.catList}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                style={{ ...S.catBtn, ...(selectedCat === cat ? S.catBtnActive : {}) }}
                onClick={() => setSelectedCat(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #2A3A4A', margin: '4px 0' }} />
            <div style={{ padding: '4px 6px', color: '#8899AA', fontSize: 9 }}>SHIELDS</div>
            <button
              style={{ ...S.shieldBtn, ...(shield >= 25 ? S.shieldBtnActive : {}), width: '100%', borderRadius: 0 }}
              onClick={() => buyShield(25, 400)}
            >
              Light 25 — 400
            </button>
            <button
              style={{ ...S.shieldBtn, ...(shield >= 50 ? S.shieldBtnActive : {}), width: '100%', borderRadius: 0 }}
              onClick={() => buyShield(50, 1000)}
            >
              Heavy 50 — 1000
            </button>
          </div>

          {/* Weapon list */}
          <div style={S.weaponList}>
            <div style={{ marginBottom: 8, color: '#FD4556', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }}>
              {selectedCat}
            </div>
            {WEAPONS[selectedCat]?.map((w) => {
              const isEquipped = weapon.name === w.name;
              const canAfford = w.cost <= credits || w.cost === 0;
              return (
                <div
                  key={w.name}
                  style={{
                    ...S.weaponRow,
                    ...(isEquipped ? S.weaponActive : {}),
                    opacity: canAfford || isEquipped ? 1 : 0.4,
                  }}
                  onClick={() => { if (canAfford && !isEquipped) buyWeapon(w); }}
                >
                  <div>
                    <div style={{ ...S.weaponName, color: isEquipped ? '#FD4556' : '#FFFBF5' }}>
                      {w.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#667788' }}>
                      DMG {w.damage} &middot; RPM {Math.round(60000 / w.fireRate)}
                    </div>
                  </div>
                  <div style={w.cost === 0 ? S.weaponFree : S.weaponCost}>
                    {isEquipped ? 'EQUIPPED' : w.cost === 0 ? 'FREE' : `${w.cost}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          <div style={S.rightPanel}>
            <div style={{ color: '#8899AA', fontSize: 9 }}>LOADOUT</div>
            <div style={{ padding: '4px 0', borderBottom: '1px solid #2A3A4A' }}>
              <div style={{ color: '#FD4556', fontWeight: 'bold' }}>{weapon.name}</div>
              <div style={{ fontSize: 9, color: '#667788' }}>DMG: {weapon.damage}</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              <div style={{ color: '#00FFDF' }}>Shield: {shield}</div>
            </div>
            <button style={S.goBtn} onClick={startCombat}>
              PLAY
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── COMBAT PHASE ── */
  if (phase === 'combat') {
    return (
      <div style={S.root}>
        <div style={S.combatTop}>
          <span>{weapon.name} &middot; DMG {weapon.damage}</span>
          <span style={{ color: '#00FFDF' }}>Shield: {shield}</span>
          <span style={S.credits}>{score}</span>
          <span>Round {round} &middot; {enemies.filter((e) => e.hp > 0).length} left</span>
        </div>
        <div ref={arenaRef} style={S.arena} onClick={handleShoot}>
          {/* Grid lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="#00FFDF" />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={300} stroke="#00FFDF" />
            ))}
          </svg>

          {/* Enemies */}
          {enemies.map((en) =>
            en.hp > 0 ? (
              <div
                key={en.id}
                style={{
                  position: 'absolute',
                  left: en.x - 12,
                  top: en.y - 18,
                  width: 24,
                  transition: 'none',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {/* Head */}
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: en.color, margin: '0 auto',
                  boxShadow: `0 0 6px ${en.color}44`,
                }} />
                {/* Body */}
                <div style={{
                  width: 16, height: 14, margin: '1px auto 0',
                  background: en.color, opacity: 0.8,
                  clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
                }} />
                {/* Legs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                  <div style={{ width: 4, height: 8, background: en.color, opacity: 0.6 }} />
                  <div style={{ width: 4, height: 8, background: en.color, opacity: 0.6 }} />
                </div>
                {/* HP bar */}
                <div style={{
                  width: 24, height: 3, background: '#333', marginTop: 2,
                }}>
                  <div style={{
                    width: `${(en.hp / en.maxHp) * 100}%`,
                    height: '100%',
                    background: en.hp > en.maxHp * 0.5 ? '#4CAF50' : en.hp > en.maxHp * 0.25 ? '#FFD700' : '#FD4556',
                  }} />
                </div>
              </div>
            ) : (
              /* Death marker */
              <div
                key={en.id}
                style={{
                  position: 'absolute', left: en.x - 6, top: en.y - 4,
                  color: '#FD455666', fontSize: 14, pointerEvents: 'none',
                }}
              >
                X
              </div>
            ),
          )}

          {/* Muzzle flash */}
          {muzzleFlash && (
            <div style={{
              position: 'absolute',
              left: muzzleFlash.x - 4, top: muzzleFlash.y - 4,
              width: 8, height: 8, borderRadius: '50%',
              background: '#FFD700', boxShadow: '0 0 8px #FFD700',
              pointerEvents: 'none',
            }} />
          )}

          {/* Hit marker */}
          {hitMarker && (
            <svg
              style={{ position: 'absolute', left: hitMarker.x - 8, top: hitMarker.y - 8, pointerEvents: 'none' }}
              width={16} height={16}
            >
              <line x1={2} y1={2} x2={6} y2={6} stroke="#fff" strokeWidth={2} />
              <line x1={14} y1={2} x2={10} y2={6} stroke="#fff" strokeWidth={2} />
              <line x1={2} y1={14} x2={6} y2={10} stroke="#fff" strokeWidth={2} />
              <line x1={14} y1={14} x2={10} y2={10} stroke="#fff" strokeWidth={2} />
            </svg>
          )}

          {/* Crosshair */}
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={24} height={24} style={{ opacity: 0.5 }}>
              <line x1={12} y1={0} x2={12} y2={9} stroke="#fff" strokeWidth={1} />
              <line x1={12} y1={15} x2={12} y2={24} stroke="#fff" strokeWidth={1} />
              <line x1={0} y1={12} x2={9} y2={12} stroke="#fff" strokeWidth={1} />
              <line x1={15} y1={12} x2={24} y2={12} stroke="#fff" strokeWidth={1} />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  /* ── ROUND END ── */
  return (
    <div style={S.root}>
      <div style={S.roundEnd}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#FD4556' }}>ROUND {round} COMPLETE</div>
        <div style={{ color: '#00FFDF' }}>Kills: {kills}</div>
        <div style={S.credits}>Score: {score}</div>
        <div style={{ color: '#667788', fontSize: 10 }}>+{2000 + kills * 200} credits next round</div>
        <button style={{ ...S.goBtn, padding: '8px 32px' }} onClick={nextRound}>
          NEXT ROUND
        </button>
      </div>
    </div>
  );
}
