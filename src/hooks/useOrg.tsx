import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DEMO_MODE, demoOrgs } from "../lib/demo";
import { useAuth } from "./useAuth";

export interface Org {
  id: string;
  name: string;
  kind: "individual" | "team";
  plan: string;
  role: "owner" | "admin" | "member";
  platform: "github" | "bitbucket" | "demo";
}

const SELECTED_ORG_KEY = "codeferret.selectedOrgId";

function readStoredOrgId(): string | null {
  try {
    return localStorage.getItem(SELECTED_ORG_KEY);
  } catch {
    return null;
  }
}

function storeOrgId(id: string): void {
  try {
    localStorage.setItem(SELECTED_ORG_KEY, id);
  } catch {
    /* ignore — selection just won't survive a reload */
  }
}

interface ApiOrgsResponse {
  orgs: Array<{ id: string; name: string; kind: "individual" | "team"; plan: string; platform: "github" | "bitbucket"; role: Org["role"] }>;
}

function useOrgsQuery() {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: ["orgs"],
    enabled: DEMO_MODE || authenticated,
    queryFn: async (): Promise<Org[]> => {
      if (DEMO_MODE) return demoOrgs;
      const res = await api<ApiOrgsResponse>("/api/orgs");
      return res.orgs;
    },
    staleTime: 60_000,
  });
}

interface OrgContextValue {
  orgs: Org[];
  isLoading: boolean;
  selectedOrgId: string | null;
  org: Org | undefined;
  selectOrg: (id: string) => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

/**
 * Every org the signed-in user belongs to (individual + team), which one is
 * "current" (persisted per-browser), and a setter for the org switcher.
 * Every org-scoped hook/query should read `org.id` from here rather than
 * assuming a single org — a user can belong to their own personal org AND
 * one or more team orgs at once.
 */
export function OrgProvider({ children }: { children: ReactNode }) {
  const { data: orgs = [], isLoading } = useOrgsQuery();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(readStoredOrgId);

  useEffect(() => {
    if (orgs.length === 0) return;
    if (selectedOrgId && orgs.some((o) => o.id === selectedOrgId)) return;
    const fallback = orgs[0]!.id;
    setSelectedOrgId(fallback);
    storeOrgId(fallback);
  }, [orgs, selectedOrgId]);

  function selectOrg(id: string) {
    setSelectedOrgId(id);
    storeOrgId(id);
  }

  const org = orgs.find((o) => o.id === selectedOrgId);

  const value = useMemo<OrgContextValue>(
    () => ({ orgs, isLoading, selectedOrgId, org, selectOrg }),
    [orgs, isLoading, selectedOrgId, org],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

function useOrgContext(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg/useOrgs must be used within <OrgProvider>");
  return ctx;
}

/** The currently-selected org, react-query-shaped so existing `const { data: org } = useOrg()` call sites keep working. */
export function useOrg() {
  const { org, isLoading } = useOrgContext();
  return { data: org, isLoading };
}

/** Every org the user belongs to, plus the switcher. */
export function useOrgs() {
  const { orgs, isLoading, selectedOrgId, selectOrg } = useOrgContext();
  return { data: orgs, isLoading, selectedOrgId, selectOrg };
}
