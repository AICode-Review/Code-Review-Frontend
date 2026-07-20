/**
 * Mutable in-memory store for demo-mode review runs so re-run / manual
 * trigger can create new runs and complete them without a backend.
 */
import {
  demoFindings,
  demoRuns,
  type DemoFinding,
} from "./demo";
import type { RunRow } from "../features/runs/useRuns";

let runs: RunRow[] = demoRuns.map((r) => ({ ...r }));
let findings: DemoFinding[] = demoFindings.map((f) => ({ ...f }));
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeDemoStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoRuns(): RunRow[] {
  return [...runs].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
}

export function getDemoRun(id: string): { run: RunRow; findings: DemoFinding[] } | null {
  const run = runs.find((r) => r.id === id);
  if (!run) return null;
  return {
    run,
    findings: findings.filter((f) => f.runId === id),
  };
}

function cloneFindingsForRun(sourceRunId: string, newRunId: string): DemoFinding[] {
  const source = findings.filter((f) => f.runId === sourceRunId);
  const template =
    source.length > 0
      ? source
      : findings.filter((f) => f.runId === "run-1" || f.runId === "run-2").slice(0, 5);

  return template.map((f, i) => ({
    ...f,
    id: `finding-${newRunId}-${i}`,
    runId: newRunId,
    feedback: null,
    whyItMatters: f.whyItMatters,
    impact: f.impact,
    fixSteps: f.fixSteps,
    verifiedHow: f.verifiedHow,
  }));
}

export interface TriggerReviewInput {
  repo: string;
  prNumber: number;
  title: string;
  headSha?: string;
  trigger: "automatic" | "manual";
  /** When re-running, copy findings from this completed run after a short delay. */
  sourceRunId?: string;
}

/** Start a review run; completes after ~2.5s in demo mode. Returns the new run id. */
export function triggerDemoReview(input: TriggerReviewInput): string {
  const id = `run-demo-${Date.now()}`;
  const head = input.headSha ?? Math.random().toString(16).slice(2, 10) + "abcd1234";
  const now = new Date().toISOString();

  const run: RunRow = {
    id,
    pr_id: `pr-${input.repo}-${input.prNumber}`,
    head_sha: head,
    status: "running",
    started_at: now,
    finished_at: null,
    candidates: 0,
    verified: 0,
    posted: 0,
    digest: 0,
    llm_cost_usd: 0.05,
    latency_ms: null,
    trigger: input.trigger,
    summary: input.title,
    pull_requests: { number: input.prNumber, repos: { name: input.repo } },
  };

  // Cancel any in-flight run for the same PR (debounce semantics).
  runs = runs.map((r) =>
    r.pr_id === run.pr_id && (r.status === "running" || r.status === "queued")
      ? { ...r, status: "cancelled" as const, finished_at: now }
      : r,
  );

  runs = [run, ...runs];
  notify();

  const sourceId =
    input.sourceRunId ??
    runs.find(
      (r) =>
        r.id !== id &&
        r.status === "completed" &&
        r.pull_requests?.repos?.name === input.repo,
    )?.id ??
    "run-1";

  window.setTimeout(() => {
    const cloned = cloneFindingsForRun(sourceId, id);
    const verified = cloned.filter((f) => f.verificationStatus === "verified").length;
    const posted = cloned.filter((f) => f.posted).length;
    const digest = cloned.filter((f) => f.inDigest).length;
    const finished = new Date().toISOString();
    const started = new Date(now).getTime();

    findings = [...cloned, ...findings];
    runs = runs.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "completed" as const,
            finished_at: finished,
            candidates: cloned.length,
            verified,
            posted,
            digest,
            llm_cost_usd: 0.28 + Math.random() * 0.2,
            latency_ms: Date.now() - started,
          }
        : r,
    );
    notify();
  }, 2500);

  return id;
}

export function setDemoFindingFeedback(
  findingId: string,
  feedback: DemoFinding["feedback"],
): void {
  findings = findings.map((f) => (f.id === findingId ? { ...f, feedback } : f));
  notify();
}
