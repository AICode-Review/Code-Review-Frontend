import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, Tilt3D } from "../../components/retro";
import { Seo } from "../../components/Seo";

const pillars = [
  {
    n: "01",
    title: "Hunt broadly",
    body: "Specialist passes own one risk each — logic, security, contracts, concurrency, errors, tests.",
  },
  {
    n: "02",
    title: "Doubt every claim",
    body: "An independent model tries to refute each finding against the real code you wrote.",
  },
  {
    n: "03",
    title: "Post only survivors",
    body: "Uncertain and refuted stay silent. Only verified critical and major issues reach the PR.",
  },
];

const rules = [
  { cat: "Security", text: "Require an authorization check before account-scoped writes.", ev: "12 signals" },
  { cat: "Errors", text: "Never swallow payment provider errors; attach the request ID.", ev: "7 signals" },
  { cat: "Tests", text: "Fee calculation changes need boundary-value tests.", ev: "manual" },
];

const targets = [
  { v: ">70%", l: "Catch rate" },
  { v: "<2", l: "False pos / run" },
  { v: "<5%", l: "Noise dismiss" },
  { v: "<5m", l: "Median latency" },
];

const rulebookPoints = [
  "Write rules the way you say them out loud",
  "Evidence before a learned rule activates",
  "Org-wide or per-repo scope",
];

const TERM_COMMAND = "codeferret review --pr 428";

const TERM_OUTPUT: Array<{
  text: string;
  tone: "dim" | "body" | "warn" | "ok" | "okStrong";
  prefix?: string;
  spaced?: boolean;
}> = [
  { text: "cloning acme/payments-api (shallow)…", tone: "dim", prefix: "›" },
  { text: "diff fix/session-ownership → main · 4 files, +86 −12", tone: "dim", prefix: "›" },
  { text: "running passes: logic · security · contracts · errors", tone: "dim", prefix: "›" },
  { text: "security  src/auth/session.ts:44", tone: "warn", prefix: "⚠", spaced: true },
  { text: "Session ownership is not validated — any user can refresh another user's session by ID.", tone: "body" },
  { text: "cross-examining with an independent model…", tone: "dim", prefix: "›", spaced: true },
  { text: "upheld — reproduced in an isolated sandbox", tone: "ok", prefix: "✓" },
  { text: "1 critical · 0 false positives · verified in 4.2s", tone: "dim", spaced: true },
  { text: "posted 1 comment · digest holds 6 more", tone: "okStrong", prefix: "✔" },
];

const TERM_TONE_CLASS: Record<(typeof TERM_OUTPUT)[number]["tone"], string> = {
  dim: "text-[#94a3b8]",
  body: "text-[#e2e8f0]",
  warn: "text-[#f87171] font-semibold",
  ok: "text-[#34d399] font-semibold",
  okStrong: "text-[#6ee7b7] font-bold",
};

/**
 * A single state machine (typed chars + shown-line count) drives everything —
 * the "running"/"done" label is derived from that same state, not animated
 * independently, so it can never contradict what's actually on screen (the
 * failure mode the previous CSS-only version had: the status badge looped
 * back to "queued" forever while the finished review stayed fully visible).
 */
