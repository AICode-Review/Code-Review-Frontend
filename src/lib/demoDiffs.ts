import type { DiffFile, DiffLine, PrDiff } from "../components/review/DiffViewer";

function lines(
  rows: Array<{ kind: DiffLine["kind"]; old?: number; neu?: number; text: string }>,
): DiffLine[] {
  return rows.map((r) => ({
    kind: r.kind,
    oldNo: r.old ?? null,
    newNo: r.neu ?? null,
    text: r.text,
  }));
}

function file(
  path: string,
  rows: Array<{ kind: DiffLine["kind"]; old?: number; neu?: number; text: string }>,
): DiffFile {
  const mapped = lines(rows);
  return {
    path,
    additions: mapped.filter((l) => l.kind === "add").length,
    deletions: mapped.filter((l) => l.kind === "del").length,
    lines: mapped,
  };
}

const checkoutDiff = file("src/api/checkout.ts", [
  { kind: "context", old: 84, neu: 84, text: "export async function checkout(req: Request) {" },
  { kind: "context", old: 85, neu: 85, text: "  const body = CheckoutSchema.parse(req.body);" },
  { kind: "context", old: 86, neu: 86, text: "  const subtotal = sumLineItems(body.items);" },
  { kind: "del", old: 87, text: "  const callbackUrl = req.query.callback as string;" },
  { kind: "del", old: 88, text: "  const res = await fetch(callbackUrl);" },
  { kind: "del", old: 89, text: "  await res.json();" },
  { kind: "add", neu: 87, text: "  const callbackUrl = req.query.callback as string;" },
  { kind: "add", neu: 88, text: "  const allowed = new Set(['https://pay.acme.dev']);" },
  {
    kind: "add",
    neu: 89,
    text: "  if (!allowed.has(new URL(callbackUrl).origin)) throw new Error('invalid callback');",
  },
  { kind: "add", neu: 90, text: "  const res = await fetch(callbackUrl);" },
  { kind: "add", neu: 91, text: "  await res.json();" },
  { kind: "context", old: 90, neu: 92, text: "" },
  { kind: "context", old: 91, neu: 93, text: "  const tax = computeTax(subtotal);" },
  { kind: "del", old: 92, text: "  const total = applyDiscount(subtotal + tax);" },
  { kind: "add", neu: 94, text: "  const discounted = applyDiscount(subtotal);" },
  { kind: "add", neu: 95, text: "  const total = Math.max(0, discounted + tax);" },
  { kind: "context", old: 93, neu: 96, text: "  await orders.insert({ amount_cents: total });" },
  { kind: "context", old: 94, neu: 97, text: "  return { ok: true, total };" },
  { kind: "context", old: 95, neu: 98, text: "}" },
]);

const moneyDiff = file("src/lib/money.ts", [
  { kind: "context", old: 10, neu: 10, text: "export type Money = { cents: number; currency: string };" },
  { kind: "context", old: 11, neu: 11, text: "" },
  { kind: "del", old: 12, text: "export function formatMoney(m: Money): Money {" },
  { kind: "del", old: 13, text: "  return m;" },
  { kind: "del", old: 14, text: "}" },
  { kind: "add", neu: 12, text: "export function formatMoney(m: Money): string {" },
  {
    kind: "add",
    neu: 13,
    text: "  return `${(m.cents / 100).toFixed(2)} ${m.currency}`;",
  },
  { kind: "add", neu: 14, text: "}" },
]);

const refundDiff = file("src/db/queries.ts", [
  { kind: "context", old: 40, neu: 40, text: "export async function markRefunded(id: string) {" },
  {
    kind: "del",
    old: 41,
    text: "  await db.query(`UPDATE refunds SET status='refunded' WHERE id='${id}'`);",
  },
  {
    kind: "add",
    neu: 41,
    text: "  await db.refunds.where({ id }).update({ status: 'refunded' });",
  },
  { kind: "context", old: 42, neu: 42, text: "}" },
]);

const ledgerDiff = file("src/services/ledger.ts", [
  { kind: "context", old: 74, neu: 74, text: "export function applyFee(amount: number) {" },
  { kind: "del", old: 75, text: "  return amount * 1.1;" },
  { kind: "add", neu: 75, text: "  return Decimal.from(amount).mul('1.1').toCents();" },
  { kind: "context", old: 76, neu: 76, text: "}" },
  { kind: "context", old: 110, neu: 110, text: "export async function debit(accountId: string, cents: number) {" },
  { kind: "del", old: 111, text: "  const bal = await getBalance(accountId);" },
  { kind: "del", old: 112, text: "  await setBalance(accountId, bal - cents);" },
  { kind: "add", neu: 111, text: "  await db.transaction(async (tx) => {" },
  { kind: "add", neu: 112, text: "    const bal = await tx.getBalance(accountId);" },
  {
    kind: "add",
    neu: 113,
    text: "    await tx.setBalance(accountId, bal - cents, { expected: bal });",
  },
  { kind: "add", neu: 114, text: "  });" },
  { kind: "context", old: 113, neu: 115, text: "}" },
]);

const provisionDiff = file("cmd/provision/main.go", [
  { kind: "context", old: 60, neu: 60, text: "f, err := os.Create(statePath)" },
  { kind: "context", old: 61, neu: 61, text: "if err != nil {" },
  { kind: "context", old: 62, neu: 62, text: "\treturn err" },
  { kind: "context", old: 63, neu: 63, text: "}" },
  { kind: "del", old: 64, text: "defer f.Close()" },
  { kind: "add", neu: 64, text: "defer func() {" },
  { kind: "add", neu: 65, text: "\tif cerr := f.Close(); cerr != nil && err == nil {" },
  { kind: "add", neu: 66, text: "\t\terr = cerr" },
  { kind: "add", neu: 67, text: "\t}" },
  { kind: "add", neu: 68, text: "}()" },
]);

function buildDiff(baseSha: string, headSha: string, files: DiffFile[]): PrDiff {
  return {
    baseSha,
    headSha,
    baseLabel: "main (before PR)",
    headLabel: "PR head (new)",
    files,
    stats: {
      files: files.length,
      additions: files.reduce((s, f) => s + f.additions, 0),
      deletions: files.reduce((s, f) => s + f.deletions, 0),
    },
  };
}

const byRepo: Record<string, DiffFile[]> = {
  "payments-api": [checkoutDiff, moneyDiff, refundDiff, ledgerDiff],
  web: [checkoutDiff, moneyDiff],
  infra: [provisionDiff],
};

/** Demo PR diffs keyed by run id (and fallback by repo name). */
export function getDemoDiff(runId: string, repo: string, headSha: string): PrDiff {
  const files = byRepo[repo] ?? [checkoutDiff];
  const baseSha = headSha
    .split("")
    .reverse()
    .join("")
    .slice(0, 8)
    .padEnd(12, "0");
  // Prefer richer diffs for known completed demo runs
  if (runId === "run-1" || runId.startsWith("run-demo-")) {
    return buildDiff(baseSha, headSha, byRepo.web ?? files);
  }
  if (runId === "run-2") {
    return buildDiff(baseSha, headSha, byRepo["payments-api"] ?? files);
  }
  if (runId === "run-3") {
    return buildDiff(baseSha, headSha, byRepo.infra ?? files);
  }
  return buildDiff(baseSha, headSha, files);
}
