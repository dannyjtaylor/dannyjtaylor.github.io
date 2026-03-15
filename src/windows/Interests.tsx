import styles from './windows.module.css';

interface Category {
  title: string;
  emoji: string;
  items: string[];
}

const CATEGORIES: Category[] = [
  {
    title: 'Anime',
    emoji: '',
    items: [
      'Mob Psycho 100', 'Fullmetal Alchemist: Brotherhood', 'Jujutsu Kaisen',
      'Kaiju No. 8', 'Demon Slayer', "JoJo's Bizarre Adventure", 'Vinland Saga',
      'Attack on Titan', 'Cowboy Bebop', 'DanDaDan', 'One Punch Man',
      'Steins;Gate', 'To Be Hero X', 'Fire Force', 'Frieren: Beyond Journey\'s End',
    ],
  },
  {
    title: 'Games',
    emoji: '',
    items: [
      'VALORANT', 'Hollow Knight', 'Deltarune', 'Metal Gear Solid', 'Borderlands',
      'Persona 3', 'Persona 4', 'Persona 5', 'Hollow Knight: Silksong', 'Terraria',
      'Phoenix Wright: Ace Attorney', 'Call of Duty', 'Minecraft', 'GTA V', 'UNDERTALE',
    ],
  },
  {
    title: 'Shows & Movies',
    emoji: '',
    items: [
      'Breaking Bad', 'Better Call Saul', 'Back to the Future 1',
      'Back to the Future 2', 'Back to the Future 3', 'The Boys', 'Fallout',
      'Look Back', "Howl's Moving Castle", 'Spirited Away', 'Invincible', 'Spider-Man',
    ],
  },
  {
    title: 'Music',
    emoji: '',
    items: [
      'Clairo', 'Billy Joel', 'Daft Punk', 'Gorillaz', 'Tame Impala', 'TV Girl',
      'Mariya Takeuchi', 'Huey Lewis & The News', 'Kasane Teto', 'Wallows',
    ],
  },
  {
    title: 'Books',
    emoji: '',
    items: ['The Enemy (Book Series)', 'Scythe', 'Percy Jackson'],
  },
  {
    title: 'Misc',
    emoji: '',
    items: [
      'Streaming on Twitch (twitch.tv/fierylights)',
      'Problem Solving', 'Embedded Systems', 'Going to the Gym', 'Sleeping',
    ],
  },
];

export function Interests() {
  return (
    <div className={styles.notepadEditable}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        background: 'var(--win-white)',
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        color: 'var(--win-black)',
        userSelect: 'text',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8, borderBottom: '2px solid var(--win-black)', paddingBottom: 4 }}>
          Danny's Interests
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.title} style={{ marginBottom: 12 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 12,
              padding: '3px 6px',
              background: 'var(--win-navy)',
              color: 'var(--win-white)',
              marginBottom: 4,
            }}>
              {cat.title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0' }}>
              {cat.items.map((item, i) => {
                const isLink = item.includes('twitch.tv');
                const content = isLink ? (
                  <a
                    key={i}
                    href="https://twitch.tv/fierylights"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0000FF', textDecoration: 'underline' }}
                  >
                    {item}
                  </a>
                ) : item;
                return (
                  <div key={i} style={{
                    padding: '2px 8px',
                    width: '50%',
                    boxSizing: 'border-box',
                  }}>
                    {isLink ? content : `- ${item}`}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
