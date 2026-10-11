/**
 * /privacy collects statements already published elsewhere on the site.
 * Each item names the page it comes from. Add nothing here that isn't
 * already said on that page.
 */
export const PRIVACY_ITEMS = [
  {
    id: "call-line",
    title: "The call line (coming soon)",
    source: "/call#privacy",
    points: [
      "Calls aren't recorded. Call audio isn't saved. Speech is turned into text in the moment so the line can understand you.",
      "If you make a request, your first name, number, the time you want, and an optional email go to the shop you chose. Nothing goes to shops that haven't signed up.",
      "Every call starts by saying you're talking to an AI assistant. It never pretends to be a person.",
      "Before launch, the call page will say exactly how long request details are kept.",
    ],
  },
  {
    id: "demos",
    title: "Try it demos",
    source: "/try",
    points: [
      "Four demos. No sign-up, and nothing is stored.",
      "In the 518 Shop Line demo, the shop is made up and texts are shown, not sent. Voice uses your browser's mic and speech recognition. The page doesn't save what you say.",
    ],
  },
  {
    id: "tips",
    title: "Free AI tips",
    source: "/tips",
    points: [
      "No sign-up here, and the tips page doesn't save anything you do.",
    ],
  },
  {
    id: "contact",
    title: "Contact form",
    source: "/contact",
    points: [
      "The contact form opens a draft in your own email app, addressed to hello@albanyaiguy.com. I read every message myself.",
    ],
  },
] as const;
