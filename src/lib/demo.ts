/**
 * Demo mode: when Supabase env vars are absent the whole app runs on this
 * fixture data set so every page is browsable end-to-end. With env vars
 * present, hooks read the real (RLS-scoped) tables instead.
 */
import type { RunRow } from "../features/runs/useRuns";

export const DEMO_MODE =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

const now = Date.now();
const min = 60_000;
const hour = 60 * min;
const day = 24 * hour;

function iso(msAgo: number): string {
  return new Date(now - msAgo).toISOString();
}

export interface DemoRepo {
  id: string;
  name: string;
  owner: string;
  defaultBranch: string;
  indexStatus: "ready" | "indexing" | "stale" | "none";
  tier1Langs: string[];
  strictness: "chill" | "standard" | "strict";
  commentBudget: number;
  ignoredPaths: string[];
  failOnCritical: boolean;
  openPrs: number;
  /** null = no feedback data yet (distinct from a genuine 0%, which is meaningful either way). */
  acceptancePct: number | null;
  noisePct: number | null;
}

export const demoRepos: DemoRepo[] = [
  {
    id: "repo-payments",
    name: "payments-api",
    owner: "acme",
    defaultBranch: "main",
    indexStatus: "ready",
    tier1Langs: ["typescript", "python"],
    strictness: "strict",
    commentBudget: 7,
    ignoredPaths: ["**/*.gen.ts", "vendor/**"],
    failOnCritical: true,
    openPrs: 6,
    acceptancePct: 84,
    noisePct: 3.1,
  },
  {
    id: "repo-web",
    name: "web",
    owner: "acme",
    defaultBranch: "main",
    indexStatus: "ready",
    tier1Langs: ["typescript"],
    strictness: "standard",
    commentBudget: 5,
    ignoredPaths: ["public/**", "**/*.stories.tsx"],
    failOnCritical: false,
    openPrs: 11,
    acceptancePct: 78,
    noisePct: 4.6,
  },
  {
    id: "repo-infra",
    name: "infra",
    owner: "acme",
    defaultBranch: "master",
    indexStatus: "indexing",
    tier1Langs: ["go"],
    strictness: "chill",
    commentBudget: 3,
    ignoredPaths: [],
    failOnCritical: false,
    openPrs: 2,
    acceptancePct: 71,
    noisePct: 5.8,
  },
];

interface RunSeed {
  repo: string;
  pr: number;
  author: string;
  msAgo: number;
  status: RunRow["status"];
  candidates: number;
  verified: number;
  posted: number;
  cost: number;
  latencySec: number | null;
  trigger: "automatic" | "manual";
  summary: string;
}

