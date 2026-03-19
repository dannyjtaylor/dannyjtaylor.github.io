import { useState } from 'react';
import styles from './windows.module.css';

interface ResumeSection {
  title: string;
  content: React.ReactNode;
}

const SOFTWARE_SECTIONS: ResumeSection[] = [
  {
    title: 'Contact',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Daniel J. Taylor</strong> — Software Engineer Resume</div>
        <div>dannyengineers@outlook.com</div>
        <div>linkedin.com/in/dannyjtaylor</div>
        <div>dannyjtaylor.github.io</div>
        <div>Sebring, FL (Open to Relocate)</div>
      </div>
    ),
  },
  {
    title: 'Education',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Florida Polytechnic University</strong> — Lakeland, FL | GPA: 4.0/4.0</div>
        <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
          <li>BS: Computer Engineering - Advanced Topics — Graduating May 2026</li>
          <li>MS: Electrical Engineering - Computer Focus — Graduating May 2027</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Experience',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>City of Winter Haven Technology Services</strong></div>
        <div style={{ color: 'var(--win-dark)' }}>Smart City Student Intern | July 2024 - Present | Winter Haven, FL</div>
        <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
          <li>Automated cross-departmental workflows using Python for CSV-to-Excel conversion (Pandas), OCR-based lab data extraction (PyTesseract), & photo processing for the Jostle intranet (Photoshop Python API)</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Projects',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Enterprise RAG Chatbot</strong> — September 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>LangChain, ChromaDB, Docker, ElevenLabs, PostgreSQL, FastAPI, OpenAI</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Created an internal AI agent RAG system serving 650+ city employees across 11 departments</li>
            <li>Engineered document ingestion (.pdf, .docx, .ppt, .txt) via LangChain & ChromaDB</li>
            <li>Integrated OpenAI Whisper for STT & ElevenLabs for TTS</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Dannybase</strong> — July 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>PostgreSQL, FastAPI, Docker Compose, JavaScript, HTML, CSS, uvicorn</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Developed a full-stack CRUD application to manage municipal employee data</li>
            <li>Designed Excel-style interface with RESTful endpoints (/put, /get, /export)</li>
            <li>Deployed via Docker Compose & uvicorn</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Custom CI/CD Pipeline</strong> — June 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>GitLab Runner, Docker, Kubernetes, Prometheus, Ubuntu, VMWare</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Built multi-stage CI/CD pipeline with security scanning, testing, & containers</li>
            <li>Automated dual-phase deployment to test & production VMs via shell scripting</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Employee Dashboard</strong> — May 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>Homepage, YAML, Docker Compose, uvicorn</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Engineered internal Homepage system</li>
            <li>Designed dynamic web interface for 650+ municipal employees</li>
          </ul>
        </div>
        <div style={{ color: 'var(--win-dark)', fontStyle: 'italic' }}>
          Other Projects: Tesla Model A, Autonomous Car Sim, /gather Discord Bot, 4-bit ALU, 60-sec Stopwatch
        </div>
      </div>
    ),
  },
  {
    title: 'Leadership',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>VP of Professional Development</strong> — SHPE | February 2024 - Present</div>
      </div>
    ),
  },
  {
    title: 'Technical Skills',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Languages:</strong> Python, C/C++, HTML, CSS, JS, LangChain, ChromaDB, Qiskit, PyTesseract</div>
        <div><strong>Tools:</strong> PostgreSQL, Docker, GitLab, VMWare, uvicorn, FORScan, Logisim, Tinkercad</div>
        <div><strong>Certs:</strong> PCAP, PCEP, CompTIA Tech+, CSWA</div>
      </div>
    ),
  },
];

