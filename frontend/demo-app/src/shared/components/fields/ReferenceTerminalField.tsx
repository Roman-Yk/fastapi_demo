import React from 'react';
import { Text, Group, Skeleton } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { useTerminal } from '../../../domains/terminals/hooks/useTerminals';
import { FieldProps } from './types';

export interface ReferenceTerminalFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const ReferenceTerminalField: React.FC<ReferenceTerminalFieldProps> = ({
  record,
  source = 'terminal_id',
  size = 'sm',
  showIcon = true,
  ...props
}) => {
  const terminalId = record?.[source];

  // Use optimized hook - only fetches terminals data, with caching
  const { terminal: terminalRecord, loading } = useTerminal(terminalId);

  if (loading) {
    return <Skeleton height={20} width={100} />;
  }

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
