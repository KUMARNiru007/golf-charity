"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, TrendingUp, Calendar, PlusCircle, Trophy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/AuthProvider";
import { Charity, GolfScore } from "../../types";
import ParticipationSummary from "../../components/dashboard/ParticipationSummary";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);

  useEffect(() => { if (user) fetchScores(); }, [user]);
  useEffect(() => {
    if (profile?.charity_id) fetchCharity(profile.charity_id);
    else setSelectedCharity(null);
  }, [profile?.charity_id]);

  const fetchScores = async () => {
    if (!user) return;
    const { data } = await supabase.from("scores").select("*").eq("user_id", user.id)
      .order("date", { ascending: false }).limit(5);
    if (data) setScores(data);
  };

  const fetchCharity = async (id: string) => {
    const { data, error } = await supabase.from("charities").select("*").eq("id", id).maybeSingle();
    if (error) { toast.error("Could not load charity."); return; }
    setSelectedCharity(data ?? null);
  };

  if (!user) return null;
  const avg = scores.length > 0
    ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)
    : null;

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Avg Score", value: avg ?? "—", sub: `Last ${scores.length} rounds`, color: "text-emerald-400" },
          { label: "Charity Share", value: `${profile?.charity_percentage ?? 10}%`, sub: "Of subscription fee", color: "text-blue-400" },
          { label: "Plan", value: profile?.subscription_tier ?? "None", sub: profile?.renewal_date ? `Renews ${new Date(profile.renewal_date).toLocaleDateString("en-US")}` : "No active plan", color: "text-zinc-200" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-white/5">
              <CardContent className="pt-5">
                <div className="text-sm text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-3xl font-mono font-bold capitalize ${s.color}`}>{String(s.value)}</div>
                <div className="text-xs text-zinc-600 mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-white/5 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Performance</CardTitle>
              <CardDescription>Your last {scores.length} Stableford scores</CardDescription>
            </div>
            <Link
              href="/dashboard/scores"
              className="inline-flex items-center gap-1 text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <PlusCircle className="h-4 w-4" /> Add Score
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scores.length > 0 ? scores.map((score, i) => (
                <motion.div key={score.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
                      {score.score}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Stableford Round</div>
                      <div className="text-xs text-zinc-500 font-mono">
                        {new Date(score.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500/40" />
                </motion.div>
              )) : (
                <div className="text-center py-12 text-zinc-500">
                  <Trophy className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                  <p className="italic mb-4">No scores entered yet.</p>
                  <Link
                    href="/dashboard/scores"
                    className="inline-flex items-center gap-1 text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Enter your first score
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-rose-400" /> Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Charity</div>
                <div className="font-semibold text-sm">{selectedCharity?.name ?? "No charity selected"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Contribution</div>
                <div className="font-bold text-lg text-emerald-400 font-mono">{profile?.charity_percentage ?? 10}%</div>
              </div>
              <Link
                href="/dashboard/charity"
                className="inline-flex items-center justify-center w-full border border-white/10 hover:bg-white/5 text-sm px-3 py-2 rounded-lg transition-all text-zinc-300"
              >
                {selectedCharity ? "Change Charity" : "Select Charity"}
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-blue-400" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Status</div>
                <div className="font-semibold capitalize text-sm">{profile?.subscription_status ?? "Inactive"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Renewal</div>
                <div className="font-mono text-sm">
                  {profile?.renewal_date ? new Date(profile.renewal_date).toLocaleDateString("en-US") : "N/A"}
                </div>
              </div>
              <Button
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm"
                onClick={() => toast.info("Billing portal coming soon.")}
              >
                Manage Billing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ParticipationSummary userId={user.id} />
    </div>
  );
}