'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  subscribers: number
  newslettersSent: number
  openRate: number
  totalClicks: number
  draftsGenerated: number
  draftsSent: number
  sourcesConnected: number
  draftsThisWeek: number
  lastDraftDate: string | null
  daysSinceLastDraft: number | null
  engagementTrend: 'up' | 'stable' | 'down'
  clickThroughRate: number
  plan: string
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/dashboard/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
