/**
 * Spoken numbers for the missed-call voice demo.
 * "twelve", "12", "30 percent", and "$150" all become a finite number.
 */

const ONES: Record<string, number> = {
  zero: 0,
  oh: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  a: 1,
  an: 1,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function isNumToken(token: string): boolean {
  return (
    token in ONES ||
    token in TENS ||
    token === "hundred" ||
    token === "thousand" ||
    token === "and"
  );
}

function parseTokens(tokens: string[]): number | null {
  if (tokens.length === 0) return null;
  if (
    tokens.every((token) => token === "a" || token === "an" || token === "and")
  ) {
    return null;
  }
  let total = 0;
  let current = 0;
  let seen = false;
  for (const token of tokens) {
    if (token === "and") continue;
    if (token in ONES) {
      current += ONES[token] ?? 0;
      seen = true;
      continue;
    }
    if (token in TENS) {
      current += TENS[token] ?? 0;
      seen = true;
      continue;
    }
    if (token === "hundred") {
      current = (current === 0 ? 1 : current) * 100;
      seen = true;
      continue;
    }
    if (token === "thousand") {
      total += (current === 0 ? 1 : current) * 1000;
      current = 0;
      seen = true;
      continue;
    }
    return null;
  }
  if (!seen) return null;
  return total + current;
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/\$/g, " ")
    .replace(/%/g, " ")
    .replace(/\bpercent\b/g, " ")
    .replace(/\bdollars?\b/g, " ")
    .replace(/\bbucks\b/g, " ")
    .replace(/,/g, "")
    .replace(/[^a-z0-9.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First number in the phrase, or null when there isn't one. */
export function parseSpokenNumber(input: string): number | null {
  const cleaned = normalize(input);
  if (!cleaned) return null;
  const direct = cleaned.match(/^-?\d+(?:\.\d+)?$/);
  if (direct) return Number(direct[0]);

  const tokens = cleaned.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
    if (!isNumToken(token)) continue;
    let best: number | null = null;
    for (let j = i + 1; j <= tokens.length; j++) {
      const slice = tokens.slice(i, j);
      if (!slice.every((part) => isNumToken(part))) break;
      const value = parseTokens(slice);
      if (value != null) best = value;
    }
    if (best != null) return best;
  }
  return null;
}

/** Numeric string estimateMissedCalls can parse, or null. */
export function spokenNumberToRaw(input: string): string | null {
  const value = parseSpokenNumber(input);
  if (value == null || !Number.isFinite(value)) return null;
  if (Object.is(value, -0)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(8).replace(/\.?0+$/, "");
}
