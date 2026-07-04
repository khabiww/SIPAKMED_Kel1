import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchKnowledgeBase } from "@/lib/expert-system";

export const Route = createFileRoute("/_authenticated/admin/rule")({
  component: KelolaRule,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type FormState = { id?: string; kode_rule: string; id_penyakit: string; gejalaIds: string[] };
const empty: FormState = { kode_rule: "", id_penyakit: "", gejalaIds: [] };

function KelolaRule() {
  const qc = useQueryClient();
  const { data: kb, isLoading } = useQuery({ queryKey: ["kb"], queryFn: fetchKnowledgeBase });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [delId, setDelId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!kb) return [];
    return kb.rules.map((r) => ({
      ...r,
      penyakit: kb.penyakit.find((p) => p.id === r.id_penyakit),
      gejala: r.rule_gejala
        .map((rg) => kb.gejala.find((g) => g.id === rg.id_gejala))
        .filter((g): g is NonNullable<typeof g> => Boolean(g)),
    }));
  }, [kb]);

  const filteredGejala = useMemo(() => {
    if (!kb) return [];
    const f = q.trim().toLowerCase();
    return f
      ? kb.gejala.filter((g) => g.nama_gejala.toLowerCase().includes(f) || g.kode_gejala.toLowerCase().includes(f))
      : kb.gejala;
  }, [kb, q]);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      if (!f.id_penyakit) throw new Error("Pilih penyakit terlebih dahulu.");
      if (f.gejalaIds.length === 0) throw new Error("Pilih minimal satu gejala.");
      let ruleId = f.id;
      if (ruleId) {
        const { error } = await db.from("rule").update({ kode_rule: f.kode_rule, id_penyakit: f.id_penyakit }).eq("id", ruleId);
        if (error) throw error;
        await db.from("rule_gejala").delete().eq("id_rule", ruleId);
      } else {
        const { data, error } = await db.from("rule").insert({ kode_rule: f.kode_rule, id_penyakit: f.id_penyakit }).select("id").single();
        if (error) throw error;
        ruleId = data.id;
      }
      const rows = f.gejalaIds.map((gid) => ({ id_rule: ruleId, id_gejala: gid }));
      const { error: e2 } = await db.from("rule_gejala").insert(rows);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Aturan disimpan.");
      qc.invalidateQueries({ queryKey: ["kb"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("rule").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aturan dihapus.");
      qc.invalidateQueries({ queryKey: ["kb"] });
      setDelId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (rule: (typeof rows)[number]) => {
    setForm({
      id: rule.id,
      kode_rule: rule.kode_rule,
      id_penyakit: rule.id_penyakit,
      gejalaIds: rule.rule_gejala.map((rg) => rg.id_gejala),
    });
    setQ("");
    setOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">Kelola Aturan (Rule Base)</h1>
          <p className="text-sm text-muted-foreground">Hubungkan gejala-gejala yang memicu suatu penyakit.</p>
        </div>
        <Button onClick={() => { setForm(empty); setQ(""); setOpen(true); }} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Kode</TableHead>
              <TableHead>Penyakit</TableHead>
              <TableHead>Gejala (SEMUA harus terpenuhi)</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada aturan.</TableCell></TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant="outline">{r.kode_rule}</Badge></TableCell>
                  <TableCell className="font-medium">{r.penyakit?.nama_penyakit ?? <span className="text-muted-foreground italic">?</span>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.gejala.map((g) => (<Badge key={g.id} variant="secondary" className="text-xs">{g.nama_gejala}</Badge>))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? "Edit Aturan" : "Tambah Aturan"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Kode Rule</Label>
                <Input required maxLength={10} placeholder="R13" value={form.kode_rule} onChange={(e) => setForm({ ...form, kode_rule: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Penyakit</Label>
                <Select value={form.id_penyakit} onValueChange={(v) => setForm({ ...form, id_penyakit: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih penyakit" /></SelectTrigger>
                  <SelectContent>
                    {kb?.penyakit.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.kode_penyakit} — {p.nama_penyakit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Gejala ({form.gejalaIds.length} terpilih)</Label>
                <Input placeholder="Cari gejala..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-[200px] h-8" />
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-border p-2 space-y-1">
                {filteredGejala.map((g) => {
                  const checked = form.gejalaIds.includes(g.id);
                  return (
                    <label key={g.id} className={`flex items-center gap-2 rounded p-2 cursor-pointer ${checked ? "bg-primary/10" : "hover:bg-muted"}`}>
                      <Checkbox checked={checked} onCheckedChange={() => {
                        setForm({
                          ...form,
                          gejalaIds: checked ? form.gejalaIds.filter((x) => x !== g.id) : [...form.gejalaIds, g.id],
                        });
                      }} />
                      <span className="text-xs text-muted-foreground w-10">{g.kode_gejala}</span>
                      <span className="text-sm">{g.nama_gejala}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus aturan?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => delId && del.mutate(delId)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
