import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useOrg, useOrgs, type Org } from "../../hooks/useOrg";

const SIDEBAR_KEY = "codeferret.sidebar.collapsed";
const THEME_KEY = "codeferret.theme";
type Theme = "light" | "dark";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard, end: true },
  { to: "/repos", label: "Repositories", icon: IconRepos },
  { to: "/prs", label: "Pull Requests", icon: IconPrs },
  { to: "/reviews", label: "Code Review", icon: IconReviews },
  { to: "/rulebook", label: "Rulebook", icon: IconRulebook },
  { to: "/settings", label: "Settings", icon: IconSettings },
] as const;

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Review health and recent activity" },
  "/repos": { title: "Repositories", subtitle: "Connected repos and review config" },
  "/prs": { title: "Pull Requests", subtitle: "Every PR reviewed, with an advisory score" },
  "/reviews": { title: "Code Review", subtitle: "Automatic on PR · manual run from an open review" },
  "/rulebook": { title: "Rulebook", subtitle: "Team standards learned from feedback" },
  "/settings": { title: "Settings", subtitle: "Account, billing, members, and audit" },
  "/settings/bitbucket": { title: "Bitbucket accounts", subtitle: "Connect and manage Bitbucket workspaces" },
  "/profile": { title: "Profile", subtitle: "Your account and preferences" },
  "/onboarding": { title: "Onboarding", subtitle: "Get your first review in under 3 minutes" },
};

function pageMeta(pathname: string): { title: string; subtitle?: string } {
  if (pathname.startsWith("/repos/")) return { title: "Repository", subtitle: "Config, health, and runs" };
  if (pathname.startsWith("/runs/") || pathname.startsWith("/reviews/")) {
    return { title: "Code Review", subtitle: "Comments, suggestions, and verification" };
  }
  if (pathname === "/settings/bitbucket") {
    return titles["/settings/bitbucket"] ?? { title: "Bitbucket accounts" };
  }
  return titles[pathname] ?? { title: "CodeFerret" };
}

/** Maps the current route to a module accent used by index.css (data-module). */
function pageModule(pathname: string): string {
  if (pathname.startsWith("/repos")) return "repos";
  if (pathname.startsWith("/prs")) return "prs";
  if (pathname.startsWith("/reviews") || pathname.startsWith("/runs")) return "reviews";
  if (pathname.startsWith("/rulebook")) return "rulebook";
  if (pathname.startsWith("/settings") || pathname.startsWith("/profile") || pathname.startsWith("/onboarding")) {
    return "settings";
  }
  return "dashboard";
}

