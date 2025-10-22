import axios from 'axios'

// Using Groq API with free Llama 3.1 70B model (free tier available)
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || ''

if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set in environment variables')
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Generate newsletter content using Groq AI (Free Llama 3.1 70B)
 * Uses Llama 3.1 70B Versatile for high-quality newsletter generation
 */
export async function generateNewsletterWithOpenRouter(
  primaryContent: any[],
  evergreenContent: any[],
  trendingContent: any[],
  userVoiceProfile?: any
): Promise<string> {
  try {
    console.log(`📝 Generating newsletter with Groq AI (Llama 3.1 70B - Free)...`)
    console.log(`   Primary content: ${primaryContent.length} items`)
    console.log(`   Evergreen content: ${evergreenContent.length} items`)
    console.log(`   Trending content: ${trendingContent.length} items`)

    const systemPrompt = buildSystemPrompt(userVoiceProfile)
    const userPrompt = buildUserPrompt(primaryContent, evergreenContent, trendingContent)

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await axios.post<OpenRouterResponse>(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-70b-versatile', // Free open-source model, excellent for writing
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const generatedContent = response.data.choices[0]?.message?.content || ''

    console.log(`   ✅ Newsletter generated (${response.data.usage.total_tokens} tokens)`)

    return generatedContent
  } catch (error: any) {
    console.error('❌ Groq AI generation error:', error.message)
    if (error.response) {
      console.error('   Response data:', error.response.data)
      console.error('   Response status:', error.response.status)
    }
    throw error
  }
}

/**
 * Build system prompt based on user's voice profile
 */
function buildSystemPrompt(voiceProfile?: any): string {
  const tone = voiceProfile?.styleParameters?.tone || 'professional'
  const useEmojis = voiceProfile?.styleParameters?.useEmojis || false
  const useLists = voiceProfile?.styleParameters?.useLists !== false

  return `You are an expert newsletter writer for CreatorPulse, specializing in creating engaging, timely, and well-structured newsletters for content creators.

**Your Writing Style:**
- Tone: ${tone}
- Use emojis: ${useEmojis ? 'Yes' : 'No'}
- Format: ${useLists ? 'Use bullet points and lists for readability' : 'Use flowing paragraphs'}

**Newsletter Structure Guidelines:**

1. **Attention-Grabbing Subject Line** (First line of output)
   - Maximum 60 characters
   - Creates urgency or curiosity
   - No clickbait

2. **Hook Opening** (First paragraph)
   - 2-3 sentences max
   - Tease the most exciting content
   - Set the tone

3. **Primary Content Section** (70% of newsletter)
   - Title: "🔥 What's Hot Right Now"
   - Cover the MOST RECENT content (last 24-48 hours)
   - 3-5 key stories
   - Each story: headline, 2-3 sentence summary, key takeaway, link

4. **Evergreen/Deep Dives Section** (20% of newsletter)
   - Title: "📚 Worth Your Time"
   - High-quality content from last 7 days
   - 2-3 in-depth pieces
   - More analytical, less time-sensitive

5. **Trending Topics Section** (10% of newsletter)
   - Title: "📈 On The Radar"
   - Emerging trends (last 72 hours)
   - Brief bullet points
   - What to watch

6. **Closing CTA**
   - Encourage engagement (reply, share, etc.)
   - Tease next newsletter

**Quality Standards:**
- Be concise but engaging
- Add context and insights, not just links
- Highlight WHY something matters
- Use active voice
- Vary sentence length
- Include engagement metrics when relevant (views, likes, comments)

**Format:**
- Use Markdown for formatting
- Use headers (##, ###) for sections
- Use bold for emphasis
- Use links inline [like this](url)

Generate a complete, ready-to-send newsletter based on the provided content.`
}

/**
 * Build user prompt with categorized content
 */
function buildUserPrompt(
  primaryContent: any[],
  evergreenContent: any[],
  trendingContent: any[]
): string {
  let prompt = `Generate a newsletter using this content:\n\n`

  // Primary Content (70%)
  if (primaryContent.length > 0) {
    prompt += `## PRIMARY CONTENT (Last 24-48 Hours - 70% of newsletter)\n\n`
    primaryContent.forEach((item, index) => {
      prompt += `### Item ${index + 1}\n`
      prompt += `- Title: ${item.title}\n`
      prompt += `- Source: ${item.source_type || 'Unknown'}\n`
      prompt += `- Author: ${item.author}\n`
      prompt += `- Published: ${getTimeSincePublished(item.published_at)}\n`
      prompt += `- Content: ${item.content_text.substring(0, 300)}...\n`
      prompt += `- URL: ${item.url}\n`
      prompt += `- Engagement: ${formatEngagement(item)}\n`
      prompt += `\n`
    })
  }

  // Evergreen Content (20%)
  if (evergreenContent.length > 0) {
    prompt += `## EVERGREEN CONTENT (Last 7 Days - 20% of newsletter)\n\n`
    evergreenContent.forEach((item, index) => {
      prompt += `### Item ${index + 1}\n`
      prompt += `- Title: ${item.title}\n`
      prompt += `- Source: ${item.source_type || 'Unknown'}\n`
      prompt += `- Published: ${getTimeSincePublished(item.published_at)}\n`
      prompt += `- Content: ${item.content_text.substring(0, 200)}...\n`
      prompt += `- URL: ${item.url}\n`
      prompt += `\n`
    })
  }

  // Trending Content (10%)
  if (trendingContent.length > 0) {
    prompt += `## TRENDING TOPICS (Last 72 Hours - 10% of newsletter)\n\n`
    trendingContent.forEach((item, index) => {
      prompt += `- ${item.title} (${item.source_type}) - ${formatEngagement(item)}\n`
    })
    prompt += `\n`
  }

  prompt += `\n**IMPORTANT:** Structure the newsletter with proper sections, engaging copy, and ensure the content distribution follows the 70/20/10 rule.`

  return prompt
}

/**
 * Calculate time since published
 */
function getTimeSincePublished(publishedAt: string): string {
  if (!publishedAt) return 'Unknown'

  const published = new Date(publishedAt)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Less than 1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`

  return `${Math.floor(diffDays / 7)} weeks ago`
}

/**
 * Format engagement metrics
 */
function formatEngagement(item: any): string {
  const parts = []

  if (item.engagement_views > 0) parts.push(`${formatNumber(item.engagement_views)} views`)
  if (item.engagement_likes > 0) parts.push(`${formatNumber(item.engagement_likes)} likes`)
  if (item.engagement_comments > 0) parts.push(`${formatNumber(item.engagement_comments)} comments`)

  return parts.length > 0 ? parts.join(', ') : 'No engagement data'
}

/**
 * Format large numbers (e.g., 1500 -> 1.5K)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
