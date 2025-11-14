/**
 * Session Management System
 * Handles user sessions, authentication, and session persistence
 */

export interface IUserSession {
  sessionId: string;
  userId?: string;
  userAgent: string;
  ipAddress?: string;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
  metadata: {
    conversationCount: number;
    messageCount: number;
    preferences: Record<string, unknown>;
    tags: string[];
  };
}

export interface ISessionPreferences extends Record<string, unknown> {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
}

class SessionManager {
  private readonly SESSION_KEY = 'ashi_widget_session';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private currentSession: IUserSession | null = null;

  constructor() {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.setupSessionCleanup();
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${randomPart}`;
  }

  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `user_${timestamp}_${randomPart}`;
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  private isStorageAvailable(): boolean {
    try {
      const testKey = '__session_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getStoredSession(): IUserSession | null {
    try {
      if (!this.isStorageAvailable()) return null;
      
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session: IUserSession = JSON.parse(stored);
      
      // Check if session is expired
      const lastActive = new Date(session.lastActiveAt).getTime();
      const now = Date.now();
      
      if (now - lastActive > this.SESSION_TIMEOUT) {
        this.clearStoredSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  private saveSession(session: IUserSession): boolean {
    try {
      if (!this.isStorageAvailable()) return false;
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  private clearStoredSession(): void {
    try {
      if (this.isStorageAvailable()) {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  private initializeSession(): void {
    // Try to load existing session
    const storedSession = this.getStoredSession();
    
    if (storedSession) {
      // Update last active time
      storedSession.lastActiveAt = new Date().toISOString();
      storedSession.isActive = true;
      this.currentSession = storedSession;
      this.saveSession(storedSession);
    } else {
      // Create new session
      this.createNewSession();
    }
  }

  private setupSessionCleanup(): void {
    // Update session activity every 30 seconds
    setInterval(() => {
      if (this.currentSession) {
        this.updateActivity();
      }
    }, 30000);

    // Handle page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.currentSession) {
          this.currentSession.isActive = false;
          this.saveSession(this.currentSession);
        }
      });

      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (this.currentSession) {
          if (document.hidden) {
            this.currentSession.isActive = false;
          } else {
            this.currentSession.isActive = true;
            this.updateActivity();
          }
          this.saveSession(this.currentSession);
        }
      });
    }
  }

  /**
   * Create a new session
   */
  createNewSession(userId?: string): IUserSession {
    const now = new Date().toISOString();
    
    const session: IUserSession = {
      sessionId: this.generateSessionId(),
      userId: userId || this.generateUserId(),
      userAgent: this.getUserAgent(),
      createdAt: now,
      lastActiveAt: now,
      isActive: true,
      metadata: {
        conversationCount: 0,
        messageCount: 0,
        preferences: this.getDefaultPreferences(),
        tags: []
      }
    };

    this.currentSession = session;
    this.saveSession(session);

    return session;
  }

  /**
   * Get current session
   */
  getCurrentSession(): IUserSession | null {
    return this.currentSession;
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.currentSession?.sessionId || null;
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.currentSession?.userId || null;
  }

  /**
   * Update session activity
   */
  updateActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActiveAt = new Date().toISOString();
      this.currentSession.isActive = true;
      this.saveSession(this.currentSession);
    }
  }

  /**
   * Update session metadata
   */
  updateMetadata(updates: Partial<IUserSession['metadata']>): boolean {
    if (!this.currentSession) return false;

    this.currentSession.metadata = {
      ...this.currentSession.metadata,
      ...updates
    };

    this.updateActivity();
    return this.saveSession(this.currentSession);
  }

  /**
   * Increment conversation count
   */
  incrementConversationCount(): void {
    if (this.currentSession) {
      this.currentSession.metadata.conversationCount++;
      this.saveSession(this.currentSession);
    }
  }

  /**
   * Increment message count
   */
  incrementMessageCount(): void {
    if (this.currentSession) {
      this.currentSession.metadata.messageCount++;
      this.saveSession(this.currentSession);
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): ISessionPreferences {
    return {
      theme: 'auto',
      language: 'en',
      notifications: true,
      autoSave: true,
      compactMode: false,
      showTimestamps: false
    };
  }

  /**
   * Get user preferences
   */
  getPreferences(): ISessionPreferences {
    return (this.currentSession?.metadata.preferences as unknown as ISessionPreferences) || this.getDefaultPreferences();
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<ISessionPreferences>): boolean {
    if (!this.currentSession) return false;

    this.currentSession.metadata.preferences = {
      ...this.getPreferences(),
      ...preferences
    };

    this.updateActivity();
    return this.saveSession(this.currentSession);
  }

  /**
   * Add session tags
   */
  addTag(tag: string): boolean {
    if (!this.currentSession) return false;

    if (!this.currentSession.metadata.tags.includes(tag)) {
      this.currentSession.metadata.tags.push(tag);
      this.saveSession(this.currentSession);
    }

    return true;
  }

  /**
   * Remove session tag
   */
  removeTag(tag: string): boolean {
    if (!this.currentSession) return false;

    const index = this.currentSession.metadata.tags.indexOf(tag);
    if (index > -1) {
      this.currentSession.metadata.tags.splice(index, 1);
      this.saveSession(this.currentSession);
      return true;
    }

    return false;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.saveSession(this.currentSession);
      this.currentSession = null;
    }
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    this.currentSession = null;
    this.clearStoredSession();
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    if (!this.currentSession) return 0;

    const created = new Date(this.currentSession.createdAt).getTime();
    const lastActive = new Date(this.currentSession.lastActiveAt).getTime();
    
    return lastActive - created;
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    if (!this.currentSession) return false;

    const lastActive = new Date(this.currentSession.lastActiveAt).getTime();
    const now = Date.now();
    
    return now - lastActive < this.SESSION_TIMEOUT;
  }

  /**
   * Refresh session (extend timeout)
   */
  refreshSession(): boolean {
    if (!this.currentSession) return false;

    this.updateActivity();
    return true;
  }

  /**
   * Export session data
   */
  exportSession(): string | null {
    if (!this.currentSession) return null;
    
    return JSON.stringify(this.currentSession, null, 2);
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    sessionId: string | null;
    userId: string | null;
    duration: number;
    conversationCount: number;
    messageCount: number;
    isActive: boolean;
    createdAt: string | null;
    lastActiveAt: string | null;
  } {
    if (!this.currentSession) {
      return {
        sessionId: null,
        userId: null,
        duration: 0,
        conversationCount: 0,
        messageCount: 0,
        isActive: false,
        createdAt: null,
        lastActiveAt: null
      };
    }

    return {
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId || null,
      duration: this.getSessionDuration(),
      conversationCount: this.currentSession.metadata.conversationCount,
      messageCount: this.currentSession.metadata.messageCount,
      isActive: this.currentSession.isActive,
      createdAt: this.currentSession.createdAt,
      lastActiveAt: this.currentSession.lastActiveAt
    };
  }
}

// Singleton instance
export const sessionManager = new SessionManager();