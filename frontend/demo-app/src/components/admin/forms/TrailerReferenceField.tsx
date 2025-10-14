import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrailers } from '../../../hooks/useReferenceData';

interface TrailerReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
}

export function TrailerReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select trailer',
  required = false,
  searchable = true,
}: TrailerReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: trailers, loading } = useTrailers();

  const value = formData[source];

  const options = [
    { value: '', label: '-- Select Trailer --' },
    ...trailers.map(trailer => ({
      value: trailer.id.toString(),
      label: trailer.license_plate,
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
      placeholder={loading ? 'Loading trailers...' : placeholder}
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
