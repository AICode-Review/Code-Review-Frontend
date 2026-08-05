import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useRun, type Finding } from "../features/runs/useRun";
import { useRerunFromRun } from "../features/runs/useTriggerReview";
import { useRunDiff } from "../features/runs/useRunDiff";
import { useRepos } from "../features/repos/useRepos";
import { timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText } from "../components/ui";
import { ReviewComment } from "../components/review/ReviewComment";
import { DiffViewer } from "../components/review/DiffViewer";

const severityOrder = { critical: 0, major: 1, minor: 2 } as const;

function riskLevel(findings: Finding[]): { label: string; className: string; blurb: string } {
  if (findings.some((f) => f.posted && f.severity === "critical")) {
    return {
      label: "High risk",
      className: "text-red-600",
      blurb: "At least one must-fix issue — address before merge.",
    };
  }
  if (findings.some((f) => f.posted && f.severity === "major")) {
    return {
      label: "Medium risk",
      className: "text-amber-700",
      blurb: "Should-fix issues found — review carefully before merge.",
    };
  }
  if (findings.some((f) => f.verificationStatus === "verified")) {
    return {
      label: "Low risk",
      className: "text-emerald-600",
      blurb: "No must-fix issues posted. Check the lower-priority list if you have time.",
    };
  }
  return { label: "No issues", className: "text-zinc-600", blurb: "Nothing verified to act on." };
}

