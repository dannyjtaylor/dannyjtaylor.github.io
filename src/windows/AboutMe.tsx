import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import { saveAsFile } from '../utils/saveFile';
import styles from './windows.module.css';

const DEFAULT_TEXT = `Hey, I'm Danny J. Taylor.

Welcome to my corner of the internet — styled like it's 2004 because good design is timeless (and also because I think floppy disks were cool).

I'm a developer who loves building things, breaking things, and occasionally putting them back together. This portfolio is a living project — check back as I add more to it.

Double-click the icons on the desktop to explore, or use the Start menu.

— Danny`;

export function AboutMe() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const registerCallback = useContext(MenuCallbackContext);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);

  useEffect(() => {
    return registerCallback((action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      switch (action) {
        case 'file-new':
          setText('');
          break;
        case 'file-save':
        case 'file-save-as':
          saveAsFile('about_me.txt', text);
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
        case 'help-about':
          alert('Notepad\nDJTech Industries\nVersion 4.0');
          break;
      }
    });
  }, [registerCallback, text]);

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
      />
    </div>
  );
}
