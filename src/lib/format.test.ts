import { describe, expect, it } from "vitest";
import { timeAgo, usd } from "./format";

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
