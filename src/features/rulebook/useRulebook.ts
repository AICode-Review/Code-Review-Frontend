import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE, demoRules, type DemoRule } from "../../lib/demo";
import { useOrg } from "../../hooks/useOrg";

export type Rule = DemoRule;

interface RuleRow {
  id: string;
  rule_text: string;
  category: string;
  source: "learned" | "manual";
  active: boolean;
  evidence_count: number;
  created_at: string;
  repos: { name: string } | null;
}

function mapRow(r: RuleRow): Rule {
  return {
    id: r.id,
    ruleText: r.rule_text,
    category: r.category,
    source: r.source,
    active: r.active,
    evidenceCount: r.evidence_count,
    repoName: r.repos?.name ?? null,
    createdAt: r.created_at,
  };
}

/**
 * Rulebook: demo mutations are local; live reads via RLS and writes via REST.
 */
export function useRulebook() {
  const { data: org } = useOrg();
  const orgId = org?.id;
  const queryClient = useQueryClient();
  const [localRules, setLocalRules] = useState<Rule[]>(demoRules);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["rulebook", orgId],
    enabled: DEMO_MODE || Boolean(orgId),
    queryFn: async (): Promise<Rule[]> => {
      if (DEMO_MODE || !supabase || !orgId) return localRules;
      const { data, error } = await supabase
        .from("rulebook_rules")
        .select("id, rule_text, category, source, active, evidence_count, created_at, repos(name)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return ((data ?? []) as unknown as RuleRow[]).map(mapRow);
    },
    ...(DEMO_MODE ? { initialData: localRules } : {}),
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["rulebook"] });
  }, [queryClient]);

  const setActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (DEMO_MODE) {
        setLocalRules((rules) => rules.map((r) => (r.id === id ? { ...r, active } : r)));
        return;
      }
      if (!orgId) throw new Error("No organization");
      await api(`/api/orgs/${orgId}/rulebook/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: invalidate,
    onError: (err) => setMutationError((err as Error).message),
  });

  const addMutation = useMutation({
    mutationFn: async ({
      ruleText,
      category,
      repoName,
    }: {
      ruleText: string;
      category: string;
      repoName: string | null;
    }) => {
      if (DEMO_MODE) {
        setLocalRules((rules) => [
          {
            id: `rule-local-${Date.now()}`,
            ruleText,
            category,
            source: "manual",
            active: true,
            evidenceCount: 0,
            repoName,
            createdAt: new Date().toISOString(),
          },
          ...rules,
        ]);
        return;
      }
      if (!orgId) throw new Error("No organization");
      await api(`/api/orgs/${orgId}/rulebook`, {
        method: "POST",
        body: JSON.stringify({ ruleText, category, repoName }),
      });
    },
    onSuccess: invalidate,
    onError: (err) => setMutationError((err as Error).message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (DEMO_MODE) {
        setLocalRules((rules) => rules.filter((r) => r.id !== id));
        return;
      }
      if (!orgId) throw new Error("No organization");
      await api(`/api/orgs/${orgId}/rulebook/${id}`, { method: "DELETE" });
    },
    onSuccess: invalidate,
    onError: (err) => setMutationError((err as Error).message),
  });

  return {
    rules: DEMO_MODE ? localRules : (query.data ?? []),
    isLoading: query.isLoading,
    error: query.error,
    mutationError,
    clearMutationError: () => setMutationError(null),
    setActive: (id: string, active: boolean) => {
      setMutationError(null);
      setActiveMutation.mutate({ id, active });
    },
    addRule: (ruleText: string, category: string, repoName: string | null) => {
      setMutationError(null);
      addMutation.mutate({ ruleText, category, repoName });
    },
    removeRule: (id: string) => {
      setMutationError(null);
      removeMutation.mutate(id);
    },
    isMutating: setActiveMutation.isPending || addMutation.isPending || removeMutation.isPending,
  };
}
