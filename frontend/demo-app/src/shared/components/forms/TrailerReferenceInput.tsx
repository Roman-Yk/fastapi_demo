import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTrailers } from '../../../domains/vehicles/hooks/useTrailers';

interface TrailerReferenceInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  description?: string;
}

export function TrailerReferenceInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder = 'Select trailer',
  required = false,
  searchable = true,
  disabled,
  description
}: TrailerReferenceInputProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const { data: trailers, loading } = useTrailers();

  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

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
    updateField(source, fieldValue as T[K], { validate: true });
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading trailers...' : placeholder}
      data={options}
      value={value ? value.toString() : ''}
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
