'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, AlertCircle, Globe, Send, Sparkles, ArrowLeftCircle } from 'lucide-react'

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to SocialAI!',
    description: "Now that you're logged in, let's explore how to create amazing content with AI assistance. This tutorial takes just 2 minutes.",
    icon: Sparkles,
  },
  {
    id: 'step1',
    title: 'Create Your First Content',
    description: "Let's start by creating your first piece of content. Go to 'Write New Content' in the sidebar.",
    details: [
      'Navigate to Workflows in the sidebar',
      'Enter your topic (e.g., "AI in Marketing")',
      'Specify your audience (e.g., "Marketing Directors")',
      'Choose a tone and click "Start Writing"',
      'Watch AI generate a complete draft'
    ],
    icon: FileText,
  },
  {
    id: 'step2',
    title: 'Review AI Quality Check',
    description: "AI automatically checks your content against brand guidelines before anything else happens.",
    details: [
      'AI reviews for tone consistency',
      'Flags any problematic phrases',
      'Verifies factual accuracy',
      'Shows you the compliance results'
    ],
    icon: AlertCircle,
  },
  {
    id: 'step3',
    title: 'You Approve or Edit',
    description: "You're in control! Review the content and decide what to do next.",
    details: [
      'Read through the AI-generated draft',
      'See the quality check results',
      'Approve to continue, or edit first',
      'Only approved content moves forward'
    ],
    icon: CheckCircle,
  },
  {
    id: 'step4',
    title: 'AI Translates & Formats',
    description: "Once approved, AI automatically translates and formats your content for different platforms.",
    details: [
      'Automatic translation to multiple languages',
      'Cultural localization included',
      'Formats for LinkedIn, Twitter, blogs, emails',
      'Ready to publish instantly'
    ],
    icon: Globe,
  },
  {
    id: 'step5',
    title: 'Copy & Use Your Content',
    description: "Copy your generated content with one click and use it anywhere you need.",
    details: [
      'Click the Copy button on any generated content',
      'Paste into your publishing platform',
      'All content is brand-approved',
      'Save hours of writing time'
    ],
    icon: Send,
  },
  {
    id: 'finish',
    title: "You're All Set!",
    description: "That's it! You now know how to create professional content with AI assistance. Time to get started!",
    icon: CheckCircle,
  },
]

export default function TutorialPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(false)

  const step = tutorialSteps[currentStep]
  const Icon = step.icon
  const isFirst = currentStep === 0
  const isLast = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLast) {
      setShowTour(true)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSkip = () => {
    setShowTour(true)
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  if (showTour) {
    return <InteractiveTour onComplete={handleFinish} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass rounded-2xl border border-border/20 p-8">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {tutorialSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
          <p className="text-muted-foreground mb-6">{step.description}</p>

          {/* Details List */}
          {step.details && (
            <ul className="text-left space-y-3 max-w-md mx-auto">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={isFirst}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {!isLast && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip Tutorial
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-all"
          >
            {isLast ? 'Start Creating' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function InteractiveTour({ onComplete }: { onComplete: () => void }) {
  const [tourStep, setTourStep] = useState(0)

  const tourSteps = [
    {
      target: 'topic-input',
      title: 'Enter Your Topic',
      description: 'Start by telling us what you want to write about.',
      position: 'bottom',
    },
    {
      target: 'audience-input',
      title: 'Who Is This For?',
      description: 'Specify your target audience so AI can adjust the tone.',
      position: 'bottom',
    },
    {
      target: 'start-button',
      title: 'Start the Process',
      description: 'Click here to begin. AI will write, check, and prepare everything.',
      position: 'top',
    },
    {
      target: 'pipeline',
      title: 'Watch the Progress',
      description: 'See each step as it happens. You\'ll be asked to approve before publishing.',
      position: 'top',
    },
  ]

  return (
    <div className="min-h-screen p-8">
      {/* Mock Workflows Page for Tour */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Content</h1>
          <p className="text-muted-foreground">
            Fill in the details below and AI will write, check, translate, and format your content.
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/20 space-y-4">
          <h2 className="text-lg font-semibold mb-4">What do you want to create?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div data-tour="topic-input" className="relative">
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Topic</label>
              <input
                type="text"
                defaultValue="AI in Marketing"
                className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div data-tour="audience-input" className="relative">
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Audience</label>
              <input
                type="text"
                defaultValue="Marketing Directors"
                className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Tone</label>
              <select className="w-full px-3 py-2 bg-muted/50 border border-border/30 rounded-lg text-sm">
                <option>Professional</option>
              </select>
            </div>
          </div>

          <button
            data-tour="start-button"
            className="flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            Create Content
          </button>
        </div>

        <div data-tour="pipeline" className="glass rounded-xl p-6 border border-border/20">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="flex items-center justify-between">
            {['Write', 'Check', 'Translate', 'Format'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-muted border border-border/30 flex items-center justify-center text-xs text-muted-foreground">
                  {idx + 1}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">{step}</span>
                {idx < 3 && <div className="w-16 h-0.5 bg-border/30 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Tour Overlay */}
        <div 
          className="fixed inset-0 bg-black/60 z-40" 
          onClick={() => {
            if (tourStep < tourSteps.length - 1) {
              setTourStep(tourStep + 1)
            } else {
              onComplete()
            }
          }} 
        />
        
        {/* Tour Tooltip */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-full">
          <div className="glass rounded-xl p-6 border border-primary/30 bg-background/95">
            <h3 className="font-bold mb-2">{tourSteps[tourStep]?.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tourSteps[tourStep]?.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Step {tourStep + 1} of {tourSteps.length}
              </span>
              <button
                onClick={() => {
                  if (tourStep >= tourSteps.length - 1) {
                    onComplete()
                  } else {
                    setTourStep(tourStep + 1)
                  }
                }}
                className="px-4 py-2 bg-primary rounded-lg text-sm font-semibold"
              >
                {tourStep >= tourSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <Link href="/workflows">
          <button className="px-4 py-2 glass border border-border/50 rounded-lg text-sm hover:bg-muted/50 transition-colors">
            Exit Tutorial
          </button>
        </Link>
      </div>
    </div>
  )
}
