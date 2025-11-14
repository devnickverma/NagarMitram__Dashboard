export const CHAT_SUGGESTIONS = [
  {
    id: 'order-status',
    text: 'Track my order status',
    category: 'orders',
  },
  // {
  //   id: 'return-exchange',
  //   text: 'Return or exchange an item',
  //   category: 'returns',
  // },
  {
    id: 'payment-billing',
    text: 'Help with payment or billing',
    category: 'billing',
  },
  {
    id: 'product-info',
    text: 'What are the top-selling diamond Rings?',
    category: 'products',
  },
  // {
  //   id: 'shipping-delivery',
  //   text: 'Shipping and delivery options',
  //   category: 'shipping',
  // },
  // {
  //   id: 'account-help',
  //   text: 'Account settings and login issues',
  //   category: 'account',
  // },
] as const;

export const DEFAULT_SUGGESTIONS = CHAT_SUGGESTIONS.slice(0, 3);
