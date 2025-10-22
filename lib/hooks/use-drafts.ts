'use client'

import { useEffect, useState } from 'react'

export interface Draft {
  id: string
  user_id: string
  status: 'draft' | 'scheduled' | 'sent' | 'archived'
  scheduled_at: string | null
  generated_at: string
  sent_at: string | null
  ai_title: string
  ai_body: string
  ai_curated_items: any[]
  ai_trends_section: any[]
  ai_intro: string
  ai_closing: string
  user_edited_body: string | null
  user_feedback_items: any[]
  user_total_edit_time: number
  performance_delivered: number
  performance_opened: number
  performance_clicked: number
  performance_open_rate: number
  performance_click_rate: number
  ai_acceptance_rate: number
  ai_generation_time: number | null
  created_at: string
  updated_at: string
}

export function useDrafts(limit: number = 10) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDrafts() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/drafts?limit=${limit}`)

        if (!response.ok) {
          throw new Error('Failed to fetch drafts')
        }

        const data = await response.json()
        setDrafts(data.drafts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching drafts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDrafts()
  }, [limit])

  const refetch = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/drafts?limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch drafts')
      const data = await response.json()
      setDrafts(data.drafts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { drafts, loading, error, refetch }
}
