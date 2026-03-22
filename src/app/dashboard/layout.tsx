"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Heart, LogOut, PlusCircle,
  Trophy, Menu, X, ShieldCheck
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/AuthProvider";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map(e => e.trim().toLowerCase());

const navItems = [
  { icon: LayoutDashboard, label: "Overview",       path: "/dashboard" },
  { icon: PlusCircle,      label: "Enter Score",    path: "/dashboard/scores" },
  { icon: Heart,           label: "My Charity",     path: "/dashboard/charity" },
  { icon: Trophy,          label: "Draws & Prizes", path: "/dashboard/draws" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = ADMIN_EMAILS.length > 0 &&
    ADMIN_EMAILS[0] !== "" &&
    ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        <div className="text-emerald-500 font-display text-xl tracking-widest">GOLF CHARITY</div>
      </div>
    </div>
  );

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Member";
  const isActive = profile?.subscription_status === "active";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-lg font-display font-bold tracking-widest text-emerald-500">
            GOLF CHARITY
          </div>
          <div className="text-xs text-zinc-500 mt-0.5 font-mono">MEMBER PANEL</div>
        </div>
        <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link key={item.path} href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.path
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}>
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="pt-4 border-t border-white/5 space-y-1">

        {/* Admin panel button — same style as admin's "User Dashboard" button */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            onClick={() => router.push("/admin")}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Dashboard
          </Button>
        )}

        {/* Sign out */}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}
          className="w-full justify-start gap-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        {/* Email */}
        <div className="px-3 pt-2">
          <div className="text-xs font-mono text-zinc-500 border border-white/10 px-3 py-1.5 rounded-full truncate">
            {user.email}
          </div>
        </div>

      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-white/5 p-5 flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-zinc-950 border-r border-white/5 p-5 flex flex-col z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
          <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Welcome back, {displayName}</h1>
            <p className="text-xs text-zinc-500 hidden sm:block">Here's your impact today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isActive ? "default" : "destructive"}
              className={isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
            >
              {profile?.subscription_status?.toUpperCase() ?? "INACTIVE"}
            </Badge>
            {isAdmin && (
              <Link href="/admin">
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition-all">
                  ADMIN
                </Badge>
              </Link>
            )}
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}