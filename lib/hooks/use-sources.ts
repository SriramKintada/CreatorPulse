'use client'

import { useEffect, useState } from 'react'

export interface Source {
  id: string
  user_id: string
  name: string
  type: 'twitter' | 'youtube' | 'reddit' | 'newsletter_rss' | 'custom_url'
  url: string
  status: 'active' | 'inactive'
  config: Record<string, any>
  scrape_frequency: string
  last_scrape_at: string | null
  last_scrape_status: 'pending' | 'running' | 'success' | 'failed'
  items_scraped_last_run: number
  error_message: string | null
  total_items_scraped: number
  items_curated: number
  avg_relevance_score: number
  created_at: string
  updated_at: string
}

export function useSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSources = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/sources')

      if (!response.ok) {
        throw new Error('Failed to fetch sources')
      }

      const data = await response.json()
      setSources(data.sources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const refetch = () => {
    fetchSources()
  }

  return { sources, loading, error, refetch }
}
