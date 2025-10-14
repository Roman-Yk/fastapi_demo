import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTerminals } from '../../../hooks/useReferenceData';

interface TerminalReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
}

export function TerminalReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select terminal',
  required = false,
  searchable = true,
}: TerminalReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: terminals, loading } = useTerminals();

  const value = formData[source];

  const options = [
    { value: '', label: '-- Select Terminal --' },
    ...terminals.map(terminal => ({
      value: terminal.id.toString(),
      label: terminal.name,
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
      placeholder={loading ? 'Loading terminals...' : placeholder}
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
