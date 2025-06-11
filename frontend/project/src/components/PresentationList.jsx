import React from 'react'
import { useDeletePresentation } from '../hooks/useDeletePresentation'

const PresentationList = ({ presentations, onDelete, onError }) => {
  const deleteMutation = useDeletePresentation()

  const handleDelete = async (presentationId) => {
    if (!confirm('Are you sure you want to delete this presentation?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(presentationId)
      onDelete(presentationId)
    } catch (error) {
      onError(error.message || 'Failed to delete presentation')
    }
  }

  if (presentations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No presentations yet</h3>
          <p className="text-gray-500 text-sm">
            Your generated presentations will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">
        Your Presentations ({presentations.length})
      </h3>
      
      <div className="space-y-3">
        {presentations.map((presentation) => (
          <div 
            key={presentation.id} 
            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-200 truncate">
                  {presentation.topic}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(presentation.created_at).toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    presentation.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    presentation.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    presentation.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {presentation.status}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {presentation.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {presentation.status === 'completed' && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/download/${presentation.id}`, {
                          method: 'GET',
                        });
                        
                        if (!response.ok) {
                          throw new Error('Download failed');
                        }
                        
                        // Get the blob from the response
                        const blob = await response.blob();
                        
                        // Create a URL for the blob
                        const url = window.URL.createObjectURL(blob);
                        
                        // Create a temporary link element
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `presentation_${presentation.id}.pptx`;
                        
                        // Append to body, click and remove
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up the URL
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download error:', error);
                        onError('Failed to download presentation');
                      }
                    }}
                    className="text-primary-400 hover:text-primary-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(presentation.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full spinner"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PresentationList