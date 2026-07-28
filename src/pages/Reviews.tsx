import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuns, type RunRow } from "../features/runs/useRuns";
import { useRepos } from "../features/repos/useRepos";
import { timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText } from "../components/ui";
import { PageIntro } from "../components/layout/AppShell";

type StatusFilter = "all" | "in_progress" | RunRow["status"];

const PAGE_SIZES = [10, 25, 50] as const;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`size-3.5 ${direction === "right" ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path
        d="m10 3.5-4.5 4.5 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATUS_LABEL: Record<RunRow["status"], string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

function RunRowItem({ run }: { run: RunRow }) {
  return (
    <tr className="border-b border-zinc-200/60 last:border-0 hover:bg-zinc-100/50">
      <td className="px-4 py-2">
        <Link to={`/runs/${run.id}`} className="block min-w-0 hover:text-blue-600">
          <span className="text-sm font-medium text-zinc-900">
            {run.pull_requests?.repos?.name ?? "unknown"}
            <span className="text-zinc-500"> #{run.pull_requests?.number ?? "?"}</span>
          </span>
          <span className="type-mono mt-0.5 block text-zinc-600">{run.head_sha.slice(0, 7)}</span>
        </Link>
      </td>
      <td className="hidden px-4 py-2 md:table-cell">
        <Badge kind={run.trigger === "manual" ? "manual" : "automatic"} />
      </td>
      <td className="hidden px-4 py-2 type-meta lg:table-cell">{timeAgo(run.started_at)}</td>
      <td className="hidden px-4 py-2 type-meta xl:table-cell">
        <span className="text-zinc-700">
          {run.verified}/{run.candidates} verified
        </span>
        <span className="text-zinc-500"> · {run.posted} comments</span>
      </td>
      <td className="px-4 py-2">
        <Badge kind={run.status}>{STATUS_LABEL[run.status]}</Badge>
      </td>
      <td className="px-4 py-2 text-right">
        <Link
          to={`/runs/${run.id}`}
          className="inline-flex items-center text-xs font-medium tracking-[-0.01em] text-blue-600 hover:text-blue-700 hover:underline"
        >
          Open review
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </td>
    </tr>
  );
}

export default function Reviews() {
  const { data: runs, isLoading, error } = useRuns();
  const { data: repos } = useRepos();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [repoFilter, setRepoFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);

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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRuns = filtered.slice(startIndex, startIndex + pageSize);
  const rangeStart = total === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + pageSize, total);

  useEffect(() => {
    setPage(1);
  }, [status, repoFilter, q, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageIntro
        description="Automatic on every PR open/update. Open a review to inspect findings, or start a manual run from that page."
        actions={
          <Link
            to="/onboarding"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-400"
          >
            Connect a repo
          </Link>
        }
      />

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
            <p className="type-label">{c.label}</p>
            <p className="type-display mt-1">{c.value}</p>
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
              No review runs match. Open a PR to start an automatic review, or open an existing run and
              use <strong>Manual run</strong>.
            </EmptyState>
          </div>
        )}
        {pageRuns.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-4 py-2 font-medium">Pull request</th>
                    <th className="hidden px-4 py-2 font-medium md:table-cell">Trigger</th>
                    <th className="hidden px-4 py-2 font-medium lg:table-cell">Started</th>
                    <th className="hidden px-4 py-2 font-medium xl:table-cell">Findings</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRuns.map((run) => (
                    <RunRowItem key={run.id} run={run} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50/50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-xs tabular-nums text-zinc-500">
                  Showing <span className="font-medium text-zinc-700">{rangeStart}</span>–
                  <span className="font-medium text-zinc-700">{rangeEnd}</span> of{" "}
                  <span className="font-medium text-zinc-700">{total}</span>
                </p>
                <label className="flex items-center gap-2 text-xs text-zinc-500">
                  Rows
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-8 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <nav className="flex items-center gap-1" aria-label="Code review table pagination">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronIcon direction="left" />
                </button>
                <span className="px-2 text-xs text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronIcon direction="right" />
                </button>
              </nav>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
