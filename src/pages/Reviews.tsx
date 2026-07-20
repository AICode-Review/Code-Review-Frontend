import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuns, type RunRow } from "../features/runs/useRuns";
import { useRepos } from "../features/repos/useRepos";
import { useTriggerReview } from "../features/runs/useTriggerReview";
import { demoOpenPrs, DEMO_MODE } from "../lib/demo";
import { timeAgo, usd } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";
import { PageIntro } from "../components/layout/AppShell";

type StatusFilter = "all" | "in_progress" | RunRow["status"];

function RunRowItem({ run }: { run: RunRow }) {
  return (
    <tr className="border-b border-zinc-200/60 last:border-0 hover:bg-zinc-100/50">
      <td className="px-4 py-3">
        <Link to={`/runs/${run.id}`} className="block min-w-0 hover:text-blue-600">
          <span className="text-sm font-medium text-zinc-900">
            {run.pull_requests?.repos?.name ?? "unknown"}
            <span className="text-zinc-500"> #{run.pull_requests?.number ?? "?"}</span>
          </span>
          {run.summary && (
            <span className="mt-0.5 block truncate text-xs text-zinc-500">{run.summary}</span>
          )}
          <span className="mt-0.5 block font-mono text-[11px] text-zinc-600">
            {run.head_sha.slice(0, 7)}
          </span>
        </Link>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <Badge kind={run.trigger === "manual" ? "manual" : "automatic"}>
          {run.trigger === "manual" ? "manual" : "auto"}
        </Badge>
      </td>
      <td className="hidden px-4 py-3 text-xs text-zinc-600 lg:table-cell">{timeAgo(run.started_at)}</td>
      <td className="hidden px-4 py-3 text-xs text-zinc-600 xl:table-cell">
        {run.verified}/{run.candidates} verified
        <span className="text-zinc-600"> · {run.posted} comments</span>
      </td>
      <td className="hidden px-4 py-3 text-xs text-zinc-600 2xl:table-cell">
        {run.llm_cost_usd > 0 ? usd(Number(run.llm_cost_usd)) : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <Badge kind={run.status} />
          <Link to={`/runs/${run.id}`} className="text-[11px] text-blue-600 hover:underline">
            Open review →
          </Link>
        </div>
      </td>
    </tr>
  );
}

function ManualTriggerPanel() {
  const { data: repos } = useRepos();
  const trigger = useTriggerReview();
  const [prKey, setPrKey] = useState(demoOpenPrs[0] ? `${demoOpenPrs[0].repo}#${demoOpenPrs[0].number}` : "");

  const options = DEMO_MODE
    ? demoOpenPrs
    : (repos ?? []).flatMap((r) =>
        r.openPrs > 0
          ? [{ repo: r.name, number: r.openPrs, title: `Open PR on ${r.name}`, headSha: undefined as string | undefined }]
          : [],
      );

  // Live mode without open-PR API: let user type repo + PR number
  const [liveRepo, setLiveRepo] = useState(repos?.[0]?.name ?? "");
  const [livePr, setLivePr] = useState("1");
  const [liveTitle, setLiveTitle] = useState("Manual review");

  function start() {
    if (DEMO_MODE) {
      const pr = demoOpenPrs.find((p) => `${p.repo}#${p.number}` === prKey) ?? demoOpenPrs[0];
      if (!pr) return;
      trigger.mutate({
        repo: pr.repo,
        prNumber: pr.number,
        title: pr.title,
        headSha: pr.headSha,
        trigger: "manual",
      });
      return;
    }
    trigger.mutate({
      repo: liveRepo,
      prNumber: Number(livePr),
      title: liveTitle,
      trigger: "manual",
    });
  }

  return (
    <Card className="p-4">
      <SectionTitle hint="or wait for the next PR push — reviews start automatically">
        Run a review manually
      </SectionTitle>
      <p className="mb-3 text-xs text-zinc-500">
        Automatic reviews start when a PR is opened or updated. Use this to re-check the same PR
        without a new push.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {DEMO_MODE ? (
          <label className="min-w-0 flex-1 text-xs text-zinc-500">
            Pull request
            <select
              value={prKey}
              onChange={(e) => setPrKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
            >
              {options.map((p) => (
                <option key={`${p.repo}#${p.number}`} value={`${p.repo}#${p.number}`}>
                  {p.repo} #{p.number} — {p.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="text-xs text-zinc-500">
              Repo
              <select
                value={liveRepo}
                onChange={(e) => setLiveRepo(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
              >
                {repos?.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-zinc-500">
              PR #
              <input
                value={livePr}
                onChange={(e) => setLivePr(e.target.value)}
                className="mt-1 block w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
              />
            </label>
            <label className="min-w-0 flex-1 text-xs text-zinc-500">
              Title
              <input
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
              />
            </label>
          </>
        )}
        <button
          type="button"
          disabled={trigger.isPending}
          onClick={() => start()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {trigger.isPending ? "Starting…" : "Run code review"}
        </button>
      </div>
      {trigger.isError && (
        <p className="mt-2 text-xs text-red-600">{(trigger.error as Error).message}</p>
      )}
    </Card>
  );
}

export default function Reviews() {
  const { data: runs, isLoading, error } = useRuns();
  const { data: repos } = useRepos();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [repoFilter, setRepoFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = runs ?? [];
    if (status === "in_progress") {
      list = list.filter((r) => r.status === "running" || r.status === "queued");
    } else if (status !== "all") {
      list = list.filter((r) => r.status === status);
    }
    if (repoFilter !== "all") {
      list = list.filter((r) => r.pull_requests?.repos?.name === repoFilter);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((r) => {
        const name = r.pull_requests?.repos?.name ?? "";
        const pr = String(r.pull_requests?.number ?? "");
        const summary = r.summary ?? "";
        return (
          name.toLowerCase().includes(needle) ||
          pr.includes(needle) ||
          summary.toLowerCase().includes(needle) ||
          r.head_sha.toLowerCase().includes(needle) ||
          r.id.toLowerCase().includes(needle)
        );
      });
    }
    return list;
  }, [runs, status, repoFilter, q]);

  const counts = useMemo(() => {
    const all = runs ?? [];
    return {
      all: all.length,
      running: all.filter((r) => r.status === "running" || r.status === "queued").length,
      completed: all.filter((r) => r.status === "completed").length,
      failed: all.filter((r) => r.status === "failed").length,
    };
  }, [runs]);

  return (
    <div className="space-y-6">
      <PageIntro
        description="Automatic on every PR open/update — or run manually anytime. Open a run to see comments, suggestions, and verification."
        actions={
          <Link
            to="/onboarding"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-400"
          >
            Connect a repo
          </Link>
        }
      />

      <ManualTriggerPanel />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "all" as const, label: "All runs", value: counts.all },
          { key: "in_progress" as const, label: "In progress", value: counts.running },
          { key: "completed" as const, label: "Completed", value: counts.completed },
          { key: "failed" as const, label: "Failed", value: counts.failed },
        ].map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setStatus(c.key)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              status === c.key
                ? "border-blue-400 bg-blue-50"
                : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
            }`}
          >
            <p className="text-[11px] text-zinc-500">{c.label}</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">{c.value}</p>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search repo, PR #, title, or SHA…"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-600 focus:border-zinc-300 focus:outline-none"
          />
          <select
            value={repoFilter}
            onChange={(e) => setRepoFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          >
            <option value="all">All repositories</option>
            {repos?.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          >
            <option value="all">All statuses</option>
            <option value="in_progress">In progress</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading && (
          <div className="p-6">
            <LoadingText>Loading reviews…</LoadingText>
          </div>
        )}
        {error && (
          <div className="p-6">
            <ErrorText>Failed to load reviews: {(error as Error).message}</ErrorText>
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-6">
            <EmptyState>
              No review runs match. Open a PR (auto) or use <strong>Run code review</strong> above.
            </EmptyState>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Pull request</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Trigger</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Started</th>
                  <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Findings</th>
                  <th className="hidden px-4 py-2.5 font-medium 2xl:table-cell">Cost</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((run) => (
                  <RunRowItem key={run.id} run={run} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
