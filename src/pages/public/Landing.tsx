import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";
import { Seo } from "../../components/Seo";

const capabilities: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "shield",
    title: "Every finding earns its place",
    body: "We check the cited code, then hand the claim to a different model for cross-examination. Refuted or uncertain claims never reach your PR.",
  },
  {
    icon: "scan",
    title: "Specialists, not one giant prompt",
    body: "Focused passes inspect logic, security, contracts, concurrency, error handling, tests, and your team's own rules — independently.",
  },
  {
    icon: "budget",
    title: "A hard limit on review noise",
    body: "Only verified critical and major issues become line comments. Everything else collapses into one digest.",
  },
  {
    icon: "rulebook",
    title: "Reviews that learn your standards",
    body: "Feedback becomes durable, repo-aware guidance. Add, approve, pause, or remove rules in plain language.",
  },
  {
    icon: "code",
    title: "Every language, genuinely",
    body: "Nothing is filtered from review except actual binaries. Kotlin, Swift, React Native, Flutter — full LLM-level analysis.",
  },
  {
    icon: "lock",
    title: "A score for every PR",
    body: "Every pull request gets a 0–100 score and its own page — track review health across a repo, not just comment-by-comment.",
  },
];

const surfaces: Array<{ icon: IconName; title: string; body: string; to: string }> = [
  {
    icon: "shield",
    title: "PR bot",
    body: "Installs on GitHub or Bitbucket. Reviews every push automatically and posts only what survived verification.",
    to: "/onboarding",
  },
  {
    icon: "code",
    title: "Features",
    body: "Specialist passes, cross-model verification, execution-sandbox repro, and a rulebook that learns your team's standards.",
    to: "/features",
  },
  {
    icon: "scan",
    title: "Dashboard",
    body: "PR scores, run history, rulebook, and repo health, all org-scoped and live.",
    to: "/signin",
  },
];

const targets = [
  { value: "> 70%", label: "Verified catch rate" },
  { value: "< 2", label: "False pos. / run" },
  { value: "< 5%", label: "Noise dismissal" },
  { value: "< 5m", label: "Median latency" },
];

const steps = [
  "Read the real diff and files",
  "Run focused specialist passes",
  "Cross-examine every candidate",
  "Ship only verified signal",
];

const rulebookRules: Array<[string, string, string]> = [
  ["Security", "Require an authorization check before account-scoped writes.", "12 signals"],
  ["Errors", "Never swallow payment provider errors; attach the request ID.", "7 signals"],
  ["Tests", "Changes to fee calculations require boundary-value tests.", "manual"],
];

const rulebookFeatures: Array<[string, string]> = [
  ["Plain-language rules", "Add team standards without prompt engineering."],
  ["Evidence before activation", "Learned rules stay reviewable and reversible."],
  ["Private by design", "Ephemeral source snapshots and encrypted tokens."],
  ["All-language review", "Every source language receives LLM-level analysis."],
];

