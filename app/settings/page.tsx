"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MainLayout } from "@/components/layout/main-layout"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    timezone: "America/Los_Angeles",
    emailNotifications: true,
    weeklyDigest: true,
    marketingEmails: false,
    deliveryFrequency: "weekly",
    deliveryTime: "08:00",
    deliveryDay: "monday",
    newsletterDeliveryEmail: "",
    useLoginEmail: true,
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      setLoginEmail(user.email || "")

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (userData) {
        const prefs = userData.preferences || {}
        setFormData({
          name: userData.display_name || "",
          email: user.email || "",
          company: userData.company || "",
          timezone: userData.timezone || "America/Los_Angeles",
          emailNotifications: prefs.emailNotifications !== false,
          weeklyDigest: prefs.weeklyDigest !== false,
          marketingEmails: prefs.marketingEmails || false,
          deliveryFrequency: prefs.deliveryFrequency || "weekly",
          deliveryTime: prefs.deliveryTime || "08:00",
          deliveryDay: prefs.deliveryDay || "monday",
          newsletterDeliveryEmail: userData.newsletter_delivery_email || "",
          useLoginEmail: !userData.newsletter_delivery_email,
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const supabase = createClient()

      if (!userId) {
        toast.error("User not found")
        return
      }

      // Validate newsletter email if using different email
      if (!formData.useLoginEmail && !formData.newsletterDeliveryEmail) {
        toast.error("Please enter a newsletter delivery email")
        return
      }

      if (!formData.useLoginEmail && formData.newsletterDeliveryEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.newsletterDeliveryEmail)) {
          toast.error("Please enter a valid email address")
          return
        }
      }

      const preferences = {
        deliveryFrequency: formData.deliveryFrequency,
        deliveryDay: formData.deliveryDay,
        deliveryTime: formData.deliveryTime,
        emailNotifications: formData.emailNotifications,
        weeklyDigest: formData.weeklyDigest,
        marketingEmails: formData.marketingEmails,
      }

      const updateData: any = {
        display_name: formData.name,
        company: formData.company,
        timezone: formData.timezone,
        preferences,
        newsletter_delivery_email: formData.useLoginEmail ? null : formData.newsletterDeliveryEmail,
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId)

      if (error) throw error

      toast.success("Settings saved successfully!")
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast.error(error.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "newsletter", label: "Newsletter Schedule" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing" },
    { id: "integrations", label: "Integrations" },
  ]

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-foreground/60">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-accent-primary/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-accent-primary text-accent-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="border-accent-primary/20">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select className="w-full px-3 py-2 bg-background border border-accent-primary/20 rounded-lg text-foreground focus:outline-none focus:border-accent-primary">
                  <option>UTC-5</option>
                  <option>UTC-6</option>
                  <option>UTC-7</option>
                  <option>UTC-8</option>
                </select>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="bg-accent-primary hover:bg-accent-primary/90">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        )}

        {/* Newsletter Schedule Tab */}
        {activeTab === "newsletter" && (
          <Card className="border-accent-primary/20">
            {loading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Newsletter Delivery Settings</h2>
                  <p className="text-sm text-foreground/60">
                    Configure when and where you want your newsletter drafts to be delivered
                  </p>
                </div>

                {/* Newsletter Delivery Email */}
                <div className="space-y-3 pb-6 border-b border-accent-primary/20">
                  <div>
                    <Label className="text-base font-semibold">Newsletter Delivery Email</Label>
                    <p className="text-sm text-foreground/60 mt-1">
                      Where should we send your generated newsletter drafts?
                    </p>
                  </div>

                  <RadioGroup
                    value={formData.useLoginEmail ? "login" : "different"}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, useLoginEmail: value === "login" }))}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent-primary/20 hover:bg-accent-primary/5 cursor-pointer">
                      <RadioGroupItem value="login" id="settings-login-email" />
                      <Label htmlFor="settings-login-email" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Use my login email</p>
                          <p className="text-sm text-foreground/60">{loginEmail}</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-accent-primary/20 hover:bg-accent-primary/5 cursor-pointer">
                      <RadioGroupItem value="different" id="settings-different-email" />
                      <Label htmlFor="settings-different-email" className="flex-1 cursor-pointer">
                        <p className="font-medium">Use a different email</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {!formData.useLoginEmail && (
                    <div className="mt-3 ml-6">
                      <Input
                        type="email"
                        placeholder="Enter newsletter delivery email..."
                        value={formData.newsletterDeliveryEmail}
                        onChange={(e) => setFormData((prev) => ({ ...prev, newsletterDeliveryEmail: e.target.value }))}
                        className="max-w-md"
                      />
                      <p className="text-xs text-foreground/50 mt-2">
                        Newsletter drafts will be sent to this email address
                      </p>
                    </div>
                  )}
                </div>

                {/* Schedule Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Generation Schedule</Label>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Newsletter Frequency</label>
                    <select
                      className="w-full px-3 py-2 bg-background border border-accent-primary/20 rounded-lg text-foreground focus:outline-none focus:border-accent-primary"
                      value={formData.deliveryFrequency}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deliveryFrequency: e.target.value }))}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <p className="text-xs text-foreground/50 mt-1">
                      How often you want to receive your newsletter
                    </p>
                  </div>

                  {(formData.deliveryFrequency === 'weekly' || formData.deliveryFrequency === 'biweekly') && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Delivery Day</label>
                      <select
                        className="w-full px-3 py-2 bg-background border border-accent-primary/20 rounded-lg text-foreground focus:outline-none focus:border-accent-primary"
                        value={formData.deliveryDay}
                        onChange={(e) => setFormData((prev) => ({ ...prev, deliveryDay: e.target.value }))}
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                      <p className="text-xs text-foreground/50 mt-1">
                        Which day of the week to receive your newsletter
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Delivery Time</label>
                    <Input
                      type="time"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                      className="w-full"
                    />
                    <p className="text-xs text-foreground/50 mt-1">
                      Time when your newsletter will be generated (your timezone)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                  <h3 className="font-medium text-foreground mb-2">How it works:</h3>
                  <ul className="text-sm text-foreground/60 space-y-1 list-disc list-inside">
                    <li>We'll automatically scrape your sources before your scheduled time</li>
                    <li>Your newsletter will be ready at the time you specify</li>
                    <li>Draft sent to {formData.useLoginEmail ? loginEmail : (formData.newsletterDeliveryEmail || "your chosen email")}</li>
                    <li>You can manually generate newsletters anytime from the Drafts page</li>
                  </ul>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="bg-accent-primary hover:bg-accent-primary/90">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="border-accent-primary/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                <div>
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  <p className="text-sm text-foreground/60">Get notified about important updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                <div>
                  <h3 className="font-medium text-foreground">Weekly Digest</h3>
                  <p className="text-sm text-foreground/60">Receive a weekly summary of your newsletters</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.weeklyDigest}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weeklyDigest: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                <div>
                  <h3 className="font-medium text-foreground">Marketing Emails</h3>
                  <p className="text-sm text-foreground/60">Receive updates about new features</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.marketingEmails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      marketingEmails: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="bg-accent-primary hover:bg-accent-primary/90">
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </Card>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <Card className="border-accent-primary/20">
            <div className="p-6 space-y-6">
              <div className="p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">Current Plan</h3>
                    <p className="text-sm text-foreground/60">Professional</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <p className="text-sm text-foreground/60">$29/month • Renews on Dec 15, 2024</p>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Manage Subscription
              </Button>

              <div className="pt-4 border-t border-accent-primary/20">
                <h3 className="font-medium text-foreground mb-4">Billing History</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="text-foreground/60">Invoice #{1000 + i}</span>
                      <span className="text-foreground font-medium">$29.00</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <Card className="border-accent-primary/20">
            <div className="p-6 space-y-4">
              {["Slack", "Zapier", "Make", "GitHub"].map((integration) => (
                <div
                  key={integration}
                  className="flex justify-between items-center p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{integration}</h3>
                    <p className="text-sm text-foreground/60">Connect your {integration} account</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
