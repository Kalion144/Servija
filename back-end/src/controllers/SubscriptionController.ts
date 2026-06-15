import type { Request, Response } from "express";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { stripe, isStripeConfigured } from "../lib/stripe.js";
import {
  type PlanId,
  type UserType,
  getStripePriceId,
  planFromStripePriceId,
} from "../lib/plans.js";
import {
  getClientLimits,
  getProfessionalLimits,
  upsertSubscription,
} from "../services/subscriptionService.js";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

function resolveUserType(req: Request): UserType {
  const fromQuery = req.query.userType as UserType | undefined;
  if (fromQuery === "CLIENTE" || fromQuery === "PROFISSIONAL") {
    return fromQuery;
  }
  return req.user!.userType as UserType;
}

export class SubscriptionController {
  static async status(req: Request, res: Response) {
    const user = req.user!;
    const userType = resolveUserType(req);

    try {
      if (userType === "CLIENTE") {
        const limits = await getClientLimits(user.userId);
        return res.json({ userType, ...limits });
      }

      const limits = await getProfessionalLimits(user.userId);
      return res.json({ userType, ...limits });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao obter status da assinatura" });
    }
  }

  static async createCheckout(req: Request, res: Response) {
    const user = req.user!;
    const { plan } = req.body as { plan?: PlanId };
    const userType = (req.body.userType as UserType) ?? user.userType;

    if (!plan || plan === "FREE") {
      return res.status(400).json({ erro: "Plano inválido para assinatura" });
    }

    if (!isStripeConfigured() || !stripe) {
      return res.status(503).json({
        erro: "Stripe não configurado. Defina STRIPE_SECRET_KEY e os price IDs no .env",
      });
    }

    const priceId = getStripePriceId(userType, plan);
    if (!priceId) {
      return res.status(400).json({
        erro: `Price ID do Stripe não configurado para o plano ${plan}`,
      });
    }

    try {
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.userId));

      if (!userData) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const basePath =
        userType === "CLIENTE" ? "/client" : "/professional";

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${FRONTEND_URL}${basePath}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}${basePath}/home`,
        customer_email: userData.email,
        metadata: {
          userId: String(user.userId),
          userType,
          plan,
        },
        subscription_data: {
          metadata: {
            userId: String(user.userId),
            userType,
            plan,
          },
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao criar sessão de checkout" });
    }
  }

  static async confirmSession(req: Request, res: Response) {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ erro: "session_id é obrigatório" });
    }

    if (!stripe) {
      return res.status(503).json({ erro: "Stripe não configurado" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid" && session.status !== "complete") {
        return res.status(400).json({ erro: "Pagamento não confirmado" });
      }

      const userId = Number(session.metadata?.userId);
      const userType = session.metadata?.userType as UserType;
      const plan = (session.metadata?.plan as PlanId) ?? "PRO";

      if (!userId || !userType) {
        return res.status(400).json({ erro: "Metadados da sessão inválidos" });
      }

      await upsertSubscription({
        userId,
        userType,
        plan,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: "active",
      });

      const limits =
        userType === "CLIENTE"
          ? await getClientLimits(userId)
          : await getProfessionalLimits(userId);

      res.json({
        mensagem: "Assinatura confirmada com sucesso",
        userType,
        ...limits,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao confirmar assinatura" });
    }
  }

  static async webhook(req: Request, res: Response) {
    if (!stripe) {
      return res.status(503).send("Stripe não configurado");
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).send("Webhook não configurado");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        webhookSecret,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send("Invalid signature");
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = Number(session.metadata?.userId);
          const userType = session.metadata?.userType as UserType;
          const plan = (session.metadata?.plan as PlanId) ?? "PRO";

          if (userId && userType) {
            await upsertSubscription({
              userId,
              userType,
              plan,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: "active",
            });
          }
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = Number(subscription.metadata?.userId);
          const userType = subscription.metadata?.userType as UserType;
          const priceId = subscription.items.data[0]?.price?.id;
          const planFromMeta = subscription.metadata?.plan as PlanId | undefined;
          const plan =
            planFromMeta ??
            (priceId ? planFromStripePriceId(priceId) : null) ??
            "FREE";

          if (!userId || !userType) break;

          const status =
            subscription.status === "active" || subscription.status === "trialing"
              ? subscription.status
              : "canceled";

          const activePlan =
            status === "active" || status === "trialing" ? plan : "FREE";

          await upsertSubscription({
            userId,
            userType,
            plan: activePlan,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          });
          break;
        }

        default:
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handler error:", error);
      res.status(500).json({ erro: "Erro no webhook" });
    }
  }
}
