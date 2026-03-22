"use client";
import * as React from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../../components/AuthProvider";

const PLANS = {
  monthly: { name: "Monthly", price: "$9.99", period: "/month", features: ["Full score tracking","Monthly prize draws","Charity contributions","Cancel anytime"] },
  yearly:  { name: "Yearly",  price: "$95.88", period: "/year",  badge: "Save 20%", features: ["Everything in Monthly","2 months free","Priority draw entry","Yearly impact report"] },
} as const;

export default function SubscribePage() {
  const params = useSearchParams();
  const [selected, setSelected] = useState<"monthly"|"yearly">((params.get("plan") as "monthly"|"yearly") ?? "monthly");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (!user) { toast.error("Please sign in first."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>
      <div className="max-w-4xl w-full relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Choose Your Plan</h1>
          <p className="text-zinc-400">Every subscription supports a charity you care about.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
            <motion.button key={key} onClick={() => setSelected(key)} whileHover={{ y: -3 }}
              className={`glass-card p-8 text-left transition-all cursor-pointer w-full ${selected === key ? "border-emerald-500/50 ring-1 ring-emerald-500/30" : "border-white/5 hover:border-white/20"}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{plan.name}</div>
                  <div className="text-4xl font-display font-bold">{plan.price}<span className="text-lg text-zinc-500 font-normal">{plan.period}</span></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {"badge" in plan && <span className="bg-emerald-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected === key ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"}`}>
                    {selected === key && <Check className="h-3 w-3 text-zinc-950" />}
                  </div>
                </div>
              </div>
              <ul className="space-y-2 mt-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>
        <div className="text-center">
          {user ? (
            <Button onClick={handleSubscribe} disabled={loading} variant="neon" size="lg" className="h-14 px-16 text-base rounded-full">
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Redirecting…</> : `Subscribe — ${PLANS[selected].price}${PLANS[selected].period}`}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-400">You need an account to subscribe.</p>
              <Button asChild variant="neon" size="lg" className="h-14 px-16 text-base rounded-full">
                <Link href="/auth">Create Account or Sign In</Link>
              </Button>
            </div>
          )}
          <p className="text-xs text-zinc-600 mt-4">Secure payments via Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}