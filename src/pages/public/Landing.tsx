import { Link } from "react-router-dom";
import { CornerBrackets, Cursor, GridTexture, Icon, type IconName, Reveal, Scanlines } from "../../components/retro";

const capabilities: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "shield",
    title: "EVERY FINDING EARNS ITS PLACE",
    body: "We check the cited code, then hand the claim to a different model for cross-examination. Refuted or uncertain claims never reach your PR.",
  },
  {
    icon: "scan",
    title: "SPECIALISTS, NOT ONE GIANT PROMPT",
    body: "Focused passes inspect logic, security, contracts, concurrency, error handling, tests, and your team's own rules — independently.",
  },
  {
    icon: "budget",
    title: "A HARD LIMIT ON REVIEW NOISE",
    body: "Only verified critical and major issues become line comments. Everything else collapses into one digest.",
  },
  {
    icon: "rulebook",
    title: "REVIEWS THAT LEARN YOUR STANDARDS",
    body: "Feedback becomes durable, repo-aware guidance. Add, approve, pause, or remove rules in plain language.",
  },
  {
    icon: "code",
    title: "EVERY LANGUAGE, GENUINELY",
    body: "Nothing is filtered from review except actual binaries. Kotlin, Swift, React Native, Flutter — full LLM-level analysis, not a Tier-1 allow-list.",
  },
  {
    icon: "lock",
    title: "A SCORE FOR EVERY PR",
    body: "Every pull request gets a 0-100 score and its own page — track review health across a repo, not just comment-by-comment.",
  },
];

const surfaces: Array<{ icon: IconName; title: string; body: string; to: string }> = [
  {
    icon: "shield",
    title: "PR BOT",
    body: "Installs on GitHub or Bitbucket. Reviews every push automatically and posts only what survived verification.",
    to: "/onboarding",
  },
  {
    icon: "code",
    title: "CLI",
    body: "Run the same multi-pass, verified pipeline locally — before you even open a pull request.",
    to: "/cli",
  },
  {
    icon: "scan",
    title: "DASHBOARD",
    body: "PR scores, run history, rulebook, and repo health, all org-scoped and live.",
    to: "/signin",
  },
];

const targets = [
  { value: "> 70%", label: "VERIFIED CATCH RATE" },
  { value: "< 2", label: "FALSE POS. / RUN" },
  { value: "< 5%", label: "NOISE DISMISSAL" },
  { value: "< 5m", label: "MEDIAN LATENCY" },
];

const steps = ["READ THE REAL DIFF AND FILES", "RUN FOCUSED SPECIALIST PASSES", "CROSS-EXAMINE EVERY CANDIDATE", "SHIP ONLY VERIFIED SIGNAL"];

const rulebookRules: Array<[string, string, string]> = [
  ["SECURITY", "Require an authorization check before account-scoped writes.", "12 signals"],
  ["ERRORS", "Never swallow payment provider errors; attach the request ID.", "7 signals"],
  ["TESTS", "Changes to fee calculations require boundary-value tests.", "manual"],
];

const rulebookFeatures: Array<[string, string]> = [
  ["PLAIN-LANGUAGE RULES", "Add team standards without prompt engineering."],
  ["EVIDENCE BEFORE ACTIVATION", "Learned rules stay reviewable and reversible."],
  ["PRIVATE BY DESIGN", "Ephemeral source snapshots and encrypted tokens."],
  ["ALL-LANGUAGE REVIEW", "Every source language receives LLM-level analysis."],
];

