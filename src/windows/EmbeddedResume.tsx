import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const DEFAULT_TEXT = `Daniel J. Taylor
Embedded Engineer Resume
============================================
dannyengineers@outlook.com
linkedin.com/in/dannyjtaylor
dannyjtaylor.github.io
Sebring, FL (Open to Relocate)

EDUCATION
--------------------------------------------
Florida Polytechnic University
  Lakeland, FL | GPA: 4.00/4.00
  BS: Computer Engineering - Advanced Topics
    Graduating May 2026
  MS: Electrical Engineering
    Graduating May 2027

EXPERIENCE
--------------------------------------------
City of Winter Haven Technology Services
  Smart City Student Intern
  July 2024 - Present | Winter Haven, FL

* Increased cybersecurity & implemented Kisi
  readers, controllers, IDs, & 2FA hardware
  tokens for 650+ employees
* Transformed point cloud data sets into 5
  Sketchup 3D models of floor plans

PROJECTS
--------------------------------------------
RGB Rush                   November 2025
  Embedded C++, STM32 Nucleo-F446RE,
  FreeRTOS, ADC, PWM

* Co-developed modular embedded color-
  matching game using FreeRTOS on STM32
* Designed pressure-to-color pipeline using
  ADC to map grip pressure to PWM-driven
  RGB channels
* Architected inter-task communication using
  queues, semaphores, & mutexes across 7
  parallel tasks

32-bit RISC-V Processor       April 2025
  SystemVerilog, Verilog, Logisim, VGA,
  Intel FPGA DE10-Lite

* Designed & simulated functional 32-bit
  processor in Logisim with RAM, ROM, ALU
* Prototyped on Intel FPGA DE10-Lite with
  100% accuracy, adding 12 new instructions
* Devised real-time memory visualization
  via Verilog, switches & VGA display

Tesla Model A             November 2024
  AVR C, ATmega328P, MOSFETs, Ultrasonic
  Sensors, Bambu X1C, Onshape

* Built autonomous EV with 3D printed PLA
  chassis, MOSFETs, DC motors, & breadboard
* Programmed Arduino Uno R3 (AVR C) for PWM
  all-wheel drive & 180 obstacle detection

4-bit ALU                 November 2024
  IC Chips, LEDs, 4x1 MUXes, Multisim

* Designed & built 4-bit ALU: XOR, AND, OR,
  XNOR, NAND, NOR, binary addition, &
  magnitude comparison using 13 ICs
* Verified via Multisim simulation - 100%
  accuracy

Other Projects: 60-Second Stopwatch,
  Enterprise RAG Chatbot, Autonomous Car Sim

LEADERSHIP
--------------------------------------------
VP of Professional Development
  SHPE | February 2024 - Present

TECHNICAL SKILLS
--------------------------------------------
Programming: Verilog, C/C++, Python,
  LangChain, ChromaDB, Qiskit, HTML, CSS,
  JS, MATLAB, Git
Hardware: ARM Cortex M4F, STM32, Arduino,
  Raspberry Pi 5, Intel FPGA DE10, 3D Print
Software: STM32CubeIDE, Atmel Studio,
  Questa, Intel Quartus Prime, Multisim,
  Tinkercad, Logisim
============================================`;

const FILE_ID = 'ewresume';

export function EmbeddedResume() {
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
