import { redirect } from 'next/navigation'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-text mb-6">Welcome</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Technology Trends</h2>
              <p className="text-text">Analyze current technology trends in your industry.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Content Generator</h2>
              <p className="text-text">Generate AI-powered marketing content.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Company Profile</h2>
              <p className="text-text">Update your company information and preferences.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
