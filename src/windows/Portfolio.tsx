import styles from './windows.module.css';

interface Project {
  title: string;
  description: string;
  tech: string;
}

interface ProjectCategory {
  title: string;
  projects: Project[];
}

const CATEGORIES: ProjectCategory[] = [
  {
    title: 'Hardware / Embedded',
    projects: [
      {
        title: 'Tesla Model A',
        description:
          'Autonomous electric vehicle featuring a 3D-printed PLA chassis powered by DC motors, MOSFETs, & 9V batteries on a breadboard platform. Using AVR C on an Arduino Uno R3, implemented PWM control for all-wheel drive, enabling precise braking & acceleration across all four wheels. Included real-time 180\u00B0 object detection via 3 ultrasonic sensors & LED indicators, allowing the vehicle to detect obstacles and stop within 0.5 seconds.',
        tech: 'AVR C, ATmega328P, MOSFETs, Ultrasonic Sensors, Bambu X1C, Onshape',
      },
      {
        title: '32-bit RISC-V Processor',
        description:
          'Designed & simulated a fully functional 32-bit RISC-V processor in Logisim, implementing core components including RAM, ROM, ALU, control logic, & both instruction and data memory to execute assembly instructions. Prototyped & verified on an Intel DE10-Lite FPGA using Verilog & SystemVerilog with 100% accuracy, expanding capabilities with 12 custom instructions & VGA output. Developed a real-time memory visualization system using board switches & VGA display to showcase instruction execution, program counter progression, & data memory contents through a Fibonacci sequence up to Fib(15).',
        tech: 'SystemVerilog, Verilog, Logisim, VGA, Intel FPGA DE10-Lite',
      },
      {
        title: '4-bit Arithmetic Logic Unit (ALU)',
        description:
          'Circuit capable of executing XOR, AND, OR, XNOR, NAND, NOR, magnitude comparison, and binary addition for two 4-bit inputs. Verified in Multisim with 100% accuracy. Physical circuit constructed on a breadboard using 13 logic gate IC chips, four 8x1 multiplexers, and five LEDs to display output, achieving 100% functional accuracy.',
        tech: 'IC Chips, LEDs, 4x1 MUXes, Multisim',
      },
      {
        title: '60-Second Stopwatch',
        description:
          'Built a 60-second stopwatch circuit using sequential logic on a breadboard, counting from 0 to 59 with auto-reset. Featured pause, resume, and reset via two D-flip flops and seven-segment BCD displays. Clock signal generated using a 555 timer configured as an astable multivibrator.',
        tech: '555 Timer, D-Flip Flops, BCD Displays, Breadboard',
      },
    ],
  },
  {
    title: 'Software',
    projects: [
      {
        title: 'Enterprise RAG Chatbot',
        description:
          'An internal AI assistant supporting over 650 city employees across 11 departments. Enables natural language access to guides, manuals, forms, and employee data. Implemented document ingestion for multiple formats (.pdf, .docx, .ppt, .txt) using LangChain and ChromaDB. Designed custom REST API endpoints (/ask, /talk, /transcribe, /post, /get). Integrated OpenAI Whisper and ElevenLabs for speech-to-text and text-to-speech capabilities.',
        tech: 'GPT-4o, Python, Docker, PostgreSQL, LangChain, ChromaDB, FastAPI',
      },
      {
        title: 'Employee Dashboard (Homepage)',
        description:
          "Designed the City of Winter Haven's internal Homepage system, creating a centralized web interface for all 11 departments. Using YAML for configuration and Docker Compose for deployment. Streamlined access to departmental resources, forms, and tools, enhancing onboarding, usability, and operational efficiency.",
        tech: 'Homepage, YAML, Docker Compose, uvicorn',
      },
      {
        title: 'CI/CD Pipeline from Scratch',
        description:
          'Emulating enterprise-grade deployment workflows using GitLab Runner, Docker, Kubernetes, and Prometheus. Multi-stage pipeline with security scanning, build, test, audit, image creation, and dual deployment phases \u2014 first to a test VM and then to a production VM. Post-deployment monitoring orchestrated via shell scripting on Ubuntu servers within a VMWare environment.',
        tech: 'GitLab Runner, Docker, Kubernetes, Prometheus, Ubuntu, VMWare',
      },
      {
        title: 'Google Sheets-like CRUD Web App',
        description:
          'Full-stack CRUD application for the City of Winter Haven to streamline employee management across 11 departments. Excel-like interface for manual input or bulk import/export. RESTful endpoints like /put for seamless record updates. Hosted via uvicorn and Docker Compose.',
        tech: 'PostgreSQL, Python, FastAPI, Docker, JavaScript, HTML, CSS',
      },
      {
        title: 'Autonomous Vehicle Model & Sim',
        description:
          'Simulink simulation of an autonomous vehicle replicating real-world driving dynamics. Modeled longitudinal & lateral controllers (PID, Pure Pursuit, & Stanley). Tested on a reference path of a fake highway \u2014 successfully made three lane changes.',
        tech: 'MATLAB, Simulink, PID, Pure Pursuit, Stanley Controller',
      },
    ],
  },
  {
    title: 'Research',
    projects: [
      {
        title: 'Hybrid Vehicle Efficiency Research',
        description:
          "Led a hybrid vehicle fuel efficiency study analyzing passive versus aggressive driving styles over a 100 km test route. Used FORScan to interface with a Ford Maverick's OBD-II port for real-time data on fuel consumption, engine RPM, and motor speed. Result: ~55 MPH is the sweet spot for best fuel economy. Presented at Florida Polytechnic University's Research Day.",
        tech: 'FORScan, OBD-II, Ford Maverick, Data Analysis',
      },
    ],
  },
  {
    title: 'Other',
    projects: [
      {
        title: 'Robotic Arm Hackathon',
        description:
          'Built and programmed a functional robotic arm during a Hackathon within a six-hour time limit. Engineered precise joint control and coordinated movement with real-time responsiveness.',
        tech: 'Arduino IDE, Arduino UNO R3, Motors, Servos, Breadboard',
      },
      {
        title: 'Etch-a-Sketch Recreation Hackathon',
        description:
          'Prototyped a functional Etch-a-Sketch system using motors, servos, breadboard, and an Arduino UNO R3. Programmed precise motor coordination to replicate the iconic drawing mechanism, enabling real-time sketching through embedded control. Completed under a six-hour deadline.',
        tech: 'Arduino IDE, Arduino UNO R3, Motors, Servos, Breadboard',
      },
    ],
  },
];

export function Portfolio() {
  return (
    <div className={styles.notepadEditable}>
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
          Daniel J. Taylor - Project Portfolio
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.title} style={{ marginBottom: 14 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 12,
              padding: '3px 6px',
              background: 'var(--win-navy)',
              color: 'var(--win-white)',
              marginBottom: 6,
            }}>
              {cat.title}
            </div>

            {cat.projects.map((project) => (
              <div key={project.title} style={{ marginBottom: 10, padding: '0 8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>
                  {project.title}
                </div>
                <div style={{ lineHeight: 1.5, marginBottom: 2 }}>
                  {project.description}
                </div>
                <div style={{ color: 'var(--win-dark)', fontStyle: 'italic', fontSize: 10 }}>
                  Tech: {project.tech}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ borderTop: '2px solid var(--win-black)', paddingTop: 4, marginTop: 8, textAlign: 'center', color: 'var(--win-dark)' }}>
          Daniel J. Taylor | Florida Polytechnic University | Computer Engineering | GPA: 4.0/4.0
        </div>
      </div>
    </div>
  );
}
