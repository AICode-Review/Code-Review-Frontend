import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useRuns, type RunRow } from "../features/runs/useRuns";
import { useAnalytics } from "../features/analytics/useAnalytics";
import { useRepos, type Repo } from "../features/repos/useRepos";
import { summaryPreview, timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";
import { AreaTrendChart, CategoryBarChart, DonutChart, GroupedBarChart, TrendChart } from "../components/charts";
import { PageIntro } from "../components/layout/AppShell";
import { useOrg } from "../hooks/useOrg";

const RUN_STATUS_COLORS: Record<string, string> = {
  completed: "var(--color-emerald-600)",
  failed: "var(--color-red-600)",
  running: "var(--color-blue-600)",
  queued: "var(--color-amber-500)",
  cancelled: "var(--color-zinc-400)",
};

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
        <p className="type-label">{label}</p>
        <p className="type-display mt-2">{value}</p>
        {hint && <p className={`type-meta mt-1.5 truncate ${toneClass}`}>{hint}</p>}
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

function RunCard({ run }: { run: RunRow }) {
  const verificationPct =
    run.candidates > 0 ? Math.round((run.verified / run.candidates) * 100) : null;

  return (
    <li>
      <Link
        to={`/runs/${run.id}`}
        className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-zinc-50/80"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900">
              {run.pull_requests?.repos?.name ?? "unknown"}
              <span className="text-zinc-500"> #{run.pull_requests?.number ?? "?"}</span>
            </span>
            <Badge kind={run.trigger === "manual" ? "manual" : "automatic"}>
              {run.trigger === "manual" ? "manual" : "auto"}
            </Badge>
          </div>
          <p className="mt-1 truncate text-[11px] text-zinc-500">
            {timeAgo(run.started_at)}
            {verificationPct !== null && ` · ${run.verified}/${run.candidates} verified (${verificationPct}%)`}
            {run.latency_ms != null && ` · ${formatLatency(run.latency_ms)}`}
          </p>
        </div>
        <Badge kind={run.status} />
      </Link>
    </li>
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
      detail: run.summary ? summaryPreview(run.summary) : "Open the run to inspect the failure and re-trigger if needed.",
      href: `/runs/${run.id}`,
      cta: "Inspect run",
    });
  }

  const noisyRepos = repos
    .filter((r): r is Repo & { noisePct: number } => r.noisePct !== null && r.noisePct > 5)
    .sort((a, b) => b.noisePct - a.noisePct)
    .slice(0, 2);
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
      postRate: verified > 0 ? Math.round((posted / verified) * 100) : null,
    };
  }, [runs]);

  const attention = useMemo(() => buildAttention(runs ?? [], repos ?? []), [runs, repos]);

  const repoMonitor = useMemo(() => {
    return [...(repos ?? [])]
      .sort((a, b) => (b.noisePct ?? 0) - (a.noisePct ?? 0) || b.openPrs - a.openPrs)
      .slice(0, 6);
  }, [repos]);

  const recent = (runs ?? []).slice(0, 5);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of runs ?? []) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name, value, color: RUN_STATUS_COLORS[name] }));
  }, [runs]);

  const repoChartData = repoMonitor.map((repo) => ({
    name: repo.name,
    accept: repo.acceptancePct ?? 0,
    noise: repo.noisePct ?? 0,
  }));
  const postedThisWeek = latest?.findingsPosted ?? 0;
  const acceptedDelta = deltaLabel(latest?.acceptancePct, previous?.acceptancePct);
  const noiseDelta = deltaLabel(latest?.noisePct, previous?.noisePct);
  const latencyDelta = deltaLabel(latest?.medianLatencyMin, previous?.medianLatencyMin, "m");
  const platformLabel =
    org?.platform === "bitbucket" ? "Bitbucket" : org?.platform === "github" ? "GitHub" : org?.platform ?? "";

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
              to={org?.platform === "bitbucket" ? "/docs/bitbucket" : "/onboarding"}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {org?.platform === "bitbucket" ? "Bitbucket setup" : "Add repository"}
            </Link>
          </div>
        }
      />

      {org && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          Viewing <strong>{org.name}</strong>
          {platformLabel ? ` (${platformLabel})` : ""}.
          {org.platform === "bitbucket" && (repos?.length ?? 0) === 0 && (
            <>
              {" "}
              No Bitbucket repos yet — add a webhook on each repo, then open a PR.{" "}
              <Link to="/docs/bitbucket" className="font-medium text-blue-600 hover:underline">
                Setup guide
              </Link>
            </>
          )}
          {org.platform === "github" && (
            <>
              {" "}
              To see Bitbucket, pick the workspace marked <strong>· Bitbucket</strong> in the sidebar.
            </>
          )}
        </div>
      )}
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
          label="Findings posted"
          value={String(postedThisWeek)}
          hint="this week"
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
            <div className="p-4">
              <GroupedBarChart
                data={repoChartData}
                xKey="name"
                yDomain={[0, 100]}
                unit="%"
                height={260}
                series={[
                  { key: "accept", label: "Accept %" },
                  { key: "noise", label: "Noise %" },
                ]}
              />
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
          {statusBreakdown.length > 0 && (
            <div className="border-b border-zinc-100 px-4 py-3">
              <DonutChart data={statusBreakdown} height={110} />
            </div>
          )}
          {recent.length > 0 && (
            <ul className="divide-y divide-zinc-100">
              {recent.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
