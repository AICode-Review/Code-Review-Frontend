import { useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="inline-flex border border-[#3a2f1f] bg-[#0d0f0a] p-0.5" role="group" aria-label="Display currency">
      {(["USD", "INR"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={currency === c}
          className={`px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition ${
            currency === c ? "bg-[#ffb300] text-black" : "text-[#a39a86] hover:text-[#ffb300]"
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
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// pick your tier</p>
      <h1 className="mt-3 text-center text-3xl font-bold uppercase tracking-tight text-[#f2ead9]">Pricing</h1>
      <p className="mt-3 text-center text-sm text-[#a39a86]">
        Seat-based. A seat is a developer whose PRs get reviewed.
      </p>

      <div className="mt-6 flex flex-col items-center gap-1.5">
        <CurrencyToggle currency={currency} onChange={setCurrency} />
        {currency === "INR" && (
          <p className="text-[11px] text-[#6b6252]">// approximate — checkout is always billed in USD</p>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col border bg-[#0d0f0a] p-5 shadow-[4px_4px_0_0_#1c1810] ${
              tier.highlight ? "border-[#ffb300]" : "border-[#3a2f1f]"
            }`}
          >
            {tier.highlight && (
              <span className="mb-2 self-start border border-[#ffb300]/50 bg-[#ffb300]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ffb300]">
                Most popular
              </span>
            )}
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{tier.name}</h2>
            <p
              className="mt-3 font-mono text-3xl font-bold tabular-nums text-[#ffb300]"
              style={{ textShadow: "0 0 10px rgba(255,179,0,.25)" }}
            >
              {tier.priceUsd === 0
                ? currency === "USD"
                  ? "$0"
                  : "₹0"
                : currency === "USD"
                  ? `$${tier.priceUsd}`
                  : `≈${formatInr(tier.priceUsd)}`}
            </p>
            <p className="text-xs text-[#6b6252]">{tier.unit}</p>
            <p className="mt-2 border border-[#ffb300]/30 bg-[#ffb300]/5 px-2 py-1.5 text-[11px] font-medium text-[#ffb300]">
              {tier.quota}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-xs text-[#a39a86]">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[#4ade80]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={tier.ctaTo}
              className={`mt-5 px-4 py-2 text-center font-mono text-xs font-bold uppercase tracking-wide transition ${
                tier.highlight
                  ? "border-2 border-[#ffb300] bg-[#ffb300] text-black shadow-[3px_3px_0_0_#3a2f1f] hover:-translate-y-0.5 hover:bg-[#ffcf66]"
                  : "border-2 border-[#3a2f1f] text-[#c9c2b3] hover:border-[#ffb300]/50 hover:text-[#ffb300]"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#6b6252]">
        // review quotas are sized against our per-review cost cap, not measured usage yet — see the{" "}
        <Link to="/benchmark" className="text-[#ffb300] hover:underline">
          benchmark methodology
        </Link>
        . Need self-hosted or a higher volume?{" "}
        <Link to="/security" className="text-[#ffb300] hover:underline">
          Talk to us
        </Link>
        .
      </p>
    </div>
  );
}
