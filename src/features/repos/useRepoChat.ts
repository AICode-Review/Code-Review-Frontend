import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { DEMO_MODE } from "../../lib/demo";
import { askDemoRepoChat, getDemoChatMessages, subscribeDemoStore, type DemoChatMessage } from "../../lib/demoStore";

export type ChatSource = DemoChatMessage["sources"][number];
export type ChatMessage = DemoChatMessage;

/**
 * Full-codebase chat for one repo — "ask a question about this repo," not just a specific
 * finding. Backed live by POST/GET /api/repos/:id/chat (semantic search over the indexer's
 * embeddings + an LLM call grounded in the actual retrieved code); demo mode simulates the
 * round trip locally (lib/demoStore.ts#askDemoRepoChat) so the page is still browsable with
 * no backend, same convention as every other demo-mode feature.
 */
export function useRepoChat(repoId: string | undefined) {
  const queryClient = useQueryClient();
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (!DEMO_MODE) return;
    return subscribeDemoStore(() => setBump((n) => n + 1));
  }, []);

  // Demo mode needs `bump` in the key so a demo-store mutation (which notifies
  // synchronously, outside React) forces a refetch; live mode's cache is instead kept in
  // sync explicitly via setQueryData below, so its key must stay stable across renders.
  const queryKey = DEMO_MODE ? (["repoChat", repoId, bump] as const) : (["repoChat", repoId] as const);

  const query = useQuery({
    queryKey,
    enabled: Boolean(repoId),
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!repoId) return [];
      if (DEMO_MODE) return getDemoChatMessages(repoId);
      const res = await api<{ messages: ChatMessage[] }>(`/api/repos/${repoId}/chat`);
      return res.messages;
    },
  });

  const ask = useMutation({
    mutationFn: async (question: string): Promise<ChatMessage> => {
      if (!repoId) throw new Error("Missing repository id");
      if (DEMO_MODE) return askDemoRepoChat(repoId, question);
      const res = await api<{ answer: string; sources: ChatSource[] }>(`/api/repos/${repoId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      return { id: crypto.randomUUID(), role: "assistant", content: res.answer, sources: res.sources, createdAt: new Date().toISOString() };
    },
    onMutate: (question: string) => {
      if (DEMO_MODE) return; // demo mode already appends the user turn itself, synchronously, inside askDemoRepoChat
      const optimisticUser: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question, sources: [], createdAt: new Date().toISOString() };
      queryClient.setQueryData(queryKey, (prev: ChatMessage[] | undefined) => [...(prev ?? []), optimisticUser]);
    },
    onSuccess: (assistantMsg) => {
      if (DEMO_MODE) return; // demo mode's own store mutation already triggered a refetch via subscribeDemoStore
      queryClient.setQueryData(queryKey, (prev: ChatMessage[] | undefined) => [...(prev ?? []), assistantMsg]);
    },
  });

  return { ...query, ask };
}

export function chatErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Failed to get an answer — try again.";
}

/** Matches on the error CODE, not displayed text — robust to wording/plan-name changes (unlike a `.includes("Pro")` string check on the message). */
export function isChatPlanRequiredError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402 && err.body?.error === "pro_plan_required";
}
