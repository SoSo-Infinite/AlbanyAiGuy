/**
 * Issue #21 — standing rules + Ask Before Acting + Lane K rail-truth tests.
 * Run: bun test tow-center/lib/standing-rules.test.js
 */
const { describe, expect, test } = require("bun:test");
const fs = require("fs");
const path = require("path");
const R = require("./standing-rules.js");

const ROOT = path.join(import.meta.dir, "..");

describe("518 digits only", () => {
  test("accepts digit form 518 in copy", () => {
    expect(R.assert518DigitsOnly("Always write 518 as digits.").ok).toBe(true);
    expect(R.assert518DigitsOnly("Pin ?n=5185551234").ok).toBe(true);
  });

  test("rejects spelled-out five one eight variants", () => {
    expect(R.assert518DigitsOnly("five one eight territory").ok).toBe(false);
    expect(R.assert518DigitsOnly("five-one-eight").ok).toBe(false);
    expect(R.assert518DigitsOnly("five eighteen locals").ok).toBe(false);
    expect(R.assert518DigitsOnly("call five-eighteen").ok).toBe(false);
  });

  test("tow-center docs/HTML never spell out 518", () => {
    const files = [
      "index.html",
      "README.md",
      "docs/STANDING-RULES.md",
      "docs/tow-center-cj-handoff-PREP.md",
      "personas/tow.md",
      "lib/standing-rules.js",
    ];
    for (const f of files) {
      const text = fs.readFileSync(path.join(ROOT, f), "utf8");
      const r = R.assert518DigitsOnly(text);
      expect(r.ok, f + ": " + (r.reason || "")).toBe(true);
      expect(text.includes("518")).toBe(true);
    }
  });
});

describe("territory entry points (518/838 home turf)", () => {
  test("accepts 518 and 838 driver cells", () => {
    expect(R.validateDriverPhone("5185551234").ok).toBe(true);
    expect(R.validateDriverPhone("(518) 555-9999").ok).toBe(true);
    expect(R.validateDriverPhone("1-838-555-0100").ok).toBe(true);
    expect(R.validateDriverPhone("8385550100").npa).toBe("838");
  });

  test("rejects out-of-scope driver NPAs", () => {
    expect(R.validateDriverPhone("2125551234").ok).toBe(false);
    expect(R.validateDriverPhone("7165551234").ok).toBe(false);
    expect(R.validateDriverPhone("3155550100").ok).toBe(false);
    expect(R.validateDriverPhone("6175550100").ok).toBe(false);
  });

  test("rejects short / empty driver phone", () => {
    expect(R.validateDriverPhone("518555").ok).toBe(false);
    expect(R.validateDriverPhone("").ok).toBe(false);
  });

  test("rejects out-of-territory pickup locations", () => {
    expect(R.validatePickupLocation("Times Square, Manhattan").ok).toBe(false);
    expect(R.validatePickupLocation("Brooklyn Navy Yard").ok).toBe(false);
    expect(R.validatePickupLocation("Buffalo airport").ok).toBe(false);
    expect(R.validatePickupLocation("Boston Commons").ok).toBe(false);
  });

  test("accepts Capital Region pickups", () => {
    const ok = R.validatePickupLocation("Route 7 near Latham");
    expect(ok.ok).toBe(true);
    expect(ok.inTerritoryCue).toBe(true);
    expect(R.validatePickupLocation("Wolf Road, Colonie").ok).toBe(true);
    expect(R.validatePickupLocation("Troy riverfront lot").ok).toBe(true);
  });

  test("rejects empty pickup", () => {
    expect(R.validatePickupLocation("   ").ok).toBe(false);
  });
});

describe("Ask Before Acting — confirmation gating", () => {
  test("blocks consequential actions without confirmation", () => {
    for (const action of Object.keys(R.CONSEQUENTIAL)) {
      const r = R.askBeforeActing(action, false);
      expect(r.ok, action).toBe(false);
      expect(r.gated).toBe(true);
      expect(r.reason).toMatch(/Ask Before Acting/);
    }
  });

  test("allows consequential actions only when confirmed === true", () => {
    expect(R.askBeforeActing("notify_driver_sms", true).ok).toBe(true);
    expect(R.askBeforeActing("call_driver", true).ok).toBe(true);
    expect(R.askBeforeActing("contact_cj", true).confirmed).toBe(true);
    expect(R.askBeforeActing("clear_job_log", true).ok).toBe(true);
  });

  test("non-consequential actions pass without confirm", () => {
    expect(R.askBeforeActing("render_log", false).ok).toBe(true);
    expect(R.askBeforeActing("export_json", undefined).gated).toBe(false);
  });

  test("contact_cj stays gated — agents must not contact CJ", () => {
    expect(R.askBeforeActing("contact_cj", false).ok).toBe(false);
  });
});

