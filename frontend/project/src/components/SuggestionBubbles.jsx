import React, { useState, useEffect } from 'react'
import { useSuggestions } from '../hooks/useSuggestions'

const SuggestionBubbles = ({ onTopicSelect, disabled }) => {
  const [inputTopic, setInputTopic] = useState('')
  const [debouncedTopic, setDebouncedTopic] = useState('')
  
  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTopic(inputTopic)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [inputTopic])

  const { 
    data: suggestions, 
    isLoading, 
    error,
    refetch 
  } = useSuggestions(debouncedTopic)

  const handleSuggestionClick = (suggestion) => {
    onTopicSelect(suggestion)
    setInputTopic('') // Clear input after selection
  }

  const handleRefresh = () => {
    if (debouncedTopic) {
      refetch()
    }
  }

  // Don't show anything if no topic is being typed
  if (!debouncedTopic || debouncedTopic.length < 3) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-400 mb-3">
          Start typing a topic to see AI-generated suggestions...
        </p>
        <div className="relative">
          <input
            type="text"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder="Type a general topic (e.g., 'marketing', 'technology')"
            className="input-field w-full"
            disabled={disabled}
          />
          <div className="absolute right-3 top-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-200">
          Suggested Topics
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading || disabled}
          className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Topic Input */}
      <div className="mb-4">
        <input
          type="text"
          value={inputTopic}
          onChange={(e) => setInputTopic(e.target.value)}
          placeholder="Type a general topic to get specific suggestions"
          className="input-field w-full"
          disabled={disabled}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full spinner"></div>
            <span>Generating suggestions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            Failed to load suggestions: {error.message}
          </p>
          <button
            onClick={handleRefresh}
            className="text-red-300 hover:text-red-200 text-sm font-medium mt-2"
          >
            Try again
          </button>
        </div>
      ) : suggestions?.suggestions && suggestions.suggestions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Click on a suggestion to select it:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className="suggestion-bubble"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">
            No suggestions found. Try a different topic.
          </p>
        </div>
      )}
    </div>
  )
}

export default SuggestionBubbles