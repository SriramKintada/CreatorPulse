import axios from 'axios'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

if (!APIFY_API_TOKEN) {
  console.warn('APIFY_API_TOKEN is not set in environment variables')
}

interface ApifyTwitterInput {
  from?: string
  searchTerms?: string[]
  maxItems: number
  lang?: string
  'filter:nativeretweets'?: boolean
}

interface ApifyYouTubeInput {
  startUrls: Array<{ url: string }>
  maxResults: number
  maxResultsShorts?: number
}

interface ApifyRedditInput {
  subreddit_name: string
  limit: number
  category?: 'hot' | 'new' | 'top'
}

interface ApifyRunResponse {
  data: {
    id: string
    status: string
    defaultDatasetId: string
  }
}

interface ApifyDatasetResponse {
  data: any[]
}

/**
 * Run an Apify actor and wait for results
 */
async function runApifyActor(actorId: string, input: any): Promise<any[]> {
  try {
    console.log(`🎬 Starting Apify actor: ${actorId}`)
    console.log(`   Input:`, JSON.stringify(input, null, 2))

    // Start the actor run
    const runResponse = await axios.post<ApifyRunResponse>(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`,
      input,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const runId = runResponse.data.data.id
    const datasetId = runResponse.data.data.defaultDatasetId

    console.log(`   ✓ Run started: ${runId}`)
    console.log(`   ⏳ Waiting for completion...`)

    // Poll for completion (max 2 minutes)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 24 // 2 minutes with 5 second intervals

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await axios.get(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${APIFY_API_TOKEN}`
      )

      status = statusResponse.data.data.status
      attempts++

      console.log(`   ⏱️  Attempt ${attempts}/${maxAttempts}: ${status}`)
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify actor run failed with status: ${status}`)
    }

    console.log(`   ✅ Actor completed successfully`)

    // Get results from dataset
    const datasetResponse = await axios.get<ApifyDatasetResponse>(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`
    )

    console.log(`   📦 Retrieved ${datasetResponse.data.length} items from dataset`)

    return datasetResponse.data
  } catch (error: any) {
    console.error('❌ Apify actor run error:', error.message)
    if (error.response) {
      console.error('   Response data:', error.response.data)
      console.error('   Response status:', error.response.status)
    }
    throw error
  }
}

/**
 * Scrape Twitter/X using Apify - Twitter (X) User Scraper
 * Note: This actor requires minimum 5 items. We duplicate the handle 5 times as per docs.
 */
export async function scrapeTwitter(handle: string, maxItems: number = 50) {
  const actorId = 'apidojo~twitter-user-scraper'

  const cleanHandle = handle.replace('@', '')

  // As per the actor documentation, we need to provide the handle 5 times minimum
  const twitterHandles = [cleanHandle, cleanHandle, cleanHandle, cleanHandle, cleanHandle]

  const input = {
    twitterHandles,
    getFollowers: false,
    getFollowing: false,
    getRetweeters: false,
    includeUnavailableUsers: false,
    maxItems: Math.max(maxItems, 5), // Minimum 5 items
  }

  const results = await runApifyActor(actorId, input)

  // The results will be user profile data, not tweets
  // We'll return the user profile information
  return results.map((user: any) => ({
    externalId: user.id || user.userName,
    title: `${user.name} (@${user.userName})`,
    contentText: user.description || user.bio || '',
    url: user.url || user.twitterUrl || `https://twitter.com/${user.userName}`,
    author: user.userName || cleanHandle,
    publishedAt: user.createdAt || new Date().toISOString(),
    engagementLikes: user.favouritesCount || 0,
    engagementShares: user.statusesCount || 0, // Using tweet count as shares
    engagementComments: 0,
    engagementViews: user.followers || 0, // Using followers as "views"
    mediaUrls: user.profilePicture ? [user.profilePicture] : [],
    hashtags: [],
    // Additional profile data
    metadata: {
      name: user.name,
      userName: user.userName,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      location: user.location,
      bio: user.description,
    }
  }))
}

/**
 * Scrape YouTube using Apify
 */
export async function scrapeYouTube(channelUrl: string, maxResults: number = 10) {
  const actorId = 'streamers~youtube-channel-scraper'

  const input: ApifyYouTubeInput = {
    startUrls: [{ url: channelUrl }],
    maxResults,
    maxResultsShorts: 0,
  }

  const results = await runApifyActor(actorId, input)

  return results.map((video: any) => ({
    externalId: video.id || video.videoId,
    title: video.title || '',
    contentText: video.description || '',
    url: video.url || `https://www.youtube.com/watch?v=${video.id || video.videoId}`,
    author: video.channelName || video.channelTitle || '',
    publishedAt: video.publishedAt || video.uploadDate,
    engagementLikes: video.likes || 0,
    engagementShares: 0,
    engagementComments: video.comments || video.commentCount || 0,
    engagementViews: video.views || video.viewCount || 0,
    mediaUrls: [video.thumbnail || video.thumbnails?.high?.url || ''],
    hashtags: video.tags || [],
  }))
}

