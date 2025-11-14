import React from 'react'

interface AttachmentIconProps {
  className?: string
  size?: number
  color?: string
}

export const AttachmentIcon: React.FC<AttachmentIconProps> = ({
  className = '',
  size = 20,
  color = '#101012'
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 25 25" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M21.5526 11.5475L12.537 20.5631C10.4868 22.6133 7.16265 22.6133 5.1124 20.5631C3.06214 18.5128 3.06214 15.1887 5.1124 13.1385L14.128 4.12284C15.4948 2.75601 17.7109 2.75601 19.0778 4.12284C20.4446 5.48968 20.4446 7.70576 19.0778 9.07259L10.4157 17.7346C9.73228 18.4181 8.62424 18.4181 7.94082 17.7346C7.25741 17.0512 7.25741 15.9432 7.94082 15.2598L15.5422 7.65838" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}