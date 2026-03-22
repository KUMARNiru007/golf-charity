"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Trophy, CalendarClock, Upload } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Draw, Winner } from "../../../types";
import { useAuth } from "../../../components/AuthProvider";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../../lib/utils";

export default function DrawsPage() {
  const { user } = useAuth();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: drawData }, { data: winData }] = await Promise.all([
        supabase.from("draws").select("*").order("draw_date", { ascending: false }).limit(12),
        user ? supabase.from("winners").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
              : Promise.resolve({ data: [] as Winner[] }),
      ]);
      setDraws(drawData ?? []);
      setWinnings(winData ?? []);
    };
    load();
  }, [user]);

  const nextDraw = draws.find(d => new Date(d.draw_date) >= new Date());

  const submitProof = async (winnerId: string) => {
    const url = proofUrls[winnerId]?.trim();
    if (!url) return toast.error("Please paste a proof URL first.");
    setSubmitting(winnerId);
    const { error } = await supabase.from("winners").update({ proof_url: url, status: "pending" }).eq("id", winnerId);
    if (error) { toast.error(error.message); setSubmitting(null); return; }
    toast.success("Proof submitted for review.");
    setProofUrls(p => ({ ...p, [winnerId]: "" }));
    const { data } = await supabase.from("winners").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
    setWinnings(data ?? []);
    setSubmitting(null);
  };

  const statusColor: Record<string, string> = {
    pending: "border-yellow-500/40 text-yellow-400", verified: "border-blue-500/40 text-blue-400",
    paid: "border-emerald-500/40 text-emerald-400", rejected: "border-red-500/40 text-red-400",
    published: "border-emerald-500/40 text-emerald-400", simulated: "border-blue-500/40 text-blue-400",
  };

  return (
    <div className="space-y-8">
      <Card className="glass-card border-white/5 bg-linear-to-r from-blue-500/5 to-emerald-500/5">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <CalendarClock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Next Prize Draw</div>
              <div className="text-2xl font-display font-bold">{nextDraw ? formatDate(nextDraw.draw_date) : "No draw scheduled yet"}</div>
              {nextDraw && <div className="text-sm text-zinc-500 mt-0.5">Prize pool: <span className="text-emerald-400 font-mono">{formatCurrency(nextDraw.total_prize_pool)}</span></div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "5-Number Match", share: "40%", color: "text-yellow-400", note: "Jackpot — rolls over" },
          { label: "4-Number Match", share: "35%", color: "text-blue-400",   note: "Split among winners" },
          { label: "3-Number Match", share: "25%", color: "text-emerald-400", note: "Split among winners" },
        ].map(t => (
          <Card key={t.label} className="glass-card border-white/5">
            <CardContent className="pt-5">
                <div className={`text-2xl font-mono font-bold ${t.color}`}>{t.share}</div>
              <div className="font-medium text-sm mt-1">{t.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Trophy className="h-5 w-5 text-blue-400" /> Recent Draw Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Date</TableHead><TableHead>Winning Numbers</TableHead><TableHead>Prize Pool</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draws.length > 0 ? draws.map(draw => (
                <TableRow key={draw.id} className="border-white/5 hover:bg-white/2">
                  <TableCell className="font-mono text-sm">{formatDate(draw.draw_date)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {(draw.winning_numbers ?? []).map((n, i) => (
                        <span key={i} className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-mono text-emerald-400">{n}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(draw.total_prize_pool)}</TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize text-xs ${statusColor[draw.status] ?? ""}`}>{draw.status}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-500 italic">No draws yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="font-display">My Winnings</CardTitle>
          <CardDescription>Submit proof of your scores to claim prizes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Match</TableHead><TableHead>Prize</TableHead><TableHead>Proof URL</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winnings.length > 0 ? winnings.map(w => (
                <TableRow key={w.id} className="border-white/5 hover:bg-white/2">
                  <TableCell><span className={`font-mono text-sm font-bold ${w.match_type === "5-match" ? "text-yellow-400" : w.match_type === "4-match" ? "text-blue-400" : "text-emerald-400"}`}>{w.match_type}</span></TableCell>
                  <TableCell className="font-mono text-sm text-emerald-400">{formatCurrency(w.prize_amount)}</TableCell>
                  <TableCell>
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">View proof ↗</a>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Input placeholder="Paste screenshot URL…" value={proofUrls[w.id] ?? ""}
                          onChange={e => setProofUrls(p => ({ ...p, [w.id]: e.target.value }))}
                          className="h-8 text-xs bg-zinc-900/50 border-white/5 w-48" />
                        <Button size="sm" onClick={() => submitProof(w.id)} disabled={submitting === w.id}
                          className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 h-8 px-3">
                          <Upload className="h-3.5 w-3.5 mr-1" />{submitting === w.id ? "…" : "Submit"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize text-xs ${statusColor[w.status] ?? ""}`}>{w.status}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-500 italic">No winnings yet — keep playing!</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}