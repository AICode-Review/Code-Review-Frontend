import { supabase } from "./supabase";
import { DEMO_MODE } from "./demo";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

export function apiUrl(path: string): string {
  return `${API_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Thrown by api() on a non-2xx response. Carries the parsed JSON body (when present) so callers can distinguish e.g. a plan-gate 402 from a generic failure instead of just matching on message text. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error?: string; message?: string } | undefined,
  ) {
    super(body?.message ?? body?.error ?? `API ${status}`);
    this.name = "ApiError";
  }
}

export function isPlanRequiredError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402 && err.body?.error === "team_plan_required";
}

/** Fetch from the backend REST API with the Supabase session JWT attached. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (DEMO_MODE) {
    throw new Error("Demo mode: backend API calls are disabled. Configure .env to go live.");
  }
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const token = session?.access_token;
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => undefined) as { error?: string; message?: string } | undefined;
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}
