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
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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

/** Multiple series grouped side-by-side per category — e.g. accept% vs noise% per repo. */
export function GroupedBarChart({
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
      <BarChart data={data} margin={{ top: 28, right: 12, bottom: 44, left: -8 }} barGap={4}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey={xKey}
          {...axisProps}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        {/* Wide enough that a 3-digit value with a unit (e.g. "100%") never gets clipped —
            a narrower width here previously truncated leading digits, making "100%"/"75%"
            render as "0%"/"5%". */}
        <YAxis {...axisProps} width={50} unit={unit} domain={yDomain} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "color-mix(in srgb, var(--color-zinc-900) 6%, transparent)" }} />
        {/* Pinned to the top, not the (recharts) default bottom — the bottom margin is
            already reserved for the angled category labels, and the two would otherwise
            render on top of each other. */}
        <Legend verticalAlign="top" align="right" height={28} iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--color-zinc-600)" }} />
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={SERIES[i % SERIES.length]} radius={[4, 4, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

/** Small donut with a side legend — for a handful of categories (e.g. run status counts). */
export function DonutChart({ data, height = 160 }: { data: DonutSlice[]; height?: number }) {
  if (data.length === 0) return null;
  const size = Math.max(height, 120);
  const outerRadius = Math.floor(size * 0.4);
  const innerRadius = Math.floor(outerRadius * 0.6);

  return (
    <div className="flex items-center gap-4" style={{ minHeight: size }}>
      <div className="shrink-0 overflow-visible" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="var(--color-zinc-50)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color ?? SERIES[i % SERIES.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-zinc-700">
            <span
              className="inline-block size-2.5 shrink-0 rounded-sm"
              style={{ background: d.color ?? SERIES[i % SERIES.length] }}
            />
            <span className="min-w-0 truncate capitalize">{d.name}</span>
            <span className="ml-auto tabular-nums text-zinc-500">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
