import { 
  OrderService, 
  CommodityType,
  DateFilterOption,
  LocationFilter,
  StatusFilter,
  PriorityLevel
} from '../constants/orderConstants';

// Mock data generation
const generateMockOrder = (id) => {
  const services = Object.values(OrderService);
  const commodities = Object.values(CommodityType);
  const locations = Object.values(LocationFilter);
  const statuses = Object.values(StatusFilter);
  const priorities = Object.values(PriorityLevel);
  
  const now = new Date();
  const etaDate = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  const etdDate = new Date(etaDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
  
  return {
    id: `order-${id}`,
    reference: `ORD-${String(id).padStart(4, '0')}`,
    service: services[Math.floor(Math.random() * services.length)],
    eta_date: etaDate.toISOString().split('T')[0],
    eta_time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    etd_date: etdDate.toISOString().split('T')[0],
    etd_time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    commodity: Math.random() > 0.2 ? commodities[Math.floor(Math.random() * commodities.length)] : null,
    priority: Math.random() > 0.7,
    location: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    eta_driver: `Driver ${Math.floor(Math.random() * 50) + 1}`,
    eta_driver_phone: `+47 ${Math.floor(Math.random() * 90000000) + 10000000}`,
    eta_truck: `TRK-${Math.floor(Math.random() * 9000) + 1000}`,
    eta_trailer: Math.random() > 0.3 ? `TRL-${Math.floor(Math.random() * 9000) + 1000}` : null,
    etd_driver: `Driver ${Math.floor(Math.random() * 50) + 1}`,
    etd_driver_phone: `+47 ${Math.floor(Math.random() * 90000000) + 10000000}`,
    etd_truck: `TRK-${Math.floor(Math.random() * 9000) + 1000}`,
    etd_trailer: Math.random() > 0.3 ? `TRL-${Math.floor(Math.random() * 9000) + 1000}` : null,
    inTerminal: Math.random() > 0.6,
    created_at: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

// Generate mock orders
export const mockOrders = Array.from({ length: 50 }, (_, index) => generateMockOrder(index + 1));

// Filter function
export const filterOrders = (orders, filters) => {
  return orders.filter(order => {
    // Date filter
    if (filters.dateFilter && filters.dateFilter !== DateFilterOption.ALL) {
      const orderDate = new Date(order.eta_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filters.dateFilter) {
        case DateFilterOption.TODAY:
          const todayEnd = new Date(today);
          todayEnd.setDate(todayEnd.getDate() + 1);
          if (!(orderDate >= today && orderDate < todayEnd)) return false;
          break;
        case DateFilterOption.TOMORROW:
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowEnd = new Date(tomorrow);
          tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
          if (!(orderDate >= tomorrow && orderDate < tomorrowEnd)) return false;
          break;
        case DateFilterOption.THIS_WEEK:
          const weekStart = new Date(today);
          const dayOfWeek = weekStart.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          weekStart.setDate(weekStart.getDate() - daysToMonday);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (!(orderDate >= weekStart && orderDate < weekEnd)) return false;
          break;
        case DateFilterOption.NEXT_WEEK:
          const nextWeekStart = new Date(today);
          const dayOfWeekNext = nextWeekStart.getDay();
          const daysToNextMonday = dayOfWeekNext === 0 ? 1 : 8 - dayOfWeekNext;
          nextWeekStart.setDate(nextWeekStart.getDate() + daysToNextMonday);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
          if (!(orderDate >= nextWeekStart && orderDate < nextWeekEnd)) return false;
          break;
        case DateFilterOption.THIS_MONTH:
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          if (!(orderDate >= monthStart && orderDate < monthEnd)) return false;
          break;
      }
    }
    
    // Location filter
    if (filters.locationFilter && order.location !== filters.locationFilter) {
      return false;
    }
    
    // Status filter
    if (filters.statusFilter && order.status !== filters.statusFilter) {
      return false;
    }
    
    // Service filter
    if (filters.serviceFilter && order.service !== filters.serviceFilter) {
      return false;
    }
    
    // Commodity filter
    if (filters.commodityFilter && order.commodity !== filters.commodityFilter) {
      return false;
    }
    
    // Priority filter
    if (filters.priorityFilter !== null && filters.priorityFilter !== undefined) {
      if (filters.priorityFilter && !order.priority) return false;
      if (!filters.priorityFilter && order.priority) return false;
    }
    
    // Search text filter
    if (filters.searchText && filters.searchText.trim()) {
      const searchTerm = filters.searchText.toLowerCase().trim();
      const searchableFields = [
        order.reference,
        order.eta_driver,
        order.eta_truck,
        order.eta_trailer,
        order.etd_driver,
        order.etd_truck,
        order.etd_trailer,
      ].filter(Boolean);
      
      const matchesSearch = searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      
      if (!matchesSearch) return false;
    }
    
    // In terminal filter
    if (filters.inTerminal !== undefined && filters.inTerminal !== null) {
      if (filters.inTerminal && !order.inTerminal) return false;
      if (!filters.inTerminal && order.inTerminal) return false;
    }
    
    return true;
  });
};
