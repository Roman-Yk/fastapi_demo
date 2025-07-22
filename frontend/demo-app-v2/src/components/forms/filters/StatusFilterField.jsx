import PropTypes from 'prop-types';
import { Select } from '@mantine/core';
import { StatusFilterLabels } from '../../../constants/orderConstants';

export const StatusFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  label = 'Status',
  placeholder = 'Select status' 
}) => {
  const options = [
    { value: '', label: 'All statuses' },
    ...Object.entries(StatusFilterLabels).map(([value, label]) => ({
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

StatusFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};
