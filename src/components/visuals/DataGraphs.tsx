import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts'

const themeColors = {
  primary: '#3b82f6',
  secondary: '#22c55e',
  accent: '#a855f7',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
}

const chartColors = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

interface BaseChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  height?: number
  title?: string
  color?: string
  dark?: boolean
}

interface MultiLineChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey?: string
  lines?: { key: string; color: string; name: string }[]
  height?: number
  title?: string
  dark?: boolean
}

interface PieChartProps {
  data: { name: string; value: number; color?: string }[]
  height?: number
  title?: string
  dark?: boolean
  innerRadius?: number
}

interface HeatmapProps {
  data: { x: string; y: string; value: number }[]
  height?: number
  title?: string
  dark?: boolean
}

interface LossCurveProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  height?: number
  title?: string
  color?: string
  dark?: boolean
}

export function LossCurveChart({ data, xKey, yKey, height = 250, title, color = themeColors.primary, dark }: LossCurveProps) {
  return (
    <ChartContainer title={title || 'Loss Curve'} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: dark ? '#1f2937' : '#fff', border: dark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
          {data && <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function MultiLineChart({ data, xKey, lines = [], height = 250, title, dark }: MultiLineChartProps) {
  return (
    <ChartContainer title={title || 'Multi-Line Chart'} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: dark ? '#1f2937' : '#fff', border: dark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} name={l.name} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function BarChartGraph({ data, xKey, yKey, height = 250, title, color = themeColors.primary, dark }: BaseChartProps) {
  return (
    <ChartContainer title={title || 'Bar Chart'} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: dark ? '#1f2937' : '#fff', border: dark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function ScatterPlot({ data, xKey, yKey, height = 250, title, color = themeColors.primary, dark }: BaseChartProps) {
  return (
    <ChartContainer title={title || 'Scatter Plot'} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} name={xKey} />
          <YAxis dataKey={yKey} tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} name={yKey} />
          <ZAxis range={[60, 60]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: dark ? '#1f2937' : '#fff', border: dark ? '1px solid #374151' : '1px solid #e5e7eb' }} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function PieChartGraph({ data, height = 250, title, dark, innerRadius = 0 }: PieChartProps) {
  return (
    <ChartContainer title={title || 'Pie Chart'} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || chartColors[i % chartColors.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: dark ? '#1f2937' : '#fff', border: dark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function HeatmapGrid({ data, height = 250, title, dark }: HeatmapProps) {
  const xs = useMemo(() => [...new Set(data.map((d) => d.x))], [data])
  const ys = useMemo(() => [...new Set(data.map((d) => d.y))], [data])
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])
  const cellW = Math.max(30, Math.min(80, 400 / xs.length))
  const cellH = Math.max(24, Math.min(50, 300 / ys.length))

  return (
    <ChartContainer title={title || 'Heatmap'} height={height}>
      <div className="overflow-x-auto">
        <svg width={xs.length * cellW + 80} height={ys.length * cellH + 40} className="mx-auto">
          {/* column headers */}
          {xs.map((x, i) => (
            <text key={`xh-${i}`} x={i * cellW + cellW / 2 + 80} y={14} textAnchor="middle" fontSize={9} fill={dark ? '#9ca3af' : '#6b7280'}>{x}</text>
          ))}
          {/* row headers + cells */}
          {ys.map((y, j) => (
            <g key={`row-${j}`}>
              <text x={75} y={j * cellH + cellH / 2 + 20} textAnchor="end" fontSize={9} fill={dark ? '#9ca3af' : '#6b7280'} dominantBaseline="middle">{y}</text>
              {xs.map((x, i) => {
                const d = data.find((d) => d.x === x && d.y === y)
                const val = d ? d.value : 0
                const intensity = maxVal > 0 ? val / maxVal : 0
                const r = Math.round(220 - intensity * 180)
                const g = Math.round(220 - intensity * 120)
                const b = 255
                const fill = `rgb(${r}, ${g}, ${b})`
                return (
                  <g key={`cell-${i}-${j}`}>
                    <rect x={i * cellW + 80} y={j * cellH + 16} width={cellW - 2} height={cellH - 2} rx={3} fill={fill} stroke={dark ? '#374151' : '#e5e7eb'} strokeWidth={0.5} />
                    <text x={i * cellW + cellW / 2 + 80} y={j * cellH + cellH / 2 + 16} textAnchor="middle" fontSize={10} fill={intensity > 0.5 ? '#fff' : '#374151'} dominantBaseline="middle" fontWeight={600}>
                      {val}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>
    </ChartContainer>
  )
}

function ChartContainer({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      {title && (
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
      )}
      <div style={{ height }}>{children}</div>
    </div>
  )
}

export { chartColors, themeColors }
