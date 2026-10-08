// 518 Shop Line demo. The shop below is FICTIONAL. It exists only so people can
// try the AI front desk. Nothing here describes a real business.

export const SHOP = {
  name: "Chairside Barber Co.",
  tagline: "Fictional demo shop · Albany, NY",
  hours: "Open every day, 9 AM to 7 PM (demo hours)",
  barbers: ["Marco", "Dee"],
  location: "A made-up shop for this demo, so there is no real address.",
  walkIns: "Walk-ins are welcome, but booked times go first.",
  payment: "Cash and cards.",
  cancellation: "Please give at least 2 hours notice if you need to cancel.",
  services: [
    {
      id: "haircut",
      label: "Haircut",
      price: 30,
      minutes: 30,
      words: ["haircut", "hair cut", "cut", "trim up", "regular"],
    },
    {
      id: "fade",
      label: "Skin fade",
      price: 35,
      minutes: 30,
      words: [
        "fade",
        "skin fade",
        "taper",
        "low fade",
        "high fade",
        "mid fade",
      ],
    },
    {
      id: "beard",
      label: "Beard trim",
      price: 15,
      minutes: 15,
      words: ["beard", "lineup", "line up", "line-up", "edge up", "shape up"],
    },
    {
      id: "combo",
      label: "Cut + beard",
      price: 45,
      minutes: 45,
      words: [
        "cut and beard",
        "haircut and beard",
        "fade and beard",
        "both",
        "combo",
        "the works",
      ],
    },
    {
      id: "kids",
      label: "Kids cut",
      price: 22,
      minutes: 30,
      words: ["kid", "kids", "son", "daughter", "child", "boy"],
    },
  ],
} as const;

export type Service = (typeof SHOP.services)[number];

export type Slot = {
  id: string; // e.g. 2026-10-08T13:30
  dayLabel: string; // "today" | "tomorrow"
  time: string; // "1:30 PM"
  barber: string;
  minutes: number; // minutes since midnight
};

export type Booking = {
  name: string;
  service: string;
  price: number;
  slot: Slot;
  ref: string;
};

const TZ = "America/New_York";

function nyNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  const hour = get("hour") % 24;
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    minutes: hour * 60 + get("minute"),
  };
}

export function fmtTime(min: number) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h = ((h24 + 11) % 12) + 1;
  return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Mostly booked day with a few open half-hours, like a real busy shop.
function openTimesFor(y: number, m: number, d: number) {
  const rand = seeded(y * 10000 + m * 100 + d);
  const pool = [
    10 * 60,
    10 * 60 + 30,
    11 * 60 + 30,
    12 * 60 + 30,
    13 * 60 + 30,
    14 * 60 + 30,
    15 * 60,
    16 * 60,
    17 * 60 + 30,
    18 * 60,
  ];
  // Always keep the locked brand example (11:30 and 1:30) open; add two more.
  const extra = pool
    .filter((t) => t !== 690 && t !== 810)
    .sort(() => rand() - 0.5)
    .slice(0, 2);
  return [690, 810, ...extra].sort((a, b) => a - b);
}

