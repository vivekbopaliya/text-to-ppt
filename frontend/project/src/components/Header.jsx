import React from 'react'

const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">PPT Generator</h1>
              <p className="text-sm text-gray-400">AI-Powered Presentations</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header