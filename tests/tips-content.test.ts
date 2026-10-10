import assert from "node:assert/strict";
import test from "node:test";
import { chatgptHref, TIPS } from "../src/lib/tips-content.ts";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?1[\s.-]*)?(?:\(\d{3}\)|\d{3})[\s.-]*\d{3}[\s.-]*\d{4}\b/;

test("there are 6 tips", () => {
  assert.equal(TIPS.length, 6);
  const ids = TIPS.map((tip) => tip.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every prompt is non-empty", () => {
  for (const tip of TIPS) {
    assert.equal(typeof tip.prompt, "string", tip.id);
    assert.equal(tip.prompt.trim().length > 0, true, tip.id);
  }
});

test("prompt text has no phone numbers or emails", () => {
  for (const tip of TIPS) {
    assert.equal(EMAIL.test(tip.prompt), false, tip.id);
    assert.equal(PHONE.test(tip.prompt), false, tip.id);
    assert.equal(tip.prompt.includes("@"), false, tip.id);
  }
});

test("chatgpt.com/?q= URL-encodes the prompt", () => {
  const sample = "Line one\nLine two? a&b #hash";
  const sampleHref = chatgptHref(sample);
  assert.equal(
    sampleHref,
    `https://chatgpt.com/?q=${encodeURIComponent(sample)}`,
  );
  assert.equal(sampleHref.startsWith("https://chatgpt.com/?q="), true);
  assert.equal(sampleHref.includes(" "), false);
  assert.equal(sampleHref.includes("\n"), false);
  assert.equal(new URL(sampleHref).searchParams.get("q"), sample);

  for (const tip of TIPS) {
    const href = chatgptHref(tip.prompt);
    assert.equal(
      href,
      `https://chatgpt.com/?q=${encodeURIComponent(tip.prompt)}`,
      tip.id,
    );
    assert.equal(new URL(href).searchParams.get("q"), tip.prompt, tip.id);
  }
});
