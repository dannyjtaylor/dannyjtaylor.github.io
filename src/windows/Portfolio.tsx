import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const DEFAULT_TEXT = `Daniel J. Taylor - Computer Engineering Portfolio
==================================================

--- TESLA MODEL A ---
Autonomous electric vehicle featuring a 3D-printed
PLA chassis powered by DC motors, MOSFETs, & 9V
batteries on a breadboard platform. Using AVR C on
an Arduino Uno R3, I implemented PWM control for
all-wheel drive, enabling precise braking &
acceleration across all four wheels. Included
real-time 180 object detection via 3 ultrasonic
sensors & LED indicators, allowing the vehicle to
detect obstacles and stop within 0.5 seconds.
(Microprocessors Class Final Project)

--- 32-BIT RISC-V PROCESSOR ---
Designed & simulated a fully functional 32-bit
RISC-V processor in Logisim, implementing core
components including RAM, ROM, ALU, control logic,
& both instruction and data memory to execute
assembly instructions. Prototyped & verified on an
Intel DE10-Lite FPGA using Verilog & SystemVerilog
with 100% accuracy, expanding capabilities with 12
custom instructions & VGA output. Developed a
real-time memory visualization system using board
switches & VGA display to showcase instruction
execution, program counter progression, & data
memory contents through a Fibonacci sequence up
to Fib(15).

--- ENTERPRISE RAG CHATBOT ---
An internal AI assistant supporting over 650 city
employees across 11 departments. Built with GPT-4o,
Python, Docker, PostgreSQL, HTML, CSS, and
JavaScript. Enables natural language access to
guides, manuals, forms, and employee data.
Implemented document ingestion for multiple formats
(.pdf, .docx, .ppt, .txt) using LangChain and
ChromaDB. Designed custom REST API endpoints
(/ask, /talk, /transcribe, /post, /get).
Integrated OpenAI Whisper and ElevenLabs for
speech-to-text and text-to-speech capabilities.

--- 4-BIT ARITHMETIC LOGIC UNIT (ALU) ---
Circuit capable of executing XOR, AND, OR, XNOR,
NAND, NOR, magnitude comparison, and binary
addition for two 4-bit inputs. Verified in Multisim
with 100% accuracy. Physical circuit constructed
on a breadboard using 13 logic gate IC chips, four
8x1 multiplexers, and five LEDs to display output,
achieving 100% functional accuracy.

--- 60-SECOND STOPWATCH ---
Built a 60-second stopwatch circuit using sequential
logic on a breadboard, counting from 0 to 59 with
auto-reset. Featured pause, resume, and reset via
two D-flip flops and seven-segment BCD displays.
Clock signal generated using a 555 timer configured
as an astable multivibrator.

--- EMPLOYEE DASHBOARD (HOMEPAGE) ---
Designed the City of Winter Haven's internal
Homepage system, creating a centralized web
interface for all 11 departments. Using YAML for
configuration and Docker Compose for deployment.
Streamlined access to departmental resources,
forms, and tools, enhancing onboarding, usability,
and operational efficiency.

--- CI/CD PIPELINE FROM SCRATCH ---
Emulating enterprise-grade deployment workflows
using GitLab Runner, Docker, Kubernetes, and
Prometheus. Multi-stage pipeline with security
scanning, build, test, audit, image creation, and
dual deployment phases - first to a test VM and
then to a production VM. Post-deployment monitoring
orchestrated via shell scripting on Ubuntu servers
within a VMWare environment.

--- GOOGLE SHEETS-LIKE CRUD WEB APP ---
Full-stack CRUD application for the City of Winter
Haven to streamline employee management across 11
departments. PostgreSQL, Python, FastAPI, Docker,
JavaScript, HTML, and CSS. Excel-like interface for
manual input or bulk import/export. RESTful
endpoints like /put for seamless record updates.
Hosted via uvicorn and Docker Compose.

--- HYBRID VEHICLE EFFICIENCY RESEARCH ---
Led a hybrid vehicle fuel efficiency study analyzing
passive versus aggressive driving styles over a
100 km test route. Used FORScan to interface with a
Ford Maverick's OBD-II port for real-time data on
fuel consumption, engine RPM, and motor speed.
Result: ~55 MPH is the sweet spot for best fuel
economy. Presented at Florida Polytechnic
University's Research Day.

--- ROBOTIC ARM HACKATHON ---
Built and programmed a functional robotic arm during
a Hackathon within a six-hour time limit. Arduino
IDE, Arduino UNO R3, motors, servos, and a
breadboard. Engineered precise joint control and
coordinated movement with real-time responsiveness.

--- ETCH-A-SKETCH RECREATION HACKATHON ---
Prototyped a functional Etch-a-Sketch system using
motors, servos, breadboard, and an Arduino UNO R3.
Programmed precise motor coordination to replicate
the iconic drawing mechanism, enabling real-time
sketching through embedded control. Completed under
a six-hour deadline.

--- AUTONOMOUS VEHICLE MODEL & SIM ---
Simulink simulation of an autonomous vehicle
replicating real-world driving dynamics. Modeled
longitudinal & lateral controllers (PID, Pure
Pursuit, & Stanley). Tested on a reference path of
a fake highway - successfully made three lane
changes.

==================================================
Daniel J. Taylor | Florida Polytechnic University
Computer Engineering | GPA: 4.0/4.0`;

const FILE_ID = 'portfolio';

export function Portfolio() {
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
