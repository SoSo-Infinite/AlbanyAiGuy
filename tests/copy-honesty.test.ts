import assert from "node:assert/strict";
import { describe, it } from "node:test";
import HomePage from "@/app/page";
import ReferralLinkPage from "@/app/s/[code]/page";
import { HOME_FAQ } from "@/lib/home-content";
import { renderPage, visibleText } from "./render-page";

const PROMISE = /\$|\bpayout\b|\bearn\b/i;

describe("home and referral copy make no payout promise", () => {
  it("keeps the current home wording and makes no earnings claim", () => {
    const text = visibleText(renderPage(HomePage));
    assert.match(
      text,
      /Albany's concierge and AI voice receptionist for local businesses/,
    );
    // The home intro greeting paragraph was removed (Chad, 2026-10-11).
    assert.equal(text.includes("I'm Chad Lenseth, the Albany AI Guy"), false);
    assert.match(text, /The public number isn't live yet/);
    // Status, about, and all FAQ items but the service area were removed (Chad, 2026-10-11).
    assert.equal(text.includes("You won't see customer counts"), false);
    assert.match(text, /Coming soon/);

    assert.deepEqual(
      HOME_FAQ.map((item) => item.q),
      ["Which areas does it cover?"],
    );
    assert.equal(
      HOME_FAQ[0].a,
      "Albany, Schenectady, Rensselaer, and Saratoga counties first, then the wider 518 by request.",
    );

    assert.equal(text.includes("$"), false);
    assert.equal(/\bpayout\b/i.test(text), false);
    assert.equal(/\bearn\b/i.test(text), false);
    assert.equal(PROMISE.test(text), false);
  });

  it("keeps the current /s/[code] wording, which denies any payout", () => {
    const text = visibleText(renderPage(ReferralLinkPage));
    assert.match(text, /Referral links aren't active yet/);
    assert.match(
      text,
      /Albany AI Guy doesn't have a public referral program right now, so this link doesn't earn or pay anything/,
    );
    assert.equal(/join the pilot/i.test(text), false);
    assert.match(text, /Home/);

    assert.equal(text.includes("$"), false);
    assert.equal(/\bpayout\b/i.test(text), false);
    const earnHits = text.match(/\bearn\w*/gi) ?? [];
    assert.deepEqual(earnHits, ["earn"]);
    assert.match(text, /doesn't earn or pay anything/);
  });
});
