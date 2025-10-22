"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Mail } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-destructive/20 bg-background/80 backdrop-blur-xl">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Authentication Error
            </h1>
            <p className="text-foreground/60">
              There was a problem verifying your authentication link
            </p>
          </div>

          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The link has expired (links expire after 1 hour)</li>
              <li>• The link has already been used</li>
              <li>• The link was invalid or corrupted</li>
              <li>• You're using a different browser or device</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full bg-accent-primary hover:bg-accent-primary/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>

            <Link href="/forgot-password" className="block">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Request New Link
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-accent-primary/10">
            <p className="text-center text-foreground/60 text-sm">
              Need help?{" "}
              <a
                href="mailto:support@creatorpulse.com"
                className="text-accent-primary hover:text-accent-primary/80 font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
