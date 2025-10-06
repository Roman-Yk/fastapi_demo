// Export all filter types
export type { FilterProps } from './types';

// Export the main Filter wrapper (react-admin style)
export { Filter, getFilterDefinitions } from './Filter';
export type { FilterWrapperProps } from './Filter';

// Export ListFilters component
export { ListFilters } from './ListFilters';
export type { ListFiltersProps } from './ListFilters';

// Export filter components
export { TextFilter } from './TextFilter';
export type { TextFilterProps } from './TextFilter';

export { SelectFilter } from './SelectFilter';
export type { SelectFilterProps, SelectOption } from './SelectFilter';

export { BooleanFilter } from './BooleanFilter';
export type { BooleanFilterProps } from './BooleanFilter';

export { DateRangeFilter } from './DateRangeFilter';
export type { DateRangeFilterProps, DateRangeOption } from './DateRangeFilter';

// Legacy FilterForm (keep for backward compatibility)
export { FilterForm } from './FilterForm';
export type { FilterFormProps } from './FilterForm';