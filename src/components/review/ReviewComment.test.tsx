import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewComment } from "./ReviewComment";
import type { Finding } from "../../features/runs/useRun";

const BASE_FINDING: Finding = {
  id: "finding-1",
  runId: "run-1",
  pass: "security",
  category: "security",
  severity: "critical",
  confidence: 0.9,
  path: "src/auth.ts",
  startLine: 10,
  endLine: 12,
  title: "Unvalidated auth token",
  bodyMd: "The token is used without checking it exists.",
  whyItMatters: "An attacker can bypass auth with a malformed token.",
  impact: "Full auth bypass.",
  fixSteps: ["Validate the token before use."],
  suggestedFix: "if (!token) throw new Error('missing token');",
  codeSnippet: "const token = req.headers.authorization;",
  verifiedHow: "Cross-examined by a second model and upheld.",
  verificationMethod: "cross_exam",
  verificationStatus: "verified",
  posted: true,
  inDigest: false,
  feedback: null,
};

describe("ReviewComment", () => {
  it("renders the severity label, category, location, and title", () => {
    render(<ReviewComment finding={BASE_FINDING} />);
    expect(screen.getByText("Must fix")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("src/auth.ts:10–12")).toBeInTheDocument();
    expect(screen.getByText("Unvalidated auth token")).toBeInTheDocument();
  });

  it("shows a single line number when start and end lines match", () => {
    render(<ReviewComment finding={{ ...BASE_FINDING, startLine: 10, endLine: 10 }} />);
    expect(screen.getByText("src/auth.ts:10")).toBeInTheDocument();
  });

  it("shows a 'Checked' badge for a verified finding and a different one for rejected", () => {
    const { rerender } = render(<ReviewComment finding={BASE_FINDING} />);
    expect(screen.getByText("Checked ✓")).toBeInTheDocument();

    rerender(<ReviewComment finding={{ ...BASE_FINDING, verificationStatus: "rejected" }} />);
    expect(screen.getByText("Not a real issue")).toBeInTheDocument();
    expect(screen.queryByText("Checked ✓")).not.toBeInTheDocument();
  });

  it("omits the fix-steps section when the only step is 'No action needed.'", () => {
    render(<ReviewComment finding={{ ...BASE_FINDING, fixSteps: ["No action needed."] }} />);
    expect(screen.queryByText("4. How to fix")).not.toBeInTheDocument();
  });

  it("includes the fix-steps section for real steps", () => {
    render(<ReviewComment finding={BASE_FINDING} />);
    expect(screen.getByText("4. How to fix")).toBeInTheDocument();
    expect(screen.getByText("Validate the token before use.")).toBeInTheDocument();
  });

  it("toggles code/patch details visibility", async () => {
    const user = userEvent.setup();
    render(<ReviewComment finding={BASE_FINDING} compact />);
    // compact starts collapsed
    expect(screen.queryByText("Current code")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Show code/ }));
    expect(screen.getByText("Current code")).toBeInTheDocument();
    expect(screen.getByText("Suggested patch")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Hide code details/ }));
    expect(screen.queryByText("Current code")).not.toBeInTheDocument();
  });

  it("does not render the code-details toggle when there's neither a snippet nor a fix", () => {
    render(<ReviewComment finding={{ ...BASE_FINDING, codeSnippet: undefined, suggestedFix: undefined }} />);
    expect(screen.queryByRole("button", { name: /code/i })).not.toBeInTheDocument();
  });

  it("shows feedback buttons only when onFeedback is given and the finding is verified", () => {
    const { rerender } = render(<ReviewComment finding={BASE_FINDING} />);
    expect(screen.queryByText("Was this comment useful?")).not.toBeInTheDocument();

    rerender(<ReviewComment finding={BASE_FINDING} onFeedback={() => {}} />);
    expect(screen.getByText("Was this comment useful?")).toBeInTheDocument();

    rerender(<ReviewComment finding={{ ...BASE_FINDING, verificationStatus: "rejected" }} onFeedback={() => {}} />);
    expect(screen.queryByText("Was this comment useful?")).not.toBeInTheDocument();
  });

  it("calls onFeedback with the finding id and the clicked choice", async () => {
    const user = userEvent.setup();
    const onFeedback = vi.fn();
    render(<ReviewComment finding={BASE_FINDING} onFeedback={onFeedback} />);
    await user.click(screen.getByRole("button", { name: "Wrong / not useful" }));
    expect(onFeedback).toHaveBeenCalledWith("finding-1", "dismissed");
  });

  it("highlights the currently-selected feedback choice", () => {
    render(<ReviewComment finding={{ ...BASE_FINDING, feedback: "accepted" }} onFeedback={() => {}} />);
    expect(screen.getByRole("button", { name: "Yes, helpful" })).toHaveClass("border-blue-500");
    expect(screen.getByRole("button", { name: "Wrong / not useful" })).not.toHaveClass("border-blue-500");
  });
});
