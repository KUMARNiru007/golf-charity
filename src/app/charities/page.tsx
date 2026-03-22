"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { Charity } from "@/types";
import Link from "next/link";
import { Search, Heart, ArrowLeft, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("charities").select("*").order("featured", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Could not load charities.");
        if (data) setCharities(data);
        setLoading(false);
      });
  }, []);

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      <header className="py-20 px-6 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Our Charity Partners</h1>
          <p className="text-zinc-400 text-xl max-w-2xl">We partner with verified organisations making a real difference.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="glass-card p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input placeholder="Search charities…" className="pl-12 h-12 bg-zinc-900/50 border-white/5"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="glass-card h-80 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-2xl font-display font-bold mb-2">No charities found</h3>
            <p className="text-zinc-500">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((charity, i) => (
              <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card border-white/5 h-full flex flex-col overflow-hidden group hover:border-white/20 transition-all">
                  <div className="h-48 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={charity.image_url || `https://picsum.photos/seed/${charity.id}/600/400`}
                      alt={charity.name} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    {charity.featured && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-full uppercase">Featured</span>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-display text-xl group-hover:text-emerald-400 transition-colors">{charity.name}</CardTitle>
                    <CardDescription className="text-zinc-400 line-clamp-3">{charity.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between">
                    {charity.website_url ? (
                      <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors">
                        <Globe className="h-4 w-4" /> Website
                      </a>
                    ) : <span />}
                    <Link href="/subscribe" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all">
                      Support <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-32 text-center">
        <div className="p-12 rounded-3xl glass-card">
          <h2 className="text-3xl font-display font-bold mb-4">Don't see your favourite charity?</h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">We're constantly adding new partners. Send us a suggestion.</p>
          <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-8"
            onClick={() => toast.info("Suggestion form coming soon.")}>
            Suggest a Charity
          </Button>
        </div>
      </section>
    </div>
  );
}