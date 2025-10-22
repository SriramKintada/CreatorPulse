import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scrapeTwitter, scrapeReddit, scrapeCustomUrl } from '@/lib/scraping/apify'
import { scrapeRssFeed } from '@/lib/scraping/exa'
import { scrapeYouTubeChannel } from '@/lib/scraping/youtube'

interface ScrapedItem {
  externalId: string
  title: string
  contentText: string
  url: string
  author: string
  publishedAt: string | null
  engagementLikes: number
  engagementShares: number
  engagementComments: number
  engagementViews: number
  mediaUrls: string[]
  hashtags: string[]
}

/**
 * Scrape all user sources and store content in database
 */
export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active sources for this user
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (sourcesError) {
      return NextResponse.json({ error: sourcesError.message }, { status: 500 })
    }

    console.log(`📊 Found ${sources?.length || 0} active sources to scrape`)

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        {
          message: 'No active sources found. Please add sources first.',
          scrapedCount: 0,
        },
        { status: 200 }
      )
    }

    let totalScraped = 0
    const errors: Array<{ sourceId: string; error: string }> = []

    // Scrape each source
    for (const source of sources) {
      try {
        console.log(`\n🔄 Processing source: ${source.name}`)
        console.log(`   Type: ${source.type}`)
        console.log(`   URL: ${source.url}`)
        console.log(`   Config:`, JSON.stringify(source.config || {}, null, 2))

        // Update source status to running
        await supabase
          .from('sources')
          .update({ last_scrape_status: 'running' })
          .eq('id', source.id)

        let scrapedItems: ScrapedItem[] = []
        const config = source.config || {}

        // Scrape based on source type
        switch (source.type) {
          case 'twitter':
            scrapedItems = await scrapeTwitter(
              source.url,
              config.maxItems || 50
            )
            break

          case 'youtube':
            scrapedItems = await scrapeYouTubeChannel(
              source.url,
              config.maxResults || 10
            )
            break

          case 'reddit':
            // Time-based filtering: Last 24h for hot, 48h for top (primary content)
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
            throw new Error(`Unsupported source type: ${source.type}`)
        }

        console.log(`   📥 Scraped ${scrapedItems.length} items from ${source.type}`)

        // Store scraped content in database (deduplicate by external_id)
        let successfulInserts = 0
        let duplicateCount = 0

        for (const item of scrapedItems) {
          console.log(`\n   🔍 Processing item:`)
          console.log(`      - External ID: ${item.externalId}`)
          console.log(`      - Title: ${item.title}`)
          console.log(`      - URL: ${item.url}`)

          // Check if item already exists
          const { data: existing, error: checkError } = await supabase
            .from('scraped_content')
            .select('id')
            .eq('source_id', source.id)
            .eq('external_id', item.externalId)
            .single()

          if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is expected for new items
            console.error(`   ❌ Error checking for existing item:`, checkError)
          }

          if (existing) {
            console.log(`   ⏭️  Item already exists (duplicate): ${item.externalId}`)
            duplicateCount++
          } else {
            console.log(`   ✅ Item is new, inserting...`)

            const itemToInsert = {
              user_id: user.id,
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
              // Calculate normalized engagement score (0-1)
              engagement_normalized:
                (item.engagementLikes +
                  item.engagementShares * 2 +
                  item.engagementComments * 1.5) /
                1000,
            }

            console.log(`   📤 Inserting item to Supabase:`, JSON.stringify(itemToInsert, null, 2))

            // Insert new item
            const { data: insertData, error: insertError } = await supabase
              .from('scraped_content')
              .insert(itemToInsert)
              .select()

            if (insertError) {
              console.error(`   ❌ Insert error:`, insertError)
            } else {
              console.log(`   ✅ Successfully inserted:`, insertData)
              successfulInserts++
            }
          }
        }

        console.log(`\n   📊 Insert summary:`)
        console.log(`      - Total items: ${scrapedItems.length}`)
        console.log(`      - New items inserted: ${successfulInserts}`)
        console.log(`      - Duplicates skipped: ${duplicateCount}`)

        totalScraped += successfulInserts

        console.log(`   ✅ Successfully inserted ${successfulInserts} new items (${scrapedItems.length - successfulInserts} duplicates skipped)`)

        // Update source with scrape results
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

        // Add activity feed entry
        await supabase.from('activity_feed').insert({
          user_id: user.id,
          activity_type: 'source_scraped',
          title: `Scraped ${source.name}`,
          description: `Found ${successfulInserts} new items from ${source.name}`,
          metadata: {
            source_id: source.id,
            items_count: successfulInserts,
          },
        })
      } catch (error: any) {
        console.error(`Error scraping source ${source.id}:`, error)

        // Update source with error
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

    console.log(`\n📊 SCRAPING SUMMARY:`)
    console.log(`   Total sources processed: ${sources.length}`)
    console.log(`   Total new items added: ${totalScraped}`)
    console.log(`   Errors: ${errors.length}`)
    if (errors.length > 0) {
      console.log(`   Error details:`, errors)
    }

    return NextResponse.json(
      {
        message: `Scraping completed. ${totalScraped} new items added.`,
        scrapedCount: totalScraped,
        sourcesProcessed: sources.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Scrape endpoint error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
