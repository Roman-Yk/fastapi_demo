/**
 * Backwards compatibility layer for old API service imports
 * This file should be deprecated and removed after updating all imports
 */

import { orderApi, type CreateOrderRequest, type UpdateOrderRequest } from '../domains/orders';
import { driverApi } from '../domains/drivers';
import { terminalApi } from '../domains/terminals';
import { truckApi, trailerApi } from '../domains/vehicles';
import { orderDocumentApi, type DocumentMetadata } from '../domains/orders/api/orderDocumentService';

// Re-export types for backwards compatibility
export { BaseApiService, BaseApiError } from './baseApiService';
export type { CreateOrderRequest, UpdateOrderRequest };
export type { Driver, CreateDriverRequest, UpdateDriverRequest } from '../domains/drivers';
export type { Terminal, CreateTerminalRequest, UpdateTerminalRequest } from '../domains/terminals';
export type { Truck, Trailer, CreateTruckRequest, UpdateTruckRequest, CreateTrailerRequest, UpdateTrailerRequest } from '../domains/vehicles';

// Re-export service instances
export { orderApi, driverApi, terminalApi, truckApi, trailerApi };

// Legacy ApiService class for backwards compatibility
const ApiService = {
  // Orders
  getOrders: () => orderApi.getAll(),
  getOrder: (id: string) => orderApi.getById(id),
  createOrder: (order: CreateOrderRequest) => orderApi.create(order),
  updateOrder: (id: string, order: UpdateOrderRequest) => orderApi.update(id, order),
  deleteOrder: (id: string) => orderApi.delete(id),

  // Drivers
  getDrivers: () => driverApi.getAll(),
  getDriver: (id: string) => driverApi.getById(id),
  createDriver: (driver: any) => driverApi.create(driver),
  updateDriver: (id: string, driver: any) => driverApi.update(id, driver),
  deleteDriver: (id: string) => driverApi.delete(id),

  // Terminals
  getTerminals: () => terminalApi.getAll(),
  getTerminal: (id: string) => terminalApi.getById(id),
  createTerminal: (terminal: any) => terminalApi.create(terminal),
  updateTerminal: (id: string, terminal: any) => terminalApi.update(id, terminal),
  deleteTerminal: (id: string) => terminalApi.delete(id),

  // Trailers
  getTrailers: () => trailerApi.getAll(),
  getTrailer: (id: string) => trailerApi.getById(id),
  createTrailer: (trailer: any) => trailerApi.create(trailer),
  updateTrailer: (id: string, trailer: any) => trailerApi.update(id, trailer),
  deleteTrailer: (id: string) => trailerApi.delete(id),

  // Trucks
  getTrucks: () => truckApi.getAll(),
  getTruck: (id: string) => truckApi.getById(id),
  createTruck: (truck: any) => truckApi.create(truck),
  updateTruck: (id: string, truck: any) => truckApi.update(id, truck),
  deleteTruck: (id: string) => truckApi.delete(id),

  // Order Documents - delegated to orderDocumentApi
  uploadOrderDocuments: (
    orderId: string,
    files: File[],
    metadata?: DocumentMetadata[]
  ) => orderDocumentApi.uploadDocuments(orderId, files, metadata),

  getOrderDocuments: (orderId: string) => orderDocumentApi.getByOrderId(orderId),

  deleteOrderDocument: (orderId: string, documentId: string) =>
    orderDocumentApi.deleteDocument(orderId, documentId),

  updateOrderDocument: (
    orderId: string,
    documentId: string,
    data: { title?: string; type?: string }
  ) => orderDocumentApi.updateDocument(orderId, documentId, data as any),

  viewOrderDocument: (orderId: string, documentId: string) =>
    orderDocumentApi.viewDocument(orderId, documentId),

  downloadOrderDocument: (orderId: string, documentId: string) =>
    orderDocumentApi.downloadDocument(orderId, documentId),
};

export default ApiService;