'use client'

import { useEffect } from 'react'
import { AgentOrchestration } from '@/components/agent-orchestration'
import { useTutorial } from '@/components/tutorial-context'
import { FeatureTutorial, workflowsTutorialSteps } from '@/components/feature-tutorial'

export default function WorkflowsPage() {
  const { 
    isFirstTimeUser, 
    markOnboarded, 
    hasCompletedTutorial, 
    activeTutorial, 
    startTutorial, 
    endTutorial 
  } = useTutorial()

  // Auto-show tutorial if not completed
  useEffect(() => {
    if (!hasCompletedTutorial('workflows')) {
      startTutorial('workflows')
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
      <AgentOrchestration />
      {activeTutorial === 'workflows' && (
        <FeatureTutorial
          featureId="workflows"
          steps={workflowsTutorialSteps}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  )
}
