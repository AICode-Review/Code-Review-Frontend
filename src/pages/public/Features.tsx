import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, type IconName } from "../../components/retro";
import {
  PublicIntro,
  PublicCallToAction,
} from "../../components/layout/PublicSite";
import { Seo } from "../../components/Seo";

const pipeline: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "scan",
    title: "Specialist passes, not one giant prompt",
    body: "Logic, security, and contracts run on every review. Concurrency, error handling, tests, performance, and your team's own style rules run alongside them whenever the review budget allows — each pass focused on one kind of risk instead of one model trying to hold everything at once.",
  },
  {
    icon: "shield",
    title: "Every finding is cross-examined",
    body: "A candidate finding is handed to a second, independent model whose only job is to try to refute it against the actual cited code. Refuted or uncertain claims never reach your pull request — only what survives gets posted.",
  },
  {
    icon: "code",
    title: "Some bugs get reproduced, not just argued about",
    body: "For findings that claim a concrete runtime failure (Node, Python, JVM), Scrutinye attempts to reproduce the defect in an isolated, no-network sandbox before it ever counts as verified — a real repro beats a confident-sounding argument.",
  },
];

const delivery: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "budget",
    title: "A hard limit on review noise",
    body: "Only verified critical and major issues become inline PR comments, capped by a configurable comment budget. Everything else collapses into a single digest — your PR stays readable instead of getting buried in AI chatter.",
  },
  {
    icon: "lock",
    title: "One summary comment, kept up to date",
    body: "A single summary comment is created once and updated in place on every re-run, with risk level, every posted finding, and a link to the full review — not a new comment thread every time.",
  },
];

const rulebook: Array<[string, string]> = [
  [
    "Plain-language rules",
    "Add team standards without prompt engineering — write the rule the way you'd say it out loud.",
  ],
  [
    "Evidence before activation",
    "A single dismissal starts a rule as a suggestion; repeated evidence is what promotes it to active and enforced.",
  ],
  [
    "Fully reviewable",
    "Every learned rule stays visible, editable, and removable — nothing enforces itself silently.",
  ],
  [
    "Repo-aware",
    "Rules can apply org-wide or to a single repository, matching how teams' standards actually differ project to project.",
  ],
];

const everywhere: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "shield",
    title: "GitHub and Bitbucket",
    body: "Installs as a PR bot on either platform and reviews every push automatically, posting only what survived verification.",
  },
  {
    icon: "scan",
    title: "One dashboard",
    body: "PR scores, run history, the rulebook, and repo health — all org-scoped, live, and searchable in one place.",
  },
];

const trust: Array<[IconName, string]> = [
  ["lock", "Source code is never retained beyond the review itself"],
  ["shield", "Tokens and credentials are encrypted at rest"],
  ["scan", "Row-level security scopes every table to your org, by default"],
];

