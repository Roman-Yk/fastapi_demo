import { Switch } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormSwitchFieldProps<K extends string> {
  label: string;
  source: K;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  transform?: (value: any) => any;
}

export function ContextFormSwitchField<K extends string>({
  label,
  source,
  size = 'md',
  transform
}: ContextFormSwitchFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const value = formData[source];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateField(source, event.target.checked, transform);
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