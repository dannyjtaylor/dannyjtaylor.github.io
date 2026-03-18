import { useEffect, useCallback, useRef, type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DesktopIcon } from '../DesktopIcon/DesktopIcon';
import { Taskbar } from '../Taskbar/Taskbar';
import { StartMenu } from '../StartMenu/StartMenu';
import { ShutdownDialog } from '../ShutdownDialog/ShutdownDialog';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PropertiesDialog } from '../PropertiesDialog/PropertiesDialog';
import { DisplayProperties } from '../DisplayProperties/DisplayProperties';
import { Window } from '../Window/Window';
import { AboutMe } from '../../windows/AboutMe';
import { Projects } from '../../windows/Projects';
import { Resume } from '../../windows/Resume';
import { Contact } from '../../windows/Contact';
import { MyComputer } from '../../windows/MyComputer';
import { RecycleBin } from '../../windows/RecycleBin';
import { Terminal } from '../../windows/Terminal';
import { Valorant } from '../../windows/Valorant';
import { Undertale } from '../../windows/Undertale';
import { Portfolio } from '../../windows/Portfolio';
import { Transcript } from '../../windows/Transcript';
import { Minesweeper } from '../../windows/Minesweeper';
import { DiscordBot } from '../../windows/DiscordBot';
import { CaveStory } from '../../windows/CaveStory';
import { Interests } from '../../windows/Interests';
import { DotCard } from '../../windows/DotCard';
import { Voltbox } from '../../windows/Voltbox';
import { DynamicNotepad } from '../../windows/DynamicNotepad';
import type { DesktopIconConfig, WindowConfig, MenuConfig } from '../../types';
import styles from './Desktop.module.css';

/* ── Menu Configurations ── */

const NOTEPAD_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'New', action: 'file-new', shortcut: 'Ctrl+N' },
      { label: 'Open...', action: 'file-open', shortcut: 'Ctrl+O', disabled: true },
      { label: 'Save', action: 'file-save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', action: 'file-save-as' },
      { separator: true },
      { label: 'Page Setup...', action: 'file-page-setup', disabled: true },
      { label: 'Print...', action: 'file-print', shortcut: 'Ctrl+P', disabled: true },
      { separator: true },
      { label: 'Exit', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z' },
      { separator: true },
      { label: 'Cut', action: 'edit-cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', action: 'edit-copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', action: 'edit-paste', shortcut: 'Ctrl+V' },
      { label: 'Delete', action: 'edit-delete', shortcut: 'Del' },
      { separator: true },
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A' },
      { label: 'Time/Date', action: 'edit-time-date', shortcut: 'F5' },
    ],
  },
  {
    label: 'Format',
    items: [
      { label: 'Word Wrap', action: 'format-word-wrap', checked: false },
      { label: 'Font...', action: 'format-font', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Status Bar', action: 'view-status-bar', checked: false },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Help Topics', action: 'help-topics', disabled: true },
      { separator: true },
      { label: 'About Notepad', action: 'help-about' },
    ],
  },
];

const EXPLORER_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'Open', action: 'file-open', disabled: true },
      { label: 'Explore', action: 'file-explore', disabled: true },
      { separator: true },
      { label: 'Close', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A', disabled: true },
      { label: 'Invert Selection', action: 'edit-invert', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Large Icons', action: 'view-large', checked: true },
      { label: 'Small Icons', action: 'view-small' },
      { label: 'List', action: 'view-list' },
      { label: 'Details', action: 'view-details' },
      { separator: true },
      { label: 'Refresh', action: 'view-refresh', shortcut: 'F5' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'About Windows', action: 'help-about' },
    ],
  },
];

const MAIL_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'Send', action: 'file-send', shortcut: 'Ctrl+Enter', disabled: true },
      { label: 'Save', action: 'file-save', shortcut: 'Ctrl+S', disabled: true },
      { separator: true },
      { label: 'Close', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Cut', action: 'edit-cut', shortcut: 'Ctrl+X', disabled: true },
      { label: 'Copy', action: 'edit-copy', shortcut: 'Ctrl+C', disabled: true },
      { label: 'Paste', action: 'edit-paste', shortcut: 'Ctrl+V', disabled: true },
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toolbar', action: 'view-toolbar', checked: true, disabled: true },
      { label: 'Status Bar', action: 'view-status-bar', checked: true, disabled: true },
    ],
  },
  {
    label: 'Insert',
    items: [
      { label: 'File Attachment...', action: 'insert-attachment', disabled: true },
      { label: 'Signature', action: 'insert-signature', disabled: true },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'About Internet Mail', action: 'help-about' },
    ],
  },
];

