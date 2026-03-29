'use client'

import { useState, useEffect } from 'react'
import { Copy, Zap, Loader2, Sparkles, ChevronDown, FileText, ArrowRight } from 'lucide-react'
import { useAppState } from '@/components/app-state-context'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const channelOptions = ['LinkedIn', 'Twitter', 'Email', 'Blog', 'Instagram']

const defaultSource = `ContentOS AI Platform

Revolutionary AI-powered content orchestration system designed for enterprise teams. Automate content creation, transformation, and distribution across all channels.

Key Features:
- Agent-based pipeline orchestration
- Knowledge transformation engine  
- Real-time compliance checking
- Multi-channel distribution
- ROI analytics and reporting

Benefits:
- 340% improvement in marketing ROI
- 10x faster content production
- 99.8% system reliability
- Zero manual intervention required`

interface Keyword {
  text: string
  type: string
  position_start: number
  position_end: number
}

interface GeneratedAsset {
  channel: string
  content: string
  format: string
  audience: string
}

export function KnowledgeTransformation() {
  const { state, setAssetData } = useAppState()
  
  // Initialize from persisted state or defaults - with safe fallbacks
  const safeAssets = state?.assets || {}
  const [sourceText, setSourceText] = useState(safeAssets.sourceContent || defaultSource)
  const [keywords, setKeywords] = useState<Keyword[]>(safeAssets.extractedKeywords || [])
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('LinkedIn')
  const [targetAudience, setTargetAudience] = useState('Marketing Professionals')
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>(safeAssets.generatedContent || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isFormatting, setIsFormatting] = useState(false)
  const [formattedContent, setFormattedContent] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Persist state changes
  useEffect(() => {
    setAssetData({
      sourceContent: sourceText,
      extractedKeywords: keywords,
      generatedContent: generatedAssets
    })
  }, [sourceText, keywords, generatedAssets, setAssetData])

  const extractKeywords = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch(`${API_BASE}/extract-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_text: sourceText }),
      })
      const data = await res.json()
      // API returns entities array which we map to keywords
      if (data.success && data.entities) {
        const mappedKeywords = data.entities.map((e: any) => ({
          text: e.text,
          type: e.type,
          position_start: 0,
          position_end: 0
        }))
        setKeywords(mappedKeywords)
      } else {
        setKeywords([])
      }
    } catch (err) {
      console.error('Keyword extraction failed:', err)
      setKeywords([])
    } finally {
      setIsExtracting(false)
    }
  }

  const generateContent = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      const formatMap: Record<string, string> = {
        LinkedIn: 'Professional Post',
        Twitter: 'Tweet Thread',
        Email: 'Email Campaign',
        Blog: 'Blog Article',
        Instagram: 'Instagram Caption',
      }
      const res = await fetch(`${API_BASE}/knowledge-to-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_text: sourceText,
          target_audience: targetAudience,
          target_format: formatMap[selectedChannel] || 'Blog Article',
        }),
      })
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
      const data = await res.json()
      if (data.success && data.content) {
        const newAsset: GeneratedAsset = {
          channel: selectedChannel,
          content: data.content,
          format: data.format || formatMap[selectedChannel] || 'Content',
          audience: data.audience || targetAudience,
        }
        setGeneratedAssets((prev) => [...prev, newAsset])
        setSelectedAsset(newAsset)
      } else {
        setGenerationError(data.error || 'Failed to generate content')
      }
    } catch (err) {
      console.error('Content generation failed:', err)
      setGenerationError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatForChannel = async (content: string, channel: string) => {
    setIsFormatting(true)
    try {
      const res = await fetch(`${API_BASE}/format-for-channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, channel }),
      })
      const data = await res.json()
      if (data.success) {
        setFormattedContent(data.content)
      }
    } catch (err) {
      console.error('Channel formatting failed:', err)
    } finally {
      setIsFormatting(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-primary/20 border-primary/50 text-primary'
      case 'metric': return 'bg-green-500/20 border-green-500/50 text-green-300'
      case 'pain_point': return 'bg-red-500/20 border-red-500/50 text-red-300'
      default: return 'bg-secondary/20 border-secondary/50 text-secondary'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Turn Documents Into Content</h1>
        <p className="text-muted-foreground">Upload a document and create blog posts, social media posts, emails, and more — all automatically.</p>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source Content */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Document</h2>
          <div className="glass rounded-xl border border-border/20">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-80 p-4 bg-transparent text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none"
              placeholder="Paste your document text here..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={extractKeywords}
              disabled={isExtracting || !sourceText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-40"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="text-sm">{isExtracting ? 'Finding topics...' : 'Find Key Topics'}</span>
            </button>
          </div>

          {/* Extracted Keywords */}
          {keywords.length > 0 && (
            <div className="glass rounded-xl p-4 border border-border/20">
              <p className="text-xs text-muted-foreground uppercase mb-3">Key Topics Found ({keywords.length})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeColor(kw.type)}`}
                  >
                    {kw.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Generation Controls + Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Content</h2>
          </div>

          {/* Controls */}
          <div className="glass rounded-xl p-4 border border-border/20 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Who is this for?</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Where will this be published?</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground"
                >
                  {selectedChannel}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-lg border border-border/20 z-20">
                    {channelOptions.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => { setSelectedChannel(ch); setShowDropdown(false) }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-border/10 last:border-0 ${
                          selectedChannel === ch ? 'bg-secondary/20 text-secondary font-semibold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={generateContent}
              disabled={isGenerating || !sourceText.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-40"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="text-sm">{isGenerating ? 'Creating...' : 'Create Content'}</span>
            </button>
            {generationError && (
              <p className="text-xs text-red-400 mt-2">{generationError}</p>
            )}
          </div>

          {/* Generated Assets List */}
          {generatedAssets.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase">Created Content ({generatedAssets.length})</p>
              {generatedAssets.map((asset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full text-left glass rounded-lg p-4 border transition-all ${
                    selectedAsset === asset ? 'border-secondary/50 bg-secondary/10' : 'border-border/20 hover:border-border/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{asset.format}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {asset.channel} · {asset.audience}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(asset.content)
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary/80 hover:bg-secondary text-white rounded text-xs font-medium transition-colors"
                        title="Copy content"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2">{asset.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Asset Detail */}
      {selectedAsset && (
        <div className="glass rounded-xl p-6 border border-primary/30 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary uppercase font-semibold mb-2">Created Content</p>
              <h3 className="text-xl font-bold">{selectedAsset.format}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                For: {selectedAsset.channel} · Audience: {selectedAsset.audience}
              </p>
            </div>
            <button
              onClick={() => formatForChannel(selectedAsset.content, selectedAsset.channel)}
              disabled={isFormatting}
              className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
            >
              {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span className="text-xs font-semibold">Adjust Format</span>
            </button>
          </div>

          <div className="pt-4 border-t border-border/20">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedAsset.content}</p>
          </div>

          {formattedContent && (
            <div className="pt-4 border-t border-border/20">
              <p className="text-xs text-accent uppercase font-semibold mb-2">Adjusted for {selectedAsset.channel}</p>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{formattedContent}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigator.clipboard.writeText(formattedContent || selectedAsset.content)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => { setSelectedAsset(null); setFormattedContent('') }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
