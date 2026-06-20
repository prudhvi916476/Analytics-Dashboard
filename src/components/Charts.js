"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import styles from './Charts.module.css';

// Vibrant neon-inspired palette that complements glass UI
const COLORS = ['#22d3ee', '#a78bfa', '#fb7185', '#34d399', '#fbbf24', '#f472b6'];

function formatCurrency(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'revenue' || entry.name === 'value' ? '₹' : ''}
            {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }) {
  if (!data || data.length === 0) return <div className={styles.empty}>No data available</div>;
  
  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Revenue Over Time</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35}/>
                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.15}/>
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#7b8db5" 
              tick={{fontSize: 11, fill: '#7b8db5'}} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#7b8db5" 
              tick={{fontSize: 11, fill: '#7b8db5'}} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => formatCurrency(value)} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="url(#strokeRevenue)" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryChart({ data }) {
  if (!data || data.length === 0) return <div className={styles.empty}>No data available</div>;

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Sales by Category</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              stroke="#7b8db5" 
              tick={{fontSize: 11, fill: '#7b8db5'}} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => formatCurrency(value)} 
            />
            <YAxis 
              dataKey="category" 
              type="category" 
              stroke="#7b8db5" 
              tick={{fontSize: 11, fill: '#7b8db5'}} 
              tickLine={false} 
              axisLine={false} 
              width={100} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrderTypeChart({ data }) {
  if (!data || data.length === 0) return <div className={styles.empty}>No data available</div>;

  const totalRevenue = data.reduce((sum, entry) => sum + (entry.revenue || 0), 0);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Orders by Type</h3>
      <div className={styles.chartWrapper}>
        <div style={{ position: 'relative', flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="revenue"
                nameKey="type"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className={styles.pieCenter}>
            <span className={styles.pieCenterValue}>
              {formatCurrency(totalRevenue)}
            </span>
            <span className={styles.pieCenterLabel}>Total</span>
          </div>
        </div>
        <div className={styles.legend}>
          {data.map((entry, index) => {
            const pct = totalRevenue > 0 ? ((entry.revenue / totalRevenue) * 100).toFixed(1) : 0;
            return (
              <div key={index} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }}
                />
                <span className={styles.legendLabel}>{entry.type}</span>
                <span className={styles.legendValue}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
