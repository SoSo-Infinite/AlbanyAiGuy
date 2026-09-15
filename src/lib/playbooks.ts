import type { TrackId } from "@/lib/industries";

export type ChatTurn = { from: "lead" | "shield"; text: string };

const SEED: Record<string, ChatTurn[]> = {
  HVAC: [
    {
      from: "lead",
      text: "Furnace is blowing cold in Delmar. Can someone come tonight?",
    },
    {
      from: "shield",
      text: "Logged as after-hours, Delmar / 12054. No-heat is priority. A tech confirms a window by 7:30am. If pipes are at risk or you have no heat and temps are dropping, reply HOT and we escalate now.",
    },
  ],
  Plumbing: [
    {
      from: "lead",
      text: "Pipe burst in the basement in Troy. Water still running.",
    },
    {
      from: "shield",
      text: "Collar City node has this. Shut the main if you can — usually street-side or cellar wall. I’m flagging this as emergency. On-call confirms in minutes. Photo of the leak helps if it’s safe.",
    },
  ],
  default: [
    {
      from: "lead",
      text: "Hey — are you open? Need this handled before morning.",
    },
    {
      from: "shield",
      text: "We’re on it. This inquiry is captured, time-stamped, and sitting on the operator desk — not lost in a voicemail from 11pm. You’ll get a confirm window first thing.",
    },
  ],
};

export function seedThread(industry: string): ChatTurn[] {
  return SEED[industry] ?? SEED.default;
}

export function draftReply(industry: string, message: string, city: string, zip: string): string {
  const text = message.toLowerCase();
  const where = `${city} / ${zip}`;
  if (/(no heat|furnace|boiler|cold air)/.test(text)) {
    return `After-hours ${industry} desk, ${where}. Flagged no-heat. A tech confirms a morning window; reply HOT if occupancy is unsafe tonight.`;
  }
  if (/(leak|burst|flood|water)/.test(text)) {
    return `Emergency plumbing path armed for ${where}. Shutoff first if reachable. On-call is pinged — keep your line open.`;
  }
  if (/(quote|estimate|how much|price)/.test(text)) {
    return `Estimate request parked on the ${industry} board for ${where}. You’ll get a same-morning range, not a form letter. Address + a photo tightens it.`;
  }
  if (/(tomorrow|today|available|appointment|book)/.test(text)) {
    return `Scheduling ${industry} in ${where}. Two windows will come back at open. If this is urgent, say so in one word and we bump the queue.`;
  }
  return `Captured for the ${industry} operator covering ${where}. This is a 518 Service Shield reply — logged, routed, and waiting on the desk at open. Add a photo or street if you have it.`;
}

export type CalendarDay = {
  day: number;
  week: number;
  title: string;
  asset: string;
};

const NICHE_WEEKS: Record<string, [string, string, string, string]> = {
  "Comic / illustration": [
    "Character bible + 4-panel world",
    "Serial pages and process posts",
    "Print shop / Distro test",
    "Drop a paid mini and a waitlist",
  ],
  "YouTube / short video": [
    "Hook library and 518-local series bible",
    "Batch-film 8 shorts, one long",
    "Distribution: shorts, newsletter, collab",
    "Offer a productized edit or membership",
  ],
  "Indie game": [
    "Vertical slice scope and feel doc",
    "Playable loop + 3 rooms",
    "Build page, footage, itch draft",
    "Closed playtest with Capital Region circle",
  ],
  "Newsletter / writing": [
    "Positioning, reader, 12-issue map",
    "Four issues drafted, one live",
    "Local guest + paid tier sketch",
    "Issue 5 + a simple paid drop",
  ],
  "Podcast": [
    "Show format, 8-guest Capital Region list",
    "Record 3, edit 1, trailer",
    "Publish + clip engine",
    "Sponsor one-sheet and episode 4",
  ],
  "Music / audio": [
    "Project identity and 3-track outline",
    "Record / arrange two pieces",
    "Visuals, Bandcamp, local date",
    "Release one track with a 518 show ask",
  ],
};

const DAY_VERBS = [
  "Lock the one-line promise",
  "Write the audience in one paragraph",
  "Ship a tiny public artifact",
  "Collect 5 local references",
  "Batch the week’s raw material",
  "Edit for 20 minutes, then stop",
  "Publish, then log what moved",
];

export function thirtyDayPlan(niche: string): CalendarDay[] {
  const weeks = NICHE_WEEKS[niche] ?? NICHE_WEEKS["YouTube / short video"];
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const week = Math.min(4, Math.ceil(day / 7.5));
    const theme = weeks[week - 1];
    const verb = DAY_VERBS[i % DAY_VERBS.length];
    return {
      day,
      week,
      title: `Day ${day} · ${verb}`,
      asset: theme,
    };
  });
}

export function mintScoutCode(zip: string, city: string): string {
  const city3 = city.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "518";
  const salt = zip.slice(-3);
  return `518-${city3}-${salt}`;
}

export const BOUNTIES = [
  { label: "Service Shield activation", amount: "$40" },
  { label: "Incubator start", amount: "$20" },
  { label: "Secondary scout", amount: "$10" },
] as const;

export const STAGING_BEATS: Record<TrackId, { day: string; item: string }[]> = {
  service: [
    { day: "Day 1", item: "Territory node allocated · intake live" },
    { day: "Day 2", item: "After-hours copy and routing rules" },
    { day: "Day 3", item: "Lead desk + SMS/web capture" },
    { day: "Day 5", item: "Industry playbook loaded" },
    { day: "Day 8", item: "First-week review, missed-call audit" },
    { day: "Day 14", item: "Handoff: you own the stack" },
  ],
  creator: [
    { day: "Day 1", item: "Niche lock + 30-day calendar" },
    { day: "Day 2", item: "Asset scripts for week 1" },
    { day: "Day 4", item: "Channel kit (bio, covers, CTA)" },
    { day: "Day 7", item: "First public artifact shipped" },
    { day: "Day 10", item: "Distribution paths (local + digital)" },
    { day: "Day 14", item: "Product/paid experiment queued" },
  ],
  scout: [
    { day: "Day 1", item: "Scout code minted for your ZIP" },
    { day: "Day 2", item: "Neighbor list + talk track" },
    { day: "Day 4", item: "First three referrals in staging" },
    { day: "Day 7", item: "Bounty desk live" },
    { day: "Day 10", item: "Second-degree scout invite" },
    { day: "Day 14", item: "Payout path confirmed" },
  ],
};
