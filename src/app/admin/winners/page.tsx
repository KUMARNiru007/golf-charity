"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Winner } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { CheckCircle, XCircle, Banknote, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../../lib/utils";

interface WinnerRow extends Winner {
  profiles?: { email: string; full_name: string | null } | null;
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Winner["status"] | "all">("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("winners").select("*, profiles(email, full_name)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setWinners((data ?? []) as WinnerRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: Winner["status"]) => {
    setUpdating(id);
    const { error } = await supabase.from("winners").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); setUpdating(null); return; }
    toast.success(`Marked as ${status}.`);
    load(); setUpdating(null);
  };

  const statusColors: Record<string, string> = {
    pending: "border-yellow-500/30 text-yellow-400", verified: "border-blue-500/30 text-blue-400",
    paid: "border-emerald-500/30 text-emerald-400", rejected: "border-red-500/30 text-red-400",
  };
  const matchColors: Record<string, string> = { "5-match": "text-yellow-400", "4-match": "text-blue-400", "3-match": "text-emerald-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-display font-bold mb-1">Winner Verification</h1><p className="text-zinc-500 text-sm">Review proofs and manage payouts.</p></div>
        <Button variant="ghost" size="sm" onClick={load} className="text-zinc-400 hover:text-white gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all","pending","verified","paid","rejected"] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${filter === t ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-zinc-500 border border-white/10 hover:border-white/20 hover:text-zinc-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <Card className="glass-card border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Winner</TableHead><TableHead>Match</TableHead><TableHead>Prize</TableHead>
                <TableHead>Proof</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-zinc-500">Loading…</TableCell></TableRow>
              : winners.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-zinc-500 italic">No winners in this category.</TableCell></TableRow>
              : winners.map(w => (
                <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="text-sm font-medium">{w.profiles?.full_name ?? "Unknown"}</div>
                    <div className="text-xs text-zinc-500 font-mono">{w.profiles?.email ?? "—"}</div>
                  </TableCell>
                  <TableCell><span className={`font-mono text-sm font-bold ${matchColors[w.match_type] ?? ""}`}>{w.match_type}</span></TableCell>
                  <TableCell className="font-mono text-sm text-emerald-400">{formatCurrency(w.prize_amount)}</TableCell>
                  <TableCell>
                    {w.proof_url ? <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">View <ExternalLink className="h-3 w-3" /></a>
                    : <span className="text-xs text-zinc-600 italic">Not submitted</span>}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-zinc-500">{formatDate(w.created_at)}</TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize text-xs ${statusColors[w.status] ?? ""}`}>{w.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {w.status === "pending" && w.proof_url && <Button size="sm" onClick={() => updateStatus(w.id, "verified")} disabled={updating === w.id} className="h-7 px-2.5 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 gap-1"><CheckCircle className="h-3 w-3" />Verify</Button>}
                      {w.status === "verified" && <Button size="sm" onClick={() => updateStatus(w.id, "paid")} disabled={updating === w.id} className="h-7 px-2.5 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1"><Banknote className="h-3 w-3" />Mark Paid</Button>}
                      {(w.status === "pending" || w.status === "verified") && <Button size="sm" onClick={() => updateStatus(w.id, "rejected")} disabled={updating === w.id} className="h-7 px-2.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 gap-1"><XCircle className="h-3 w-3" />Reject</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}