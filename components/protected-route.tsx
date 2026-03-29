'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth-context'

const publicRoutes = ['/', '/login', '/register', '/landing']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
      
      // If not logged in and not on a public route, redirect to login
      if (!user && !isPublicRoute) {
        router.push('/login')
      }
      
      // If logged in and on login/register, redirect to dashboard
      if (user && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow access to public routes without auth
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
  if (!user && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
