import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Header from './components/Header'
import TopicInput from './components/TopicInput'
import StatusDisplay from './components/StatusDisplay'
import UserStats from './components/UserStats'
import PresentationList from './components/PresentationList'
import ErrorBanner from './components/ErrorBanner'
import { useUserPresentations } from './hooks/useUserPresentations'

function App() {
  const [clientId, setClientId] = useState(() => {
    const stored = localStorage.getItem('ppt-client-id')
    if (stored) return stored
    const newId = uuidv4()
    localStorage.setItem('ppt-client-id', newId)
    return newId
  })

  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem('ppt-user-id')
    if (stored) return stored
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('ppt-user-id', newId)
    return newId
  })

  const [selectedTopic, setSelectedTopic] = useState('')
  console.log("Selected topic: ", selectedTopic)
  const [currentPresentationId, setCurrentPresentationId] = useState(null)
  const [presentations, setPresentations] = useState([])
  const [error, setError] = useState(null)

  const { data: userPresentations, error: presentationsError } = useUserPresentations(userId)

  useEffect(() => {
    if (userPresentations) {
      setPresentations(userPresentations)
    }
  }, [userPresentations])

  useEffect(() => {
    if (presentationsError) {
      setError(presentationsError.message)
    }
  }, [presentationsError])

  console.log("Presentation client ID:", clientId)

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic)
    setError(null)
  }

  const handleGenerationStart = (presentationId) => {
    setCurrentPresentationId(presentationId)
    setError(null)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setCurrentPresentationId(null)
  }

  const handlePresentationComplete = (presentationData) => {
    setPresentations(prev => [{
      id: presentationData.presentation_id,
      topic: presentationData.topic,
      status: 'completed',
      created_at: presentationData.created_at,
      slide_count: presentationData.slide_count
    }, ...prev])
  }

  const handlePresentationDelete = (presentationId) => {
    setPresentations(prev => prev.filter(p => p.id !== presentationId))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {error && (
          <ErrorBanner 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-gray-100">
                Create Your Presentation
              </h2>
              
              <TopicInput
                selectedTopic={selectedTopic}
                onTopicSelect={handleTopicSelect}
                onGenerationStart={handleGenerationStart}
                onError={handleError}
                clientId={clientId}
                userId={userId}
              />
            </div>

            {currentPresentationId && (
              <StatusDisplay
                presentationId={currentPresentationId}
                onComplete={handlePresentationComplete}
                onError={handleError}
              />
            )}

            <PresentationList
              presentations={presentations}
              onDelete={handlePresentationDelete}
              onError={handleError}
            />
          </div>

          <div className="space-y-6">
            <UserStats userId={userId} />

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-100">
                Tips for Better Presentations
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Be specific with your topic : eg &rdquo;Marketing Benefits in IT</li>
                <li>• Use descriptive topics with at least 2 words</li>
                <li>• Select from suggested topics for best results</li>
                <li>• Consider your target audience when choosing topics</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App