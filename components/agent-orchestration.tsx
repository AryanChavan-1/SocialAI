'use client'

import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Play,
  Loader2,
  ThumbsUp,
  Globe,
  Send,
  Copy,
} from 'lucide-react'
import { useAppState } from '@/components/app-state-context'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type WorkflowStatus =
  | 'idle'
  | 'initialized'
  | 'drafting'
  | 'checking_compliance'
  | 'pending_approval'
  | 'approved'
  | 'localizing'
  | 'distributing'
  | 'completed'
  | 'failed'

interface StepResult {
  step: string
  result: Record<string, unknown>
  timestamp: string
}

interface PipelineNode {
  id: string
  name: string
  status: 'active' | 'completed' | 'pending' | 'warning' | 'idle'
  icon: typeof Activity
}

export function AgentOrchestration() {
  const { state, setWorkflowData } = useAppState()
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('idle')
  const [stepResults, setStepResults] = useState<StepResult[]>([])
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Form state
  const [topic, setTopic] = useState('AI in Enterprise Content Operations')
  const [audience, setAudience] = useState('Marketing Directors')
  const [tone, setTone] = useState('professional')

  // Derive pipeline node statuses from workflow status
  const getNodeStatus = (
    nodeStep: string
  ): 'active' | 'completed' | 'pending' | 'warning' | 'idle' => {
    const order = ['drafting', 'checking_compliance', 'localizing', 'distributing']
    const currentIdx = order.indexOf(workflowStatus)
    const nodeIdx = order.indexOf(nodeStep)

    if (workflowStatus === 'idle') return 'idle'
    if (workflowStatus === 'completed') return 'completed'
    if (workflowStatus === 'failed') return 'idle'
    if (workflowStatus === 'pending_approval') {
      if (nodeStep === 'checking_compliance') return 'warning'
      if (nodeIdx < 2) return 'completed'
      return 'idle'
    }
    if (nodeStep === order[currentIdx]) return 'active'
    if (nodeIdx < currentIdx) return 'completed'
    return 'idle'
  }

  const pipelineNodes: PipelineNode[] = [
    { id: 'drafting', name: 'Writing', status: getNodeStatus('drafting'), icon: Activity },
    {
      id: 'checking_compliance',
      name: 'Checking',
      status: getNodeStatus('checking_compliance'),
      icon: AlertCircle,
    },
    { id: 'localizing', name: 'Translating', status: getNodeStatus('localizing'), icon: Globe },
    {
      id: 'distributing',
      name: 'Formatting',
      status: getNodeStatus('distributing'),
      icon: Send,
    },
  ]

  // Connect Socket.io
  useEffect(() => {
    const sio = io(API_BASE, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    sio.on('connect', () => {
      console.log('Socket.io connected:', sio.id)
    })

    sio.on('disconnect', () => {
      console.log('Socket.io disconnected')
    })

    sio.on('joined', (data: { room: string }) => {
      console.log('Joined room:', data.room)
    })

    sio.on('workflow_update', (data: { workflow_id: string; status: string }) => {
      console.log('Workflow update:', data.status)
      setWorkflowStatus(data.status as WorkflowStatus)
      if (data.status === 'pending_approval') {
        setShowApprovalModal(true)
      }
    })

    sio.on(
      'step_completed',
      (data: { workflow_id: string; step: string; result: Record<string, unknown> }) => {
        console.log('Step completed:', data.step)
        setStepResults((prev) => [
          ...prev,
          {
            step: data.step,
            result: data.result,
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
      }
    )

    sio.on('workflow_error', (data: { workflow_id: string; error: string }) => {
      console.error('Workflow error:', data.error)
      setWorkflowStatus('failed')
    })

    setSocket(sio)

    return () => {
      sio.disconnect()
    }
  }, [])

  const startWorkflow = useCallback(async () => {
    if (!socket) return
    setIsStarting(true)
    setStepResults([])
    setWorkflowStatus('initialized')

    try {
      const res = await fetch(`${API_BASE}/orchestrate-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          audience,
          tone,
          brand_guidelines: 'Be factual. Avoid hype. Maintain professional tone.',
        }),
      })
      const data = await res.json()

      if (data.success) {
        setWorkflowId(data.workflow_id)
        socket.emit('join_workflow', { workflow_id: data.workflow_id })
      }
    } catch (err) {
      console.error('Failed to start workflow:', err)
      setWorkflowStatus('failed')
    } finally {
      setIsStarting(false)
    }
  }, [socket, topic, audience, tone])

  const approveContent = useCallback(() => {
    if (!socket || !workflowId) return
    socket.emit('approve_content', { workflow_id: workflowId })
    setShowApprovalModal(false)
  }, [socket, workflowId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 border-green-500/50 text-green-300'
      case 'warning':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300'
      case 'completed':
        return 'bg-primary/20 border-primary/50 text-primary'
      case 'pending':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getOverallStatusLabel = () => {
    switch (workflowStatus) {
      case 'idle':
        return 'Ready to Start'
      case 'drafting':
        return 'AI is Writing...'
      case 'checking_compliance':
        return 'Checking Content...'
      case 'pending_approval':
        return 'Ready for Your Review'
      case 'approved':
        return 'Approved — Continuing...'
      case 'localizing':
        return 'Translating...'
      case 'distributing':
        return 'Formatting for Publishing...'
      case 'completed':
        return 'All Done ✓'
      case 'failed':
        return 'Something Went Wrong'
      default:
        return 'Starting...'
    }
  }

  // Persist workflow state changes
  useEffect(() => {
    if (workflowId) {
      setWorkflowData(workflowId, {
        status: workflowStatus,
        stepResults,
        topic,
        audience,
        tone
      })
    }
  }, [workflowId, workflowStatus, stepResults, topic, audience, tone, setWorkflowData])

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Content</h1>
          <p className="text-muted-foreground">
            AI will write, check, translate, and format your content. You review before publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
              workflowStatus === 'completed'
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : workflowStatus === 'failed'
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : workflowStatus === 'idle'
                    ? 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                    : 'bg-primary/20 border-primary/50 text-primary'
            }`}
          >
            {getOverallStatusLabel()}
          </span>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass rounded-xl p-6 border border-border/20 space-y-4">
        <h2 className="text-lg font-semibold mb-2">What do you want to write about?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase mb-1 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. AI in Marketing"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase mb-1 block">Who is this for?</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. Marketing Directors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase mb-1 block">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
        </div>
        <button
          onClick={startWorkflow}
          disabled={isStarting || (workflowStatus !== 'idle' && workflowStatus !== 'completed' && workflowStatus !== 'failed')}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStarting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isStarting ? 'Starting...' : 'Create Content'}</span>
        </button>
      </div>

      {/* Pipeline Visualization */}
      <div className="glass rounded-xl p-8 border border-border/20">
        <h2 className="text-lg font-semibold mb-6">Progress</h2>
        <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
          {pipelineNodes.map((node, idx) => (
            <div key={node.id} className="flex items-center flex-1">
              {/* Node */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(
                    node.status
                  )} ${node.status === 'active' ? 'animate-pulse' : ''} ${
                    node.status === 'warning' ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' : ''
                  }`}
                >
                  {getStatusIcon(node.status)}
                </div>
                <span className="text-xs font-medium text-center">{node.name}</span>
              </div>

              {/* Connector line */}
              {idx < pipelineNodes.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    node.status === 'completed'
                      ? 'bg-primary/50'
                      : 'bg-border/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Results Feed */}
      {stepResults.length > 0 && (
        <div className="glass rounded-xl p-6 border border-border/20">
          <h2 className="text-lg font-semibold mb-4">What's Happening</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stepResults.map((sr, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start p-3 rounded-lg bg-muted/30 border border-border/10"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold capitalize">{sr.step} Agent</span>
                    <span className="text-xs text-muted-foreground">{sr.timestamp}</span>
                  </div>
                  {/* Show content preview if available */}
                  {sr.result && 'content' in sr.result && (() => {
                    const c = String(sr.result.content ?? '')
                    return c.length > 0 ? (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Content Preview:</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(c)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-secondary/80 hover:bg-secondary text-white rounded text-xs font-medium transition-colors"
                            title="Copy content"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-foreground/70 line-clamp-3 bg-muted/30 p-2 rounded">
                          {c.substring(0, 200)}...
                        </p>
                      </div>
                    ) : null
                  })()}
                  {/* Show check status if present */}
                  {sr.result && 'result' in sr.result && sr.result.result && typeof sr.result.result === 'object' && (
                    <div className="mt-1">
                      {(() => {
                        const inner = sr.result.result as { status?: string }
                        const status = inner.status ?? 'unknown'
                        return (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              status === 'pass'
                                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            }`}
                          >
                            Check: {status.toUpperCase()}
                          </span>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Content Pieces Created</p>
          <p className="text-3xl font-bold text-primary">
            {workflowStatus === 'completed' ? '1' : '0'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">This session</p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Steps Completed</p>
          <p className="text-3xl font-bold text-secondary">{stepResults.length}</p>
          <p className="text-xs text-muted-foreground mt-2">Of 4 total steps</p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Status</p>
          <p className="text-3xl font-bold text-accent">
            {workflowStatus === 'completed' ? 'Done' : workflowStatus === 'idle' ? 'Ready' : 'In Progress'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Current</p>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-glass" />

          {/* Modal */}
          <div className="relative glass rounded-xl p-8 border border-primary/30 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-2">Review Your Content</h3>
            <p className="text-sm text-muted-foreground mb-6">
              AI has finished checking your content. Review the results below, then approve to continue with translation and formatting.
            </p>

            {/* Show check results */}
            {stepResults.find((s) => s.step === 'compliance') && (
              <div className="glass rounded-lg p-4 bg-amber-500/10 border border-amber-500/30 mb-6 space-y-2">
                <p className="text-sm font-semibold text-amber-200">Check Results:</p>
                {(() => {
                  const complianceResult = stepResults.find((s) => s.step === 'compliance')
                  const result = (complianceResult?.result as Record<string, unknown>)
                    ?.result as Record<string, unknown>
                  const violations = (result?.violations || []) as Array<{
                    type: string
                    text: string
                    suggestion: string
                  }>
                  if (violations.length === 0)
                    return (
                      <p className="text-xs text-green-300">✓ No violations found. Content is clean.</p>
                    )
                  return violations.map((v, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-amber-300 font-semibold">[{v.type}]</span>{' '}
                      <span className="text-foreground/80">"{v.text}"</span>
                      <span className="text-muted-foreground"> → {v.suggestion}</span>
                    </div>
                  ))
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2.5 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors text-sm font-medium"
              >
                Review Later
              </button>
              <button
                onClick={approveContent}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors text-sm font-semibold"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
