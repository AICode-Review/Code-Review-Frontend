import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useOrgs } from "../hooks/useOrg";
import { useBitbucketConnect, useBitbucketWorkspaces, type BitbucketWorkspaceRow } from "../features/settings/useSettings";
import { DEMO_MODE } from "../lib/demo";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";

const FORM_DRAFT_KEY = "codeferret.bitbucketConnectDraft";

interface ConnectDraft {
  workspaceSlug: string;
  workspaceName: string;
  accountEmail: string;
}

function readDraft(): ConnectDraft {
  try {
    const raw = localStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return { workspaceSlug: "", workspaceName: "", accountEmail: "" };
    const parsed = JSON.parse(raw) as Partial<ConnectDraft>;
    return {
      workspaceSlug: typeof parsed.workspaceSlug === "string" ? parsed.workspaceSlug : "",
      workspaceName: typeof parsed.workspaceName === "string" ? parsed.workspaceName : "",
      accountEmail: typeof parsed.accountEmail === "string" ? parsed.accountEmail : "",
    };
  } catch {
    return { workspaceSlug: "", workspaceName: "", accountEmail: "" };
  }
}

function writeDraft(draft: ConnectDraft): void {
  try {
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

function WorkspaceCard({
  workspace,
  selected,
  onSelect,
  onLoadIntoForm,
}: {
  workspace: BitbucketWorkspaceRow;
  selected: boolean;
  onSelect: () => void;
  onLoadIntoForm: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        selected ? "border-blue-300 bg-blue-50/60" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900">{workspace.name}</p>
            <Badge kind="manual">Bitbucket</Badge>
            {selected && <Badge kind="active">Active</Badge>}
          </div>
          <dl className="mt-2 grid gap-1 text-xs text-zinc-600 sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Workspace slug</dt>
              <dd className="font-medium text-zinc-800">{workspace.workspaceSlug}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Atlassian email</dt>
              <dd className="font-medium text-zinc-800">{workspace.accountEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Repositories</dt>
              <dd className="font-medium text-zinc-800">{workspace.repoCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Token</dt>
              <dd className="font-medium text-zinc-800">
                {workspace.tokenPresent ? "Saved (encrypted)" : "Missing — reconnect"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {!selected && (
            <button
              type="button"
              onClick={onSelect}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-400"
            >
              Switch to this workspace
            </button>
          )}
          <button
            type="button"
            onClick={onLoadIntoForm}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            Update connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BitbucketAccounts() {
  const connect = useBitbucketConnect();
  const { data: workspaces, isLoading, error, refetch } = useBitbucketWorkspaces();
  const { selectedOrgId, selectOrg } = useOrgs();

  const [draft, setDraft] = useState<ConnectDraft>(() => readDraft());
  const [accessToken, setAccessToken] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateDraft(patch: Partial<ConnectDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      writeDraft(next);
      return next;
    });
  }

  function loadWorkspaceIntoForm(workspace: BitbucketWorkspaceRow) {
    updateDraft({
      workspaceSlug: workspace.workspaceSlug,
      workspaceName: workspace.name,
      accountEmail: workspace.accountEmail ?? draft.accountEmail,
    });
    setAccessToken("");
    setFormError(null);
    setSyncError(null);
    setSuccessMessage(`Loaded “${workspace.name}” — paste a new token to update the connection. Details stay filled in.`);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSyncError(null);
    setSuccessMessage(null);

    const workspaceSlug = draft.workspaceSlug.trim();
    const workspaceName = draft.workspaceName.trim();
    const accountEmail = draft.accountEmail.trim();
    const token = accessToken.trim();

    if (!workspaceSlug || !workspaceName || !token) {
      setFormError("Workspace slug, display name, and API token are required.");
      return;
    }
    if (!accountEmail || /example\.com$/i.test(accountEmail) || /@domain\.com$/i.test(accountEmail)) {
      setFormError(
        "Type your real Atlassian/Bitbucket login email (grey placeholder text means the field is empty).",
      );
      return;
    }

    try {
      const result = await connect.mutateAsync({
        workspaceSlug,
        workspaceName,
        accessToken: token,
        accountEmail,
      });
      // Keep slug / name / email after connect — only clear the secret token field.
      writeDraft({ workspaceSlug, workspaceName, accountEmail });
      setAccessToken("");
      selectOrg(result.orgId);
      await refetch();

      if (result.syncError) {
        setSyncError(result.syncError);
        setSuccessMessage(
          `Saved connection for “${workspaceName}” (${workspaceSlug}), but repo import had a problem.`,
        );
      } else {
        setSuccessMessage(
          `Saved “${workspaceName}” (${workspaceSlug}) — imported ${result.repoCount} repo${
            result.repoCount === 1 ? "" : "s"
          }. Details above stay filled so you can update the token later.`,
        );
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/settings" className="text-xs font-medium text-blue-600 hover:underline">
            ← Back to Settings
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-zinc-900">Bitbucket accounts</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Connect and manage Bitbucket workspaces. Connection details are kept after save so you can
            update a token without retyping everything.{" "}
            <Link to="/docs/bitbucket" className="font-medium text-blue-600 hover:underline">
              Setup guide
            </Link>
          </p>
        </div>
      </div>

      <Card className="p-5">
        <SectionTitle hint={workspaces && workspaces.length > 0 ? `${workspaces.length} connected` : undefined}>
          Connected workspaces
        </SectionTitle>
        {isLoading && <LoadingText>Loading Bitbucket workspaces…</LoadingText>}
        {error && <ErrorText>{(error as Error).message}</ErrorText>}
        {!isLoading && !error && (workspaces?.length ?? 0) === 0 && (
          <EmptyState>
            No Bitbucket workspaces yet. Use the form below to connect a workspace. Private repos work when
            the token has read:repository:bitbucket and your Atlassian email is set.
          </EmptyState>
        )}
        <div className="mt-3 space-y-3">
          {workspaces?.map((workspace) => (
            <WorkspaceCard
              key={workspace.orgId}
              workspace={workspace}
              selected={selectedOrgId === workspace.orgId}
              onSelect={() => selectOrg(workspace.orgId)}
              onLoadIntoForm={() => loadWorkspaceIntoForm(workspace)}
            />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle>Add or update workspace</SectionTitle>
        <p className="mb-3 text-sm text-zinc-600">
          After a successful connect, slug, display name, and email stay filled in. Only the token field
          is cleared (for security). Use <strong>Update connection</strong> on a card above to reload a
          saved workspace into this form.
        </p>
        <form onSubmit={(e) => void submit(e)} className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs text-zinc-500">Workspace slug</span>
            <input
              required
              value={draft.workspaceSlug}
              onChange={(e) => updateDraft({ workspaceSlug: e.target.value })}
              placeholder="aicode_review93"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-zinc-500">Display name</span>
            <input
              required
              value={draft.workspaceName}
              onChange={(e) => updateDraft({ workspaceName: e.target.value })}
              placeholder="AI Code Review"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-zinc-500">Atlassian account email (required)</span>
            <input
              required
              type="email"
              value={draft.accountEmail}
              onChange={(e) => updateDraft({ accountEmail: e.target.value })}
              placeholder="e.g. name@gmail.com"
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <span className="mt-1 block text-[11px] text-zinc-500">
              Must be the email you use to sign in to Bitbucket. Grey placeholder text means this field
              is empty.
            </span>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs text-zinc-500">API / access token</span>
            <input
              required
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Paste token (cleared after save)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={DEMO_MODE || connect.isPending}
              title={DEMO_MODE ? "Connecting Bitbucket is unavailable in demo mode" : undefined}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connect.isPending ? "Saving…" : "Save Bitbucket connection"}
            </button>
          </div>
        </form>
        {formError && <p className="mt-3 text-xs text-red-600">{formError}</p>}
        {syncError && <p className="mt-3 text-xs text-amber-700">{syncError}</p>}
        {successMessage && <p className="mt-3 text-xs text-emerald-700">{successMessage}</p>}
      </Card>
    </div>
  );
}
