import { useEffect } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './ContextMenu.module.css';

export function ContextMenu() {
  const contextMenu = useDesktopStore((s) => s.contextMenu);
  const hideContextMenu = useDesktopStore((s) => s.hideContextMenu);
  const openWindow = useDesktopStore((s) => s.openWindow);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handle = () => hideContextMenu();
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, [contextMenu.visible, hideContextMenu]);

  if (!contextMenu.visible) return null;

  const { variant, targetId } = contextMenu;

  /* ── Desktop right-click ── */
  if (variant === 'desktop') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={styles.item} onClick={hideContextMenu}>Arrange Icons</div>
        <div className={styles.item} onClick={hideContextMenu}>Line up Icons</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideContextMenu(); window.location.reload(); }}>
          Refresh
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Paste</div>
        <div className={styles.item} onClick={hideContextMenu}>Paste Shortcut</div>
        <div className={styles.separator} />
        <div className={styles.itemSub}>
          <span>New</span>
          <span className={styles.arrow}>&#9654;</span>
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Properties</div>
      </div>
    );
  }

  /* ── Icon right-click ── */
  if (variant === 'icon') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={`${styles.item} ${styles.itemBold}`} onClick={() => {
          if (targetId) openWindow(targetId);
          hideContextMenu();
        }}>
          Open
        </div>
        <div className={styles.item} onClick={hideContextMenu}>Explore</div>
        <div className={styles.separator} />
        <div className={styles.itemSub}>
          <span>Send To</span>
          <span className={styles.arrow}>&#9654;</span>
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Cut</div>
        <div className={styles.item} onClick={hideContextMenu}>Copy</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Create Shortcut</div>
        <div className={styles.item} onClick={hideContextMenu}>Delete</div>
        <div className={styles.item} onClick={hideContextMenu}>Rename</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Properties</div>
      </div>
    );
  }

  /* ── Notepad / text area right-click ── */
  if (variant === 'notepad') {
    const doCmd = (cmd: string) => {
      hideContextMenu();
      requestAnimationFrame(() => {
        document.execCommand(cmd);
      });
    };
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={styles.itemDisabled}>Undo</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => doCmd('cut')}>Cut</div>
        <div className={styles.item} onClick={() => doCmd('copy')}>Copy</div>
        <div className={styles.item} onClick={() => doCmd('paste')}>Paste</div>
        <div className={styles.item} onClick={() => doCmd('delete')}>Delete</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideContextMenu();
          requestAnimationFrame(() => {
            const el = document.activeElement as HTMLTextAreaElement | null;
            el?.select();
          });
        }}>
          Select All
        </div>
      </div>
    );
  }

  /* ── Explorer right-click ── */
  if (variant === 'explorer') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={styles.itemSub}>
          <span>View</span>
          <span className={styles.arrow}>&#9654;</span>
        </div>
        <div className={styles.itemSub}>
          <span>Arrange Icons</span>
          <span className={styles.arrow}>&#9654;</span>
        </div>
        <div className={styles.item} onClick={hideContextMenu}>Line up Icons</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Paste</div>
        <div className={styles.item} onClick={hideContextMenu}>Paste Shortcut</div>
        <div className={styles.separator} />
        <div className={styles.itemSub}>
          <span>New</span>
          <span className={styles.arrow}>&#9654;</span>
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={hideContextMenu}>Properties</div>
      </div>
    );
  }

  return null;
}
