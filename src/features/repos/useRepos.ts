import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE, demoRepos, type DemoRepo } from "../../lib/demo";
import { repoConfigSchema, type RepoConfigPayload } from "../../lib/schemas";
import { useOrg } from "../../hooks/useOrg";

export type Repo = DemoRepo;

interface RepoRow {
  id: string;
  name: string;
  default_branch: string;
  index_status: Repo["indexStatus"];
  tier1_langs: string[];
  config: Record<string, unknown> | null;
  orgs?: { name: string } | null;
}

interface RepoFeedbackStats {
  posted: number;
  accepted: number;
  dismissed: number;
}

/** Same formula as backend/src/routes/analyticsAggregation.ts's buildWeeklyAnalytics — kept
 * in sync by hand since frontend/backend share no code (CLAUDE.md's boundary rule). */
function feedbackPcts(stats: RepoFeedbackStats | undefined): { acceptancePct: number; noisePct: number } {
  if (!stats) return { acceptancePct: 0, noisePct: 0 };
  const feedbackTotal = stats.accepted + stats.dismissed;
  return {
    acceptancePct: feedbackTotal > 0 ? Math.round((stats.accepted / feedbackTotal) * 100) : 0,
    noisePct: stats.posted > 0 ? Math.round((stats.dismissed / stats.posted) * 1000) / 10 : 0,
  };
}

function fromRow(row: RepoRow, openPrs: number, feedback: RepoFeedbackStats | undefined): Repo {
  const config = row.config ?? {};
  return {
    id: row.id,
    name: row.name,
    owner: row.orgs?.name ?? "",
    defaultBranch: row.default_branch,
    indexStatus: row.index_status,
    tier1Langs: row.tier1_langs ?? [],
    strictness: (config["strictness"] as Repo["strictness"]) ?? "standard",
    commentBudget: (config["commentBudget"] as number) ?? 7,
    ignoredPaths: (config["ignoredPaths"] as string[]) ?? [],
    failOnCritical: (config["failOnCritical"] as boolean) ?? false,
    openPrs,
    ...feedbackPcts(feedback),
  };
}

/** Repos for the currently-selected org only — a user in multiple orgs must not see them mixed together. */
export function useRepos() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["repos", orgId],
    enabled: DEMO_MODE || Boolean(orgId),
    queryFn: async (): Promise<Repo[]> => {
      if (DEMO_MODE || !supabase || !orgId) return demoRepos;
      const { data, error } = await supabase
        .from("repos")
        .select("id, name, default_branch, index_status, tier1_langs, config, orgs(name)")
        .eq("org_id", orgId)
        .order("name");
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as unknown as RepoRow[];

      // Live open-PR counts, one query for the whole org rather than one per repo.
      const repoIds = rows.map((r) => r.id);
      const openPrCounts = new Map<string, number>();
      if (repoIds.length > 0) {
        const { data: openPrs, error: prError } = await supabase
          .from("pull_requests")
          .select("repo_id")
          .in("repo_id", repoIds)
          .eq("state", "open");
        if (prError) throw new Error(prError.message);
        for (const pr of (openPrs ?? []) as { repo_id: string }[]) {
          openPrCounts.set(pr.repo_id, (openPrCounts.get(pr.repo_id) ?? 0) + 1);
        }
      }

      // Finding feedback per repo, via one nested-embed query (pull_requests -> review_runs ->
      // findings) rather than N+1 per-repo round trips — RLS already scopes all three tables
      // to the caller's org membership (0001_init.sql).
      const feedbackByRepo = new Map<string, RepoFeedbackStats>();
      if (repoIds.length > 0) {
        const { data: prTree, error: feedbackError } = await supabase
          .from("pull_requests")
          .select("repo_id, review_runs(findings(posted, feedback))")
          .in("repo_id", repoIds);
        if (feedbackError) throw new Error(feedbackError.message);
        type FindingRow = { posted: boolean; feedback: string | null };
        type PrTreeRow = { repo_id: string; review_runs: { findings: FindingRow[] }[] | null };
        for (const pr of (prTree ?? []) as unknown as PrTreeRow[]) {
          const stats = feedbackByRepo.get(pr.repo_id) ?? { posted: 0, accepted: 0, dismissed: 0 };
          for (const run of pr.review_runs ?? []) {
            for (const f of run.findings ?? []) {
              if (!f.posted) continue;
              stats.posted++;
              if (f.feedback === "accepted" || f.feedback === "fixed") stats.accepted++;
              if (f.feedback === "dismissed" || f.feedback === "ignored") stats.dismissed++;
            }
          }
          feedbackByRepo.set(pr.repo_id, stats);
        }
      }

      return rows.map((row) => fromRow(row, openPrCounts.get(row.id) ?? 0, feedbackByRepo.get(row.id)));
    },
  });
}

export function useRepo(id: string | undefined) {
  const repos = useRepos();
  return {
    ...repos,
    data: id ? repos.data?.find((r) => r.id === id) : undefined,
  };
}

export function useSaveRepoConfig(repoId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RepoConfigPayload) => {
      const parsed = repoConfigSchema.parse(config);
      if (DEMO_MODE) return parsed;
      if (!repoId) throw new Error("Missing repository id");
      await api(`/api/repos/${repoId}/config`, {
        method: "PATCH",
        body: JSON.stringify(parsed),
      });
      return parsed;
    },
    onSuccess: () => {
      // ["repos", orgId] — partial-key invalidation refetches whichever org is selected.
      void queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}
