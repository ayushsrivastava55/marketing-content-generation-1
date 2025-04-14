import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <nav className="fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex-shrink-0 font-bold text-primary text-xl">
                <Link href="/">TrendAnalyzer</Link>
              </div>
              <div className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/trends" className="text-gray-600 hover:text-primary transition-colors">Trends</Link>
                <Link href="/content" className="text-gray-600 hover:text-primary transition-colors">Content</Link>
                <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">Profile</Link>
                <Link href="/migrate" className="text-gray-600 hover:text-primary transition-colors">Migrate</Link>
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
