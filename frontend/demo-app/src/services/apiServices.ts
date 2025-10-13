import { BaseApiService } from './baseApiService';
import { Order } from '../types/order';

// API-specific interfaces (separate from domain types)
export interface CreateOrderRequest {
  reference: string;
  service: number;
  terminal_id: string;
  eta_date?: string;
  eta_time?: string;
  etd_date?: string;
  etd_time?: string;
  commodity?: string;
  pallets?: number;
  boxes?: number;
  kilos?: number;
  notes?: string;
  priority?: boolean;
  eta_driver_id?: string;
  eta_truck_id?: string;
  eta_trailer_id?: string;
  etd_driver_id?: string;
  etd_truck_id?: string;
  etd_trailer_id?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {}

export interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
}

export interface Terminal {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Trailer {
  id: string;
  license_plate: string;
  type: string | null;
  capacity: number | null;
}

export interface Truck {
  id: string;
  truck_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
}

// Service implementations
class OrderApiService extends BaseApiService<Order, CreateOrderRequest, UpdateOrderRequest> {
  protected endpoint = '/orders';
}

class DriverApiService extends BaseApiService<Driver> {
  protected endpoint = '/drivers';
}

class TerminalApiService extends BaseApiService<Terminal> {
  protected endpoint = '/terminals';
}

class TrailerApiService extends BaseApiService<Trailer> {
  protected endpoint = '/trailers';
}

class TruckApiService extends BaseApiService<Truck> {
  protected endpoint = '/trucks';
}

// Export service instances
export const orderApi = new OrderApiService();
export const driverApi = new DriverApiService();
export const terminalApi = new TerminalApiService();
export const trailerApi = new TrailerApiService();
export const truckApi = new TruckApiService();

// Legacy compatibility - can be removed once all components are updated
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
  createDriver: (driver: Omit<Driver, 'id'>) => driverApi.create(driver),
  updateDriver: (id: string, driver: Partial<Omit<Driver, 'id'>>) => driverApi.update(id, driver),
  deleteDriver: (id: string) => driverApi.delete(id),

  // Terminals
  getTerminals: () => terminalApi.getAll(),
  getTerminal: (id: string) => terminalApi.getById(id),
  createTerminal: (terminal: Omit<Terminal, 'id'>) => terminalApi.create(terminal),
  updateTerminal: (id: string, terminal: Partial<Omit<Terminal, 'id'>>) => terminalApi.update(id, terminal),
  deleteTerminal: (id: string) => terminalApi.delete(id),

  // Trailers
  getTrailers: () => trailerApi.getAll(),
  getTrailer: (id: string) => trailerApi.getById(id),
  createTrailer: (trailer: Omit<Trailer, 'id'>) => trailerApi.create(trailer),
  updateTrailer: (id: string, trailer: Partial<Omit<Trailer, 'id'>>) => trailerApi.update(id, trailer),
  deleteTrailer: (id: string) => trailerApi.delete(id),

  // Trucks
  getTrucks: () => truckApi.getAll(),
  getTruck: (id: string) => truckApi.getById(id),
  createTruck: (truck: Omit<Truck, 'id'>) => truckApi.create(truck),
  updateTruck: (id: string, truck: Partial<Omit<Truck, 'id'>>) => truckApi.update(id, truck),
  deleteTruck: (id: string) => truckApi.delete(id),
};

export default ApiService;