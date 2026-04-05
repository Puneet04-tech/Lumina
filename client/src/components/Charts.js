import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { generateRandomColor } from '@/utils/helpers';

// Premium Tooltip Component
const PremiumTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-indigo-500 rounded-lg p-3 shadow-2xl"
        style={{
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 10px rgba(99, 102, 241, 0.2)',
        }}>
        <p className="text-indigo-300 font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Premium Legend Component
const PremiumLegend = (props) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {props.payload?.map((entry, index) => (
        <span key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
          />
          <span className="text-sm text-slate-300 font-semibold">{entry.value}</span>
        </span>
      ))}
    </div>
  );
};

export function BarChartComponent({ data, xKey, yKey, title }) {
  return (
    <div className="premium-card relative group" style={{ animation: 'slideInUp 0.8s ease-out' }}>
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)' }} />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={`barGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(99, 102, 241, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              stroke="rgba(148, 163, 184, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" style={{ fontSize: '12px' }} />
            <Tooltip content={<PremiumTooltip />} />
            <Bar
              dataKey={yKey}
              fill={`url(#barGradient-${title})`}
              radius={[12, 12, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-in-out"
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LineChartComponent({ data, xKey, yKey, title }) {
  return (
    <div className="premium-card relative group" style={{ animation: 'slideInUp 0.8s ease-out 0.1s both' }}>
      <div className="absolute -inset-px bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={`lineGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(139, 92, 246, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              stroke="rgba(148, 163, 184, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" style={{ fontSize: '12px' }} />
            <Tooltip content={<PremiumTooltip />} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 5, fill: '#8b5cf6', filter: 'url(#lineGlow)' }}
              activeDot={{ r: 8, fill: '#c084fc' }}
              filter="url(#lineGlow)"
              animationDuration={1200}
              animationEasing="ease-in-out"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieChartComponent({ data, nameKey, valueKey, title }) {
  const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
  ];

  return (
    <div className="premium-card relative group" style={{ animation: 'slideInUp 0.8s ease-out 0.2s both' }}>
      <div className="absolute -inset-px bg-gradient-to-r from-pink-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-300 to-indigo-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)' }} />
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <defs>
              {COLORS.map((color, i) => (
                <filter key={i} id={`pieGlow-${i}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={false}
              outerRadius={110}
              innerRadius={40}
              fill="#8884d8"
              dataKey={valueKey}
              animationDuration={1200}
              animationEasing="ease-in-out"
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  filter={`url(#pieGlow-${index})`}
                  style={{
                    filter: `url(#pieGlow-${index})`,
                    boxShadow: `inset 0 0 10px ${COLORS[index % COLORS.length]}`,
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<PremiumTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((item, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600"
              style={{
                color: COLORS[i % COLORS.length],
                boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}40`,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {item[nameKey]}: {item[valueKey].toLocaleString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AreaChartComponent({ data, xKey, yKey, title }) {
  return (
    <div className="premium-card relative group" style={{ animation: 'slideInUp 0.8s ease-out 0.3s both' }}>
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)' }} />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={`areaGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <filter id="areaGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(99, 102, 241, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              stroke="rgba(148, 163, 184, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" style={{ fontSize: '12px' }} />
            <Tooltip content={<PremiumTooltip />} />
            <Area
              type="monotone"
              dataKey={yKey}
              fill={`url(#areaGradient-${title})`}
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, fill: '#4f46e5', filter: 'url(#areaGlow)' }}
              activeDot={{ r: 7, fill: '#c7d2fe' }}
              filter="url(#areaGlow)"
              animationDuration={1200}
              animationEasing="ease-in-out"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScatterChartComponent({ data, xKey, yKey, title }) {
  return (
    <div className="premium-card relative group" style={{ animation: 'slideInUp 0.8s ease-out 0.4s both' }}>
      <div className="absolute -inset-px bg-gradient-to-r from-orange-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(249, 115, 22, 0.8)' }} />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <filter id="scatterGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(249, 115, 22, 0.2)"
              vertical={false}
            />
            <XAxis
              type="number"
              dataKey={xKey}
              stroke="rgba(148, 163, 184, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              stroke="rgba(148, 163, 184, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<PremiumTooltip />} />
            <Scatter
              name={title}
              data={data}
              fill="#f97316"
              filter="url(#scatterGlow)"
              animationDuration={1200}
              isAnimationActive={true}
              shape={<CustomScatterDot />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom Scatter Dot with Glow
const CustomScatterDot = (props) => {
  const { cx, cy, fill } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={fill}
      opacity={0.8}
      style={{
        filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.8))',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.target.setAttribute('r', 8);
        e.target.style.filter = 'drop-shadow(0 0 12px rgba(249, 115, 22, 1))';
      }}
      onMouseLeave={(e) => {
        e.target.setAttribute('r', 5);
        e.target.style.filter = 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.8))';
      }}
    />
  );
}