const runSeeds: RunSeed[] = [
  { repo: "payments-api", pr: 214, author: "priya-dev", msAgo: 4 * min, status: "running", candidates: 9, verified: 0, posted: 0, cost: 0.11, latencySec: null, trigger: "automatic", summary: "Add coupon stacking to checkout" },
  { repo: "web", pr: 587, author: "marco-p", msAgo: 22 * min, status: "completed", candidates: 12, verified: 5, posted: 3, cost: 0.34, latencySec: 178, trigger: "automatic", summary: "Refactor cart drawer + SSRF-safe callbacks" },
  { repo: "payments-api", pr: 213, author: "dinesh-t", msAgo: 1.2 * hour, status: "completed", candidates: 17, verified: 8, posted: 6, cost: 0.52, latencySec: 241, trigger: "automatic", summary: "Refund path + ledger concurrency fixes" },
  { repo: "infra", pr: 88, author: "sofia-r", msAgo: 3 * hour, status: "completed", candidates: 4, verified: 1, posted: 1, cost: 0.19, latencySec: 122, trigger: "manual", summary: "Provisioner Close() error handling" },
  { repo: "web", pr: 585, author: "marco-p", msAgo: 5 * hour, status: "failed", candidates: 0, verified: 0, posted: 0, cost: 0.02, latencySec: 31, trigger: "automatic", summary: "Experiment: edge middleware rewrite" },
  { repo: "web", pr: 584, author: "priya-dev", msAgo: 8 * hour, status: "completed", candidates: 10, verified: 4, posted: 3, cost: 0.29, latencySec: 190, trigger: "automatic", summary: "Feature flag expiry metadata" },
  { repo: "payments-api", pr: 211, author: "dinesh-t", msAgo: 1 * day, status: "completed", candidates: 14, verified: 7, posted: 5, cost: 0.47, latencySec: 213, trigger: "automatic", summary: "Decimal money helper migration" },
  { repo: "infra", pr: 87, author: "sofia-r", msAgo: 1.3 * day, status: "cancelled", candidates: 0, verified: 0, posted: 0, cost: 0, latencySec: 12, trigger: "automatic", summary: "Superseded by force-push" },
  { repo: "payments-api", pr: 210, author: "priya-dev", msAgo: 2 * day, status: "completed", candidates: 11, verified: 6, posted: 4, cost: 0.4, latencySec: 205, trigger: "manual", summary: "Re-run after rulebook update" },
  { repo: "web", pr: 580, author: "marco-p", msAgo: 2.5 * day, status: "completed", candidates: 8, verified: 3, posted: 2, cost: 0.22, latencySec: 156, trigger: "automatic", summary: "Checkout tax order fix" },
  { repo: "payments-api", pr: 208, author: "dinesh-t", msAgo: 3 * day, status: "completed", candidates: 15, verified: 9, posted: 7, cost: 0.55, latencySec: 262, trigger: "automatic", summary: "Webhook idempotency keys" },
  { repo: "infra", pr: 85, author: "sofia-r", msAgo: 4 * day, status: "completed", candidates: 6, verified: 2, posted: 2, cost: 0.18, latencySec: 141, trigger: "automatic", summary: "Terraform state lock retry" },
];

export const demoRuns: RunRow[] = runSeeds.map((s, i) => ({
  id: `run-${i}`,
  pr_id: `pr-${s.repo}-${s.pr}`,
  head_sha: (i * 2654435761 >>> 0).toString(16).padStart(8, "a").slice(0, 8) + "f3c1d2e4",
  status: s.status,
  started_at: iso(s.msAgo),
  finished_at: s.latencySec === null ? null : iso(s.msAgo - s.latencySec * 1000),
  candidates: s.candidates,
  verified: s.verified,
  posted: s.posted,
  digest: Math.max(0, s.verified - s.posted),
  llm_cost_usd: s.cost,
  latency_ms: s.latencySec === null ? null : s.latencySec * 1000,
  trigger: s.trigger,
  summary: s.summary,
  pull_requests: { number: s.pr, repos: { name: s.repo }, opened_by: s.author },
}));

/** Open PRs available for a manual review trigger in demo mode. */
export const demoOpenPrs: Array<{
  repo: string;
  number: number;
  title: string;
  headSha: string;
}> = [
  { repo: "payments-api", number: 214, title: "Add coupon stacking to checkout", headSha: "a1b2c3d4e5f6" },
  { repo: "web", number: 590, title: "New settings page layout", headSha: "b2c3d4e5f6a7" },
  { repo: "infra", number: 91, title: "Bump provisioner timeout", headSha: "c3d4e5f6a7b8" },
];

// -------------------------------------------------------------- findings

export type FindingSeverity = "critical" | "major" | "minor";
export type VerificationStatus = "verified" | "rejected" | "skipped";
export type FindingFeedback = "accepted" | "dismissed" | "fixed" | "ignored" | null;

export interface DemoFinding {
  id: string;
  runId: string;
  pass: string;
  category: string;
  severity: FindingSeverity;
  confidence: number;
  path: string;
  startLine: number;
  endLine: number;
  title: string;
  /** Plain-language: what is wrong. */
  bodyMd: string;
  /** Plain-language: why the user should care. */
  whyItMatters: string;
  /** What happens if ignored (user-facing). */
  impact: string;
  /** Numbered steps to fix. */
  fixSteps: string[];
  suggestedFix?: string;
  codeSnippet?: string;
  /** Short plain-English proof we checked this. */
  verifiedHow: string;
  verificationMethod: "static" | "cross_exam" | "execution" | "none";
  verificationStatus: VerificationStatus;
  posted: boolean;
  inDigest: boolean;
  feedback: FindingFeedback;
}

