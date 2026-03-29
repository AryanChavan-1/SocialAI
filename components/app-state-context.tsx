'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface AppState {
  workflows: Record<string, any>
  assets: {
    sourceContent: string
    extractedKeywords: any[]
    generatedContent: any[]
  }
  analytics: {
    insights: any[]
    strategy: any
    govResult: any
  }
}

interface AppStateContextType {
  state: AppState
  setWorkflowData: (workflowId: string, data: any) => void
  setAssetData: (data: Partial<AppState['assets']>) => void
  setAnalyticsData: (data: Partial<AppState['analytics']>) => void
  clearAllState: () => void
}

const STORAGE_KEY = 'socialai-app-state'

const defaultState: AppState = {
  workflows: {},
  assets: {
    sourceContent: '',
    extractedKeywords: [],
    generatedContent: []
  },
  analytics: {
    insights: [],
    strategy: null,
    govResult: null
  }
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setState(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse saved state:', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isLoaded])

  const setWorkflowData = useCallback((workflowId: string, data: any) => {
    setState(prev => ({
      ...prev,
      workflows: {
        ...prev.workflows,
        [workflowId]: data
      }
    }))
  }, [])

  const setAssetData = useCallback((data: Partial<AppState['assets']>) => {
    setState(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        ...data
      }
    }))
  }, [])

  const setAnalyticsData = useCallback((data: Partial<AppState['analytics']>) => {
    setState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        ...data
      }
    }))
  }, [])

  const clearAllState = useCallback(() => {
    setState(defaultState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return (
    <AppStateContext.Provider
      value={{
        state,
        setWorkflowData,
        setAssetData,
        setAnalyticsData,
        clearAllState
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}
