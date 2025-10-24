import React from 'react';
import { Text, Group } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface ReferenceTerminalFieldOptimizedProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  getTerminal: (id: string | null | undefined) => any;
}

/**
 * Optimized terminal field for grids with many rows
 *
 * Instead of calling useTerminal() for each row (which would be inefficient),
 * this component receives a getTerminal function from a parent that batched
 * all the data fetching.
 *
 * Usage in OrderGrid:
 * ```tsx
 * const { data: terminals } = useTerminals();
 * const getTerminal = (id: string | null | undefined) =>
 *   terminals.find(t => t.id === id) || null;
 *
 * <ReferenceTerminalFieldOptimized
 *   record={record}
 *   getTerminal={getTerminal}
 * />
 * ```
 */
export const ReferenceTerminalFieldOptimized: React.FC<ReferenceTerminalFieldOptimizedProps> = ({
  record,
  source = 'terminal_id',
  size = 'sm',
  showIcon = true,
  getTerminal,
  ...props
}) => {
  const terminalId = record?.[source];

  // Get terminal from lookup - no API call, instant!
  const terminalRecord = getTerminal(terminalId);

  if (!terminalRecord && !terminalId) {
    return <Text size={size} c="dimmed">-</Text>;
  }

  return (
    <Group gap="xs">
      {showIcon && <IconBuilding size={12} />}
      <Text size={size} {...props}>
        {terminalRecord?.name || `Terminal ${terminalId}`}
      </Text>
    </Group>
  );
};
