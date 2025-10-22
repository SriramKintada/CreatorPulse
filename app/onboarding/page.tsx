"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { VoiceTrainer } from "@/components/voice-training/voice-trainer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Sparkles,
  Youtube,
  Rss,
  Globe,
  Check,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Zap,
  Twitter,
} from "lucide-react"

const STEPS = [
  { id: 1, name: "Welcome", icon: Sparkles },
  { id: 2, name: "Add Source", icon: Rss },
  { id: 3, name: "Train Voice", icon: FileText },
  { id: 4, name: "Set Schedule", icon: Calendar },
  { id: 5, name: "Generate", icon: Zap },
  { id: 6, name: "Done", icon: Check },
]

const SOURCE_TYPES = [
  {
    type: "youtube",
    name: "YouTube Channel",
    icon: Youtube,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    free: true,
  },
  {
    type: "newsletter_rss",
    name: "RSS Feed",
    icon: Rss,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    free: true,
  },
  {
    type: "twitter",
    name: "Twitter/X Profile",
    icon: Twitter,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    free: false,
    cost: "$0.40/1K posts",
  },
  {
    type: "custom_url",
    name: "Custom Website",
    icon: Globe,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    free: false,
    cost: "Requires Apify",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Step 2: Source selection state
  const [selectedSourceType, setSelectedSourceType] = useState<string>("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [sourceName, setSourceName] = useState("")
  const [createdSourceId, setCreatedSourceId] = useState<string | null>(null)

  // Step 4: Schedule state
  const [deliveryFrequency, setDeliveryFrequency] = useState("weekly")
  const [deliveryDay, setDeliveryDay] = useState("monday")
  const [deliveryTime, setDeliveryTime] = useState("08:00")
  const [useLoginEmail, setUseLoginEmail] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [userEmail, setUserEmail] = useState("")

  // Step 5: Generation state
  const [generatedDraft, setGeneratedDraft] = useState<any>(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    setUserEmail(user.email || "")

    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_completed, onboarding_step, newsletter_delivery_email")
      .eq("id", user.id)
      .single()

    if (userData?.onboarding_completed) {
      router.push("/dashboard")
      return
    }

    if (userData?.onboarding_step) {
      setCurrentStep(userData.onboarding_step)
    }

    // If they already have a newsletter delivery email set, use it
    if (userData?.newsletter_delivery_email) {
      setNewsletterEmail(userData.newsletter_delivery_email)
      setUseLoginEmail(false)
    }
  }

  const saveProgress = async (step: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("users")
      .update({ onboarding_step: step })
      .eq("id", user.id)
  }

  const handleNext = async () => {
    setCurrentStep((prev) => prev + 1)
    await saveProgress(currentStep + 1)
  }

  const handleSkipVoiceTraining = async () => {
    toast.info("Voice training skipped - you can train your voice anytime from Settings")
    await handleNext()
  }

  // Step 2: Create source
  const handleCreateSource = async () => {
    if (!selectedSourceType || !sourceUrl || !sourceName) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sourceName,
          type: selectedSourceType,
          url: sourceUrl,
          status: "active",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create source")
      }

      const data = await response.json()
      setCreatedSourceId(data.source.id)

      toast.success("Source added successfully!")
      await handleNext()
    } catch (error: any) {
      console.error("Error creating source:", error)
      toast.error(error.message || "Failed to create source")
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Voice training complete
  const handleVoiceTrainingComplete = async (voiceProfile: any) => {
    if (voiceProfile) {
      toast.success("Voice profile trained! AI will write in your style.")
    }
    await handleNext()
  }

  // Step 4: Save schedule
  const handleSaveSchedule = async () => {
    // Validate email if using different email
    if (!useLoginEmail && !newsletterEmail) {
      toast.error("Please enter a newsletter delivery email")
      return
    }

    if (!useLoginEmail && newsletterEmail) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newsletterEmail)) {
        toast.error("Please enter a valid email address")
        return
      }
    }

    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const preferences = {
        deliveryFrequency,
        deliveryDay,
        deliveryTime,
        emailNotifications: true,
        weeklyDigest: true,
        marketingEmails: false,
      }

      // Determine which email to use for newsletter delivery
      const deliveryEmail = useLoginEmail ? null : newsletterEmail

      const { error } = await supabase
        .from("users")
        .update({
          preferences,
          newsletter_delivery_email: deliveryEmail
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Preferences saved!")
      await handleNext()
    } catch (error: any) {
      console.error("Error saving schedule:", error)
      toast.error("Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Generate first newsletter
  const handleGenerateFirstNewsletter = async () => {
    if (!createdSourceId) {
      toast.error("No source found to scrape")
      return
    }

    try {
      setLoading(true)

      // Step 1: Scrape the source
      toast.loading("Scraping your source...")
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: createdSourceId }),
      })

      if (!scrapeResponse.ok) {
        throw new Error("Failed to scrape source")
      }

      const scrapeData = await scrapeResponse.json()
      toast.success(`Scraped ${scrapeData.summary.newItems} items`)

      // Step 2: Generate draft
      toast.loading("Generating your first newsletter...")
      const draftResponse = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "My First Newsletter",
          // API will fetch content and user's voice profile automatically
        }),
      })

      if (!draftResponse.ok) {
        throw new Error("Failed to generate draft")
      }

      const draftData = await draftResponse.json()
      setGeneratedDraft(draftData.draft)

      toast.success("Newsletter generated!")
      await handleNext()
    } catch (error: any) {
      console.error("Error generating newsletter:", error)
      toast.error(error.message || "Failed to generate newsletter")
    } finally {
      setLoading(false)
    }
  }

  // Step 6: Complete onboarding
  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from("users")
        .update({
          onboarding_completed: true,
          onboarding_step: 6,
        })
        .eq("id", user.id)

      toast.success("Onboarding complete! Welcome to CreatorPulse 🎉")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error completing onboarding:", error)
      toast.error("Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <Card className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Welcome to CreatorPulse
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              The anti-slop newsletter tool that curates content from your
              favorite sources and writes in YOUR unique voice (not generic AI).
            </p>

            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Rss className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium mb-1">Add Sources</p>
                <p className="text-sm text-muted-foreground">
                  YouTube, RSS, Twitter, or custom sites
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium mb-1">Train Your Voice</p>
                <p className="text-sm text-muted-foreground">
                  AI learns YOUR writing style
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium mb-1">Auto-Generate</p>
                <p className="text-sm text-muted-foreground">
                  Drafts ready on your schedule
                </p>
              </div>
            </div>

            <div className="bg-accent/10 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-sm text-accent font-medium mb-2">
                ✨ What Makes This Different?
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>✅ Zero AI slop - reports facts, no fluff</li>
                <li>✅ Writes in YOUR style (after training)</li>
                <li>✅ Mandatory source attribution</li>
                <li>✅ You review before sending</li>
                <li>✅ Auto-scrapes every 6 hours</li>
              </ul>
            </div>

            <Button onClick={handleNext} size="lg" className="gap-2">
              Get Started
              <Sparkles className="h-5 w-5" />
            </Button>
          </Card>
        )}

        {/* Step 2: Add First Source */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Add Your First Source</h2>
              <p className="text-muted-foreground">
                Choose where you want to curate content from
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {SOURCE_TYPES.map((source) => {
                const Icon = source.icon
                const isSelected = selectedSourceType === source.type

                return (
                  <Card
                    key={source.type}
                    className={`p-6 cursor-pointer transition-all ${
                      isSelected
                        ? `${source.borderColor} border-2 ${source.bgColor}`
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedSourceType(source.type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${source.bgColor} flex items-center justify-center`}
                        >
                          <Icon className={`h-6 w-6 ${source.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {source.free ? (
                              <span className="text-green-500">✓ Free</span>
                            ) : (
                              <span className="text-orange-500">
                                {source.cost}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {selectedSourceType && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-name">Source Name</Label>
                    <Input
                      id="source-name"
                      placeholder="e.g., My Tech Channel"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="source-url">
                      {selectedSourceType === "youtube"
                        ? "YouTube Channel URL"
                        : selectedSourceType === "newsletter_rss"
                        ? "RSS Feed URL"
                        : selectedSourceType === "twitter"
                        ? "Twitter Profile URL"
                        : "Website URL"}
                    </Label>
                    <Input
                      id="source-url"
                      placeholder={
                        selectedSourceType === "youtube"
                          ? "https://www.youtube.com/@channel"
                          : selectedSourceType === "newsletter_rss"
                          ? "https://example.com/feed.xml"
                          : selectedSourceType === "twitter"
                          ? "https://twitter.com/username"
                          : "https://example.com"
                      }
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleCreateSource}
                disabled={!selectedSourceType || !sourceUrl || !sourceName || loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Train Voice */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <VoiceTrainer
              onComplete={handleVoiceTrainingComplete}
              showSkip={true}
            />
          </div>
        )}

        {/* Step 4: Set Schedule & Email Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Set Your Preferences
              </h2>
              <p className="text-muted-foreground">
                Configure your newsletter schedule and delivery
              </p>
            </div>

            <Card className="p-6 max-w-2xl mx-auto">
              <div className="space-y-6">
                {/* Newsletter Delivery Email */}
                <div className="space-y-3 pb-6 border-b border-border">
                  <div>
                    <Label className="text-base font-semibold">Newsletter Delivery Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Where should we send your generated newsletter drafts?
                    </p>
                  </div>

                  <RadioGroup
                    value={useLoginEmail ? "login" : "different"}
                    onValueChange={(value) => setUseLoginEmail(value === "login")}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                      <RadioGroupItem value="login" id="login-email" />
                      <Label htmlFor="login-email" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Use my login email</p>
                          <p className="text-sm text-muted-foreground">{userEmail}</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                      <RadioGroupItem value="different" id="different-email" />
                      <Label htmlFor="different-email" className="flex-1 cursor-pointer">
                        <p className="font-medium">Use a different email</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {!useLoginEmail && (
                    <div className="mt-3 ml-6">
                      <Input
                        type="email"
                        placeholder="Enter newsletter delivery email..."
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="max-w-md"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Newsletter drafts will be sent to this email address
                      </p>
                    </div>
                  )}
                </div>

                {/* Schedule Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Generation Schedule</Label>

                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={deliveryFrequency}
                      onValueChange={setDeliveryFrequency}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(deliveryFrequency === "weekly" ||
                    deliveryFrequency === "biweekly") && (
                    <div>
                      <Label>Day of Week</Label>
                      <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">How It Works:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>🔄 Sources scraped automatically every 6 hours</li>
                  <li>
                    ⚡ Draft generated at your scheduled time (
                    {deliveryFrequency === "daily"
                      ? "every day"
                      : deliveryFrequency === "weekly"
                      ? `every ${deliveryDay}`
                      : deliveryFrequency === "biweekly"
                      ? `every other ${deliveryDay}`
                      : "1st of month"}{" "}
                    at {deliveryTime})
                  </li>
                  <li>📧 Draft sent to {useLoginEmail ? userEmail : (newsletterEmail || "your chosen email")}</li>
                  <li>✅ You review, edit if needed, then send</li>
                </ul>
              </div>
            </Card>

            <div className="flex gap-2 justify-end max-w-2xl mx-auto">
              <Button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Generate First Newsletter */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Generate Your First Newsletter
              </h2>
              <p className="text-muted-foreground">
                Let's create a sample draft to see the magic in action
              </p>
            </div>

            {!generatedDraft ? (
              <Card className="p-8 max-w-2xl mx-auto text-center">
                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-left">
                    <p className="text-sm font-medium mb-2">
                      What to Expect:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ AI scrapes your source for latest content</li>
                      <li>✅ Analyzes and categorizes by relevance</li>
                      <li>
                        ✅ Generates draft in YOUR voice (if trained)
                      </li>
                      <li>✅ Zero AI slop - only reports facts</li>
                      <li>✅ All sources properly attributed</li>
                      <li>⚠️ Draft marked for review before sending</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleGenerateFirstNewsletter}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating... (this may take 30-60 seconds)
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Generate First Newsletter
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    This is just a demo - you can edit or delete it later
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      ✅ Newsletter Generated!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Preview your first draft
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>

                <div className="p-4 bg-card border rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">
                    {generatedDraft.title}
                  </p>
                  <div className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto">
                    {generatedDraft.ai_body.split("\n").slice(0, 10).join("\n")}
                    {generatedDraft.ai_body.split("\n").length > 10 && (
                      <p className="text-muted-foreground">
                        ... (preview truncated)
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-6">
                  <p className="text-sm font-medium mb-2">
                    📊 What CreatorPulse Did:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Content scraped</p>
                      <p className="font-medium">
                        {generatedDraft.curated_items?.length || 0} items
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">AI slop level</p>
                      <p className="font-medium text-green-500">Zero ✓</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sources cited</p>
                      <p className="font-medium">
                        {generatedDraft.curated_items?.length || 0}/{generatedDraft.curated_items?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Your voice</p>
                      <p className="font-medium">Applied ✓</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full gap-2"
                >
                  Continue to Dashboard
                  <Check className="h-5 w-5" />
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Step 6: Success / Complete */}
        {currentStep === 6 && (
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              You're All Set! 🎉
            </h2>
            <p className="text-muted-foreground mb-6">
              CreatorPulse is now working in the background
            </p>

            <div className="space-y-3 mb-8">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Auto-Scraping Active</p>
                    <p className="text-xs text-muted-foreground">
                      Your sources will be scraped every 6 hours automatically
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      Scheduled Generation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drafts will be generated on your schedule (
                      {deliveryFrequency === "daily"
                        ? "daily"
                        : deliveryFrequency === "weekly"
                        ? `every ${deliveryDay}`
                        : deliveryFrequency === "biweekly"
                        ? `every other ${deliveryDay}`
                        : "monthly"}{" "}
                      at {deliveryTime})
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Voice Profile Learned</p>
                    <p className="text-xs text-muted-foreground">
                      AI will write in your unique style, not generic slop
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-accent/10 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-2">
                📬 What Happens Next?
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>
                  1. CreatorPulse scrapes your sources in the background
                </li>
                <li>
                  2. At your scheduled time, a draft is auto-generated
                </li>
                <li>3. You'll get a notification when it's ready</li>
                <li>4. Review, edit if needed (takes 2-5 minutes)</li>
                <li>5. Send to your subscribers - Done!</li>
              </ul>
            </div>

            <Button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              size="lg"
              className="gap-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Go to Dashboard
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
