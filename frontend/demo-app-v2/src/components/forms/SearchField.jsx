import PropTypes from 'prop-types';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * SearchField - A reusable search input field
 */
export const SearchField = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  description,
  disabled = false,
  withAsterisk = false,
  ...otherProps
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <TextInput
      label={label}
      description={description}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      withAsterisk={withAsterisk}
      leftSection={<IconSearch size={16} />}
      {...otherProps}
    />
  );
};

SearchField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  withAsterisk: PropTypes.bool,
};
