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

  describe("apply fix", () => {
    async function revealDetails(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("button", { name: /Show code/ }));
    }

    it("does not show an apply-fix control when onApplyFix is not given", async () => {
      const user = userEvent.setup();
      render(<ReviewComment finding={BASE_FINDING} compact />);
      await revealDetails(user);
      expect(screen.queryByRole("button", { name: /Apply fix/ })).not.toBeInTheDocument();
    });

    it("does not show an apply-fix control for a rejected finding even with onApplyFix given", async () => {
      const user = userEvent.setup();
      render(<ReviewComment finding={{ ...BASE_FINDING, verificationStatus: "rejected" }} onApplyFix={vi.fn()} compact />);
      await revealDetails(user);
      expect(screen.queryByRole("button", { name: /Apply fix/ })).not.toBeInTheDocument();
    });

    it("shows the apply-fix button for a verified finding with a suggested fix", async () => {
      const user = userEvent.setup();
      render(<ReviewComment finding={BASE_FINDING} onApplyFix={vi.fn()} compact />);
      await revealDetails(user);
      expect(screen.getByRole("button", { name: "Apply fix to PR branch" })).toBeInTheDocument();
    });

    it("asks for confirmation before applying, and Cancel backs out without calling onApplyFix", async () => {
      const user = userEvent.setup();
      const onApplyFix = vi.fn();
      render(<ReviewComment finding={BASE_FINDING} onApplyFix={onApplyFix} compact />);
      await revealDetails(user);

      await user.click(screen.getByRole("button", { name: "Apply fix to PR branch" }));
      expect(screen.getByText(/Commit this fix directly to the PR branch/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByText(/Commit this fix directly to the PR branch/)).not.toBeInTheDocument();
      expect(onApplyFix).not.toHaveBeenCalled();
    });

    it("calls onApplyFix with the finding id after confirming", async () => {
      const user = userEvent.setup();
      const onApplyFix = vi.fn().mockResolvedValue({ ok: true, commitSha: "abc1234def" });
      render(<ReviewComment finding={BASE_FINDING} onApplyFix={onApplyFix} compact />);
      await revealDetails(user);

      await user.click(screen.getByRole("button", { name: "Apply fix to PR branch" }));
      await user.click(screen.getByRole("button", { name: "Yes, apply it" }));
      expect(onApplyFix).toHaveBeenCalledWith("finding-1");
    });

    it("shows an inline error message when onApplyFix reports failure", async () => {
      const user = userEvent.setup();
      const onApplyFix = vi.fn().mockResolvedValue({ ok: false, message: "the file has changed since this finding was posted" });
      render(<ReviewComment finding={BASE_FINDING} onApplyFix={onApplyFix} compact />);
      await revealDetails(user);

      await user.click(screen.getByRole("button", { name: "Apply fix to PR branch" }));
      await user.click(screen.getByRole("button", { name: "Yes, apply it" }));
      expect(await screen.findByText("the file has changed since this finding was posted")).toBeInTheDocument();
    });

    it("shows an 'Applied' badge with the short commit sha instead of a button once applied", async () => {
      const user = userEvent.setup();
      render(
        <ReviewComment
          finding={{ ...BASE_FINDING, appliedCommitSha: "abc1234def5678" }}
          onApplyFix={vi.fn()}
          compact
        />,
      );
      await revealDetails(user);
      expect(screen.getByText("abc1234")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Apply fix/ })).not.toBeInTheDocument();
    });
  });

  describe("generate test", () => {
    const TESTS_FINDING: Finding = {
      ...BASE_FINDING,
      category: "tests",
      suggestedFix: undefined,
      codeSnippet: undefined,
      title: "Discount logic changed but tests were not updated",
    };

    it("does not show a generate-test control when onGenerateTest/onCommitTest are not given", () => {
      render(<ReviewComment finding={TESTS_FINDING} />);
      expect(screen.queryByRole("button", { name: "Generate test file" })).not.toBeInTheDocument();
    });

    it("does not show a generate-test control for a non-tests category even with the handlers given", () => {
      render(<ReviewComment finding={BASE_FINDING} onGenerateTest={vi.fn()} onCommitTest={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "Generate test file" })).not.toBeInTheDocument();
    });

    it("shows the generate-test control for a verified tests-category finding with no suggestedFix/codeSnippet at all", () => {
      render(<ReviewComment finding={TESTS_FINDING} onGenerateTest={vi.fn()} onCommitTest={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Generate test file" })).toBeInTheDocument();
    });

    it("generates a preview, then commits it after confirmation", async () => {
      const user = userEvent.setup();
      const onGenerateTest = vi.fn().mockResolvedValue({ ok: true, testFilePath: "src/auth.test.ts", fileContent: "test('works', () => {});" });
      const onCommitTest = vi.fn().mockResolvedValue({ ok: true, commitSha: "abc1234def", testFilePath: "src/auth.test.ts" });
      render(<ReviewComment finding={TESTS_FINDING} onGenerateTest={onGenerateTest} onCommitTest={onCommitTest} />);

      await user.click(screen.getByRole("button", { name: "Generate test file" }));
      expect(onGenerateTest).toHaveBeenCalledWith("finding-1");
      expect(await screen.findByText("src/auth.test.ts")).toBeInTheDocument();
      expect(screen.getByText("test('works', () => {});")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Commit test file to PR branch" }));
      expect(screen.getByText(/Commit this file directly to the PR branch/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Yes, commit it" }));
      expect(onCommitTest).toHaveBeenCalledWith("finding-1");
    });

    it("lets the user discard a preview or regenerate it", async () => {
      const user = userEvent.setup();
      const onGenerateTest = vi.fn().mockResolvedValue({ ok: true, testFilePath: "src/auth.test.ts", fileContent: "v1" });
      render(<ReviewComment finding={TESTS_FINDING} onGenerateTest={onGenerateTest} onCommitTest={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Generate test file" }));
      await screen.findByText("v1");

      await user.click(screen.getByRole("button", { name: "Discard" }));
      expect(screen.queryByText("v1")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Generate test file" })).toBeInTheDocument();
    });

    it("shows an inline error and lets the user try again when generation fails", async () => {
      const user = userEvent.setup();
      const onGenerateTest = vi.fn().mockResolvedValue({ ok: false, message: "Couldn't generate a test — try again." });
      render(<ReviewComment finding={TESTS_FINDING} onGenerateTest={onGenerateTest} onCommitTest={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Generate test file" }));
      expect(await screen.findByText("Couldn't generate a test — try again.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("shows a 'Test added' badge with the short commit sha instead of controls once committed", () => {
      render(
        <ReviewComment
          finding={{ ...TESTS_FINDING, appliedCommitSha: "abc1234def5678" }}
          onGenerateTest={vi.fn()}
          onCommitTest={vi.fn()}
        />,
      );
      expect(screen.getByText("abc1234")).toBeInTheDocument();
      expect(screen.getByText(/Test added as commit/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Generate test file" })).not.toBeInTheDocument();
    });
  });
});
