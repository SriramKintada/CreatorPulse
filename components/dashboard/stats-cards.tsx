'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Mail, Users, BarChart3 } from "lucide-react"
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats"
import { Spinner } from "@/components/ui/spinner"

export function StatsCards() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="flex items-center justify-center h-32">
              <Spinner size="md" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full border-border/50">
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              {error || 'Failed to load stats. Please try again.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Subscribers",
      value: stats.subscribers.toLocaleString(),
      change: stats.engagementTrend === 'up' ? '+12.5%' : stats.engagementTrend === 'stable' ? '0%' : '-5.2%',
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Newsletters Sent",
      value: stats.newslettersSent.toString(),
      change: `+${stats.draftsThisWeek} this week`,
      icon: Mail,
      color: "text-purple-500",
    },
    {
      title: "Avg. Open Rate",
      value: `${(stats.openRate * 100).toFixed(1)}%`,
      change: stats.engagementTrend === 'up' ? '+2.1% vs last month' : stats.engagementTrend === 'stable' ? 'No change' : '-1.5% vs last month',
      icon: TrendingUp,
      color: stats.engagementTrend === 'up' ? "text-green-500" : stats.engagementTrend === 'stable' ? "text-yellow-500" : "text-red-500",
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks.toLocaleString(),
      change: `${(stats.clickThroughRate * 100).toFixed(1)}% CTR`,
      icon: BarChart3,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
