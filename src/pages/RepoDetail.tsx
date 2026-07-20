import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRepo, useSaveRepoConfig } from "../features/repos/useRepos";
import { useRuns } from "../features/runs/useRuns";
import { useHealth } from "../features/health/useHealth";
import { DEMO_MODE } from "../lib/demo";
import { timeAgo, usd } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";
import { AreaTrendChart, CategoryBarChart, TrendChart } from "../components/charts";

const strictnessOptions = ["chill", "standard", "strict"] as const;

export default function RepoDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: repo, isLoading } = useRepo(id);
  const { data: runs, isLoading: runsLoading, error: runsError } = useRuns(repo?.name);
  const { data: health, isLoading: healthLoading } = useHealth(repo?.id);
  const saveConfig = useSaveRepoConfig(repo?.id);

  const [strictness, setStrictness] = useState<string | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [ignored, setIgnored] = useState<string | null>(null);
  const [failOnCritical, setFailOnCritical] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setStrictness(null);
    setBudget(null);
    setIgnored(null);
    setFailOnCritical(null);
    setSaved(false);
    setSaveError(null);
  }, [repo?.id]);

  if (isLoading) return <LoadingText>Loading…</LoadingText>;
  if (!repo) {
    return (
      <EmptyState>
        Repository not found.{" "}
        <Link to="/repos" className="text-blue-600 hover:underline">
          Back to repositories
        </Link>
      </EmptyState>
    );
  }

  const effStrictness = strictness ?? repo.strictness;
  const effBudget = budget ?? repo.commentBudget;
  const effIgnored = ignored ?? repo.ignoredPaths.join("\n");
  const effFail = failOnCritical ?? repo.failOnCritical;
  const snapshots = health?.snapshots ?? [];
  const recurring = health?.recurring ?? [];

  async function save() {
    setSaved(false);
    setSaveError(null);
    try {
      await saveConfig.mutateAsync({
        strictness: effStrictness as "chill" | "standard" | "strict",
        commentBudget: effBudget,
        ignoredPaths: effIgnored
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        failOnCritical: effFail,
      });
      setSaved(true);
    } catch (err) {
      setSaveError((err as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">
            <Link to="/repos" className="hover:text-zinc-700">
              Repositories
            </Link>{" "}
            /
          </p>
          <h1 className="text-xl font-semibold">
            {repo.owner ? `${repo.owner}/` : ""}
            {repo.name}
          </h1>
        </div>
        <Badge kind={repo.indexStatus}>index: {repo.indexStatus}</Badge>
      </div>

      <Card className="p-5">
        <SectionTitle hint="mirrors .review.yml — the repo file overrides these when present">
          Review configuration
        </SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-600">Strictness</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {strictnessOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStrictness(opt)}
                  className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                    effStrictness === opt
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs text-zinc-600">
              Comment budget:{" "}
              <span className="font-medium text-zinc-800">{effBudget} line comments / run</span>
            </label>
            <input
              type="range"
              min={3}
              max={15}
              value={effBudget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 w-full accent-blue-500"
            />
            <p className="text-[11px] text-zinc-600">
              Only critical/major verified findings become line comments; the rest go to the digest.
            </p>

            <label className="mt-5 flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={effFail}
                onChange={(e) => setFailOnCritical(e.target.checked)}
                className="accent-blue-500"
              />
              Fail the check on critical verified findings
            </label>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Ignored paths (one glob per line)</label>
            <textarea
              value={effIgnored}
              onChange={(e) => setIgnored(e.target.value)}
              rows={5}
              spellCheck={false}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs text-zinc-800 focus:border-zinc-500 focus:outline-none"
              placeholder="**/*.gen.ts"
            />
            <p className="mt-3 text-xs text-zinc-600">Tier-1 (AST) languages detected:</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {repo.tier1Langs.length > 0 ? (
                repo.tier1Langs.map((lang) => (
                  <span key={lang} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-700">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-600">none yet</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saveConfig.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saveConfig.isPending ? "Saving…" : "Save configuration"}
          </button>
          {saved && (
            <span className="text-xs text-emerald-600">
              Saved{DEMO_MODE ? " locally" : ""}
            </span>
          )}
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Repository health</h2>
          <span className="text-xs text-zinc-500">weekly snapshots</span>
        </div>
        {healthLoading && <LoadingText>Loading health…</LoadingText>}
        {!healthLoading && health?.source === "plan_required" && (
          <Card className="flex flex-col items-start gap-2 border-blue-200 bg-blue-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Repo health reports are a Team-plan feature</p>
              <p className="mt-0.5 text-xs text-zinc-600">Upgrade to see risk accumulation, untested-change trends, and recurring finding categories.</p>
            </div>
            <Link to="/settings" className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800">
              Upgrade to Team
            </Link>
          </Card>
        )}
        {!healthLoading && health?.source !== "plan_required" && snapshots.length === 0 ? (
          <EmptyState>
            No health snapshots yet. They appear after the <code>health.snapshot</code> job runs.
          </EmptyState>
        ) : health?.source !== "plan_required" && (
          !healthLoading && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-4">
                <SectionTitle>Risk accumulation</SectionTitle>
                <AreaTrendChart data={snapshots} xKey="week" yKey="riskScore" label="Risk score" height={180} />
              </Card>
              <Card className="p-4">
                <SectionTitle>Untested changes</SectionTitle>
                <TrendChart
                  data={snapshots}
                  xKey="week"
                  yDomain={[0, 60]}
                  unit="%"
                  height={180}
                  series={[{ key: "untestedPct", label: "Changed logic without tests %" }]}
                />
              </Card>
              <Card className="p-4">
                <SectionTitle>Recurring finding categories</SectionTitle>
                {recurring.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-600">No recurring categories</p>
                ) : (
                  <CategoryBarChart data={recurring} xKey="category" yKey="count" label="Findings" height={180} />
                )}
              </Card>
            </div>
          )
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Recent runs</h2>
        {runsLoading && <LoadingText>Loading runs…</LoadingText>}
        {runsError && <ErrorText>{(runsError as Error).message}</ErrorText>}
        {runs && runs.length === 0 && <EmptyState>No runs for this repository yet.</EmptyState>}
        {runs && runs.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50">
            {runs.map((run) => (
              <li key={run.id}>
                <Link
                  to={`/runs/${run.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-zinc-100/80"
                >
                  <p className="text-sm">
                    #{run.pull_requests?.number}
                    <span className="ml-2 font-mono text-xs text-zinc-500">{run.head_sha.slice(0, 7)}</span>
                    <span className="ml-2 text-xs text-zinc-500">{timeAgo(run.started_at)}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-500">
                      {run.verified}/{run.candidates} verified · {usd(Number(run.llm_cost_usd))}
                    </span>
                    <Badge kind={run.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
