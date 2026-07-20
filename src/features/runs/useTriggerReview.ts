import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { DEMO_MODE } from "../../lib/demo";
import { triggerDemoReview } from "../../lib/demoStore";
import { useOrg } from "../../hooks/useOrg";
import type { RunRow } from "./useRuns";

export interface TriggerReviewArgs {
  repo: string;
  prNumber: number;
  title: string;
  headSha?: string;
  trigger: "automatic" | "manual";
  sourceRunId?: string;
  /** Existing run being re-triggered (live API). */
  runId?: string;
}

/**
 * Start or re-run a code review.
 * Demo: creates an in-memory run that completes in ~2.5s.
 * Live: POST /api/runs/:id/rerun or POST /api/reviews/trigger.
 */
export function useTriggerReview() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: org } = useOrg();

  return useMutation({
    mutationFn: async (args: TriggerReviewArgs): Promise<string> => {
      if (DEMO_MODE) {
        return triggerDemoReview(args);
      }
      if (args.runId) {
        const res = await api<{ id: string }>(`/api/runs/${args.runId}/rerun`, {
          method: "POST",
        });
        return res.id;
      }
      const res = await api<{ id: string }>("/api/reviews/trigger", {
        method: "POST",
        body: JSON.stringify({
          repo: args.repo,
          prNumber: args.prNumber,
          trigger: args.trigger,
          orgId: org?.id,
        }),
      });
      return res.id;
    },
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["runs"] });
      void queryClient.invalidateQueries({ queryKey: ["run"] });
      navigate(`/runs/${id}`);
    },
  });
}

export function useRerunFromRun(run: RunRow | undefined) {
  const trigger = useTriggerReview();
  return {
    ...trigger,
    rerun: () => {
      if (!run) return;
      const repo = run.pull_requests?.repos?.name;
      const prNumber = run.pull_requests?.number;
      if (!repo || prNumber == null) return;
      trigger.mutate({
        repo,
        prNumber,
        title: run.summary ? `${run.summary} (re-run)` : `Re-run #${prNumber}`,
        headSha: run.head_sha,
        trigger: "manual",
        sourceRunId: run.id,
        runId: run.id,
      });
    },
  };
}
