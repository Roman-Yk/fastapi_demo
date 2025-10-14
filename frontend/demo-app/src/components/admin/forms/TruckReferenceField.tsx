import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrucks } from '../../../hooks/useReferenceData';

interface TruckReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
}

export function TruckReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select truck',
  required = false,
  searchable = true,
}: TruckReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: trucks, loading } = useTrucks();

  const value = formData[source];

  const options = [
    { value: '', label: '-- Select Truck --' },
    ...trucks.map(truck => ({
      value: truck.id.toString(),
      label: truck.license_plate || truck.id.toString(),
    }))
  ];

  const handleChange = (newValue: string | null) => {
    // If cleared (null, empty string, or '-- Select --'), set to null
    // Otherwise keep as string (for UUID support)
    const fieldValue = newValue && newValue !== '' ? newValue : null;
    updateField(source, fieldValue);
  };

  // Convert value for Mantine Select: null -> '', string -> string
  const selectValue = value === null || value === undefined ? '' : String(value);

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading trucks...' : placeholder}
      data={options}
      value={selectValue}
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
