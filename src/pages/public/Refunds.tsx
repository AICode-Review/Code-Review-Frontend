import { Link } from "react-router-dom";
import { GridTexture, Reveal } from "../../components/retro";
import { Seo } from "../../components/Seo";

const sections: Array<{ title: string; body: string[] }> = [
  {
    title: "1. Cancelling your subscription",
    body: [
      "You can cancel a paid plan (Individual or Team) at any time from Settings → Billing in the Scrutinye dashboard. Cancellation takes effect at the end of your current billing cycle — you keep full access to your plan's features until then, and you will not be charged again afterward.",
      "There is no cancellation fee, and no minimum commitment period.",
    ],
  },
  {
    title: "2. Refunds",
    body: [
      "Subscription fees are billed in advance for each billing cycle and are non-refundable once charged, except where required by applicable law. This includes partial-month refunds if you cancel partway through a billing cycle — your plan simply remains active (not renewed) until the cycle you already paid for ends.",
      "If you believe you were charged in error — for example, a duplicate charge, a charge after you had already cancelled, or a charge that doesn't match your plan — contact us and we'll investigate and issue a refund if a billing error is confirmed.",
    ],
  },
  {
    title: "3. Downgrades and failed payments",
    body: [
      "If a recurring payment fails (e.g. an expired card), your organization is downgraded to the Free plan rather than losing access outright. No refund is owed in this case since no successful charge occurred for that cycle.",
    ],
  },
  {
    title: "4. Free plan",
    body: ["The Free plan has no charge associated with it, so no cancellation or refund process applies to it."],
  },
  {
    title: "5. How payments are processed",
    body: [
      "All payments are processed by Razorpay, our third-party payment processor. Scrutinye does not store your card or payment details directly — refer to Razorpay's own policies for how they handle payment data.",
    ],
  },
  {
    title: "6. Contact",
    body: ["Questions about a charge, a cancellation, or a refund request: billing@scrutinye.dev"],
  },
];

export default function Refunds() {
  return (
    <div className="relative overflow-hidden">
      <Seo
        title="Cancellation & Refund Policy — Scrutinye"
        description="How cancellations and refunds work for Scrutinye's paid plans."
        path="/refunds"
      />
      <GridTexture />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mk-accent)]">Legal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--mk-ink)]">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-3 text-sm text-[var(--mk-faint)]">Last updated: 2026-09-09</p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-sm font-semibold text-[var(--mk-ink)]">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </Reveal>

        <p className="mt-10 text-sm text-[var(--mk-faint)]">
          See also the{" "}
          <Link to="/terms" className="text-[var(--mk-accent)] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-[var(--mk-accent)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
