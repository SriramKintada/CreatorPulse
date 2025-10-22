import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateNewsletterWithGemini } from '@/lib/ai/gemini'

// Get recent drafts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: drafts, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ drafts }, { status: 200 })
  } catch (error) {
    console.error('Drafts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate new draft with intelligent content categorization
export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`\n🎯 Starting intelligent draft generation for user: ${user.id}`)

    // Get user data with voice profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Fetch sources to know the types
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError)
    }

    // Calculate time windows
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()

    console.log(`📅 Time windows calculated:`)
    console.log(`   - Primary (24-48h): ${fortyEightHoursAgo}`)
    console.log(`   - Evergreen (7 days): ${sevenDaysAgo}`)
    console.log(`   - Trending (72h): ${seventyTwoHoursAgo}`)

    // CATEGORY 1: Primary Content (70%) - Last 24-48 hours
    // Twitter: 24h, YouTube: 48h, Reddit: 24-48h, RSS: Latest
    const { data: primaryContent, error: primaryError } = await supabase
      .from('scraped_content')
      .select(`
        *,
        sources!inner(type)
      `)
      .eq('user_id', user.id)
      .gte('published_at', fortyEightHoursAgo)
      .order('published_at', { ascending: false })
      .order('engagement_normalized', { ascending: false })
      .limit(15) // Get top 15 for primary content

    if (primaryError) {
      return NextResponse.json({ error: primaryError.message }, { status: 500 })
    }

    // Add source_type to items
    const primaryWithType = (primaryContent || []).map((item: any) => ({
      ...item,
      source_type: item.sources?.type || 'unknown'
    }))

    console.log(`📰 Primary content: ${primaryWithType.length} items (last 24-48h)`)

    // CATEGORY 2: Evergreen Content (20%) - Last 7 days (exclude primary)
    const { data: evergreenContent, error: evergreenError } = await supabase
      .from('scraped_content')
      .select(`
        *,
        sources!inner(type)
      `)
      .eq('user_id', user.id)
      .gte('published_at', sevenDaysAgo)
      .lt('published_at', fortyEightHoursAgo) // Exclude primary timeframe
      .order('engagement_normalized', { ascending: false })
      .limit(5) // Top 5 high-quality pieces

    if (evergreenError) {
      return NextResponse.json({ error: evergreenError.message }, { status: 500 })
    }

    const evergreenWithType = (evergreenContent || []).map((item: any) => ({
      ...item,
      source_type: item.sources?.type || 'unknown'
    }))

    console.log(`📚 Evergreen content: ${evergreenWithType.length} items (2-7 days old)`)

    // CATEGORY 3: Trending (10%) - Last 72 hours, high engagement velocity
    const { data: trendingContent, error: trendingError } = await supabase
      .from('scraped_content')
      .select(`
        *,
        sources!inner(type)
      `)
      .eq('user_id', user.id)
      .gte('published_at', seventyTwoHoursAgo)
      .order('engagement_normalized', { ascending: false })
      .limit(3) // Top 3 trending items

    if (trendingError) {
      return NextResponse.json({ error: trendingError.message }, { status: 500 })
    }

    const trendingWithType = (trendingContent || []).map((item: any) => ({
      ...item,
      source_type: item.sources?.type || 'unknown'
    }))

    console.log(`📈 Trending content: ${trendingWithType.length} items (emerging topics)`)

    // Check if we have enough content
    const totalItems = primaryWithType.length + evergreenWithType.length + trendingWithType.length

    if (totalItems < 5) {
      return NextResponse.json(
        {
          error: `Not enough content to generate draft. Found ${totalItems} items, need at least 5. Try scraping your sources first.`,
        },
        { status: 400 }
      )
    }

    console.log(`\n✅ Total content gathered: ${totalItems} items`)
    console.log(`   - Primary: ${primaryWithType.length} (${Math.round((primaryWithType.length / totalItems) * 100)}%)`)
    console.log(`   - Evergreen: ${evergreenWithType.length} (${Math.round((evergreenWithType.length / totalItems) * 100)}%)`)
    console.log(`   - Trending: ${trendingWithType.length} (${Math.round((trendingWithType.length / totalItems) * 100)}%)`)

    // Generate newsletter using Google Gemini with anti-slop instructions
    const startTime = Date.now()

    console.log(`\n🤖 Calling Google Gemini (Anti-Slop Mode) for newsletter generation...`)

    const newsletterContent = await generateNewsletterWithGemini(
      primaryWithType,
      evergreenWithType,
      trendingWithType,
      userData.voice_profile
    )

    const generationTime = (Date.now() - startTime) / 1000

    console.log(`   ✅ Newsletter generated in ${generationTime}s`)

    // Parse the newsletter into sections
    // Extract title (first line, usually starts with # or is the first non-empty line)
    const lines = newsletterContent.split('\n').filter(line => line.trim())
    const title = lines[0].replace(/^#+\s*/, '').substring(0, 200) || 'Weekly Newsletter'

    // Store the full newsletter in ai_body
    const body = newsletterContent

    // Create curated items list from primary content
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
        ai_body: body,
        ai_curated_items: curatedItems,
        ai_trends_section: trendingWithType.slice(0, 5).map((item: any) => ({
          title: item.title,
          url: item.url,
          source_type: item.source_type,
          engagement: item.engagement_normalized,
        })),
        ai_intro: lines.slice(1, 3).join(' ').substring(0, 500),
        ai_closing: lines.slice(-2).join(' ').substring(0, 500),
        ai_generation_time: generationTime,
      })
      .select()
      .single()

    if (draftError) {
      console.error('Draft creation error:', draftError)
      return NextResponse.json({ error: draftError.message }, { status: 500 })
    }

    console.log(`\n✅ Draft created: ${draft.id}`)

    // Add activity feed entry
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: 'draft_generated',
      title: 'AI Newsletter Generated',
      description: `Generated: "${title}"`,
      metadata: {
        draft_id: draft.id,
        generation_time: generationTime,
        content_stats: {
          primary: primaryWithType.length,
          evergreen: evergreenWithType.length,
          trending: trendingWithType.length,
        },
      },
    })

    // Increment user usage
    await supabase.rpc('increment_user_usage', {
      user_id_param: user.id,
      field_name: 'drafts_generated',
      increment_by: 1,
    })

    console.log(`\n🎉 Draft generation complete!\n`)

    return NextResponse.json(
      {
        message: 'Newsletter draft generated successfully',
        draft,
        stats: {
          totalItems,
          primary: primaryWithType.length,
          evergreen: evergreenWithType.length,
          trending: trendingWithType.length,
          generationTime,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('\n❌ Draft generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
