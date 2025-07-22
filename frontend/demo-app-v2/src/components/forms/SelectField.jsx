import PropTypes from 'prop-types';
import { Select } from '@mantine/core';

/**
 * SelectField - A reusable select field with enhanced functionality
 */
export const SelectField = ({
  value = null,
  onChange,
  data = [],
  placeholder = 'Select option...',
  label,
  description,
  disabled = false,
  withAsterisk = false,
  clearable = true,
  searchable = false,
  allowDeselect = true,
  ...otherProps
}) => {
  const handleChange = (selectedValue) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <Select
      label={label}
      description={description}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      data={data}
      disabled={disabled}
      withAsterisk={withAsterisk}
      clearable={clearable}
      searchable={searchable}
      allowDeselect={allowDeselect}
      {...otherProps}
    />
  );
};

SelectField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
      })
    ])
  ),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  withAsterisk: PropTypes.bool,
  clearable: PropTypes.bool,
  searchable: PropTypes.bool,
  allowDeselect: PropTypes.bool,
};
