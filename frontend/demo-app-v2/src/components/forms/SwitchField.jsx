import PropTypes from 'prop-types';
import { Switch } from '@mantine/core';

/**
 * SwitchField - A reusable switch field
 */
export const SwitchField = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'sm',
  color = 'blue',
  ...otherProps
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.currentTarget.checked);
    }
  };

  return (
    <Switch
      label={label}
      description={description}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      size={size}
      color={color}
      {...otherProps}
    />
  );
};

SwitchField.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
};
