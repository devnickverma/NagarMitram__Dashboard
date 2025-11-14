import { z } from 'zod';

import { DE_TYPES, MESSAGE_TYPES, TASK_STATUS } from '../utils/constants';

// Digital Employee types
export type TDEType = (typeof DE_TYPES)[keyof typeof DE_TYPES];

// Task types
export type TTaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export interface ITask {
  id: string;
  title: string;
  deType: TDEType;
  status: TTaskStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
}

// Message types
export type TMessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface IMessage {
  id: string;
  taskId: string;
  type: TMessageType;
  content: string;
  timestamp: Date;
  attachments?: IAttachment[];
  metadata?: Record<string, unknown>;
}

// File/Attachment types
export interface IAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

// User types
export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences?: IUserPreferences;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultDE?: TDEType;
  notifications: boolean;
}

// API Response types
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// Validation schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  type: z.enum(['user', 'assistant', 'system', 'error']),
  content: z.string(),
  timestamp: z.date(),
});
