export const TRACKS = [
  {
    id: "service" as const,
    label: "Local Service Shield",
    kicker: "Existing business",
    summary: "After-hours capture, late-night reply, and a 518-tuned intake for contractors and brick-and-mortar operators.",
  },
  {
    id: "creator" as const,
    label: "Idea-to-Launch Incubator",
    kicker: "Art, media, games",
    summary: "A 30-day publishing engine: calendar, asset scripts, and product structure for Capital Region creators.",
  },
  {
    id: "scout" as const,
    label: "518 Bounty Engine",
    kicker: "No business required",
    summary: "Mint a local scout link, route neighbors into staging, and collect payouts on every activated node.",
  },
];

export type TrackId = (typeof TRACKS)[number]["id"];

export const SERVICE_INDUSTRIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Wellness / spa",
  "Dental",
  "Legal",
  "Auto / collision",
  "Restaurant",
  "Real estate",
  "Insurance",
  "Home services (other)",
] as const;

export const CREATOR_NICHES = [
  "Comic / illustration",
  "YouTube / short video",
  "Indie game",
  "Newsletter / writing",
  "Podcast",
  "Music / audio",
] as const;

export function industriesFor(track: TrackId): readonly string[] {
  if (track === "service") return SERVICE_INDUSTRIES;
  if (track === "creator") return CREATOR_NICHES;
  return ["Neighbor businesses", "Creator network", "Mixed 518 territory"];
}
