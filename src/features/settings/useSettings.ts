import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import {
  DEMO_MODE,
  demoAudit,
  demoBilling,
  demoInvites,
  demoMembers,
  demoUsage,
  type DemoAuditEntry,
  type DemoInvite,
  type DemoMember,
} from "../../lib/demo";
import { checkoutUrlSchema } from "../../lib/schemas";
import { useOrg, type Org } from "../../hooks/useOrg";
import { useAuth } from "../../hooks/useAuth";

export type Member = DemoMember;
export type AuditEntry = DemoAuditEntry;
export type Invite = DemoInvite;

export interface BillingInfo {
  plan: string;
  pricePerSeat: number;
  seats: number;
  seatsUsed: number;
  renewsOn: string;
  status: string;
}

function tierLabel(tier: string): string {
  if (tier === "pro") return "Pro";
  if (tier === "team") return "Team";
  if (tier === "enterprise") return "Enterprise";
  return "Free";
}

function priceForTier(tier: string): number {
  if (tier === "pro") return 15;
  if (tier === "team") return 25;
  return 0;
}

export function useMembers() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["members", orgId],
    enabled: Boolean(orgId) || DEMO_MODE,
    queryFn: async (): Promise<Member[]> => {
      if (DEMO_MODE || !supabase || !orgId) return demoMembers;

      const { data, error } = await supabase
        .from("org_members")
        .select("role, users(id, handle, seat_active)")
        .eq("org_id", orgId);
      if (error) throw new Error(error.message);

      return ((data ?? []) as unknown as Array<{
        role: Member["role"];
        users: { id: string; handle: string; seat_active: boolean } | null;
      }>).flatMap((row) => {
        if (!row.users) return [];
        return [
          {
            id: row.users.id,
            handle: row.users.handle,
            email: "",
            role: row.role,
            seatActive: row.users.seat_active,
          },
        ];
      });
    },
  });
}

interface InvitesResponse {
  invites: Array<{ id: string; email: string; role: "admin" | "member"; token: string; created_at: string; expires_at: string }>;
}

/** Pending invites for the selected org — owner/admin only server-side; empty (not an error) for anyone else. */
export function useInvites() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["invites", orgId],
    enabled: (DEMO_MODE || Boolean(orgId)) && org?.kind !== "individual",
    queryFn: async (): Promise<Invite[]> => {
      if (DEMO_MODE || !orgId) return demoInvites;
      try {
        const res = await api<InvitesResponse>(`/api/orgs/${orgId}/members`);
        return res.invites.map((i) => ({
          id: i.id,
          email: i.email,
          role: i.role,
          token: i.token,
          createdAt: i.created_at,
          expiresAt: i.expires_at,
        }));
      } catch {
        return []; // not an admin/owner, or the org has no pending invites
      }
    },
  });
}

