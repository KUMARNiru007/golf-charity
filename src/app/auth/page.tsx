"use client";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const ping = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) throw new Error("Supabase env vars missing — check .env.local");
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    if (!res.ok) throw new Error(`Supabase unreachable (${res.status})`);
  };

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("failed to fetch"))
      return toast.error("Cannot reach Supabase. Check .env.local and restart.");
    toast.error(msg || "Something went wrong.");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ping();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Please enter your full name.");
    setLoading(true);
    try {
      await ping();
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      toast.success("Account created! Check your email for a confirmation link.");
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/8 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-display font-bold tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
            GOLF CHARITY
          </Link>
          <p className="text-zinc-500 text-sm mt-2">Play. Win. Give back.</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-zinc-900/80 p-1 mb-8">
            {(["signin", "signup"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tab === t
                    ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Sign In Form */}
          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="si-email" className="text-zinc-300 text-sm font-medium">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password" className="text-zinc-300 text-sm font-medium">Password</Label>
                  <Input
                    id="si-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
                <p className="text-center text-sm text-zinc-500">
                  No account?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Sign up free
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="su-name" className="text-zinc-300 text-sm font-medium">Full Name</Label>
                  <Input
                    id="su-name"
                    type="text"
                    placeholder="John Smith"
                    className="h-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email" className="text-zinc-300 text-sm font-medium">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password" className="text-zinc-300 text-sm font-medium">Password</Label>
                  <Input
                    id="su-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    className="h-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </Button>
                <p className="text-center text-sm text-zinc-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("signin")} className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          By continuing you agree to our{" "}
          <span className="text-zinc-500 underline cursor-pointer">Terms</span>{" "}
          and{" "}
          <span className="text-zinc-500 underline cursor-pointer">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}