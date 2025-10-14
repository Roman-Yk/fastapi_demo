import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrailers } from '../../../hooks/useReferenceData';

interface TrailerReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export function TrailerReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select trailer',
  required = false,
  searchable = true,
  clearable = true,
}: TrailerReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: trailers, loading } = useTrailers();

  const value = formData[source];

  const options = trailers.map(trailer => ({
    value: trailer.id.toString(),
    label: trailer.license_plate,
  }));

  const handleChange = (newValue: string | null) => {
    const numericValue = newValue ? parseInt(newValue, 10) : null;
    updateField(source, numericValue);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading trailers...' : placeholder}
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
