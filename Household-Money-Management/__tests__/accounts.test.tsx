import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import AddTransactionScreen from '@/app/(tabs)/home/accounts';
import { supabase, mockFrom, mockInsert } from '@/utils/supabase';

jest.spyOn(Alert, 'alert');
jest.mock('@react-native-picker/picker');
jest.mock('@react-native-community/datetimepicker');
jest.mock('@/utils/supabase');

describe('<AddTransactionScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it('renders correctly', () => {
    render(<AddTransactionScreen />);

    expect(screen.getByText('Add New Transaction')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., 50.00')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., Coffee, Paycheck')).toBeTruthy();
    expect(screen.getByText('USD')).toBeTruthy(); // Initial currency
    expect(screen.getByText('Expense')).toBeTruthy(); // Initial type
    expect(screen.getByText('Food')).toBeTruthy(); // Initial category
    expect(screen.getByText(new Date().toDateString())).toBeTruthy(); // Initial date
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeTruthy();
  });

  it('updates state on input change', () => {
    render(<AddTransactionScreen />);

    const amountInput = screen.getByPlaceholderText('e.g., 50.00');
    const descriptionInput = screen.getByPlaceholderText('e.g., Coffee, Paycheck');

    fireEvent.changeText(amountInput, '123.45');
    fireEvent.changeText(descriptionInput, 'Test Description');

    // Check if the input value prop was updated
    expect(amountInput.props.value).toBe('123.45');
    expect(descriptionInput.props.value).toBe('Test Description');
  });

   it('updates state on picker change', () => {
    render(<AddTransactionScreen />);

    const currencyPicker = screen.getByTestId('currency-picker');
    const typePicker = screen.getByTestId('type-picker');
    const categoryPicker = screen.getByTestId('category-picker');

    fireEvent(currencyPicker, 'onValueChange', 'EUR');
    fireEvent(typePicker, 'onValueChange', 'income');
    fireEvent(categoryPicker, 'onValueChange', 'Salary');

    expect(currencyPicker.props.selectedValue).toBe('EUR');
    expect(typePicker.props.selectedValue).toBe('income');
    expect(categoryPicker.props.selectedValue).toBe('Salary');
  });

  it('shows and updates date picker', async () => {
    render(<AddTransactionScreen />);

    const dateButton = screen.getByText(new Date().toDateString());
    fireEvent.press(dateButton);

    const dateTimePicker = await screen.findByTestId('dateTimePicker');
    expect(dateTimePicker).toBeTruthy();

    const newDate = new Date(2024, 5, 15);
    fireEvent(dateTimePicker, 'onChange', null, newDate);
    expect(screen.getByText(newDate.toDateString())).toBeTruthy();
  });

  it('shows validation alert for invalid amount', () => {
    render(<AddTransactionScreen />);
    const addButton = screen.getByRole('button', { name: 'Add Transaction' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g., 50.00'), 'abc');
    fireEvent.changeText(screen.getByPlaceholderText('e.g., Coffee, Paycheck'), 'Valid Desc');
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Please enter a valid positive amount.');
    expect(mockFrom).not.toHaveBeenCalled(); // Supabase should not be called
  });

   it('shows validation alert for zero amount', () => {
    render(<AddTransactionScreen />);
    const addButton = screen.getByRole('button', { name: 'Add Transaction' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g., 50.00'), '0');
    fireEvent.changeText(screen.getByPlaceholderText('e.g., Coffee, Paycheck'), 'Valid Desc');
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Please enter a valid positive amount.');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('shows validation alert for empty description', () => {
    render(<AddTransactionScreen />);
    const addButton = screen.getByRole('button', { name: 'Add Transaction' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g., 50.00'), '100');
    fireEvent.changeText(screen.getByPlaceholderText('e.g., Coffee, Paycheck'), '  '); // Empty after trim
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Please enter a description.');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('calls supabase insert with correct data on valid submission', async () => {
    render(<AddTransactionScreen />);

    const testDate = new Date(2024, 5, 15);
    const amount = '75.50';
    const description = 'Lunch Meeting';
    const currency = 'GBP';
    const type = 'expense';
    const category = 'Food';


    // Set values
    fireEvent.changeText(screen.getByPlaceholderText('e.g., 50.00'), amount);
    fireEvent.changeText(screen.getByPlaceholderText('e.g., Coffee, Paycheck'), description);

     // Find pickers by testID (add these to your component)
    fireEvent(screen.getByTestId('currency-picker'), 'onValueChange', currency);
    fireEvent(screen.getByTestId('type-picker'), 'onValueChange', type);
    fireEvent(screen.getByTestId('category-picker'), 'onValueChange', category);


    // Set date
    const dateButton = screen.getByText(new Date().toDateString()); // Find by initial date text
    fireEvent.press(dateButton);
    const dateTimePicker = await screen.findByTestId('dateTimePicker');
    fireEvent(dateTimePicker, 'onChange', null, testDate);


    // Press add button
    const addButton = screen.getByRole('button', { name: 'Add Transaction' });
    fireEvent.press(addButton);


    // Check loading state (button text changes)
    expect(screen.getByRole('button', { name: 'Adding...' })).toBeTruthy();


    // Wait for async operations (supabase call, state updates)
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('transactions');
    });
     await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([
        {
          amount: 75.50, // Parsed amount
          currency: currency,
          description: description,
          transaction_date: testDate.toISOString(), // ISO string format
          type: type,
          category: category,
        },
      ]);
    });


    // Check for success alert
     await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Transaction added successfully!');
     });


    // Check if form fields are cleared (amount and description)
    expect(screen.getByPlaceholderText('e.g., 50.00').props.value).toBe('');
    expect(screen.getByPlaceholderText('e.g., Coffee, Paycheck').props.value).toBe('');

    // Check if loading state is reset
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeTruthy();
  });
});