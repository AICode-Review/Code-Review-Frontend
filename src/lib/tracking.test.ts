import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./demo", () => ({ DEMO_MODE: false }));

const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response(null, { status: 200 }));

/** Node 22's own built-in `localStorage` global conflicts with jsdom's in this test
 * environment (its .clear()/getItem() don't behave like real Storage without
 * --localstorage-file) - stubbing a plain in-memory replacement sidesteps that entirely
 * rather than depending on whichever implementation wins the global. */
function fakeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("localStorage", fakeLocalStorage());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

async function freshTracking() {
  vi.resetModules();
  return import("./tracking.js");
}

describe("trackVisit", () => {
  it("sends a visitorId + path to the tracking endpoint", async () => {
    const { trackVisit } = await freshTracking();
    trackVisit("/pricing");
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/api/track/visit");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.path).toBe("/pricing");
    expect(typeof body.visitorId).toBe("string");
    expect(body.visitorId.length).toBeGreaterThan(0);
  });

  it("reuses the same visitorId across calls instead of generating a new one each time", async () => {
    const { trackVisit } = await freshTracking();
    trackVisit("/");
    trackVisit("/features");
    await Promise.resolve();

    const bodies = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string));
    expect(bodies[0].visitorId).toBe(bodies[1].visitorId);
  });

  it("never throws when fetch itself rejects", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    const { trackVisit } = await freshTracking();
    expect(() => trackVisit("/")).not.toThrow();
  });
});
