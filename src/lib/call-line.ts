/**
 * Albany AI Guy Line: the ONE place the public number and its launch state live.
 *
 * The number is NOT claimed yet. While COMING_SOON is true the site must not
 * imply the line is live: no tel: links, no `telephone` in structured data,
 * and every mention of the number carries a "not live yet" label.
 * Flip COMING_SOON to false only after Chad says "claim it" AND the line has
 * passed a real test call.
 */
export const CALL_LINE = {
  /** Launch-state flag. Default ON (true) until the number is claimed and tested. */
  COMING_SOON: true,
  /** Vanity spelling used in copy. */
  vanity: "518-726-COOL",
  /** Same number in digits, for people who can't map letters on a keypad. */
  digits: "518-726-2665",
  /** E.164 form, used for tel: links and schema.org only once live. */
  e164: "+15187262665",
  tagline: "Easy is cool.",
  email: "hello@albanyaiguy.com",
  path: "/call",
} as const;

export const CALL_LINE_LIVE = !CALL_LINE.COMING_SOON;

/** tel: href, or null while the line is coming soon (so nothing can dial it). */
export const CALL_LINE_TEL: string | null = CALL_LINE_LIVE
  ? `tel:${CALL_LINE.e164}`
  : null;

export const mailto = (subject: string) =>
  `mailto:${CALL_LINE.email}?subject=${encodeURIComponent(subject)}`;
