"use client";
import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Trophy, Heart, BarChart3, ArrowRight, ShieldCheck, Globe, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../components/AuthProvider";

export default function LandingPage() {
  const { user, profile } = useAuth();
  // Get user initial (first letter of name or email)
  const initial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <span className="text-lg font-display font-bold tracking-widest text-emerald-500">GOLF CHARITY</span>
        <div className="flex items-center gap-4">
          <Link href="/charities" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Charities</Link>
          {user ? (
            <Avatar size="sm">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          ) : (
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm rounded-full border border-zinc-700 hidden sm:flex px-3 py-2 transition-all">
              Sign In
            </Link>
          )}
          <Link href={user ? "/dashboard" : "/auth"} className="inline-flex items-center gap-2 text-sm rounded-full bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all duration-300 px-3 py-2">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-6xl w-full mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-[0.2em] uppercase border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-full">
              The Future of Golf Philanthropy
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[0.9]">
              PLAY GOLF.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-500">WIN PRIZES.</span><br />
              GIVE BACK.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed">
              A subscription-driven platform combining performance tracking, monthly prize draws, and seamless charitable giving.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/dashboard" : "/auth"}
                className="inline-flex items-center gap-2 text-base h-14 px-10 rounded-full font-semibold shadow-lg hover:scale-[1.03] transition-transform duration-150 bg-emerald-500 text-zinc-950"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/charities" className="inline-flex items-center gap-2 text-base h-14 px-8 border border-zinc-800 hover:bg-zinc-900 rounded-full transition-all">
                Explore Charities
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <FeatureCard icon={<BarChart3 className="h-8 w-8 text-emerald-400" />} title="Score Tracking"
            description="Track your Stableford scores with a simple, engaging flow. We keep your last 5 scores to calculate your draw eligibility." />
          <FeatureCard icon={<Trophy className="h-8 w-8 text-blue-400" />} title="Monthly Prize Draws"
            description="Participate in algorithm-powered draws. Win from prize pools distributed across 3, 4, and 5-number matches." />
          <FeatureCard icon={<Heart className="h-8 w-8 text-rose-400" />} title="Charity Integration"
            description="A minimum 10% of every subscription goes directly to a charity of your choice. Real impact with every round." />
        </div>
      </section>

      {/* Impact */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
              Beyond the Fairway:<br /><span className="text-emerald-400">Real Impact.</span>
            </h2>
            <ul className="space-y-6">
              <ImpactItem title="Subscription Engine" text="Robust monthly and yearly plans with secure Stripe payments." />
              <ImpactItem title="Custom Draw Engine" text="Fair, transparent draws with jackpot rollovers for unclaimed prizes." />
              <ImpactItem title="Winner Verification" text="Secure proof-of-score upload system for all prize winners." />
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-3xl glass-card p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Globe className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider">Total Impact</div>
                  <div className="text-3xl font-display font-bold">£124,500+</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider">Active Members</div>
                  <div className="text-3xl font-display font-bold">2,840</div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-zinc-400 italic">"This platform has completely changed how I think about my weekend rounds. It's golf with a soul."</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold">DM</div>
                  <div>
                    <div className="text-sm font-medium">David Miller</div>
                    <div className="text-xs text-zinc-500">Member since 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-3">Simple Pricing</h2>
          <p className="text-zinc-400 mb-16">One subscription. Full access. Real impact.</p>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="glass-card p-8 text-left hover:border-white/20 transition-all">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Monthly</div>
              <div className="text-4xl font-display font-bold mb-1">£9.99<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <p className="text-zinc-500 text-sm mt-4">Full access. Cancel anytime.</p>
              <Link href="/subscribe?plan=monthly" className="inline-flex items-center gap-2 w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-all">
                Choose Monthly
              </Link>
            </div>
            <div className="glass-card p-8 text-left border-emerald-500/30 relative overflow-hidden hover:border-emerald-500/50 transition-all">
              <div className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">SAVE 20%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Yearly</div>
              <div className="text-4xl font-display font-bold mb-1">£95.88<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
              <p className="text-zinc-500 text-sm mt-4">Two months free vs monthly.</p>
              <Link href="/subscribe?plan=yearly" className="inline-flex items-center gap-2 w-full mt-6 bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all duration-300 px-3 py-2 rounded-lg">
                Choose Yearly
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-linear-to-b from-zinc-950 to-emerald-950/20">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Ready to join the club?</h2>
          <p className="text-zinc-400 text-lg mb-12">Choose a plan that fits your game and start making a difference today.</p>
          <Link href="/subscribe" className="inline-flex items-center gap-2 text-lg h-16 px-12 rounded-full bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all duration-300">
            Get Started Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-8 px-6 text-center text-zinc-600 text-sm">
        © 2026 Golf Charity Subscription Platform. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="space-y-4">
      <div>{icon}</div>
      <h3 className="text-xl font-display font-bold">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ImpactItem({ title, text }: { title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <div className="mt-1 shrink-0"><ShieldCheck className="h-6 w-6 text-emerald-500" /></div>
      <div>
        <div className="font-bold text-lg">{title}</div>
        <div className="text-zinc-500">{text}</div>
      </div>
    </li>
  );
}