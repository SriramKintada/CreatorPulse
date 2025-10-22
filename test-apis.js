// Test script to verify all API tokens are working
const axios = require('axios')

// API tokens from environment variables
const APIFY_TOKEN = process.env.APIFY_API_TOKEN || ''
const EXA_KEY = process.env.EXA_API_KEY || ''
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''

console.log('🔍 Testing API Connections...\n')

// Test 1: Apify API
async function testApify() {
  try {
    console.log('1️⃣ Testing Apify API...')
    const response = await axios.get(
      `https://api.apify.com/v2/acts?token=${APIFY_TOKEN}&limit=1`
    )

    if (response.status === 200) {
      console.log('✅ Apify API: WORKING')
      console.log(`   - Found ${response.data.total} actors available\n`)
      return true
    }
  } catch (error) {
    console.log('❌ Apify API: FAILED')
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`)
    return false
  }
}

// Test 2: Exa.ai API
async function testExa() {
  try {
    console.log('2️⃣ Testing Exa.ai API...')
    const response = await axios.post(
      'https://api.exa.ai/search',
      {
        query: 'test',
        numResults: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_KEY,
        },
      }
    )

    if (response.status === 200) {
      console.log('✅ Exa.ai API: WORKING')
      console.log(`   - Search returned ${response.data.results?.length || 0} results\n`)
      return true
    }
  } catch (error) {
    console.log('❌ Exa.ai API: FAILED')
    console.log(`   Error: ${error.response?.data?.message || error.message}\n`)
    return false
  }
}

// Test 3: Google Gemini API
async function testGemini() {
  try {
    console.log('3️⃣ Testing Google Gemini API...')

    // Try with gemini-2.5-flash model
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Say "API is working"'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status === 200) {
      console.log('✅ Google Gemini API: WORKING')
      const text = response.data.candidates[0]?.content?.parts[0]?.text || 'No response'
      console.log(`   - Response: ${text.substring(0, 100)}\n`)
      return true
    }
  } catch (error) {
    console.log('❌ Google Gemini API: FAILED')
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`)
    return false
  }
}

// Run all tests
async function runTests() {
  console.log('API Tokens Found:')
  console.log(`- Apify: ${APIFY_TOKEN ? '✓' : '✗'}`)
  console.log(`- Exa.ai: ${EXA_KEY ? '✓' : '✗'}`)
  console.log(`- Gemini: ${GEMINI_KEY ? '✓' : '✗'}`)
  console.log('\n' + '='.repeat(50) + '\n')

  const results = await Promise.all([
    testApify(),
    testExa(),
    testGemini(),
  ])

  console.log('='.repeat(50))
  console.log('\n📊 Test Summary:')
  console.log(`Apify API: ${results[0] ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Exa.ai API: ${results[1] ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Gemini API: ${results[2] ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = results.every(r => r)
  console.log(`\n${allPassed ? '🎉 All APIs are working!' : '⚠️ Some APIs failed. Check the errors above.'}`)
}

runTests().catch(console.error)
