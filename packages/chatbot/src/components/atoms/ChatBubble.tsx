import React from 'react'

interface ChatBubbleProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer hover:opacity-90 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}