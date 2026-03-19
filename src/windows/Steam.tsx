import { useState } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

/* ─── Game SVG Icons ─── */
function GameIcon({ gameId }: { gameId: string }) {
  switch (gameId) {
    case 'valorant':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke="#ff4655" strokeWidth="1.5" fill="none" />
          <circle cx="7" cy="7" r="2" fill="#ff4655" />
          <line x1="7" y1="0.5" x2="7" y2="3.5" stroke="#ff4655" strokeWidth="1" />
          <line x1="7" y1="10.5" x2="7" y2="13.5" stroke="#ff4655" strokeWidth="1" />
          <line x1="0.5" y1="7" x2="3.5" y2="7" stroke="#ff4655" strokeWidth="1" />
          <line x1="10.5" y1="7" x2="13.5" y2="7" stroke="#ff4655" strokeWidth="1" />
        </svg>
      );
    case 'undertale':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7 12 L1.5 5.5 C0.5 3.5 1 1.5 3.5 1.5 C5.5 1.5 7 4 7 4 C7 4 8.5 1.5 10.5 1.5 C13 1.5 13.5 3.5 12.5 5.5 Z" fill="#ff4655" />
        </svg>
      );
    case 'cavestory':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <rect x="6" y="1" width="2" height="10" fill="#4a9eff" />
          <rect x="4" y="1" width="6" height="2" fill="#4a9eff" />
          <rect x="5" y="11" width="4" height="2" fill="#4a9eff" />
          <rect x="3" y="12" width="8" height="1" fill="#4a9eff" />
        </svg>
      );
    case 'halflife3':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <text x="2" y="12" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#ff9900">λ</text>
        </svg>
      );
    default:
      return null;
  }
}

/* ─── Game data ─── */
interface SteamGame {
  id: string;
  title: string;
  developer: string;
  size: string;
  installed: boolean;
  lastPlayed?: string;
  hours: number;
  description: string;
  windowId?: string;
  tags: string[];
  boxArt?: string;
  bgImage?: string;
}

