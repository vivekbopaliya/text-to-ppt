import  { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useGeneratePPT } from '../hooks/useGeneratePPT'
import SuggestionBubbles from './SuggestionBubbles'

const TopicInput = ({ 
  selectedTopic, 
  onTopicSelect, 
  onGenerationStart, 
  onError, 
  clientId, 
  userId, 
  disabled
}) => {
  console.log("first", selectedTopic)
  const [topic, setTopic] = useState(selectedTopic || '')
  const [slideCount, setSlideCount] = useState(10)
  const [industry, setIndustry] = useState('')
  const [audience, setAudience] = useState('')

  useEffect(() => {
    setTopic(selectedTopic)
  }, [selectedTopic])
  const generateMutation = useGeneratePPT()

  const validateTopic = (topicText) => {
    if (!topicText || topicText.trim().length < 10) {
      return 'Topic must be at least 10 characters long'
    }
    
    const words = topicText.trim().split(/\s+/)
    if (words.length < 2) {
      return 'Topic must contain at least 2 words'
    }
    
    if (topicText.length > 100) {
      return 'Topic must be less than 100 characters'
    }
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validation = validateTopic(topic)
    if (validation) {
      onError(validation)
      return
    }

    if (!selectedTopic || selectedTopic !== topic) {
      onError('Please select a topic from the suggestions below')
      return
    }

    try {
      const response = await generateMutation.mutateAsync({
        selected_topic: topic,
        user_id: userId,
        preferences: {
          slide_count: slideCount,
          industry: industry || undefined,
          audience: audience || undefined,
        },
        client_id: clientId,
      })

      onGenerationStart(response.presentation_id)
    } catch (error) {
      console.error('Generation error:', error)
      onError(error.message || 'Failed to start presentation generation')
    }
  }

  const handleTopicChange = (e) => {
    const newTopic = e.target.value
    setTopic(newTopic)
    
    // Clear selected topic if user is typing something different
    if (selectedTopic && selectedTopic !== newTopic) {
      onTopicSelect('')
    }
  }

  const isValidTopic = selectedTopic && selectedTopic === topic
  const topicValidation = validateTopic(topic)

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
            Presentation Topic *
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={handleTopicChange}
            placeholder="Enter a descriptive topic (e.g., 'Marketing Benefits in IT Industry')"
            className={`input-field w-full ${
              topicValidation ? 'border-red-500 focus:ring-red-500' : 
              isValidTopic ? 'border-green-500 focus:ring-green-500' : ''
            }`}
            disabled={disabled}
          />
          {topicValidation && (
            <p className="text-red-400 text-sm mt-1">{topicValidation}</p>
          )}
          {!topicValidation && topic && !isValidTopic && (
            <p className="text-yellow-400 text-sm mt-1">
              Please select from the suggestions below
            </p>
          )}
          {isValidTopic && (
            <p className="text-green-400 text-sm mt-1">
              ✓ Topic selected
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="slideCount" className="block text-sm font-medium text-gray-300 mb-2">
              Number of Slides
            </label>
            <select
              id="slideCount"
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              className="input-field w-full"
              disabled={disabled}
            >
              {[5, 10, 15, 20, 25].map(count => (
                <option key={count} value={count}>{count} slides</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
              Industry (Optional)
            </label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Technology, Healthcare"
              className="input-field w-full"
              disabled={disabled}
            />
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Executives, Students"
              className="input-field w-full"
              disabled={disabled}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidTopic || generateMutation.isPending}
          className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2"
        >
          {generateMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner"></div>
              <span>Starting Generation...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Generate Presentation</span>
            </>
          )}
        </button>
      </form>
      {/* SuggestionBubbles moved here, pass industry/audience */}
      <SuggestionBubbles
        onTopicSelect={onTopicSelect}
        disabled={disabled}
        industry={industry}
        audience={audience}
      />
    </>
  )
}
TopicInput.propTypes = {
  selectedTopic: PropTypes.string,
  onTopicSelect: PropTypes.func.isRequired,
  onGenerationStart: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  clientId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  disabled: PropTypes.bool
}
export default TopicInput