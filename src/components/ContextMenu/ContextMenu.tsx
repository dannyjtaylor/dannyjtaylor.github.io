import { useEffect, useState, useCallback } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import { Sounds } from '../../utils/sounds';
import styles from './ContextMenu.module.css';

/* ── Sub-menu component ── */
function SubMenu({ label, items }: { label: string; items: { label: string; onClick: () => void; disabled?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={styles.itemSub}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span>{label}</span>
      <span className={styles.arrow}>&#9654;</span>
      {open && (
        <div className={styles.submenu}>
          {items.map((it) => (
            <div
              key={it.label}
              className={it.disabled ? styles.itemDisabled : styles.item}
              onClick={() => { if (!it.disabled) it.onClick(); }}
            >
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContextMenu() {
  const contextMenu = useDesktopStore((s) => s.contextMenu);
  const hideContextMenu = useDesktopStore((s) => s.hideContextMenu);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const closeWindow = useDesktopStore((s) => s.closeWindow);
  const arrangeIcons = useDesktopStore((s) => s.arrangeIcons);
  const addDesktopItem = useDesktopStore((s) => s.addDesktopItem);
  const showProperties = useDesktopStore((s) => s.showProperties);
  const showSaveAsDialog = useDesktopStore((s) => s.showSaveAsDialog);
  const dynamicItems = useDesktopStore((s) => s.dynamicItems);
  const fileSystem = useDesktopStore((s) => s.fileSystem);
  const setRenamingIconId = useDesktopStore((s) => s.setRenamingIconId);
  const selectedIcons = useDesktopStore((s) => s.selectedIcons);
  const moveToRecycleBin = useDesktopStore((s) => s.moveToRecycleBin);
  const moveStaticToRecycleBin = useDesktopStore((s) => s.moveStaticToRecycleBin);
  const emptyRecycleBin = useDesktopStore((s) => s.emptyRecycleBin);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handle = () => hideContextMenu();
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, [contextMenu.visible, hideContextMenu]);

  // Clipboard helpers
  const clipCopy = useCallback(async () => {
    const sel = window.getSelection()?.toString() || '';
    const el = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
    const text = sel || (el && 'value' in el ? el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0) : '');
    if (text) {
      try { await navigator.clipboard.writeText(text); } catch { document.execCommand('copy'); }
    }
  }, []);

  const clipCut = useCallback(async () => {
    await clipCopy();
    document.execCommand('delete');
  }, [clipCopy]);

  const clipPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertText', false, text);
    } catch {
      document.execCommand('paste');
    }
  }, []);

  const selectAll = useCallback(() => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (el && 'select' in el) el.select();
    else document.execCommand('selectAll');
  }, []);

  const deleteSelection = useCallback(() => {
    document.execCommand('delete');
  }, []);

  // Wrap hideContextMenu to play click sound on any menu item selection
  const hideWithSound = useCallback(() => {
    Sounds.click();
    hideContextMenu();
  }, [hideContextMenu]);

  if (!contextMenu.visible) return null;

  const { variant, targetId } = contextMenu;

  /* ── Desktop right-click ── */
  if (variant === 'desktop') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <SubMenu label="Arrange Icons" items={[
          { label: 'by Name', onClick: () => { arrangeIcons(); hideWithSound(); } },
          { label: 'by Type', onClick: () => { arrangeIcons(); hideWithSound(); } },
          { label: 'by Size', onClick: () => { arrangeIcons(); hideWithSound(); } },
          { label: 'by Date', onClick: () => { arrangeIcons(); hideWithSound(); } },
          { label: 'Auto Arrange', onClick: () => { arrangeIcons(); hideWithSound(); } },
        ]} />
        <div className={styles.item} onClick={() => { arrangeIcons(); hideWithSound(); }}>
          Line up Icons
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideWithSound(); window.location.reload(); }}>
          Refresh
        </div>
        <div className={styles.separator} />
        <SubMenu label="Programs" items={[
          { label: 'About Me', onClick: () => { openWindow('about'); hideWithSound(); } },
          { label: 'AOL Messenger', onClick: () => { openWindow('aol'); hideWithSound(); } },
          { label: 'Breadbox', onClick: () => { openWindow('breadbox'); hideWithSound(); } },
          { label: 'Cave Story', onClick: () => { openWindow('cavestory'); hideWithSound(); } },
          { label: 'Contact', onClick: () => { openWindow('contact'); hideWithSound(); } },
          { label: 'Cookie Clicker', onClick: () => { openWindow('cookieclicker'); hideWithSound(); } },
          { label: 'NYT Games', onClick: () => { openWindow('nytgames'); hideWithSound(); } },
          { label: 'Date/Time', onClick: () => { openWindow('datetime'); hideWithSound(); } },
          { label: '/gather Bot', onClick: () => { openWindow('discord'); hideWithSound(); } },
          { label: 'Interests', onClick: () => { openWindow('interests'); hideWithSound(); } },
          { label: 'Minesweeper', onClick: () => { openWindow('minesweeper'); hideWithSound(); } },
          { label: 'MS-DOS Prompt', onClick: () => { openWindow('terminal'); hideWithSound(); } },
          { label: 'Music Player', onClick: () => { openWindow('musicplayer'); hideWithSound(); } },
          { label: 'My Computer', onClick: () => { openWindow('mycomputer'); hideWithSound(); } },
          { label: 'Paint', onClick: () => { openWindow('paint'); hideWithSound(); } },
          { label: 'Portfolio', onClick: () => { openWindow('portfolio'); hideWithSound(); } },
          { label: 'Projects', onClick: () => { openWindow('projects'); hideWithSound(); } },
          { label: 'Resume', onClick: () => { openWindow('resume'); hideWithSound(); } },
          { label: 'Settings', onClick: () => { openWindow('settings'); hideWithSound(); } },
          { label: 'Steam', onClick: () => { openWindow('steam'); hideWithSound(); } },
          { label: 'Transcript', onClick: () => { openWindow('transcript'); hideWithSound(); } },
          { label: 'UNDERTALE', onClick: () => { openWindow('undertale'); hideWithSound(); } },
          { label: 'VALORANT', onClick: () => { openWindow('valorant'); hideWithSound(); } },
        ]} />
        {dynamicItems.length > 0 && (
          <SubMenu label="Documents" items={dynamicItems.map((d) => ({
            label: d.label,
            onClick: () => { openWindow(d.windowId); hideWithSound(); },
          }))} />
        )}
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Paste</div>
        <div className={styles.itemDisabled}>Paste Shortcut</div>
        <div className={styles.separator} />
        <SubMenu label="New" items={[
          { label: 'Folder', onClick: () => { addDesktopItem('folder'); hideWithSound(); } },
          { label: 'Text Document', onClick: () => { addDesktopItem('notepad'); hideWithSound(); } },
          { label: 'Bitmap Image', onClick: () => { useDesktopStore.getState().addDesktopItemWithType('paint'); hideWithSound(); } },
        ]} />
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideWithSound();
          openWindow('settings');
        }}>
          Settings
        </div>
        <div className={styles.item} onClick={() => {
          hideWithSound();
          showProperties('Desktop Properties', {
            'System': 'DannyOS 95',
            'Version': '4.0 (Build 2004)',
            'Manufacturer': 'DJTech Industries',
            'Display': `${window.innerWidth} x ${window.innerHeight}`,
            'Colors': 'True Color (32 bit)',
          });
        }}>
          Properties
        </div>
      </div>
    );
  }

  /* ── Icon right-click ── */
  if (variant === 'icon') {
    const iconLabels: Record<string, string> = {
      about: 'About Me', projects: 'Projects', resume: 'Resume', contact: 'Contact',
      mycomputer: 'My Computer', recycle: 'Recycle Bin', terminal: 'MS-DOS Prompt',
      valorant: 'VALORANT', undertale: 'UNDERTALE', portfolio: 'Portfolio',
      transcript: 'Transcript', swresume: 'SW Resume', ewresume: 'EW Resume',
      discord: '/gather Bot', cavestory: 'Cave Story', interests: 'Interests',
      breadbox: 'Breadbox', aol: 'AOL Messenger', paint: 'Paint',
      settings: 'Display Properties', datetime: 'Date/Time Properties',
      steam: 'Steam',
      musicplayer: 'Music Player',
    };

    // Map from static icon IDs (icon-about, icon-paint, etc.) to their windowId and metadata
    const staticIconMap: Record<string, { label: string; icon: string; windowId: string }> = {
      'icon-about':      { label: 'About Me',       icon: 'document',  windowId: 'about' },
      'icon-projects':   { label: 'Projects',       icon: 'file',      windowId: 'projects' },
      'icon-resume':     { label: 'Resume',         icon: 'notepad',   windowId: 'resume' },
      'icon-contact':    { label: 'Contact',        icon: 'mail',      windowId: 'contact' },
      'icon-mycomputer': { label: 'My Computer',    icon: 'computer',  windowId: 'mycomputer' },
      'icon-recycle':    { label: 'Recycle Bin',    icon: 'recycle',   windowId: 'recycle' },
      'icon-terminal':   { label: 'MS-DOS',         icon: 'console',   windowId: 'terminal' },
      'icon-portfolio':  { label: 'Portfolio',      icon: 'document',  windowId: 'portfolio' },
      'icon-transcript': { label: 'Transcript',     icon: 'notepad',   windowId: 'transcript' },
      'icon-discord':    { label: '/gather Bot',    icon: 'discord',   windowId: 'discord' },
      'icon-interests':  { label: 'Interests',      icon: 'document',  windowId: 'interests' },
      'icon-breadbox':   { label: 'Breadbox',       icon: 'breadbox',  windowId: 'breadbox' },
      'icon-minesweeper':{ label: 'Minesweeper',    icon: 'minesweeper', windowId: 'minesweeper' },
      'icon-steam':      { label: 'Steam',          icon: 'steam',     windowId: 'steam' },
      'icon-aol':        { label: 'AOL Messenger',  icon: 'aol',       windowId: 'aol' },
      'icon-paint':      { label: 'Paint',          icon: 'paint',     windowId: 'paint' },
      'icon-datetime':   { label: 'Date/Time',      icon: 'datetime',  windowId: 'datetime' },
      'icon-settings':   { label: 'Settings',       icon: 'settings',  windowId: 'settings' },
      'icon-musicplayer':{ label: 'Music Player',   icon: 'musicplayer', windowId: 'musicplayer' },
      'icon-credits':    { label: 'Credits',        icon: 'credits',     windowId: 'credits' },
    };

    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={`${styles.item} ${styles.itemBold}`} onClick={() => {
          if (targetId) openWindow(targetId);
          hideWithSound();
        }}>
          Open
        </div>
        <div className={styles.item} onClick={() => {
          if (targetId) openWindow(targetId);
          hideWithSound();
        }}>
          Explore
        </div>
        {/* Empty Recycle Bin — only for recycle bin icon */}
        {targetId === 'recycle' && (
          <div className={styles.item} onClick={() => {
            emptyRecycleBin();
            hideWithSound();
          }}>
            Empty Recycle Bin
          </div>
        )}
        {/* Save As — only for dynamic notepad items */}
        {(() => {
          const dynItem = targetId ? dynamicItems.find((d) => d.windowId === targetId) : null;
          if (dynItem && dynItem.type === 'notepad' && !dynItem.label.endsWith('.bmp')) {
            return (
              <div className={styles.item} onClick={() => {
                const content = fileSystem[targetId!] ?? '';
                showSaveAsDialog(content, targetId!);
                hideWithSound();
              }}>
                Save As...
              </div>
            );
          }
          return null;
        })()}
        <div className={styles.separator} />
        <SubMenu label="Send To" items={[
          { label: '3\u00BD Floppy (A:)', onClick: () => {
            hideWithSound();
            showProperties('Error', { 'Message': 'Drive A: is not ready.', 'Drive': 'A:\\' });
          }},
          { label: 'Desktop as Shortcut', onClick: () => {
            hideWithSound();
            showProperties('Information', { 'Message': 'Shortcut already exists on desktop.' });
          }},
          { label: 'Mail Recipient', onClick: () => { hideWithSound(); openWindow('contact'); } },
        ]} />
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Cut</div>
        <div className={styles.itemDisabled}>Copy</div>
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Create Shortcut</div>
        <div className={styles.item} onClick={() => {
          // First check: Recycle Bin itself cannot be deleted
          if (targetId === 'recycle') {
            hideWithSound();
            showProperties('Error', {
              'Message': 'Cannot delete Recycle Bin.',
              'Reason': 'This is a system item.',
            });
            return;
          }

          // Try dynamic item first
          const dynItem = targetId ? dynamicItems.find((d) => d.id === targetId || d.windowId === targetId) : null;
          if (dynItem) {
            moveToRecycleBin(dynItem.id);
            hideWithSound();
            return;
          }

          // Try static icon — find the icon ID from selected icons
          const iconId = [...selectedIcons][0] ?? null;
          const staticInfo = iconId ? staticIconMap[iconId] : null;
          if (staticInfo) {
            moveStaticToRecycleBin(iconId!, staticInfo.label, staticInfo.icon, staticInfo.windowId);
            hideWithSound();
            return;
          }

          // Fallback: try matching targetId as a windowId to a static icon
          const staticEntry = Object.entries(staticIconMap).find(([, v]) => v.windowId === targetId);
          if (staticEntry) {
            const [sIconId, sInfo] = staticEntry;
            moveStaticToRecycleBin(sIconId, sInfo.label, sInfo.icon, sInfo.windowId);
            hideWithSound();
            return;
          }

          // Nothing matched
          if (targetId) closeWindow(targetId);
          hideWithSound();
          showProperties('Error', {
            'Message': `Cannot delete ${iconLabels[targetId ?? ''] ?? 'this item'}.`,
            'Reason': 'Access is denied.',
          });
        }}>
          Delete
        </div>
        <div className={styles.item} onClick={() => {
          hideWithSound();
          // Find the icon id from selectedIcons
          const iconId = [...selectedIcons][0] ?? null;
          if (iconId) {
            setRenamingIconId(iconId);
          }
        }}>
          Rename
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideWithSound();
          showProperties(`${iconLabels[targetId ?? ''] ?? 'Item'} Properties`, {
            'Type': 'Application',
            'Location': 'C:\\WINDOWS\\Desktop',
            'Size': `${Math.floor(Math.random() * 500 + 50)} KB`,
            'Created': 'January 1, 2004',
          });
        }}>
          Properties
        </div>
      </div>
    );
  }

  /* ── Notepad / text area right-click ── */
  if (variant === 'notepad') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={styles.itemDisabled}>Undo</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideWithSound(); requestAnimationFrame(clipCut); }}>Cut</div>
        <div className={styles.item} onClick={() => { hideWithSound(); requestAnimationFrame(clipCopy); }}>Copy</div>
        <div className={styles.item} onClick={() => { hideWithSound(); requestAnimationFrame(clipPaste); }}>Paste</div>
        <div className={styles.item} onClick={() => { hideWithSound(); requestAnimationFrame(deleteSelection); }}>Delete</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideWithSound(); requestAnimationFrame(selectAll); }}>Select All</div>
      </div>
    );
  }

  /* ── Explorer right-click ── */
  if (variant === 'explorer') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <SubMenu label="View" items={[
          { label: 'Large Icons', onClick: () => hideWithSound() },
          { label: 'Small Icons', onClick: () => hideWithSound() },
          { label: 'List', onClick: () => hideWithSound() },
          { label: 'Details', onClick: () => hideWithSound() },
        ]} />
        <SubMenu label="Arrange Icons" items={[
          { label: 'by Name', onClick: () => hideWithSound() },
          { label: 'by Type', onClick: () => hideWithSound() },
          { label: 'by Size', onClick: () => hideWithSound() },
          { label: 'by Date', onClick: () => hideWithSound() },
        ]} />
        <div className={styles.item} onClick={hideWithSound}>Line up Icons</div>
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Paste</div>
        <div className={styles.itemDisabled}>Paste Shortcut</div>
        <div className={styles.separator} />
        <SubMenu label="New" items={[
          { label: 'Folder', onClick: () => {
            hideWithSound();
            showProperties('Information', { 'Message': 'Cannot create new items here.' });
          }},
          { label: 'Text Document', onClick: () => {
            hideWithSound();
            showProperties('Information', { 'Message': 'Cannot create new items here.' });
          }},
        ]} />
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideWithSound();
          showProperties('Folder Properties', {
            'Type': 'File Folder',
            'Location': 'C:\\',
            'Contains': 'Files and Folders',
            'Created': 'January 1, 2004',
          });
        }}>
          Properties
        </div>
      </div>
    );
  }

  /* ── Explorer item right-click (files/folders inside explorer windows) ── */
  if (variant === 'explorer-item') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={`${styles.item} ${styles.itemBold}`} onClick={() => {
          if (targetId) openWindow(targetId);
          hideWithSound();
        }}>
          Open
        </div>
        <div className={styles.item} onClick={() => {
          if (targetId) openWindow(targetId);
          hideWithSound();
        }}>
          Explore
        </div>
        <div className={styles.separator} />
        <SubMenu label="Send To" items={[
          { label: '3\u00BD Floppy (A:)', onClick: () => {
            hideWithSound();
            showProperties('Error', { 'Message': 'Drive A: is not ready.', 'Drive': 'A:\\' });
          }},
          { label: 'Desktop as Shortcut', onClick: () => {
            hideWithSound();
            showProperties('Information', { 'Message': 'Shortcut created on desktop.' });
          }},
          { label: 'Mail Recipient', onClick: () => { hideWithSound(); openWindow('contact'); } },
        ]} />
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Cut</div>
        <div className={styles.itemDisabled}>Copy</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideWithSound();
          showProperties('Item Properties', {
            'Type': 'File',
            'Location': 'C:\\',
            'Size': `${Math.floor(Math.random() * 500 + 50)} KB`,
            'Created': 'January 1, 2004',
          });
        }}>
          Properties
        </div>
      </div>
    );
  }

  return null;
}
