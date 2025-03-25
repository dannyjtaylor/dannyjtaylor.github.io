import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Cpu, Github, Linkedin, Mail } from "lucide-react"
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
            <span className="block mt-2 text-base md:text-lg">Advanced Topics Concentration</span>
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
                When I'm not working on engineering projects, you might find me enjoying strategic games like VALORANT
                or exploring indie games like Cave Story that inspire my creative approach to problem-solving.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <h3 className="text-xl font-medium mb-4">Technical Skills</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>C/C++</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Python</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>VHDL</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Embedded Systems</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>PCB Design</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  <span>Digital Logic</span>
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
                <h3 className="text-xl font-bold mb-2">Embedded Systems Project</h3>
                <p className="text-muted-foreground mb-4">
                  A microcontroller-based system for real-time data processing and control.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">C++</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Arduino</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">IoT</span>
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
                <h3 className="text-xl font-bold mb-2">FPGA Implementation</h3>
                <p className="text-muted-foreground mb-4">
                  Digital design project implementing custom algorithms on FPGA hardware.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">VHDL</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Verilog</span>
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

      {/* Contact CTA */}
      <section className="w-full py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Interested in discussing opportunities or collaborating on projects? Feel free to reach out!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="group">
                <Mail className="mr-2 h-5 w-5" />
                Contact Me
              </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/dannyjtaylor" target="_blank">
              <Button size="lg" variant="outline" className="group">
                <Linkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}