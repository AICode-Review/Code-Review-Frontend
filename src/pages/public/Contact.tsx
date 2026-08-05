import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import { DEMO_MODE } from "../../lib/demo";
import { contactFormSchema } from "../../lib/schemas";
import { GridTexture, Reveal } from "../../components/retro";
import { Seo } from "../../components/Seo";

type Status = "idle" | "submitting" | "sent" | "error";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — left blank by real visitors
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = contactFormSchema.safeParse({ name, email, message });
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

  return (
    <main className="relative overflow-hidden">
      <Seo
        title="Contact us — CodeFerret"
        description="Questions about CodeFerret, self-hosting, or a higher-volume plan? Send a message and we'll get back to you."
        path="/contact"
      />
      <GridTexture />
      <Reveal className="relative mx-auto max-w-2xl px-5 py-16 sm:px-6 sm:py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Talk to us</p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">Contact us</h1>
        <p className="mt-3 text-center text-base leading-7 text-[var(--mk-muted)]">
          Questions about a plan, self-hosting, or something that isn&apos;t working right — send a message and a
          real person will get back to you.
        </p>

        {status === "sent" ? (
          <div className="mt-10 rounded-xl border border-[var(--mk-success)]/30 bg-[var(--mk-success)]/5 p-6 text-center">
            <p className="text-sm font-semibold text-[var(--mk-success)]">Message sent</p>
            <p className="mt-2 text-sm text-[var(--mk-muted)]">
              Thanks — we&apos;ll reply by email. In the meantime, feel free to{" "}
              <Link to="/pricing" className="text-[var(--mk-accent)] hover:underline">
                browse plans
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="mt-10 space-y-4">
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

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--mk-muted)]">Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] px-3 py-2.5 text-sm text-[var(--mk-ink)] outline-none placeholder:text-[var(--mk-faint)] focus:border-[var(--mk-accent)]/60 focus:ring-1 focus:ring-[var(--mk-accent)]/30"
                placeholder="e.g. Jane Doe"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--mk-muted)]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] px-3 py-2.5 text-sm text-[var(--mk-ink)] outline-none placeholder:text-[var(--mk-faint)] focus:border-[var(--mk-accent)]/60 focus:ring-1 focus:ring-[var(--mk-accent)]/30"
                placeholder="e.g. you@company.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--mk-muted)]">Message</span>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded-lg border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] px-3 py-2.5 text-sm text-[var(--mk-ink)] outline-none placeholder:text-[var(--mk-faint)] focus:border-[var(--mk-accent)]/60 focus:ring-1 focus:ring-[var(--mk-accent)]/30"
                placeholder="e.g. Tell us about your team and what you need help with"
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="ferret-shimmer inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--mk-accent)] px-5 py-3 text-sm font-semibold text-[var(--mk-accent-fg)] shadow-[0_8px_24px_rgba(20,184,166,0.3)] transition hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </Reveal>
    </main>
  );
}
