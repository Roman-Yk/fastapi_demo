import PropTypes from 'prop-types';
import { Group, Button, Box, Text } from '@mantine/core';
import { DateFilterOption, DateFilterLabels } from '../../../constants/orderConstants';

export const DateFilterField = ({ 
  source, 
  value, 
  onChange, 
  alwaysOn = false,
  defaultValue = DateFilterOption.TODAY,
  label = 'Date Filter'
}) => {
  const currentValue = value || defaultValue;

  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <Box>
      <Text size="sm" fw={500} mb="xs">{label}</Text>
      <Group gap="xs">
        {Object.entries(DateFilterLabels).map(([optionValue, label]) => (
          <Button
            key={optionValue}
            variant={currentValue === optionValue ? 'filled' : 'light'}
            color={currentValue === optionValue ? 'green' : 'gray'}
            size="sm"
            onClick={() => handleChange(optionValue)}
          >
            {label}
          </Button>
        ))}
      </Group>
    </Box>
  );
};

DateFilterField.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  alwaysOn: PropTypes.bool,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
};
