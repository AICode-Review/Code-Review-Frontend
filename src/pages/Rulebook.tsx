import { useMemo, useState } from "react";
import { useRulebook, type Rule } from "../features/rulebook/useRulebook";
import { useRepos } from "../features/repos/useRepos";
import { timeAgo } from "../lib/format";
import { Badge, Card, EmptyState, ErrorText, LoadingText, SectionTitle } from "../components/ui";
import { PageIntro } from "../components/layout/AppShell";

function RuleRow({
  rule,
  onSetActive,
  onRemove,
  disabled,
}: {
  rule: Rule;
  onSetActive: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-800">{rule.ruleText}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Badge kind={rule.source} />
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px]">{rule.category}</span>
            <span>{rule.repoName ?? "org-wide"}</span>
            {rule.source === "learned" && (
              <span>
                {rule.evidenceCount} evidence event{rule.evidenceCount === 1 ? "" : "s"}
              </span>
            )}
            <span>· {timeAgo(rule.createdAt)}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {rule.active ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSetActive(rule.id, false)}
              className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:border-zinc-400 disabled:opacity-50"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSetActive(rule.id, true)}
              className="rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Approve
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(rule.id)}
            className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Rulebook() {
  const { rules, setActive, addRule, removeRule, isLoading, error, mutationError, isMutating } =
    useRulebook();
  const { data: repos } = useRepos();

  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [newRule, setNewRule] = useState("");
  const [newCategory, setNewCategory] = useState("style");
  const [newRepo, setNewRepo] = useState<string>("org");

  const filtered = useMemo(
    () =>
      rules.filter((r) => {
        if (repoFilter === "all") return true;
        if (repoFilter === "org") return r.repoName === null;
        return r.repoName === repoFilter;
      }),
    [rules, repoFilter],
  );

  const active = filtered.filter((r) => r.active);
  const pending = filtered.filter((r) => !r.active);

  return (
    <div className="space-y-5">
      <PageIntro description="Your team's standards—learned from review feedback or added manually. Rules with repeated evidence activate automatically; single-event rules wait for approval." />

      {isLoading && <LoadingText>Loading rulebook…</LoadingText>}
      {error && <ErrorText>Failed to load rules: {(error as Error).message}</ErrorText>}
      {mutationError && <ErrorText>{mutationError}</ErrorText>}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-zinc-500">Scope:</span>
        {["all", "org", ...(repos?.map((r) => r.name) ?? [])].map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => setRepoFilter(scope)}
            className={`rounded-lg border px-2.5 py-1 text-xs ${
              repoFilter === scope
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
            }`}
          >
            {scope === "all" ? "All" : scope === "org" ? "Org-wide" : scope}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <SectionTitle>Add a rule in plain language</SectionTitle>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder='e.g. "Never flag missing JSDoc on internal helpers"'
            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-2 text-sm text-zinc-700"
          >
            {["style", "logic", "security", "contracts", "errors", "tests", "concurrency", "performance"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={newRepo}
            onChange={(e) => setNewRepo(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-2 text-sm text-zinc-700"
          >
            <option value="org">org-wide</option>
            {repos?.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isMutating || !newRule.trim()}
            onClick={() => {
              if (!newRule.trim()) return;
              addRule(newRule.trim(), newCategory, newRepo === "org" ? null : newRepo);
              setNewRule("");
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Add rule
          </button>
        </div>
      </Card>

      <section>
        <SectionTitle hint={`${pending.length} awaiting approval`}>Pending rules</SectionTitle>
        {pending.length === 0 ? (
          <EmptyState>Nothing pending — new single-evidence learned rules appear here.</EmptyState>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-amber-200 bg-zinc-50">
            {pending.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onSetActive={setActive}
                onRemove={removeRule}
                disabled={isMutating}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle hint={`${active.length} enforced on every review`}>Active rules</SectionTitle>
        {active.length === 0 ? (
          <EmptyState>No active rules for this scope yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50">
            {active.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onSetActive={setActive}
                onRemove={removeRule}
                disabled={isMutating}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