export function openSlots(now = new Date(), taken: string[] = []): Slot[] {
  const t = nyNow(now);
  const out: Slot[] = [];
  for (const offset of [0, 1]) {
    const date = new Date(Date.UTC(t.y, t.m - 1, t.d + offset));
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const times = openTimesFor(y, m, d).filter(
      (min) => offset > 0 || min >= t.minutes + 20,
    );
    times.forEach((min, i) => {
      const id = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${fmtTime(min).replace(" ", "")}`;
      if (taken.includes(id)) return;
      out.push({
        id,
        dayLabel: offset === 0 ? "today" : "tomorrow",
        time: fmtTime(min),
        barber: SHOP.barbers[i % 2],
        minutes: min,
      });
    });
  }
  // Only offer today if at least two openings are left; otherwise lead with tomorrow.
  const today = out.filter((s) => s.dayLabel === "today");
  return today.length >= 2
    ? out
    : out.filter((s) => s.dayLabel === "tomorrow").concat(today);
}

export function slotSentence(slots: Slot[], max = 3) {
  const first = slots.slice(0, max);
  if (!first.length) return "we're fully booked through tomorrow";
  const day = first[0].dayLabel;
  const same = first
    .filter((s) => s.dayLabel === day)
    .map((s) => s.time.replace(":00", ""));
  const list =
    same.length > 1
      ? `${same.slice(0, -1).join(", ")} and ${same.at(-1)}`
      : same[0];
  return `${day} I've got ${list} open`;
}

export function findService(text: string): Service | undefined {
  const t = text.toLowerCase();
  // Most specific first.
  for (const id of ["combo", "kids", "fade", "beard", "haircut"]) {
    const s = SHOP.services.find((x) => x.id === id);
    if (s?.words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) return s;
  }
  return undefined;
}

const NUM_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  noon: 12,
};

export function findSlot(
  text: string,
  slots: Slot[],
): { slot?: Slot; asked?: string } {
  const t = text
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\d{5,}/g, " ");
  if (
    /\b(earliest|first|soonest|next (one|open|available)|asap|whatever|any ?time)\b/.test(
      t,
    )
  )
    return { slot: slots[0] };
  const wantTomorrow = /tomorrow/.test(t);
  let h: number | undefined;
  let mm = 0;
  let mer: string | undefined;
  const m1 = t.match(/\b(1[0-2]|0?[1-9])(?::|\s)?([0-5]\d)?\s*(am|pm)?\b/);
  if (m1) {
    h = Number(m1[1]);
    mm = m1[2] ? Number(m1[2]) : 0;
    mer = m1[3];
  } else {
    const w = t.match(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon)(?:\s*(thirty|o'?clock|fifteen|forty five))?\s*(am|pm)?\b/,
    );
    if (w) {
      h = NUM_WORDS[w[1]];
      mm =
        w[2] === "thirty"
          ? 30
          : w[2] === "fifteen"
            ? 15
            : w[2] === "forty five"
              ? 45
              : 0;
      mer = w[3];
    }
  }
  if (/half past/.test(t)) mm = 30;
  if (h === undefined) return {};
  let h24 = h;
  if (mer === "pm" && h < 12) h24 = h + 12;
  else if (mer === "am" && h === 12) h24 = 0;
  else if (!mer && h < 9) h24 = h + 12; // shop hours 9-7
  const min = h24 * 60 + mm;
  const pool = wantTomorrow
    ? slots.filter((s) => s.dayLabel === "tomorrow")
    : slots;
  const exact =
    pool.find((s) => s.minutes === min) ??
    (wantTomorrow ? undefined : slots.find((s) => s.minutes === min));
  return exact ? { slot: exact } : { asked: fmtTime(min) };
}

export function findName(text: string): string | undefined {
  const m = text.match(
    /\b(?:i'?m|i am|my name is|name'?s|this is|it'?s|call me|put (?:it )?under)\s+([A-Za-z][a-zA-Z'-]{1,20})/i,
  );
  const bad =
    /^(good|calling|looking|trying|wondering|just|here|interested|not|a|the|so|gonna|going|ok|okay|fine|great|free|available|me)$/i;
  if (m && !bad.test(m[1])) return cap(m[1]);
  return undefined;
}

export function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function upper(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function makeRef(slot: Slot, name: string) {
  let h = 0;
  for (const c of slot.id + name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `CB-${(h % 9000) + 1000}`;
}

export function servicesLine() {
  return SHOP.services.map((s) => `${s.label} $${s.price}`).join(", ");
}

export function systemPrompt(slots: Slot[]) {
  const slotLines = slots
    .map((s) => `- ${s.id} = ${s.dayLabel} ${s.time} with ${s.barber}`)
    .join("\n");
  return `You are the AI front desk answering the phone for ${SHOP.name}, a FICTIONAL demo barbershop in Albany, NY (area code 518). The barbers are mid-cut, so you answer every call.

How you talk: like a friendly, relaxed front desk person on the phone. One or two short sentences per turn, under 35 words. Plain spoken English, no lists, no emoji, no markdown. Ask one thing at a time.

Your job: help the caller book. You need three things: the service, an open time from the list, and a first name. When you have all three, call book_appointment right away. Do not ask for a phone number; this demo texts the number they called from. After booking, confirm the day, time, barber and service in one sentence and say they'll get a text confirmation.

Shop facts (use only these; if asked anything else, say you'll have the barber confirm):
- Services and prices: ${servicesLine()}.
- Barbers: ${SHOP.barbers.join(" and ")}.
- Hours: ${SHOP.hours}.
- ${SHOP.walkIns}
- Payment: ${SHOP.payment}
- ${SHOP.cancellation}
- Location: ${SHOP.location}

Open times (everything else is booked). Offer at most three at a time, nearest first:
${slotLines || "- none: fully booked through tomorrow"}

Never invent other open times, prices, or facts. Never take card numbers. If someone wants a time that is not open, say it's taken and offer the nearest open ones.

If asked whether you are a real person or who made you: say you're an AI front desk demo built by Albany AI Guy, that's Chad Lenseth here in Albany, and any shop can try it free for 14 days at hello@albanyaiguy.com. Do not pitch unless asked. If the caller is clearly off topic, gently steer back to booking.`;
}
