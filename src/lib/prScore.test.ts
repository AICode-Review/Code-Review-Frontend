import { describe, expect, it } from "vitest";
import { computePrScore, scoreTone } from "./prScore";

describe("computePrScore", () => {
  it("is 100 with no findings", () => {
    expect(computePrScore([])).toBe(100);
  });

  it("ignores rejected and skipped findings entirely", () => {
    const findings = [
      { severity: "critical" as const, verificationStatus: "rejected" as const },
      { severity: "critical" as const, verificationStatus: "skipped" as const },
    ];
    expect(computePrScore(findings)).toBe(100);
  });

  it("subtracts the right penalty per verified severity", () => {
    expect(computePrScore([{ severity: "critical", verificationStatus: "verified" }])).toBe(75);
    expect(computePrScore([{ severity: "major", verificationStatus: "verified" }])).toBe(90);
    expect(computePrScore([{ severity: "minor", verificationStatus: "verified" }])).toBe(97);
  });

  it("sums penalties across multiple verified findings", () => {
    const findings = [
      { severity: "critical" as const, verificationStatus: "verified" as const },
      { severity: "major" as const, verificationStatus: "verified" as const },
      { severity: "minor" as const, verificationStatus: "verified" as const },
    ];
    expect(computePrScore(findings)).toBe(100 - 25 - 10 - 3);
  });

  it("floors at 0 rather than going negative", () => {
    const findings = Array.from({ length: 10 }, () => ({ severity: "critical" as const, verificationStatus: "verified" as const }));
    expect(computePrScore(findings)).toBe(0);
  });
});

describe("scoreTone", () => {
  it("is good at 80 and above", () => {
    expect(scoreTone(80)).toBe("good");
    expect(scoreTone(100)).toBe("good");
  });

  it("is medium between 50 and 79", () => {
    expect(scoreTone(50)).toBe("medium");
    expect(scoreTone(79)).toBe("medium");
  });

  it("is poor below 50", () => {
    expect(scoreTone(49)).toBe("poor");
    expect(scoreTone(0)).toBe("poor");
  });
});
