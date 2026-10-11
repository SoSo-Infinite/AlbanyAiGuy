import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sitemap from "../src/app/sitemap.ts";
import { PRIVACY_ITEMS } from "../src/lib/privacy-content.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Source text with JSX entities and whitespace normalized. */
function source(file: string): string {
  return readFileSync(join(root, file), "utf8")
    .replace(/&apos;/g, "'")
    .replace(/\{" "\}/g, " ")
    .replace(/\s+/g, " ");
}

// Where each /privacy section's wording comes from.
const SOURCES: Record<string, string[]> = {
  "call-line": ["src/app/call/page.tsx"],
  demos: [
    "src/app/try/page.tsx",
    "src/components/shop-line/shop-line-demo.tsx",
  ],
  tips: ["src/app/tips/page.tsx"],
  contact: ["src/app/contact/page.tsx"],
};

// The only rewording allowed: "this page" becomes the named page, and a
// heading or link gets a period. Everything else is word for word.
const SUBS: [string, string][] = [
  ["Calls aren't recorded.", "Calls aren't recorded"],
  ["the call page will say", "this page will say"],
  ["the tips page doesn't save", "this page doesn't save"],
  [
    "In the 518 Shop Line demo, the shop is made up and texts are shown, not sent.",
    "is a made-up shop. Texts on this page are shown, not sent.",
  ],
  [
    "The page doesn't save what you say.",
    "This page doesn't save what you say.",
  ],
  ["The contact form opens", "This form opens"],
  ["addressed to hello@albanyaiguy.com.", "addressed to hello@albanyaiguy.com"],
];

test("every privacy sentence is already on the page it cites", () => {
  assert.deepEqual(
    PRIVACY_ITEMS.map((i) => i.id).sort(),
    Object.keys(SOURCES).sort(),
  );
  for (const item of PRIVACY_ITEMS) {
    const text = (SOURCES[item.id] ?? []).map(source).join(" ");
    for (const point of item.points) {
      for (const raw of point.split(/(?<=\.)\s+/)) {
        let sentence = raw;
        for (const [from, to] of SUBS) sentence = sentence.replace(from, to);
        const parts = sentence.split("addressed to hello@albanyaiguy.com");
        for (const part of parts.filter((p) => p.trim())) {
          assert.ok(
            text.includes(part.trim()),
            `${item.id}: "${raw}" is not on ${SOURCES[item.id]}`,
          );
        }
      }
    }
  }
});

test("privacy page adds no SMS consent, retention period, or new entity", () => {
  const all = PRIVACY_ITEMS.flatMap((i) => i.points).join(" ");
  assert.doesNotMatch(
    all,
    /\bSMS\b|opt[- ]?in|STOP|msg & data|LLC|Inc\.|\bdays?\b|\bmonths?\b/,
  );
  assert.doesNotMatch(all, /\bsell\b|\bcookies?\b|\bGDPR\b|\bCCPA\b/i);
});

test("privacy is in the sitemap and linked from the footer", () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.includes("https://albanyaiguy.com/privacy"));
  assert.match(
    readFileSync(join(root, "src/components/site-footer.tsx"), "utf8"),
    /href="\/privacy"/,
  );
});
