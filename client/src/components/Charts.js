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
  ComposedChart,
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

// Radar Chart Component
export function RadarChartComponent({ data, xKey, yKey, title }) {
  // Transform data for radar chart
  const radarData = data.slice(0, 8).map(item => ({
    name: item[xKey],
    value: item[yKey],
  }));

  return (
    <div className="premium-card relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            📡 {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <defs>
              <filter id="radarGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.6)' }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: 'rgba(148, 163, 184, 0.4)' }} />
            <Radar name={yKey} dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} filter="url(#radarGlow)" />
            <Tooltip content={<PremiumTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Histogram (Distribution Chart)
export function HistogramComponent({ data, xKey, yKey, title }) {
  const histData = data.slice(0, 10).map(item => ({
    name: item[xKey],
    frequency: item[yKey],
  }));

  return (
    <div className="premium-card relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
            📊 {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={histData} margin={{ top: 10, right: 15, left: 0, bottom: 15 }}>
            <defs>
              <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.2)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} />
            <Tooltip content={<PremiumTooltip />} />
            <Bar dataKey="frequency" fill="url(#histGradient)" radius={[8, 8, 0, 0]} barCategoryGap={0} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Funnel Chart Component
export function FunnelComponent({ data, xKey, yKey, title }) {
  const funnelData = data.slice(0, 6).map((item, idx) => ({
    name: item[xKey],
    value: item[yKey],
    fill: ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e'][idx],
  }));

  return (
    <div className="premium-card relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">
            🔥 {title}
          </h3>
        </div>
        <div className="space-y-2 pt-2">
          {funnelData.map((item, idx) => {
            const percentage = (item.value / funnelData[0].value) * 100;
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 truncate">{item.name}</span>
                  <span className="text-slate-400">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-5 bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600/50">
                  <div
                    className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(to right, ${item.fill}40, ${item.fill})`,
                      boxShadow: `inset 0 0 8px ${item.fill}40`
                    }}
                  >
                    {percentage > 15 && <span className="text-xs font-bold text-white">{item.value}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Bubble Chart Component
export function BubbleChartComponent({ data, xKey, yKey, title }) {
  const bubbleData = data.slice(0, 8).map((item, idx) => ({
    x: idx + 1,
    y: item[yKey],
    z: Math.abs(item[yKey]) * 0.5,
    name: item[xKey],
  }));

  return (
    <div className="premium-card relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            💧 {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 15, bottom: 15, left: 40 }}>
            <defs>
              <filter id="bubbleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.2)" />
            <XAxis type="number" dataKey="x" stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} />
            <YAxis type="number" dataKey="y" stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} />
            <Tooltip content={<PremiumTooltip />} />
            <Scatter name={title} data={bubbleData} fill="#06b6d4" fillOpacity={0.6} shape={<CustomBubbleDot />} filter="url(#bubbleGlow)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom Bubble Dot
const CustomBubbleDot = (props) => {
  const { cx, cy, payload } = props;
  const z = payload?.z || 5;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={Math.min(z, 15)}
      fill="#06b6d4"
      fillOpacity={0.7}
      stroke="#0891b2"
      strokeWidth={1}
      filter="url(#bubbleGlow)"
      style={{
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.target.setAttribute('fillOpacity', 1);
      }}
      onMouseLeave={(e) => {
        e.target.setAttribute('fillOpacity', 0.7);
      }}
    />
  );
}

// Composed Chart Component (Combination of Bar and Line)
export function ComposedChartComponent({ data, xKey, yKey, title }) {
  const composedData = data.slice(0, 10).map((item, idx) => ({
    name: item[xKey],
    value: item[yKey],
    trend: item[yKey] * (1 + Math.random() * 0.3),
  }));

  return (
    <div className="premium-card relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            📈 {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={composedData} margin={{ top: 10, right: 15, left: 0, bottom: 15 }}>
            <defs>
              <linearGradient id="composedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 158, 11, 0.2)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} yAxisId="left" />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fontSize: 10 }} yAxisId="right" orientation="right" />
            <Tooltip content={<PremiumTooltip />} />
            <Bar yAxisId="left" dataKey="value" fill="url(#composedGradient)" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="trend" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
