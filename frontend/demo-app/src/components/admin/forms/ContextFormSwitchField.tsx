import { Switch } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormSwitchFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  description?: string;
}

export function ContextFormSwitchField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  size = 'md',
  disabled,
  description
}: ContextFormSwitchFieldProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField(source, event.target.checked as T[K], { validate: true });
  };

  return (
    <Switch
      label={label}
      checked={value as boolean}
      onChange={handleChange}
      size={size}
      disabled={disabled}
      description={description}
      error={error}
    />
  );
}