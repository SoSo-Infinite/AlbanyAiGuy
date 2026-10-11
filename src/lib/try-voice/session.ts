import { buildShopGreeting } from "@/lib/hear-your-shop";
import type { MissedCallResult } from "@/lib/missed-calls";
import type { TryDemoId } from "@/lib/try-demos";
import {
  buildCallPrep,
  type CallPrepCard,
  cleanCallField,
  PREP_QUESTIONS,
  speakCallPrep,
} from "./call-prep";
import { HEAR_QUESTIONS, hearYourShopFrom, isSkip } from "./hear";
import {
  BROWSING_PIVOT,
  isBrowsingReply,
  OPENING_LINE,
  SILENCE_LINE,
} from "./lines";
import {
  MISSED_QUESTIONS,
  type MissedStep,
  missedCallsResult,
  missedFieldError,
  missedFieldFor,
  speakMissed,
} from "./missed";
import { spokenNumberToRaw } from "./numbers";
import {
  formatBookingSummary,
  SHOP_HANDOFF,
  type ShopBooking,
  type ShopMsg,
  type ShopRequest,
} from "./shop";

export type TryPhase = "await-open" | "await-prompt" | "demo";

export type TrySession = {
  demo: TryDemoId;
  phase: TryPhase;
  missedStep: MissedStep;
  missedCalls?: string;
  missedPercent?: string;
  missedJob?: string;
  prepStep: "who" | "problem" | "done";
  prepWho?: string;
  prepProblem?: string;
  hearStep: "shop" | "service" | "hours" | "done";
  hearShop?: string;
  hearService?: string;
  hearHours?: string;
  shopMessages: ShopMsg[];
  taken: string[];
};

export type StepResult = {
  state: TrySession;
  say: string[];
  shopRequest: ShopRequest | null;
  missed: MissedCallResult | null;
  callPrep: CallPrepCard | null;
  greetingScript: string | null;
  booking: ShopBooking | null;
  bookingSummary: string | null;
  listen: boolean;
  armSilence: boolean;
};

function blank(state: TrySession, extra: Partial<StepResult> = {}): StepResult {
  return {
    state,
    say: [],
    shopRequest: null,
    missed: null,
    callPrep: null,
    greetingScript: null,
    booking: null,
    bookingSummary: null,
    listen: false,
    armSilence: false,
    ...extra,
  };
}

export function createSession(demo: TryDemoId): TrySession {
  return {
    demo,
    phase: "await-open",
    missedStep: "calls",
    prepStep: "who",
    hearStep: "shop",
    shopMessages: [],
    taken: [],
  };
}

export function beginSession(state: TrySession): StepResult {
  return blank(state, {
    say: [OPENING_LINE],
    listen: true,
    armSilence: true,
  });
}

export function silenceSession(state: TrySession): StepResult {
  if (state.phase !== "await-open") return blank(state);
  return blank(
    { ...state, phase: "await-prompt" },
    { say: [SILENCE_LINE], listen: true },
  );
}

export function visitorSession(state: TrySession, text: string): StepResult {
  const clean = text.trim();
  if (!clean) {
    return blank(state, {
      say: ["I didn't catch that. Say it once more, or type it below."],
      listen: true,
    });
  }
  if (state.phase !== "demo") {
    if (isBrowsingReply(clean)) {
      const entered = enterDemo({ ...state, phase: "demo" }, null);
      return { ...entered, say: [BROWSING_PIVOT, ...entered.say] };
    }
    return enterDemo({ ...state, phase: "demo" }, clean);
  }
  return continueDemo(state, clean);
}

export function shopReplySession(
  state: TrySession,
  reply: string,
  booking: ShopBooking | null,
): StepResult {
  const messages: ShopMsg[] = [
    ...state.shopMessages,
    { role: "assistant", content: reply },
  ];
  const taken = booking ? [...state.taken, booking.slotId] : state.taken;
  const summary = booking ? formatBookingSummary(booking) : null;
  return blank(
    { ...state, shopMessages: messages, taken },
    {
      say: summary ? [reply, summary] : [reply],
      booking,
      bookingSummary: summary,
      listen: true,
    },
  );
}

function enterDemo(state: TrySession, text: string | null): StepResult {
  const next = { ...state, phase: "demo" as const };
  if (next.demo === "missed-calls") return enterMissed(next, text);
  if (next.demo === "call-prep") return enterPrep(next, text);
  if (next.demo === "hear-your-shop") return enterHear(next, text);
  return enterShop(next, text);
}

function continueDemo(state: TrySession, text: string): StepResult {
  if (state.demo === "missed-calls") return takeMissed(state, text);
  if (state.demo === "call-prep") return takePrep(state, text);
  if (state.demo === "hear-your-shop") return takeHear(state, text);
  return takeShop(state, text, false);
}

