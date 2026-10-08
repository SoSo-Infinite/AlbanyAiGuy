/** Homepage FAQ — the visible text and the FAQPage JSON-LD both come from this list. */
export const HOME_FAQ = [
  {
    q: "Is Albany AI Guy live yet?",
    a: "Not yet. The trunk-line phone number and the shop phone receptionist are coming soon. A working web demo of the AI front desk (a fictional barbershop) is live at albanyaiguy.com/shop-line, and I'm lining up a small pilot with Albany-area shops now.",
  },
  {
    q: "What does the AI voice receptionist do for a shop?",
    a: "It answers the shop phone when you can't — mid-cut, on a job, after hours — talks to the caller like a front desk would, books the appointment or takes a callback request, and sends the owner a short summary. It can always hand off to a real person.",
  },
  {
    q: "What is the Albany trunk line?",
    a: "One local number for the Capital Region. You call, say what you need (a haircut, a heating repair, a plumber), and the line finds a qualifying local shop and books it or asks the shop to call you back. Bookings only go to shops that have opted in.",
  },
  {
    q: "Which areas does it cover?",
    a: "Albany, Schenectady, Rensselaer, and Saratoga counties first, then the wider 518 by request.",
  },
  {
    q: "How do I join the pilot?",
    a: "Email hello@albanyaiguy.com with your shop's name, what kind of business it is, and your town. I'll reply personally.",
  },
  {
    q: "Is it for emergencies?",
    a: "No. For medical, fire, or police emergencies call 911. If you smell gas, leave first, then call 911 or your gas utility's emergency line.",
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
