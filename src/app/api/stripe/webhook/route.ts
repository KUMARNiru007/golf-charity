import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Verification failed." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "monthly" | "yearly";
      if (!userId || !plan) break;
      const renewal = new Date();
      renewal.setMonth(renewal.getMonth() + (plan === "yearly" ? 12 : 1));
      await supabaseAdmin.from("profiles").update({
        subscription_status: "active", subscription_tier: plan,
        renewal_date: renewal.toISOString(),
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      }).eq("id", userId);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin.from("profiles").update({ subscription_status: "lapsed", subscription_tier: null, renewal_date: null }).eq("stripe_subscription_id", sub.id);
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.subscription) await supabaseAdmin.from("profiles").update({ subscription_status: "lapsed" }).eq("stripe_subscription_id", inv.subscription as string);
      break;
    }
    case "invoice.payment_succeeded": {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.subscription) {
        const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
        await supabaseAdmin.from("profiles").update({ subscription_status: "active", renewal_date: new Date(sub.current_period_end * 1000).toISOString() }).eq("stripe_subscription_id", inv.subscription as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}