import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/utils/supabase';

// Define a simple list of currencies and transaction types
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR'];
const transactionTypes = ['expense', 'income'];
// Define a simple list of categories (can be fetched from Supabase later)
const categories = [
  'Food',
  'Transport',
  'Housing',
  'Shopping',
  'Salary',
  'Freelance',
  'Bills',
  'Entertainment',
  'Other',
];

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencies[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [type, setType] = useState(transactionTypes[0]); // 'expense' or 'income'
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // Hide picker on iOS immediately
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const addTransaction = async () => {
    // Basic validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description.');
      return;
    }

    setLoading(true);

    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   Alert.alert('Authentication Error', 'You must be logged in to add transactions.');
    //   setLoading(false);
    //   return;
    // }

    const transactionData = {
      amount: parsedAmount,
      currency: currency,
      description: description.trim(),
      transaction_date: date.toISOString(), // Supabase timestamp format
      type: type,
      category: category,
    };

    // This needs to be updated to work with the setup
    const { error } = await supabase.from('transactions').insert([transactionData]);

    if (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } else {
      Alert.alert('Success', 'Transaction added successfully!');
      // Clear the form after success
      setAmount('');
      setDescription('');
      // Keep currency, type, category, date as they might be reused
      // setCurrency(currencies[0]);
      // setType(transactionTypes[0]);
      // setCategory(categories[0]);
      // setDate(new Date());
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Transaction</Text>
      <Text style={styles.label}>Amount:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g., 50.00"
        value={amount}
        onChangeText={setAmount}
      />
      <Text style={styles.label}>Currency:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          testID="currency-picker" 
          selectedValue={currency}
          onValueChange={(itemValue: string) => setCurrency(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem} // On iOS
        >
          {currencies.map((curr) => (
            <Picker.Item key={curr} label={curr} value={curr} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Coffee, Paycheck"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          testID='type-picker'
          selectedValue={type}
          onValueChange={(itemValue: 'income' | 'expense') => setType(itemValue)}
          style={styles.picker}
           itemStyle={styles.pickerItem} // On iOS
        >
          {transactionTypes.map((tType) => (
            <Picker.Item key={tType} label={tType.charAt(0).toUpperCase() + tType.slice(1)} value={tType} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Category:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          testID='category-picker'
          selectedValue={category}
          onValueChange={(itemValue: string) => setCategory(itemValue)}
          style={styles.picker}
           itemStyle={styles.pickerItem} // On iOS
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Date:</Text>
      <TouchableOpacity onPress={showDatepicker} style={styles.dateDisplayButton}>
         <Text style={styles.dateDisplayText}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={'default'}
          onChange={onDateChange}
        />
      )}
      <View style={styles.buttonContainer}>
         <Button
            title={loading ? 'Adding...' : 'Add Transaction'}
            onPress={addTransaction}
            disabled={loading}
            color="#007AFF"
         />
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden', // Crucial for rounding corners on Android
  },
  picker: {
    height: 50, // Adjust height as needed
    width: '100%',
  },
  pickerItem: {
     // Add styles specific to iOS picker items if needed
     // For Android, styles need to be applied directly via style prop on Picker
  },
  dateDisplayButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    justifyContent: 'center',
    minHeight: 50, // Match height of inputs/pickers
  },
  dateDisplayText: {
    fontSize: 16,
    color: '#000', // Or a placeholder color if date is not set
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8, // To match the input field style
    overflow: 'hidden', // Needed for borderRadius to work on Android
  },
  // The provided styles were for a different page, but including them
  // here for completeness or potential reuse, though not directly used in the form itself.
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 10,
    color: '#555',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
