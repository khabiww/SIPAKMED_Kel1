import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Gejala } from "@/lib/expert-system";

export const Route = createFileRoute("/_authenticated/admin/gejala")({
  component: KelolaGejala,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type FormState = { id?: string; kode_gejala: string; nama_gejala: string; kategori: string };
const empty: FormState = { kode_gejala: "", nama_gejala: "", kategori: "Umum" };

function KelolaGejala() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["gejala"],
    queryFn: async (): Promise<Gejala[]> => {
      const { data, error } = await db.from("gejala").select("*").order("kode_gejala");
      if (error) throw error;
      return data;
    },
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [delId, setDelId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = { kode_gejala: f.kode_gejala, nama_gejala: f.nama_gejala, kategori: f.kategori };
      const res = f.id
        ? await db.from("gejala").update(payload).eq("id", f.id)
        : await db.from("gejala").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Data gejala disimpan.");
      qc.invalidateQueries({ queryKey: ["gejala"] });
      qc.invalidateQueries({ queryKey: ["kb"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("gejala").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data dihapus.");
      qc.invalidateQueries({ queryKey: ["gejala"] });
      qc.invalidateQueries({ queryKey: ["kb"] });
      setDelId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">Kelola Gejala</h1>
          <p className="text-sm text-muted-foreground">CRUD data gejala penyakit.</p>
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
              <TableHead>Nama Gejala</TableHead>
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
              data?.map((g) => (
                <TableRow key={g.id}>
                  <TableCell><Badge variant="outline">{g.kode_gejala}</Badge></TableCell>
                  <TableCell className="font-medium">{g.nama_gejala}</TableCell>
                  <TableCell><Badge variant="secondary">{g.kategori}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setForm(g); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDelId(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Edit Gejala" : "Tambah Gejala"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kode</Label>
                <Input required maxLength={10} value={form.kode_gejala} onChange={(e) => setForm({ ...form, kode_gejala: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Kategori</Label>
                <Input required value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Nama Gejala</Label>
              <Input required value={form.nama_gejala} onChange={(e) => setForm({ ...form, nama_gejala: e.target.value })} />
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
          <AlertDialogHeader><AlertDialogTitle>Hapus gejala?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => delId && del.mutate(delId)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
