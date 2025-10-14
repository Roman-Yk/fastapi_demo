import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useDrivers } from '../../../hooks/useReferenceData';

interface DriverReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export function DriverReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select driver',
  required = false,
  searchable = true,
  clearable = true,
}: DriverReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: drivers, loading } = useDrivers();

  const value = formData[source];

  const options = drivers.map(driver => ({
    value: driver.id.toString(),
    label: driver.name,
  }));

  const handleChange = (newValue: string | null) => {
    const numericValue = newValue ? parseInt(newValue, 10) : null;
    updateField(source, numericValue);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading drivers...' : placeholder}
      data={options}
      value={value?.toString() || ''}
      onChange={handleChange}
      required={required}
      searchable={searchable}
      clearable={clearable}
      disabled={loading}
      rightSection={loading ? <Loader size="xs" /> : undefined}
      maxDropdownHeight={200}
    />
  );
}
