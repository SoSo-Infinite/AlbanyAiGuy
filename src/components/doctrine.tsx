"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PILLARS = [
  {
    title: "Territory over scale",
    body: "We do not serve 212, 716, or the open internet. The product is worse if it has to sound like everywhere. 518/838 is the constraint that makes the engines sharp.",
  },
  {
    title: "Execution over prompts",
    body: "You get a running system in fourteen days — intake, calendar, or bounty desk — not a slide about ‘AI transformation.’ If it cannot take a late-night lead, it is not deployed.",
  },
  {
    title: "Local gravity",
    body: "Copy, routing, and calendars are written for Colonie contractors, Troy creators, Saratoga operators. Generic US-SMB prompts do not survive the gate.",
  },
  {
    title: "Operator, not agency",
    body: "One person who lives here. No account managers in Austin. The console is yours at day 14; the overlay stays ours to defend.",
  },
];

const FAQ = [
  {
    q: "Why only 518 / 838?",
    a: "Because local infrastructure only works if the operator actually knows the dirt. Albany AI Guy is a Capital Region desk, not a national wrapper. The ZIP gate is the product.",
  },
  {
    q: "What happens in the 14-day staging window?",
    a: "Day 1 allocates a node and arms the engine you picked. Mid-window you get playbooks, capture, or a calendar. Day 14 is handoff — the stack stays on, the staging label comes off.",
  },
  {
    q: "Do I need to know AI?",
    a: "No. You need a ZIP inside the overlay and a track. The engines are already built. You operate them; you do not prompt them from scratch.",
  },
  {
    q: "What if I only have an idea?",
    a: "That’s the incubator. Comic, YouTube, indie game, newsletter, podcast, music — a 30-day publishing lock, not a brainstorm.",
  },
  {
    q: "How do scouts get paid?",
    a: "Mint a code, route a neighbor. $40 per Service Shield activation, $20 per incubator start, $10 per secondary scout. The bounty desk is in the console.",
  },
];

export function Doctrine() {
  return (
    <section id="doctrine" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">Operating doctrine</p>
        <h2 className="mt-2 font-display text-headline">The Capital Region does not need another chatbot</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          It needs an operator of record. These are the rules the desk runs on — the same rules
          that keep the gate closed to everyone else.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <article key={p.title} className="rounded-xl border border-border bg-card p-6">
              <p className="font-mono text-micro uppercase text-faint">0{i + 1}</p>
              <h3 className="mt-2 font-display text-title">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 max-w-3xl">
          <h3 className="font-display text-title">Questions the desk actually gets</h3>
          <Accordion type="single" collapsible className="mt-4">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
