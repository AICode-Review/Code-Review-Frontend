import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Badge, Card, EmptyState, ErrorText, LoadingText, MetricTile, Pagination, PublicHeader, SectionTitle } from "./ui";

describe("Badge", () => {
  it("renders a title-cased label when no children are given", () => {
    render(<Badge kind="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders custom children instead of the kind label", () => {
    render(<Badge kind="manual">Manual trigger</Badge>);
    expect(screen.getByText("Manual trigger")).toBeInTheDocument();
    expect(screen.queryByText("manual")).not.toBeInTheDocument();
  });

  it("falls back to a neutral style for an unrecognized kind rather than crashing", () => {
    render(<Badge kind="some-unknown-status" />);
    expect(screen.getByText("some-unknown-status")).toBeInTheDocument();
  });
});

describe("EmptyState / LoadingText / ErrorText", () => {
  it("renders the message passed as children", () => {
    render(<EmptyState>Nothing here yet.</EmptyState>);
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
  });

  it("LoadingText defaults to 'Loading…' with no children", () => {
    render(<LoadingText />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("ErrorText surfaces the given error message", () => {
    render(<ErrorText>Failed to load reviews: network error</ErrorText>);
    expect(screen.getByText(/Failed to load reviews/)).toBeInTheDocument();
  });
});

describe("Card / SectionTitle / MetricTile", () => {
  it("Card renders its children", () => {
    render(<Card>content</Card>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("SectionTitle renders the hint only when provided", () => {
    const { rerender } = render(<SectionTitle hint="last 12 weeks">Trends</SectionTitle>);
    expect(screen.getByText("last 12 weeks")).toBeInTheDocument();
    rerender(<SectionTitle>Trends</SectionTitle>);
    expect(screen.queryByText("last 12 weeks")).not.toBeInTheDocument();
  });

  it("MetricTile shows the sub-label only when good/sub are provided", () => {
    render(<MetricTile label="Acceptance" value="82%" sub="+4pts" good />);
    expect(screen.getByText("Acceptance")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("+4pts")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("renders nothing when there's only one page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} totalItems={5} pageSize={10} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the correct item range and page count", () => {
    render(<Pagination page={2} totalPages={3} totalItems={25} pageSize={10} onPageChange={() => {}} />);
    expect(screen.getByText("11–20 of 25")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} totalItems={25} pageSize={10} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();

    rerender(<Pagination page={3} totalPages={3} totalItems={25} pageSize={10} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("calls onPageChange with page - 1 / page + 1 when clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} totalItems={25} pageSize={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});

describe("PublicHeader", () => {
  it("renders the primary nav links and a sign-in CTA", () => {
    render(
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /CodeFerret/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: "Benchmark" })).toHaveAttribute("href", "/benchmark");
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/signin");
  });

  it("toggles the mobile menu open state via the menu button", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>,
    );
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await user.click(menuButton);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  });
});
