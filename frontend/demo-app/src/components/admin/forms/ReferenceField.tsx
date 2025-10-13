import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useReferenceData } from '../../../context/ReferenceDataContext';

interface ReferenceFieldProps<K extends string> {
  label: string;
  source: K;
  resource: 'drivers' | 'terminals' | 'trucks' | 'trailers';
  getOptionLabel: (record: any) => string;
  getOptionValue?: (record: any) => string;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function ReferenceField<K extends string>({
  label,
  source,
  resource,
  getOptionLabel,
  getOptionValue = (record) => record.id,
  placeholder,
  required,
  searchable = true,
  clearable = true,
  transform
}: ReferenceFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const referenceData = useReferenceData();

  const value = formData[source];

  // Get records and loading state from context
  const records = referenceData[resource] || [];
  const loading = referenceData.loading[resource];

  const options = records.map(record => ({
    value: getOptionValue(record),
    label: getOptionLabel(record),
    record
  }));

  const handleChange = (newValue: string | null) => {
    updateField(source, newValue, transform);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? `Loading ${resource}...` : placeholder}
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