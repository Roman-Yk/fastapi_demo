import React from 'react';
import { 
  TextInput, 
  Select, 
  Switch, 
  NumberInput,
  Textarea,
  DateInput,
  Group,
  Text,
  Box
} from '@mantine/core';
import { IconType } from '@tabler/icons-react';

interface BaseFieldProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  icon?: IconType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface TextFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'password' | 'search';
  value: string;
  onChange: (value: string) => void;
  rightSection?: React.ReactNode;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  value: string | null;
  onChange: (value: string | null) => void;
  data: Array<{ value: string; label: string }>;
  searchable?: boolean;
  clearable?: boolean;
}

interface NumberFieldProps extends BaseFieldProps {
  type: 'number';
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  autosize?: boolean;
}

interface SwitchFieldProps extends BaseFieldProps {
  type: 'switch';
  value: boolean;
  onChange: (value: boolean) => void;
  color?: string;
}

interface DateFieldProps extends BaseFieldProps {
  type: 'date';
  value: Date | null;
  onChange: (value: Date | null) => void;
  clearable?: boolean;
}

type FormFieldProps = 
  | TextFieldProps 
  | SelectFieldProps 
  | NumberFieldProps 
  | TextareaFieldProps 
  | SwitchFieldProps 
  | DateFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, error, description, required, disabled, size = 'sm' } = props;

  const commonProps = {
    label,
    error,
    description,
    required,
    disabled,
    size,
    leftSection: props.icon ? <props.icon size={16} /> : undefined,
  };

  switch (props.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'search':
      return (
        <TextInput
          {...commonProps}
          type={props.type}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(event) => props.onChange(event.currentTarget.value)}
          rightSection={props.rightSection}
        />
      );

    case 'select':
      return (
        <Select
          {...commonProps}
          placeholder={props.placeholder}
          data={props.data}
          value={props.value}
          onChange={props.onChange}
          searchable={props.searchable}
          clearable={props.clearable}
        />
      );

    case 'number':
      return (
        <NumberInput
          {...commonProps}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          min={props.min}
          max={props.max}
          step={props.step}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(event) => props.onChange(event.currentTarget.value)}
          rows={props.rows}
          autosize={props.autosize}
        />
      );

    case 'switch':
      return (
        <Switch
          {...commonProps}
          checked={props.value}
          onChange={(event) => props.onChange(event.currentTarget.checked)}
          color={props.color}
        />
      );

    case 'date':
      return (
        <DateInput
          {...commonProps}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          clearable={props.clearable}
        />
      );

    default:
      return null;
  }
};

// Predefined field components for common use cases
export const SearchField: React.FC<Omit<TextFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="search" />
);

export const EmailField: React.FC<Omit<TextFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="email" />
);

export const PasswordField: React.FC<Omit<TextFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="password" />
);

export const SelectField: React.FC<Omit<SelectFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="select" />
);

export const NumberField: React.FC<Omit<NumberFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="number" />
);

export const TextareaField: React.FC<Omit<TextareaFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="textarea" />
);

export const SwitchField: React.FC<Omit<SwitchFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="switch" />
);

export const DateField: React.FC<Omit<DateFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="date" />
); 