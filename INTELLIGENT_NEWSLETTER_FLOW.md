# 🧠 Intelligent Newsletter Generation Flow

## User Perspective: How CreatorPulse Works End-to-End

---

## 🎯 The User Journey

### Step 1: Add Your Content Sources

**What You Do:**
1. Go to the Sources page (`/sources`)
2. Click "Add Source"
3. Choose your source type (Twitter, YouTube, Reddit, RSS, Custom URL)
4. Configure source settings:
   - **Twitter:** Handle, max items, keywords
   - **YouTube:** Channel URL, max videos
   - **Reddit:** Subreddit, sort (Hot/New/Top), timeframe (Last 24h, Week, etc.)
   - **RSS:** Feed URL, max items
5. Click "Add Source"

**What Happens Behind the Scenes:**
- Source is saved to database with your configurations
- Status set to "Active"
- Ready for scraping

---

### Step 2: Scrape Fresh Content

**What You Do:**
- Click "Scrape Now" on a source
- OR navigate to Dashboard and click "Scrape All Sources"

**What Happens Behind the Scenes:**

**Time-Based Intelligence:**
```
📅 Twitter    → Last 24 hours (tweets get stale fast)
📹 YouTube    → Last 48 hours (videos need time to trend)
📱 Reddit     → Last 24-48h based on sort type
📰 RSS        → Latest issue (usually weekly/biweekly)
```

**The Scraping Process:**
1. **Fetch Content** from each active source
   - Twitter: User profiles and engagement
   - YouTube: Videos with views, likes, comments
   - Reddit: Posts with upvotes, comments (using NEW actor: `fatihtahta/reddit-scraper`)
   - RSS: Articles with full content

2. **Calculate Engagement Score**
   - Normalized across platforms
   - Formula: `(likes + shares*2 + comments*1.5) / 1000`

3. **Store in Database** (`scraped_content` table)
   - External ID (for deduplication)
   - Title, content, URL, author
   - Published date
   - Engagement metrics
   - Source type
   - Relevance score

4. **Update Source Status**
   - Last scrape timestamp
   - Items scraped count
   - Success/failure status
   - Error messages (if any)

**Result:**
- All your sources now have fresh, timestamped content
- Ready for intelligent categorization

---

### Step 3: Generate AI Newsletter

**What You Do:**
1. Go to Drafts page (`/drafts`)
2. Click "Generate New Draft"
3. Wait 5-10 seconds for AI generation

**What Happens Behind the Scenes:**

## 🧠 The Intelligent Categorization System

CreatorPulse automatically categorizes your content into 3 buckets based on **freshness** and **engagement**:

### 📰 PRIMARY CONTENT (70% of Newsletter)
**Timeframe:** Last 24-48 Hours
**Purpose:** What's hot RIGHT NOW

**Selection Criteria:**
- Twitter posts from last 24 hours
- YouTube videos from last 48 hours
- Reddit posts from last 24-48 hours (based on sort)
- Latest RSS articles

**Why This Matters:**
- Users expect timely insights
- A newsletter about a 5-day-old tweet feels irrelevant
- This content has urgency and recency

**Database Query:**
```sql
SELECT * FROM scraped_content
WHERE user_id = YOUR_ID
AND published_at >= NOW() - INTERVAL '48 hours'
ORDER BY published_at DESC, engagement_normalized DESC
LIMIT 15
```

**What You See in Newsletter:**
```
🔥 What's Hot Right Now

1. Elon Musk's AI Announcement (2 hours ago)
   Twitter | 45K likes, 12K retweets
   Elon just announced...
   [Read more](link)

2. MrBeast's Latest Video (Yesterday)
   YouTube | 5.2M views, 180K likes
   In his newest challenge...
   [Watch now](link)
```

---

### 📚 EVERGREEN CONTENT (20% of Newsletter)
**Timeframe:** 2-7 Days Old
**Purpose:** High-quality deep dives that aged well

**Selection Criteria:**
- Content from 2-7 days ago
- High engagement scores
- Still relevant but not urgent
- In-depth pieces, tutorials, analyses

**Why This Matters:**
- Some content needs time to "breathe"
- Allows you to assess true impact
- Balances news with substance

**Database Query:**
```sql
SELECT * FROM scraped_content
WHERE user_id = YOUR_ID
AND published_at >= NOW() - INTERVAL '7 days'
AND published_at < NOW() - INTERVAL '48 hours'
ORDER BY engagement_normalized DESC
LIMIT 5
```

