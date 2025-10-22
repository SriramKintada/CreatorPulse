"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Mail, Eye, Users, Send } from "lucide-react"

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDrafts: 0,
    sentNewsletters: 0,
    totalSources: 0,
    totalSubscribers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch drafts count
      const { count: draftsCount } = await supabase
        .from('drafts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch sent newsletters count
      const { count: sentCount } = await supabase
        .from('drafts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'sent')

      // Fetch sources count
      const { count: sourcesCount } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch total subscribers (all active users with email notifications enabled)
      const { data: subscribers } = await supabase
        .from('users')
        .select('preferences')
        .eq('status', 'active')

      const subscribersWithNotifications = subscribers?.filter((sub) => {
        const prefs = sub.preferences || {}
        return prefs.emailNotifications !== false
      }).length || 0

      setStats({
        totalDrafts: draftsCount || 0,
        sentNewsletters: sentCount || 0,
        totalSources: sourcesCount || 0,
        totalSubscribers: subscribersWithNotifications,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      label: "Total Drafts",
      value: stats.totalDrafts,
      icon: Mail,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Newsletters Sent",
      value: stats.sentNewsletters,
      icon: Send,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Active Sources",
      value: stats.totalSources,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Subscribers",
      value: stats.totalSubscribers,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your newsletter performance and engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Simple Activity Summary */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Drafts Created</p>
                <p className="text-2xl font-bold">{stats.totalDrafts}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Newsletters Sent</p>
                <p className="text-2xl font-bold">{stats.sentNewsletters}</p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalDrafts > 0
                    ? `${((stats.sentNewsletters / stats.totalDrafts) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 mt-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-2">📊 Analytics Overview</h3>
          <p className="text-sm text-muted-foreground">
            This page shows basic metrics from your CreatorPulse account.
            For more detailed analytics and event tracking, you can integrate PostHog.
          </p>
        </Card>
      </div>
    </MainLayout>
  )
}
