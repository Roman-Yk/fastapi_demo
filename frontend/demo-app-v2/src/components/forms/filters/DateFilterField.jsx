import PropTypes from "prop-types";
import { Group, Button, Box, Text } from "@mantine/core";
import {
  DateFilterOption,
  DateFilterLabels,
} from "../../../constants/orderConstants";

export const DateFilterField = ({
  source,
  value,
  onChange,
  alwaysOn = false,
  defaultValue = DateFilterOption.TODAY,
  label = "Date Filter",
}) => {
  const currentValue = value || defaultValue;

  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
  <Box>
    <Text size="sm" fw={500} mb="xs">
      {label}
    </Text>
    <Box style={{ display: 'inline-flex', border: '1px solid #ccc', borderRadius: 999 }}>
      {Object.entries(DateFilterLabels).map(
        ([optionValue, label], index, arr) => {
          const isFirst = index === 0;
          const isLast = index === arr.length - 1;

          return (
            <Button
              key={optionValue}
              variant={currentValue === optionValue ? "filled" : "default"}
              color={currentValue === optionValue ? "green" : "gray"}
              size="sm"
              radius={0}
              style={{
                border: 'none', // Remove Mantine's internal border
                borderLeft: isFirst ? 'none' : '1px solid #ccc', // only inner lines
                borderTopLeftRadius: isFirst ? 999 : 0,
                borderBottomLeftRadius: isFirst ? 999 : 0,
                borderTopRightRadius: isLast ? 999 : 0,
                borderBottomRightRadius: isLast ? 999 : 0,
              }}
              onClick={() => handleChange(optionValue)}
            >
              {label}
            </Button>
          );
        }
      )}
    </Box>
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
