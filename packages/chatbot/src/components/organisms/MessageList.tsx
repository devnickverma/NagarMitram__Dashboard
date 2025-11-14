import React from 'react'
import { MessageBubble } from '../molecules'
import { ProductCards } from './ProductCards'
import { OrderCards } from './OrderCards'
import { CategorySuggestions } from './CategorySuggestions'

export interface Message {
  id: string
  text?: string
  content?: string  // For backward compatibility
  isUser: boolean
  timestamp?: Date
  orders?: Array<{
    id: string
    orderId: string
    orderDate: string
    quantity: number
    productImages: string[]
  }>
  categories?: Array<{
    id: string
    title: string
    imageUrl?: string
  }>
  products?: Array<{
    id: string
    productNumber: string
    title: string
    price: string
    productUrl: string
    image?: string
  }>
  selectOptions?: {
    instructionText: string
    options: Array<{
      id: string
      label: string
      value: string
    }>
  }
}

export interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  onSuggestionClick?: (suggestion: any) => void
  onCategoryClick?: (category: string) => void
  onProductClick?: (product: any) => void
  onViewAllProducts?: () => void
  onOptionSelect?: (option: any) => void
  onOrderClick?: (order: any) => void
  onViewAllOrders?: () => void
  isExpanded?: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  className = "",
  style = {},
  children,
  onCategoryClick,
  onProductClick,
  onOrderClick,
  onViewAllProducts,
  onViewAllOrders,
  isExpanded = false
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div 
      className={`flex-1 overflow-y-auto scrollbar-thin ${className}`}
      style={{
        padding: '20px 0',
        ...style
      }}
    >
      {messages.map((message) => (
        <React.Fragment key={message.id}>
          {/* Regular text message */}
          {(message.text || message.content) && (
            <MessageBubble
              message={message.text || message.content || ''}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          )}
          
          {/* Category suggestions - inside message area */}
          {message.categories && message.categories.length > 0 && !message.isUser && (
            <div style={{ padding: '12px 16px' }}>
              <CategorySuggestions
                categories={message.categories}
                onCategorySelect={(category) => {
                  setSelectedCategory(category.title)
                  onCategoryClick?.(category.title)
                }}
                isExpanded={isExpanded}
              />
            </div>
          )}
          
          {/* Product cards - outside message with negative margin */}
          {message.products && message.products.length > 0 && !message.isUser && (
            <div style={{ paddingLeft: '16px', paddingRight: '16px', marginTop: '-8px', marginBottom: '8px' }}>
              <ProductCards
                products={message.products}
                onProductClick={onProductClick}
                onViewAll={onViewAllProducts}
                isExpanded={isExpanded}
              />
            </div>
          )}
          
          {/* Order cards - outside message with negative margin */}
          {message.orders && message.orders.length > 0 && !message.isUser && (
            <div style={{ paddingLeft: '16px', paddingRight: '16px', marginTop: '-8px', marginBottom: '8px' }}>
              <OrderCards
                orders={message.orders}
                onOrderClick={onOrderClick}
                onViewAll={onViewAllOrders}
                isExpanded={isExpanded}
              />
            </div>
          )}
        </React.Fragment>
      ))}
      {isLoading && (
        <MessageBubble
          message=""
          isUser={false}
          isLoading={true}
        />
      )}
      <div ref={messagesEndRef} />
      {children}
    </div>
  )
}