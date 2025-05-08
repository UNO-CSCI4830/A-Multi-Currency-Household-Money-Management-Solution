import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart, Grid } from 'react-native-svg-charts';

export function getSpendingData(): number[] {
  return [450, 320, 700, 610, 530, 300];
}

export function getMonthLabels(): string[] {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
}

export function calculateTotal(data: number[]): number {
  return data.reduce((sum, val) => sum + val, 0);
}

export function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return calculateTotal(data) / data.length;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function generateReportSummary(data: number[]): { total: string; average: string } {
  const total = calculateTotal(data);
  const avg = calculateAverage(data);
  return {
    total: formatCurrency(total),
    average: formatCurrency(avg),
  };
}

export default function ReportsPage() {
  const [spending, setSpending] = useState<number[]>([]);

  useEffect(() => {
    const data = getSpendingData();
    setSpending(data);
  }, []);

  const { total, average } = generateReportSummary(spending);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monthly Spending Report</Text>

      <BarChart
        style={{ height: 200, width: '100%' }}
        data={spending}
        svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
        contentInset={{ top: 20, bottom: 20 }}
        spacingInner={0.3}
        gridMin={0}
      >
        <Grid direction={Grid.Direction.HORIZONTAL} />
      </BarChart>

      <View style={styles.labels}>
        {getMonthLabels().map((month, index) => (
          <Text key={index} style={styles.label}>{month}</Text>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total: {total}</Text>
        <Text style={styles.summaryText}>Avg/Month: {average}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
  },
  summary: {
    marginTop: 24,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
