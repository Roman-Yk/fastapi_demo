import React from 'react';
import { Text, Badge } from '@mantine/core';
import { CommodityType, CommodityLabels } from '../../../domains/orders/types/order';
import { FieldProps } from './types';

export interface CommodityFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'badge';
}

/**
 * Field component for displaying commodity type in grids
 *
 * Usage:
 * ```tsx
 * <CommodityField
 *   record={record}
 *   source="commodity"
 *   variant="badge"
 * />
 * ```
 */
export const CommodityField: React.FC<CommodityFieldProps> = ({
  record,
  source = 'commodity',
  size = 'sm',
  variant = 'text',
  ...props
}) => {
  const commodity = record?.[source] as CommodityType | null;

  if (!commodity) {
    return <Text size={size} c="dimmed">-</Text>;
  }

  const label = CommodityLabels[commodity] || commodity;

  if (variant === 'badge') {
    return (
      <Badge size={size} variant="light" {...props}>
        {label}
      </Badge>
    );
  }

  return (
    <Text size={size} {...props}>
      {label}
    </Text>
  );
};
