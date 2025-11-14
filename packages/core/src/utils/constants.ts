/**
 * Application-wide constants
 */

export const APP_NAME = 'Digital Employee Platform';
export const APP_VERSION = '0.1.0';

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CHAT: '/api/chat',
  FILES: '/api/files',
  TASKS: '/api/tasks',
} as const;

export const DE_TYPES = {
  DA: 'data-analyst',
  CSR: 'customer-service',
  SA: 'sales-agent',
  HR: 'hr-assistant',
} as const;

export const TASK_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
  IDLE: 'idle',
} as const;

export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error',
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  MAX_FILES_PER_MESSAGE: 5,
} as const;

export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENTS: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
} as const;
