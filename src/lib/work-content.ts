/**
 * "Things I've built" (/work). Only real, checkable work: every "Live" item links to a page
 * that answered HTTP 200 on 2026-10-09, and every description matches what that page does.
 * No customer counts, no results, no testimonials. Update the status line when something changes.
 */
export type WorkItem = {
  id: string;
  name: string;
  status: "Live demo" | "Live, free" | "In private testing";
  href: string;
  external: boolean;
  linkLabel: string;
  what: string;
  shows: string;
  honest: string;
};

export const WORK: WorkItem[] = [
  {
    id: "shop-line",
    name: "518 Shop Line",
    status: "Live demo",
    href: "/shop-line",
    external: false,
    linkLabel: "Try the barbershop demo",
    what: "A pretend Albany barbershop’s front desk you can talk to in your browser. Ask for a haircut, pick a time, and watch the booking show up as a text to the owner.",
    shows:
      "The AI receptionist idea from start to finish: the phone rings mid-cut and the booking still happens.",
    honest:
      "The shop is fictional and the texts are shown on the page, not sent. No real phone line is involved.",
  },
  {
    id: "trunk-line",
    name: "The Albany trunk line (518-726-COOL)",
    status: "In private testing",
    href: "/call",
    external: false,
    linkLabel: "How a call will work",
    what: "One local number for the 518. You say what you need, and the line sends your request to a well-rated local shop that has opted in. The shop confirms or calls you back.",
    shows:
      "How I handle the hard parts before launch: it says it’s an AI at the start of every call, doesn’t record audio, sends emergencies to 911 and gives 988 to anyone who mentions self-harm.",
    honest:
      "The number isn’t connected yet. Every change runs against a large set of automated test calls first.",
  },
  {
    id: "helpgetup",
    name: "HelpGetUp",
    status: "Live, free",
    href: "https://helpgetup.com",
    external: true,
    linkLabel: "Open helpgetup.com",
    what: "A food-help guide for Albany County. Pick what you need, type a ZIP or neighborhood, and see pantries, community meals and produce stops open this week, each with the source it came from.",
    shows:
      "Plain steps for someone having a hard day, built for a phone, and data checked against public sources.",
    honest:
      "It never asks for an ID, a Social Security number or a benefits login, and it doesn’t call or fill out forms for anyone.",
  },
  {
    id: "live-well-go",
    name: "Live Well Go",
    status: "Live, free",
    href: "https://live-well-go.vercel.app",
    external: true,
    linkLabel: "Open the planner",
    what: "A planner for wellness appointments in the Capital Region. Type a town or ZIP, pick a goal and a budget, and get a suggested order for local appointments.",
    shows: "A small, fast tool that does one job on the spot.",
    honest:
      "It runs in your browser, and nothing you type leaves it unless you choose to email your plan. It isn’t medical advice; licensed providers make every clinical call.",
  },
  {
    id: "aerasell",
    name: "AeraSell store audit",
    status: "Live, free",
    href: "https://aerasell.com/audit",
    external: true,
    linkLabel: "Run a free audit",
    what: "Paste a product listing and get a score out of 100 with fixes for the title, clarity, shipping, returns, pricing and trust.",
    shows: "AI-assisted feedback a small seller can use right away.",
    honest: "No sign-up needed. An email address is optional.",
  },
];

export const HOW_I_BUILD = [
  {
    title: "It says it’s an AI",
    body: "Anything that talks to your customers says so up front.",
  },
  {
    title: "Safety first",
    body: "Emergencies go to 911. A line never tries to handle one itself.",
  },
  {
    title: "Nothing made up",
    body: "No fake reviews, customer counts or results on anything I put my name on.",
  },
  {
    title: "Your data stays put",
    body: "Tools collect only what they need, and say so in plain words.",
  },
  {
    title: "Tested before it ships",
    body: "Changes run against automated checks, and I try every page on a phone.",
  },
];

export const WORK_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Things I’ve built: Albany AI Guy",
  url: "https://albanyaiguy.com/work",
  about: { "@id": "https://albanyaiguy.com/#org" },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: WORK.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: w.name,
        url: w.external ? w.href : `https://albanyaiguy.com${w.href}`,
        description: w.what,
        creator: { "@type": "Person", name: "Chad Lenseth" },
      },
    })),
  },
};
