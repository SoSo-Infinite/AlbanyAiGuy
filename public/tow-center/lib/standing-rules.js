/**
 * Tow.Center — OS standing rules (518 digits, Ask Before Acting, Lane K rail-truth).
 * Canonical OS: soso-infinite-systems-os/patterns/STANDING-RULES.md
 * Lane K: soso-infinite-systems-os/patterns/LOCKED-LANE-K-TECH-INFRASTRUCTURE.md
 *
 * UMD: CommonJS for bun:test; browser attaches TowStandingRules on globalThis.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof root !== "undefined") {
    root.TowStandingRules = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Capital Region NPAs — home turf (518 native + 838 overlay). */
  var HOME_TURF_NPAS = Object.freeze(["518", "838"]);

  /**
   * Spelled-out forms of 518 that must never appear in OS/tow copy.
   * Locals write 518 as digits.
   */
  var SPELLED_518_RE =
    /\b(five[\s\-]?one[\s\-]?eight|five[\s\-]?eighteen)\b/i;

  /** Clear out-of-territory place tokens (reject for Capital Region intake). */
  var OUT_OF_TERRITORY_RE =
    /\b(manhattan|brooklyn|queens|bronx|staten\s*island|nyc|new\s*york\s*city|buffalo|rochester|syracuse|boston|philadelphia|los\s*angeles|chicago|miami|212|716|315|617)\b/i;

  /** Soft Capital Region place cues (accept when present). */
  var CAPITAL_REGION_CUES = [
    "albany",
    "latham",
    "colonie",
    "troy",
    "schenectady",
    "clifton park",
    "saratoga",
    "glens falls",
    "cohoes",
    "watervliet",
    "guilderland",
    "delmar",
    "niskayuna",
    "rotterdam",
    "scotia",
    "east greenbush",
    "rensselaer",
    "ballston",
    "malta",
    "queensbury",
    "amsterdam",
    "hudson",
    "catskill",
    "plattsburgh",
    "capital region",
    "capital district",
    "route 7",
    "northway",
    "i-87",
    "i-90",
  ];

  /** Consequential actions that require Ask Before Acting confirmation. */
  var CONSEQUENTIAL = Object.freeze({
    notify_driver_sms: true,
    call_driver: true,
    contact_cj: true,
    clear_job_log: true,
    invent_pricing: true,
    claim_live_telephony: true,
    deploy_production: true,
  });

  /**
   * Lane K rail-truth registry for Tow.Center MVP.
   * status: verified | staged | unknown
   * Never mark a claim "verified" without a real check source.
   */
  var RAIL_TRUTH = Object.freeze({
    public_mvp_url: Object.freeze({
      key: "public_mvp_url",
      status: "verified",
      value: "https://tow-center-mvp.vercel.app",
      checked: "2026-09-28",
      source: "HTTP 200 + Text the driver this job",
    }),
    notify_path: Object.freeze({
      key: "notify_path",
      status: "verified",
      value: "sms: compose (no Twilio)",
      checked: "2026-09-28",
      source: "tow-center/index.html",
    }),
    sso_login: Object.freeze({
      key: "sso_login",
      status: "verified",
      value: "off",
      checked: "2026-09-28",
      source: "static page",
    }),
    livekit_public_url: Object.freeze({
      key: "livekit_public_url",
      status: "unknown",
      value: null,
      checked: "2026-09-28",
      source: "Lane K — do not invent",
    }),
    production_telephony: Object.freeze({
      key: "production_telephony",
      status: "staged",
      value: "not live — Twilio-free MVP only",
      checked: "2026-09-28",
      source: "Lane C / Lane G — after payment",
    }),
    quick_sim: Object.freeze({
      key: "quick_sim",
      status: "staged",
      value: "labeled Quick Sim (not PSTN)",
      checked: "2026-09-28",
      source: "tow-center/index.html",
    }),
    first_month_price: Object.freeze({
      key: "first_month_price",
      status: "unknown",
      value: null,
      lockedBy: "[CHAD LOCKS]",
      checked: "2026-09-28",
      source: "do not invent",
    }),
    entity: Object.freeze({
      key: "entity",
      status: "verified",
      value: "Tow C Inc.",
      checked: "2026-09-28",
      source: "handoff prep — not Tow.Center LLC",
    }),
  });

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function e164ish(d) {
    d = digitsOnly(d);
    if (d.length === 10) return "1" + d;
    return d;
  }

  /** National number digits (last 10 of US NANP). */
  function national10(phone) {
    var d = digitsOnly(phone);
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    if (d.length < 10) return "";
    return d.slice(-10);
  }

  function npaOf(phone) {
    var n = national10(phone);
    return n ? n.slice(0, 3) : "";
  }

  function isHomeTurfNpa(phone) {
    return HOME_TURF_NPAS.indexOf(npaOf(phone)) !== -1;
  }

  /**
   * Reject spelled-out 518 anywhere in agent/UI copy.
   * Returns { ok, reason }.
   */
  function assert518DigitsOnly(text) {
    var s = String(text || "");
    if (SPELLED_518_RE.test(s)) {
      return {
        ok: false,
        reason: 'Always write 518 as digits — never spell it out (STANDING RULE).',
      };
    }
    return { ok: true };
  }

  /**
   * Driver cell entry point: must be 10+ digits and 518 or 838 NPA.
   */
  function validateDriverPhone(phone) {
    var d = e164ish(phone);
    if (d.length < 10) {
      return { ok: false, reason: "Enter a valid US cell (10+ digits)." };
    }
    if (!isHomeTurfNpa(phone)) {
      return {
        ok: false,
        reason:
          "Driver cell must be Capital Region home turf (518 or 838 NPA). Out-of-territory rejected.",
      };
    }
    var copyCheck = assert518DigitsOnly(String(phone));
    if (!copyCheck.ok) return copyCheck;
    return { ok: true, digits: d, npa: npaOf(phone) };
  }

  /**
   * Pickup location entry: reject clear out-of-territory places.
   * Accept when Capital Region cue present, or when no foreign token (local landmark OK).
   */
  function validatePickupLocation(location) {
    var s = String(location || "").trim();
    if (!s) {
      return { ok: false, reason: "Pickup location is required." };
    }
    if (OUT_OF_TERRITORY_RE.test(s)) {
      return {
        ok: false,
        reason:
          "Pickup looks outside Capital Region (518/838 turf). Out-of-scope input rejected.",
      };
    }
    var lower = s.toLowerCase();
    var hasCue = CAPITAL_REGION_CUES.some(function (c) {
      return lower.indexOf(c) !== -1;
    });
    return {
      ok: true,
      inTerritoryCue: hasCue,
      note: hasCue
        ? "Capital Region cue present"
        : "No foreign token — landmark OK; prefer town/exit in 518 turf",
    };
  }

  /**
   * Ask Before Acting gate. Consequential actions require explicit confirmed === true.
   * Does not perform the action — callers must stop when blocked.
   */
  function askBeforeActing(action, confirmed) {
    var key = String(action || "");
    if (!CONSEQUENTIAL[key]) {
      return { ok: true, gated: false, action: key };
    }
    if (confirmed === true) {
      return { ok: true, gated: true, action: key, confirmed: true };
    }
    return {
      ok: false,
      gated: true,
      action: key,
      confirmed: false,
      reason:
        "Ask Before Acting: consequential action '" +
        key +
        "' requires explicit user confirmation before proceeding.",
    };
  }

  var ALLOWED_STATUSES = { verified: true, staged: true, unknown: true };

  /**
   * Mark a rail-truth claim. Refuses to invent verified claims without source.
   * status must be verified | staged | unknown.
   * verified requires non-empty source; unknown/staged may have null value.
   */
  function markRailTruth(claim) {
    var c = claim || {};
    var status = String(c.status || "").toLowerCase();
    if (!ALLOWED_STATUSES[status]) {
      return {
        ok: false,
        reason: "Lane K: status must be verified, staged, or unknown — got '" + status + "'.",
      };
    }
    if (status === "verified") {
      if (!c.source || !String(c.source).trim()) {
        return {
          ok: false,
          reason:
            "Lane K rail-truth: cannot mark verified without a real check source.",
        };
      }
      if (c.value === null || c.value === undefined || c.value === "") {
        return {
          ok: false,
          reason: "Lane K rail-truth: verified claims need a concrete value (no empty invent).",
        };
      }
    }
    if (status === "unknown" && c.value && String(c.value).indexOf("http") === 0) {
      return {
        ok: false,
        reason:
          "Lane K: do not invent a public URL while status is unknown — leave value null.",
      };
    }
    return {
      ok: true,
      claim: {
        key: c.key || null,
        status: status,
        value: status === "unknown" ? c.value ?? null : c.value,
        source: c.source || null,
        checked: c.checked || null,
        lockedBy: c.lockedBy || null,
      },
    };
  }

  /** Read a registered claim; never upgrades status. */
  function getRailTruth(key) {
    return RAIL_TRUTH[key] || null;
  }

  /**
   * Truthful status copy for UI — never overclaims.
   */
  function railTruthStatusCopy(key) {
    var row = getRailTruth(key);
    if (!row) {
      return { ok: false, reason: "Unknown rail-truth key: " + key };
    }
    var label =
      row.status === "verified"
        ? "verified"
        : row.status === "staged"
          ? "staged (not live production)"
          : "unknown — do not invent";
    var valueText =
      row.value === null || row.value === undefined
        ? row.lockedBy || "[unknown]"
        : String(row.value);
    return {
      ok: true,
      status: row.status,
      copy: row.key + ": " + label + " — " + valueText,
      claimReal: row.status === "verified",
    };
  }

  /**
   * Pricing / dollars: agents must not invent. Chad locks first-month.
   */
  function assertNoInventedPricing(amount) {
    if (amount === null || amount === undefined || amount === "" || amount === "[CHAD LOCKS]") {
      return { ok: true, locked: true };
    }
    return {
      ok: false,
      reason:
        "Do not invent dollar amounts, Stripe links, or prices — leave [CHAD LOCKS] until Chad sets them.",
    };
  }

  return {
    HOME_TURF_NPAS: HOME_TURF_NPAS,
    CONSEQUENTIAL: CONSEQUENTIAL,
    RAIL_TRUTH: RAIL_TRUTH,
    digitsOnly: digitsOnly,
    e164ish: e164ish,
    national10: national10,
    npaOf: npaOf,
    isHomeTurfNpa: isHomeTurfNpa,
    assert518DigitsOnly: assert518DigitsOnly,
    validateDriverPhone: validateDriverPhone,
    validatePickupLocation: validatePickupLocation,
    askBeforeActing: askBeforeActing,
    markRailTruth: markRailTruth,
    getRailTruth: getRailTruth,
    railTruthStatusCopy: railTruthStatusCopy,
    assertNoInventedPricing: assertNoInventedPricing,
  };
});
