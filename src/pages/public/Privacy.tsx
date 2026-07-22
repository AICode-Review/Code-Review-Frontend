import { Link } from "react-router-dom";
import { GridTexture, Reveal } from "../../components/retro";

const sections: Array<{ title: string; body: string[] }> = [
  {
    title: "1. What we collect",
    body: [
      "Account info: your name/handle and email as provided by GitHub or Bitbucket OAuth. Usage data: repositories connected, pull request metadata, review findings, and billing status. Source code: diffs and changed-file contents of pull requests you connect, processed only to generate a review.",
    ],
  },
  {
    title: "2. How source code is handled",
    body: [
      "Repositories are shallow-cloned to an ephemeral working directory for indexing and deleted immediately after each run. Only symbol metadata and vector embeddings are stored for semantic context — never full file contents at rest — and indexing can be disabled per repo. Zero-retention mode (self-hosted edition) goes further: findings never retain a verbatim source snippet at all.",
    ],
  },
  {
    title: "3. Third-party processors",
    body: [
      "Diffs and file contents are sent to Anthropic (Claude) and OpenAI to generate and cross-verify findings, subject to their own data-handling terms. Account data lives in Supabase (Postgres). Billing is processed by Razorpay — CodeFerret never sees or stores your card details directly. Self-hosted deployments send code only to the LLM providers the operator configures, never to CodeFerret's own infrastructure.",
    ],
  },
  {
    title: "4. Data retention",
    body: [
      "Review findings, run history, and audit logs are retained for the life of your account so you can track trends over time. You can request deletion of your organization's data by contacting us; some data may be retained where required for billing or legal compliance.",
    ],
  },
  {
    title: "5. Your rights",
    body: [
      "You can access, export, or request deletion of your personal data at any time by contacting privacy@codeferret.dev. Uninstalling the GitHub App or disconnecting Bitbucket stops all further code processing immediately.",
    ],
  },
  {
    title: "6. Cookies",
    body: [
      "The web app uses only the minimum browser storage needed to maintain your sign-in session (via Supabase Auth) and your theme preference. No third-party advertising or tracking cookies are used.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "Platform access tokens are encrypted at rest (AES-256-GCM). Every database table enforces row-level security scoped to your organization. See the Security page for more detail.",
    ],
  },
  {
    title: "8. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date below.",
    ],
  },
  {
    title: "9. Contact",
    body: ["Questions about this policy: privacy@codeferret.dev"],
  },
];

export default function Privacy() {
  return (
    <div className="relative">
      <GridTexture />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb300]">// legal</p>
          <h1
            className="mt-3 text-3xl font-bold uppercase tracking-tight text-[#f2ead9]"
            style={{ textShadow: "0 0 16px rgba(255,179,0,.2)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#a39a86]">Last updated: 2026-07-22</p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#f2ead9]">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-[#a39a86]">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </Reveal>

        <p className="mt-10 text-xs text-[#6b6252]">
          See also the <Link to="/terms" className="text-[#ffb300] hover:underline">Terms of Service</Link> and{" "}
          <Link to="/security" className="text-[#ffb300] hover:underline">Security</Link> page.
        </p>
      </div>
    </div>
  );
}
