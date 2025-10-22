// Comprehensive Scraping Test Script
// Tests all Apify actors with real data to verify relevance and reliability

const axios = require('axios')

const APIFY_TOKEN = process.env.APIFY_API_TOKEN || ''

console.log('🧪 COMPREHENSIVE SCRAPING TEST\n')
console.log('=' .repeat(80))
console.log('This test will verify that each scraper returns RELEVANT and RELIABLE data')
console.log('=' .repeat(80) + '\n')

// Helper function to run Apify actor
async function runApifyActor(actorId, input, testName) {
  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🎬 TEST: ${testName}`)
    console.log(`${'='.repeat(80)}`)
    console.log(`Actor ID: ${actorId}`)
    console.log(`Input:`, JSON.stringify(input, null, 2))

    // Start the actor run
    console.log(`\n⏳ Starting actor...`)
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      input,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const runId = runResponse.data.data.id
    const datasetId = runResponse.data.data.defaultDatasetId
    console.log(`✓ Run started: ${runId}`)

    // Poll for completion (max 3 minutes)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 36 // 3 minutes with 5 second intervals

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const statusResponse = await axios.get(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${APIFY_TOKEN}`
      )

      status = statusResponse.data.data.status
      attempts++
      process.stdout.write(`\r⏱️  Waiting... (${attempts * 5}s)`)
    }

    console.log(`\n`)

    if (status !== 'SUCCEEDED') {
      throw new Error(`Actor run failed with status: ${status}`)
    }

    console.log(`✅ Actor completed successfully!`)

    // Get results
    const datasetResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
    )

    const results = datasetResponse.data
    console.log(`\n📊 RESULTS SUMMARY:`)
    console.log(`   Total items scraped: ${results.length}`)

    return results
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`)
    if (error.response) {
      console.error(`   Response status: ${error.response.status}`)
      console.error(`   Response data:`, JSON.stringify(error.response.data, null, 2))
    }
    return null
  }
}

// Test 1: Twitter - Scrape Elon Musk's tweets
async function testTwitter() {
  const results = await runApifyActor(
    'kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest',
    {
      from: 'elonmusk',
      maxItems: 10,
      lang: 'en',
      'filter:nativeretweets': false,
    },
    'Twitter - @elonmusk tweets'
  )

  if (results && results.length > 0) {
    console.log(`\n📋 RELEVANCE CHECK:`)
    const sample = results[0]
    console.log(`   Sample Tweet:`)
    console.log(`   - Author: ${sample.user?.screen_name || sample.author || 'N/A'}`)
    console.log(`   - Text: ${(sample.full_text || sample.text || '').substring(0, 150)}...`)
    console.log(`   - Likes: ${sample.favorite_count || 0}`)
    console.log(`   - Retweets: ${sample.retweet_count || 0}`)
    console.log(`   - Date: ${sample.created_at || 'N/A'}`)
    console.log(`   - ID: ${sample.id_str || sample.id || 'N/A'}`)

    // Verify relevance
    const isFromElonMusk = (sample.user?.screen_name || '').toLowerCase().includes('elon')
    console.log(`\n✅ RELEVANCE: ${isFromElonMusk ? 'PASSED - Tweets are from @elonmusk' : 'FAILED - Tweets are NOT from @elonmusk'}`)

    return isFromElonMusk
  }

  return false
}

// Test 2: YouTube - Scrape MrBeast channel
async function testYouTube() {
  const results = await runApifyActor(
    'streamers~youtube-channel-scraper',
    {
      startUrls: [{ url: 'https://www.youtube.com/@MrBeast' }],
      maxResults: 5,
      maxResultsShorts: 0,
    },
    'YouTube - @MrBeast channel'
  )

  if (results && results.length > 0) {
    console.log(`\n📋 RELEVANCE CHECK:`)
    const sample = results[0]
    console.log(`   Sample Video:`)
    console.log(`   - Title: ${sample.title || 'N/A'}`)
    console.log(`   - Channel: ${sample.channelName || sample.channelTitle || 'N/A'}`)
    console.log(`   - Views: ${sample.views || sample.viewCount || 0}`)
    console.log(`   - Likes: ${sample.likes || 0}`)
    console.log(`   - URL: ${sample.url || 'N/A'}`)
    console.log(`   - Published: ${sample.publishedAt || sample.uploadDate || 'N/A'}`)

    // Verify relevance
    const channelName = (sample.channelName || sample.channelTitle || '').toLowerCase()
    const isFromMrBeast = channelName.includes('mrbeast') || channelName.includes('beast')
    console.log(`\n✅ RELEVANCE: ${isFromMrBeast ? 'PASSED - Videos are from MrBeast channel' : 'FAILED - Videos are NOT from MrBeast'}`)

    return isFromMrBeast
  }

  return false
}

// Test 3: Reddit - Scrape r/technology
async function testReddit() {
  const results = await runApifyActor(
    'vulnv~reddit-posts-scraper',
    {
      subreddit_name: 'technology',
      limit: 10,
      category: 'hot',
    },
    'Reddit - r/technology subreddit'
  )

  if (results && results.length > 0) {
    console.log(`\n📋 RELEVANCE CHECK:`)
    const sample = results[0]
    console.log(`   Sample Post:`)
    console.log(`   - Title: ${sample.title || 'N/A'}`)
    console.log(`   - Author: ${sample.author || 'N/A'}`)
    console.log(`   - Score: ${sample.ups || sample.score || 0}`)
    console.log(`   - Comments: ${sample.num_comments || 0}`)
    console.log(`   - URL: ${sample.url || 'N/A'}`)
    console.log(`   - Subreddit: ${sample.subreddit || 'N/A'}`)

    // Verify relevance
    const subreddit = (sample.subreddit || '').toLowerCase()
    const isFromTechnology = subreddit === 'technology'
    console.log(`\n✅ RELEVANCE: ${isFromTechnology ? 'PASSED - Posts are from r/technology' : 'FAILED - Posts are NOT from r/technology'}`)

    return isFromTechnology
  }

  return false
}

// Run all tests
async function runAllTests() {
  const results = {
    twitter: false,
    youtube: false,
    reddit: false,
  }

  console.log('\n🚀 Starting comprehensive tests...\n')

  // Test Twitter
  results.twitter = await testTwitter()
  await new Promise(resolve => setTimeout(resolve, 2000)) // Wait between tests

  // Test YouTube
  results.youtube = await testYouTube()
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test Reddit
  results.reddit = await testReddit()

  // Final summary
  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`📊 FINAL TEST RESULTS`)
  console.log(`${'='.repeat(80)}`)
  console.log(`\nTwitter (@elonmusk):  ${results.twitter ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`YouTube (@MrBeast):   ${results.youtube ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Reddit (r/technology): ${results.reddit ? '✅ PASSED' : '❌ FAILED'}`)

  const allPassed = results.twitter && results.youtube && results.reddit
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED! Scrapers are working correctly.' : '⚠️  SOME TESTS FAILED! Check the logs above.'}`)
  console.log(`${'='.repeat(80)}\n`)
}

runAllTests().catch(console.error)