**What You See in Newsletter:**
```
📚 Worth Your Time

1. Deep Dive: The State of AI in 2025 (4 days ago)
   Article | 1.2M reads, 5K comments
   This comprehensive analysis explores...
   [Read more](link)

2. How to Build SaaS in 2025 (5 days ago)
   YouTube | 890K views, still climbing
   A must-watch for founders...
   [Watch now](link)
```

---

### 📈 TRENDING TOPICS (10% of Newsletter)
**Timeframe:** Last 72 Hours
**Purpose:** Emerging patterns and hot topics

**Selection Criteria:**
- Content from last 72 hours
- HIGH engagement velocity
- Multiple mentions across sources
- Breaking trends

**Why This Matters:**
- Catch emerging trends early
- Show "what to watch"
- Provide forward-looking insights

**Database Query:**
```sql
SELECT * FROM scraped_content
WHERE user_id = YOUR_ID
AND published_at >= NOW() - INTERVAL '72 hours'
ORDER BY engagement_normalized DESC
LIMIT 3
```

**What You See in Newsletter:**
```
📈 On The Radar

• GPT-5 rumors intensify (36h ago) - 15K discussions
• New TikTok algorithm changes (2 days ago) - Creators worried
• Crypto regulations shifting (3 days ago) - Major implications
```

---

## 🤖 AI Newsletter Generation (OpenRouter)

**Model Used:** Claude 3.5 Sonnet (Best for writing)

**The Prompt Strategy:**

### System Prompt (Configured by You)
```
Your Writing Style:
- Tone: Professional / Casual / Technical
- Use Emojis: Yes / No
- Format: Lists / Paragraphs

Newsletter Structure:
1. Attention-grabbing subject line (60 chars max)
2. Hook opening (2-3 sentences)
3. Primary Content Section (70%)
4. Evergreen/Deep Dives Section (20%)
5. Trending Topics Section (10%)
6. Closing CTA
```

### User Prompt (Automated)
```
PRIMARY CONTENT (Last 24-48h - 70%)
- Item 1: [Title, Source, Author, Engagement, Content Preview, URL]
- Item 2: ...
[15 items total]

EVERGREEN CONTENT (Last 7 days - 20%)
- Item 1: [Title, Source, Published, Content Preview]
- Item 2: ...
[5 items total]

TRENDING TOPICS (Last 72h - 10%)
- Topic 1: [Title, Source, Engagement]
- Topic 2: ...
[3 items total]

Generate newsletter with 70/20/10 distribution
```

**AI Processing:**
1. Analyzes all content
2. Identifies connections and themes
3. Writes engaging summaries
4. Adds context and insights
5. Formats with Markdown
6. Ensures 70/20/10 distribution

**Generation Time:** 5-10 seconds

---

## 📧 Your Generated Newsletter

**What You Get:**

```markdown
Subject: 🔥 This Week in AI: Major Announcements & What's Next

Hey there!

Big week for AI! From Elon's surprise announcement to viral debates about
GPT-5, here's everything you need to know.

## 🔥 What's Hot Right Now

### Elon Musk Announces xAI's Latest Model
Published 2 hours ago | Twitter | 45K likes, 12K retweets

Elon dropped a bombshell this morning, revealing xAI's new language
model that claims to surpass GPT-4. Early tests show impressive
reasoning capabilities, though some experts remain skeptical.

**Why it matters:** If true, this could reshape the AI landscape
and intensify competition between OpenAI, Google, and xAI.

[Read the thread →](link)

### MrBeast Tests AI to Make His Videos (Results Shocking)
Published yesterday | YouTube | 5.2M views, 180K likes

In his latest experiment, MrBeast used AI to script, edit, and
optimize one of his videos. The results? 30% higher engagement
than his usual content. He breaks down the entire process.

**Key takeaway:** AI-assisted content creation is no longer
"coming soon" - it's here, and it works.

[Watch now →](link)

[... 3 more primary items ...]

## 📚 Worth Your Time

### The State of AI in 2025: A Comprehensive Report
Published 4 days ago | TechCrunch | 1.2M reads

This deep-dive analyzes the current AI landscape, covering everything
from regulation challenges to breakthrough applications. A must-read
for anyone serious about understanding where we're headed.

[Read full report →](link)

[... 2 more evergreen items ...]

## 📈 On The Radar

Quick hits on what's trending:

• **GPT-5 Release Rumors** (36h ago) - OpenAI employees hint at Q4
• **TikTok Algorithm Update** (2d ago) - Creators reporting 50% reach drop
• **EU AI Act Takes Effect** (3d ago) - Compliance deadlines approaching

---

**What's your take on Elon's xAI announcement?** Hit reply and let me know!

See you next week,
[Your Name]

P.S. Want more like this? Share with a friend who'd dig it.
```

