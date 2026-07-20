import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useRuns, type RunRow } from "../features/runs/useRuns";
import { useAnalytics } from "../features/analytics/useAnalytics";
import { useRepos, type Repo } from "../features/repos/useRepos";
import { timeAgo, usd } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";
import { AreaTrendChart, CategoryBarChart, TrendChart } from "../components/charts";
import { PageIntro } from "../components/layout/AppShell";

type AttentionItem = {
  id: string;
  severity: "critical" | "watch" | "info";
  title: string;
  detail: string;
  href: string;
  cta: string;
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
      <div className={empty ? "opacity-45" : undefined}>{children}</div>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-zinc-200 bg-zinc-50/95 px-3 py-1.5 text-xs text-zinc-500 shadow-sm">
            Waiting for completed review data
          </span>
        </div>
      )}
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

function deltaLabel(current: number | undefined, previous: number | undefined, unit = "pts"): string | null {
  if (current == null || previous == null) return null;
  const delta = Math.round((current - previous) * 10) / 10;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}${unit === "%" ? "" : ` ${unit}`}${unit === "%" ? "%" : ""}`;
}

function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string;
  hint?: string | null;
  tone?: "good" | "warn" | "neutral";
  href?: string;
}) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-zinc-500";
  const accentClass =
    tone === "good"
      ? "from-emerald-500 to-emerald-200"
      : tone === "warn"
        ? "from-amber-500 to-amber-200"
        : "from-blue-600 to-blue-400";
  const glowClass =
    tone === "good" ? "bg-emerald-100" : tone === "warn" ? "bg-amber-100" : "bg-blue-100";
  const body = (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50 p-4 shadow-sm shadow-zinc-200/40 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-linear-to-r ${accentClass}`} />
      <div
        className={`absolute -right-8 -top-8 size-20 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-70 ${glowClass}`}
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-zinc-950">{value}</p>
        {hint && <p className={`mt-1.5 truncate text-[11px] ${toneClass}`}>{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link to={href} className="block">{body}</Link> : body;
}

function FunnelStep({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-zinc-600">{label}</span>
        <span className="text-xs font-medium tabular-nums text-zinc-800">
          {value} <span className="text-zinc-400">({pct}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RunRowItem({ run }: { run: RunRow }) {
  const verificationPct =
    run.candidates > 0 ? Math.round((run.verified / run.candidates) * 100) : null;

  return (
    <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80">
      <td className="px-4 py-3">
        <Link to={`/runs/${run.id}`} className="block min-w-0 hover:text-blue-700">
          <span className="text-sm font-medium text-zinc-900">
            {run.pull_requests?.repos?.name ?? "unknown"}
            <span className="text-zinc-500"> #{run.pull_requests?.number ?? "?"}</span>
          </span>
          {run.summary && <span className="mt-0.5 block truncate text-xs text-zinc-500">{run.summary}</span>}
          <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">{run.head_sha.slice(0, 7)}</span>
        </Link>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <Badge kind={run.trigger === "manual" ? "manual" : "automatic"}>
          {run.trigger === "manual" ? "manual" : "auto"}
        </Badge>
      </td>
      <td className="hidden px-4 py-3 text-xs tabular-nums text-zinc-600 lg:table-cell">{timeAgo(run.started_at)}</td>
      <td className="hidden px-4 py-3 text-xs tabular-nums text-zinc-600 xl:table-cell">
        {run.verified}/{run.candidates}
        {verificationPct !== null && <span className="text-zinc-400"> · {verificationPct}%</span>}
      </td>
      <td className="hidden px-4 py-3 text-xs tabular-nums text-zinc-600 2xl:table-cell">
        {formatLatency(run.latency_ms)}
      </td>
      <td className="hidden px-4 py-3 text-xs tabular-nums text-zinc-600 2xl:table-cell">
        {run.llm_cost_usd > 0 ? usd(Number(run.llm_cost_usd)) : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <Badge kind={run.status} />
          <Link to={`/runs/${run.id}`} className="text-[11px] text-blue-600 hover:underline">
            Open →
          </Link>
        </div>
      </td>
    </tr>
  );
}

function buildAttention(runs: RunRow[], repos: Repo[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  const failed = runs.filter((r) => r.status === "failed").slice(0, 3);
  for (const run of failed) {
    items.push({
      id: `fail-${run.id}`,
      severity: "critical",
      title: `Review failed on ${run.pull_requests?.repos?.name ?? "repo"} #${run.pull_requests?.number ?? "?"}`,
      detail: run.summary ?? "Open the run to inspect the failure and re-trigger if needed.",
      href: `/runs/${run.id}`,
      cta: "Inspect run",
    });
  }

  const noisyRepos = repos.filter((r) => r.noisePct > 5).sort((a, b) => b.noisePct - a.noisePct).slice(0, 2);
  for (const repo of noisyRepos) {
    items.push({
      id: `noise-${repo.id}`,
      severity: "watch",
      title: `${repo.name} noise is ${repo.noisePct}%`,
      detail: "Above the 5% target — review dismissed findings and tighten the rulebook.",
      href: `/repos/${repo.id}`,
      cta: "Open repo",
    });
  }

  const indexIssues = repos.filter((r) => r.indexStatus === "stale" || r.indexStatus === "none");
  if (indexIssues.length > 0) {
    items.push({
      id: "index",
      severity: "watch",
      title: `${indexIssues.length} repositor${indexIssues.length === 1 ? "y needs" : "ies need"} indexing attention`,
      detail: indexIssues
        .slice(0, 3)
        .map((r) => `${r.name} (${r.indexStatus})`)
        .join(", "),
      href: "/repos",
      cta: "View repos",
    });
  }

  const inProgress = runs.filter((r) => r.status === "running" || r.status === "queued");
  if (inProgress.length > 0) {
    items.push({
      id: "progress",
      severity: "info",
      title: `${inProgress.length} review${inProgress.length === 1 ? "" : "s"} in progress`,
      detail: "Queued and running reviews will update live as they finish.",
      href: "/reviews",
      cta: "Monitor reviews",
    });
  }

  return items.slice(0, 5);
}

export default function Dashboard() {
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
  const previous = hasAnalyticsData && weekly.length > 1 ? weekly[weekly.length - 2] : undefined;
  const chartWeekly = weekly.length > 0 ? weekly : EMPTY_WEEKLY;
  const chartCategories = categories.length > 0 ? categories : [{ category: "No data", count: 0 }];

  const runStats = useMemo(() => {
    const list = runs ?? [];
    const completed = list.filter((r) => r.status === "completed");
    const failed = list.filter((r) => r.status === "failed");
    const inProgress = list.filter((r) => r.status === "running" || r.status === "queued");
    const candidates = completed.reduce((sum, r) => sum + r.candidates, 0);
    const verified = completed.reduce((sum, r) => sum + r.verified, 0);
    const posted = completed.reduce((sum, r) => sum + r.posted, 0);
    const cost = list.reduce((sum, r) => sum + Number(r.llm_cost_usd ?? 0), 0);
    const latencies = completed.map((r) => r.latency_ms).filter((v): v is number => v != null);
    return {
      total: list.length,
      completed: completed.length,
      failed: failed.length,
      inProgress: inProgress.length,
      candidates,
      verified,
      posted,
      cost,
      medianLatencyMs: median(latencies),
      verificationPct: candidates > 0 ? Math.round((verified / candidates) * 100) : null,
      postRate: verified > 0 ? Math.round((posted / verified) * 100) : null,
    };
  }, [runs]);

  const attention = useMemo(() => buildAttention(runs ?? [], repos ?? []), [runs, repos]);

  const repoMonitor = useMemo(() => {
    return [...(repos ?? [])]
      .sort((a, b) => b.noisePct - a.noisePct || b.openPrs - a.openPrs)
      .slice(0, 6);
  }, [repos]);

  const recent = (runs ?? []).slice(0, 8);
  const postedThisWeek = latest?.findingsPosted ?? 0;
  const acceptedDelta = deltaLabel(latest?.acceptancePct, previous?.acceptancePct);
  const noiseDelta = deltaLabel(latest?.noisePct, previous?.noisePct);
  const latencyDelta = deltaLabel(latest?.medianLatencyMin, previous?.medianLatencyMin, "m");

  return (
    <div className="space-y-5">
      <PageIntro
        description="Monitor review quality, verification precision, latency, and cost across your workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/reviews"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-400"
            >
              All reviews
            </Link>
            <Link
              to="/onboarding"
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add repository
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <KpiCard
          label="Acceptance"
          value={latest ? `${latest.acceptancePct}%` : "—"}
          hint={acceptedDelta ? `${acceptedDelta} vs last week` : "target ≥ 70%"}
          tone={latest ? (latest.acceptancePct >= 70 ? "good" : "warn") : "neutral"}
        />
        <KpiCard
          label="Noise"
          value={latest ? `${latest.noisePct}%` : "—"}
          hint={noiseDelta ? `${noiseDelta} vs last week` : "target < 5%"}
          tone={latest ? (latest.noisePct < 5 ? "good" : "warn") : "neutral"}
        />
        <KpiCard
          label="Median latency"
          value={
            latest && latest.medianLatencyMin > 0
              ? `${latest.medianLatencyMin}m`
              : formatLatency(runStats.medianLatencyMs)
          }
          hint={latencyDelta ? `${latencyDelta} vs last week` : "target < 5m"}
          tone={
            (latest?.medianLatencyMin ?? (runStats.medianLatencyMs ?? 0) / 60000) < 5 ? "good" : "warn"
          }
        />
        <KpiCard
          label="Verified → posted"
          value={
            runStats.verificationPct != null
              ? `${runStats.verificationPct}%`
              : "—"
          }
          hint={
            runStats.postRate != null
              ? `${runStats.verified} verified · ${runStats.posted} posted`
              : "from completed runs"
          }
          tone={runStats.verificationPct != null && runStats.verificationPct >= 40 ? "good" : "neutral"}
          href="/reviews"
        />
        <KpiCard
          label="In progress"
          value={String(runStats.inProgress)}
          hint={`${runStats.failed} failed · ${runStats.completed} completed`}
          tone={runStats.failed > 0 ? "warn" : "neutral"}
          href="/reviews"
        />
        <KpiCard
          label="LLM spend"
          value={runStats.cost > 0 ? usd(runStats.cost) : "—"}
          hint={`${postedThisWeek} findings posted this week`}
          href="/reviews"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                  <path d="M10 6.5v4M10 14h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8.4 3.7 2.6 14a1.8 1.8 0 0 0 1.6 2.7h11.6a1.8 1.8 0 0 0 1.6-2.7L11.6 3.7a1.8 1.8 0 0 0-3.2 0Z" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <h2 className="text-sm font-semibold text-zinc-900">Needs attention</h2>
            </div>
            <span className="text-[11px] text-zinc-500">actionable signals</span>
          </div>
          {attention.length === 0 ? (
            <div className="p-5">
              <EmptyState>All clear — no failed runs, noisy repos, or indexing issues right now.</EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {attention.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          item.severity === "critical"
                            ? "bg-red-500"
                            : item.severity === "watch"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
                  </div>
                  <Link
                    to={item.href}
                    className="shrink-0 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    {item.cta}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="border-zinc-200/80 bg-linear-to-br from-zinc-50 to-blue-50/30 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                  <path d="M3 4h14l-5.5 6v4.5l-3 1.5v-6L3 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="text-sm font-semibold text-zinc-900">Verification funnel</h2>
            </div>
            <span className="text-[11px] text-zinc-500">completed runs</span>
          </div>
          {runStats.candidates === 0 ? (
            <EmptyState>Funnel metrics appear after completed reviews.</EmptyState>
          ) : (
            <div className="mt-1 space-y-4">
              <FunnelStep label="Candidates found" value={runStats.candidates} total={runStats.candidates} color="bg-zinc-400" />
              <FunnelStep label="Verified" value={runStats.verified} total={runStats.candidates} color="bg-emerald-500" />
              <FunnelStep label="Posted as comments" value={runStats.posted} total={runStats.candidates} color="bg-blue-600" />
              <p className="text-[11px] leading-4 text-zinc-500">
                Precision-first: only upheld findings become line comments. Remaining verified items go into the digest.
              </p>
            </div>
          )}
        </Card>
      </div>

      {!analyticsLoading && analytics?.source === "plan_required" && (
        <Card className="flex flex-col items-start gap-2 border-blue-200 bg-blue-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Analytics trends are a Team-plan feature</h2>
            <p className="mt-0.5 text-xs text-zinc-600">Upgrade to see acceptance/noise trends, findings volume, and category breakdowns.</p>
          </div>
          <Link to="/settings" className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800">
            Upgrade to Team
          </Link>
        </Card>
      )}

      {!analyticsLoading && analytics?.source !== "plan_required" && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">Analytics trends</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Quality, volume, and latency across completed reviews.</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                hasAnalyticsData ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <span className={`size-1.5 rounded-full ${hasAnalyticsData ? "bg-emerald-500" : "bg-zinc-400"}`} />
              {hasAnalyticsData ? "Live data" : "Awaiting data"}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="border-zinc-200/80 bg-linear-to-b from-zinc-50 to-zinc-50/40 p-4 lg:col-span-1 xl:col-span-1">
            <SectionTitle hint="last 12 weeks">Acceptance vs noise</SectionTitle>
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <TrendChart
                data={chartWeekly}
                xKey="week"
                yDomain={[0, 100]}
                unit="%"
                series={[
                  { key: "acceptancePct", label: "Acceptance %" },
                  { key: "noisePct", label: "Noise %" },
                ]}
              />
            </EmptyChartFrame>
          </Card>
          <Card className="border-zinc-200/80 bg-linear-to-b from-zinc-50 to-zinc-50/40 p-4">
            <SectionTitle hint="weekly volume">Findings posted</SectionTitle>
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <AreaTrendChart data={chartWeekly} xKey="week" yKey="findingsPosted" label="Posted" />
            </EmptyChartFrame>
          </Card>
          <Card className="border-zinc-200/80 bg-linear-to-b from-zinc-50 to-zinc-50/40 p-4">
            <SectionTitle hint="minutes">Median latency</SectionTitle>
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <AreaTrendChart data={chartWeekly} xKey="week" yKey="medianLatencyMin" label="Latency (min)" />
            </EmptyChartFrame>
          </Card>
          <Card className="border-zinc-200/80 bg-linear-to-b from-zinc-50 to-zinc-50/40 p-4 lg:col-span-2 xl:col-span-2">
            <SectionTitle hint="verified findings">Findings by category</SectionTitle>
            <EmptyChartFrame empty={!hasAnalyticsData}>
              <CategoryBarChart data={chartCategories} xKey="category" yKey="count" label="Findings" height={240} />
            </EmptyChartFrame>
          </Card>
          <Card className="border-zinc-200/80 bg-linear-to-br from-zinc-50 to-blue-50/30 p-4">
            <SectionTitle hint="this week">Quality snapshot</SectionTitle>
            {latest ? (
              <dl className="mt-1 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Posted</dt>
                  <dd className="font-medium tabular-nums text-zinc-900">{latest.findingsPosted}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Accepted / fixed</dt>
                  <dd className="font-medium tabular-nums text-emerald-700">{latest.accepted}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                  <dt className="text-zinc-500">Dismissed / ignored</dt>
                  <dd className="font-medium tabular-nums text-amber-700">{latest.dismissed}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-500">Median latency</dt>
                  <dd className="font-medium tabular-nums text-zinc-900">{latest.medianLatencyMin}m</dd>
                </div>
              </dl>
            ) : (
              <EmptyState>No weekly snapshot yet.</EmptyState>
            )}
          </Card>
        </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <SectionTitle hint="noise & open PRs">Repository pulse</SectionTitle>
            <Link to="/repos" className="text-xs text-blue-600 hover:underline">
              All repos →
            </Link>
          </div>
          {repoMonitor.length === 0 ? (
            <div className="p-5">
              <EmptyState>
                No repositories connected.{" "}
                <Link to="/onboarding" className="text-blue-600 hover:underline">
                  Install the app
                </Link>
              </EmptyState>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-2.5 font-medium">Repository</th>
                    <th className="px-4 py-2.5 font-medium">Index</th>
                    <th className="px-4 py-2.5 text-right font-medium">PRs</th>
                    <th className="px-4 py-2.5 text-right font-medium">Accept</th>
                    <th className="px-4 py-2.5 text-right font-medium">Noise</th>
                  </tr>
                </thead>
                <tbody>
                  {repoMonitor.map((repo) => (
                    <tr key={repo.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80">
                      <td className="px-4 py-2.5">
                        <Link to={`/repos/${repo.id}`} className="font-medium text-zinc-900 hover:text-blue-700">
                          {repo.name}
                        </Link>
                        <p className="text-[11px] capitalize text-zinc-500">{repo.strictness} · budget {repo.commentBudget}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge kind={repo.indexStatus}>{repo.indexStatus}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700">{repo.openPrs}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700">
                        {repo.acceptancePct > 0 ? `${repo.acceptancePct}%` : "—"}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${
                          repo.noisePct > 5 ? "font-medium text-amber-700" : "text-zinc-700"
                        }`}
                      >
                        {repo.noisePct > 0 ? `${repo.noisePct}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <SectionTitle hint="latest activity">Recent code reviews</SectionTitle>
            <Link to="/reviews" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          {isLoading && (
            <div className="p-5">
              <LoadingText>Loading runs…</LoadingText>
            </div>
          )}
          {error && (
            <div className="p-5">
              <ErrorText>Failed to load runs: {(error as Error).message}</ErrorText>
            </div>
          )}
          {runs && runs.length === 0 && (
            <div className="p-5">
              <EmptyState>
                No review runs yet.{" "}
                <Link to="/onboarding" className="text-blue-600 hover:underline">
                  Install the GitHub App
                </Link>{" "}
                and open a pull request.
              </EmptyState>
            </div>
          )}
          {recent.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-2.5 font-medium">Pull request</th>
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">Trigger</th>
                    <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Started</th>
                    <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Verified</th>
                    <th className="hidden px-4 py-2.5 font-medium 2xl:table-cell">Latency</th>
                    <th className="hidden px-4 py-2.5 font-medium 2xl:table-cell">Cost</th>
                    <th className="px-4 py-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((run) => (
                    <RunRowItem key={run.id} run={run} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
