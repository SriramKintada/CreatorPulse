import axios from 'axios'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBihc1O58AKzp0Vuv0rdlweb4USUSb14io'

if (!YOUTUBE_API_KEY) {
  console.warn('YOUTUBE_API_KEY is not set in environment variables')
}

interface YouTubeVideo {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    publishedAt: string
    channelTitle: string
    thumbnails: {
      high: { url: string }
    }
  }
  statistics?: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
}

/**
 * Scrape YouTube channel using official YouTube Data API v3
 */
export async function scrapeYouTubeChannel(channelUrl: string, maxResults: number = 10) {
  try {
    console.log(`🎥 Scraping YouTube channel: ${channelUrl}`)
    console.log(`   Max results: ${maxResults}`)

    // Extract channel ID or username from URL
    const channelId = extractChannelId(channelUrl)

    if (!channelId) {
      throw new Error('Invalid YouTube channel URL. Please provide a valid channel URL.')
    }

    console.log(`   Channel ID/Handle: ${channelId}`)

    // Step 1: Get channel details and uploads playlist ID
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'contentDetails,snippet',
          ...(channelId.startsWith('@') || channelId.startsWith('UC')
            ? { id: channelId.replace('@', '') }
            : { forUsername: channelId }
          ),
          key: YOUTUBE_API_KEY,
        },
      }
    )

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      // Try with forHandle if ID didn't work
      const handleResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            part: 'contentDetails,snippet',
            forHandle: channelId.replace('@', ''),
            key: YOUTUBE_API_KEY,
          },
        }
      )

      if (!handleResponse.data.items || handleResponse.data.items.length === 0) {
        throw new Error(`Channel not found: ${channelId}`)
      }

      channelResponse.data = handleResponse.data
    }

    const channel = channelResponse.data.items[0]
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads

    console.log(`   ✓ Channel found: ${channel.snippet.title}`)
    console.log(`   ✓ Uploads playlist ID: ${uploadsPlaylistId}`)

    // Step 2: Get videos from uploads playlist
    const playlistResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/playlistItems',
      {
        params: {
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: Math.min(maxResults, 50), // API limit is 50
          key: YOUTUBE_API_KEY,
        },
      }
    )

    const videos = playlistResponse.data.items || []
    console.log(`   ✓ Retrieved ${videos.length} videos`)

    // Step 3: Get video statistics (views, likes, comments)
    const videoIds = videos.map((v: any) => v.snippet.resourceId.videoId).join(',')

    const statsResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'statistics',
          id: videoIds,
          key: YOUTUBE_API_KEY,
        },
      }
    )

    const statsMap = new Map()
    statsResponse.data.items?.forEach((item: any) => {
      statsMap.set(item.id, item.statistics)
    })

    // Map to standard format
    const mappedVideos = videos.map((video: any) => {
      const videoId = video.snippet.resourceId.videoId
      const stats = statsMap.get(videoId) || {}

      return {
        externalId: videoId,
        title: video.snippet.title || '',
        contentText: video.snippet.description || '',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        author: video.snippet.channelTitle || '',
        publishedAt: video.snippet.publishedAt || new Date().toISOString(),
        engagementLikes: parseInt(stats.likeCount || '0'),
        engagementShares: 0,
        engagementComments: parseInt(stats.commentCount || '0'),
        engagementViews: parseInt(stats.viewCount || '0'),
        mediaUrls: [
          video.snippet.thumbnails?.high?.url ||
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url ||
          '',
        ],
        hashtags: extractHashtags(video.snippet.description || ''),
      }
    })

    console.log(`   ✅ Successfully mapped ${mappedVideos.length} videos`)

    return mappedVideos
  } catch (error: any) {
    console.error('❌ YouTube API error:', error.message)
    if (error.response) {
      console.error('   Response data:', error.response.data)
      console.error('   Response status:', error.response.status)
    }
    throw error
  }
}

/**
 * Extract channel ID from various YouTube URL formats
 */
function extractChannelId(url: string): string | null {
  // Format 1: https://www.youtube.com/@channelhandle
  const handleMatch = url.match(/@([a-zA-Z0-9_-]+)/)
  if (handleMatch) {
    return handleMatch[0] // Return with @ symbol
  }

  // Format 2: https://www.youtube.com/channel/UC...
  const channelMatch = url.match(/channel\/([a-zA-Z0-9_-]+)/)
  if (channelMatch) {
    return channelMatch[1]
  }

  // Format 3: https://www.youtube.com/c/channelname or /user/username
  const customMatch = url.match(/\/(c|user)\/([a-zA-Z0-9_-]+)/)
  if (customMatch) {
    return customMatch[2]
  }

  // Format 4: Just the handle or ID
  if (url.startsWith('@') || url.startsWith('UC')) {
    return url
  }

  // Format 5: Just a username
  if (!url.includes('/') && !url.includes('.')) {
    return url
  }

  return null
}

/**
 * Extract hashtags from description
 */
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}
