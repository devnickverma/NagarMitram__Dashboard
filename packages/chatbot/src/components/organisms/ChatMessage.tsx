import React from 'react'
import { SuggestionBubbles, type Suggestion } from '../molecules'
import { CategorySuggestions, ProductCards, OrderCards, type Product, type Order } from './'
import { SelectOptions, type SelectOption } from '../SelectOptions'

// Local type for backward compatibility
type CategorySuggestion = string

export interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp?: Date
  isLoading?: boolean
  suggestions?: Suggestion[]
  categories?: CategorySuggestion[]
  products?: Product[]
  selectOptions?: {
    options: SelectOption[]
    headerText?: string
    instructionText?: string
    additionalText?: string
  }
  orders?: Order[]
  onSuggestionClick?: (suggestion: Suggestion) => void
  onCategoryClick?: (category: CategorySuggestion) => void
  onProductClick?: (product: Product) => void
  onViewAllProducts?: () => void
  onOptionSelect?: (option: SelectOption) => void
  onOrderClick?: (order: Order) => void
  onViewAllOrders?: () => void
  isExpanded?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  timestamp,
  isLoading = false,
  suggestions,
  categories,
  products,
  selectOptions,
  orders,
  onSuggestionClick,
  onCategoryClick,
  onProductClick,
  onViewAllProducts,
  onOptionSelect,
  onOrderClick,
  onViewAllOrders,
  isExpanded = false,
  className = '',
  style = {},
  children,
  ...props
}) => {
  return (
    <div 
      className={`chatbot-message ${className}`}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
        paddingLeft: '16px',
        paddingRight: '16px',
        ...style
      }}
      {...props}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: isUser ? '#f4f4f4' : 'transparent',
          color: '#000000',
          fontSize: '14px',
          lineHeight: '1.4',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : (
          <>
            <span>{message}</span>
            
            {/* Dynamic content based on props */}
            {suggestions && onSuggestionClick && (
              <SuggestionBubbles
                suggestions={suggestions}
                onSuggestionClick={onSuggestionClick}
              />
            )}

            {categories && onCategoryClick && (
              <CategorySuggestions
                selectedCategory=""
                onCategorySelect={onCategoryClick}
                isExpanded={isExpanded}
              />
            )}

            {products && (
              <ProductCards
                products={products}
                onProductClick={onProductClick}
                isExpanded={isExpanded}
              />
            )}

            {orders && (
              <OrderCards
                orders={orders}
                onOrderClick={onOrderClick}
                isExpanded={isExpanded}
              />
            )}

            {selectOptions && onOptionSelect && (
              <SelectOptions
                options={selectOptions.options}
                headerText={selectOptions.headerText}
                instructionText={selectOptions.instructionText}
                additionalText={selectOptions.additionalText}
                onOptionSelect={onOptionSelect}
              />
            )}

            {children}
          </>
        )}
      </div>
    </div>
  )
}