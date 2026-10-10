/**
 * Greeting for the /try "hear your shop" demo.
 * Built only from what the visitor types. Nothing is sent or recorded.
 * Shop name is required, 60 characters max. Service and hours are optional, 80 max.
 * URLs, email addresses, phone numbers, angle brackets, and emoji are removed.
 */

export const SHOP_NAME_MAX = 60;
export const SHOP_DETAIL_MAX = 80;

export const SPEECH_UNSUPPORTED =
  "Your browser can't speak this; here's the script";
export const SPEECH_SPEAKING = "Speaking.";
export const SPEECH_STOPPED = "Stopped.";
export const SPEECH_DONE = "Finished speaking.";
export const SHOP_NAME_REQUIRED = "Enter a shop name.";

export type HearYourShopInput = {
  shop?: string | null;
  service?: string | null;
  hours?: string | null;
};

export type HearYourShopResult =
  | { ok: true; script: string }
  | { ok: false; message: string };

const RAW_CAP = 1000;

function asText(value: string | null | undefined): string {
  return typeof value === "string" ? value : "";
}

function withoutControls(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    out += code <= 31 || code === 127 ? " " : char;
  }
  return out;
}

function clean(raw: string): string {
  let value = Array.from(asText(raw)).slice(0, RAW_CAP).join("");
  value = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  value = value.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  value = value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, " ");
  value = value.replace(
    /\b(?:https?:\/\/|mailto:|javascript:|data:)[^\s<>]+/gi,
    " ",
  );
  value = value.replace(/\bwww\.[^\s<>]+/gi, " ");
  value = value.replace(/(?:^|\s)\/\/[^\s<>]+/gi, " ");
  value = value.replace(
    /\b(?:[a-z0-9-]+\.)+(?:com|net|org|edu|gov|io|co|biz|info|us|shop|xyz|invalid)(?:\/[^\s<>]*)?/gi,
    " ",
  );
  value = value.replace(
    /(?:\+?1[\s.-]*)?(?:\(\d{3}\)|\d{3})[\s.-]*\d{3}[\s.-]*\d{4}\b/g,
    " ",
  );
  value = value.replace(/\+\d{1,3}(?:[\s().-]*\d){8,14}/g, " ");
  value = value.replace(/\b\d{10,11}\b/g, " ");
  value = value.replace(/\b\d{3}[\s.-]\d{4}\b/g, " ");
  value = value.replace(/<[^>]*>/g, " ");
  value = value.replace(/[<>]/g, " ");
  value = value.replace(
    /\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|\u200D|\uFE0F|\u20E3/gu,
    " ",
  );
  value = withoutControls(value);
  value = value.replace(/\s+/g, " ").trim();
  value = value.replace(/\s+([.,!?;:])/g, "$1");
  return value;
}

function clause(value: string): string {
  return value.replace(/[.!?,;:\s]+$/u, "");
}

function field(raw: string | null | undefined, max: number): string {
  const capped = Array.from(clause(clean(asText(raw))))
    .slice(0, max)
    .join("");
  return /[\p{L}\p{N}]/u.test(capped) ? capped : "";
}

export function buildShopGreeting(
  input: HearYourShopInput,
): HearYourShopResult {
  const shop = field(input.shop, SHOP_NAME_MAX);
  if (!shop) {
    return { ok: false, message: SHOP_NAME_REQUIRED };
  }
  const service = field(input.service, SHOP_DETAIL_MAX);
  const hours = field(input.hours, SHOP_DETAIL_MAX);
  const sentences = [`Thanks for calling ${shop}.`, "This is the front desk."];
  if (service) sentences.push(`We can help with ${service}.`);
  if (hours) sentences.push(`We're open ${hours}.`);
  sentences.push("What can I do for you?");
  return { ok: true, script: sentences.join(" ") };
}
