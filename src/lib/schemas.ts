import { z } from "zod";

/** Shared API / domain shapes (backend is source of truth; duplicated here per DESIGN.md). */

export const weekPointSchema = z.object({
  week: z.string(),
  findingsPosted: z.number(),
  accepted: z.number(),
  dismissed: z.number(),
  acceptancePct: z.number(),
  noisePct: z.number(),
  medianLatencyMin: z.number(),
});

export const categoryCountSchema = z.object({
  category: z.string(),
  count: z.number(),
});

export const analyticsSchema = z.object({
  weekly: z.array(weekPointSchema),
  categories: z.array(categoryCountSchema),
});

export const healthPointSchema = z.object({
  week: z.string(),
  riskScore: z.number(),
  untestedPct: z.number(),
});

export const healthResponseSchema = z.object({
  snapshots: z.array(healthPointSchema),
  recurring: z.array(categoryCountSchema),
});

export const repoConfigSchema = z.object({
  strictness: z.enum(["chill", "standard", "strict"]),
  commentBudget: z.number().int().min(3).max(15),
  ignoredPaths: z.array(z.string()),
  failOnCritical: z.boolean(),
});

/** Response shape for /billing/checkout — a Razorpay-hosted subscription authorization page. */
export const checkoutUrlSchema = z.object({
  url: z.string().url(),
});

export const ruleCreateSchema = z.object({
  ruleText: z.string().min(1),
  category: z.string().min(1),
  repoName: z.string().nullable(),
});

export const onboardingFinishSchema = z.object({
  repoIds: z.array(z.string()).min(1),
  preset: z.enum(["chill", "standard", "strict"]),
});

export type AnalyticsPayload = z.infer<typeof analyticsSchema>;
export type HealthPayload = z.infer<typeof healthResponseSchema>;
export type RepoConfigPayload = z.infer<typeof repoConfigSchema>;
