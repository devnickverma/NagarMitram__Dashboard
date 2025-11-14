import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'
import { FloatingChatbot } from '@/components/ChatWidget'
import { AuthProvider } from '@/lib/auth/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NagarMitra Admin Panel - AI-Powered Municipal Management',
  description: 'Manage civic issues with AI-powered insights and real-time tracking',
  keywords: 'civic, issues, municipal, management, AI, dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <FloatingChatbot />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}