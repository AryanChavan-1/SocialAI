'use client'

import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  ChevronRight,
  Loader2,
  Zap,
  Shield,
} from 'lucide-react'

const API_BASE = 'http://localhost:8001'

interface Insight {
  pattern: string
  confidence: string
  suggested_action: string
}

interface StrategyAction {
  action_type: string
  description: string
  parameters: Record<string, string>
}

interface GovernanceResult {
  status: string
  violations: Array<{ type: string; text: string; suggestion: string }>
}

const sampleEngagementData = [
  { channel: 'LinkedIn', format: 'video', impressions: 12400, clicks: 840, shares: 230 },
  { channel: 'LinkedIn', format: 'text', impressions: 3200, clicks: 120, shares: 45 },
  { channel: 'Twitter', format: 'text', impressions: 8900, clicks: 320, shares: 890 },
  { channel: 'Twitter', format: 'image', impressions: 15600, clicks: 1200, shares: 1560 },
  { channel: 'Email', format: 'newsletter', impressions: 5400, clicks: 430, shares: 12 },
  { channel: 'Blog', format: 'long_form', impressions: 2800, clicks: 560, shares: 120 },
]

export function IntelligenceDashboard() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [strategy, setStrategy] = useState<StrategyAction | null>(null)
  const [isStrategizing, setIsStrategizing] = useState(false)

  // Governance
  const [govContent, setGovContent] = useState('')
  const [govGuidelines, setGovGuidelines] = useState('Professional tone. No superlatives. Include disclaimers on claims.')
  const [govResult, setGovResult] = useState<GovernanceResult | null>(null)
  const [isCheckingGov, setIsCheckingGov] = useState(false)

  // Activity log
  const [activityLog, setActivityLog] = useState<Array<{ time: string; level: string; msg: string }>>([])

  const addLog = (level: string, msg: string) => {
    setActivityLog((prev) => [
      { time: new Date().toLocaleTimeString(), level, msg },
      ...prev,
    ].slice(0, 20))
  }

  const analyzeInsights = async () => {
    setIsAnalyzing(true)
    addLog('info', 'Starting engagement data analysis...')
    try {
      const res = await fetch(`${API_BASE}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement_data: sampleEngagementData }),
      })
      const data = await res.json()
      if (data.success && data.insights) {
        setInsights(data.insights)
        addLog('info', `Analysis complete: ${data.insights.length} insights discovered`)
      } else {
        addLog('warning', 'Analysis returned no insights')
      }
    } catch (err) {
      addLog('error', `Analysis failed: ${err}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateStrategy = async (insight: Insight) => {
    setSelectedInsight(insight)
    setIsStrategizing(true)
    addLog('info', `Generating strategy for: "${insight.pattern.substring(0, 50)}..."`)
    try {
      const res = await fetch(`${API_BASE}/strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insight }),
      })
      const data = await res.json()
      if (data.success && data.action) {
        setStrategy(data.action)
        addLog('info', `Strategy generated: ${data.action.action_type}`)
      }
    } catch (err) {
      addLog('error', `Strategy generation failed: ${err}`)
    } finally {
      setIsStrategizing(false)
    }
  }

  const checkGovernance = async () => {
    if (!govContent.trim()) return
    setIsCheckingGov(true)
    addLog('info', 'Running brand governance check...')
    try {
      const res = await fetch(`${API_BASE}/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: govContent, brand_guidelines: govGuidelines }),
      })
      const data = await res.json()
      if (data.success) {
        setGovResult(data.result)
        const vCount = data.result.violations?.length || 0
        addLog(
          vCount > 0 ? 'warning' : 'info',
          `Governance check: ${data.result.status.toUpperCase()} — ${vCount} violation(s)`
        )
      }
    } catch (err) {
      addLog('error', `Governance check failed: ${err}`)
    } finally {
      setIsCheckingGov(false)
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
      case 'warning': return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      default: return <Activity className="w-3.5 h-3.5 text-green-400 shrink-0" />
    }
  }

  const getConfidenceColor = (c: string) => {
    switch (c) {
      case 'high': return 'bg-green-500/20 border-green-500/50 text-green-300'
      case 'medium': return 'bg-amber-500/20 border-amber-500/50 text-amber-300'
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Intelligence & Insights</h1>
          <p className="text-muted-foreground">Analyze engagement, generate strategy, and monitor brand governance</p>
        </div>
        <button
          onClick={analyzeInsights}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors font-semibold disabled:opacity-40"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Engagement'}</span>
        </button>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Activity Log */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Activity Log</h2>
          <div className="glass rounded-xl p-4 border border-border/20 h-96 overflow-y-auto font-mono text-xs">
            {activityLog.length === 0 ? (
              <p className="text-muted-foreground text-center mt-8">Run an analysis to see activity...</p>
            ) : (
              <div className="space-y-2.5">
                {activityLog.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-muted-foreground shrink-0">[{log.time}]</span>
                    <div className="flex gap-1.5 items-start flex-1 min-w-0">
                      {getLogIcon(log.level)}
                      <span className="text-foreground/80 break-words">{log.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Insights + Strategy */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Insights & Strategy</h2>
          <div className="glass rounded-xl p-4 border border-border/20 h-96 overflow-y-auto space-y-3">
            {insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Click &quot;Analyze Engagement&quot; to discover patterns</p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <button
                  key={idx}
                  onClick={() => generateStrategy(insight)}
                  className={`w-full text-left glass rounded-lg p-3 border transition-all group ${
                    selectedInsight === insight ? 'border-primary/50 bg-primary/10' : 'border-border/20 hover:border-border/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="font-semibold text-sm flex-1">{insight.pattern}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{insight.suggested_action}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Strategy Result */}
          {strategy && (
            <div className="glass rounded-lg p-4 border border-accent/30 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <p className="text-xs text-accent uppercase font-semibold">Autonomous Action</p>
              </div>
              <p className="text-sm font-semibold">{strategy.description}</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 border border-accent/50 text-accent text-xs">
                {strategy.action_type}
              </span>
              {isStrategizing && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
            </div>
          )}
        </div>

        {/* Right: Brand Governance */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Brand Governance</h2>
          <div className="glass rounded-xl p-4 border border-border/20 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Content to Check</label>
              <textarea
                value={govContent}
                onChange={(e) => setGovContent(e.target.value)}
                placeholder="Paste content to check against brand guidelines..."
                className="w-full h-28 px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Brand Guidelines</label>
              <textarea
                value={govGuidelines}
                onChange={(e) => setGovGuidelines(e.target.value)}
                className="w-full h-20 px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              onClick={checkGovernance}
              disabled={isCheckingGov || !govContent.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 rounded-lg text-secondary transition-colors font-medium disabled:opacity-40"
            >
              {isCheckingGov ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span className="text-sm">{isCheckingGov ? 'Checking...' : 'Check Governance'}</span>
            </button>
          </div>

          {/* Governance Result */}
          {govResult && (
            <div className={`glass rounded-xl p-4 border space-y-3 ${
              govResult.status === 'pass' ? 'border-green-500/30' : 'border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {govResult.status === 'pass' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <span className={`text-sm font-semibold ${
                  govResult.status === 'pass' ? 'text-green-300' : 'text-amber-300'
                }`}>
                  {govResult.status === 'pass' ? 'Content Approved' : 'Violations Found'}
                </span>
              </div>
              {govResult.violations && govResult.violations.length > 0 && (
                <div className="space-y-2">
                  {govResult.violations.map((v, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-300 font-semibold">[{v.type}]</span>{' '}
                      <span className="text-foreground/80">&quot;{v.text}&quot;</span>
                      <p className="text-muted-foreground mt-0.5">→ {v.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase">Insights Found</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold gradient-text">{insights.length}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase">Strategies Gen</p>
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">{strategy ? 1 : 0}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase">Gov Checks</p>
            <Shield className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-bold text-secondary">{govResult ? 1 : 0}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase">Log Events</p>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{activityLog.length}</p>
        </div>
      </div>
    </div>
  )
}
