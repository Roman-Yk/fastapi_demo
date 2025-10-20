import { Select, Loader } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { useDrivers } from '../../../domains/drivers/hooks/useDrivers';
import { useTerminals } from '../../../domains/terminals/hooks/useTerminals';
import { useTrucks } from '../../../domains/vehicles/hooks/useTrucks';
import { useTrailers } from '../../../domains/vehicles/hooks/useTrailers';

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

  const value = formData[source];

  // Use optimized hooks - only fetch the resource we need
  const driversResult = resource === 'drivers' ? useDrivers() : { data: [], loading: false };
  const terminalsResult = resource === 'terminals' ? useTerminals() : { data: [], loading: false };
  const trucksResult = resource === 'trucks' ? useTrucks() : { data: [], loading: false };
  const trailersResult = resource === 'trailers' ? useTrailers() : { data: [], loading: false };

  // Get the appropriate data and loading state
  const records = 
    resource === 'drivers' ? driversResult.data :
    resource === 'terminals' ? terminalsResult.data :
    resource === 'trucks' ? trucksResult.data :
    trailersResult.data;

  const loading =
    resource === 'drivers' ? driversResult.loading :
    resource === 'terminals' ? terminalsResult.loading :
    resource === 'trucks' ? trucksResult.loading :
    trailersResult.loading;

  const options = records.map(record => ({
    value: getOptionValue(record),
    label: getOptionLabel(record),
    record
  }));

  const handleChange = (newValue: string | null) => {
    // If cleared (null or empty string), pass null through transform
    // Otherwise pass the value through transform
    updateField(source, newValue, transform);
  };

  return (
    <Select
      label={label}
      placeholder={loading ? `Loading ${resource}...` : placeholder}
      data={options}
      value={value ? value.toString() : null}
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