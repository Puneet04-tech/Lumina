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

  return {
    sum: parseFloat(sum.toFixed(2)),
    average: parseFloat(avg.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
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
