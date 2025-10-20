import React from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { FieldProps } from './types';

export interface ActionButtonConfig {
  key: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: (record: any) => void;
  tooltip?: string;
  color?: string;
  variant?: 'filled' | 'light' | 'outline' | 'default' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean | ((record: any) => boolean);
}

export interface ActionFieldProps extends Omit<FieldProps, 'value'> {
  actions: ActionButtonConfig[];
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ActionField: React.FC<ActionFieldProps> = ({ 
  record, 
  actions,
  gap = 'xs'
}) => {
  if (!record || !actions.length) {
    return null;
  }
  
  return (
    <Group gap={gap}>
      {actions.map((action) => {
        const isDisabled = typeof action.disabled === 'function' 
          ? action.disabled(record) 
          : action.disabled;
          
        const button = (
          <ActionIcon
            key={action.key}
            variant={action.variant || 'subtle'}
            color={action.color || 'blue'}
            size={action.size || 'sm'}
            onClick={() => !isDisabled && action.onClick(record)}
            disabled={isDisabled}
          >
            <action.icon size={14} />
          </ActionIcon>
        );
        
        if (action.tooltip) {
          return (
            <Tooltip key={action.key} label={action.tooltip}>
              {button}
            </Tooltip>
          );
        }
        
        return button;
      })}
    </Group>
  );
};