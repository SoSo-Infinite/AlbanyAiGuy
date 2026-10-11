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
      /Albany's trunk-line concierge and AI voice receptionist for local businesses/,
    );
    // The home intro greeting paragraph was removed (Chad, 2026-10-11).
    assert.equal(text.includes("I'm Chad Lenseth, the Albany AI Guy"), false);
    assert.match(text, /The public number isn't live yet/);
    assert.match(
      text,
      /You won't see customer counts or testimonials here yet, because there aren't any/,
    );
    assert.match(text, /Coming soon/);

    const emergency = HOME_FAQ.find(
      (item) => item.q === "Is it for emergencies?",
    );
    assert.ok(emergency);
    assert.equal(
      emergency.a,
      "No. For medical, fire, or police emergencies call 911. If you smell gas, leave first, then call 911 or your gas utility's emergency line.",
    );
    assert.match(text, /call 911/);

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
    assert.match(text, /you can still join the pilot/);
    assert.match(text, /Join the pilot/);
    assert.match(text, /Home/);

    assert.equal(text.includes("$"), false);
    assert.equal(/\bpayout\b/i.test(text), false);
    const earnHits = text.match(/\bearn\w*/gi) ?? [];
    assert.deepEqual(earnHits, ["earn"]);
    assert.match(text, /doesn't earn or pay anything/);
  });
});
