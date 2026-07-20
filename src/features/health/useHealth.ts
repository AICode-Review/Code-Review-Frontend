import { useQuery } from "@tanstack/react-query";
import { api, isPlanRequiredError } from "../../lib/api";
import { DEMO_MODE, demoHealth, demoRecurring } from "../../lib/demo";
import { healthResponseSchema, type HealthPayload } from "../../lib/schemas";

export type HealthSource = "demo" | "api" | "unavailable" | "plan_required";

export interface HealthResult extends HealthPayload {
  source: HealthSource;
}

/**
 * Weekly health snapshots + recurring categories for a repo (Gap 7).
 * Demo → fixtures. Live → GET /api/repos/:id/health.
 */
export function useHealth(repoId: string | undefined) {
  return useQuery({
    queryKey: ["health", repoId],
    enabled: Boolean(repoId),
    queryFn: async (): Promise<HealthResult> => {
      if (!repoId) return { snapshots: [], recurring: [], source: "unavailable" };

      if (DEMO_MODE) {
        return {
          snapshots: demoHealth[repoId] ?? [],
          recurring: demoRecurring[repoId] ?? [],
          source: "demo",
        };
      }

      try {
        const raw = await api<unknown>(`/api/repos/${repoId}/health`);
        const parsed = healthResponseSchema.parse(raw);
        return { ...parsed, source: "api" };
      } catch (err) {
        if (isPlanRequiredError(err)) return { snapshots: [], recurring: [], source: "plan_required" };
        return { snapshots: [], recurring: [], source: "unavailable" };
      }
    },
  });
}
