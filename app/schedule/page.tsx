'use client'

import { useEffect } from 'react'
import { CampaignCalendar } from '@/components/campaign-calendar'
import { useTutorial } from '@/components/tutorial-context'
import { FeatureTutorial, scheduleTutorialSteps } from '@/components/feature-tutorial'

export default function SchedulePage() {
  const { 
    hasCompletedTutorial, 
    activeTutorial, 
    startTutorial, 
    endTutorial 
  } = useTutorial()

  useEffect(() => {
    if (!hasCompletedTutorial('schedule')) {
      startTutorial('schedule')
    }
  }, [hasCompletedTutorial, startTutorial])

  return (
    <>
      <CampaignCalendar />
      {activeTutorial === 'schedule' && (
        <FeatureTutorial
          featureId="schedule"
          steps={scheduleTutorialSteps}
          onComplete={endTutorial}
          onSkip={endTutorial}
        />
      )}
    </>
  )
}
