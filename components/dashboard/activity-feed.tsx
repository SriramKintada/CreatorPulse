'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Eye, Rss, Database, Mic, AlertCircle } from "lucide-react"
import { useActivityFeed } from "@/lib/hooks/use-activity-feed"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"

const typeConfig = {
  draft_generated: {
    icon: Mail,
    color: "bg-blue-500/10",
    textColor: "text-blue-500",
  },
  draft_sent: {
    icon: Eye,
    color: "bg-green-500/10",
    textColor: "text-green-500",
  },
  source_added: {
    icon: Rss,
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
  },
  source_scraped: {
    icon: Database,
    color: "bg-orange-500/10",
    textColor: "text-orange-500",
  },
  voice_trained: {
    icon: Mic,
    color: "bg-pink-500/10",
    textColor: "text-pink-500",
  },
}

export function ActivityFeed() {
  const { activities, loading, error } = useActivityFeed(5)

  if (loading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent events and updates</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-2">
              Start by adding sources or generating drafts
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent events and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = typeConfig[activity.activity_type] || {
              icon: AlertCircle,
              color: "bg-gray-500/10",
              textColor: "text-gray-500",
            }
            const Icon = config.icon
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
            })

            return (
              <div
                key={activity.id}
                className="flex gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div className={`rounded-lg p-2 ${config.color} shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
