import assert from "node:assert/strict";
import { describe, it } from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const PRIVATE = ["/api/", "/console", "/s/"];

const AGENTS = [
  "*",
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "DuckDuckBot",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

const PUBLIC_PATHS = [
  "/",
  "/call",
  "/trunk-line",
  "/shop-line",
  "/try",
  "/work",
  "/tips",
  "/tools/missed-calls",
  "/privacy",
  "/terms",
  "/contact",
];

function asList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

describe("robots and sitemap", () => {
  it("disallows private app surfaces for every crawler group", () => {
    const result = robots();
    assert.ok(result.rules);
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    assert.deepEqual(
      rules.map((rule) => rule.userAgent),
      AGENTS,
    );
    assert.equal(result.sitemap, "https://albanyaiguy.com/sitemap.xml");

    for (const rule of rules) {
      const disallow = asList(rule.disallow);
      const allow = asList(rule.allow);
      const agent = asList(rule.userAgent).join(",");
      assert.ok(allow.includes("/"), `${agent} should allow /`);
      for (const path of PRIVATE) {
        assert.ok(disallow.includes(path), `${agent} missing ${path}`);
      }
    }
  });

  it("lists only public routes", () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    assert.deepEqual(paths, PUBLIC_PATHS);

    for (const entry of entries) {
      const path = new URL(entry.url).pathname;
      assert.equal(entry.url.startsWith("https://albanyaiguy.com"), true);
      for (const privatePath of PRIVATE) {
        assert.equal(
          path === privatePath || path.startsWith(privatePath),
          false,
          entry.url,
        );
      }
      assert.equal(path.includes("/console"), false);
      assert.equal(path.includes("/api/"), false);
      assert.equal(path.startsWith("/s/"), false);
    }

    const urls = entries.map((entry) => entry.url);
    assert.equal(urls.includes("https://albanyaiguy.com/console"), false);
    assert.equal(urls.includes("https://albanyaiguy.com/s/demo"), false);
    assert.equal(urls.includes("https://albanyaiguy.com/api/briefing"), false);
    assert.equal(urls.includes("https://albanyaiguy.com/api/shop-line"), false);
  });
});
