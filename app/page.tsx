'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AgentOrchestration } from '@/components/agent-orchestration'
import { KnowledgeTransformation } from '@/components/knowledge-transformation'
import { IntelligenceDashboard } from '@/components/intelligence-dashboard'
import { CampaignCalendar } from '@/components/campaign-calendar'

export default function Home() {
  const [activeView, setActiveView] = useState('orchestration')

  const renderView = () => {
    switch (activeView) {
      case 'orchestration':
        return <AgentOrchestration />
      case 'knowledge':
        return <KnowledgeTransformation />
      case 'intelligence':
        return <IntelligenceDashboard />
      case 'calendar':
        return <CampaignCalendar />
      default:
        return <AgentOrchestration />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64 overflow-y-auto min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </div>

        {/* Footer spacer */}
        <div className="h-8" />
      </main>
    </div>
  )
}
