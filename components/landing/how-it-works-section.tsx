import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Connect Your Sources",
    description: "Link RSS feeds, Twitter, Reddit, and other content sources to CreatorPulse.",
  },
  {
    number: "2",
    title: "AI Curates Content",
    description: "Our AI analyzes and selects the most relevant content for your audience.",
  },
  {
    number: "3",
    title: "Generate Draft",
    description: "AI generates a complete newsletter draft with headlines, summaries, and links.",
  },
  {
    number: "4",
    title: "Edit & Personalize",
    description: "Customize the draft with your voice, add commentary, and adjust formatting.",
  },
  {
    number: "5",
    title: "Schedule & Send",
    description: "Schedule for optimal send time or send immediately to your subscribers.",
  },
  {
    number: "6",
    title: "Track Performance",
    description: "Monitor opens, clicks, and engagement with detailed analytics.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">Six simple steps to newsletter mastery</p>
        </div>

        {/* Timeline */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-12 hidden h-0.5 w-8 bg-gradient-to-r from-primary to-transparent lg:block" />
              )}

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {step.number}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
