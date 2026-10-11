/** Homepage FAQ — the visible text and the FAQPage JSON-LD both come from this list. */
export const HOME_FAQ = [
  {
    q: "Which areas does it cover?",
    a: "Albany, Schenectady, Rensselaer, and Saratoga counties first, then the wider 518 by request.",
  },
] as const;

export const HOME_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
