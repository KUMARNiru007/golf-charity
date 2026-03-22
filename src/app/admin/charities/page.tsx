"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Charity } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", image_url: "", website_url: "", featured: false };

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("charities").select("*").order("created_at", { ascending: false });
    setCharities(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (c: Charity) => {
    setForm({ name: c.name, description: c.description, image_url: c.image_url ?? "", website_url: c.website_url ?? "", featured: c.featured });
    setEditId(c.id); setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required.");
    setSaving(true);
    const payload = { ...form, image_url: form.image_url || null, website_url: form.website_url || null };
    const { error } = editId ? await supabase.from("charities").update(payload).eq("id", editId)
                              : await supabase.from("charities").insert(payload);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success(editId ? "Charity updated." : "Charity added.");
    setShowForm(false); setSaving(false); setEditId(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this charity?")) return;
    setDeleting(id);
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted.");
    setDeleting(null); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-display font-bold mb-1">Charities</h1><p className="text-zinc-500 text-sm">{charities.length} partners</p></div>
        <Button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 gap-2">
          <Plus className="h-4 w-4" />Add Charity
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card border-emerald-500/20">
          <CardHeader><CardTitle className="font-display text-base">{editId ? "Edit Charity" : "New Charity"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-zinc-900/50 border-white/5" placeholder="Charity name" /></div>
              <div className="space-y-1.5"><Label>Website URL</Label><Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} className="bg-zinc-900/50 border-white/5" placeholder="https://…" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full h-24 px-3 py-2 text-sm rounded-lg bg-zinc-900/50 border border-white/5 text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none focus:border-emerald-500/40" placeholder="What does this charity do?" />
            </div>
            <div className="space-y-1.5"><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="bg-zinc-900/50 border-white/5" placeholder="https://…" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
              <Label htmlFor="featured" className="cursor-pointer">Featured charity</Label>
            </div>
            <div className="flex gap-3">
              <Button onClick={save} disabled={saving} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 gap-2"><Check className="h-4 w-4" />{saving ? "Saving…" : "Save"}</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400 gap-2"><X className="h-4 w-4" />Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-white/5 hover:bg-transparent"><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Featured</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-500">Loading…</TableCell></TableRow>
              : charities.map(c => (
                <TableRow key={c.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-xs text-zinc-500 max-w-xs truncate">{c.description}</TableCell>
                  <TableCell>{c.featured ? <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">Featured</Badge> : <span className="text-xs text-zinc-600">—</span>}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)} className="h-7 w-7 p-0 text-zinc-400 hover:text-white"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)} disabled={deleting === c.id} className="h-7 w-7 p-0 text-zinc-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
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