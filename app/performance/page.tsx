export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Performance Metrics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">Load Time</h2>
            <p className="text-3xl font-bold text-blue-600">250ms</p>
            <p className="text-sm text-gray-500 mt-2">Average page load time</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">Response Time</h2>
            <p className="text-3xl font-bold text-green-600">120ms</p>
            <p className="text-sm text-gray-500 mt-2">Average API response time</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">Error Rate</h2>
            <p className="text-3xl font-bold text-yellow-600">0.05%</p>
            <p className="text-sm text-gray-500 mt-2">Total request error rate</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">User Satisfaction</h2>
            <p className="text-3xl font-bold text-purple-600">94%</p>
            <p className="text-sm text-gray-500 mt-2">Based on user feedback</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Resource Utilization</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">CPU</span>
                <span className="text-sm text-gray-600">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Memory</span>
                <span className="text-sm text-gray-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-gray-600">28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 