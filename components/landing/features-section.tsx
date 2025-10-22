import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Brain, Calendar, BarChart3, Sparkles, Lock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Content Generation",
    description: "Generate compelling newsletter drafts with AI. Edit, refine, and publish in minutes.",
  },
  {
    icon: Zap,
    title: "Smart Curation",
    description: "Automatically discover and curate trending content from your sources.",
  },
  {
    icon: Calendar,
    title: "Schedule & Automate",
    description: "Schedule newsletters in advance and automate your entire publishing workflow.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track open rates, clicks, and subscriber engagement in real-time.",
  },
  {
    icon: Sparkles,
    title: "Rich Editor",
    description: "Powerful WYSIWYG editor with templates, images, and formatting options.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with GDPR, SOC 2, and more.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">Everything you need to create amazing newsletters</p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
