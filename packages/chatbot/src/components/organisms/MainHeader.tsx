import React from 'react'
import { SparkleIcon, ResizeIcon, MaximizeIcon } from '../atoms'

export interface MainHeaderProps {
  title?: string
  tagline?: string
  onClose?: () => void
  onResize?: (e: React.MouseEvent) => void
  showResizeIcons?: boolean
  className?: string
  iconMarginTop?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  title = "Chat Assistant",
  tagline = "AI-Powered Helper",
  onClose,
  onResize,
  showResizeIcons = true,
  children
}) => {
  const CloseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Left side - Resize icons */}
      <div className="flex items-start gap-2" style={{ paddingTop: '8px' }}>
        {showResizeIcons && (
          <div className="flex items-center gap-2">
            <div
              style={{
                transform: 'scale(0.75)',
                cursor: 'nwse-resize',
              }}
              onMouseDown={onResize}
            >
              <ResizeIcon />
            </div>
            <div style={{ transform: 'scale(0.75)' }}>
              <MaximizeIcon />
            </div>
          </div>
        )}
      </div>

      {/* Center - Sparkle + title (exact original design) */}
      <div className="flex items-center gap-2 flex-1 justify-center" style={{ marginLeft: '-50px' }}>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <SparkleIcon />
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '100%',
              marginTop: '1px',
            }}>
              {title}
            </h2>
          </div>
          <p style={{
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '120%',
            marginTop: '10px',
            marginLeft: '16px',
            textAlign: 'center',
          }}>
            {tagline}
          </p>
        </div>
      </div>

      {/* Right side - Close button */}
      <div className="flex items-start" style={{ paddingTop: '8px' }}>
        <button
          onClick={onClose}
          className="text-white hover:text-white/80 transition-colors"
          style={{ padding: '4px' }}
        >
          <CloseIcon size={18} color="white" />
        </button>
      </div>

      {children}
    </div>
  )
}
