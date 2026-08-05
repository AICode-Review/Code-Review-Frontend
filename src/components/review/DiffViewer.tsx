import { useMemo, useState } from "react";
import { Card, SectionTitle } from "../ui";

export type DiffLineKind = "context" | "add" | "del";

export interface DiffLine {
  kind: DiffLineKind;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

export interface DiffFile {
  path: string;
  language?: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

export interface PrDiff {
  baseSha: string;
  headSha: string;
  baseLabel: string;
  headLabel: string;
  files: DiffFile[];
  stats: { files: number; additions: number; deletions: number };
}

type ViewMode = "split" | "unified";

function LineGutter({ n }: { n: number | null }) {
  return (
    <span className="inline-block w-10 shrink-0 select-none pr-2 text-right text-[10px] text-zinc-600">
      {n ?? ""}
    </span>
  );
}

function SplitRow({ line }: { line: DiffLine }) {
  const oldBg =
    line.kind === "del" ? "bg-red-50 text-red-900" : line.kind === "add" ? "bg-transparent" : "";
  const newBg =
    line.kind === "add" ? "bg-emerald-50 text-emerald-900" : line.kind === "del" ? "bg-transparent" : "";
  const oldText = line.kind === "add" ? "" : line.text;
  const newText = line.kind === "del" ? "" : line.text;
  const oldPrefix = line.kind === "del" ? "−" : " ";
  const newPrefix = line.kind === "add" ? "+" : " ";

  return (
    <div className="grid grid-cols-2 font-mono text-[11px] leading-5">
      <div className={`flex border-r border-zinc-200/80 ${oldBg || "text-zinc-700"}`}>
        <LineGutter n={line.oldNo} />
        <span className="w-3 shrink-0 text-zinc-500">{oldPrefix}</span>
        <span className="min-w-0 flex-1 overflow-x-auto whitespace-pre pr-2">{oldText}</span>
      </div>
      <div className={`flex ${newBg || "text-zinc-700"}`}>
        <LineGutter n={line.newNo} />
        <span className="w-3 shrink-0 text-zinc-500">{newPrefix}</span>
        <span className="min-w-0 flex-1 overflow-x-auto whitespace-pre pr-2">{newText}</span>
      </div>
    </div>
  );
}

function UnifiedRow({ line }: { line: DiffLine }) {
  const bg =
    line.kind === "add"
      ? "bg-emerald-50 text-emerald-900"
      : line.kind === "del"
        ? "bg-red-50 text-red-900"
        : "text-zinc-700";
  const prefix = line.kind === "add" ? "+" : line.kind === "del" ? "−" : " ";

  return (
    <div className={`flex font-mono text-[11px] leading-5 ${bg}`}>
      <LineGutter n={line.oldNo} />
      <LineGutter n={line.newNo} />
      <span className="w-3 shrink-0 text-zinc-500">{prefix}</span>
      <span className="min-w-0 flex-1 overflow-x-auto whitespace-pre pr-2">{line.text}</span>
    </div>
  );
}

function FileDiff({ file, mode }: { file: DiffFile; mode: ViewMode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-zinc-50/90 px-3 py-2.5 text-left hover:bg-zinc-100"
      >
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-zinc-800">{file.path}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            <span className="text-emerald-600">+{file.additions}</span>
            {" · "}
            <span className="text-red-600">−{file.deletions}</span>
          </p>
        </div>
        <span className="text-xs text-zinc-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="max-h-[420px] overflow-auto border-t border-zinc-200/80 bg-zinc-50">
          {mode === "split" ? (
            <>
              <div className="sticky top-0 z-10 grid grid-cols-2 border-b border-zinc-200/80 bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500">
                <div className="border-r border-zinc-200/80 px-3 py-1.5">Previous (base)</div>
                <div className="px-3 py-1.5">New (PR head)</div>
              </div>
              {file.lines.map((line, i) => (
                <SplitRow key={i} line={line} />
              ))}
            </>
          ) : (
            file.lines.map((line, i) => <UnifiedRow key={i} line={line} />)
          )}
        </div>
      )}
    </div>
  );
}

export function DiffViewer({
  diff,
  title = "PR changes",
}: {
  diff: PrDiff;
  title?: string;
}) {
  const [mode, setMode] = useState<ViewMode>("split");
  const [fileFilter, setFileFilter] = useState<string>("all");

  const files = useMemo(
    () => (fileFilter === "all" ? diff.files : diff.files.filter((f) => f.path === fileFilter)),
    [diff.files, fileFilter],
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-zinc-200/80 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionTitle hint={`${diff.stats.files} files · +${diff.stats.additions} −${diff.stats.deletions}`}>
              {title}
            </SectionTitle>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              <span className="text-zinc-600">{diff.baseLabel}</span>{" "}
              <span className="text-zinc-600">{diff.baseSha.slice(0, 7)}</span>
              <span className="mx-2 text-zinc-600">→</span>
              <span className="text-zinc-600">{diff.headLabel}</span>{" "}
              <span className="text-zinc-600">{diff.headSha.slice(0, 7)}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className="rounded-xl border border-zinc-200/90 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-700"
            >
              <option value="all">All files</option>
              {diff.files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path}
                </option>
              ))}
            </select>
            <div className="flex rounded-xl border border-zinc-200/90 p-0.5">
              {(["split", "unified"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] capitalize ${
                    mode === m ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {m === "split" ? "Side by side" : "Unified"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {mode === "split" && (
          <div className="mt-3 hidden grid-cols-2 gap-2 sm:grid">
            <div className="rounded-xl border border-red-200/90 bg-red-50 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-red-600/80">Previous</p>
              <p className="mt-0.5 text-xs text-zinc-600">
                Base branch before this PR · {diff.baseSha.slice(0, 7)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">New</p>
              <p className="mt-0.5 text-xs text-zinc-600">
                PR head with proposed changes · {diff.headSha.slice(0, 7)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        {files.map((file) => (
          <FileDiff key={file.path} file={file} mode={mode} />
        ))}
        {files.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No files in this filter.</p>
        )}
      </div>
    </Card>
  );
}
