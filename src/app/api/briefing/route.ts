import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const input = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const track = str(input.track, 32);
  const zip = str(input.zip, 5);
  if (!track || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { ok: false as const, error: "A verified track and ZIP are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false as const,
      error: "Intelligence desk is offline until XAI_API_KEY is set on Vercel.",
    });
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.6,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are Albany AI Guy, operator of record for Capital Region (518/838, New York) AI infrastructure. You live in the territory: Albany, Colonie, Troy, Schenectady, Clifton Park, Saratoga Springs, Glens Falls, Hudson, Catskill, and the North Country overlay. Write like a precise local operator, not a Silicon Valley agency. No emoji. No invented real business names. No generic ChatGPT filler. Be specific to the ZIP, municipality, and track. Output markdown with short headings: Position, Days 1–3, Days 4–8, Days 9–14, First automations (3 bullets), Local notes. Keep it under 450 words.",
        },
        {
          role: "user",
          content: `Commission a 14-day staging brief.
Track: ${track}
Industry / niche: ${str(input.industry, 64) || "unspecified"}
ZIP: ${zip}
City: ${str(input.city, 64) || "Capital Region"}
County: ${str(input.county, 64) || "unknown"}
Operator notes: ${str(input.notes, 400) || "none"}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({
      ok: false as const,
      error: `Desk returned ${res.status}. Try again in a moment.`,
    });
  }

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ ok: false as const, error: "Empty brief. Retry once." });
  }
  return NextResponse.json({ ok: true as const, text });
}
