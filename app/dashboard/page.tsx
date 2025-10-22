import { MainLayout } from "@/components/layout/main-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { DraftStatusWidget } from "@/components/dashboard/draft-status-widget"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Creator</h1>
          <p className="text-muted-foreground">Here's what's happening with your newsletters</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Draft Status & Calendar */}
          <div className="space-y-8 lg:col-span-2">
            <DraftStatusWidget />
            <CalendarWidget />
          </div>

          {/* Right Column - Activity Feed */}
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </MainLayout>
  )
}
