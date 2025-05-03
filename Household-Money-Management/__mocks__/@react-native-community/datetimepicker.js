import React from 'react';
import { View, Button } from 'react-native';

const MockDateTimePicker = ({ value, mode, display, onChange, testID }) => {
  const handleChange = () => {
    const simulatedDate = new Date(2024, 5, 15);
    if (onChange) {
      onChange(null, simulatedDate);
    }
  };

  return (
    <View testID={testID}>
       <View testID="mock-datetimepicker-value" accessibilityLabel={value.toISOString()} />
    </View>
  );
};

export default MockDateTimePicker;