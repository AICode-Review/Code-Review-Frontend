import { Link } from "react-router-dom";
import { GridTexture, Icon, type IconName, Reveal, TerminalPanel } from "../../components/retro";

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
    <div className="relative">
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-widest text-[#ffb300]">// cli</p>
          <h1
            className="mt-3 text-3xl font-bold uppercase tracking-tight text-[#f2ead9]"
            style={{ textShadow: "0 0 16px rgba(255,179,0,.2)" }}
          >
            Same CodeFerret, in your terminal
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a39a86]">
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
                className="ferret-card group block border border-[#3a2f1f] bg-[#0a0a08] p-4 shadow-[3px_3px_0_0_#1c1810]"
              >
                <div className="flex size-8 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={s.icon} />
                </div>
                <h2 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{s.title}</h2>
                <p className="mt-1 text-xs text-[#6b6252]">{s.body}</p>
                <span className="mt-2 inline-block text-xs font-medium text-[#ffb300] group-hover:underline">Open →</span>
              </Link>
            ) : (
              <div key={s.title} className="border border-[#ffb300]/40 bg-[#0a0a08] p-4 shadow-[3px_3px_0_0_#1c1810]">
                <div className="flex size-8 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={s.icon} />
                </div>
                <h2 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{s.title}</h2>
                <p className="mt-1 text-xs text-[#6b6252]">{s.body}</p>
                <span className="mt-2 inline-block text-xs font-medium text-[#6b6252]">You are here</span>
              </div>
            ),
          )}
        </Reveal>

        <Reveal className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">$ install</h2>
          <div className="mt-3">
            <TerminalPanel label="terminal">
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#4ade80]">{install}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">$ local review</h2>
          <p className="mt-1 text-xs text-[#6b6252]">
            // runs the logic / security / contracts passes + verification. posts nothing — prints
            findings to your terminal (or json for scripts).
          </p>
          <div className="mt-3">
            <TerminalPanel label="terminal">
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#4ade80]">{localReview}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">// commands</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {commands.map((c) => (
              <li key={c.cmd} className="ferret-card flex gap-3 border border-[#3a2f1f] bg-[#0a0a08] px-4 py-3">
                <div className="flex size-7 shrink-0 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={c.icon} />
                </div>
                <div className="min-w-0">
                  <code className="font-mono text-sm text-[#ffb300]">{c.cmd}</code>
                  <p className="mt-1 text-xs text-[#a39a86]">{c.blurb}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">// github actions</h2>
          <p className="mt-1 text-xs text-[#6b6252]">
            Prefer the GitHub App for PR comments. Use the CLI in CI when you want a gate before the
            bot runs, or in Bitbucket Pipelines the same way.
          </p>
          <div className="mt-3">
            <TerminalPanel label=".github/workflows/review.yml">
              <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[#4ade80]">{ciSnippet}</pre>
            </TerminalPanel>
          </div>
        </Reveal>

        <p className="mt-10 border-t border-[#3a2f1f] pt-6 text-xs text-[#6b6252]">
          // cli package ships with phase A delivery. until then, install the{" "}
          <Link to="/onboarding" className="text-[#ffb300] hover:underline">
            GitHub App
          </Link>{" "}
          for in-PR reviews, or explore the{" "}
          <Link to="/signin" className="text-[#ffb300] hover:underline">
            web dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
