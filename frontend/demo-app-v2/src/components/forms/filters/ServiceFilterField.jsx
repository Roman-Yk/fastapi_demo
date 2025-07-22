import PropTypes from 'prop-types';
import { Select } from '@mantine/core';
import { OrderServiceLabels } from '../../../constants/orderConstants';

export const ServiceFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  label = 'Service Type',
  placeholder = 'Select service' 
}) => {
  const options = [
    { value: '', label: 'All services' },
    ...Object.entries(OrderServiceLabels).map(([value, label]) => ({
      value: value,
      label,
    }))
  ];

  const handleChange = (newValue) => {
    onChange(newValue ? parseInt(newValue) : null);
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value ? String(value) : ''}
      onChange={handleChange}
      data={options}
      style={{ minWidth: 180 }}
      clearable={!alwaysOn}
    />
  );
};

ServiceFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};