export default function Features() {
  const location = useLocation();

  // Nav dropdown links point here as /features#section — React Router doesn't
  // auto-scroll to a hash on route change the way a full page load would, so this
  // does it manually once the page (and its sections) have mounted.
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    // "smooth" here is unreliable — a second call to scrollIntoView while the first is
    // still animating (which React 18 StrictMode's dev-only double-effect-invoke does
    // in practice) cancels the scroll partway, landing back at the top. Instant jump
    // avoids the race entirely and is a perfectly normal UX for a nav deep-link anyway.
    el?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [location.hash]);

  return (
    <main className="site-features">
      <Seo
        title="Features — Scrutinye"
        description="Specialist review passes, cross-model verification, execution-sandbox repro, a learning rulebook, and budgeted delivery."
        path="/features"
      />
      <div className="home-container">
        <PublicIntro
          eyebrow="BUILT TO LOOK CLOSER"
          title={
            <>
              Every angle covered.
              <br />
              <span>Every finding challenged.</span>
            </>
          }
          description="From the first pass to the final comment, a thoughtful review pipeline that earns its place in your workflow."
        />
        <nav className="site-section-nav" aria-label="Feature sections">
          <a href="#pipeline">Review & verify</a>
          <a href="#delivery">Less noise</a>
          <a href="#rulebook">Team rulebook</a>
          <a href="#languages">Languages</a>
          <a href="#platform">Your workflow</a>
        </nav>
      </div>
      <section id="pipeline" className="site-feature-section home-container">
        <div className="site-feature-heading">
          <div>
            <p className="site-eyebrow">01 / REVIEW & VERIFY</p>
            <h2>
              A closer look.
              <br />
              <span>Then a second opinion.</span>
            </h2>
          </div>
          <p>
            Specialists find the risks. Verification decides what deserves your
            attention.
          </p>
        </div>
        <div className="site-feature-cards">
          {pipeline.map((item, i) => (
            <article key={item.title}>
              <div className="site-card-top">
                <span className="site-icon">
                  <Icon name={item.icon} />
                </span>
                <span>0{i + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="delivery" className="site-delivery-band">
        <div className="home-container site-delivery-grid">
          <div>
            <p className="site-eyebrow">02 / A QUIETER PULL REQUEST</p>
            <h2>
              Your attention
              <br />
              is worth protecting.
            </h2>
            <p className="site-delivery-description">
              The best review is the one that helps you move forward. Clear
              priorities. Useful comments. Room to focus.
            </p>
            <div className="site-delivery-example">
              <span className="site-delivery-check">✓</span>
              <div>
                <strong>Review complete</strong>
                <p>Verified findings inline. Everything else in the digest.</p>
              </div>
            </div>
          </div>
          <div className="site-delivery-cards">
            {delivery.map((item) => (
              <article key={item.title}>
                <Icon name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="rulebook" className="site-feature-section home-container">
        <div className="site-feature-heading">
          <div>
            <p className="site-eyebrow">03 / YOUR STANDARDS, REMEMBERED</p>
            <h2>
              Less repeating yourself.
              <br />
              <span>More shared understanding.</span>
            </h2>
          </div>
          <p>
            A living rulebook that grows with your feedback and stays in your
            control.
          </p>
        </div>
        <div className="site-rule-grid">
          {rulebook.map(([title, body], i) => (
            <article key={title}>
              <span className="site-rule-index">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="languages" className="site-languages-band">
        <div className="home-container site-languages-grid">
          <div>
            <p className="site-eyebrow">04 / BUILD IN YOUR LANGUAGE</p>
            <h2>Your stack is welcome here.</h2>
            <p>
              Every source file gets full LLM-level analysis. Repository context
              brings relevant symbols into each pass, with AST-enhanced depth
              for supported languages.
            </p>
          </div>
          <div
            className="site-language-list"
            aria-label="Example supported languages"
          >
            {[
              "TypeScript",
              "Python",
              "Java",
              "Go",
              "Rust",
              "Kotlin",
              "Swift",
              "Dart",
            ].map((language) => (
              <span key={language}>{language}</span>
            ))}
            <small>And any other source language you build with.</small>
          </div>
        </div>
      </section>
      <section id="platform" className="site-feature-section home-container">
        <div className="site-feature-heading">
          <div>
            <p className="site-eyebrow">05 / RIGHT WHERE YOU WORK</p>
            <h2>One engine. Your workflow.</h2>
          </div>
          <Link to="/cli" className="home-text-link">
            Explore the CLI <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="site-platform-grid">
          {everywhere.map((item) => (
            <article key={item.title}>
              <span className="site-icon">
                <Icon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <div className="site-feature-trust">
          {trust.map(([icon, label]) => (
            <span key={label}>
              <Icon name={icon} />
              {label}
            </span>
          ))}
          <Link to="/security">Security & trust ↗</Link>
        </div>
      </section>
      <PublicCallToAction />
    </main>
  );
}
