import { isAllowedZip } from "@/lib/territory";

export type BountyStatus = "open" | "paid" | "clawed_back";

export type Scout = {
  id: string;
  name: string;
  code: string;
  verifiedZip: string;
  createdAt: number;
};

export type Referral = {
  id: string;
  code: string;
  referrerId: string;
  zip: string;
  status: BountyStatus;
  amount: number;
  stripePayoutId?: string;
  createdAt: number;
};

/**
 * Menghasilkan unique, unguessable scout code: 518-PREFIX-RANDOM
 */
export function generateScoutCode(prefix = "518"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

export type RecordReferralResult =
  | { success: true; referral: Referral }
  | { success: false; reason: "INVALID_ZIP" | "SELF_REFERRAL" | "DUPLICATE" };

/**
 * Validasi dan record referral sesuai kriteria penerimaan Issue #11
 */
export function validateAndCreateReferral(
  code: string,
  zip: string,
  scout: Scout,
  existingReferrals: Referral[]
): RecordReferralResult {
  // 1. Territory validation: Hanya untuk ZIP 518/838 yang valid
  if (!isAllowedZip(zip)) {
    return { success: false, reason: "INVALID_ZIP" };
  }

  // 2. Reject self-referral: scout tidak boleh me-refer ke ZIP miliknya sendiri
  if (scout.verifiedZip === zip) {
    return { success: false, reason: "SELF_REFERRAL" };
  }

  // 3. Reject duplicate: ZIP yang sama tidak boleh di-refer ulang dengan code yang sama
  const isDuplicate = existingReferrals.some(
    (r) => r.code === code && r.zip === zip
  );
  if (isDuplicate) {
    return { success: false, reason: "DUPLICATE" };
  }

  const referral: Referral = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code,
    referrerId: scout.id,
    zip,
    status: "open",
    amount: 150, // Standard scout referral bounty
    createdAt: Date.now(),
  };

  return { success: true, referral };
}

/**
 * Mock Stripe Connect test-mode payout flow (open -> paid -> clawed_back)
 */
export function processStripeConnectPayout(
  referral: Referral,
  action: "payout" | "clawback"
): Referral {
  if (action === "payout" && referral.status === "open") {
    return {
      ...referral,
      status: "paid",
      stripePayoutId: `po_test_${Date.now()}`,
    };
  }
  if (action === "clawback" && referral.status === "paid") {
    return {
      ...referral,
      status: "clawed_back",
    };
  }
  return referral;
}
