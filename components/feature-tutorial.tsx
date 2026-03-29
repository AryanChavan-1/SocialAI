'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, X, FileText, Brain, BarChart3, Calendar, Sparkles } from 'lucide-react'

interface TutorialStep {
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface FeatureTutorialProps {
  featureId: string
  steps: TutorialStep[]
  onComplete: () => void
  onSkip: () => void
}

export function FeatureTutorial({ featureId, steps, onComplete, onSkip }: FeatureTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onSkip} />
      
      {/* Tutorial card */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="glass rounded-xl p-6 border border-primary/30 bg-background/95 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs text-primary uppercase font-semibold">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="text-lg font-bold mt-1">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {!isLast && (
                <button
                  onClick={onSkip}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isLast ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Feature-specific tutorial steps
export const workflowsTutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Content Creation',
    description: 'This page helps you create new content from scratch. AI will write, check, translate, and format it for you.',
  },
  {
    title: 'Enter Your Topic',
    description: 'Start by telling us what you want to write about. Be specific for better results.',
    target: 'topic-input',
  },
  {
    title: 'Who Is This For?',
    description: 'Specify your target audience so AI can adjust the tone and style appropriately.',
    target: 'audience-input',
  },
  {
    title: 'Watch the Magic Happen',
    description: 'AI will write your content, check it, translate it, and prepare it for publishing. You\'ll approve each step.',
    target: 'pipeline',
  },
]

export const assetsTutorialSteps: TutorialStep[] = [
  {
    title: 'Turn Documents Into Content',
    description: 'Have a PDF, report, or existing document? Upload it here and we\'ll turn it into blog posts, social media, emails, and more.',
  },
  {
    title: 'Paste Your Content',
    description: 'Copy and paste your document text here. AI will analyze it and find the key topics.',
    target: 'source-input',
  },
  {
    title: 'Choose Where to Publish',
    description: 'Select which platform you want content for - LinkedIn, Twitter, blog, or email.',
    target: 'channel-select',
  },
]

export const analyticsTutorialSteps: TutorialStep[] = [
  {
    title: 'See What\'s Working',
    description: 'This page shows you insights about your content performance and helps you improve.',
  },
  {
    title: 'Get AI Insights',
    description: 'Click the "Get Insights" button to analyze your content and discover what performs best.',
    target: 'insights-button',
  },
  {
    title: 'Check Brand Guidelines',
    description: 'Paste any content here to verify it follows your brand voice and guidelines.',
    target: 'brand-check',
  },
]

export const scheduleTutorialSteps: TutorialStep[] = [
  {
    title: 'Plan Your Content Calendar',
    description: 'Schedule when your content goes live. See everything that\'s queued up for publishing.',
  },
  {
    title: 'View Upcoming Posts',
    description: 'See all scheduled content at a glance. Click any item to edit or reschedule.',
    target: 'calendar-view',
  },
]
