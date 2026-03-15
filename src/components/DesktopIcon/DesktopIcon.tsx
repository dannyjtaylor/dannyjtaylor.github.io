import { useRef, useCallback, type MouseEvent } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import { DynamicIcon } from '../Icons/Icons';
import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  id: string;
  label: string;
  icon: string;
  windowId: string;
}

export function DesktopIcon({ id, label, icon, windowId }: DesktopIconProps) {
  const selectedIcons = useDesktopStore((s) => s.selectedIcons);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const toggleSelectIcon = useDesktopStore((s) => s.toggleSelectIcon);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const iconPosition = useDesktopStore((s) => s.iconPositions[id]);
  const updateIconPosition = useDesktopStore((s) => s.updateIconPosition);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);

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

      const onUp = () => {
        const wasDrag = dragRef.current?.hasMoved;
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        if (!wasDrag) {
          if (lastClickedRef.current === id && clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            lastClickedRef.current = null;
            openWindow(windowId);
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
    [id, windowId, isSelected, selectIcon, toggleSelectIcon, openWindow, iconPosition, updateIconPosition],
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
        <DynamicIcon name={icon} size={32} />
      </div>
      <span className={`${styles.label} ${isSelected ? styles.labelSelected : ''}`}>
        {label}
      </span>
    </div>
  );
}
