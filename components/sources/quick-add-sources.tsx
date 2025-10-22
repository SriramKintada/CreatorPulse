"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CURATED_SOURCES, type CuratedSource, type DomainCategory } from "@/lib/data/curated-sources"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Check, Loader2, Sparkles } from "lucide-react"

interface QuickAddSourcesProps {
  onSourceAdded?: () => void
}

export function QuickAddSources({ onSourceAdded }: QuickAddSourcesProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory | null>(null)
  const [addingSource, setAddingSource] = useState<string | null>(null)
  const [addedSources, setAddedSources] = useState<Set<string>>(new Set())

  const handleAddSource = async (source: CuratedSource) => {
    try {
      setAddingSource(source.url)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please log in to add sources")
        return
      }

      // Check if source already exists
      const { data: existing } = await supabase
        .from('sources')
        .select('id')
        .eq('user_id', user.id)
        .eq('url', source.url)
        .single()

      if (existing) {
        toast.error("You've already added this source")
        setAddingSource(null)
        return
      }

      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: source.name,
          type: source.type,
          url: source.url,
          status: 'active',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add source')
      }

      setAddedSources(prev => new Set([...prev, source.url]))
      toast.success(`Added ${source.name}!`)

      if (onSourceAdded) {
        onSourceAdded()
      }
    } catch (error) {
      console.error('Error adding source:', error)
      toast.error('Failed to add source')
    } finally {
      setAddingSource(null)
    }
  }

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'newsletter_rss': return 'RSS'
      case 'youtube': return 'YouTube'
      case 'twitter': return 'Twitter'
      case 'reddit': return 'Reddit'
      default: return type
    }
  }

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'newsletter_rss': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'youtube': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'twitter': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'reddit': return 'bg-orange-600/10 text-orange-600 border-orange-600/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Quick Add Sources</h2>
          <p className="text-sm text-muted-foreground">
            Add popular sources from curated collections
          </p>
        </div>
      </div>

      {/* Domain Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {CURATED_SOURCES.map((domain) => (
          <Card
            key={domain.id}
            className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
              selectedDomain?.id === domain.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border'
            }`}
            onClick={() => setSelectedDomain(domain)}
          >
            <div className="text-center space-y-2">
              <div className="text-3xl">{domain.icon}</div>
              <div>
                <p className="font-semibold text-sm">{domain.name}</p>
                <p className="text-xs text-muted-foreground">
                  {domain.sources.length} sources
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Domain Sources */}
      {selectedDomain && (
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedDomain.icon}</span>
              <h3 className="text-xl font-bold">{selectedDomain.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedDomain.description}
            </p>
          </div>

          <div className="grid gap-3">
            {selectedDomain.sources.map((source) => {
              const isAdded = addedSources.has(source.url)
              const isAdding = addingSource === source.url

              return (
                <div
                  key={source.url}
                  className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{source.name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSourceTypeColor(source.type)}`}
                      >
                        {getSourceTypeLabel(source.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {source.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={isAdded ? "outline" : "default"}
                    onClick={() => handleAddSource(source)}
                    disabled={isAdding || isAdded}
                    className="ml-4"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : isAdded ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {!selectedDomain && (
        <Card className="p-8 text-center border-dashed">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select a category above to see popular sources
          </p>
        </Card>
      )}
    </div>
  )
}
