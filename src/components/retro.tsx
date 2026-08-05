import { useEffect, useRef, useState } from "react";

/**
 * Shared visual primitives for the public/marketing site.
 * Export names kept stable so pages can evolve without import churn.
 */

export type IconName = "shield" | "scan" | "budget" | "rulebook" | "code" | "lock";

export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    shield: (
      <>
        <path d="M12 3 5.5 5.7v5.7c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V5.7L12 3Z" />
        <path d="m9.2 11.8 1.8 1.8 3.9-4.2" />
      </>
    ),
    scan: (
      <>
        <path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
        <path d="M8 12h8M12 8v8" />
      </>
    ),
    budget: (
      <>
        <path d="M4 6.5h16M7 3v3.5M17 3v3.5M5.5 6.5h13A1.5 1.5 0 0 1 20 8v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M8 11h8M8 15h5" />
      </>
    ),
    rulebook: (
      <>
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" />
        <path d="M5 19h15M9 7h7M9 11h5" />
      </>
    ),
    code: (
      <>
        <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10" width="15" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      {paths[name]}
    </svg>
  );
}

/** Soft atmospheric wash — replaces CRT scanlines. */
export function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 opacity-40"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(20,184,166,0.08), transparent 60%)",
      }}
    />
  );
}

export function Cursor() {
  return (
    <span className="animate-pulse text-[var(--mk-accent)] [animation-duration:1s]" aria-hidden="true">
      _
    </span>
  );
}

/** Fades a section up into place the first time it scrolls into view. */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    const fallback = window.setTimeout(() => setVisible(true), 1200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={`ferret-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/** Subtle corner accents framing a panel. */
export function CornerBrackets() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-3 top-3 size-2.5 rounded-tl border-l border-t border-[var(--mk-accent)]/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-3 top-3 size-2.5 rounded-tr border-r border-t border-[var(--mk-accent)]/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-3 left-3 size-2.5 rounded-bl border-b border-l border-[var(--mk-accent)]/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3 size-2.5 rounded-br border-b border-r border-[var(--mk-accent)]/50"
        aria-hidden="true"
      />
    </>
  );
}

/** Polished code panel for CLI / install snippets. */
export function TerminalPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--mk-border)] bg-[var(--mk-surface)] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[var(--mk-faint)]/40" />
          <span className="size-2.5 rounded-full bg-[var(--mk-faint)]/40" />
          <span className="size-2.5 rounded-full bg-[var(--mk-accent)]/80" />
        </span>
        <span className="text-xs font-medium text-[var(--mk-muted)]">{label}</span>
      </div>
      {children}
    </div>
  );
}

/** Soft mesh / grid atmosphere for section backgrounds. */
export function GridTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(rgba(20,184,166,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
  );
}
