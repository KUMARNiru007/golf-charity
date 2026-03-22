"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Users, Trophy, Heart, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscribers: 0, totalDraws: 0, totalWinningsPaid: 0, pendingWinners: 0, totalCharities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { count: totalUsers }, { count: activeSubscribers }, { count: totalDraws },
        { data: winData }, { count: pendingWinners }, { count: totalCharities },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
        supabase.from("draws").select("id", { count: "exact", head: true }),
        supabase.from("winners").select("prize_amount").eq("status", "paid"),
        supabase.from("winners").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("charities").select("id", { count: "exact", head: true }),
      ]);
      const totalWinningsPaid = (winData ?? []).reduce((s, w) => s + Number(w.prize_amount ?? 0), 0);
      setStats({ totalUsers: totalUsers ?? 0, activeSubscribers: activeSubscribers ?? 0, totalDraws: totalDraws ?? 0, totalWinningsPaid, pendingWinners: pendingWinners ?? 0, totalCharities: totalCharities ?? 0 });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Members",        value: stats.totalUsers,              icon: Users,     color: "text-blue-400",    bg: "bg-blue-500/10" },
    { label: "Active Subscribers",   value: stats.activeSubscribers,       icon: Activity,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Draws Run",       value: stats.totalDraws,              icon: Trophy,    color: "text-yellow-400",  bg: "bg-yellow-500/10" },
    { label: "Prizes Paid Out",       value: formatCurrency(stats.totalWinningsPaid), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending Verifications", value: stats.pendingWinners,         icon: Trophy,    color: "text-orange-400",  bg: "bg-orange-500/10" },
    { label: "Charity Partners",      value: stats.totalCharities,         icon: Heart,     color: "text-rose-400",    bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-1">Admin Overview</h1>
        <p className="text-zinc-500 text-sm">Platform-wide statistics at a glance.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="glass-card border-white/5 hover:border-white/15 transition-all">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <c.icon className={`h-6 w-6 ${c.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{c.label}</div>
                    <div className={`text-2xl font-display font-bold font-mono ${loading ? "text-zinc-700 animate-pulse" : c.color}`}>
                      {loading ? "—" : String(c.value)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card className="glass-card border-white/5">
        <CardHeader><CardTitle className="font-display text-base">Quick Links</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[{ label: "Manage Users", href: "/admin/users" }, { label: "Run a Draw", href: "/admin/draws" }, { label: "Verify Winners", href: "/admin/winners" }, { label: "Add Charity", href: "/admin/charities" }].map(l => (
            <Link key={l.href} href={l.href} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-all">
              {l.label} →
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}