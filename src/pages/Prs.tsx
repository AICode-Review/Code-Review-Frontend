import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePrs } from "../features/prs/usePrs";
import { scoreTone } from "../lib/prScore";
import { timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText } from "../components/ui";
import type { RunRow } from "../features/runs/useRuns";

type SortKey = "updatedAt" | "score" | "number";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "in_progress" | RunRow["status"];

const PAGE_SIZES = [10, 25, 50] as const;

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m12.75 12.75 3.75 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`size-3.5 ${direction === "right" ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="m10 3.5-4.5 4.5 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-3 font-medium ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 rounded text-[11px] font-semibold uppercase tracking-wide transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          active ? "text-zinc-900" : "text-zinc-500"
        }`}
      >
        {label}
        <span className={`text-[10px] transition ${active ? "text-blue-600" : "text-zinc-300"}`} aria-hidden="true">
          {active && direction === "desc" ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}

const TONE_CLASSES: Record<ReturnType<typeof scoreTone>, string> = {
  good: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-800 bg-amber-50 border-amber-200",
  poor: "text-red-700 bg-red-50 border-red-200",
};

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-zinc-400">—</span>;
  const tone = scoreTone(score);
  return (
    <span className={`inline-flex min-w-11 items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold tabular-nums ${TONE_CLASSES[tone]}`}>
      {score}
    </span>
  );
}

export default function Prs() {
  const { data: prs, isLoading, error } = usePrs();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = (prs ?? []).filter((pr) => {
      const matchesQuery =
        !needle ||
        pr.repoName.toLowerCase().includes(needle) ||
        String(pr.number).includes(needle) ||
        (pr.openedBy ?? "").toLowerCase().includes(needle) ||
        (pr.latestRun?.summary ?? "").toLowerCase().includes(needle);
      const status = pr.latestRun?.status;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "in_progress" ? status === "running" || status === "queued" : status === statusFilter);
      return matchesQuery && matchesStatus;
    });

    return [...list].sort((a, b) => {
      let comparison: number;
      if (sortKey === "score") {
        comparison = (a.score ?? -1) - (b.score ?? -1);
      } else if (sortKey === "number") {
        comparison = a.number - b.number;
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [prs, query, statusFilter, sortKey, sortDirection]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagePrs = filtered.slice(startIndex, startIndex + pageSize);
  const rangeStart = total === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + pageSize, total);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "number" ? "asc" : "desc");
    }
    setPage(1);
  }

  const hasFilters = Boolean(query.trim()) || statusFilter !== "all";
  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] min-h-0 flex-col gap-3">
      <div className="shrink-0">
        <p className="text-sm text-zinc-600">
          Every pull request CodeFerret has reviewed, one row per PR, with an advisory 0-100 score from its latest run —
          not a merge gate, just a quick signal.
        </p>
      </div>

      {isLoading && (
        <Card className="min-h-0 flex-1 p-8">
          <LoadingText>Loading pull requests…</LoadingText>
        </Card>
      )}
      {error && (
        <Card className="min-h-0 flex-1 border-red-200 bg-red-50/50 p-6">
          <ErrorText>Failed to load pull requests: {(error as Error).message}</ErrorText>
        </Card>
      )}
      {!isLoading && !error && prs && (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 p-2.5 sm:px-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1 sm:max-w-md">
                <span className="sr-only">Search pull requests</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search repo, PR #, author, or summary…"
                  className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-zinc-50 focus:ring-3 focus:ring-blue-100"
                />
              </label>
              <label>
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100 sm:w-auto"
                >
                  <option value="all">All statuses</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <div className="flex items-center justify-between gap-3 sm:ml-auto">
                <p className="whitespace-nowrap text-xs text-zinc-500">
                  {total === (prs?.length ?? 0) ? `${total} ${total === 1 ? "pull request" : "pull requests"}` : `${total} of ${prs?.length ?? 0}`}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {pagePrs.length === 0 && hasFilters ? (
            <div className="min-h-0 flex-1 p-8">
              <EmptyState>
                No pull requests match these filters.{" "}
                <button type="button" onClick={clearFilters} className="font-medium text-blue-600 hover:underline">
                  Clear filters
                </button>
              </EmptyState>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <SortHeader label="PR" sortKey="number" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="w-[38%] md:w-[24%]" />
                    <th scope="col" className="hidden w-[14%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 lg:table-cell">
                      Author
                    </th>
                    <th scope="col" className="hidden w-[14%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 md:table-cell">
                      Trigger
                    </th>
                    <th scope="col" className="w-[18%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Status
                    </th>
                    <SortHeader label="Score" sortKey="score" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="w-[14%]" />
                    <SortHeader label="Updated" sortKey="updatedAt" activeKey={sortKey} direction={sortDirection} onSort={handleSort} align="right" className="w-[16%]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 bg-zinc-50">
                  {pagePrs.map((pr) => (
                    <tr key={pr.id} className="group transition-colors hover:bg-blue-50/35">
                      <td className="overflow-hidden px-3 py-2">
                        {pr.latestRun ? (
                          <Link to={`/runs/${pr.latestRun.id}`} className="block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            <span className="block truncate font-medium text-zinc-900 group-hover:text-blue-700">
                              {pr.repoName} <span className="text-zinc-500">#{pr.number}</span>
                            </span>
                            {pr.latestRun.summary && <span className="block truncate text-xs text-zinc-500">{pr.latestRun.summary}</span>}
                          </Link>
                        ) : (
                          <span className="block truncate font-medium text-zinc-900">
                            {pr.repoName} <span className="text-zinc-500">#{pr.number}</span>
                          </span>
                        )}
                      </td>
                      <td className="hidden truncate px-3 py-2 text-xs text-zinc-600 lg:table-cell">
                        {pr.openedBy ?? <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        {pr.latestRun && <Badge kind={pr.latestRun.trigger === "manual" ? "manual" : "automatic"}>{pr.latestRun.trigger === "manual" ? "manual" : "auto"}</Badge>}
                      </td>
                      <td className="px-3 py-2">{pr.latestRun ? <Badge kind={pr.latestRun.status} /> : <span className="text-xs text-zinc-400">—</span>}</td>
                      <td className="px-3 py-2">
                        <ScoreCell score={pr.score} />
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-zinc-500">{timeAgo(pr.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex shrink-0 flex-col gap-2 border-t border-zinc-200 bg-zinc-50/50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs tabular-nums text-zinc-500">
                Showing <span className="font-medium text-zinc-700">{rangeStart}</span>–<span className="font-medium text-zinc-700">{rangeEnd}</span> of{" "}
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

            <nav className="flex items-center gap-1" aria-label="Pull request table pagination">
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
        </Card>
      )}
    </div>
  );
}
