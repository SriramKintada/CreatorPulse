"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"
import { Chrome } from "lucide-react"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    const { data, error: authError } = await signUp(
      formData.email,
      formData.password,
      formData.name
    )

    if (authError) {
      setError(authError.message)
      toast.error(authError.message)
      setIsLoading(false)
      return
    }

    toast.success("Account created successfully!")
    router.push("/onboarding")
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      const { error: authError } = await signInWithGoogle()

      if (authError) {
        toast.error(authError.message)
        setGoogleLoading(false)
        return
      }

      // OAuth will redirect automatically, no need to do anything
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast.error("Failed to sign in with Google")
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-accent-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground/60">Join CreatorPulse and start automating your newsletters</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <Input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-accent-primary hover:bg-accent-primary/90" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Create Account"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent-primary/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Chrome className="h-4 w-4 mr-2" />
                Sign up with Google
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-accent-primary/10">
          <p className="text-center text-foreground/60 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-primary hover:text-accent-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
}
