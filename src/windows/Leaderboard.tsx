import { useLeaderboard } from '../hooks/useLeaderboard';
import { isFirebaseReady } from '../lib/firebase';
import styles from './windows.module.css';

export function Leaderboard() {
  const { entries, loading } = useLeaderboard(50);

  return (
    <div className={styles.notepadEditable} style={{ overflow: 'auto' }}>
      <div style={{
        fontFamily: 'var(--font-system)',
        fontSize: 13,
        color: 'var(--win-black)',
        background: 'var(--win-white)',
        padding: 12,
        minHeight: '100%',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
          === Last Goodbye Leaderboard ===
        </div>
        <div style={{ marginBottom: 4, color: '#666' }}>
          Dodge every name to win! 0 hits is a perfect score.
        </div>
        <div style={{ marginBottom: 8, color: '#666' }}>
          Fewer hits = higher rank
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {'#   Name        Hits\n'}
          {'─'.repeat(28) + '\n'}
          {!isFirebaseReady() ? (
            'Leaderboard unavailable\n(Firebase not configured)'
          ) : loading ? (
            'Loading...'
          ) : entries.length === 0 ? (
            'No scores yet.\nPlay Last Goodbye in Credits!'
          ) : (
            entries.map((e, i) => {
              const rank = String(i + 1).padStart(2, ' ');
              const name = e.name.padEnd(12, ' ');
              return `${rank}. ${name}${e.hits}\n`;
            }).join('')
          )}
        </div>
      </div>
    </div>
  );
}
