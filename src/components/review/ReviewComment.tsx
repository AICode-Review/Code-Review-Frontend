import { useState } from "react";
import type { Finding } from "../../features/runs/useRun";

const severityMeta: Record<
  Finding["severity"],
  { label: string; hint: string; border: string; chip: string }
> = {
  critical: {
    label: "Must fix",
    hint: "Block merge until this is addressed",
    border: "border-l-red-500",
    chip: "bg-red-50 text-red-700",
  },
  major: {
    label: "Should fix",
    hint: "Likely bug or breaking change — fix before merge if possible",
    border: "border-l-amber-500",
    chip: "bg-amber-50 text-amber-800",
  },
  minor: {
    label: "Nice to have",
    hint: "Lower priority — safe to address in a follow-up",
    border: "border-l-zinc-600",
    chip: "bg-zinc-100 text-zinc-600",
  },
};

function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    security: "Security",
    logic: "Bug / logic",
    contracts: "API / contracts",
    concurrency: "Concurrency",
    errors: "Error handling",
    tests: "Tests",
    style: "Style",
  };
  return map[category] ?? category;
}

export function ReviewComment({
  finding,
  index,
  onFeedback,
  compact,
}: {
  finding: Finding;
  index?: number;
  onFeedback?: (id: string, feedback: NonNullable<Finding["feedback"]>) => void;
  /** Compact mode for digest / rejected lists */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(!compact);
  const meta = severityMeta[finding.severity];
  const location = `${finding.path}:${finding.startLine}${
    finding.endLine !== finding.startLine ? `–${finding.endLine}` : ""
  }`;

  async function copyFix() {
    if (!finding.suggestedFix) return;
    try {
      await navigator.clipboard.writeText(finding.suggestedFix);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      id={`comment-${finding.id}`}
      className={`scroll-mt-20 rounded-xl border border-zinc-200 border-l-4 bg-zinc-50 ${meta.border}`}
    >
      <header className="border-b border-zinc-200 px-4 py-3">
        <div className="flex flex-wrap items-start gap-3">
          {index != null && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-800">
              {index}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.chip}`}>
                {meta.label}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                {categoryLabel(finding.category)}
              </span>
              {finding.verificationStatus === "verified" && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  Checked ✓
                </span>
              )}
              {finding.verificationStatus === "rejected" && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                  Not a real issue
                </span>
              )}
            </div>
            <h3 className="mt-2 text-base font-semibold leading-snug text-zinc-900">{finding.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              <span className="font-mono text-zinc-600">{location}</span>
              <span className="mx-1.5 text-zinc-700">·</span>
              <span>{meta.hint}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            1. What&apos;s wrong
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-800">{finding.bodyMd}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              2. Why it matters
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{finding.whyItMatters}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              3. If you ignore this
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{finding.impact}</p>
          </div>
        </section>

        {finding.fixSteps.length > 0 && finding.fixSteps[0] !== "No action needed." && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              4. How to fix
            </h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-zinc-700">
              {finding.fixSteps.map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}

        {(finding.codeSnippet || finding.suggestedFix) && (
          <div>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showDetails ? "Hide code details" : "Show code & suggested patch"}
            </button>
            {showDetails && (
              <div className="mt-3 space-y-3">
                {finding.codeSnippet && (
                  <div>
                    <p className="text-[11px] font-medium text-zinc-500">Current code</p>
                    <pre className="mt-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-600">
                      {finding.codeSnippet}
                    </pre>
                  </div>
                )}
                {finding.suggestedFix && (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium text-emerald-500/90">Suggested patch</p>
                      <button
                        type="button"
                        onClick={() => void copyFix()}
                        className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600 hover:border-zinc-400 hover:text-zinc-800"
                      >
                        {copied ? "Copied" : "Copy patch"}
                      </button>
                    </div>
                    <pre className="mt-1 overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 font-mono text-[11px] leading-relaxed text-emerald-900">
                      {finding.suggestedFix}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-zinc-600">
          <span className="font-medium text-zinc-500">How we checked: </span>
          {finding.verifiedHow}
        </p>

        {onFeedback && finding.verificationStatus === "verified" && (
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3">
            <span className="text-xs text-zinc-500">Was this comment useful?</span>
            {(
              [
                ["accepted", "Yes, helpful"],
                ["dismissed", "Wrong / not useful"],
                ["ignored", "Don't flag this again"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onFeedback(finding.id, key)}
                className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                  finding.feedback === key
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
