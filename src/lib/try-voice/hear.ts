import {
  buildShopGreeting,
  type HearYourShopResult,
} from "@/lib/hear-your-shop";

export const HEAR_QUESTIONS = {
  shop: "What is the shop name?",
  service: "Name one service to mention, or say skip.",
  hours: "What hours should I mention, or say skip?",
} as const;

const SKIP =
  /^(?:skip|none|no|nope|nothing|pass|no thanks|not now|that's all|thats all)$/i;

export function isSkip(text: string | null | undefined): boolean {
  return SKIP.test((text ?? "").trim());
}

/** Same greeting as the form. Skip words leave that optional field blank. */
export function hearYourShopFrom(input: {
  shop: string;
  service?: string | null;
  hours?: string | null;
}): HearYourShopResult {
  return buildShopGreeting({
    shop: input.shop,
    service: isSkip(input.service) ? "" : input.service,
    hours: isSkip(input.hours) ? "" : input.hours,
  });
}
