import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRepoChat, chatErrorMessage, isChatPlanRequiredError, type ChatMessage } from "../../features/repos/useRepoChat";
import { Card, EmptyState, LoadingText, SectionTitle } from "../ui";

const SUGGESTIONS = ["How does authentication work?", "Where are money amounts formatted?", "How do refunds affect the ledger?"];

function SourceChips({ sources }: { sources: ChatMessage["sources"] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <span
          key={`${s.path}:${s.startLine}`}
          title={`similarity ${s.similarity.toFixed(2)}`}
          className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600"
        >
          {s.path}:{s.startLine}
          {s.endLine !== s.startLine ? `-${s.endLine}` : ""}
        </span>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-blue-600 text-white" : "border border-zinc-200/80 bg-zinc-50 text-zinc-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && <SourceChips sources={message.sources} />}
      </div>
    </div>
  );
}

/**
 * "Ask a question about this whole repo" — not scoped to a specific finding or PR, unlike the
 * existing chat-with-reviewer feature (which only replies inside a PR comment thread). Grounded
 * in real retrieved code via the indexer's embeddings (backend/src/engine/repoChat.ts); demo
 * mode simulates the round trip so the page stays fully browsable with no backend.
 */
export function RepoChat({ repoId }: { repoId: string | undefined }) {
  const { data: messages, isLoading, ask } = useRepoChat(repoId);
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || ask.isPending) return;
    ask.mutate(trimmed);
    setQuestion("");
    inputRef.current?.focus();
  }

  return (
    <Card className="p-5">
      <SectionTitle hint="grounded in this repo's indexed code — Individual plan">Ask the codebase</SectionTitle>

      {isLoading ? (
        <LoadingText>Loading conversation…</LoadingText>
      ) : (
        <div className="max-h-[28rem] min-h-[8rem] space-y-3 overflow-y-auto rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-3">
          {(!messages || messages.length === 0) && !ask.isPending ? (
            <div>
              <EmptyState>Ask anything about how this repository works — a function, a file, a feature.</EmptyState>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 hover:border-blue-300 hover:text-blue-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(messages ?? []).map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {ask.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 px-3.5 py-2.5">
                    <LoadingText>Thinking…</LoadingText>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {ask.isError && <p className="mt-2 text-xs text-red-600">{chatErrorMessage(ask.error)}</p>}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How does the checkout discount get applied?"
          disabled={ask.isPending || !repoId}
          className="flex-1 rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:border-blue-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={ask.isPending || !question.trim() || !repoId}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ask.isPending ? "Asking…" : "Ask"}
        </button>
      </form>

      {ask.isError && isChatPlanRequiredError(ask.error) && (
        <p className="mt-2 text-xs text-zinc-500">
          <Link to="/settings" className="text-blue-600 hover:underline">
            Upgrade to Individual
          </Link>{" "}
          to unlock full-codebase chat.
        </p>
      )}
    </Card>
  );
}
