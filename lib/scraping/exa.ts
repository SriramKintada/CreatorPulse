import axios from 'axios'
import Parser from 'rss-parser'

const EXA_API_KEY = process.env.EXA_API_KEY

if (!EXA_API_KEY) {
  console.warn('EXA_API_KEY is not set in environment variables')
}

interface ExaSearchResult {
  id: string
  title: string
  url: string
  publishedDate?: string
  author?: string
  text?: string
  summary?: string
}

/**
 * Scrape custom URL using Exa.ai
 */
export async function scrapeCustomUrl(url: string) {
  try {
    console.log(`🔍 Scraping custom URL with Exa.ai: ${url}`)

    const response = await axios.post(
      'https://api.exa.ai/search',
      {
        query: url,
        type: 'neural',
        numResults: 1,
        contents: {
          text: true,
          summary: true,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_API_KEY || '',
        },
      }
    )

    const results = response.data.results as ExaSearchResult[]
    console.log(`   ✓ Exa.ai returned ${results.length} results`)

    return results.map((result: ExaSearchResult) => ({
      externalId: result.id,
      title: result.title || '',
      contentText: result.text || result.summary || '',
      url: result.url,
      author: result.author || '',
      publishedAt: result.publishedDate || new Date().toISOString(),
      engagementLikes: 0,
      engagementShares: 0,
      engagementComments: 0,
      engagementViews: 0,
      mediaUrls: [],
      hashtags: [],
    }))
  } catch (error: any) {
    console.error('❌ Exa.ai scraping error:', error.message)
    if (error.response) {
      console.error('   Response data:', error.response.data)
      console.error('   Response status:', error.response.status)
    }
    throw error
  }
}

/**
 * Scrape RSS feed (newsletter or blog)
 */
export async function scrapeRssFeed(feedUrl: string, maxItems: number = 10) {
  try {
    console.log(`📡 Scraping RSS feed: ${feedUrl}`)
    console.log(`   Max items: ${maxItems}`)

    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
    })

    const feed = await parser.parseURL(feedUrl)
    console.log(`   ✓ RSS feed parsed: ${feed.title || 'Untitled'}`)
    console.log(`   ✓ Total items in feed: ${feed.items.length}`)

    const items = feed.items.slice(0, maxItems)
    console.log(`   ✓ Returning ${items.length} items`)

    return items.map((item: any) => {
      // Extract text content from various possible fields
      const contentText =
        item.contentEncoded ||
        item.content ||
        item['content:encoded'] ||
        item.summary ||
        item.description ||
        ''

      // Extract media URLs
      const mediaUrls: string[] = []
      if (item.mediaContent) {
        const media = Array.isArray(item.mediaContent)
          ? item.mediaContent
          : [item.mediaContent]
        media.forEach((m: any) => {
          if (m.$ && m.$.url) {
            mediaUrls.push(m.$.url)
          }
        })
      }
      if (item.enclosure && item.enclosure.url) {
        mediaUrls.push(item.enclosure.url)
      }

      return {
        externalId: item.guid || item.id || item.link || '',
        title: item.title || '',
        contentText: contentText.replace(/<[^>]*>/g, ''), // Strip HTML tags
        url: item.link || '',
        author: item.creator || item.author || feed.title || '',
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        engagementLikes: 0,
        engagementShares: 0,
        engagementComments: 0,
        engagementViews: 0,
        mediaUrls,
        hashtags: [],
      }
    })
  } catch (error: any) {
    console.error('❌ RSS feed scraping error:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
    throw error
  }
}

/**
 * Search for content using Exa.ai semantic search
 */
export async function searchWithExa(query: string, numResults: number = 10) {
  try {
    const response = await axios.post(
      'https://api.exa.ai/search',
      {
        query,
        type: 'neural',
        numResults,
        contents: {
          text: true,
          summary: true,
        },
        category: 'news',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_API_KEY || '',
        },
      }
    )

    const results = response.data.results as ExaSearchResult[]

    return results.map((result: ExaSearchResult) => ({
      externalId: result.id,
      title: result.title || '',
      contentText: result.text || result.summary || '',
      url: result.url,
      author: result.author || '',
      publishedAt: result.publishedDate || new Date().toISOString(),
      engagementLikes: 0,
      engagementShares: 0,
      engagementComments: 0,
      engagementViews: 0,
      mediaUrls: [],
      hashtags: [],
    }))
  } catch (error) {
    console.error('Exa.ai search error:', error)
    throw error
  }
}
