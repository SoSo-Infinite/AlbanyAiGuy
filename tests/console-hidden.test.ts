import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import ConsoleLayout, { metadata } from "@/app/console/layout";
import sitemap from "@/app/sitemap";

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("staging console is hidden from the public (Chad, 2026-10-11)", () => {
  it("404s without CONSOLE_ENABLED=on", () => {
    const saved = process.env.CONSOLE_ENABLED;
    delete process.env.CONSOLE_ENABLED;
    try {
      assert.throws(
        () => ConsoleLayout({ children: null }),
        (err: unknown) =>
          String((err as { digest?: string }).digest ?? err).includes("404"),
      );
      process.env.CONSOLE_ENABLED = "yes";
      assert.throws(() => ConsoleLayout({ children: null }));
    } finally {
      if (saved === undefined) delete process.env.CONSOLE_ENABLED;
      else process.env.CONSOLE_ENABLED = saved;
    }
  });

  it("renders only with CONSOLE_ENABLED=on", () => {
    const saved = process.env.CONSOLE_ENABLED;
    process.env.CONSOLE_ENABLED = "on";
    try {
      assert.equal(ConsoleLayout({ children: "ok" }), "ok");
    } finally {
      if (saved === undefined) delete process.env.CONSOLE_ENABLED;
      else process.env.CONSOLE_ENABLED = saved;
    }
  });

  it("is noindex, not in the sitemap, and not linked from public chrome", () => {
    assert.deepEqual(metadata.robots, { index: false, follow: false });
    assert.equal(
      sitemap().some((e) => e.url.includes("/console")),
      false,
    );
    for (const file of [
      "src/components/site-header.tsx",
      "src/components/site-footer.tsx",
      "src/lib/nav.ts",
      "src/app/page.tsx",
    ]) {
      assert.equal(source(file).includes("/console"), false, file);
    }
  });
});
