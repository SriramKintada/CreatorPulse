import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scrapeTwitter, scrapeReddit, scrapeCustomUrl } from '@/lib/scraping/apify'
import { scrapeRssFeed } from '@/lib/scraping/exa'
import { scrapeYouTubeChannel } from '@/lib/scraping/youtube'

/**
 * AUTO-SCRAPE CRON JOB
 * Runs every 6 hours to scrape sources for all active users
 * Vercel Cron: 0 */6 * * *
 */
export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 AUTO-SCRAPE CRON JOB STARTED')
    const startTime = Date.now()

    const supabase = await createClient()

    // Get all active sources from all users
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*, users!inner(id, email, display_name, preferences)')
      .eq('status', 'active')

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError)
      return NextResponse.json({ error: sourcesError.message }, { status: 500 })
    }

    console.log(`📊 Found ${sources?.length || 0} active sources to scrape`)

    let totalScraped = 0
    const errors: Array<{ sourceId: string; error: string }> = []

    // Process each source
    for (const source of sources || []) {
      try {
        console.log(`\n🔄 Scraping: ${source.name} (${source.type})`)

        // Update status to running
        await supabase
          .from('sources')
          .update({ last_scrape_status: 'running' })
          .eq('id', source.id)

        let scrapedItems: any[] = []
        const config = source.config || {}

        // Scrape based on type
        switch (source.type) {
          case 'twitter':
            scrapedItems = await scrapeTwitter(source.url, config.maxItems || 50)
            break

          case 'youtube':
            scrapedItems = await scrapeYouTubeChannel(source.url, config.maxResults || 10)
            break

          case 'reddit':
            const redditTimeframe = config.sort === 'top' ? 'day' : 'day'
            scrapedItems = await scrapeReddit(
              source.url,
              config.limit || 20,
              config.sort || 'hot',
              config.timeframe || redditTimeframe
            )
            break

          case 'newsletter_rss':
            scrapedItems = await scrapeRssFeed(source.url, config.maxItems || 10)
            break

          case 'custom_url':
            scrapedItems = await scrapeCustomUrl(source.url)
            break

          default:
            console.log(`⚠️  Unsupported source type: ${source.type}`)
            continue
        }

        console.log(`   📥 Scraped ${scrapedItems.length} items`)

        // Store new items (deduplicate)
        let successfulInserts = 0

        for (const item of scrapedItems) {
          // Check if exists
          const { data: existing } = await supabase
            .from('scraped_content')
            .select('id')
            .eq('source_id', source.id)
            .eq('external_id', item.externalId)
            .single()

          if (!existing) {
            const { error: insertError } = await supabase
              .from('scraped_content')
              .insert({
                user_id: source.user_id,
                source_id: source.id,
                external_id: item.externalId,
                title: item.title,
                content_text: item.contentText,
                url: item.url,
                author: item.author,
                published_at: item.publishedAt,
                engagement_likes: item.engagementLikes,
                engagement_shares: item.engagementShares,
                engagement_comments: item.engagementComments,
                engagement_views: item.engagementViews,
                media_urls: item.mediaUrls,
                hashtags: item.hashtags,
                engagement_normalized:
                  (item.engagementLikes +
                    item.engagementShares * 2 +
                    item.engagementComments * 1.5) /
                  1000,
              })

            if (!insertError) successfulInserts++
          }
        }

        totalScraped += successfulInserts

        console.log(`   ✅ Inserted ${successfulInserts} new items (${scrapedItems.length - successfulInserts} duplicates)`)

        // Update source status
        await supabase
          .from('sources')
          .update({
            last_scrape_at: new Date().toISOString(),
            last_scrape_status: 'success',
            items_scraped_last_run: successfulInserts,
            total_items_scraped: source.total_items_scraped + successfulInserts,
            error_message: null,
          })
          .eq('id', source.id)

      } catch (error: any) {
        console.error(`❌ Error scraping source ${source.id}:`, error.message)

        await supabase
          .from('sources')
          .update({
            last_scrape_at: new Date().toISOString(),
            last_scrape_status: 'failed',
            error_message: error.message || 'Unknown error',
          })
          .eq('id', source.id)

        errors.push({
          sourceId: source.id,
          error: error.message || 'Unknown error',
        })
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`\n✅ AUTO-SCRAPE COMPLETED`)
    console.log(`   Duration: ${duration}s`)
    console.log(`   Sources processed: ${sources?.length || 0}`)
    console.log(`   New items: ${totalScraped}`)
    console.log(`   Errors: ${errors.length}`)

    return NextResponse.json(
      {
        success: true,
        message: `Auto-scrape completed in ${duration}s`,
        sourcesProcessed: sources?.length || 0,
        newItems: totalScraped,
        errors: errors.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Auto-scrape cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Auto-scrape failed' },
      { status: 500 }
    )
  }
}
