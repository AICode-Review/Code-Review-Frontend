import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon, type IconName } from "./retro";
import { LogoMark } from "./LogoMark";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      {open ? (
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

interface FeatureMenuItem {
  icon: IconName;
  title: string;
  body: string;
  href: string;
}

interface FeatureMenuGroup {
  label: string;
  items: FeatureMenuItem[];
}

const featureGroups: FeatureMenuGroup[] = [
  {
    label: "Review engine",
    items: [
      { icon: "scan", title: "Specialist passes", body: "One independent pass per risk category, merged and scored.", href: "/features#pipeline" },
      { icon: "code", title: "Every language, genuinely", body: "No Tier-1 allow-list — full analysis on any source file.", href: "/features#languages" },
    ],
  },
  {
    label: "Delivery & learning",
    items: [
      { icon: "budget", title: "Budgeted delivery", body: "Only verified critical/major issues post inline on your PR.", href: "/features#delivery" },
      { icon: "rulebook", title: "Team rulebook", body: "Feedback becomes plain-language rules your team controls.", href: "/features#rulebook" },
    ],
  },
  {
    label: "Platform & trust",
    items: [
      { icon: "shield", title: "GitHub & Bitbucket", body: "One dashboard for PR scores, run history, and repo health.", href: "/features#platform" },
      { icon: "lock", title: "Security approach", body: "Source never persisted, encrypted at rest, org-scoped RLS.", href: "/security" },
    ],
  },
];

/** MirrorFly-style grouped mega-menu — a floating panel on desktop, an inline accordion on mobile (same markup, responsive classes only). */
function FeaturesMenu({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleItemClick() {
    setOpen(false);
    onNavigate();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mk-accent)] md:w-auto md:py-1.5 ${
          open ? "text-[var(--mk-accent-hot)]" : "text-[var(--mk-muted)] hover:text-[var(--mk-accent-hot)]"
        }`}
      >
        Features
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="mt-1 grid gap-5 border-t border-[var(--mk-border)] pt-3 md:absolute md:left-0 md:top-full md:mt-2.5 md:w-[36rem] md:max-w-[calc(100vw-2.5rem)] md:grid-cols-3 md:rounded-2xl md:border md:border-[var(--mk-border)] md:bg-white md:p-5 md:shadow-[0_10px_20px_rgba(10,10,10,0.06),0_24px_56px_rgba(57,86,221,0.14)]"
        >
          {featureGroups.map((group) => (
            <div key={group.label}>
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mk-faint)]">{group.label}</p>
              <ul className="mt-2 space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.href}
                      onClick={handleItemClick}
                      className="group flex items-start gap-2.5 rounded-lg p-2 transition hover:bg-[var(--mk-surface)]"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                        <Icon name={item.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--mk-ink)] group-hover:text-[var(--mk-accent-hot)]">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--mk-muted)]">{item.body}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:col-span-3 md:-mx-5 md:-mb-5 md:border-t md:border-[var(--mk-border)] md:px-5 md:py-3">
            <Link
              to="/features"
              onClick={handleItemClick}
              className="block px-1 py-1 text-sm font-semibold text-[var(--mk-accent-hot)] hover:underline md:py-0"
            >
              Explore all features →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const linkClass =
    "block rounded-lg px-2 py-2 text-sm font-medium text-[var(--mk-muted)] transition hover:text-[var(--mk-accent-hot)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mk-accent)] md:py-1.5";
  const contactClass =
    "block rounded-xl border border-red-700 px-4 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 md:py-1.5";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--mk-border)]/80 bg-[#eef3ff]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
        <Link
          to="/"
          className="font-display inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-[var(--mk-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mk-accent)]"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--mk-accent)] text-white shadow-[0_4px_14px_rgba(57,86,221,0.28)]">
            <LogoMark className="size-6" />
          </span>
          Scrutinye
        </Link>
        <button
          type="button"
          className="rounded-xl border border-[var(--mk-border)] bg-white p-2 text-[var(--mk-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mk-accent)] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
        </button>
        {/* Single nav, restyled per breakpoint (never duplicated): a mobile accordion
            collapses to a MirrorFly-style row on desktop — center nav group, CTA group
            pinned right via an mx-auto trick on the center group within a flex-1 nav. */}
        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-[57px] z-20 flex-col gap-0.5 border-b border-[var(--mk-border)] bg-white px-5 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:px-6 md:static md:flex md:flex-1 md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <div className="md:mx-auto md:flex md:items-center md:gap-0.5">
            <FeaturesMenu onNavigate={() => setOpen(false)} />
            <NavLink to="/pricing" className={linkClass} onClick={() => setOpen(false)}>
              Pricing
            </NavLink>
            <NavLink to="/security" className={linkClass} onClick={() => setOpen(false)}>
              Security
            </NavLink>
            <NavLink to="/benchmark" className={linkClass} onClick={() => setOpen(false)}>
              Benchmark
            </NavLink>
          </div>
          <div className="mt-1 flex flex-col gap-1.5 md:mt-0 md:flex-row md:items-center md:gap-2">
            <NavLink to="/contact" className={contactClass} onClick={() => setOpen(false)}>
              Contact Us
            </NavLink>
            <Link
              to="/signin"
              onClick={() => setOpen(false)}
              className="ferret-shimmer mk-btn-primary rounded-xl bg-[var(--mk-accent)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--mk-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mk-accent)]"
            >
              Start free
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/90 bg-zinc-50 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-zinc-950)_6%,transparent),0_8px_24px_color-mix(in_srgb,var(--color-zinc-950)_6%,transparent)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-[-0.015em] text-zinc-950">{children}</h2>
      {hint && <span className="type-meta">{hint}</span>}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sub,
  good,
}: {
  label: string;
  value: string;
  sub?: string;
  good?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="type-label">{label}</p>
      <p className="type-display mt-1.5">{value}</p>
      {sub && <p className={`type-meta mt-1 ${good ? "text-emerald-600" : ""}`}>{sub}</p>}
    </Card>
  );
}

const badgeStyles: Record<string, string> = {
  queued: "bg-zinc-100 text-zinc-700",
  running: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-500",
  ready: "bg-emerald-50 text-emerald-700",
  indexing: "bg-blue-50 text-blue-700",
  stale: "bg-amber-50 text-amber-800",
  none: "bg-zinc-100 text-zinc-500",
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-800",
  learned: "bg-zinc-100 text-zinc-700",
  manual: "bg-indigo-50 text-indigo-700",
  automatic: "bg-blue-50 text-blue-700",
  critical: "bg-red-50 text-red-700",
  major: "bg-amber-50 text-amber-800",
  minor: "bg-zinc-100 text-zinc-600",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-zinc-100 text-zinc-500",
  skipped: "bg-zinc-100 text-zinc-500",
  posted: "bg-blue-50 text-blue-700",
  digest: "bg-zinc-100 text-zinc-600",
  accepted: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-amber-50 text-amber-800",
  fixed: "bg-blue-50 text-blue-700",
  ignored: "bg-zinc-100 text-zinc-500",
};

/** Title-case labels when Badge is used without children. */
const badgeLabels: Record<string, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  ready: "Ready",
  indexing: "Indexing",
  stale: "Stale",
  none: "None",
  active: "Active",
  pending: "Pending",
  learned: "Learned",
  manual: "Manual",
  automatic: "Auto",
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  verified: "Verified",
  rejected: "Rejected",
  skipped: "Skipped",
  posted: "Posted",
  digest: "Digest",
  accepted: "Accepted",
  dismissed: "Dismissed",
  fixed: "Fixed",
  ignored: "Ignored",
};

export function Badge({ kind, children }: { kind: string; children?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-black/5 px-2 py-0.5 text-[11px] font-semibold leading-4 tracking-[0.02em] ${badgeStyles[kind] ?? "bg-zinc-100 text-zinc-700"}`}
    >
      {children ?? badgeLabels[kind] ?? kind}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300/90 bg-linear-to-b from-zinc-50/80 to-zinc-50 p-8 text-center">
      <span className="mx-auto mb-3 flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 shadow-sm">
        <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
          <path d="M4 5.5h12M4 10h8M4 14.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <p className="type-body mx-auto max-w-md text-zinc-600">{children}</p>
    </div>
  );
}

export function LoadingText({ children = "Loading…" }: { children?: ReactNode }) {
  return (
    <p className="type-body inline-flex items-center gap-2 text-zinc-600">
      <span className="size-3.5 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 motion-reduce:animate-none" />
      {children}
    </p>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold">!</span>
      {children}
    </p>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-1 pt-3 text-sm">
      <span className="text-xs text-zinc-500">
        {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
