import React from 'react';
import { View } from 'react-native';
const MockPicker = ({ children, selectedValue, onValueChange, ...props }) => {
  return <View {...props}>{children}</View>;
};

MockPicker.Item = ({ label, value }) => (
  <View testID={`picker-item-${value}`} accessibilityLabel={label} />
);


export const Picker = MockPicker;