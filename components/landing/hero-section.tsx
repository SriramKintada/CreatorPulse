import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Newsletter Automation</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Create newsletters
          <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            that captivate
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
          Let AI curate content, generate drafts, and schedule newsletters. Focus on what matters—your audience.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <p>Trusted by 5,000+ creators</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent opacity-20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
