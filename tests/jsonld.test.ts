import assert from "node:assert/strict";
import { describe, it } from "node:test";
import CallPage from "@/app/call/page";
import HomePage from "@/app/page";
import { CALL_JSON_LD } from "@/lib/call-content";
import { HOME_FAQ, HOME_FAQ_JSON_LD } from "@/lib/home-content";
import { SITE_JSON_LD } from "@/lib/jsonld";
import { jsonLdBlocks, renderPage } from "./render-page";

function typesOf(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) typesOf(item, found);
    return found;
  }
  if (!node || typeof node !== "object") return found;
  const record = node as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string") found.push(type);
  else if (Array.isArray(type)) {
    for (const item of type) if (typeof item === "string") found.push(item);
  }
  for (const value of Object.values(record)) typesOf(value, found);
  return found;
}

function hasKey(node: unknown, key: string): boolean {
  if (Array.isArray(node)) return node.some((item) => hasKey(item, key));
  if (!node || typeof node !== "object") return false;
  const record = node as Record<string, unknown>;
  if (Object.hasOwn(record, key)) return true;
  return Object.values(record).some((value) => hasKey(value, key));
}

describe("JSON-LD", () => {
  it("parses site JSON-LD and keeps the public types", () => {
    const parsed = JSON.parse(JSON.stringify(SITE_JSON_LD)) as {
      "@context": string;
      "@graph": unknown[];
    };
    assert.deepEqual(parsed, SITE_JSON_LD);
    assert.equal(parsed["@context"], "https://schema.org");
    const types = typesOf(parsed);
    for (const expected of [
      "Organization",
      "ProfessionalService",
      "LocalBusiness",
      "Person",
      "PostalAddress",
      "AdministrativeArea",
      "Offer",
      "Service",
      "WebSite",
    ]) {
      assert.ok(types.includes(expected), expected);
    }
    assert.equal(hasKey(parsed, "telephone"), false);
    assert.equal(hasKey(parsed, "aggregateRating"), false);
    assert.equal(hasKey(parsed, "review"), false);
  });

  it("parses /call JSON-LD as FAQPage with no telephone while coming soon", () => {
    const parsed = JSON.parse(JSON.stringify(CALL_JSON_LD)) as {
      "@context": string;
      "@graph": Array<Record<string, unknown>>;
    };
    assert.deepEqual(parsed, CALL_JSON_LD);
    assert.equal(parsed["@context"], "https://schema.org");
    const types = typesOf(parsed);
    for (const expected of [
      "WebPage",
      "BreadcrumbList",
      "Service",
      "Offer",
      "FAQPage",
      "Question",
      "Answer",
    ]) {
      assert.ok(types.includes(expected), expected);
    }

    const faq = parsed["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.ok(faq);
    const questions = faq.mainEntity as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;
    const emergency = questions.find(
      (item) => item.name === "What about emergencies?",
    );
    assert.ok(emergency);
    assert.match(emergency.acceptedAnswer.text, /911/);
    assert.match(emergency.acceptedAnswer.text, /988/);

    const service = parsed["@graph"].find(
      (node) => node["@type"] === "Service",
    );
    assert.ok(service);
    assert.equal(service.name, "Albany AI Guy Line (coming soon)");
    const offers = service.offers as { availability?: string; price?: string };
    assert.equal(offers.availability, "https://schema.org/PreOrder");
    assert.equal(offers.price, "0");
    assert.equal(hasKey(parsed, "telephone"), false);
    assert.equal(JSON.stringify(parsed).includes("telephone"), false);
  });

  it("embeds parseable FAQPage JSON-LD on the rendered /call and home pages", () => {
    const callBlocks = jsonLdBlocks(renderPage(CallPage));
    assert.equal(callBlocks.length, 1);
    assert.ok(typesOf(callBlocks[0]).includes("FAQPage"));
    assert.equal(hasKey(callBlocks[0], "telephone"), false);

    const homeBlocks = jsonLdBlocks(renderPage(HomePage));
    assert.equal(homeBlocks.length, 1);
    const home = homeBlocks[0] as {
      "@type": string;
      mainEntity: unknown[];
    };
    assert.equal(home["@type"], "FAQPage");
    assert.deepEqual(home, HOME_FAQ_JSON_LD);
    assert.equal(home.mainEntity.length, HOME_FAQ.length);
    assert.equal(HOME_FAQ_JSON_LD["@context"], "https://schema.org");
  });
});
