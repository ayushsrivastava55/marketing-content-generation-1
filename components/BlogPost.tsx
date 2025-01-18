import { format } from 'date-fns'

interface BlogPostProps {
  headline: string
  body: string
  cta: string
  category: string
  lastUpdated: string
  technology: {
    name: string
    version: string
    popularity: number
    growthRate: number
  }
  technicalDetails: {
    requirements: string[]
    integrations: string[]
    limitations: string[]
  }
  companyAdoptions: Array<{
    name: string
    useCase: string
    impact: string
  }>
}

const BlogPost: React.FC<BlogPostProps> = ({
  headline,
  body,
  cta,
  category,
  lastUpdated,
  technology,
  technicalDetails,
  companyAdoptions
}) => {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {category}
          </span>
          <span className="text-gray-500 text-sm">
            {format(new Date(lastUpdated), 'MMM d, yyyy')}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{headline}</h2>
        
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">{technology.name} {technology.version}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Popularity:</span>
                <div className="ml-2 bg-gray-200 w-24 h-2 rounded-full">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${technology.popularity}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Growth:</span>
                <div className="ml-2 bg-gray-200 w-24 h-2 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${technology.growthRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: body }} />
        
        {companyAdoptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Enterprise Adoptions</h3>
            <div className="space-y-4">
              {companyAdoptions.map((adoption, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{adoption.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{adoption.useCase}</p>
                  <p className="text-sm text-green-600 mt-1">{adoption.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {technicalDetails && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <ul className="text-sm text-gray-600 list-disc pl-4">
                  {technicalDetails.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Integrations</h4>
                <ul className="text-sm text-gray-600 list-disc pl-4">
                  {technicalDetails.integrations.map((int, index) => (
                    <li key={index}>{int}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Limitations</h4>
                <ul className="text-sm text-gray-600 list-disc pl-4">
                  {technicalDetails.limitations.map((lim, index) => (
                    <li key={index}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
          {cta}
        </div>
      </div>
    </article>
  )
}

export default BlogPost
