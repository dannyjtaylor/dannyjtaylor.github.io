import { useRef, useState, useEffect, useCallback, type MouseEvent } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import { DynamicIcon } from '../Icons/Icons';
import { Sounds } from '../../utils/sounds';
import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  id: string;
  label: string;
  icon: string;
  windowId: string;
  externalUrl?: string;
}

export function DesktopIcon({ id, label, icon, windowId, externalUrl }: DesktopIconProps) {
  const selectedIcons = useDesktopStore((s) => s.selectedIcons);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const toggleSelectIcon = useDesktopStore((s) => s.toggleSelectIcon);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const iconPosition = useDesktopStore((s) => s.iconPositions[id]);
  const updateIconPosition = useDesktopStore((s) => s.updateIconPosition);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const renamingIconId = useDesktopStore((s) => s.renamingIconId);
  const setRenamingIconId = useDesktopStore((s) => s.setRenamingIconId);
  const renameIcon = useDesktopStore((s) => s.renameIcon);
  const moveToRecycleBin = useDesktopStore((s) => s.moveToRecycleBin);
  const moveStaticToRecycleBin = useDesktopStore((s) => s.moveStaticToRecycleBin);

  const isRenaming = renamingIconId === id;
  const [renameValue, setRenameValue] = useState(label);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(label);
      // Auto-focus and select all on next tick
      requestAnimationFrame(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      });
    }
  }, [isRenaming, label]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) {
      renameIcon(id, trimmed);
    }
    setRenamingIconId(null);
  }, [renameValue, label, id, renameIcon, setRenamingIconId]);

  const cancelRename = useCallback(() => {
    setRenamingIconId(null);
  }, [setRenamingIconId]);

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedRef = useRef<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  } | null>(null);

  const isSelected = selectedIcons.has(id);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      // Ctrl+click for multi-select
      if (e.ctrlKey) {
        toggleSelectIcon(id);
        return;
      }

      // If not already selected, select just this one
      if (!isSelected) {
        selectIcon(id);
      }

      const pos = iconPosition ?? { x: 0, y: 0 };

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
        hasMoved: false,
      };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          dragRef.current.hasMoved = true;
        }
        if (dragRef.current.hasMoved) {
          updateIconPosition(id, dragRef.current.origX + dx, dragRef.current.origY + dy);
        }
      };

      const onUp = (ev: globalThis.MouseEvent) => {
        const wasDrag = dragRef.current?.hasMoved;
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        // Check if dropped on recycle bin (only if dragged and not the recycle bin itself)
        if (wasDrag && id !== 'icon-recycle') {
          const recycleEl = document.querySelector('[data-icon-id="icon-recycle"]');
          if (recycleEl) {
            const rect = recycleEl.getBoundingClientRect();
            if (ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
              // Dropped on recycle bin — delete this item
              const state = useDesktopStore.getState();
              const dynItem = state.dynamicItems.find((d) => d.id === id || d.windowId === windowId);
              if (dynItem) {
                moveToRecycleBin(dynItem.id);
              } else {
                // Static icon map
                const staticIconMap: Record<string, { label: string; icon: string; windowId: string }> = {
                  'icon-about': { label: 'About Me', icon: 'document', windowId: 'about' },
                  'icon-projects': { label: 'Projects', icon: 'file', windowId: 'projects' },
                  'icon-resume': { label: 'Resume', icon: 'notepad', windowId: 'resume' },
                  'icon-contact': { label: 'Contact', icon: 'mail', windowId: 'contact' },
                  'icon-mycomputer': { label: 'My Computer', icon: 'computer', windowId: 'mycomputer' },
                  'icon-terminal': { label: 'MS-DOS', icon: 'console', windowId: 'terminal' },
                  'icon-portfolio': { label: 'Portfolio', icon: 'document', windowId: 'portfolio' },
                  'icon-transcript': { label: 'Transcript', icon: 'notepad', windowId: 'transcript' },
                  'icon-discord': { label: '/gather Bot', icon: 'discord', windowId: 'discord' },
                  'icon-interests': { label: 'Interests', icon: 'document', windowId: 'interests' },
                  'icon-breadbox': { label: 'Breadbox', icon: 'breadbox', windowId: 'breadbox' },
                  'icon-minesweeper': { label: 'Minesweeper', icon: 'minesweeper', windowId: 'minesweeper' },
                  'icon-steam': { label: 'Steam', icon: 'steam', windowId: 'steam' },
                  'icon-aol': { label: 'AOL Messenger', icon: 'aol', windowId: 'aol' },
                  'icon-paint': { label: 'Paint', icon: 'paint', windowId: 'paint' },
                  'icon-datetime': { label: 'Date/Time', icon: 'datetime', windowId: 'datetime' },
                  'icon-settings': { label: 'Settings', icon: 'settings', windowId: 'settings' },
                  'icon-musicplayer': { label: 'Music Player', icon: 'musicplayer', windowId: 'musicplayer' },
                  'icon-credits': { label: 'Credits', icon: 'credits', windowId: 'credits' },
                };
                const staticInfo = staticIconMap[id];
                if (staticInfo) {
                  moveStaticToRecycleBin(id, staticInfo.label, staticInfo.icon, staticInfo.windowId);
                }
              }
              // Reset position since the icon was deleted
              updateIconPosition(id, 0, 0);
              Sounds.click();
              return;
            }
          }
        }

        // Snap to grid after drag
        if (wasDrag) {
          const currentPos = useDesktopStore.getState().iconPositions[id];
          if (currentPos) {
            const gridW = 75;
            const gridH = 75;
            const snappedX = Math.round(currentPos.x / gridW) * gridW;
            const snappedY = Math.round(currentPos.y / gridH) * gridH;
            updateIconPosition(id, snappedX, snappedY);
          }
        }

        if (!wasDrag) {
          if (lastClickedRef.current === id && clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            lastClickedRef.current = null;
            Sounds.doubleClick();
            if (externalUrl) {
              window.open(externalUrl, '_blank');
            } else {
              openWindow(windowId);
            }
          } else {
            lastClickedRef.current = id;
            clickTimer.current = setTimeout(() => {
              clickTimer.current = null;
              lastClickedRef.current = null;
            }, 400);
          }
        }
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, windowId, externalUrl, isSelected, selectIcon, toggleSelectIcon, openWindow, iconPosition, updateIconPosition, moveToRecycleBin, moveStaticToRecycleBin],
  );

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isSelected) selectIcon(id);
      showContextMenu(e.clientX, e.clientY, 'icon', windowId);
    },
    [id, windowId, isSelected, selectIcon, showContextMenu],
  );

  const posStyle = iconPosition
    ? { transform: `translate(${iconPosition.x}px, ${iconPosition.y}px)` }
    : undefined;

  return (
    <div
      className={`${styles.icon} ${isSelected ? styles.selected : ''}`}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={posStyle}
      tabIndex={0}
      role="button"
      aria-label={label}
      data-icon-id={id}
    >
      <div className={styles.iconImg}>
        <DynamicIcon name={icon} size={0} className={styles.dynamicIconSize} />
      </div>
      {isRenaming ? (
        <input
          ref={renameInputRef}
          className={styles.renameInput}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
            if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
            e.stopPropagation();
          }}
          onBlur={commitRename}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={`${styles.label} ${isSelected ? styles.labelSelected : ''}`}>
          {label}
        </span>
      )}
    </div>
  );
}