export default function Landing() {
  return (
    <main className="overflow-hidden bg-[#0a0a08] font-mono text-[#c9c2b3] selection:bg-[#ffb300] selection:text-black">
      <section className="relative isolate border-b border-[#3a2f1f]">
        <Scanlines />
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,179,0,.10), transparent 34rem), linear-gradient(rgba(255,179,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,0,.05) 1px, transparent 1px)",
            backgroundSize: "auto, 40px 40px, 40px 40px",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 88%)",
          }}
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-none border border-[#ffb300]/40 bg-[#14170f] px-3 py-1.5 text-xs font-medium text-[#ffb300]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ffb300] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-[#ffb300]" />
              </span>
              SYSTEM ONLINE // LIVE ON GITHUB PULL REQUESTS
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#6b6252]">
              // ai agents 10x&apos;d your commit volume. review capacity didn&apos;t follow.
            </p>
            <h1
              className="mt-6 text-balance text-4xl font-bold uppercase leading-[1.08] tracking-[-0.01em] text-[#f2ead9] sm:text-5xl"
              style={{ textShadow: "0 0 18px rgba(255,179,0,.22)" }}
            >
              AI code review
              <br />
              your team{" "}
              <span className="text-[#ffb300]">can trust</span>
              <Cursor />
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-sm leading-7 text-[#a39a86]">
              Every finding gets cross-examined by a second model before it ever reaches your PR. No noise. No
              made-up bugs. Just signal, verified.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signin"
                className="ferret-shimmer group inline-flex items-center justify-center gap-2 rounded-none border-2 border-[#ffb300] bg-[#ffb300] px-5 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[4px_4px_0_0_#3a2f1f] transition hover:-translate-y-0.5 hover:bg-[#ffcf66]"
              >
                Run first scan <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-none border-2 border-[#3a2f1f] bg-[#14170f] px-5 py-3 text-sm font-medium text-[#c9c2b3] transition hover:border-[#ffb300]/50 hover:text-[#ffb300]"
              >
                $ ./how-it-works
              </a>
            </div>
            <p className="mt-3 text-xs text-[#6b6252]">// no credit card // ready in minutes</p>
          </div>

          <div className="relative" style={{ animation: "ferret-fade-up 560ms cubic-bezier(.16,.8,.24,1) 80ms both" }}>
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[#ffb300]/5 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-none border-2 border-[#3a2f1f] bg-[#0d0f0a] shadow-[8px_8px_0_0_#3a2f1f]">
              <CornerBrackets />
              <div className="flex items-center justify-between border-b border-[#3a2f1f] bg-[#14170f] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-[#c9c2b3]/25" />
                    <span className="size-2.5 rounded-full bg-[#c9c2b3]/25" />
                    <span className="size-2.5 rounded-full bg-[#ffb300]/70" />
                  </span>
                  <span className="text-xs font-medium text-[#a39a86]">acme/api :: PR#428</span>
                </div>
                <span className="relative flex items-center gap-1.5 rounded-none border border-[#4ade80]/40 bg-[#4ade80]/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-[#4ade80]">
                  <span className="relative flex size-1.5" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80] opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-[#4ade80]" />
                  </span>
                  Review complete
                </span>
              </div>
              <div className="px-4 py-4 font-mono text-[11px] leading-6 text-[#a39a86]">
                <div className="mb-2 flex items-center gap-2 border-b border-[#3a2f1f] pb-2 text-[#6b6252]">
                  <Icon name="code" /> src/auth/session.ts
                </div>
                <p><span className="mr-3 text-[#6b6252]">42</span>const session = await db.sessions.find(id);</p>
                <p className="bg-[#ffb300]/10"><span className="mr-3 text-[#ffb300]">43 +</span><span className="text-[#4ade80]">if</span> (!session) throw new NotFoundError();</p>
                <p className="bg-[#ffb300]/10"><span className="mr-3 text-[#ffb300]">44 +</span><span className="text-[#4ade80]">if</span> (session.userId !== actor.id) {"{"}</p>
                <p className="bg-[#ffb300]/10 pl-10"><span className="text-[#4ade80]">throw new</span> ForbiddenError();</p>
                <p className="bg-[#ffb300]/10"><span className="mr-3 text-[#ffb300]">46 +</span>{"}"}</p>
              </div>
              <div
                className="border-t border-[#3a2f1f] p-5"
                style={{ animation: "ferret-fade-up 500ms cubic-bezier(.16,.8,.24,1) 340ms both" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-[#f2ead9]">CodeFerret finding</p>
                  <span className="rounded-none border border-red-400/40 bg-red-400/10 px-2 py-1 text-[10px] font-semibold uppercase text-red-400">Critical</span>
                </div>
                <h2 className="mt-3 text-sm font-semibold text-[#f2ead9]">Session ownership is not validated</h2>
                <p className="mt-1.5 text-xs leading-5 text-[#a39a86]">
                  Any authenticated user can refresh another user&apos;s session by ID.
                </p>
                <div className="mt-3 flex items-center gap-2 border border-[#4ade80]/30 bg-[#4ade80]/5 p-3 text-[11px] font-medium text-[#4ade80]">
                  <Icon name="shield" /> Exact code confirmed // independently upheld
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#6b6252]">// illustrative output — not live data</p>
          </div>
        </div>
      </section>

      <section className="relative border-b border-[#3a2f1f] bg-[#0d0f0a]">
        <GridTexture />
        <Reveal className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// one engine, three surfaces</p>
          <h2 className="mt-3 text-center text-2xl font-bold uppercase tracking-tight text-[#f2ead9] sm:text-3xl">
            Review where you already work.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {surfaces.map((s) => (
              <Link
                key={s.title}
                to={s.to}
                className="ferret-card group block border border-[#3a2f1f] bg-[#0a0a08] p-5 shadow-[4px_4px_0_0_#1c1810]"
              >
                <div className="flex size-9 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={s.icon} />
                </div>
                <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#a39a86]">{s.body}</p>
                <span className="mt-3 inline-block text-xs font-medium text-[#ffb300] group-hover:underline">
                  Open →
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-[#6b6252]">
            // GitHub &amp; Bitbucket · every language, genuinely · two-model verification on every finding
          </p>
        </Reveal>
      </section>

      <section id="how-it-works" className="scroll-mt-8">
        <Reveal className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// signal over volume</p>
              <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-[#f2ead9] sm:text-3xl">
                Find broadly.
                <br />
                Verify ruthlessly.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#a39a86]">
                Multiple specialists scan for risk in parallel. Independent verification decides what&apos;s worth
                your attention.
              </p>
              <ol className="mt-7 space-y-3 border-l border-[#3a2f1f] pl-5" style={{ borderImage: "linear-gradient(to bottom, #ffb300, #3a2f1f 60%) 1 100%" }}>
                {steps.map((step, index) => (
                  <li key={step} className="relative text-sm text-[#c9c2b3]">
                    <span className="absolute -left-[1.65rem] flex size-6 shrink-0 items-center justify-center border border-[#ffb300]/50 bg-[#0a0a08] font-mono text-[10px] text-[#ffb300]">
                      {index + 1}
                    </span>
                    <span className="text-[#6b6252]">[{index === steps.length - 1 ? "OK" : "..."}]</span> {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((feature) => (
                <article key={feature.title} className="ferret-card border border-[#3a2f1f] bg-[#0d0f0a] p-5 shadow-[4px_4px_0_0_#1c1810]">
                  <div className="flex size-9 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                    <Icon name={feature.icon} />
                  </div>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{feature.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#a39a86]">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-[#3a2f1f] bg-[#0d0f0a]">
        <Reveal className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div className="relative order-2 border border-[#3a2f1f] bg-[#0a0a08] p-4 shadow-[6px_6px_0_0_#1c1810] sm:p-6 lg:order-1">
            <CornerBrackets />
            <div className="flex items-center justify-between border-b border-[#3a2f1f] pb-4">
              <div>
                <p className="text-sm font-semibold uppercase text-[#f2ead9]">Team rulebook</p>
                <p className="mt-1 text-xs text-[#6b6252]">acme / payments-api</p>
              </div>
              <span className="border border-[#4ade80]/40 bg-[#4ade80]/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-[#4ade80]">
                3 active
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {rulebookRules.map(([category, rule, evidence]) => (
                <div key={rule} className="ferret-card border border-[#3a2f1f] bg-[#14170f] p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]">
                      <svg viewBox="0 0 16 16" fill="none" className="size-3" aria-hidden="true">
                        <path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#ffb300]">
                          [{category}]
                        </span>
                        <span className="text-[10px] text-[#6b6252]">{evidence}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[#c9c2b3]">{rule}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// learns with your team</p>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-[#f2ead9] sm:text-3xl">
              Standards that survive beyond one PR.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#a39a86]">
              Repeated feedback becomes transparent, repo-aware guidance your team can review and control.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {rulebookFeatures.map(([title, body]) => (
                <div key={title} className="border border-[#3a2f1f] bg-[#0a0a08] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#a39a86]">{body}</p>
                </div>
              ))}
            </div>
            <Link to="/security" className="mt-6 inline-flex text-sm font-medium text-[#ffb300] hover:text-[#ffcf66]">
              &gt; Read our security approach
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[#3a2f1f] bg-[#0a0a08]">
        <Reveal className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// measured, not marketed</p>
              <h2 className="mt-3 text-xl font-bold uppercase tracking-tight text-[#f2ead9]">The bar we&apos;re building toward.</h2>
              <p className="mt-3 text-sm leading-6 text-[#a39a86]">
                These are engineering targets — not customer results.{" "}
                <Link to="/benchmark" className="font-medium text-[#ffb300] hover:underline">
                  Read the published methodology →
                </Link>
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-x-6 gap-y-7 border border-[#3a2f1f] bg-[#0d0f0a] p-6 sm:grid-cols-4">
              <CornerBrackets />
              {targets.map((target) => (
                <div key={target.label}>
                  <p
                    className="font-mono text-3xl font-bold tabular-nums text-[#ffb300] sm:text-4xl"
                    style={{ textShadow: "0 0 14px rgba(255,179,0,.4)" }}
                  >
                    {target.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-[#6b6252]">{target.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative border-b border-[#3a2f1f] bg-[#0a0a08]">
        <GridTexture />
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// built to be trusted with your code</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-[#a39a86]">
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
          <Link to="/security" className="text-xs font-medium text-[#ffb300] hover:underline">
            &gt; Full security approach
          </Link>
        </Reveal>
      </section>

      <section className="relative px-5 py-14 sm:px-6 lg:py-16">
        <div className="relative mx-auto max-w-6xl overflow-hidden border-2 border-[#ffb300]/50 bg-[#0d0f0a] px-6 py-10 text-center shadow-[8px_8px_0_0_#3a2f1f] sm:px-12 sm:py-14">
          <Scanlines />
          <div
            className="absolute inset-0 opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,179,0,.5) 0, transparent 25%), radial-gradient(circle at 80% 80%, rgba(74,222,128,.35) 0, transparent 30%)",
            }}
          />
          <Reveal className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb300]">// give your team signal</p>
            <h2
              className="mx-auto mt-3 max-w-2xl text-2xl font-bold uppercase tracking-tight text-[#f2ead9] sm:text-3xl"
              style={{ textShadow: "0 0 18px rgba(255,179,0,.2)" }}
            >
              Catch the risky change.
              <br />
              Skip the review theater.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#a39a86]">
              Install the GitHub App and run your first verified review in minutes.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/signin"
                className="ferret-shimmer inline-flex items-center justify-center border-2 border-[#ffb300] bg-[#ffb300] px-5 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[4px_4px_0_0_#3a2f1f] transition hover:-translate-y-0.5 hover:bg-[#ffcf66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb300]"
              >
                Run first scan
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center border-2 border-[#3a2f1f] bg-transparent px-5 py-3 text-sm font-medium text-[#c9c2b3] transition hover:border-[#ffb300]/50 hover:text-[#ffb300] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb300]"
              >
                View plans
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#6b6252]">
              READY<Cursor />
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
