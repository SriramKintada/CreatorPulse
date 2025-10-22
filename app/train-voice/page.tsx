"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { VoiceTrainer } from "@/components/voice-training/voice-trainer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Sparkles, RefreshCw, FileText, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TrainVoicePage() {
  const [voiceProfile, setVoiceProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTrainer, setShowTrainer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadVoiceProfile()
  }, [])

  const loadVoiceProfile = async () => {
    try {
      const response = await fetch('/api/train-voice')
      if (!response.ok) throw new Error('Failed to load voice profile')

      const data = await response.json()
      setVoiceProfile(data.voiceProfile)

      if (!data.voiceProfile?.trained) {
        setShowTrainer(true)
      }
    } catch (error) {
      console.error('Error loading voice profile:', error)
      toast.error('Failed to load voice profile')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrainVoice = () => {
    setShowTrainer(true)
  }

  const handleTrainingComplete = (profile: any) => {
    setVoiceProfile(profile)
    setShowTrainer(false)
    loadVoiceProfile() // Refresh
    toast.success('Voice profile updated! Future newsletters will use your style.')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading voice profile...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Training</h1>
          <p className="text-muted-foreground">
            Teach AI to write in YOUR unique style, not generic robot language
          </p>
        </div>

        {/* Current voice profile status */}
        {voiceProfile?.trained && !showTrainer && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Your Voice Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Last trained: {new Date(voiceProfile.lastTrained).toLocaleDateString()}
                  </p>
                </div>
                <Button onClick={handleRetrainVoice} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retrain
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Tone</p>
                  <p className="font-medium capitalize">{voiceProfile.styleParameters?.tone}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Sentence Length</p>
                  <p className="font-medium">{voiceProfile.styleParameters?.avgSentenceLength} words</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Vocabulary</p>
                  <p className="font-medium capitalize">{voiceProfile.styleParameters?.vocabularyLevel}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Energy</p>
                  <p className="font-medium capitalize">{voiceProfile.styleParameters?.energyLevel}</p>
                </div>
              </div>

              {/* Detailed preferences */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Style Preferences</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Opening: {voiceProfile.styleParameters?.openingStyle}</li>
                    <li>• Closing: {voiceProfile.styleParameters?.closingStyle}</li>
                    <li>• Emojis: {voiceProfile.styleParameters?.useEmojis ? voiceProfile.styleParameters.emojiFrequency : 'Never'}</li>
                    <li>• Lists: {voiceProfile.styleParameters?.listFrequency}</li>
                    <li>• Questions: {voiceProfile.styleParameters?.useQuestions ? 'Yes' : 'No'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Voice Traits</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Personal voice: {voiceProfile.styleParameters?.personalVoice}</li>
                    <li>• Paragraph style: {voiceProfile.styleParameters?.paragraphStyle}</li>
                    <li>• Punctuation: {voiceProfile.styleParameters?.punctuationStyle}</li>
                    <li>• Examples: {voiceProfile.styleParameters?.exampleUsage}</li>
                    <li>• Detail level: {voiceProfile.styleParameters?.detailLevel}</li>
                  </ul>
                </div>
              </div>

              {/* Signature words */}
              {voiceProfile.vocabulary?.signatureWords?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Your Signature Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.vocabulary.signatureWords.map((word: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Common phrases */}
              {voiceProfile.vocabulary?.commonPhrases?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Common Phrases You Use</h3>
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.vocabulary.commonPhrases.map((phrase: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-accent/10 rounded text-sm">
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Training data stats */}
            <Card className="p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Training Data
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">{voiceProfile.sampleCount}</p>
                  <p className="text-xs text-muted-foreground">Writing Samples</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(voiceProfile.totalCharacters / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Characters Analyzed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(voiceProfile.totalCharacters / 5 / 250)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pages Equivalent</p>
                </div>
              </div>
            </Card>

            {/* How it works */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-medium mb-3">🤖 How Voice Training Works</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✅ AI analyzes your writing samples to extract patterns</li>
                <li>✅ Learns your tone, vocabulary, structure, and style</li>
                <li>✅ Applies these preferences when generating newsletters</li>
                <li>✅ Still follows anti-slop rules (factual, source attribution)</li>
                <li>✅ Retrain anytime with more samples to improve accuracy</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Voice trainer */}
        {showTrainer && (
          <VoiceTrainer
            onComplete={handleTrainingComplete}
            showSkip={voiceProfile?.trained}
          />
        )}

        {/* First time empty state */}
        {!voiceProfile?.trained && !showTrainer && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Train Your Voice</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Upload writing samples so AI can learn YOUR unique style instead of sounding like generic robot content.
            </p>
            <Button onClick={() => setShowTrainer(true)} size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Start Training
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
