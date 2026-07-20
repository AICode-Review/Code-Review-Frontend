import { useQuery } from "@tanstack/react-query";
import { api, isPlanRequiredError } from "../../lib/api";
import { DEMO_MODE, demoCategories, demoWeekly } from "../../lib/demo";
import { analyticsSchema, type AnalyticsPayload } from "../../lib/schemas";
import { useOrg } from "../../hooks/useOrg";

export type AnalyticsSource = "demo" | "api" | "unavailable" | "plan_required";

export interface AnalyticsResult extends AnalyticsPayload {
  source: AnalyticsSource;
}

/**
 * Org analytics for dashboard tiles/charts.
 * Demo → fixtures. Live → GET /api/orgs/:id/analytics (falls back to empty if route missing).
 */
export function useAnalytics(range = "12w") {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["analytics", orgId, range],
    enabled: Boolean(orgId) || DEMO_MODE,
    queryFn: async (): Promise<AnalyticsResult> => {
      if (DEMO_MODE || !orgId) {
        return { weekly: demoWeekly, categories: demoCategories, source: "demo" };
      }
      try {
        const raw = await api<unknown>(`/api/orgs/${orgId}/analytics?range=${range}`);
        const parsed = analyticsSchema.parse(raw);
        return { ...parsed, source: "api" };
      } catch (err) {
        if (isPlanRequiredError(err)) return { weekly: [], categories: [], source: "plan_required" };
        return { weekly: [], categories: [], source: "unavailable" };
      }
    },
  });
}