function enterMissed(state: TrySession, text: string | null): StepResult {
  const next = { ...state, missedStep: "calls" as const };
  if (text == null) {
    return blank(next, { say: [MISSED_QUESTIONS.calls], listen: true });
  }
  return takeMissed(next, text);
}

function takeMissed(state: TrySession, text: string): StepResult {
  if (state.missedStep === "done") {
    return blank(state, {
      say: ["The estimate is above. It uses only the numbers you gave."],
    });
  }
  const question = MISSED_QUESTIONS[state.missedStep];
  const raw = spokenNumberToRaw(text);
  if (raw == null) {
    return blank(state, {
      say: [`I need a number. ${question}`],
      listen: true,
    });
  }
  const problem = missedFieldError(missedFieldFor(state.missedStep), raw);
  if (problem) return blank(state, { say: [problem], listen: true });

  if (state.missedStep === "calls") {
    return blank(
      { ...state, missedCalls: raw, missedStep: "percent" },
      { say: [MISSED_QUESTIONS.percent], listen: true },
    );
  }
  if (state.missedStep === "percent") {
    return blank(
      { ...state, missedPercent: raw, missedStep: "job" },
      { say: [MISSED_QUESTIONS.job], listen: true },
    );
  }
  const estimate = missedCallsResult(
    state.missedCalls ?? "",
    state.missedPercent ?? "",
    raw,
  );
  return blank(
    { ...state, missedJob: raw, missedStep: "done" },
    { say: [speakMissed(estimate)], missed: estimate },
  );
}

function enterPrep(state: TrySession, text: string | null): StepResult {
  const next = { ...state, prepStep: "who" as const };
  if (text == null) {
    return blank(next, { say: [PREP_QUESTIONS.who], listen: true });
  }
  return takePrep(next, text);
}

function takePrep(state: TrySession, text: string): StepResult {
  if (state.prepStep === "done") {
    return blank(state, {
      say: [
        "The script is above. You can read it, or open the fuller version.",
      ],
    });
  }
  if (state.prepStep === "who") {
    const who = cleanCallField(text);
    if (!who) return blank(state, { say: [PREP_QUESTIONS.who], listen: true });
    return blank(
      { ...state, prepWho: who, prepStep: "problem" },
      { say: [PREP_QUESTIONS.problem], listen: true },
    );
  }
  const problem = cleanCallField(text);
  if (!problem)
    return blank(state, { say: [PREP_QUESTIONS.problem], listen: true });
  const card = buildCallPrep(state.prepWho ?? "", problem);
  return blank(
    { ...state, prepProblem: problem, prepStep: "done" },
    { say: [speakCallPrep(card)], callPrep: card },
  );
}

function enterHear(state: TrySession, text: string | null): StepResult {
  const next = { ...state, hearStep: "shop" as const };
  if (text == null) {
    return blank(next, { say: [HEAR_QUESTIONS.shop], listen: true });
  }
  return takeHear(next, text);
}

function takeHear(state: TrySession, text: string): StepResult {
  if (state.hearStep === "done") {
    return blank(state, {
      say: ["That greeting is above. Nothing was saved."],
    });
  }
  if (state.hearStep === "shop") {
    const built = buildShopGreeting({ shop: text });
    if (!built.ok) {
      return blank(state, {
        say: [`${built.message} ${HEAR_QUESTIONS.shop}`],
        listen: true,
      });
    }
    return blank(
      { ...state, hearShop: text.trim(), hearStep: "service" },
      { say: [HEAR_QUESTIONS.service], listen: true },
    );
  }
  if (state.hearStep === "service") {
    return blank(
      { ...state, hearService: isSkip(text) ? "" : text, hearStep: "hours" },
      { say: [HEAR_QUESTIONS.hours], listen: true },
    );
  }
  const hours = isSkip(text) ? "" : text;
  const built = hearYourShopFrom({
    shop: state.hearShop ?? "",
    service: state.hearService ?? "",
    hours,
  });
  return blank(
    { ...state, hearHours: hours, hearStep: "done" },
    {
      say: [built.ok ? built.script : built.message],
      greetingScript: built.ok ? built.script : null,
    },
  );
}

function enterShop(state: TrySession, text: string | null): StepResult {
  const messages: ShopMsg[] = [{ role: "assistant", content: SHOP_HANDOFF }];
  const next = { ...state, shopMessages: messages };
  if (text == null) {
    return blank(next, { say: [SHOP_HANDOFF], listen: true });
  }
  return takeShop(next, text, true);
}

function takeShop(
  state: TrySession,
  text: string,
  withHandoff: boolean,
): StepResult {
  const base = state.shopMessages.length
    ? state.shopMessages
    : [{ role: "assistant" as const, content: SHOP_HANDOFF }];
  const request: ShopRequest = {
    messages: [...base, { role: "user", content: text }],
    taken: state.taken,
  };
  return blank(
    { ...state, shopMessages: request.messages },
    {
      say: withHandoff ? [SHOP_HANDOFF] : [],
      shopRequest: request,
    },
  );
}
