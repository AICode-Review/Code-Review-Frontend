import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";
import { Seo } from "../../components/Seo";

const items: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "lock",
    title: "Your source code is never persisted",
    body: "Repositories are shallow-cloned to an ephemeral directory for indexing and purged immediately after each run. Only symbol metadata and embeddings are stored — and you can turn those off per repo.",
  },
  {
    icon: "scan",
    title: "Nothing sensitive in logs",
    body: "File contents are never logged. Tokens are redacted everywhere, and platform access tokens are encrypted at rest with AES-256-GCM.",
  },
  {
    icon: "shield",
    title: "Row-level security on every table",
    body: "The web app can only ever read rows belonging to your organization. Write access exists solely in the backend service, which holds the only privileged key.",
  },
  {
    icon: "budget",
    title: "Sandboxed verification",
    body: "When a finding needs execution to verify, it runs in a per-run container: no network, read-only root filesystem, strict CPU/memory limits, seccomp profile, 60-second timeout.",
  },
  {
    icon: "code",
    title: "LLM providers",
    body: "Reviews use Anthropic Claude; verification cross-examination uses OpenAI. Both are called with retention-minimizing settings. The self-hosted edition uses your own keys and endpoints.",
  },
  {
    icon: "rulebook",
    title: "Compliance roadmap",
    body: "Audit logging and role-based access are built into the schema from day one. SOC 2 Type II preparation begins with the enterprise edition (M9).",
  },
];

export default function Security() {
  return (
    <div className="relative overflow-hidden">
      <Seo
        title="Security — CodeFerret"
        description="How CodeFerret handles your source code: nothing persisted beyond the review, encrypted tokens, and row-level security on every table."
        path="/security"
      />
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Trust</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">
            Security &amp; trust
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--mk-muted)]">
            A code reviewer sees your most sensitive asset. Here is exactly how we treat it.
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={item.title} className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={item.icon} />
                </div>
                <span className="font-mono text-[10px] text-[var(--mk-faint)]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-[var(--mk-ink)]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="relative mt-10 rounded-2xl border border-[var(--mk-accent)]/30 bg-[var(--mk-bg-elevated)] p-6 text-center">
          <CornerBrackets />
          <p className="text-sm font-semibold text-[var(--mk-ink)]">
            Questions, or a security disclosure?
          </p>
          <p className="mt-1.5 text-sm text-[var(--mk-muted)]">security@codeferret.dev</p>
          {/* Pricing is temporarily disabled — not deleted, see App.tsx's commented-out route.
          <Link to="/pricing" className="mt-4 inline-flex text-sm font-medium text-[var(--mk-accent)] hover:underline">
            See plans that fit your team →
          </Link>
          */}
        </Reveal>
      </div>
    </div>
  );
}
