"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { UserProfile } from "../../../types";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../../lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<UserProfile["subscription_status"]>("inactive");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveStatus = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({ subscription_status: editStatus }).eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("Status updated.");
    setEditing(null);
    load();
  };

  const filtered = users.filter(u =>
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    lapsed: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Users</h1>
          <p className="text-zinc-500 text-sm">{users.length} total members</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-zinc-400 hover:text-white gap-2">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>
      <Card className="glass-card border-white/5">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="Search by name or email…" className="pl-10 bg-zinc-900/50 border-white/5"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Member</TableHead><TableHead>Status</TableHead><TableHead>Plan</TableHead>
                <TableHead>Charity %</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-zinc-500">Loading…</TableCell></TableRow>
              ) : filtered.map(user => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="font-medium text-sm">{user.full_name ?? "—"}</div>
                    <div className="text-xs text-zinc-500 font-mono">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {editing === user.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value as UserProfile["subscription_status"])}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="lapsed">lapsed</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className={`text-xs capitalize ${statusColors[user.subscription_status] ?? ""}`}>{user.subscription_status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm capitalize text-zinc-400">{user.subscription_tier ?? "—"}</TableCell>
                  <TableCell className="text-sm font-mono text-emerald-400">{user.charity_percentage ?? 10}%</TableCell>
                  <TableCell className="text-xs font-mono text-zinc-500">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    {editing === user.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveStatus(user.id)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 h-7 px-3 text-xs">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-7 px-3 text-xs text-zinc-400">Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(user.id); setEditStatus(user.subscription_status); }}
                        className="h-7 px-3 text-xs text-zinc-400 hover:text-white border border-white/10">Edit</Button>
                    )}
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