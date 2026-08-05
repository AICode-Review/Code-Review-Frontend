import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { DEMO_MODE } from "../lib/demo";

type Status = "idle" | "accepting" | "done" | "error";

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <Link to="/" className="font-display inline-flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-slate-900">
        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-[10px] font-bold text-white shadow-[0_4px_14px_rgba(13,148,136,0.3)]">
          CF
        </span>
        CodeFerret
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        {children}
      </div>
    </div>
  );
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { authenticated, loading, signInWithGitHub } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `status` is deliberately NOT a dependency: including it would make this
    // effect tear itself down (and cancel its own timer/request) the instant
    // setStatus("accepting") below causes a re-render. `cancelled` guards
    // against setting state after this effect's own cleanup runs instead.
    if (!authenticated || !token) return;
    let cancelled = false;
    setStatus("accepting");
    if (DEMO_MODE) {
      const timer = setTimeout(() => {
        if (!cancelled) setStatus("done");
      }, 400);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    api(`/api/invites/${token}/accept`, { method: "POST" })
      .then(() => {
        if (!cancelled) setStatus("done");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to accept invite");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, token]);

  if (!token) {
    return (
      <Centered>
        <p className="text-sm text-slate-600">This invite link is missing its token.</p>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
          <span className="size-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          Loading…
        </p>
      </Centered>
    );
  }

  if (!authenticated) {
    return (
      <Centered>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Sign in with the email address this invite was sent to, and you'll join the organization
          automatically.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGitHub(`/invite/${token}`)}
          className="mt-6 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(13,148,136,0.3)] transition hover:-translate-y-0.5 hover:bg-teal-700"
        >
          Continue with GitHub
        </button>
      </Centered>
    );
  }

  if (status === "idle" || status === "accepting") {
    return (
      <Centered>
        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
          <span className="size-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          Joining organization…
        </p>
      </Centered>
    );
  }

  if (status === "error") {
    return (
      <Centered>
        <p className="max-w-sm text-sm text-red-600">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
          Go to dashboard
        </Link>
      </Centered>
    );
  }

  return (
    <Centered>
      <p className="text-sm font-medium text-slate-800">You're in — welcome to the team.</p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mt-6 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(13,148,136,0.3)] transition hover:-translate-y-0.5 hover:bg-teal-700"
      >
        Go to dashboard
      </button>
    </Centered>
  );
}
