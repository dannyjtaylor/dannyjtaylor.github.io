import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Cpu, Github, Linkedin, Users, ExternalLink } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-gradient-to-br from-background to-background/90">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-0"></div>
        <div className="absolute inset-0 bg-circuit-pattern opacity-[0.04] z-0"></div>

        <div className="container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 overflow-hidden rounded-full border-4 border-primary/20 shadow-xl">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Daniel Taylor"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Daniel Taylor
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Computer Engineering Student at Florida Polytechnic University
            <span className="block mt-2 text-base md:text-lg">
              Concentration in Advanced Topics -- GPA: 4.0 -- Expected Graduation: May 2026
            </span>
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/projects">
              <Button size="lg" className="group">
                View Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link
              href="https://www.linkedin.com/in/dannyjtaylor/overlay/1738099621375/single-media-viewer/?profileId=ACoAAEa30iEB-l2Y78MS48KDaCulXJHxqG4x6VU"
              target="_blank"
            >
              <Button size="lg" variant="outline">
                Resume
              </Button>
            </Link>
          </div>

          <div className="flex gap-4 mt-4">
            <Link href="https://www.linkedin.com/in/dannyjtaylor" target="_blank" aria-label="LinkedIn">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Linkedin className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/dannyjtaylor" target="_blank" aria-label="GitHub">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Github className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://www.twitch.tv/fierylights" target="_blank" aria-label="Twitch">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
                </svg>
              </Button>
            </Link>
            <Link href="https://linktr.ee/dtaylor6456" target="_blank" aria-label="LinkTree">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ExternalLink className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* About Section */}
      <section className="w-full py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Cpu className="mr-3 h-6 w-6 text-primary" />
            About Me
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg">
                I'm a Junior at Florida Polytechnic University pursuing a degree in Computer Engineering with a
                concentration in Advanced Topics.
              </p>
              <p>
                My passion lies at the intersection of hardware and software, where I develop solutions that bridge the
                gap between theoretical concepts and practical applications.
              </p>
              <p>
                When I'm not working on engineering projects, you might find me leading my competitive VALORANT Premier
                Esports Team as an In-Game Leader, where I've developed strong teamwork and split-second decision-making
                skills.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <h3 className="text-xl font-medium mb-4">Technical Skills</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>AVR C, C/C++</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Python, NumPy, Pandas</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>System Verilog, Verilog</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>HTML5, CSS, JavaScript</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Arduino, Raspberry Pi 5</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>FPGA, Intel Quartus Prime</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>SOLIDWORKS, Multisim</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Simulink, MATLAB</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Oscilloscopes, Soldering</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>3D Printing, Tinkercad</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Onshape, SketchUp</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Excel, Word, PowerPoint</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Access, Questa</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Atmel/Microchip Studio</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Arduino IDE, MARS</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Typing at 160+ WPM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold flex items-center">
              <Github className="mr-3 h-6 w-6 text-primary" />
              Featured Projects
            </h2>
            <Link href="/projects">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Card 1 */}
            <div className="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-md">
              <div className="h-48 bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">Tesla Model A</h3>
                <p className="text-muted-foreground mb-4">
                  Autonomous EV with 3D-printed chassis, integrated MOSFETs, DC motors, and real-time object detection.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">AVR C</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Arduino IDE</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">3D Printing</span>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-md">
              <div className="h-48 bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Project Image</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">4-bit Arithmetic Logic Unit</h3>
                <p className="text-muted-foreground mb-4">
                  ALU circuit performing multiple operations on 4-bit binary inputs using logic IC chips and
                  multiplexers.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Logic IC Chips</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Multiplexers</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Digital Logic</span>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Experience */}
      <section className="w-full py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            Leadership Experience
          </h2>

          <div className="space-y-6">
            {/* Leadership Item 1 */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-1/4">
                  <h3 className="text-xl font-bold">Vice President of Professional Development</h3>
                  <p className="text-muted-foreground">Society of Hispanic Professional Engineers</p>
                  <p className="text-sm text-muted-foreground">February 2024 - Present</p>
                </div>
                <div className="md:w-3/4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Enhanced professional networking skills at conferences, connecting 30+ SHPE members with industry
                      professionals
                    </li>
                    <li>
                      Improved club professional development & skills by conducting resume workshops & Python
                      programming boot camps
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leadership Item 2 */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-1/4">
                  <h3 className="text-xl font-bold">In-Game Leader</h3>
                  <p className="text-muted-foreground">Competitive VALORANT Premier Esports Team</p>
                  <p className="text-sm text-muted-foreground">July 2023 - Present</p>
                </div>
                <div className="md:w-3/4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Directed team of 5 in biweekly VALORANT matches, winning 80% of games, & placed 1st in the
                      Ignition Tournament playoffs
                    </li>
                    <li>
                      Established round-by-round teamwork, communication, & split-second decision-making skills under
                      strict time limits
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leadership Item 3 */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-1/4">
                  <h3 className="text-xl font-bold">Treasurer</h3>
                  <p className="text-muted-foreground">Rotaract International @ Florida Polytechnic</p>
                  <p className="text-sm text-muted-foreground">November 2022 - Present</p>
                </div>
                <div className="md:w-3/4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Managed $9000+ in club funds & coordinated 7 fundraising activities, ensuring financial stability
                      & support for club projects
                    </li>
                    <li>
                      Fostered mentorship program that connected 12+ members with Auburndale Rotary mentors for club
                      professional growth
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3 h-6 w-6 text-primary"
            >
              <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"></path>
              <path d="M19 8a7 7 0 1 0-14 0 7 7 0 0 0 14 0Z"></path>
            </svg>
            Certifications
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-2">Cisco Networking Academy</h3>
              <p className="text-muted-foreground mb-2">Introduction to IoT</p>
              <p className="text-sm text-muted-foreground">Issued May 2023</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-2">Cisco Networking Academy</h3>
              <p className="text-muted-foreground mb-2">Introduction to Cybersecurity</p>
              <p className="text-sm text-muted-foreground">Issued May 2023</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-2">Cisco Networking Academy</h3>
              <p className="text-muted-foreground mb-2">Networking Essentials</p>
              <p className="text-sm text-muted-foreground">Issued May 2023</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-2">Cisco Networking Academy</h3>
              <p className="text-muted-foreground mb-2">Introduction to Packet Tracer</p>
              <p className="text-sm text-muted-foreground">Issued May 2023</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connect CTA */}
      <section className="w-full py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Interested in discussing opportunities or collaborating on projects? Feel free to reach out through any of
            my social platforms!
          </p>
          <div className="flex justify-center gap-6">
            <Link href="https://www.linkedin.com/in/dannyjtaylor" target="_blank" aria-label="LinkedIn">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16">
                <Linkedin className="h-7 w-7" />
              </Button>
              <span className="block mt-2 text-sm">LinkedIn</span>
            </Link>
            <Link href="https://github.com/dannyjtaylor" target="_blank" aria-label="GitHub">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16">
                <Github className="h-7 w-7" />
              </Button>
              <span className="block mt-2 text-sm">GitHub</span>
            </Link>
            <Link href="https://www.twitch.tv/fierylights" target="_blank" aria-label="Twitch">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
                </svg>
              </Button>
              <span className="block mt-2 text-sm">Twitch</span>
            </Link>
            <Link href="https://linktr.ee/dtaylor6456" target="_blank" aria-label="LinkTree">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16">
                <ExternalLink className="h-7 w-7" />
              </Button>
              <span className="block mt-2 text-sm">LinkTree</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