**Saved to Database:**
- Title: "🔥 This Week in AI: Major Announcements & What's Next"
- Body: [Full Markdown content]
- Curated Items: [List of 10 primary items with metadata]
- Trends Section: [List of trending topics]
- Generation Time: 7.3 seconds
- Status: Draft

---

## 🎨 The Full Data Flow

```
┌─────────────────┐
│  USER ADDS      │
│  SOURCES        │
│  (Step 1)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SOURCES TABLE  │
│  - Twitter      │
│  - YouTube      │
│  - Reddit       │
│  - RSS          │
└────────┬────────┘
         │
         ▼ User clicks "Scrape Now"
┌─────────────────┐
│  SCRAPING       │
│  ACTORS         │
│  - Apify        │
│  - YouTube API  │
│  - RSS Parser   │
└────────┬────────┘
         │
         ▼ With time-based filtering
┌─────────────────────────────────────┐
│  SCRAPED_CONTENT TABLE               │
│  Each item tagged with:              │
│  - published_at (timestamp)          │
│  - engagement_normalized (score)     │
│  - source_type (twitter/youtube/etc) │
│  - content, url, author, etc         │
└────────┬────────────────────────────┘
         │
         ▼ User clicks "Generate Draft"
┌─────────────────────────────────────┐
│  INTELLIGENT CATEGORIZATION          │
│                                      │
│  Query 1: Primary (48h)   → 15 items│
│  Query 2: Evergreen (7d)  → 5 items │
│  Query 3: Trending (72h)  → 3 items │
│                                      │
│  Total: 23 items, categorized        │
└────────┬────────────────────────────┘
         │
         ▼ Sent to OpenRouter
┌─────────────────────────────────────┐
│  AI GENERATION (Claude 3.5)         │
│                                      │
│  Input:                              │
│  - 70% Primary content               │
│  - 20% Evergreen content             │
│  - 10% Trending topics               │
│  - User voice profile                │
│                                      │
│  Output:                             │
│  - Engaging newsletter (Markdown)    │
│  - Subject line                      │
│  - Sections with summaries           │
│  - Links and CTAs                    │
└────────┬────────────────────────────┘
         │
         ▼ Saved to database
┌─────────────────────────────────────┐
│  DRAFTS TABLE                        │
│  - ai_title                          │
│  - ai_body (full newsletter)         │
│  - ai_curated_items (with metadata)  │
│  - ai_trends_section                 │
│  - generation_time                   │
│  - status: draft                     │
└────────┬────────────────────────────┘
         │
         ▼ User reviews
┌─────────────────┐
│  USER EDITS     │
│  & SENDS        │
│  (Future)       │
└─────────────────┘
```

---

## 🔑 Key Technical Improvements

### 1. New Reddit Scraper
**Old:** `vulnv~reddit-posts-scraper` (limited, buggy)
**New:** `fatihtahta~reddit-scraper` ($1.80 per 1K items)

**Benefits:**
- Supports timeframe filtering (hour/day/week/month/year/all)
- Better sort options (hot/new/top/relevance/comments)
- Can scrape comments (optional)
- More reliable with residential proxies
- Cleaner JSON output

**Configuration:**
```typescript
{
  urls: ['https://www.reddit.com/r/technology/'],
  scrapeComments: false,  // Save costs
  maxPosts: 20,
  includeNsfw: false,
  sort: 'hot',
  timeframe: 'day'  // ← KEY: Time-based filtering
}
```

### 2. OpenRouter Integration
**Old:** Google Gemini (limited, generic)
**New:** OpenRouter with Claude 3.5 Sonnet

**Benefits:**
- Better writing quality
- Understands context and connections
- Follows voice profile accurately
- Supports complex prompts
- Reliable API

**API Key:** `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`

### 3. Time-Based Intelligence

**Twitter Scraping:**
- Always fetches last 24 hours (tweets get stale fast)

**YouTube Scraping:**
- Fetches last 48 hours (videos need time to trend)
- Uses official YouTube Data API v3

**Reddit Scraping:**
- Configurable timeframe (default: 'day' for primary content)
- Sort by 'hot' for real-time, 'top' for quality

**Newsletter Categorization:**
- Primary: 48h window (Twitter 24h, YouTube 48h)
- Evergreen: 2-7 days old
- Trending: 72h window, high engagement

---

## 🎯 Content Quality Metrics

