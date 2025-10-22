"use client"

import { Button } from "@/components/ui/button"
import { Plus, Zap, Upload, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function QuickActions() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScraping, setIsScraping] = useState(false)

  const handleGenerateDraft = async () => {
    let loadingToast: string | number | undefined
    try {
      setIsGenerating(true)
      loadingToast = toast.loading("Generating AI draft...")

      const response = await fetch('/api/drafts', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate draft')
      }

      const data = await response.json()

      // Dismiss loading toast and show success
      if (loadingToast) toast.dismiss(loadingToast)
      toast.success(data.message || 'Draft generated successfully!')

      // Redirect to drafts page
      router.push('/drafts')
    } catch (error) {
      console.error('Error generating draft:', error)
      // Dismiss loading toast and show error
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Failed to generate draft')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScrapeSources = async () => {
    let loadingToast: string | number | undefined
    try {
      setIsScraping(true)
      loadingToast = toast.loading("Scraping your sources...")

      const response = await fetch('/api/scrape', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to scrape sources')
      }

      const data = await response.json()

      // Dismiss loading toast and show success
      if (loadingToast) toast.dismiss(loadingToast)
      toast.success(data.message || 'Sources scraped successfully!')
    } catch (error) {
      console.error('Error scraping sources:', error)
      // Dismiss loading toast and show error
      if (loadingToast) toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : 'Failed to scrape sources')
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 md:flex-row z-50">
      <Button
        size="lg"
        className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => router.push('/drafts')}
      >
        <Plus className="h-5 w-5" />
        New Draft
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
        onClick={handleGenerateDraft}
        disabled={isGenerating}
      >
        <Zap className="h-5 w-5" />
        {isGenerating ? 'Generating...' : 'AI Generate'}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-background"
        onClick={handleScrapeSources}
        disabled={isScraping}
      >
        <RefreshCw className={`h-5 w-5 ${isScraping ? 'animate-spin' : ''}`} />
        {isScraping ? 'Scraping...' : 'Scrape Sources'}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-background"
        onClick={() => router.push('/sources')}
      >
        <Upload className="h-5 w-5" />
        Add Source
      </Button>
    </div>
  )
}
