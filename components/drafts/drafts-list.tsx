"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDrafts } from "@/lib/hooks/use-drafts"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/10 text-blue-500",
  sent: "bg-green-500/10 text-green-500",
  archived: "bg-gray-500/10 text-gray-500",
}

interface DraftsListProps {
  selectedId: string | null
  onSelectDraft: (id: string | null) => void
}

export function DraftsList({ selectedId, onSelectDraft }: DraftsListProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "draft" | "scheduled" | "sent">("all")
  const { drafts, loading, error } = useDrafts(100)

  const filtered = drafts.filter((draft) => {
    const matchesSearch = draft.ai_title?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || draft.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Search and Filter */}
      <div className="space-y-3 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "draft", "scheduled", "sent"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status as typeof filter)}
              className="whitespace-nowrap"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Drafts List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">
              {search ? "No drafts found" : "No drafts yet. Create your first draft!"}
            </p>
          </div>
        ) : (
          filtered.map((draft) => {
            const preview = draft.ai_intro || draft.ai_body?.substring(0, 100) || "No content"
            const date = format(new Date(draft.generated_at), "MMM d, yyyy")

            return (
              <button
                key={draft.id}
                onClick={() => onSelectDraft(draft.id)}
                className={cn(
                  "w-full rounded-lg border border-border/50 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/50",
                  selectedId === draft.id && "border-primary bg-primary/10",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-foreground line-clamp-1">
                    {draft.ai_title || "Untitled Draft"}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-xs",
                      statusColors[draft.status as keyof typeof statusColors]
                    )}
                  >
                    {draft.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{preview}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