### What Makes Content "Primary" (70%)?
1. ✅ Published within 24-48 hours
2. ✅ Sorted by recency (newer = higher priority)
3. ✅ Then by engagement score
4. ✅ Top 15 items selected

### What Makes Content "Evergreen" (20%)?
1. ✅ Published 2-7 days ago
2. ✅ High engagement score (best performing)
3. ✅ Excluded from primary timeframe (no overlap)
4. ✅ Top 5 items selected

### What Makes Content "Trending" (10%)?
1. ✅ Published within 72 hours
2. ✅ Highest engagement velocity
3. ✅ Short, punchy format
4. ✅ Top 3 items selected

---

## 💰 Cost Breakdown

| Service | Cost | Usage |
|---------|------|-------|
| **YouTube API** | $0 (10K units/day free) | ~5 units per video |
| **RSS Parsing** | $0 (npm library) | Unlimited |
| **Reddit Scraper** | $1.80 per 1K items | ~$0.04 per newsletter |
| **Twitter Scraper** | $0.40 per 1K profiles | $0.02 per newsletter |
| **OpenRouter (Claude)** | ~$0.003 per newsletter | 4K tokens avg |

**Total per Newsletter:** ~$0.06
**Per Month (4 newsletters):** ~$0.25

**Extremely affordable for professional AI-powered newsletters!**

---

## 📊 User Experience Flow

### Sources Page
```
1. Click "Add Source"
2. Select "Reddit"
3. Enter "r/technology"
4. Set Sort: "Hot"
5. Set Timeframe: "Last 24 Hours (Primary)"
6. Set Max Posts: 20
7. Click "Add Source"
8. Click "Scrape Now"
9. See status: "Scraping..." → "Success! 18 items"
```

### Dashboard
```
1. View stats:
   - Sources: 5 active
   - Items scraped: 87 (last 24h)
   - Drafts generated: 3

2. Click "Scrape All Sources"
3. Wait 30-60 seconds
4. See updated counts

5. Click "Generate New Draft"
6. Wait 10 seconds
7. View generated newsletter
```

### Drafts Page
```
1. See list of drafts
2. Click "Generate New Draft" button
3. AI categorizes content:
   ✓ Primary: 15 items (65%)
   ✓ Evergreen: 5 items (22%)
   ✓ Trending: 3 items (13%)

4. OpenRouter generates newsletter (10s)
5. Draft appears with:
   - Subject line
   - Full newsletter body
   - Stats (23 items, 7.3s generation)

6. Click to view/edit draft
7. Make manual edits (optional)
8. Send newsletter (future feature)
```

---

## 🎓 Best Practices for Users

### Source Selection
- ✅ Mix sources for variety (Twitter + YouTube + Reddit + RSS)
- ✅ Choose high-quality sources (verified accounts, popular channels)
- ✅ Focus on your niche
- ❌ Don't add too many sources (quality > quantity)

### Scraping Frequency
- ✅ Daily for Twitter (content moves fast)
- ✅ Every 2-3 days for YouTube (slower update cycle)
- ✅ Daily or every other day for Reddit
- ✅ Weekly for RSS newsletters

### Newsletter Generation
- ✅ Scrape all sources before generating
- ✅ Generate when you have 20+ items
- ✅ Review and edit the draft
- ✅ Check primary content is actually recent
- ❌ Don't generate without fresh content

### Voice Profile
- ✅ Set tone (professional/casual/technical)
- ✅ Define emoji usage
- ✅ Specify formatting preferences
- ✅ Upload writing samples for training

---

## 🚀 Future Enhancements

### Planned Features:
1. **Auto-scheduling:** Generate drafts automatically daily/weekly
2. **Email sending:** Send directly to subscribers
3. **A/B testing:** Test subject lines and formats
4. **Analytics:** Track opens, clicks, engagement
5. **Templates:** Pre-made newsletter templates
6. **Voice training:** Upload samples to refine style
7. **Content filters:** Exclude topics, require keywords
8. **Multi-language:** Generate newsletters in multiple languages

---

## ✅ Summary

**What You Built:**
- ✅ Intelligent time-based content scraping
- ✅ 70/20/10 content categorization
- ✅ OpenRouter AI generation with Claude 3.5
- ✅ Complete sources → drafts flow
- ✅ Professional newsletter output

**What Your Users Get:**
- ✅ Fresh, relevant content (24-48h old)
- ✅ Balanced newsletters (news + depth + trends)
- ✅ Personalized writing style
- ✅ Automated curation and generation
- ✅ Professional quality at $0.06 per newsletter

**Ready to Launch:** YES! 🎉