const EMBEDDED_SECTIONS: ResumeSection[] = [
  {
    title: 'Contact',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Daniel J. Taylor</strong> — Embedded Engineer Resume</div>
        <div>dannyengineers@outlook.com</div>
        <div>linkedin.com/in/dannyjtaylor</div>
        <div>dannyjtaylor.github.io</div>
        <div>Sebring, FL (Open to Relocate)</div>
      </div>
    ),
  },
  {
    title: 'Education',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Florida Polytechnic University</strong> — Lakeland, FL | GPA: 4.00/4.00</div>
        <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
          <li>BS: Computer Engineering - Advanced Topics — Graduating May 2026</li>
          <li>MS: Electrical Engineering — Graduating May 2027</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Experience',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>City of Winter Haven Technology Services</strong></div>
        <div style={{ color: 'var(--win-dark)' }}>Smart City Student Intern | July 2024 - Present | Winter Haven, FL</div>
        <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
          <li>Increased cybersecurity & implemented Kisi readers, controllers, IDs, & 2FA hardware tokens for 650+ employees</li>
          <li>Transformed point cloud data sets into 5 Sketchup 3D models of floor plans</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Projects',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 8 }}>
          <div><strong>RGB Rush</strong> — November 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>Embedded C++, STM32 Nucleo-F446RE, FreeRTOS, ADC, PWM</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Co-developed modular embedded color-matching game using FreeRTOS on STM32</li>
            <li>Designed pressure-to-color pipeline using ADC to map grip pressure to PWM-driven RGB channels</li>
            <li>Architected inter-task communication using queues, semaphores, & mutexes across 7 parallel tasks</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>32-bit RISC-V Processor</strong> — April 2025</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>SystemVerilog, Verilog, Logisim, VGA, Intel FPGA DE10-Lite</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Designed & simulated functional 32-bit processor in Logisim with RAM, ROM, ALU</li>
            <li>Prototyped on Intel FPGA DE10-Lite with 100% accuracy, adding 12 new instructions</li>
            <li>Devised real-time memory visualization via Verilog, switches & VGA display</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>Tesla Model A</strong> — November 2024</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>AVR C, ATmega328P, MOSFETs, Ultrasonic Sensors, Bambu X1C, Onshape</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Built autonomous EV with 3D printed PLA chassis, MOSFETs, DC motors, & breadboard</li>
            <li>Programmed Arduino Uno R3 (AVR C) for PWM all-wheel drive & 180 obstacle detection</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div><strong>4-bit ALU</strong> — November 2024</div>
          <div style={{ fontStyle: 'italic', fontSize: 10, color: 'var(--win-dark)' }}>IC Chips, LEDs, 4x1 MUXes, Multisim</div>
          <ul style={{ margin: '2px 0 2px 16px', padding: 0 }}>
            <li>Designed & built 4-bit ALU: XOR, AND, OR, XNOR, NAND, NOR, binary addition, & magnitude comparison using 13 ICs</li>
            <li>Verified via Multisim simulation - 100% accuracy</li>
          </ul>
        </div>
        <div style={{ color: 'var(--win-dark)', fontStyle: 'italic' }}>
          Other Projects: 60-Second Stopwatch, Enterprise RAG Chatbot, Autonomous Car Sim
        </div>
      </div>
    ),
  },
  {
    title: 'Leadership',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>VP of Professional Development</strong> — SHPE | February 2024 - Present</div>
      </div>
    ),
  },
  {
    title: 'Technical Skills',
    content: (
      <div style={{ padding: '4px 8px', lineHeight: 1.6 }}>
        <div><strong>Programming:</strong> Verilog, C/C++, Python, LangChain, ChromaDB, Qiskit, HTML, CSS, JS, MATLAB, Git</div>
        <div><strong>Hardware:</strong> ARM Cortex M4F, STM32, Arduino, Raspberry Pi 5, Intel FPGA DE10, 3D Print</div>
        <div><strong>Software:</strong> STM32CubeIDE, Atmel Studio, Questa, Intel Quartus Prime, Multisim, Tinkercad, Logisim</div>
      </div>
    ),
  },
];

const TABS = [
  { key: 'software', label: 'Software' },
  { key: 'embedded', label: 'Embedded' },
];

const RESUME_MAP: Record<string, ResumeSection[]> = {
  software: SOFTWARE_SECTIONS,
  embedded: EMBEDDED_SECTIONS,
};

export function Resume() {
  const [activeTab, setActiveTab] = useState('software');
  const sections = RESUME_MAP[activeTab] ?? [];

  return (
    <div className={styles.notepadEditable}>
      {/* Win95-style tabs */}
      <div className={styles.resumeTabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.resumeTab} ${activeTab === tab.key ? styles.resumeTabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        background: 'var(--win-white)',
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        color: 'var(--win-black)',
        userSelect: 'text',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8, borderBottom: '2px solid var(--win-black)', paddingBottom: 4 }}>
          {activeTab === 'software' ? 'Software Engineer Resume' : 'Embedded Engineer Resume'}
        </div>

        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 12 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 12,
              padding: '3px 6px',
              background: 'var(--win-navy)',
              color: 'var(--win-white)',
              marginBottom: 4,
            }}>
              {section.title}
            </div>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}
