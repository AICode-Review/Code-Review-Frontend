export interface ScorableFinding {
  severity: "critical" | "major" | "minor";
  verificationStatus: "verified" | "rejected" | "skipped";
}

const SEVERITY_PENALTY: Record<ScorableFinding["severity"], number> = {
  critical: 25,
  major: 10,
  minor: 3,
};

/**
 * Advisory 0-100 PR score — not a merge gate, just a quick signal. Starts at
 * 100 and subtracts a fixed penalty per *verified* finding by severity,
 * floored at 0. Deterministic and free (pure math over data already
 * computed by the review pipeline), unlike an LLM-generated verdict.
 */
export function computePrScore(findings: ScorableFinding[]): number {
  const penalty = findings
    .filter((f) => f.verificationStatus === "verified")
    .reduce((sum, f) => sum + (SEVERITY_PENALTY[f.severity] ?? 0), 0);
  return Math.max(0, 100 - penalty);
}

export type ScoreTone = "good" | "medium" | "poor";

export function scoreTone(score: number): ScoreTone {
  if (score >= 80) return "good";
  if (score >= 50) return "medium";
  return "poor";
}