const findingSeeds: Omit<DemoFinding, "id">[] = [
  {
    runId: "run-1",
    pass: "security",
    category: "security",
    severity: "critical",
    confidence: 0.94,
    path: "src/api/checkout.ts",
    startLine: 88,
    endLine: 94,
    title: "Untrusted URL is fetched from the request",
    bodyMd:
      "The checkout handler takes `callbackUrl` from the query string and passes it straight into `fetch()`. Anyone who can call this endpoint can make your server request any URL.",
    whyItMatters:
      "This is a classic SSRF risk. An attacker can probe internal services (metadata endpoints, admin APIs, databases behind the firewall) using your server as a proxy.",
    impact: "Data exposure or internal network compromise if this endpoint is reachable.",
    fixSteps: [
      "Allow only known callback origins (e.g. https://pay.acme.dev).",
      "Reject anything else before calling fetch.",
      "Prefer a server-side allowlist over trusting the client.",
    ],
    suggestedFix:
      "const allowed = new Set(['https://pay.acme.dev']);\nif (!allowed.has(new URL(callbackUrl).origin)) {\n  throw new Error('invalid callback');\n}\nconst res = await fetch(callbackUrl);",
    codeSnippet:
      "const callbackUrl = req.query.callback as string;\nconst res = await fetch(callbackUrl); // ← untrusted\nreturn res.json();",
    verifiedHow: "Checked the code path and a second model confirmed the URL is user-controlled with no allowlist.",
    verificationMethod: "cross_exam",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: "accepted",
  },
  {
    runId: "run-1",
    pass: "logic",
    category: "logic",
    severity: "major",
    confidence: 0.91,
    path: "src/api/checkout.ts",
    startLine: 142,
    endLine: 149,
    title: "Discount is applied after tax — totals can go negative",
    bodyMd:
      "Tax is added first, then the discount runs on that sum. With a 100% coupon the charged amount can become negative and is written to `orders.amount_cents` with no floor.",
    whyItMatters:
      "Customers can be charged a negative amount (or get incorrect credits). Finance reports and refunds will be wrong.",
    impact: "Incorrect order totals and possible accounting errors in production.",
    fixSteps: [
      "Apply the discount to the subtotal first.",
      "Add tax on the discounted amount (or your tax policy).",
      "Clamp the final amount with Math.max(0, …) before insert.",
    ],
    suggestedFix:
      "const discounted = applyDiscount(subtotal);\nconst total = Math.max(0, discounted + tax);\nawait orders.insert({ amount_cents: total });",
    codeSnippet:
      "const tax = computeTax(subtotal);\nconst total = applyDiscount(subtotal + tax); // discount after tax\nawait orders.insert({ amount_cents: total });",
    verifiedHow: "Traced the math on the changed lines; cross-check confirmed negative totals are possible.",
    verificationMethod: "cross_exam",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: null,
  },
  {
    runId: "run-1",
    pass: "contracts",
    category: "contracts",
    severity: "major",
    confidence: 0.87,
    path: "src/lib/money.ts",
    startLine: 12,
    endLine: 18,
    title: "`formatMoney` return type changed — callers will break",
    bodyMd:
      "`formatMoney` used to return a `Money` object (`cents`, `currency`). It now returns a string. The web app still reads `.cents` and will throw at runtime.",
    whyItMatters:
      "This is a breaking API change inside the monorepo. Checkout pages that call `formatMoney` will crash after deploy.",
    impact: "Runtime TypeError on any screen that formats money.",
    fixSteps: [
      "Keep returning Money, or rename to formatMoneyString.",
      "Update every caller in web/ to match the new shape.",
      "Add a type-level test so this cannot regress silently.",
    ],
    suggestedFix:
      "// Option A — keep the old contract\nexport function formatMoney(m: Money): Money {\n  return m;\n}\n\n// Option B — new helper, new name\nexport function formatMoneyLabel(m: Money): string {\n  return `${(m.cents / 100).toFixed(2)} ${m.currency}`;\n}",
    codeSnippet:
      "export function formatMoney(m: Money): string {\n  return `${(m.cents / 100).toFixed(2)} ${m.currency}`;\n}",
    verifiedHow: "Confirmed the signature change and found callers still expecting a Money object.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: null,
  },
  {
    runId: "run-1",
    pass: "errors",
    category: "errors",
    severity: "minor",
    confidence: 0.72,
    path: "src/workers/settle.ts",
    startLine: 55,
    endLine: 61,
    title: "Settlement errors are swallowed",
    bodyMd:
      "The settle worker catches errors and ignores them (`catch (e) { /* ignore */ }`). Failed settlements never retry and invoices stay `pending`.",
    whyItMatters:
      "Ops will not see failures in logs, and money may never settle without a manual fix.",
    impact: "Silent stuck invoices; hard to debug in production.",
    fixSteps: [
      "Log the error with the invoice id.",
      "Re-queue or mark the job failed for retry.",
      "Alert if the same invoice fails twice.",
    ],
    suggestedFix:
      "} catch (e) {\n  logger.error('settle failed', { invoiceId, err: e });\n  throw e; // let the queue retry\n}",
    codeSnippet: "try {\n  await settle(invoice);\n} catch (e) {\n  /* ignore */\n}",
    verifiedHow: "Confirmed the empty catch on the changed worker path.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: false,
    inDigest: true,
    feedback: null,
  },
  {
    runId: "run-1",
    pass: "tests",
    category: "tests",
    severity: "minor",
    confidence: 0.68,
    path: "src/api/checkout.ts",
    startLine: 1,
    endLine: 1,
    title: "Discount logic changed but tests were not updated",
    bodyMd:
      "Checkout discount order changed in this PR, but `checkout.test.ts` still expects the old tax-then-discount behavior.",
    whyItMatters:
      "CI may still pass for the wrong reason, or fail after you fix production — either way the tests no longer protect you.",
    impact: "False confidence in checkout totals.",
    fixSteps: [
      "Update checkout.test.ts for discount-then-tax (or your chosen order).",
      "Add a case for a 100% coupon (total must be ≥ 0).",
    ],
    verifiedHow: "Diff shows logic changes without matching test file updates.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: false,
    inDigest: true,
    feedback: null,
  },
  {
    runId: "run-1",
    pass: "logic",
    category: "logic",
    severity: "major",
    confidence: 0.55,
    path: "src/api/checkout.ts",
    startLine: 201,
    endLine: 205,
    title: "Possible null on `customer.address`",
    bodyMd:
      "An early pass flagged `customer.address.country` as possibly null.",
    whyItMatters: "Would matter if address were optional — but it is not on this path.",
    impact: "None — rejected before posting.",
    fixSteps: ["No action needed."],
    verifiedHow:
      "Second-model check found the zod schema already requires address when ship=true. Flag dropped.",
    verificationMethod: "cross_exam",
    verificationStatus: "rejected",
    posted: false,
    inDigest: false,
    feedback: null,
  },
  {
    runId: "run-2",
    pass: "security",
    category: "security",
    severity: "critical",
    confidence: 0.96,
    path: "src/db/queries.ts",
    startLine: 44,
    endLine: 48,
    title: "SQL is built with string concatenation",
    bodyMd:
      "The refund id from the request is pasted into a raw SQL string. Even if it looks like a UUID today, this is SQL injection.",
    whyItMatters:
      "A crafted id can alter or read other rows. Your rulebook also requires the query builder for all SQL.",
    impact: "Database compromise or data loss on the refund path.",
    fixSteps: [
      "Use the query builder / parameterized update.",
      "Never interpolate request values into SQL strings.",
    ],
    suggestedFix: "await db.refunds.where({ id }).update({ status: 'refunded' });",
    codeSnippet:
      "const id = req.params.id;\nawait db.query(`UPDATE refunds SET status='refunded' WHERE id='${id}'`);",
    verifiedHow: "Static check confirmed string interpolation; skeptic model upheld the injection risk.",
    verificationMethod: "cross_exam",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: "accepted",
  },
  {
    runId: "run-2",
    pass: "logic",
    category: "logic",
    severity: "major",
    confidence: 0.89,
    path: "src/services/ledger.ts",
    startLine: 77,
    endLine: 90,
    title: "Money math uses floating point",
    bodyMd:
      "`amount * 1.1` uses IEEE floats for currency. Rounding errors will drift balances over time. Team rule: use the Decimal helper for all money math.",
    whyItMatters: "Pennies will not add up. Ledger and bank reconciliation will disagree.",
    impact: "Subtle balance drift that is hard to unwind later.",
    fixSteps: [
      "Replace float math with Decimal.from(amount).mul('1.1').toCents().",
      "Add a unit test for a known fee amount.",
    ],
    suggestedFix: "return Decimal.from(amount).mul('1.1').toCents();",
    codeSnippet: "export function applyFee(amount: number) {\n  return amount * 1.1;\n}",
    verifiedHow: "Matched against rulebook rule-4 and the changed fee helper.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: null,
  },
  {
    runId: "run-2",
    pass: "concurrency",
    category: "concurrency",
    severity: "major",
    confidence: 0.84,
    path: "src/services/ledger.ts",
    startLine: 112,
    endLine: 128,
    title: "Balance update is not atomic",
    bodyMd:
      "The code reads the balance, subtracts, then writes. Two refunds at once can both read the same balance and overwrite each other (lost update).",
    whyItMatters: "Under load, account balances can be wrong after concurrent refunds.",
    impact: "Incorrect ledger balances; money can appear or disappear.",
    fixSteps: [
      "Wrap read + write in a database transaction.",
      "Or use UPDATE … WHERE balance = $expected and retry on conflict.",
    ],
    suggestedFix:
      "await db.transaction(async (tx) => {\n  const bal = await tx.getBalance(accountId);\n  await tx.setBalance(accountId, bal - cents, { expected: bal });\n});",
    codeSnippet:
      "const bal = await getBalance(accountId);\nawait setBalance(accountId, bal - cents);",
    verifiedHow: "Reviewed the read-modify-write pattern; cross-exam agreed a race is possible.",
    verificationMethod: "cross_exam",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: null,
  },
  {
    runId: "run-2",
    pass: "contracts",
    category: "contracts",
    severity: "major",
    confidence: 0.8,
    path: "src/api/refunds.ts",
    startLine: 30,
    endLine: 36,
    title: "API response dropped `refunded_at`",
    bodyMd:
      "The refund response no longer includes `refunded_at`. Mobile clients still parse that field and will break or show blank dates.",
    whyItMatters: "Shipping this without a version bump breaks existing mobile apps.",
    impact: "Client crashes or missing refund timestamps in the app.",
    fixSteps: [
      "Keep `refunded_at` in the response, or",
      "Version the endpoint (e.g. /v2/refunds) and migrate clients.",
    ],
    suggestedFix:
      "return {\n  id: refund.id,\n  status: refund.status,\n  refunded_at: refund.refundedAt, // keep for mobile clients\n};",
    codeSnippet:
      "return {\n  id: refund.id,\n  status: refund.status,\n  // refunded_at removed\n};",
    verifiedHow: "Compared response shape to mobile client usage of refunded_at.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: "dismissed",
  },
  {
    runId: "run-2",
    pass: "errors",
    category: "errors",
    severity: "minor",
    confidence: 0.7,
    path: "src/services/ledger.ts",
    startLine: 150,
    endLine: 155,
    title: "Webhook failure leaves systems out of sync",
    bodyMd:
      "The ledger row is committed before the outbound webhook. If the webhook fails, your DB says refunded but the partner system does not.",
    whyItMatters: "Support will see mismatched states between your app and the payment partner.",
    impact: "Manual reconciliation work; customer confusion.",
    fixSteps: [
      "Send the webhook inside the same saga / outbox pattern.",
      "Or roll back / compensate if the webhook fails.",
    ],
    verifiedHow: "Ordering of commit vs webhook is clear in the changed function.",
    verificationMethod: "static",
    verificationStatus: "verified",
    posted: false,
    inDigest: true,
    feedback: null,
  },
  {
    runId: "run-3",
    pass: "errors",
    category: "errors",
    severity: "major",
    confidence: 0.88,
    path: "cmd/provision/main.go",
    startLine: 64,
    endLine: 71,
    title: "File Close error is ignored",
    bodyMd:
      "After writing terraform state, `Close()` can fail (disk full, flush error). That error is never checked, so a partial file can look successful.",
    whyItMatters: "Corrupt state files are painful to recover and may break the next provision run.",
    impact: "Silent corrupt terraform state on disk.",
    fixSteps: [
      "Check the error from Close on the success path.",
      "Return that error to the caller so the job fails loudly.",
    ],
    suggestedFix:
      "defer func() {\n  if cerr := f.Close(); cerr != nil && err == nil {\n    err = cerr\n  }\n}()",
    codeSnippet: "f, err := os.Create(statePath)\n// ...\ndefer f.Close() // Close error ignored",
    verifiedHow: "Confirmed Close is deferred without checking its error on the write path.",
    verificationMethod: "cross_exam",
    verificationStatus: "verified",
    posted: true,
    inDigest: false,
    feedback: null,
  },
];

