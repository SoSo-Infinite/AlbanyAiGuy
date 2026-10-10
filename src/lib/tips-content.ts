/**
 * /tips: free, copy-and-paste AI prompts. Plain tips anyone can use today with a free assistant
 * (ChatGPT, Grok, Gemini, Claude). No sign-up on this site, nothing stored, nothing sold.
 * Every prompt was written to be safe to paste as-is; anything with a legal/medical angle says
 * "not advice" and points to the right professional.
 */
export type Tip = {
  id: string;
  title: string;
  forWho: "For anyone" | "For shop owners";
  why: string;
  prompt: string;
  note?: string;
};

export const TIPS: Tip[] = [
  {
    id: "call-prep",
    title: "Prep any phone call in 30 seconds",
    forWho: "For anyone",
    why: "Doctor’s office, insurance, the cable company, a landlord. You go in with a plan and hang up with the answer instead of a callback.",
    prompt:
      "Be my call-prep helper. Ask me who I’m calling and what the problem is. Then give me a 30-second script of exactly what to say, and the 3 questions I should ask so I don’t have to call back. Keep it short and plain.",
  },
  {
    id: "missed-call-text",
    title: "Write the text that goes out when you miss a call",
    forWho: "For shop owners",
    why: "Most people who hit voicemail call the next shop. A quick text back keeps them. Your phone carrier or booking app can usually send it automatically.",
    prompt:
      "I own a [type of business] in Albany, NY. Write 3 versions of a short text message (under 160 characters) that goes out automatically when I miss a call. It should say who we are, that we saw the call, and give one easy next step (reply with what you need, or a booking link). Friendly, no emojis, no pressure.",
  },
  {
    id: "voicemail",
    title: "Fix your voicemail greeting",
    forWho: "For shop owners",
    why: "A greeting that tells people what to leave (name, number, what they need, best time) gets you messages you can actually act on.",
    prompt:
      "Write a 20-second voicemail greeting for my [type of business] in [town]. Include our hours, ask the caller to leave their name, number, what they need and the best time to call back, and mention one faster option (text this number, or book at [website]). Sound like a real person, not a robot.",
  },
  {
    id: "reviews-to-faq",
    title: "Turn your reviews into answers",
    forWho: "For shop owners",
    why: "Your customers already wrote your FAQ. Paste in reviews (yours or a competitor’s) and find out what people actually care about.",
    prompt:
      "Here are some customer reviews for a [type of business]. List the 5 things customers mention most (good or bad), then write a short FAQ answer for each that I could put on my website or say on the phone. Don’t invent facts about my business; leave a blank where you need my details.\n\n[paste reviews here]",
  },
  {
    id: "plain-english",
    title: "Read the fine print in plain English",
    forWho: "For anyone",
    why: "A lease clause, a warranty, a bill you don’t understand. Get the plain version and the questions to ask before you sign or pay.",
    prompt:
      "Explain this in plain English, like you’re talking to a friend. Then list anything that could cost me money or lock me in, and 3 questions I should ask before I agree. I know this isn’t legal advice.\n\n[paste the text here]",
    note: "Not legal advice. For anything big, ask a lawyer, or see if you qualify for free help from the Legal Aid Society of Northeastern New York (lasnny.org).",
  },
  {
    id: "hours-check",
    title: "Make sure your hours match everywhere",
    forWho: "For shop owners",
    why: "Wrong hours on Google is the fastest way to lose a walk-in. Do a two-minute check once a month.",
    prompt:
      "Make me a 5-minute monthly checklist to make sure my business hours, phone number and address are the same on Google, my website, Facebook, Yelp and Apple Maps. Include where to click on each one to fix it, and what to update before holidays.",
  },
];

export const TIPS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free AI tips from the Albany AI Guy",
  url: "https://albanyaiguy.com/tips",
  itemListElement: TIPS.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.title,
    url: `https://albanyaiguy.com/tips#${t.id}`,
  })),
};

/** Opens ChatGPT with the prompt typed in (the visitor still taps send). */
export function chatgptHref(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
