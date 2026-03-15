import styles from './windows.module.css';

export function DotCard() {
  return (
    <div className={styles.notepadEditable}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        padding: 24,
        fontFamily: 'var(--font-system)',
        fontSize: 13,
        color: 'var(--win-black)',
        textAlign: 'center',
        background: 'var(--win-white)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>
          Daniel J. Taylor
        </div>
        <div style={{ lineHeight: 1.6 }}>
          View my dot.card:
        </div>
        <a
          href="https://dot.cards/danieljtaylor"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0000FF',
            textDecoration: 'underline',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          https://dot.cards/danieljtaylor
        </a>
        <div style={{
          marginTop: 8,
          padding: '8px 16px',
          background: 'var(--win-gray)',
          borderTop: '2px solid var(--win-btn-hilight)',
          borderLeft: '2px solid var(--win-btn-hilight)',
          borderRight: '2px solid var(--win-btn-dk-shadow)',
          borderBottom: '2px solid var(--win-btn-dk-shadow)',
          fontSize: 11,
          color: 'var(--win-dark)',
        }}>
          Click the link above to view my digital business card
        </div>
      </div>
    </div>
  );
}
