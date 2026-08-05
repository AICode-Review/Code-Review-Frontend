import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DEMO_MODE } from "../lib/demo";

function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function BitbucketMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#2684FF" aria-hidden>
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.868h13.56a.768.768 0 0 0 .768-.645l3.263-20.033a.768.768 0 0 0-.768-.892Zm14.318 13.402H8.9L7.05 9.104h9.156Z" />
    </svg>
  );
}

const benefits = [
  "Automatic reviews on every pull request",
  "Only verified findings reach your team — no noise",
  "Free forever on public repositories",
];

export default function SignIn() {
  const { authenticated, loading, signInWithGitHub, signInWithBitbucket } = useAuth();
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("error_description") ?? searchParams.get("error");

  if (!loading && authenticated && !DEMO_MODE) return <Navigate to="/dashboard" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="marketing-shell relative hidden flex-col justify-between overflow-hidden px-12 py-10 lg:flex">
        <div className="mk-mesh pointer-events-none absolute inset-0" aria-hidden="true" />
        <Link to="/" className="font-display relative inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[var(--mk-ink)]">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--mk-accent)] text-[10px] font-bold text-[var(--mk-accent-fg)] shadow-[0_4px_14px_rgba(20,184,166,0.35)]">
            CF
          </span>
          CodeFerret
        </Link>
        <div className="relative">
          <p className="font-display max-w-sm text-3xl font-semibold leading-snug tracking-tight text-[var(--mk-ink)]">
            Code review comments that survive verification before they reach you.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-6 text-[var(--mk-muted)]">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 font-semibold text-[var(--mk-accent)]">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/security" className="relative text-xs text-[var(--mk-faint)] transition hover:text-[var(--mk-accent)]">
          How we handle your code →
        </Link>
      </div>

      {/* Auth panel */}
      <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-md bg-teal-600 text-[9px] font-bold text-white">
              CF
            </span>
            CodeFerret
          </Link>

          <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight text-slate-900 lg:mt-0">
            {DEMO_MODE ? "Explore the demo" : "Sign in to CodeFerret"}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            {DEMO_MODE
              ? "No account needed — the dashboard is preloaded with sample data."
              : "Connect your GitHub or Bitbucket account to get started."}
          </p>

          {authError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {authError}
            </p>
          )}

          <div className="mt-8">
            {DEMO_MODE ? (
              <Link
                to="/dashboard"
                className="flex w-full items-center justify-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(13,148,136,0.3)] transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                Open the dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => void signInWithGitHub()}
                  className="flex items-center justify-center gap-2.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <GithubMark className="h-4 w-4" />
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={() => void signInWithBitbucket()}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
                >
                  <BitbucketMark className="h-4 w-4" />
                  Continue with Bitbucket
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            {DEMO_MODE
              ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env to enable real sign-in."
              : "This signs you into the CodeFerret dashboard. Automatic PR reviews need the GitHub App installed separately — you'll do that next, from onboarding."}
          </p>

          {!DEMO_MODE && (
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              By continuing you agree to the{" "}
              <Link to="/terms" className="underline hover:text-slate-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-slate-700">
                Privacy Policy
              </Link>
              .
            </p>
          )}

          <Link to="/" className="mt-8 inline-block text-sm text-slate-500 transition hover:text-teal-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
