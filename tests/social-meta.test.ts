import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { Metadata } from "next";
import { metadata as call } from "../src/app/call/page.tsx";
import { metadata as consoleMeta } from "../src/app/console/layout.tsx";
import { metadata as contact } from "../src/app/contact/page.tsx";
import { metadata as notFound } from "../src/app/not-found.tsx";
import { metadata as home } from "../src/app/page.tsx";
import { metadata as referral } from "../src/app/s/[code]/page.tsx";
import { metadata as shopLine } from "../src/app/shop-line/page.tsx";
import { metadata as tips } from "../src/app/tips/page.tsx";
import { metadata as missedCalls } from "../src/app/tools/missed-calls/page.tsx";
import { metadata as trunkLine } from "../src/app/trunk-line/page.tsx";
import { metadata as tryPage } from "../src/app/try/page.tsx";
import { metadata as work } from "../src/app/work/page.tsx";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Layout `twitter.title`. The home page's og:title is this same string.
 * Every other indexable page must use its own title.
 */
const LAYOUT_TWITTER_TITLE = "Albany AI Guy";

/** Layout `twitter.card`, used only when a page does not set one. */
const LAYOUT_TWITTER_CARD = "summary_large_image";

const pages: { path: string; metadata: Metadata }[] = [
  { path: "/", metadata: home },
  { path: "/call", metadata: call },
  { path: "/trunk-line", metadata: trunkLine },
  { path: "/shop-line", metadata: shopLine },
  { path: "/try", metadata: tryPage },
  { path: "/work", metadata: work },
  { path: "/tips", metadata: tips },
  { path: "/tools/missed-calls", metadata: missedCalls },
  { path: "/contact", metadata: contact },
];

function asText(value: unknown, label: string): string {
  assert.equal(typeof value, "string", label);
  return value as string;
}

function imageUrl(item: unknown): string {
  if (typeof item === "string") return item;
  if (item instanceof URL) return item.toString();
  if (item && typeof item === "object" && "url" in item) {
    const url = item.url;
    if (typeof url === "string") return url;
    if (url instanceof URL) return url.toString();
  }
  throw new Error(`unexpected image value: ${String(item)}`);
}

function imageUrls(images: unknown): string[] {
  if (images == null) return [];
  const list = Array.isArray(images) ? images : [images];
  return list.map((item) => imageUrl(item));
}

test("indexable pages set a unique twitter title from their open graph title", () => {
  const titles: string[] = [];
  for (const page of pages) {
    const twitter = page.metadata.twitter;
    assert.ok(twitter, `${page.path} sets twitter`);
    const ogTitle = asText(
      page.metadata.openGraph?.title,
      `${page.path} openGraph.title`,
    );
    const twTitle = asText(twitter.title, `${page.path} twitter.title`);
    assert.equal(twTitle, ogTitle, page.path);
    if (page.path === "/") {
      assert.equal(twTitle, home.openGraph?.title);
    } else {
      assert.notEqual(twTitle, LAYOUT_TWITTER_TITLE, page.path);
    }
    titles.push(twTitle);

    const ogDescription = page.metadata.openGraph?.description;
    const description =
      typeof ogDescription === "string" && ogDescription.length > 0
        ? ogDescription
        : page.metadata.description;
    const twDescription = asText(
      twitter.description,
      `${page.path} twitter.description`,
    );
    assert.equal(twDescription, description, page.path);
    assert.ok(twDescription.length > 0, page.path);

    const card = "card" in twitter ? twitter.card : LAYOUT_TWITTER_CARD;
    assert.equal(card, "summary_large_image", page.path);

    const ogImages = imageUrls(page.metadata.openGraph?.images);
    const twImages = imageUrls(
      "images" in twitter ? twitter.images : undefined,
    );
    if (ogImages.length > 0) {
      assert.deepEqual(twImages, ogImages, page.path);
    }
  }
  assert.equal(titles.length, 9);
  assert.equal(new Set(titles).size, titles.length);
});

test("shop-line twitter image is its own card, not /og.jpg", () => {
  const og = readFileSync(join(root, "src/app/shop-line/opengraph-image.png"));
  const tw = readFileSync(join(root, "src/app/shop-line/twitter-image.png"));
  assert.ok(og.length > 0);
  assert.equal(Buffer.compare(og, tw), 0);

  const twitter = shopLine.twitter;
  assert.ok(twitter);
  const urls = imageUrls("images" in twitter ? twitter.images : undefined);
  for (const url of urls) {
    assert.equal(url.includes("og.jpg"), false, url);
    assert.equal(
      url.includes("twitter-image") || url.includes("opengraph-image"),
      true,
      url,
    );
  }
});

test("private pages do not set their own twitter tags", () => {
  assert.equal(referral.twitter, undefined);
  assert.equal(consoleMeta.twitter, undefined);
  assert.equal(notFound.twitter, undefined);
});
