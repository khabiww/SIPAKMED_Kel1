import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Penyakit } from "@/lib/expert-system";

export const Route = createFileRoute("/_authenticated/admin/penyakit")({
  component: KelolaPenyakit,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function fetchAll(): Promise<Penyakit[]> {
  const { data, error } = await db.from("penyakit").select("*").order("kode_penyakit");
  if (error) throw error;
  return data;
}

type FormState = { id?: string; kode_penyakit: string; nama_penyakit: string; kategori: string; deskripsi: string; saran_penanganan: string };
const empty: FormState = { kode_penyakit: "", nama_penyakit: "", kategori: "Umum", deskripsi: "", saran_penanganan: "" };

function KelolaPenyakit() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["penyakit"], queryFn: fetchAll });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [delId, setDelId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      if (f.id) {
        const { error } = await db.from("penyakit").update({
          kode_penyakit: f.kode_penyakit, nama_penyakit: f.nama_penyakit, kategori: f.kategori, deskripsi: f.deskripsi, saran_penanganan: f.saran_penanganan,
        }).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("penyakit").insert({
          kode_penyakit: f.kode_penyakit, nama_penyakit: f.nama_penyakit, kategori: f.kategori, deskripsi: f.deskripsi, saran_penanganan: f.saran_penanganan,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Data penyakit disimpan.");
      qc.invalidateQueries({ queryKey: ["penyakit"] });
      qc.invalidateQueries({ queryKey: ["kb"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("penyakit").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data dihapus.");
      qc.invalidateQueries({ queryKey: ["penyakit"] });
      qc.invalidateQueries({ queryKey: ["kb"] });
      setDelId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">Kelola Penyakit</h1>
          <p className="text-sm text-muted-foreground">CRUD data penyakit basis pengetahuan.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Kode</TableHead>
              <TableHead>Nama Penyakit</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada data.</TableCell></TableRow>
            ) : (
              data?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Badge variant="outline">{p.kode_penyakit}</Badge></TableCell>
                  <TableCell className="font-medium">{p.nama_penyakit}</TableCell>
                  <TableCell><Badge variant="secondary">{p.kategori}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setForm(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDelId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Penyakit" : "Tambah Penyakit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kode</Label>
                <Input required maxLength={10} value={form.kode_penyakit} onChange={(e) => setForm({ ...form, kode_penyakit: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Kategori</Label>
                <Input required value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Nama Penyakit</Label>
              <Input required value={form.nama_penyakit} onChange={(e) => setForm({ ...form, nama_penyakit: e.target.value })} />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            </div>
            <div>
              <Label>Saran Penanganan</Label>
              <Textarea rows={3} value={form.saran_penanganan} onChange={(e) => setForm({ ...form, saran_penanganan: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus penyakit?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini juga akan menghapus aturan yang terkait.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => delId && del.mutate(delId)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
