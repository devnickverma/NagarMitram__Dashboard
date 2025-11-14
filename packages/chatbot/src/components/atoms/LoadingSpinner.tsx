import React from 'react'

export interface LoadingSpinnerProps {
  size?: number
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 20,
  color = '#3840EB'
}) => {
  return (
    <div
      className="animate-spin"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.400146" y="0.64798" width="40" height="40" rx="20" fill="#E1E2F8"/>
        <path d="M20.4001 10.898V13.398M20.4001 26.648V30.648M14.1501 20.648H10.6501M29.6501 20.648H28.1501M26.8573 27.1051L26.1501 26.398M27.0644 14.0638L25.6501 15.478M13.3217 27.7264L16.1501 24.898M13.5288 13.8567L15.6501 15.978" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}