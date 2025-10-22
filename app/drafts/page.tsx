"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { DraftsList } from "@/components/drafts/drafts-list"
import { DraftEditor } from "@/components/drafts/draft-editor"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useDrafts } from "@/lib/hooks/use-drafts"

export default function DraftsPage() {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { refetch } = useDrafts(100)

  const handleCreateDraft = async () => {
    let loadingToast: string | number | undefined
    try {
      setIsCreating(true)
      loadingToast = toast.loading("Generating draft with AI...")

      const response = await fetch('/api/drafts', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create draft')
      }

      const data = await response.json()

      // Dismiss loading toast and show success
      if (loadingToast) toast.dismiss(loadingToast)
      toast.success(data.message || 'Draft created successfully!')

      // Refresh the drafts list and select the new draft
      await refetch()
      if (data.draft?.id) {
        setSelectedDraftId(data.draft.id)
      }
    } catch (error) {
      console.error('Error creating draft:', error)
      // Dismiss loading toast and show error
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Failed to create draft')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDraftUpdated = async () => {
    // Refresh the drafts list when a draft is updated
    await refetch()
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)] gap-0">
        {/* Left Sidebar - Drafts List */}
        <div className="w-80 border-r border-border bg-card/50 overflow-y-auto hidden lg:flex flex-col">
          <div className="sticky top-0 border-b border-border bg-card p-4 z-10">
            <Button
              className="w-full gap-2"
              size="sm"
              onClick={handleCreateDraft}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'New Draft'}
            </Button>
          </div>
          <DraftsList selectedId={selectedDraftId} onSelectDraft={setSelectedDraftId} />
        </div>

        {/* Center - Editor (Full Width) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DraftEditor draftId={selectedDraftId} onDraftUpdated={handleDraftUpdated} />
        </div>
      </div>
    </MainLayout>
  )
}
