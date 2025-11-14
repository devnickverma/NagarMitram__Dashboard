import { TMessageType } from '../lib/missing-sdk-exports';

export type TChatMessageType =
  | TMessageType
  | 'suggestion'
  | 'suggestion-outlined'
  | 'category-cards'
  | 'user-image'
  | 'product-suggestions'
  | 'order-cards';

export type TFeedbackType = 'good' | 'bad';

export interface IMessageCard {
  title: string;
  description: string;
  icon?: string;
}

export interface IMessageProduct {
  productNumber: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
}

export interface IMessageOrderProduct {
  imageUrl?: string;
  quantity: number;
}

export interface IMessageOrder {
  orderId: string;
  placedDate: string;
  products: Array<IMessageOrderProduct>;
}

export interface IChatMessage {
  id: string;
  type: TChatMessageType;
  sender?: 'user' | 'bot' | 'system';
  content: string;
  imageUrl?: string;
  imageName?: string;
  cards?: Array<IMessageCard>;
  products?: Array<IMessageProduct>;
  orders?: Array<IMessageOrder>;
}

export interface IImagePreview {
  url: string;
  name: string;
}
