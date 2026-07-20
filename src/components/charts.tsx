/**
 * Chart wrappers, themed via CSS custom properties rather than hardcoded hex —
 * Recharts accepts any valid CSS color string for stroke/fill, and since these
 * render inside .app-shell[data-theme], the browser resolves the right value
 * per theme with zero extra plumbing (see index.css's .app-shell[data-theme]
 * blocks for what each token resolves to).
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const SERIES = ["var(--color-blue-600)", "var(--color-emerald-600)", "var(--color-red-600)"] as const;
const GRID = "var(--color-zinc-200)";
const AXIS_INK = "var(--color-zinc-500)";

const axisProps = {
  stroke: "transparent",
  tick: { fill: AXIS_INK, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: "var(--color-zinc-300)" },
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-zinc-100)",
    border: "1px solid var(--color-zinc-200)",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 8px 24px color-mix(in srgb, var(--color-zinc-950) 20%, transparent)",
  },
  labelStyle: { color: "var(--color-zinc-600)" },
  itemStyle: { color: "var(--color-zinc-900)" },
  cursor: { stroke: "var(--color-zinc-400)", strokeWidth: 1 },
} as const;

export interface SeriesSpec {
  key: string;
  label: string;
  /** e.g. (v) => `${v}%` */
  format?: (v: number) => string;
}

export function TrendChart({
  data,
  xKey,
  series,
  yDomain,
  unit,
  height = 220,
}: {
  data: object[];
  xKey: string;
  series: SeriesSpec[];
  yDomain?: [number, number];
  unit?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} domain={yDomain} unit={unit} width={48} />
        <Tooltip {...tooltipStyle} />
        {series.length > 1 && (
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "var(--color-zinc-600)" }} />
        )}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={SERIES[i % SERIES.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-zinc-50)" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaTrendChart({
  data,
  xKey,
  yKey,
  label,
  height = 220,
}: {
  data: object[];
  xKey: string;
  yKey: string;
  label: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={48} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey={yKey}
          name={label}
          stroke={SERIES[0]}
          strokeWidth={2}
          fill="url(#areaFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
  xKey,
  yKey,
  label,
  height = 220,
}: {
  data: object[];
  xKey: string;
  yKey: string;
  label: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }} barCategoryGap="35%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} interval={0} />
        <YAxis {...axisProps} width={48} allowDecimals={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "color-mix(in srgb, var(--color-zinc-900) 6%, transparent)" }} />
        <Bar dataKey={yKey} name={label} fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
