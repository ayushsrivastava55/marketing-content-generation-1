import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { auth } from '@/auth'
import AuthProvider from '@/components/AuthProvider'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marketing Technology Trend Analysis',
  description: 'Analyze technology trends for marketing purposes',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(auth)

  return (
    <html lang="en">
      <AuthProvider session={session}>
        <body className={inter.className}>
          <nav className="fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between items-center h-full">
                <div className="flex-shrink-0 font-bold text-primary text-xl">
                  <Link href="/">TrendAnalyzer</Link>
                </div>
                <div className="hidden md:flex space-x-8">
                  {session ? (
                    <>
                      <Link href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">Dashboard</Link>
                      <Link href="/trends" className="text-gray-600 hover:text-primary transition-colors">Trends</Link>
                      <Link href="/content" className="text-gray-600 hover:text-primary transition-colors">Content</Link>
                      <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">Profile</Link>
                      <Link href="/migrate" className="text-gray-600 hover:text-primary transition-colors">Migration</Link>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center space-x-4">
                  {session ? (
                    <Link
                      href="/api/auth/signout"
                      className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                    >
                      Sign Out
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">
            {children}
          </main>
        </body>
      </AuthProvider>
    </html>
  )
}
