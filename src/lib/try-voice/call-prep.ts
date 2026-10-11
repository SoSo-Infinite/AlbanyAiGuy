export const PREP_QUESTIONS = {
  who: "Who are you calling?",
  problem: "What is the problem?",
} as const;

export type CallPrepCard = {
  script: string;
  questions: [string, string, string];
};

export function cleanCallField(raw: string): string {
  const text = raw.replace(/[<>]/g, " ").replace(/\s+/g, " ").trim();
  return Array.from(text)
    .slice(0, 80)
    .join("")
    .replace(/[.?!,\s]+$/u, "");
}

/**
 * Local 30-second script and exactly three questions.
 * This does not call anyone. It is a script the visitor can read.
 */
export function buildCallPrep(who: string, problem: string): CallPrepCard {
  const person = cleanCallField(who) || "the person you need";
  const issue = cleanCallField(problem) || "this problem";
  const script = `Hi, this is about ${issue}. I want to sort it out with ${person} in this conversation, and I want the next step before we hang up.`;
  const questions: [string, string, string] = [
    `What is going on with ${issue} right now?`,
    "What do you need from me to finish this in one conversation?",
    "What is the next step, and when will it be done?",
  ];
  return { script, questions };
}

export function speakCallPrep(card: CallPrepCard): string {
  return [
    "Here is a thirty-second script you can read.",
    card.script,
    "Three questions to ask:",
    card.questions[0],
    card.questions[1],
    card.questions[2],
  ].join(" ");
}
