'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Clock, Zap, Loader2, Send, Globe, LinkIcon } from 'lucide-react'

const API_BASE = 'http://localhost:8001'

interface ContentBlock {
  id: string
  day: number
  hour: number
  title: string
  channel: string
  scheduled: boolean
  content?: string
}

const channels = ['LinkedIn', 'Twitter', 'Email', 'Blog', 'Instagram']
const colors: Record<string, string> = {
  LinkedIn: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  Twitter: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  Email: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  Blog: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  Instagram: 'bg-pink-500/20 border-pink-500/50 text-pink-300',
}

// Generate initial calendar data
const generateCalendarData = (): ContentBlock[] => {
  const data: ContentBlock[] = []
  let id = 0
  const weekDays = [1, 2, 3, 4, 5, 6, 7]
  const timeSlots = [9, 12, 15, 18]
  const titles = ['Product Launch', 'Team Update', 'Industry Insights', 'Weekly Digest', 'Case Study']

  for (const day of weekDays) {
    for (const hour of timeSlots) {
      // ~60% chance of content in each slot
      if ((day * 7 + hour * 3 + id) % 10 > 3) {
        data.push({
          id: String(id++),
          day,
          hour,
          title: titles[(day + hour) % titles.length],
          channel: channels[(day + hour * 2) % channels.length],
          scheduled: (day + hour) % 3 !== 0,
        })
      }
    }
  }
  return data
}