describe("Lane K rail-truth honesty", () => {
  test("registry distinguishes verified / staged / unknown", () => {
    expect(R.getRailTruth("public_mvp_url").status).toBe("verified");
    expect(R.getRailTruth("quick_sim").status).toBe("staged");
    expect(R.getRailTruth("livekit_public_url").status).toBe("unknown");
    expect(R.getRailTruth("first_month_price").status).toBe("unknown");
    expect(R.getRailTruth("production_telephony").status).toBe("staged");
  });

  test("refuses verified without source or value", () => {
    expect(R.markRailTruth({ status: "verified", value: "https://x.test" }).ok).toBe(
      false,
    );
    expect(
      R.markRailTruth({ status: "verified", source: "curl", value: null }).ok,
    ).toBe(false);
  });

  test("refuses inventing a URL while unknown", () => {
    expect(
      R.markRailTruth({
        status: "unknown",
        value: "https://fake-demo.example",
      }).ok,
    ).toBe(false);
  });

  test("allows honest unknown with null value", () => {
    const r = R.markRailTruth({
      key: "livekit_public_url",
      status: "unknown",
      value: null,
      source: "Lane K",
    });
    expect(r.ok).toBe(true);
    expect(r.claim.value).toBe(null);
  });

  test("allows verified only with source + value", () => {
    const r = R.markRailTruth({
      key: "public_mvp_url",
      status: "verified",
      value: "https://tow-center-mvp.vercel.app",
      source: "HTTP 200 2026-09-28",
    });
    expect(r.ok).toBe(true);
  });

  test("status copy never claims unknown/staged as real", () => {
    const livekit = R.railTruthStatusCopy("livekit_public_url");
    expect(livekit.ok).toBe(true);
    expect(livekit.claimReal).toBe(false);
    expect(livekit.copy).toMatch(/unknown/);

    const sim = R.railTruthStatusCopy("quick_sim");
    expect(sim.claimReal).toBe(false);
    expect(sim.copy).toMatch(/staged/);

    const mvp = R.railTruthStatusCopy("public_mvp_url");
    expect(mvp.claimReal).toBe(true);
    expect(mvp.copy).toMatch(/verified/);
  });

  test("first-month price stays Chad-locked — no invented dollars", () => {
    expect(R.assertNoInventedPricing(null).ok).toBe(true);
    expect(R.assertNoInventedPricing("[CHAD LOCKS]").ok).toBe(true);
    expect(R.assertNoInventedPricing(99).ok).toBe(false);
    expect(R.assertNoInventedPricing("$199").ok).toBe(false);
    expect(R.getRailTruth("first_month_price").value).toBe(null);
    expect(R.getRailTruth("first_month_price").lockedBy).toBe("[CHAD LOCKS]");
  });

  test("docs rail-truth table does not invent LiveKit URL or first-month $", () => {
    const docs = fs.readFileSync(path.join(ROOT, "docs/STANDING-RULES.md"), "utf8");
    expect(docs).toMatch(/LiveKit public demo URL[\s\S]*Unknown/);
    expect(docs).toMatch(/\[CHAD LOCKS\]/);
    expect(docs).not.toMatch(/https:\/\/.*livekit/i);
  });
});

describe("index.html wires gates", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  test("loads standing-rules module", () => {
    expect(html).toMatch(/standing-rules\.js/);
  });

  test("labels Quick Sim as demo / not live PSTN", () => {
    expect(html).toMatch(/Quick Sim/);
    expect(html).toMatch(/No live phone line|not a public live-call claim/i);
  });

  test("uses sms: compose (no Twilio claim as live telephony)", () => {
    expect(html).toMatch(/sms:/);
    expect(html).toMatch(/No Twilio/);
  });

  test("writes 518 as digits in placeholders and copy", () => {
    expect(html).toMatch(/5185551234|518-…|Always write <strong>518<\/strong>/);
  });
});