export const demoFindings: DemoFinding[] = findingSeeds.map((f, i) => ({
  ...f,
  id: `finding-${i}`,
}));

// ------------------------------------------------------------- analytics

export interface WeekPoint {
  week: string; // e.g. "May 4"
  findingsPosted: number;
  accepted: number;
  dismissed: number;
  acceptancePct: number;
  noisePct: number;
  medianLatencyMin: number;
}

const weekLabels = [
  "Apr 20", "Apr 27", "May 4", "May 11", "May 18", "May 25",
  "Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6",
];

const acceptanceCurve = [61, 63, 66, 65, 70, 72, 74, 73, 77, 80, 82, 84];
const noiseCurve = [9.2, 8.8, 8.1, 7.6, 6.9, 6.2, 5.5, 5.1, 4.6, 4.0, 3.6, 3.1];
const postedCurve = [18, 22, 25, 21, 28, 31, 27, 33, 30, 35, 32, 34];

export const demoWeekly: WeekPoint[] = weekLabels.map((week, i) => {
  const posted = postedCurve[i] ?? 0;
  const acceptancePct = acceptanceCurve[i] ?? 0;
  return {
    week,
    findingsPosted: posted,
    accepted: Math.round((posted * acceptancePct) / 100),
    dismissed: Math.round((posted * (noiseCurve[i] ?? 0)) / 100),
    acceptancePct,
    noisePct: noiseCurve[i] ?? 0,
    medianLatencyMin: 4.6 - i * 0.08,
  };
});

