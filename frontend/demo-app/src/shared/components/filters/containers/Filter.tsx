import React from 'react';
import { FilterProps } from '../types';

export interface FilterWrapperProps {
  children: React.ReactElement<FilterProps>[];
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  totalCount?: number;
  filteredCount?: number;
}

export const Filter: React.FC<FilterWrapperProps> = () => {
  // This is just a logical wrapper - the actual rendering will be handled
  // by the List component that uses these filters
  return null;
};

// Helper function to extract filter definitions from Filter children
export const getFilterDefinitions = (children: React.ReactElement<FilterProps>[]) => {
  const alwaysOnFilters: React.ReactElement<FilterProps>[] = [];
  const availableFilters: {
    key: string;
    label: string;
    icon?: React.ComponentType<{ size?: number }>;
    filter: React.ReactElement<FilterProps>;
  }[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<FilterProps>(child)) return;
    
    const { source, label, alwaysOn } = child.props;
    
    if (alwaysOn) {
      alwaysOnFilters.push(child);
    } else {
      // For optional filters, we need the icon - this could be passed as a prop
      // or we could have a mapping of field types to icons
      availableFilters.push({
        key: source,
        label: label || source,
        filter: child
      });
    }
  });

  return { alwaysOnFilters, availableFilters };
};