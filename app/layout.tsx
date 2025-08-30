import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { FloatingActionButton } from '@/components/floating-action-button'
import { ParticleBackground } from '@/components/particle-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Elite Events | Premium Event Platform',
  description: 'Discover and register for exclusive events. Seminars, concerts, standups, sports, technical events and more all in one place.',
  keywords: 'events, seminars, concerts, standup comedy, technical events, sports, conferences, workshops',
  authors: [{ name: 'Elite Events Team' }],
  openGraph: {
    title: 'Elite Events',
    description: 'Premium event discovery and booking platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#00ffff',
          colorBackground: '#0a0a0a',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.8)',
        },
        elements: {
          formButtonPrimary: 'cyber-button',
          card: 'glassmorphism bg-black/80 backdrop-blur-md border border-white/20',
          userButtonPopoverCard: 'bg-black/90 backdrop-blur-md border border-white/20',
          userButtonPopoverActionButton: 'text-white hover:bg-white/10',
          userButtonPopoverActionButtonText: 'text-white',
          userButtonPopoverFooter: 'hidden',
          userPreviewTextContainer: 'text-white',
          userPreviewMainIdentifier: 'text-white',
          userPreviewSecondaryIdentifier: 'text-white/80',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-black text-white overflow-x-hidden`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ParticleBackground />
            <div className="relative z-10">
              {children}
            </div>
            <FloatingActionButton />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}