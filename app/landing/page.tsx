'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, Globe, Send, CheckCircle, Play } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Content Creation</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Create Content in{' '}
            <span className="text-primary">Minutes</span>,
            <br />
            Not Hours
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Let AI write, check, translate, and format your content. 
            You review and approve at each step. No jargon, just results.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <button className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-lg transition-all hover:scale-105">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="flex items-center gap-2 px-8 py-4 glass border border-border/50 rounded-xl font-semibold text-lg hover:bg-muted/50 transition-all">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              icon={FileText}
              title="AI Writes"
              description="Tell us your topic and audience. AI drafts your content in seconds."
            />
            <StepCard
              number="2"
              icon={CheckCircle}
              title="AI Checks"
              description="Content is verified against your brand guidelines automatically."
            />
            <StepCard
              number="3"
              icon={Globe}
              title="AI Translates"
              description="Instantly adapt your content for different languages and regions."
            />
            <StepCard
              number="4"
              icon={Send}
              title="You Publish"
              description="Format for any platform - LinkedIn, Twitter, blog, or email."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            One platform for your entire content workflow. No more juggling tools.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Content Creation"
              description="From blog posts to social media, AI writes it all based on your brief."
            />
            <FeatureCard
              title="Brand Compliance"
              description="Automatic checks ensure every piece matches your voice and guidelines."
            />
            <FeatureCard
              title="Global Reach"
              description="Translate and localize content for any market with one click."
            />
            <FeatureCard
              title="Multi-Channel"
              description="Format content perfectly for LinkedIn, Twitter, Instagram, and more."
            />
            <FeatureCard
              title="Human Approval"
              description="You're in control. Review and approve at every important step."
            />
            <FeatureCard
              title="Knowledge Base"
              description="Turn documents, PDFs, and reports into fresh content."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of marketers and content creators saving hours every week.
          </p>
          <Link href="/workflows">
            <button className="px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-lg transition-all hover:scale-105">
              Create Your First Content
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function StepCard({ number, icon: Icon, title, description }: {
  number: string
  icon: typeof FileText
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 glass rounded-xl border border-border/20 hover:border-primary/30 transition-all hover:-translate-y-1">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
