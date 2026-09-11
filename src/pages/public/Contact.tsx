import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import { DEMO_MODE } from "../../lib/demo";
import { contactFormSchema, contactReasonSchema, type ContactReason } from "../../lib/schemas";
import { CornerBrackets, GridTexture, Icon, Reveal, type IconName } from "../../components/retro";
import { Seo } from "../../components/Seo";

type Status = "idle" | "submitting" | "sent" | "error";

const reasons: Array<{ icon: IconName; title: string; reason: ContactReason }> = [
  { icon: "shield", title: "Self-hosted or enterprise", reason: "enterprise" },
  { icon: "budget", title: "Plans & billing", reason: "billing" },
  { icon: "lock", title: "Legal & privacy", reason: "legal" },
  { icon: "code", title: "Bugs & feedback", reason: "bug" },
];

const reasonLabels: Record<ContactReason, string> = {
  general: "General question",
  billing: "Plans & billing",
  legal: "Legal & privacy",
  enterprise: "Self-hosted or enterprise",
  bug: "Bugs & feedback",
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const initialReason = contactReasonSchema.safeParse(searchParams.get("reason"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState<ContactReason>(initialReason.success ? initialReason.data : "general");
  const [website, setWebsite] = useState(""); // honeypot — left blank by real visitors
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Scoped to this page only — the whole layout (header + this page, no footer) is
  // pinned to exactly one viewport height with scrolling disabled, so everything is
  // visible at a glance instead of requiring a scroll. Cleaned up on navigation away.
  useEffect(() => {
    document.documentElement.classList.add("no-scroll-page");
    return () => document.documentElement.classList.remove("no-scroll-page");
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = contactFormSchema.safeParse({ name, email, message, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    setStatus("submitting");
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        const res = await fetch(apiUrl("/api/contact"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...parsed.data, website }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => undefined)) as { message?: string } | undefined;
          throw new Error(body?.message ?? "Something went wrong — try again in a moment.");
        }
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      // A raw network failure (offline, DNS, CORS, backend unreachable) throws a bare
      // TypeError whose message ("Failed to fetch" / "NetworkError...") isn't something
      // to show a visitor — only surface messages our own code/API actually authored.
      setError(
        err instanceof Error && !(err instanceof TypeError)
          ? err.message
          : "Couldn't reach the server — check your connection and try again.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--mk-border)] bg-[var(--mk-bg)] px-3 py-2 text-sm text-[var(--mk-ink)] outline-none transition placeholder:text-[var(--mk-faint)] focus:border-[var(--mk-accent)] focus:ring-2 focus:ring-[var(--mk-accent-soft)]";

  return (
    <main className="relative flex h-full overflow-hidden">
      <Seo
        title="Contact us — Scrutinye"
        description="Questions about Scrutinye, self-hosting, or a higher-volume plan? Send a message and we'll get back to you."
        path="/contact"
      />
      <GridTexture />
      <div className="landing-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="landing-orb landing-orb-a" aria-hidden="true" />
      <div className="landing-orb landing-orb-b" aria-hidden="true" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-5 py-3 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Talk to us</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--mk-ink)] sm:text-3xl">
            Let&apos;s talk about your review pipeline
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--mk-muted)]">
            Questions about a plan, self-hosting, or something that isn&apos;t working right — send a message and a
            real person will get back to you.
          </p>
        </Reveal>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch lg:gap-6">
          {/* Left: why people reach out + response-time strip */}
          <Reveal className="flex flex-col gap-3">
            <div className="ferret-card flex-1 rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-4 shadow-[var(--mk-shadow)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mk-faint)]">
                Why teams reach out
              </p>
              <ul className="mt-3 space-y-2.5">
                {reasons.map((r) => (
                  <li key={r.title}>
                    <button
                      type="button"
                      onClick={() => setReason(r.reason)}
                      aria-pressed={reason === r.reason}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition ${
                        reason === r.reason ? "bg-[var(--mk-accent-soft)]" : "hover:bg-[var(--mk-bg)]"
                      }`}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                        <Icon name={r.icon} />
                      </span>
                      <span className="text-sm font-medium text-[var(--mk-ink)]">{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ferret-card flex items-center gap-3 rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-3.5 shadow-[var(--mk-shadow)] sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mk-accent)] text-xs font-bold text-white">
                &lt;1
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-[var(--mk-ink)]">
                  Business day response
                </span>
                <span className="block text-xs leading-tight text-[var(--mk-muted)]">A real person replies — no bots.</span>
              </span>
            </div>
          </Reveal>

          {/* Right: the form */}
          <Reveal className="flex">
            <div className="relative flex flex-1 flex-col justify-center rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-4 shadow-[var(--mk-shadow-lg)] sm:p-5">
              <CornerBrackets />

              {status === "sent" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[var(--mk-success)]/10 text-[var(--mk-success)]">
                    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                      <path
                        d="m5 13 4.5 4.5L19 8"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-[var(--mk-ink)]">Message sent</p>
                  <p className="max-w-xs text-xs leading-5 text-[var(--mk-muted)]">
                    Thanks — we&apos;ll reply by email. In the meantime, feel free to{" "}
                    <Link to="/pricing" className="font-medium text-[var(--mk-accent)] hover:underline">
                      browse plans
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => void submit(e)} className="space-y-2.5">
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] top-auto size-px overflow-hidden"
                    tabIndex={-1}
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-[var(--mk-muted)]">Name</span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Jane Doe"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-[var(--mk-muted)]">Email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. you@company.com"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--mk-muted)]">Reason</span>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as ContactReason)}
                      className={inputClass}
                    >
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--mk-muted)]">Message</span>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${inputClass} resize-none`}
                      placeholder="e.g. Tell us about your team and what you need help with"
                    />
                  </label>

                  {error && <p className="text-xs text-[var(--mk-danger)]">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mk-btn-primary mk-btn-3d ferret-shimmer inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--mk-accent)] px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
