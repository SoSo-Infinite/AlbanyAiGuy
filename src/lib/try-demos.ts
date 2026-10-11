/**
 * /try: two demos one link can open. No sign-up, nothing stored, no prices.
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
