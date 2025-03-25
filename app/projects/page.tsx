import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"

export default function ProjectsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="group mb-4">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">A collection of my engineering projects and technical work</p>
        </div>

        <div className="grid gap-8">
          {/* Project 1 */}
          <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">Embedded Systems Project</h2>
                <p className="text-muted-foreground mb-4">
                  A microcontroller-based system for real-time data processing and control. This project demonstrates my
                  ability to work with hardware interfaces and develop efficient embedded software.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">C++</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Arduino</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">IoT</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Sensors</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">FPGA Implementation</h2>
                <p className="text-muted-foreground mb-4">
                  Digital design project implementing custom algorithms on FPGA hardware. This project showcases my
                  skills in digital logic design and hardware description languages.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">VHDL</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Verilog</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Digital Logic</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Xilinx</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">PCB Design Project</h2>
                <p className="text-muted-foreground mb-4">
                  Custom printed circuit board design for a specialized application. This project demonstrates my skills
                  in electronic design, component selection, and PCB layout.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Eagle CAD</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Electronics</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Circuit Design</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Files
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Project Report
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Project 4 */}
          <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">Robotics Control System</h2>
                <p className="text-muted-foreground mb-4">
                  Development of a control system for an autonomous robot. This project combines hardware interfacing,
                  sensor integration, and algorithm implementation.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Python</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">ROS</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Control Systems</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Robotics</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Demo Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
