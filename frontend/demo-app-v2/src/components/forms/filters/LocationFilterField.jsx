import PropTypes from 'prop-types';
import { Select } from '@mantine/core';
import { LocationFilterLabels } from '../../../constants/orderConstants';

export const LocationFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  label = 'Location',
  placeholder = 'Select location' 
}) => {
  const options = [
    { value: '', label: 'All locations' },
    ...Object.entries(LocationFilterLabels).map(([value, label]) => ({
      value,
      label,
    }))
  ];

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      data={options}
      style={{ minWidth: 180 }}
      clearable={!alwaysOn}
    />
  );
};

LocationFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};