/** Which sidebar item should light up for a given path (covers nested routes like /runs/:id). */
function isNavActive(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  if (to === "/repos") return pathname === "/repos" || pathname.startsWith("/repos/");
  if (to === "/prs") return pathname === "/prs" || pathname.startsWith("/prs/");
  if (to === "/reviews") {
    return pathname === "/reviews" || pathname.startsWith("/reviews/") || pathname.startsWith("/runs/");
  }
  if (to === "/rulebook") return pathname === "/rulebook" || pathname.startsWith("/rulebook/");
  if (to === "/settings") {
    return (
      pathname === "/settings" ||
      pathname.startsWith("/settings/") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/onboarding")
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1.4M8 13.1v1.4M14.5 8h-1.4M2.9 8H1.5M12.5 3.5l-1 1M4.5 11.5l-1 1M12.5 12.5l-1-1M4.5 4.5l-1-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13.5 9.7A5.8 5.8 0 0 1 6.3 2.5a5.8 5.8 0 1 0 7.2 7.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="8" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconRepos({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M6 3.5h8.5A1.5 1.5 0 0 1 16 5v9.5A1.5 1.5 0 0 1 14.5 16H6A1.5 1.5 0 0 1 4.5 14.5V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M4.5 6.5H3A1 1 0 0 0 2 7.5v7A1.5 1.5 0 0 0 3.5 16H6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconPrs({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="5" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5" cy="14" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="14" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5.8V12.2M13 12.2V8.5A3.5 3.5 0 0 0 9.5 5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconReviews({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M3.5 4.5h11M3.5 9h8M3.5 13.5h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M13 11.5l1.5 1.5L17 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRulebook({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 3.5h8.5A1.5 1.5 0 0 1 14 5v10.5L9.5 13 5 15.5V5A1.5 1.5 0 0 1 6.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 2.5v1.8M9 13.7v1.8M2.5 9h1.8M13.7 9h1.8M4.2 4.2l1.3 1.3M12.5 12.5l1.3 1.3M13.8 4.2l-1.3 1.3M5.5 12.5l-1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3" aria-label="Main">
      <p className="sidebar-section-label type-label px-2.5">Workspace</p>
      {nav.map((item) => {
        const active = isNavActive(pathname, item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : false}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={`nav-item relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-[background-color,color,box-shadow] ${
              active
                ? "nav-active font-semibold"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950"
            }`}
          >
            <item.icon className={`size-[18px] shrink-0 ${active ? "opacity-100" : "opacity-70"}`} />
            <span className="sidebar-label tracking-wide">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = user?.initials ?? "?";
  const name = user?.name ?? "User";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-2.5 text-left hover:border-zinc-300"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-xs font-medium text-zinc-900">{name}</span>
          <span className="block truncate text-[11px] text-zinc-500">{user?.email}</span>
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 py-1 shadow-[0_12px_32px_color-mix(in_srgb,var(--color-zinc-950)_14%,transparent)]"
        >
          <div className="border-b border-zinc-200 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-zinc-900">{name}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Settings
          </Link>
          <Link
            to="/onboarding"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Add repositories
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="block w-full border-t border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function platformLabel(platform: Org["platform"] | undefined): string {
  if (platform === "bitbucket") return "Bitbucket";
  if (platform === "github") return "GitHub";
  if (platform === "demo") return "Demo";
  return "";
}

function orgInitials(name: string | undefined): string {
  const n = (name || "Or").trim();
  const parts = n.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

function OrgSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { data: org } = useOrg();
  const { data: orgs, selectedOrgId, selectOrg } = useOrgs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const multi = orgs.length > 1;
  const kindLabel = org?.kind === "individual" ? "Personal" : (org?.plan ?? "Free");
  const platform = platformLabel(org?.platform);
  const fullTitle = [org?.name, platform, kindLabel].filter(Boolean).join(" · ");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [selectedOrgId, collapsed]);

  if (collapsed) {
    return (
      <div className="flex justify-center p-1" title={fullTitle}>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold uppercase text-blue-800 ring-1 ring-blue-100">
          {orgInitials(org?.name)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => multi && setOpen((v) => !v)}
        disabled={!multi}
        aria-expanded={multi ? open : undefined}
        aria-haspopup={multi ? "listbox" : undefined}
        className={`flex w-full items-center gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50 px-2.5 py-2.5 text-left transition ${
          multi
            ? "cursor-pointer hover:border-blue-400/70 hover:bg-zinc-100 hover:shadow-sm"
            : "cursor-default"
        }`}
        title={org?.name}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold uppercase text-blue-800 ring-1 ring-blue-100">
          {orgInitials(org?.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-snug text-zinc-900">
            {org?.name || "Workspace"}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {platform && (
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                {platform}
              </span>
            )}
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
              {kindLabel}
            </span>
          </span>
        </span>
        {multi && (
          <svg
            className={`size-4 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {multi && open && (
        <div
          role="listbox"
          aria-label="Switch workspace"
          className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-64 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 shadow-[0_12px_40px_color-mix(in_srgb,var(--color-zinc-950)_18%,transparent)]"
        >
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Switch workspace
          </p>
          {orgs.map((o) => {
            const active = o.id === selectedOrgId;
            const oPlatform = platformLabel(o.platform);
            const oKind = o.kind === "individual" ? "Personal" : (o.plan ?? "Free");
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  selectOrg(o.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition ${
                  active ? "bg-blue-50/80" : "hover:bg-zinc-100"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${
                    active
                      ? "bg-[var(--rt-accent-bg)] text-[var(--rt-accent-fg)]"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {orgInitials(o.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900">{o.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                    {[oPlatform, oKind].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {active && (
                  <svg className="size-4 shrink-0 text-blue-600" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarBrand({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-3">
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-lg p-2 text-zinc-600 transition-[background-color,color] hover:bg-zinc-100 hover:text-zinc-900"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IconMenu />
        </button>
      )}
      <Link to="/dashboard" className="sidebar-label flex min-w-0 items-center gap-2.5" title="CodeFerret">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--rt-accent-bg)] text-[10px] font-bold text-[var(--rt-accent-fg)] shadow-[0_4px_12px_color-mix(in_srgb,var(--rt-accent-bg)_35%,transparent)]">
          CF
        </span>
        <span className="min-w-0">
          <span className="font-display block text-sm font-semibold tracking-[-0.02em] text-zinc-950">CodeFerret</span>
          <span className="type-meta mt-0.5 block">AI code review</span>
        </span>
      </Link>
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const meta = pageMeta(location.pathname);
  const module = pageModule(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  function toggleCollapsed() {
    setCollapsed((v) => !v);
  }

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden" data-theme={theme} data-module={module}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="app-sidebar hidden h-full shrink-0 flex-col overflow-hidden border-r border-zinc-200/80 bg-linear-to-b from-zinc-50/95 to-zinc-100/70 backdrop-blur-md lg:flex"
          data-collapsed={collapsed ? "true" : "false"}
        >
          <div className="shrink-0 border-b border-zinc-200/80">
            <SidebarBrand collapsed={collapsed} onToggle={toggleCollapsed} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain overflow-x-hidden">
            <SidebarNav collapsed={collapsed} />
          </div>
          <div className="shrink-0 border-t border-zinc-200/80 p-2.5">
            <OrgSwitcher collapsed={collapsed} />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-zinc-900/30"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 shadow-xl">
              <div className="flex shrink-0 items-center justify-between pr-2">
                <SidebarBrand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 18 18" fill="none" className="size-4" aria-hidden="true">
                    <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 shrink-0 border-b border-zinc-200/80 bg-zinc-50/92 shadow-[0_1px_0_color-mix(in_srgb,var(--color-zinc-950)_6%,transparent)] backdrop-blur-xl">
            <div className="app-module-bar h-0.5 w-full" aria-hidden="true" />
            <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-700 lg:hidden"
                aria-label="Open sidebar"
                onClick={() => setMobileOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="font-display truncate text-base font-semibold tracking-[-0.02em] text-zinc-950">{meta.title}</h1>
                {meta.subtitle && (
                  <p className="type-meta mt-0.5 hidden truncate sm:block">{meta.subtitle}</p>
                )}
              </div>

              <Link
                to="/reviews"
                className="hidden rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-300 hover:text-blue-700 sm:inline"
              >
                View reviews
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              >
                {theme === "light" ? <IconMoon /> : <IconSun />}
              </button>
              <ProfileMenu />
            </div>
          </header>

          <main className="app-workspace min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="w-full px-3 py-3 sm:px-4 sm:py-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/** Re-export helper for pages that need a local page heading under the shell title. */
export function PageIntro({
  title,
  description,
  actions,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  if (!title && !description && !actions) return null;
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200/80 pb-4">
      <div>
        {title && <h2 className="type-title">{title}</h2>}
        {description && (
          <p className={`type-body max-w-3xl ${title ? "mt-1" : ""}`}>{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
