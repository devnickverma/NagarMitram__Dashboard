/**
 * Order Status API for AshiD Diamonds
 * Handles order status tracking and history
 */

import { apiClient } from './client';
import {
  IOrderStatus,
  IOrderStatusRequest,
  IOrderStatusItem,
  IApiResponse,
} from './types';

export class OrderStatusAPI {
  /**
   * Get order status by web reference number
   */
  async getOrderStatusByWebReference(webReferenceNo: string): Promise<IApiResponse<IOrderStatus>> {
    try {
      return await apiClient.get<IOrderStatus>(`/api/orderstatus/webreference/${webReferenceNo}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order status by PO number
   */
  async getOrderStatusByPO(poNo: string): Promise<IApiResponse<IOrderStatus>> {
    try {
      return await apiClient.get<IOrderStatus>(`/api/orderstatus/po/${poNo}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order status by AshiD order number
   */
  async getOrderStatusByAshiOrderNo(ashiOrderNo: string): Promise<IApiResponse<IOrderStatus>> {
    try {
      return await apiClient.get<IOrderStatus>(`/api/orderstatus/ashi/${ashiOrderNo}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search orders with flexible criteria
   */
  async searchOrderStatus(request: IOrderStatusRequest): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (request.webreference_no) queryParams.append('webreference_no', request.webreference_no);
      if (request.po_no) queryParams.append('po_no', request.po_no);
      if (request.ashi_order_no) queryParams.append('ashi_order_no', request.ashi_order_no);
      if (request.order_status) queryParams.append('order_status', request.order_status);
      if (request.start_date) queryParams.append('start_date', request.start_date);
      if (request.end_date) queryParams.append('end_date', request.end_date);

      const url = `/api/orderstatus/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get<IOrderStatus[]>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all orders for the current user
   */
  async getAllOrders(): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      return await apiClient.get<IOrderStatus[]>('/api/orderstatus');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      return await apiClient.get<IOrderStatus[]>(`/api/orderstatus?status=${encodeURIComponent(status)}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent orders (last 30 days)
   */
  async getRecentOrders(days: number = 30): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      return await this.searchOrderStatus({
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending orders
   */
  async getPendingOrders(): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      return await this.getOrdersByStatus('pending');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shipped orders
   */
  async getShippedOrders(): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      return await this.getOrdersByStatus('shipped');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get delivered orders
   */
  async getDeliveredOrders(): Promise<IApiResponse<IOrderStatus[]>> {
    try {
      return await this.getOrdersByStatus('delivered');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track shipment by tracking number
   */
  async trackShipment(trackingNo: string): Promise<IApiResponse<{
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
    trackingEvents: Array<{
      date: string;
      status: string;
      location: string;
      description: string;
    }>;
  }>> {
    try {
      return await apiClient.get(`/api/orderstatus/track/${trackingNo}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order timeline/history
   */
  async getOrderTimeline(orderNo: string): Promise<IApiResponse<Array<{
    date: string;
    status: string;
    description: string;
    notes?: string;
  }>>> {
    try {
      return await apiClient.get(`/api/orderstatus/${orderNo}/timeline`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status (if user has permission)
   */
  async updateOrderStatus(
    orderNo: string,
    status: string,
    notes?: string
  ): Promise<IApiResponse<IOrderStatus>> {
    try {
      return await apiClient.put<IOrderStatus>(`/api/orderstatus/${orderNo}`, {
        status,
        notes,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel an order (if cancellation is allowed)
   */
  async cancelOrder(orderNo: string, reason?: string): Promise<IApiResponse<IOrderStatus>> {
    try {
      return await apiClient.post<IOrderStatus>(`/api/orderstatus/${orderNo}/cancel`, {
        reason,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request order status notification
   */
  async subscribeToOrderUpdates(
    orderNo: string,
    email: string,
    phone?: string
  ): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>(`/api/orderstatus/${orderNo}/subscribe`, {
        email,
        phone,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order documents (invoices, receipts, etc.)
   */
  async getOrderDocuments(orderNo: string): Promise<IApiResponse<Array<{
    documentType: string;
    documentUrl: string;
    documentName: string;
    createdDate: string;
  }>>> {
    try {
      return await apiClient.get(`/api/orderstatus/${orderNo}/documents`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download order document
   */
  async downloadOrderDocument(orderNo: string, documentId: string): Promise<IApiResponse<Blob>> {
    try {
      return await apiClient.get(`/api/orderstatus/${orderNo}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const orderStatusAPI = new OrderStatusAPI();