export interface CategoryCount {
  category: string;
  count: number;
}

export const demoCategories: CategoryCount[] = [
  { category: "logic", count: 42 },
  { category: "security", count: 17 },
  { category: "contracts", count: 14 },
  { category: "errors", count: 11 },
  { category: "tests", count: 9 },
  { category: "concurrency", count: 5 },
];

// ---------------------------------------------------------------- health

export interface HealthPoint {
  week: string;
  riskScore: number; // 0..100 accumulated risk
  untestedPct: number; // % of changed logic without test changes
}

export const demoHealth: Record<string, HealthPoint[]> = {
  "repo-payments": weekLabels.map((week, i) => ({
    week,
    riskScore: [34, 36, 39, 38, 42, 45, 44, 47, 45, 43, 41, 40][i] ?? 0,
    untestedPct: [28, 27, 29, 31, 30, 27, 25, 26, 24, 22, 21, 19][i] ?? 0,
  })),
  "repo-web": weekLabels.map((week, i) => ({
    week,
    riskScore: [22, 24, 23, 26, 28, 27, 30, 33, 35, 34, 36, 38][i] ?? 0,
    untestedPct: [35, 36, 38, 37, 40, 41, 43, 42, 44, 46, 45, 47][i] ?? 0,
  })),
  "repo-infra": weekLabels.map((week, i) => ({
    week,
    riskScore: [15, 15, 16, 18, 17, 19, 20, 19, 21, 22, 21, 23][i] ?? 0,
    untestedPct: [18, 19, 17, 20, 21, 20, 22, 23, 22, 24, 25, 24][i] ?? 0,
  })),
};

