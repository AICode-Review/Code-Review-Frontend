import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRepos } from "../features/repos/useRepos";
import { Badge, Card, EmptyState, ErrorText, LoadingText } from "../components/ui";

type SortKey = "name" | "indexStatus" | "openPrs" | "acceptancePct" | "noisePct";
type SortDirection = "asc" | "desc";

const PAGE_SIZES = [10, 25, 50] as const;

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m12.75 12.75 3.75 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RepositoryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M5.5 3.5h8A1.5 1.5 0 0 1 15 5v11.5H6a2.5 2.5 0 0 1-2.5-2.5V5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M3.5 14c0-1.38 1.12-2.5 2.5-2.5h9M7 6.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`size-3.5 ${direction === "right" ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
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
      className={`px-3 py-2 align-middle font-medium ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 rounded text-[11px] font-semibold uppercase tracking-[0.055em] transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
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

function RateCell({ value, tone }: { value: number | null; tone: "good" | "noise" }) {
  // null = no feedback data yet — distinct from a genuine 0%, which is meaningful either
  // way (0% noise is the best possible score, 0% acceptance the worst) and must still render.
  if (value === null) return <span className="block text-left text-xs text-zinc-400">—</span>;

  const color =
    tone === "good"
      ? value >= 75
        ? "bg-emerald-500"
        : "bg-amber-500"
      : value <= 5
        ? "bg-emerald-500"
        : "bg-amber-500";

  return (
    <div className="text-left">
      <span className="text-xs font-medium tabular-nums text-zinc-700">{value}%</span>
      <div className="mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export default function Repos() {
  const { data: repos, isLoading, error } = useRepos();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [query, setQuery] = useState("");
  const [indexFilter, setIndexFilter] = useState("all");
  const [strictnessFilter, setStrictnessFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredRepos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = (repos ?? []).filter((repo) => {
      const matchesQuery =
        !needle ||
        repo.name.toLowerCase().includes(needle) ||
        repo.owner.toLowerCase().includes(needle) ||
        repo.defaultBranch.toLowerCase().includes(needle) ||
        repo.tier1Langs.some((language) => language.toLowerCase().includes(needle));
      const matchesIndex = indexFilter === "all" || repo.indexStatus === indexFilter;
      const matchesStrictness = strictnessFilter === "all" || repo.strictness === strictnessFilter;
      return matchesQuery && matchesIndex && matchesStrictness;
    });

    return list.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [indexFilter, query, repos, sortDirection, sortKey, strictnessFilter]);

  const total = filteredRepos.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageRepos = filteredRepos.slice(startIndex, startIndex + pageSize);
  const rangeStart = total === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + pageSize, total);

  const summary = useMemo(() => {
    const list = repos ?? [];
    return {
      total: list.length,
      ready: list.filter((repo) => repo.indexStatus === "ready").length,
      openPrs: list.reduce((sum, repo) => sum + repo.openPrs, 0),
    };
  }, [repos]);

  useEffect(() => {
    setPage(1);
  }, [indexFilter, pageSize, query, strictnessFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" || key === "indexStatus" ? "asc" : "desc");
    }
    setPage(1);
  }

  const hasFilters = Boolean(query.trim()) || indexFilter !== "all" || strictnessFilter !== "all";

  function clearFilters() {
    setQuery("");
    setIndexFilter("all");
    setStrictnessFilter("all");
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-zinc-600">
            Manage connected repositories, review policies, indexing, and performance.
          </p>
          {repos && repos.length > 0 && (
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {summary.total} connected · {summary.ready} index ready · {summary.openPrs} open PRs
            </p>
          )}
        </div>
        <div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="text-base leading-none" aria-hidden="true">+</span>
            Add repositories
          </Link>
        </div>
      </div>

      {isLoading && (
        <Card className="min-h-0 flex-1 p-8">
          <LoadingText>Loading repositories…</LoadingText>
        </Card>
      )}
      {error && (
        <Card className="min-h-0 flex-1 border-red-200 bg-red-50/50 p-6">
          <ErrorText>Failed to load repositories: {(error as Error).message}</ErrorText>
        </Card>
      )}
      {!isLoading && !error && repos && repos.length === 0 && (
        <Card className="min-h-0 flex-1 p-6">
          <EmptyState>No repositories yet — install the app from Onboarding.</EmptyState>
        </Card>
      )}

      {!isLoading && !error && repos && repos.length > 0 && (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-zinc-200/80 bg-zinc-50/80 p-2.5 sm:px-3">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                <label className="relative min-w-0 flex-1 xl:max-w-md">
                  <span className="sr-only">Search repositories</span>
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search repository, owner, branch, or language…"
                    className="h-8 w-full rounded-xl border border-zinc-200/90 bg-zinc-50 pl-9 pr-3 text-xs text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:bg-zinc-50 focus:ring-3 focus:ring-blue-100"
                  />
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label>
                    <span className="sr-only">Filter by index status</span>
                    <select
                      value={indexFilter}
                      onChange={(event) => setIndexFilter(event.target.value)}
                      className="h-8 w-full rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100 sm:w-auto"
                    >
                      <option value="all">All index statuses</option>
                      <option value="ready">Ready</option>
                      <option value="indexing">Indexing</option>
                      <option value="stale">Stale</option>
                      <option value="none">Not indexed</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Filter by strictness</span>
                    <select
                      value={strictnessFilter}
                      onChange={(event) => setStrictnessFilter(event.target.value)}
                      className="h-8 w-full rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100 sm:w-auto"
                    >
                      <option value="all">All review policies</option>
                      <option value="chill">Chill</option>
                      <option value="standard">Standard</option>
                      <option value="strict">Strict</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3 xl:ml-auto">
                <p className="whitespace-nowrap text-xs text-zinc-500">
                  {total === (repos?.length ?? 0)
                    ? `${total} ${total === 1 ? "repository" : "repositories"}`
                    : `${total} of ${repos?.length ?? 0} repositories`}
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

            {pageRepos.length === 0 ? (
              <div className="min-h-0 flex-1 p-8">
                <EmptyState>
                  No repositories match these filters.{" "}
                  <button type="button" onClick={clearFilters} className="font-medium text-blue-600 hover:underline">
                    Clear filters
                  </button>
                </EmptyState>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed border-collapse text-sm [&_td]:align-middle">
                  <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50">
                    <tr>
                      <SortHeader
                        label="Repository"
                        sortKey="name"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                        className="w-[32%] pl-13 md:w-[25%] lg:w-[22%]"
                      />
                      <th scope="col" className="hidden w-[22%] px-3 py-2 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.055em] text-zinc-500 md:table-cell lg:w-[19%]">
                        Review policy
                      </th>
                      <SortHeader
                        label="Index"
                        sortKey="indexStatus"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                        className="w-[15%] md:w-[12%] lg:w-[10%]"
                      />
                      <SortHeader
                        label="Open PRs"
                        sortKey="openPrs"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                        className="w-[14%] md:w-[10%] lg:w-[9%]"
                      />
                      <SortHeader
                        label="Acceptance"
                        sortKey="acceptancePct"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                        className="hidden w-[12%] lg:table-cell"
                      />
                      <SortHeader
                        label="Noise"
                        sortKey="noisePct"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                        className="hidden w-[10%] xl:table-cell"
                      />
                      <th scope="col" className="hidden w-[16%] px-3 py-2 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.055em] text-zinc-500 lg:table-cell xl:w-[13%]">
                        Languages
                      </th>
                      <th scope="col" className="w-10 px-2 py-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80 bg-zinc-50">
                    {pageRepos.map((repo) => (
                      <tr key={repo.id} className="group transition-colors hover:bg-blue-50/35">
                        <td className="overflow-hidden px-3 py-1">
                          <Link
                            to={`/repos/${repo.id}`}
                            className="flex min-w-0 items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 transition group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700">
                              <RepositoryIcon />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium leading-5 text-zinc-900 group-hover:text-blue-700">
                                {repo.owner ? `${repo.owner}/` : ""}
                                {repo.name}
                              </span>
                              <span className="type-mono block leading-4 text-zinc-500">{repo.defaultBranch}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="hidden overflow-hidden px-3 py-1 md:table-cell">
                          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                            <span className="text-xs font-medium capitalize text-zinc-700">{repo.strictness}</span>
                            <span className="text-zinc-300">·</span>
                            <span className="text-xs tabular-nums text-zinc-500">{repo.commentBudget} comments</span>
                          </div>
                          <p className="type-meta leading-4">{repo.failOnCritical ? "Critical findings block" : "Advisory checks"}</p>
                        </td>
                        <td className="px-3 py-1">
                          <Badge kind={repo.indexStatus} />
                        </td>
                        <td className="px-3 py-1 text-left">
                          <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-700">
                            {repo.openPrs}
                          </span>
                        </td>
                        <td className="hidden px-3 py-1 text-left lg:table-cell">
                          <RateCell value={repo.acceptancePct} tone="good" />
                        </td>
                        <td className="hidden px-3 py-1 text-left xl:table-cell">
                          <RateCell value={repo.noisePct} tone="noise" />
                        </td>
                        <td className="hidden px-3 py-1 text-left lg:table-cell">
                          {repo.tier1Langs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {repo.tier1Langs.slice(0, 2).map((language) => (
                                <span
                                  key={language}
                                  className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium capitalize text-zinc-600"
                                >
                                  {language}
                                </span>
                              ))}
                              {repo.tier1Langs.length > 2 && (
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                                  +{repo.tier1Langs.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Link
                            to={`/repos/${repo.id}`}
                            aria-label={`Open ${repo.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-50 hover:text-blue-700 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            <ChevronIcon direction="right" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex shrink-0 flex-col gap-2 border-t border-zinc-200/80 bg-zinc-50/50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
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

              <nav className="flex items-center gap-1" aria-label="Repository table pagination">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronIcon direction="left" />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((pageNumber) => {
                    if (totalPages <= 5) return true;
                    return pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1;
                  })
                  .map((pageNumber, index, visiblePages) => {
                    const previous = visiblePages[index - 1];
                    return (
                      <span key={pageNumber} className="contents">
                        {previous !== undefined && pageNumber - previous > 1 && (
                          <span className="flex size-8 items-center justify-center text-xs text-zinc-400">…</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          aria-current={pageNumber === page ? "page" : undefined}
                          className={`size-8 rounded-md border text-xs font-medium tabular-nums transition ${
                            pageNumber === page
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      </span>
                    );
                  })}

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
