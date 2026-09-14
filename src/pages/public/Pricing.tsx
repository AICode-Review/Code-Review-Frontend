import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicIntro } from "../../components/layout/PublicSite";
import { Seo } from "../../components/Seo";
import { setPostSigninRedirect } from "../../lib/postSigninRedirect";

type Currency = "USD" | "INR";

// priceInr is the real, fixed amount each Razorpay Plan (RAZORPAY_PLAN_PRO/TEAM in the
// backend env) actually charges — India-only launch, international payments not yet
// enabled on the account. priceUsd is a display-only approximation for browsing
// convenience (same ~83 INR/USD rate used to derive it) and is never what checkout
// actually bills, so it's always shown with a "≈" prefix and a note saying so.
const INR_TO_USD = 83;

function formatUsdApprox(inr: number): string {
  return `$${Math.round(inr / INR_TO_USD)}`;
}

interface Tier {
  name: string;
  priceInr: number;
  unit: string;
  quota: string;
  features: string[];
  cta: string;
  ctaTo: string;
  highlight: boolean;
  /** Paid tiers send the user to Settings → Billing right after sign-in instead of the
   * plain Dashboard, so clicking "Start Individual" here actually leads somewhere close
   * to checkout instead of losing that intent in the sign-in detour. */
  paid: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    priceInr: 0,
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
    paid: false,
  },
  {
    name: "Individual",
    priceInr: 1575,
    unit: "per seat / month",
    quota: "50 AI reviews / seat / month",
    features: [
      "Everything in Free, plus:",
      "Private repositories",
      "Rulebook — learns your team's standards from 👍/👎 feedback",
      "Runs dashboard with realtime status",
      "Manual review triggers & reruns",
      "Execution-sandbox verification (Node, Python, JVM) — reproduces bugs before flagging them",
      "Auto-apply suggested fixes & auto-generated test files",
      "Full-codebase chat — ask anything about your repo",
      "Comment budget controls (critical/major inline, rest digested)",
      "Email support",
    ],
    cta: "Start Individual",
    ctaTo: "/signin",
    highlight: true,
    paid: true,
  },
  {
    name: "Team",
    priceInr: 2905,
    unit: "per seat / month",
    quota: "90 AI reviews / seat / month",
    features: [
      "Everything in Individual, plus:",
      "Analytics dashboards & weekly repo health reports",
      "Roles (owner/admin/member) & teammate invites",
      "Full audit log",
      "Priority support",
    ],
    cta: "Start Team",
    ctaTo: "/signin",
    highlight: false,
    paid: true,
  },
];

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
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
  const [currency, setCurrency] = useState<Currency>("INR");
  return (
    <main className="site-pricing home-container">
      <Seo
        title="Pricing — Scrutinye"
        description="Seat-based pricing for AI code review: Free for public repos, Individual and Team for private repos with rulebook learning, sandbox verification, and analytics."
        path="/pricing"
      />
      <PublicIntro
        eyebrow="SIMPLE PLANS. SERIOUS SCRUTINY."
        title={
          <>
            A little investment.
            <br />
            <span>A lot more confidence.</span>
          </>
        }
        description="Start with your public repos. Add deeper controls as you grow. One seat for each developer whose pull requests we review."
      >
        <div className="site-currency">
          <CurrencyToggle currency={currency} onChange={setCurrency} />
          <p>
            {currency === "USD"
              ? "Approximate USD prices. Checkout is always billed in INR."
              : "Monthly billing in INR. No credit card needed for Free."}
          </p>
        </div>
      </PublicIntro>
      <div className="site-pricing-grid">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`site-plan ${tier.highlight ? "site-plan-featured" : ""}`}
          >
            <div className="site-plan-heading">
              <h2>{tier.name}</h2>
              {tier.highlight && (
                <span className="site-popular">MOST POPULAR</span>
              )}
            </div>
            <p className="site-plan-description">
              {tier.name === "Free"
                ? "For open-source projects and curious builders."
                : tier.name === "Individual"
                  ? "For developers ready to go deeper."
                  : "For teams building better, together."}
            </p>
            <p className="site-plan-price">
              {tier.priceInr === 0
                ? currency === "INR"
                  ? "₹0"
                  : "$0"
                : currency === "INR"
                  ? "₹" + tier.priceInr.toLocaleString("en-IN")
                  : "≈" + formatUsdApprox(tier.priceInr)}
            </p>
            <p className="site-plan-unit">{tier.unit}</p>
            <p className="site-plan-quota">
              <span aria-hidden="true">◎</span>
              {tier.quota}
            </p>
            <Link
              to={tier.ctaTo}
              onClick={() => {
                if (tier.paid) setPostSigninRedirect("/settings");
              }}
              className={`home-button ${tier.highlight ? "home-button-green" : "site-button-outline"}`}
            >
              {tier.cta}
              <span aria-hidden="true">↗</span>
            </Link>
            <p className="site-plan-includes">
              {tier.name === "Free"
                ? "A strong foundation"
                : tier.name === "Individual"
                  ? "More context. More control."
                  : "Made for collaboration"}
            </p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="site-pricing-enterprise">
        <div>
          <p className="site-eyebrow">YOUR INFRASTRUCTURE. YOUR RULES.</p>
          <h2>Need a little more room?</h2>
          <p>
            Talk to us about self-hosting, enterprise needs, or higher review
            volume.
          </p>
        </div>
        <Link
          to="/contact?reason=enterprise"
          className="home-button site-button-outline"
        >
          Let's talk <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="site-pricing-note">
        Review quotas are sized against our per-review cost cap, not measured
        usage yet. <Link to="/benchmark">Explore our methodology →</Link>
      </p>
      <div className="site-pricing-faq">
        <h2>A few plan details.</h2>
        <details>
          <summary>
            What counts as a seat?<span aria-hidden="true">+</span>
          </summary>
          <p>
            A seat is a developer whose pull requests get reviewed. Individual
            and Team quotas scale with your seat count.
          </p>
        </details>
        <details>
          <summary>
            Can I start with a private repository?
            <span aria-hidden="true">+</span>
          </summary>
          <p>
            Yes. Choose Individual or Team for private repositories. Free
            includes public repositories.
          </p>
        </details>
        <details>
          <summary>
            How are payments handled?<span aria-hidden="true">+</span>
          </summary>
          <p>
            Paid plans use Razorpay and are billed in INR. USD amounts are
            approximate and provided for browsing convenience.
          </p>
        </details>
      </div>
    </main>
  );
}
