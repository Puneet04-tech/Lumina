export const generateChartData = (data, groupBy, valueKey) => {
  if (!data || data.length === 0) return [];

  const grouped = {};
  data.forEach((item) => {
    const key = item[groupBy];
    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += parseFloat(item[valueKey]) || 0;
  });

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));
};

export const calculateStats = (data, key) => {
  if (!data || data.length === 0) return {};

  const values = data.map((item) => parseFloat(item[key]) || 0).filter((v) => !isNaN(v));

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  // Calculate median
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  // Calculate standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Calculate quartiles
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  // Unique values count
  const uniqueValues = new Set(values).size;

  // Coefficient of Variation
  const cv = avg !== 0 ? (stdDev / avg) * 100 : 0;

  return {
    sum: parseFloat(sum.toFixed(2)),
    average: parseFloat(avg.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    range: parseFloat(range.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    q1: parseFloat(q1.toFixed(2)),
    q3: parseFloat(q3.toFixed(2)),
    iqr: parseFloat(iqr.toFixed(2)),
    uniqueValues,
    coefficientOfVariation: parseFloat(cv.toFixed(2)),
    count: values.length,
  };
};

export const formatNumber = (num) => {
  if (typeof num !== 'number') return num;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
};

export const generateRandomColor = () => {
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
