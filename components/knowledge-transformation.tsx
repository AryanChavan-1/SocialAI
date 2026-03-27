'use client'

import { useState } from 'react'
import { Copy, Zap, Loader2, Sparkles, ChevronDown, FileText, ArrowRight } from 'lucide-react'

const API_BASE = 'http://localhost:8001'

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
  const [sourceText, setSourceText] = useState(defaultSource)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('LinkedIn')
  const [targetAudience, setTargetAudience] = useState('Marketing Professionals')
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)
  const [formattedContent, setFormattedContent] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const extractKeywords = async () => {
    setIsExtracting(true)
    try {
      const res = await fetch(`${API_BASE}/extract-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_text: sourceText }),
      })
      const data = await res.json()
      if (data.success) {
        setKeywords(data.keywords)
      }
    } catch (err) {
      console.error('Keyword extraction failed:', err)
    } finally {
      setIsExtracting(false)
    }
  }

  const generateContent = async () => {
    setIsGenerating(true)
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
      const data = await res.json()
      if (data.success) {
        const newAsset: GeneratedAsset = {
          channel: selectedChannel,
          content: data.content,
          format: data.format,
          audience: data.audience,
        }
        setGeneratedAssets((prev) => [...prev, newAsset])
        setSelectedAsset(newAsset)
      }
    } catch (err) {
      console.error('Content generation failed:', err)
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
        <h1 className="text-3xl font-bold mb-2 gradient-text">Knowledge Transformation</h1>
        <p className="text-muted-foreground">Transform source content into optimized assets for any channel — powered by AI agents</p>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source Content */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Source Content</h2>
          <div className="glass rounded-xl border border-border/20">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-80 p-4 bg-transparent text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none"
              placeholder="Paste your source content here..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={extractKeywords}
              disabled={isExtracting || !sourceText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors disabled:opacity-40"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="text-sm">{isExtracting ? 'Extracting...' : 'Extract Keywords'}</span>
            </button>
          </div>

          {/* Extracted Keywords */}
          {keywords.length > 0 && (
            <div className="glass rounded-xl p-4 border border-border/20">
              <p className="text-xs text-muted-foreground uppercase mb-3">Extracted Entities ({keywords.length})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeColor(kw.type)}`}
                  >
                    {kw.text}
                    <span className="ml-1 opacity-60">({kw.type})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Generation Controls + Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generate Asset</h2>
          </div>

          {/* Controls */}
          <div className="glass rounded-xl p-4 border border-border/20 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Channel / Format</label>
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 rounded-lg text-secondary transition-colors font-medium disabled:opacity-40"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="text-sm">{isGenerating ? 'Generating...' : 'Generate Content'}</span>
            </button>
          </div>

          {/* Generated Assets List */}
          {generatedAssets.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase">Generated Assets ({generatedAssets.length})</p>
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
                    <Sparkles className="w-4 h-4 text-accent" />
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
        <div className="glass rounded-xl p-6 border border-primary/30 glow-purple space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary uppercase font-semibold mb-2">Generated Asset</p>
              <h3 className="text-xl font-bold">{selectedAsset.format}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Channel: {selectedAsset.channel} · Audience: {selectedAsset.audience}
              </p>
            </div>
            <button
              onClick={() => formatForChannel(selectedAsset.content, selectedAsset.channel)}
              disabled={isFormatting}
              className="flex items-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg text-accent transition-colors"
            >
              {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span className="text-xs font-semibold">Re-format for Channel</span>
            </button>
          </div>

          <div className="pt-4 border-t border-border/20">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedAsset.content}</p>
          </div>

          {formattedContent && (
            <div className="pt-4 border-t border-border/20">
              <p className="text-xs text-accent uppercase font-semibold mb-2">Channel-Optimized Version</p>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{formattedContent}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigator.clipboard.writeText(formattedContent || selectedAsset.content)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 rounded-lg text-secondary transition-colors font-medium text-sm"
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