export function CampaignCalendar() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [contentBlocks, setContentBlocks] = useState(generateCalendarData)
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isDistributing, setIsDistributing] = useState(false)
  const [distributionResult, setDistributionResult] = useState<string | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Brand Guidelines Ingestion
  const [brandUrl, setBrandUrl] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [brandResult, setBrandResult] = useState<string | null>(null)

  // New campaign form
  const [newTitle, setNewTitle] = useState('')
  const [newChannel, setNewChannel] = useState('LinkedIn')
  const [newContent, setNewContent] = useState('')
  const [newDay, setNewDay] = useState(1)
  const [newHour, setNewHour] = useState(9)

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = [9, 12, 15, 18]
  const hourLabels = ['9 AM', '12 PM', '3 PM', '6 PM']

  const getBlocksForSlot = (day: number, hour: number) => {
    const blocks = selectedFilter
      ? contentBlocks.filter((b) => b.day === day && b.hour === hour && b.channel === selectedFilter)
      : contentBlocks.filter((b) => b.day === day && b.hour === hour)
    return blocks
  }

  const filteredBlocks = selectedFilter
    ? contentBlocks.filter((b) => b.channel === selectedFilter)
    : contentBlocks

  const distributeContent = async () => {
    if (!selectedBlock?.content && !selectedBlock?.title) return
    setIsDistributing(true)
    setDistributionResult(null)
    try {
      const res = await fetch(`${API_BASE}/distribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedBlock.content || selectedBlock.title,
          channel: selectedBlock.channel,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDistributionResult(data.content)
      }
    } catch (err) {
      console.error('Distribution failed:', err)
    } finally {
      setIsDistributing(false)
    }
  }

  const ingestBrandGuidelines = async () => {
    if (!brandUrl.trim()) return
    setIsIngesting(true)
    setBrandResult(null)
    try {
      const res = await fetch(`${API_BASE}/ingest-brand-guidelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: brandUrl }),
      })
      const data = await res.json()
      if (data.success) {
        setBrandResult(`✓ Ingested guidelines: ${data.brand_name || 'Unknown'}. ${data.guidelines?.tone || ''} ${data.guidelines?.voice || ''}`)
      }
    } catch (err) {
      setBrandResult('Failed to ingest brand guidelines')
    } finally {
      setIsIngesting(false)
    }
  }

  const addNewCampaign = () => {
    if (!newTitle.trim()) return
    const block: ContentBlock = {
      id: String(Date.now()),
      day: newDay,
      hour: newHour,
      title: newTitle,
      channel: newChannel,
      scheduled: true,
      content: newContent,
    }
    setContentBlocks((prev) => [...prev, block])
    setShowAddModal(false)
    setNewTitle('')
    setNewContent('')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 gradient-text">Campaign Calendar</h1>
        <p className="text-muted-foreground">Plan, schedule, and distribute content across all channels</p>
      </div>

      {/* Brand Guidelines Ingestion */}
      <div className="glass rounded-xl p-4 border border-border/20">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-secondary" />
          <h3 className="text-sm font-semibold">Ingest Brand Guidelines</h3>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border/30 rounded-lg">
            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              value={brandUrl}
              onChange={(e) => setBrandUrl(e.target.value)}
              placeholder="https://company.com/brand-guidelines"
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={ingestBrandGuidelines}
            disabled={isIngesting || !brandUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 rounded-lg text-secondary transition-colors text-sm font-medium disabled:opacity-40"
          >
            {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>{isIngesting ? 'Ingesting...' : 'Ingest'}</span>
          </button>
        </div>
        {brandResult && (
          <p className="text-xs text-green-300 mt-2">{brandResult}</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold min-w-40 text-center">Week of March 24</h2>
          <button className="p-2 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>{selectedFilter || 'All Channels'}</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 glass rounded-lg border border-border/20 z-10">
                <button
                  onClick={() => { setSelectedFilter(null); setShowFilterDropdown(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-border/10 ${
                    selectedFilter === null ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Channels
                </button>
                {channels.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => { setSelectedFilter(channel); setShowFilterDropdown(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors border-b border-border/10 last:border-0 ${
                      selectedFilter === channel ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors text-sm font-medium"
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-xl p-6 border border-border/20 overflow-x-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
            <div className="w-24" />
            {dayLabels.map((day, idx) => (
              <div key={day} className="text-center">
                <p className="text-sm font-semibold text-foreground">{day}</p>
                <p className="text-xs text-muted-foreground mt-1">Mar {24 + idx}</p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour, hIdx) => (
            <div key={hour} className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
              <div className="w-24 flex items-start pt-2">
                <p className="text-xs font-semibold text-muted-foreground">{hourLabels[hIdx]}</p>
              </div>

              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const blocks = getBlocksForSlot(day, hour)
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="glass rounded-lg p-3 border border-border/20 min-h-28 space-y-2"
                  >
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => { setSelectedBlock(block); setDistributionResult(null) }}
                        className={`w-full text-left p-2 rounded-md border transition-all text-xs ${colors[block.channel] || 'bg-gray-500/20 border-gray-500/50 text-gray-300'}`}
                      >
                        <p className="font-semibold line-clamp-1">{block.title}</p>
                        <p className="text-xs opacity-75 line-clamp-1">{block.channel}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {block.scheduled ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span className="text-xs opacity-75">{block.scheduled ? 'Auto' : 'Manual'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Block Detail */}
      {selectedBlock && (
        <div className="glass rounded-xl p-6 border border-primary/30 glow-purple space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary uppercase font-semibold mb-2">Content Details</p>
              <h3 className="text-xl font-bold">{selectedBlock.title}</h3>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${colors[selectedBlock.channel]}`}>
              {selectedBlock.channel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SCHEDULED FOR</p>
              <p className="text-lg font-bold text-primary">
                {dayLabels[(selectedBlock.day - 1) % 7]}, {selectedBlock.hour > 12 ? selectedBlock.hour - 12 : selectedBlock.hour}:00 {selectedBlock.hour >= 12 ? 'PM' : 'AM'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">MODE</p>
              <p className="text-lg font-bold text-secondary">{selectedBlock.scheduled ? 'Auto-Scheduled' : 'Manual'}</p>
            </div>
          </div>

          {selectedBlock.content && (
            <div className="pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground mb-2">CONTENT</p>
              <p className="text-sm text-foreground/80">{selectedBlock.content}</p>
            </div>
          )}

          <button
            onClick={distributeContent}
            disabled={isDistributing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg text-accent transition-colors font-semibold disabled:opacity-40"
          >
            {isDistributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isDistributing ? 'Distributing...' : `Distribute to ${selectedBlock.channel}`}</span>
          </button>

          {distributionResult && (
            <div className="glass rounded-lg p-4 border border-green-500/30 bg-green-500/10">
              <p className="text-xs text-green-300 uppercase font-semibold mb-2">Distribution Preview</p>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{distributionResult}</p>
            </div>
          )}
        </div>
      )}

      {/* New Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-glass" onClick={() => setShowAddModal(false)} />
          <div className="relative glass rounded-xl p-8 border border-primary/30 max-w-lg w-full glow-purple space-y-4">
            <h3 className="text-xl font-bold">New Campaign</h3>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                placeholder="Campaign title"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
                placeholder="Campaign content..."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-1 block">Channel</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none"
                >
                  {channels.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-1 block">Day</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none"
                >
                  {dayLabels.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-1 block">Time</label>
                <select
                  value={newHour}
                  onChange={(e) => setNewHour(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none"
                >
                  {hours.map((h, i) => <option key={h} value={h}>{hourLabels[i]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 glass rounded-lg border border-border/20 hover:border-border/40 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addNewCampaign}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors text-sm font-semibold disabled:opacity-40"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Scheduled This Week</p>
          <p className="text-3xl font-bold gradient-text">
            {filteredBlocks.filter((b) => b.scheduled).length}
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Manual Reviews Pending</p>
          <p className="text-3xl font-bold text-secondary">
            {filteredBlocks.filter((b) => !b.scheduled).length}
          </p>
        </div>
        <div className="glass rounded-xl p-6 border border-border/20">
          <p className="text-xs text-muted-foreground uppercase mb-2">Total Content Assets</p>
          <p className="text-3xl font-bold text-accent">{filteredBlocks.length}</p>
        </div>
      </div>
    </div>
  )
}
