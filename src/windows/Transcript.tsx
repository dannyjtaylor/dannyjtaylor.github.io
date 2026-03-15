import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const DEFAULT_TEXT = `Florida Polytechnic University
Unofficial Transcript for Daniel Taylor
Major: Computer Engineering
Birth Date: 5/20/2004
============================================

Term: TRANSFER
--------------------------------------------
AMH2020  US HISTORY                    3.00 CR
ENC1101  FRESHMAN ENGLISH I            3.00 A
ENC1102  FRESHMAN ENGLISH II           3.00 A
HUM2020  INTRO TO HUMANITIES           3.00 A
STA2023  ELEMENTARY STATISTICS         3.00 A
         Term:  15.00 attempted / 15.00 earned

Term: FA 2022                     GPA: 4.00
--------------------------------------------
CHM2045  Chemistry 1                   3.00 A
CHM2045L Chemistry 1 Lab               1.00 A
EGN1006  Career Design for STEM        1.00 A
IDS1380  Foundational Lessons (FLAME)  3.00 A
MAC2311  Calculus 1                     4.00 A
         Term:  12.00 hrs / 48.00 pts

Term: SP 2023                     GPA: 4.00
--------------------------------------------
COP2271  Intro to Comp & Programming   3.00 A
EGN1007  Concepts & Methods for ECE    1.00 A
IDS2144  Legal/Ethical Issues in Tech  3.00 A
MAC2312  Calculus 2                     4.00 A
PHY2048  Physics 1                     3.00 A
PHY2048L Physics 1 Lab                 1.00 A
         Term:  15.00 hrs / 60.00 pts

Term: SU A 2023                   GPA: 4.00
--------------------------------------------
MAD2104  Discrete Mathematics          3.00 A
         Term:  3.00 hrs / 12.00 pts

Term: SU B 2023                   GPA: 4.00
--------------------------------------------
MAS3114  Computational Linear Algebra  3.00 A
         Term:  3.00 hrs / 12.00 pts

Term: FA 2023                     GPA: 4.00
--------------------------------------------
COP3337  Object Oriented Programming   3.00 A
EEL3111  Circuits 1                    3.00 A
EGN2001  Engr Skills and Design        2.00 A
MAP2302  Differential Equations        3.00 A
PHY2049  Physics 2                     3.00 A
PHY2049L Physics 2 Lab                 1.00 A
         Term:  15.00 hrs / 60.00 pts

Term: SP 2024                     GPA: 4.00
--------------------------------------------
EEL2011C ECE Skills and Design         2.00 A
EEL3112  Circuits 2                    3.00 A
EEL3702  Digital Logic Design          3.00 A
MAC2313  Calculus 3                     4.00 A
STA3032  Probability and Statistics    3.00 A
         Term:  15.00 hrs / 60.00 pts

Term: FA 2024                     GPA: 4.00
--------------------------------------------
COP3530  Data Structures & Algorithms  3.00 A
EEE3310  Digital Electronics           3.00 A
EEL3791C Comp Engr Design Lab 1        3.00 A
EEL4332  Intro to Autonomous Vehicles  3.00 A
EEL4746  Microprocessors               3.00 A
IDS4941  Professional Experience       0.00 S
         Term:  15.00 hrs / 60.00 pts

Term: SP 2025                     GPA: 4.00
--------------------------------------------
EEL3792C Comp Engr Design Lab 2        4.00 A
EEL4312  Electric & Hybrid Vehicles    3.00 A
EEL4768  Computer Architecture         3.00 A
MTG4302  Elements of Topology I        3.00 W
         Term:  13.00 att / 10.00 earned

Term: FA 2025                     GPA: 4.00
--------------------------------------------
CDA3631  Embedded Operating Systems    3.00 A
CEN4950  Senior Design 1               3.00 A
EEL3135  Systems and Signals           3.00 A
PHY3650  Quantum Info & Computing      3.00 A
         Term:  12.00 hrs / 48.00 pts

============================================
UNDERGRADUATE TOTALS
  Attempted: 118.00  Earned: 115.00
  GPA Hours: 100.00  Grade Pts: 400.00
  Cumulative GPA: 4.00
============================================

GPA Group: Graduate
Term: FA 2025                     GPA: 4.00
--------------------------------------------
EGN5470  Advanced Engineering Math     3.00 A
         Term:  3.00 hrs / 12.00 pts

GRADUATE TOTALS
  Attempted: 3.00  Earned: 3.00
  Cumulative GPA: 4.00
============================================`;

const FILE_ID = 'transcript';

export function Transcript() {
  const savedContent = useDesktopStore((s) => s.fileSystem[FILE_ID]);
  const saveFile = useDesktopStore((s) => s.saveFile);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const [text, setText] = useState(savedContent ?? DEFAULT_TEXT);
  const [wordWrap, setWordWrap] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const registerCallback = useContext(MenuCallbackContext);

  useEffect(() => {
    return registerCallback((action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      switch (action) {
        case 'file-new': setText(''); break;
        case 'file-save': saveFile(FILE_ID, text); break;
        case 'file-save-as': saveFile(FILE_ID, text); break;
        case 'edit-undo': document.execCommand('undo'); break;
        case 'edit-select-all': ta.select(); break;
        case 'edit-cut': document.execCommand('cut'); break;
        case 'edit-copy': document.execCommand('copy'); break;
        case 'edit-paste': document.execCommand('paste'); break;
        case 'edit-delete': {
          const s = ta.selectionStart, e = ta.selectionEnd;
          if (s !== e) { setText(text.slice(0, s) + text.slice(e)); requestAnimationFrame(() => { ta.selectionStart = s; ta.selectionEnd = s; }); }
          break;
        }
        case 'edit-time-date': document.execCommand('insertText', false, new Date().toLocaleString()); break;
        case 'format-word-wrap': setWordWrap((w) => !w); break;
        case 'help-about': useDesktopStore.getState().showProperties('About Notepad', { 'Application': 'Notepad', 'Version': '4.0', 'Publisher': 'DJTech Industries' }); break;
      }
    });
  }, [registerCallback, text, saveFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, 'notepad');
  }, [showContextMenu]);

  return (
    <div className={styles.notepadEditable}>
      <textarea ref={textareaRef} className={styles.notepadTextarea} value={text}
        onChange={(e) => setText(e.target.value)} onContextMenu={handleContextMenu}
        spellCheck={false} style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }} />
    </div>
  );
}
