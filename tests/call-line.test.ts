import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import CallPage from "@/app/call/page";
import TrunkLinePage from "@/app/trunk-line/page";
import { CALL_FAQ } from "@/lib/call-content";
import { CALL_LINE, CALL_LINE_LIVE, CALL_LINE_TEL } from "@/lib/call-line";
import { renderPage, visibleText } from "./render-page";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("call line stays dark while COMING_SOON", () => {
  it("keeps the launch flag off and publishes no tel href", () => {
    assert.equal(CALL_LINE.COMING_SOON, true);
    assert.equal(CALL_LINE_LIVE, false);
    assert.equal(CALL_LINE_TEL, null);
    assert.equal(CALL_LINE.path, "/call");
  });

  it("renders /call and /trunk-line with no tel: link", () => {
    const callHtml = renderPage(CallPage);
    const trunkHtml = renderPage(TrunkLinePage);
    const callText = visibleText(callHtml);
    const trunkText = visibleText(trunkHtml);

    assert.equal(callHtml.includes("tel:"), false);
    assert.equal(trunkHtml.includes("tel:"), false);
    assert.equal(/href\s*=\s*["']tel:/i.test(callHtml), false);
    assert.equal(/href\s*=\s*["']tel:/i.test(trunkHtml), false);

    assert.equal(callText.includes(`${CALL_LINE.vanity} is coming soon`), true);
    assert.match(callText, /Not live yet/);
    assert.match(callText, /please don't dial it yet/);
    assert.match(callHtml, /mailto:hello@albanyaiguy\.com/);
    assert.match(callText, /hello@albanyaiguy\.com/);
    assert.match(trunkText, /The number isn't live yet/);
    assert.match(trunkText, /Not for emergencies — call 911/);
  });

  it("names 988 and 911 in the emergency text", () => {
    const callHtml = renderPage(CallPage);
    const emergency = callHtml.match(
      /<section[^>]*id="emergencies"[\s\S]*?<\/section>/,
    )?.[0];
    assert.ok(emergency, "call page emergency section");
    assert.match(emergency, /Emergency\? Call 911/);
    assert.match(emergency, /call 911/);
    assert.match(emergency, /call or text 988/);
    assert.match(emergency, /988 as well as 911/);

    const faq = CALL_FAQ.find((item) => item.q === "What about emergencies?");
    assert.ok(faq);
    assert.match(faq.a, /call 911/);
    assert.match(faq.a, /call or text 988/);

    const llms = readFileSync(join(root, "public/llms.txt"), "utf8");
    assert.equal(llms.includes("tel:"), false);
    assert.match(llms, /NOT live yet/);
    assert.match(llms, /Emergencies: call 911/);
    assert.match(llms, /call or text 988/);
    assert.match(llms, /gives 988 as well as 911/);
  });
});
