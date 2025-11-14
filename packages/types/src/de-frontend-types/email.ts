/**
 * Email API for AshiD Diamonds
 * Handles limited email functionality as found in Swagger documentation
 */

import { apiClient } from './client';
import {
  IEmailStyleDetailsFields,
  IEmailStyleDetailsRequest,
  IApiResponse,
} from './types';

export class EmailAPI {
  /**
   * Get email style details fields (from Swagger)
   * This appears to be the main email-related endpoint available
   */
  async getEmailStyleDetailsFields(): Promise<IApiResponse<IEmailStyleDetailsFields>> {
    try {
      return await apiClient.get<IEmailStyleDetailsFields>('/api/email/styledetails/fields');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send email with style details
   */
  async sendEmailStyleDetails(request: IEmailStyleDetailsRequest): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/styledetails/send', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send product details via email
   * Alternative endpoint that might be available
   */
  async sendProductByEmail(request: {
    itemcd: string;
    recipientEmail: string;
    senderEmail?: string;
    senderName?: string;
    personalMessage?: string;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/product/send', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Share product via email
   */
  async shareProduct(request: {
    itemcd: string;
    recipientEmail: string;
    senderEmail: string;
    senderName: string;
    message?: string;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/share/product', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send inquiry email about a product
   */
  async sendProductInquiry(request: {
    itemcd: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    inquiryMessage: string;
    requestCallback?: boolean;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/inquiry', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to email notifications
   */
  async subscribeToNotifications(request: {
    email: string;
    name?: string;
    preferences: {
      newArrivals?: boolean;
      salesAlerts?: boolean;
      priceDrops?: boolean;
      newsletter?: boolean;
    };
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/subscribe', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unsubscribe from email notifications
   */
  async unsubscribeFromNotifications(email: string, token?: string): Promise<IApiResponse<boolean>> {
    try {
      const requestData = { email };
      if (token) {
        (requestData as any).unsubscribeToken = token;
      }
      
      return await apiClient.post<boolean>('/api/email/unsubscribe', requestData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get email templates (if available)
   */
  async getEmailTemplates(): Promise<IApiResponse<Array<{
    templateId: string;
    templateName: string;
    description: string;
    fields: Array<{
      fieldName: string;
      fieldType: string;
      required: boolean;
    }>;
  }>>> {
    try {
      return await apiClient.get('/api/email/templates');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send custom email using template
   */
  async sendTemplateEmail(request: {
    templateId: string;
    recipientEmail: string;
    templateData: Record<string, any>;
    senderEmail?: string;
    senderName?: string;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/template/send', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request price quote via email
   */
  async requestPriceQuote(request: {
    itemcd: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    quantity?: number;
    specialRequirements?: string;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/quote/request', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send availability notification request
   */
  async requestAvailabilityNotification(request: {
    itemcd: string;
    customerEmail: string;
    customerName?: string;
    notifyWhenAvailable: boolean;
    notifyOnPriceChange?: boolean;
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/availability/notify', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send appointment request email
   */
  async requestAppointment(request: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    preferredDate?: string;
    preferredTime?: string;
    appointmentType: 'consultation' | 'viewing' | 'custom_design' | 'other';
    message?: string;
    interestedProducts?: string[];
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/appointment/request', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send contact form email
   */
  async sendContactForm(request: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    inquiryType?: 'general' | 'product' | 'order' | 'custom' | 'support';
  }): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>('/api/email/contact', request);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const emailAPI = new EmailAPI();