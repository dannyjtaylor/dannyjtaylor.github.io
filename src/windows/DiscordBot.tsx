import { useCallback } from 'react';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

export function DiscordBot() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'notepad');
    },
    [showContextMenu],
  );

  return (
    <div className={styles.notepadEditable} onContextMenu={handleContextMenu}>
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
          /gather Discord Bot
        </div>
        <div style={{ lineHeight: 1.6 }}>
          Play my Discord Bot game, /gather at:
        </div>
        <a
          href="https://discord.gg/Qh5atYpw"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0000FF',
            textDecoration: 'underline',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          https://discord.gg/Qh5atYpw
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
          Click the link above to join the Discord server
        </div>
      </div>
    </div>
  );
}