const ICONS: DesktopIconConfig[] = [
  { id: 'icon-about',      label: 'About Me',       icon: 'document',  windowId: 'about' },
  { id: 'icon-projects',   label: 'Projects',       icon: 'file',      windowId: 'projects' },
  { id: 'icon-resume',     label: 'Resume',         icon: 'notepad',   windowId: 'resume' },
  { id: 'icon-minesweeper',label: 'Minesweeper',    icon: 'minesweeper', windowId: 'minesweeper' },
  { id: 'icon-contact',    label: 'Contact',        icon: 'mail',      windowId: 'contact' },
  { id: 'icon-mycomputer', label: 'My Computer',    icon: 'computer',  windowId: 'mycomputer' },
  { id: 'icon-recycle',    label: 'Recycle Bin',    icon: 'recycle',   windowId: 'recycle' },
  { id: 'icon-terminal',   label: 'MS-DOS',         icon: 'console',   windowId: 'terminal' },
  { id: 'icon-valorant',   label: 'VALORANT',       icon: 'valorant',  windowId: 'valorant' },
  { id: 'icon-undertale',  label: 'UNDERTALE',      icon: 'undertale', windowId: 'undertale' },
  { id: 'icon-portfolio',  label: 'Portfolio',      icon: 'document',  windowId: 'portfolio' },
  { id: 'icon-transcript', label: 'Transcript',     icon: 'notepad',   windowId: 'transcript' },
  { id: 'icon-discord',    label: '/gather Bot',    icon: 'discord',   windowId: 'discord' },
  { id: 'icon-cavestory',  label: 'Cave Story',     icon: 'cavestory', windowId: 'cavestory' },
  { id: 'icon-interests',  label: 'Interests',      icon: 'document',  windowId: 'interests' },
  { id: 'icon-dotcard',    label: 'dot.card',       icon: 'document',  windowId: 'dotcard' },
  { id: 'icon-voltbox',   label: 'Voltbox',        icon: 'voltbox',   windowId: 'voltbox' },
];

const WINDOWS: WindowConfig[] = [
  { id: 'about',      title: 'About Me - Notepad',    icon: 'document',  defaultWidth: 500, defaultHeight: 380, defaultX: 80,  defaultY: 40,  menus: NOTEPAD_MENUS },
  { id: 'projects',   title: 'C:\\Projects',            icon: 'file',      defaultWidth: 540, defaultHeight: 400, defaultX: 140, defaultY: 60,  menus: EXPLORER_MENUS },
  { id: 'resume',     title: 'Resume.txt - Notepad',   icon: 'notepad',   defaultWidth: 520, defaultHeight: 420, defaultX: 120, defaultY: 50,  menus: NOTEPAD_MENUS },
  { id: 'contact',    title: 'New Message',             icon: 'mail',      defaultWidth: 460, defaultHeight: 340, defaultX: 160, defaultY: 80,  menus: MAIL_MENUS },
  { id: 'mycomputer', title: 'My Computer',             icon: 'computer',  defaultWidth: 480, defaultHeight: 360, defaultX: 100, defaultY: 40,  menus: EXPLORER_MENUS },
  { id: 'recycle',    title: 'Recycle Bin',             icon: 'recycle',   defaultWidth: 420, defaultHeight: 300, defaultX: 200, defaultY: 100, menus: EXPLORER_MENUS },
  { id: 'terminal',   title: 'MS-DOS Prompt',           icon: 'console',   defaultWidth: 560, defaultHeight: 380, defaultX: 60,  defaultY: 30 },
  { id: 'valorant',   title: 'VALORANT',                icon: 'valorant',  defaultWidth: 520, defaultHeight: 400, defaultX: 90,  defaultY: 35 },
  { id: 'undertale',  title: 'UNDERTALE',               icon: 'undertale', defaultWidth: 320, defaultHeight: 380, defaultX: 150, defaultY: 30 },
  { id: 'portfolio',  title: 'Portfolio.txt - Notepad', icon: 'document',  defaultWidth: 520, defaultHeight: 440, defaultX: 110, defaultY: 35,  menus: NOTEPAD_MENUS },
  { id: 'transcript', title: 'Transcript.txt - Notepad',icon: 'notepad',   defaultWidth: 500, defaultHeight: 460, defaultX: 130, defaultY: 25,  menus: NOTEPAD_MENUS },
  { id: 'minesweeper',title: 'Minesweeper',              icon: 'minesweeper', defaultWidth: 200, defaultHeight: 260, defaultX: 200, defaultY: 60 },
  { id: 'discord',    title: '/gather Discord Bot',     icon: 'discord',   defaultWidth: 360, defaultHeight: 260, defaultX: 180, defaultY: 70 },
  { id: 'cavestory',  title: 'Cave Story',              icon: 'cavestory', defaultWidth: 640, defaultHeight: 480, defaultX: 80,  defaultY: 20 },
  { id: 'interests',  title: 'Interests',               icon: 'document',  defaultWidth: 440, defaultHeight: 460, defaultX: 120, defaultY: 30 },
  { id: 'dotcard',    title: 'dot.card - Daniel Taylor',icon: 'document',  defaultWidth: 360, defaultHeight: 260, defaultX: 170, defaultY: 60 },
  { id: 'voltbox',   title: 'Voltbox.exe',              icon: 'voltbox',   defaultWidth: 900, defaultHeight: 640, defaultX: 40,  defaultY: 15 },
];

