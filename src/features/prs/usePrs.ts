import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE, demoFindings, demoRuns } from "../../lib/demo";
import { computePrScore } from "../../lib/prScore";
import { useOrg } from "../../hooks/useOrg";
import { useRepos } from "../repos/useRepos";
import type { RunRow } from "../runs/useRuns";

export interface PrListItem {
  /** pull_requests.id */
  id: string;
  number: number;
  repoName: string;
  openedBy: string | null;
  updatedAt: string;
  latestRun: {
    id: string;
    status: RunRow["status"];
    trigger: "automatic" | "manual";
    startedAt: string;
    summary: string | null;
  } | null;
  /** null until the latest run has actually completed — nothing to score yet. */
  score: number | null;
}

interface PrRow {
  id: string;
  number: number;
  opened_by: string | null;
  updated_at: string;
  repos: { name: string } | null;
}

function demoPrList(): PrListItem[] {
  const latestByPr = new Map<string, RunRow>();
  for (const run of demoRuns) {
    const existing = latestByPr.get(run.pr_id);
    if (!existing || new Date(run.started_at) > new Date(existing.started_at)) {
      latestByPr.set(run.pr_id, run);
    }
  }

  return Array.from(latestByPr.entries()).map(([prId, run]) => {
    const findings = demoFindings.filter((f) => f.runId === run.id);
    return {
      id: prId,
      number: run.pull_requests?.number ?? 0,
      repoName: run.pull_requests?.repos?.name ?? "unknown",
      openedBy: run.pull_requests?.opened_by ?? null,
      updatedAt: run.started_at,
      latestRun: {
        id: run.id,
        status: run.status,
        trigger: run.trigger ?? "automatic",
        startedAt: run.started_at,
        summary: run.summary ?? null,
      },
      score: run.status === "completed" ? computePrScore(findings) : null,
    };
  });
}

/** Every pull request CodeFerret has ever seen for the current org, one row each, with the latest run's status and an advisory 0-100 score. */
export function usePrs() {
  const { data: org } = useOrg();
  const { data: repos } = useRepos();
  const orgId = org?.id;
  const queryClient = useQueryClient();
  const repoIds = (repos ?? []).map((repo) => repo.id);
  const repoKey = repoIds.join(",");

  useEffect(() => {
    if (!supabase || DEMO_MODE) return;

    const channel = supabase
      .channel("pull_requests_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "pull_requests" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["prs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "review_runs" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["prs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "findings" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["prs"] });
      })
      .subscribe();

    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["prs", orgId, repoKey],
    enabled: DEMO_MODE || (Boolean(orgId) && repos !== undefined),
    queryFn: async (): Promise<PrListItem[]> => {
      if (DEMO_MODE || !supabase || !orgId) return demoPrList();

      if (repoIds.length === 0) return [];

      const { data: prRows, error: prErr } = await supabase
        .from("pull_requests")
        .select("id, number, opened_by, updated_at, repos(name)")
        .in("repo_id", repoIds)
        .order("updated_at", { ascending: false });
      if (prErr) throw new Error(prErr.message);
      const prs = (prRows ?? []) as unknown as PrRow[];
      if (prs.length === 0) return [];

      const prIds = prs.map((p) => p.id);
      const { data: runRows, error: runErr } = await supabase
        .from("review_runs")
        .select("id, pr_id, status, started_at, trigger, summary")
        .in("pr_id", prIds)
        .order("started_at", { ascending: false });
      if (runErr) throw new Error(runErr.message);

      const latestRunByPr = new Map<string, { id: string; status: RunRow["status"]; trigger: "automatic" | "manual"; started_at: string; summary: string | null }>();
      for (const run of runRows ?? []) {
        const prId = run.pr_id as string;
        if (!latestRunByPr.has(prId)) {
          latestRunByPr.set(prId, {
            id: run.id as string,
            status: run.status as RunRow["status"],
            trigger: (run.trigger as "automatic" | "manual" | undefined) ?? "automatic",
            started_at: run.started_at as string,
            summary: (run.summary as string | null) ?? null,
          });
        }
      }

      const completedRunIds = Array.from(latestRunByPr.values())
        .filter((r) => r.status === "completed")
        .map((r) => r.id);

      const findingsByRun = new Map<string, { severity: "critical" | "major" | "minor"; verificationStatus: "verified" | "rejected" | "skipped" }[]>();
      if (completedRunIds.length > 0) {
        const { data: findingRows, error: findErr } = await supabase
          .from("findings")
          .select("run_id, severity, verification_status")
          .in("run_id", completedRunIds);
        if (findErr) throw new Error(findErr.message);
        for (const f of findingRows ?? []) {
          const runId = f.run_id as string;
          const list = findingsByRun.get(runId) ?? [];
          list.push({
            severity: f.severity as "critical" | "major" | "minor",
            verificationStatus: f.verification_status as "verified" | "rejected" | "skipped",
          });
          findingsByRun.set(runId, list);
        }
      }

      return prs.map((pr) => {
        const latest = latestRunByPr.get(pr.id) ?? null;
        const findings = latest ? (findingsByRun.get(latest.id) ?? []) : [];
        return {
          id: pr.id,
          number: pr.number,
          repoName: pr.repos?.name ?? "unknown",
          openedBy: pr.opened_by,
          updatedAt: pr.updated_at,
          latestRun: latest
            ? { id: latest.id, status: latest.status, trigger: latest.trigger, startedAt: latest.started_at, summary: latest.summary }
            : null,
          score: latest?.status === "completed" ? computePrScore(findings) : null,
        };
      });
    },
  });
}
