'use client'

import { useEffect } from 'react'
import { IntelligenceDashboard } from '@/components/intelligence-dashboard'
import { useTutorial } from '@/components/tutorial-context'
import { FeatureTutorial, analyticsTutorialSteps } from '@/components/feature-tutorial'

export default function AnalyticsPage() {
  const { 
    hasCompletedTutorial, 
    activeTutorial, 
    startTutorial, 
    endTutorial 
  } = useTutorial()

  useEffect(() => {
    if (!hasCompletedTutorial('analytics')) {
      startTutorial('analytics')
    }
  }, [hasCompletedTutorial, startTutorial])

  return (
    <>
      <IntelligenceDashboard />
      {activeTutorial === 'analytics' && (
        <FeatureTutorial
          featureId="analytics"
          steps={analyticsTutorialSteps}
          onComplete={endTutorial}
          onSkip={endTutorial}
        />
      )}
    </>
  )
}
