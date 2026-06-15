export type PlanId = "FREE" | "PRO" | "PREMIUM";
export type UserType = "CLIENTE" | "PROFISSIONAL";

export const CLIENT_PLAN_LIMITS: Record<PlanId, { maxOpenServices: number }> = {
  FREE: { maxOpenServices: 3 },
  PRO: { maxOpenServices: 10 },
  PREMIUM: { maxOpenServices: 999 },
};

export const PROFESSIONAL_PLAN_LIMITS: Record<PlanId, { maxDailyContacts: number }> = {
  FREE: { maxDailyContacts: 3 },
  PRO: { maxDailyContacts: 10 },
  PREMIUM: { maxDailyContacts: 999 },
};

export const PLAN_PRICES: Record<PlanId, number> = {
  FREE: 0,
  PRO: 59.99,
  PREMIUM: 129.99,
};

export function getStripePriceId(
  userType: UserType,
  plan: PlanId,
): string | undefined {
  if (plan === "FREE") return undefined;
  const envKey =
    userType === "CLIENTE"
      ? plan === "PRO"
        ? "STRIPE_PRICE_CLIENT_PRO"
        : "STRIPE_PRICE_CLIENT_PREMIUM"
      : plan === "PRO"
        ? "STRIPE_PRICE_PRO_PRO"
        : "STRIPE_PRICE_PRO_PREMIUM";
  return process.env[envKey];
}

export function planFromStripePriceId(priceId: string): PlanId | null {
  const mapping: Record<string, PlanId> = {};
  const entries = [
    ["STRIPE_PRICE_CLIENT_PRO", "PRO"],
    ["STRIPE_PRICE_CLIENT_PREMIUM", "PREMIUM"],
    ["STRIPE_PRICE_PRO_PRO", "PRO"],
    ["STRIPE_PRICE_PRO_PREMIUM", "PREMIUM"],
  ] as const;
  for (const [envKey, plan] of entries) {
    const id = process.env[envKey];
    if (id) mapping[id] = plan;
  }
  return mapping[priceId] ?? null;
}
