import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  aiEnabled,
  type CheckRequestInput,
  checkRequest,
  createLimiter,
  dailyMax,
  MAX_BODY_BYTES,
} from "../src/lib/shop-line/guard.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function check(partial: CheckRequestInput) {
  return checkRequest({
    method: "POST",
    contentType: "application/json",
    contentLength: null,
    origin: null,
    host: "albanyaiguy.com",
    ...partial,
  });
}

function clock(start: number) {
  let t = start;
  return {
    now: () => t,
    set(n: number) {
      t = n;
    },
    advance(n: number) {
      t += n;
    },
  };
}

test("aiEnabled is true only for the exact string on", () => {
  assert.equal(aiEnabled({}), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: undefined }), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: "" }), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: "true" }), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: "ON" }), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: "1" }), false);
  assert.equal(aiEnabled({ SHOP_LINE_AI: "on" }), true);
});

test("dailyMax defaults to 200 and clamps to 0..2000", () => {
  assert.equal(dailyMax({}), 200);
  assert.equal(dailyMax({ SHOP_LINE_AI_DAILY_MAX: undefined }), 200);
  assert.equal(dailyMax({ SHOP_LINE_AI_DAILY_MAX: "50" }), 50);
  assert.equal(dailyMax({ SHOP_LINE_AI_DAILY_MAX: "-5" }), 0);
  assert.equal(dailyMax({ SHOP_LINE_AI_DAILY_MAX: "999999" }), 2000);
  assert.equal(dailyMax({ SHOP_LINE_AI_DAILY_MAX: "abc" }), 200);
});

test("checkRequest rejects non-JSON, oversized, and cross-origin posts", () => {
  const plain = check({ contentType: "text/plain" });
  assert.equal(plain.ok, false);
  if (plain.ok) return;
  assert.equal(plain.status, 415);

  const missing = check({ contentType: null });
  assert.equal(missing.ok, false);
  if (missing.ok) return;
  assert.equal(missing.status, 415);

  assert.deepEqual(check({ contentType: "application/json; charset=utf-8" }), {
    ok: true,
  });

  const huge = check({ contentLength: "20000" });
  assert.equal(huge.ok, false);
  if (huge.ok) return;
  assert.equal(huge.status, 413);

  assert.deepEqual(check({ contentLength: String(MAX_BODY_BYTES) }), {
    ok: true,
  });

  const evil = check({
    origin: "https://evil.example",
    host: "albanyaiguy.com",
  });
  assert.equal(evil.ok, false);
  if (evil.ok) return;
  assert.equal(evil.status, 403);

  assert.deepEqual(
    check({ origin: "https://albanyaiguy.com", host: "albanyaiguy.com" }),
    { ok: true },
  );
  assert.deepEqual(
    check({ origin: "https://albanyaiguy.com", host: "AlbanyAIGuy.com" }),
    { ok: true },
  );
  assert.deepEqual(check({ origin: null, host: "albanyaiguy.com" }), {
    ok: true,
  });

  const badOrigin = check({ origin: "not a url", host: "albanyaiguy.com" });
  assert.equal(badOrigin.ok, false);
  if (badOrigin.ok) return;
  assert.equal(badOrigin.status, 403);
});

test("limiter allows 60 hits per IP, then the 61st is false until the window expires", () => {
  const c = clock(Date.UTC(2026, 9, 10, 12, 0, 0));
  const windowMs = 10 * 60_000;
  const limiter = createLimiter({ perIpMax: 60, windowMs, now: c.now });

  for (let i = 0; i < 60; i++) {
    assert.equal(limiter.allowAi("10.0.0.1", 2000), true);
  }
  assert.equal(limiter.allowAi("10.0.0.1", 2000), false);
  assert.equal(limiter.allowAi("10.0.0.2", 2000), true);

  c.advance(windowMs);
  assert.equal(limiter.allowAi("10.0.0.1", 2000), false);
  c.advance(1);
  assert.equal(limiter.allowAi("10.0.0.1", 2000), true);
});

test("daily budget stops the next call across IPs and resets after a UTC day change", () => {
  const c = clock(Date.parse("2026-10-10T23:30:00.000Z"));
  const limiter = createLimiter({ now: c.now });

  assert.equal(limiter.allowAi("a", 3), true);
  assert.equal(limiter.allowAi("b", 3), true);
  assert.equal(limiter.allowAi("c", 3), true);
  assert.equal(limiter.allowAi("d", 3), false);
  assert.equal(limiter.allowAi("e", 3), false);

  c.set(Date.parse("2026-10-11T00:00:00.000Z"));
  assert.equal(limiter.allowAi("d", 3), true);
  assert.equal(limiter.allowAi("e", 3), true);
  assert.equal(limiter.allowAi("f", 3), true);
  assert.equal(limiter.allowAi("g", 3), false);
});

test("a rejected per-IP hit does not spend the daily budget", () => {
  const c = clock(Date.UTC(2026, 9, 10, 15, 0, 0));
  const limiter = createLimiter({ perIpMax: 60, now: c.now });

  for (let i = 0; i < 60; i++) {
    assert.equal(limiter.allowAi("a", 61), true);
  }
  assert.equal(limiter.allowAi("a", 61), false);
  assert.equal(limiter.allowAi("b", 61), true);
});

test("dailyMax 0 never allows an AI call", () => {
  const limiter = createLimiter({
    now: () => Date.UTC(2026, 9, 10, 12, 0, 0),
  });
  assert.equal(limiter.allowAi("a", 0), false);
  assert.equal(limiter.allowAi("b", 0), false);
});

test("maxKeys blocks a new IP without growing, and expiry pruning allows again", () => {
  const c = clock(Date.UTC(2026, 9, 10, 12, 0, 0));
  const windowMs = 10 * 60_000;
  const limiter = createLimiter({ maxKeys: 3, windowMs, now: c.now });

  assert.equal(limiter.allowAi("a", 100), true);
  assert.equal(limiter.allowAi("b", 100), true);
  assert.equal(limiter.allowAi("c", 100), true);
  assert.equal(limiter.allowAi("d", 100), false);
  assert.equal(limiter.allowAi("e", 100), false);
  assert.equal(limiter.allowAi("a", 100), true);

  c.advance(windowMs + 1);
  assert.equal(limiter.allowAi("d", 100), true);
});

test("shop-line route calls the guard before generateText", () => {
  const source = readFileSync(
    join(root, "src/app/api/shop-line/route.ts"),
    "utf8",
  );
  assert.match(source, /from "@\/lib\/shop-line\/guard"/);
  assert.match(source, /\baiEnabled\b/);
  assert.match(source, /\bMAX_BODY_BYTES\b/);
  assert.match(source, /no-store/);

  const enabledAt = source.indexOf("aiEnabled(");
  const generateAt = source.indexOf("generateText(");
  assert.ok(enabledAt !== -1);
  assert.ok(generateAt !== -1);
  assert.ok(enabledAt < generateAt);
});

test("route: cross-site origin falls back to the rule engine, never the paid model", () => {
  const src = readFileSync(
    join(root, "src/app/api/shop-line/route.ts"),
    "utf8",
  );
  assert.match(src, /const crossSite = !gate\.ok && gate\.status === 403;/);
  assert.match(src, /aiEnabled\(process\.env\) &&\s*!crossSite &&/);
});
