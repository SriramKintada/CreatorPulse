import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Security", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "GDPR", href: "#" },
  ],
  Social: [
    { label: "Twitter", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Discord", href: "#" },
  ],
}

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Footer content */}
          <div className="grid gap-8 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-2 font-bold text-lg text-foreground">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
                <span>CreatorPulse</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered newsletter automation for creators.</p>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="mb-4 font-semibold text-foreground">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <Separator className="my-8" />

          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2025 CreatorPulse. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Status
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Changelog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
