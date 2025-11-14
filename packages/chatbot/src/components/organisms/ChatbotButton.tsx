import React from 'react'

export interface ChatbotButtonProps {
  onClick?: () => void
  title?: string
  tagline?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const MessageSvg: React.FC = () => (
  <svg width="35" height="35" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.400146 20.1202C0.400146 9.07448 9.35445 0.120178 20.4001 0.120178H44.2058C55.2515 0.120178 64.2058 9.07448 64.2058 20.1202V43.9258C64.2058 54.9715 55.2515 63.9258 44.2058 63.9258H0.400146V20.1202Z" fill="white"/>
  </svg>
)

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  onClick,
  title = "Chat assistant",
  tagline = "Tagline",
  className = "",
  style = {},
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-[336px] h-[108px] 
        rounded-[24px] 
        flex items-center
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-lg
        cursor-pointer
        relative
        ${className}
      `}
      style={{
        padding: '8px',
        gap: '10px',
        background: 'linear-gradient(180deg, #151515 0%, #FFFFFF 727.93%)',
        opacity: 1,
        borderRadius: '24px',
        ...style
      }}
    >
      <div 
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: '45px',
          height: '45px', 
          borderRadius: '12px'
        }}
      >
        <MessageSvg />
      </div>
      
      <div className="flex flex-col items-start text-left flex-1">
        <h3 className="text-base font-semibold leading-tight mb-1" style={{ color: '#FFFFFF' }}>
          {title}
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {tagline}
        </p>
      </div>

      {children}
    </button>
  )
}