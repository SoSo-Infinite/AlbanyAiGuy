import type { MetadataRoute } from "next";

const SITE = "https://albanyaiguy.com";
const PRIVATE = ["/api/", "/console", "/s/"];

/**
 * Search + AI crawlers explicitly allowed so a future wildcard rule can't
 * quietly block them. Private app surfaces stay disallowed.
 * A crawler obeys only the most specific group that names it, so every named
 * group repeats the PRIVATE disallows (otherwise Googlebot etc. could crawl them).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      // Search / answer crawlers
      { userAgent: "Googlebot", allow: "/", disallow: PRIVATE },
      { userAgent: "Bingbot", allow: "/", disallow: PRIVATE },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: PRIVATE },
      { userAgent: "ChatGPT-User", allow: "/", disallow: PRIVATE },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: PRIVATE },
      { userAgent: "Claude-User", allow: "/", disallow: PRIVATE },
      { userAgent: "PerplexityBot", allow: "/", disallow: PRIVATE },
      { userAgent: "Perplexity-User", allow: "/", disallow: PRIVATE },
      { userAgent: "Applebot", allow: "/", disallow: PRIVATE },
      { userAgent: "DuckDuckBot", allow: "/", disallow: PRIVATE },
      // Training crawlers — allowed for exposure (flip to disallow to opt out)
      { userAgent: "GPTBot", allow: "/", disallow: PRIVATE },
      { userAgent: "ClaudeBot", allow: "/", disallow: PRIVATE },
      { userAgent: "Google-Extended", allow: "/", disallow: PRIVATE },
      { userAgent: "Applebot-Extended", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
