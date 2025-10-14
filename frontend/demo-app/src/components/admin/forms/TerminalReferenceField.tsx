import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useTerminals } from '../../../hooks/useReferenceData';

interface TerminalReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export function TerminalReferenceField<K extends string>({
  label,
  source,
  placeholder = 'Select terminal',
  required = false,
  searchable = true,
  clearable = true,
}: TerminalReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const { data: terminals, loading } = useTerminals();

  const value = formData[source];

  const options = terminals.map(terminal => ({
    value: terminal.id.toString(),
    label: terminal.name,
  }));

  const handleChange = (newValue: string | null) => {
    const numericValue = newValue ? parseInt(newValue, 10) : null;
    updateField(source, numericValue);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? 'Loading terminals...' : placeholder}
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
