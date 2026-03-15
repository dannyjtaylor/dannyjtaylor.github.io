import {
  useRef, useCallback, useState, useEffect, useMemo, createContext,
  type ReactNode, type MouseEvent as ReactMouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DynamicIcon } from '../Icons/Icons';
import styles from './Window.module.css';
import type { MenuConfig } from '../../types';

/**
 * Context that lets window-content components register a callback
 * to receive menu-bar actions (e.g. "file-save", "edit-copy").
 * Call the returned cleanup function to unsubscribe.
 */
export const MenuCallbackContext = createContext<
  (handler: (action: string) => void) => () => void
>(() => () => {});

type ResizeDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

interface WindowProps {
  id: string;
  title: string;
  icon: string;
  menus?: MenuConfig[];
  children: ReactNode;
  className?: string;
}

export function Window({ id, title, icon, menus, children, className }: WindowProps) {
  const win = useDesktopStore((s) => s.windows[id]);
  const activeWindowId = useDesktopStore((s) => s.activeWindowId);
  const closeWindow = useDesktopStore((s) => s.closeWindow);
  const minimizeWindow = useDesktopStore((s) => s.minimizeWindow);
  const toggleMaximize = useDesktopStore((s) => s.toggleMaximize);
  const bringToFront = useDesktopStore((s) => s.bringToFront);
  const updatePosition = useDesktopStore((s) => s.updatePosition);
  const updateSize = useDesktopStore((s) => s.updateSize);

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);

  // Menu action callback registry
  const callbacksRef = useRef<Set<(action: string) => void>>(new Set());
  const registerCallback = useCallback((handler: (action: string) => void) => {
    callbacksRef.current.add(handler);
    return () => { callbacksRef.current.delete(handler); };
  }, []);
  const ctxValue = useMemo(() => registerCallback, [registerCallback]);

  // Close menu dropdown on outside click
  useEffect(() => {
    if (openMenuIdx === null) return;
    const handle = (e: globalThis.MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu-bar]')) {
        setOpenMenuIdx(null);
      }
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [openMenuIdx]);

  /* ── Titlebar Drag ── */
  const onTitlebarMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (win?.isMaximized) return;
      bringToFront(id);
      dragRef.current = {
        startX: e.clientX, startY: e.clientY,
        origX: win?.x ?? 0, origY: win?.y ?? 0,
      };
      const onMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        updatePosition(
          id,
          dragRef.current.origX + ev.clientX - dragRef.current.startX,
          dragRef.current.origY + ev.clientY - dragRef.current.startY,
        );
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, win, bringToFront, updatePosition],
  );

  /* ── Resize ── */
  const onResizeMouseDown = useCallback(
    (e: ReactMouseEvent, dir: ResizeDir) => {
      e.preventDefault();
      e.stopPropagation();
      if (!win || win.isMaximized) return;
      bringToFront(id);

      const startX = e.clientX, startY = e.clientY;
      const origX = win.x, origY = win.y, origW = win.width, origH = win.height;

      const onMove = (ev: globalThis.MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let newX = origX, newY = origY, newW = origW, newH = origH;

        if (dir.includes('e')) newW = Math.max(200, origW + dx);
        if (dir.includes('s')) newH = Math.max(100, origH + dy);
        if (dir === 'w' || dir === 'nw' || dir === 'sw') {
          newW = Math.max(200, origW - dx);
          newX = origX + origW - newW;
        }
        if (dir === 'n' || dir === 'nw' || dir === 'ne') {
          newH = Math.max(100, origH - dy);
          newY = origY + origH - newH;
        }

        updatePosition(id, newX, newY);
        updateSize(id, newW, newH);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, win, bringToFront, updatePosition, updateSize],
  );

  /* ── Menu Actions ── */
  const handleMenuItemClick = (action: string) => {
    setOpenMenuIdx(null);
    if (action === 'file-exit') {
      closeWindow(id);
      return;
    }
    // Dispatch to registered content callbacks
    callbacksRef.current.forEach((h) => h(action));
  };

  if (!win || !win.isOpen || win.isMinimized) return null;

  const isActive = activeWindowId === id;
  const isMaximized = win.isMaximized;

  const style = isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 28px)', zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <motion.div
      ref={windowRef}
      className={`${styles.window} ${isActive ? '' : styles.inactive} ${className ?? ''}`}
      style={style}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      onMouseDown={() => bringToFront(id)}
    >
      {/* ── Resize Handles ── */}
      {!isMaximized && (
        <>
          <div className={styles.resizeN} onMouseDown={(e) => onResizeMouseDown(e, 'n')} />
          <div className={styles.resizeS} onMouseDown={(e) => onResizeMouseDown(e, 's')} />
          <div className={styles.resizeE} onMouseDown={(e) => onResizeMouseDown(e, 'e')} />
          <div className={styles.resizeW} onMouseDown={(e) => onResizeMouseDown(e, 'w')} />
          <div className={styles.resizeNE} onMouseDown={(e) => onResizeMouseDown(e, 'ne')} />
          <div className={styles.resizeSE} onMouseDown={(e) => onResizeMouseDown(e, 'se')} />
          <div className={styles.resizeSW} onMouseDown={(e) => onResizeMouseDown(e, 'sw')} />
          <div className={styles.resizeNW} onMouseDown={(e) => onResizeMouseDown(e, 'nw')} />
        </>
      )}

      {/* ── Title Bar ── */}
      <div
        className={`${styles.titlebar} ${isActive ? styles.titlebarActive : ''}`}
        onMouseDown={onTitlebarMouseDown}
      >
        <div className={styles.titleLeft}>
          <DynamicIcon name={icon} size={16} />
          <span className={styles.titleText}>{title}</span>
        </div>
        <div className={styles.controls}>
          <button className={styles.winBtn} onClick={() => minimizeWindow(id)} aria-label="Minimize">
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <rect x="0" y="6" width="8" height="2" fill="#000" />
            </svg>
          </button>
          <button className={styles.winBtn} onClick={() => toggleMaximize(id)} aria-label="Maximize">
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <rect x="0" y="0" width="8" height="8" fill="none" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
          <button
            className={`${styles.winBtn} ${styles.closeBtn}`}
            onClick={() => closeWindow(id)}
            aria-label="Close"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="2" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Menu Bar ── */}
      {menus && menus.length > 0 && (
        <div className={styles.menubar} data-menu-bar>
          {menus.map((menu, menuIdx) => (
            <div key={menu.label} className={styles.menuWrapper}>
              <span
                className={`${styles.menuLabel} ${openMenuIdx === menuIdx ? styles.menuLabelOpen : ''}`}
                onMouseDown={() => setOpenMenuIdx(openMenuIdx === menuIdx ? null : menuIdx)}
                onMouseEnter={() => { if (openMenuIdx !== null) setOpenMenuIdx(menuIdx); }}
              >
                {menu.label}
              </span>
              {openMenuIdx === menuIdx && (
                <div className={styles.dropdown}>
                  {menu.items.map((item, i) =>
                    item.separator ? (
                      <div key={i} className={styles.dropdownSep} />
                    ) : (
                      <div
                        key={item.action ?? i}
                        className={`${styles.dropdownItem} ${item.disabled ? styles.dropdownItemDisabled : ''}`}
                        onClick={() => {
                          if (!item.disabled && item.action) handleMenuItemClick(item.action);
                        }}
                      >
                        <span className={styles.dropdownCheck}>
                          {item.checked ? '\u2713' : ''}
                        </span>
                        <span className={styles.dropdownItemLabel}>{item.label}</span>
                        {item.shortcut && (
                          <span className={styles.dropdownShortcut}>{item.shortcut}</span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <MenuCallbackContext.Provider value={ctxValue}>
        <div className={styles.body}>{children}</div>
      </MenuCallbackContext.Provider>
    </motion.div>
  );
}
