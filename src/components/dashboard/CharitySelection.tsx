"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Charity, UserProfile } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "motion/react";

export default function CharitySelection({ profile }: { profile: UserProfile | null }) {
  const { refreshProfile } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [pct, setPct] = useState(profile?.charity_percentage ?? 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("charities").select("*").order("featured", { ascending: false })
      .then(({ data }) => { if (data) setCharities(data); });
  }, []);

  const select = async (charityId: string) => {
    if (!profile) return;
    if (pct < 10) return toast.error("Minimum contribution is 10%.");
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ charity_id: charityId, charity_percentage: pct }).eq("id", profile.id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    await refreshProfile();
    toast.success("Charity preference saved!");
    setLoading(false);
  };

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold mb-1">Select Your Charity</h2>
          <p className="text-zinc-500 text-sm">Choose where your subscription contribution goes (minimum 10%).</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Search charities…" className="pl-10 bg-zinc-900/50 border-white/5" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="font-display text-base">Your Contribution Percentage</CardTitle>
          <CardDescription>Minimum 10% of your subscription fee goes to your chosen charity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input type="number" min={10} max={100} value={pct}
              onChange={e => setPct(Math.max(10, Math.min(100, Number(e.target.value || 10))))}
              className="max-w-30 bg-zinc-900/50 border-white/5 text-center text-xl font-mono font-bold" />
            <span className="text-zinc-400 font-mono">% of subscription</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c, i) => {
          const selected = profile?.charity_id === c.id;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className={`glass-card overflow-hidden transition-all ${selected ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-white/5 hover:border-white/20"}`}>
                <div className="h-40 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image_url || `https://picsum.photos/seed/${c.id}/400/200`} alt={c.name} className="w-full h-full object-cover opacity-60" />
                  {selected && <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="h-4 w-4 text-zinc-950" /></div>}
                  {c.featured && <span className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-full">Featured</span>}
                </div>
                <CardHeader>
                  <CardTitle className="font-display text-base">{c.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{c.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => select(c.id)} disabled={loading || selected}
                    className={`w-full text-sm ${selected ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"}`}>
                    {selected ? "Currently Selected" : "Select This Charity"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}