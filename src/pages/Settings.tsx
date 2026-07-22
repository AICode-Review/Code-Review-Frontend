import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOrg, useOrgs } from "../hooks/useOrg";
import {
  useAuditLog,
  useBilling,
  useBillingCheckout,
  useBitbucketConnect,
  useCancelSubscription,
  useChangePlan,
  useCreateInvite,
  useInvites,
  useMembers,
  useRemoveMember,
  useRevokeInvite,
  useUsage,
} from "../features/settings/useSettings";
import { DEMO_MODE } from "../lib/demo";
import { timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";

function InviteSection() {
  const { data: org } = useOrg();
  const { data: invites, isLoading, error } = useInvites();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [linkCopiedFallback, setLinkCopiedFallback] = useState(false);

  const canManage = org?.role === "owner" || org?.role === "admin";
  if (!canManage) return null;

  if (org?.kind === "individual") {
    return (
      <Card className="p-5">
        <SectionTitle>Invite teammates</SectionTitle>
        <p className="text-sm text-zinc-600">
          This is a personal account, so it's just you. Install the GitHub App on an organization
          account to create a team workspace you can invite people to.
        </p>
      </Card>
    );
  }

  function inviteLink(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function copyLink(id: string, token: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(token));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard unavailable — link is still visible in the row */
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setEmailSentTo(null);
    setLinkCopiedFallback(false);
    if (!email.trim()) return;
    try {
      const invite = await createInvite.mutateAsync({ email: email.trim(), role });
      setEmail("");
      if (invite.emailSent) {
        setEmailSentTo(invite.email);
      } else {
        await copyLink(invite.id, invite.token);
        setLinkCopiedFallback(true);
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <Card className="p-5">
      <SectionTitle hint={invites && invites.length > 0 ? `${invites.length} pending` : undefined}>
        Invite teammates
      </SectionTitle>

      <form onSubmit={(e) => void submit(e)} className="flex flex-wrap items-end gap-2">
        <label className="flex-1 basis-56">
          <span className="mb-1 block text-xs text-zinc-500">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs text-zinc-500">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "member")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={createInvite.isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createInvite.isPending ? "Sending…" : "Send invite"}
        </button>
      </form>
      {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
      {emailSentTo && (
        <p className="mt-2 text-xs text-emerald-600">Invite email sent to {emailSentTo}.</p>
      )}
      {DEMO_MODE && (
        <p className="mt-2 text-xs text-zinc-500">
          Demo mode — no email is actually sent; the invite link is copied to your clipboard.
        </p>
      )}
      {!DEMO_MODE && linkCopiedFallback && (
        <p className="mt-2 text-xs text-zinc-500">
          No email provider configured — the invite link was copied to your clipboard instead.
        </p>
      )}

      {isLoading && <LoadingText>Loading invites…</LoadingText>}
      {error && <ErrorText>{(error as Error).message}</ErrorText>}
      {invites && invites.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-200 text-sm">
          {invites.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-zinc-800">{inv.email}</p>
                <p className="text-xs text-zinc-500">
                  {inv.role} · sent {timeAgo(inv.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink(inv.id, inv.token)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400"
                >
                  {copiedId === inv.id ? "Copied!" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() => revokeInvite.mutate(inv.id)}
                  className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:border-red-300 hover:text-red-600"
                >
                  Revoke
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BitbucketConnectSection() {
  const connect = useBitbucketConnect();
  const { selectOrg } = useOrgs();
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setConnected(false);
    if (!workspaceSlug.trim() || !workspaceName.trim() || !accessToken.trim()) return;
    try {
      const { orgId } = await connect.mutateAsync({
        workspaceSlug: workspaceSlug.trim(),
        workspaceName: workspaceName.trim(),
        accessToken: accessToken.trim(),
      });
      setWorkspaceSlug("");
      setWorkspaceName("");
      setAccessToken("");
      setConnected(true);
      selectOrg(orgId);
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <Card className="p-5">
      <SectionTitle>Connect Bitbucket workspace</SectionTitle>
      <p className="mb-3 text-sm text-zinc-600">
        PR review automation for Bitbucket uses a token you generate yourself, not OAuth — sign-in
        via Bitbucket is separate and already works regardless of this. See the{" "}
        <Link to="/docs/bitbucket" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
          full setup guide
        </Link>{" "}
        for exact steps (token scopes, connecting, and adding the per-repo webhook).
      </p>
      <form onSubmit={(e) => void submit(e)} className="flex flex-wrap items-end gap-2">
        <label className="basis-40">
          <span className="mb-1 block text-xs text-zinc-500">Workspace slug</span>
          <input
            required
            value={workspaceSlug}
            onChange={(e) => setWorkspaceSlug(e.target.value)}
            placeholder="acme-team"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <label className="basis-40">
          <span className="mb-1 block text-xs text-zinc-500">Display name</span>
          <input
            required
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Acme Team"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <label className="flex-1 basis-56">
          <span className="mb-1 block text-xs text-zinc-500">Workspace access token</span>
          <input
            required
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={DEMO_MODE || connect.isPending}
          title={DEMO_MODE ? "Connecting Bitbucket is unavailable in demo mode" : undefined}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {connect.isPending ? "Connecting…" : "Connect"}
        </button>
      </form>
      {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
      {connected && <p className="mt-2 text-xs text-emerald-600">Connected — switched to the new workspace.</p>}
    </Card>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { data: org } = useOrg();
  const { data: members, isLoading: membersLoading, error: membersError } = useMembers();
  const removeMember = useRemoveMember();
  const { data: billing, isLoading: billingLoading, error: billingError } = useBilling();
  const { data: usage, isLoading: usageLoading, error: usageError } = useUsage();
  const { data: audit, isLoading: auditLoading, error: auditError } = useAuditLog();
  const cancelSub = useCancelSubscription();
  const changePlan = useChangePlan();
  const checkout = useBillingCheckout();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [changePlanError, setChangePlanError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const seatsUsed = members?.filter((m) => m.seatActive).length ?? 0;
  const hasActiveSubscription = billing?.status === "active";
  const otherPaidTier: "pro" | "team" | null = billing?.plan === "Pro" ? "team" : billing?.plan === "Team" ? "pro" : null;

  async function cancelSubscription() {
    setCancelError(null);
    if (!window.confirm("Cancel your subscription? You'll keep access until the end of the current billing cycle.")) return;
    try {
      await cancelSub.mutateAsync();
    } catch (err) {
      setCancelError((err as Error).message);
    }
  }

  async function switchPlan(tier: "pro" | "team") {
    setChangePlanError(null);
    try {
      await changePlan.mutateAsync(tier);
    } catch (err) {
      setChangePlanError((err as Error).message);
    }
  }

  async function startCheckout(tier: "pro" | "team") {
    setCheckoutError(null);
    try {
      const url = await checkout.mutateAsync(tier);
      window.location.assign(url);
    } catch (err) {
      setCheckoutError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      {org?.name && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-linear-to-r from-zinc-50 to-zinc-50/60 px-4 py-3 shadow-sm">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold uppercase text-blue-700">
            {org.name.slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-900">{org.name}</p>
            <p className="text-xs text-zinc-500">
              {org.kind === "individual" ? "Personal account" : "Organization"}
              {org.plan ? ` · ${org.plan}` : ""}
              {org.kind === "team" ? ` · your role: ${org.role}` : ""}
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden">
            <div className="p-5">
              <SectionTitle
                hint={
                  billing
                    ? `${seatsUsed} of ${billing.seats || "—"} seats in use`
                    : undefined
                }
              >
                Members & seats
              </SectionTitle>
              {membersLoading && <LoadingText>Loading members…</LoadingText>}
              {membersError && <ErrorText>{(membersError as Error).message}</ErrorText>}
              {members && members.length === 0 && <EmptyState>No members yet.</EmptyState>}
              {members && members.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="text-left text-xs text-zinc-500">
                        <th className="pb-2 font-normal">Member</th>
                        <th className="pb-2 font-normal">Role</th>
                        <th className="pb-2 font-normal">Seat</th>
                        {org?.role === "owner" && <th className="pb-2 font-normal" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2">
                            <span className="text-zinc-800">{m.handle}</span>
                            {m.email && <span className="ml-2 text-xs text-zinc-500">{m.email}</span>}
                          </td>
                          <td className="py-2 capitalize text-zinc-600">{m.role}</td>
                          <td className="py-2">
                            <Badge kind={m.seatActive ? "active" : "none"}>
                              {m.seatActive ? "active" : "inactive"}
                            </Badge>
                          </td>
                          {org?.role === "owner" && (
                            <td className="py-2 text-right">
                              {m.role !== "owner" && (
                                <button
                                  type="button"
                                  onClick={() => removeMember.mutate(m.id)}
                                  disabled={removeMember.isPending}
                                  className="text-xs text-zinc-500 hover:text-red-600 disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {removeMember.isError && (
                <p className="mt-2 text-xs text-red-600">{(removeMember.error as Error).message}</p>
              )}
            </div>
          </Card>

          <InviteSection />
          <BitbucketConnectSection />
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="p-5">
            <SectionTitle>Account</SectionTitle>
            <dl className="space-y-2 text-sm text-zinc-600">
              <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-2">
                <dt className="text-zinc-500">Email</dt>
                <dd className="truncate text-zinc-800" title={user?.email}>{user?.email ?? "—"}</dd>
              </div>
              <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-2">
                <dt className="text-zinc-500">Provider</dt>
                <dd className="capitalize text-zinc-800">{user?.provider ?? "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <SectionTitle>Billing</SectionTitle>
            {billingLoading && <LoadingText>Loading billing…</LoadingText>}
            {billingError && <ErrorText>{(billingError as Error).message}</ErrorText>}
            {billing && (
              <div className="space-y-4">
                <div className="text-sm text-zinc-600">
                  <p>
                    <span className="font-medium text-zinc-900">{billing.plan}</span>
                    {billing.pricePerSeat > 0 && (
                      <>
                        {" "}
                        · ${billing.pricePerSeat}/seat/month · {billing.seats} seats
                      </>
                    )}
                  </p>
                  {billing.renewsOn !== "—" && (
                    <p className="mt-1 text-xs text-zinc-500">Renews {billing.renewsOn}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-600">Status: {billing.status}</p>
                </div>
                {hasActiveSubscription ? (
                  <div className="space-y-2">
                    {otherPaidTier && (
                      <button
                        type="button"
                        disabled={DEMO_MODE || changePlan.isPending}
                        title={DEMO_MODE ? "Connect billing to enable plan changes" : undefined}
                        onClick={() => void switchPlan(otherPaidTier)}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {changePlan.isPending ? "Switching…" : `Switch to ${otherPaidTier === "team" ? "Team" : "Pro"}`}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={DEMO_MODE || cancelSub.isPending}
                      title={DEMO_MODE ? "Connect billing to enable cancellation" : undefined}
                      onClick={() => void cancelSubscription()}
                      className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-red-600 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelSub.isPending ? "Cancelling…" : "Cancel subscription"}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <button
                      type="button"
                      disabled={DEMO_MODE || checkout.isPending}
                      title={DEMO_MODE ? "Connect billing to enable checkout" : undefined}
                      onClick={() => void startCheckout("pro")}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {checkout.isPending ? "Redirecting…" : "Upgrade to Pro"}
                    </button>
                    <button
                      type="button"
                      disabled={DEMO_MODE || checkout.isPending}
                      title={DEMO_MODE ? "Connect billing to enable checkout" : undefined}
                      onClick={() => void startCheckout("team")}
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Upgrade to Team
                    </button>
                  </div>
                )}
              </div>
            )}
            {cancelError && <p className="mt-2 text-xs text-red-600">{cancelError}</p>}
            {changePlanError && <p className="mt-2 text-xs text-red-600">{changePlanError}</p>}
            {checkoutError && <p className="mt-2 text-xs text-red-600">{checkoutError}</p>}
          </Card>

          <Card className="p-5">
            <SectionTitle>AI review usage</SectionTitle>
            {usageLoading && <LoadingText>Loading usage…</LoadingText>}
            {usageError && <ErrorText>{(usageError as Error).message}</ErrorText>}
            {usage && usage.quota === null && (
              <p className="text-sm text-zinc-600">Unlimited — self-hosted deployments use your own LLM keys.</p>
            )}
            {usage && usage.quota !== null && (() => {
              const pct = usage.quota > 0 ? usage.used / usage.quota : 0;
              const nearingLimit = !usage.blocked && pct >= 0.8;
              const nextTier: "pro" | "team" | null = usage.plan === "free" ? "pro" : usage.plan === "pro" ? "team" : null;
              return (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-zinc-900">
                        {usage.used} of {usage.quota} reviews used this month
                      </span>
                      <span className="text-xs text-zinc-500">
                        Resets {new Date(usage.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-zinc-500">
                      {usage.plan} plan · {usage.seats} seat{usage.seats === 1 ? "" : "s"}
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-[width] ${
                          usage.blocked ? "bg-red-500" : nearingLimit ? "bg-amber-500" : "bg-zinc-900"
                        }`}
                        style={{ width: `${Math.min(100, pct * 100)}%` }}
                      />
                    </div>
                  </div>

                  {usage.blocked && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      <p className="font-medium">Monthly review limit reached — new reviews are paused.</p>
                      <p className="mt-0.5">
                        Resets {new Date(usage.periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        {nextTier ? ", or upgrade now for a higher limit." : "."}
                      </p>
                    </div>
                  )}
                  {nearingLimit && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <p className="font-medium">Approaching your monthly review limit.</p>
                      {nextTier && <p className="mt-0.5">Upgrade before you hit it to avoid a pause in reviews.</p>}
                    </div>
                  )}
                  {(usage.blocked || nearingLimit) && nextTier && (
                    <button
                      type="button"
                      disabled={DEMO_MODE || checkout.isPending}
                      title={DEMO_MODE ? "Connect billing to enable checkout" : undefined}
                      onClick={() => void startCheckout(nextTier)}
                      className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {checkout.isPending ? "Redirecting…" : `Upgrade to ${nextTier === "pro" ? "Pro" : "Team"}`}
                    </button>
                  )}
                </div>
              );
            })()}
          </Card>

          <Card className="p-5">
            <SectionTitle>Audit log</SectionTitle>
            {auditLoading && <LoadingText>Loading audit log…</LoadingText>}
            {auditError && <ErrorText>{(auditError as Error).message}</ErrorText>}
            {audit && audit.length === 0 && <EmptyState>No audit events yet.</EmptyState>}
            {audit && audit.length > 0 && (
              <ul className="divide-y divide-zinc-200 text-sm">
                {audit.map((entry) => (
                  <li key={entry.id} className="py-2">
                    <p className="min-w-0 wrap-break-word text-zinc-700">
                      <span className="text-zinc-500">{entry.actor}</span>{" "}
                      <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px]">{entry.action}</code>{" "}
                      <span className="text-zinc-600">{entry.target}</span>
                    </p>
                    <span className="mt-1 block text-xs text-zinc-500">{timeAgo(entry.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
