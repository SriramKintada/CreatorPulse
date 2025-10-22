"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Mail, ArrowLeft, Check } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setEmailSent(true)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      console.error("Error sending reset email:", error)
      toast.error(error.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h1>
          <p className="text-foreground/60 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6 text-left">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the reset link in the email</li>
              <li>3. Create a new password</li>
              <li>4. Sign in with your new password</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Send Another Email
            </Button>
            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="p-8">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-accent-primary hover:text-accent-primary/80 text-sm font-medium mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <div className="mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-foreground/60">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-accent-primary/10">
          <p className="text-center text-foreground/60 text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-accent-primary hover:text-accent-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
}
