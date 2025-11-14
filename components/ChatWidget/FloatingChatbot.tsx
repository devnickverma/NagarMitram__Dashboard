'use client'

import React, { useState } from 'react'
import {
  SearchBar,
  type Suggestion
} from '../../packages/chatbot/src'
import { MessageArea } from './MessageArea'
import { CustomMainInterface } from './CustomMainInterface'
import { useAIChat } from '@/lib/hooks/useAIChat'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface FloatingChatbotProps {
  className?: string
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentView, setCurrentView] = useState<'welcome' | 'chat'>('welcome')
  const [inputValue, setInputValue] = useState('')
  const [pendingAction, setPendingAction] = useState<any>(null)
  const { sendMessage: sendAIMessage, isLoading } = useAIChat()

  // Admin panel specific suggestions
  const adminSuggestions: Suggestion[] = [
    { id: '1', text: 'Show me system status overview' },
    { id: '2', text: 'How many critical issues do we have?' },
    { id: '3', text: 'What is our current performance?' },
    { id: '4', text: 'Show pending issues that need attention' }
  ]

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion.text,
      sender: 'user',
      timestamp: new Date()
    }

    // Add loading message with dots
    const loadingMessage: Message = {
      id: 'loading',
      text: '...',
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setCurrentView('chat')

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

      // Get real AI response with Supabase data and conversation history
      const response = await sendAIMessage({
        message: suggestion.text,
        context: { conversationHistory }
      })

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      }

      // Check if action confirmation is required
      if (response.action_required) {
        setPendingAction(response.action_required)
      }

      // Remove loading message and add real response
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(botResponse))
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(errorMessage))
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // Switch to chat view if still on welcome screen
    if (currentView === 'welcome') {
      setCurrentView('chat')
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    // Check for confirmation response to pending action
    if (pendingAction && (inputValue.toLowerCase() === 'yes' || inputValue.toLowerCase() === 'no')) {
      setMessages(prev => [...prev, userMessage])
      setInputValue('')

      if (inputValue.toLowerCase() === 'yes') {
        // Execute the pending action
        const loadingMessage: Message = {
          id: 'loading',
          text: '...',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, loadingMessage])

        try {
          const response = await sendAIMessage({
            message: '',
            context: {},
            executeAction: pendingAction
          })

          const resultMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.response,
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => prev.filter(m => m.id !== 'loading').concat(resultMessage))

          // Trigger UI refresh if action was successful
          if (response.success) {
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('issue-updated'))
            // Real-time subscriptions will handle the update automatically!
            console.log('✅ Action successful - Real-time will update the UI');
          }
        } catch (error) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Failed to execute action. Please try again.',
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => prev.filter(m => m.id !== 'loading').concat(errorMessage))
        }
      } else {
        // Cancel action
        const cancelMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Action cancelled.',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, cancelMessage])
      }
      setPendingAction(null)
      return
    }

    // Add loading message with dots
    const loadingMessage: Message = {
      id: 'loading',
      text: '...',
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    const currentInput = inputValue
    setInputValue('')

    try {
      // Build conversation history for context
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

      // Get real AI response with Supabase data and conversation history
      const response = await sendAIMessage({
        message: currentInput,
        context: { conversationHistory }
      })

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      }

      // Check if action confirmation is required
      if (response.action_required) {
        setPendingAction(response.action_required)
      }

      // Remove loading message and add real response
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(botResponse))
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(errorMessage))
    }
  }

  if (!isOpen && !isMinimized) {
    return (
      <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
        <button
          onClick={handleToggleChat}
          className="w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#b0d1c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
        <div className="relative">
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-30" 
               style={{ backgroundColor: '#b0d1c7', animationDuration: '2s' }}></div>
          <div className="absolute inset-0 rounded-full animate-pulse opacity-20" 
               style={{ backgroundColor: '#b0d1c7', animationDelay: '1s' }}></div>
          
          {/* Main button */}
          <button
            onClick={handleMaximize}
            className="relative w-20 h-20 rounded-full shadow-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 hover:rotate-12 group"
            style={{ 
              background: `linear-gradient(135deg, #b0d1c7 0%, #96c5b5 50%, #7eb8a3 100%)`,
              borderColor: '#b0d1c7',
              boxShadow: '0 0 30px rgba(176, 209, 199, 0.4), 0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            {/* Sparkle effects */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-80 animate-bounce"
                 style={{ backgroundColor: '#fff', animationDelay: '0s', animationDuration: '1.5s' }}></div>
            <div className="absolute -bottom-2 -left-1 w-2 h-2 rounded-full opacity-60 animate-bounce"
                 style={{ backgroundColor: '#fff', animationDelay: '0.5s', animationDuration: '2s' }}></div>
            <div className="absolute top-2 -left-2 w-1.5 h-1.5 rounded-full opacity-70 animate-bounce"
                 style={{ backgroundColor: '#fff', animationDelay: '1s', animationDuration: '1.8s' }}></div>
            
            {/* Chat icon with subtle animation */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                 className="mb-1 group-hover:scale-110 transition-transform duration-300">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" 
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="12" r="1" fill="white"/>
              <circle cx="15" cy="12" r="1" fill="white"/>
              <circle cx="12" cy="12" r="1" fill="white"/>
            </svg>
            
            {/* Assistant text with glow */}
            <span className="text-xs font-semibold text-white drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
              AI
            </span>
            
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        style={{ width: '400px', height: '600px', maxWidth: '400px' }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-sm text-gray-900">Mitram</h3>
            <p className="text-xs text-gray-600">AI Helper</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleMinimize}
              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <span className="text-xs text-gray-600">−</span>
            </button>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <span className="text-xs text-gray-600">×</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {currentView === 'welcome' ? (
              <CustomMainInterface
                questionText="How can I help you manage your admin panel today?"
                suggestions={adminSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            ) : (
              <MessageArea messages={messages} />
            )}
          </div>

          {/* Search Bar - Always at bottom */}
          <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
              placeholder="Ask about civic issues, analytics, or reports..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}