import { Order, OrderService, CommodityType } from '../types/order';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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

// Generic API functions
class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    return this.makeRequest<Order[]>('/orders');
  }

  static async getOrder(id: string): Promise<Order> {
    return this.makeRequest<Order>(`/orders/${id}`);
  }

  static async createOrder(order: CreateOrderRequest): Promise<Order> {
    return this.makeRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  static async updateOrder(id: string, order: Partial<CreateOrderRequest>): Promise<Order> {
    return this.makeRequest<Order>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
    });
  }

  static async deleteOrder(id: string): Promise<void> {
    return this.makeRequest<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Drivers
  static async getDrivers(): Promise<Driver[]> {
    return this.makeRequest<Driver[]>('/drivers');
  }

  static async getDriver(id: string): Promise<Driver> {
    return this.makeRequest<Driver>(`/drivers/${id}`);
  }

  static async createDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
    return this.makeRequest<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
  }

  static async updateDriver(id: string, driver: Partial<Omit<Driver, 'id'>>): Promise<Driver> {
    return this.makeRequest<Driver>(`/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(driver),
    });
  }

  static async deleteDriver(id: string): Promise<void> {
    return this.makeRequest<void>(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // Terminals
  static async getTerminals(): Promise<Terminal[]> {
    return this.makeRequest<Terminal[]>('/terminals');
  }

  static async getTerminal(id: string): Promise<Terminal> {
    return this.makeRequest<Terminal>(`/terminals/${id}`);
  }

  static async createTerminal(terminal: Omit<Terminal, 'id'>): Promise<Terminal> {
    return this.makeRequest<Terminal>('/terminals', {
      method: 'POST',
      body: JSON.stringify(terminal),
    });
  }

  static async updateTerminal(id: string, terminal: Partial<Omit<Terminal, 'id'>>): Promise<Terminal> {
    return this.makeRequest<Terminal>(`/terminals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(terminal),
    });
  }

  static async deleteTerminal(id: string): Promise<void> {
    return this.makeRequest<void>(`/terminals/${id}`, {
      method: 'DELETE',
    });
  }

  // Trailers
  static async getTrailers(): Promise<Trailer[]> {
    return this.makeRequest<Trailer[]>('/trailers');
  }

  static async getTrailer(id: string): Promise<Trailer> {
    return this.makeRequest<Trailer>(`/trailers/${id}`);
  }

  static async createTrailer(trailer: Omit<Trailer, 'id'>): Promise<Trailer> {
    return this.makeRequest<Trailer>('/trailers', {
      method: 'POST',
      body: JSON.stringify(trailer),
    });
  }

  static async updateTrailer(id: string, trailer: Partial<Omit<Trailer, 'id'>>): Promise<Trailer> {
    return this.makeRequest<Trailer>(`/trailers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(trailer),
    });
  }

  static async deleteTrailer(id: string): Promise<void> {
    return this.makeRequest<void>(`/trailers/${id}`, {
      method: 'DELETE',
    });
  }

  // Trucks
  static async getTrucks(): Promise<Truck[]> {
    return this.makeRequest<Truck[]>('/trucks');
  }

  static async getTruck(id: string): Promise<Truck> {
    return this.makeRequest<Truck>(`/trucks/${id}`);
  }

  static async createTruck(truck: Omit<Truck, 'id'>): Promise<Truck> {
    return this.makeRequest<Truck>('/trucks', {
      method: 'POST',
      body: JSON.stringify(truck),
    });
  }

  static async updateTruck(id: string, truck: Partial<Omit<Truck, 'id'>>): Promise<Truck> {
    return this.makeRequest<Truck>(`/trucks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(truck),
    });
  }

  static async deleteTruck(id: string): Promise<void> {
    return this.makeRequest<void>(`/trucks/${id}`, {
      method: 'DELETE',
    });
  }

  // Order Documents
  static async uploadOrderDocuments(
    orderId: string, 
    files: File[], 
    metadata?: { name: string; type: string }[]
  ): Promise<any> {
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
    const defaultType = metadata?.[0]?.type || 'Other';
    formData.append('type', defaultType);

    const url = `${API_BASE_URL}/orders/${orderId}/documents/batch`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  static async getOrderDocuments(orderId: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/orders/${orderId}/documents/`);
  }

  static async deleteOrderDocument(orderId: string, documentId: string): Promise<void> {
    return this.makeRequest<void>(`/orders/${orderId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  static async viewOrderDocument(orderId: string, documentId: string): Promise<void> {
    const url = `${API_BASE_URL}/orders/${orderId}/documents/${documentId}/view`;
    window.open(url, '_blank');
  }

  static async downloadOrderDocument(orderId: string, documentId: string): Promise<void> {
    const url = `${API_BASE_URL}/orders/${orderId}/documents/${documentId}/download`;
    window.open(url, '_blank');
  }
}

export default ApiService;
export type { CreateOrderRequest, UpdateOrderRequest, Driver, Terminal, Trailer, Truck };