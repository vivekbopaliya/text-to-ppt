import React, { useEffect } from 'react'

const ErrorBanner = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 10000) // Auto-close after 10 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-red-400 font-medium">Error</h4>
            <p className="text-red-300 text-sm mt-1">
              {message}
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ErrorBanner