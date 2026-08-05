/**
 * Chart wrappers — chrome (grid/axis/tooltip) uses CSS vars so light/dark
 * themes from .app-shell[data-theme] apply automatically. Series paints use
 * --chart-* fills (saturated in both themes; not the inverted text palette).
 */
import type { ReactElement } from "react";
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

/** Brand series — resolve via --chart-* under .app-shell. */
export const SERIES = [
  "var(--chart-brand)",
  "var(--chart-success)",
  "var(--chart-warning)",
  "var(--chart-danger)",
] as const;

export const CHART = {
  brand: "var(--chart-brand)",
  success: "var(--chart-success)",
  warning: "var(--chart-warning)",
  danger: "var(--chart-danger)",
  info: "var(--chart-info)",
  muted: "var(--chart-muted)",
} as const;

const GRID = "var(--color-zinc-200)";
const AXIS_INK = "var(--color-zinc-500)";
const SURFACE = "var(--color-zinc-50)";
const INK = "var(--color-zinc-900)";
const MUTED = "var(--color-zinc-500)";
const BORDER = "var(--color-zinc-200)";
const CURSOR = "var(--color-zinc-300)";

const axisProps = {
  stroke: "transparent",
  tick: { fill: AXIS_INK, fontSize: 11, fontWeight: 500 },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    fontSize: 12,
    padding: "10px 12px",
    boxShadow: "0 8px 24px color-mix(in srgb, var(--color-zinc-950) 18%, transparent)",
  },
  labelStyle: { color: MUTED, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: INK, fontWeight: 500 },
  cursor: { stroke: CURSOR, strokeWidth: 1, strokeDasharray: "4 4" },
} as const;

export interface SeriesSpec {
  key: string;
  label: string;
  color?: string;
  format?: (v: number) => string;
}

