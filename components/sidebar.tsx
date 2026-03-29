'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './auth-context'
import { 
  Workflow,
  Brain,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  LayoutDashboard
} from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/workflows', label: 'Create Content', icon: Workflow },
    { id: '/assets', label: 'Repurpose Documents', icon: Brain },
    { id: '/analytics', label: 'View Insights', icon: BarChart3 },
    { id: '/schedule', label: 'Calendar', icon: Calendar },
  ]

  const closeSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsOpen(false)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 glass rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 glass-lg border-r border-border/20 transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link href="/dashboard" onClick={closeSidebar}>
            <div className="flex items-center gap-3 mb-10 mt-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text leading-tight">SocialAI</h1>
                <p className="text-xs text-muted-foreground">Content Assistant</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = pathname === id
              return (
                <Link
                  key={id}
                  href={id}
                  onClick={closeSidebar}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/50 glow-purple'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* System Status */}
          <div className="glass rounded-lg p-4 mb-6 border border-accent/30 bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-semibold text-accent">SYSTEM ACTIVE</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase">99.9% Uptime</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational. Ready to help you create content.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-4 border-t border-border/20 mt-auto">
            <button className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-medium uppercase">Settings</span>
            </button>
            <button 
              onClick={logout}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-medium uppercase">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
