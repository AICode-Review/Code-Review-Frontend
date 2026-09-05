import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RepoChat } from "./RepoChat";
import { flush } from "../../testUtils";

// Demo mode is on by default in tests (vite.config.ts forces VITE_SUPABASE_* empty), so this
// exercises the real demo-store simulation (lib/demoStore.ts#askDemoRepoChat), not a mock.
// Each test uses its OWN repoId — demoStore's chat history is a module-level singleton
// (matching the rest of demoStore.ts's design), so sharing one id across tests in this file
// would leak an earlier test's asked questions into a later one's initial render.
let nextRepoId = 0;
function renderChat() {
  const repoId = `repo-chat-test-${nextRepoId++}`;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RepoChat repoId={repoId} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function userEventClick(el: HTMLElement) {
  const user = userEvent.setup();
  await user.click(el);
}

describe("RepoChat", () => {
  it("shows the empty state with suggested questions before anything is asked", async () => {
    renderChat();
    await flush();
    expect(screen.getByText(/Ask anything about how this repository works/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How does authentication work?" })).toBeInTheDocument();
  });

  it("asks a question via a suggestion chip and shows both the user turn and the answer", async () => {
    renderChat();
    await flush();

    await userEventClick(screen.getByRole("button", { name: "Where are money amounts formatted?" }));
    await flush(800); // demo simulation has a built-in ~500ms delay before the answer lands

    expect(screen.getByText("Where are money amounts formatted?")).toBeInTheDocument();
    expect(screen.getByText(/Money amounts are formatted in src\/lib\/money\.ts/)).toBeInTheDocument();
    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
  });

  it("shows source chips with path:line for the answer", async () => {
    renderChat();
    await flush();
    await userEventClick(screen.getByRole("button", { name: "Where are money amounts formatted?" }));
    await flush(800);
    expect(screen.getByText("src/lib/money.ts:12-18")).toBeInTheDocument();
    expect(screen.getByText("src/api/checkout.ts:142-149")).toBeInTheDocument();
  });

  it("asks a typed question via the input form", async () => {
    const user = userEvent.setup();
    renderChat();
    await flush();

    await user.type(screen.getByPlaceholderText(/How does the checkout discount/), "how do refunds work?");
    await user.click(screen.getByRole("button", { name: "Ask" }));
    await flush(800);

    expect(screen.getByText("how do refunds work?")).toBeInTheDocument();
    expect(screen.getByText(/post against the same ledger/)).toBeInTheDocument();
  });

  it("disables the Ask button while the input is empty", async () => {
    renderChat();
    await flush();
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });
});
