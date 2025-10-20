/**
 * Order Document API Service
 * Handles document upload, download, and management for orders
 */

import { BaseApiService } from '../../../services/baseApiService';
import { OrderDocument, OrderDocumentType, BatchUploadResponse } from '../types/document';
import { formatApiUrl } from '../../../utils/config';

export interface DocumentMetadata {
  name: string;
  type: OrderDocumentType;
}

export interface UpdateDocumentRequest {
  title?: string;
  type?: OrderDocumentType;
}

/**
 * Order Document API Service
 * Extends BaseApiService with document-specific operations
 */
class OrderDocumentApiService extends BaseApiService<
  OrderDocument,
  never,  // Documents are created via upload, not standard create
  UpdateDocumentRequest
> {
  protected endpoint = ''; // Empty endpoint since documents are accessed through orders

  /**
   * Get all documents for a specific order
   */
  async getByOrderId(orderId: string): Promise<OrderDocument[]> {
    return this.customRequest<OrderDocument[]>(`/orders/${orderId}/documents/`);
  }

  /**
   * Upload documents to an order
   */
  async uploadDocuments(
    orderId: string,
    files: File[],
    metadata?: DocumentMetadata[]
  ): Promise<BatchUploadResponse> {
    const formData = new FormData();

    files.forEach((file, index) => {
      // If metadata provided, create a new file with the custom name
      const customName = metadata?.[index]?.name || file.name;
      const newFile = new File([file], customName, { type: file.type });
      formData.append('files', newFile);

      // Append individual type for each file if metadata provided
      if (metadata?.[index]?.type) {
        formData.append('types', metadata[index].type);
      }
    });

    // Always provide a default type parameter as fallback
    const defaultType = metadata?.[0]?.type || OrderDocumentType.Other;
    formData.append('type', defaultType);

    const url = formatApiUrl(`/orders/${orderId}/documents/batch`);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Update a document's metadata
   */
  async updateDocument(
    orderId: string,
    documentId: string,
    data: UpdateDocumentRequest
  ): Promise<void> {
    return this.customRequest<void>(`/orders/${orderId}/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(orderId: string, documentId: string): Promise<void> {
    return this.customRequest<void>(`/orders/${orderId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get document view URL
   */
  getDocumentViewUrl(orderId: string, documentId: string): string {
    return formatApiUrl(`/orders/${orderId}/documents/${documentId}/view`);
  }

  /**
   * Get document download URL
   */
  getDocumentDownloadUrl(orderId: string, documentId: string): string {
    return formatApiUrl(`/orders/${orderId}/documents/${documentId}/download`);
  }

  /**
   * Open document in new tab
   */
  viewDocument(orderId: string, documentId: string): void {
    const url = this.getDocumentViewUrl(orderId, documentId);
    window.open(url, '_blank');
  }

  /**
   * Download document
   */
  downloadDocument(orderId: string, documentId: string): void {
    const url = this.getDocumentDownloadUrl(orderId, documentId);
    window.open(url, '_blank');
  }
}

// Export singleton instance
export const orderDocumentApi = new OrderDocumentApiService();

export default orderDocumentApi;
