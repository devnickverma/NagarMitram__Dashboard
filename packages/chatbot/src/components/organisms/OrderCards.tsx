import React, { useState, useRef } from 'react'

export interface Order {
  id: string
  orderId: string
  orderNumber?: string
  orderDate: string
  date?: string
  quantity: number
  productImages?: string[]
  orderUrl?: string
  status?: string
  total?: string
}

export interface OrderCardsProps {
  orders?: Order[]
  onOrderClick?: (order: Order) => void
  onViewAll?: () => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  isExpanded?: boolean
}

const ViewAllArrow: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const OrderCards: React.FC<OrderCardsProps> = ({
  orders = [
    { id: '1', orderId: '#12345', orderNumber: '#12345', status: 'Delivered', orderDate: '2024-01-15', date: '2024-01-15', total: '$150.00', quantity: 2 },
    { id: '2', orderId: '#12346', orderNumber: '#12346', status: 'Processing', orderDate: '2024-01-20', date: '2024-01-20', total: '$75.00', quantity: 1 }
  ],
  onOrderClick,
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
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  return (
    <div className={`${className}`} style={{ marginTop: '16px', width: '100%', ...style }}>
      {/* Carousel Container */}
      <div style={{ width: '100%' }}>
        {/* Scrollable Order Cards Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            flexDirection: (isExpanded || showAll) ? 'column' : 'row',
            gap: '16px',
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
            .order-card-animate {
              animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}</style>

          {orders.map((order) => (
            <div
              key={order.id}
              className={showAll && !isExpanded ? 'order-card-animate' : ''}
              onClick={() => onOrderClick?.(order)}
              onMouseEnter={() => setHoveredCard(order.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                flexShrink: 0,
                width: (isExpanded || showAll) ? '100%' : '390px',
                backgroundColor: '#FFFFFF',
                border: hoveredCard === order.id ? '1px solid #4B5563' : '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px 16px 16px 32px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                animationDelay: showAll && !isExpanded ? `${orders.indexOf(order) * 0.1}s` : undefined
              }}
            >
              {/* Stacked Product Images with Quantity Badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: '120px', height: '80px' }}>
                  {/* Stack of images */}
                  {order.productImages && order.productImages.length > 0 ? (
                    <>
                      {/* Background images (stacked effect) - behind the front image horizontally */}
                      {order.productImages.slice(1, 4).map((imageUrl, index) => (
                        <div
                          key={`bg-${index}`}
                          style={{
                            position: 'absolute',
                            left: `-${(index + 1) * 6}px`,
                            top: '0px',
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '6px',
                            border: '1px solid #E5E7EB',
                            overflow: 'hidden',
                            zIndex: 9 - index,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ))}
                      {/* Front image */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '0px',
                          top: '0px',
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '2px solid #E5E7EB',
                          zIndex: 10
                        }}
                      >
                        <img
                          src={order.productImages[0]}
                          alt="Product"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </div>
                
                {/* Quantity Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    right: '-8px',
                    backgroundColor: 'white',
                    color: '#000000',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 400,
                    border: '2px solid #10B981',
                    zIndex: 15,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Qty - {order.quantity}
                </div>
              </div>

              {/* Order Details */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#111827',
                    marginBottom: '4px'
                  }}
                >
                  Order placed on - {order.orderDate || order.date}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827'
                  }}
                >
                  Order ID - {order.orderId || order.orderNumber}
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
          marginTop: '16px'
        }}>
          {/* View All Button with same purple background as ProductCards */}
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
          {orders.length > 1 && (
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
          marginTop: '16px'
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