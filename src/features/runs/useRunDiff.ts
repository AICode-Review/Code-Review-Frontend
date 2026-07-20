import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { DEMO_MODE } from "../../lib/demo";
import { getDemoDiff } from "../../lib/demoDiffs";
import type { PrDiff } from "../../components/review/DiffViewer";
import type { RunRow } from "./useRuns";

/**
 * PR file diff for a review run — previous (base) vs new (head).
 * Demo serves fixtures; live calls GET /api/runs/:id/diff.
 */
export function useRunDiff(run: RunRow | undefined) {
  return useQuery({
    queryKey: ["run-diff", run?.id],
    enabled: Boolean(run?.id),
    queryFn: async (): Promise<PrDiff | null> => {
      if (!run) return null;
      const repo = run.pull_requests?.repos?.name ?? "unknown";

      if (DEMO_MODE) {
        return getDemoDiff(run.id, repo, run.head_sha);
      }

      try {
        return await api<PrDiff>(`/api/runs/${run.id}/diff`);
      } catch (err) {
        // 404 is a legitimate case (PR/run since deleted, or the diff was never
        // fetchable) — degrade to an empty shell rather than an error banner. Any
        // other failure (auth, 5xx, network) is real and should surface, not hide
        // behind what looks like "this PR had zero file changes."
        if (err instanceof ApiError && err.status === 404) {
          return {
            baseSha: "unknown",
            headSha: run.head_sha,
            baseLabel: "main (before PR)",
            headLabel: "PR head (new)",
            files: [],
            stats: { files: 0, additions: 0, deletions: 0 },
          };
        }
        throw err;
      }
    },
  });
}
