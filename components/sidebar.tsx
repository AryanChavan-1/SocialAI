'use client'

import { useState } from 'react'
import { 
  Workflow,
  Brain,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'orchestration', label: 'Agent Orchestration', icon: Workflow },
    { id: 'knowledge', label: 'Knowledge Transform', icon: Brain },
    { id: 'intelligence', label: 'Intelligence', icon: BarChart3 },
    { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 glass rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 glass-lg border-r border-border/20 transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 mt-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ContentOS</h1>
              <p className="text-xs text-muted-foreground">AI Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onViewChange(id)
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === id
                    ? 'bg-primary/20 text-primary border border-primary/50 glow-purple'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>

          {/* System Status */}
          <div className="glass rounded-lg p-4 mb-6 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent">SYSTEM ACTIVE</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All agents operational. Processing 127 workflows.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-4 border-t border-border/20">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-xs">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-xs">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
