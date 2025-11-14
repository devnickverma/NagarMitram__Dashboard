import React from 'react'

export interface CategorySuggestion {
  id: string
  title: string
  imageUrl?: string
}

export interface CategorySuggestionsProps {
  categories?: CategorySuggestion[]
  selectedCategory?: string
  onCategorySelect?: (category: CategorySuggestion) => void
  onCategoryClick?: (category: string) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  isExpanded?: boolean
}

const ArrowIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({
  categories,
  onCategorySelect,
  onCategoryClick,
  className = "",
  style = {},
  children,
  isExpanded = false
}) => {
  // Default categories if none provided
  const defaultCategories: CategorySuggestion[] = [
    { id: '1', title: 'About us' },
    { id: '2', title: 'Products' },
    { id: '3', title: 'Orders' }
  ]

  const displayCategories = categories || defaultCategories

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '30px',
        width: '100%',
        ...style
      }}
      className={className}
    >
      {displayCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            onCategorySelect?.(category)
            onCategoryClick?.(category.title)
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            textAlign: 'left',
            width: isExpanded ? '100%' : '390px',
            height: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '1px solid #4B5563'
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid #E5E7EB'
            e.currentTarget.style.backgroundColor = '#FFFFFF'
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid #4B5563'
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid #E5E7EB'
            e.currentTarget.style.backgroundColor = '#FFFFFF'
          }}
        >
          {/* Category Image/Icon */}
          <div
            style={{
              width: '90px',
              height: '90px',
              backgroundColor: '#D1D5DB',
              borderRadius: '6px',
              flexShrink: 0
            }}
          >
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
            )}
          </div>

          {/* Title and Button Container */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            height: '100%',
            maxWidth: isExpanded ? 'none' : '270px'
          }}>
            {/* Category Title */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#111827',
                lineHeight: '1.4',
                maxWidth: '270px'
              }}
            >
              {category.title}
            </span>

            {/* Explore Category button aligned to bottom right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#EEF2FF',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  color: '#5B5FED',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                <span>Explore Category</span>
                <ArrowIcon />
              </div>
            </div>
          </div>
        </button>
      ))}
      {children}
    </div>
  )
}