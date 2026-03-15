import { useCallback } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

export function Projects() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);

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
      <div className={styles.explorerList}>
        <div className={styles.explorerItem}>
          <span className={styles.explorerIcon}>
            <DynamicIcon name="folder" size={16} />
          </span>
          <span>Projects coming soon...</span>
        </div>
      </div>
      <div className={styles.statusBar}>0 object(s)&nbsp;&nbsp;&nbsp;&nbsp;0 bytes</div>
    </div>
  );
}
