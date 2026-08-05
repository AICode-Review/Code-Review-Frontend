import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../../components/Seo";

type Currency = "USD" | "INR";

// Display-only approximation for browsing convenience — checkout itself always runs
// through Razorpay in whatever fixed currency each Plan was created with (see
// RAZORPAY_PLAN_PRO/TEAM in the backend env), so this is never presented as a real
// INR charge amount here.
const USD_TO_INR = 83;

function formatInr(usd: number): string {
  return `₹${Math.round((usd * USD_TO_INR) / 5) * 5}`;
}

interface Tier {
  name: string;
  priceUsd: number;
  unit: string;
  quota: string;
  features: string[];
  cta: string;
  ctaTo: string;
  highlight: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    priceUsd: 0,
    unit: "public repos",
    quota: "25 AI reviews / month",
    features: [
      "Unlimited public repositories",
      "All 7 specialist review passes (logic, security, contracts + more)",
      "Cross-examination verification — precision-first, near-zero false positives",
      "Every language reviewed; AST-enhanced depth for Tier-1 languages",
      "PR score (0-100) & pull request list",
      "Community support",
    ],
    cta: "Start free",
    ctaTo: "/signin",
    highlight: false,
  },
  {
    name: "Pro",
    priceUsd: 15,
    unit: "per seat / month",
    quota: "40 AI reviews / seat / month",
    features: [
      "Everything in Free, plus:",
      "Private repositories",
      "Rulebook — learns your team's standards from 👍/👎 feedback",
      "Runs dashboard with realtime status",
      "Manual review triggers & reruns",
      "Execution-sandbox verification (Node, Python, JVM) — reproduces bugs before flagging them",
      "Comment budget controls (critical/major inline, rest digested)",
      "Email support",
    ],
    cta: "Start Pro",
    ctaTo: "/signin",
    highlight: true,
  },
  {
    name: "Team",
    priceUsd: 25,
    unit: "per seat / month",
    quota: "65 AI reviews / seat / month",
    features: [
      "Everything in Pro, plus:",
      "Analytics dashboards & weekly repo health reports",
      "Roles (owner/admin/member) & teammate invites",
      "Full audit log",
      "Priority support",
    ],
    cta: "Start Team",
    ctaTo: "/signin",
    highlight: false,
  },
];

function CurrencyToggle({ currency, onChange }: { currency: Currency; onChange: (c: Currency) => void }) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-0.5"
      role="group"
      aria-label="Display currency"
    >
      {(["USD", "INR"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={currency === c}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            currency === c
              ? "bg-[var(--mk-accent)] text-[var(--mk-accent-fg)]"
              : "text-[var(--mk-muted)] hover:text-[var(--mk-ink)]"
          }`}
        >
          {c === "USD" ? "$ USD" : "₹ INR"}
        </button>
      ))}
    </div>
  );
}

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>("USD");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Seo
        title="Pricing — CodeFerret"
        description="Seat-based pricing for AI code review: Free for public repos, Pro and Team for private repos with rulebook learning, sandbox verification, and analytics."
        path="/pricing"
      />
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Pick your tier</p>
      <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">Pricing</h1>
      <p className="mt-3 text-center text-base text-[var(--mk-muted)]">
        Seat-based. A seat is a developer whose PRs get reviewed.
      </p>

      <div className="mt-6 flex flex-col items-center gap-1.5">
        <CurrencyToggle currency={currency} onChange={setCurrency} />
        {currency === "INR" && (
          <p className="text-[11px] text-[var(--mk-faint)]">Approximate — checkout is always billed in USD</p>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-2xl border bg-[var(--mk-bg-elevated)] p-5 ${
              tier.highlight
                ? "border-[var(--mk-accent)] shadow-[0_0_0_1px_var(--mk-accent),0_8px_32px_rgba(20,184,166,0.15)]"
                : "border-[var(--mk-border)]"
            }`}
          >
            {tier.highlight && (
              <span className="mb-2 self-start rounded-md border border-[var(--mk-accent)]/40 bg-[var(--mk-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--mk-accent)]">
                Most popular
              </span>
            )}
            <h2 className="text-sm font-semibold text-[var(--mk-ink)]">{tier.name}</h2>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-[var(--mk-ink)]">
              {tier.priceUsd === 0
                ? currency === "USD"
                  ? "$0"
                  : "₹0"
                : currency === "USD"
                  ? `$${tier.priceUsd}`
                  : `≈${formatInr(tier.priceUsd)}`}
            </p>
            <p className="text-xs text-[var(--mk-faint)]">{tier.unit}</p>
            <p className="mt-2 rounded-lg border border-[var(--mk-accent)]/25 bg-[var(--mk-accent-soft)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--mk-accent)]">
              {tier.quota}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--mk-muted)]">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[var(--mk-success)]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={tier.ctaTo}
              className={`mt-5 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                tier.highlight
                  ? "bg-[var(--mk-accent)] text-[var(--mk-accent-fg)] shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)]"
                  : "border border-[var(--mk-border-strong)] text-[var(--mk-ink)] hover:border-[var(--mk-accent)]/40 hover:text-[var(--mk-accent)]"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-[var(--mk-faint)]">
        Review quotas are sized against our per-review cost cap, not measured usage yet. Need self-hosted or a higher
        volume?{" "}
        <Link to="/contact" className="text-[var(--mk-accent)] hover:underline">
          Talk to us
        </Link>
        .
      </p>
    </div>
  );
}
