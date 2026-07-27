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
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
      <p className="sidebar-section-label type-label px-2.5">Workspace</p>
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-[background-color,color,box-shadow] ${
              isActive
                ? "nav-active font-medium"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950"
            }`
          }
        >
          <item.icon className="size-[18px] shrink-0 opacity-80" />
          <span className="sidebar-label tracking-wide">{item.label}</span>
        </NavLink>
      ))}
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
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-xs font-semibold text-blue-700">
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
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 py-1 shadow-lg shadow-zinc-300/50"
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

function OrgSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { data: org } = useOrg();
  const { data: orgs, selectedOrgId, selectOrg } = useOrgs();
  const kindLabel = org?.kind === "individual" ? "Personal account" : (org?.plan ?? "Free") + " plan";
  const platform = platformLabel(org?.platform);
  const subLabel = platform ? `${platform} · ${kindLabel}` : kindLabel;
  const initials = (org?.name || "Or").slice(0, 2);

  return (
    <div
      className={`flex overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-2 ${
        collapsed ? "justify-center" : "items-center gap-2.5"
      }`}
      title={collapsed ? `${org?.name || "Organization"} · ${subLabel}` : undefined}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-semibold uppercase text-zinc-700">
        {initials}
      </span>
      <div className="sidebar-label flex min-w-0 flex-1 flex-col gap-0.5">
        {orgs.length <= 1 ? (
          <>
            <p className="text-[10px] uppercase leading-none tracking-wider text-zinc-500">
              {org?.kind === "individual" ? "Personal" : "Organization"}
            </p>
            <p className="truncate text-sm font-medium leading-snug text-zinc-800">{org?.name || "—"}</p>
            <p className="truncate text-[11px] leading-snug text-zinc-500">{subLabel}</p>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase leading-none tracking-wider text-zinc-500">Workspace</p>
            <select
              value={selectedOrgId ?? ""}
              onChange={(e) => selectOrg(e.target.value)}
              className="w-full min-w-0 truncate rounded-md border border-zinc-200 bg-zinc-50 py-1 pl-1.5 pr-6 text-sm font-medium leading-snug text-zinc-800"
              tabIndex={collapsed ? -1 : 0}
              aria-hidden={collapsed}
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.kind === "individual" ? " (personal)" : ""}
                  {o.platform === "bitbucket" ? " · Bitbucket" : o.platform === "github" ? " · GitHub" : ""}
                </option>
              ))}
            </select>
            <p className="truncate text-[11px] leading-snug text-zinc-500">{subLabel}</p>
          </>
        )}
      </div>
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
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--rt-accent-bg)]/50 bg-[var(--rt-accent-bg)] text-[10px] font-bold text-[var(--rt-accent-fg)]">
          CF
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-[-0.02em] text-zinc-950">CodeFerret</span>
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
          <div className="shrink-0 border-t border-zinc-200 p-2">
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
          <header className="z-30 shrink-0 border-b border-zinc-200/80 bg-zinc-50/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
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
                <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-zinc-950">{meta.title}</h1>
                {meta.subtitle && (
                  <p className="type-meta mt-0.5 hidden truncate sm:block">{meta.subtitle}</p>
                )}
              </div>

              <Link
                to="/reviews"
                className="hidden rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 sm:inline"
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
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200/70 pb-4">
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
