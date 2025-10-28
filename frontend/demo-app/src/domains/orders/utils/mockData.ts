import { v4 as uuidv4 } from 'uuid';
import { Order, OrderService, CommodityType, DateFilterOption, OrderFilters } from '../types/order';

// Helper function to generate random date within a range
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Helper function to generate random time
const getRandomTime = (): string => {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
};

// Sample terminal IDs (would normally come from backend)
const terminalIds = [
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
];

// Sample names and vehicles
const drivers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'];
const trucks = ['truck-001', 'truck-002', 'truck-003', 'truck-004', 'truck-005'];
const trailers = ['trailer-a', 'trailer-b', 'trailer-c', 'trailer-d', 'trailer-e'];

// Generate mock orders
export const mockOrders: Order[] = Array.from({ length: 50 }, (_, index) => {
  const today = new Date();
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  const services = Object.values(OrderService).filter(v => typeof v === 'number') as OrderService[];
  const commodities = Object.values(CommodityType);
  
  const etaDate = getRandomDate(startDate, endDate);
  const etdDate = getRandomDate(new Date(etaDate), endDate);
  
  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  const truck = trucks[Math.floor(Math.random() * trucks.length)];
  const trailer = trailers[Math.floor(Math.random() * trailers.length)];
  
  return {
    id: uuidv4(),
    reference: `ORD-${(index + 1).toString().padStart(4, '0')}`,
    service: services[Math.floor(Math.random() * services.length)],
    eta_date: etaDate,
    eta_time: getRandomTime(),
    etd_date: etdDate,
    etd_time: getRandomTime(),
    commodity: commodities[Math.floor(Math.random() * commodities.length)],
    pallets: Math.floor(Math.random() * 50) + 1,
    boxes: Math.floor(Math.random() * 200) + 10,
    kilos: Math.round((Math.random() * 3000 + 500) * 100) / 100,
    notes: Math.random() > 0.7 ? `Special handling required for order ${index + 1}` : null,
    priority: Math.random() > 0.8,
    terminal_id: terminalIds[Math.floor(Math.random() * terminalIds.length)],
    created_at: getRandomDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000), today),
    updated_at: getRandomDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), today),
    
    // ETA fields
    eta_driver_id: uuidv4(),
    eta_trailer_id: uuidv4(),
    eta_truck_id: uuidv4(),
    eta_driver: driver,
    eta_driver_phone: `+47${Math.floor(Math.random() * 90000000) + 10000000}`,
    eta_truck: truck,
    eta_trailer: trailer,
    
    // ETD fields
    etd_driver_id: uuidv4(),
    etd_trailer_id: uuidv4(),
    etd_truck_id: uuidv4(),
    etd_driver: driver,
    etd_driver_phone: `+47${Math.floor(Math.random() * 90000000) + 10000000}`,
    etd_truck: truck,
    etd_trailer: trailer,
  };
});

// Helper function to get date range based on filter option
const getDateRange = (option: DateFilterOption): { start: string; end: string } => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];
  
  switch (option) {
    case DateFilterOption.TODAY:
      return { start: formatDate(today), end: formatDate(today) };
    case DateFilterOption.YESTERDAY:
      return { start: formatDate(yesterday), end: formatDate(yesterday) };
    case DateFilterOption.TOMORROW:
      return { start: formatDate(tomorrow), end: formatDate(tomorrow) };
    case DateFilterOption.THIS_WEEK:
      return { start: formatDate(thisWeekStart), end: formatDate(today) };
    case DateFilterOption.THIS_MONTH:
      return { start: formatDate(thisMonthStart), end: formatDate(today) };
    case DateFilterOption.LAST_WEEK:
      return { start: formatDate(lastWeekStart), end: formatDate(today) };
    case DateFilterOption.ALL:
      return { start: '1900-01-01', end: '2100-12-31' };
    default:
      return { start: formatDate(today), end: formatDate(today) };
  }
};

// Function to filter orders based on filters
export const filterOrders = (orders: Order[], filters: OrderFilters): Order[] => {
  return orders.filter(order => {
    // Date filter
    if (filters.date_range && filters.date_range !== DateFilterOption.ALL && order.eta_date) {
      const { start, end } = getDateRange(filters.date_range);
      if (order.eta_date < start || order.eta_date > end) {
        return false;
      }
    }

    // Service filter
    if (filters.service !== null && order.service !== filters.service) {
      return false;
    }

    // Commodity filter
    if (filters.commodity !== null && order.commodity !== filters.commodity) {
      return false;
    }

    // Priority filter
    if (filters.priority !== null && order.priority !== filters.priority) {
      return false;
    }

    // Location filter (mock implementation - in real app this would filter by terminal location)
    if (filters.location !== null) {
      // For demo purposes, we'll filter based on terminal_id patterns
      // In a real app, this would be based on actual terminal location data
      const terminalIndex = terminalIds.indexOf(order.terminal_id);
      if (filters.location === 'oslo' && terminalIndex !== 0) {
        return false;
      }
      if (filters.location === 'wsc' && terminalIndex !== 1) {
        return false;
      }
    }

    // Status filter (mock implementation)
    if (filters.status !== null) {
      // For demo purposes, we'll use priority and eta_date to simulate status
      if (filters.status === 'active' && !order.priority) {
        return false;
      }
      if (filters.status === 'not_active' && order.priority) {
        return false;
      }
      if (filters.status === 'search_in_docs' && !order.notes) {
        return false;
      }
    }

    // In Terminal filter (mock implementation)
    if (filters.in_terminal) {
      // For demo purposes, we'll consider orders with both ETA and ETD dates as "in terminal"
      if (!order.eta_date || !order.etd_date) {
        return false;
      }
    }

    // Search text filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.reference.toLowerCase().includes(searchLower) ||
        order.eta_driver?.toLowerCase().includes(searchLower) ||
        order.eta_truck?.toLowerCase().includes(searchLower) ||
        order.eta_trailer?.toLowerCase().includes(searchLower) ||
        order.notes?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}; 