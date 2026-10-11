import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sitemap from "../src/app/sitemap.ts";
import { NAV_LINKS } from "../src/lib/nav.ts";
import { TRY_DEMOS } from "../src/lib/try-demos.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DEMO_IDS = ["shop-line", "missed-calls"] as const;
const REMOVED_IDS = ["call-prep", "hear-your-shop"] as const;

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

test("try page source has the two demo anchors and nothing removed", () => {
  const page = readFileSync(join(root, "src/app/try/page.tsx"), "utf8");
  assert.deepEqual(
    TRY_DEMOS.map((demo) => demo.id),
    [...DEMO_IDS],
  );
  for (const id of DEMO_IDS) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  for (const id of REMOVED_IDS) {
    assert.equal(page.includes(`id="${id}"`), false, id);
  }
});

test("call-prep helper and hear-your-shop are gone from /try", () => {
  const files = [
    ...walk(join(root, "src/app/try")),
    ...walk(join(root, "src/components/try-voice")),
    ...walk(join(root, "src/lib/try-voice")),
    join(root, "src/lib/try-demos.ts"),
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(text.includes(CALL_PREP_URL_EXACT), false, file);
    assert.equal(/call-prep|CALL_PREP|callPrep/i.test(text), false, file);
    assert.equal(
      /hear your shop|hearYourShop|HearYourShop/i.test(text),
      false,
      file,
    );
  }
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
  ];
  assert.equal(files.length >= 2, true);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(EMOJI.test(text), false, file);
  }
});
