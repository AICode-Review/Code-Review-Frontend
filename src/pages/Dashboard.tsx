import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useRuns } from "../features/runs/useRuns";
import { useAnalytics } from "../features/analytics/useAnalytics";
import { useRepos } from "../features/repos/useRepos";
import { Card, EmptyState, ErrorText, LoadingText } from "../components/ui";
import {
  AreaTrendChart,
  CategoryBarChart,
  CHART,
  DonutChart,
  GroupedBarChart,
  SERIES,
  Sparkline,
  TrendChart,
} from "../components/charts";
import { useOrg } from "../hooks/useOrg";

const RUN_STATUS_COLORS: Record<string, string> = {
  completed: CHART.success,
  failed: CHART.danger,
  running: CHART.brand,
  queued: CHART.warning,
  cancelled: CHART.muted,
};

const EMPTY_WEEKLY = ["-5w", "-4w", "-3w", "-2w", "-1w", "Now"].map((week) => ({
  week,
  findingsPosted: 0,
  accepted: 0,
  dismissed: 0,
  acceptancePct: 0,
  noisePct: 0,
  medianLatencyMin: 0,
}));

function EmptyChartFrame({ empty, children }: { empty: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <div className={empty ? "opacity-35" : undefined}>{children}</div>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-zinc-50/95 px-3 py-2 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
            Waiting for review data
          </p>
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={`flex flex-col overflow-hidden border-zinc-200/80 bg-zinc-50 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-display text-[15px] font-semibold tracking-tight text-zinc-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={`flex-1 px-3 pb-4 pt-3 sm:px-4 ${bodyClassName}`}>{children}</div>
    </Card>
  );
}

function MetricHero({
  label,
  value,
  target,
  ok,
  sparkKey,
  sparkData,
  color,
}: {
  label: string;
  value: string;
  target: string;
  ok: boolean | null;
  sparkKey: string;
  sparkData: object[];
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 px-3.5 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
        {ok != null && (
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
              ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
            }`}
          >
            {ok ? "On track" : "Watch"}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold tabular-nums tracking-tight text-zinc-950">
            {value}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{target}</p>
        </div>
        <div className="w-20 shrink-0 sm:w-24">
          <Sparkline data={sparkData} dataKey={sparkKey} color={color} height={28} />
        </div>
      </div>
    </div>
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function formatLatency(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export default function Dashboard() {
  const { data: org } = useOrg();
  const { data: runs, isLoading, error } = useRuns();
  const { data: repos } = useRepos();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const weekly = analytics?.weekly ?? [];
  const categories = analytics?.categories ?? [];
  const hasAnalyticsData =
    categories.length > 0 ||
    weekly.some(
      (point) =>
        point.findingsPosted > 0 ||
        point.accepted > 0 ||
        point.dismissed > 0 ||
        point.medianLatencyMin > 0,
    );
  const latest = hasAnalyticsData ? weekly[weekly.length - 1] : undefined;
  const chartWeekly = weekly.length > 0 ? weekly : EMPTY_WEEKLY;
  const chartCategories = categories.length > 0 ? categories : [{ category: "—", count: 0 }];
  const sparkWeekly = hasAnalyticsData ? weekly : [];

  const runStats = useMemo(() => {
    const list = runs ?? [];
    const completed = list.filter((r) => r.status === "completed");
    const failed = list.filter((r) => r.status === "failed");
    const inProgress = list.filter((r) => r.status === "running" || r.status === "queued");
    const candidates = completed.reduce((sum, r) => sum + r.candidates, 0);
    const verified = completed.reduce((sum, r) => sum + r.verified, 0);
    const posted = completed.reduce((sum, r) => sum + r.posted, 0);
    const latencies = completed.map((r) => r.latency_ms).filter((v): v is number => v != null);
    return {
      total: list.length,
      completed: completed.length,
      failed: failed.length,
      inProgress: inProgress.length,
      candidates,
      verified,
      posted,
      medianLatencyMs: median(latencies),
      verificationPct: candidates > 0 ? Math.round((verified / candidates) * 100) : null,
    };
  }, [runs]);

  const repoChartData = useMemo(() => {
    return [...(repos ?? [])]
      .sort((a, b) => (b.openPrs ?? 0) - (a.openPrs ?? 0) || (b.noisePct ?? 0) - (a.noisePct ?? 0))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name.length > 16 ? `${repo.name.slice(0, 14)}…` : repo.name,
        accept: repo.acceptancePct ?? 0,
        noise: repo.noisePct ?? 0,
        openPrs: repo.openPrs,
      }));
  }, [repos]);

  const hasRepoPulse = repoChartData.some((r) => r.accept > 0 || r.noise > 0);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of runs ?? []) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value, color: RUN_STATUS_COLORS[name] }))
      .sort((a, b) => b.value - a.value);
  }, [runs]);

  const funnelChartData = useMemo(
    () => [
      { stage: "Candidates", count: runStats.candidates },
      { stage: "Verified", count: runStats.verified },
      { stage: "Posted", count: runStats.posted },
    ],
    [runStats.candidates, runStats.verified, runStats.posted],
  );

  const latencyMinutes =
    latest && latest.medianLatencyMin > 0
      ? latest.medianLatencyMin
      : runStats.medianLatencyMs != null
        ? Math.round((runStats.medianLatencyMs / 60000) * 10) / 10
        : null;

  const latencyValue =
    latencyMinutes != null ? `${latencyMinutes}m` : formatLatency(runStats.medianLatencyMs);

  const trendsUnlocked = !analyticsLoading && analytics?.source !== "plan_required";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-700">
            {org?.name ?? "Workspace"}
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Review analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Quality, volume, and pipeline health at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/reviews"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300"
          >
            All reviews
          </Link>
          <Link
            to={org?.platform === "bitbucket" ? "/docs/bitbucket" : "/onboarding"}
            className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium shadow-sm transition"
          >
            {org?.platform === "bitbucket" ? "Setup guide" : "Add repository"}
          </Link>
        </div>
      </div>

      {isLoading && <LoadingText>Loading analytics…</LoadingText>}
      {error && <ErrorText>Failed to load runs: {(error as Error).message}</ErrorText>}

      {!analyticsLoading && analytics?.source === "plan_required" && (
        <Card className="flex flex-col gap-3 border-blue-200 bg-blue-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-semibold text-zinc-950">Trend charts unlock on Team</p>
            <p className="mt-0.5 text-xs text-zinc-600">Upgrade to see acceptance, noise, and volume over time.</p>
          </div>
          <Link to="/settings" className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white">
            Upgrade
          </Link>
        </Card>
      )}

      {/* Hero metrics with sparklines */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricHero
          label="Acceptance"
          value={latest ? `${latest.acceptancePct}%` : "—"}
          target="Target ≥ 70%"
          ok={latest ? latest.acceptancePct >= 70 : null}
          sparkKey="acceptancePct"
          sparkData={sparkWeekly}
          color={SERIES[1]}
        />
        <MetricHero
          label="Noise"
          value={latest ? `${latest.noisePct}%` : "—"}
          target="Target < 5%"
          ok={latest ? latest.noisePct < 5 : null}
          sparkKey="noisePct"
          sparkData={sparkWeekly}
          color={SERIES[2]}
        />
        <MetricHero
          label="Median latency"
          value={latencyValue}
          target="Target < 5m"
          ok={latencyMinutes != null ? latencyMinutes < 5 : null}
          sparkKey="medianLatencyMin"
          sparkData={sparkWeekly}
          color={SERIES[0]}
        />
      </div>

      {/* Secondary pipeline strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Verified rate", value: runStats.verificationPct != null ? `${runStats.verificationPct}%` : "—" },
          { label: "In progress", value: String(runStats.inProgress) },
          { label: "Failed", value: String(runStats.failed) },
          { label: "Posted this week", value: String(latest?.findingsPosted ?? 0) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3"
          >
            <p className="text-[11px] font-medium text-zinc-500">{s.label}</p>
            <p className="font-display mt-1 text-lg font-semibold tabular-nums text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main charts */}
      {trendsUnlocked && (
        <>
          <Panel
            title="Acceptance vs noise"
            subtitle="Weekly quality trend — acceptance should rise, noise should stay low"
          >
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <TrendChart
                data={chartWeekly}
                xKey="week"
                yDomain={[0, 100]}
                unit="%"
                height={320}
                series={[
                  { key: "acceptancePct", label: "Acceptance", color: SERIES[1] },
                  { key: "noisePct", label: "Noise", color: SERIES[2] },
                ]}
              />
            </EmptyChartFrame>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Findings posted" subtitle="Verified comments shipped per week">
              <EmptyChartFrame empty={!hasAnalyticsData}>
                <AreaTrendChart
                  data={chartWeekly}
                  xKey="week"
                  yKey="findingsPosted"
                  label="Posted"
                  color={SERIES[0]}
                  gradientId="dash-posted-v2"
                  height={260}
                />
              </EmptyChartFrame>
            </Panel>
            <Panel title="Review latency" subtitle="Median minutes to finish a run">
              <EmptyChartFrame empty={!hasAnalyticsData}>
                <AreaTrendChart
                  data={chartWeekly}
                  xKey="week"
                  yKey="medianLatencyMin"
                  label="Minutes"
                  unit="m"
                  color={CHART.info}
                  gradientId="dash-latency-v2"
                  height={260}
                />
              </EmptyChartFrame>
            </Panel>
          </div>

          <Panel title="Findings by category" subtitle="Where risk shows up most often">
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <CategoryBarChart
                data={chartCategories}
                xKey="category"
                yKey="count"
                label="Findings"
                height={280}
              />
            </EmptyChartFrame>
          </Panel>
        </>
      )}

      {/* Bottom chart trio */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Run status"
          subtitle="All runs in this workspace"
          action={
            <Link to="/reviews" className="text-xs font-semibold text-blue-700 hover:underline">
              View →
            </Link>
          }
        >
          {statusBreakdown.length === 0 ? (
            <EmptyState>No runs yet.</EmptyState>
          ) : (
            <DonutChart data={statusBreakdown} height={200} />
          )}
        </Panel>

        <Panel title="Verification funnel" subtitle="Candidates → verified → posted">
          {runStats.candidates === 0 ? (
            <EmptyState>Complete a review to see the funnel.</EmptyState>
          ) : (
            <CategoryBarChart data={funnelChartData} xKey="stage" yKey="count" label="Count" height={220} />
          )}
        </Panel>

        <Panel
          title={hasRepoPulse ? "Repo quality" : "Open PRs by repo"}
          subtitle={hasRepoPulse ? "Acceptance vs noise" : "Until feedback lands"}
          action={
            <Link to="/repos" className="text-xs font-semibold text-blue-700 hover:underline">
              Repos →
            </Link>
          }
        >
          {repoChartData.length === 0 ? (
            <EmptyState>
              <Link to="/onboarding" className="text-blue-700 hover:underline">
                Connect a repository
              </Link>
            </EmptyState>
          ) : (
            <GroupedBarChart
              data={repoChartData}
              xKey="name"
              yDomain={hasRepoPulse ? [0, 100] : undefined}
              unit={hasRepoPulse ? "%" : undefined}
              height={Math.max(220, repoChartData.length * 40)}
              layout="horizontal"
              series={
                hasRepoPulse
                  ? [
                      { key: "accept", label: "Accept", color: SERIES[1] },
                      { key: "noise", label: "Noise", color: SERIES[2] },
                    ]
                  : [{ key: "openPrs", label: "Open PRs", color: SERIES[0] }]
              }
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
