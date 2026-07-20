/**
 * RTL's findBy-family queries and waitFor rely on MutationObserver-based polling to notice
 * async updates, and normally that's the right tool. In this repo's React 19.2.7 + jsdom +
 * vitest combination, that polling doesn't reliably observe the DOM changes TanStack
 * Query's external-store subscription triggers — findBy* queries against a page using
 * useQuery can time out even though the query genuinely resolved. Wrapping the wait in
 * `act()` doesn't fix it either (empirically confirmed worse — it reintroduces the same
 * hang); a plain unwrapped delay before a synchronous query is what reliably works here.
 * Use this after render() and after any interaction that triggers a refetch, then query
 * synchronously (getByRole/getByText) instead of findBy*.
 */
export async function flush(ms = 300): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
