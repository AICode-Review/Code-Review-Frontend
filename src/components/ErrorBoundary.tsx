import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Noun used in the fallback copy, e.g. "page" or "app". Defaults to "page". */
  scope?: string;
}

interface State {
  error: Error | null;
}

/**
 * Class component is required here — React has no hook equivalent for componentDidCatch /
 * getDerivedStateFromError. Styled with the `--app-*` tokens (defined globally at :root in
 * index.css) rather than the `.app-shell`-scoped `--color-zinc-*`/`--rt-accent-*` tokens,
 * because this boundary can render outside `.app-shell` (e.g. a crash in ProtectedShell
 * before AppShell itself ever mounts, or on the public marketing layout).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: "var(--app-bg)", color: "var(--app-ink)" }}
      >
        <div
          className="max-w-md rounded-2xl border p-8 shadow-sm"
          style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
        >
          <p className="font-display text-lg font-semibold">Something went wrong</p>
          <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
            This {this.props.scope ?? "page"} hit an unexpected error. Nothing else was affected — try
            again, or reload the page.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-black/5 p-3 text-left text-xs text-red-600">
              {error.message}
            </pre>
          )}
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ background: "var(--app-accent)" }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "var(--app-border)", color: "var(--app-ink)" }}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
