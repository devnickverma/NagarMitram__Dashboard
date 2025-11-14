import React from 'react'

interface SendIconProps {
  className?: string
  size?: number
  color?: string
}

export const SendIcon: React.FC<SendIconProps> = ({
  className = '',
  size = 20,
  color = 'black'
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
        d="M21.6821 12.648H5.40057M5.31592 12.9395L2.981 19.9142C2.79756 20.4622 2.70585 20.7361 2.77167 20.9048C2.82883 21.0514 2.95159 21.1624 3.10307 21.2047C3.27751 21.2534 3.54097 21.1348 4.06791 20.8977L20.7794 13.3776C21.2937 13.1461 21.5509 13.0304 21.6304 12.8696C21.6994 12.73 21.6994 12.5661 21.6304 12.4264C21.5509 12.2656 21.2937 12.1499 20.7794 11.9185L4.06208 4.39574C3.53674 4.15933 3.27406 4.04113 3.0998 4.08962C2.94846 4.13173 2.82571 4.24252 2.76835 4.38876C2.70231 4.55715 2.79305 4.83053 2.97452 5.37729L5.31657 12.4335C5.34774 12.5274 5.36332 12.5744 5.36947 12.6224C5.37493 12.665 5.37488 12.7082 5.36931 12.7508C5.36303 12.7988 5.34733 12.8457 5.31592 12.9395Z" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}