export function useCreateInvite() {
  const { data: org } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: "admin" | "member" }): Promise<Invite & { emailSent: boolean }> => {
      if (!org?.id) throw new Error("No organization selected.");
      if (DEMO_MODE) {
        return {
          id: `inv-local-${Date.now()}`,
          email,
          role,
          token: `demo-${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
          emailSent: false, // demo mode never sends real email — always falls back to the copy-link flow
        };
      }
      const res = await api<{
        invite: { id: string; email: string; role: "admin" | "member"; token: string; expires_at: string };
        emailSent?: boolean;
      }>(`/api/orgs/${org.id}/invites`, { method: "POST", body: JSON.stringify({ email, role }) });
      return {
        id: res.invite.id,
        email: res.invite.email,
        role: res.invite.role,
        token: res.invite.token,
        createdAt: new Date().toISOString(),
        expiresAt: res.invite.expires_at,
        emailSent: res.emailSent ?? false,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useRevokeInvite() {
  const { data: org } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      if (DEMO_MODE || !org?.id) return;
      await api(`/api/orgs/${org.id}/invites/${inviteId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useRemoveMember() {
  const { data: org } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (DEMO_MODE) return;
      if (!org?.id) throw new Error("No organization selected.");
      await api(`/api/orgs/${org.id}/members/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useBilling() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["billing", orgId],
    enabled: Boolean(orgId) || DEMO_MODE,
    queryFn: async (): Promise<BillingInfo> => {
      if (DEMO_MODE || !supabase || !orgId) return demoBilling;

      const [{ data, error }, { count: seatsUsed }] = await Promise.all([
        supabase.from("subscriptions").select("status, seats, tier").eq("org_id", orgId).maybeSingle(),
        supabase.from("org_members").select("*", { count: "exact", head: true }).eq("org_id", orgId),
      ]);
      if (error) throw new Error(error.message);

      const tier = data?.tier ?? "free";
      return {
        plan: tierLabel(tier),
        pricePerSeat: priceForTier(tier),
        seats: data?.seats ?? 0,
        seatsUsed: seatsUsed ?? 0,
        renewsOn: "—",
        status: data?.status ?? "none",
      };
    },
  });
}

export interface UsageInfo {
  plan: "free" | "pro" | "team";
  seats: number;
  used: number;
  /** `null` = unlimited (self-hosted). */
  quota: number | null;
  remaining: number | null;
  periodStart: string;
  periodEnd: string;
  blocked: boolean;
}

/** Monthly AI-review usage against the org's plan quota — every plan can see its own (not Team-gated). */
export function useUsage() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["usage", orgId],
    enabled: Boolean(orgId) || DEMO_MODE,
    queryFn: async (): Promise<UsageInfo> => {
      if (DEMO_MODE || !orgId) return demoUsage;
      return api<UsageInfo>(`/api/orgs/${orgId}/usage`);
    },
  });
}

export function useAuditLog() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["audit", orgId],
    enabled: Boolean(orgId) || DEMO_MODE,
    // Server-side plan-gated (Team only) — a 402 propagates as an ApiError with a
    // ready-to-display message ("The audit log is a Team-plan feature…"), surfaced by
    // Settings.tsx's existing `auditError` -> ErrorText rendering with no special-casing.
    queryFn: async (): Promise<AuditEntry[]> => {
      if (DEMO_MODE || !orgId) return demoAudit;

      const res = await api<{ entries: Array<{ id: string; actor: string; action: string; target: string | null; created_at: string }> }>(
        `/api/orgs/${orgId}/audit`,
      );
      return res.entries.map((e) => ({
        id: e.id,
        actor: e.actor,
        action: e.action,
        target: e.target ?? "",
        at: e.created_at,
      }));
    },
  });
}

/**
 * Cancels the org's Razorpay subscription (at the end of the current billing cycle —
 * the org keeps access through what's already paid for). Razorpay has no hosted
 * self-service portal the way Stripe does, so this is a direct in-app action rather
 * than a redirect.
 */
export function useCancelSubscription() {
  const { data: org } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (DEMO_MODE) throw new Error("Cancelling is unavailable in demo mode.");
      if (!org?.id) throw new Error("No organization selected.");
      await api(`/api/orgs/${org.id}/billing/cancel`, { method: "POST" });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

/** Switches an already-active subscription to a different tier, in place — no cancel/resubscribe needed. */
export function useChangePlan() {
  const { data: org } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tier: "pro" | "team"): Promise<void> => {
      if (DEMO_MODE) throw new Error("Changing plans is unavailable in demo mode.");
      if (!org?.id) throw new Error("No organization selected.");
      await api(`/api/orgs/${org.id}/billing/change-plan`, { method: "POST", body: JSON.stringify({ tier }) });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

/** Starts a Razorpay subscription for the given tier — redirect the browser to the returned hosted authorization page. */
export function useBillingCheckout() {
  const { data: org } = useOrg();

  return useMutation({
    mutationFn: async (tier: "pro" | "team"): Promise<string> => {
      if (DEMO_MODE) throw new Error("Checkout is unavailable in demo mode.");
      if (!org?.id) throw new Error("No organization selected.");
      const raw = await api<unknown>(`/api/orgs/${org.id}/billing/checkout`, {
        method: "POST",
        body: JSON.stringify({ tier }),
      });
      return checkoutUrlSchema.parse(raw).url;
    },
  });
}

/** Connects a Bitbucket workspace via a Workspace Access Token — creates a new org the caller owns and refetches the org switcher. */
export function useBitbucketConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      workspaceSlug: string;
      workspaceName: string;
      accessToken: string;
      accountEmail?: string;
    }): Promise<{
      orgId: string;
      repoCount: number;
      syncError?: string;
      workspace?: {
        orgId: string;
        name: string;
        workspaceSlug: string;
        accountEmail: string;
        repoCount: number;
      };
    }> => {
      if (DEMO_MODE) throw new Error("Connecting Bitbucket is unavailable in demo mode.");
      if (!args.accountEmail?.trim()) {
        throw new Error("Atlassian account email is required for Bitbucket API tokens.");
      }
      return api("/api/bitbucket/connect", {
        method: "POST",
        body: JSON.stringify({ ...args, accountEmail: args.accountEmail.trim() }),
      });
    },
    onSuccess: async (data, vars) => {
      queryClient.setQueryData<Org[]>(["orgs"], (prev) => {
        const list = prev ?? [];
        if (list.some((o) => o.id === data.orgId)) {
          return list.map((o) => (o.id === data.orgId ? { ...o, name: vars.workspaceName } : o));
        }
        return [
          ...list,
          {
            id: data.orgId,
            name: vars.workspaceName,
            kind: "team",
            plan: "free",
            role: "owner",
            platform: "bitbucket",
          },
        ];
      });
      await queryClient.invalidateQueries({ queryKey: ["orgs"] });
      await queryClient.refetchQueries({ queryKey: ["orgs"] });
      await queryClient.invalidateQueries({ queryKey: ["repos"] });
      await queryClient.invalidateQueries({ queryKey: ["bitbucket-workspaces"] });
    },
  });
}

export interface BitbucketWorkspaceRow {
  orgId: string;
  name: string;
  workspaceSlug: string;
  role: string;
  plan: string;
  repoCount: number;
  accountEmail: string | null;
  tokenPresent: boolean;
  tokenExpiresAt: string | null;
}

/** Connected Bitbucket workspaces for the signed-in user (Settings → Bitbucket accounts). */
export function useBitbucketWorkspaces() {
  const { authenticated } = useAuth();
  return useQuery({
    queryKey: ["bitbucket-workspaces"],
    enabled: DEMO_MODE || authenticated,
    queryFn: async (): Promise<BitbucketWorkspaceRow[]> => {
      if (DEMO_MODE) return [];
      const res = await api<{ workspaces: BitbucketWorkspaceRow[] }>("/api/bitbucket/workspaces");
      return res.workspaces;
    },
    staleTime: 30_000,
  });
}
