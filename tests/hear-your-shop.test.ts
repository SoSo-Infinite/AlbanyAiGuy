import assert from "node:assert/strict";
import test from "node:test";
import {
  buildShopGreeting,
  type HearYourShopResult,
} from "../src/lib/hear-your-shop.ts";

const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

function expectOk(result: HearYourShopResult): string {
  if (!result.ok) assert.fail(result.message);
  return result.script;
}

function expectNo(result: HearYourShopResult) {
  if (result.ok)
    assert.fail(`expected a rejected greeting, got: ${result.script}`);
  return result;
}

test("script contains the shop name", () => {
  const script = expectOk(
    buildShopGreeting({
      shop: "  North   Shop  ",
      service: "haircuts",
      hours: "9 to 5",
    }),
  );
  assert.equal(
    script,
    "Thanks for calling North Shop. This is the front desk. We can help with haircuts. We're open 9 to 5. What can I do for you?",
  );
  assert.equal(script.includes("North Shop"), true);
  assert.equal(EMOJI.test(script), false);
});

test("blank shop is rejected", () => {
  for (const shop of ["", "   ", "\n\t", null, undefined]) {
    const result = expectNo(buildShopGreeting({ shop }));
    assert.equal(result.message, "Enter a shop name.");
  }
});

test("length caps drop characters past 60 and 80", () => {
  const script = expectOk(
    buildShopGreeting({
      shop: "N".repeat(61),
      service: "S".repeat(81),
      hours: "H".repeat(81),
    }),
  );
  assert.equal(script.includes("N".repeat(60)), true);
  assert.equal(script.includes("N".repeat(61)), false);
  assert.equal(script.includes("S".repeat(80)), true);
  assert.equal(script.includes("S".repeat(81)), false);
  assert.equal(script.includes("H".repeat(80)), true);
  assert.equal(script.includes("H".repeat(81)), false);

  const exact = expectOk(
    buildShopGreeting({
      shop: "A".repeat(60),
      service: "B".repeat(80),
      hours: "C".repeat(80),
    }),
  );
  assert.equal(exact.includes("A".repeat(60)), true);
  assert.equal(exact.includes("B".repeat(80)), true);
  assert.equal(exact.includes("C".repeat(80)), true);
});

test("URLs, emails, phone numbers, and angle brackets are stripped", () => {
  const script = expectOk(
    buildShopGreeting({
      shop: "North <b>Shop</b> https://example.com/book www.example.com",
      service: "cuts owner@example.com and <script>alert(1)</script>",
      hours: "9 to 7, call (518) 555-0100 or 555-0101",
    }),
  );
  assert.equal(script.includes("North Shop"), true);
  assert.equal(script.includes("cuts"), true);
  assert.equal(script.includes("9 to 7"), true);
  assert.equal(script.includes("<"), false);
  assert.equal(script.includes(">"), false);
  assert.equal(script.includes("http"), false);
  assert.equal(script.includes("www."), false);
  assert.equal(script.includes("example.com"), false);
  assert.equal(script.includes("@"), false);
  assert.equal(script.includes("alert"), false);
  assert.equal(script.includes("555"), false);
  assert.equal(script.includes("0100"), false);
  assert.equal(script.includes("0101"), false);

  const dotted = expectOk(
    buildShopGreeting({
      shop: "Pine Shop",
      service: "fades",
      hours: "call 518.555.0102 or 5185550103 or +1 518 555 0104",
    }),
  );
  assert.equal(dotted.includes("555"), false);
  assert.equal(dotted.includes("0102"), false);
  assert.equal(dotted.includes("0103"), false);
  assert.equal(dotted.includes("0104"), false);

  const bare = expectOk(
    buildShopGreeting({
      shop: "East Shop example.invalid/hours",
      service: "desk@example.invalid",
      hours: "weekdays",
    }),
  );
  assert.equal(bare.includes("example"), false);
  assert.equal(bare.includes("@"), false);
  assert.equal(bare.includes("East Shop"), true);
  assert.equal(bare.includes("weekdays"), true);

  const regionName = expectOk(buildShopGreeting({ shop: "518 Cuts" }));
  assert.equal(regionName.includes("518 Cuts"), true);
});

test("a shop name that is only a URL, email, phone, brackets, or emoji is rejected", () => {
  for (const shop of [
    "https://example.com",
    "owner@example.com",
    "518-555-0100",
    "<b></b>",
    "<>",
    "\u{1F600}",
  ]) {
    expectNo(buildShopGreeting({ shop }));
  }
});

test("emoji is removed and the greeting has none", () => {
  const script = expectOk(
    buildShopGreeting({
      shop: "North Shop \u{1F600}",
      service: "fades \u{2702}\u{FE0F}",
      hours: "9 to 7 \u{1F552}",
    }),
  );
  assert.equal(script.includes("North Shop"), true);
  assert.equal(script.includes("fades"), true);
  assert.equal(script.includes("9 to 7"), true);
  assert.equal(EMOJI.test(script), false);
  assert.equal(script.includes("\u{FE0F}"), false);
  assert.equal(script.includes("\u{1F600}"), false);
});
