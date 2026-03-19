import { useState, useRef, useEffect } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './SaveAsDialog.module.css';

export function SaveAsDialog() {
  const dialog = useDesktopStore((s) => s.saveAsDialog);
  const hideSaveAsDialog = useDesktopStore((s) => s.hideSaveAsDialog);
  const addDesktopItemWithType = useDesktopStore((s) => s.addDesktopItemWithType);
  const saveFile = useDesktopStore((s) => s.saveFile);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const closeWindow = useDesktopStore((s) => s.closeWindow);

  const isPaintFile = dialog?.content?.startsWith('data:image/') ?? false;
  const defaultFilename = isPaintFile ? 'Untitled.bmp' : 'Untitled.txt';

  const [filename, setFilename] = useState(defaultFilename);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset filename when dialog opens
  useEffect(() => {
    if (dialog?.visible) {
      const isImage = dialog.content?.startsWith('data:image/') ?? false;
      const defName = isImage ? 'Untitled.bmp' : 'Untitled.txt';
      setFilename(defName);
      // Focus and select filename (without extension)
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          const dotIndex = defName.lastIndexOf('.');
          input.setSelectionRange(0, dotIndex > 0 ? dotIndex : input.value.length);
        }
      });
    }
  }, [dialog?.visible, dialog?.content]);

  if (!dialog || !dialog.visible) return null;

  const handleSave = () => {
    const sourceFileId = dialog.sourceFileId;

    if (isPaintFile) {
      const name = filename.trim() || 'Untitled.bmp';
      const finalName = name.endsWith('.bmp') ? name : `${name}.bmp`;

      const newId = addDesktopItemWithType('paint', finalName);
      saveFile(newId, dialog.content);
      openWindow(newId);
    } else {
      const name = filename.trim() || 'Untitled.txt';
      const finalName = name.endsWith('.txt') ? name : `${name}.txt`;

      const newId = addDesktopItemWithType('notepad', finalName);
      saveFile(newId, dialog.content);
      openWindow(newId);
    }

    // Clean up the original pending file if it exists (close its window and remove pending data)
    const state = useDesktopStore.getState();
    if (state.pendingFiles.has(sourceFileId)) {
      closeWindow(sourceFileId);
    }

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
              <option>{isPaintFile ? 'Bitmap Image (*.bmp)' : 'Text Documents (*.txt)'}</option>
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
