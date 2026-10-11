import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import HomePage from "@/app/page";
import { jsonLdBlocks, renderPage, visibleText } from "./render-page";

const H1 =
  "Albany's trunk-line concierge and AI voice receptionist for local businesses";

const SECTION_ORDER = [
  "intro",
  "trunk-line",
  "receptionist",
  "status",
  "about",
  "faq",
  "pilot",
];

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("home hero", () => {
  const html = renderPage(HomePage);

  it("keeps the current H1 visible under the poster", () => {
    const h1s = html.match(/<h1\b/g) ?? [];
    assert.equal(h1s.length, 1);
    const block = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/);
    assert.ok(block);
    assert.equal(visibleText(block[0]), H1);
  });

  it("offers one Try it link to /try", () => {
    assert.match(html, /<a\b[^>]*href="\/try"[^>]*>Try it<\/a>/);
  });

  it("still emits JSON-LD", () => {
    assert.ok(jsonLdBlocks(html).length >= 1);
  });

  it("keeps the home sections in order, with the introduction first", () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const found = ids.filter((id) => SECTION_ORDER.includes(id ?? ""));
    assert.deepEqual(found, SECTION_ORDER);
  });

  it("renders the mascot as a decorative image", () => {
    assert.match(html, /<img\b[^>]*alt=""/);
    assert.match(html, /mascot-whirlwind-360\.webp/);
    assert.match(html, /mascot-whirlwind-709\.webp 709w/);
    assert.match(html, /width="360"/);
    assert.match(html, /height="432"/);
  });

  it("does not statically import three.js from the server home page", () => {
    const files = [
      "src/app/page.tsx",
      "src/components/hero/home-hero.tsx",
      "src/components/hero/hero-poster.tsx",
    ];
    for (const file of files) {
      const text = source(file);
      assert.equal(/\bfrom\s+["']three["']/.test(text), false, file);
      assert.equal(/@react-three\/fiber/.test(text), false, file);
      assert.equal(/scene\/hero-canvas/.test(text), false, file);
    }
    const loader = source("src/components/hero/hero-loader.tsx");
    assert.equal(/\bfrom\s+["']three["']/.test(loader), false);
    assert.equal(/@react-three\/fiber/.test(loader), false);
    assert.match(
      loader,
      /import\(\s*\/\*[^*]*\*\/\s*["']\.\/scene\/hero-canvas["']/,
    );
  });

  it("does not name a lamp anywhere in src", () => {
    const root = new URL("../src/", import.meta.url);
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else files.push(path);
      }
    };
    walk(root.pathname);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (/\blamp\b/i.test(text)) hits.push(file);
    }
    assert.deepEqual(hits, []);
  });
});
