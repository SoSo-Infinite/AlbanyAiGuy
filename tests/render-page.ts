import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Render a server page to HTML without a dev server or network. */
export function renderPage(Page: () => ReactElement): string {
  return renderToStaticMarkup(createElement(Page));
}

/** Visible copy, with scripts stripped and common entities decoded. */
export function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  for (const match of html.matchAll(pattern)) {
    blocks.push(JSON.parse(match[1] ?? ""));
  }
  return blocks;
}
