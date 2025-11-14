import React from 'react'

interface PurpleHueSmileyProps {
  className?: string
}

export const PurpleHueSmiley: React.FC<PurpleHueSmileyProps> = ({ className = '' }) => (
  <svg width="569" height="491" viewBox="0 0 569 491" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#filter1_f_5_24)">
      <path fillRule="evenodd" clipRule="evenodd" d="M335.525 251.781C307.865 270.464 269.561 265.086 242.214 258.421C219.096 252.787 193.281 241.349 179.783 225.434C163.082 205.741 151.495 180.721 161.645 152.489C171.964 123.788 209.297 102.552 242.214 90.1604C269.4 79.9262 292.774 89.8995 317.925 93.6574C341.323 97.1536 371.464 93.6066 381.443 110.963C391.417 128.312 396.895 165.885 389.701 187.949C380.966 214.738 362.954 233.254 335.525 251.781Z" fill="#B5B9FF"/>
    </g>
    <path d="M237.282 158.233C238.987 144.503 254.405 145.935 257.112 152.703" stroke="white" strokeWidth="3.52669" strokeLinecap="round"/>
    <path d="M311.273 142.887C313.515 131.044 331.346 136.443 331.843 143.716" stroke="white" strokeWidth="3.52669" strokeLinecap="round"/>
    <path d="M312.839 164.434C314.192 194.666 271.1 190.83 267.942 172.104" stroke="white" strokeWidth="3.52669" strokeLinecap="round"/>
    <defs>
      <filter id="filter1_f_5_24" x="57.8438" y="-14.3225" width="435.139" height="378.935" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feGaussianBlur stdDeviation="30.6601" result="effect1_foregroundBlur_5_24"/>
      </filter>
    </defs>
  </svg>
)