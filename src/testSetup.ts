import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Pages here often chain 2-3 dependent useQuery hooks (org -> repos -> the page's own
// query) even in demo mode, where each still resolves through a real microtask tick —
// findBy*'s default 1000ms waitFor timeout is comfortably enough in a browser but can be
// tight for jsdom's first render in a cold test process. A few extra seconds of headroom
// costs nothing when things resolve quickly, and avoids flaky failures when they don't.
configure({ asyncUtilTimeout: 5000 });

// RTL doesn't auto-register its cleanup-after-each-test hook for Vitest the way it does
// for Jest — without this, every rendered component from a prior test stays in the DOM,
// and any later `getByRole`/`getByText` query that matches more than one test's output
// throws a "multiple elements found" error that has nothing to do with the component
// actually being tested.
afterEach(() => {
  cleanup();
});
