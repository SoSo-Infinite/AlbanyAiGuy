import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackId } from "@/lib/industries";

export type Session = {
  zip: string;
  city: string;
  county: string;
  node: string;
  nodeId: string;
  track: TrackId;
  industry: string;
  verifiedAt: number;
};

type AppState = {
  session: Session | null;
  verify: (session: Session) => void;
  clear: () => void;
};

export const useAppSession = create<AppState>()(
  persist(
    (set) => ({
      session: null,
      verify: (session) => set({ session }),
      clear: () => set({ session: null }),
    }),
    { name: "albany-ai-guy-session" },
  ),
);

export function stagingDay(verifiedAt: number, now = Date.now()): number {
  const elapsed = Math.max(0, now - verifiedAt);
  return Math.min(14, Math.floor(elapsed / 86_400_000) + 1);
}
