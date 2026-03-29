'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

interface TutorialContextType {
  completedTutorials: string[]
  activeTutorial: string | null
  markTutorialComplete: (tutorialId: string) => void
  startTutorial: (tutorialId: string) => void
  endTutorial: () => void
  hasCompletedTutorial: (tutorialId: string) => boolean
  isFirstTimeUser: boolean
  markOnboarded: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Get user-specific storage key
  const getStorageKey = () => {
    if (user?.id) {
      return `socialai-tutorials-${user.id}`
    }
    return 'socialai-tutorials-guest'
  }

  const getOnboardedKey = () => {
    if (user?.id) {
      return `socialai-onboarded-${user.id}`
    }
    return 'socialai-onboarded-guest'
  }

  // Load from localStorage when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey())
      if (saved) {
        setCompletedTutorials(JSON.parse(saved))
      } else {
        setCompletedTutorials([])
      }
      setIsLoaded(true)
    }
  }, [user?.id])

  // Save to localStorage when completed tutorials change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(), JSON.stringify(completedTutorials))
    }
  }, [completedTutorials, isLoaded, user?.id])

  const markTutorialComplete = (tutorialId: string) => {
    setCompletedTutorials((prev) => {
      if (prev.includes(tutorialId)) return prev
      return [...prev, tutorialId]
    })
  }

  const startTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId)
  }

  const endTutorial = () => {
    if (activeTutorial) {
      markTutorialComplete(activeTutorial)
    }
    setActiveTutorial(null)
  }

  const hasCompletedTutorial = (tutorialId: string) => {
    return completedTutorials.includes(tutorialId)
  }

  const isFirstTimeUser = !hasCompletedTutorial('workflows') && 
                          !hasCompletedTutorial('assets') && 
                          !hasCompletedTutorial('analytics') &&
                          !hasCompletedTutorial('schedule')

  const markOnboarded = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getOnboardedKey(), 'true')
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <TutorialContext.Provider
      value={{
        completedTutorials,
        activeTutorial,
        markTutorialComplete,
        startTutorial,
        endTutorial,
        hasCompletedTutorial,
        isFirstTimeUser,
        markOnboarded,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}