export const demoRecurring: Record<string, CategoryCount[]> = {
  "repo-payments": [
    { category: "logic", count: 16 },
    { category: "security", count: 9 },
    { category: "contracts", count: 7 },
    { category: "errors", count: 4 },
  ],
  "repo-web": [
    { category: "logic", count: 19 },
    { category: "tests", count: 8 },
    { category: "contracts", count: 5 },
    { category: "errors", count: 5 },
  ],
  "repo-infra": [
    { category: "errors", count: 6 },
    { category: "concurrency", count: 4 },
    { category: "logic", count: 3 },
  ],
};

// -------------------------------------------------------------- rulebook

export interface DemoRule {
  id: string;
  ruleText: string;
  category: string;
  source: "learned" | "manual";
  active: boolean;
  evidenceCount: number;
  repoName: string | null; // null = org-wide
  createdAt: string;
}

export const demoRules: DemoRule[] = [
  {
    id: "rule-1",
    ruleText: "Don't flag missing null checks on values coming from zod-parsed schemas — they're already validated at the boundary.",
    category: "logic",
    source: "learned",
    active: true,
    evidenceCount: 7,
    repoName: null,
    createdAt: iso(21 * day),
  },
  {
    id: "rule-2",
    ruleText: "All SQL must go through the query builder — flag any string-concatenated SQL even in migrations.",
    category: "security",
    source: "manual",
    active: true,
    evidenceCount: 0,
    repoName: "payments-api",
    createdAt: iso(30 * day),
  },
  {
    id: "rule-3",
    ruleText: "Don't suggest converting forEach to for..of — team prefers forEach for readability.",
    category: "style",
    source: "learned",
    active: true,
    evidenceCount: 4,
    repoName: "web",
    createdAt: iso(12 * day),
  },
  {
    id: "rule-4",
    ruleText: "Money amounts must never be floats — flag any arithmetic on amounts not using the Decimal helper.",
    category: "logic",
    source: "manual",
    active: true,
    evidenceCount: 0,
    repoName: "payments-api",
    createdAt: iso(45 * day),
  },
  {
    id: "rule-5",
    ruleText: "Don't flag TODO comments that reference a JIRA ticket (PAY-*) — those are tracked.",
    category: "style",
    source: "learned",
    active: true,
    evidenceCount: 3,
    repoName: null,
    createdAt: iso(8 * day),
  },
  {
    id: "rule-6",
    ruleText: "Feature flags must have an owner and expiry in the flag definition file.",
    category: "contracts",
    source: "learned",
    active: false,
    evidenceCount: 1,
    repoName: "web",
    createdAt: iso(2 * day),
  },
  {
    id: "rule-7",
    ruleText: "Don't flag console.log in files under scripts/ — those are CLI tools.",
    category: "style",
    source: "learned",
    active: false,
    evidenceCount: 1,
    repoName: "infra",
    createdAt: iso(1 * day),
  },
];

