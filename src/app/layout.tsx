import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ui/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { AppInitializationService } from '@/lib/app-initialization'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StrongHODL',
  description: 'Self-hosted Bitcoin portfolio tracker for true HODLers',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

// Initialize app services on server startup
// This runs server-side only, ensuring background services start with the app
if (typeof window === 'undefined') {
  AppInitializationService.initialize().catch(error => {
    console.error('Failed to initialize app services:', error);
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 