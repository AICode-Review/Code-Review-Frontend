import { describe, expect, it } from "vitest";
import { summaryPreview, timeAgo, usd } from "./format";

describe("timeAgo", () => {
  const now = new Date("2026-07-10T12:00:00Z");
  it("formats seconds, minutes, hours, days", () => {
    expect(timeAgo("2026-07-10T11:59:30Z", now)).toBe("30s ago");
    expect(timeAgo("2026-07-10T11:45:00Z", now)).toBe("15m ago");
    expect(timeAgo("2026-07-10T06:00:00Z", now)).toBe("6h ago");
    expect(timeAgo("2026-07-07T12:00:00Z", now)).toBe("3d ago");
  });
  it("clamps future timestamps to 0s", () => {
    expect(timeAgo("2026-07-10T12:01:00Z", now)).toBe("0s ago");
  });
});

describe("usd", () => {
  it("formats run costs with sub-cent precision", () => {
    expect(usd(0.1234)).toBe("$0.1234");
    expect(usd(15)).toBe("$15.00");
  });
});

describe("summaryPreview", () => {
  it("strips the codeferret:summary HTML comment marker", () => {
    expect(summaryPreview("<!-- codeferret:summary -->\n### Title\nBody text")).not.toContain("<!--");
  });

  it("strips markdown heading/bold/code syntax", () => {
    const raw = "### 🤖 AI Review\n\n**Risk: 🔴 high** · 1 file changed, +20/-0";
    const preview = summaryPreview(raw);
    expect(preview).not.toMatch(/[#*`]/);
    expect(preview).toContain("🤖 AI Review");
    expect(preview).toContain("Risk: 🔴 high");
  });

  it("collapses newlines into a single line", () => {
    expect(summaryPreview("line one\nline two\nline three")).toBe("line one line two line three");
  });

  it("truncates with an ellipsis past maxLen", () => {
    const long = "a".repeat(200);
    const preview = summaryPreview(long, 50);
    expect(preview.length).toBe(50);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("leaves a short plain-text summary unchanged", () => {
    expect(summaryPreview("All clear, no findings.")).toBe("All clear, no findings.");
  });
});
