import React from 'react';

// Base field props interface
export interface FieldProps {
  source: string;
  label?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  record?: any; // The data record for this row
  value?: any; // The specific value from the record[source]
}

// Base field component type
export type FieldComponent<T = any> = React.ComponentType<FieldProps & T>;