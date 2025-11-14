import React, { useState } from 'react'

export interface SelectOption {
  id: string
  label: string
  value: string
}

export interface SelectOptionsProps {
  options: SelectOption[]
  onOptionSelect: (option: SelectOption) => void
  headerText?: string
  instructionText?: string
  additionalText?: string
  className?: string
}

export const SelectOptions: React.FC<SelectOptionsProps> = ({
  options,
  onOptionSelect,
  instructionText,
  additionalText,
  className = ""
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  return (
    <div className={className} style={{ marginTop: '16px', width: '100%' }}>
      {/* Instruction Text */}
      {instructionText && (
        <p style={{
          fontSize: '14px',
          color: '#111827',
          marginBottom: '12px',
          lineHeight: '1.4',
          whiteSpace: 'normal',
          width: '100%'
        }}>
          {instructionText}
        </p>
      )}

      {/* Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option)}
            onMouseEnter={() => setHoveredOption(option.id)}
            onMouseLeave={() => setHoveredOption(null)}
            style={{
              backgroundColor: hoveredOption === option.id ? '#F0F0FB' : '#F4F4F4',
              border: hoveredOption === option.id ? '1px solid #4B5563' : '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: 400,
              color: '#111827',
              textAlign: 'center',
              outline: 'none',
              width: '390px'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Additional Text */}
      {additionalText && (
        <p style={{
          fontSize: '14px',
          color: '#111827',
          marginTop: '14px',
          lineHeight: '1.4'
        }}>
          {additionalText}
        </p>
      )}
    </div>
  )
}