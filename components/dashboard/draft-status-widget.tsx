'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle2 } from "lucide-react"
import { useDrafts } from "@/lib/hooks/use-drafts"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

const statusConfig = {
  draft: { icon: FileText, color: "bg-muted", label: "Draft" },
  scheduled: { icon: Clock, color: "bg-blue-500/10", label: "Scheduled" },
  sent: { icon: CheckCircle2, color: "bg-green-500/10", label: "Sent" },
  archived: { icon: FileText, color: "bg-muted", label: "Archived" },
}

export function DraftStatusWidget() {
  const { drafts, loading, error } = useDrafts(5)
  const router = useRouter()

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Drafts</CardTitle>
          <CardDescription>Your latest newsletter drafts and scheduled sends</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Drafts</CardTitle>
          <CardDescription>Your latest newsletter drafts and scheduled sends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (drafts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Drafts</CardTitle>
          <CardDescription>Your latest newsletter drafts and scheduled sends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No drafts yet</p>
            <Button onClick={() => router.push('/drafts')}>
              Create Your First Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Drafts</CardTitle>
        <CardDescription>Your latest newsletter drafts and scheduled sends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drafts.map((draft) => {
            const config = statusConfig[draft.status]
            const Icon = config.icon
            const displayDate = draft.scheduled_at
              ? format(new Date(draft.scheduled_at), 'MMM d, yyyy')
              : draft.sent_at
              ? format(new Date(draft.sent_at), 'MMM d, yyyy')
              : format(new Date(draft.generated_at), 'MMM d, yyyy')

            return (
              <div
                key={draft.id}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/drafts?id=${draft.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-2 ${config.color}`}>
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{draft.ai_title || 'Untitled Draft'}</p>
                    <p className="text-xs text-muted-foreground">{displayDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{config.label}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/drafts?id=${draft.id}`)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full bg-transparent"
          onClick={() => router.push('/drafts')}
        >
          View All Drafts
        </Button>
      </CardContent>
    </Card>
  )
}