export default function Landing() {
  return (
    <main className="overflow-hidden">
      <Seo
        title="CodeFerret — AI code review your team can trust"
        description="Every finding gets cross-examined by a second model before it ever reaches your PR. No noise, no made-up bugs — just signal, verified."
        path="/"
      />

      {/* Hero — brand-first, one composition */}
      <section className="relative isolate overflow-hidden border-b border-[var(--mk-border)]">
        <div className="mk-mesh absolute inset-0 -z-10" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,184,166,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
          }}
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24">
          <div>
            <p className="font-display text-4xl font-bold tracking-tight text-[var(--mk-ink)] sm:text-5xl lg:text-6xl">
              CodeFerret
            </p>
            <h1 className="mt-4 max-w-lg text-balance text-2xl font-semibold leading-snug tracking-tight text-[var(--mk-ink)] sm:text-3xl">
              AI code review your team{" "}
              <span className="text-[var(--mk-accent)]">can trust</span>
            </h1>
            <p className="mt-4 max-w-md text-pretty text-base leading-7 text-[var(--mk-muted)]">
              Every finding gets cross-examined by a second model before it ever reaches your PR. No noise. No
              made-up bugs. Just signal, verified.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signin"
                className="ferret-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--mk-accent)] px-5 py-3 text-sm font-semibold text-[var(--mk-accent-fg)] shadow-[0_8px_24px_rgba(20,184,166,0.3)] transition hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)]"
              >
                Run first scan <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--mk-border-strong)] bg-[var(--mk-surface)]/60 px-5 py-3 text-sm font-medium text-[var(--mk-ink)] transition hover:border-[var(--mk-accent)]/40 hover:text-[var(--mk-accent)]"
              >
                How it works
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--mk-faint)]">No credit card · Ready in minutes</p>
          </div>

          <div className="relative" style={{ animation: "ferret-fade-up 560ms cubic-bezier(.16,.8,.24,1) 80ms both" }}>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
              <CornerBrackets />
              <div className="flex items-center justify-between border-b border-[var(--mk-border)] bg-[var(--mk-surface)] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-[var(--mk-faint)]/40" />
                    <span className="size-2.5 rounded-full bg-[var(--mk-faint)]/40" />
                    <span className="size-2.5 rounded-full bg-[var(--mk-accent)]/80" />
                  </span>
                  <span className="text-xs font-medium text-[var(--mk-muted)]">acme/api · PR #428</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--mk-success)]/30 bg-[var(--mk-success)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--mk-success)]">
                  <span className="size-1.5 rounded-full bg-[var(--mk-success)]" />
                  Review complete
                </span>
              </div>
              <div className="px-4 py-4 font-mono text-[11px] leading-6 text-[var(--mk-muted)]">
                <div className="mb-2 flex items-center gap-2 border-b border-[var(--mk-border)] pb-2 text-[var(--mk-faint)]">
                  <Icon name="code" /> src/auth/session.ts
                </div>
                <p>
                  <span className="mr-3 text-[var(--mk-faint)]">42</span>const session = await db.sessions.find(id);
                </p>
                <p className="bg-[var(--mk-accent-soft)]">
                  <span className="mr-3 text-[var(--mk-accent)]">43 +</span>
                  <span className="text-[var(--mk-success)]">if</span> (!session) throw new NotFoundError();
                </p>
                <p className="bg-[var(--mk-accent-soft)]">
                  <span className="mr-3 text-[var(--mk-accent)]">44 +</span>
                  <span className="text-[var(--mk-success)]">if</span> (session.userId !== actor.id) {"{"}
                </p>
                <p className="bg-[var(--mk-accent-soft)] pl-10">
                  <span className="text-[var(--mk-success)]">throw new</span> ForbiddenError();
                </p>
                <p className="bg-[var(--mk-accent-soft)]">
                  <span className="mr-3 text-[var(--mk-accent)]">46 +</span>
                  {"}"}
                </p>
              </div>
              <div className="border-t border-[var(--mk-border)] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--mk-ink)]">CodeFerret finding</p>
                  <span className="rounded-md border border-red-400/30 bg-red-400/10 px-2 py-1 text-[10px] font-semibold uppercase text-red-400">
                    Critical
                  </span>
                </div>
                <h2 className="mt-3 text-sm font-semibold text-[var(--mk-ink)]">Session ownership is not validated</h2>
                <p className="mt-1.5 text-xs leading-5 text-[var(--mk-muted)]">
                  Any authenticated user can refresh another user&apos;s session by ID.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--mk-success)]/25 bg-[var(--mk-success)]/5 p-3 text-[11px] font-medium text-[var(--mk-success)]">
                  <Icon name="shield" /> Exact code confirmed · independently upheld
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-[var(--mk-faint)]">Illustrative output — not live data</p>
          </div>
        </div>
      </section>

      <section className="relative border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <GridTexture />
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
            One engine, three surfaces
          </p>
          <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Review where you already work
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {surfaces.map((s) => (
              <Link
                key={s.title}
                to={s.to}
                className="ferret-card group block rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-[var(--mk-accent)]/25 bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={s.icon} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--mk-ink)]">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--mk-muted)]">{s.body}</p>
                <span className="mt-4 inline-block text-sm font-medium text-[var(--mk-accent)] group-hover:underline">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="how-it-works" className="scroll-mt-8 border-b border-[var(--mk-border)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
                Signal over volume
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Find broadly.
                <br />
                Verify ruthlessly.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--mk-muted)]">
                Multiple specialists scan for risk in parallel. Independent verification decides what&apos;s worth
                your attention.
              </p>
              <ol className="mt-8 space-y-4 border-l border-[var(--mk-border)] pl-6">
                {steps.map((step, index) => (
                  <li key={step} className="relative text-sm text-[var(--mk-ink)]">
                    <span className="absolute -left-[1.9rem] flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--mk-accent)]/40 bg-[var(--mk-bg)] font-mono text-[10px] font-semibold text-[var(--mk-accent)]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((feature) => (
                <article
                  key={feature.title}
                  className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg border border-[var(--mk-accent)]/25 bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                    <Icon name={feature.icon} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[var(--mk-ink)]">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--mk-muted)]">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <Reveal className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="relative order-2 overflow-hidden rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.3)] sm:p-6 lg:order-1">
            <CornerBrackets />
            <div className="flex items-center justify-between border-b border-[var(--mk-border)] pb-4">
              <div>
                <p className="text-sm font-semibold text-[var(--mk-ink)]">Team rulebook</p>
                <p className="mt-1 text-xs text-[var(--mk-faint)]">acme / payments-api</p>
              </div>
              <span className="rounded-md border border-[var(--mk-success)]/30 bg-[var(--mk-success)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--mk-success)]">
                3 active
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {rulebookRules.map(([category, rule, evidence]) => (
                <div key={rule} className="rounded-lg border border-[var(--mk-border)] bg-[var(--mk-surface)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-[var(--mk-success)]/30 bg-[var(--mk-success)]/10 text-[var(--mk-success)]">
                      <svg viewBox="0 0 16 16" fill="none" className="size-3" aria-hidden="true">
                        <path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mk-accent)]">
                          {category}
                        </span>
                        <span className="text-[10px] text-[var(--mk-faint)]">{evidence}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--mk-muted)]">{rule}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
              Learns with your team
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Standards that survive beyond one PR
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--mk-muted)]">
              Repeated feedback becomes transparent, repo-aware guidance your team can review and control.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {rulebookFeatures.map(([title, body]) => (
                <div key={title} className="rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-4">
                  <p className="text-sm font-semibold text-[var(--mk-ink)]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--mk-muted)]">{body}</p>
                </div>
              ))}
            </div>
            <Link
              to="/security"
              className="mt-6 inline-flex text-sm font-medium text-[var(--mk-accent)] transition hover:text-[var(--mk-accent-hover)]"
            >
              Read our security approach →
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
                Measured, not marketed
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">The bar we&apos;re building toward</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--mk-muted)]">
                These are engineering targets — not customer results.
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-x-6 gap-y-7 rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-6 sm:grid-cols-4">
              {targets.map((target) => (
                <div key={target.label}>
                  <p className="font-display text-3xl font-bold tabular-nums text-[var(--mk-accent)] sm:text-4xl">
                    {target.value}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[var(--mk-faint)]">{target.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <GridTexture />
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
            Built to be trusted with your code
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--mk-muted)]">
            <span className="inline-flex items-center gap-2">
              <Icon name="lock" /> Source never persisted
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="shield" /> Encrypted at rest, redacted in logs
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="scan" /> Row-level security on every table
            </span>
          </div>
          <Link to="/security" className="text-sm font-medium text-[var(--mk-accent)] hover:underline">
            Full security approach →
          </Link>
        </Reveal>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:py-16">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[var(--mk-accent)]/30 bg-[var(--mk-bg-elevated)] px-6 py-12 text-center shadow-[0_24px_64px_rgba(0,0,0,0.35)] sm:px-12 sm:py-16">
          <div className="mk-mesh absolute inset-0 opacity-60" aria-hidden="true" />
          <Reveal className="relative">
            <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Catch the risky change.
              <br />
              Skip the review theater.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--mk-muted)]">
              Install the GitHub App and run your first verified review in minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/signin"
                className="ferret-shimmer inline-flex items-center justify-center rounded-lg bg-[var(--mk-accent)] px-5 py-3 text-sm font-semibold text-[var(--mk-accent-fg)] shadow-[0_8px_24px_rgba(20,184,166,0.3)] transition hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)]"
              >
                Run first scan
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--mk-border-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--mk-ink)] transition hover:border-[var(--mk-accent)]/40 hover:text-[var(--mk-accent)]"
              >
                View plans
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
