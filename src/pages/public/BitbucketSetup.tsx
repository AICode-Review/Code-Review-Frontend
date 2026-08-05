import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";

const steps: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "lock",
    title: "1. Create an API token",
    body: "Bitbucket account avatar → Account settings → Security tab → Create and manage API tokens → Create API token with scopes. Name it, set an expiry, select Bitbucket as the app, then choose exactly three scopes: read:repository:bitbucket, read:pullrequest:bitbucket, write:pullrequest:bitbucket. Copy the token immediately — it's shown once. Private repos are fine with these scopes.",
  },
  {
    icon: "code",
    title: "2. Connect the workspace",
    body: "In CodeFerret: Settings → Bitbucket accounts (/settings/bitbucket). Enter the workspace slug (from the Bitbucket URL, e.g. aicode_review93), a display name, your Atlassian account email (required for personal API tokens), and paste the token. Slug, name, and email stay filled after save so you can update the token later. Repositories are imported on connect — including private ones.",
  },
  {
    icon: "shield",
    title: "3. Add a webhook, per repo",
    body: "For every repo you want reviewed: that repo's Settings → Webhooks → Add webhook. URL: your CodeFerret backend's public address + /webhooks/bitbucket. Secret: provided by your CodeFerret administrator — this is a shared, app-wide value, not something Bitbucket generates for you. Triggers: Pull Request — Created, Updated, and Comment created.",
  },
  {
    icon: "scan",
    title: "4. Open or push to a PR",
    body: "Repos appear after connect; reviews start when a PR event arrives via the webhook. Open a pull request (or push a new commit to one) on a connected repo to see a review run.",
  },
];

export default function BitbucketSetup() {
  return (
    <div className="relative overflow-hidden">
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Setup guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">
            Connecting a Bitbucket workspace
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--mk-muted)]">
            PR review automation for Bitbucket currently uses a manual token + webhook setup, done once per
            workspace and once per repo. This is separate from Bitbucket <em>sign-in</em>, which already works
            without any of the steps below.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="ferret-card rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mk-accent-soft)] text-[var(--mk-accent)]">
                  <Icon name={step.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-[var(--mk-ink)]">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">{step.body}</p>
                </div>
              </div>
              <span className="mt-3 block text-right font-mono text-[10px] text-[var(--mk-faint)]">
                {String(i + 1).padStart(2, "0")}/04
              </span>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-8 rounded-xl border border-[var(--mk-border)] bg-[var(--mk-bg-elevated)] p-5">
          <h2 className="text-sm font-semibold text-[var(--mk-ink)]">A note on Workspace Access Tokens</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">
            Bitbucket also offers workspace-level Access Tokens as an alternative to the API token in step 1 — same
            scopes needed (repository read, pull requests read + write) — but they require a{" "}
            <strong className="text-[var(--mk-ink)]">Bitbucket Premium</strong> plan. The API token path above works on
            any Bitbucket Cloud plan.
          </p>
        </Reveal>

        <Reveal className="relative mt-10 rounded-2xl border border-[var(--mk-accent)]/30 bg-[var(--mk-bg-elevated)] p-6 text-center">
          <CornerBrackets />
          <p className="text-sm font-semibold text-[var(--mk-ink)]">Questions about this setup?</p>
          <p className="mt-1.5 text-sm text-[var(--mk-muted)]">Reach out and we'll walk you through it.</p>
          <Link to="/security" className="mt-4 inline-flex text-sm font-medium text-[var(--mk-accent)] hover:underline">
            See how we handle your code →
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
