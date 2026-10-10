/**
 * Cost and abuse guard for POST /api/shop-line.
 * No Next.js or AI SDK imports, so node:test can load this file directly.
 * The paid model stays off unless SHOP_LINE_AI is exactly "on".
 */

export const MAX_BODY_BYTES = 16384;

const DAILY_DEFAULT = 200;
const DAILY_CEILING = 2000;

const ERROR_JSON = "Send JSON.";
const ERROR_TOO_LARGE = "That message is too long.";
const ERROR_ORIGIN = "That request is not from this site.";

export type ShopLineEnv = {
  [key: string]: string | undefined;
  SHOP_LINE_AI?: string;
  SHOP_LINE_AI_DAILY_MAX?: string;
};

export type CheckRequestInput = {
  method?: string;
  contentType?: string | null;
  contentLength?: string | null;
  origin?: string | null;
  host?: string | null;
};

export type CheckRequestResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

type Hit = { n: number; t: number };

type LimiterOptions = {
  perIpMax?: number;
  windowMs?: number;
  maxKeys?: number;
  now?: () => number;
};

/** True only for the exact string "on". Unset, empty, and lookalikes stay off. */
export function aiEnabled(env: ShopLineEnv): boolean {
  return env.SHOP_LINE_AI === "on";
}

/**
 * Integer daily AI cap for this server instance.
 * Unset or non-numeric values use 200. The result is clamped to 0..2000.
 * 0 means the paid model never runs.
 */
export function dailyMax(env: ShopLineEnv): number {
  const raw = env.SHOP_LINE_AI_DAILY_MAX;
  if (raw == null) return DAILY_DEFAULT;
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return DAILY_DEFAULT;
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n)) return DAILY_DEFAULT;
  if (n < 0) return 0;
  if (n > DAILY_CEILING) return DAILY_CEILING;
  return n;
}

function numericContentLength(value: string | null | undefined): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/**
 * Reject a POST before the body is trusted.
 * Missing Origin is allowed. A present Origin must name the same host.
 */
export function checkRequest(input: CheckRequestInput): CheckRequestResult {
  const contentType = (input.contentType ?? "").trim().toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return { ok: false, status: 415, error: ERROR_JSON };
  }

  const contentLength = numericContentLength(input.contentLength);
  if (contentLength != null && contentLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: ERROR_TOO_LARGE };
  }

  if (input.origin) {
    let originHost: string;
    try {
      originHost = new URL(input.origin).host;
    } catch {
      return { ok: false, status: 403, error: ERROR_ORIGIN };
    }
    // Hostnames are case-insensitive. URL.host already lowercases the name.
    const siteHost = (input.host ?? "").trim().toLowerCase();
    if (originHost !== siteHost) {
      return { ok: false, status: 403, error: ERROR_ORIGIN };
    }
  }

  return { ok: true };
}

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Per-IP window (same rule as the old in-memory counter) plus one UTC-day
 * budget for calls that are actually allowed. The IP map is capped.
 */
export function createLimiter({
  perIpMax = 60,
  windowMs = 10 * 60_000,
  maxKeys = 5000,
  now = Date.now,
}: LimiterOptions = {}) {
  const hits = new Map<string, Hit>();
  let dayKey = "";
  let dayCount = 0;

  function pruneExpired(t: number) {
    for (const [key, hit] of hits) {
      if (t - hit.t > windowMs) hits.delete(key);
    }
  }

  function allowAi(ip: string, maxPerDay: number): boolean {
    const t = now();
    const day = utcDay(t);
    if (day !== dayKey) {
      dayKey = day;
      dayCount = 0;
    }
    if (dayCount >= maxPerDay) return false;

    let hit = hits.get(ip);
    if (!hit) {
      if (hits.size >= maxKeys) {
        pruneExpired(t);
        if (hits.size >= maxKeys) return false;
      }
      hit = { n: 1, t };
      hits.set(ip, hit);
      dayCount += 1;
      return true;
    }

    if (t - hit.t > windowMs) {
      hit.n = 1;
      hit.t = t;
      dayCount += 1;
      return true;
    }

    hit.n += 1;
    if (hit.n > perIpMax) return false;
    dayCount += 1;
    return true;
  }

  return { allowAi };
}
