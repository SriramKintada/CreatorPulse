"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, FileText, X, Sparkles, Check } from "lucide-react"

interface VoiceTrainerProps {
  onComplete?: (voiceProfile: any) => void
  showSkip?: boolean
}

export function VoiceTrainer({ onComplete, showSkip = false }: VoiceTrainerProps) {
  const [samples, setSamples] = useState<string[]>([])
  const [currentSample, setCurrentSample] = useState("")
  const [training, setTraining] = useState(false)
  const [voiceProfile, setVoiceProfile] = useState<any>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newSamples: string[] = []

    for (const file of Array.from(files)) {
      // Only accept text files
      if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
        toast.error(`${file.name} is not a text file`)
        continue
      }

      try {
        const text = await file.text()
        if (text.length < 100) {
          toast.error(`${file.name} is too short (minimum 100 characters)`)
          continue
        }
        if (text.length > 50000) {
          toast.warning(`${file.name} is too long, using first 50,000 characters`)
          newSamples.push(text.substring(0, 50000))
        } else {
          newSamples.push(text)
        }
      } catch (error) {
        toast.error(`Failed to read ${file.name}`)
      }
    }

    if (newSamples.length > 0) {
      setSamples((prev) => [...prev, ...newSamples])
      toast.success(`Added ${newSamples.length} writing sample(s)`)
    }

    // Reset file input
    e.target.value = ''
  }

  const handleAddManualSample = () => {
    if (!currentSample.trim()) {
      toast.error('Please enter some text')
      return
    }

    if (currentSample.length < 100) {
      toast.error('Sample too short (minimum 100 characters)')
      return
    }

    setSamples((prev) => [...prev, currentSample])
    setCurrentSample('')
    toast.success('Sample added!')
  }

  const handleRemoveSample = (index: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== index))
    toast.success('Sample removed')
  }

  const handleTrain = async () => {
    if (samples.length === 0) {
      toast.error('Add at least one writing sample')
      return
    }

    try {
      setTraining(true)
      toast.loading('Analyzing your writing style...')

      const response = await fetch('/api/train-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Training failed')
      }

      const data = await response.json()

      toast.success('Voice profile trained successfully!')
      setVoiceProfile(data.voiceProfile)

      if (onComplete) {
        onComplete(data.voiceProfile)
      }
    } catch (error: any) {
      console.error('Training error:', error)
      toast.error(error.message || 'Failed to train voice')
    } finally {
      setTraining(false)
    }
  }

  if (voiceProfile) {
    // Show success state
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold">Voice Profile Trained! ✅</h3>
          <p className="text-muted-foreground">
            AI has learned your writing style from {samples.length} sample(s)
          </p>

          <div className="grid grid-cols-2 gap-4 text-left mt-6">
            <div className="p-3 bg-card border rounded">
              <p className="text-xs text-muted-foreground">Tone</p>
              <p className="font-medium capitalize">{voiceProfile.styleParameters.tone}</p>
            </div>
            <div className="p-3 bg-card border rounded">
              <p className="text-xs text-muted-foreground">Avg Sentence Length</p>
              <p className="font-medium">{voiceProfile.styleParameters.avgSentenceLength} words</p>
            </div>
            <div className="p-3 bg-card border rounded">
              <p className="text-xs text-muted-foreground">Vocabulary</p>
              <p className="font-medium capitalize">{voiceProfile.styleParameters.vocabularyLevel}</p>
            </div>
            <div className="p-3 bg-card border rounded">
              <p className="text-xs text-muted-foreground">Energy Level</p>
              <p className="font-medium capitalize">{voiceProfile.styleParameters.energyLevel}</p>
            </div>
          </div>

          {voiceProfile.vocabulary?.signatureWords?.length > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 text-left">
              <p className="text-sm font-medium mb-2">Your Signature Words:</p>
              <div className="flex flex-wrap gap-2">
                {voiceProfile.vocabulary.signatureWords.map((word: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-primary/10 rounded text-xs">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Train Your Writing Voice</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upload past newsletters or articles you've written. AI will learn your unique style,
          tone, and word choices to make newsletters sound like YOU (not generic AI).
        </p>
      </div>

      {/* Upload zone */}
      <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <div className="text-center">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".txt,.md,text/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload Writing Samples</p>
              <p className="text-sm text-muted-foreground">
                .txt or .md files (minimum 100 characters each)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Choose Files
            </Button>
          </label>
        </div>
      </Card>

      {/* Manual input */}
      <div>
        <Label>Or Paste Text Directly</Label>
        <textarea
          className="w-full min-h-[150px] p-3 border rounded-lg bg-background text-foreground resize-y font-mono text-sm"
          placeholder="Paste an article, newsletter, or blog post you've written..."
          value={currentSample}
          onChange={(e) => setCurrentSample(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            {currentSample.length} / 100 characters minimum
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddManualSample}
            disabled={currentSample.length < 100}
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Sample
          </Button>
        </div>
      </div>

      {/* Samples list */}
      {samples.length > 0 && (
        <div>
          <Label className="mb-2 block">Writing Samples ({samples.length})</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {samples.map((sample, index) => (
              <Card key={index} className="p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium">Sample {index + 1}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {sample.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sample.length.toLocaleString()} characters
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => handleRemoveSample(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <h3 className="font-medium mb-2">📝 Tips for Better Training:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✅ Upload 3-5 writing samples (more = better accuracy)</li>
          <li>✅ Use content you actually wrote (not AI-generated)</li>
          <li>✅ Include different types (newsletters, articles, posts)</li>
          <li>✅ Minimum 100 characters per sample</li>
          <li>⚠️ Don't upload someone else's writing</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {showSkip && (
          <Button
            variant="ghost"
            onClick={() => onComplete?.(null)}
            disabled={training}
          >
            Skip for Now
          </Button>
        )}
        <Button
          onClick={handleTrain}
          disabled={samples.length === 0 || training}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {training ? 'Training...' : `Train Voice (${samples.length} samples)`}
        </Button>
      </div>
    </div>
  )
}
