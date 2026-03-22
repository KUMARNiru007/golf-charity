"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Heart, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/AuthProvider";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase());

const navItems = [
  { icon: LayoutDashboard, label: "Overview",   path: "/admin" },
  { icon: Users,           label: "Users",      path: "/admin/users" },
  { icon: Trophy,          label: "Draws",      path: "/admin/draws" },
  { icon: Heart,           label: "Charities",  path: "/admin/charities" },
  { icon: ShieldCheck,     label: "Winners",    path: "/admin/winners" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/auth"); return; }
      const email = user.email?.toLowerCase() ?? "";
      if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS[0] !== "" && !ADMIN_EMAILS.includes(email))
        router.replace("/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-lg font-display font-bold tracking-widest text-emerald-500">GOLF CHARITY</div>
          <div className="text-xs text-zinc-500 mt-0.5 font-mono">ADMIN PANEL</div>
        </div>
        <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link key={item.path} href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.path ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}>
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-4 border-t border-white/5 space-y-1">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full flex items-center gap-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 font-semibold transition-transform duration-150"
        >
          <Link href="/dashboard" className="flex items-center gap-2 w-full">
            <LayoutDashboard className="h-4 w-4" />
            <span>User Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
          onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}>
          <LogOut className="h-4 w-4" />Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className="hidden lg:flex w-60 border-r border-white/5 p-5 flex-col fixed h-full z-30"><SidebarContent /></aside>
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-zinc-950 border-r border-white/5 p-5 flex flex-col z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>
      <main className="flex-1 lg:ml-60 min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
          <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex-1" />
          <div className="text-xs font-mono text-zinc-500 border border-white/10 px-3 py-1 rounded-full">{user.email}</div>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}