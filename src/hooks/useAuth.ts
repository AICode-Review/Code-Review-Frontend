import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { DEMO_MODE } from "../lib/demo";

export interface AuthUser {
  email: string;
  name: string;
  initials: string;
  provider: string;
}

function initialsFrom(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  if (parts[0] && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return (email.slice(0, 2) || "?").toUpperCase();
}

function userFromSession(session: Session): AuthUser {
  const email = session.user.email ?? "—";
  const meta = session.user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (meta?.["full_name"] as string | undefined) ||
    (meta?.["name"] as string | undefined) ||
    (meta?.["user_name"] as string | undefined) ||
    email.split("@")[0] ||
    "User";
  return {
    email,
    name,
    initials: initialsFrom(name, email),
    provider: (session.user.app_metadata.provider as string | undefined) ?? "—",
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user: AuthUser | null = DEMO_MODE
    ? {
        email: "demo@codeferret.dev",
        name: "Demo User",
        initials: "DU",
        provider: "demo",
      }
    : session
      ? userFromSession(session)
      : null;

  return {
    authenticated: DEMO_MODE || session !== null,
    loading,
    user,
    signInWithGitHub: (redirectPath = "/dashboard") =>
      supabase
        ? supabase.auth.signInWithOAuth({
            provider: "github",
            options: { redirectTo: `${window.location.origin}${redirectPath}` },
          })
        : Promise.resolve(),
    signInWithBitbucket: (redirectPath = "/dashboard") =>
      supabase
        ? supabase.auth.signInWithOAuth({
            provider: "bitbucket",
            options: { redirectTo: `${window.location.origin}${redirectPath}` },
          })
        : Promise.resolve(),
    signOut: () => (supabase ? supabase.auth.signOut() : Promise.resolve()),
  };
}
