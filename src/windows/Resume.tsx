import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const DEFAULT_RESUME = `+======================================+
|       DANNY J. TAYLOR                |
|       Software Developer             |
+======================================+

EXPERIENCE
--------------------------------------
  [Your experience here]

EDUCATION
--------------------------------------
  [Your education here]

SKILLS
--------------------------------------
  Languages:  [Your languages]
  Tools:      [Your tools]
  Frameworks: [Your frameworks]

LINKS
--------------------------------------
  GitHub:   github.com/dannyjtaylor`;

const FILE_ID = 'resume';

export function Resume() {
  const savedContent = useDesktopStore((s) => s.fileSystem[FILE_ID]);
  const saveFile = useDesktopStore((s) => s.saveFile);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const [text, setText] = useState(savedContent ?? DEFAULT_RESUME);
  const [wordWrap, setWordWrap] = useState(false);
  const [statusBar, setStatusBar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const registerCallback = useContext(MenuCallbackContext);

  useEffect(() => {
    return registerCallback((action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      switch (action) {
        case 'file-new':
          setText('');
          break;
        case 'file-save':
          saveFile(FILE_ID, text);
          break;
        case 'file-save-as':
          saveFile(FILE_ID, text);
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
            setText(text.slice(0, start) + text.slice(end));
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
  }, [registerCallback, text, saveFile]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'notepad');
    },
    [showContextMenu],
  );

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
      {statusBar && (
        <div className={styles.statusBar}>
          {text.split('\n').length} lines | {text.length} characters
        </div>
      )}
    </div>
  );
}
