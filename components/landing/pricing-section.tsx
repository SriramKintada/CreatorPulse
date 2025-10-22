import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Perfect for individual creators",
    price: "$29",
    period: "/month",
    features: [
      "Up to 5,000 subscribers",
      "AI-powered drafts",
      "Basic analytics",
      "Email support",
      "1 newsletter per week",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing newsletters",
    price: "$79",
    period: "/month",
    features: [
      "Up to 50,000 subscribers",
      "Unlimited AI drafts",
      "Advanced analytics",
      "Priority support",
      "Unlimited newsletters",
      "Custom branding",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited subscribers",
      "Dedicated account manager",
      "Custom integrations",
      "White-label solution",
      "Advanced security",
      "SLA guarantee",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col transition-all duration-200 ${
                plan.highlighted
                  ? "border-primary/50 bg-card ring-2 ring-primary/20 md:scale-105"
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>

                {/* CTA Button */}
                <Link href="/sign-up" className="w-full">
                  <Button variant={plan.highlighted ? "default" : "outline"} className="mb-6 w-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
