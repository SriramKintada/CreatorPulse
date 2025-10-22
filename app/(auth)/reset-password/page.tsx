"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Lock, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user has a valid session from reset email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true)
      } else {
        toast.error("Invalid or expired reset link")
        setTimeout(() => router.push("/forgot-password"), 2000)
      }
    })
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      setResetSuccess(true)
      toast.success("Password updated successfully!")

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast.error(error.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </Card>
    )
  }

  if (resetSuccess) {
    return (
      <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Password Reset Successful!
          </h1>
          <p className="text-foreground/60 mb-6">
            Your password has been updated. Redirecting to dashboard...
          </p>

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reset Your Password
          </h1>
          <p className="text-foreground/60">
            Enter a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Password Requirements:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li>• At least 8 characters long</li>
            <li>• Contains a mix of letters and numbers (recommended)</li>
            <li>• Avoid common passwords like "password123"</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
