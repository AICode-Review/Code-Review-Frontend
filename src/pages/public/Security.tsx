import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";

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
    <div className="relative">
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// trust</p>
          <h1
            className="mt-3 text-3xl font-bold uppercase tracking-tight text-[#f2ead9]"
            style={{ textShadow: "0 0 16px rgba(255,179,0,.2)" }}
          >
            Security &amp; trust
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a39a86]">
            A code reviewer sees your most sensitive asset. Here is exactly how we treat it.
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={item.title} className="ferret-card border border-[#3a2f1f] bg-[#0d0f0a] p-5 shadow-[3px_3px_0_0_#1c1810]">
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={item.icon} />
                </div>
                <span className="font-mono text-[10px] text-[#6b6252]">[{String(i + 1).padStart(2, "0")}]</span>
              </div>
              <h2 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#a39a86]">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="relative mt-10 border-2 border-[#ffb300]/40 bg-[#14170f] p-6 text-center shadow-[4px_4px_0_0_#3a2f1f]">
          <CornerBrackets />
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">
            Questions, or a security disclosure?
          </p>
          <p className="mt-1.5 text-sm text-[#a39a86]">security@codeferret.dev</p>
          <Link to="/pricing" className="mt-4 inline-flex text-xs font-medium text-[#ffb300] hover:underline">
            &gt; See plans that fit your team
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
