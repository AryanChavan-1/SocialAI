'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  BarChart3,
  Brain,
  Calendar,
  Sparkles,
  Zap,
  Play
} from 'lucide-react'

export default function HomeDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header - Simplified */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Content Dashboard</h1>
          <p className="text-muted-foreground">
            Create, manage, and publish content with AI assistance.
          </p>
        </div>
        <Link href="/tutorial">
          <button className="flex items-center gap-2 px-4 py-2 glass border border-border/30 rounded-lg hover:bg-muted/50 transition-colors">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Tutorial</span>
          </button>
        </Link>
      </div>

      {/* Quick Stats - Plain Language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Content Created Today</h3>
            <div className="p-2 bg-primary/20 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">3</h2>
            <span className="text-sm text-green-400">articles</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Saved 6 hours vs writing manually
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
            <div className="p-2 bg-accent/20 rounded-lg">
              <Clock className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">2</h2>
            <span className="text-sm text-accent">active</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Waiting for your approval
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Brand Checks Passed</h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">100%</h2>
            <span className="text-sm text-green-400">this week</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All content follows your guidelines
          </p>
        </div>
      </div>

      {/* Quick Actions - What Each Feature Actually Does */}
      <div>
        <h2 className="text-xl font-bold mb-4">What Would You Like To Do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/workflows"
            className="group glass p-5 rounded-xl border border-border/20 hover:border-primary/50 transition-all hover:-translate-y-1 block"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Write New Content</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              AI writes an article, checks it, translates it, and prepares it for publishing.
            </p>
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              Start Writing <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            href="/assets"
            className="group glass p-5 rounded-xl border border-border/20 hover:border-accent/50 transition-all hover:-translate-y-1 block"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1 group-hover:text-accent transition-colors">Repurpose a Document</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              Upload a PDF or doc and turn it into blog posts, social media, or emails.
            </p>
            <span className="text-xs font-semibold text-accent flex items-center gap-1">
              Upload Document <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            href="/analytics"
            className="group glass p-5 rounded-xl border border-border/20 hover:border-secondary/50 transition-all hover:-translate-y-1 block"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 text-secondary group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1 group-hover:text-secondary transition-colors">See What's Working</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              Get insights on which content performs best and suggestions to improve.
            </p>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">
              View Insights <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            href="/schedule"
            className="group glass p-5 rounded-xl border border-border/20 hover:border-orange-500/50 transition-all hover:-translate-y-1 block"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4 text-orange-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1 group-hover:text-orange-400 transition-colors">Schedule Posts</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              Plan when your content goes live on LinkedIn, Twitter, and other channels.
            </p>
            <span className="text-xs font-semibold text-orange-400 flex items-center gap-1">
              Open Calendar <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Plain English */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Happening */}
        <div className="glass rounded-xl border border-border/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-400">All systems running</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm">Draft completed for "AI in Marketing"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" /> 2 mins ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm">Brand check passed for Q3 Report</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" /> 15 mins ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm">Spanish translation in progress</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" /> 42 mins ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Needs Your Attention */}
        <div className="glass rounded-xl border border-amber-500/30 p-6 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-6 text-amber-400">
            <Zap className="w-5 h-5" />
            <h2 className="text-xl font-bold">Needs Your Review</h2>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-amber-500/30 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nothing to review right now</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              When AI finishes checking content, it'll appear here for your approval before publishing.
            </p>
            <Link href="/workflows">
              <button className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 transition-colors font-semibold">
                Create New Content
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
