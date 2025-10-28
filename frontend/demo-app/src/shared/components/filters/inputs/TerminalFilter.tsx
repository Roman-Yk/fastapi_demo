import React, { useMemo } from 'react';
import { SegmentedControl, Skeleton } from '@mantine/core';
import { FilterProps } from '../types';
import { useTerminals } from '../../../../domains/terminals/hooks/useTerminals';

export interface TerminalFilterProps extends FilterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showAllOption?: boolean;
}

/**
 * Terminal filter component with always-visible segmented control
 * Fetches terminals from backend and displays as switch selection
 *
 * Usage:
 * ```tsx
 * <TerminalFilter
 *   source="terminalFilter"
 *   label="Terminal"
 *   alwaysOn
 *   size="md"
 *   radius="lg"
 * />
 * ```
 */
export const TerminalFilter: React.FC<TerminalFilterProps> = ({
  source: _source,
  label: _label,
  value,
  onChange,
  size = 'md',
  radius = 'lg',
  color = 'blue',
  fullWidth = false,
  orientation = 'horizontal',
  showAllOption = true,
  ...props
}) => {
  const { data: terminals, loading } = useTerminals();

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Convert terminals to SegmentedControl data format
  const data = useMemo(() => {
    const options = terminals.map(terminal => ({
      value: terminal.id,
      label: terminal.name
    }));

    if (showAllOption) {
      return [
        { value: 'all', label: 'All' },
        ...options
      ];
    }

    return options;
  }, [terminals, showAllOption]);

  if (loading) {
    return <Skeleton height={36} width={300} radius={radius} />;
  }

  return (
    <SegmentedControl
      value={value || 'all'}
      onChange={handleChange}
      data={data}
      size={size}
      radius={radius}
      color={color}
      fullWidth={fullWidth}
      orientation={orientation}
      transitionDuration={200}
      transitionTimingFunction="ease"
      {...props}
    />
  );
};
