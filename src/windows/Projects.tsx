import { useCallback, useEffect, useRef } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

interface ProjectFile {
  id: string;
  filename: string;
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    id: 'proj-tesla',
    filename: 'tesla_model_a.txt',
    content: `Tesla Model A
==============================
Autonomous electric vehicle featuring a 3D-printed PLA chassis powered by DC motors, MOSFETs, & 9V batteries on a breadboard platform. Using AVR C on an Arduino Uno R3, implemented PWM control for all-wheel drive, enabling precise braking & acceleration across all four wheels. Included real-time 180 degree object detection via 3 ultrasonic sensors & LED indicators, allowing the vehicle to detect obstacles and stop within 0.5 seconds.

Technologies: AVR C, ATmega328P, MOSFETs, Ultrasonic Sensors, Bambu X1C, Onshape`,
  },
  {
    id: 'proj-riscv',
    filename: 'risc_v_processor.txt',
    content: `32-bit RISC-V Processor
==============================
Designed & simulated a fully functional 32-bit RISC-V processor in Logisim, implementing core components including RAM, ROM, ALU, control logic, & both instruction and data memory to execute assembly instructions. Prototyped & verified on an Intel DE10-Lite FPGA using Verilog & SystemVerilog with 100% accuracy, expanding capabilities with 12 custom instructions & VGA output. Developed a real-time memory visualization system using board switches & VGA display.

Technologies: SystemVerilog, Verilog, Logisim, VGA, Intel FPGA DE10-Lite`,
  },
  {
    id: 'proj-rag',
    filename: 'rag_chatbot.txt',
    content: `Enterprise RAG Chatbot
==============================
An internal AI assistant supporting over 650 city employees across 11 departments. Enables natural language access to guides, manuals, forms, and employee data. Implemented document ingestion for multiple formats (.pdf, .docx, .ppt, .txt) using LangChain and ChromaDB. Designed custom REST API endpoints (/ask, /talk, /transcribe, /post, /get). Integrated OpenAI Whisper and ElevenLabs for speech-to-text and text-to-speech capabilities.

Technologies: GPT-4o, Python, Docker, PostgreSQL, LangChain, ChromaDB, FastAPI`,
  },
  {
    id: 'proj-alu',
    filename: 'alu_4bit.txt',
    content: `4-bit Arithmetic Logic Unit (ALU)
==============================
Circuit capable of executing XOR, AND, OR, XNOR, NAND, NOR, magnitude comparison, and binary addition for two 4-bit inputs. Verified in Multisim with 100% accuracy. Physical circuit constructed on a breadboard using 13 logic gate IC chips, four 8x1 multiplexers, and five LEDs to display output, achieving 100% functional accuracy.

Technologies: IC Chips, LEDs, 4x1 MUXes, Multisim`,
  },
  {
    id: 'proj-stopwatch',
    filename: 'stopwatch.txt',
    content: `60-Second Stopwatch
==============================
Built a 60-second stopwatch circuit using sequential logic on a breadboard, counting from 0 to 59 with auto-reset. Featured pause, resume, and reset via two D-flip flops and seven-segment BCD displays. Clock signal generated using a 555 timer configured as an astable multivibrator.

Technologies: 555 Timer, D-Flip Flops, BCD Displays, Breadboard`,
  },
  {
    id: 'proj-dashboard',
    filename: 'employee_dashboard.txt',
    content: `Employee Dashboard (Homepage)
==============================
Designed the City of Winter Haven's internal Homepage system, creating a centralized web interface for all 11 departments. Using YAML for configuration and Docker Compose for deployment. Streamlined access to departmental resources, forms, and tools, enhancing onboarding, usability, and operational efficiency.

Technologies: Homepage, YAML, Docker Compose, uvicorn`,
  },
  {
    id: 'proj-cicd',
    filename: 'cicd_pipeline.txt',
    content: `CI/CD Pipeline from Scratch
==============================
Emulating enterprise-grade deployment workflows using GitLab Runner, Docker, Kubernetes, and Prometheus. Multi-stage pipeline with security scanning, build, test, audit, image creation, and dual deployment phases - first to a test VM and then to a production VM. Post-deployment monitoring orchestrated via shell scripting on Ubuntu servers within a VMWare environment.

Technologies: GitLab Runner, Docker, Kubernetes, Prometheus, Ubuntu, VMWare`,
  },
  {
    id: 'proj-crud',
    filename: 'crud_app.txt',
    content: `Google Sheets-like CRUD Web App
==============================
Full-stack CRUD application for the City of Winter Haven to streamline employee management across 11 departments. Excel-like interface for manual input or bulk import/export. RESTful endpoints like /put for seamless record updates. Hosted via uvicorn and Docker Compose.

Technologies: PostgreSQL, Python, FastAPI, Docker, JavaScript, HTML, CSS`,
  },
  {
    id: 'proj-hybrid',
    filename: 'hybrid_vehicle.txt',
    content: `Hybrid Vehicle Efficiency Research
==============================
Led a hybrid vehicle fuel efficiency study analyzing passive versus aggressive driving styles over a 100 km test route. Used FORScan to interface with a Ford Maverick's OBD-II port for real-time data on fuel consumption, engine RPM, and motor speed. Result: ~55 MPH is the sweet spot for best fuel economy. Presented at Florida Polytechnic University's Research Day.

Technologies: FORScan, OBD-II, Ford Maverick, Data Analysis`,
  },
  {
    id: 'proj-arm',
    filename: 'robotic_arm.txt',
    content: `Robotic Arm Hackathon
==============================
Built and programmed a functional robotic arm during a Hackathon within a six-hour time limit. Engineered precise joint control and coordinated movement with real-time responsiveness.

Technologies: Arduino IDE, Arduino UNO R3, Motors, Servos, Breadboard`,
  },
  {
    id: 'proj-etch',
    filename: 'etch_a_sketch.txt',
    content: `Etch-a-Sketch Recreation Hackathon
==============================
Prototyped a functional Etch-a-Sketch system using motors, servos, breadboard, and an Arduino UNO R3. Programmed precise motor coordination to replicate the iconic drawing mechanism, enabling real-time sketching through embedded control. Completed under a six-hour deadline.

Technologies: Arduino IDE, Arduino UNO R3, Motors, Servos, Breadboard`,
  },
  {
    id: 'proj-auto',
    filename: 'autonomous_vehicle.txt',
    content: `Autonomous Vehicle Model & Simulation
==============================
Simulink simulation of an autonomous vehicle replicating real-world driving dynamics. Modeled longitudinal & lateral controllers (PID, Pure Pursuit, & Stanley). Tested on a reference path of a fake highway - successfully made three lane changes.

Technologies: MATLAB, Simulink, PID, Pure Pursuit, Stanley Controller`,
  },
];

