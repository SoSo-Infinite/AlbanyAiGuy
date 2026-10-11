export const SHOP_HANDOFF =
  "This is the fictional Chairside Barber Co. front desk. Nothing on this call books a real appointment or sends a text. What can I do for you?";

export type ShopMsg = { role: "user" | "assistant"; content: string };

export type ShopRequest = {
  messages: ShopMsg[];
  taken: string[];
};

export type ShopBooking = {
  name: string;
  service: string;
  dayLabel: string;
  time: string;
  barber: string;
  ref: string;
  slotId: string;
};

export function formatBookingSummary(booking: ShopBooking): string {
  const day =
    booking.dayLabel === "today"
      ? "Today"
      : booking.dayLabel === "tomorrow"
        ? "Tomorrow"
        : booking.dayLabel;
  return `Demo summary: ${booking.name}, ${booking.service}, ${day} ${booking.time} with ${booking.barber}. Ref ${booking.ref}. Not a real appointment, and no text is sent.`;
}

export function bookingFromApi(value: unknown): ShopBooking | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const slot = record.slot;
  if (!slot || typeof slot !== "object") return null;
  const timeSlot = slot as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "";
  const service = typeof record.service === "string" ? record.service : "";
  const ref = typeof record.ref === "string" ? record.ref : "";
  const dayLabel =
    typeof timeSlot.dayLabel === "string" ? timeSlot.dayLabel : "";
  const time = typeof timeSlot.time === "string" ? timeSlot.time : "";
  const barber = typeof timeSlot.barber === "string" ? timeSlot.barber : "";
  const slotId = typeof timeSlot.id === "string" ? timeSlot.id : "";
  if (!name || !service || !time || !slotId) return null;
  return { name, service, dayLabel, time, barber, ref, slotId };
}