function TerminalDemo() {
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(TERM_COMMAND.length);
      setShown(TERM_OUTPUT.length);
      return;
    }

    setTyped(0);
    setShown(0);

    let cancelled = false;
    const timers: number[] = [];
    const after = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms));
    };

    const TYPE_MS = 34;
    const typingEnds = 150 + TERM_COMMAND.length * TYPE_MS;
    for (let i = 1; i <= TERM_COMMAND.length; i++) {
      after(() => setTyped(i), 150 + i * TYPE_MS);
    }

    const LINE_MS = 420;
    TERM_OUTPUT.forEach((_, i) => {
      after(() => setShown(i + 1), typingEnds + 500 + i * LINE_MS);
    });
    const outputEnds = typingEnds + 500 + TERM_OUTPUT.length * LINE_MS;

    after(() => setCycle((c) => c + 1), outputEnds + 2600);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [cycle]);

  const isDone = shown >= TERM_OUTPUT.length;

  return (
    <div className="landing-product relative w-full">
      <div className="landing-product-scene landing-product-scene-compact">
        <Tilt3D className="landing-product-tilt" maxTilt={3} scale={1}>
          <div className="term-shell">
            <div className="term-titlebar">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-[#ff6b6b]/90" />
                <span className="size-2.5 rounded-full bg-[#ffc14a]/90" />
                <span className="size-2.5 rounded-full bg-[#3ccf7a]/90" />
              </span>
              <span className="truncate font-mono text-[11px] font-medium text-[#94a3b8]">
                codeferret — acme/payments-api
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wide" aria-live="polite">
                <span
                  className={`size-1.5 rounded-full ${isDone ? "bg-[#34d399]" : "term-live-dot bg-[#fbbf24]"}`}
                  aria-hidden="true"
                />
                <span className={isDone ? "text-[#34d399]" : "text-[#fbbf24]"}>
                  {isDone ? "done" : "running"}
                </span>
              </span>
            </div>

            <div className="term-body min-h-[19rem] font-mono text-[12.5px] leading-[1.7] sm:text-[13px]">
              <div className="term-line flex flex-wrap items-baseline gap-x-2">
                <span className="text-[#8ea0f2]">$</span>
                <span className="text-[#e2e8f0]">{TERM_COMMAND.slice(0, typed)}</span>
                {typed < TERM_COMMAND.length && <span className="term-cursor" aria-hidden="true" />}
              </div>

              {TERM_OUTPUT.slice(0, shown).map((line, i) => (
                <div
                  key={i}
                  className={`term-line term-line-in ${line.spaced ? "mt-2.5" : "mt-0.5"} ${TERM_TONE_CLASS[line.tone]}`}
                >
                  {line.prefix ? `${line.prefix} ` : ""}
                  {line.text}
                </div>
              ))}

              {isDone && (
                <div className="term-line term-line-in mt-2.5 flex items-baseline gap-2">
                  <span className="text-[#8ea0f2]">$</span>
                  <span className="term-cursor" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
          <div className="landing-product-shadow" aria-hidden="true" />
        </Tilt3D>
      </div>
    </div>
  );
}

function RulebookPanel() {
  return (
    <Tilt3D maxTilt={3} scale={1}>
      <div className="landing-rulebook landing-rulebook-3d overflow-hidden rounded-2xl border border-[var(--mk-border)] bg-white">
        <div className="relative flex items-center justify-between border-b border-[var(--mk-border)] bg-white px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-bold text-[var(--mk-ink)]">acme / payments-api</p>
            <p className="mt-0.5 font-mono text-[11px] font-semibold text-[var(--mk-accent)]">
              rulebook · 3 active
            </p>
          </div>
          <span className="landing-chip rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            Learning
          </span>
        </div>
        <div className="relative divide-y divide-[var(--mk-border)] bg-white">
          {rules.map((r) => (
            <div key={r.text} className="landing-rule-row px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-md bg-[#dbe3fc] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#1e3a8a]">
                  {r.cat}
                </span>
                <span className="font-mono text-[10px] font-semibold text-[var(--mk-faint)]">{r.ev}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[var(--mk-body)]">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Tilt3D>
  );
}

export default function Landing() {
  return (
    <main className="overflow-x-hidden">
      <Seo
        title="CodeFerret — AI code review your team can trust"
        description="Every finding gets cross-examined by a second model before it ever reaches your PR. No noise, no made-up bugs — just signal, verified."
        path="/"
      />

      {/* ── Hero: copy | product side-by-side ── */}
      <section className="landing-hero relative isolate border-b border-[var(--mk-border)]">
        <div className="landing-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="landing-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="landing-hero-beams pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="landing-hero-dots pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="landing-orb landing-orb-a" aria-hidden="true" />
        <div className="landing-orb landing-orb-b" aria-hidden="true" />
        <div className="landing-orb landing-orb-c" aria-hidden="true" />
        <div className="landing-hero-frame landing-hero-frame-a hidden sm:block" aria-hidden="true" />
        <div className="landing-hero-frame landing-hero-frame-b hidden lg:block" aria-hidden="true" />

        <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.95fr_1.15fr] lg:gap-10 lg:py-14">
          <div className="landing-hero-copy lg:pr-2">
            <p className="landing-brand font-display text-[clamp(2.5rem,7vw,4.25rem)] font-bold leading-[0.92] tracking-tight">
              CodeFerret
            </p>
            <h1 className="mk-text-headline mt-4 max-w-md text-balance text-lg font-semibold leading-snug tracking-tight sm:text-xl lg:text-[1.35rem]">
              AI code review with a skeptic built in —{" "}
              <span className="mk-text-accent">only verified findings post</span>
            </h1>
            <p className="mk-text-lead mt-3 max-w-sm text-pretty text-sm font-medium leading-6 sm:text-base sm:leading-7">
              Cross-examined by a second model against your real code.{" "}
              <span className="text-[var(--mk-accent)]">No noise. No made-up bugs.</span>
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                to="/signin"
                className="mk-btn-primary mk-btn-3d inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--mk-accent)] px-6 py-3 text-sm font-semibold text-white"
              >
                Start free <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#how"
                className="mk-btn-secondary mk-btn-3d-soft inline-flex items-center justify-center rounded-xl border border-[var(--mk-border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--mk-ink)]"
              >
                How it works
              </a>
            </div>
            <p className="mk-text-meta mt-3 text-xs font-semibold">
              GitHub & Bitbucket ·{" "}
              <span className="text-[var(--mk-accent)]">Free forever on public repos</span>
            </p>

            {/* Stats tucked under copy — no full-width section */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[var(--mk-border)] pt-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {targets.map((t) => (
                <div key={t.l} className="landing-stat-cell rounded-lg px-1 py-1">
                  <p className="mk-text-stat landing-stat-value font-display text-xl font-bold tracking-tight sm:text-2xl">
                    {t.v}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mk-ink-soft)]">
                    {t.l}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-medium text-[var(--mk-faint)]">
              Engineering targets —{" "}
              <Link to="/benchmark" className="font-bold text-[var(--mk-accent-hot)] hover:underline">
                methodology
              </Link>
            </p>
          </div>

          <div className="landing-hero-stage min-w-0">
            <TerminalDemo />
          </div>
        </div>
      </section>

      {/* ── Pipeline: zigzag rows ── */}
      <section id="how" className="landing-section-pipeline scroll-mt-8 border-b border-[var(--mk-border)]">
        <Reveal className="relative z-[1] mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="grid items-end gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div>
              <p className="mk-text-eyebrow font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                The pipeline
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-3xl">
                Find broadly.{" "}
                <span className="text-[var(--mk-accent-hot)]">Verify ruthlessly.</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-[var(--mk-body)]">
                Most AI review ships volume.{" "}
                <span className="font-semibold text-[var(--mk-accent)]">CodeFerret ships survivors.</span>
              </p>
            </div>
            <p className="hidden text-right text-xs font-medium text-[var(--mk-faint)] lg:block">
              Three steps. One mission: signal only.
            </p>
          </div>

          <ol className="landing-pipeline-scene mt-8 space-y-3">
            {pillars.map((p, i) => {
              const flip = i % 2 === 1;
              return (
                <li
                  key={p.n}
                  className={`landing-pipeline-step landing-zigzag group grid items-center gap-4 rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg)]/60 p-4 sm:gap-6 sm:p-5 lg:grid-cols-2 ${
                    flip ? "landing-zigzag-flip" : ""
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#eef1ff] font-mono text-xs font-bold text-[#1e3a8a]">
                        {p.n}
                      </span>
                      <h3 className="text-base font-semibold tracking-tight text-[var(--mk-ink)] sm:text-lg">
                        {p.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-6 text-[var(--mk-muted)] sm:pl-12">
                      {p.body}
                    </p>
                  </div>
                  <div
                    className={`landing-zigzag-visual relative overflow-hidden rounded-xl border border-[var(--mk-border)] bg-white px-4 py-5 ${
                      flip ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="landing-card-scan" aria-hidden="true" />
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mk-accent)]">
                      step {p.n}
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[var(--mk-ink)]/10 sm:text-4xl">
                      {p.n}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--mk-surface)]">
                      <div
                        className="landing-zigzag-bar h-full rounded-full bg-[var(--mk-accent)]"
                        style={{ width: `${(i + 1) * 33}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </section>

      {/* ── Rulebook zigzag (panel left on flip, copy right) ── */}
      <section className="landing-section-rulebook border-b border-[var(--mk-border)]">
        <Reveal className="relative z-[1] mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:py-14">
          <div className="order-2 lg:order-1">
            <RulebookPanel />
          </div>
          <div className="order-1 lg:order-2">
            <p className="mk-text-eyebrow font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
              Team rulebook
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-3xl">
              Your standards,{" "}
              <span className="text-[var(--mk-accent)]">enforced after every push</span>
            </h2>
            <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[var(--mk-body)]">
              Feedback becomes plain-language rules. Approve, pause, or remove them anytime — nothing
              black-boxed in a prompt.
            </p>
            <ul className="mt-5 space-y-2.5">
              {rulebookPoints.map((item) => (
                <li
                  key={item}
                  className="landing-list-item flex items-start gap-3 text-sm font-semibold text-[var(--mk-ink-soft)]"
                >
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3956dd] text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/features"
              className="mt-6 inline-flex text-sm font-bold text-[var(--mk-accent-hot)] transition hover:text-[var(--mk-accent)]"
            >
              Explore the full product →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── CTA side-by-side ── */}
      <section className="landing-section-cta relative overflow-hidden">
        <Reveal className="relative z-[1] mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="landing-cta-band landing-cta-3d grid items-center gap-6 overflow-hidden rounded-2xl border border-[var(--mk-border)] bg-white/80 px-5 py-8 shadow-[0_20px_50px_rgba(57,86,221,0.12)] sm:px-8 sm:py-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <div>
              <p className="mk-text-eyebrow font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                Trusted by design
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-3xl">
                Catch the risky change.{" "}
                <span className="text-[var(--mk-accent-hot)]">Skip the review theater.</span>
              </p>
              <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-[var(--mk-body)]">
                Source is ephemeral. Tokens encrypted. Org-scoped RLS on every table.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row lg:justify-end">
              <Link
                to="/signin"
                className="mk-btn-primary mk-btn-3d inline-flex items-center justify-center rounded-xl bg-[var(--mk-accent)] px-6 py-3 text-sm font-semibold text-white"
              >
                Start free
              </Link>
              <Link
                to="/security"
                className="mk-btn-secondary mk-btn-3d-soft inline-flex items-center justify-center rounded-xl border border-[var(--mk-border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--mk-ink)]"
              >
                Security approach
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
