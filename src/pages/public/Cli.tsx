import { Link } from "react-router-dom";
import { GridTexture, Icon, type IconName, Reveal, TerminalPanel } from "../../components/retro";
import { Seo } from "../../components/Seo";

const install = `npm install -g @codeferret/cli
# or
npx @codeferret/cli review`;

const localReview = `# Review the current branch against main
codeferret review --base main

# Review a specific PR by number (uses gh / bb auth)
codeferret review --pr 214

# Output JSON for CI
codeferret review --base main --format json > findings.json`;

const ciSnippet = `# .github/workflows/review.yml
name: AI review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npx @codeferret/cli review --base origin/\${{ github.base_ref }} --format github
        env:
          CODEFERRET_API_KEY: \${{ secrets.CODEFERRET_API_KEY }}`;

const surfaces: Array<{ icon: IconName; title: string; body: string; to?: string }> = [
  { icon: "scan", title: "Web app", body: "Dashboard, rulebook, health, billing", to: "/signin" },
  { icon: "shield", title: "PR bot", body: "Automatic reviews on every push", to: "/onboarding" },
  { icon: "code", title: "CLI", body: "Local + CI before merge" },
];

const commands: Array<{ icon: IconName; cmd: string; blurb: string }> = [
  {
    icon: "code",
    cmd: "codeferret review",
    blurb: "Run the same multi-pass + verification pipeline locally against your working tree or a PR.",
  },
  {
    icon: "scan",
    cmd: "codeferret review --pr <n>",
    blurb: "Fetch the PR diff from GitHub or Bitbucket using your existing CLI auth (gh / bb).",
  },
  {
    icon: "rulebook",
    cmd: "codeferret config init",
    blurb: "Write a starter .review.yml (strictness, budget, ignored paths) into the repo root.",
  },
  {
    icon: "lock",
    cmd: "codeferret auth login",
    blurb: "Link the CLI to your CodeFerret org so rulebook + analytics stay in sync with the web app.",
  },
];

export default function Cli() {
  return (
    <div className="relative overflow-hidden">
      <Seo
        title="CLI — CodeFerret"
        description="Run CodeFerret's same multi-pass, verified review pipeline locally, before you even open a pull request."
        path="/cli"
      />
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">CLI</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">
            Same CodeFerret, in your terminal
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--mk-muted)]">
            Use CodeFerret as a standalone web app, as a bot inside GitHub &amp; Bitbucket PRs, or as a local
            CLI before you open a pull request. One engine, three surfaces — verified findings
            everywhere.
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-3">
          {surfaces.map((s) =>
            s.to ? (
              <Link
                key={s.title}
                to={s.to}
                className="ferret-card group block rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-4 transition hover:border-[var(--mk-accent)]/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={s.icon} />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-[var(--mk-ink)]">{s.title}</h2>
                <p className="mt-1 text-xs text-[var(--mk-faint)]">{s.body}</p>
                <span className="mt-2 inline-block text-xs font-medium text-[var(--mk-accent)] group-hover:underline">Open →</span>
              </Link>
            ) : (
              <div key={s.title} className="rounded-xl border border-[var(--mk-accent)]/30 bg-[var(--mk-bg-elevated)] p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={s.icon} />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-[var(--mk-ink)]">{s.title}</h2>
                <p className="mt-1 text-xs text-[var(--mk-faint)]">{s.body}</p>
                <span className="mt-2 inline-block text-xs font-medium text-[var(--mk-faint)]">You are here</span>
              </div>
            ),
          )}
        </Reveal>

        <Reveal className="mt-12">
          <h2 className="text-sm font-semibold text-[var(--mk-ink)]">Install</h2>
          <div className="mt-3">
            <TerminalPanel label="terminal">
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--mk-success)]">{install}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-sm font-semibold text-[var(--mk-ink)]">Local review</h2>
          <p className="mt-1 text-xs text-[var(--mk-faint)]">
            Runs the logic / security / contracts passes + verification. Posts nothing — prints
            findings to your terminal (or JSON for scripts).
          </p>
          <div className="mt-3">
            <TerminalPanel label="terminal">
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--mk-success)]">{localReview}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-sm font-semibold text-[var(--mk-ink)]">Commands</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {commands.map((c) => (
              <li key={c.cmd} className="ferret-card flex gap-3 rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] px-4 py-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={c.icon} />
                </div>
                <div className="min-w-0">
                  <code className="font-mono text-sm text-[var(--mk-accent)]">{c.cmd}</code>
                  <p className="mt-1 text-xs text-[var(--mk-muted)]">{c.blurb}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-sm font-semibold text-[var(--mk-ink)]">GitHub Actions</h2>
          <p className="mt-1 text-xs text-[var(--mk-faint)]">
            Prefer the GitHub App for PR comments. Use the CLI in CI when you want a gate before the
            bot runs, or in Bitbucket Pipelines the same way.
          </p>
          <div className="mt-3">
            <TerminalPanel label=".github/workflows/review.yml">
              <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--mk-success)]">{ciSnippet}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <p className="mt-10 border-t border-[var(--mk-border)] pt-6 text-sm text-[var(--mk-faint)]">
          CLI package ships with Phase A delivery. Until then, install the{" "}
          <Link to="/onboarding" className="text-[var(--mk-accent)] hover:underline">
            GitHub App
          </Link>{" "}
          for in-PR reviews, or explore the{" "}
          <Link to="/signin" className="text-[var(--mk-accent)] hover:underline">
            web dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
