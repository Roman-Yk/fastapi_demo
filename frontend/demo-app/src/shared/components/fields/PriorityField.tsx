import React from 'react';
import { Tooltip } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface PriorityFieldProps extends FieldProps {
  color?: string;
  size?: number;
  tooltip?: string;
}

export const PriorityField: React.FC<PriorityFieldProps> = ({ 
  value,
  record,
  source,
  color = 'orange',
  size = 16,
  tooltip = 'Priority Order'
}) => {
  // If we have a record and source, get the value from record[source]
  const isPriority = value !== undefined ? value : record?.[source];
  
  if (!isPriority) {
    return null;
  }
  
  const icon = <IconStar size={size} color={color} />;
  
  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        {icon}
      </Tooltip>
    );
  }
  
  return icon;
};