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

export interface ApplyDemoFixResult {
  ok: true;
  commitSha: string;
}
export interface ApplyDemoFixError {
  ok: false;
  message: string;
}

export interface DemoChatSource {
  path: string;
  startLine: number;
  endLine: number;
  similarity: number;
}
export interface DemoChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: DemoChatSource[];
  createdAt: string;
}

/** Per-repo, in-memory only — a page reload resets it, same as every other piece of demo state. */
const chatMessagesByRepo = new Map<string, DemoChatMessage[]>();

function nextId(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Very small keyword heuristic over the seed data's real paths (checkout/money/ledger/etc.)
 * so a demo answer at least LOOKS grounded in this repo's actual files, the way the real
 * feature's retrieval would be — this is illustrative only, not a stand-in for the real
 * semantic search + LLM call that happens in live mode.
 */
function buildDemoAnswer(question: string): { content: string; sources: DemoChatSource[] } {
  const q = question.toLowerCase();
  if (/auth|token|login|session/.test(q)) {
    return {
      content:
        "I don't see an auth-specific module in this demo repo's indexed code — the closest related file is the checkout API, which reads request data directly without a separate auth layer shown here (src/api/checkout.ts:88-94). In a real connected repo, ask again and I'll cite the actual auth code.",
      sources: [{ path: "src/api/checkout.ts", startLine: 88, endLine: 94, similarity: 0.61 }],
    };
  }
  if (/money|checkout|discount|tax|price|cent/.test(q)) {
    return {
      content:
        "Money amounts are formatted in src/lib/money.ts (a `formatMoney` helper). The checkout API (src/api/checkout.ts:142-149) applies a discount after tax has already been added to the total, which is why a 100% coupon can currently drive the charged amount negative — there's no floor at zero.",
      sources: [
        { path: "src/lib/money.ts", startLine: 12, endLine: 18, similarity: 0.88 },
        { path: "src/api/checkout.ts", startLine: 142, endLine: 149, similarity: 0.79 },
      ],
    };
  }
  if (/ledger|refund|settle/.test(q)) {
    return {
      content:
        "Ledger entries are written in src/services/ledger.ts, and refunds (src/api/refunds.ts) post against the same ledger rather than a separate reversal table. src/workers/settle.ts is the background job that reconciles settled amounts against the ledger on a schedule.",
      sources: [
        { path: "src/services/ledger.ts", startLine: 1, endLine: 10, similarity: 0.83 },
        { path: "src/api/refunds.ts", startLine: 1, endLine: 8, similarity: 0.7 },
      ],
    };
  }
  return {
    content:
      "This is a demo repo (payments-api), so I can only answer from its small seed dataset — try asking about checkout, discounts, money formatting, ledger entries, or refunds. Connect a real repository to ask anything about your actual codebase.",
    sources: [],
  };
}

/** Demo-mode stand-in for GET /api/repos/:id/chat. */
export function getDemoChatMessages(repoId: string): DemoChatMessage[] {
  return chatMessagesByRepo.get(repoId) ?? [];
}

/** Demo-mode stand-in for POST /api/repos/:id/chat — simulates the round trip (including a short delay, so the UI's loading state is actually visible) instead of calling the indexer/LLM for real. */
export async function askDemoRepoChat(repoId: string, question: string): Promise<DemoChatMessage> {
  const history = chatMessagesByRepo.get(repoId) ?? [];
  const userMsg: DemoChatMessage = { id: nextId(), role: "user", content: question, sources: [], createdAt: new Date().toISOString() };
  chatMessagesByRepo.set(repoId, [...history, userMsg]);
  notify();

  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const { content, sources } = buildDemoAnswer(question);
  const assistantMsg: DemoChatMessage = { id: nextId(), role: "assistant", content, sources, createdAt: new Date().toISOString() };
  chatMessagesByRepo.set(repoId, [...(chatMessagesByRepo.get(repoId) ?? []), assistantMsg]);
  notify();
  return assistantMsg;
}

/** Demo-mode stand-in for POST /api/findings/:id/apply-fix — same result shape and same guard rails (no re-applying, no applying an unverified/non-suggested finding), just simulating the commit instead of calling a real platform adapter. */
export function applyDemoFindingFix(findingId: string): ApplyDemoFixResult | ApplyDemoFixError {
  const finding = findings.find((f) => f.id === findingId);
  if (!finding) return { ok: false, message: "Finding not found." };
  if (finding.appliedAt) return { ok: false, message: `Already applied as commit ${finding.appliedCommitSha?.slice(0, 7) ?? "unknown"}.` };
  if (!finding.suggestedFix) return { ok: false, message: "This finding has no suggested fix to apply." };
  if (finding.verificationStatus !== "verified" || !finding.posted) {
    return { ok: false, message: "Only verified, posted findings can have their fix auto-applied." };
  }

  const commitSha = randomSha();
  findings = findings.map((f) =>
    f.id === findingId ? { ...f, feedback: "fixed" as const, appliedAt: new Date().toISOString(), appliedCommitSha: commitSha } : f,
  );
  notify();
  return { ok: true, commitSha };
}

function randomSha(): string {
  return Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

export interface DemoGeneratedTest {
  testFilePath: string;
  fileContent: string;
}
export interface GenerateDemoTestResult extends DemoGeneratedTest {
  ok: true;
}
export interface GenerateDemoTestError {
  ok: false;
  message: string;
}

/** Mirrors the real backend's "commit reads back what generate stored" model (POST /api/findings/:id/generate-test then .../commit-test) — findingId -> its last generated preview. */
const generatedTestsByFinding = new Map<string, DemoGeneratedTest>();

function conventionalDemoTestPath(sourcePath: string): string {
  const lastSlash = sourcePath.lastIndexOf("/");
  const dir = lastSlash === -1 ? "" : sourcePath.slice(0, lastSlash + 1);
  const rest = lastSlash === -1 ? sourcePath : sourcePath.slice(lastSlash + 1);
  const dot = rest.lastIndexOf(".");
  const base = dot === -1 ? rest : rest.slice(0, dot);
  const ext = dot === -1 ? "ts" : rest.slice(dot + 1);
  return `${dir}${base}.test.${ext}`;
}

function buildDemoTestFileContent(finding: DemoFinding, testFilePath: string): string {
  const importPath = `./${finding.path.split("/").pop()?.replace(/\.[^.]+$/, "")}`;
  return [
    `// ${testFilePath} — generated by Scrutinye from a "missing test coverage" finding`,
    `import { describe, expect, it } from "vitest";`,
    `import { totalForCheckout } from "${importPath}";`,
    "",
    `describe("${finding.title}", () => {`,
    `  it("never lets a 100% coupon drive the total negative", () => {`,
    `    const total = totalForCheckout({ subtotalCents: 2000, taxCents: 160, discountPct: 100 });`,
    `    expect(total).toBeGreaterThanOrEqual(0);`,
    `  });`,
    "",
    `  it("applies the discount before tax, matching the new order", () => {`,
    `    const total = totalForCheckout({ subtotalCents: 2000, taxCents: 160, discountPct: 10 });`,
    `    expect(total).toBe(1944); // (2000 - 200) + 144 tax on the discounted subtotal`,
    `  });`,
    `});`,
    "",
  ].join("\n");
}

/** Demo-mode stand-in for POST /api/findings/:id/generate-test — a fixed illustrative test rather than a real per-question LLM call, but exercises the exact same UI flow (preview, then a separate commit step). */
export async function generateDemoTest(findingId: string): Promise<GenerateDemoTestResult | GenerateDemoTestError> {
  const finding = findings.find((f) => f.id === findingId);
  if (!finding) return { ok: false, message: "Finding not found." };
  if (finding.category !== "tests") return { ok: false, message: "Test generation only applies to missing-test-coverage findings." };
  if (finding.verificationStatus !== "verified") return { ok: false, message: "Only verified findings can have a test generated." };

  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const testFilePath = conventionalDemoTestPath(finding.path);
  const fileContent = buildDemoTestFileContent(finding, testFilePath);
  generatedTestsByFinding.set(findingId, { testFilePath, fileContent });
  return { ok: true, testFilePath, fileContent };
}

/** Demo-mode stand-in for POST /api/findings/:id/commit-test — reads back the last generated preview, same as the real backend. */
export function commitDemoTest(findingId: string): { ok: true; commitSha: string; testFilePath: string } | { ok: false; message: string } {
  const finding = findings.find((f) => f.id === findingId);
  if (!finding) return { ok: false, message: "Finding not found." };
  if (finding.appliedAt) {
    return { ok: false, message: finding.appliedCommitSha ? `A test was already committed as ${finding.appliedCommitSha.slice(0, 7)}.` : "A test was already committed for this finding." };
  }
  const generated = generatedTestsByFinding.get(findingId);
  if (!generated) return { ok: false, message: "Generate a test first, then commit it." };

  const commitSha = randomSha();
  findings = findings.map((f) =>
    f.id === findingId ? { ...f, feedback: "fixed" as const, appliedAt: new Date().toISOString(), appliedCommitSha: commitSha } : f,
  );
  notify();
  return { ok: true, commitSha, testFilePath: generated.testFilePath };
}
