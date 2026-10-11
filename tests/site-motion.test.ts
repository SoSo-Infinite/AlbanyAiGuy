import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CallPage from "../src/app/call/page.tsx";
import ContactPage from "../src/app/contact/page.tsx";
import NotFound from "../src/app/not-found.tsx";
import HomePage from "../src/app/page.tsx";
import PrivacyPage from "../src/app/privacy/page.tsx";
import TipsPage from "../src/app/tips/page.tsx";
import MissedCallsPage from "../src/app/tools/missed-calls/page.tsx";
import TrunkLinePage from "../src/app/trunk-line/page.tsx";
import TryPage from "../src/app/try/page.tsx";
import WorkPage from "../src/app/work/page.tsx";
import { renderPage, visibleText } from "./render-page.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fixture = JSON.parse(
  readFileSync(join(root, "tests/fixtures/site-motion-text.json"), "utf8"),
) as Record<string, string>;

function htmlOf(page: () => ReactElement): string {
  return renderPage(page);
}

function mascotImgs(html: string): string[] {
  return [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tag.includes("mascot"));
}

test("content pages keep the same visible text", async () => {
  const sync: Record<string, () => ReactElement> = {
    "/": HomePage,
    "/try": TryPage,
    "/work": WorkPage,
    "/tips": TipsPage,
    "/contact": ContactPage,
    "/call": CallPage,
    "/trunk-line": TrunkLinePage,
    "/privacy": PrivacyPage,
    "/404": NotFound,
  };
  for (const [route, page] of Object.entries(sync)) {
    assert.equal(visibleText(htmlOf(page)), fixture[route], route);
  }
  const missed = await MissedCallsPage({
    searchParams: Promise.resolve({}),
  });
  assert.equal(
    visibleText(renderToStaticMarkup(missed)),
    fixture["/tools/missed-calls"],
    "/tools/missed-calls",
  );
});

test("mascot cutouts are decorative and the privacy page has none", async () => {
  const missed = await MissedCallsPage({
    searchParams: Promise.resolve({}),
  });
  const withMascot = [
    htmlOf(TryPage),
    htmlOf(WorkPage),
    htmlOf(TipsPage),
    htmlOf(ContactPage),
    htmlOf(TrunkLinePage),
    htmlOf(NotFound),
    renderToStaticMarkup(missed),
  ];
  for (const html of withMascot) {
    const imgs = mascotImgs(html);
    assert.equal(imgs.length >= 1, true);
    for (const tag of imgs) {
      assert.match(tag, /\balt=""/);
      assert.equal(tag.includes("mascot-whirlwind-709"), false);
      assert.match(tag, /mascot-whirlwind-360\.webp/);
      assert.match(tag, /\bloading="lazy"/);
      assert.match(tag, /\bwidth="160"/);
      assert.match(tag, /\bheight="192"/);
    }
    assert.match(html, /aria-hidden="true"[^>]*class="[^"]*mascot-spot/);
  }

  const privacy = htmlOf(PrivacyPage);
  assert.equal(privacy.includes("mascot-spot"), false);
  assert.equal(privacy.includes("mascot-whirlwind"), false);
  const call = htmlOf(CallPage);
  assert.equal(call.includes("mascot-spot"), false);
  assert.equal(call.includes("mascot-whirlwind"), false);

  for (const file of [
    "src/app/shop-line/page.tsx",
    "src/app/console/page.tsx",
    "src/app/s/[code]/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/call/page.tsx",
  ]) {
    const source = readFileSync(join(root, file), "utf8");
    assert.equal(source.includes("MascotSpot"), false, file);
    assert.equal(source.includes("mascot-whirlwind"), false, file);
  }
});

function staticSpecifiers(source: string): string[] {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\bimport\s*\(/g, "dynamic(");
  const specs: string[] = [];
  for (const match of stripped.matchAll(/\bfrom\s*["']([^"']+)["']/g)) {
    if (match[1]) specs.push(match[1]);
  }
  for (const match of stripped.matchAll(/\bimport\s+["']([^"']+)["']/g)) {
    if (match[1]) specs.push(match[1]);
  }
  return specs;
}

function resolveSource(base: string): string | null {
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

function resolveLocal(fromFile: string, spec: string): string | null {
  if (spec.startsWith("@/")) {
    return resolveSource(join(root, "src", spec.slice(2)));
  }
  if (spec.startsWith(".")) return resolveSource(join(dirname(fromFile), spec));
  return null;
}

function threeHits(entry: string): string[] {
  const seen = new Set<string>();
  const hits: string[] = [];
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    if (
      /\bfrom\s+["']three["']/.test(text) ||
      text.includes("@react-three/fiber")
    ) {
      hits.push(relative(root, file));
    }
    for (const spec of staticSpecifiers(text)) {
      const next = resolveLocal(file, spec);
      if (next) walk(next);
    }
  };
  walk(entry);
  return hits;
}

function pageFiles(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...pageFiles(full));
    else if (name === "page.tsx") found.push(full);
  }
  return found;
}

test("only the home page may statically import three.js", () => {
  for (const page of pageFiles(join(root, "src/app"))) {
    const rel = relative(root, page);
    const hits = threeHits(page);
    if (rel === join("src", "app", "page.tsx")) continue;
    assert.deepEqual(hits, [], rel);
  }
  const missing = threeHits(join(root, "src/app/not-found.tsx"));
  assert.deepEqual(missing, []);
});

test("reduced motion disables reveal, twinkle, and mascot motion", () => {
  const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
  const parts = css.split("@media (prefers-reduced-motion: reduce)");
  assert.equal(parts.length >= 2, true);
  const reduced = parts.slice(1).join("\n");
  assert.match(reduced, /\.reveal\b/);
  assert.match(reduced, /band-twinkle/);
  assert.match(reduced, /mascot-arrive/);
  assert.match(reduced, /animation:\s*none/);
});
