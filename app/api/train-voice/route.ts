import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)

/**
 * VOICE TRAINING API
 * Analyzes writing samples to learn user's unique voice
 * POST /api/train-voice
 * Body: { samples: string[] } - Array of writing samples
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { samples } = await request.json()

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json({ error: 'Writing samples required' }, { status: 400 })
    }

    console.log(`🎨 Training voice for user ${user.id}...`)
    console.log(`   Samples provided: ${samples.length}`)

    // Combine all samples into one text for analysis
    const combinedText = samples.join('\n\n---SAMPLE DIVIDER---\n\n')

    console.log(`   Total text length: ${combinedText.length} characters`)

    // Use Gemini to analyze writing style
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const analysisPrompt = `You are a writing style analyst. Analyze the following writing samples and extract the author's unique voice characteristics.

WRITING SAMPLES:
${combinedText}

Analyze and provide a JSON response with the following structure:
{
  "tone": "<casual|professional|friendly|technical|humorous|authoritative|conversational>",
  "avgSentenceLength": <number>,
  "vocabularyLevel": "<simple|intermediate|advanced|technical>",
  "useEmojis": <boolean>,
  "emojiFrequency": "<never|rare|moderate|frequent>",
  "useLists": <boolean>,
  "listFrequency": "<never|rare|moderate|frequent>",
  "paragraphStyle": "<short|medium|long>",
  "openingStyle": "<question|statement|hook|anecdote|direct>",
  "closingStyle": "<cta|summary|question|thought>",
  "commonPhrases": ["<phrase1>", "<phrase2>", "<phrase3>"],
  "avoidedWords": ["<word1>", "<word2>"],
  "signatureWords": ["<word1>", "<word2>", "<word3>"],
  "structurePreference": "<narrative|informational|conversational|analytical>",
  "punctuationStyle": "<minimal|moderate|expressive>",
  "useQuestions": <boolean>,
  "personalVoice": "<first-person|second-person|third-person|mix>",
  "energyLevel": "<calm|moderate|energetic|intense>",
  "detailLevel": "<minimal|balanced|detailed|exhaustive>",
  "exampleUsage": "<never|rare|moderate|frequent>"
}

Be precise and base your analysis ONLY on the provided samples. Return ONLY the JSON, no additional text.`

    const result = await model.generateContent(analysisPrompt)
    const response = result.response.text()

    // Parse JSON from response (remove markdown code blocks if present)
    let voiceAnalysis
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        voiceAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', response)
      throw new Error('Failed to analyze writing style')
    }

    console.log(`   ✅ Voice analysis complete:`, JSON.stringify(voiceAnalysis, null, 2))

    // Calculate additional metrics from samples
    const sentences = combinedText.match(/[^.!?]+[.!?]+/g) || []
    const words = combinedText.split(/\s+/)
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(words.length / sentences.length) : 15

    // Build voice profile
    const voiceProfile = {
      trained: true,
      lastTrained: new Date().toISOString(),
      sampleCount: samples.length,
      totalCharacters: combinedText.length,
      styleParameters: {
        tone: voiceAnalysis.tone || 'professional',
        avgSentenceLength: avgWordsPerSentence,
        vocabularyLevel: voiceAnalysis.vocabularyLevel || 'intermediate',
        useEmojis: voiceAnalysis.useEmojis || false,
        emojiFrequency: voiceAnalysis.emojiFrequency || 'never',
        useLists: voiceAnalysis.useLists !== false,
        listFrequency: voiceAnalysis.listFrequency || 'moderate',
        paragraphStyle: voiceAnalysis.paragraphStyle || 'medium',
        openingStyle: voiceAnalysis.openingStyle || 'statement',
        closingStyle: voiceAnalysis.closingStyle || 'summary',
        structurePreference: voiceAnalysis.structurePreference || 'informational',
        punctuationStyle: voiceAnalysis.punctuationStyle || 'moderate',
        useQuestions: voiceAnalysis.useQuestions || false,
        personalVoice: voiceAnalysis.personalVoice || 'third-person',
        energyLevel: voiceAnalysis.energyLevel || 'moderate',
        detailLevel: voiceAnalysis.detailLevel || 'balanced',
        exampleUsage: voiceAnalysis.exampleUsage || 'moderate',
      },
      vocabulary: {
        commonPhrases: voiceAnalysis.commonPhrases || [],
        signatureWords: voiceAnalysis.signatureWords || [],
        avoidedWords: voiceAnalysis.avoidedWords || [],
      },
      trainingExamples: samples.map((sample) => ({
        text: sample.substring(0, 500), // Store first 500 chars
        addedAt: new Date().toISOString(),
      })),
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('users')
      .update({ voice_profile: voiceProfile })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error saving voice profile:', updateError)
      throw updateError
    }

    console.log(`   ✅ Voice profile saved to database`)

    // Add activity feed entry
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: 'voice_trained',
      title: 'Voice Profile Updated',
      description: `Trained with ${samples.length} writing samples`,
      metadata: {
        sampleCount: samples.length,
        tone: voiceProfile.styleParameters.tone,
      },
    })

    return NextResponse.json(
      {
        message: 'Voice profile trained successfully',
        voiceProfile,
        analysis: voiceAnalysis,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Voice training error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to train voice' },
      { status: 500 }
    )
  }
}

/**
 * GET user's current voice profile
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('voice_profile')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        voiceProfile: userData.voice_profile || { trained: false },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Get voice profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get voice profile' },
      { status: 500 }
    )
  }
}
