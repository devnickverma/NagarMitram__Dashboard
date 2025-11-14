import React from 'react'

const MessageSvg: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.400146 20.1202C0.400146 9.07448 9.35445 0.120178 20.4001 0.120178H44.2058C55.2515 0.120178 64.2058 9.07448 64.2058 20.1202V43.9258C64.2058 54.9715 55.2515 63.9258 44.2058 63.9258H0.400146V20.1202Z" fill="white"/>
  </svg>
)

export interface ChatbotAvatarButtonProps {
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

export const ChatbotAvatarButton: React.FC<ChatbotAvatarButtonProps> = ({
  onClick,
  className = "",
  style = {}
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-lg
        cursor-pointer
        ${className}
      `}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '20px',
        background: 'linear-gradient(180deg, #151515 0%, #FFFFFF 727.93%)',
        padding: '8px',
        opacity: 1,
        ...style
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <MessageSvg />
      </div>
    </button>
  )
}