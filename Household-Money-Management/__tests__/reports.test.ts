import {
  getSpendingData,
  getMonthLabels,
  calculateTotal,
  calculateAverage,
  formatCurrency,
  generateReportSummary,
} from '../app/(tabs)/home/reports';

describe('Reports Utility Functions', () => {

  test('getSpendingData returns fixed dataset (Fast, Repeatable)', () => {
    const data = getSpendingData();
    expect(data).toEqual([450, 320, 700, 610, 530, 300]);
  });

  test('getMonthLabels returns correct month names (Isolated, Self-Validating)', () => {
    const months = getMonthLabels();
    expect(months).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  });

  test('calculateTotal returns correct sum (Repeatable, Isolated)', () => {
    const sum = calculateTotal([100, 200, 300]);
    expect(sum).toBe(600);
  });

  test('calculateAverage returns correct mean (Self-Validating, Fast)', () => {
    const avg = calculateAverage([10, 20, 30]);
    expect(avg).toBe(20);
  });

  test('formatCurrency returns formatted string (Readable, Repeatable)', () => {
    const formatted = formatCurrency(1234.5);
    expect(formatted).toBe('$1234.50');
  });

  test('generateReportSummary returns correct formatted summary (Timely, Isolated)', () => {
    const summary = generateReportSummary([100, 200]);
    expect(summary).toEqual({
      total: '$300.00',
      average: '$150.00',
    });
  });

});
