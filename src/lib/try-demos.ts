/**
 * /try: four demos one link can open. No sign-up, nothing stored, no prices.
 * Anchor ids are stable so a post can link to /try#shop-line and the others.
 */

export const TRY_DEMOS = [
  {
    id: "shop-line",
    title: "Watch the 518 Shop Line answer a call",
    jump: "Shop line",
  },
  {
    id: "missed-calls",
    title: "Missed-call cost calculator",
    jump: "Missed calls",
  },
  {
    id: "call-prep",
    title: "Call-prep helper",
    jump: "Call prep",
  },
  {
    id: "hear-your-shop",
    title: "Hear your shop answer the phone",
    jump: "Hear your shop",
  },
] as const;

export type TryDemoId = (typeof TRY_DEMOS)[number]["id"];

export function demoById(id: TryDemoId) {
  const demo = TRY_DEMOS.find((item) => item.id === id);
  if (!demo) {
    throw new Error(`Unknown demo: ${id}`);
  }
  return demo;
}

export const SHOP_LINE_VIDEO_SRC = "/try/518-shop-line-demo.mp4";
export const SHOP_LINE_POSTER_SRC = "/try/518-shop-line-demo-poster.jpg";

/** Exact lines of the clip (from the clip's render timeline). */
export const SHOP_LINE_TRANSCRIPT = [
  "Front desk: Thanks for calling Chairside Barber Co. Marco's mid-cut, but I can get you booked. What can I do for you?",
  "Caller: Hey, can I get a fade today?",
  "Front desk: Sure thing. Today I've got 11:30 and 1:30 open. Which works?",
  "Caller: 1:30's perfect.",
  "Front desk: Got you. What name should I put it under?",
  "Caller: Mike.",
  "Front desk: You're all set, Mike. Skin fade, today at 1:30 with Marco. You'll get a text in a second.",
] as const;

/**
 * Exact ChatGPT link for the call-prep demo. Apostrophes stay percent-encoded
 * as %27 so the href matches the published URL character for character.
 */
export const CALL_PREP_URL =
  "https://chatgpt.com/?q=Be%20my%20call-prep%20helper.%20Ask%20me%20who%20I%27m%20calling%20and%20what%20the%20problem%20is.%20Then%20give%20me%20a%2030-second%20script%20of%20exactly%20what%20to%20say%2C%20and%20the%203%20questions%20I%20should%20ask%20so%20I%20don%27t%20have%20to%20call%20back.%20Keep%20it%20short%20and%20plain.";

const callPrepPrompt = new URL(CALL_PREP_URL).searchParams.get("q");
if (!callPrepPrompt) {
  throw new Error("Call-prep URL is missing a prompt.");
}

export const CALL_PREP_PROMPT: string = callPrepPrompt;

export const CALL_PREP_OPEN_LABEL = "Open the call-prep helper in ChatGPT";
