import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateNewsletterWithGemini } from '@/lib/ai/gemini'

/**
 * AUTO-GENERATE CRON JOB
 * Runs daily at 8 AM to generate drafts for users based on their schedule
 * Vercel Cron: 0 8 * * *
 */
export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 AUTO-GENERATE CRON JOB STARTED')
    const startTime = Date.now()

    const supabase = await createClient()

    // Get current day and time
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentHour = now.getHours()

    console.log(`📅 Current: ${currentDay}, ${currentHour}:00`)

    // Get all users with their preferences
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    console.log(`👥 Found ${users?.length || 0} active users`)

    let draftsGenerated = 0
    const errors: Array<{ userId: string; error: string }> = []

    // Process each user
    for (const user of users || []) {
      try {
        const preferences = user.preferences || {}
        const deliveryFrequency = preferences.deliveryFrequency || 'weekly'
        const deliveryTime = preferences.deliveryTime || '08:00'
        const deliveryDay = preferences.deliveryDay || 'monday'

        // Parse delivery time
        const [deliveryHour] = deliveryTime.split(':').map(Number)

        // Check if we should generate for this user
        let shouldGenerate = false

        if (deliveryFrequency === 'daily') {
          // Generate if current hour matches
          shouldGenerate = currentHour === deliveryHour
        } else if (deliveryFrequency === 'weekly') {
          // Generate if current day and hour match
          shouldGenerate = currentDay === deliveryDay && currentHour === deliveryHour
        } else if (deliveryFrequency === 'biweekly') {
          // Generate every 2 weeks on specified day (simplified: check if week number is even)
          const weekNumber = Math.ceil(now.getDate() / 7)
          shouldGenerate = currentDay === deliveryDay && currentHour === deliveryHour && weekNumber % 2 === 0
        } else if (deliveryFrequency === 'monthly') {
          // Generate on the 1st of the month
          shouldGenerate = now.getDate() === 1 && currentHour === deliveryHour
        }

        if (!shouldGenerate) {
          console.log(`⏭️  Skipping ${user.email} (${deliveryFrequency} on ${deliveryDay} at ${deliveryTime})`)
          continue
        }

        console.log(`\n✅ Generating draft for ${user.email}...`)

        // Calculate time windows
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()

        // Fetch categorized content
        const { data: primaryContent } = await supabase
          .from('scraped_content')
          .select('*, sources!inner(type)')
          .eq('user_id', user.id)
          .gte('published_at', fortyEightHoursAgo)
          .order('published_at', { ascending: false })
          .limit(15)

        const { data: evergreenContent } = await supabase
          .from('scraped_content')
          .select('*, sources!inner(type)')
          .eq('user_id', user.id)
          .gte('published_at', sevenDaysAgo)
          .lt('published_at', fortyEightHoursAgo)
          .order('engagement_normalized', { ascending: false })
          .limit(5)

        const { data: trendingContent } = await supabase
          .from('scraped_content')
          .select('*, sources!inner(type)')
          .eq('user_id', user.id)
          .gte('published_at', seventyTwoHoursAgo)
          .order('engagement_normalized', { ascending: false })
          .limit(3)

        // Add source_type to items
        const primaryWithType = (primaryContent || []).map((item: any) => ({
          ...item,
          source_type: item.sources?.type || 'unknown',
        }))

        const evergreenWithType = (evergreenContent || []).map((item: any) => ({
          ...item,
          source_type: item.sources?.type || 'unknown',
        }))

        const trendingWithType = (trendingContent || []).map((item: any) => ({
          ...item,
          source_type: item.sources?.type || 'unknown',
        }))

        const totalItems = primaryWithType.length + evergreenWithType.length + trendingWithType.length

        if (totalItems < 5) {
          console.log(`   ⚠️  Not enough content (${totalItems} items), skipping`)
          continue
        }

        console.log(`   📊 Content: ${primaryWithType.length} primary, ${evergreenWithType.length} evergreen, ${trendingWithType.length} trending`)

        // Generate newsletter with Gemini
        const newsletterContent = await generateNewsletterWithGemini(
          primaryWithType,
          evergreenWithType,
          trendingWithType,
          user.voice_profile
        )

        // Extract title
        const lines = newsletterContent.split('\n').filter((line) => line.trim())
        const title = lines[0].replace(/^#+\s*/, '').substring(0, 200) || 'Weekly Newsletter'

        // Create curated items
        const curatedItems = primaryWithType.slice(0, 10).map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          author: item.author,
          source_type: item.source_type,
          summary: item.content_text?.substring(0, 200),
          engagement: {
            likes: item.engagement_likes,
            comments: item.engagement_comments,
            views: item.engagement_views,
          },
          published_at: item.published_at,
        }))

        // Create draft
        const { data: draft, error: draftError } = await supabase
          .from('drafts')
          .insert({
            user_id: user.id,
            ai_title: title,
            ai_body: newsletterContent,
            ai_curated_items: curatedItems,
            ai_trends_section: trendingWithType.slice(0, 5).map((item: any) => ({
              title: item.title,
              url: item.url,
              source_type: item.source_type,
              engagement: item.engagement_normalized,
            })),
            ai_intro: lines.slice(1, 3).join(' ').substring(0, 500),
            ai_closing: lines.slice(-2).join(' ').substring(0, 500),
          })
          .select()
          .single()

        if (draftError) {
          console.error(`   ❌ Draft creation failed:`, draftError)
          errors.push({ userId: user.id, error: draftError.message })
          continue
        }

        console.log(`   ✅ Draft created: ${draft.id}`)

        // Add activity feed entry
        await supabase.from('activity_feed').insert({
          user_id: user.id,
          activity_type: 'draft_generated',
          title: 'AI Newsletter Generated',
          description: `Auto-generated: "${title}"`,
          metadata: {
            draft_id: draft.id,
            automated: true,
            content_stats: {
              primary: primaryWithType.length,
              evergreen: evergreenWithType.length,
              trending: trendingWithType.length,
            },
          },
        })

        draftsGenerated++
      } catch (error: any) {
        console.error(`❌ Error generating for user ${user.id}:`, error.message)
        errors.push({ userId: user.id, error: error.message })
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`\n✅ AUTO-GENERATE COMPLETED`)
    console.log(`   Duration: ${duration}s`)
    console.log(`   Users processed: ${users?.length || 0}`)
    console.log(`   Drafts generated: ${draftsGenerated}`)
    console.log(`   Errors: ${errors.length}`)

    return NextResponse.json(
      {
        success: true,
        message: `Auto-generate completed in ${duration}s`,
        usersProcessed: users?.length || 0,
        draftsGenerated,
        errors: errors.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Auto-generate cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Auto-generate failed' },
      { status: 500 }
    )
  }
}
