import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRepos } from "../features/repos/useRepos";
import { DEMO_MODE } from "../lib/demo";
import { api } from "../lib/api";
import { loadOnboarding, saveOnboarding } from "../lib/onboarding";
import { onboardingFinishSchema } from "../lib/schemas";
import { useOrg } from "../hooks/useOrg";
import { Card, EmptyState, LoadingText } from "../components/ui";

const GITHUB_INSTALL_URL =
  (import.meta.env.VITE_GITHUB_APP_INSTALL_URL as string | undefined) ??
  "https://github.com/apps/codeferret-dev/installations/new";

const presets = [
  {
    id: "chill",
    name: "Chill",
    blurb: "Critical findings only, 3-comment budget. For teams that hate bot noise.",
  },
  {
    id: "standard",
    name: "Standard",
    blurb: "Critical + major verified findings, 7-comment budget, digest for the rest.",
  },
  {
    id: "strict",
    name: "Strict",
    blurb: "Everything verified gets surfaced, 15-comment budget, check fails on critical.",
  },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const { data: org } = useOrg();
  const { data: repos, isLoading: reposLoading } = useRepos();
  const [step, setStep] = useState(1);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [preset, setPreset] = useState<"chill" | "standard" | "strict">("standard");
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadOnboarding();
    if (saved?.completed) {
      setSelectedRepos(saved.repoIds);
      setPreset(saved.preset);
    }
  }, []);

  const toggleRepo = (id: string) =>
    setSelectedRepos((sel) => (sel.includes(id) ? sel.filter((n) => n !== id) : [...sel, id]));

  async function finish() {
    setFinishError(null);
    const payload = onboardingFinishSchema.parse({ repoIds: selectedRepos, preset });
    setFinishing(true);
    try {
      if (!DEMO_MODE && org?.id) {
        // Applies the chosen preset to each selected repo's config server-side — a real
        // effect, not a formality, so a failure here must stop the flow rather than let
        // the user believe their repos are configured when they aren't.
        await api(`/api/orgs/${org.id}/onboarding`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      saveOnboarding({
        completed: true,
        repoIds: payload.repoIds,
        preset: payload.preset,
        completedAt: new Date().toISOString(),
      });
      navigate("/dashboard");
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : "Failed to save onboarding — please try again.");
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Quick setup</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Get your first review in under 3 minutes</h2>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          Step {step} of 3
        </span>
      </div>
      <div className="mt-4 flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-blue-600" : "bg-zinc-200"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold">1 · Install on your git host</h2>
          <p className="mt-2 text-sm text-zinc-600">
            CodeFerret needs read access to code and write access to pull requests and checks. Prefer
            the in-platform bot for automatic PR reviews; use the{" "}
            <Link to="/cli" className="text-blue-600 hover:underline">
              CLI
            </Link>{" "}
            for local / CI reviews before you open a PR.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={GITHUB_INSTALL_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Install on GitHub ↗
            </a>
            <Link
              to="/settings"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400"
            >
              Connect Bitbucket in Settings
            </Link>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400"
            >
              {DEMO_MODE ? "Continue" : "I've installed it"}
            </button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold">2 · Pick repositories to review</h2>
          {reposLoading && <LoadingText>Loading repositories…</LoadingText>}
          {!reposLoading && (!repos || repos.length === 0) && (
            <EmptyState>
              No repositories found yet. Install the GitHub App, then refresh this page.
            </EmptyState>
          )}
          <ul className="mt-4 space-y-2">
            {repos?.map((repo) => (
              <li key={repo.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={selectedRepos.includes(repo.id)}
                    onChange={() => toggleRepo(repo.id)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-zinc-800">
                    {repo.owner ? `${repo.owner}/` : ""}
                    {repo.name}
                  </span>
                  <span className="ml-auto text-xs text-zinc-500">{repo.openPrs} open PRs</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={selectedRepos.length === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue ({selectedRepos.length} selected)
            </button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold">3 · Choose a strictness preset</h2>
          <p className="mt-1 text-xs text-zinc-500">
            You can override per-repo later with <code>.review.yml</code> or from the repo page.
          </p>
          <div className="mt-4 space-y-2">
            {presets.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 ${
                  preset === p.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  checked={preset === p.id}
                  onChange={() => setPreset(p.id)}
                  className="mt-0.5 accent-blue-500"
                />
                <span>
                  <span className="block text-sm font-medium text-zinc-900">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-zinc-600">{p.blurb}</span>
                </span>
              </label>
            ))}
          </div>
          {finishError && <p className="mt-3 text-xs text-red-600">{finishError}</p>}
          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={finishing}
              onClick={() => void finish()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {finishing ? "Saving…" : "Finish — open a PR to see it work"}
            </button>
          </div>
        </Card>
      )}

      <p className="mt-4 text-xs text-zinc-600">
        Already set up?{" "}
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Go to the dashboard
        </Link>
        . Want local reviews first?{" "}
        <Link to="/cli" className="text-blue-600 hover:underline">
          CLI docs
        </Link>
        .
      </p>
    </div>
  );
}
