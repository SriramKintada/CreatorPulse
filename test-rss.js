// Test RSS Feed Scraping (No Apify required)
const Parser = require('rss-parser')

console.log('🧪 TESTING RSS FEED SCRAPING\n')
console.log('=' .repeat(80))

async function testRssFeed() {
  try {
    const feedUrl = 'https://techcrunch.com/feed/'  // TechCrunch RSS feed
    console.log(`📡 Scraping RSS feed: ${feedUrl}`)

    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
    })

    const feed = await parser.parseURL(feedUrl)
    console.log(`\n✅ RSS feed parsed successfully!`)
    console.log(`   Feed title: ${feed.title || 'Untitled'}`)
    console.log(`   Total items: ${feed.items.length}`)

    if (feed.items.length > 0) {
      const sample = feed.items[0]
      console.log(`\n📋 SAMPLE ARTICLE:`)
      console.log(`   - Title: ${sample.title}`)
      console.log(`   - Author: ${sample.creator || sample.author || 'Unknown'}`)
      console.log(`   - Published: ${sample.pubDate || sample.isoDate}`)
      console.log(`   - Link: ${sample.link}`)
      console.log(`   - Content preview: ${(sample.contentSnippet || sample.content || '').substring(0, 150)}...`)

      // Check relevance
      const isTechCrunch = feed.title.toLowerCase().includes('techcrunch')
      console.log(`\n✅ RELEVANCE: ${isTechCrunch ? 'PASSED - Feed is from TechCrunch' : 'FAILED - Feed is NOT from TechCrunch'}`)

      console.log(`\n📊 MAPPED DATA STRUCTURE:`)
      const mappedData = feed.items.slice(0, 3).map((item) => {
        const contentText =
          item.contentEncoded ||
          item.content ||
          item['content:encoded'] ||
          item.summary ||
          item.description ||
          ''

        return {
          externalId: item.guid || item.id || item.link || '',
          title: item.title || '',
          contentText: contentText.replace(/<[^>]*>/g, '').substring(0, 200),
          url: item.link || '',
          author: item.creator || item.author || feed.title || '',
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        }
      })

      console.log(JSON.stringify(mappedData, null, 2))

      return true
    }

    return false
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`)
    return false
  }
}

// Test multiple RSS feeds
async function testMultipleFeeds() {
  const feeds = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'Hacker News (RSS)', url: 'https://hnrss.org/frontpage' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  ]

  let passed = 0
  let failed = 0

  for (const feed of feeds) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Testing: ${feed.name}`)
    console.log(`${'='.repeat(80)}`)

    const result = await testRssFeed()
    if (result) {
      passed++
      console.log(`\n✅ ${feed.name}: PASSED`)
    } else {
      failed++
      console.log(`\n❌ ${feed.name}: FAILED`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`📊 FINAL RSS TEST RESULTS`)
  console.log(`${'='.repeat(80)}`)
  console.log(`Passed: ${passed}/${feeds.length}`)
  console.log(`Failed: ${failed}/${feeds.length}`)
  console.log(`\n${passed === feeds.length ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}`)
  console.log(`${'='.repeat(80)}\n`)
}

testRssFeed().catch(console.error)
