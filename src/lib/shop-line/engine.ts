// Rule-based backup brain for the 518 Shop Line demo. Used when the AI model is
// unavailable, so the demo never dead-ends. Same facts, same booking rules.
import {
  type Booking,
  cap,
  findName,
  findService,
  findSlot,
  makeRef,
  SHOP,
  type Slot,
  servicesLine,
  slotSentence,
  upper,
} from "./shop";

export type Msg = { role: "user" | "assistant"; content: string };

export function ruleReply(
  messages: Msg[],
  slots: Slot[],
): { reply: string; booking?: Booking } {
  let service: ReturnType<typeof findService>;
  let slot: Slot | undefined;
  let asked: string | undefined;
  let name: string | undefined;
  let wantTomorrow = false;

  messages.forEach((m, i) => {
    if (m.role !== "user") return;
    const prev = messages[i - 1]?.content.toLowerCase() ?? "";

    service = findService(m.content) ?? service;
    if (/tomorrow/i.test(m.content)) wantTomorrow = true;
    else if (/today|this (afternoon|morning|evening)|tonight/i.test(m.content))
      wantTomorrow = false;
    const ordered = wantTomorrow
      ? [
          ...slots.filter((x) => x.dayLabel === "tomorrow"),
          ...slots.filter((x) => x.dayLabel !== "tomorrow"),
        ]
      : slots;
    const s = findSlot(m.content, ordered);
    if (s.slot) {
      slot = s.slot;
      asked = undefined;
    } else if (s.asked) asked = s.asked;
    const n = findName(m.content);
    if (n) name = n;
    else if (
      /name/.test(prev) &&
      !s.slot &&
      !s.asked &&
      !findService(m.content) &&
      !/\?/.test(m.content)
    ) {
      const w = m.content.trim().match(/^([A-Za-z][a-zA-Z'-]{1,20})\b/);
      const common =
        /^(what|how|can|could|yes|yeah|no|nope|sure|ok|okay|actually|wait|um|uh|hey|hi|hello|do|is|are|the|it|just|put|book|please|thanks)$/i;
      if (w && !common.test(w[1]) && m.content.trim().split(/\s+/).length <= 3)
        name = cap(w[1]);
    }
  });

  const last = (messages.at(-1)?.content ?? "").toLowerCase();
  let answer = "";
  if (
    /(real person|human|robot|\bai\b|who (made|built)|are you a bot|is this real)/.test(
      last,
    )
  ) {
    answer =
      "I'm an AI front desk demo built by Albany AI Guy, that's Chad Lenseth here in Albany. Albany-area shops can join the pilot at hello@albanyaiguy.com.";
  } else if (/(how much|price|cost|charge)/.test(last)) {
    answer = `${servicesLine()}.`;
  } else if (/(hours|open|close|what time do you)/.test(last) && !slot) {
    answer = `We're ${SHOP.hours.toLowerCase().replace("open ", "open ")}.`;
  } else if (/(where|address|located|parking)/.test(last)) {
    answer = "This is a made-up demo shop, so there's no real address.";
  } else if (/walk.?in|wait/.test(last)) {
    answer = SHOP.walkIns;
  } else if (/cancel/.test(last)) {
    answer = SHOP.cancellation;
  } else if (/(card|cash|pay)/.test(last)) {
    answer = `We take ${SHOP.payment.toLowerCase()}`;
  }

  if (service && slot && name) {
    const booking: Booking = {
      name,
      service: service.label,
      price: service.price,
      slot,
      ref: makeRef(slot, name),
    };
    return {
      reply: `${answer ? `${answer} ` : ""}You're all set, ${name}: ${service.label.toLowerCase()} ${slot.dayLabel} at ${slot.time} with ${slot.barber}. You'll get a text confirmation in a second.`,
      booking,
    };
  }

  const offer =
    wantTomorrow && slots.some((x) => x.dayLabel === "tomorrow")
      ? slots.filter((x) => x.dayLabel === "tomorrow")
      : slots;
  let next: string;
  const ask = "What are we doing for you, a haircut, a fade, or a beard trim?";
  if (!service && slot)
    next = `${slot.time} ${slot.dayLabel} is open with ${slot.barber}. ${ask}`;
  else if (!service && asked)
    next = `${asked} is taken, sorry. ${upper(slotSentence(offer))}. ${ask}`;
  else if (!service) next = ask;
  else if (!slot && asked)
    next = `${asked} is taken, sorry. ${upper(slotSentence(offer))}. Want one of those?`;
  else if (!slot)
    next = `Got it, a ${service.label.toLowerCase()}. ${upper(slotSentence(offer))}. Which works?`;
  else
    next = `${slot.time} ${slot.dayLabel} with ${slot.barber} is yours. What name should I put it under?`;
  return { reply: answer ? `${answer} ${next}` : next };
}
