import { db } from "../db/connection.js";
import {
  subscriptions,
  professionalServices,
  conversations,
  users,
} from "../db/schema.js";
import { eq, and, count, gte } from "drizzle-orm";
import {
  type PlanId,
  type UserType,
  CLIENT_PLAN_LIMITS,
  PROFESSIONAL_PLAN_LIMITS,
} from "../lib/plans.js";

export async function getUserPlan(
  userId: number,
  userType: UserType,
): Promise<PlanId> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.user_id, userId),
        eq(subscriptions.user_type, userType),
      ),
    );

  if (
    sub &&
    sub.status === "active" &&
    (sub.plan === "PRO" || sub.plan === "PREMIUM")
  ) {
    return sub.plan;
  }
  return "FREE";
}

export async function getClientOpenServicesCount(clientId: number): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(professionalServices)
    .where(
      and(
        eq(professionalServices.client_id, clientId),
        eq(professionalServices.status, "PENDENTE"),
      ),
    );
  return result.count;
}

export async function getProfessionalDailyContactsCount(
  professionalId: number,
): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(conversations)
    .where(
      and(
        eq(conversations.professional_id, professionalId),
        gte(conversations.created_at, startOfDay),
      ),
    );
  return result.count;
}

export async function getClientLimits(userId: number) {
  const plan = await getUserPlan(userId, "CLIENTE");
  const maxOpenServices = CLIENT_PLAN_LIMITS[plan].maxOpenServices;
  const currentOpenServices = await getClientOpenServicesCount(userId);

  return {
    plan,
    maxOpenServices,
    currentOpenServices,
    canCreateMore: currentOpenServices < maxOpenServices,
  };
}

export async function getProfessionalLimits(userId: number) {
  const plan = await getUserPlan(userId, "PROFISSIONAL");
  const maxDailyContacts = PROFESSIONAL_PLAN_LIMITS[plan].maxDailyContacts;
  const currentDailyContacts = await getProfessionalDailyContactsCount(userId);

  return {
    plan,
    maxDailyContacts,
    currentDailyContacts,
    canContactMore: currentDailyContacts < maxDailyContacts,
  };
}

export async function upsertSubscription(data: {
  userId: number;
  userType: UserType;
  plan: PlanId;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd?: Date | null;
}) {
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.user_id, data.userId),
        eq(subscriptions.user_type, data.userType),
      ),
    );

  const values = {
    plan: data.plan,
    stripe_customer_id: data.stripeCustomerId ?? existing?.stripe_customer_id,
    stripe_subscription_id:
      data.stripeSubscriptionId ?? existing?.stripe_subscription_id,
    status: data.status ?? "active",
    current_period_end: data.currentPeriodEnd ?? null,
    updated_at: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set(values)
      .where(eq(subscriptions.id, existing.id))
      .returning();
    await syncVerifiedBadge(data.userId, data.userType, data.plan, data.status);
    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      user_id: data.userId,
      user_type: data.userType,
      ...values,
    })
    .returning();
  await syncVerifiedBadge(data.userId, data.userType, data.plan, data.status);
  return created;
}

async function syncVerifiedBadge(
  userId: number,
  userType: UserType,
  plan: PlanId,
  status?: string,
) {
  if (userType !== "PROFISSIONAL") return;
  const isVerified = (plan === "PRO" || plan === "PREMIUM") && status !== "canceled";
  await db.update(users).set({ verified: isVerified ? 1 : 0 }).where(eq(users.id, userId));
}
