'use client'

import { useEffect } from 'react'
import { KnowledgeTransformation } from '@/components/knowledge-transformation'
import { useTutorial } from '@/components/tutorial-context'
import { FeatureTutorial, assetsTutorialSteps } from '@/components/feature-tutorial'

export default function AssetsPage() {
  const { 
    hasCompletedTutorial, 
    activeTutorial, 
    startTutorial, 
    endTutorial 
  } = useTutorial()

  // Auto-show tutorial if not completed
  useEffect(() => {
    if (!hasCompletedTutorial('assets')) {
      startTutorial('assets')
    }
  }, [hasCompletedTutorial, startTutorial])

  const handleTutorialComplete = () => {
    endTutorial()
  }

  const handleTutorialSkip = () => {
    endTutorial()
  }

  return (
    <>
      <KnowledgeTransformation />
      {activeTutorial === 'assets' && (
        <FeatureTutorial
          featureId="assets"
          steps={assetsTutorialSteps}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  )
}