const WINDOW_CONTENT: Record<string, React.ComponentType> = {
  about: AboutMe,
  projects: Projects,
  resume: Resume,
  contact: Contact,
  mycomputer: MyComputer,
  recycle: RecycleBin,
  terminal: Terminal,
  valorant: Valorant,
  undertale: Undertale,
  portfolio: Portfolio,
  transcript: Transcript,
  minesweeper: Minesweeper,
  discord: DiscordBot,
  cavestory: CaveStory,
  interests: Interests,
  dotcard: DotCard,
  voltbox: Voltbox,
};

export function Desktop() {
  const registerWindow = useDesktopStore((s) => s.registerWindow);
  const windows = useDesktopStore((s) => s.windows);
  const clearSelection = useDesktopStore((s) => s.clearSelection);
  const closeStartMenu = useDesktopStore((s) => s.closeStartMenu);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const hideContextMenu = useDesktopStore((s) => s.hideContextMenu);
  const selectionBox = useDesktopStore((s) => s.selectionBox);
  const setSelectionBox = useDesktopStore((s) => s.setSelectionBox);
  const selectIconsInRect = useDesktopStore((s) => s.selectIconsInRect);
  const dynamicItems = useDesktopStore((s) => s.dynamicItems);
  const wallpaper = useDesktopStore((s) => s.wallpaper);
  const wallpaperStyle = useDesktopStore((s) => s.wallpaperStyle);

  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const w of WINDOWS) {
      registerWindow(w.id, {
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 100,
        x: w.defaultX,
        y: w.defaultY,
        width: w.defaultWidth,
        height: w.defaultHeight,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopClick = useCallback(() => {
    clearSelection();
    closeStartMenu();
    hideContextMenu();
  }, [clearSelection, closeStartMenu, hideContextMenu]);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'desktop');
    },
    [showContextMenu],
  );

  /* ── Rubber Band Selection ── */
  const selBoxRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Only start rubber band on left click directly on the icons area (not on an icon)
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target !== iconsRef.current) return;

      const rect = iconsRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      selBoxRef.current = { startX: x, startY: y };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!selBoxRef.current) return;
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        setSelectionBox({
          startX: selBoxRef.current.startX,
          startY: selBoxRef.current.startY,
          endX: mx,
          endY: my,
        });

        // Find icons within the rubber band
        const minX = Math.min(selBoxRef.current.startX, mx);
        const maxX = Math.max(selBoxRef.current.startX, mx);
        const minY = Math.min(selBoxRef.current.startY, my);
        const maxY = Math.max(selBoxRef.current.startY, my);

        const iconEls = iconsRef.current?.querySelectorAll('[data-icon-id]');
        const selected: string[] = [];
        iconEls?.forEach((el) => {
          const iconRect = el.getBoundingClientRect();
          const iconRelX = iconRect.left - rect.left;
          const iconRelY = iconRect.top - rect.top;
          const iconRight = iconRelX + iconRect.width;
          const iconBottom = iconRelY + iconRect.height;

          if (iconRelX < maxX && iconRight > minX && iconRelY < maxY && iconBottom > minY) {
            selected.push(el.getAttribute('data-icon-id')!);
          }
        });
        selectIconsInRect(selected);
      };

      const onUp = () => {
        selBoxRef.current = null;
        setSelectionBox(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [setSelectionBox, selectIconsInRect],
  );

  // All icons (static + dynamic)
  const allIcons = [
    ...ICONS,
    ...dynamicItems.map((d) => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      windowId: d.windowId,
    })),
  ];

  // All windows (static + dynamic)
  const allWindows = [
    ...WINDOWS,
    ...dynamicItems.map((d) => ({
      id: d.windowId,
      title: d.type === 'folder' ? d.label : `${d.label} - Notepad`,
      icon: d.icon,
      defaultWidth: d.type === 'folder' ? 420 : 480,
      defaultHeight: d.type === 'folder' ? 300 : 360,
      defaultX: 100,
      defaultY: 50,
      menus: d.type === 'notepad' ? NOTEPAD_MENUS : undefined,
    })),
  ];

  // Render rubber band rectangle
  const renderSelectionBox = () => {
    if (!selectionBox) return null;
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);
    return (
      <div className={styles.selectionBox} style={{ left, top, width, height }} />
    );
  };

  // Build wallpaper style dynamically
  const desktopStyle: React.CSSProperties = {};
  if (wallpaper) {
    desktopStyle.backgroundImage = `url(${wallpaper})`;
    if (wallpaperStyle === 'stretch') {
      desktopStyle.backgroundSize = 'cover';
      desktopStyle.backgroundPosition = 'center';
      desktopStyle.backgroundRepeat = 'no-repeat';
    } else if (wallpaperStyle === 'center') {
      desktopStyle.backgroundSize = 'contain';
      desktopStyle.backgroundPosition = 'center';
      desktopStyle.backgroundRepeat = 'no-repeat';
    } else {
      desktopStyle.backgroundSize = 'auto';
      desktopStyle.backgroundRepeat = 'repeat';
    }
  }

  return (
    <div className={styles.desktop} style={desktopStyle}>
      {/* Icon grid */}
      <div
        ref={iconsRef}
        className={styles.icons}
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
      >
        {allIcons.map((ic) => (
          <DesktopIcon
            key={ic.id}
            id={ic.id}
            label={ic.label}
            icon={ic.icon}
            windowId={ic.windowId}
          />
        ))}
        {renderSelectionBox()}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {allWindows.map((wc) => {
          const win = windows[wc.id];
          if (!win || !win.isOpen || win.isMinimized) return null;

          // Check if it's a dynamic notepad
          const dynItem = dynamicItems.find((d) => d.windowId === wc.id);
          const isStaticWindow = WINDOW_CONTENT[wc.id];

          let content: React.ReactNode;
          if (isStaticWindow) {
            const Content = isStaticWindow;
            content = <Content />;
          } else if (dynItem?.type === 'notepad') {
            content = <DynamicNotepad fileId={wc.id} />;
          } else {
            // Dynamic folder — show empty explorer
            content = (
              <div style={{ padding: 16, color: 'var(--win-dark)', textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                This folder is empty.
              </div>
            );
          }

          return (
            <Window
              key={wc.id}
              id={wc.id}
              title={wc.title}
              icon={wc.icon}
              menus={wc.menus}
            >
              {content}
            </Window>
          );
        })}
      </AnimatePresence>

      <ContextMenu />
      <PropertiesDialog />
      <DisplayProperties />
      <StartMenu />
      <ShutdownDialog />
      <Taskbar />
    </div>
  );
}
