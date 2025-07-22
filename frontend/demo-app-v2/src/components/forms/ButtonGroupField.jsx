import PropTypes from 'prop-types';
import { Group, Button } from '@mantine/core';

/**
 * ButtonGroupField - A reusable button group field for selecting options
 */
export const ButtonGroupField = ({
  value = null,
  onChange,
  options = [],
  label,
  description,
  disabled = false,
  size = 'sm',
  variant = 'light',
  color = 'blue',
  fullWidth = false,
  ...otherProps
}) => {
  const handleOptionClick = (optionValue) => {
    if (onChange) {
      // Toggle selection - if same value clicked, deselect it
      const newValue = value === optionValue ? null : optionValue;
      onChange(newValue);
    }
  };

  return (
    <div {...otherProps}>
      {label && (
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {label}
          </label>
        </div>
      )}
      {description && (
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>
            {description}
          </span>
        </div>
      )}
      <Group gap="xs" grow={fullWidth}>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const isSelected = value === optionValue;
          
          return (
            <Button
              key={optionValue}
              variant={isSelected ? 'filled' : variant}
              color={color}
              size={size}
              disabled={disabled || option.disabled}
              onClick={() => handleOptionClick(optionValue)}
            >
              {optionLabel}
            </Button>
          );
        })}
      </Group>
    </div>
  );
};

ButtonGroupField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
      })
    ])
  ),
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['filled', 'light', 'outline', 'default', 'subtle']),
  color: PropTypes.string,
  fullWidth: PropTypes.bool,
};
