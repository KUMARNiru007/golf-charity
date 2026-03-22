"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Draw } from "../../../types";
import { generateRandomNumbers, generateAlgorithmicNumbers, calculatePrizes } from "../../../lib/draw-engine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Eye, CheckCircle, RefreshCw, Zap, Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../../lib/utils";

type DrawMode = "random" | "algorithmic";

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DrawMode>("random");
  const [prizePool, setPrizePool] = useState("1000");
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split("T")[0]);
  const [simResult, setSimResult] = useState<number[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("draws").select("*").order("draw_date", { ascending: false }).limit(20);
    setDraws(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const simulate = async () => {
    if (mode === "algorithmic") {
      const { data: scoreRows } = await supabase.from("scores").select("score");
      const scores = (scoreRows ?? []).map(r => r.score as number);
      setSimResult(generateAlgorithmicNumbers(scores));
    } else {
      setSimResult(generateRandomNumbers());
    }
    toast.info("Numbers simulated — review before publishing.");
  };

  const createDraw = async () => {
    if (!simResult) return toast.error("Simulate first.");
    const pool = parseFloat(prizePool);
    if (isNaN(pool) || pool <= 0) return toast.error("Enter a valid prize pool.");
    setCreating(true);
    const { error } = await supabase.from("draws").insert({
      draw_date: new Date(drawDate).toISOString(), winning_numbers: simResult,
      status: "simulated", total_prize_pool: pool,
    });
    if (error) { toast.error(error.message); setCreating(false); return; }
    toast.success("Draw saved as simulated.");
    setSimResult(null); load(); setCreating(false);
  };

  const publishDraw = async (drawId: string) => {
    setPublishing(drawId);
    const { error } = await supabase.from("draws").update({ status: "published" }).eq("id", drawId);
    if (error) { toast.error(error.message); setPublishing(null); return; }
    toast.success("Draw published!");
    load(); setPublishing(null);
  };

  const prizes = simResult ? calculatePrizes(parseFloat(prizePool) || 0) : null;
  const statusColors: Record<string, string> = {
    pending: "border-zinc-500/30 text-zinc-400", simulated: "border-blue-500/30 text-blue-400", published: "border-emerald-500/30 text-emerald-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-1">Draw Management</h1>
        <p className="text-zinc-500 text-sm">Configure, simulate, and publish monthly prize draws.</p>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-400" />Create New Draw</CardTitle>
          <CardDescription>Simulate numbers then publish when ready.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {(["random", "algorithmic"] as DrawMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`p-4 rounded-xl border text-left transition-all ${mode === m ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-zinc-400 hover:border-white/20"}`}>
                <div className="font-medium capitalize text-sm">{m}</div>
                <div className="text-xs text-zinc-500 mt-1">{m === "random" ? "Standard lottery-style — all numbers equally likely." : "Weighted by user score frequency."}</div>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prize Pool ($)</Label><Input type="number" min="1" value={prizePool} onChange={e => setPrizePool(e.target.value)} className="bg-zinc-900/50 border-white/5" /></div>
            <div className="space-y-2"><Label>Draw Date</Label><Input type="date" value={drawDate} onChange={e => setDrawDate(e.target.value)} className="bg-zinc-900/50 border-white/5" /></div>
          </div>
          <Button onClick={simulate} variant="outline" className="border-white/10 gap-2"><Play className="h-4 w-4" />Simulate Numbers</Button>
          {simResult && (
            <div className="p-5 rounded-xl bg-white/2 border border-white/10 space-y-4">
              <div className="text-sm text-zinc-400 font-medium">Simulated Winning Numbers</div>
              <div className="flex gap-3 flex-wrap">
                {simResult.map((n, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">{n}</div>
                ))}
              </div>
              {prizes && (
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "5-Match", amount: prizes.fiveMatch, color: "text-yellow-400" }, { label: "4-Match", amount: prizes.fourMatch, color: "text-blue-400" }, { label: "3-Match", amount: prizes.threeMatch, color: "text-emerald-400" }].map(p => (
                    <div key={p.label} className="text-center p-3 rounded-xl bg-white/2 border border-white/5">
                      <div className={`text-lg font-mono font-bold ${p.color}`}>{formatCurrency(p.amount)}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{p.label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={createDraw} disabled={creating} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 gap-2">
                  <CheckCircle className="h-4 w-4" />{creating ? "Saving…" : "Save as Simulated"}
                </Button>
                <Button onClick={simulate} variant="ghost" className="text-zinc-400 gap-2"><RefreshCw className="h-4 w-4" />Re-simulate</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5">
        <CardHeader><CardTitle className="font-display flex items-center gap-2"><Trophy className="h-5 w-5 text-blue-400" />All Draws</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Date</TableHead><TableHead>Numbers</TableHead><TableHead>Prize Pool</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} className="text-center py-10 text-zinc-500">Loading…</TableCell></TableRow>
              : draws.map(draw => (
                <TableRow key={draw.id} className="border-white/5 hover:bg-white/2">
                  <TableCell className="font-mono text-sm">{formatDate(draw.draw_date)}</TableCell>
                  <TableCell><div className="flex gap-1.5 flex-wrap">{(draw.winning_numbers ?? []).map((n, i) => <span key={i} className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-mono text-emerald-400">{n}</span>)}</div></TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(draw.total_prize_pool)}</TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize text-xs ${statusColors[draw.status] ?? ""}`}>{draw.status}</Badge></TableCell>
                  <TableCell>{draw.status === "simulated" && <Button size="sm" onClick={() => publishDraw(draw.id)} disabled={publishing === draw.id} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 h-7 px-3 text-xs gap-1"><Eye className="h-3.5 w-3.5" />{publishing === draw.id ? "…" : "Publish"}</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}