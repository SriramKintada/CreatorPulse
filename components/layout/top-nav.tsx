"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="hidden sm:inline">CreatorPulse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/drafts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Drafts
          </Link>
          <Link href="/sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sources
          </Link>
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Analytics
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/drafts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Drafts
            </Link>
            <Link href="/sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sources
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
