import React from 'react'
import { PurpleHueSmiley } from '../atoms'

export interface WelcomeScreenProps {
  welcomeMessage?: string
  showAnimation?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  showAnimation = false,
  className = "",
  style = {},
  children
}) => {
  return (
    <>
      {/* Purple hue smiley at top center - Welcome Screen */}
      <div
        className={className}
        style={{
          width: '440px',
          height: '380px',
          marginTop: '5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          ...style
        }}
      >
        <div 
          style={{ 
            animation: showAnimation 
              ? 'float 2s ease-in-out infinite, zoomPop 0.5s ease-out' 
              : 'float 2s ease-in-out infinite'
          }}
        >
          <PurpleHueSmiley />
        </div>
      </div>

      {/* Welcome text below purple smiley - matches ChatbotContainer design */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 40px',
          marginTop: '-120px',
          zIndex: 2,
          position: 'relative',
        }}
      >
        <h3
          style={{
            color: '#000000',
            fontSize: '20px',
            fontWeight: 400,
            marginBottom: '12px',
          }}
        >
          Hi There,
        </h3>
        <p
          style={{
            color: '#000000',
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '24px',
          }}
        >
          I am Chat assistant. I am here to help you with whatever you need
        </p>
      </div>

      {children}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes zoomPop {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          40% {
            transform: scale(1.25);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}