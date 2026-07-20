import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { DEMO_MODE } from "../lib/demo";

type Status = "idle" | "accepting" | "done" | "error";

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Link to="/" className="text-2xl font-semibold tracking-tight text-zinc-900">
        CodeFerret
      </Link>
      {children}
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
        <p className="text-sm text-zinc-600">This invite link is missing its token.</p>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <p className="text-sm text-zinc-500">Loading…</p>
      </Centered>
    );
  }

  if (!authenticated) {
    return (
      <Centered>
        <p className="max-w-sm text-sm text-zinc-600">
          Sign in with the email address this invite was sent to, and you'll join the organization
          automatically.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGitHub(`/invite/${token}`)}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continue with GitHub
        </button>
      </Centered>
    );
  }

  if (status === "idle" || status === "accepting") {
    return (
      <Centered>
        <p className="text-sm text-zinc-500">Joining organization…</p>
      </Centered>
    );
  }

  if (status === "error") {
    return (
      <Centered>
        <p className="max-w-sm text-sm text-red-600">{error}</p>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          Go to dashboard
        </Link>
      </Centered>
    );
  }

  return (
    <Centered>
      <p className="text-sm text-zinc-700">You're in — welcome to the team.</p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Go to dashboard
      </button>
    </Centered>
  );
}
