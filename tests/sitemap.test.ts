import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../src/app/sitemap.ts";

test("sitemap includes /tips and /tools/missed-calls", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.includes("https://albanyaiguy.com/tips"), true);
  assert.equal(
    urls.includes("https://albanyaiguy.com/tools/missed-calls"),
    true,
  );
});