/**
 * Scrape Reddit using Apify - Reddit Scraper Pro
 * Supports time-based filtering for fresh content
 */
export async function scrapeReddit(
  subreddit: string,
  limit: number = 20,
  sort: 'hot' | 'new' | 'top' | 'relevance' | 'comments' = 'hot',
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'day'
) {
  const actorId = 'fatihtahta~reddit-scraper'

  const cleanSubreddit = subreddit.replace('r/', '')
  const subredditUrl = `https://www.reddit.com/r/${cleanSubreddit}/`

  const input = {
    urls: [subredditUrl],
    scrapeComments: false, // Don't scrape comments to save costs
    maxPosts: limit,
    includeNsfw: false,
    sort,
    timeframe,
  }

  console.log(`🔍 Scraping Reddit with new actor:`, input)

  const results = await runApifyActor(actorId, input)

  // Filter only post items (kind: "post"), not comments
  const posts = results.filter((item: any) => item.kind === 'post')

  return posts.map((post: any) => ({
    externalId: post.id || '',
    title: post.title || '',
    contentText: post.body || post.selftext || '',
    url: post.url || '',
    author: post.author || '',
    publishedAt: post.created_utc || new Date().toISOString(),
    engagementLikes: post.score || 0,
    engagementShares: 0,
    engagementComments: post.num_comments || 0,
    engagementViews: 0,
    mediaUrls: [],
    hashtags: [],
  }))
}

/**
 * Scrape custom URL using Apify Web Scraper
 */
export async function scrapeCustomUrl(url: string) {
  const actorId = 'apify~web-scraper'

  console.log(`🔍 Scraping custom URL with Apify Web Scraper: ${url}`)

  const input = {
    startUrls: [{ url }],
    linkSelector: 'a[href]',
    pseudoUrls: [],
    pageFunction: `async function pageFunction(context) {
      const { request, log, skipLinks, jQuery: $ } = context;

      // Extract title
      const title = $('title').text() ||
                    $('h1').first().text() ||
                    $('meta[property="og:title"]').attr('content') ||
                    '';

      // Extract main content
      const contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '.post-content',
        '.article-content',
        '#content',
        'p'
      ];

      let contentText = '';
      for (const selector of contentSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          contentText = elements.map((i, el) => $(el).text().trim()).get().join(' ');
          if (contentText.length > 100) break;
        }
      }

      // Extract author
      const author = $('meta[name="author"]').attr('content') ||
                     $('[rel="author"]').text() ||
                     $('.author').text() ||
                     '';

      // Extract published date
      const publishedAt = $('meta[property="article:published_time"]').attr('content') ||
                          $('time').attr('datetime') ||
                          $('[itemprop="datePublished"]').attr('content') ||
                          new Date().toISOString();

      // Extract images
      const mediaUrls = $('img').map((i, el) => $(el).attr('src')).get()
        .filter(src => src && src.startsWith('http'))
        .slice(0, 5);

      return {
        url: request.url,
        title: title.trim(),
        contentText: contentText.trim(),
        author: author.trim(),
        publishedAt,
        mediaUrls
      };
    }`,
    maxRequestsPerCrawl: 1,
    maxPagesPerCrawl: 1,
    maxConcurrency: 1,
  }

  const results = await runApifyActor(actorId, input)

  if (!results || results.length === 0) {
    console.warn('   ⚠️  No results returned from Apify Web Scraper')
    return []
  }

  console.log(`   ✓ Apify returned ${results.length} results`)
  console.log(`   📝 Raw Apify result:`, JSON.stringify(results[0], null, 2))

  const mappedResults = results.map((result: any) => {
    const mapped = {
      externalId: result.url || url,
      title: result.title || '',
      contentText: result.contentText || '',
      url: result.url || url,
      author: result.author || '',
      publishedAt: result.publishedAt || new Date().toISOString(),
      engagementLikes: 0,
      engagementShares: 0,
      engagementComments: 0,
      engagementViews: 0,
      mediaUrls: result.mediaUrls || [],
      hashtags: [],
    }

    console.log(`   📄 Mapped content:`)
    console.log(`      - Title: ${mapped.title}`)
    console.log(`      - URL: ${mapped.url}`)
    console.log(`      - Content length: ${mapped.contentText.length} chars`)
    console.log(`      - Content preview: ${mapped.contentText.substring(0, 200)}...`)

    return mapped
  })

  return mappedResults
}