function ChartFrame({ children, height }: { children: ReactElement; height: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function formatTick(v: number, unit?: string): string {
  if (unit === "%") return `${v}%`;
  if (unit) return `${v}${unit}`;
  return String(v);
}

export function TrendChart({
  data,
  xKey,
  series,
  yDomain,
  unit,
  height = 240,
}: {
  data: object[];
  xKey: string;
  series: SeriesSpec[];
  yDomain?: [number, number];
  unit?: string;
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" dy={6} />
        <YAxis
          {...axisProps}
          domain={yDomain}
          width={48}
          tickFormatter={(v: number) => formatTick(v, unit)}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: number | string, name: string) => {
            const n = typeof value === "number" ? value : Number(value);
            return [formatTick(Number.isFinite(n) ? n : 0, unit), name];
          }}
        />
        {series.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: MUTED, paddingTop: 8 }}
          />
        )}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? SERIES[i % SERIES.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: SURFACE }}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function AreaTrendChart({
  data,
  xKey,
  yKey,
  label,
  height = 240,
  color = SERIES[0],
  unit,
  gradientId,
}: {
  data: object[];
  xKey: string;
  yKey: string;
  label: string;
  height?: number;
  color?: string;
  unit?: string;
  gradientId?: string;
}) {
  const fillId = gradientId ?? `areaFill-${yKey}`;
  return (
    <ChartFrame height={height}>
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" dy={6} />
        <YAxis {...axisProps} width={48} tickFormatter={(v: number) => formatTick(v, unit)} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: number | string) => {
            const n = typeof value === "number" ? value : Number(value);
            return [formatTick(Number.isFinite(n) ? n : 0, unit), label];
          }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          name={label}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${fillId})`}
          activeDot={{ r: 5, strokeWidth: 2, stroke: SURFACE }}
        />
      </AreaChart>
    </ChartFrame>
  );
}

export function CategoryBarChart({
  data,
  xKey,
  yKey,
  label,
  height = 240,
}: {
  data: object[];
  xKey: string;
  yKey: string;
  label: string;
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 4 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey={xKey} {...axisProps} interval={0} dy={4} />
        <YAxis {...axisProps} width={40} allowDecimals={false} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "color-mix(in srgb, var(--color-zinc-950) 4%, transparent)" }}
        />
        <Bar dataKey={yKey} name={label} fill={SERIES[0]} radius={[6, 6, 0, 0]} maxBarSize={44}>
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

/** Vertical grouped bars — prefer horizontal layout for long category labels. */
export function GroupedBarChart({
  data,
  xKey,
  series,
  yDomain,
  unit,
  height = 240,
  layout = "vertical",
}: {
  data: object[];
  xKey: string;
  series: SeriesSpec[];
  yDomain?: [number, number];
  unit?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
}) {
  if (layout === "horizontal") {
    return (
      <ChartFrame height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
          barGap={4}
          barCategoryGap="22%"
        >
          <CartesianGrid stroke={GRID} horizontal={false} strokeDasharray="3 6" />
          <XAxis
            type="number"
            {...axisProps}
            domain={yDomain ?? [0, 100]}
            tickFormatter={(v: number) => formatTick(v, unit)}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            {...axisProps}
            width={112}
            tick={{ fill: AXIS_INK, fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: "color-mix(in srgb, var(--color-zinc-950) 4%, transparent)" }}
            formatter={(value: number | string, name: string) => {
              const n = typeof value === "number" ? value : Number(value);
              return [formatTick(Number.isFinite(n) ? n : 0, unit), name];
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: MUTED }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color ?? SERIES[i % SERIES.length]}
              radius={[0, 5, 5, 0]}
              maxBarSize={14}
            />
          ))}
        </BarChart>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 32, right: 12, bottom: 48, left: 4 }} barGap={6}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 6" />
        <XAxis
          dataKey={xKey}
          {...axisProps}
          interval={0}
          angle={-28}
          textAnchor="end"
          height={56}
        />
        <YAxis
          {...axisProps}
          width={48}
          domain={yDomain}
          tickFormatter={(v: number) => formatTick(v, unit)}
        />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "color-mix(in srgb, var(--color-zinc-950) 4%, transparent)" }}
          formatter={(value: number | string, name: string) => {
            const n = typeof value === "number" ? value : Number(value);
            return [formatTick(Number.isFinite(n) ? n : 0, unit), name];
          }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: MUTED }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color ?? SERIES[i % SERIES.length]}
            radius={[5, 5, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

const DONUT_FALLBACK = [
  CHART.brand,
  CHART.success,
  CHART.warning,
  CHART.danger,
  CHART.muted,
] as const;

/** Tiny sparkline for KPI cards — no axes, just the shape. */
export function Sparkline({
  data,
  dataKey,
  color = SERIES[0],
  height = 40,
}: {
  data: object[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  if (data.length < 2) {
    return <div style={{ height }} className="w-full" />;
  }
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${dataKey})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Small donut with center total + side legend. */
export function DonutChart({
  data,
  height = 160,
  centerLabel = "runs",
}: {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
}) {
  if (data.length === 0) return null;
  const size = Math.max(height, 128);
  const outerRadius = Math.floor(size * 0.4);
  const innerRadius = Math.floor(outerRadius * 0.62);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex w-full items-center gap-5" style={{ minHeight: size }}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
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
              paddingAngle={3}
              stroke={SURFACE}
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color ?? DONUT_FALLBACK[i % DONUT_FALLBACK.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold tabular-nums text-zinc-900">{total}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 text-xs">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.name} className="flex items-center gap-2.5 text-zinc-700">
              <span
                className="inline-block size-2.5 shrink-0 rounded-sm"
                style={{ background: d.color ?? DONUT_FALLBACK[i % DONUT_FALLBACK.length] }}
              />
              <span className="min-w-0 flex-1 truncate capitalize">{d.name}</span>
              <span className="tabular-nums text-zinc-500">{pct}%</span>
              <span className="w-6 text-right font-semibold tabular-nums text-zinc-800">{d.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
