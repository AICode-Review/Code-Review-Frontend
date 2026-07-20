import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DEMO_MODE, type DemoFinding } from "../../lib/demo";
import { getDemoRun, setDemoFindingFeedback, subscribeDemoStore } from "../../lib/demoStore";
import { api } from "../../lib/api";
import type { RunRow } from "./useRuns";

export type Finding = DemoFinding;

/**
 * Single review run + findings. Subscribes to realtime / demo store so
 * in-progress runs update when verification finishes.
 */
export function useRun(id: string | undefined) {
  const queryClient = useQueryClient();
  const [, bump] = useState(0);

  useEffect(() => {
    if (!DEMO_MODE) return;
    return subscribeDemoStore(() => {
      bump((n) => n + 1);
      void queryClient.invalidateQueries({ queryKey: ["run", id] });
    });
  }, [id, queryClient]);

  useEffect(() => {
    if (!supabase || !id) return;
    const channel = supabase
      .channel(`review_run_${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "review_runs", filter: `id=eq.${id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["run", id] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "findings", filter: `run_id=eq.${id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["run", id] });
        },
      )
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [id, queryClient]);

  const query = useQuery({
    queryKey: ["run", id, bump],
    enabled: Boolean(id),
    refetchInterval: (q) => {
      const status = q.state.data?.run.status;
      return status === "running" || status === "queued" ? 1500 : false;
    },
    queryFn: async (): Promise<{ run: RunRow; findings: Finding[] } | null> => {
      if (!id) return null;

      if (DEMO_MODE || !supabase) {
        return getDemoRun(id);
      }

      const { data: run, error: runErr } = await supabase
        .from("review_runs")
        .select("*, pull_requests(number, repos(name))")
        .eq("id", id)
        .maybeSingle();
      if (runErr) throw new Error(runErr.message);
      if (!run) return null;

      const { data: findings, error: findErr } = await supabase
        .from("findings")
        .select("id, run_id, pass, category, severity, confidence, path, start_line, end_line, title, body_md, why_it_matters, impact, fix_steps, suggested_fix, code_snippet, verified_how, verification_method, verification_status, posted, in_digest, feedback")
        .eq("run_id", id)
        .order("confidence", { ascending: false });
      if (findErr) throw new Error(findErr.message);

      const row = run as unknown as RunRow & { error?: string | null };
      return {
        run: {
          ...row,
          error: row.error ?? null,
          trigger: row.trigger ?? "automatic",
          summary: row.summary ?? null,
        },
        findings: ((findings ?? []) as Array<Record<string, unknown>>).map((f) => ({
          id: String(f["id"]),
          runId: String(f["run_id"]),
          pass: String(f["pass"]),
          category: String(f["category"]),
          severity: f["severity"] as Finding["severity"],
          confidence: Number(f["confidence"]),
          path: String(f["path"]),
          startLine: Number(f["start_line"]),
          endLine: Number(f["end_line"]),
          title: String(f["title"]),
          bodyMd: String(f["body_md"]),
          whyItMatters: String(f["why_it_matters"] ?? f["body_md"] ?? ""),
          impact: String(f["impact"] ?? "See comment for details."),
          fixSteps: Array.isArray(f["fix_steps"])
            ? (f["fix_steps"] as string[])
            : ["See suggested patch below if available."],
          suggestedFix: f["suggested_fix"] ? String(f["suggested_fix"]) : undefined,
          codeSnippet: f["code_snippet"] ? String(f["code_snippet"]) : undefined,
          verifiedHow: String(
            f["verified_how"] ??
              `Verified via ${String(f["verification_method"] ?? "static").replace("_", " ")}.`,
          ),
          verificationMethod: (f["verification_method"] as Finding["verificationMethod"]) ?? "none",
          verificationStatus: f["verification_status"] as Finding["verificationStatus"],
          posted: Boolean(f["posted"]),
          inDigest: Boolean(f["in_digest"]),
          feedback: (f["feedback"] as Finding["feedback"]) ?? null,
        })),
      };
    },
  });

  function setFeedback(findingId: string, feedback: NonNullable<Finding["feedback"]>) {
    if (DEMO_MODE) {
      setDemoFindingFeedback(findingId, feedback);
      return;
    }
    // Optimistic update, then persist — POST /api/findings/:id/feedback records a
    // learning_event and (on dismiss/ignore) enqueues the rulebook compiler.
    queryClient.setQueryData(
      ["run", id, bump],
      (prev: { run: RunRow; findings: Finding[] } | null | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          findings: prev.findings.map((f) => (f.id === findingId ? { ...f, feedback } : f)),
        };
      },
    );
    void api(`/api/findings/${findingId}/feedback`, { method: "POST", body: JSON.stringify({ feedback }) }).catch(
      (err) => {
        console.error("Failed to submit finding feedback:", err);
      },
    );
  }

  return { ...query, setFeedback };
}
