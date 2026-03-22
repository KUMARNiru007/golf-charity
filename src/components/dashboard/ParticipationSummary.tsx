"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Trophy, History, CalendarClock } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";

export default function ParticipationSummary({ userId }: { userId: string }) {
  const [stats, setStats] = useState({ winCount: 0, totalWinnings: 0, nextDrawDate: "", latestStatus: "—" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: winCount }, { data: winData }, { data: nextDraw }] = await Promise.all([
        supabase.from("winners").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("winners").select("prize_amount, status").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("draws").select("draw_date").gte("draw_date", new Date().toISOString()).order("draw_date", { ascending: true }).limit(1).maybeSingle(),
      ]);
      const totalWinnings = (winData ?? []).reduce((s, w) => s + Number(w.prize_amount ?? 0), 0);
      setStats({ winCount: winCount ?? 0, totalWinnings, nextDrawDate: nextDraw?.draw_date ?? "", latestStatus: (winData ?? [])[0]?.status ?? "—" });
      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <div>
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="font-display text-lg">Participation Summary</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: <History className="h-6 w-6 text-emerald-400" />, bg: "bg-emerald-500/10", label: "Winning Entries", value: loading ? "—" : String(stats.winCount) },
          { icon: <Trophy className="h-6 w-6 text-blue-400" />, bg: "bg-blue-500/10", label: "Total Winnings", value: loading ? "—" : formatCurrency(stats.totalWinnings) },
          { icon: <CalendarClock className="h-6 w-6 text-amber-400" />, bg: "bg-amber-500/10", label: "Next Draw", value: loading ? "—" : (stats.nextDrawDate ? formatDate(stats.nextDrawDate) : "TBD"), badge: stats.latestStatus !== "—" ? stats.latestStatus : null },
        ].map(s => (
          <Card key={s.label} className="glass-card border-white/5">
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
                <div>
                  <div className="text-xs text-zinc-500 mb-0.5">{s.label}</div>
                  <div className="text-2xl font-display font-bold font-mono">{s.value}</div>
                  {s.badge && <Badge variant="outline" className="mt-1 text-xs capitalize border-zinc-600 text-zinc-400">{s.badge}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}