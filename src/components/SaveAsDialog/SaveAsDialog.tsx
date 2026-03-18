import { useState, useRef, useEffect } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './SaveAsDialog.module.css';

export function SaveAsDialog() {
  const dialog = useDesktopStore((s) => s.saveAsDialog);
  const hideSaveAsDialog = useDesktopStore((s) => s.hideSaveAsDialog);
  const addDesktopItemWithType = useDesktopStore((s) => s.addDesktopItemWithType);
  const saveFile = useDesktopStore((s) => s.saveFile);
  const openWindow = useDesktopStore((s) => s.openWindow);

  const [filename, setFilename] = useState('Untitled.txt');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset filename when dialog opens
  useEffect(() => {
    if (dialog?.visible) {
      setFilename('Untitled.txt');
      // Focus and select filename (without extension)
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          const dotIndex = 'Untitled.txt'.lastIndexOf('.');
          input.setSelectionRange(0, dotIndex > 0 ? dotIndex : input.value.length);
        }
      });
    }
  }, [dialog?.visible]);

  if (!dialog || !dialog.visible) return null;

  const handleSave = () => {
    const name = filename.trim() || 'Untitled.txt';
    // Ensure .txt extension
    const finalName = name.endsWith('.txt') ? name : `${name}.txt`;

    // Create a new desktop item and get its ID (which is also the windowId / fileId)
    const newId = addDesktopItemWithType('notepad', finalName);

    // Save the content to the filesystem under the new item's ID
    saveFile(newId, dialog.content);

    // Open the newly created file
    openWindow(newId);

    hideSaveAsDialog();
  };

  const handleCancel = () => {
    hideSaveAsDialog();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Title bar */}
        <div className={styles.titlebar}>
          <span>Save As</span>
          <button className={styles.closeBtn} onClick={handleCancel} aria-label="Close">
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="2" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* File name field */}
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>File name:</span>
            <input
              ref={inputRef}
              className={styles.filenameInput}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>

          {/* Save as type */}
          <div className={styles.saveTypeRow}>
            <span className={styles.saveTypeLabel}>Save as type:</span>
            <select className={styles.saveTypeSelect} disabled>
              <option>Text Documents (*.txt)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={styles.btnPrimary} onClick={handleSave}>Save</button>
            <button className={styles.btn} onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
