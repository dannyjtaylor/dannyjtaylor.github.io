import { useEffect, useState, useCallback } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
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

  if (!contextMenu.visible) return null;

  const { variant, targetId } = contextMenu;

  /* ── Desktop right-click ── */
  if (variant === 'desktop') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <SubMenu label="Arrange Icons" items={[
          { label: 'by Name', onClick: () => { arrangeIcons(); hideContextMenu(); } },
          { label: 'by Type', onClick: () => { arrangeIcons(); hideContextMenu(); } },
          { label: 'by Size', onClick: () => { arrangeIcons(); hideContextMenu(); } },
          { label: 'by Date', onClick: () => { arrangeIcons(); hideContextMenu(); } },
          { label: 'Auto Arrange', onClick: () => { arrangeIcons(); hideContextMenu(); } },
        ]} />
        <div className={styles.item} onClick={() => { arrangeIcons(); hideContextMenu(); }}>
          Line up Icons
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideContextMenu(); window.location.reload(); }}>
          Refresh
        </div>
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Paste</div>
        <div className={styles.itemDisabled}>Paste Shortcut</div>
        <div className={styles.separator} />
        <SubMenu label="New" items={[
          { label: 'Folder', onClick: () => { addDesktopItem('folder'); hideContextMenu(); } },
          { label: 'Text Document', onClick: () => { addDesktopItem('notepad'); hideContextMenu(); } },
        ]} />
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideContextMenu();
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
      discord: '/gather Bot', cavestory: 'Cave Story', interests: 'Interests', dotcard: 'dot.card',
    };

    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <div className={`${styles.item} ${styles.itemBold}`} onClick={() => {
          if (targetId) openWindow(targetId);
          hideContextMenu();
        }}>
          Open
        </div>
        <div className={styles.item} onClick={() => {
          if (targetId) openWindow(targetId);
          hideContextMenu();
        }}>
          Explore
        </div>
        <div className={styles.separator} />
        <SubMenu label="Send To" items={[
          { label: '3\u00BD Floppy (A:)', onClick: () => {
            hideContextMenu();
            showProperties('Error', { 'Message': 'Drive A: is not ready.', 'Drive': 'A:\\' });
          }},
          { label: 'Desktop as Shortcut', onClick: () => {
            hideContextMenu();
            showProperties('Information', { 'Message': 'Shortcut already exists on desktop.' });
          }},
          { label: 'Mail Recipient', onClick: () => { hideContextMenu(); openWindow('contact'); } },
        ]} />
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Cut</div>
        <div className={styles.itemDisabled}>Copy</div>
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Create Shortcut</div>
        <div className={styles.item} onClick={() => {
          if (targetId) closeWindow(targetId);
          hideContextMenu();
          showProperties('Error', {
            'Message': `Cannot delete ${iconLabels[targetId ?? ''] ?? 'this item'}.`,
            'Reason': 'Access is denied.',
          });
        }}>
          Delete
        </div>
        <div className={styles.item} onClick={() => {
          hideContextMenu();
          showProperties('Error', {
            'Message': 'Cannot rename system items.',
            'Reason': 'This is a system object.',
          });
        }}>
          Rename
        </div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideContextMenu();
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
        <div className={styles.item} onClick={() => { hideContextMenu(); requestAnimationFrame(clipCut); }}>Cut</div>
        <div className={styles.item} onClick={() => { hideContextMenu(); requestAnimationFrame(clipCopy); }}>Copy</div>
        <div className={styles.item} onClick={() => { hideContextMenu(); requestAnimationFrame(clipPaste); }}>Paste</div>
        <div className={styles.item} onClick={() => { hideContextMenu(); requestAnimationFrame(deleteSelection); }}>Delete</div>
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => { hideContextMenu(); requestAnimationFrame(selectAll); }}>Select All</div>
      </div>
    );
  }

  /* ── Explorer right-click ── */
  if (variant === 'explorer') {
    return (
      <div className={styles.menu} style={{ left: contextMenu.x, top: contextMenu.y }}>
        <SubMenu label="View" items={[
          { label: 'Large Icons', onClick: () => hideContextMenu() },
          { label: 'Small Icons', onClick: () => hideContextMenu() },
          { label: 'List', onClick: () => hideContextMenu() },
          { label: 'Details', onClick: () => hideContextMenu() },
        ]} />
        <SubMenu label="Arrange Icons" items={[
          { label: 'by Name', onClick: () => hideContextMenu() },
          { label: 'by Type', onClick: () => hideContextMenu() },
          { label: 'by Size', onClick: () => hideContextMenu() },
          { label: 'by Date', onClick: () => hideContextMenu() },
        ]} />
        <div className={styles.item} onClick={hideContextMenu}>Line up Icons</div>
        <div className={styles.separator} />
        <div className={styles.itemDisabled}>Paste</div>
        <div className={styles.itemDisabled}>Paste Shortcut</div>
        <div className={styles.separator} />
        <SubMenu label="New" items={[
          { label: 'Folder', onClick: () => {
            hideContextMenu();
            showProperties('Information', { 'Message': 'Cannot create new items here.' });
          }},
          { label: 'Text Document', onClick: () => {
            hideContextMenu();
            showProperties('Information', { 'Message': 'Cannot create new items here.' });
          }},
        ]} />
        <div className={styles.separator} />
        <div className={styles.item} onClick={() => {
          hideContextMenu();
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

  return null;
}
