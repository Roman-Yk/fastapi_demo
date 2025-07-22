import PropTypes from 'prop-types';
import { Switch, Box, Text } from '@mantine/core';

export const SwitchFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  label = 'Switch',
  color = 'blue' 
}) => {
  const handleChange = (event) => {
    onChange(event.currentTarget.checked);
  };

  return (
    <Box>
      <Text size="sm" fw={500} mb="xs">{label}</Text>
      <Switch
        checked={value === true}
        onChange={handleChange}
        size="sm"
        color={color}
      />
    </Box>
  );
};

SwitchFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  label: PropTypes.string,
  color: PropTypes.string,
};
