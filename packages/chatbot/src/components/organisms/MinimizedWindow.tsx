import React from 'react'
import { ChatbotButton } from './ChatbotButton'

export interface MinimizedWindowProps {
  title?: string
  tagline?: string
  onClick?: () => void
  children?: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom'
  className?: string
  style?: React.CSSProperties
}

const getPositionStyles = (position: MinimizedWindowProps['position']) => {
  switch (position) {
    case 'bottom-right':
      return {
        position: 'fixed' as const,
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999
      }
    case 'bottom-left':
      return {
        position: 'fixed' as const,
        bottom: '1rem',
        left: '1rem',
        zIndex: 9999
      }
    case 'top-right':
      return {
        position: 'fixed' as const,
        top: '1rem',
        right: '1rem',
        zIndex: 9999
      }
    case 'top-left':
      return {
        position: 'fixed' as const,
        top: '1rem',
        left: '1rem',
        zIndex: 9999
      }
    default:
      return {
        position: 'relative' as const,
        zIndex: 9999
      }
  }
}

export const MinimizedWindow: React.FC<MinimizedWindowProps> = ({
  title = "Chat Assistant",
  tagline = "AI-Powered Helper",
  onClick,
  children,
  position = 'bottom-right',
  className = "",
  style = {}
}) => {
  const positionStyles = getPositionStyles(position)

  return (
    <div
      className={`pointer-events-auto ${className}`}
      style={{...positionStyles, ...style}}
    >
      <ChatbotButton
        onClick={onClick}
        title={title}
        tagline={tagline}
      />
      {children}
    </div>
  )
}