export function Projects() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const saveFile = useDesktopStore((s) => s.saveFile);
  const fileSystem = useDesktopStore((s) => s.fileSystem);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const registerWindow = useDesktopStore((s) => s.registerWindow);
  const initializedRef = useRef(false);

  // Pre-populate file content for each project on first load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    for (const pf of PROJECT_FILES) {
      if (!fileSystem[pf.id]) {
        saveFile(pf.id, pf.content);
      }
      // Register a window for each project file
      registerWindow(pf.id, {
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 100,
        x: 160 + Math.random() * 40,
        y: 60 + Math.random() * 40,
        width: 480,
        height: 360,
        title: `${pf.filename} - Notepad`,
      });
    }
  }, [saveFile, fileSystem, registerWindow]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'explorer');
    },
    [showContextMenu],
  );

  const handleDoubleClick = useCallback(
    (projectId: string) => {
      openWindow(projectId);
    },
    [openWindow],
  );

  return (
    <div className={styles.explorer} onContextMenu={handleContextMenu}>
      {/* Toolbar */}
      <div className={styles.explorerToolbar}>
        <button className={styles.explorerUpBtn} disabled aria-label="Up">
          <span style={{ fontSize: 10 }}>&#8593;</span>
        </button>
        <div className={styles.explorerPath}>C:\Projects</div>
      </div>

      {/* File grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 8,
        background: 'var(--win-white)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: 4,
      }}>
        {PROJECT_FILES.map((pf) => (
          <div
            key={pf.id}
            onDoubleClick={() => handleDoubleClick(pf.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showContextMenu(e.clientX, e.clientY, 'explorer-item', pf.id);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 80,
              padding: '4px 2px',
              cursor: 'default',
              userSelect: 'none',
            }}
            title={pf.filename}
          >
            <DynamicIcon name="notepad" size={32} />
            <span style={{
              fontFamily: 'var(--font-system)',
              fontSize: 10,
              textAlign: 'center',
              marginTop: 2,
              wordBreak: 'break-word',
              lineHeight: 1.2,
              color: 'var(--win-black)',
            }}>
              {pf.filename}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.statusBar}>
        {PROJECT_FILES.length} object(s)
      </div>
    </div>
  );
}
