import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://codeferret.dev").replace(/\/+$/, "");
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. "/pricing" — joined with the site origin for the canonical link and og:url. */
  path: string;
  noindex?: boolean;
}

/**
 * Per-page <title>/meta tags for this client-rendered SPA. Googlebot executes JS and reads
 * the final DOM during rendering, so this covers organic search — but there's no SSR or
 * prerendering here, so non-JS link-unfurlers (Slack, Twitter, LinkedIn) only ever see
 * index.html's static defaults regardless of which route was shared. That's an accepted
 * limitation of a plain client-rendered SPA, not something a runtime component can fix.
 */
export function Seo({ title, description, path, noindex = false }: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", `${SITE_URL}${path}`);
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertLink("canonical", `${SITE_URL}${path}`);
  }, [title, description, path, noindex, location.key]);

  return null;
}
