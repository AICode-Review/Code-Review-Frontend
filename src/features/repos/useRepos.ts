import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE, demoRepos, type DemoRepo } from "../../lib/demo";
import { repoConfigSchema, type RepoConfigPayload } from "../../lib/schemas";
import { useOrg } from "../../hooks/useOrg";

export type Repo = DemoRepo;

interface RepoRow {
  id: string;
  name: string;
  default_branch: string;
  index_status: Repo["indexStatus"];
  tier1_langs: string[];
  config: Record<string, unknown> | null;
  orgs?: { name: string } | null;
}

function fromRow(row: RepoRow): Repo {
  const config = row.config ?? {};
  return {
    id: row.id,
    name: row.name,
    owner: row.orgs?.name ?? "",
    defaultBranch: row.default_branch,
    indexStatus: row.index_status,
    tier1Langs: row.tier1_langs ?? [],
    strictness: (config["strictness"] as Repo["strictness"]) ?? "standard",
    commentBudget: (config["commentBudget"] as number) ?? 7,
    ignoredPaths: (config["ignoredPaths"] as string[]) ?? [],
    failOnCritical: (config["failOnCritical"] as boolean) ?? false,
    openPrs: (config["openPrs"] as number) ?? 0,
    acceptancePct: (config["acceptancePct"] as number) ?? 0,
    noisePct: (config["noisePct"] as number) ?? 0,
  };
}

/** Repos for the currently-selected org only — a user in multiple orgs must not see them mixed together. */
export function useRepos() {
  const { data: org } = useOrg();
  const orgId = org?.id;

  return useQuery({
    queryKey: ["repos", orgId],
    enabled: DEMO_MODE || Boolean(orgId),
    queryFn: async (): Promise<Repo[]> => {
      if (DEMO_MODE || !supabase || !orgId) return demoRepos;
      const { data, error } = await supabase
        .from("repos")
        .select("id, name, default_branch, index_status, tier1_langs, config, orgs(name)")
        .eq("org_id", orgId)
        .order("name");
      if (error) throw new Error(error.message);
      return ((data ?? []) as unknown as RepoRow[]).map(fromRow);
    },
  });
}

export function useRepo(id: string | undefined) {
  const repos = useRepos();
  return {
    ...repos,
    data: id ? repos.data?.find((r) => r.id === id) : undefined,
  };
}

export function useSaveRepoConfig(repoId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RepoConfigPayload) => {
      const parsed = repoConfigSchema.parse(config);
      if (DEMO_MODE) return parsed;
      if (!repoId) throw new Error("Missing repository id");
      await api(`/api/repos/${repoId}/config`, {
        method: "PATCH",
        body: JSON.stringify(parsed),
      });
      return parsed;
    },
    onSuccess: () => {
      // ["repos", orgId] — partial-key invalidation refetches whichever org is selected.
      void queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}
