import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Prs from "./Prs";
import { OrgProvider } from "../hooks/useOrg";
import { flush } from "../testUtils";

// Demo mode is on by default in tests (vite.config.ts forces VITE_SUPABASE_* empty), so
// Prs renders from the same fixture data (lib/demo.ts) the app ships with when a user
// first tries it with no backend configured — a real, exercised code path, not a mock.
async function renderPrs() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrgProvider>
          <Prs />
        </OrgProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await flush(); // let the org -> repos -> prs query chain resolve — see testUtils.tsx
  return result;
}

describe("Prs page (demo mode)", () => {
  it("loads and renders the demo pull request list", async () => {
    await renderPrs();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  it("filters rows via the search box", async () => {
    const user = userEvent.setup();
    await renderPrs();
    const rowsBefore = within(screen.getByRole("list")).getAllByRole("listitem").length;

    const search = screen.getByPlaceholderText(/Search repo, PR #, author, or summary/i);
    await user.type(search, "zzz-no-such-repo-or-summary-zzz");
    await flush();

    expect(screen.getByText(/No pull requests match these filters/i)).toBeInTheDocument();

    await user.clear(search);
    await flush();
    const rowsAfter = within(screen.getByRole("list")).getAllByRole("listitem").length;
    expect(rowsAfter).toBe(rowsBefore); // clearing the filter restores the original rows
  });

  it("shows the PR author and filters by author name", async () => {
    const user = userEvent.setup();
    await renderPrs();

    expect(screen.getAllByText("priya-dev").length).toBeGreaterThan(0);

    const search = screen.getByPlaceholderText(/Search repo, PR #, author, or summary/i);
    await user.type(search, "priya-dev");
    await flush();

    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(within(row).getByText("priya-dev")).toBeInTheDocument();
    }
  });

  it("toggles sort direction when clicking the same column header twice", async () => {
    const user = userEvent.setup();
    await renderPrs();

    const prButton = screen.getByRole("button", { name: "PR" });

    await user.click(prButton);
    await flush();
    expect(prButton).toHaveAttribute("aria-pressed", "true");
    const firstDirection = prButton.textContent;

    await user.click(prButton);
    await flush();
    expect(prButton).toHaveAttribute("aria-pressed", "true");
    expect(prButton.textContent).not.toBe(firstDirection);
  });

  it("shows a 'Clear filters' control only once a filter is active", async () => {
    const user = userEvent.setup();
    await renderPrs();
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/Search repo, PR #, author, or summary/i), "x");
    await flush();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });
});
