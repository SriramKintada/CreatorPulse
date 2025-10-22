"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Save,
  Send,
  MoreVertical,
  Eye,
  Trash2,
  Clock,
  Download,
  FileText,
  File,
  Table,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DraftEditorProps {
  draftId: string | null
  onDraftUpdated?: () => void
}

export function DraftEditor({ draftId, onDraftUpdated }: DraftEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<any>(null)
  const [editStartTime, setEditStartTime] = useState<number>(0)
  const [totalEditTime, setTotalEditTime] = useState<number>(0)
  const [originalContent, setOriginalContent] = useState<string>("")
  const [sending, setSending] = useState(false)
  const router = useRouter()

  // Load draft data when draftId changes
  useEffect(() => {
    if (!draftId) {
      setTitle("")
      setContent("")
      setDraft(null)
      return
    }

    async function loadDraft() {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .eq('id', draftId)
          .single()

        if (error) throw error

        setDraft(data)
        setTitle(data.ai_title || "")
        const draftContent = data.user_edited_body || data.ai_body || ""
        setContent(draftContent)
        setOriginalContent(data.ai_body || "") // Store original AI-generated content
        setTotalEditTime(data.user_total_edit_time || 0)
        setEditStartTime(Date.now()) // Start tracking edit time
      } catch (error) {
        console.error('Error loading draft:', error)
        toast.error('Failed to load draft')
      } finally {
        setLoading(false)
      }
    }

    loadDraft()
  }, [draftId])

  const handleSave = async () => {
    if (!draftId) {
      toast.error('No draft selected')
      return
    }

    try {
      setSaving(true)

      // Calculate edit time (in seconds)
      const sessionEditTime = editStartTime ? Math.floor((Date.now() - editStartTime) / 1000) : 0
      const newTotalEditTime = totalEditTime + sessionEditTime

      // Calculate AI acceptance rate (similarity between original AI content and edited content)
      const acceptanceRate = calculateAcceptanceRate(originalContent, content)

      console.log(`📊 Edit Tracking:`)
      console.log(`   - Session edit time: ${sessionEditTime}s`)
      console.log(`   - Total edit time: ${newTotalEditTime}s`)
      console.log(`   - AI acceptance rate: ${(acceptanceRate * 100).toFixed(1)}%`)

      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_edited_body: content,
          user_total_edit_time: newTotalEditTime,
          ai_acceptance_rate: acceptanceRate,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success(`Draft saved! (${Math.floor(sessionEditTime / 60)}m ${sessionEditTime % 60}s editing)`)

      // Reset edit timer for next session
      setEditStartTime(Date.now())
      setTotalEditTime(newTotalEditTime)

      if (onDraftUpdated) onDraftUpdated()
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  // Calculate AI acceptance rate using simple similarity
  const calculateAcceptanceRate = (original: string, edited: string): number => {
    if (!original || !edited) return 0
    if (original === edited) return 1

    // Calculate similarity using simple character-level comparison
    const originalNormalized = original.toLowerCase().replace(/\s+/g, ' ').trim()
    const editedNormalized = edited.toLowerCase().replace(/\s+/g, ' ').trim()

    let matches = 0
    const minLength = Math.min(originalNormalized.length, editedNormalized.length)

    for (let i = 0; i < minLength; i++) {
      if (originalNormalized[i] === editedNormalized[i]) {
        matches++
      }
    }

    // Acceptance rate = (matching chars / avg length)
    const avgLength = (originalNormalized.length + editedNormalized.length) / 2
    const rate = avgLength > 0 ? matches / avgLength : 0

    return Math.max(0, Math.min(1, rate)) // Clamp between 0 and 1
  }

  const handleDelete = async () => {
    if (!draftId) return
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Draft deleted successfully')
      if (onDraftUpdated) onDraftUpdated()
      router.push('/drafts')
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error('Failed to delete draft')
    }
  }

  // Download functions
  const downloadAsMarkdown = () => {
    const markdownContent = `# ${title}\n\n${content}`
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded as Markdown!')
  }

  const downloadAsText = () => {
    const textContent = `${title}\n\n${content}`
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded as Text!')
  }

  const downloadAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded as HTML!')
  }

  const downloadAsCSV = () => {
    // Create CSV from draft metadata and curated items
    const csvRows = [
      ['Field', 'Value'],
      ['Title', title],
      ['Content Length', content.length.toString()],
      ['Status', draft?.status || 'draft'],
      ['Created', draft?.generated_at || ''],
      ['', ''],
      ['Curated Items', ''],
      ['Title', 'URL', 'Author', 'Source']
    ]

    if (draft?.ai_curated_items) {
      draft.ai_curated_items.forEach((item: any) => {
        csvRows.push([
          item.title || '',
          item.url || '',
          item.author || '',
          item.source_type || ''
        ])
      })
    }

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded as CSV!')
  }

  const handleSendNewsletter = async () => {
    if (!draftId) {
      toast.error('No draft selected')
      return
    }

    if (!confirm('Send this newsletter to all your subscribers?')) {
      return
    }

    try {
      setSending(true)
      const loadingToast = toast.loading('Sending newsletter to subscribers...')

      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          title,
          content: content || draft?.user_edited_body || draft?.ai_body,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send newsletter')
      }

      const data = await response.json()

      toast.dismiss(loadingToast)
      toast.success(`Newsletter sent to ${data.sentCount} subscribers!`)

      if (onDraftUpdated) onDraftUpdated()
    } catch (error) {
      console.error('Error sending newsletter:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send newsletter')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!draftId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Send className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Draft Selected</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a draft from the sidebar or create a new one to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        {/* Top Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Newsletter title..."
              className="text-lg font-semibold"
              disabled
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              <Eye className="h-4 w-4 mr-2" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Editor Toolbar */}
        {!preview && (
          <div className="flex flex-wrap gap-1 border-t border-border pt-4">
            <Button variant="ghost" size="icon-sm" title="Bold" disabled>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Italic" disabled>
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="ghost" size="icon-sm" title="Bullet List" disabled>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Numbered List" disabled>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="ghost" size="icon-sm" title="Link" disabled>
              <Link2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Image" disabled>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        {preview ? (
          <div className="p-8 max-w-2xl mx-auto">
            <article className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">{content}</div>
            </article>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your newsletter..."
            className="w-full h-full p-8 bg-background text-foreground resize-none focus:outline-none font-mono text-sm"
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Status: <span className="font-medium">{draft?.status || 'draft'}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadAsMarkdown}>
                <FileText className="h-4 w-4 mr-2" />
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsHTML}>
                <File className="h-4 w-4 mr-2" />
                HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsText}>
                <FileText className="h-4 w-4 mr-2" />
                Text (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsCSV}>
                <Table className="h-4 w-4 mr-2" />
                Excel/CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSendNewsletter} disabled={sending || !draft}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </div>
      </div>
    </div>
  )
}
