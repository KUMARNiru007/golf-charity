import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY)
  console.warn("[Stripe] STRIPE_SECRET_KEY is not set.");

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  monthly: { name: "Monthly", priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? "", amount: 999,  interval: "month" as const },
  yearly:  { name: "Yearly",  priceId: process.env.STRIPE_YEARLY_PRICE_ID  ?? "", amount: 9588, interval: "year"  as const },
} as const;

export type PlanKey = keyof typeof PLANS;