import { generateText, stepCountIs, tool } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { type Msg, ruleReply } from "@/lib/shop-line/engine";
import {
  type Booking,
  makeRef,
  openSlots,
  SHOP,
  systemPrompt,
} from "@/lib/shop-line/shop";

export const runtime = "nodejs";
export const maxDuration = 20;

const MODEL = process.env.SHOP_LINE_MODEL || "openai/gpt-4.1-mini";

// Light per-instance limiter so one visitor can't burn the demo budget.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 10 * 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > 60;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    messages?: unknown;
    taken?: unknown;
  };
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant"),
    )
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, 400),
    }))
    .slice(-24);
  const taken = Array.isArray(body.taken)
    ? body.taken.map(String).slice(0, 20)
    : [];
  const slots = openSlots(new Date(), taken);

  if (!messages.length || messages.at(-1)?.role !== "user") {
    return NextResponse.json(
      { ok: false, error: "Say something to the shop first." },
      { status: 400 },
    );
  }
  const userTurns = messages.filter((m) => m.role === "user").length;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  if (userTurns <= 16 && !limited(ip)) {
    try {
      let booking: Booking | undefined;
      const result = await generateText({
        model: MODEL,
        system: systemPrompt(slots),
        messages,
        maxOutputTokens: 180,
        temperature: 0.5,
        timeout: 12_000,
        stopWhen: stepCountIs(3),
        tools: {
          book_appointment: tool({
            description:
              "Book the caller into one of the open times. Only call when you have service, open slot id and first name.",
            inputSchema: z.object({
              slot_id: z
                .string()
                .describe(
                  "Exact id from the open times list, e.g. 2026-10-08T1:30PM",
                ),
              service: z.enum(
                SHOP.services.map((s) => s.label) as [string, ...string[]],
              ),
              first_name: z.string().min(1).max(30),
            }),
            execute: async ({ slot_id, service, first_name }) => {
              const slot = slots.find((s) => s.id === slot_id);
              if (!slot)
                return {
                  ok: false,
                  error: "That time is not open. Offer the open times instead.",
                };
              const svc =
                SHOP.services.find((s) => s.label === service) ??
                SHOP.services[0];
              const name = first_name.trim().split(/\s+/)[0];
              booking = {
                name,
                service: svc.label,
                price: svc.price,
                slot,
                ref: makeRef(slot, name),
              };
              return {
                ok: true,
                day: slot.dayLabel,
                time: slot.time,
                barber: slot.barber,
                ref: booking.ref,
              };
            },
          }),
        },
      });
      const reply = result.text.trim();
      if (reply)
        return NextResponse.json({
          ok: true,
          engine: "ai",
          reply,
          booking,
          slots,
        });
    } catch (err) {
      console.error("shop-line ai error", (err as Error)?.message);
    }
  }

  const { reply, booking } = ruleReply(messages, slots);
  return NextResponse.json({
    ok: true,
    engine: "basic",
    reply,
    booking,
    slots,
  });
}

export async function GET() {
  const slots = openSlots();
  return NextResponse.json({ ok: true, shop: SHOP.name, slots });
}
