import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ContentOS AI - Enterprise Content Orchestration',
  description: 'AI-powered content orchestration platform for enterprises. Automate content creation, transformation, and distribution across all channels.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { TutorialProvider } from '@/components/tutorial-context'
import { AppStateProvider } from '@/components/app-state-context'
import { AuthProvider } from '@/components/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Sidebar } from '@/components/sidebar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased text-foreground bg-background">
        <AuthProvider>
          <AppStateProvider>
            <TutorialProvider>
              <ProtectedRoute>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 ml-0 lg:ml-64 overflow-y-auto min-h-screen">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen pb-16">
                      {children}
                    </div>
                    <Analytics />
                  </main>
                </div>
              </ProtectedRoute>
            </TutorialProvider>
          </AppStateProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
