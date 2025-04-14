import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-bold text-text sm:text-5xl md:text-6xl">
            <span className="block">Technology</span>
            <span className="block text-primary">Trend Analysis</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover emerging technology trends and generate AI-powered marketing content tailored to your organization.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
