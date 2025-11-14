import React, { useState, useRef } from 'react'

export interface Product {
  id: string
  productNumber: string
  title: string
  name?: string
  description?: string
  price: string
  imageUrl?: string
  image?: string
  productUrl?: string
}

export interface ProductCardsProps {
  products?: Product[]
  onProductClick?: (product: Product) => void
  onViewAll?: () => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  isExpanded?: boolean
}

const ArrowIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ViewAllArrow: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ProductCards: React.FC<ProductCardsProps> = ({
  products = [
    { id: '1', productNumber: 'DEMO-001', name: 'Premium Package', title: 'Premium Package', description: 'Best value for teams', price: '$99/mo' },
    { id: '2', productNumber: 'DEMO-002', name: 'Starter Package', title: 'Starter Package', description: 'Perfect for individuals', price: '$29/mo' }
  ],
  onProductClick,
  onViewAll,
  className = "",
  style = {},
  children,
  isExpanded = false
}) => {
  const ChevronLeftIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  const ChevronRightIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className={`${className}`} style={{ marginTop: '16px', width: '100%', ...style }}>
      {/* Carousel Container */}
      <div style={{ width: '100%' }}>
        {/* Scrollable Product Cards Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            flexDirection: (isExpanded || showAll) ? 'column' : 'row',
            gap: '12px',
            overflowX: (isExpanded || showAll) ? 'visible' : 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '4px',
            width: '100%',
            transition: showAll ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
          className="hide-scrollbar"
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .card-animate {
              animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}</style>

          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick?.(product)}
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={showAll && !isExpanded ? 'card-animate' : ''}
              style={{
                flexShrink: 0,
                width: (isExpanded || showAll) ? '100%' : '180px',
                backgroundColor: hoveredCard === product.id ? '#F0F0FB' : '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: (isExpanded || showAll) ? 'flex' : 'block',
                flexDirection: (isExpanded || showAll) ? 'row' : undefined,
                gap: (isExpanded || showAll) ? '12px' : undefined,
                padding: (isExpanded || showAll) ? '12px' : '0',
                animationDelay: showAll && !isExpanded ? `${products.indexOf(product) * 0.1}s` : undefined
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  position: 'relative',
                  width: (isExpanded || showAll) ? '100px' : '100%',
                  height: (isExpanded || showAll) ? '100px' : '180px',
                  backgroundColor: '#F3F4F6',
                  flexShrink: 0
                }}
              >
                {(product.imageUrl || product.image) ? (
                  <img
                    src={product.imageUrl || product.image}
                    alt={product.title || product.name || ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB' }} />
                )}
                
                {/* Arrow Icon in top right */}
                {product.productUrl && (
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '4px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <ArrowIcon />
                  </a>
                )}
              </div>

              {/* Product Details */}
              <div style={{ padding: '10px' }}>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}
                >
                  Product number:{product.productNumber}
                </p>
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#111827',
                    marginBottom: '6px',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {product.title || product.name}
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#111827'
                  }}
                >
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section with View All and Navigation - only show when not expanded */}
      {!isExpanded && !showAll && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px'
        }}>
          {/* View All Button */}
          <button
            onClick={() => {
              setShowAll(true)
              onViewAll?.()
            }}
            style={{
              backgroundColor: '#F0F0FB',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#4F46E5',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E0E7FF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0FB'
            }}
          >
            <span>View all</span>
            <ViewAllArrow />
          </button>

          {/* Navigation Arrows */}
          {products.length > 2 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={scrollLeft}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollRight}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* View Less Button - only show when showAll is true and not expanded */}
      {!isExpanded && showAll && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: '12px'
        }}>
          <button
            onClick={() => setShowAll(false)}
            style={{
              backgroundColor: '#F0F0FB',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#4F46E5',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E0E7FF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0FB'
            }}
          >
            <span>View less</span>
            <ViewAllArrow />
          </button>
        </div>
      )}
      {children}
    </div>
  )
}