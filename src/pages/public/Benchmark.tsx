import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";
import { Seo } from "../../components/Seo";

const targets = [
  { value: "> 70%", label: "Verified catch rate" },
  { value: "< 2", label: "False pos. / run" },
  { value: "< 5%", label: "Noise dismissal" },
  { value: "< 5m", label: "Median latency" },
];

const methodology: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "code",
    title: "A case is a diff plus a known bug",
    body: "Each benchmark case is a small real change with a specific, pre-identified defect at a known file and line range — the ground truth the reviewer is being tested against.",
  },
  {
    icon: "scan",
    title: '"Caught" means the location matches, not just the category',
    body: "A case counts as caught only when a reported finding's file and line range overlap the known bug's location. A vague or misplaced finding doesn't count, even if it happens to name the right category.",
  },
  {
    icon: "shield",
    title: "Every unmatched finding is a false positive — for that case",
    body: "Anything reported that doesn't overlap the case's known bug counts as noise, whether or not the case was otherwise caught. A run that finds the real bug plus three unrelated nitpicks still scores 3 false positives.",
  },
  {
    icon: "budget",
    title: "Catch rate and false-positive rate, not a single blended score",
    body: "Catch rate = cases caught ÷ total cases. False positives per run = total false positives ÷ total cases. Reported separately, since a reviewer that finds everything by flagging everything isn't actually better.",
  },
];

export default function Benchmark() {
  return (
    <div className="relative overflow-hidden">
      <Seo
        title="Benchmark methodology — CodeFerret"
        description="How CodeFerret measures catch rate and false positives, and the engineering targets we publish instead of unverified customer claims."
        path="/benchmark"
      />
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Methodology</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">
            Benchmark methodology
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--mk-muted)]">
            How we plan to measure whether CodeFerret actually catches real bugs without drowning
            you in noise — published before the results are, so the methodology can be judged on
            its own.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-6 rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-6 sm:grid-cols-4">
            <CornerBrackets />
            {targets.map((t) => (
              <div key={t.label}>
                <p className="font-display text-2xl font-bold tabular-nums text-[var(--mk-accent)] sm:text-3xl">
                  {t.value}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--mk-faint)]">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--mk-faint)]">
            Engineering targets, not customer results. This page will carry real measured numbers
            once a full benchmark pass has been run and published — see the status below for
            exactly where that stands today.
          </p>
        </Reveal>

        <Reveal className="mt-8 grid gap-4 sm:grid-cols-2">
          {methodology.map((item) => (
            <div key={item.title} className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                <Icon name={item.icon} />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-[var(--mk-ink)]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="relative mt-8 rounded-2xl border border-[var(--mk-accent)]/30 bg-[var(--mk-bg-elevated)] p-5">
          <CornerBrackets />
          <h2 className="text-sm font-semibold text-[var(--mk-accent)]">Current status</h2>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--mk-muted)]">
            <li>
              <span className="font-medium text-[var(--mk-ink)]">Scoring harness:</span> built and unit-tested — computes catch rate and
              false-positive rate exactly as described above, no API keys required to verify the logic itself.
            </li>
            <li>
              <span className="font-medium text-[var(--mk-ink)]">Dataset:</span> 8 seed cases across 6 categories (logic, security,
              concurrency, errors, contracts, tests) — small, hand-authored, and clearly labeled as synthetic rather
              than mined from real pull requests.
            </li>
            <li>
              <span className="font-medium text-[var(--mk-ink)]">Live run:</span> not yet performed. Running the full pipeline against
              even a small dataset costs real Anthropic/OpenAI API spend, so that's a deliberate step to take when
              there's a larger, real-PR-backed dataset to run it against — not something to fake a result for in
              the meantime.
            </li>
          </ul>
        </Reveal>

        <p className="mt-8 border-t border-[var(--mk-border)] pt-6 text-sm text-[var(--mk-faint)]">
          Questions about the methodology, or want to contribute real mined cases?{" "}
          <Link to="/security" className="text-[var(--mk-accent)] hover:underline">
            See our security approach
          </Link>{" "}
          or reach out at benchmarks@codeferret.dev.
        </p>
      </div>
    </div>
  );
}
