import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { OrgProvider } from "./hooks/useOrg";
import { PublicHeader } from "./components/ui";
import { AppShell } from "./components/layout/AppShell";

// Route-level code splitting — each page becomes its own chunk, fetched on
// navigation instead of all bundled into one ~1.1MB entry file.
const Landing = lazy(() => import("./pages/public/Landing"));
const Pricing = lazy(() => import("./pages/public/Pricing"));
const Security = lazy(() => import("./pages/public/Security"));
const Benchmark = lazy(() => import("./pages/public/Benchmark"));
const Cli = lazy(() => import("./pages/public/Cli"));
const BitbucketSetup = lazy(() => import("./pages/public/BitbucketSetup"));
const Terms = lazy(() => import("./pages/public/Terms"));
const Privacy = lazy(() => import("./pages/public/Privacy"));
const SignIn = lazy(() => import("./pages/SignIn"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Repos = lazy(() => import("./pages/Repos"));
const RepoDetail = lazy(() => import("./pages/RepoDetail"));
const Prs = lazy(() => import("./pages/Prs"));
const RunDetail = lazy(() => import("./pages/RunDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Rulebook = lazy(() => import("./pages/Rulebook"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

function RouteFallback() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">Loading…</div>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a08] font-mono text-[#c9c2b3]">
      <PublicHeader />
      <Outlet />
      <footer className="border-t border-[#3a2f1f] bg-[#0a0a08]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-xs uppercase tracking-wide text-[#6b6252] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CodeFerret // EOF</span>
          <span>Web app · PR bot · CLI · GitHub · Bitbucket</span>
          <nav className="flex gap-4">
            <Link to="/terms" className="hover:text-[#ffb300]">Terms</Link>
            <Link to="/privacy" className="hover:text-[#ffb300]">Privacy</Link>
            <Link to="/security" className="hover:text-[#ffb300]">Security</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ProtectedShell() {
  const { authenticated, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-500">Loading…</div>;
  }
  // Preserve any ?error=/error_description= Supabase attaches to a failed OAuth
  // callback — otherwise it's silently dropped on the way to /signin and the
  // failure is invisible.
  if (!authenticated) return <Navigate to={`/signin${window.location.search}`} replace />;
  return (
    <OrgProvider>
      <AppShell />
    </OrgProvider>
  );
}

function NotFound() {
  const { authenticated } = useAuth();
  return <Navigate to={authenticated ? "/dashboard" : "/"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/cli" element={<Cli />} />
              <Route path="/security" element={<Security />} />
              <Route path="/benchmark" element={<Benchmark />} />
              <Route path="/docs/bitbucket" element={<BitbucketSetup />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>

            <Route path="/signin" element={<SignIn />} />
            <Route path="/invite/:token" element={<AcceptInvite />} />

            <Route element={<ProtectedShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/repos" element={<Repos />} />
              <Route path="/repos/:id" element={<RepoDetail />} />
              <Route path="/prs" element={<Prs />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/runs/:id" element={<RunDetail />} />
              <Route path="/rulebook" element={<Rulebook />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
