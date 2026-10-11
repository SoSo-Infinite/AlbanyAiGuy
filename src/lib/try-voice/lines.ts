/**
 * Shared lines for the four /try voice agents.
 * Exact strings. The page does not store what a visitor says.
 */

export const OPENING_LINE = "Let's make Albany easier.";

export const SILENCE_LINE =
  "No rush. Are you just browsing, or is there something specific on your mind?";

export const BROWSING_PIVOT =
  "For example, I can help a barber set up online booking in under ten minutes.";

/** Wait this long with no final transcript before the silence line. */
export const SILENCE_MS = 6000;

export const TRY_PROMISE_BADGES = [
  "Try it in 10 seconds",
  "4 demos",
  "No signup",
  "Nothing you say is saved",
] as const;

export const VOICE_NOTE =
  "Voice uses your browser's mic and speech recognition. This page doesn't save what you say.";

export const STATUS_TALKING = "Agent talking";
export const STATUS_LISTENING = "Listening";
export const STATUS_THINKING = "Thinking";

export const MIC_BLOCKED = "The mic is blocked. Type your reply instead.";
export const SR_MISSING =
  "Speech recognition isn't available in this browser. Type your reply instead.";
export const LINE_CUT = "The line cut out for a second. Type that once more.";

const BROWSING_REPLY =
  /\b(?:just looking|looking around|just browsing|browsing|not sure|nothing)\b/i;

export function isBrowsingReply(text: string): boolean {
  return BROWSING_REPLY.test(text.trim());
}
