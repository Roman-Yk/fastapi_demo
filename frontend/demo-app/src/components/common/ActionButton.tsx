import React from 'react';
import { 
  Button, 
  ActionIcon, 
  Group, 
  Tooltip 
} from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

interface BaseButtonProps {
  label?: string;
  icon?: React.FC<TablerIconsProps>;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'light' | 'outline' | 'default' | 'subtle';
  onClick?: () => void;
  tooltip?: string;
}

interface ActionButtonProps extends BaseButtonProps {
  type: 'button';
  fullWidth?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

interface IconButtonProps extends BaseButtonProps {
  type: 'icon';
  compact?: boolean;
}

type ButtonProps = ActionButtonProps | IconButtonProps;

export const ActionButton: React.FC<ButtonProps> = (props) => {
  const { 
    label, 
    icon, 
    color = 'blue', 
    size = 'sm', 
    disabled, 
    loading, 
    variant = 'filled',
    onClick,
    tooltip 
  } = props;

  const IconComponent = icon;

  if (props.type === 'icon') {
    const iconButton = (
      <ActionIcon
        color={color}
        size={size}
        variant={variant}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        {IconComponent && <IconComponent size={16} />}
      </ActionIcon>
    );

    return tooltip ? (
      <Tooltip label={tooltip}>
        {iconButton}
      </Tooltip>
    ) : iconButton;
  }

  const button = (
    <Button
      color={color}
      size={size}
      variant={variant}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      fullWidth={props.fullWidth}
      leftSection={props.leftSection || (IconComponent && <IconComponent size={16} />)}
      rightSection={props.rightSection}
    >
      {label}
    </Button>
  );

  return tooltip ? (
    <Tooltip label={tooltip}>
      {button}
    </Tooltip>
  ) : button;
};

// Predefined action buttons for common use cases
export const CreateButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="filled" 
    color="green"
    label={props.label || 'Create'}
  />
);

export const EditButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="light" 
    color="blue"
    label={props.label || 'Edit'}
  />
);

export const DeleteButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="light" 
    color="red"
    label={props.label || 'Delete'}
  />
);

export const SaveButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="filled" 
    color="green"
    label={props.label || 'Save'}
  />
);

export const CancelButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="default" 
    color="gray"
    label={props.label || 'Cancel'}
  />
);

export const RefreshButton: React.FC<Omit<IconButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="icon" 
    variant="default" 
    color="gray"
    tooltip={props.tooltip || 'Refresh'}
  />
);

export const FilterButton: React.FC<Omit<IconButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="icon" 
    variant="light" 
    color="blue"
    tooltip={props.tooltip || 'Filter'}
  />
);

export const ExportButton: React.FC<Omit<ActionButtonProps, 'type'>> = (props) => (
  <ActionButton 
    {...props} 
    type="button" 
    variant="light" 
    color="indigo"
    label={props.label || 'Export'}
  />
); 