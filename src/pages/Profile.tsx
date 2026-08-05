import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOrg } from "../hooks/useOrg";
import { loadOnboarding } from "../lib/onboarding";
import { Card, SectionTitle } from "../components/ui";
import { PageIntro } from "../components/layout/AppShell";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: org } = useOrg();
  const onboarding = loadOnboarding();

  return (
    <div className="space-y-5">
      <PageIntro description="Your identity in this workspace." />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
      <Card className="bg-linear-to-br from-zinc-50 to-blue-50/40 p-6 shadow-sm lg:row-span-2">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-600/15">
            {user?.initials ?? "?"}
          </span>
          <div className="min-w-0">
            <h2 className="font-display truncate text-lg font-semibold tracking-tight text-zinc-900">{user?.name}</h2>
            <p className="truncate text-sm text-zinc-600">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-zinc-500">Signed in via {user?.provider}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle>Organization</SectionTitle>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Name</dt>
            <dd className="text-zinc-800">{org?.name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Plan</dt>
            <dd className="text-zinc-800">{org?.plan || "Free"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Platform</dt>
            <dd className="capitalize text-zinc-800">{org?.platform || "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-5">
        <SectionTitle>Setup</SectionTitle>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Onboarding</dt>
            <dd className="text-zinc-800">
              {onboarding?.completed ? (
                <span className="text-emerald-600">Completed</span>
              ) : (
                <Link to="/onboarding" className="text-blue-600 hover:underline">
                  Continue setup →
                </Link>
              )}
            </dd>
          </div>
          {onboarding?.preset && (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Strictness preset</dt>
              <dd className="capitalize text-zinc-800">{onboarding.preset}</dd>
            </div>
          )}
        </dl>
      </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/settings"
          className="rounded-xl border border-zinc-200/90 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100/80"
        >
          Open settings
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-xl border border-zinc-200/90 px-4 py-2 text-sm text-zinc-500 transition hover:border-red-400 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
