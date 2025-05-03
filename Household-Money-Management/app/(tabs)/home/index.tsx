import { supabase } from '@/utils/supabase';
import React from 'react';
import { useEffect, useState } from 'react';
import { Alert, Text, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import {
  LineChart,
  PieChart,
} from 'react-native-chart-kit';
import { getData, getstoreddata, isUpdated } from '@/utils/data';

// Get screen width for responsive chart sizing
const screenWidth = Dimensions.get('window').width;

// Chart Configuration (Styling)
const chartConfig = {
  backgroundColor: '#e26a00', // Background color for the chart area itself (gradient start)
  backgroundGradientFrom: '#fb8c00', // Gradient start color
  backgroundGradientTo: '#ffa726', // Gradient end color
  decimalPlaces: 2, // optional, defaults to 2dp for labels
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Line/bar/text color
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Axis label color
  style: {
    borderRadius: 16,
  },
  propsForDots: { // Style for the dots on the line chart
    r: '6', // Radius
    strokeWidth: '2',
    stroke: '#ffa726', // Dot border color
  },
};
// Sample Data
const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional line color override
      strokeWidth: 2, // optional line width override
    },
  ],
  legend: ['Rainy Days'],
};

const colors = ["#34abeb", "#6c5b8c", "#a17c7a", "#94627f"]

let pieChartData = [];

export default function GraphScreen() {
  const [user, setUser] = useState<any | null>(null)
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    if (user === null)
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })
  }, [])
  async function doLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) Alert.alert(String(error))
  }
  useEffect(() => {
    async function name() {
      if (!isUpdated())
        getData(user).then(data => setUserData(getstoreddata()))
      else
        setUserData(getstoreddata())
    }
    name()
  }, [user])
  if (!userData)
    return (
      <>
        <View style={{ flex: 1,alignItems: 'center',justifyContent: 'center'}}>
          <Text style={{ fontSize: 20 }}>Loading...</Text>
        </View>
      </>

    );
  let keys = Object.keys(userData)
  pieChartData = []
  let other = 0.00
  //TODO: make the smallest amounts be put in other, not the last. Possibly sort by amount before updating backend?
  for (let index = 0; index < keys.length; index++) {
    const element = String(keys[index]);
    if (index > 7)
      other += userData[element]
    else
      pieChartData.push({ name: element.toUpperCase(), amount: userData[element], color: colors[index], legendFontColor: "#7F7F7F", legendFontSize: 15 })
  }
  if(other > 0)
    pieChartData.push({ name: "Other", population: other, color: "black", legendFontColor: "#7F7F7F", legendFontSize: 15 })
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chart Examples</Text>
      <Text style={styles.chartTitle}>Line Chart</Text>
      <LineChart
        data={lineChartData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="$"
        yAxisSuffix="k"
        yAxisInterval={1}
        chartConfig={chartConfig}
        bezier
        style={styles.chartStyle}
      />
      <Text style={styles.chartTitle}>Pie Chart</Text>
      <PieChart
        data={pieChartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor={"amount"}
        backgroundColor={"transparent"}
        paddingLeft={"15"} 
        absolute
        style={styles.chartStyle}
      />
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