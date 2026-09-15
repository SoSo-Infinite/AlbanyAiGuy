export type LedgerEvent = {
  id: string;
  zip: string;
  place: string;
  signal: string;
  engine: "shield" | "incubator" | "scout" | "node";
};

const EVENTS: Omit<LedgerEvent, "id">[] = [
  { zip: "12207", place: "Albany", signal: "node heartbeat · Capitol", engine: "node" },
  { zip: "12180", place: "Troy", signal: "after-hours lead captured", engine: "shield" },
  { zip: "12866", place: "Saratoga", signal: "week-2 calendar published", engine: "incubator" },
  { zip: "12305", place: "Schenectady", signal: "scout bounty cleared", engine: "scout" },
  { zip: "12065", place: "Clifton Park", signal: "intake form armed", engine: "shield" },
  { zip: "12110", place: "Latham", signal: "late-night HVAC inquiry routed", engine: "shield" },
  { zip: "12054", place: "Delmar", signal: "channel assets staged", engine: "incubator" },
  { zip: "12801", place: "Glens Falls", signal: "node heartbeat · The Queen", engine: "node" },
  { zip: "12534", place: "Hudson", signal: "Warren Street scout activated", engine: "scout" },
  { zip: "12309", place: "Niskayuna", signal: "research-park operator onboarded", engine: "shield" },
  { zip: "12020", place: "Malta", signal: "30-day publishing lock", engine: "incubator" },
  { zip: "12205", place: "Colonie", signal: "Wolf Road lead desk online", engine: "shield" },
  { zip: "12144", place: "Rensselaer", signal: "bath-side node allocated", engine: "node" },
  { zip: "12804", place: "Queensbury", signal: "aviation corridor ping", engine: "node" },
  { zip: "12901", place: "Plattsburgh", signal: "North Country overlay check", engine: "node" },
  { zip: "12414", place: "Catskill", signal: "creator incubator start", engine: "incubator" },
  { zip: "12047", place: "Cohoes", signal: "Harmony Mills scout mint", engine: "scout" },
  { zip: "12203", place: "Albany", signal: "uptown wellness intake live", engine: "shield" },
  { zip: "12189", place: "Watervliet", signal: "arsenal district heartbeat", engine: "node" },
  { zip: "12845", place: "Lake George", signal: "seasonal channel pack built", engine: "incubator" },
  { zip: "12010", place: "Amsterdam", signal: "Mohawk operator staged", engine: "shield" },
  { zip: "12302", place: "Scotia", signal: "Glenville bounty referred", engine: "scout" },
];

export const LEDGER_STATS = [
  { key: "mapped", value: 45280, label: "518 businesses mapped", suffix: "+" },
  { key: "systems", value: 142, label: "active local AI systems", suffix: "" },
  { key: "incubator", value: 389, label: "incubator starts", suffix: "" },
  { key: "scouts", value: 215, label: "active bounty scouts", suffix: "" },
] as const;

export function eventAt(index: number): LedgerEvent {
  const base = EVENTS[index % EVENTS.length];
  return { ...base, id: `${base.zip}-${index}` };
}

export function tickerCopy(): string[] {
  return EVENTS.map((e) => `${e.zip} ${e.place.toUpperCase()}  ·  ${e.signal}`);
}
