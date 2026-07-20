import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";

const targets = [
  { value: "> 70%", label: "VERIFIED CATCH RATE" },
  { value: "< 2", label: "FALSE POS. / RUN" },
  { value: "< 5%", label: "NOISE DISMISSAL" },
  { value: "< 5m", label: "MEDIAN LATENCY" },
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
    <div className="relative">
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// methodology</p>
          <h1
            className="mt-3 text-3xl font-bold uppercase tracking-tight text-[#f2ead9]"
            style={{ textShadow: "0 0 16px rgba(255,179,0,.2)" }}
          >
            Benchmark methodology
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a39a86]">
            How we plan to measure whether CodeFerret actually catches real bugs without drowning
            you in noise — published before the results are, so the methodology can be judged on
            its own.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border border-[#3a2f1f] bg-[#0d0f0a] p-6 sm:grid-cols-4">
            <CornerBrackets />
            {targets.map((t) => (
              <div key={t.label}>
                <p
                  className="font-mono text-2xl font-bold tabular-nums text-[#ffb300] sm:text-3xl"
                  style={{ textShadow: "0 0 12px rgba(255,179,0,.35)" }}
                >
                  {t.value}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#6b6252]">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#6b6252]">
            // engineering targets, not customer results. this page will carry real measured numbers
            once a full benchmark pass has been run and published — see the status below for
            exactly where that stands today.
          </p>
        </Reveal>

        <Reveal className="mt-8 grid gap-4 sm:grid-cols-2">
          {methodology.map((item) => (
            <div key={item.title} className="ferret-card border border-[#3a2f1f] bg-[#0d0f0a] p-5 shadow-[3px_3px_0_0_#1c1810]">
              <div className="flex size-9 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                <Icon name={item.icon} />
              </div>
              <h2 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#a39a86]">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="relative mt-8 border-2 border-[#ffb300]/50 bg-[#14170f] p-5 shadow-[4px_4px_0_0_#3a2f1f]">
          <CornerBrackets />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#ffb300]">// current status</h2>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#c9c2b3]">
            <li>
              <span className="font-medium text-[#f2ead9]">Scoring harness:</span> built and unit-tested — computes catch rate and
              false-positive rate exactly as described above, no API keys required to verify the logic itself.
            </li>
            <li>
              <span className="font-medium text-[#f2ead9]">Dataset:</span> 8 seed cases across 6 categories (logic, security,
              concurrency, errors, contracts, tests) — small, hand-authored, and clearly labeled as synthetic rather
              than mined from real pull requests.
            </li>
            <li>
              <span className="font-medium text-[#f2ead9]">Live run:</span> not yet performed. Running the full pipeline against
              even a small dataset costs real Anthropic/OpenAI API spend, so that's a deliberate step to take when
              there's a larger, real-PR-backed dataset to run it against — not something to fake a result for in
              the meantime.
            </li>
          </ul>
        </Reveal>

        <p className="mt-8 border-t border-[#3a2f1f] pt-6 text-xs text-[#6b6252]">
          // questions about the methodology, or want to contribute real mined cases?{" "}
          <Link to="/security" className="text-[#ffb300] hover:underline">
            See our security approach
          </Link>{" "}
          or reach out at benchmarks@codeferret.dev.
        </p>
      </div>
    </div>
  );
}
