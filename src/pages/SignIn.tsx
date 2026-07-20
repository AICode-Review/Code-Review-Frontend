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
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-900 px-12 py-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 420px at 12% 8%, rgba(37,99,235,0.35), transparent 60%), radial-gradient(600px 420px at 100% 100%, rgba(37,99,235,0.18), transparent 55%)",
          }}
        />
        <Link to="/" className="relative text-lg font-semibold tracking-tight">
          CodeFerret
        </Link>
        <div className="relative">
          <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight">
            Code review comments that survive verification before they reach you.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-blue-400">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/security" className="relative text-xs text-zinc-500 hover:text-zinc-300">
          How we handle your code →
        </Link>
      </div>

      {/* Auth panel */}
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-lg font-semibold tracking-tight text-zinc-900 lg:hidden">
            CodeFerret
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 lg:mt-0">
            {DEMO_MODE ? "Explore the demo" : "Sign in to CodeFerret"}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600">
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
                className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Open the dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => void signInWithGitHub()}
                  className="flex items-center justify-center gap-2.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  <GithubMark className="h-4 w-4" />
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={() => void signInWithBitbucket()}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-400"
                >
                  <BitbucketMark className="h-4 w-4" />
                  Continue with Bitbucket
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-zinc-500">
            {DEMO_MODE
              ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env to enable real sign-in."
              : "This signs you into the CodeFerret dashboard. Automatic PR reviews need the GitHub App installed separately — you'll do that next, from onboarding."}
          </p>

          <Link to="/" className="mt-8 inline-block text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
