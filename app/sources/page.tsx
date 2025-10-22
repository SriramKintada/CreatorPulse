"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Twitter, Youtube, MessageSquare, Rss, Globe, Trash2, Edit, RefreshCw, Search, Power } from "lucide-react"
import { toast } from "sonner"
import { useSources } from "@/lib/hooks/use-sources"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { QuickAddSources } from "@/components/sources/quick-add-sources"

const sourceTypes = [
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: '@username or username' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel URL' },
  { value: 'reddit', label: 'Reddit', icon: MessageSquare, placeholder: 'r/subreddit or subreddit' },
  { value: 'newsletter_rss', label: 'Newsletter RSS', icon: Rss, placeholder: 'RSS feed URL' },
  { value: 'custom_url', label: 'Custom URL', icon: Globe, placeholder: 'Any webpage URL' },
]

export default function SourcesPage() {
  const { sources, loading, refetch } = useSources()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    type: 'twitter',
    url: '',
    config: {} as any,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required')
      return
    }

    try {
      setIsSubmitting(true)

      const endpoint = editingSource ? `/api/sources/${editingSource.id}` : '/api/sources'
      const method = editingSource ? 'PATCH' : 'POST'

      const payload: any = {
        name: formData.name,
        type: formData.type,
        url: formData.url,
        config: formData.config,
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${editingSource ? 'update' : 'add'} source`)
      }

      const data = await response.json()
      toast.success(data.message || `Source ${editingSource ? 'updated' : 'added'} successfully!`)

      // Reset form
      setFormData({ name: '', type: 'twitter', url: '', config: {} })
      setShowAddForm(false)
      setEditingSource(null)

      // Refresh sources list
      refetch()
    } catch (error) {
      console.error(`Error ${editingSource ? 'updating' : 'adding'} source:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${editingSource ? 'update' : 'add'} source`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (source: any) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      type: source.type,
      url: source.url,
      config: source.config || {},
    })
    setShowAddForm(true)
  }

  const handleToggleStatus = async (source: any) => {
    const newStatus = source.status === 'active' ? 'inactive' : 'active'

    try {
      const response = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update source status')
      }

      toast.success(`Source ${newStatus === 'active' ? 'activated' : 'paused'}`)
      refetch()
    } catch (error) {
      console.error('Error updating source status:', error)
      toast.error('Failed to update source status')
    }
  }

  const handleManualScrape = async (sourceId: string, sourceName: string) => {
    try {
      setScrapingSourceId(sourceId)
      toast.info(`Starting scrape for ${sourceName}...`)

      const response = await fetch('/api/scrape', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to trigger scrape')
      }

      const data = await response.json()
      toast.success(data.message || 'Scraping completed!')
      refetch()
    } catch (error) {
      console.error('Error triggering scrape:', error)
      toast.error('Failed to trigger scrape')
    } finally {
      setScrapingSourceId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete source')
      }

      toast.success('Source deleted successfully')
      refetch()
    } catch (error) {
      console.error('Error deleting source:', error)
      toast.error('Failed to delete source')
    }
  }

  const getSourceIcon = (type: string) => {
    const sourceType = sourceTypes.find(s => s.value === type)
    return sourceType ? sourceType.icon : Globe
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'running':
        return 'bg-blue-500 animate-pulse'
      default:
        return 'bg-gray-500'
    }
  }

  // Filter sources based on search query and filters
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || source.type === filterType
    const matchesStatus = filterStatus === 'all' || source.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCancelForm = () => {
    setShowAddForm(false)
    setEditingSource(null)
    setFormData({ name: '', type: 'twitter', url: '', config: {} })
  }

  // Render type-specific config fields
  const renderConfigFields = () => {
    const config = formData.config || {}

    switch (formData.type) {
      case 'twitter':
        return (
          <>
            <div>
              <Label>Max Items to Scrape</Label>
              <Input
                type="number"
                value={config.maxItems || 50}
                onChange={(e) => setFormData({ ...formData, config: { ...config, maxItems: parseInt(e.target.value) } })}
                placeholder="50"
              />
            </div>
            <div>
              <Label>Keywords (comma-separated, optional)</Label>
              <Input
                value={config.keywords || ''}
                onChange={(e) => setFormData({ ...formData, config: { ...config, keywords: e.target.value } })}
                placeholder="AI, technology, startup"
              />
            </div>
          </>
        )
      case 'youtube':
        return (
          <div>
            <Label>Max Videos to Scrape</Label>
            <Input
              type="number"
              value={config.maxResults || 10}
              onChange={(e) => setFormData({ ...formData, config: { ...config, maxResults: parseInt(e.target.value) } })}
              placeholder="10"
            />
          </div>
        )
      case 'reddit':
        return (
          <>
            <div>
              <Label>Max Posts to Scrape</Label>
              <Input
                type="number"
                value={config.limit || 20}
                onChange={(e) => setFormData({ ...formData, config: { ...config, limit: parseInt(e.target.value) } })}
                placeholder="20"
              />
            </div>
            <div>
              <Label>Sort By</Label>
              <Select
                value={config.sort || 'hot'}
                onValueChange={(value) => setFormData({ ...formData, config: { ...config, sort: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timeframe</Label>
              <Select
                value={config.timeframe || 'day'}
                onValueChange={(value) => setFormData({ ...formData, config: { ...config, timeframe: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Last Hour</SelectItem>
                  <SelectItem value="day">Last 24 Hours (Primary)</SelectItem>
                  <SelectItem value="week">Last Week (Evergreen)</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case 'newsletter_rss':
        return (
          <div>
            <Label>Max Items to Fetch</Label>
            <Input
              type="number"
              value={config.maxItems || 10}
              onChange={(e) => setFormData({ ...formData, config: { ...config, maxItems: parseInt(e.target.value) } })}
              placeholder="10"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Sources</h1>
            <p className="text-muted-foreground mt-1">
              Manage your content sources for newsletter curation
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowQuickAdd(!showQuickAdd)
                if (showQuickAdd) {
                  setShowAddForm(false)
                }
              }}
              className="gap-2"
            >
              <Rss className="h-4 w-4" />
              {showQuickAdd ? 'Hide' : 'Quick Add'}
            </Button>
            <Button onClick={() => {
              setEditingSource(null);
              setFormData({ name: '', type: 'twitter', url: '', config: {} });
              setShowAddForm(!showAddForm)
              if (!showAddForm) {
                setShowQuickAdd(false)
              }
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Custom
            </Button>
          </div>
        </div>

        {/* Quick Add Sources Section */}
        {showQuickAdd && (
          <div className="mb-6">
            <QuickAddSources onSourceAdded={refetch} />
          </div>
        )}

        {/* Search and Filters */}
        {!showAddForm && !showQuickAdd && sources.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="newsletter_rss">Newsletter RSS</SelectItem>
                  <SelectItem value="custom_url">Custom URL</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Add/Edit Source Form */}
        {showAddForm && (
          <Card className="p-6 mb-6 border-accent-primary/20">
            <h2 className="text-xl font-semibold mb-4">{editingSource ? 'Edit Source' : 'Add New Source'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source Type</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {sourceTypes.map((source) => {
                    const Icon = source.icon
                    return (
                      <button
                        key={source.value}
                        type="button"
                        disabled={editingSource}
                        onClick={() => setFormData({ ...formData, type: source.value, config: {} })}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                          formData.type === source.value
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-border hover:border-accent-primary/50'
                        } ${editingSource ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{source.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sam Altman's Tweets"
                  required
                />
              </div>

              <div>
                <Label>URL / Handle</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={sourceTypes.find(s => s.value === formData.type)?.placeholder}
                  required
                  disabled={editingSource}
                  className={editingSource ? 'opacity-50' : ''}
                />
              </div>

              {/* Type-specific configuration */}
              {renderConfigFields()}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingSource ? 'Updating...' : 'Adding...') : (editingSource ? 'Update Source' : 'Add Source')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Sources List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredSources.length === 0 && sources.length === 0 ? (
          <Card className="p-12 text-center">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Sources Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first content source to start curating newsletters
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="default"
                onClick={() => {
                  setShowQuickAdd(true)
                  setShowAddForm(false)
                }}
                className="gap-2"
              >
                <Rss className="h-4 w-4" />
                Quick Add Popular Sources
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSource(null);
                  setFormData({ name: '', type: 'twitter', url: '', config: {} });
                  setShowAddForm(true)
                  setShowQuickAdd(false)
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Source
              </Button>
            </div>
          </Card>
        ) : filteredSources.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Sources Found</h3>
            <p className="text-muted-foreground mb-4">
              No sources match your filters. Try adjusting your search criteria.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSources.map((source) => {
              const Icon = getSourceIcon(source.type)
              const isScraping = scrapingSourceId === source.id
              return (
                <Card key={source.id} className="p-4 hover:border-accent-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent-primary/10">
                        <Icon className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{source.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {source.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleStatus(source)}
                        title={source.status === 'active' ? 'Pause source' : 'Activate source'}
                      >
                        <Power className={`h-4 w-4 ${source.status === 'active' ? 'text-green-500' : 'text-gray-500'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(source)}
                        title="Edit source"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(source.id, source.name)}
                        className="text-destructive hover:text-destructive"
                        title="Delete source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(source.last_scrape_status)}`} />
                      <span className="text-muted-foreground">
                        {source.last_scrape_status === 'success' && 'Last scrape successful'}
                        {source.last_scrape_status === 'failed' && 'Last scrape failed'}
                        {source.last_scrape_status === 'running' && 'Scraping...'}
                        {source.last_scrape_status === 'pending' && 'Pending first scrape'}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground truncate">
                      {source.url}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {source.total_items_scraped} total items
                      </span>
                      {source.last_scrape_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(source.last_scrape_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {source.items_scraped_last_run > 0 && (
                      <div className="text-xs text-green-600 bg-green-500/10 p-2 rounded">
                        Last run: {source.items_scraped_last_run} new items
                      </div>
                    )}

                    {source.error_message && (
                      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                        {source.error_message}
                      </div>
                    )}

                    {/* Manual Scrape Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleManualScrape(source.id, source.name)}
                      disabled={isScraping || source.status === 'inactive'}
                    >
                      {isScraping ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Scrape Now
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
