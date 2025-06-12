import { usePresentationStatus } from '../hooks/usePresentationStatus'
import PropTypes from 'prop-types';

const StatusDisplay = ({ presentationId, onComplete, onError }) => {
  const { data: status, error } = usePresentationStatus(presentationId, {
    onComplete,
    onError: (err) => onError(err.message)
  })

  if (error) {
    return (
      <div className="card">
        <div className="status-indicator status-error">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error.message}</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="card">
        <div className="status-indicator status-pending">
          <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full spinner"></div>
          <span>Initializing...</span>
        </div>
      </div>
    )
  }

  const getStatusDisplay = () => {
    switch (status.status) {
      case 'pending':
        return {
          className: 'status-pending',
          icon: <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full spinner"></div>,
          text: 'Queued for processing...'
        }
      case 'processing':
        return {
          className: 'status-processing pulse-glow',
          icon: <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full spinner"></div>,
          text: 'Generating your presentation...'
        }
      case 'completed':
        return {
          className: 'status-completed',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: 'Presentation ready!'
        }
      case 'failed':
        return {
          className: 'status-error',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: status.error || 'Generation failed'
        }
      default:
        return {
          className: 'status-pending',
          icon: <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full spinner"></div>,
          text: 'Processing...'
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          Generation Status
        </h3>
        <span className="text-sm text-gray-400 font-mono">
          ID: {presentationId}
        </span>
      </div>

      <div className={`status-indicator ${statusDisplay.className} mb-4`}>
        {statusDisplay.icon}
        <span>{statusDisplay.text}</span>
      </div>

      {status.status === 'processing' && (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">AI is working on your presentation</p>
              <p className="text-xs text-gray-400">This usually takes 30-60 seconds</p>
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Analyzing topic and generating content structure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Creating slide content and selecting images</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Finalizing presentation format</span>
            </div>
          </div>
        </div>
      )}

      {status.status === 'completed' && (
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              try {
                // First get the presentation status to get the download URL
                const statusResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/status/${presentationId}`);
                if (!statusResponse.ok) {
                  throw new Error('Failed to get presentation status');
                }
                
                const statusData = await statusResponse.json();
                if (!statusData.download_url) {
                  throw new Error('Download URL not available');
                }

                // Now download using the Cloudinary URL
                const response = await fetch(statusData.download_url);
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
                link.download = `presentation_${presentationId}.pptx`;
                
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
            className="btn-primary flex items-center space-x-2 flex-1 justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PPT</span>
          </button>
        </div>
      )}

      {status.slides_preview && status.slides_preview.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
          <div className="text-xs text-gray-400 bg-gray-700 rounded p-2 max-h-20 overflow-y-auto">
            {status.slides_preview.slice(0, 3).map((slide, index) => (
              <div key={index} className="mb-1">
                {index + 1}. {slide.title}
              </div>
            ))}
            {status.slides_preview.length > 3 && (
              <div className="text-gray-500">
                ... and {status.slides_preview.length - 3} more slides
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
StatusDisplay.propTypes = {
  presentationId: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
  onError: PropTypes.func.isRequired,
};

export default StatusDisplay