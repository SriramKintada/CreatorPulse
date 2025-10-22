'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ActivityItem {
  id: string
  activity_type: 'draft_generated' | 'draft_sent' | 'source_added' | 'source_scraped' | 'voice_trained'
  title: string
  description: string | null
  metadata: Record<string, any>
  created_at: string
}

export function useActivityFeed(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Not authenticated')
        }

        const { data, error: dbError } = await supabase
          .from('activity_feed')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (dbError) {
          throw dbError
        }

        setActivities(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching activity feed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [limit])

  return { activities, loading, error }
}
