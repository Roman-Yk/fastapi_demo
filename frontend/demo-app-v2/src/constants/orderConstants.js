// Order Service Types
export const OrderService = {
  RELOAD_CAR_CAR: 1,
  RELOAD_CAR_TERMINAL_CAR: 2,
  INTO_PLUKK_STORAGE: 3,
};

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

// Commodity Types
export const CommodityType = {
  SALMON: 'salmon',
  SALMON_PROD: 'salmon_prod',
  SALMON_MIX: 'salmon_mix',
  TROUTH: 'trouth',
  WHITEFISH: 'whitefish',
  BACALAO: 'bacalao',
  DRYFISH: 'dryfish',
  SCRIMP: 'scrimp',
  OTHER: 'other',
};

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

// Date Filter Options
export const DateFilterOption = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'thisWeek',
  NEXT_WEEK: 'nextWeek',
  THIS_MONTH: 'thisMonth',
  ALL: 'all',
};

export const DateFilterLabels = {
  [DateFilterOption.TODAY]: 'Today',
  [DateFilterOption.TOMORROW]: 'Tomorrow',
  [DateFilterOption.THIS_WEEK]: 'This Week',
  [DateFilterOption.NEXT_WEEK]: 'Next Week',
  [DateFilterOption.THIS_MONTH]: 'This Month',
  [DateFilterOption.ALL]: 'all',
};

// Location Filters
export const LocationFilter = {
  TERMINAL_A: 'terminal_a',
  TERMINAL_B: 'terminal_b',
  WAREHOUSE_1: 'warehouse_1',
  WAREHOUSE_2: 'warehouse_2',
  PORT: 'port',
};

export const LocationFilterLabels = {
  [LocationFilter.TERMINAL_A]: 'Terminal A',
  [LocationFilter.TERMINAL_B]: 'Terminal B',
  [LocationFilter.WAREHOUSE_1]: 'Warehouse 1',
  [LocationFilter.WAREHOUSE_2]: 'Warehouse 2',
  [LocationFilter.PORT]: 'Port',
};

// Status Filters
export const StatusFilter = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
};

export const StatusFilterLabels = {
  [StatusFilter.PENDING]: 'Pending',
  [StatusFilter.IN_PROGRESS]: 'In Progress',
  [StatusFilter.COMPLETED]: 'Completed',
  [StatusFilter.CANCELLED]: 'Cancelled',
  [StatusFilter.ON_HOLD]: 'On Hold',
};

// Priority Levels
export const PriorityLevel = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PriorityLabels = {
  [PriorityLevel.LOW]: 'Low',
  [PriorityLevel.NORMAL]: 'Normal',
  [PriorityLevel.HIGH]: 'High',
  [PriorityLevel.URGENT]: 'Urgent',
};
