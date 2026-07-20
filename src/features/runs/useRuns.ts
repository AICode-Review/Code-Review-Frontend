import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE } from "../../lib/demo";
import { getDemoRuns, subscribeDemoStore } from "../../lib/demoStore";

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
 * Runs feed: RLS-scoped read straight from Supabase, kept live via a
 * realtime subscription on review_runs (DESIGN.md §3, §10).
 * In demo mode it serves the mutable demo store (supports re-run).
 */
export function useRuns(repoName?: string) {
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
      .channel("review_runs_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "review_runs" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["runs"] });
        void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      })
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["runs", repoName ?? "all", bump],
    queryFn: async (): Promise<RunRow[]> => {
      if (DEMO_MODE || !supabase) {
        const rows = getDemoRuns();
        return repoName
          ? rows.filter((r) => r.pull_requests?.repos?.name === repoName)
          : rows;
      }
      const { data, error } = await supabase
        .from("review_runs")
        .select("*, pull_requests(number, repos(name))")
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as unknown as RunRow[];
      return repoName ? rows.filter((r) => r.pull_requests?.repos?.name === repoName) : rows;
    },
  });
}