// ---------------------------------------------------------------- orgs

export interface DemoOrg {
  id: string;
  name: string;
  kind: "individual" | "team";
  plan: string;
  role: "owner" | "admin" | "member";
  platform: "github" | "bitbucket" | "demo";
}

/**
 * Two demo orgs so the org switcher, "personal vs team" copy, and
 * invite-gating (individual orgs can't invite) are all visible without a
 * live backend — mirrors the real shape returned by GET /api/orgs.
 */
export const demoOrgs: DemoOrg[] = [
  { id: "org-acme", name: "acme", kind: "team", plan: "Pro", role: "owner", platform: "demo" },
  { id: "org-personal", name: "dinesh-t", kind: "individual", plan: "Free", role: "owner", platform: "demo" },
];

// -------------------------------------------------------------- settings

export interface DemoMember {
  id: string;
  handle: string;
  email: string;
  role: "owner" | "admin" | "member";
  seatActive: boolean;
}

export const demoMembers: DemoMember[] = [
  { id: "u1", handle: "dinesh-t", email: "dinesh.t@contus.in", role: "owner", seatActive: true },
  { id: "u2", handle: "priya-dev", email: "priya@acme.dev", role: "admin", seatActive: true },
  { id: "u3", handle: "marco-p", email: "marco@acme.dev", role: "member", seatActive: true },
  { id: "u4", handle: "sofia-r", email: "sofia@acme.dev", role: "member", seatActive: false },
];

