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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    const { data, error: authError } = await signIn(formData.email, formData.password)

    if (authError) {
      setError(authError.message)
      toast.error(authError.message)
      setIsLoading(false)
      return
    }

    toast.success("Logged in successfully!")
    router.push("/dashboard")
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-foreground/60">Sign in to your CreatorPulse account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-accent-primary hover:bg-accent-primary/90" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Sign In"}
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
                Sign in with Google
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 space-y-4 pt-6 border-t border-accent-primary/10">
          <Link
            href="/forgot-password"
            className="block text-center text-accent-primary hover:text-accent-primary/80 text-sm font-medium"
          >
            Forgot password?
          </Link>
          <p className="text-center text-foreground/60 text-sm">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-accent-primary hover:text-accent-primary/80 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
}
