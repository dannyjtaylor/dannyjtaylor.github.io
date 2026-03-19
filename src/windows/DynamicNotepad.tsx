import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

interface DynamicNotepadProps {
  fileId: string;
}

export function DynamicNotepad({ fileId }: DynamicNotepadProps) {
  const savedContent = useDesktopStore((s) => s.fileSystem[fileId]) ?? '';
  const saveFile = useDesktopStore((s) => s.saveFile);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const [text, setText] = useState(savedContent);
  const [wordWrap, setWordWrap] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const registerCallback = useContext(MenuCallbackContext);
  const [statusBar, setStatusBar] = useState(false);

  // Sync when file is loaded from filesystem
  useEffect(() => {
    const stored = useDesktopStore.getState().fileSystem[fileId];
    if (stored !== undefined) setText(stored);
  }, [fileId]);

  useEffect(() => {
    return registerCallback((action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      switch (action) {
        case 'file-new':
          setText('');
          saveFile(fileId, '');
          break;
        case 'file-save':
          saveFile(fileId, text);
          break;
        case 'file-save-as':
          saveFile(fileId, text);
          useDesktopStore.getState().showSaveAsDialog(text, fileId);
          break;
        case 'edit-undo':
          document.execCommand('undo');
          break;
        case 'edit-select-all':
          ta.select();
          break;
        case 'edit-cut':
          document.execCommand('cut');
          break;
        case 'edit-copy':
          document.execCommand('copy');
          break;
        case 'edit-paste':
          document.execCommand('paste');
          break;
        case 'edit-delete': {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          if (start !== end) {
            const newText = text.slice(0, start) + text.slice(end);
            setText(newText);
            requestAnimationFrame(() => {
              ta.selectionStart = start;
              ta.selectionEnd = start;
            });
          }
          break;
        }
        case 'edit-time-date':
          document.execCommand('insertText', false, new Date().toLocaleString());
          break;
        case 'format-word-wrap':
          setWordWrap((w) => !w);
          break;
        case 'view-status-bar':
          setStatusBar((s) => !s);
          break;
        case 'help-about':
          useDesktopStore.getState().showProperties('About Notepad', {
            'Application': 'Notepad',
            'Version': '4.0',
            'Publisher': 'DJTech Industries',
            'System': 'DannyOS 95',
          });
          break;
      }
    });
  }, [registerCallback, text, fileId, saveFile]);

  // Ctrl+S quicksave
  const [saveFlash, setSaveFlash] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile(fileId, text);
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fileId, text, saveFile]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'notepad');
    },
    [showContextMenu],
  );

  const lines = text.split('\n').length;
  const chars = text.length;

  return (
    <div className={styles.notepadEditable}>
      <textarea
        ref={textareaRef}
        className={styles.notepadTextarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onContextMenu={handleContextMenu}
        spellCheck={false}
        style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
      />
      {saveFlash && (
        <div style={{
          position: 'absolute', top: 4, right: 8,
          background: 'var(--win-btn-face, #c0c0c0)', border: '1px solid var(--win-dark, #808080)',
          padding: '2px 8px', fontFamily: 'var(--font-system)', fontSize: 11,
        }}>
          Saved
        </div>
      )}
      {statusBar && (
        <div className={styles.statusBar}>
          Ln {lines}, Col {(textareaRef.current?.selectionStart ?? 0) + 1} | {chars} characters
        </div>
      )}
    </div>
  );
}
