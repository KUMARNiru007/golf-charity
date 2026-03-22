"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../components/AuthProvider";

export default function SubscribeSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await refreshProfile();
      setReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  const sessionId = params.get("session_id");
  if (!sessionId) { router.replace("/"); return null; }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/8 blur-[120px] rounded-full" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-emerald-400" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4">You're In!</h1>
        <p className="text-zinc-400 text-lg mb-2">Your subscription is now active.</p>
        <p className="text-zinc-500 text-sm mb-10">Head to your dashboard to enter scores, pick a charity, and check upcoming draws.</p>
        {ready ? (
          <Button asChild variant="neon" size="lg" className="rounded-full px-10">
            <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        ) : (
          <Button disabled variant="neon" size="lg" className="rounded-full px-10">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting up your account…
          </Button>
        )}
      </motion.div>
    </div>
  );
}