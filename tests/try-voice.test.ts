import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import TryPage from "../src/app/try/page.tsx";
import { estimateMissedCalls } from "../src/lib/missed-calls.ts";
import {
  BROWSING_PIVOT,
  beginSession,
  createSession,
  isBrowsingReply,
  MISSED_QUESTIONS,
  OPENING_LINE,
  parseSpokenNumber,
  SHOP_HANDOFF,
  SILENCE_LINE,
  silenceSession,
  TRY_PROMISE_BADGES,
  visitorSession,
} from "../src/lib/try-voice/index.ts";
import { renderPage } from "./render-page.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const ANCHORS = ["shop-line", "missed-calls"] as const;

function opened(demo: "shop-line" | "missed-calls") {
  return beginSession(createSession(demo));
}

test("opening line, silence prompt, and browsing pivot are exact", () => {
  assert.equal(OPENING_LINE, "Let's make Albany easier.");
  assert.equal(
    SILENCE_LINE,
    "No rush. Are you just browsing, or is there something specific on your mind?",
  );
  assert.equal(
    BROWSING_PIVOT,
    "For example, I can help a barber set up online booking in under ten minutes.",
  );

  const started = opened("missed-calls");
  assert.deepEqual(started.say, [OPENING_LINE]);
  assert.equal(started.armSilence, true);

  const prompted = silenceSession(started.state);
  assert.deepEqual(prompted.say, [SILENCE_LINE]);
  assert.equal(prompted.armSilence, false);
  assert.deepEqual(silenceSession(prompted.state).say, []);

  for (const phrase of [
    "browsing",
    "just looking",
    "looking around",
    "just browsing",
    "not sure",
    "nothing",
  ]) {
    assert.equal(isBrowsingReply(phrase), true, phrase);
    const step = visitorSession(started.state, phrase);
    assert.equal(step.say[0], BROWSING_PIVOT, phrase);
    assert.equal(step.say[1], MISSED_QUESTIONS.calls, phrase);
  }

  // The pivot also leads straight into the shop-line demo.
  const shop = opened("shop-line");
  const pivot = visitorSession(silenceSession(shop.state).state, "browsing");
  assert.deepEqual(pivot.say, [BROWSING_PIVOT, SHOP_HANDOFF]);
  assert.equal(pivot.listen, true);
});

test("spoken numbers cover digits, words, percent, and dollars", () => {
  assert.equal(parseSpokenNumber("twelve"), 12);
  assert.equal(parseSpokenNumber("12"), 12);
  assert.equal(parseSpokenNumber("30 percent"), 30);
  assert.equal(parseSpokenNumber("$150"), 150);
  assert.equal(parseSpokenNumber("one hundred fifty"), 150);
  assert.equal(parseSpokenNumber("thirty"), 30);
});

test("missed-calls flow matches estimateMissedCalls", () => {
  let step = visitorSession(opened("missed-calls").state, "twelve");
  assert.equal(step.say[0], MISSED_QUESTIONS.percent);
  step = visitorSession(step.state, "30 percent");
  assert.equal(step.say[0], MISSED_QUESTIONS.job);
  step = visitorSession(step.state, "$150");
  const expected = estimateMissedCalls({
    missedCallsPerWeek: "12",
    bookingPercent: "30",
    averageJobValue: "150",
  });
  assert.deepEqual(step.missed, expected);
  assert.equal(expected.ok, true);
  if (expected.ok) {
    assert.match(step.say[0] ?? "", /a month/);
    assert.match(step.say[0] ?? "", /a year/);
    assert.match(
      step.say[0] ?? "",
      /This is an estimate from your own numbers/,
    );
  }
});

test("shop-line handoff posts the same request shape", () => {
  const step = visitorSession(
    opened("shop-line").state,
    "Can I get a fade today?",
  );
  assert.deepEqual(step.shopRequest, {
    messages: [
      { role: "assistant", content: SHOP_HANDOFF },
      { role: "user", content: "Can I get a fade today?" },
    ],
    taken: [],
  });
  assert.equal(step.say[0], SHOP_HANDOFF);
});

test("promise badges are the four exact lines, with 2 demos", () => {
  assert.deepEqual(
    [...TRY_PROMISE_BADGES],
    [
      "Try it in 10 seconds",
      "2 demos",
      "No signup",
      "Nothing you say is saved",
    ],
  );
  const page = readFileSync(join(root, "src/app/try/page.tsx"), "utf8");
  for (const badge of TRY_PROMISE_BADGES) {
    assert.equal(page.includes(badge), true, badge);
  }
  assert.equal(page.includes(">Nothing is stored<"), false);
  assert.equal(page.includes("4 demos"), false);
});

test("/try keeps the two anchors and the privacy sentence", () => {
  const page = readFileSync(join(root, "src/app/try/page.tsx"), "utf8");
  for (const id of ANCHORS) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  assert.match(page, /Two demos\. No sign-up, and nothing is stored\./);
  const html = renderPage(TryPage);
  assert.match(html, /Two demos\. No sign-up, and nothing is stored\./);
  assert.equal(/Four demos|Three demos/.test(html), false);
  assert.equal((html.match(/Talk now/g) ?? []).length, 2);
  assert.equal(/Call prep|Hear your shop|Answer the phone/.test(html), false);
  assert.match(
    html,
    /Voice uses your browser(?:&#x27;|&#39;|&apos;|')s mic and speech recognition/,
  );
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

test("try page cannot reach three.js", () => {
  const seen = new Set<string>();
  const hits: string[] = [];
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    if (/\bfrom\s+["']three["']/.test(text) || text.includes("@react-three")) {
      hits.push(file);
    }
    for (const spec of staticSpecifiers(text)) {
      const next = resolveLocal(file, spec);
      if (next) walk(next);
    }
  };
  walk(join(root, "src/app/try/page.tsx"));
  assert.deepEqual(hits, []);
});

test("try-voice code does not touch storage", () => {
  const dirs = [
    join(root, "src/lib/try-voice"),
    join(root, "src/components/try-voice"),
  ];
  const files: string[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isFile()) files.push(full);
    }
  }
  assert.equal(files.length >= 4, true);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(
      /localStorage|sessionStorage|document\.cookie/.test(text),
      false,
      file,
    );
  }
});
