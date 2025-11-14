# Chatbot Components

A flexible React chatbot component library with loosely coupled components that can be used independently or together.

## Installation

```bash
npm install @de/chatbot
```

## Usage

### Option 1: Complete Chatbot (All-in-one)
```tsx
import { Chatbot } from '@de/chatbot'

function App() {
  return (
    <div>
      <Chatbot 
        title="My Assistant"
        tagline="How can I help?"
      />
    </div>
  )
}
```

### Option 2: Individual Components (Build Your Own)

You can use individual components to build your own custom chatbot:

```tsx
import { 
  SearchBar, 
  MessageBubble, 
  HeaderSection,
  ProductCards,
  OrderCards,
  SuggestionBubbles 
} from '@de/chatbot'

function MyCustomChatbot() {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    // Your custom logic
    console.log('User input:', inputValue)
    setInputValue('')
  }

  return (
    <div style={{ width: '400px', height: '600px' }}>
      {/* Custom Header */}
      <HeaderSection 
        title="My Custom Bot"
        tagline="Powered by AI"
        onClose={() => console.log('Close clicked')}
      />
      
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map(msg => (
          <MessageBubble 
            key={msg.id}
            message={msg.content}
            isUser={msg.isUser}
          />
        ))}
      </div>
      
      {/* Search Bar */}
      <SearchBar 
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder="Ask me anything..."
      />
    </div>
  )
}
```

## Available Components

### Core Components
- `<Chatbot />` - Complete chatbot solution
- `<SearchBar />` - Input field with send/loading states
- `<MessageBubble />` - Individual message display
- `<HeaderSection />` - Header with title, logo, close button

### Interactive Components
- `<ProductCards />` - Product carousel with click handlers
- `<OrderCards />` - Order display with stacking effect
- `<SuggestionBubbles />` - Clickable suggestion chips
- `<CategorySuggestions />` - Category selection cards
- `<SelectOptions />` - Multiple choice options

### Utility Components
- `<LoadingSpinner />` - Loading indicator
- `<AttachmentIcon />` - File attachment icon
- `<SendIcon />` - Message send icon

## Examples

### Just a Search Bar
```tsx
import { SearchBar } from '@de/chatbot'

function MySearchComponent() {
  const [query, setQuery] = useState('')
  
  return (
    <SearchBar 
      value={query}
      onChange={setQuery}
      onSubmit={() => handleSearch(query)}
      placeholder="Search products..."
    />
  )
}
```

### Product Display Only
```tsx
import { ProductCards } from '@de/chatbot'

function ProductShowcase() {
  const products = [
    {
      id: '1',
      title: 'Diamond Ring',
      price: '$1,200',
      productNumber: '12345'
    }
  ]
  
  return (
    <ProductCards 
      products={products}
      onProductClick={(product) => console.log('Selected:', product)}
    />
  )
}
```

### Order History Component
```tsx
import { OrderCards } from '@de/chatbot'

function OrderHistory() {
  const orders = [
    {
      id: '1',
      orderId: 'ORD001',
      orderDate: '2025-01-01',
      quantity: 5,
      productImages: ['image1.jpg', 'image2.jpg']
    }
  ]
  
  return (
    <OrderCards 
      orders={orders}
      onOrderClick={(order) => console.log('Order:', order)}
    />
  )
}
```

## Styling

All components use inline styles for maximum portability. You can override styles by:

1. Adding `className` prop
2. Wrapping in styled components
3. Using CSS modules

```tsx
<SearchBar 
  className="my-custom-search"
  value={value}
  onChange={onChange}
  onSubmit={onSubmit}
/>
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { SearchBarProps, MessageBubbleProps, Product } from '@de/chatbot'

const myProps: SearchBarProps = {
  value: '',
  onChange: (val) => {},
  onSubmit: () => {}
}
```