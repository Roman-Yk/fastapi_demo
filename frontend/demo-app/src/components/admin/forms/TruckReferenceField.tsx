import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrucks } from '../../../hooks/useReferenceData';

interface TruckReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export function TruckReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select truck',
  required = false,
  searchable = true,
  clearable = true,
}: TruckReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: trucks, loading } = useTrucks();

  const value = formData[source];

  const options = trucks.map(truck => ({
    value: truck.id.toString(),
    label: truck.license_plate || truck.id.toString(),
  }));

  const handleChange = (newValue: string | null) => {
    const numericValue = newValue ? parseInt(newValue, 10) : null;
    updateField(source, numericValue);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading trucks...' : placeholder}
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
