import { apiUrl } from "./api";
import { DEMO_MODE } from "./demo";

const VISITOR_ID_KEY = "scrutinye.visitorId";

/** Anonymous, client-generated identifier — never tied to an account or PII, just enough
 * to dedupe repeat page views from the same browser into one "visitor" (console's
 * Visitors panel, backend/src/routes/track.ts). `null` when localStorage is unavailable
 * (private browsing, blocked storage) — tracking is best-effort, never worth surfacing an
 * error over. */
function getOrCreateVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget visit ping for the public marketing site — never blocks rendering, never
 * throws, never retries. `keepalive: true` lets the request survive a same-tick navigation
 * (the common case: this fires from a route-change effect right as the user clicks through).
 * A no-op in demo mode (no real backend configured) and if localStorage is unavailable.
 */
export function trackVisit(path: string): void {
  if (DEMO_MODE) return;
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  fetch(apiUrl("/api/track/visit"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ visitorId, path }),
    keepalive: true,
  }).catch(() => {
    /* best-effort — a dropped visit ping is never worth surfacing to a real visitor */
  });
}
