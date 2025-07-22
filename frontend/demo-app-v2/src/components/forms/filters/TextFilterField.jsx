import PropTypes from 'prop-types';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export const TextFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  label = 'Search',
  placeholder = 'Search...' 
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value || ''}
      onChange={handleChange}
      leftSection={<IconSearch size={16} />}
      style={{ minWidth: 250 }}
    />
  );
};

TextFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};
