export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export function usd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

/**
 * `review_runs.summary` is GitHub-comment markdown (starts with an HTML comment marker
 * used to find/update the comment in place — see engine/delivery.ts's buildSummaryMarkdown)
 * — never meant to be dumped raw into a UI row. Strips markdown syntax down to plain text;
 * line breaks are kept (render with `whitespace-pre-line`) so a multi-finding summary stays
 * readable instead of collapsing into one dense run-on line.
 */
export function summaryPreview(summary: string, maxLen = 160): string {
  const plain = summary
    .replace(/<!--[\s\S]*?-->/g, "") // marker comment
    .replace(/^#{1,6}\s*/gm, "") // heading hashes
    .replace(/[*_`]/g, "") // bold/italic/inline-code markers
    .replace(/[ \t]+/g, " ") // collapse horizontal whitespace only — keep line breaks
    .replace(/\n{3,}/g, "\n\n") // cap blank-line runs at one
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen - 1).trimEnd()}…` : plain;
}
