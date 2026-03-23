import { useCallback } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

export function RecycleBin() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const recycleBin = useDesktopStore((s) => s.recycleBin);
  const restoreFromRecycleBin = useDesktopStore((s) => s.restoreFromRecycleBin);
  const emptyRecycleBin = useDesktopStore((s) => s.emptyRecycleBin);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'explorer');
    },
    [showContextMenu],
  );

  return (
    <div className={styles.explorer} onContextMenu={handleContextMenu}>
      {/* Toolbar */}
      <div className={styles.explorerToolbar}>
        <button
          disabled={recycleBin.length === 0}
          onClick={() => emptyRecycleBin()}
          title="Empty Recycle Bin"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            padding: '2px 12px',
            whiteSpace: 'nowrap',
            background: 'var(--win-btn-face, #c0c0c0)',
            borderTop: '2px solid var(--win-btn-hilight, #fff)',
            borderLeft: '2px solid var(--win-btn-hilight, #fff)',
            borderRight: '2px solid var(--win-btn-dk-shadow, #000)',
            borderBottom: '2px solid var(--win-btn-dk-shadow, #000)',
            cursor: recycleBin.length === 0 ? 'default' : 'pointer',
            opacity: recycleBin.length === 0 ? 0.5 : 1,
          }}
        >
          Empty Recycle Bin
        </button>
      </div>
      <div className={styles.explorerList}>
        {recycleBin.length === 0 ? (
          <div className={styles.explorerEmpty}>
            <span style={{ color: 'var(--win-dark, #808080)', fontFamily: 'var(--font-system)', fontSize: 11 }}>
              Recycle Bin is empty.
            </span>
          </div>
        ) : (
          recycleBin.map((item) => (
            <div
              key={item.id}
              className={styles.explorerItem}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e.clientX, e.clientY, 'explorer-item', item.windowId);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className={styles.explorerIcon}>
                  <DynamicIcon name={item.icon} size={16} />
                </span>
                <span>{item.label}</span>
              </div>
              <button
                onClick={() => restoreFromRecycleBin(item.id)}
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  padding: '1px 8px',
                  cursor: 'pointer',
                  background: 'var(--win-btn-face, #c0c0c0)',
                  border: '2px outset var(--win-btn-face, #c0c0c0)',
                }}
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
      <div className={styles.statusBar}>
        {recycleBin.length} object(s)
      </div>
    </div>
  );
}
