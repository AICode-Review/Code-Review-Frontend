import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../LogoMark";

export function PublicIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="site-page-hero">
      <p className="site-eyebrow">
        <span className="home-status-dot" />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      <p className="site-intro-description">{description}</p>
      {children}
    </div>
  );
}

export function PublicCallToAction() {
  return (
    <section className="home-container site-bottom-cta">
      <div>
        <p className="site-eyebrow">READY WHEN YOU ARE</p>
        <h2>Better reviews start with your next PR.</h2>
        <p>Connect your repository. Let Scrutinye take a closer look.</p>
      </div>
      <Link to="/signin" className="home-button home-button-green">
        Start reviewing for free <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}

export function PublicFooter() {
  return (
    <footer className="home-footer home-container">
      <div className="home-footer-top">
        <div>
          <Link to="/" className="home-brand" aria-label="Scrutinye home">
            <span className="home-brand-icon">
              <LogoMark />
            </span>
            scrutinye
          </Link>
          <p>A little scrutiny goes a long way.</p>
        </div>
        <nav aria-label="Footer product navigation">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/cli">CLI</Link>
          <Link to="/benchmark">Benchmark</Link>
          <Link to="/docs/bitbucket">Bitbucket setup</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="home-footer-bottom">
        <span>
          © {new Date().getFullYear()} Scrutinye. Built for better code.
        </span>
        <nav aria-label="Legal navigation">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refunds">Refunds</Link>
          <Link to="/security">Security</Link>
        </nav>
      </div>
    </footer>
  );
}
