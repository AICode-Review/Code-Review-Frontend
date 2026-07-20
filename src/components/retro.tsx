import { useEffect, useRef, useState } from "react";

/**
 * Shared visual primitives for the public/marketing site's retro-terminal aesthetic.
 * Used by Landing, Cli, Security, and Benchmark so the pages share one polish system
 * instead of drifting into inconsistent one-off styling.
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

/** Faint CRT scanline texture — a repeating 2px gradient, not an image. */
export function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
      aria-hidden="true"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)",
      }}
    />
  );
}

export function Cursor() {
  return (
    <span className="animate-pulse text-[#ffb300] [animation-duration:1s]" aria-hidden="true">
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
    // Safety net: if IntersectionObserver never fires (unsupported, blocked, or
    // the section is already on-screen at a viewport size the observer misses),
    // reveal anyway rather than leave the section permanently at opacity 0.
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

/** Blueprint-style corner marks framing a panel. */
export function CornerBrackets() {
  return (
    <>
      <span className="pointer-events-none absolute -left-1.5 -top-1.5 size-3 border-l-2 border-t-2 border-[#ffb300]/60" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-1.5 -top-1.5 size-3 border-r-2 border-t-2 border-[#ffb300]/60" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 size-3 border-b-2 border-l-2 border-[#ffb300]/60" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 size-3 border-b-2 border-r-2 border-[#ffb300]/60" aria-hidden="true" />
    </>
  );
}

/** A bordered panel with fake window chrome (traffic-light dots + label) framing terminal output. */
export function TerminalPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden border-2 border-[#3a2f1f] bg-[#0d0f0a] shadow-[6px_6px_0_0_#1c1810]">
      <CornerBrackets />
      <div className="flex items-center gap-2.5 border-b border-[#3a2f1f] bg-[#14170f] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#c9c2b3]/25" />
          <span className="size-2.5 rounded-full bg-[#c9c2b3]/25" />
          <span className="size-2.5 rounded-full bg-[#ffb300]/70" />
        </span>
        <span className="text-xs font-medium text-[#a39a86]">{label}</span>
      </div>
      {children}
    </div>
  );
}

/** Very faint graph-paper texture for section backgrounds, masked to fade at the edges. */
export function GridTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,179,0,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,0,.035) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
  );
}
