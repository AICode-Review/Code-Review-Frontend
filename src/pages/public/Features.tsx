import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, Reveal, type IconName } from "../../components/retro";
import { Seo } from "../../components/Seo";

const pipeline: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "scan",
    title: "Specialist passes, not one giant prompt",
    body: "Logic, security, and contracts run on every review. Concurrency, error handling, tests, performance, and your team's own style rules run alongside them whenever the review budget allows — each pass focused on one kind of risk instead of one model trying to hold everything at once.",
  },
  {
    icon: "shield",
    title: "Every finding is cross-examined",
    body: "A candidate finding is handed to a second, independent model whose only job is to try to refute it against the actual cited code. Refuted or uncertain claims never reach your pull request — only what survives gets posted.",
  },
  {
    icon: "code",
    title: "Some bugs get reproduced, not just argued about",
    body: "For findings that claim a concrete runtime failure (Node, Python, JVM), CodeFerret attempts to reproduce the defect in an isolated, no-network sandbox before it ever counts as verified — a real repro beats a confident-sounding argument.",
  },
];

const delivery: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "budget",
    title: "A hard limit on review noise",
    body: "Only verified critical and major issues become inline PR comments, capped by a configurable comment budget. Everything else collapses into a single digest — your PR stays readable instead of getting buried in AI chatter.",
  },
  {
    icon: "lock",
    title: "One summary comment, kept up to date",
    body: "A single summary comment is created once and updated in place on every re-run, with risk level, every posted finding, and a link to the full review — not a new comment thread every time.",
  },
];

const rulebook: Array<[string, string]> = [
  ["Plain-language rules", "Add team standards without prompt engineering — write the rule the way you'd say it out loud."],
  ["Evidence before activation", "A single dismissal starts a rule as a suggestion; repeated evidence is what promotes it to active and enforced."],
  ["Fully reviewable", "Every learned rule stays visible, editable, and removable — nothing enforces itself silently."],
  ["Repo-aware", "Rules can apply org-wide or to a single repository, matching how teams' standards actually differ project to project."],
];

const everywhere: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "shield",
    title: "GitHub and Bitbucket",
    body: "Installs as a PR bot on either platform and reviews every push automatically, posting only what survived verification.",
  },
  {
    icon: "scan",
    title: "One dashboard",
    body: "PR scores, run history, the rulebook, and repo health — all org-scoped, live, and searchable in one place.",
  },
];

const trust: Array<[IconName, string]> = [
  ["lock", "Source code is never retained beyond the review itself"],
  ["shield", "Tokens and credentials are encrypted at rest"],
  ["scan", "Row-level security scopes every table to your org, by default"],
];

export default function Features() {
  return (
    <main className="overflow-hidden">
      <Seo
        title="Features — CodeFerret"
        description="Specialist review passes, cross-model verification, execution-sandbox repro, a learning rulebook, and budgeted delivery — how CodeFerret turns AI review into signal instead of noise."
        path="/features"
      />

      <section className="relative border-b border-[var(--mk-border)]">
        <GridTexture />
        <Reveal className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">How it works</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-4xl">
            Built to be trusted with a real pull request
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--mk-muted)]">
            Every capability below exists for one reason: so what lands as a comment on your PR is worth reading.
          </p>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Find broadly, verify ruthlessly</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {pipeline.map((f) => (
              <article key={f.title} className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={f.icon} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--mk-ink)]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--mk-muted)]">{f.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Signal over volume</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {delivery.map((f) => (
              <article key={f.title} className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={f.icon} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--mk-ink)]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--mk-muted)]">{f.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Learns with your team</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--mk-ink)]">The rulebook</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {rulebook.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-4">
                <p className="text-sm font-semibold text-[var(--mk-ink)]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--mk-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)]">
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Every language, genuinely</p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--mk-muted)]">
            Nothing is filtered out of review except actual binaries. Kotlin, Swift, React Native, Flutter — every
            source file gets full LLM-level analysis, not a Tier-1 allow-list. A repo-aware semantic index feeds
            relevant symbols and context into every pass, so review quality doesn&apos;t depend on which language you
            picked.
          </p>
        </Reveal>
      </section>

      <section className="relative border-b border-[var(--mk-border)] bg-[var(--mk-bg-elevated)]">
        <GridTexture />
        <Reveal className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">One engine, everywhere you work</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {everywhere.map((f) => (
              <div key={f.title} className="ferret-card relative rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg)] p-5">
                <CornerBrackets />
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={f.icon} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--mk-ink)]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--mk-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--mk-border)]">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Built to be trusted with your code</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--mk-muted)]">
            {trust.map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon name={icon} /> {label}
              </span>
            ))}
          </div>
          <Link to="/security" className="text-sm font-medium text-[var(--mk-accent)] hover:underline">
            Full security approach →
          </Link>
        </Reveal>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-16">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-3xl">
            See it on your own pull request
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signin"
              className="ferret-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--mk-accent)] px-5 py-3 text-sm font-semibold text-[var(--mk-accent-fg)] shadow-[0_8px_24px_rgba(20,184,166,0.3)] transition hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)]"
            >
              Run first scan
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--mk-border-strong)] bg-[var(--mk-surface)]/60 px-5 py-3 text-sm font-medium text-[var(--mk-ink)] transition hover:border-[var(--mk-accent)]/40 hover:text-[var(--mk-accent)]"
            >
              View plans
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
