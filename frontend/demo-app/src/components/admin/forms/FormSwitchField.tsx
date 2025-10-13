import { Switch } from '@mantine/core';

interface FormSwitchFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  formData: T;
  updateField: (source: K, value: T[K], transform?: (value: any) => T[K]) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  transform?: (value: any) => T[K];
}

export function FormSwitchField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  formData,
  updateField,
  size = 'md',
  transform
}: FormSwitchFieldProps<T, K>) {
  const value = formData[source];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField(source, event.target.checked as T[K], transform);
  };

  return (
    <Switch
      label={label}
      checked={value as boolean}
      onChange={handleChange}
      size={size}
    />
  );
}