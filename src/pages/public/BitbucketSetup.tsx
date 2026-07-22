import { Link } from "react-router-dom";
import { CornerBrackets, GridTexture, Icon, type IconName, Reveal } from "../../components/retro";

const steps: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "lock",
    title: "1. Create an API token",
    body: "Bitbucket account avatar → Account settings → Security tab → Create and manage API tokens → Create API token with scopes. Name it, set an expiry, select Bitbucket as the app, then choose exactly three scopes: read:repository:bitbucket, read:pullrequest:bitbucket, write:pullrequest:bitbucket. Copy the token immediately — it's shown once.",
  },
  {
    icon: "code",
    title: "2. Connect the workspace",
    body: "In CodeFerret: Settings → “Connect Bitbucket workspace.” Enter the workspace slug (from the Bitbucket URL, e.g. acme-team), a display name, and paste the API token from step 1. This creates the org and stores the token encrypted — nothing else to configure here.",
  },
  {
    icon: "shield",
    title: "3. Add a webhook, per repo",
    body: "For every repo you want reviewed: that repo's Settings → Webhooks → Add webhook. URL: your CodeFerret backend's public address + /webhooks/bitbucket. Secret: provided by your CodeFerret administrator — this is a shared, app-wide value, not something Bitbucket generates for you. Triggers: Pull Request — Created, Updated, and Comment created.",
  },
  {
    icon: "scan",
    title: "4. Open or push to a PR",
    body: "No separate “select repos” step — the first PR event that arrives via the webhook automatically registers that repo and runs a review. Open a pull request (or push a new commit to one) on a connected repo to see it work.",
  },
];

export default function BitbucketSetup() {
  return (
    <div className="relative">
      <GridTexture />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// setup guide</p>
          <h1
            className="mt-3 text-3xl font-bold uppercase tracking-tight text-[#f2ead9]"
            style={{ textShadow: "0 0 16px rgba(255,179,0,.2)" }}
          >
            Connecting a Bitbucket workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a39a86]">
            PR review automation for Bitbucket currently uses a manual token + webhook setup, done once per
            workspace and once per repo. This is separate from Bitbucket <em>sign-in</em>, which already works
            without any of the steps below.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="ferret-card border border-[#3a2f1f] bg-[#0d0f0a] p-5 shadow-[3px_3px_0_0_#1c1810]">
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center border border-[#ffb300]/40 bg-[#ffb300]/10 text-[#ffb300]">
                  <Icon name={step.icon} />
                </div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#a39a86]">{step.body}</p>
                </div>
              </div>
              <span className="mt-3 block text-right font-mono text-[10px] text-[#6b6252]">[{String(i + 1).padStart(2, "0")}/04]</span>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-8 border border-[#3a2f1f] bg-[#0d0f0a] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">A note on Workspace Access Tokens</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#a39a86]">
            Bitbucket also offers workspace-level Access Tokens as an alternative to the API token in step 1 — same
            scopes needed (repository read, pull requests read + write) — but they require a{" "}
            <strong className="text-[#c9c2b3]">Bitbucket Premium</strong> plan. The API token path above works on
            any Bitbucket Cloud plan.
          </p>
        </Reveal>

        <Reveal className="relative mt-10 border-2 border-[#ffb300]/40 bg-[#14170f] p-6 text-center shadow-[4px_4px_0_0_#3a2f1f]">
          <CornerBrackets />
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">Questions about this setup?</p>
          <p className="mt-1.5 text-sm text-[#a39a86]">Reach out and we'll walk you through it.</p>
          <Link to="/security" className="mt-4 inline-flex text-xs font-medium text-[#ffb300] hover:underline">
            &gt; See how we handle your code
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
