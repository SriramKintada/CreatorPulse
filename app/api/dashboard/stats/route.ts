import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Get drafts statistics
    const { data: drafts, error: draftsError } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)

    if (draftsError) {
      return NextResponse.json({ error: draftsError.message }, { status: 500 })
    }

    // Get sources count
    const { count: sourcesCount, error: sourcesError } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (sourcesError) {
      return NextResponse.json({ error: sourcesError.message }, { status: 500 })
    }

    // Calculate metrics
    const totalDrafts = drafts?.length || 0
    const sentDrafts = drafts?.filter((d) => d.status === 'sent') || []
    const totalSent = sentDrafts.length

    // Calculate average open rate
    const avgOpenRate =
      totalSent > 0
        ? sentDrafts.reduce(
            (sum, d) => sum + (d.performance_open_rate || 0),
            0
          ) / totalSent
        : 0

    // Calculate total clicks
    const totalClicks = sentDrafts.reduce(
      (sum, d) => sum + (d.performance_clicked || 0),
      0
    )

    // Calculate recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentDrafts = drafts?.filter(
      (d) => d.generated_at && new Date(d.generated_at) > new Date(weekAgo)
    ) || []

    // Get most recent draft
    const latestDraft = drafts
      ?.filter((d) => d.generated_at)
      .sort(
        (a, b) =>
          new Date(b.generated_at).getTime() -
          new Date(a.generated_at).getTime()
      )[0]

    const daysSinceLastDraft = latestDraft
      ? Math.floor(
          (Date.now() - new Date(latestDraft.generated_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

    // Mock subscriber count (would integrate with email provider)
    const subscriberCount = Math.floor(Math.random() * 1000) + 100

    const stats = {
      // Core metrics
      subscribers: subscriberCount,
      newslettersSent: totalSent,
      openRate: Math.round(avgOpenRate * 100) / 100,
      totalClicks: totalClicks,

      // Usage metrics
      draftsGenerated: userData.usage_drafts_generated || totalDrafts,
      draftsSent: userData.usage_drafts_sent || totalSent,
      sourcesConnected: userData.usage_sources_connected || sourcesCount || 0,

      // Activity metrics
      draftsThisWeek: recentDrafts.length,
      lastDraftDate: latestDraft?.generated_at || null,
      daysSinceLastDraft: daysSinceLastDraft,

      // Trends
      engagementTrend: avgOpenRate > 0.25 ? 'up' : avgOpenRate > 0.15 ? 'stable' : 'down',
      clickThroughRate:
        totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) / 100 : 0,

      // Plan info
      plan: userData.plan || 'starter',
    }

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
