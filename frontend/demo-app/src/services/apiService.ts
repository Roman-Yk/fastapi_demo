/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use domain-specific services instead:
 * - Orders: import from '@/domains/orders/api/orderService'
 * - Drivers: import from '@/domains/drivers/api/driverService'
 * - Terminals: import from '@/domains/terminals/api/terminalService'
 * - Vehicles: import from '@/domains/vehicles/api/truckService' or '@/domains/vehicles/api/trailerService'
 *
 * This file now acts as a compatibility layer to maintain backwards compatibility.
 */

import { Order, OrderService, CommodityType } from '../domains/orders/types/order';
import { orderApi } from '../domains/orders/api/orderService';
import { orderDocumentApi, DocumentMetadata } from '../domains/orders/api/orderDocumentService';
import { OrderDocument } from '../domains/orders/types/document';
import { driverApi } from '../domains/drivers/api/driverService';
import { terminalApi } from '../domains/terminals/api/terminalService';
import { truckApi } from '../domains/vehicles/api/truckService';
import { trailerApi } from '../domains/vehicles/api/trailerService';

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
}

interface Terminal {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface Trailer {
  id: string;
  license_plate: string;
  type: string | null;
  capacity: number | null;
}

interface Truck {
  id: string;
  truck_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
}

interface CreateOrderRequest {
  reference: string;
  service: OrderService;
  terminal_id: string;
  eta_date?: string;
  eta_time?: string;
  etd_date?: string;
  etd_time?: string;
  commodity?: CommodityType;
  pallets?: number;
  boxes?: number;
  kilos?: number;
  notes?: string;
  priority?: boolean;
  // ETA vehicle assignments
  eta_driver_id?: string;
  eta_truck_id?: string;
  eta_trailer_id?: string;
  // ETD vehicle assignments  
  etd_driver_id?: string;
  etd_truck_id?: string;
  etd_trailer_id?: string;
}

interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  id: string;
}

// Generic API functions - now using domain services
class ApiService {

  // Orders - delegated to domain service
  static async getOrders(): Promise<Order[]> {
    return orderApi.getAll();
  }

  static async getOrder(id: string): Promise<Order> {
    return orderApi.getById(id);
  }

  static async createOrder(order: CreateOrderRequest): Promise<Order> {
    return orderApi.create(order);
  }

  static async updateOrder(id: string, order: Partial<CreateOrderRequest>): Promise<Order> {
    return orderApi.update(id, order);
  }

  static async deleteOrder(id: string): Promise<void> {
    return orderApi.delete(id);
  }

  // Drivers - delegated to domain service
  static async getDrivers(): Promise<Driver[]> {
    return driverApi.getAll() as Promise<any>;
  }

  static async getDriver(id: string): Promise<Driver> {
    return driverApi.getById(id) as Promise<any>;
  }

  static async createDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    return driverApi.create(driver as any) as Promise<any>;
  }

  static async updateDriver(id: string, driver: Partial<Omit<Driver, 'id'>>): Promise<Driver> {
    return driverApi.update(id, driver as any) as Promise<any>;
  }

  static async deleteDriver(id: string): Promise<void> {
    return driverApi.delete(id);
  }

  // Terminals - delegated to domain service
  static async getTerminals(): Promise<Terminal[]> {
    return terminalApi.getAll() as Promise<any>;
  }

  static async getTerminal(id: string): Promise<Terminal> {
    return terminalApi.getById(id) as Promise<any>;
  }

  static async createTerminal(terminal: Omit<Terminal, 'id'>): Promise<Terminal> {
    return terminalApi.create(terminal as any) as Promise<any>;
  }

  static async updateTerminal(id: string, terminal: Partial<Omit<Terminal, 'id'>>): Promise<Terminal> {
    return terminalApi.update(id, terminal as any) as Promise<any>;
  }

  static async deleteTerminal(id: string): Promise<void> {
    return terminalApi.delete(id);
  }

  // Trailers - delegated to domain service
  static async getTrailers(): Promise<Trailer[]> {
    return trailerApi.getAll() as Promise<any>;
  }

  static async getTrailer(id: string): Promise<Trailer> {
    return trailerApi.getById(id) as Promise<any>;
  }

  static async createTrailer(trailer: Omit<Trailer, 'id'>): Promise<Trailer> {
    return trailerApi.create(trailer as any) as Promise<any>;
  }

  static async updateTrailer(id: string, trailer: Partial<Omit<Trailer, 'id'>>): Promise<Trailer> {
    return trailerApi.update(id, trailer as any) as Promise<any>;
  }

  static async deleteTrailer(id: string): Promise<void> {
    return trailerApi.delete(id);
  }

  // Trucks - delegated to domain service
  static async getTrucks(): Promise<Truck[]> {
    return truckApi.getAll() as Promise<any>;
  }

  static async getTruck(id: string): Promise<Truck> {
    return truckApi.getById(id) as Promise<any>;
  }

  static async createTruck(truck: Omit<Truck, 'id'>): Promise<Truck> {
    return truckApi.create(truck as any) as Promise<any>;
  }

  static async updateTruck(id: string, truck: Partial<Omit<Truck, 'id'>>): Promise<Truck> {
    return truckApi.update(id, truck as any) as Promise<any>;
  }

  static async deleteTruck(id: string): Promise<void> {
    return truckApi.delete(id);
  }

  // Order Documents - delegated to orderDocumentApi
  static async uploadOrderDocuments(
    orderId: string,
    files: File[],
    metadata?: DocumentMetadata[]
  ) {
    return orderDocumentApi.uploadDocuments(orderId, files, metadata);
  }

  static async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    return orderDocumentApi.getByOrderId(orderId);
  }

  static async deleteOrderDocument(orderId: string, documentId: string): Promise<void> {
    return orderDocumentApi.deleteDocument(orderId, documentId);
  }

  static async updateOrderDocument(
    orderId: string,
    documentId: string,
    data: { title?: string; type?: string }
  ): Promise<void> {
    return orderDocumentApi.updateDocument(orderId, documentId, data as any);
  }

  static async viewOrderDocument(orderId: string, documentId: string): Promise<void> {
    orderDocumentApi.viewDocument(orderId, documentId);
  }

  static async downloadOrderDocument(orderId: string, documentId: string): Promise<void> {
    orderDocumentApi.downloadDocument(orderId, documentId);
  }
}

export default ApiService;
export type { CreateOrderRequest, UpdateOrderRequest, Driver, Terminal, Trailer, Truck };