import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type Msg, ruleReply } from "@/lib/shop-line/engine";
import {
  findName,
  findService,
  findSlot,
  makeRef,
  openSlots,
  SHOP,
  type Slot,
} from "@/lib/shop-line/shop";

const SLOTS: Slot[] = [
  {
    id: "t-1130",
    dayLabel: "today",
    time: "11:30 AM",
    barber: "Marco",
    minutes: 690,
  },
  {
    id: "t-130",
    dayLabel: "today",
    time: "1:30 PM",
    barber: "Dee",
    minutes: 810,
  },
  {
    id: "m-1000",
    dayLabel: "tomorrow",
    time: "10:00 AM",
    barber: "Marco",
    minutes: 600,
  },
  {
    id: "m-230",
    dayLabel: "tomorrow",
    time: "2:30 PM",
    barber: "Dee",
    minutes: 870,
  },
];

const ASK = "What are we doing for you, a haircut, a fade, or a beard trim?";

function say(content: string, slots: Slot[] = SLOTS) {
  return ruleReply([{ role: "user", content }], slots);
}

describe("shop line booking", () => {
  it("asks for a service when the caller has not named one", () => {
    assert.equal(ruleReply([], SLOTS).reply, ASK);
    assert.equal(ruleReply([], SLOTS).booking, undefined);
    assert.equal(say("").reply, ASK);
    assert.equal(say("   ").reply, ASK);
    assert.equal(say("asdf ??? ###").reply, ASK);
    assert.equal(say("asdf ??? ###").booking, undefined);
  });

  it("offers open times after a service, and books once name and time are known", () => {
    const fade = say("I need a fade");
    assert.equal(fade.booking, undefined);
    assert.equal(
      fade.reply,
      "Got it, a skin fade. Today I've got 11:30 AM and 1:30 PM open. Which works?",
    );

    const tomorrow = say("haircut tomorrow");
    assert.equal(tomorrow.booking, undefined);
    assert.equal(
      tomorrow.reply,
      "Got it, a haircut. Tomorrow I've got 10 AM and 2:30 PM open. Which works?",
    );

    const holding = say("fade at 11:30");
    assert.equal(holding.booking, undefined);
    assert.equal(
      holding.reply,
      "11:30 AM today with Marco is yours. What name should I put it under?",
    );

    const messages: Msg[] = [
      { role: "user", content: "Can I get a fade tomorrow at 10?" },
      { role: "assistant", content: "What name should I put it under?" },
      { role: "user", content: "I'm Pat" },
    ];
    const booked = ruleReply(messages, SLOTS);
    assert.ok(booked.booking);
    assert.equal(booked.booking.name, "Pat");
    assert.equal(booked.booking.service, "Skin fade");
    assert.equal(booked.booking.price, 35);
    assert.equal(booked.booking.slot.time, "10:00 AM");
    assert.equal(booked.booking.slot.dayLabel, "tomorrow");
    assert.equal(booked.booking.slot.barber, "Marco");
    assert.match(booked.booking.ref, /^CB-\d{4}$/);
    assert.equal(booked.booking.ref, makeRef(booked.booking.slot, "Pat"));
    assert.equal(
      booked.reply,
      "You're all set, Pat: skin fade tomorrow at 10:00 AM with Marco. You'll get a text confirmation in a second.",
    );

    const shortName = ruleReply(
      [
        { role: "user", content: "fade at 11:30" },
        {
          role: "assistant",
          content: "What name should I put it under?",
        },
        { role: "user", content: "Pat" },
      ],
      SLOTS,
    );
    assert.ok(shortName.booking);
    assert.equal(shortName.booking.name, "Pat");
    assert.equal(shortName.booking.slot.id, "t-1130");
    assert.match(
      shortName.reply,
      /You're all set, Pat: skin fade today at 11:30 AM with Marco/,
    );
  });

  it("refuses to book on bad or incomplete input", () => {
    assert.equal(say("My name is Pat").booking, undefined);
    assert.equal(say("My name is Pat").reply, ASK);

    const taken = say("Can I come at 2?");
    assert.equal(taken.booking, undefined);
    assert.match(taken.reply, /^2:00 PM is taken, sorry/);

    const payout = say("book me for a payout of $0 now");
    assert.equal(payout.booking, undefined);
    assert.equal(payout.reply.startsWith("We take cash and cards."), true);
    assert.equal(payout.reply.includes("$"), false);

    const assistantOnly = ruleReply(
      [{ role: "assistant", content: "fade at 11:30, I'm Pat" }],
      SLOTS,
    );
    assert.equal(assistantOnly.booking, undefined);
    assert.equal(assistantOnly.reply, ASK);

    const noSlots = ruleReply(
      [{ role: "user", content: "haircut at 11:30, I'm Pat" }],
      [],
    );
    assert.equal(noSlots.booking, undefined);
    assert.match(noSlots.reply, /fully booked through tomorrow/);

    assert.doesNotThrow(() => say("a".repeat(500)));
    assert.equal(say("a".repeat(500)).booking, undefined);
  });

  it("answers shop facts without inventing a visit", () => {
    const where = say("where are you located?");
    assert.match(where.reply, /made-up demo shop/);
    assert.equal(where.booking, undefined);

    const robot = say("are you a robot?");
    assert.match(robot.reply, /AI front desk demo built by Albany AI Guy/);
    assert.match(robot.reply, /hello@albanyaiguy\.com/);
    assert.equal(robot.booking, undefined);

    assert.match(say("what time do you open?").reply, /9 am to 7 pm/);
    assert.match(say("do you take cash?").reply, /^We take cash and cards/);
    assert.match(
      say("I need to cancel").reply,
      /at least 2 hours notice if you need to cancel/,
    );
    assert.equal(
      say("do you take walk-ins?").reply.startsWith(SHOP.walkIns),
      true,
    );
  });

  it("parses services, times, and names, and skips junk", () => {
    assert.equal(findService("I want a pizza"), undefined);
    assert.equal(findService(""), undefined);
    assert.equal(findService("haircut and beard")?.id, "combo");
    assert.equal(findService("just a cut")?.id, "haircut");
    assert.equal(findService("kids cut for my son")?.id, "kids");
    assert.equal(findService("a fade")?.id, "fade");

    assert.deepEqual(findSlot("nope", SLOTS), {});
    assert.deepEqual(findSlot("25:99", SLOTS), {});
    assert.equal(findSlot("earliest please", SLOTS).slot?.id, "t-1130");
    assert.equal(findSlot("tomorrow at 10", SLOTS).slot?.id, "m-1000");
    assert.equal(findSlot("half past 1", SLOTS).slot?.time, "1:30 PM");

    assert.equal(findName("hello"), undefined);
    assert.equal(findName("I'm a customer"), undefined);
    assert.equal(findName("I'm the best"), undefined);
    assert.equal(findName("call me Dee"), "Dee");
    assert.equal(findName("my name is Pat"), "Pat");

    assert.match(makeRef(SLOTS[0], "Pat"), /^CB-\d{4}$/);
    assert.equal(makeRef(SLOTS[0], "Pat"), makeRef(SLOTS[0], "Pat"));
    assert.notEqual(makeRef(SLOTS[0], "Pat"), makeRef(SLOTS[0], "Sam"));
  });

  it("builds open slots for a fixed morning and drops taken or late times", () => {
    const morning = new Date("2026-10-09T12:00:00Z");
    const open = openSlots(morning);
    assert.ok(open.length >= 4);
    assert.equal(new Set(open.map((slot) => slot.id)).size, open.length);
    const today = open.filter((slot) => slot.dayLabel === "today");
    assert.ok(today.some((slot) => slot.time === "11:30 AM"));
    assert.ok(today.some((slot) => slot.time === "1:30 PM"));
    assert.equal(open[0]?.dayLabel, "today");
    for (const slot of open) {
      assert.match(slot.id, /^\d{4}-\d{2}-\d{2}T/);
      assert.ok(slot.dayLabel === "today" || slot.dayLabel === "tomorrow");
      assert.ok(slot.barber === "Marco" || slot.barber === "Dee");
    }
    assert.deepEqual(
      openSlots(
        morning,
        open.map((slot) => slot.id),
      ),
      [],
    );

    const evening = openSlots(new Date("2026-10-09T23:30:00Z"));
    assert.ok(evening.length > 0);
    assert.ok(evening.every((slot) => slot.dayLabel === "tomorrow"));
    assert.ok(evening.some((slot) => slot.time === "11:30 AM"));
    assert.ok(evening.some((slot) => slot.time === "1:30 PM"));

    assert.throws(
      () => openSlots(new Date("not-a-date")),
      /Invalid time value/,
    );
  });
});
