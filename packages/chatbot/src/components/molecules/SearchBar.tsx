import React, { useEffect, useRef } from 'react'
import { AttachmentIcon, SendIcon, LoadingSpinner } from '../atoms'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  style?: React.CSSProperties
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Write your query here...",
  disabled = false,
  isLoading = false,
  className = "",
  style = {}
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled && !isLoading) {
      onSubmit()
    }
  }

  // Reset textarea height when value is cleared
  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.style.height = '20px'
    }
  }, [value])

  return (
    <form onSubmit={handleSubmit} className={className} style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: '15px',
      padding: '6px 12px',
      gap: '8px',
      minHeight: '40px',
      border: '1px solid #9CA3AF',
      ...style
    }}>
      <button type="button" style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px'
      }}>
        <AttachmentIcon />
      </button>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          fontSize: '13px',
          color: '#000000',
          resize: 'none',
          minHeight: '20px',
          maxHeight: '60px',
          overflow: 'auto'
        }}
        className="placeholder:text-gray-400 scrollbar-thin"
        onInput={(e) => {
          const textarea = e.target as HTMLTextAreaElement
          textarea.style.height = '20px'
          const newHeight = Math.min(Math.max(textarea.scrollHeight, 20), 60)
          textarea.style.height = newHeight + 'px'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (value.trim() && !disabled && !isLoading) {
              handleSubmit(e as any)
            }
          }
        }}
      />
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 1px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 0px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
      
      <button 
        type="submit" 
        disabled={isLoading || !value.trim()}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: isLoading || !value.trim() ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px'
        }}
      >
        {isLoading ? <LoadingSpinner size={14} /> : <SendIcon />}
      </button>
    </form>
  )
}