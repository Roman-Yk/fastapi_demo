// Enums matching backend
export enum OrderService {
  RELOAD_CAR_CAR = 1,
  RELOAD_CAR_TERMINAL_CAR = 2,
  INTO_PLUKK_STORAGE = 3,
}

export const OrderServiceLabels = {
  [OrderService.RELOAD_CAR_CAR]: 'Reload Car-Car',
  [OrderService.RELOAD_CAR_TERMINAL_CAR]: 'Reload Car-Terminal-Car',
  [OrderService.INTO_PLUKK_STORAGE]: 'Into Plukk Storage',
};

export const OrderServiceShortLabels = {
  [OrderService.RELOAD_CAR_CAR]: 'C-C',
  [OrderService.RELOAD_CAR_TERMINAL_CAR]: 'C-T-C',
  [OrderService.INTO_PLUKK_STORAGE]: 'Plukk',
};

export enum CommodityType {
  SALMON = 'salmon',
  SALMON_PROD = 'salmon_prod',
  SALMON_MIX = 'salmon_mix',
  TROUTH = 'trouth',
  WHITEFISH = 'whitefish',
  BACALAO = 'bacalao',
  DRYFISH = 'dryfish',
  SCRIMP = 'scrimp',
  OTHER = 'other',
}

export const CommodityLabels = {
  [CommodityType.SALMON]: 'Salmon',
  [CommodityType.SALMON_PROD]: 'Salmon Prod',
  [CommodityType.SALMON_MIX]: 'Salmon Mix',
  [CommodityType.TROUTH]: 'Trouth',
  [CommodityType.WHITEFISH]: 'Whitefish',
  [CommodityType.BACALAO]: 'Bacalao',
  [CommodityType.DRYFISH]: 'Dryfish',
  [CommodityType.SCRIMP]: 'Scrimp',
  [CommodityType.OTHER]: 'Other',
};

// Main Order interface matching backend model
export interface Order {
  id: string;
  reference: string;
  service: OrderService;
  eta_date: string | null;
  eta_time: string | null;
  etd_date: string | null;
  etd_time: string | null;
  commodity: CommodityType | null;
  pallets: number | null;
  boxes: number | null;
  kilos: number | null;
  notes: string | null;
  priority: boolean;
  terminal_id: string;
  created_at: string;
  updated_at: string;
  
  // ETA fields
  eta_driver_id: string | null;
  eta_trailer_id: string | null;
  eta_truck_id: string | null;
  eta_driver: string | null;
  eta_driver_phone: string | null;
  eta_truck: string | null;
  eta_trailer: string | null;
  
  // ETD fields
  etd_driver_id: string | null;
  etd_trailer_id: string | null;
  etd_truck_id: string | null;
  etd_driver: string | null;
  etd_driver_phone: string | null;
  etd_truck: string | null;
  etd_trailer: string | null;
}

// Date filter options
export enum DateFilterOption {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  TOMORROW = 'tomorrow',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  LAST_WEEK = 'last_week',
  ALL = 'All'
}

export const DateFilterLabels = {
  [DateFilterOption.TODAY]: 'Today',
  [DateFilterOption.YESTERDAY]: 'Yesterday',
  [DateFilterOption.TOMORROW]: 'Tomorrow',
  [DateFilterOption.THIS_WEEK]: 'This Week',
  [DateFilterOption.THIS_MONTH]: 'This Month',
  [DateFilterOption.LAST_WEEK]: 'Last Week',
  [DateFilterOption.ALL]: 'All',
};

// Location filter options
export enum LocationFilter {
  OSLO = 'oslo',
  WSC = 'wsc',
  ALL = 'All'
}

export const LocationFilterLabels = {
  [LocationFilter.OSLO]: 'Oslo',
  [LocationFilter.WSC]: 'WSC',
  [LocationFilter.ALL]: 'All',
};

// Status filter options
export enum StatusFilter {
  NOT_ACTIVE = 'not_active',
  ACTIVE = 'active',
  SEARCH_IN_DOCS = 'search_in_docs'
}

export const StatusFilterLabels = {
  [StatusFilter.NOT_ACTIVE]: 'Not Active',
  [StatusFilter.ACTIVE]: 'Active',
  [StatusFilter.SEARCH_IN_DOCS]: 'Search in Docs',
};

// Filter interfaces
export interface OrderFilters {
  dateFilter: DateFilterOption;
  locationFilter: LocationFilter | null;
  statusFilter: StatusFilter | null;
  serviceFilter: OrderService | null;
  commodityFilter: CommodityType | null;
  priorityFilter: boolean | null;
  searchText: string;
  inTerminal: boolean;
}

// Grid column configuration
export interface OrderGridColumn {
  field: keyof Order;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
} 