import { useState } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../../components/LogoMark";
import { Seo } from "../../components/Seo";

const examples = [
  {
    label: "Security",
    file: "src/auth/session.ts",
    title: "Validate session ownership",
    description:
      "A signed-in user could refresh another user's session. Check ownership before issuing a new token.",
    before: "const session = await getSession(id);",
    after: "const session = await ownedSession(id, user.id);",
    fix: "return issueToken(session);",
    category: "Authorization",
    severity: "Critical",
  },
  {
    label: "Logic",
    file: "src/billing/discount.ts",
    title: "Keep the total above zero",
    description:
      "A fixed discount can exceed the order subtotal and produce a negative charge. Clamp the result before checkout.",
    before: "return subtotal - discount;",
    after: "return Math.max(0, subtotal - discount);",
    fix: "// Never submit a negative charge.",
    category: "Boundary condition",
    severity: "Major",
  },
  {
    label: "Contracts",
    file: "src/api/profile.ts",
    title: "Preserve the response contract",
    description:
      "The profile screen still reads displayName. Renaming the field to name breaks the caller in this repository.",
    before: "return { id, name: user.name };",
    after: "return { id, displayName: user.name };",
    fix: "// Keep the field expected by the caller.",
    category: "Cross-file context",
    severity: "Major",
  },
] as const;
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function ReviewPreview() {
  const [selected, setSelected] = useState(0);
  const example = examples[selected]!;
  return (
    <div className="home-review-stage" id="review-preview">
      <div className="home-orbit home-orbit-one" aria-hidden="true" />
      <div className="home-orbit home-orbit-two" aria-hidden="true" />
      <div className="home-floating-label">
        <span className="home-status-dot" /> A second opinion. Built in.
      </div>
      <div className="home-review-window">
        <div className="home-window-bar">
          <div className="home-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>acme / payments-api</span>
          <span className="home-example-tag">EXAMPLE REVIEW</span>
        </div>
        <div className="home-pr-heading">
          <span className="home-branch-icon" aria-hidden="true">
            ⑂
          </span>
          <div>
            <strong>A safer path to production</strong>
            <p>
              Pull request #428 <span>·</span> 4 files changed
            </p>
          </div>
          <span className="home-open-pill">Open</span>
        </div>
        <div
          className="home-demo-tabs"
          role="group"
          aria-label="Example review category"
        >
          {examples.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              {item.label}
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
        <div
          className="home-example-content"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="home-code-file">
            <span aria-hidden="true">⌘</span> {example.file}
            <span>+3 −1</span>
          </div>
          <div
            className="home-code-block"
            aria-label="Illustrative code excerpt"
          >
            <div>
              <span>42</span>
              <code>
                {" "}
                {selected === 0
                  ? "async function refreshSession(id) {"
                  : selected === 1
                    ? "function calculateTotal() {"
                    : "function getProfile(user) {"}
              </code>
            </div>
            <div className="home-code-removed">
              <span>43</span>
              <code>− {example.before}</code>
            </div>
            <div className="home-code-added">
              <span>44</span>
              <code>+ {example.after}</code>
            </div>
            <div className="home-code-added">
              <span>45</span>
              <code>+ {example.fix}</code>
            </div>
            <div>
              <span>46</span>
              <code> {"}"}</code>
            </div>
          </div>
          <div className="home-finding">
            <div className="home-finding-heading">
              <span className="home-bot-icon">
                <LogoMark />
              </span>
              <strong>Scrutinye</strong>
              <span className="home-verified">✓ Verified finding</span>
            </div>
            <div className="home-finding-tags">
              <span className={selected === 0 ? "home-critical" : "home-major"}>
                {example.severity}
              </span>
              <span>{example.category}</span>
            </div>
            <h3>{example.title}</h3>
            <p>{example.description}</p>
            <div className="home-proof">
              ✓ Checked against source <span>·</span> Cross-examined
            </div>
          </div>
        </div>
        <div className="home-review-bottom">
          <span>
            <span className="home-status-dot" /> Review complete
          </span>
          <span>Only the signal gets through →</span>
        </div>
      </div>
      <div className="home-verification-note">
        <span className="home-note-check">✓</span>
        <div>
          <strong>Found. Challenged. Verified.</strong>
          <span>One useful comment. Less noise.</span>
        </div>
        <span className="home-note-spark" aria-hidden="true">
          ✧
        </span>
      </div>
    </div>
  );
}
const faqs = [
  [
    "How does Scrutinye verify a finding?",
    "Findings are checked against real source code and cross-examined by a second model. Where available, sandbox execution can also reproduce a defect. Uncertain or refuted findings are rejected before posting.",
  ],
  [
    "Does it work with my existing workflow?",
    "Yes. Connect a GitHub or Bitbucket repository and Scrutinye reviews pull requests automatically. Findings appear in the pull request, with deeper review details available in the web app.",
  ],
  [
    "Can I use it on a private repository?",
    "Yes. Private repositories are available on Individual and Team plans. The Free plan includes public repositories. Visit the pricing page for current quotas and plan details.",
  ],
  [
    "Can my team control what gets reviewed?",
    "You can configure ignored paths, set a comment budget, and maintain a plain-language rulebook. Feedback on findings helps the rulebook learn your team's standards.",
  ],
];
export default function Landing() {
  return (
    <div className="site-landing">
      <Seo
        title="Scrutinye — Ship with confidence. Review with proof."
        description="AI code review that finds the bugs that matter, verifies its findings, and learns your team's standards. Connect GitHub or Bitbucket and start free."
        path="/"
      />
      <main id="home-main">
        <section className="home-hero">
          <div className="home-container home-hero-grid">
            <div className="home-hero-copy">
              <div className="home-eyebrow-pill">
                <span className="home-status-dot" /> AI CODE REVIEW, WITH PROOF
              </div>
              <h1>
                Great code.
                <br />
                Fewer doubts.
                <br />
                <span>Ship confidently.</span>
              </h1>
              <p className="home-hero-description">
                Meet the AI reviewer that checks its own work. Catch the bugs
                that matter, verify every finding, and keep your pull requests
                focused.
              </p>
              <div className="home-hero-actions">
                <Link to="/signin" className="home-button home-button-green">
                  Start reviewing for free <Arrow />
                </Link>
                <a href="#how-it-works" className="home-text-link">
                  <span className="home-play" aria-hidden="true">
                    ▷
                  </span>{" "}
                  See how it works
                </a>
              </div>
              <div className="home-hero-reassurance">
                <span>✓ No credit card required</span>
                <span>✓ Free for public repos</span>
              </div>
              <div className="home-hero-platforms">
                <span>Fits right into your workflow</span>
                <div>
                  <span aria-hidden="true">⑂</span> GitHub
                </div>
                <div>
                  <span aria-hidden="true">▱</span> Bitbucket
                </div>
              </div>
            </div>
            <ReviewPreview />
          </div>
          <div className="home-container home-capabilities">
            <span>BUILT FOR THE WAY YOU BUILD</span>
            <div>
              ⌘ <span>Any language</span>
            </div>
            <div>
              ⑂ <span>Full-repo context</span>
            </div>
            <div>
              ◎ <span>Verified findings</span>
            </div>
            <div>
              ⌁ <span>Your team's standards</span>
            </div>
          </div>
        </section>
        <section className="home-section home-container" id="how-it-works">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">
                A LITTLE SKEPTICISM. A LOT OF SIGNAL.
              </p>
              <h2>
                Not just another opinion.
                <br />
                <span>A review you can act on.</span>
              </h2>
            </div>
            <p>
              From your first push to the final check, every step is designed to
              earn your attention.
            </p>
          </div>
          <div className="home-process-grid">
            <article className="home-process-card">
              <div className="home-step-top">
                <span className="home-step-icon">⑂</span>
                <span>01 / UNDERSTAND</span>
              </div>
              <div className="home-mini-files">
                <span>
                  src / auth / session.ts <b>+12</b>
                </span>
                <span>
                  src / api / users.ts <b>+8</b>
                </span>
                <span>
                  tests / session.test.ts <b>+24</b>
                </span>
              </div>
              <h3>The whole picture.</h3>
              <p>
                Specialist passes inspect your changes with repository context,
                looking across logic, security, contracts, and more.
              </p>
            </article>
            <article className="home-process-card home-process-featured">
              <div className="home-step-top">
                <span className="home-step-icon">◎</span>
                <span>02 / CHALLENGE</span>
              </div>
              <div className="home-mini-verify">
                <span>Finding</span>
                <i aria-hidden="true">→</i>
                <span className="home-mini-skeptic">
                  <LogoMark /> Cross-examine
                </span>
                <i aria-hidden="true">→</i>
                <span className="home-mini-check">✓</span>
              </div>
              <h3>A skeptic, built in.</h3>
              <p>
                Every claim is challenged against your real code. If a finding
                can't hold up to verification, it doesn't make the cut.
              </p>
            </article>
            <article className="home-process-card">
              <div className="home-step-top">
                <span className="home-step-icon">✓</span>
                <span>03 / DELIVER</span>
              </div>
              <div className="home-mini-comment">
                <span className="home-mini-check">✓</span>
                <div>
                  <strong>One finding. Clear next step.</strong>
                  <span>Verified · actionable · in your PR</span>
                </div>
              </div>
              <h3>Less noise. More progress.</h3>
              <p>
                Critical and major findings go directly to your PR. Smaller
                items stay in a digest, within your comment budget.
              </p>
            </article>
          </div>
        </section>
        <section className="home-features-band">
          <div className="home-container home-features-grid">
            <div className="home-feature-copy">
              <p className="home-eyebrow">YOUR CODEBASE. YOUR WAY.</p>
              <h2>
                A reviewer that gets
                <br />
                <span>better at being yours.</span>
              </h2>
              <p>
                Your conventions shouldn't need explaining on every pull
                request. Turn feedback into a living rulebook that grows with
                your team.
              </p>
              <ul>
                <li>
                  <span>✓</span> Plain-language rules, built around your
                  standards
                </li>
                <li>
                  <span>✓</span> Repository context beyond the changed lines
                </li>
                <li>
                  <span>✓</span> You decide what deserves a comment
                </li>
              </ul>
              <Link to="/features" className="home-text-link">
                Explore all features <Arrow />
              </Link>
            </div>
            <div className="home-rulebook">
              <div className="home-rulebook-header">
                <span className="home-book-icon" aria-hidden="true">
                  ▤
                </span>
                <div>
                  <strong>Team rulebook</strong>
                  <span>acme / engineering</span>
                </div>
                <span className="home-rulebook-count">3 active rules</span>
              </div>
              {[
                {
                  cat: "SECURITY",
                  text: "Always verify ownership before account-scoped writes.",
                },
                {
                  cat: "ERROR HANDLING",
                  text: "Include a request ID in payment provider errors.",
                },
                {
                  cat: "TEST COVERAGE",
                  text: "Cover boundary values when fee calculations change.",
                },
              ].map((rule, i) => (
                <div className="home-rulebook-row" key={rule.cat}>
                  <span className="home-rule-number">0{i + 1}</span>
                  <div>
                    <span className="home-rule-category">{rule.cat}</span>
                    <p>{rule.text}</p>
                    <small>
                      {i < 2
                        ? "Learned from team feedback"
                        : "Added by your team"}
                    </small>
                  </div>
                  <span className="home-rule-enabled" aria-label="Active rule">
                    ✓
                  </span>
                </div>
              ))}
              <div className="home-rulebook-footer">
                <span>Illustrative rulebook</span>
                <span>Your standards, on every push →</span>
              </div>
            </div>
          </div>
        </section>
        <section className="home-container home-trust-section">
          <div>
            <span className="home-trust-icon" aria-hidden="true">
              ◇
            </span>
            <h3>Your code stays your business.</h3>
            <p>
              Explore self-hosting, bring your own model keys, and control
              source retention.
            </p>
            <Link to="/security" className="home-text-link">
              Security & deployment <Arrow />
            </Link>
          </div>
          <div>
            <span className="home-trust-icon" aria-hidden="true">
              ⌁
            </span>
            <h3>Proof over promises.</h3>
            <p>
              See how we evaluate catch rate and false positives, including the
              limits of our current benchmarks.
            </p>
            <Link to="/benchmark" className="home-text-link">
              Read the methodology <Arrow />
            </Link>
          </div>
        </section>
        <section className="home-container home-faq-section">
          <div>
            <p className="home-eyebrow">GOOD QUESTIONS.</p>
            <h2>
              A few things
              <br />
              you might wonder.
            </h2>
            <Link to="/contact" className="home-text-link">
              Let's talk <Arrow />
            </Link>
          </div>
          <div className="home-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="home-container home-cta-wrap">
          <div className="home-final-cta">
            <div className="home-cta-orbit" aria-hidden="true" />
            <span className="home-cta-mark">
              <LogoMark />
            </span>
            <p className="home-eyebrow">LESS SECOND-GUESSING. MORE SHIPPING.</p>
            <h2>
              Your next PR deserves
              <br />a second pair of eyes.
            </h2>
            <p>Let Scrutinye handle the scrutiny. You build what's next.</p>
            <Link to="/signin" className="home-button home-button-light">
              Start reviewing for free <Arrow />
            </Link>
            <span className="home-final-note">
              GitHub & Bitbucket · No credit card required
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