function JumpList({ items }: { items: Finding[] }) {
  if (items.length === 0) return null;
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Jump to an issue</p>
      <ol className="mt-3 space-y-2">
        {items.map((f, i) => (
          <li key={f.id}>
            <a
              href={`#comment-${f.id}`}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-100"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] font-semibold text-zinc-700">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-zinc-800">{f.title}</span>
                <span className="block font-mono text-[11px] text-zinc-500">
                  {f.path}:{f.startLine}
                  {f.severity === "critical"
                    ? " · Must fix"
                    : f.severity === "major"
                      ? " · Should fix"
                      : " · Nice to have"}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function CollapsibleSection({
  title,
  hint,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <section className="rounded-xl border border-zinc-200/80 bg-zinc-50 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="font-display text-sm font-semibold tracking-tight text-zinc-900">
            {title}
            <span className="ml-2 font-sans font-normal text-zinc-500">({count})</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>
        </div>
        <span className="text-xs text-zinc-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="space-y-3 border-t border-zinc-200/80 p-4">{children}</div>}
    </section>
  );
}

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, setFeedback } = useRun(id);
  const { data: repos } = useRepos();
  const rerun = useRerunFromRun(data?.run);
  const { data: diff, isLoading: diffLoading, error: diffError } = useRunDiff(data?.run);

  if (isLoading) return <LoadingText>Loading review…</LoadingText>;
  if (error) {
    return <ErrorText>Failed to load review: {(error as Error).message}</ErrorText>;
  }
  if (!data) {
    return (
      <EmptyState>
        Review not found.{" "}
        <Link to="/reviews" className="text-blue-600 hover:underline">
          Back to Code Review
        </Link>
      </EmptyState>
    );
  }

  const { run, findings } = data;
  const repoName = run.pull_requests?.repos?.name ?? "unknown";
  const prNumber = run.pull_requests?.number ?? "?";
  const repo = repos?.find((r) => r.name === repoName);
  const risk = riskLevel(findings);

  const posted = findings
    .filter((f) => f.posted)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  const digest = findings.filter((f) => f.inDigest);
  const rejected = findings.filter((f) => f.verificationStatus === "rejected");
  const inFlight = run.status === "queued" || run.status === "running";
  const canManualRun = !inFlight;

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const summaryParts = [
    diff ? `${plural(diff.stats.files, "file")} changed (+${diff.stats.additions}/-${diff.stats.deletions})` : null,
    run.status === "completed" ? plural(posted.length, "issue") + " to fix" : null,
    digest.length > 0 ? `${plural(digest.length, "lower-priority note")}` : null,
    rejected.length > 0 ? `${plural(rejected.length, "false alarm")} filtered out` : null,
  ].filter((p): p is string => p !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">
            <Link to="/reviews" className="hover:text-zinc-700">
              Code Review
            </Link>
            {repo && (
              <>
                {" "}
                /{" "}
                <Link to={`/repos/${repo.id}`} className="hover:text-zinc-700">
                  {repoName}
                </Link>
              </>
            )}
          </p>
          <h2 className="type-title mt-1">
            {repoName}
            <span className="font-medium text-zinc-500"> #{prNumber}</span>
          </h2>
          {summaryParts.length > 0 && (
            <p className="type-body mt-1 text-zinc-600">{summaryParts.join(" · ")}</p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-2 type-meta">
            <Badge kind={run.status} />
            <Badge kind={run.trigger === "manual" ? "manual" : "automatic"}>
              {run.trigger === "manual" ? "You ran this" : "Started automatically on PR"}
            </Badge>
            <span className={`font-medium ${risk.className}`}>{risk.label}</span>
            <span className="font-mono">{run.head_sha.slice(0, 7)}</span>
            <span>{timeAgo(run.started_at)}</span>
            {run.latency_ms !== null && <span>{(run.latency_ms / 1000).toFixed(0)}s</span>}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canManualRun || rerun.isPending}
            onClick={() => rerun.rerun()}
            title={
              inFlight
                ? "Wait for the current run to finish before starting a manual run"
                : "Start a new review run for this PR (appears as trigger: manual)"
            }
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rerun.isPending ? "Starting…" : "Manual run"}
          </button>
          <Link
            to="/reviews"
            className="rounded-xl border border-zinc-200/90 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100/80"
          >
            All reviews
          </Link>
        </div>
      </div>

      {rerun.isError && <ErrorText>{(rerun.error as Error).message}</ErrorText>}

      {/* Plain-language guide */}
      <Card className="border-blue-200/80 bg-linear-to-br from-blue-50 to-zinc-50 p-4 shadow-sm">
        <p className="font-display text-sm font-semibold tracking-tight text-blue-800">How to use this review</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600">
          <li>
            Check <span className="text-zinc-800">What changed</span> (the PR diff).
          </li>
          <li>
            Fix items under <span className="text-zinc-800">Issues to fix</span> — numbered, most
            serious first.
          </li>
          <li>
            <span className="text-zinc-800">Must fix</span> = block merge.{" "}
            <span className="text-zinc-800">Should fix</span> = important.{" "}
            <span className="text-zinc-800">Nice to have</span> = optional.
          </li>
          <li>Lower-priority notes and false alarms are collapsed at the bottom.</li>
        </ol>
        <p className={`mt-3 text-sm ${risk.className}`}>{risk.blurb}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <p className="type-label">Issues to fix</p>
          <p className="type-display mt-1">{posted.length}</p>
        </Card>
        <Card className="p-3">
          <p className="type-label">Must fix</p>
          <p className="type-display mt-1 text-red-600">
            {posted.filter((f) => f.severity === "critical").length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="type-label">Lower priority</p>
          <p className="type-display mt-1">{digest.length}</p>
        </Card>
        <Card className="p-3">
          <p className="type-label">False alarms caught</p>
          <p className="type-display mt-1 text-zinc-600">{rejected.length}</p>
        </Card>
      </div>

      {diffLoading && (
        <Card className="p-6">
          <LoadingText>Loading PR changes…</LoadingText>
        </Card>
      )}
      {diffError && (
        <Card className="border-red-200 bg-red-50/50 p-4">
          <ErrorText>Failed to load PR changes: {(diffError as Error).message}</ErrorText>
        </Card>
      )}
      {diff && diff.files.length > 0 && (
        <DiffViewer diff={diff} title="What changed in this PR" />
      )}

      {run.status === "running" || run.status === "queued" ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-400" />
          <p className="text-sm font-medium text-zinc-800">
            Review {run.status === "queued" ? "queued" : "in progress"}…
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Looking at the diff, checking for real issues, then writing clear comments. This page
            updates when done.
          </p>
        </Card>
      ) : run.status === "failed" ? (
        <EmptyState>
          This review failed{run.error ? `: ${run.error}` : "."} Click{" "}
          <strong className="text-zinc-700">Run review again</strong> to retry.
        </EmptyState>
      ) : run.status === "cancelled" ? (
        <EmptyState>
          This run was cancelled because a newer commit arrived (or you started another review).
          Open the latest run from Code Review.
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-4 lg:self-start">
              <JumpList items={posted} />
            </div>

            <div className="min-w-0 space-y-4">
              <div>
                <h3 className="font-display text-base font-semibold tracking-tight text-zinc-900">Issues to fix</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  These comments are also posted on the pull request. Start at #1.
                </p>
              </div>

              {posted.length === 0 ? (
                <EmptyState>
                  No high-priority issues for this PR. Check lower-priority notes below if you want
                  extra polish.
                </EmptyState>
              ) : (
                posted.map((f, i) => (
                  <ReviewComment
                    key={f.id}
                    finding={f}
                    index={i + 1}
                    onFeedback={setFeedback}
                  />
                ))
              )}

              <CollapsibleSection
                title="Lower priority"
                hint="Real issues, but not posted as PR line comments (keeps the PR quiet)"
                count={digest.length}
              >
                {digest.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nothing in this list.</p>
                ) : (
                  digest.map((f) => (
                    <ReviewComment key={f.id} finding={f} onFeedback={setFeedback} compact />
                  ))
                )}
              </CollapsibleSection>

              {rejected.length > 0 && (
                <CollapsibleSection
                  title="False alarms we caught"
                  hint="We almost posted these, then verification proved they were wrong — you can ignore them"
                  count={rejected.length}
                >
                  {rejected.map((f) => (
                    <ReviewComment key={f.id} finding={f} compact />
                  ))}
                </CollapsibleSection>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
