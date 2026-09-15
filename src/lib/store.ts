import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackId } from "@/lib/industries";
import type { Referral, Scout } from "@/lib/bounty";

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
  scout: Scout | null;
  referrals: Referral[];
  verify: (session: Session) => void;
  setScout: (scout: Scout) => void;
  addReferral: (referral: Referral) => void;
  updateReferral: (id: string, updated: Partial<Referral>) => void;
  clear: () => void;
};

export const useAppSession = create<AppState>()(
  persist(
    (set) => ({
      session: null,
      scout: null,
      referrals: [
        {
          id: "ref_init_1",
          code: "518-ALBANY-1",
          referrerId: "scout_capitol",
          zip: "12207",
          status: "paid",
          amount: 150,
          stripePayoutId: "po_test_001",
          createdAt: Date.now() - 86400000 * 3,
        },
        {
          id: "ref_init_2",
          code: "518-TROY-8",
          referrerId: "scout_troy",
          zip: "12180",
          status: "open",
          amount: 150,
          createdAt: Date.now() - 86400000,
        },
      ],
      verify: (session) => set({ session }),
      setScout: (scout) => set({ scout }),
      addReferral: (referral) =>
        set((state) => ({ referrals: [referral, ...state.referrals] })),
      updateReferral: (id, updated) =>
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === id ? { ...r, ...updated } : r
          ),
        })),
      clear: () => set({ session: null }),
    }),
    { name: "albany-ai-guy-session" },
  ),
);

export function stagingDay(verifiedAt: number, now = Date.now()): number {
  const elapsed = Math.max(0, now - verifiedAt);
  return Math.min(14, Math.floor(elapsed / 86_400_000) + 1);
}