interface Achievement {
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const GAME_ACHIEVEMENTS: Record<string, Achievement[]> = {
  valorant: [
    { name: 'First Blood', description: 'Get your first kill', unlocked: true, icon: '🎯' },
    { name: 'Ace', description: 'Kill all 5 enemies in a round', unlocked: true, icon: '⭐' },
    { name: 'Radiant', description: 'Reach Radiant rank', unlocked: false, icon: '💎' },
    { name: 'Clutch Master', description: 'Win a 1v5 clutch', unlocked: true, icon: '🔥' },
    { name: 'Agent Expert', description: 'Master all agents', unlocked: false, icon: '🏆' },
  ],
  undertale: [
    { name: 'Pacifist', description: 'Complete True Pacifist route', unlocked: true, icon: '💛' },
    { name: 'Determined', description: 'Die and come back 10 times', unlocked: true, icon: '❤️' },
    { name: 'Genocide', description: 'Complete Genocide route', unlocked: false, icon: '🖤' },
    { name: 'Date Night', description: 'Complete all dates', unlocked: true, icon: '💕' },
    { name: 'Spare Everyone', description: 'Never kill a single monster', unlocked: true, icon: '🌟' },
  ],
  cavestory: [
    { name: 'Best Ending', description: 'Get the best ending', unlocked: true, icon: '✨' },
    { name: 'Polar Star', description: 'Keep the Polar Star to the end', unlocked: false, icon: '⚡' },
    { name: 'Sacred Grounds', description: 'Complete Sacred Grounds', unlocked: false, icon: '💀' },
    { name: 'Curly Story', description: 'Complete Curly Story mode', unlocked: true, icon: '🎀' },
    { name: 'Speed Run', description: 'Beat the game in under 1 hour', unlocked: false, icon: '⏱️' },
  ],
  halflife3: [
    { name: '???', description: 'Game not released yet', unlocked: false, icon: '❓' },
    { name: '???', description: 'Game not released yet', unlocked: false, icon: '❓' },
    { name: '???', description: 'Game not released yet', unlocked: false, icon: '❓' },
  ],
};

const GAMES: SteamGame[] = [
  {
    id: 'valorant',
    title: 'VALORANT',
    developer: 'Riot Games',
    size: '22.5 GB',
    installed: true,
    lastPlayed: 'Today',
    hours: 1337,
    description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.',
    windowId: 'valorant',
    tags: ['FPS', 'Competitive', 'Multiplayer'],
    boxArt: '/art/valorant_box.png',
    bgImage: '/art/valorant_bg.png',
  },
  {
    id: 'undertale',
    title: 'UNDERTALE',
    developer: 'Toby Fox',
    size: '200 MB',
    installed: true,
    lastPlayed: 'Yesterday',
    hours: 42,
    description: 'A friendly RPG where nobody has to die. Explore the underground and meet a cast of unforgettable characters.',
    windowId: 'undertale',
    tags: ['RPG', 'Indie', 'Story Rich'],
    boxArt: '/art/undertale_box.png',
    bgImage: '/art/undertale_bg.png',
  },
  {
    id: 'cavestory',
    title: 'Cave Story+',
    developer: 'Studio Pixel',
    size: '85 MB',
    installed: true,
    lastPlayed: 'Last week',
    hours: 28,
    description: 'A freeware side-scrolling platformer. Explore a vast cave system, fight monsters and uncover the mysteries within.',
    windowId: 'cavestory',
    tags: ['Platformer', 'Indie', 'Action'],
    boxArt: '/art/cavestory_box.png',
    bgImage: '/art/cavestory_bg.png',
  },
  {
    id: 'halflife3',
    title: 'Half-Life 3',
    developer: 'Valve',
    size: '??? GB',
    installed: false,
    hours: 0,
    description: 'Coming soon... probably... maybe... one day...',
    tags: ['FPS', 'Sci-Fi', 'Wishlist'],
    boxArt: '/art/halflife3_box.png',
  },
];

type SteamTab = 'Library' | 'Store' | 'Community' | 'Profile';

/* ─── Inline style helpers ─── */
const steamDark = '#1b2838';
const steamDarker = '#171a21';
const steamBlue = '#1a9fff';
const steamGreen = '#4c6b22';
const steamGreenLight = '#a4d007';
const steamGray = '#2a475e';
const steamText = '#c7d5e0';
const steamTextDim = '#8f98a0';
const steamBorder = '#0e1a26';

export function Steam() {
  const openWindow = useDesktopStore((s) => s.openWindow);
  const [activeTab, setActiveTab] = useState<SteamTab>('Library');
  const [selectedGame, setSelectedGame] = useState<SteamGame>(GAMES[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstalled, setFilterInstalled] = useState(false);

  const [installedGames, setInstalledGames] = useState<Set<string>>(
    () => new Set(GAMES.filter(g => g.installed).map(g => g.id))
  );

  const isInstalled = (id: string) => installedGames.has(id);

  const installGame = (id: string) => {
    setInstalledGames(prev => new Set([...prev, id]));
  };

  const uninstallGame = (id: string) => {
    setInstalledGames(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filteredGames = GAMES.filter((g) => {
    if (filterInstalled && !isInstalled(g.id)) return false;
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handlePlay = (game: SteamGame) => {
    if (game.windowId && isInstalled(game.id)) {
      openWindow(game.windowId);
    }
  };

  const totalUnlocked = Object.values(GAME_ACHIEVEMENTS).reduce(
    (sum, achs) => sum + achs.filter(a => a.unlocked).length, 0
  );
  const totalAchievements = Object.values(GAME_ACHIEVEMENTS).reduce(
    (sum, achs) => sum + achs.length, 0
  );

  const playBtnStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${steamGreen}, ${steamGreenLight})`,
    border: 'none',
    color: '#fff',
    fontFamily: 'var(--font-system)',
    fontSize: 14,
    fontWeight: 'bold',
    padding: '8px 32px',
    letterSpacing: 1,
    cursor: 'pointer',
  };

  const uninstallBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${steamBorder}`,
    color: steamTextDim,
    fontFamily: 'var(--font-system)',
    fontSize: 10,
    padding: '6px 14px',
    cursor: 'pointer',
  };

  const installBtnStyle: React.CSSProperties = {
    background: steamBlue,
    border: 'none',
    color: '#fff',
    fontFamily: 'var(--font-system)',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '8px 24px',
    cursor: 'pointer',
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: steamDark,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-system)',
      fontSize: 11,
      color: steamText,
      overflow: 'hidden',
    }}>
      {/* ─── Top Navigation Bar ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: steamDarker,
        padding: '0 8px',
        height: 28,
        gap: 0,
        borderBottom: `1px solid ${steamBorder}`,
        flexShrink: 0,
      }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: 12,
          color: steamText,
          marginRight: 16,
          letterSpacing: 1,
        }}>
          STEAM
        </span>
        {(['Library', 'Store', 'Community', 'Profile'] as SteamTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? '#fff' : steamTextDim,
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              padding: '4px 12px',
              borderBottom: activeTab === tab ? `2px solid ${steamBlue}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ color: steamTextDim, fontSize: 10 }}>
          Danny
        </span>
      </div>

      {/* ─── Library View ─── */}
      {activeTab === 'Library' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ─── Left Sidebar: Game List ─── */}
          <div style={{
            width: 200,
            background: steamGray,
            borderRight: `1px solid ${steamBorder}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Search bar */}
            <div style={{ padding: 6 }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: steamDarker,
                  border: `1px solid ${steamBorder}`,
                  color: steamText,
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  padding: '3px 6px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter */}
            <div style={{
              padding: '2px 8px 6px',
              borderBottom: `1px solid ${steamBorder}`,
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: steamTextDim }}>
                <input
                  type="checkbox"
                  checked={filterInstalled}
                  onChange={(e) => setFilterInstalled(e.target.checked)}
                  style={{ accentColor: steamBlue }}
                />
                Installed only
              </label>
            </div>

            {/* Game list */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  style={{
                    padding: '6px 10px',
                    background: selectedGame?.id === game.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: selectedGame?.id === game.id ? `3px solid ${steamBlue}` : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {game.boxArt ? (
                    <img
                      src={game.boxArt}
                      alt=""
                      style={{
                        width: 24,
                        height: 16,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: `1px solid ${steamBorder}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isInstalled(game.id) ? steamGreenLight : steamTextDim,
                      flexShrink: 0,
                    }} />
                  )}
                  <GameIcon gameId={game.id} />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{
                      fontSize: 11,
                      color: selectedGame?.id === game.id ? '#fff' : steamText,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {game.title}
                    </div>
                    {game.hours > 0 && (
                      <div style={{ fontSize: 9, color: steamTextDim }}>
                        {game.hours} hrs on record
                      </div>
                    )}
                  </div>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isInstalled(game.id) ? steamGreenLight : steamTextDim,
                    flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>

            {/* Stats footer */}
            <div style={{
              padding: '6px 10px',
              borderTop: `1px solid ${steamBorder}`,
              fontSize: 10,
              color: steamTextDim,
            }}>
              {installedGames.size} installed / {GAMES.length} games
            </div>
          </div>

          {/* ─── Right Panel: Game Detail ─── */}
          {selectedGame && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              background: steamDark,
            }}>
              {/* Hero banner area */}
              <div style={{
                background: selectedGame.bgImage
                  ? `url(${selectedGame.bgImage}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${steamGray} 0%, ${steamDark} 100%)`,
                backgroundSize: selectedGame.bgImage ? 'cover' : undefined,
                backgroundPosition: selectedGame.bgImage ? 'center' : undefined,
                padding: 20,
                borderBottom: `1px solid ${steamBorder}`,
                position: 'relative',
              }}>
                {/* Dark overlay for readability when bg image is present */}
                {selectedGame.bgImage && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                    pointerEvents: 'none',
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                {selectedGame.boxArt && (
                  <div style={{
                    width: '100%',
                    height: 100,
                    background: `url(${selectedGame.boxArt}) center/cover`,
                    marginBottom: 12,
                    border: `1px solid ${steamBorder}`,
                  }} />
                )}

                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                  {selectedGame.title}
                </div>
                <div style={{ fontSize: 10, color: steamTextDim, marginBottom: 12 }}>
                  {selectedGame.developer}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {selectedGame.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '2px 8px',
                        borderRadius: 2,
                        fontSize: 9,
                        color: steamBlue,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Play/Install/Uninstall buttons */}
                {isInstalled(selectedGame.id) ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => handlePlay(selectedGame)} style={playBtnStyle}>
                      {'\u25B6'} Play
                    </button>
                    <button onClick={() => uninstallGame(selectedGame.id)} style={uninstallBtnStyle}>
                      Uninstall
                    </button>
                  </div>
                ) : selectedGame.id === 'halflife3' ? (
                  <button style={{ ...installBtnStyle, opacity: 0.5 }} disabled>
                    Coming Soon...
                  </button>
                ) : (
                  <button onClick={() => installGame(selectedGame.id)} style={installBtnStyle}>
                    Install
                  </button>
                )}
                </div>
              </div>

              {/* Game Info Section */}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
                  About This Game
                </div>
                <p style={{ color: steamText, lineHeight: 1.6, marginBottom: 16 }}>
                  {selectedGame.description}
                </p>

                {/* Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: 12,
                  borderRadius: 2,
                }}>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Developer</div>
                    <div style={{ color: steamBlue }}>{selectedGame.developer}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Size</div>
                    <div>{selectedGame.size}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Play Time</div>
                    <div>{selectedGame.hours > 0 ? `${selectedGame.hours} hours` : 'Not played yet'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Last Played</div>
                    <div>{selectedGame.lastPlayed ?? 'Never'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Status</div>
                    <div style={{ color: isInstalled(selectedGame.id) ? steamGreenLight : '#f44' }}>
                      {isInstalled(selectedGame.id) ? 'Installed' : 'Not installed'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Tags</div>
                    <div>{selectedGame.tags.join(', ')}</div>
                  </div>
                </div>

                {/* Achievements section */}
                {GAME_ACHIEVEMENTS[selectedGame.id] && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
                      Achievements
                    </div>
                    {(() => {
                      const achs = GAME_ACHIEVEMENTS[selectedGame.id]!;
                      const unlocked = achs.filter(a => a.unlocked).length;
                      const total = achs.length;
                      const pct = total > 0 ? (unlocked / total) * 100 : 0;
                      return (
                        <>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 10,
                          }}>
                            <div style={{
                              flex: 1,
                              height: 6,
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: steamGreenLight,
                                borderRadius: 3,
                              }} />
                            </div>
                            <span style={{ fontSize: 10, color: steamTextDim, whiteSpace: 'nowrap' }}>
                              {unlocked}/{total} Achievements Unlocked
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}>
                            {achs.map((ach, i) => (
                              <div
                                key={`${ach.name}-${i}`}
                                title={ach.description}
                                style={{
                                  background: ach.unlocked ? 'rgba(164,208,7,0.15)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${ach.unlocked ? steamGreenLight : steamBorder}`,
                                  padding: '6px 10px',
                                  borderRadius: 2,
                                  fontSize: 10,
                                  color: ach.unlocked ? steamGreenLight : steamTextDim,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  opacity: ach.unlocked ? 1 : 0.6,
                                }}
                              >
                                <span style={{ fontSize: 14 }}>{ach.icon}</span>
                                {ach.name}
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Store View ─── */}
      {activeTab === 'Store' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Featured & Recommended</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', padding: 16 }}>
            {GAMES.slice(0, 4).map((game) => (
              <div
                key={game.id}
                onClick={() => { setSelectedGame(game); setActiveTab('Library'); }}
                style={{
                  width: 140,
                  background: steamGray,
                  border: `1px solid ${steamBorder}`,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                {game.boxArt ? (
                  <div style={{
                    width: '100%',
                    height: 60,
                    background: `url(${game.boxArt}) center/cover`,
                    marginBottom: 6,
                    border: `1px solid ${steamBorder}`,
                  }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 60,
                    background: `linear-gradient(135deg, ${steamDarker}, ${steamGray})`,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: steamBlue,
                  }}>
                    {game.title.charAt(0)}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#fff', marginBottom: 2 }}>{game.title}</div>
                <div style={{ fontSize: 9, color: steamTextDim }}>{game.developer}</div>
                <div style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: isInstalled(game.id) ? steamGreenLight : steamBlue,
                }}>
                  {isInstalled(game.id) ? 'In Library' : 'Free to Play'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Community View ─── */}
      {activeTab === 'Community' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>Community Hub</div>
          <div style={{ color: steamTextDim, textAlign: 'center', maxWidth: 300 }}>
            Discussions, screenshots, guides, and workshop content from the DannyOS gaming community.
          </div>
          <div style={{
            marginTop: 12,
            padding: '8px 16px',
            background: steamGray,
            border: `1px solid ${steamBorder}`,
            color: steamTextDim,
            fontSize: 10,
          }}>
            No community content available yet. Check back later!
          </div>
        </div>
      )}

      {/* ─── Profile View ─── */}
      {activeTab === 'Profile' && (
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <div style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
            alignItems: 'flex-start',
          }}>
            {/* Avatar */}
            <div style={{
              width: 64,
              height: 64,
              background: steamGray,
              border: `2px solid ${steamBlue}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              color: steamBlue,
              flexShrink: 0,
            }}>
              D
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Danny</div>
              <div style={{ fontSize: 10, color: steamGreenLight, marginTop: 2 }}>Online</div>
              <div style={{ fontSize: 10, color: steamTextDim, marginTop: 4 }}>
                Level 42 | {GAMES.length} games owned
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}>
            {[
              { label: 'Games Owned', value: String(GAMES.length) },
              { label: 'Hours Played', value: String(GAMES.reduce((sum, g) => sum + g.hours, 0)) },
              { label: 'Achievements', value: `${totalUnlocked}/${totalAchievements}` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: steamGray,
                  padding: 12,
                  textAlign: 'center',
                  border: `1px solid ${steamBorder}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 'bold', color: steamBlue }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: steamTextDim, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            Recent Activity
          </div>
          {GAMES.filter((g) => g.lastPlayed).slice(0, 3).map((game) => (
            <div
              key={game.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.2)',
                marginBottom: 4,
                borderRadius: 2,
              }}
            >
              <div>
                <div style={{ color: '#fff' }}>{game.title}</div>
                <div style={{ fontSize: 9, color: steamTextDim }}>{game.hours} hrs total</div>
              </div>
              <div style={{ fontSize: 10, color: steamTextDim }}>{game.lastPlayed}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Bottom Status Bar ─── */}
      <div style={{
        height: 20,
        background: steamDarker,
        borderTop: `1px solid ${steamBorder}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 10,
        color: steamTextDim,
        flexShrink: 0,
        justifyContent: 'space-between',
      }}>
        <span>Steam Client v1.0 - DannyOS Edition</span>
        <span>{installedGames.size} games installed</span>
      </div>
    </div>
  );
}
