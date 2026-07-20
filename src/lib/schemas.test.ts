import { describe, expect, it } from "vitest";
import {
  analyticsSchema,
  healthResponseSchema,
  onboardingFinishSchema,
  repoConfigSchema,
} from "./schemas";

describe("schemas", () => {
  it("parses analytics payload", () => {
    const parsed = analyticsSchema.parse({
      weekly: [
        {
          week: "Jul 6",
          findingsPosted: 10,
          accepted: 8,
          dismissed: 1,
          acceptancePct: 80,
          noisePct: 3,
          medianLatencyMin: 4.1,
        },
      ],
      categories: [{ category: "logic", count: 4 }],
    });
    expect(parsed.weekly).toHaveLength(1);
    expect(parsed.categories[0]?.category).toBe("logic");
  });

  it("parses health payload", () => {
    const parsed = healthResponseSchema.parse({
      snapshots: [{ week: "Jul 6", riskScore: 40, untestedPct: 20 }],
      recurring: [{ category: "security", count: 2 }],
    });
    expect(parsed.snapshots[0]?.riskScore).toBe(40);
  });

  it("rejects invalid repo config budget", () => {
    expect(() =>
      repoConfigSchema.parse({
        strictness: "standard",
        commentBudget: 2,
        ignoredPaths: [],
        failOnCritical: false,
      }),
    ).toThrow();
  });

  it("parses onboarding finish payload", () => {
    const parsed = onboardingFinishSchema.parse({
      repoIds: ["repo-1"],
      preset: "strict",
    });
    expect(parsed.preset).toBe("strict");
  });
});
