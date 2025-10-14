import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useDrivers } from '../../../hooks/useReferenceData';

interface DriverReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
}

export function DriverReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select driver',
  required = false,
  searchable = true,
}: DriverReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: drivers, loading } = useDrivers();

  const value = formData[source];

  const options = [
    { value: '', label: '-- Select Driver --' },
    ...drivers.map(driver => ({
      value: driver.id.toString(),
      label: driver.name,
    }))
  ];

  const handleChange = (newValue: string | null) => {
    // If cleared (null, empty string, or '-- Select --'), set to null
    // Otherwise keep as string (for UUID support)
    const fieldValue = newValue && newValue !== '' ? newValue : null;
    updateField(source, fieldValue);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading drivers...' : placeholder}
      data={options}
      value={value ? value.toString() : ''}
      onChange={handleChange}
      required={required}
      searchable={searchable}
      clearable={false}
      disabled={loading}
      rightSection={loading ? <Loader size="xs" /> : undefined}
      maxDropdownHeight={200}
    />
  );
}
