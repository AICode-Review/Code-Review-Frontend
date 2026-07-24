import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE } from "../../lib/demo";
import { getDemoRuns, subscribeDemoStore } from "../../lib/demoStore";
import { useOrg } from "../../hooks/useOrg";

export interface RunRow {
  id: string;
  pr_id: string;
  head_sha: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  finished_at: string | null;
  candidates: number;
  verified: number;
  posted: number;
  digest?: number;
  llm_cost_usd: number;
  latency_ms: number | null;
  error?: string | null;
  trigger?: "automatic" | "manual";
  summary?: string | null;
  pull_requests: {
    number: number;
    repos: { name: string } | null;
    opened_by?: string | null;
  } | null;
}

/**
 * Runs feed for the currently-selected org only (RLS alone is not enough —
 * a user in GitHub + Bitbucket orgs would otherwise see both orgs' runs mixed
 * on every dashboard). Kept live via realtime on review_runs.
 * In demo mode it serves the mutable demo store (supports re-run).
 */
export function useRuns(repoName?: string) {
  const { data: org } = useOrg();
  const orgId = org?.id;
  const queryClient = useQueryClient();
  const [, bump] = useState(0);

  useEffect(() => {
    if (!DEMO_MODE) return;
    return subscribeDemoStore(() => {
      bump((n) => n + 1);
      void queryClient.invalidateQueries({ queryKey: ["runs"] });
      void queryClient.invalidateQueries({ queryKey: ["run"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
    });
  }, [queryClient]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel(`review_runs_feed_${orgId ?? "none"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "review_runs" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["runs"] });
        void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      })
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [queryClient, orgId]);

  return useQuery({
    queryKey: ["runs", orgId, repoName ?? "all", bump],
    enabled: DEMO_MODE || Boolean(orgId),
    queryFn: async (): Promise<RunRow[]> => {
      if (DEMO_MODE || !supabase || !orgId) {
        const rows = getDemoRuns();
        return repoName ? rows.filter((r) => r.pull_requests?.repos?.name === repoName) : rows;
      }

      // Scope to this org's repos first — same pattern as usePrs — so a Bitbucket
      // workspace never inherits GitHub/Demo runs the user can still RLS-read.
      let reposQuery = supabase.from("repos").select("id").eq("org_id", orgId);
      if (repoName) reposQuery = reposQuery.eq("name", repoName);
      const { data: repoRows, error: repoError } = await reposQuery;
      if (repoError) throw new Error(repoError.message);
      const repoIds = (repoRows ?? []).map((r) => r.id as string);
      if (repoIds.length === 0) return [];

      const { data: prRows, error: prError } = await supabase.from("pull_requests").select("id").in("repo_id", repoIds);
      if (prError) throw new Error(prError.message);
      const prIds = (prRows ?? []).map((p) => p.id as string);
      if (prIds.length === 0) return [];

      const { data, error } = await supabase
        .from("review_runs")
        .select("*, pull_requests(number, opened_by, repos(name))")
        .in("pr_id", prIds)
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as RunRow[];
    },
  });
}
