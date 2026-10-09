import { CALL_LINE, CALL_LINE_LIVE } from "@/lib/call-line";

const SITE = "https://albanyaiguy.com";
const PAGE_URL = `${SITE}${CALL_LINE.path}`;

/** Copy source: albany-ai-guy/trunk-line/launch-drafts (HOW-IT-WORKS-ONE-PAGER.md, DEMO-SCRIPT-60S.md). */

export const CALLER_STEPS = [
  {
    t: `Call ${CALL_LINE.vanity}`,
    d: "A friendly AI voice answers right away, day or night, and tells you up front that it's an AI.",
  },
  {
    t: "Say what you need",
    d: "Plain words work: “my furnace died,” “I need a fade at 4,” “a plumber for a leak.”",
  },
  {
    t: "It picks a good local shop",
    d: "It only recommends Albany-area places rated 4 stars or better on Google.",
  },
  {
    t: "It sends your request",
    d: "If the shop is on the line, it takes your first name, number, and the time you want, reads it all back, and sends it to the shop.",
  },
  {
    t: "The shop confirms",
    d: "It's a request until the shop taps Confirm. Leave an email and you'll get the confirmation. No app, no hold music.",
  },
] as const;

export const SHOP_TYPES = [
  "Barbers",
  "Salons",
  "Plumbers",
  "Heating & HVAC",
  "Electricians",
  "Mechanics",
  "Cleaners",
  "Locksmiths",
] as const;

export const BUSINESS_POINTS = [
  {
    t: "Join the directory",
    d: "Tell us your hours, your services, and, if you want, the open times you'd like offered today.",
  },
  {
    t: "Free during the pilot",
    d: "Albany shops that join during the pilot pay nothing.",
  },
  {
    t: "No paid ranking",
    d: "Nobody can pay to be recommended first. The line goes by Google rating and who has an opening.",
  },
  {
    t: "One tap to answer",
    d: "Each request arrives as a text-style alert (Telegram or email) with two buttons: Confirm or Can't do it.",
  },
] as const;

export const NEVER_DOES = [
  "Pretend to be a person.",
  "Say “booked” before the shop confirms.",
  "Give a caller's details to a shop that hasn't signed up.",
  "Handle emergencies.",
  "Take payments.",
] as const;

export const CALL_FAQ = [
  {
    q: "Is the line live?",
    a: CALL_LINE_LIVE
      ? `Yes. Call ${CALL_LINE.vanity} (${CALL_LINE.digits}) any time.`
      : `Not yet. ${CALL_LINE.vanity} is the planned number and it isn't connected, so please don't dial it yet. Email ${CALL_LINE.email} and you'll hear when it goes live.`,
  },
  {
    q: "Am I talking to a real person?",
    a: "No. The line is an AI assistant and says so at the start of every call. A real local shop gets your request and calls you back.",
  },
  {
    q: "Does it cost callers anything?",
    a: "No. We don't charge callers. Your phone plan's normal calling rates apply.",
  },
  {
    q: "Is my appointment booked when I hang up?",
    a: "Not yet. It's a request until the shop taps Confirm. If you leave an email, you'll get the confirmation, and the shop calls you to lock it in.",
  },
  {
    q: "Are calls recorded?",
    a: "No. Call audio isn't recorded. Speech is turned into text in the moment so the line can understand you. If you make a request, only your first name, number, the time you want, and an optional email are saved and sent to the shop you chose.",
  },
  {
    q: "Can a business pay to be recommended first?",
    a: "No. There is no paid ranking. The line recommends shops rated 4 stars or better on Google that have an opening.",
  },
  {
    q: "My shop isn't signed up. Can the line still mention it?",
    a: "Yes. It can mention you with your Google rating and read out your public phone number so the caller calls you directly. Signing up lets the line send you the job instead.",
  },
  {
    q: "Where does it work?",
    a: "Albany and the Capital Region: Schenectady, Troy, Saratoga Springs, and the towns around them.",
  },
  {
    q: "What about emergencies?",
    a: "The line doesn't handle them. For a fire, a medical emergency, or a gas smell, leave if it's unsafe and call 911.",
  },
] as const;

const serviceNode: Record<string, unknown> = {
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: CALL_LINE_LIVE
    ? `Albany AI Guy Line (${CALL_LINE.vanity})`
    : "Albany AI Guy Line (coming soon)",
  serviceType: "Phone concierge for local shop requests",
  description: CALL_LINE_LIVE
    ? "Call one local number, say what you need, and an AI assistant finds a 4-star-or-better Albany-area shop and sends it your request."
    : "Planned: one local number where an AI assistant finds a 4-star-or-better Albany-area shop and sends it your request. Not live yet.",
  url: PAGE_URL,
  provider: { "@id": `${SITE}/#org` },
  areaServed: [
    {
      "@type": "City",
      name: "Albany",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "New York",
      },
    },
    { "@type": "AdministrativeArea", name: "Albany County, NY" },
    { "@type": "AdministrativeArea", name: "Schenectady County, NY" },
    { "@type": "AdministrativeArea", name: "Rensselaer County, NY" },
    { "@type": "AdministrativeArea", name: "Saratoga County, NY" },
  ],
  audience: { "@type": "Audience", audienceType: "Albany-area residents" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free for callers.",
    ...(CALL_LINE_LIVE ? {} : { availability: "https://schema.org/PreOrder" }),
  },
  // Only publish the number to machines once it is actually live.
  ...(CALL_LINE_LIVE
    ? {
        availableChannel: {
          "@type": "ServiceChannel",
          servicePhone: {
            "@type": "ContactPoint",
            telephone: CALL_LINE.e164,
            contactType: "customer service",
            areaServed: "US-NY",
            availableLanguage: "English",
          },
        },
      }
    : {}),
};

export const CALL_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#page`,
      url: PAGE_URL,
      name: `${CALL_LINE.tagline} The Albany AI Guy Line`,
      isPartOf: { "@id": `${SITE}/#site` },
      about: { "@id": `${PAGE_URL}#service` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "The line",
          item: PAGE_URL,
        },
      ],
    },
    serviceNode,
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: CALL_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};
