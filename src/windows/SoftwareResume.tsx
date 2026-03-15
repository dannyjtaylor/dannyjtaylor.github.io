import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const DEFAULT_TEXT = `Daniel J. Taylor
Software Engineer Resume
============================================
dannyengineers@outlook.com
linkedin.com/in/dannyjtaylor
dannyjtaylor.github.io
Sebring, FL (Open to Relocate)

EDUCATION
--------------------------------------------
Florida Polytechnic University
  Lakeland, FL | GPA: 4.0/4.0
  BS: Computer Engineering - Advanced Topics
    Graduating May 2026
  MS: Electrical Engineering - Computer Focus
    Graduating May 2027

EXPERIENCE
--------------------------------------------
City of Winter Haven Technology Services
  Smart City Student Intern
  July 2024 - Present | Winter Haven, FL

* Automated cross-departmental workflows
  using Python for CSV-to-Excel conversion
  (Pandas), OCR-based lab data extraction
  (PyTesseract), & photo processing for the
  Jostle intranet (Photoshop Python API)

PROJECTS
--------------------------------------------
Enterprise RAG Chatbot    September 2025
  LangChain, ChromaDB, Docker, ElevenLabs,
  PostgreSQL, FastAPI, OpenAI

* Created an internal AI agent RAG system
  serving 650+ city employees across 11
  departments
* Engineered document ingestion (.pdf, .docx,
  .ppt, .txt) via LangChain & ChromaDB
* Integrated OpenAI Whisper for STT &
  ElevenLabs for TTS

Dannybase                       July 2025
  PostgreSQL, FastAPI, Docker Compose,
  JavaScript, HTML, CSS, uvicorn

* Developed a full-stack CRUD application
  to manage municipal employee data
* Designed Excel-style interface with
  RESTful endpoints (/put, /get, /export)
* Deployed via Docker Compose & uvicorn

Custom CI/CD Pipeline           June 2025
  GitLab Runner, Docker, Kubernetes,
  Prometheus, Ubuntu, VMWare

* Built multi-stage CI/CD pipeline with
  security scanning, testing, & containers
* Automated dual-phase deployment to test
  & production VMs via shell scripting

Employee Dashboard               May 2025
  Homepage, YAML, Docker Compose, uvicorn

* Engineered internal Homepage system
* Designed dynamic web interface for 650+
  municipal employees

Other Projects: Tesla Model A, Autonomous
  Car Sim, /gather Discord Bot, 4-bit ALU,
  60-sec Stopwatch

LEADERSHIP
--------------------------------------------
VP of Professional Development
  SHPE | February 2024 - Present

TECHNICAL SKILLS
--------------------------------------------
Languages: Python, C/C++, HTML, CSS, JS,
  LangChain, ChromaDB, Qiskit, PyTesseract
Tools: PostgreSQL, Docker, GitLab, VMWare,
  uvicorn, FORScan, Logisim, Tinkercad
Certs: PCAP, PCEP, CompTIA Tech+, CSWA
============================================`;

const FILE_ID = 'swresume';

export function SoftwareResume() {
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
