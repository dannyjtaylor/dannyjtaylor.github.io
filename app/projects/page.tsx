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
                <h2 className="text-2xl font-bold mb-2">Tesla Model A</h2>
                <p className="text-muted-foreground mb-4">
                  Built an autonomous EV with a 3D-printed PLA chassis, integrating MOSFETs, DC motors, 9-volt
                  batteries, & breadboards. Programmed in AVR C for Arduino to use PWM for all-wheel drive on the 4 DC
                  motor wheels for breaking & accelerating. Implemented real-time 180° object detection with 3
                  ultrasonic sensors & 3 LEDs to slow & stop the vehicle within 0.5s.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">AVR C</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">3D Printing</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">MOSFETs</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Arduino IDE</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Soldering</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Demo
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
                <h2 className="text-2xl font-bold mb-2">4-bit Arithmetic Logic Unit (ALU) Circuit</h2>
                <p className="text-muted-foreground mb-4">
                  Built ALU that performed XOR, AND, OR, XNOR, NAND, NOR, magnitude comparison, & addition for 2 4-bit
                  binary inputs. Achieved result using 13 logic gate integrated circuit chips, 4 8x1 multiplexers, & 5
                  LEDs with 100% accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Logic IC Chips</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Multiplexers</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">LEDs</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Breadboards</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Files
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
                <h2 className="text-2xl font-bold mb-2">60-Second Stopwatch Circuit</h2>
                <p className="text-muted-foreground mb-4">
                  Created 1-minute BCD counter using a sequential logic design with the ability to stop, resume, & reset
                  with 100% accuracy. Utilized 2 D-flip flops, 2 seven-segment BCD displays, an astable multivibrator, &
                  a 555 timer to generate a clock signal.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Logic IC Chips</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Digital Logic</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Breadboard</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">555 Timer</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Files
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Documentation
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
                <h2 className="text-2xl font-bold mb-2">Design Sequence Hackathons</h2>
                <p className="text-muted-foreground mb-4">
                  Collaborated with 3 peers to integrate, program, & present a robot arm & an Etch-a-Sketch under a
                  6-hour time constraint. Demonstrated rapid prototyping and problem-solving skills in a high-pressure
                  environment.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Arduino IDE</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Motors</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Servos</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Breadboard</span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <Button size="sm" className="group">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Demo
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

