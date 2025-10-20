import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrucks } from '../../../domains/vehicles/hooks/useTrucks';

interface TruckReferenceFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  description?: string;
}

export function TruckReferenceField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder = 'Select truck',
  required = false,
  searchable = true,
  disabled,
  description
}: TruckReferenceFieldProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const { data: trucks, loading } = useTrucks();

  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

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
    updateField(source, fieldValue as T[K], { validate: true });
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
      onBlur={() => {}}
      required={required}
      searchable={searchable}
      clearable={false}
      disabled={loading || disabled}
      rightSection={loading ? <Loader size="xs" /> : undefined}
      maxDropdownHeight={200}
      description={description}
      error={error}
    />
  );
}
