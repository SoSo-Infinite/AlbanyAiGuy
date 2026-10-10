import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sitemap from "../src/app/sitemap.ts";
import { NAV_LINKS } from "../src/lib/nav.ts";
import {
  CALL_PREP_PROMPT,
  CALL_PREP_URL,
  TRY_DEMOS,
} from "../src/lib/try-demos.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DEMO_IDS = [
  "shop-line",
  "missed-calls",
  "call-prep",
  "hear-your-shop",
] as const;

const CALL_PREP_URL_EXACT =
  "https://chatgpt.com/?q=Be%20my%20call-prep%20helper.%20Ask%20me%20who%20I%27m%20calling%20and%20what%20the%20problem%20is.%20Then%20give%20me%20a%2030-second%20script%20of%20exactly%20what%20to%20say%2C%20and%20the%203%20questions%20I%20should%20ask%20so%20I%20don%27t%20have%20to%20call%20back.%20Keep%20it%20short%20and%20plain.";

const EMOJI = /\p{Extended_Pictographic}/u;

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

test("try page source has the four demo anchors", () => {
  const page = readFileSync(join(root, "src/app/try/page.tsx"), "utf8");
  assert.deepEqual(
    TRY_DEMOS.map((demo) => demo.id),
    [...DEMO_IDS],
  );
  for (const id of DEMO_IDS) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
});

test("call-prep URL equals the published ChatGPT link", () => {
  assert.equal(CALL_PREP_URL, CALL_PREP_URL_EXACT);
  const demos = readFileSync(join(root, "src/lib/try-demos.ts"), "utf8");
  assert.equal(demos.includes(CALL_PREP_URL_EXACT), true);
  assert.equal(new URL(CALL_PREP_URL).searchParams.get("q"), CALL_PREP_PROMPT);
  assert.equal(CALL_PREP_PROMPT.includes("call-prep helper"), true);
  assert.equal(CALL_PREP_PROMPT.startsWith("https://"), false);

  const page = readFileSync(join(root, "src/app/try/page.tsx"), "utf8");
  assert.equal(page.includes("CALL_PREP_URL"), true);
  assert.equal(page.includes("CALL_PREP_OPEN_LABEL"), true);
  assert.equal(demos.includes("Open the call-prep helper in ChatGPT"), true);
});

test("sitemap includes /try", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.includes("https://albanyaiguy.com/try"), true);
});

test("nav includes Try immediately after Demo", () => {
  const demoIndex = NAV_LINKS.findIndex((link) => link.label === "Demo");
  assert.equal(demoIndex >= 0, true);
  assert.equal(NAV_LINKS[demoIndex + 1]?.label, "Try");
  assert.equal(NAV_LINKS[demoIndex + 1]?.href, "/try");

  const source = readFileSync(join(root, "src/lib/nav.ts"), "utf8");
  const demoAt = source.indexOf('label: "Demo"');
  const tryAt = source.indexOf('label: "Try"');
  assert.equal(demoAt >= 0 && tryAt > demoAt, true);
});

test("new try copy has no emoji", () => {
  const files = [
    ...walk(join(root, "src/app/try")),
    join(root, "src/lib/try-demos.ts"),
    join(root, "src/lib/hear-your-shop.ts"),
  ];
  assert.equal(files.length >= 4, true);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(EMOJI.test(text), false, file);
  }
});
