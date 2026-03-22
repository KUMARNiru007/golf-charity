import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, PlanKey } from "../../../lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json() as { plan: PlanKey; userId: string; email: string };
    if (!plan || !userId || !email) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    if (!selectedPlan.priceId) return NextResponse.json({ error: `Stripe price ID for "${plan}" not configured. Add STRIPE_${plan.toUpperCase()}_PRICE_ID to .env.local` }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe`,
      metadata: { userId, plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}