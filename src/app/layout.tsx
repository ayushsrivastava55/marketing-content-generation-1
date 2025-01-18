import type { Metadata } from 'next'
import { Inter, Open_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Marketing Technology Trend Analysis',
  description: 'Analyze technology trends for marketing purposes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${openSans.variable} ${jetbrainsMono.variable} font-body`}>
        <nav className="fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex-shrink-0 font-sans font-bold text-primary text-xl">
                TrendAnalyzer
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="/dashboard" className="text-text hover:text-primary transition-colors">Dashboard</a>
                <a href="/trends" className="text-text hover:text-primary transition-colors">Trends</a>
                <a href="/content" className="text-text hover:text-primary transition-colors">Content</a>
                <a href="/profile" className="text-text hover:text-primary transition-colors">Profile</a>
              </div>
              <div className="flex items-center space-x-4">
                <button className="md:hidden">
                  <svg className="h-6 w-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
