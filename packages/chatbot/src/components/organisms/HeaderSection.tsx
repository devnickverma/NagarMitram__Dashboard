import React from 'react'

export interface HeaderSectionProps {
  title?: string
  tagline?: string
  onClose?: () => void
  showCloseButton?: boolean
  logo?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}


export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title = "Chat Assistant",
  tagline = "AI-Powered Helper",
  onClose,
  showCloseButton = true,
  logo,
  children
}) => {
  const CloseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '20px 20px 20px 0px',
            backgroundColor: 'white',
          }}
        >
          {logo || (
            <svg width="24" height="24" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.400146 20.1202C0.400146 9.07448 9.35445 0.120178 20.4001 0.120178H44.2058C55.2515 0.120178 64.2058 9.07448 64.2058 20.1202V43.9258C64.2058 54.9715 55.2515 63.9258 44.2058 63.9258H0.400146V20.1202Z"
                fill="white"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col">
          <h2 style={{ 
            color: '#FFFFFF', 
            fontSize: '20px', 
            fontWeight: 700, 
            lineHeight: '100%', 
            marginTop: '1px' 
          }}>
            {title}
          </h2>
          <p style={{ 
            color: '#FFFFFF', 
            fontSize: '10px', 
            fontWeight: 500, 
            lineHeight: '120%', 
            marginTop: '10px', 
            marginLeft: '2px' 
          }}>
            {tagline}
          </p>
        </div>
      </div>

      {showCloseButton && onClose && (
        <div className="flex items-start" style={{ marginTop: '-12px' }}>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 transition-colors"
            style={{ padding: '4px' }}
          >
            <CloseIcon size={18} color="white" />
          </button>
        </div>
      )}

      {children}
    </>
  )
}