export interface DemoInvite {
  id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  createdAt: string;
  expiresAt: string;
}

export const demoInvites: DemoInvite[] = [
  {
    id: "inv-1",
    email: "new-hire@acme.dev",
    role: "member",
    token: "demo-invite-token",
    createdAt: iso(1 * day),
    expiresAt: new Date(now + 13 * day).toISOString(),
  },
];

export interface DemoAuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export const demoAudit: DemoAuditEntry[] = [
  { id: "a1", actor: "dinesh-t", action: "rule.activated", target: "rule-5", at: iso(8 * day) },
  { id: "a2", actor: "priya-dev", action: "repo.config_changed", target: "payments-api", at: iso(6 * day) },
  { id: "a3", actor: "system", action: "rulebook.compiled", target: "org", at: iso(5 * day) },
  { id: "a4", actor: "dinesh-t", action: "member.invited", target: "sofia-r", at: iso(4 * day) },
  { id: "a5", actor: "priya-dev", action: "rule.created", target: "rule-4", at: iso(3 * day) },
  { id: "a6", actor: "system", action: "index.completed", target: "web", at: iso(2 * day) },
  { id: "a7", actor: "marco-p", action: "run.retriggered", target: "web#585", at: iso(1 * day) },
  { id: "a8", actor: "system", action: "billing.seat_added", target: "org", at: iso(0.5 * day) },
];

export const demoBilling = {
  plan: "Pro",
  pricePerSeat: 15,
  seats: 5,
  seatsUsed: 3,
  renewsOn: new Date(now + 19 * day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  status: "active" as const,
};

export const demoUsage = {
  plan: "pro" as const,
  seats: 5,
  used: 118,
  quota: 200, // 40/seat default * 5 seats
  remaining: 82,
  periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
  periodEnd: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString(),
  blocked: false,
};

// ------------------------------------------------------------- benchmark

export interface BenchmarkRow {
  tool: string;
  catchRatePct: number;
  falsePositivesPerRun: number;
  noisePct: number;
  medianLatencyMin: number;
  highlight: boolean;
}

/** Sample numbers matching DESIGN.md §1 targets — replaced by harness v1 output in Phase B. */
export const demoBenchmark: BenchmarkRow[] = [
  { tool: "CodeFerret", catchRatePct: 72, falsePositivesPerRun: 1.4, noisePct: 4.0, medianLatencyMin: 3.8, highlight: true },
  { tool: "CodeRabbit", catchRatePct: 44, falsePositivesPerRun: 6.2, noisePct: 15, medianLatencyMin: 4.5, highlight: false },
  { tool: "Greptile", catchRatePct: 51, falsePositivesPerRun: 11, noisePct: 12, medianLatencyMin: 6.1, highlight: false },
  { tool: "Qodo", catchRatePct: 47, falsePositivesPerRun: 5.8, noisePct: 13, medianLatencyMin: 5.2, highlight: false },
  { tool: "Copilot Review", catchRatePct: 39, falsePositivesPerRun: 4.9, noisePct: 14, medianLatencyMin: 2.9, highlight: false },
];
