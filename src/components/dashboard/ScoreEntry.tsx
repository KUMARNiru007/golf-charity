"use client";
import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { toast } from "sonner";
import { CalendarIcon, Save, Info } from "lucide-react";

export default function ScoreEntry({ userId, onScoreAdded }: { userId: string; onScoreAdded: () => void }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) return toast.error("Score must be between 1 and 45.");
    setLoading(true);
    try {
      const { error } = await supabase.from("scores").insert([{ user_id: userId, score: scoreNum, date }]);
      if (error) throw error;
      const { data: existing, error: fetchErr } = await supabase.from("scores").select("id").eq("user_id", userId)
        .order("date", { ascending: false }).order("created_at", { ascending: false });
      if (fetchErr) throw fetchErr;
      const toDelete = (existing ?? []).slice(5).map(r => r.id);
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("scores").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }
      toast.success("Score recorded!");
      setScore(""); onScoreAdded();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error saving score."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Enter New Score</CardTitle>
            <CardDescription>Record your latest round. Only your last 5 scores are kept.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="score">Stableford Score (1–45)</Label>
                  <Input id="score" type="number" min="1" max="45" placeholder="e.g. 36"
                    className="bg-zinc-900/50 border-white/5 h-12 text-lg" value={score} onChange={e => setScore(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Round Date</Label>
                  <div className="relative">
                    <Input id="date" type="date" className="bg-zinc-900/50 border-white/5 h-12 pl-10"
                      value={date} onChange={e => setDate(e.target.value)} required />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              </div>
              <Button type="submit" variant="neon" className="w-full h-12 text-base rounded-xl" disabled={loading}>
                {loading ? "Saving…" : <><Save className="mr-2 h-5 w-5" />Record Score</>}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3">
          <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-400 text-sm mb-1">Stableford Format</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">Points are awarded based on your score at each hole relative to par. Typical amateur scores range from 20–40 points. Your last 5 scores determine draw eligibility.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}